using OfficeCaseFiles.Api.Domain;

namespace OfficeCaseFiles.Api.Application;

public enum QuestionAccessStatus { Found, SessionMissing, CaseVersionMissing, NotFound, Locked }

public sealed record QuestionView(QuestionDefinition Definition, QuestionProgress? Progress);

public sealed record QuestionAccessResult(QuestionAccessStatus Status,
    IReadOnlyList<QuestionView>? Questions = null, QuestionView? Question = null);

public enum AnswerStatus { Saved, AlreadyApplied, AlreadyPassed, Invalid, SessionMissing, CaseVersionMissing, NotFound, Locked, Conflict }

public sealed record AnswerResult(AnswerStatus Status, int Revision = 0, int Attempts = 0,
    bool IsCorrect = false, bool IsPassed = false, bool FirstTryCorrect = false,
    string? Explanation = null);

public sealed class QuestionService(
    SessionService sessions, IPlaySessionStore store, ICaseCatalog catalog, TimeProvider clock)
{
    public async Task<QuestionAccessResult> ListAsync(string token, CancellationToken cancellationToken)
    {
        var context = await LoadAsync(token, cancellationToken);
        if (context.Status != QuestionAccessStatus.Found)
            return new QuestionAccessResult(context.Status);
        var collected = context.Collected!.ToHashSet(StringComparer.Ordinal);
        var progress = context.Progress!.ToDictionary(item => item.QuestionId, StringComparer.Ordinal);
        return new QuestionAccessResult(QuestionAccessStatus.Found,
            context.Case!.Questions.Where(item => QuestionRules.IsAvailable(item, collected))
                .Select(item => new QuestionView(item, progress.GetValueOrDefault(item.Id))).ToArray());
    }

    public async Task<QuestionAccessResult> GetAsync(string token, string questionId, CancellationToken cancellationToken)
    {
        var context = await LoadAsync(token, cancellationToken);
        if (context.Status != QuestionAccessStatus.Found)
            return new QuestionAccessResult(context.Status);
        var question = context.Case!.Questions.SingleOrDefault(item => item.Id == questionId);
        if (question is null) return new QuestionAccessResult(QuestionAccessStatus.NotFound);
        if (!QuestionRules.IsAvailable(question, context.Collected!.ToHashSet(StringComparer.Ordinal)))
            return new QuestionAccessResult(QuestionAccessStatus.Locked);
        return new QuestionAccessResult(QuestionAccessStatus.Found, Question: new QuestionView(question,
            context.Progress!.SingleOrDefault(item => item.QuestionId == question.Id)));
    }

    public async Task<AnswerResult> AnswerAsync(string token, string questionId, string choiceId,
        Guid submissionId, int expectedRevision, CancellationToken cancellationToken)
    {
        if (submissionId == Guid.Empty || expectedRevision < 0 || string.IsNullOrWhiteSpace(choiceId))
            return new AnswerResult(AnswerStatus.Invalid);
        var context = await LoadAsync(token, cancellationToken);
        if (context.Status == QuestionAccessStatus.SessionMissing) return new AnswerResult(AnswerStatus.SessionMissing);
        if (context.Status == QuestionAccessStatus.CaseVersionMissing) return new AnswerResult(AnswerStatus.CaseVersionMissing);
        var question = context.Case!.Questions.SingleOrDefault(item => item.Id == questionId);
        if (question is null) return new AnswerResult(AnswerStatus.NotFound);
        if (!QuestionRules.IsAvailable(question, context.Collected!.ToHashSet(StringComparer.Ordinal)))
            return new AnswerResult(AnswerStatus.Locked);
        if (!question.Choices.Any(item => item.Id == choiceId)) return new AnswerResult(AnswerStatus.Invalid);

        var correct = question.CorrectChoiceId == choiceId;
        var saved = await store.SaveAnswerAsync(SessionToken.Hash(token), expectedRevision, submissionId,
            questionId, choiceId, correct, clock.GetUtcNow(), cancellationToken);
        var status = saved.Status switch
        {
            AnswerSaveStatus.Saved => AnswerStatus.Saved,
            AnswerSaveStatus.AlreadyApplied => AnswerStatus.AlreadyApplied,
            AnswerSaveStatus.AlreadyPassed => AnswerStatus.AlreadyPassed,
            AnswerSaveStatus.NotFound => AnswerStatus.SessionMissing,
            _ => AnswerStatus.Conflict,
        };
        if (status is not (AnswerStatus.Saved or AnswerStatus.AlreadyApplied))
            return new AnswerResult(status, saved.Revision);
        return new AnswerResult(status, saved.Revision, saved.Attempts, saved.IsCorrect, saved.IsPassed,
            saved.FirstTryCorrect, saved.IsCorrect ? question.Explanation : null);
    }

    private async Task<(QuestionAccessStatus Status, CaseDefinition? Case,
        IReadOnlyList<string>? Collected, IReadOnlyList<QuestionProgress>? Progress)> LoadAsync(
        string token, CancellationToken cancellationToken)
    {
        var session = await sessions.ResumeAsync(token, cancellationToken);
        if (session is null) return (QuestionAccessStatus.SessionMissing, null, null, null);
        var definition = catalog.Get(session.CaseId, session.CaseVersion);
        if (definition is null) return (QuestionAccessStatus.CaseVersionMissing, null, null, null);
        var collected = await store.ListEvidenceIdsAsync(session.Id, cancellationToken);
        var progress = await store.ListQuestionProgressAsync(session.Id, cancellationToken);
        return (QuestionAccessStatus.Found, definition, collected, progress);
    }
}
