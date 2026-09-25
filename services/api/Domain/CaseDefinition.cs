namespace OfficeCaseFiles.Api.Domain;

public sealed record CaseDefinition(
    int SchemaVersion,
    string Id,
    string Version,
    string Title,
    string Level,
    string Brief,
    IReadOnlyList<EvidenceDefinition> Evidence,
    IReadOnlyList<NpcDefinition> Npcs,
    IReadOnlyList<GlossaryDefinition> Glossary,
    IReadOnlyList<QuestionDefinition> Questions,
    IReadOnlyList<InteractionDefinition> Interactions,
    SolutionDefinition Solution);

public sealed record EvidenceDefinition(
    string Id,
    string Kind,
    string Title,
    string Body,
    IReadOnlyList<string> GlossaryIds,
    IReadOnlyList<string> SourceEvidenceIds,
    IReadOnlyList<string> RequiredCorrectQuestionIds,
    bool RequiresEncounter);

public sealed record NpcDefinition(string Id, string Name, IReadOnlyList<string> Dialogue);

public sealed record GlossaryDefinition(string Id, string Term, string MeaningVi, string ExampleEn);

public sealed record QuestionDefinition(
    string Id,
    IReadOnlyList<string> SourceEvidenceIds,
    string Prompt,
    IReadOnlyList<ChoiceDefinition> Choices,
    string CorrectChoiceId,
    string Explanation);

public sealed record ChoiceDefinition(string Id, string Text);

public sealed record InteractionDefinition(
    string Id,
    string Kind,
    string TargetId,
    string? EvidenceId,
    string LabelVi,
    int X,
    int Y,
    int Radius);

public sealed record SolutionDefinition(
    string SuspectId,
    string ReasonId,
    IReadOnlyList<IReadOnlyList<string>> AcceptedEvidenceSets,
    string Explanation);
