using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using OfficeCaseFiles.Api.Infrastructure.Sqlite;

namespace OfficeCaseFiles.Api.Tests;

public sealed class StaticHostingTests
{
    [Fact]
    public async Task BuiltWebApp_IsServedSameOrigin_WithoutExposingPrivateFiles()
    {
        var webRoot = Directory.CreateTempSubdirectory("ocf-p01-web-").FullName;
        var databasePath = Path.Combine(Path.GetTempPath(), $"ocf-p01-{Guid.NewGuid():N}.db");
        var connectionString = $"Data Source={databasePath}";
        try
        {
            await File.WriteAllTextAsync(Path.Combine(webRoot, "index.html"), "<!doctype html><title>ocf-shell</title>");
            Directory.CreateDirectory(Path.Combine(webRoot, "assets"));
            await File.WriteAllTextAsync(Path.Combine(webRoot, "assets", "app.js"), "console.log('ocf')");
            await using (var db = new GameDbContext(new DbContextOptionsBuilder<GameDbContext>().UseSqlite(connectionString).Options))
                await db.Database.MigrateAsync();

            using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Production");
                builder.UseSetting("ConnectionStrings:Game", connectionString);
                builder.UseWebRoot(webRoot);
            });
            using var client = factory.CreateClient();

            Assert.Contains("ocf-shell", await client.GetStringAsync("/"), StringComparison.Ordinal);
            Assert.Contains("ocf-shell", await client.GetStringAsync("/case/deep-link"), StringComparison.Ordinal);
            Assert.Contains("console.log", await client.GetStringAsync("/assets/app.js"), StringComparison.Ordinal);

            using var health = await client.GetAsync("/api/v1/health");
            Assert.Equal(HttpStatusCode.OK, health.StatusCode);
            using var unknownApi = await client.GetAsync("/api/v1/does-not-exist");
            Assert.Equal(HttpStatusCode.NotFound, unknownApi.StatusCode);

            foreach (var privatePath in new[] { "/Content/Cases/swapped-report.v1.json", "/swapped-report.v1.json",
                         "/appsettings.json", "/office-case-files.db" })
            {
                using var response = await client.GetAsync(privatePath);
                var body = await response.Content.ReadAsStringAsync();
                Assert.True(response.StatusCode == HttpStatusCode.NotFound || body.Contains("ocf-shell", StringComparison.Ordinal),
                    $"{privatePath} returned {(int)response.StatusCode}");
                Assert.DoesNotContain("correctChoiceId", body, StringComparison.Ordinal);
                Assert.DoesNotContain("ConnectionStrings", body, StringComparison.Ordinal);
            }
        }
        finally
        {
            SqliteConnection.ClearAllPools();
            Directory.Delete(webRoot, recursive: true);
            foreach (var file in new[] { databasePath, $"{databasePath}-wal", $"{databasePath}-shm" })
                if (File.Exists(file)) File.Delete(file);
        }
    }
}
