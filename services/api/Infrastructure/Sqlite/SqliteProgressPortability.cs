using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;
using OfficeCaseFiles.Api.Application;

namespace OfficeCaseFiles.Api.Infrastructure.Sqlite;

public sealed class SqliteProgressPortability(GameDbContext db, TimeProvider time) : IProgressPortability
{
    private static readonly JsonSerializerOptions RowOptions = new(JsonSerializerDefaults.Web);

    private sealed record Table(
        string Name,
        Func<GameDbContext, CancellationToken, Task<JsonArray>> Export,
        Action<GameDbContext, JsonArray> Stage,
        Func<GameDbContext, CancellationToken, Task<int>> Count);

    private static Table Define<T>(string name, Func<GameDbContext, DbSet<T>> set, Func<T, string> sortKey) where T : class =>
        new(name,
            async (context, token) =>
            {
                var rows = await set(context).AsNoTracking().ToListAsync(token);
                return new JsonArray(rows.OrderBy(sortKey, StringComparer.Ordinal)
                    .Select(row => JsonSerializer.SerializeToNode(row, RowOptions)).ToArray());
            },
            (context, rows) => set(context).AddRange(rows.Select(node =>
                node.Deserialize<T>(RowOptions) ?? throw new InvalidDataException($"Null row in {name}."))),
            (context, token) => set(context).CountAsync(token));

    // Parent table first so foreign keys hold during import.
    private static readonly Table[] Tables =
    [
        Define("PlaySessions", c => c.Sessions, r => r.Id.ToString()),
        Define("EvidenceProgress", c => c.Evidence, r => $"{r.SessionId}|{r.EvidenceId}"),
        Define("InteractionReceipts", c => c.InteractionReceipts, r => $"{r.SessionId}|{r.SubmissionId}"),
        Define("QuestionProgress", c => c.Questions, r => $"{r.SessionId}|{r.QuestionId}"),
        Define("AnswerReceipts", c => c.AnswerReceipts, r => $"{r.SessionId}|{r.SubmissionId}"),
        Define("EncounterReceipts", c => c.EncounterReceipts, r => $"{r.SessionId}|{r.SubmissionId}"),
        Define("Conclusions", c => c.Conclusions, r => r.SessionId.ToString()),
        Define("ConclusionReceipts", c => c.ConclusionReceipts, r => $"{r.SessionId}|{r.SubmissionId}"),
        Define("ReviewProgress", c => c.Reviews, r => $"{r.SessionId}|{r.ReviewItemId}"),
        Define("ReviewReceipts", c => c.ReviewReceipts, r => $"{r.SessionId}|{r.SubmissionId}"),
    ];

    public static IReadOnlyCollection<string> TableNames { get; } = Tables.Select(table => table.Name).ToArray();

    public async Task<ProgressExport> ExportAsync(CancellationToken cancellationToken)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var tables = new Dictionary<string, JsonArray>(StringComparer.Ordinal);
        foreach (var table in Tables) tables[table.Name] = await table.Export(db, cancellationToken);
        var caseVersions = await db.Sessions.AsNoTracking().Select(row => row.CaseId + "@" + row.CaseVersion)
            .Distinct().ToListAsync(cancellationToken);
        var manifest = new ExportManifest(ProgressExportFormat.CurrentVersion, await SchemaVersionAsync(cancellationToken),
            "sqlite", time.GetUtcNow(), caseVersions.Order(StringComparer.Ordinal).ToArray(),
            tables.ToDictionary(pair => pair.Key, pair => ProgressExportFormat.Describe(pair.Value), StringComparer.Ordinal));
        return new ProgressExport(manifest, tables);
    }

    public async Task<ImportResult> ImportAsync(ProgressExport export, CancellationToken cancellationToken)
    {
        if (ProgressExportFormat.Validate(export, TableNames) is { } problem)
            return new ImportResult(ImportStatus.Invalid, problem);
        if ((await db.Database.GetPendingMigrationsAsync(cancellationToken)).Any())
            return new ImportResult(ImportStatus.SchemaMismatch, "Target database has pending migrations; run --migrate first.");
        var schema = await SchemaVersionAsync(cancellationToken);
        if (!string.Equals(schema, export.Manifest.SchemaVersion, StringComparison.Ordinal))
            return new ImportResult(ImportStatus.SchemaMismatch,
                $"Export schema {export.Manifest.SchemaVersion} does not match target schema {schema}.");
        foreach (var table in Tables)
        {
            if (await table.Count(db, cancellationToken) > 0)
                return new ImportResult(ImportStatus.TargetNotEmpty, $"Target table {table.Name} already has data; import only into an empty database.");
        }

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        foreach (var table in Tables) table.Stage(db, export.Tables[table.Name]);
        await db.SaveChangesAsync(cancellationToken);
        db.ChangeTracker.Clear();

        var counts = new Dictionary<string, int>(StringComparer.Ordinal);
        foreach (var table in Tables)
        {
            var reread = await table.Export(db, cancellationToken);
            var expected = export.Manifest.Tables[table.Name];
            if (reread.Count != expected.Count || ProgressExportFormat.Checksum(reread) != expected.Checksum)
            {
                await transaction.RollbackAsync(cancellationToken);
                return new ImportResult(ImportStatus.Invalid, $"Post-import verification failed for {table.Name}; nothing was written.");
            }
            counts[table.Name] = reread.Count;
        }
        await transaction.CommitAsync(cancellationToken);
        return new ImportResult(ImportStatus.Imported, "Import verified and committed.", counts);
    }

    private async Task<string> SchemaVersionAsync(CancellationToken cancellationToken) =>
        (await db.Database.GetAppliedMigrationsAsync(cancellationToken)).LastOrDefault() ?? "none";
}
