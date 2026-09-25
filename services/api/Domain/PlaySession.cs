namespace OfficeCaseFiles.Api.Domain;

public sealed record WorldProgress(string MapId, string CheckpointId,
    bool EncounterCleared = false, int EncounterFailures = 0, bool AssistanceUsed = false);

public sealed record PlaySession(
    Guid Id,
    string CaseId,
    string CaseVersion,
    string Status,
    int Revision,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc,
    DateTimeOffset ExpiresAtUtc,
    WorldProgress World);

public static class SessionRules
{
    public const string CaseId = "swapped-report";
    public const string CaseVersion = "1";
    public const string MapId = "office-floor-08";
    public const string EntryCheckpoint = "office-entry";
    public const string MeetingCheckpoint = "meeting-zone";

    public static bool IsKnownCase(string caseId) => caseId == CaseId;

    public static bool CanAdvance(string currentCheckpoint, string nextCheckpoint) =>
        currentCheckpoint == EntryCheckpoint && nextCheckpoint == MeetingCheckpoint;
}
