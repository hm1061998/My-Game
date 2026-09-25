using System.Text.RegularExpressions;
using OfficeCaseFiles.Api.Domain;

namespace OfficeCaseFiles.Api.Infrastructure.Content;

public static partial class CaseValidator
{
    public static void Validate(CaseDefinition caseFile)
    {
        Require(caseFile.SchemaVersion == 1, "Unsupported case schemaVersion.");
        Require(!string.IsNullOrWhiteSpace(caseFile.Id) && !string.IsNullOrWhiteSpace(caseFile.Version), "Case ID/version is required.");
        Require(!string.IsNullOrWhiteSpace(caseFile.Title) && !string.IsNullOrWhiteSpace(caseFile.Brief), "Case title/brief is required.");

        var evidence = Unique(caseFile.Evidence.Select(item => item.Id), "evidence");
        var npcs = Unique(caseFile.Npcs.Select(item => item.Id), "NPC");
        var glossary = Unique(caseFile.Glossary.Select(item => item.Id), "glossary");
        var questions = Unique(caseFile.Questions.Select(item => item.Id), "question");
        Unique(caseFile.Interactions.Select(item => item.Id), "interaction");

        Require(caseFile.Evidence.Count > 0 && caseFile.Interactions.Count > 0, "Case needs evidence and interactions.");
        foreach (var item in caseFile.Evidence)
        {
            var wordCount = WordPattern().Matches(item.Body).Count;
            Require(wordCount is >= 25 and <= 60, $"Evidence {item.Id} must contain 25–60 words; found {wordCount}.");
            Require(item.GlossaryIds.All(glossary.Contains), $"Evidence {item.Id} references missing glossary.");
            Require(item.SourceEvidenceIds.All(evidence.Contains), $"Evidence {item.Id} references missing evidence.");
            Require(item.RequiredCorrectQuestionIds.All(questions.Contains), $"Evidence {item.Id} references missing question.");
        }

        foreach (var npc in caseFile.Npcs)
            Require(npc.Dialogue.Count > 0 && npc.Dialogue.All(line => !string.IsNullOrWhiteSpace(line)), $"NPC {npc.Id} has empty dialogue.");

        foreach (var question in caseFile.Questions)
        {
            Require(question.SourceEvidenceIds.Count > 0 && question.SourceEvidenceIds.All(evidence.Contains), $"Question {question.Id} has invalid source evidence.");
            var choices = Unique(question.Choices.Select(choice => choice.Id), $"choice for {question.Id}");
            Require(choices.Count >= 2 && choices.Contains(question.CorrectChoiceId), $"Question {question.Id} needs exactly one valid correct choice.");
            Require(question.Choices.All(choice => !string.IsNullOrWhiteSpace(choice.Text)), $"Question {question.Id} has empty choice text.");
        }

        foreach (var interaction in caseFile.Interactions)
        {
            Require(interaction.Radius is >= 24 and <= 130 && interaction.X is >= 64 and <= 1536 && interaction.Y is >= 142 and <= 938,
                $"Interaction {interaction.Id} has invalid world position/radius.");
            Require(!string.IsNullOrWhiteSpace(interaction.LabelVi), $"Interaction {interaction.Id} has no label.");
            Require(interaction.Kind switch
            {
                "evidence" => evidence.Contains(interaction.TargetId) && interaction.EvidenceId is null,
                "npc" => npcs.Contains(interaction.TargetId) &&
                    (interaction.EvidenceId is null || evidence.Contains(interaction.EvidenceId)),
                _ => false,
            }, $"Interaction {interaction.Id} has an invalid target.");
        }

        var suspects = Unique(caseFile.ConclusionOptions.Suspects.Select(item => item.Id), "conclusion suspect");
        var reasons = Unique(caseFile.ConclusionOptions.Reasons.Select(item => item.Id), "conclusion reason");
        Require(caseFile.ConclusionOptions.Suspects.Count >= 2 && caseFile.ConclusionOptions.Reasons.Count >= 2,
            "Conclusion needs at least two suspect and reason choices.");
        Require(caseFile.ConclusionOptions.Suspects.All(item => !string.IsNullOrWhiteSpace(item.Label)) &&
            caseFile.ConclusionOptions.Reasons.All(item => !string.IsNullOrWhiteSpace(item.Label)),
            "Conclusion choices need labels.");

        var reviewIds = Unique(caseFile.ReviewItems.Select(item => item.Id), "review item");
        Require(reviewIds.Count == 5, "Case needs exactly five review items.");
        foreach (var item in caseFile.ReviewItems)
        {
            var choices = Unique(item.Choices.Select(choice => choice.Id), $"review choice for {item.Id}");
            Require(choices.Count >= 2 && choices.Contains(item.CorrectChoiceId),
                $"Review item {item.Id} needs one valid correct choice.");
            Require(!string.IsNullOrWhiteSpace(item.Prompt) && !string.IsNullOrWhiteSpace(item.Explanation) &&
                item.Choices.All(choice => !string.IsNullOrWhiteSpace(choice.Text)),
                $"Review item {item.Id} has empty content.");
        }

        Require(npcs.Contains(caseFile.Solution.SuspectId) && suspects.Contains(caseFile.Solution.SuspectId),
            "Solution suspect is missing.");
        Require(reasons.Contains(caseFile.Solution.ReasonId), "Solution reason is missing.");
        Require(caseFile.Solution.AcceptedEvidenceSets.Count > 0 &&
            caseFile.Solution.AcceptedEvidenceSets.All(set => set.Count == 2 && set.Distinct(StringComparer.Ordinal).Count() == 2 && set.All(evidence.Contains)),
            "Solution evidence set must contain two distinct existing IDs.");

        var sourceByQuestion = caseFile.Questions.ToDictionary(item => item.Id, item => item.SourceEvidenceIds);
        var dependencies = caseFile.Evidence.ToDictionary(item => item.Id, item =>
            item.SourceEvidenceIds.Concat(item.RequiredCorrectQuestionIds.SelectMany(id => sourceByQuestion[id])).ToArray());
        var visiting = new HashSet<string>(StringComparer.Ordinal);
        var visited = new HashSet<string>(StringComparer.Ordinal);
        foreach (var id in evidence) Visit(id);

        void Visit(string id)
        {
            if (visited.Contains(id)) return;
            Require(visiting.Add(id), $"Evidence unlock cycle contains {id}.");
            foreach (var dependency in dependencies[id]) Visit(dependency);
            visiting.Remove(id);
            visited.Add(id);
        }
    }

    private static HashSet<string> Unique(IEnumerable<string> ids, string kind)
    {
        var values = ids.ToArray();
        Require(values.All(id => !string.IsNullOrWhiteSpace(id)) &&
            values.Distinct(StringComparer.Ordinal).Count() == values.Length, $"Duplicate or empty {kind} ID.");
        return new HashSet<string>(values, StringComparer.Ordinal);
    }

    private static void Require(bool condition, string message)
    {
        if (!condition) throw new InvalidDataException(message);
    }

    [GeneratedRegex(@"\b[A-Za-z][A-Za-z'-]*\b")]
    private static partial Regex WordPattern();
}
