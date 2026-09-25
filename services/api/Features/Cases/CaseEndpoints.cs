using OfficeCaseFiles.Api.Application;
using OfficeCaseFiles.Api.Contracts;

namespace OfficeCaseFiles.Api.Features.Cases;

public static class CaseEndpoints
{
    public static void MapCaseEndpoints(this WebApplication app)
    {
        app.MapGet("/api/v1/cases", (ICaseCatalog catalog) =>
            Results.Ok(catalog.List().Select(CaseMetadataResponse.From).ToArray()))
            .WithName("ListCases").Produces<CaseMetadataResponse[]>();

        app.MapGet("/api/v1/cases/{caseId}/map", (string caseId, string? version, ICaseCatalog catalog, HttpContext http) =>
        {
            var definition = version is null ? catalog.GetCurrent(caseId) : catalog.Get(caseId, version);
            return definition is null
                ? Results.Problem(statusCode: 404, title: "Case version not found.",
                    extensions: new Dictionary<string, object?> { ["code"] = "case_not_found", ["traceId"] = http.TraceIdentifier })
                : Results.Ok(new CaseMapResponse(definition.Id, definition.Version,
                    definition.Interactions.Select(MapInteractionResponse.From).ToArray()));
        }).WithName("GetCaseMap").Produces<CaseMapResponse>().ProducesProblem(404);
    }
}
