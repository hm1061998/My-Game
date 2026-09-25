# Task index

| Task | Status | Owner | Depends on |
| --- | --- | --- | --- |
| [T01](T01-agent-foundation.md) | done | Codex | — |
| [T02](T02-scaffold.md) | done | Codex | T01 |
| [T03](T03-map-movement.md) map and movement | done | Codex | T02 |
| [T04](T04-storage-session.md) storage/session foundation | done | Codex | T02 |
| [T05](T05-case-npc-notebook.md) case/NPC/notebook | done | Codex | T03, T04 |
| [T06](T06-questions-unlocks.md) questions/unlocks | done | Codex | T05 |
| [T07](T07-encounter-checkpoint.md) encounter/checkpoint | done | Codex | T03, T04, T05, T06 |
| [T08](T08-conclusion-review.md) conclusion/review | done | Codex | T06, T07 |
| T09 art/HUD/focus | todo | unassigned | T08 |
| T10 browser/E2E/playtest | todo | unassigned | T08, T09 |
| T11 handoff verification | todo | unassigned | T01-T10 |
| T12 storage round-trip/local runbook | todo | unassigned | T10, T11 |
| [T13](T13-environment-readme.md) environment setup guide | done | Codex | T02 |
| [T14](T14-agent-lifecycle-improvement.md) agent lifecycle and improvement | done | Codex | T01 |
| [T15](T15-admin-console.md) system administration portal epic | approved | unassigned | T05 contract baseline; identity/analytics align with T06-T12 |
| [T16](T16-admin-decisions.md) admin decisions/privacy/architecture | approved | unassigned | T05 contract baseline |
| [T17](T17-admin-shell-auth.md) admin shell and authorization | approved | unassigned | T16 |
| [T18](T18-player-identity.md) player identity and guest linking | approved | unassigned | T16, T17 |
| [T19](T19-case-authoring.md) case authoring foundation | approved | unassigned | T05, T16, T17 |
| [T20](T20-content-publishing.md) rules, preview and immutable publish | approved | unassigned | T19, T06/T08 contracts |
| [T21](T21-player-session-admin.md) player/session administration | approved | unassigned | T18, T07/T08 progress contracts |
| [T22](T22-analytics-read-model.md) analytics vocabulary and read model | approved | unassigned | T16, T06-T08 event semantics |
| [T23](T23-admin-dashboard.md) dashboard and reports | approved | unassigned | T22 |
| [T24](T24-admin-governance.md) roles, audit and safe settings | approved | unassigned | T17, T21 |
| [T25](T25-admin-integrated-verification.md) integrated admin verification | approved | unassigned | T18-T24, T10 |
| [T26](T26-admin-handoff.md) admin handoff and release readiness | approved | unassigned | T25, T11/T12 |
