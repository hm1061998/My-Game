using Microsoft.EntityFrameworkCore;
using OfficeCaseFiles.Api.Application;
using OfficeCaseFiles.Api.Domain;

namespace OfficeCaseFiles.Api.Infrastructure.Sqlite;

public sealed class SqlitePlaySessionStore(GameDbContext db) : IPlaySessionStore
{
    public async Task CreateAsync(PlaySession session, string tokenHash, CancellationToken cancellationToken)
    {
        db.Sessions.Add(new SessionRow
        {
            Id = session.Id,
            TokenHash = tokenHash,
            CaseId = session.CaseId,
            CaseVersion = session.CaseVersion,
            Status = session.Status,
            Revision = session.Revision,
            CreatedAtUtc = session.CreatedAtUtc.UtcDateTime,
            UpdatedAtUtc = session.UpdatedAtUtc.UtcDateTime,
            ExpiresAtUtc = session.ExpiresAtUtc.UtcDateTime,
            MapId = session.World.MapId,
            CheckpointId = session.World.CheckpointId,
            EncounterCleared = session.World.EncounterCleared,
            EncounterFailures = session.World.EncounterFailures,
            AssistanceUsed = session.World.AssistanceUsed,
        });
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<PlaySession?> GetByTokenHashAsync(
        string tokenHash, DateTimeOffset now, CancellationToken cancellationToken)
    {
        var refreshedExpiry = now.AddDays(30).UtcDateTime;
        var touched = await db.Sessions
            .Where(item => item.TokenHash == tokenHash && item.ExpiresAtUtc > now.UtcDateTime)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(item => item.ExpiresAtUtc, refreshedExpiry), cancellationToken);
        if (touched == 0) return null;
        var row = await db.Sessions.AsNoTracking()
            .SingleAsync(item => item.TokenHash == tokenHash, cancellationToken);
        return ToDomain(row);
    }

    public async Task<CheckpointSaveResult> SaveCheckpointAsync(
        string tokenHash, int expectedRevision, string checkpointId, DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var updated = await db.Sessions
            .Where(row => row.TokenHash == tokenHash && row.ExpiresAtUtc > now.UtcDateTime &&
                row.Revision == expectedRevision && row.CheckpointId == SessionRules.EntryCheckpoint &&
                checkpointId == SessionRules.MeetingCheckpoint)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(row => row.CheckpointId, checkpointId)
                .SetProperty(row => row.Revision, row => row.Revision + 1)
                .SetProperty(row => row.UpdatedAtUtc, now.UtcDateTime)
                .SetProperty(row => row.ExpiresAtUtc, now.AddDays(30).UtcDateTime), cancellationToken);

