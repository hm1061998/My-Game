# T12 — Storage export/import round-trip and local runbook

Status: awaiting_approval
Owner: Claude
Depends on: T10, T11
Plan version: PROJECT_PLAN.md 1.4 (§5.8, §9 row T12), T12 plan 1.0
Approval: pending user approval of plan 1.0
Lifecycle phase: define
Workflow step: plan drafted; no code changed

## Outcome and success signal

A developer can export all local game progress to one versioned, checksummed file, import it into a clean SQLite database, and continue playing in the browser exactly where they left off, following a written local runbook.

Success signal (PROJECT_PLAN §5.8 platform acceptance and §9 row T12): export → import into an empty, migrated SQLite database restores identical state (sessions, revisions, evidence, first answers, attempts, encounter state, conclusion/scores, review progress and all idempotency receipts); a resent request after import does not add score or attempts; the browser resumes the same session after the API restarts on the imported database.

## Evidence and decisions

Verified facts (baseline `cc3975a`):

- Storage is `GameDbContext` with 10 tables: `PlaySessions`, `EvidenceProgress`, `InteractionReceipts`, `QuestionProgress`, `AnswerReceipts`, `EncounterReceipts`, `Conclusions`, `ConclusionReceipts`, `ReviewProgress`, `ReviewReceipts`; all child tables key on `SessionId` with cascade FKs. Five SQLite migrations, latest `20260925133247_ConclusionReview`.
- `PlaySessions` stores only the SHA-256 `TokenHash`; the raw token exists only in the HttpOnly cookie. So an export keeps resume ability without holding a raw secret.
- `Program.cs` already handles a one-shot `--migrate` switch before `app.Run()`; there is no export/import path, runbook folder or backup guidance.
- Existing integration tests create isolated SQLite files through `WebApplicationFactory<Program>` with `ConnectionStrings:Game`.

Proposed decisions (accepted on approval):

- **Port and adapter:** add `IProgressPortability` (export/import) in `Application` with a provider-neutral `ProgressExport` record set; the SQLite implementation lives in `Infrastructure/Sqlite`. No EF types leave Infrastructure.
- **Format `exportVersion 1`:** UTF-8 JSON with a manifest (`exportVersion`, `schemaVersion` = latest applied migration id, `sourceProvider: "sqlite"`, `exportedAtUtc`, `caseVersions`, per-table `count` and SHA-256 `checksum` over canonical row JSON) and a `tables` section. Timestamps ISO-8601 UTC. No connection strings, file paths, raw tokens or host URLs.
- **CLI switches** on the API host, mirroring `--migrate`: `--export <file>` (read-only, refuses to overwrite an existing file) and `--import <file>` (target must be fully migrated and empty, otherwise fail; verifies manifest version, schema version and every checksum before writing; single transaction, FK order; re-verifies counts after commit).
- **Privacy:** export files contain token hashes and learner answers, so they are private backups. They are written only where the user points, and `*.export.json` plus `exports/` are added to `.gitignore`.
- **Runbook:** `docs/runbooks/local.md` covering setup, migrate, run, backup/export, restore/import into a clean database, reset, and troubleshooting; README links to it.
- **code_complete:** T12 prepares a readiness report section; the gate itself is recorded after the BUFFER task, as planned.

Assumptions: single-user local SQLite; exports are taken with the API stopped (the runbook says so; the command also works on a live WAL database but a stopped API gives a consistent snapshot). No second provider is claimed.

## Scope

Included:

- `services/api/Application/IProgressPortability.cs` (port + export records), `services/api/Infrastructure/Sqlite/SqliteProgressPortability.cs`, a canonical-JSON/checksum helper, DI registration, and `--export`/`--import` handling in `Program.cs`.
- Tests in `tests/OfficeCaseFiles.Api.Tests/ProgressPortabilityTests.cs`: full-journey round-trip equality across all 10 tables; resume by cookie on a new host over the imported DB with the same revision; resent answer/interaction/conclusion submission after import is idempotent; import rejects a non-empty target, an unmigrated target, an unknown `exportVersion`, a mismatched `schemaVersion` and a tampered checksum; export refuses to overwrite and contains no raw token.
- `docs/runbooks/local.md`, README link and troubleshooting, `.gitignore`, task/index/memory, and a code_complete readiness section in this task.

Excluded: web UI for export/import, admin features, PostgreSQL or any second provider, merge/partial import, scheduled backups, Docker/CI, deployment, publishing. No schema migration is expected; if one becomes necessary, stop and re-plan.

Risks and controls: silent data loss on import (all-or-nothing transaction plus pre/post count and checksum checks); overwriting a real database (import refuses non-empty targets; runbook uses a new file path); leaking backups (gitignore plus runbook warning).

## Acceptance and verification

Browser scenario (visible):

1. On a scratch database A, play in the visible browser: collect E01, answer Q01 wrong then right, save the meeting checkpoint and get detected once.
2. Stop the API; `--export` A to a file; `--migrate` a new empty database B; `--import` into B.
3. Start the API on B; reload the same browser tab: it resumes the same session, revision, checkpoint (meeting zone), detection count, evidence and Q01 attempts/explanation.
4. Continue to a conclusion and result on B; reload after an API restart and confirm persistence.
5. Failure path: importing into B again is refused with a clear message and B is unchanged.

Scripts on the final revision: API restore/build/test (new tests included), `scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe`, headed `scripts/e2e.ps1` (regression, via Windows PowerShell), `scripts/check-agent-docs.ps1`, `git diff --check`.

## Handoff

Pending approval. Baseline `cc3975a`, clean tree.

## Improvement review

- Result: pending
- Observation/evidence: pending
- Mechanism changed or no-change reason: pending
- Validation: pending
- Follow-up trigger: pending
