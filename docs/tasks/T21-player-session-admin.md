# T21 — Player and session administration

Status: approved
Owner: unassigned
Depends on: T18, stable T07/T08 progress contracts
Plan version: PROJECT_PLAN.md 1.4, Admin plan 1.0 / A05
Approval: user's 2026-09-25 approval of Admin plan 1.0; implementation deferred by the same instruction
Lifecycle phase: build
Workflow step: approved; no coding until a later user instruction and dependencies pass

## Outcome and success signal

A support administrator can find a player or guest session, inspect an allowlisted progress summary and perform narrowly defined account/session support actions with confirmation, reason, invariants and complete audit evidence.

## Scope

- Add bounded, indexed, paginated player/session queries with filters for normalized identity fields, status, case/version and activity range.
- Player detail: masked profile, account state, linked sessions and permitted timestamps. Session detail: case/version, progress summary, checkpoint, evidence/question completion, conclusion/score summary and assistance state.
- Add named commands for suspend/reactivate account and revoke/expire authenticated or play sessions. Define effect on active requests and recovery.
- Add data-export and deletion/anonymization request records/status workflow; actual irreversible production processing remains governed by T26 runbook and separate authority.
- Every mutation requires capability, explicit reason, confirmation, expected revision where relevant and append-only audit.
- Excluded: impersonation, password/reset token display, generic EF CRUD, arbitrary score/progress edits, hard deletion from browser, bulk messaging.

## Acceptance and verification

- Search pagination/order/filtering is stable, bounded and index-supported; nonexistent/unauthorized targets do not leak identity.
- Lists mask sensitive fields and never return password hashes, security stamps, raw cookies/tokens, private answer keys or unrestricted raw event data.
- Suspension/reactivation and revocation enforce domain behavior in the player app, are retry-safe, and record actor/reason/result.
- Concurrent/stale support commands cannot silently overwrite status. Database failure leaves player/session and audit outcome consistent.
- Export/deletion request state is visible and recoverable; no irreversible production delete is triggered by this task.
- Browser: search/filter/paginate → detail → confirm support action → observe player behavior; forbidden capability; network failure/retry; keyboard/table accessibility.
- Final gates: query/command domain and SQLite/API tests, admin/client tests/builds, authorization/audit matrix, performance sample for list queries, E2E and repository verification.

## Handoff

Pending. Next action: implement read-only bounded queries before any support mutation.

## Improvement review

- Result: pending
- Observation/evidence: pending
- Mechanism changed or no-change reason: pending
- Validation: pending
- Follow-up trigger: pending
