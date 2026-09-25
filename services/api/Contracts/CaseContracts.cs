using OfficeCaseFiles.Api.Domain;

namespace OfficeCaseFiles.Api.Contracts;

public sealed record CaseMetadataResponse(string Id, string Version, string Title, string Level, string Brief)
{
    public static CaseMetadataResponse From(CaseDefinition definition) =>
        new(definition.Id, definition.Version, definition.Title, definition.Level, definition.Brief);
}

public sealed record MapInteractionResponse(string Id, string Kind, string LabelVi, int X, int Y, int Radius)
{
    public static MapInteractionResponse From(InteractionDefinition definition) =>
        new(definition.Id, definition.Kind, definition.LabelVi, definition.X, definition.Y, definition.Radius);
}

public sealed record CaseMapResponse(string CaseId, string CaseVersion, IReadOnlyList<MapInteractionResponse> Interactions);
