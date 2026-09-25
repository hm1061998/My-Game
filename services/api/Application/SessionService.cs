using System.Security.Cryptography;
using System.Text;
using OfficeCaseFiles.Api.Domain;

namespace OfficeCaseFiles.Api.Application;

public sealed class SessionService(IPlaySessionStore store, TimeProvider clock)
{
    private static readonly TimeSpan Lifetime = TimeSpan.FromDays(30);

    public async Task<(string Token, PlaySession Session)?> StartAsync(string caseId, CancellationToken cancellationToken)
    {
        if (!SessionRules.IsKnownCase(caseId)) return null;

        var now = clock.GetUtcNow();
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        var session = new PlaySession(
            Guid.NewGuid(), SessionRules.CaseId, SessionRules.CaseVersion, "Investigating", 0,
            now, now, now.Add(Lifetime),
            new WorldProgress(SessionRules.MapId, SessionRules.EntryCheckpoint));
        await store.CreateAsync(session, HashToken(token), cancellationToken);
        return (token, session);
    }

    public Task<PlaySession?> ResumeAsync(string token, CancellationToken cancellationToken) =>
        store.GetByTokenHashAsync(HashToken(token), clock.GetUtcNow(), cancellationToken);

    public async Task<CheckpointSaveResult> SaveCheckpointAsync(
        string token, int expectedRevision, string checkpointId, CancellationToken cancellationToken)
    {
        if (expectedRevision < 0 || checkpointId != SessionRules.MeetingCheckpoint)
            return new CheckpointSaveResult(CheckpointSaveStatus.Invalid, null);
        return await store.SaveCheckpointAsync(
            HashToken(token), expectedRevision, checkpointId, clock.GetUtcNow(), cancellationToken);
    }

    private static string HashToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
