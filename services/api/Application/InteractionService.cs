using OfficeCaseFiles.Api.Domain;

namespace OfficeCaseFiles.Api.Application;

public enum InteractionStatus
{
    Dialogue, Collected, AlreadyCollected, Locked, Invalid, SessionMissing, CaseVersionMissing, NotFound, Conflict
}

public sealed record InteractionResult(
    InteractionStatus Status, int Revision, string? Title = null,
    IReadOnlyList<string>? Dialogue = null, string? EvidenceId = null, bool StatementLocked = false);

public sealed record NotebookData(CaseDefinition Case, IReadOnlyList<EvidenceDefinition> Collected);

public enum NotebookAccessStatus { Found, SessionMissing, CaseVersionMissing }

public sealed record NotebookAccessResult(NotebookAccessStatus Status, NotebookData? Data = null);

public enum EvidenceAccessStatus { Found, Locked, NotFound, SessionMissing, CaseVersionMissing }

public sealed record EvidenceAccessResult(EvidenceAccessStatus Status, CaseDefinition? Case = null, EvidenceDefinition? Evidence = null);

public sealed class InteractionService(
    SessionService sessions, IPlaySessionStore store, ICaseCatalog catalog, TimeProvider clock)
{
    public async Task<InteractionResult> InteractAsync(
        string token, string interactionId, Guid submissionId, int expectedRevision,
        CancellationToken cancellationToken)
    {
        if (submissionId == Guid.Empty || expectedRevision < 0)
            return new InteractionResult(InteractionStatus.Invalid, 0);
        var session = await sessions.ResumeAsync(token, cancellationToken);
        if (session is null) return new InteractionResult(InteractionStatus.SessionMissing, 0);
        var definition = catalog.Get(session.CaseId, session.CaseVersion);
        if (definition is null) return new InteractionResult(InteractionStatus.CaseVersionMissing, session.Revision);
        var interaction = definition.Interactions.SingleOrDefault(item => item.Id == interactionId);
        if (interaction is null) return new InteractionResult(InteractionStatus.NotFound, session.Revision);

        var collectedIds = await store.ListEvidenceIdsAsync(session.Id, cancellationToken);
        var collected = collectedIds.ToHashSet(StringComparer.Ordinal);
        var evidenceId = interaction.Kind == "evidence" ? interaction.TargetId : interaction.EvidenceId;
        var npc = interaction.Kind == "npc" ? definition.Npcs.Single(item => item.Id == interaction.TargetId) : null;
        if (evidenceId is null)
            return new InteractionResult(InteractionStatus.Dialogue, session.Revision, npc?.Name, npc?.Dialogue);

        var evidence = definition.Evidence.Single(item => item.Id == evidenceId);
        var unlocked = !evidence.RequiresEncounter && evidence.RequiredCorrectQuestionIds.Count == 0 &&
            evidence.SourceEvidenceIds.All(collected.Contains);
        if (!unlocked)
            return npc is not null
                ? new InteractionResult(InteractionStatus.Dialogue, session.Revision, npc.Name, npc.Dialogue,
                    StatementLocked: true)
                : new InteractionResult(InteractionStatus.Locked, session.Revision);

        var saved = await store.CollectEvidenceAsync(SessionToken.Hash(token), expectedRevision,
            submissionId, interactionId, evidenceId, clock.GetUtcNow(), cancellationToken);
        var status = saved.Status switch
        {
            EvidenceCollectStatus.Collected or EvidenceCollectStatus.AlreadyApplied => InteractionStatus.Collected,
            EvidenceCollectStatus.AlreadyCollected => InteractionStatus.AlreadyCollected,
            EvidenceCollectStatus.NotFound => InteractionStatus.SessionMissing,
            _ => InteractionStatus.Conflict,
        };
        return new InteractionResult(status, saved.Revision, npc?.Name ?? evidence.Title, npc?.Dialogue,
            status is InteractionStatus.Collected or InteractionStatus.AlreadyCollected ? evidence.Id : null);
    }

    public async Task<NotebookAccessResult> GetNotebookAsync(string token, CancellationToken cancellationToken)
    {
        var session = await sessions.ResumeAsync(token, cancellationToken);
        if (session is null) return new NotebookAccessResult(NotebookAccessStatus.SessionMissing);
        var definition = catalog.Get(session.CaseId, session.CaseVersion);
        if (definition is null) return new NotebookAccessResult(NotebookAccessStatus.CaseVersionMissing);
        var ids = await store.ListEvidenceIdsAsync(session.Id, cancellationToken);
        return new NotebookAccessResult(NotebookAccessStatus.Found, new NotebookData(definition,
            definition.Evidence.Where(item => ids.Contains(item.Id)).ToArray()));
    }

    public async Task<EvidenceAccessResult> GetEvidenceAsync(
        string token, string evidenceId, CancellationToken cancellationToken)
    {
        var session = await sessions.ResumeAsync(token, cancellationToken);
        if (session is null) return new EvidenceAccessResult(EvidenceAccessStatus.SessionMissing);
        var definition = catalog.Get(session.CaseId, session.CaseVersion);
        if (definition is null) return new EvidenceAccessResult(EvidenceAccessStatus.CaseVersionMissing);
        var evidence = definition.Evidence.SingleOrDefault(item => item.Id == evidenceId);
        if (evidence is null) return new EvidenceAccessResult(EvidenceAccessStatus.NotFound);
        var ids = await store.ListEvidenceIdsAsync(session.Id, cancellationToken);
        return ids.Contains(evidenceId)
            ? new EvidenceAccessResult(EvidenceAccessStatus.Found, definition, evidence)
            : new EvidenceAccessResult(EvidenceAccessStatus.Locked);
    }
}
