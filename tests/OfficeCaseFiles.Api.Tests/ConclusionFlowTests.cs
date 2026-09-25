using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using OfficeCaseFiles.Api.Infrastructure.Sqlite;

namespace OfficeCaseFiles.Api.Tests;

public sealed class ConclusionFlowTests
{
    [Fact]
    public async Task ConclusionAndReview_ArePrivateIdempotentAndPersisted()
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"ocf-t08-{Guid.NewGuid():N}.db");
        var connectionString = $"Data Source={databasePath}";
        try
        {
            var options = new DbContextOptionsBuilder<GameDbContext>().UseSqlite(connectionString).Options;
            await using (var db = new GameDbContext(options)) await db.Database.MigrateAsync();
            using var factory = CreateFactory(connectionString);
            using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
            using var created = await PostAsync(client, "/api/v1/sessions", new { caseId = "swapped-report" });
            var cookie = Assert.Single(created.Headers.GetValues("Set-Cookie")).Split(';')[0];

            using var view = await GetAsync(client, "/api/v1/session/conclusion", cookie);
            var viewText = await view.Content.ReadAsStringAsync();
            Assert.Equal(HttpStatusCode.OK, view.StatusCode);
            Assert.DoesNotContain("acceptedEvidenceSets", viewText, StringComparison.OrdinalIgnoreCase);
            Assert.DoesNotContain("explanation", viewText, StringComparison.OrdinalIgnoreCase);
            Assert.False((await view.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("isReady").GetBoolean());
            using var early = await PostAsync(client, "/api/v1/session/conclusion",
                ConclusionBody(Guid.NewGuid(), 0), cookie);
            Assert.Equal(HttpStatusCode.BadRequest, early.StatusCode);
            using var resultLocked = await GetAsync(client, "/api/v1/session/result", cookie);
            Assert.Equal(HttpStatusCode.Forbidden, resultLocked.StatusCode);

            await using (var seed = new GameDbContext(options))
            {
                var sessionId = await seed.Sessions.Select(item => item.Id).SingleAsync();
                seed.Evidence.AddRange(new EvidenceRow { SessionId = sessionId, EvidenceId = "E03" },
                    new EvidenceRow { SessionId = sessionId, EvidenceId = "E06" });
                seed.Questions.AddRange(
                    new QuestionProgressRow { SessionId = sessionId, QuestionId = "Q01", FirstChoiceId = "Q01-A", Attempts = 1, IsPassed = true },
                    new QuestionProgressRow { SessionId = sessionId, QuestionId = "Q02", FirstChoiceId = "Q02-A", Attempts = 1, IsPassed = true },
                    new QuestionProgressRow { SessionId = sessionId, QuestionId = "Q03", FirstChoiceId = "Q03-A", Attempts = 1, IsPassed = true });
                await seed.SaveChangesAsync();
            }

            var conclusionId = Guid.NewGuid();
            using var submitted = await PostAsync(client, "/api/v1/session/conclusion", ConclusionBody(conclusionId, 0), cookie);
            Assert.Equal(HttpStatusCode.OK, submitted.StatusCode);
            var body = await submitted.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(100, body.GetProperty("readingScore").GetInt32());
            Assert.Equal(100, body.GetProperty("investigationScore").GetInt32());
            Assert.Contains("misunderstood", body.GetProperty("explanation").GetString(), StringComparison.Ordinal);
            using var duplicate = await PostAsync(client, "/api/v1/session/conclusion", ConclusionBody(conclusionId, 0), cookie);
            Assert.Equal(HttpStatusCode.OK, duplicate.StatusCode);
            using var changed = await PostAsync(client, "/api/v1/session/conclusion",
                new { suspectId = "maya", reasonId = "misread-previous-version", evidenceIds = new[] { "E03", "E06" }, submissionId = conclusionId, revision = 0 }, cookie);
            Assert.Equal(HttpStatusCode.Conflict, changed.StatusCode);

            using var reviewList = await GetAsync(client, "/api/v1/session/review", cookie);
            var reviewText = await reviewList.Content.ReadAsStringAsync();
            Assert.DoesNotContain("correctChoiceId", reviewText, StringComparison.OrdinalIgnoreCase);
            Assert.Equal(5, (await reviewList.Content.ReadFromJsonAsync<JsonElement>()).GetArrayLength());
            var wrongId = Guid.NewGuid();
            using var wrong = await PutAsync(client, "/api/v1/session/review/R01",
                new { choiceId = "R01-B", submissionId = wrongId, revision = 1 }, cookie);
            Assert.Equal(HttpStatusCode.OK, wrong.StatusCode);
            var wrongBody = await wrong.Content.ReadFromJsonAsync<JsonElement>();
            Assert.False(wrongBody.GetProperty("isCorrect").GetBoolean());
            Assert.Equal(JsonValueKind.Null, wrongBody.GetProperty("explanation").ValueKind);
            using var wrongAgain = await PutAsync(client, "/api/v1/session/review/R01",
                new { choiceId = "R01-B", submissionId = wrongId, revision = 1 }, cookie);
            Assert.Equal(1, (await wrongAgain.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("attempts").GetInt32());
            using var correct = await PutAsync(client, "/api/v1/session/review/R01",
                new { choiceId = "R01-A", submissionId = Guid.NewGuid(), revision = 2 }, cookie);
            Assert.True((await correct.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("isCompleted").GetBoolean());

            using var reopened = CreateFactory(connectionString);
            using var resumed = reopened.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
            using var persisted = await GetAsync(resumed, "/api/v1/session/result", cookie);
            Assert.Equal(HttpStatusCode.OK, persisted.StatusCode);
            using var persistedReview = await GetAsync(resumed, "/api/v1/session/review", cookie);
            Assert.True((await persistedReview.Content.ReadFromJsonAsync<JsonElement>())[0].GetProperty("isCompleted").GetBoolean());
            using var replay = await PostAsync(resumed, "/api/v1/sessions", new { caseId = "swapped-report" });
            var replayBody = await replay.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(0, replayBody.GetProperty("revision").GetInt32());
            Assert.Equal("Investigating", replayBody.GetProperty("status").GetString());
            await using var inspect = new GameDbContext(options);
            Assert.Equal(1, await inspect.Conclusions.CountAsync());
            Assert.Equal(2, await inspect.Sessions.CountAsync());
            Assert.Contains(await inspect.Sessions.Select(item => item.Status).ToArrayAsync(), item => item == "Completed");
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

    private static object ConclusionBody(Guid submissionId, int revision) => new
    { suspectId = "nora", reasonId = "misread-previous-version", evidenceIds = new[] { "E03", "E06" }, submissionId, revision };
    private static WebApplicationFactory<Program> CreateFactory(string connectionString) =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        { builder.UseEnvironment("Development"); builder.UseSetting("ConnectionStrings:Game", connectionString); });
    private static Task<HttpResponseMessage> PostAsync(HttpClient client, string path, object body, string? cookie = null) =>
        SendAsync(client, HttpMethod.Post, path, body, cookie);
    private static Task<HttpResponseMessage> PutAsync(HttpClient client, string path, object body, string cookie) =>
        SendAsync(client, HttpMethod.Put, path, body, cookie);
    private static async Task<HttpResponseMessage> SendAsync(HttpClient client, HttpMethod method, string path, object body, string? cookie)
    {
        using var request = new HttpRequestMessage(method, path) { Content = JsonContent.Create(body) };
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
