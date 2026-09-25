using OfficeCaseFiles.Api.Domain;

namespace OfficeCaseFiles.Api.Application;

public enum CheckpointSaveStatus { Saved, AlreadyApplied, Conflict, NotFound, Invalid }

public sealed record CheckpointSaveResult(CheckpointSaveStatus Status, PlaySession? Session);

public enum EvidenceCollectStatus { Collected, AlreadyApplied, AlreadyCollected, Conflict, NotFound }

public sealed record EvidenceCollectResult(EvidenceCollectStatus Status, int Revision);

public interface IPlaySessionStore
{
    Task CreateAsync(PlaySession session, string tokenHash, CancellationToken cancellationToken);
    Task<PlaySession?> GetByTokenHashAsync(string tokenHash, DateTimeOffset now, CancellationToken cancellationToken);
    Task<CheckpointSaveResult> SaveCheckpointAsync(
        string tokenHash, int expectedRevision, string checkpointId, DateTimeOffset now,
        CancellationToken cancellationToken);
    Task<IReadOnlyList<string>> ListEvidenceIdsAsync(Guid sessionId, CancellationToken cancellationToken);
    Task<EvidenceCollectResult> CollectEvidenceAsync(
        string tokenHash, int expectedRevision, Guid submissionId, string interactionId,
        string evidenceId, DateTimeOffset now, CancellationToken cancellationToken);
}
