# T24 — Administrator roles, audit, and safe settings

Status: approved
Owner: unassigned
Depends on: T17, T21
Plan version: PROJECT_PLAN.md 1.4, Admin plan 1.0 / A08
Approval: user's 2026-09-25 approval of Admin plan 1.0; implementation deferred by the same instruction
Lifecycle phase: build
Workflow step: approved; no coding until a later user instruction and dependencies pass

## Outcome and success signal

A super administrator can manage capability assignments and review trustworthy audit history, while operators can view safe health/settings without exposing secrets or turning the portal into a production shell.

## Scope

- Add administrator list/detail and capability assignment/revocation governed by the T16 matrix; protect the last viable super-admin from accidental lockout.
- Add bounded audit search by actor, capability/action, target, result, trace ID and time range; audit entries are append-only through application APIs.
- Display read-only API/content/storage/analytics health with non-secret diagnostics and clear freshness.
- Implement only allowlisted typed non-secret settings approved by T16, with validation and explicit activation/restart semantics. If no safe mutable setting is justified, ship read-only configuration status and record that decision.
- Require re-authentication/confirmation and reason for high-risk role mutations; log success and failure without credentials/private payload dumps.
- Excluded: editing connection strings/secrets/provider/environment variables, executing migrations/shell commands, viewing raw logs, deployment controls and arbitrary feature flags.

## Acceptance and verification

- Support/content admins cannot grant roles or access super-admin endpoints; player/guest identities remain denied.
- Concurrent role changes and last-super-admin removal are handled safely; revoked access stops working at the documented boundary.
- Audit filters/pagination are stable and cannot be edited/deleted through the portal; sensitive strings never appear in entries or exports.
- Health failures are visible but do not disclose filesystem paths, SQL, tokens or configuration secrets.
- Invalid setting changes are rejected atomically; activation behavior and rollback are explicit and audited.
- Browser: role grant/revoke with confirmation → permission reflected; forbidden attempt; audit lookup by trace ID; health failure/recovery; keyboard navigation.
- Final gates: capability matrix tests, audit/setting SQLite/API tests, admin tests/build, sensitive-data scan of responses/log fixtures, E2E and full verification.

## Handoff

Pending. Next action: implement capability-management invariants and audit queries before any mutable setting.

## Improvement review

- Result: pending
- Observation/evidence: pending
- Mechanism changed or no-change reason: pending
- Validation: pending
- Follow-up trigger: pending
