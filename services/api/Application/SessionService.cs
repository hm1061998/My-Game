using System.Security.Cryptography;
using OfficeCaseFiles.Api.Domain;

namespace OfficeCaseFiles.Api.Application;

public sealed class SessionService(IPlaySessionStore store, ICaseCatalog catalog, TimeProvider clock)
{
    private static readonly TimeSpan Lifetime = TimeSpan.FromDays(30);

    public async Task<(string Token, PlaySession Session)?> StartAsync(string caseId, CancellationToken cancellationToken)
    {
        var caseFile = catalog.GetCurrent(caseId);
        if (caseFile is null) return null;

        var now = clock.GetUtcNow();
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        var session = new PlaySession(
            Guid.NewGuid(), caseFile.Id, caseFile.Version, "Investigating", 0,
            now, now, now.Add(Lifetime),
            new WorldProgress(SessionRules.MapId, SessionRules.EntryCheckpoint));
        await store.CreateAsync(session, SessionToken.Hash(token), cancellationToken);
        return (token, session);
    }

    public Task<PlaySession?> ResumeAsync(string token, CancellationToken cancellationToken) =>
        store.GetByTokenHashAsync(SessionToken.Hash(token), clock.GetUtcNow(), cancellationToken);

    public async Task<CheckpointSaveResult> SaveCheckpointAsync(
        string token, int expectedRevision, string checkpointId, CancellationToken cancellationToken)
    {
        if (expectedRevision < 0 || checkpointId != SessionRules.MeetingCheckpoint)
            return new CheckpointSaveResult(CheckpointSaveStatus.Invalid, null);
        return await store.SaveCheckpointAsync(
            SessionToken.Hash(token), expectedRevision, checkpointId, clock.GetUtcNow(), cancellationToken);
    }

    public Task<EncounterSaveResult> SaveEncounterAsync(string token, int expectedRevision,
        Guid submissionId, string outcome, bool assistanceUsed, CancellationToken cancellationToken)
    {
        if (expectedRevision < 0 || submissionId == Guid.Empty ||
            outcome is not ("detected" or "cleared") || (outcome == "detected" && assistanceUsed))
            return Task.FromResult(new EncounterSaveResult(EncounterSaveStatus.Invalid, null));
        return store.SaveEncounterAsync(SessionToken.Hash(token), expectedRevision, submissionId,
            outcome, assistanceUsed, clock.GetUtcNow(), cancellationToken);
    }
}
