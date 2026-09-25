# T26 — Admin handoff and release readiness

Status: approved
Owner: unassigned
Depends on: T25, T11/T12
Plan version: PROJECT_PLAN.md 1.4, Admin plan 1.0 / A10
Approval: user's 2026-09-25 approval of Admin plan 1.0; implementation deferred by the same instruction
Lifecycle phase: release-readiness → handoff
Workflow step: approved; cannot begin until verification dependencies pass

## Outcome and success signal

A new maintainer can run, verify, back up and safely operate the local admin/player system from durable documentation, with known limitations and rollback/recovery paths stated accurately. The result is release-ready locally but not deployed.

## Scope

- Consolidate setup/run/verify instructions for API, player SPA and admin SPA; document explicit local admin bootstrap without default credentials.
- Create runbooks for database/content backup and restore, draft/published export/import, account/session revocation, analytics reconciliation/rebuild if applicable, player data export and deletion/anonymization request handling.
- Record migration order, compatibility, rollback constraints and a rehearsal on isolated data. Never use/delete the developer database as a test fixture.
- Produce versioned test report, privacy/security checklist, data inventory/retention status, performance sample, known limitations and one concrete next action.
- Run the mandatory improvement review; promote only evidence-backed reusable knowledge and validate changed rules/skills/scripts.
- Integrate admin into later Docker/CI planning only after applicable `code_complete` gates. Mark remote CI, email, SSO, credentials, hosting and production behavior unverified unless separately authorized and observed.
- Excluded: push, deployment, publishing images, creating external accounts/services, using production secrets/data or mutating production.

## Acceptance and verification

- Fresh maintainer follows docs to restore dependencies, configure non-secret local settings, create a local admin explicitly, run all services and complete smoke flows.
- Backup/restore and content export/import round trips on isolated data preserve IDs, versions, ownership, revisions, receipts and required audit/analytics semantics; checksums/counts are reconciled.
- Player data export/anonymization workflow matches T16 policy and does not break approved aggregate statistics or expose credentials.
- Runbooks clearly separate recoverable archive/revoke from irreversible deletion and require exact target verification/authority.
- T25 evidence and every task status are current; failures/not-run/remote-unverified items are not reported as passed.
- Browser confirmation and final scripts run on the handoff revision unless a documentation-only post-verification edit is justified and checked.
- `scripts/check-agent-docs.ps1`, internal-link review and `git diff --check` pass; task first, then current memory are updated.

## Handoff

Pending. Next action: after T25 passes, assemble runbooks from actual commands and observed behavior, not proposed instructions.

## Improvement review

- Result: pending
- Observation/evidence: pending
- Mechanism changed or no-change reason: pending
- Validation: pending
- Follow-up trigger: pending
