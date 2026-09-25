using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using OfficeCaseFiles.Api.Infrastructure.Sqlite;

namespace OfficeCaseFiles.Api.Tests;

public sealed class EncounterFlowTests
{
    [Fact]
    public async Task DetectionAssistAndClear_PreserveLearningAndUnlockArchive()
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"ocf-t07-{Guid.NewGuid():N}.db");
        var connectionString = $"Data Source={databasePath}";
        try
        {
            var options = new DbContextOptionsBuilder<GameDbContext>().UseSqlite(connectionString).Options;
            await using (var db = new GameDbContext(options)) await db.Database.MigrateAsync();
            using var factory = CreateFactory(connectionString);
            using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
            using var created = await Send(client, HttpMethod.Post, "/api/v1/sessions", new { caseId = "swapped-report" });
            var cookie = Assert.Single(created.Headers.GetValues("Set-Cookie")).Split(';')[0];
            using var archiveBefore = await Get(client, "/api/v1/session/evidence/E03", cookie);
            Assert.Equal(HttpStatusCode.Forbidden, archiveBefore.StatusCode);

            using var email = await Send(client, HttpMethod.Post, "/api/v1/session/interactions/desk-email",
                new { submissionId = Guid.NewGuid(), revision = 0 }, cookie);
            Assert.Equal(HttpStatusCode.OK, email.StatusCode);
            using var wrong = await Send(client, HttpMethod.Post, "/api/v1/session/questions/Q01/answers",
                new { choiceId = "Q01-B", submissionId = Guid.NewGuid(), revision = 1 }, cookie);
            Assert.Equal(HttpStatusCode.OK, wrong.StatusCode);
            using var premature = await Send(client, HttpMethod.Post, "/api/v1/session/encounter",
                new { outcome = "cleared", assistanceUsed = false, submissionId = Guid.NewGuid(), revision = 2 }, cookie);
            Assert.Equal(HttpStatusCode.BadRequest, premature.StatusCode);
            using var checkpoint = await Send(client, HttpMethod.Put, "/api/v1/session/checkpoint",
                new { checkpointId = "meeting-zone", revision = 2 }, cookie);
            Assert.Equal(HttpStatusCode.OK, checkpoint.StatusCode);
            using var earlyAssist = await Send(client, HttpMethod.Post, "/api/v1/session/encounter",
                new { outcome = "cleared", assistanceUsed = true, submissionId = Guid.NewGuid(), revision = 3 }, cookie);
            Assert.Equal(HttpStatusCode.BadRequest, earlyAssist.StatusCode);

            var firstId = Guid.NewGuid();
            using var first = await Send(client, HttpMethod.Post, "/api/v1/session/encounter",
                new { outcome = "detected", assistanceUsed = false, submissionId = firstId, revision = 3 }, cookie);
            Assert.Equal(HttpStatusCode.OK, first.StatusCode);
            Assert.Equal(1, (await first.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("encounterFailures").GetInt32());
            using var duplicate = await Send(client, HttpMethod.Post, "/api/v1/session/encounter",
                new { outcome = "detected", assistanceUsed = false, submissionId = firstId, revision = 3 }, cookie);
            Assert.Equal(HttpStatusCode.OK, duplicate.StatusCode);
            Assert.Equal(4, (await duplicate.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("revision").GetInt32());
            using var mismatched = await Send(client, HttpMethod.Post, "/api/v1/session/encounter",
                new { outcome = "cleared", assistanceUsed = false, submissionId = firstId, revision = 3 }, cookie);
            Assert.Equal(HttpStatusCode.Conflict, mismatched.StatusCode);
            using var stale = await Send(client, HttpMethod.Post, "/api/v1/session/encounter",
                new { outcome = "detected", assistanceUsed = false, submissionId = Guid.NewGuid(), revision = 3 }, cookie);
            Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
            using var second = await Send(client, HttpMethod.Post, "/api/v1/session/encounter",
                new { outcome = "detected", assistanceUsed = false, submissionId = Guid.NewGuid(), revision = 4 }, cookie);
            Assert.Equal(2, (await second.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("encounterFailures").GetInt32());

            var clearId = Guid.NewGuid();
            using var clear = await Send(client, HttpMethod.Post, "/api/v1/session/encounter",
                new { outcome = "cleared", assistanceUsed = true, submissionId = clearId, revision = 5 }, cookie);
            Assert.Equal(HttpStatusCode.OK, clear.StatusCode);
            var cleared = await clear.Content.ReadFromJsonAsync<JsonElement>();
            Assert.True(cleared.GetProperty("encounterCleared").GetBoolean());
            Assert.True(cleared.GetProperty("assistanceUsed").GetBoolean());
            using var clearRetry = await Send(client, HttpMethod.Post, "/api/v1/session/encounter",
                new { outcome = "cleared", assistanceUsed = true, submissionId = clearId, revision = 5 }, cookie);
            Assert.Equal(6, (await clearRetry.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("revision").GetInt32());

            using var archive = await Send(client, HttpMethod.Post, "/api/v1/session/interactions/archive-terminal",
                new { submissionId = Guid.NewGuid(), revision = 6 }, cookie);
            Assert.Equal("E03", (await archive.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("collectedEvidenceId").GetString());
            using var q3 = await Get(client, "/api/v1/session/questions/Q03", cookie);
            Assert.Equal(HttpStatusCode.OK, q3.StatusCode);
            Assert.DoesNotContain("correctChoiceId", await q3.Content.ReadAsStringAsync(), StringComparison.OrdinalIgnoreCase);

            using var restarted = CreateFactory(connectionString);
            using var resumedClient = restarted.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
            using var resumed = await Get(resumedClient, "/api/v1/session", cookie);
            var state = await resumed.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal("meeting-zone", state.GetProperty("checkpointId").GetString());
            Assert.Equal(2, state.GetProperty("encounterFailures").GetInt32());
            Assert.True(state.GetProperty("encounterCleared").GetBoolean());
            using var notebook = await Get(resumedClient, "/api/v1/session/notebook", cookie);
            Assert.Contains("E01", await notebook.Content.ReadAsStringAsync(), StringComparison.Ordinal);
            Assert.Contains("E03", await notebook.Content.ReadAsStringAsync(), StringComparison.Ordinal);
            using var questions = await Get(resumedClient, "/api/v1/session/questions", cookie);
            Assert.Contains("\"attempts\":1", await questions.Content.ReadAsStringAsync(), StringComparison.Ordinal);
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

    private static async Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method,
        string path, object body, string? cookie = null)
    {
        using var request = new HttpRequestMessage(method, path) { Content = JsonContent.Create(body) };
        request.Headers.Add("X-Office-Request", "1");
        if (cookie is not null) request.Headers.Add("Cookie", cookie);
        return await client.SendAsync(request);
    }

    private static async Task<HttpResponseMessage> Get(HttpClient client, string path, string cookie)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, path);
        request.Headers.Add("Cookie", cookie);
        return await client.SendAsync(request);
    }
}
