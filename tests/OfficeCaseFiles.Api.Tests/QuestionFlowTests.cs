using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using OfficeCaseFiles.Api.Infrastructure.Sqlite;

namespace OfficeCaseFiles.Api.Tests;

public sealed class QuestionFlowTests
{
    [Fact]
    public async Task AnswerFlow_EnforcesPrerequisitesRetryIdempotencyAndUnlock()
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"ocf-t06-{Guid.NewGuid():N}.db");
        var connectionString = $"Data Source={databasePath}";
        try
        {
            var options = new DbContextOptionsBuilder<GameDbContext>().UseSqlite(connectionString).Options;
            await using (var db = new GameDbContext(options)) await db.Database.MigrateAsync();
            using var factory = CreateFactory(connectionString);
            using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
            using var created = await PostAsync(client, "/api/v1/sessions", new { caseId = "swapped-report" });
            var cookie = Assert.Single(created.Headers.GetValues("Set-Cookie")).Split(';')[0];

            using var lockedQuestion = await GetAsync(client, "/api/v1/session/questions/Q01", cookie);
            Assert.Equal(HttpStatusCode.Forbidden, lockedQuestion.StatusCode);
            using var before = await GetAsync(client, "/api/v1/session/questions", cookie);
            Assert.Equal("[]", await before.Content.ReadAsStringAsync());
            using var lockedStatement = await GetAsync(client, "/api/v1/session/evidence/E05", cookie);
            Assert.Equal(HttpStatusCode.Forbidden, lockedStatement.StatusCode);

            using var collected = await PostAsync(client, "/api/v1/session/interactions/desk-email",
                new { submissionId = Guid.NewGuid(), revision = 0 }, cookie);
            Assert.Equal(HttpStatusCode.OK, collected.StatusCode);
            using var available = await GetAsync(client, "/api/v1/session/questions/Q01", cookie);
            Assert.Equal(HttpStatusCode.OK, available.StatusCode);
            var questionText = await available.Content.ReadAsStringAsync();
            Assert.Contains("Which report", questionText, StringComparison.Ordinal);
            Assert.DoesNotContain("correctChoiceId", questionText, StringComparison.OrdinalIgnoreCase);
            Assert.Equal(JsonValueKind.Null,
                (await available.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("explanation").ValueKind);

            var wrongId = Guid.NewGuid();
            using var wrong = await PostAsync(client, "/api/v1/session/questions/Q01/answers",
                new { choiceId = "Q01-B", submissionId = wrongId, revision = 1 }, cookie);
            Assert.Equal(HttpStatusCode.OK, wrong.StatusCode);
            var wrongBody = await wrong.Content.ReadFromJsonAsync<JsonElement>();
            Assert.False(wrongBody.GetProperty("isCorrect").GetBoolean());
            Assert.Equal(1, wrongBody.GetProperty("attempts").GetInt32());
            Assert.Equal(JsonValueKind.Null, wrongBody.GetProperty("explanation").ValueKind);
            using var duplicate = await PostAsync(client, "/api/v1/session/questions/Q01/answers",
                new { choiceId = "Q01-B", submissionId = wrongId, revision = 1 }, cookie);
            Assert.Equal(HttpStatusCode.OK, duplicate.StatusCode);
            Assert.Equal(1, (await duplicate.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("attempts").GetInt32());
            using var reused = await PostAsync(client, "/api/v1/session/questions/Q01/answers",
                new { choiceId = "Q01-A", submissionId = wrongId, revision = 1 }, cookie);
            Assert.Equal(HttpStatusCode.Conflict, reused.StatusCode);
            using var stale = await PostAsync(client, "/api/v1/session/questions/Q01/answers",
                new { choiceId = "Q01-A", submissionId = Guid.NewGuid(), revision = 1 }, cookie);
            Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
            using var stillLocked = await PostAsync(client, "/api/v1/session/interactions/npc-maya",
                new { submissionId = Guid.NewGuid(), revision = 2 }, cookie);
            Assert.True((await stillLocked.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("statementLocked").GetBoolean());

            var correctId = Guid.NewGuid();
            using var correct = await PostAsync(client, "/api/v1/session/questions/Q01/answers",
                new { choiceId = "Q01-A", submissionId = correctId, revision = 2 }, cookie);
            Assert.Equal(HttpStatusCode.OK, correct.StatusCode);
            var correctBody = await correct.Content.ReadFromJsonAsync<JsonElement>();
            Assert.True(correctBody.GetProperty("isPassed").GetBoolean());
            Assert.False(correctBody.GetProperty("firstTryCorrect").GetBoolean());
            Assert.Equal(2, correctBody.GetProperty("attempts").GetInt32());
            Assert.Contains("approved version three", correctBody.GetProperty("explanation").GetString(), StringComparison.Ordinal);
            using var correctRetry = await PostAsync(client, "/api/v1/session/questions/Q01/answers",
                new { choiceId = "Q01-A", submissionId = correctId, revision = 2 }, cookie);
            Assert.Equal(HttpStatusCode.OK, correctRetry.StatusCode);
            using var alreadyPassed = await PostAsync(client, "/api/v1/session/questions/Q01/answers",
                new { choiceId = "Q01-A", submissionId = Guid.NewGuid(), revision = 3 }, cookie);
            Assert.Equal(HttpStatusCode.Conflict, alreadyPassed.StatusCode);

            using var maya = await PostAsync(client, "/api/v1/session/interactions/npc-maya",
                new { submissionId = Guid.NewGuid(), revision = 3 }, cookie);
            Assert.Equal("E05", (await maya.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("collectedEvidenceId").GetString());
            using var chat = await PostAsync(client, "/api/v1/session/interactions/chat-device",
                new { submissionId = Guid.NewGuid(), revision = 4 }, cookie);
            Assert.Equal(HttpStatusCode.OK, chat.StatusCode);
            using var q2 = await PostAsync(client, "/api/v1/session/questions/Q02/answers",
                new { choiceId = "Q02-A", submissionId = Guid.NewGuid(), revision = 5 }, cookie);
            Assert.Equal(HttpStatusCode.OK, q2.StatusCode);
            Assert.True((await q2.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("firstTryCorrect").GetBoolean());
            using var nora = await PostAsync(client, "/api/v1/session/interactions/npc-nora",
                new { submissionId = Guid.NewGuid(), revision = 6 }, cookie);
            Assert.True((await nora.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("statementLocked").GetBoolean());
            using var q3Locked = await GetAsync(client, "/api/v1/session/questions/Q03", cookie);
            Assert.Equal(HttpStatusCode.Forbidden, q3Locked.StatusCode);

            using var reopened = CreateFactory(connectionString);
            using var resumed = reopened.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
            using var list = await GetAsync(resumed, "/api/v1/session/questions", cookie);
            var listBody = await list.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(2, listBody.GetArrayLength());
            Assert.True(listBody[0].GetProperty("isPassed").GetBoolean());
            Assert.Equal(2, listBody[0].GetProperty("attempts").GetInt32());
            Assert.Contains("approved version three", listBody[0].GetProperty("explanation").GetString(), StringComparison.Ordinal);
            await using var inspect = new GameDbContext(options);
            var stored = await inspect.Questions.SingleAsync(row => row.QuestionId == "Q01");
            Assert.Equal("Q01-B", stored.FirstChoiceId);
        }
        finally
        {
            SqliteConnection.ClearAllPools();
            foreach (var suffix in new[] { "", "-wal", "-shm" })
            {
                var path = databasePath + suffix;
                if (File.Exists(path)) File.Delete(path);
            }
        }
    }

    private static WebApplicationFactory<Program> CreateFactory(string connectionString) =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Development");
            builder.UseSetting("ConnectionStrings:Game", connectionString);
        });

    private static async Task<HttpResponseMessage> PostAsync(HttpClient client, string path, object body, string? cookie = null)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, path) { Content = JsonContent.Create(body) };
        request.Headers.Add("X-Office-Request", "1");
        if (cookie is not null) request.Headers.Add("Cookie", cookie);
        return await client.SendAsync(request);
    }

    private static async Task<HttpResponseMessage> GetAsync(HttpClient client, string path, string cookie)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, path);
        request.Headers.Add("Cookie", cookie);
        return await client.SendAsync(request);
    }
}
