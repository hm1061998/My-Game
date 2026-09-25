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

    private static PlaySession ToDomain(SessionRow row) => new(
        row.Id, row.CaseId, row.CaseVersion, row.Status, row.Revision,
        new DateTimeOffset(row.CreatedAtUtc, TimeSpan.Zero),
        new DateTimeOffset(row.UpdatedAtUtc, TimeSpan.Zero),
        new DateTimeOffset(row.ExpiresAtUtc, TimeSpan.Zero),
        new WorldProgress(row.MapId, row.CheckpointId));
}
