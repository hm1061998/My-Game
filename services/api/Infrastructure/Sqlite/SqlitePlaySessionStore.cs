using Microsoft.EntityFrameworkCore;
using OfficeCaseFiles.Api.Application;
using OfficeCaseFiles.Api.Domain;

namespace OfficeCaseFiles.Api.Infrastructure.Sqlite;

public sealed class SqlitePlaySessionStore(GameDbContext db) : IPlaySessionStore
{
    public async Task CreateAsync(PlaySession session, string tokenHash, CancellationToken cancellationToken)
    {
        db.Sessions.Add(new SessionRow
        {
            Id = session.Id,
            TokenHash = tokenHash,
            CaseId = session.CaseId,
            CaseVersion = session.CaseVersion,
            Status = session.Status,
            Revision = session.Revision,
            CreatedAtUtc = session.CreatedAtUtc.UtcDateTime,
            UpdatedAtUtc = session.UpdatedAtUtc.UtcDateTime,
            ExpiresAtUtc = session.ExpiresAtUtc.UtcDateTime,
            MapId = session.World.MapId,
            CheckpointId = session.World.CheckpointId,
        });
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<PlaySession?> GetByTokenHashAsync(
        string tokenHash, DateTimeOffset now, CancellationToken cancellationToken)
    {
        var refreshedExpiry = now.AddDays(30).UtcDateTime;
        var touched = await db.Sessions
            .Where(item => item.TokenHash == tokenHash && item.ExpiresAtUtc > now.UtcDateTime)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(item => item.ExpiresAtUtc, refreshedExpiry), cancellationToken);
        if (touched == 0) return null;
        var row = await db.Sessions.AsNoTracking()
            .SingleAsync(item => item.TokenHash == tokenHash, cancellationToken);
        return ToDomain(row);
    }

    public async Task<CheckpointSaveResult> SaveCheckpointAsync(
        string tokenHash, int expectedRevision, string checkpointId, DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var updated = await db.Sessions
            .Where(row => row.TokenHash == tokenHash && row.ExpiresAtUtc > now.UtcDateTime &&
                row.Revision == expectedRevision && row.CheckpointId == SessionRules.EntryCheckpoint &&
                checkpointId == SessionRules.MeetingCheckpoint)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(row => row.CheckpointId, checkpointId)
                .SetProperty(row => row.Revision, row => row.Revision + 1)
                .SetProperty(row => row.UpdatedAtUtc, now.UtcDateTime)
                .SetProperty(row => row.ExpiresAtUtc, now.AddDays(30).UtcDateTime), cancellationToken);

        var session = await GetByTokenHashAsync(tokenHash, now, cancellationToken);
        if (session is null) return new CheckpointSaveResult(CheckpointSaveStatus.NotFound, null);
        if (updated == 1) return new CheckpointSaveResult(CheckpointSaveStatus.Saved, session);
        if (session.World.CheckpointId == checkpointId)
            return new CheckpointSaveResult(CheckpointSaveStatus.AlreadyApplied, session);
        return new CheckpointSaveResult(CheckpointSaveStatus.Conflict, session);
    }

    private static PlaySession ToDomain(SessionRow row) => new(
        row.Id, row.CaseId, row.CaseVersion, row.Status, row.Revision,
        new DateTimeOffset(row.CreatedAtUtc, TimeSpan.Zero),
        new DateTimeOffset(row.UpdatedAtUtc, TimeSpan.Zero),
        new DateTimeOffset(row.ExpiresAtUtc, TimeSpan.Zero),
        new WorldProgress(row.MapId, row.CheckpointId));
}
