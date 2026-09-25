using OfficeCaseFiles.Api.Application;
using OfficeCaseFiles.Api.Contracts;
using OfficeCaseFiles.Api.Features.Sessions;

namespace OfficeCaseFiles.Api.Features.Questions;

public static class QuestionEndpoints
{
    public static void MapQuestionEndpoints(this WebApplication app)
    {
        app.MapGet("/api/v1/session/questions", async (
            QuestionService service, HttpContext http, CancellationToken cancellationToken) =>
        {
            if (!TryToken(http, out var token)) return Error(http, 401, "session_missing", "Start a session first.");
            var result = await service.ListAsync(token!, cancellationToken);
            return result.Status switch
            {
                QuestionAccessStatus.Found => Results.Ok(result.Questions!.Select(QuestionResponse.From).ToArray()),
                QuestionAccessStatus.CaseVersionMissing => Error(http, 409, "case_version_missing", "This case version is unavailable."),
                _ => Error(http, 401, "session_expired", "This session is unavailable or expired."),
            };
        }).WithName("ListQuestions").Produces<QuestionResponse[]>();

        app.MapGet("/api/v1/session/questions/{questionId}", async (
            string questionId, QuestionService service, HttpContext http, CancellationToken cancellationToken) =>
        {
            if (!TryToken(http, out var token)) return Error(http, 401, "session_missing", "Start a session first.");
            var result = await service.GetAsync(token!, questionId, cancellationToken);
            return result.Status switch
            {
                QuestionAccessStatus.Found => Results.Ok(QuestionResponse.From(result.Question!)),
                QuestionAccessStatus.NotFound => Error(http, 404, "question_not_found", "This question does not exist."),
                QuestionAccessStatus.Locked => Error(http, 403, "question_locked", "Collect the source record first."),
                QuestionAccessStatus.CaseVersionMissing => Error(http, 409, "case_version_missing", "This case version is unavailable."),
                _ => Error(http, 401, "session_expired", "This session is unavailable or expired."),
            };
        }).WithName("GetQuestion").Produces<QuestionResponse>();

        app.MapPost("/api/v1/session/questions/{questionId}/answers", async (
            string questionId, AnswerRequest request, QuestionService service,
            HttpContext http, CancellationToken cancellationToken) =>
        {
            if (!TryToken(http, out var token)) return Error(http, 401, "session_missing", "Start a session first.");
            var result = await service.AnswerAsync(token!, questionId, request.ChoiceId,
                request.SubmissionId, request.Revision, cancellationToken);
            return result.Status switch
            {
                AnswerStatus.Saved or AnswerStatus.AlreadyApplied => Results.Ok(AnswerResponse.From(questionId, result)),
                AnswerStatus.Invalid => Error(http, 400, "invalid_answer", "A valid choice, submission ID, and revision are required."),
                AnswerStatus.SessionMissing => Error(http, 401, "session_expired", "This session is unavailable or expired."),
                AnswerStatus.CaseVersionMissing => Error(http, 409, "case_version_missing", "This case version is unavailable."),
                AnswerStatus.NotFound => Error(http, 404, "question_not_found", "This question does not exist."),
                AnswerStatus.Locked => Error(http, 403, "question_locked", "Collect the source record first."),
                AnswerStatus.AlreadyPassed => Error(http, 409, "question_passed", "This question is already passed."),
                _ => Error(http, 409, "revision_conflict", "Reload progress before retrying."),
            };
        }).WithName("AnswerQuestion").Produces<AnswerResponse>();
    }

    private static bool TryToken(HttpContext http, out string? token) =>
        http.Request.Cookies.TryGetValue(SessionEndpoints.CookieName, out token) && !string.IsNullOrWhiteSpace(token);

    private static IResult Error(HttpContext http, int status, string code, string title) =>
        Results.Problem(statusCode: status, title: title,
            extensions: new Dictionary<string, object?> { ["code"] = code, ["traceId"] = http.TraceIdentifier });
}
