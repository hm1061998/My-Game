using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using OfficeCaseFiles.Api.Application;
using OfficeCaseFiles.Api.Infrastructure.Sqlite;

namespace OfficeCaseFiles.Api.Tests;

public sealed class ProgressPortabilityTests
{
    [Fact]
    public async Task ExportImport_RoundTripsIntoCleanDatabase_ResumesAndStaysIdempotent()
    {
        var source = await CreateDatabaseAsync(migrate: true);
        var target = await CreateDatabaseAsync(migrate: true);
        try
        {
            string cookie;
            var wrongAnswerId = Guid.NewGuid();
            var detectedId = Guid.NewGuid();
            ProgressExport exported;
            using (var factory = CreateFactory(source))
            {
                using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
                using var created = await Send(client, HttpMethod.Post, "/api/v1/sessions", new { caseId = "swapped-report" });
                cookie = Assert.Single(created.Headers.GetValues("Set-Cookie")).Split(';')[0];
                await Ok(Send(client, HttpMethod.Post, "/api/v1/session/interactions/desk-email", new { submissionId = Guid.NewGuid(), revision = 0 }, cookie));
                await Ok(Send(client, HttpMethod.Post, "/api/v1/session/questions/Q01/answers", new { choiceId = "Q01-B", submissionId = wrongAnswerId, revision = 1 }, cookie));
                await Ok(Send(client, HttpMethod.Post, "/api/v1/session/questions/Q01/answers", new { choiceId = "Q01-A", submissionId = Guid.NewGuid(), revision = 2 }, cookie));
                await Ok(Send(client, HttpMethod.Put, "/api/v1/session/checkpoint", new { checkpointId = "meeting-zone", revision = 3 }, cookie));
                await Ok(Send(client, HttpMethod.Post, "/api/v1/session/encounter", new { outcome = "detected", assistanceUsed = false, submissionId = detectedId, revision = 4 }, cookie));

                using var scope = factory.Services.CreateScope();
                exported = await scope.ServiceProvider.GetRequiredService<IProgressPortability>().ExportAsync(CancellationToken.None);
            }

            var file = ProgressExportFormat.Serialize(exported);
            Assert.DoesNotContain(cookie.Split('=', 2)[1], file, StringComparison.Ordinal);
            Assert.DoesNotContain("Data Source", file, StringComparison.OrdinalIgnoreCase);
            Assert.Equal(1, exported.Manifest.Tables["PlaySessions"].Count);
            Assert.Equal(2, exported.Manifest.Tables["AnswerReceipts"].Count);
            Assert.Contains("swapped-report@", Assert.Single(exported.Manifest.CaseVersions), StringComparison.Ordinal);

            using var targetFactory = CreateFactory(target);
            var reread = ProgressExportFormat.Deserialize(file);
            using (var scope = targetFactory.Services.CreateScope())
            {
                var portability = scope.ServiceProvider.GetRequiredService<IProgressPortability>();
                var imported = await portability.ImportAsync(reread, CancellationToken.None);
                Assert.Equal(ImportStatus.Imported, imported.Status);
                var again = await portability.ImportAsync(reread, CancellationToken.None);
                Assert.Equal(ImportStatus.TargetNotEmpty, again.Status);
                var roundTrip = await portability.ExportAsync(CancellationToken.None);
                foreach (var name in SqliteProgressPortability.TableNames)
                    Assert.Equal(exported.Tables[name].ToJsonString(), roundTrip.Tables[name].ToJsonString());
            }

            using var targetClient = targetFactory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
            using var resumed = await Get(targetClient, "/api/v1/session", cookie);
            Assert.Equal(HttpStatusCode.OK, resumed.StatusCode);
            var session = await resumed.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(5, session.GetProperty("revision").GetInt32());
            Assert.Equal("meeting-zone", session.GetProperty("checkpointId").GetString());
            Assert.Equal(1, session.GetProperty("encounterFailures").GetInt32());

            using var resentAnswer = await Send(targetClient, HttpMethod.Post, "/api/v1/session/questions/Q01/answers",
                new { choiceId = "Q01-B", submissionId = wrongAnswerId, revision = 1 }, cookie);
            Assert.Equal(HttpStatusCode.OK, resentAnswer.StatusCode);
            Assert.Equal(1, (await resentAnswer.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("attempts").GetInt32());
            using var resentEncounter = await Send(targetClient, HttpMethod.Post, "/api/v1/session/encounter",
                new { outcome = "detected", assistanceUsed = false, submissionId = detectedId, revision = 4 }, cookie);
            var encounter = await resentEncounter.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(1, encounter.GetProperty("encounterFailures").GetInt32());
            Assert.Equal(5, encounter.GetProperty("revision").GetInt32());
        }
        finally
        {
            Delete(source);
            Delete(target);
        }
    }

    [Fact]
    public async Task Import_RejectsTamperedUnknownVersionAndUnmigratedTargets()
    {
        var source = await CreateDatabaseAsync(migrate: true);
        var empty = await CreateDatabaseAsync(migrate: true);
        var unmigrated = await CreateDatabaseAsync(migrate: false);
        try
        {
            ProgressExport exported;
            using (var factory = CreateFactory(source))
            {
                using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
                using var created = await Send(client, HttpMethod.Post, "/api/v1/sessions", new { caseId = "swapped-report" });
                using var scope = factory.Services.CreateScope();
                exported = await scope.ServiceProvider.GetRequiredService<IProgressPortability>().ExportAsync(CancellationToken.None);
            }

            var tampered = ProgressExportFormat.Deserialize(ProgressExportFormat.Serialize(exported));
            tampered.Tables["PlaySessions"][0]!["revision"] = 99;
            var futureVersion = exported with { Manifest = exported.Manifest with { ExportVersion = 2 } };
            var otherSchema = exported with { Manifest = exported.Manifest with { SchemaVersion = "20990101000000_Future" } };

            using var emptyFactory = CreateFactory(empty);
            using (var scope = emptyFactory.Services.CreateScope())
            {
                var portability = scope.ServiceProvider.GetRequiredService<IProgressPortability>();
                var badChecksum = await portability.ImportAsync(tampered, CancellationToken.None);
                Assert.Equal(ImportStatus.Invalid, badChecksum.Status);
                Assert.Contains("Checksum mismatch for PlaySessions", badChecksum.Message, StringComparison.Ordinal);
                Assert.Equal(ImportStatus.Invalid, (await portability.ImportAsync(futureVersion, CancellationToken.None)).Status);
                Assert.Equal(ImportStatus.SchemaMismatch, (await portability.ImportAsync(otherSchema, CancellationToken.None)).Status);
                var db = scope.ServiceProvider.GetRequiredService<GameDbContext>();
                Assert.Equal(0, await db.Sessions.CountAsync());
            }

            await using (var db = new GameDbContext(new DbContextOptionsBuilder<GameDbContext>().UseSqlite(unmigrated).Options))
            {
                var result = await new SqliteProgressPortability(db, TimeProvider.System).ImportAsync(exported, CancellationToken.None);
                Assert.Equal(ImportStatus.SchemaMismatch, result.Status);
            }
        }
        finally
        {
            Delete(source);
            Delete(empty);
            Delete(unmigrated);
        }
    }

    private static async Task<string> CreateDatabaseAsync(bool migrate)
    {
        var connectionString = $"Data Source={Path.Combine(Path.GetTempPath(), $"ocf-t12-{Guid.NewGuid():N}.db")}";
        await using var db = new GameDbContext(new DbContextOptionsBuilder<GameDbContext>().UseSqlite(connectionString).Options);
        if (migrate) await db.Database.MigrateAsync();
        return connectionString;
    }

    private static void Delete(string connectionString)
    {
        SqliteConnection.ClearAllPools();
        var path = connectionString["Data Source=".Length..];
        foreach (var file in new[] { path, $"{path}-wal", $"{path}-shm" })
            if (File.Exists(file)) File.Delete(file);
    }

    private static async Task Ok(Task<HttpResponseMessage> call)
    {
        using var response = await call;
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private static WebApplicationFactory<Program> CreateFactory(string connectionString) =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        { builder.UseEnvironment("Development"); builder.UseSetting("ConnectionStrings:Game", connectionString); });

    private static async Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method, string path, object body, string? cookie = null)
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
