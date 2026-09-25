namespace OfficeCaseFiles.Api.Domain;

public static class ConclusionRules
{
    public static bool IsReady(CaseDefinition caseFile, IReadOnlySet<string> collected,
        IReadOnlySet<string> passedQuestionIds)
    {
        return caseFile.Questions.All(item => passedQuestionIds.Contains(item.Id)) &&
            caseFile.Solution.AcceptedEvidenceSets.Any(set => set.All(collected.Contains));
    }

    public static int ReadingScore(CaseDefinition caseFile,
        IReadOnlySet<string> firstTryCorrectQuestionIds)
    {
        if (caseFile.Questions.Count == 0) return 0;
        var firstTry = caseFile.Questions.Count(item => firstTryCorrectQuestionIds.Contains(item.Id));
        return (int)Math.Round(firstTry * 100d / caseFile.Questions.Count,
            MidpointRounding.AwayFromZero);
    }

    public static int InvestigationScore(SolutionDefinition solution, string suspectId,
        string reasonId, IReadOnlyCollection<string> evidenceIds)
    {
        var selected = evidenceIds.ToHashSet(StringComparer.Ordinal);
        var evidenceScore = solution.AcceptedEvidenceSets
            .Select(set => set.Distinct(StringComparer.Ordinal).Count(selected.Contains) * 20)
            .DefaultIfEmpty(0).Max();
        return (suspectId == solution.SuspectId ? 40 : 0) +
            (reasonId == solution.ReasonId ? 20 : 0) + Math.Min(40, evidenceScore);
    }
}
