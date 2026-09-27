using System.Text.Json;
using OfficeCaseFiles.Api.Domain;
using OfficeCaseFiles.Api.Infrastructure.Content;

namespace OfficeCaseFiles.Api.Tests;

public sealed class CaseContentTests
{
    [Fact]
    public void VersionedCase_HasSixValidatedClues_AndPrivateQuestionAnswers()
    {
        var definition = LoadCase("1");
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
    public void VersionTwo_AddsAlignedTranslations_WithoutChangingVersionOneOrPrivateAnswers()
    {
        var versionOne = LoadCase("1");
        var versionTwo = LoadCase("2");

        CaseValidator.Validate(versionOne);
        CaseValidator.Validate(versionTwo);

        Assert.All(versionOne.Evidence, item => Assert.Null(item.BodyVi));
        Assert.All(versionOne.Npcs, item => Assert.Null(item.DialogueVi));
        Assert.All(versionTwo.Npcs.Where(item => item.DialogueVi is not null), item =>
            Assert.Equal(item.Dialogue.Count, item.DialogueVi!.Count));
        Assert.All(versionTwo.Evidence.Where(item => item.Id is "E01" or "E02" or "E03" or "E06"), item =>
            Assert.False(string.IsNullOrWhiteSpace(item.BodyVi)));

        var oldNoraStatement = versionOne.Evidence.Single(item => item.Id == "E06");
        var newNoraStatement = versionTwo.Evidence.Single(item => item.Id == "E06");
        Assert.Equal(new[] { "Q02", "Q03" }, oldNoraStatement.RequiredCorrectQuestionIds);
        Assert.Empty(newNoraStatement.RequiredCorrectQuestionIds);
        Assert.Equal(new[] { "E02", "E03" }, newNoraStatement.SourceEvidenceIds);
        Assert.Equal(versionOne.Solution.SuspectId, versionTwo.Solution.SuspectId);
        Assert.Equal(versionOne.Solution.ReasonId, versionTwo.Solution.ReasonId);
        Assert.Equal(versionOne.Solution.Explanation, versionTwo.Solution.Explanation);
        Assert.Equal(versionOne.Solution.AcceptedEvidenceSets.Select(set => string.Join(',', set)),
            versionTwo.Solution.AcceptedEvidenceSets.Select(set => string.Join(',', set)));
    }

    [Fact]
    public void Validator_RejectsUnalignedOrEmptyOptionalTranslations()
    {
        var definition = LoadCase("1");
        var firstNpc = definition.Npcs[0];

        Assert.Throws<InvalidDataException>(() => CaseValidator.Validate(definition with
        {
            Npcs = [firstNpc with { DialogueVi = ["Chỉ có một câu"] }, .. definition.Npcs.Skip(1)],
        }));
        Assert.Throws<InvalidDataException>(() => CaseValidator.Validate(definition with
        {
            Evidence = [definition.Evidence[0] with { BodyVi = "  " }, .. definition.Evidence.Skip(1)],
        }));
        Assert.Throws<InvalidDataException>(() => CaseValidator.Validate(definition with
        {
            Npcs = [firstNpc with { DialogueVi = [.. firstNpc.Dialogue.Select(_ => " ")] }, .. definition.Npcs.Skip(1)],
        }));
    }

    [Fact]
    public void Validator_RejectsDuplicateMissingReferenceBadAnswerAndUnlockCycle()
    {
        var definition = LoadCase("1");
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

    private static CaseDefinition LoadCase(string version)
    {
        var path = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory,
            $"../../../../../services/api/Content/Cases/swapped-report.v{version}.json"));
        return JsonSerializer.Deserialize<CaseDefinition>(File.ReadAllText(path),
            new JsonSerializerOptions(JsonSerializerDefaults.Web))!;
    }
}
