using OfficeCaseFiles.Api.Domain;

namespace OfficeCaseFiles.Api.Application;

public enum CheckpointSaveStatus { Saved, AlreadyApplied, Conflict, NotFound, Invalid }

public sealed record CheckpointSaveResult(CheckpointSaveStatus Status, PlaySession? Session);

public interface IPlaySessionStore
{
    Task CreateAsync(PlaySession session, string tokenHash, CancellationToken cancellationToken);
    Task<PlaySession?> GetByTokenHashAsync(string tokenHash, DateTimeOffset now, CancellationToken cancellationToken);
    Task<CheckpointSaveResult> SaveCheckpointAsync(
        string tokenHash, int expectedRevision, string checkpointId, DateTimeOffset now,
        CancellationToken cancellationToken);
}
