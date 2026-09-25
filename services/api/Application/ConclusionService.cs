using OfficeCaseFiles.Api.Domain;

namespace OfficeCaseFiles.Api.Application;

public enum ConclusionAccessStatus { Found, SessionMissing, CaseVersionMissing, Locked, NotFound }
public sealed record ConclusionView(CaseDefinition Case, IReadOnlyList<EvidenceDefinition> Evidence, bool IsReady);
public sealed record ConclusionResultView(ConclusionRecord Conclusion, string Explanation, bool AssistanceUsed);
public enum ConclusionSubmitStatus { Saved, AlreadyApplied, Invalid, Locked, SessionMissing, CaseVersionMissing, AlreadyCompleted, Conflict }
public sealed record ConclusionSubmitResult(ConclusionSubmitStatus Status, ConclusionResultView? Result = null, int Revision = 0);
public sealed record ReviewItemView(ReviewItemDefinition Definition, ReviewProgress? Progress);
public enum ReviewAnswerStatus { Saved, AlreadyApplied, Invalid, Locked, SessionMissing, CaseVersionMissing, NotFound, AlreadyCompleted, Conflict }
public sealed record ReviewAnswerResult(ReviewAnswerStatus Status, int Revision = 0, int Attempts = 0,
    bool IsCorrect = false, bool IsCompleted = false, string? Explanation = null);

