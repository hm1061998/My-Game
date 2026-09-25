using OfficeCaseFiles.Api.Application;
using OfficeCaseFiles.Api.Contracts;
using OfficeCaseFiles.Api.Features.Sessions;

namespace OfficeCaseFiles.Api.Features.Conclusions;

public static class ConclusionEndpoints
{
    public static void MapConclusionEndpoints(this WebApplication app)
    {
        app.MapGet("/api/v1/session/conclusion", async (ConclusionService service, HttpContext http,
            CancellationToken cancellationToken) =>
        {
            if (!TryToken(http, out var token)) return Error(http, 401, "session_missing", "Start a session first.");
            var result = await service.GetViewAsync(token!, cancellationToken);
            return result.Status switch
            {
                ConclusionAccessStatus.Found => Results.Ok(ConclusionViewResponse.From(result.View!)),
                ConclusionAccessStatus.CaseVersionMissing => Error(http, 409, "case_version_missing", "This case version is unavailable."),
                _ => Error(http, 401, "session_expired", "This session is unavailable or expired."),
            };
        });

        app.MapPost("/api/v1/session/conclusion", async (ConclusionRequest request, ConclusionService service,
            HttpContext http, CancellationToken cancellationToken) =>
        {
            if (!TryToken(http, out var token)) return Error(http, 401, "session_missing", "Start a session first.");
            var result = await service.SubmitAsync(token!, request.SuspectId, request.ReasonId,
                request.EvidenceIds, request.SubmissionId, request.Revision, cancellationToken);
            return SubmitResult(result, http);
        });

        app.MapGet("/api/v1/session/result", async (ConclusionService service, HttpContext http,
            CancellationToken cancellationToken) =>
        {
            if (!TryToken(http, out var token)) return Error(http, 401, "session_missing", "Start a session first.");
            var result = await service.GetResultAsync(token!, cancellationToken);
            return result.Status switch
            {
                ConclusionAccessStatus.Found => Results.Ok(ConclusionResultResponse.From(result.Result!)),
                ConclusionAccessStatus.Locked => Error(http, 403, "conclusion_locked", "Submit a conclusion first."),
                ConclusionAccessStatus.CaseVersionMissing => Error(http, 409, "case_version_missing", "This case version is unavailable."),
                _ => Error(http, 401, "session_expired", "This session is unavailable or expired."),
            };
        });

        app.MapGet("/api/v1/session/review", async (ConclusionService service, HttpContext http,
            CancellationToken cancellationToken) =>
        {
            if (!TryToken(http, out var token)) return Error(http, 401, "session_missing", "Start a session first.");
            var result = await service.ListReviewAsync(token!, cancellationToken);
            return result.Status switch
            {
                ConclusionAccessStatus.Found => Results.Ok(result.Items!.Select(ReviewItemResponse.From).ToArray()),
                ConclusionAccessStatus.Locked => Error(http, 403, "review_locked", "Submit a conclusion first."),
                ConclusionAccessStatus.CaseVersionMissing => Error(http, 409, "case_version_missing", "This case version is unavailable."),
                _ => Error(http, 401, "session_expired", "This session is unavailable or expired."),
            };
        });

        app.MapPut("/api/v1/session/review/{itemId}", async (string itemId, ReviewAnswerRequest request,
            ConclusionService service, HttpContext http, CancellationToken cancellationToken) =>
        {
            if (!TryToken(http, out var token)) return Error(http, 401, "session_missing", "Start a session first.");
            var result = await service.AnswerReviewAsync(token!, itemId, request.ChoiceId,
                request.SubmissionId, request.Revision, cancellationToken);
            return result.Status switch
            {
                ReviewAnswerStatus.Saved or ReviewAnswerStatus.AlreadyApplied => Results.Ok(
                    new ReviewAnswerResponse(itemId, result.Revision, result.Attempts, result.IsCorrect,
                        result.IsCompleted, result.Explanation)),
                ReviewAnswerStatus.Invalid => Error(http, 400, "invalid_review_answer", "A valid choice, submission ID and revision are required."),
                ReviewAnswerStatus.NotFound => Error(http, 404, "review_not_found", "This review item does not exist."),
                ReviewAnswerStatus.Locked => Error(http, 403, "review_locked", "Submit a conclusion first."),
                ReviewAnswerStatus.AlreadyCompleted => Error(http, 409, "review_completed", "This review item is already complete."),
                ReviewAnswerStatus.CaseVersionMissing => Error(http, 409, "case_version_missing", "This case version is unavailable."),
                ReviewAnswerStatus.SessionMissing => Error(http, 401, "session_expired", "This session is unavailable or expired."),
                _ => Error(http, 409, "revision_conflict", "Reload progress before retrying."),
            };
        });
    }

    private static IResult SubmitResult(ConclusionSubmitResult result, HttpContext http) => result.Status switch
    {
        ConclusionSubmitStatus.Saved or ConclusionSubmitStatus.AlreadyApplied => Results.Ok(ConclusionResultResponse.From(result.Result!)),
        ConclusionSubmitStatus.Invalid => Error(http, 400, "invalid_conclusion", "Choose one suspect, one reason and two collected evidence records."),
        ConclusionSubmitStatus.Locked => Error(http, 403, "conclusion_locked", "Complete all questions and required evidence first."),
        ConclusionSubmitStatus.AlreadyCompleted => Error(http, 409, "conclusion_completed", "This session already has a conclusion."),
        ConclusionSubmitStatus.CaseVersionMissing => Error(http, 409, "case_version_missing", "This case version is unavailable."),
        ConclusionSubmitStatus.SessionMissing => Error(http, 401, "session_expired", "This session is unavailable or expired."),
        _ => Error(http, 409, "revision_conflict", "Reload progress before retrying."),
    };

    private static bool TryToken(HttpContext http, out string? token) =>
        http.Request.Cookies.TryGetValue(SessionEndpoints.CookieName, out token) && !string.IsNullOrWhiteSpace(token);
    private static IResult Error(HttpContext http, int status, string code, string title) =>
        Results.Problem(statusCode: status, title: title,
            extensions: new Dictionary<string, object?> { ["code"] = code, ["traceId"] = http.TraceIdentifier });
}
