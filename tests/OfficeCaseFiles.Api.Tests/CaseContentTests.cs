using System.Text.Json;
using OfficeCaseFiles.Api.Domain;
using OfficeCaseFiles.Api.Infrastructure.Content;

namespace OfficeCaseFiles.Api.Tests;

public sealed class CaseContentTests
{
    [Fact]
    public void VersionedCase_HasSixValidatedClues_AndPrivateQuestionAnswers()
    {
        var definition = LoadCase();
        CaseValidator.Validate(definition);
        Assert.Equal(6, definition.Evidence.Count);
        Assert.Equal(3, definition.Npcs.Count);
        Assert.InRange(definition.Glossary.Count, 12, 15);
        Assert.Equal(3, definition.Questions.Count);
        Assert.Equal(3, definition.ConclusionOptions.Suspects.Count);
        Assert.Equal(3, definition.ConclusionOptions.Reasons.Count);
        Assert.Equal(5, definition.ReviewItems.Count);
    }

    [Fact]
    public void Validator_RejectsDuplicateMissingReferenceBadAnswerAndUnlockCycle()
    {
        var definition = LoadCase();
        Assert.Throws<InvalidDataException>(() => CaseValidator.Validate(definition with
        {
            Evidence = [.. definition.Evidence, definition.Evidence[0]],
        }));
        Assert.Throws<InvalidDataException>(() => CaseValidator.Validate(definition with
        {
            Questions = [definition.Questions[0] with { SourceEvidenceIds = ["missing"] }, .. definition.Questions.Skip(1)],
        }));
        Assert.Throws<InvalidDataException>(() => CaseValidator.Validate(definition with
        {
            Questions = [definition.Questions[0] with { CorrectChoiceId = "missing" }, .. definition.Questions.Skip(1)],
        }));
        Assert.Throws<InvalidDataException>(() => CaseValidator.Validate(definition with
        {
            Evidence = [definition.Evidence[0] with { RequiredCorrectQuestionIds = ["Q01"] }, .. definition.Evidence.Skip(1)],
        }));
    }

    private static CaseDefinition LoadCase()
    {
        var path = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory,
            "../../../../../services/api/Content/Cases/swapped-report.v1.json"));
        return JsonSerializer.Deserialize<CaseDefinition>(File.ReadAllText(path),
            new JsonSerializerOptions(JsonSerializerDefaults.Web))!;
    }
}