        var session = await GetByTokenHashAsync(tokenHash, now, cancellationToken);
        if (session is null) return new CheckpointSaveResult(CheckpointSaveStatus.NotFound, null);
        if (updated == 1) return new CheckpointSaveResult(CheckpointSaveStatus.Saved, session);
        if (session.World.CheckpointId == checkpointId)
            return new CheckpointSaveResult(CheckpointSaveStatus.AlreadyApplied, session);
        return new CheckpointSaveResult(CheckpointSaveStatus.Conflict, session);
    }

    public async Task<IReadOnlyList<string>> ListEvidenceIdsAsync(Guid sessionId, CancellationToken cancellationToken) =>
        await db.Evidence.AsNoTracking().Where(row => row.SessionId == sessionId)
            .OrderBy(row => row.EvidenceId).Select(row => row.EvidenceId).ToArrayAsync(cancellationToken);

    public async Task<EvidenceCollectResult> CollectEvidenceAsync(
        string tokenHash, int expectedRevision, Guid submissionId, string interactionId,
        string evidenceId, DateTimeOffset now, CancellationToken cancellationToken)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var row = await db.Sessions.SingleOrDefaultAsync(item => item.TokenHash == tokenHash, cancellationToken);
        if (row is null || row.ExpiresAtUtc <= now.UtcDateTime)
            return new EvidenceCollectResult(EvidenceCollectStatus.NotFound, 0);

        var receipt = await db.InteractionReceipts.AsNoTracking()
            .SingleOrDefaultAsync(item => item.SessionId == row.Id && item.SubmissionId == submissionId, cancellationToken);
        if (receipt is not null)
            return receipt.InteractionId == interactionId && receipt.EvidenceId == evidenceId &&
                receipt.RequestedRevision == expectedRevision
                ? new EvidenceCollectResult(EvidenceCollectStatus.AlreadyApplied, receipt.RevisionAfter)
                : new EvidenceCollectResult(EvidenceCollectStatus.Conflict, row.Revision);

        if (row.Revision != expectedRevision)
            return new EvidenceCollectResult(EvidenceCollectStatus.Conflict, row.Revision);

        if (await db.Evidence.AnyAsync(item => item.SessionId == row.Id && item.EvidenceId == evidenceId, cancellationToken))
            return new EvidenceCollectResult(EvidenceCollectStatus.AlreadyCollected, row.Revision);

        row.Revision++;
        row.UpdatedAtUtc = now.UtcDateTime;
        row.ExpiresAtUtc = now.AddDays(30).UtcDateTime;
        db.Evidence.Add(new EvidenceRow { SessionId = row.Id, EvidenceId = evidenceId, CollectedAtUtc = now.UtcDateTime });
        db.InteractionReceipts.Add(new InteractionReceiptRow
        {
            SessionId = row.Id,
            SubmissionId = submissionId,
            InteractionId = interactionId,
            EvidenceId = evidenceId,
            RequestedRevision = expectedRevision,
            RevisionAfter = row.Revision,
        });
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return new EvidenceCollectResult(EvidenceCollectStatus.Collected, row.Revision);
    }

    public async Task<IReadOnlyList<QuestionProgress>> ListQuestionProgressAsync(
        Guid sessionId, CancellationToken cancellationToken) =>
        await db.Questions.AsNoTracking().Where(row => row.SessionId == sessionId)
            .OrderBy(row => row.QuestionId)
            .Select(row => new QuestionProgress(row.QuestionId, row.FirstChoiceId, row.Attempts, row.IsPassed))
            .ToArrayAsync(cancellationToken);

    public async Task<AnswerSaveResult> SaveAnswerAsync(
        string tokenHash, int expectedRevision, Guid submissionId, string questionId,
        string choiceId, bool isCorrect, DateTimeOffset now, CancellationToken cancellationToken)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var session = await db.Sessions.SingleOrDefaultAsync(row => row.TokenHash == tokenHash, cancellationToken);
        if (session is null || session.ExpiresAtUtc <= now.UtcDateTime)
            return new AnswerSaveResult(AnswerSaveStatus.NotFound, 0);

        var receipt = await db.AnswerReceipts.AsNoTracking().SingleOrDefaultAsync(
            row => row.SessionId == session.Id && row.SubmissionId == submissionId, cancellationToken);
        if (receipt is not null)
            return receipt.QuestionId == questionId && receipt.ChoiceId == choiceId &&
                receipt.RequestedRevision == expectedRevision
                ? new AnswerSaveResult(AnswerSaveStatus.AlreadyApplied, receipt.RevisionAfter,
                    receipt.AttemptsAfter, receipt.IsCorrect, receipt.IsPassed, receipt.FirstTryCorrect)
                : new AnswerSaveResult(AnswerSaveStatus.Conflict, session.Revision);

        if (session.Revision != expectedRevision)
            return new AnswerSaveResult(AnswerSaveStatus.Conflict, session.Revision);

        var progress = await db.Questions.SingleOrDefaultAsync(
            row => row.SessionId == session.Id && row.QuestionId == questionId, cancellationToken);
        if (progress?.IsPassed == true)
            return new AnswerSaveResult(AnswerSaveStatus.AlreadyPassed, session.Revision,
                progress.Attempts, false, true, progress.Attempts == 1);

        if (progress is null)
        {
            progress = new QuestionProgressRow
            {
                SessionId = session.Id, QuestionId = questionId, FirstChoiceId = choiceId,
            };
            db.Questions.Add(progress);
        }
        progress.Attempts++;
        progress.IsPassed = isCorrect;
        if (isCorrect) progress.PassedAtUtc = now.UtcDateTime;
        session.Revision++;
        session.UpdatedAtUtc = now.UtcDateTime;
        session.ExpiresAtUtc = now.AddDays(30).UtcDateTime;
        var firstTryCorrect = progress.Attempts == 1 && isCorrect;
        db.AnswerReceipts.Add(new AnswerReceiptRow
        {
            SessionId = session.Id, SubmissionId = submissionId, QuestionId = questionId,
            ChoiceId = choiceId, RequestedRevision = expectedRevision, RevisionAfter = session.Revision,
            AttemptsAfter = progress.Attempts, IsCorrect = isCorrect, IsPassed = progress.IsPassed,
            FirstTryCorrect = firstTryCorrect,
        });
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return new AnswerSaveResult(AnswerSaveStatus.Saved, session.Revision,
            progress.Attempts, isCorrect, progress.IsPassed, firstTryCorrect);
    }

    public async Task<EncounterSaveResult> SaveEncounterAsync(
        string tokenHash, int expectedRevision, Guid submissionId, string outcome,
        bool assistanceUsed, DateTimeOffset now, CancellationToken cancellationToken)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var row = await db.Sessions.SingleOrDefaultAsync(item => item.TokenHash == tokenHash, cancellationToken);
        if (row is null || row.ExpiresAtUtc <= now.UtcDateTime)
            return new EncounterSaveResult(EncounterSaveStatus.NotFound, null);

        var receipt = await db.EncounterReceipts.AsNoTracking().SingleOrDefaultAsync(
            item => item.SessionId == row.Id && item.SubmissionId == submissionId, cancellationToken);
        if (receipt is not null)
        {
            if (receipt.Outcome != outcome || receipt.AssistanceUsed != assistanceUsed ||
                receipt.RequestedRevision != expectedRevision)
                return new EncounterSaveResult(EncounterSaveStatus.Conflict, ToDomain(row));
            var snapshot = ToDomain(row) with
            {
                Revision = receipt.RevisionAfter,
                World = new WorldProgress(row.MapId, row.CheckpointId, receipt.ClearedAfter,
                    receipt.FailuresAfter, receipt.AssistanceUsed),
            };
            return new EncounterSaveResult(EncounterSaveStatus.AlreadyApplied, snapshot);
        }

        if (row.Revision != expectedRevision)
            return new EncounterSaveResult(EncounterSaveStatus.Conflict, ToDomain(row));
        if (row.CheckpointId != SessionRules.MeetingCheckpoint ||
            (assistanceUsed && row.EncounterFailures < 2))
            return new EncounterSaveResult(EncounterSaveStatus.Invalid, ToDomain(row));
        if (row.EncounterCleared)
            return new EncounterSaveResult(EncounterSaveStatus.AlreadyCleared, ToDomain(row));

        if (outcome == "detected") row.EncounterFailures++;
        else
        {
            row.EncounterCleared = true;
            row.AssistanceUsed = assistanceUsed;
        }
        row.Revision++;
        row.UpdatedAtUtc = now.UtcDateTime;
        row.ExpiresAtUtc = now.AddDays(30).UtcDateTime;
        db.EncounterReceipts.Add(new EncounterReceiptRow
        {
            SessionId = row.Id, SubmissionId = submissionId, Outcome = outcome,
            AssistanceUsed = assistanceUsed, RequestedRevision = expectedRevision,
            RevisionAfter = row.Revision, FailuresAfter = row.EncounterFailures,
            ClearedAfter = row.EncounterCleared,
        });
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return new EncounterSaveResult(EncounterSaveStatus.Saved, ToDomain(row));
    }

    public async Task<ConclusionRecord?> GetConclusionAsync(Guid sessionId, CancellationToken cancellationToken)
    {
        var row = await db.Conclusions.AsNoTracking()
            .SingleOrDefaultAsync(item => item.SessionId == sessionId, cancellationToken);
        return row is null ? null : ToConclusion(row);
    }

    public async Task<ConclusionSaveResult> SaveConclusionAsync(string tokenHash, int expectedRevision,
        Guid submissionId, string suspectId, string reasonId, IReadOnlyList<string> evidenceIds,
        int readingScore, int investigationScore, DateTimeOffset now, CancellationToken cancellationToken)
    {
        var orderedEvidence = evidenceIds.Order(StringComparer.Ordinal).ToArray();
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var session = await db.Sessions.SingleOrDefaultAsync(item => item.TokenHash == tokenHash, cancellationToken);
        if (session is null || session.ExpiresAtUtc <= now.UtcDateTime)
            return new ConclusionSaveResult(ConclusionSaveStatus.NotFound, null, 0);

        var receipt = await db.ConclusionReceipts.AsNoTracking().SingleOrDefaultAsync(
            item => item.SessionId == session.Id && item.SubmissionId == submissionId, cancellationToken);
        if (receipt is not null)
        {
            var same = receipt.SuspectId == suspectId && receipt.ReasonId == reasonId &&
                receipt.EvidenceId1 == orderedEvidence[0] && receipt.EvidenceId2 == orderedEvidence[1] &&
                receipt.RequestedRevision == expectedRevision;
            var existing = await db.Conclusions.AsNoTracking()
                .SingleOrDefaultAsync(item => item.SessionId == session.Id, cancellationToken);
            return same && existing is not null
                ? new ConclusionSaveResult(ConclusionSaveStatus.AlreadyApplied, ToConclusion(existing), receipt.RevisionAfter)
                : new ConclusionSaveResult(ConclusionSaveStatus.Conflict, null, session.Revision);
        }
        if (session.Status == "Completed")
            return new ConclusionSaveResult(ConclusionSaveStatus.AlreadyCompleted,
                await GetConclusionAsync(session.Id, cancellationToken), session.Revision);
        if (session.Revision != expectedRevision)
            return new ConclusionSaveResult(ConclusionSaveStatus.Conflict, null, session.Revision);

        session.Revision++;
        session.Status = "Completed";
        session.UpdatedAtUtc = now.UtcDateTime;
        session.ExpiresAtUtc = now.AddDays(30).UtcDateTime;
        var conclusion = new ConclusionRow
        {
            SessionId = session.Id, SuspectId = suspectId, ReasonId = reasonId,
            EvidenceId1 = orderedEvidence[0], EvidenceId2 = orderedEvidence[1],
            ReadingScore = readingScore, InvestigationScore = investigationScore,
            Revision = session.Revision, SubmittedAtUtc = now.UtcDateTime,
        };
        db.Conclusions.Add(conclusion);
        db.ConclusionReceipts.Add(new ConclusionReceiptRow
        {
            SessionId = session.Id, SubmissionId = submissionId, SuspectId = suspectId,
            ReasonId = reasonId, EvidenceId1 = orderedEvidence[0], EvidenceId2 = orderedEvidence[1],
            RequestedRevision = expectedRevision, RevisionAfter = session.Revision,
        });
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return new ConclusionSaveResult(ConclusionSaveStatus.Saved, ToConclusion(conclusion), session.Revision);
    }

    public async Task<IReadOnlyList<ReviewProgress>> ListReviewProgressAsync(
        Guid sessionId, CancellationToken cancellationToken) =>
        await db.Reviews.AsNoTracking().Where(item => item.SessionId == sessionId)
            .OrderBy(item => item.ReviewItemId)
            .Select(item => new ReviewProgress(item.ReviewItemId, item.Attempts, item.IsCompleted,
                item.CompletedAtUtc == null ? null : new DateTimeOffset(item.CompletedAtUtc.Value, TimeSpan.Zero)))
            .ToArrayAsync(cancellationToken);

    public async Task<ReviewSaveResult> SaveReviewAsync(string tokenHash, int expectedRevision,
        Guid submissionId, string reviewItemId, string choiceId, bool isCorrect, DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var session = await db.Sessions.SingleOrDefaultAsync(item => item.TokenHash == tokenHash, cancellationToken);
        if (session is null || session.ExpiresAtUtc <= now.UtcDateTime)
            return new ReviewSaveResult(ReviewSaveStatus.NotFound, 0);
        if (session.Status != "Completed")
            return new ReviewSaveResult(ReviewSaveStatus.Locked, session.Revision);

        var receipt = await db.ReviewReceipts.AsNoTracking().SingleOrDefaultAsync(
            item => item.SessionId == session.Id && item.SubmissionId == submissionId, cancellationToken);
        if (receipt is not null)
            return receipt.ReviewItemId == reviewItemId && receipt.ChoiceId == choiceId &&
                receipt.RequestedRevision == expectedRevision
                ? new ReviewSaveResult(ReviewSaveStatus.AlreadyApplied, receipt.RevisionAfter,
                    receipt.AttemptsAfter, receipt.IsCorrect, receipt.IsCompleted)
                : new ReviewSaveResult(ReviewSaveStatus.Conflict, session.Revision);
        if (session.Revision != expectedRevision)
            return new ReviewSaveResult(ReviewSaveStatus.Conflict, session.Revision);

        var progress = await db.Reviews.SingleOrDefaultAsync(
            item => item.SessionId == session.Id && item.ReviewItemId == reviewItemId, cancellationToken);
        if (progress?.IsCompleted == true)
            return new ReviewSaveResult(ReviewSaveStatus.AlreadyCompleted, session.Revision,
                progress.Attempts, false, true);
        if (progress is null)
        {
            progress = new ReviewProgressRow { SessionId = session.Id, ReviewItemId = reviewItemId };
            db.Reviews.Add(progress);
        }
        progress.Attempts++;
        progress.IsCompleted = isCorrect;
        if (isCorrect) progress.CompletedAtUtc = now.UtcDateTime;
        session.Revision++;
        session.UpdatedAtUtc = now.UtcDateTime;
        session.ExpiresAtUtc = now.AddDays(30).UtcDateTime;
        db.ReviewReceipts.Add(new ReviewReceiptRow
        {
            SessionId = session.Id, SubmissionId = submissionId, ReviewItemId = reviewItemId,
            ChoiceId = choiceId, RequestedRevision = expectedRevision, RevisionAfter = session.Revision,
            AttemptsAfter = progress.Attempts, IsCorrect = isCorrect, IsCompleted = progress.IsCompleted,
        });
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return new ReviewSaveResult(ReviewSaveStatus.Saved, session.Revision,
            progress.Attempts, isCorrect, progress.IsCompleted);
    }

    private static PlaySession ToDomain(SessionRow row) => new(
        row.Id, row.CaseId, row.CaseVersion, row.Status, row.Revision,
        new DateTimeOffset(row.CreatedAtUtc, TimeSpan.Zero),
        new DateTimeOffset(row.UpdatedAtUtc, TimeSpan.Zero),
        new DateTimeOffset(row.ExpiresAtUtc, TimeSpan.Zero),
        new WorldProgress(row.MapId, row.CheckpointId, row.EncounterCleared,
            row.EncounterFailures, row.AssistanceUsed));

    private static ConclusionRecord ToConclusion(ConclusionRow row) => new(
        row.SuspectId, row.ReasonId, [row.EvidenceId1, row.EvidenceId2],
        row.ReadingScore, row.InvestigationScore, row.Revision,
        new DateTimeOffset(row.SubmittedAtUtc, TimeSpan.Zero));
}
