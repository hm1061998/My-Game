using System.Text.Json;
using OfficeCaseFiles.Api.Application;
using OfficeCaseFiles.Api.Domain;

namespace OfficeCaseFiles.Api.Infrastructure.Content;

public sealed class JsonCaseCatalog : ICaseCatalog
{
    private readonly IReadOnlyList<CaseDefinition> cases;

    public JsonCaseCatalog(IHostEnvironment environment, IConfiguration configuration)
    {
        var provider = configuration["Content:Provider"];
        if (provider != "Json") throw new InvalidOperationException($"Unsupported Content:Provider '{provider ?? "<missing>"}'.");
        var root = configuration["Content:Root"];
        if (string.IsNullOrWhiteSpace(root)) throw new InvalidOperationException("Content:Root is required.");
        var directory = Path.GetFullPath(Path.Combine(environment.ContentRootPath, root));
        if (!Directory.Exists(directory)) throw new DirectoryNotFoundException($"Case content directory is unavailable: {directory}");

        var loaded = new List<CaseDefinition>();
        foreach (var path in Directory.EnumerateFiles(directory, "*.json", SearchOption.TopDirectoryOnly))
        {
            using var stream = File.OpenRead(path);
            var definition = JsonSerializer.Deserialize<CaseDefinition>(stream, new JsonSerializerOptions(JsonSerializerDefaults.Web))
                ?? throw new InvalidDataException($"Case file is empty: {Path.GetFileName(path)}");
            CaseValidator.Validate(definition);
            loaded.Add(definition);
        }
        if (loaded.Count == 0) throw new InvalidDataException("No case definitions were found.");
        if (loaded.Select(item => (item.Id, item.Version)).Distinct().Count() != loaded.Count)
            throw new InvalidDataException("Duplicate case ID/version across content files.");
        cases = loaded.AsReadOnly();
    }

    public IReadOnlyList<CaseDefinition> List() => cases;
    public CaseDefinition? Get(string caseId, string caseVersion) =>
        cases.SingleOrDefault(item => item.Id == caseId && item.Version == caseVersion);
    public CaseDefinition? GetCurrent(string caseId) =>
        cases.Where(item => item.Id == caseId).OrderByDescending(item => item.Version, StringComparer.Ordinal).FirstOrDefault();
}
