using OfficeCaseFiles.Api.Application;
using OfficeCaseFiles.Api.Contracts;

namespace OfficeCaseFiles.Api.Features.Sessions;

public static class SessionEndpoints
{
    private const string CookieName = "ocf_session";

    public static void MapSessionEndpoints(this WebApplication app)
    {
        app.MapPost("/api/v1/sessions", async (
            StartSessionRequest request, SessionService service, HttpContext http, CancellationToken cancellationToken) =>
        {
            if (string.IsNullOrWhiteSpace(request.CaseId))
                return Error(http, 400, "invalid_case", "A case ID is required.");

            var started = await service.StartAsync(request.CaseId, cancellationToken);
            if (started is null) return Error(http, 404, "case_not_found", "This case is not available.");

            SetSessionCookie(http, started.Value.Token, started.Value.Session.ExpiresAtUtc);
            return Results.Created("/api/v1/session", SessionResponse.From(started.Value.Session));
        }).WithName("StartSession").Produces<SessionResponse>(201).ProducesProblem(400).ProducesProblem(404);

        app.MapGet("/api/v1/session", async (
            SessionService service, HttpContext http, CancellationToken cancellationToken) =>
        {
            if (!http.Request.Cookies.TryGetValue(CookieName, out var token) || string.IsNullOrEmpty(token))
                return Error(http, 401, "session_missing", "Start a new session to continue.");

            var session = await service.ResumeAsync(token, cancellationToken);
            if (session is null)
            {
                http.Response.Cookies.Delete(CookieName, new CookieOptions { Path = "/api/v1" });
                return Error(http, 401, "session_expired", "This session is unavailable or expired.");
            }
            SetSessionCookie(http, token, session.ExpiresAtUtc);
            return Results.Ok(SessionResponse.From(session));
        }).WithName("ResumeSession").Produces<SessionResponse>().ProducesProblem(401);

        app.MapPut("/api/v1/session/checkpoint", async (
            CheckpointRequest request, SessionService service, HttpContext http, CancellationToken cancellationToken) =>
        {
            if (!http.Request.Cookies.TryGetValue(CookieName, out var token) || string.IsNullOrEmpty(token))
                return Error(http, 401, "session_missing", "Start a new session to continue.");
            if (string.IsNullOrWhiteSpace(request.CheckpointId) || request.Revision < 0)
                return Error(http, 400, "invalid_checkpoint", "A checkpoint and nonnegative revision are required.");

            var result = await service.SaveCheckpointAsync(token, request.Revision, request.CheckpointId, cancellationToken);
            return result.Status switch
            {
                CheckpointSaveStatus.Saved or CheckpointSaveStatus.AlreadyApplied => Saved(http, token, result.Session!),
                CheckpointSaveStatus.NotFound => Error(http, 401, "session_expired", "This session is unavailable or expired."),
                CheckpointSaveStatus.Invalid => Error(http, 400, "invalid_checkpoint", "This checkpoint transition is not valid."),
                _ => Error(http, 409, "checkpoint_conflict", "Reload session progress before retrying this checkpoint."),
            };
        }).WithName("SaveCheckpoint").Produces<SessionResponse>().ProducesProblem(400)
            .ProducesProblem(401).ProducesProblem(409);
    }

    private static IResult Error(HttpContext http, int status, string code, string title) =>
        Results.Problem(statusCode: status, title: title,
            extensions: new Dictionary<string, object?> { ["code"] = code, ["traceId"] = http.TraceIdentifier });

    private static IResult Saved(HttpContext http, string token, OfficeCaseFiles.Api.Domain.PlaySession session)
    {
        SetSessionCookie(http, token, session.ExpiresAtUtc);
        return Results.Ok(SessionResponse.From(session));
    }

    private static void SetSessionCookie(HttpContext http, string token, DateTimeOffset expiresAt)
    {
        http.Response.Cookies.Append(CookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !http.RequestServices.GetRequiredService<IHostEnvironment>().IsDevelopment(),
            SameSite = SameSiteMode.Strict,
            Path = "/api/v1",
            Expires = expiresAt,
        });
    }
}
