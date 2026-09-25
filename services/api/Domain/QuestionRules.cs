namespace OfficeCaseFiles.Api.Domain;

public static class QuestionRules
{
    public static bool IsAvailable(QuestionDefinition question, IReadOnlySet<string> collectedEvidence) =>
        question.SourceEvidenceIds.All(collectedEvidence.Contains);

    public static bool IsEvidenceAvailable(
        EvidenceDefinition evidence, IReadOnlySet<string> collectedEvidence,
        IReadOnlySet<string> passedQuestions) =>
        !evidence.RequiresEncounter &&
        evidence.SourceEvidenceIds.All(collectedEvidence.Contains) &&
        evidence.RequiredCorrectQuestionIds.All(passedQuestions.Contains);
}
