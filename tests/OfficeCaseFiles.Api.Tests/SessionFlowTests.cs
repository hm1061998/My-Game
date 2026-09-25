using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Data.Sqlite;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using OfficeCaseFiles.Api.Infrastructure.Sqlite;

namespace OfficeCaseFiles.Api.Tests;

public sealed class SessionFlowTests
{
    [Fact]
    public async Task Session_Checkpoint_ReloadAndRestart_UseSqliteWithoutExposingToken()
    {
        var databasePath = Path.Combine(Path.GetTempPath(), $"ocf-t04-{Guid.NewGuid():N}.db");
        var connectionString = $"Data Source={databasePath}";
        try
        {
            var options = new DbContextOptionsBuilder<GameDbContext>().UseSqlite(connectionString).Options;
            await using (var db = new GameDbContext(options)) await db.Database.MigrateAsync();

            using var factory = CreateFactory(connectionString);
            using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
            using var missing = await client.GetAsync("/api/v1/session");
            Assert.Equal(HttpStatusCode.Unauthorized, missing.StatusCode);
            Assert.Equal("application/problem+json", missing.Content.Headers.ContentType?.MediaType);
            var missingBody = await missing.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal("session_missing", missingBody.GetProperty("code").GetString());
            Assert.False(string.IsNullOrWhiteSpace(missingBody.GetProperty("traceId").GetString()));

            var openApi = await client.GetStringAsync("/openapi/v1.json");
            Assert.Contains("/api/v1/session/checkpoint", openApi, StringComparison.Ordinal);
            Assert.DoesNotContain("TokenHash", openApi, StringComparison.Ordinal);

            using var started = await SendJsonAsync(client, HttpMethod.Post, "/api/v1/sessions",
                new { caseId = "swapped-report" });
            Assert.Equal(HttpStatusCode.Created, started.StatusCode);
            var cookieHeader = Assert.Single(started.Headers.GetValues("Set-Cookie"));
            Assert.Contains("httponly", cookieHeader, StringComparison.OrdinalIgnoreCase);
            Assert.Contains("samesite=strict", cookieHeader, StringComparison.OrdinalIgnoreCase);
            var cookie = cookieHeader.Split(';')[0];
            var token = cookie.Split('=')[1];
            var startBody = await started.Content.ReadAsStringAsync();
            Assert.DoesNotContain(token, startBody, StringComparison.Ordinal);
            Assert.Equal("office-entry", JsonDocument.Parse(startBody).RootElement.GetProperty("checkpointId").GetString());

            using (var db = new GameDbContext(options))
            {
                var row = await db.Sessions.SingleAsync();
                Assert.NotEqual(token, row.TokenHash);
                Assert.Equal(64, row.TokenHash.Length);
            }

            using var staleBeforeSave = await SendJsonAsync(client, HttpMethod.Put, "/api/v1/session/checkpoint",
                new { checkpointId = "meeting-zone", revision = 1 }, cookie);
            Assert.Equal(HttpStatusCode.Conflict, staleBeforeSave.StatusCode);

            var parallelSaves = await Task.WhenAll(
                SendJsonAsync(client, HttpMethod.Put, "/api/v1/session/checkpoint",
                    new { checkpointId = "meeting-zone", revision = 0 }, cookie),
                SendJsonAsync(client, HttpMethod.Put, "/api/v1/session/checkpoint",
                    new { checkpointId = "meeting-zone", revision = 0 }, cookie));
            using var saved = parallelSaves[0];
            using var concurrentDuplicate = parallelSaves[1];
            Assert.Equal(HttpStatusCode.OK, saved.StatusCode);
            Assert.Equal(HttpStatusCode.OK, concurrentDuplicate.StatusCode);
            Assert.Equal(1, (await saved.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("revision").GetInt32());

            using var duplicate = await SendJsonAsync(client, HttpMethod.Put, "/api/v1/session/checkpoint",
                new { checkpointId = "meeting-zone", revision = 0 }, cookie);
            Assert.Equal(HttpStatusCode.OK, duplicate.StatusCode);
            Assert.Equal(1, (await duplicate.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("revision").GetInt32());

            using var invalid = await SendJsonAsync(client, HttpMethod.Put, "/api/v1/session/checkpoint",
                new { checkpointId = "unknown", revision = 0 }, cookie);
            Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);

            using var crossSite = await SendJsonAsync(client, HttpMethod.Put, "/api/v1/session/checkpoint",
                new { checkpointId = "meeting-zone", revision = 1 }, cookie, "https://hostile.example");
            Assert.Equal(HttpStatusCode.Forbidden, crossSite.StatusCode);
            Assert.Equal("application/problem+json", crossSite.Content.Headers.ContentType?.MediaType);

            using var restartedFactory = CreateFactory(connectionString);
            using var restartedClient = restartedFactory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
            using var resumed = await SendWithCookieAsync(restartedClient, HttpMethod.Get, "/api/v1/session", cookie);
            Assert.Equal(HttpStatusCode.OK, resumed.StatusCode);
            var resumedBody = await resumed.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal("meeting-zone", resumedBody.GetProperty("checkpointId").GetString());
            Assert.Equal(1, resumedBody.GetProperty("revision").GetInt32());

            using (var db = new GameDbContext(options))
            {
                await db.Sessions.ExecuteUpdateAsync(setters => setters
                    .SetProperty(row => row.ExpiresAtUtc, DateTime.UtcNow.AddDays(-1)));
            }
            using var expired = await SendWithCookieAsync(restartedClient, HttpMethod.Get, "/api/v1/session", cookie);
            Assert.Equal(HttpStatusCode.Unauthorized, expired.StatusCode);
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

    private static async Task<HttpResponseMessage> SendJsonAsync(
        HttpClient client, HttpMethod method, string path, object body,
        string? cookie = null, string? origin = null)
    {
        using var request = new HttpRequestMessage(method, path) { Content = JsonContent.Create(body) };
        request.Headers.Add("X-Office-Request", "1");
        if (cookie is not null) request.Headers.Add("Cookie", cookie);
        if (origin is not null) request.Headers.Add("Origin", origin);
        return await client.SendAsync(request);
    }

    private static async Task<HttpResponseMessage> SendWithCookieAsync(
        HttpClient client, HttpMethod method, string path, string cookie)
    {
        using var request = new HttpRequestMessage(method, path);
        request.Headers.Add("Cookie", cookie);
        return await client.SendAsync(request);
    }
}
