using OfficeCaseFiles.Api.Domain;

namespace OfficeCaseFiles.Api.Application;

public interface ICaseCatalog
{
    IReadOnlyList<CaseDefinition> List();
    CaseDefinition? Get(string caseId, string caseVersion);
    CaseDefinition? GetCurrent(string caseId);
}
