# T18 — Player identity and guest-save linking

Status: approved
Owner: unassigned
Depends on: T16, T17
Plan version: PROJECT_PLAN.md 1.4, Admin plan 1.0 / A02
Approval: user's 2026-09-25 approval of Admin plan 1.0; implementation deferred by the same instruction
Lifecycle phase: build
Workflow step: approved; no coding until a later user instruction and dependencies pass

## Outcome and success signal

A guest can keep playing anonymously or create/sign into a player account and claim the current save exactly once. Registered players can resume linked sessions, while account suspension or session revocation is enforced without exposing or transferring another player's progress.

## Scope

- Add player Identity/profile model and nullable `PlayerId` ownership on play sessions through an explicit migration.
- Add register/login/logout/current-player, session listing and guest-claim application use cases/endpoints plus minimal React client account UI.
- Claim requires both authenticated player proof and the current valid guest-session cookie; it is atomic, idempotent and refuses sessions already owned by another player.
- Define email/display fields, normalization, verification/reset placeholder states, lockout, suspension, session revocation and account-status behavior from T16.
- Preserve existing guest cookies, anonymous gameplay and active session version/revision semantics.
- Excluded: social login/SSO, production email delivery, admin player search/actions (T21), impersonation, cross-account merging and arbitrary progress transfer.

## Acceptance and verification

- Existing anonymous sessions survive migration/restart and can continue without registration.
- Guest → account claim retains case/version, checkpoint, evidence, answers, revision and receipts; retry does not duplicate or reset progress.
- Claiming another player's session, replaying an invalid cookie or racing two accounts fails atomically without disclosure or partial ownership.
- Registered login/resume/logout/revocation and suspended-account behavior are explicit and covered by API/integration tests using real isolated SQLite.
- Password/hash/token/security-stamp values never enter API responses, frontend state logs or application logs.
- Browser: create guest progress → register/login → claim → reload/resume; second-device/account conflict; logout/login recovery; suspended/revoked state. Confirm canvas focus/pause behavior is unaffected.
- Final gates: client lint/typecheck/tests/build, .NET domain/API/integration tests, migration drift, contract checks, full verification and `git diff --check`.

## Handoff

Pending. Next action: implement schema and claim domain semantics before account-management UI expansion.

## Improvement review

- Result: pending
- Observation/evidence: pending
- Mechanism changed or no-change reason: pending
- Validation: pending
- Follow-up trigger: pending
