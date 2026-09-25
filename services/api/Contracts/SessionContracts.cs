using OfficeCaseFiles.Api.Domain;

namespace OfficeCaseFiles.Api.Contracts;

public sealed record StartSessionRequest(string CaseId);
public sealed record CheckpointRequest(string CheckpointId, int Revision);
public sealed record EncounterRequest(string Outcome, bool AssistanceUsed, Guid SubmissionId, int Revision);

public sealed record SessionResponse(
    string CaseId, string CaseVersion, string Status, int Revision,
    string MapId, string CheckpointId, DateTimeOffset ExpiresAtUtc,
    bool EncounterCleared, int EncounterFailures, bool AssistanceUsed)
{
    public static SessionResponse From(PlaySession session) => new(
        session.CaseId, session.CaseVersion, session.Status, session.Revision,
        session.World.MapId, session.World.CheckpointId, session.ExpiresAtUtc,
        session.World.EncounterCleared, session.World.EncounterFailures, session.World.AssistanceUsed);
}
