using System.Text.Json;
using OfficeCaseFiles.Api.Application;
using OfficeCaseFiles.Api.Domain;

namespace OfficeCaseFiles.Api.Tests;

public sealed class ConclusionRulesTests
{
    [Fact]
    public void Scores_AreServerCalculated_WithFirstTryAndBestEvidenceSet()
    {
        var caseFile = LoadCase();
        var progress = new[]
        {
            new QuestionProgress("Q01", "Q01-A", 1, true),
            new QuestionProgress("Q02", "Q02-B", 2, true),
            new QuestionProgress("Q03", "Q03-A", 1, true),
        };
        Assert.True(ConclusionRules.IsReady(caseFile, new HashSet<string>(["E03", "E06"]),
            progress.Where(item => item.IsPassed).Select(item => item.QuestionId).ToHashSet()));
        Assert.Equal(67, ConclusionRules.ReadingScore(caseFile,
            progress.Where(item => item.IsPassed && item.Attempts == 1).Select(item => item.QuestionId).ToHashSet()));
        Assert.Equal(100, ConclusionRules.InvestigationScore(caseFile.Solution,
            "nora", "misread-previous-version", ["E06", "E03"]));
        Assert.Equal(60, ConclusionRules.InvestigationScore(caseFile.Solution,
            "nora", "uploaded-wrong-figures", ["E03", "E01"]));
        Assert.Equal(20, ConclusionRules.InvestigationScore(caseFile.Solution,
            "maya", "uploaded-wrong-figures", ["E03", "E01"]));
    }

    private static CaseDefinition LoadCase()
    {
        var path = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory,
            "../../../../../services/api/Content/Cases/swapped-report.v1.json"));
        return JsonSerializer.Deserialize<CaseDefinition>(File.ReadAllText(path),
            new JsonSerializerOptions(JsonSerializerDefaults.Web))!;
    }
}
