# T25 — Integrated admin browser, security, and privacy verification

Status: approved
Owner: unassigned
Depends on: T18–T24, T10
Plan version: PROJECT_PLAN.md 1.4, Admin plan 1.0 / A09
Approval: user's 2026-09-25 approval of Admin plan 1.0; implementation deferred by the same instruction
Lifecycle phase: verify
Workflow step: approved; verification cannot begin until features and dependencies reach their own final revisions

## Outcome and success signal

The complete player/admin system is proven in real browsers and automated gates across its highest-risk paths: authorization, guest ownership, immutable publishing, support actions, statistics correctness, failure recovery and sensitive-data boundaries.

## Scope

- Build deterministic E2E fixtures and browser journeys covering admin auth, player identity/claim, content authoring/publish, player support, analytics dashboard, roles/audit and game continuity.
- Run authorization/capability matrix, CSRF/origin, cookie isolation, DTO/OpenAPI leakage, log/audit redaction and common input/abuse boundary checks.
- Exercise keyboard/accessibility, responsive desktop/laptop layout, focus restoration and absence of duplicate React/Phaser instances/listeners.
- Measure representative admin query/dashboard latency and confirm gameplay remains responsive; document environment and limits rather than promise universal performance.
- Test recovery from stale revision, expired/revoked auth, network/API failure, bad import, publish transaction failure, analytics stale/failure and service restart.
- Fix/retest belongs to the owning feature task or a scoped follow-up; T25 records integrated evidence and must not mask unresolved failures.
- Excluded: penetration-test certification, production load test, remote CI/hosting verification and deployment.

## Acceptance and verification

- End-to-end: guest progress → account claim → admin support view/action → content invalid/fix/preview/publish → old session pinned/new session updated → gameplay completion → dashboard aggregates → audit trace.
- Negative matrix proves guest/player/support/content/super-admin access exactly matches T16; hidden UI alone is never evidence.
- No raw token/password/hash/reset secret/private solution leaks through public/player APIs, browser storage, logs, screenshots/traces or generated artifacts.
- Retry/race scenarios do not duplicate claims, publishes, attempts, support actions or analytics facts.
- Real browser passes at 1280px and smaller laptop width with keyboard flows, visible loading/error/conflict/recovery and clean console/network except documented expected responses.
- Final confirmation reloads/rebuilds the final revision after fixes; older evidence is not reused.
- Run all admin/player lint, typecheck, tests and builds; .NET locked restore/build/test; content/contract/docs/E2E scripts; migration drift; `git diff --check`; record command, revision, time and result.

## Handoff

Pending. Next action: create the integrated test matrix from completed task acceptances before writing E2E code.

## Improvement review

- Result: pending
- Observation/evidence: pending
- Mechanism changed or no-change reason: pending
- Validation: pending
- Follow-up trigger: pending
