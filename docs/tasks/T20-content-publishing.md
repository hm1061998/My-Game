# T20 — Learning rules, preview, and immutable publishing

Status: approved
Owner: unassigned
Depends on: T19, stable T06 question/unlock contracts, stable T08 conclusion/review contracts
Plan version: PROJECT_PLAN.md 1.4, Admin plan 1.0 / A04
Approval: user's 2026-09-25 approval of Admin plan 1.0; implementation deferred by the same instruction
Lifecycle phase: build
Workflow step: approved; no coding until a later user instruction and dependencies pass

## Outcome and success signal

A content administrator can complete learning rules and private solution data, preview a draft in isolation, and atomically publish an immutable version. Old sessions continue on their pinned version and new sessions use the selected published version.

## Scope

- Add editors for questions/choices, correct answers, feedback, unlock rules, solution, review items and checkpoint/quest references.
- Reuse one Domain/Application validator for authoring, startup/CI and publish; UI only renders stable validation paths/messages.
- Add isolated preview authorization/context that cannot appear in public lists, create real progress or mutate a player session.
- Publish with expected draft revision and idempotency key in one transaction: validate complete definition, allocate/verify case version, write immutable snapshot/checksum, update draft state and append audit.
- Add explicit case-version activation/selection for new sessions. Rollback means activating or republishing a new version, never mutating history.
- Preserve server-only answer/solution boundaries in public/OpenAPI/player DTOs and logs.
- Excluded: collaborative approval workflow, scheduled publish, hard deletion, visual map/asset editor and deployment.

## Acceptance and verification

- Duplicate/missing references, zero/multiple correct answers, unlock cycles, unreachable evidence and invalid solution sets block publish with field/section errors.
- Preview is visibly unpublished, authorized, isolated and absent from player case discovery; preview failure leaves draft intact.
- Duplicate publish retry is idempotent; stale revision, version collision or simulated database failure creates no partial visible version.
- Published snapshot checksum/content is immutable. An old session resumes its old version after a newer activation; a new session receives the new active version.
- Unauthorized/player requests cannot obtain draft bodies, correct choices, solution timeline or preview tokens/context.
- Browser: invalid draft → fix → preview → confirm publish → new player session; resume old session; network failure/retry and stale conflict.
- Final gates: admin/player builds and tests, content validator, publish/API/SQLite integration tests, contract leak tests, migration drift, E2E and full verification.

## Handoff

Pending. Next action: lock T06/T08 contracts before implementing private rule editors or publish storage.

## Improvement review

- Result: pending
- Observation/evidence: pending
- Mechanism changed or no-change reason: pending
- Validation: pending
- Follow-up trigger: pending
