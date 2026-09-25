using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace OfficeCaseFiles.Api.Application;

/// <summary>Provider-neutral export/import of all learner progress (PROJECT_PLAN §5.8).</summary>
public interface IProgressPortability
{
    Task<ProgressExport> ExportAsync(CancellationToken cancellationToken);

    /// <summary>Imports into an empty, fully migrated store in one transaction.</summary>
    Task<ImportResult> ImportAsync(ProgressExport export, CancellationToken cancellationToken);
}

public sealed record TableManifest(int Count, string Checksum);

public sealed record ExportManifest(
    int ExportVersion,
    string SchemaVersion,
    string SourceProvider,
    DateTimeOffset ExportedAtUtc,
    IReadOnlyList<string> CaseVersions,
    IReadOnlyDictionary<string, TableManifest> Tables);

/// <summary>Rows are plain JSON objects so no provider type crosses the port.</summary>
public sealed record ProgressExport(ExportManifest Manifest, IReadOnlyDictionary<string, JsonArray> Tables);

public enum ImportStatus { Imported, TargetNotEmpty, SchemaMismatch, Invalid }

public sealed record ImportResult(ImportStatus Status, string Message, IReadOnlyDictionary<string, int>? Counts = null);

public static class ProgressExportFormat
{
    public const int CurrentVersion = 1;

    private static readonly JsonSerializerOptions FileOptions = new(JsonSerializerDefaults.Web) { WriteIndented = true };

    /// <summary>SHA-256 over the compact JSON of rows in their stored (key-sorted) order.</summary>
    public static string Checksum(JsonArray rows) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rows.ToJsonString()))).ToLowerInvariant();

    public static TableManifest Describe(JsonArray rows) => new(rows.Count, Checksum(rows));

    public static string Serialize(ProgressExport export) => JsonSerializer.Serialize(new
    {
        manifest = export.Manifest,
        tables = export.Tables,
    }, FileOptions);

    public static ProgressExport Deserialize(string json)
    {
        var root = JsonNode.Parse(json)?.AsObject() ?? throw new InvalidDataException("Export file is empty.");
        var manifest = root["manifest"].Deserialize<ExportManifest>(FileOptions)
            ?? throw new InvalidDataException("Export manifest is missing.");
        var tablesNode = root["tables"]?.AsObject() ?? throw new InvalidDataException("Export tables are missing.");
        var tables = tablesNode.ToDictionary(pair => pair.Key,
            pair => pair.Value?.AsArray() ?? throw new InvalidDataException($"Table {pair.Key} is not an array."));
        return new ProgressExport(manifest, tables);
    }

    /// <summary>Returns null when the export is internally consistent, otherwise the first problem found.</summary>
    public static string? Validate(ProgressExport export, IReadOnlyCollection<string> expectedTables)
    {
        if (export.Manifest.ExportVersion != CurrentVersion)
            return $"Unsupported exportVersion {export.Manifest.ExportVersion}; this build reads {CurrentVersion}.";
        var names = export.Tables.Keys.ToHashSet(StringComparer.Ordinal);
        if (!names.SetEquals(expectedTables) || !names.SetEquals(export.Manifest.Tables.Keys))
            return "Export tables do not match the expected table set.";
        foreach (var (name, rows) in export.Tables)
        {
            var declared = export.Manifest.Tables[name];
            if (declared.Count != rows.Count) return $"Row count mismatch for {name}.";
            if (!string.Equals(declared.Checksum, Checksum(rows), StringComparison.Ordinal))
                return $"Checksum mismatch for {name}.";
        }
        return null;
    }
}
