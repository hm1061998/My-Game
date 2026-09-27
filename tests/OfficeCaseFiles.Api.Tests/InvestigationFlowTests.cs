using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using OfficeCaseFiles.Api.Infrastructure.Sqlite;

namespace OfficeCaseFiles.Api.Tests;

public sealed class InvestigationFlowTests
{
    [Fact]
    public async Task VersionTwoTranslationContent_PreservesPinnedVersionOneSessions()
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"ocf-v2-pin-{Guid.NewGuid():N}.db");
        var caseDirectory = Path.Combine(Path.GetTempPath(), $"ocf-cases-{Guid.NewGuid():N}");
        var connectionString = $"Data Source={databasePath}";
        Directory.CreateDirectory(caseDirectory);
        try
        {
            var options = new DbContextOptionsBuilder<GameDbContext>().UseSqlite(connectionString).Options;
            await using (var db = new GameDbContext(options)) await db.Database.MigrateAsync();
            CopyCase("swapped-report.v1.json", caseDirectory);

            string versionOneCookie;
            using (var v1Factory = CreateFactory(connectionString, caseDirectory))
            using (var v1Client = v1Factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false }))
            {
                using var started = await PostAsync(v1Client, "/api/v1/sessions", new { caseId = "swapped-report" });
                versionOneCookie = Assert.Single(started.Headers.GetValues("Set-Cookie")).Split(';')[0];
                var state = await GetAsync(v1Client, "/api/v1/session", versionOneCookie);
                Assert.Equal("1", (await state.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("caseVersion").GetString());
                CopyCase("swapped-report.v2.json", caseDirectory);
            }

            using var v2Factory = CreateFactory(connectionString, caseDirectory);
            using var client = v2Factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
            var resumedResponse = await GetAsync(client, "/api/v1/session", versionOneCookie);
            Assert.Equal(HttpStatusCode.OK, resumedResponse.StatusCode);
            Assert.Equal("1", (await resumedResponse.Content.ReadFromJsonAsync<JsonElement>())
                .GetProperty("caseVersion").GetString());

            using var newSession = await PostAsync(client, "/api/v1/sessions", new { caseId = "swapped-report" });
            Assert.Equal(HttpStatusCode.Created, newSession.StatusCode);
            var versionTwoCookie = Assert.Single(newSession.Headers.GetValues("Set-Cookie")).Split(';')[0];
            var newState = await GetAsync(client, "/api/v1/session", versionTwoCookie);
            Assert.Equal("2", (await newState.Content.ReadFromJsonAsync<JsonElement>())
                .GetProperty("caseVersion").GetString());

            using var collected = await PostAsync(client, "/api/v1/session/interactions/desk-email",
                new { submissionId = Guid.NewGuid(), revision = 0 }, versionTwoCookie);
            Assert.Equal(HttpStatusCode.OK, collected.StatusCode);
            var evidenceResponse = await GetAsync(client, "/api/v1/session/evidence/E01", versionTwoCookie);
            var evidence = await evidenceResponse.Content.ReadFromJsonAsync<JsonElement>();
            Assert.False(string.IsNullOrWhiteSpace(evidence.GetProperty("bodyVi").GetString()));
            Assert.DoesNotContain("misread-previous-version", evidence.ToString(), StringComparison.Ordinal);

            var dialogueResponse = await PostAsync(client, "/api/v1/session/interactions/npc-maya",
                new { submissionId = Guid.NewGuid(), revision = 1 }, versionTwoCookie);
            var dialogue = await dialogueResponse.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(dialogue.GetProperty("dialogue").GetArrayLength(),
                dialogue.GetProperty("dialogueVi").GetArrayLength());
        }
        finally
        {
            SqliteConnection.ClearAllPools();
            foreach (var suffix in new[] { "", "-wal", "-shm" })
            {
                var path = databasePath + suffix;
                if (File.Exists(path)) File.Delete(path);
            }
            if (Directory.Exists(caseDirectory)) Directory.Delete(caseDirectory, recursive: true);
        }
    }

    [Fact]
    public async Task VersionTwoNoraStatement_UnlocksFromCollectedEvidenceAndEncounterWithoutQ02Q03()
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"ocf-v2-unlock-{Guid.NewGuid():N}.db");
        var connectionString = $"Data Source={databasePath}";
        try
        {
            var options = new DbContextOptionsBuilder<GameDbContext>().UseSqlite(connectionString).Options;
            await using (var db = new GameDbContext(options)) await db.Database.MigrateAsync();
            using var factory = CreateFactory(connectionString);
            using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
            using var started = await PostAsync(client, "/api/v1/sessions", new { caseId = "swapped-report" });
            var cookie = Assert.Single(started.Headers.GetValues("Set-Cookie")).Split(';')[0];
            Assert.Equal("2", (await (await GetAsync(client, "/api/v1/session", cookie))
                .Content.ReadFromJsonAsync<JsonElement>()).GetProperty("caseVersion").GetString());

            using var e01 = await PostAsync(client, "/api/v1/session/interactions/desk-email",
                new { submissionId = Guid.NewGuid(), revision = 0 }, cookie);
            using var e02 = await PostAsync(client, "/api/v1/session/interactions/chat-device",
                new { submissionId = Guid.NewGuid(), revision = 1 }, cookie);
            using var lockedNora = await PostAsync(client, "/api/v1/session/interactions/npc-nora",
                new { submissionId = Guid.NewGuid(), revision = 2 }, cookie);
            Assert.True((await lockedNora.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("statementLocked").GetBoolean());

            using var checkpoint = await PutAsync(client, "/api/v1/session/checkpoint",
                new { checkpointId = "meeting-zone", revision = 2 }, cookie);
            Assert.Equal(HttpStatusCode.OK, checkpoint.StatusCode);
            using var clear = await PostAsync(client, "/api/v1/session/encounter",
                new { outcome = "cleared", assistanceUsed = false, submissionId = Guid.NewGuid(), revision = 3 }, cookie);
            Assert.Equal(HttpStatusCode.OK, clear.StatusCode);
            using var e03 = await PostAsync(client, "/api/v1/session/interactions/archive-terminal",
                new { submissionId = Guid.NewGuid(), revision = 4 }, cookie);
            Assert.Equal("E03", (await e03.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("collectedEvidenceId").GetString());

            using var nora = await PostAsync(client, "/api/v1/session/interactions/npc-nora",
                new { submissionId = Guid.NewGuid(), revision = 5 }, cookie);
            Assert.Equal(HttpStatusCode.OK, nora.StatusCode);
            var result = await nora.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal("E06", result.GetProperty("collectedEvidenceId").GetString());
            Assert.False(result.GetProperty("statementLocked").GetBoolean());
            using var questionsResponse = await GetAsync(client, "/api/v1/session/questions", cookie);
            var questions = await questionsResponse.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(0, questions.EnumerateArray()
                .Where(item => item.GetProperty("id").GetString() is "Q02" or "Q03")
                .Sum(item => item.GetProperty("attempts").GetInt32()));
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

    [Fact]
    public async Task CollectEvidence_EnforcesLocksIdempotencyAndPersistence()
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"ocf-t05-{Guid.NewGuid():N}.db");
        var connectionString = $"Data Source={databasePath}";
        try
        {
            var options = new DbContextOptionsBuilder<GameDbContext>().UseSqlite(connectionString).Options;
            await using (var db = new GameDbContext(options)) await db.Database.MigrateAsync();

            using var factory = CreateFactory(connectionString);
            using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });

            var cases = await client.GetStringAsync("/api/v1/cases");
            var map = await client.GetStringAsync("/api/v1/cases/swapped-report/map?version=1");
            Assert.Contains("desk-email", map, StringComparison.Ordinal);
            Assert.DoesNotContain("correctChoiceId", cases + map, StringComparison.OrdinalIgnoreCase);
            Assert.DoesNotContain("misread-previous-version", cases + map, StringComparison.Ordinal);

            using var created = await PostAsync(client, "/api/v1/sessions", new { caseId = "swapped-report" });
            Assert.Equal(HttpStatusCode.Created, created.StatusCode);
            var cookie = Assert.Single(created.Headers.GetValues("Set-Cookie")).Split(';')[0];

            using var lockedBefore = await GetAsync(client, "/api/v1/session/evidence/E01", cookie);
            Assert.Equal(HttpStatusCode.Forbidden, lockedBefore.StatusCode);
            using var unknownEvidence = await GetAsync(client, "/api/v1/session/evidence/E99", cookie);
            Assert.Equal(HttpStatusCode.NotFound, unknownEvidence.StatusCode);

            var submission = Guid.NewGuid();
            using var collected = await PostAsync(client, "/api/v1/session/interactions/desk-email",
                new { submissionId = submission, revision = 0 }, cookie);
            Assert.Equal(HttpStatusCode.OK, collected.StatusCode);
            var collectedBody = await collected.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal("E01", collectedBody.GetProperty("collectedEvidenceId").GetString());
            Assert.Equal(1, collectedBody.GetProperty("revision").GetInt32());

            using var retry = await PostAsync(client, "/api/v1/session/interactions/desk-email",
                new { submissionId = submission, revision = 0 }, cookie);
            Assert.Equal(HttpStatusCode.OK, retry.StatusCode);
            Assert.Equal(1, (await retry.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("revision").GetInt32());

            using var mismatchedRetry = await PostAsync(client, "/api/v1/session/interactions/chat-device",
                new { submissionId = submission, revision = 0 }, cookie);
            Assert.Equal(HttpStatusCode.Conflict, mismatchedRetry.StatusCode);
            using var stale = await PostAsync(client, "/api/v1/session/interactions/chat-device",
                new { submissionId = Guid.NewGuid(), revision = 0 }, cookie);
            Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
            using var encounterLocked = await PostAsync(client, "/api/v1/session/interactions/archive-terminal",
                new { submissionId = Guid.NewGuid(), revision = 1 }, cookie);
            Assert.Equal(HttpStatusCode.Forbidden, encounterLocked.StatusCode);

            using var maya = await PostAsync(client, "/api/v1/session/interactions/npc-maya",
                new { submissionId = Guid.NewGuid(), revision = 1 }, cookie);
            Assert.Equal(HttpStatusCode.OK, maya.StatusCode);
            Assert.True((await maya.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("statementLocked").GetBoolean());

            using var evidence = await GetAsync(client, "/api/v1/session/evidence/E01", cookie);
            Assert.Equal(HttpStatusCode.OK, evidence.StatusCode);
            Assert.Contains("approved report", await evidence.Content.ReadAsStringAsync(), StringComparison.Ordinal);

            using var restartedFactory = CreateFactory(connectionString);
            using var resumedClient = restartedFactory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
            using var notebook = await GetAsync(resumedClient, "/api/v1/session/notebook", cookie);
            Assert.Equal(HttpStatusCode.OK, notebook.StatusCode);
            var notebookBody = await notebook.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Single(notebookBody.GetProperty("evidence").EnumerateArray());
            Assert.Equal("E01", notebookBody.GetProperty("evidence")[0].GetProperty("id").GetString());
            Assert.DoesNotContain("misread-previous-version", notebookBody.ToString(), StringComparison.Ordinal);
            Assert.True(notebookBody.GetProperty("glossary").GetArrayLength() >= 1);
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

    private static WebApplicationFactory<Program> CreateFactory(string connectionString, string? caseDirectory = null) =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Development");
            builder.UseSetting("ConnectionStrings:Game", connectionString);
            if (caseDirectory is not null) builder.UseSetting("Content:Root", caseDirectory);
        });

    private static void CopyCase(string fileName, string targetDirectory)
    {
        var source = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory,
            "../../../../../services/api/Content/Cases", fileName));
        File.Copy(source, Path.Combine(targetDirectory, fileName));
    }

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

    private static async Task<HttpResponseMessage> PutAsync(HttpClient client, string path, object body, string cookie)
    {
        using var request = new HttpRequestMessage(HttpMethod.Put, path) { Content = JsonContent.Create(body) };
        request.Headers.Add("X-Office-Request", "1");
        request.Headers.Add("Cookie", cookie);
        return await client.SendAsync(request);
    }
}
