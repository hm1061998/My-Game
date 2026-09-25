using OfficeCaseFiles.Api.Application;

namespace OfficeCaseFiles.Api.Contracts;

public sealed record ConclusionOptionResponse(string Id, string Label);
public sealed record ConclusionEvidenceResponse(string Id, string Title, string Kind);
public sealed record ConclusionViewResponse(bool IsReady, IReadOnlyList<ConclusionOptionResponse> Suspects,
    IReadOnlyList<ConclusionOptionResponse> Reasons, IReadOnlyList<ConclusionEvidenceResponse> Evidence)
{
    public static ConclusionViewResponse From(ConclusionView view) => new(view.IsReady,
        view.Case.ConclusionOptions.Suspects.Select(item => new ConclusionOptionResponse(item.Id, item.Label)).ToArray(),
        view.Case.ConclusionOptions.Reasons.Select(item => new ConclusionOptionResponse(item.Id, item.Label)).ToArray(),
        view.Evidence.Select(item => new ConclusionEvidenceResponse(item.Id, item.Title, item.Kind)).ToArray());
}
public sealed record ConclusionRequest(string SuspectId, string ReasonId, IReadOnlyList<string> EvidenceIds,
    Guid SubmissionId, int Revision);
public sealed record ConclusionResultResponse(string SuspectId, string ReasonId, IReadOnlyList<string> EvidenceIds,
    int ReadingScore, int InvestigationScore, int Revision, DateTimeOffset SubmittedAtUtc,
    string Explanation, bool AssistanceUsed)
{
    public static ConclusionResultResponse From(ConclusionResultView view) => new(
        view.Conclusion.SuspectId, view.Conclusion.ReasonId, view.Conclusion.EvidenceIds,
        view.Conclusion.ReadingScore, view.Conclusion.InvestigationScore, view.Conclusion.Revision,
        view.Conclusion.SubmittedAtUtc, view.Explanation, view.AssistanceUsed);
}
public sealed record ReviewItemResponse(string Id, string Prompt, IReadOnlyList<ChoiceResponse> Choices,
    int Attempts, bool IsCompleted, string? Explanation)
{
    public static ReviewItemResponse From(ReviewItemView view) => new(view.Definition.Id, view.Definition.Prompt,
        view.Definition.Choices.Select(item => new ChoiceResponse(item.Id, item.Text)).ToArray(),
        view.Progress?.Attempts ?? 0, view.Progress?.IsCompleted ?? false,
        view.Progress?.IsCompleted == true ? view.Definition.Explanation : null);
}
public sealed record ReviewAnswerRequest(string ChoiceId, Guid SubmissionId, int Revision);
public sealed record ReviewAnswerResponse(string ReviewItemId, int Revision, int Attempts,
    bool IsCorrect, bool IsCompleted, string? Explanation);