public sealed class ConclusionService(
    SessionService sessions, IPlaySessionStore store, ICaseCatalog catalog, TimeProvider clock)
{
    public async Task<(ConclusionAccessStatus Status, ConclusionView? View)> GetViewAsync(
        string token, CancellationToken cancellationToken)
    {
        var context = await LoadAsync(token, cancellationToken);
        if (context.Status != ConclusionAccessStatus.Found) return (context.Status, null);
        var collected = context.Collected!.ToHashSet(StringComparer.Ordinal);
        var passed = PassedQuestionIds(context.Progress!);
        return (ConclusionAccessStatus.Found, new ConclusionView(context.Case!,
            context.Case!.Evidence.Where(item => collected.Contains(item.Id)).ToArray(),
            ConclusionRules.IsReady(context.Case, collected, passed)));
    }

    public async Task<(ConclusionAccessStatus Status, ConclusionResultView? Result)> GetResultAsync(
        string token, CancellationToken cancellationToken)
    {
        var context = await LoadAsync(token, cancellationToken);
        if (context.Status != ConclusionAccessStatus.Found) return (context.Status, null);
        var conclusion = await store.GetConclusionAsync(context.Session!.Id, cancellationToken);
        return conclusion is null
            ? (ConclusionAccessStatus.Locked, null)
            : (ConclusionAccessStatus.Found, new ConclusionResultView(conclusion,
                context.Case!.Solution.Explanation, context.Session.World.AssistanceUsed));
    }

    public async Task<ConclusionSubmitResult> SubmitAsync(string token, string suspectId, string reasonId,
        IReadOnlyList<string> evidenceIds, Guid submissionId, int revision, CancellationToken cancellationToken)
    {
        if (submissionId == Guid.Empty || revision < 0 || evidenceIds.Count != 2 ||
            evidenceIds.Distinct(StringComparer.Ordinal).Count() != 2)
            return new ConclusionSubmitResult(ConclusionSubmitStatus.Invalid);
        var context = await LoadAsync(token, cancellationToken);
        if (context.Status == ConclusionAccessStatus.SessionMissing)
            return new ConclusionSubmitResult(ConclusionSubmitStatus.SessionMissing);
        if (context.Status == ConclusionAccessStatus.CaseVersionMissing)
            return new ConclusionSubmitResult(ConclusionSubmitStatus.CaseVersionMissing);
        var caseFile = context.Case!;
        var collected = context.Collected!.ToHashSet(StringComparer.Ordinal);
        var passed = PassedQuestionIds(context.Progress!);
        if (!caseFile.ConclusionOptions.Suspects.Any(item => item.Id == suspectId) ||
            !caseFile.ConclusionOptions.Reasons.Any(item => item.Id == reasonId) ||
            evidenceIds.Any(id => !collected.Contains(id)))
            return new ConclusionSubmitResult(ConclusionSubmitStatus.Invalid);
        if (!ConclusionRules.IsReady(caseFile, collected, passed))
            return new ConclusionSubmitResult(ConclusionSubmitStatus.Locked);

        var firstTryCorrect = context.Progress!.Where(item => item.IsPassed && item.Attempts == 1)
            .Select(item => item.QuestionId).ToHashSet(StringComparer.Ordinal);
        var saved = await store.SaveConclusionAsync(SessionToken.Hash(token), revision, submissionId,
            suspectId, reasonId, evidenceIds, ConclusionRules.ReadingScore(caseFile, firstTryCorrect),
            ConclusionRules.InvestigationScore(caseFile.Solution, suspectId, reasonId, evidenceIds),
            clock.GetUtcNow(), cancellationToken);
        var status = saved.Status switch
        {
            ConclusionSaveStatus.Saved => ConclusionSubmitStatus.Saved,
            ConclusionSaveStatus.AlreadyApplied => ConclusionSubmitStatus.AlreadyApplied,
            ConclusionSaveStatus.AlreadyCompleted => ConclusionSubmitStatus.AlreadyCompleted,
            ConclusionSaveStatus.NotFound => ConclusionSubmitStatus.SessionMissing,
            _ => ConclusionSubmitStatus.Conflict,
        };
        if (saved.Conclusion is null)
            return new ConclusionSubmitResult(status, Revision: saved.Revision);
        return new ConclusionSubmitResult(status,
            new ConclusionResultView(saved.Conclusion, caseFile.Solution.Explanation,
                context.Session!.World.AssistanceUsed), saved.Revision);
    }

    public async Task<(ConclusionAccessStatus Status, IReadOnlyList<ReviewItemView>? Items)> ListReviewAsync(
        string token, CancellationToken cancellationToken)
    {
        var context = await LoadAsync(token, cancellationToken);
        if (context.Status != ConclusionAccessStatus.Found) return (context.Status, null);
        if (context.Session!.Status != "Completed") return (ConclusionAccessStatus.Locked, null);
        var progress = (await store.ListReviewProgressAsync(context.Session.Id, cancellationToken))
            .ToDictionary(item => item.ReviewItemId, StringComparer.Ordinal);
        return (ConclusionAccessStatus.Found, context.Case!.ReviewItems
            .Select(item => new ReviewItemView(item, progress.GetValueOrDefault(item.Id))).ToArray());
    }

    public async Task<ReviewAnswerResult> AnswerReviewAsync(string token, string itemId, string choiceId,
        Guid submissionId, int revision, CancellationToken cancellationToken)
    {
        if (submissionId == Guid.Empty || revision < 0 || string.IsNullOrWhiteSpace(choiceId))
            return new ReviewAnswerResult(ReviewAnswerStatus.Invalid);
        var context = await LoadAsync(token, cancellationToken);
        if (context.Status == ConclusionAccessStatus.SessionMissing)
            return new ReviewAnswerResult(ReviewAnswerStatus.SessionMissing);
        if (context.Status == ConclusionAccessStatus.CaseVersionMissing)
            return new ReviewAnswerResult(ReviewAnswerStatus.CaseVersionMissing);
        if (context.Session!.Status != "Completed") return new ReviewAnswerResult(ReviewAnswerStatus.Locked);
        var item = context.Case!.ReviewItems.SingleOrDefault(candidate => candidate.Id == itemId);
        if (item is null) return new ReviewAnswerResult(ReviewAnswerStatus.NotFound);
        if (!item.Choices.Any(candidate => candidate.Id == choiceId))
            return new ReviewAnswerResult(ReviewAnswerStatus.Invalid);
        var saved = await store.SaveReviewAsync(SessionToken.Hash(token), revision, submissionId,
            itemId, choiceId, item.CorrectChoiceId == choiceId, clock.GetUtcNow(), cancellationToken);
        var status = saved.Status switch
        {
            ReviewSaveStatus.Saved => ReviewAnswerStatus.Saved,
            ReviewSaveStatus.AlreadyApplied => ReviewAnswerStatus.AlreadyApplied,
            ReviewSaveStatus.AlreadyCompleted => ReviewAnswerStatus.AlreadyCompleted,
            ReviewSaveStatus.NotFound => ReviewAnswerStatus.SessionMissing,
            ReviewSaveStatus.Locked => ReviewAnswerStatus.Locked,
            _ => ReviewAnswerStatus.Conflict,
        };
        return new ReviewAnswerResult(status, saved.Revision, saved.Attempts, saved.IsCorrect,
            saved.IsCompleted, saved.IsCorrect ? item.Explanation : null);
    }

    private async Task<(ConclusionAccessStatus Status, PlaySession? Session, CaseDefinition? Case,
        IReadOnlyList<string>? Collected, IReadOnlyList<QuestionProgress>? Progress)> LoadAsync(
        string token, CancellationToken cancellationToken)
    {
        var session = await sessions.ResumeAsync(token, cancellationToken);
        if (session is null) return (ConclusionAccessStatus.SessionMissing, null, null, null, null);
        var caseFile = catalog.Get(session.CaseId, session.CaseVersion);
        if (caseFile is null) return (ConclusionAccessStatus.CaseVersionMissing, session, null, null, null);
        return (ConclusionAccessStatus.Found, session, caseFile,
            await store.ListEvidenceIdsAsync(session.Id, cancellationToken),
            await store.ListQuestionProgressAsync(session.Id, cancellationToken));
    }

    private static HashSet<string> PassedQuestionIds(IReadOnlyList<QuestionProgress> progress) =>
        progress.Where(item => item.IsPassed).Select(item => item.QuestionId)
            .ToHashSet(StringComparer.Ordinal);
}
