using OfficeCaseFiles.Api.Contracts;
using Microsoft.EntityFrameworkCore;
using OfficeCaseFiles.Api.Application;
using OfficeCaseFiles.Api.Features.Sessions;
using OfficeCaseFiles.Api.Features.Cases;
using OfficeCaseFiles.Api.Features.Interactions;
using OfficeCaseFiles.Api.Features.Questions;
using OfficeCaseFiles.Api.Features.Conclusions;
using OfficeCaseFiles.Api.Infrastructure.Content;
using OfficeCaseFiles.Api.Infrastructure.Sqlite;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<SessionService>();
builder.Services.AddScoped<InteractionService>();
builder.Services.AddScoped<QuestionService>();
builder.Services.AddScoped<ConclusionService>();
builder.Services.AddSingleton<ICaseCatalog, JsonCaseCatalog>();

var provider = builder.Configuration["Storage:Provider"];
if (provider != "Sqlite")
    throw new InvalidOperationException($"Unsupported Storage:Provider '{provider ?? "<missing>"}'. Only Sqlite is configured.");
var connectionString = builder.Configuration.GetConnectionString("Game");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("ConnectionStrings:Game is required for SQLite storage.");
builder.Services.AddDbContext<GameDbContext>(options => options.UseSqlite(connectionString));
builder.Services.AddScoped<IPlaySessionStore, SqlitePlaySessionStore>();
builder.Services.AddScoped<IProgressPortability, SqliteProgressPortability>();

var app = builder.Build();

app.UseExceptionHandler();

app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api/v1") &&
        context.Request.Method is "POST" or "PUT" or "PATCH" or "DELETE")
    {
        var fetchSite = context.Request.Headers["Sec-Fetch-Site"].ToString();
        var origin = context.Request.Headers.Origin.ToString();
        var allowedOrigin = app.Configuration["Security:AllowedOrigin"];
        var ownOrigin = $"{context.Request.Scheme}://{context.Request.Host}";
        if (context.Request.Headers["X-Office-Request"] != "1" ||
            fetchSite is "cross-site" or "same-site" ||
            (!string.IsNullOrEmpty(origin) && origin != ownOrigin && origin != allowedOrigin))
        {
            await Results.Problem(statusCode: 403, title: "Cross-site mutation rejected.",
                extensions: new Dictionary<string, object?>
                {
                    ["code"] = "csrf_rejected",
                    ["traceId"] = context.TraceIdentifier,
                }).ExecuteAsync(context);
            return;
        }
    }
    await next();
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/api/v1/health", () => Results.Ok(HealthResponse.Create()))
    .WithName("GetHealth")
    .Produces<HealthResponse>();

app.MapSessionEndpoints();
app.MapCaseEndpoints();
app.MapInteractionEndpoints();
app.MapQuestionEndpoints();
app.MapConclusionEndpoints();

_ = app.Services.GetRequiredService<ICaseCatalog>();

using (var scope = app.Services.CreateScope())
{
    var database = scope.ServiceProvider.GetRequiredService<GameDbContext>().Database;
    if (args.Contains("--migrate", StringComparer.Ordinal))
    {
        await database.MigrateAsync();
        return;
    }
    if ((await database.GetPendingMigrationsAsync()).Any())
        throw new InvalidOperationException("Database migrations are pending. Run the documented local migration command before starting the API.");

    if (CommandPath(args, "--export") is { } exportPath)
    {
        if (File.Exists(exportPath))
        {
            Console.Error.WriteLine($"Export refused: '{exportPath}' already exists. Choose a new file name.");
            Environment.ExitCode = 1;
            return;
        }
        var export = await scope.ServiceProvider.GetRequiredService<IProgressPortability>().ExportAsync(CancellationToken.None);
        await File.WriteAllTextAsync(exportPath, ProgressExportFormat.Serialize(export));
        Console.WriteLine($"Exported {string.Join(", ", export.Manifest.Tables.Select(t => $"{t.Key}={t.Value.Count}"))}.");
        return;
    }
    if (CommandPath(args, "--import") is { } importPath)
    {
        var export = ProgressExportFormat.Deserialize(await File.ReadAllTextAsync(importPath));
        var result = await scope.ServiceProvider.GetRequiredService<IProgressPortability>().ImportAsync(export, CancellationToken.None);
        if (result.Status != ImportStatus.Imported)
        {
            Console.Error.WriteLine($"Import refused ({result.Status}): {result.Message}");
            Environment.ExitCode = 1;
            return;
        }
        Console.WriteLine($"{result.Message} {string.Join(", ", result.Counts!.Select(t => $"{t.Key}={t.Value}"))}.");
        return;
    }
}

app.Run();

static string? CommandPath(string[] args, string flag)
{
    var index = Array.IndexOf(args, flag);
    if (index < 0) return null;
    if (index + 1 >= args.Length || args[index + 1].StartsWith("--", StringComparison.Ordinal))
        throw new InvalidOperationException($"{flag} requires a file path.");
    return Path.GetFullPath(args[index + 1]);
}

public partial class Program;
