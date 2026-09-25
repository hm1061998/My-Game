using OfficeCaseFiles.Api.Application;

namespace OfficeCaseFiles.Api.Contracts;

public sealed record ChoiceResponse(string Id, string Text);

public sealed record QuestionResponse(string Id, string Prompt, IReadOnlyList<ChoiceResponse> Choices,
    int Attempts, bool IsPassed, string? Explanation)
{
    public static QuestionResponse From(QuestionView view) => new(view.Definition.Id,
        view.Definition.Prompt, view.Definition.Choices.Select(item =>
            new ChoiceResponse(item.Id, item.Text)).ToArray(),
        view.Progress?.Attempts ?? 0, view.Progress?.IsPassed ?? false,
        view.Progress?.IsPassed == true ? view.Definition.Explanation : null);
}

public sealed record AnswerRequest(string ChoiceId, Guid SubmissionId, int Revision);

public sealed record AnswerResponse(string QuestionId, int Revision, int Attempts,
    bool IsCorrect, bool IsPassed, bool FirstTryCorrect, string? Explanation)
{
    public static AnswerResponse From(string questionId, AnswerResult result) => new(
        questionId, result.Revision, result.Attempts, result.IsCorrect,
        result.IsPassed, result.FirstTryCorrect, result.Explanation);
}
