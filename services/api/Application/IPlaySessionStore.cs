using OfficeCaseFiles.Api.Domain;

namespace OfficeCaseFiles.Api.Application;

public enum CheckpointSaveStatus { Saved, AlreadyApplied, Conflict, NotFound, Invalid }

public sealed record CheckpointSaveResult(CheckpointSaveStatus Status, PlaySession? Session);

public enum EvidenceCollectStatus { Collected, AlreadyApplied, AlreadyCollected, Conflict, NotFound }

public sealed record EvidenceCollectResult(EvidenceCollectStatus Status, int Revision);

public sealed record QuestionProgress(string QuestionId, string FirstChoiceId, int Attempts, bool IsPassed);

public enum AnswerSaveStatus { Saved, AlreadyApplied, AlreadyPassed, Conflict, NotFound }

public sealed record AnswerSaveResult(AnswerSaveStatus Status, int Revision, int Attempts = 0,
    bool IsCorrect = false, bool IsPassed = false, bool FirstTryCorrect = false);

public enum EncounterSaveStatus { Saved, AlreadyApplied, AlreadyCleared, Invalid, Conflict, NotFound }

public sealed record EncounterSaveResult(EncounterSaveStatus Status, PlaySession? Session);

public sealed record ConclusionRecord(string SuspectId, string ReasonId,
    IReadOnlyList<string> EvidenceIds, int ReadingScore, int InvestigationScore,
    int Revision, DateTimeOffset SubmittedAtUtc);
public enum ConclusionSaveStatus { Saved, AlreadyApplied, AlreadyCompleted, Conflict, NotFound }
public sealed record ConclusionSaveResult(ConclusionSaveStatus Status, ConclusionRecord? Conclusion, int Revision);

public sealed record ReviewProgress(string ReviewItemId, int Attempts, bool IsCompleted, DateTimeOffset? CompletedAtUtc);
public enum ReviewSaveStatus { Saved, AlreadyApplied, AlreadyCompleted, Conflict, NotFound, Locked }
public sealed record ReviewSaveResult(ReviewSaveStatus Status, int Revision, int Attempts = 0,
    bool IsCorrect = false, bool IsCompleted = false);

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
    Task<IReadOnlyList<QuestionProgress>> ListQuestionProgressAsync(Guid sessionId, CancellationToken cancellationToken);
    Task<AnswerSaveResult> SaveAnswerAsync(string tokenHash, int expectedRevision, Guid submissionId,
        string questionId, string choiceId, bool isCorrect, DateTimeOffset now, CancellationToken cancellationToken);
    Task<EncounterSaveResult> SaveEncounterAsync(string tokenHash, int expectedRevision,
        Guid submissionId, string outcome, bool assistanceUsed, DateTimeOffset now,
        CancellationToken cancellationToken);
    Task<ConclusionRecord?> GetConclusionAsync(Guid sessionId, CancellationToken cancellationToken);
    Task<ConclusionSaveResult> SaveConclusionAsync(string tokenHash, int expectedRevision,
        Guid submissionId, string suspectId, string reasonId, IReadOnlyList<string> evidenceIds,
        int readingScore, int investigationScore, DateTimeOffset now, CancellationToken cancellationToken);
    Task<IReadOnlyList<ReviewProgress>> ListReviewProgressAsync(Guid sessionId, CancellationToken cancellationToken);
    Task<ReviewSaveResult> SaveReviewAsync(string tokenHash, int expectedRevision, Guid submissionId,
        string reviewItemId, string choiceId, bool isCorrect, DateTimeOffset now,
        CancellationToken cancellationToken);
}
