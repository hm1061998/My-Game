using OfficeCaseFiles.Api.Application;
using OfficeCaseFiles.Api.Contracts;
using OfficeCaseFiles.Api.Features.Sessions;

namespace OfficeCaseFiles.Api.Features.Interactions;

public static class InteractionEndpoints
{
    public static void MapInteractionEndpoints(this WebApplication app)
    {
        app.MapPost("/api/v1/session/interactions/{interactionId}", async (
            string interactionId, InteractionRequest request, InteractionService service,
            HttpContext http, CancellationToken cancellationToken) =>
        {
            if (!TryToken(http, out var token)) return Error(http, 401, "session_missing", "Start a session first.");
            var result = await service.InteractAsync(token!, interactionId, request.SubmissionId,
                request.Revision, cancellationToken);
            return result.Status switch
            {
                InteractionStatus.Dialogue or InteractionStatus.Collected or InteractionStatus.AlreadyCollected =>
                    Results.Ok(InteractionResponse.From(interactionId, result)),
                InteractionStatus.Invalid => Error(http, 400, "invalid_interaction", "A submission ID and valid revision are required."),
                InteractionStatus.SessionMissing => Error(http, 401, "session_expired", "This session is unavailable or expired."),
                InteractionStatus.CaseVersionMissing => Error(http, 409, "case_version_missing", "This case version is no longer available."),
                InteractionStatus.NotFound => Error(http, 404, "interaction_not_found", "This interaction does not exist."),
                InteractionStatus.Locked => Error(http, 403, "interaction_locked", "This record is not available yet."),
                _ => Error(http, 409, "revision_conflict", "Reload progress before retrying."),
            };
        }).WithName("Interact").Produces<InteractionResponse>().ProducesProblem(400)
            .ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);

        app.MapGet("/api/v1/session/notebook", async (
            InteractionService service, HttpContext http, CancellationToken cancellationToken) =>
        {
            if (!TryToken(http, out var token)) return Error(http, 401, "session_missing", "Start a session first.");
            var result = await service.GetNotebookAsync(token!, cancellationToken);
            return result.Status switch
            {
                NotebookAccessStatus.Found => Results.Ok(NotebookResponse.From(result.Data!)),
                NotebookAccessStatus.CaseVersionMissing => Error(http, 409, "case_version_missing", "This case version is no longer available."),
                _ => Error(http, 401, "session_expired", "This session is unavailable or expired."),
            };
        }).WithName("GetNotebook").Produces<NotebookResponse>().ProducesProblem(401).ProducesProblem(409);

        app.MapGet("/api/v1/session/evidence/{evidenceId}", async (
            string evidenceId, InteractionService service, HttpContext http,
            CancellationToken cancellationToken) =>
        {
            if (!TryToken(http, out var token)) return Error(http, 401, "session_missing", "Start a session first.");
            var result = await service.GetEvidenceAsync(token!, evidenceId, cancellationToken);
            return result.Status switch
            {
                EvidenceAccessStatus.Found => Results.Ok(EvidenceResponse.From(result.Case!, result.Evidence!)),
                EvidenceAccessStatus.Locked => Error(http, 403, "evidence_locked", "Collect this record before reading it."),
                EvidenceAccessStatus.NotFound => Error(http, 404, "evidence_not_found", "This record does not exist."),
                EvidenceAccessStatus.CaseVersionMissing => Error(http, 409, "case_version_missing", "This case version is no longer available."),
                _ => Error(http, 401, "session_expired", "This session is unavailable or expired."),
            };
        }).WithName("GetEvidence").Produces<EvidenceResponse>().ProducesProblem(401)
            .ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
    }

    private static bool TryToken(HttpContext http, out string? token) =>
        http.Request.Cookies.TryGetValue(SessionEndpoints.CookieName, out token) && !string.IsNullOrWhiteSpace(token);

    private static IResult Error(HttpContext http, int status, string code, string title) =>
        Results.Problem(statusCode: status, title: title,
            extensions: new Dictionary<string, object?> { ["code"] = code, ["traceId"] = http.TraceIdentifier });
}
