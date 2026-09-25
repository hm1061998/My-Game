using OfficeCaseFiles.Api.Application;
using OfficeCaseFiles.Api.Domain;

namespace OfficeCaseFiles.Api.Contracts;

public sealed record InteractionRequest(Guid SubmissionId, int Revision);

public sealed record InteractionResponse(
    string InteractionId, string Kind, int Revision, string? Title,
    IReadOnlyList<string>? Dialogue, string? CollectedEvidenceId, bool StatementLocked)
{
    public static InteractionResponse From(string interactionId, InteractionResult result) => new(
        interactionId, result.Dialogue is null ? "evidence" : "npc", result.Revision,
        result.Title, result.Dialogue, result.EvidenceId, result.StatementLocked);
}

public sealed record EvidenceSummaryResponse(string Id, string Kind, string Title)
{
    public static EvidenceSummaryResponse From(EvidenceDefinition evidence) =>
        new(evidence.Id, evidence.Kind, evidence.Title);
}

public sealed record GlossaryItemResponse(string Id, string Term, string MeaningVi, string ExampleEn)
{
    public static GlossaryItemResponse From(GlossaryDefinition glossary) =>
        new(glossary.Id, glossary.Term, glossary.MeaningVi, glossary.ExampleEn);
}

public sealed record NotebookResponse(
    string CaseId, string CaseVersion, IReadOnlyList<EvidenceSummaryResponse> Evidence,
    IReadOnlyList<GlossaryItemResponse> Glossary)
{
    public static NotebookResponse From(NotebookData data)
    {
        var glossaryIds = data.Collected.SelectMany(item => item.GlossaryIds).ToHashSet(StringComparer.Ordinal);
        return new NotebookResponse(data.Case.Id, data.Case.Version,
            data.Collected.Select(EvidenceSummaryResponse.From).ToArray(),
            data.Case.Glossary.Where(item => glossaryIds.Contains(item.Id))
                .Select(GlossaryItemResponse.From).ToArray());
    }
}

public sealed record EvidenceResponse(
    string Id, string Kind, string Title, string Body, IReadOnlyList<GlossaryItemResponse> Glossary)
{
    public static EvidenceResponse From(CaseDefinition caseFile, EvidenceDefinition evidence) => new(
        evidence.Id, evidence.Kind, evidence.Title, evidence.Body,
        caseFile.Glossary.Where(item => evidence.GlossaryIds.Contains(item.Id))
            .Select(GlossaryItemResponse.From).ToArray());
}
