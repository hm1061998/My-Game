# T12 — Storage export/import round-trip and local runbook

Status: done
Owner: Claude
Depends on: T10, T11
Plan version: PROJECT_PLAN.md 1.4 (§5.8, §9 row T12), T12 plan 1.0
Approval: user approved plan 1.0 on 2026-09-26 with “duyệt kế hoạch”
Lifecycle phase: handoff
Workflow step: complete — implementation, tests, visible browser round-trip, runbook and final scripts passed

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

Baseline `cc3975a`; plan commit `e0069d3`.

Changed:

- `services/api/Application/ProgressPortability.cs`: `IProgressPortability` port, `ExportManifest`/`ProgressExport` records (rows as JSON objects, no provider types), `ProgressExportFormat` (canonical SHA-256 checksums, serialize/deserialize, validation of version, table set, counts and checksums).
- `services/api/Infrastructure/Sqlite/SqliteProgressPortability.cs`: one registry of the 10 tables in FK order with stable sort keys; export inside a read transaction; import refuses invalid files, pending migrations, schema mismatch and non-empty targets, stages all rows in one transaction and re-verifies counts/checksums before commit.
- `services/api/Program.cs`: DI registration; `--export <file>` (refuses overwrite) and `--import <file>` one-shot commands after the pending-migration check; refusals print one clear line and exit 1.
- `tests/OfficeCaseFiles.Api.Tests/ProgressPortabilityTests.cs` (2 tests): real API journey → export → import into clean DB → all 10 tables identical → cookie resume at revision 5 / meeting-zone / 1 detection → resent wrong answer keeps attempts 1 and resent detection keeps failures 1 / revision 5; second import TargetNotEmpty; export has no raw token or connection string. Rejects tampered checksum, `exportVersion 2`, other `schemaVersion`, unmigrated target; target stays empty.
- `docs/runbooks/local.md` (setup, run, export, import, refusal table, reset, handoff checks), README link, `.gitignore` (`*.export.json`, `exports/`).
- No migration, no `GameDbContext` model change (so EF drift check not needed and not run).

Visible browser round-trip (Claude in-app browser, scratch databases in the session scratchpad; the user's `office-case-files.db` untouched):

1. DB A: new session, E01, Q01 wrong then right, meeting checkpoint, one detection → revision 5. Gameplay input stalled while the Browser pane was hidden, so this state was prepared through the app's own API modules (L010).
2. API stopped; `--export` wrote 1 session / 1 evidence / 1 interaction receipt / 1 question / 2 answer receipts / 1 encounter receipt; a second `--export` to the same file was refused; `--migrate` DB B; `--import` "verified and committed" with matching counts.
3. API on B, same tab reloaded: "Mốc đã lưu: Khu họp", "Máy quét: 1 lần bị phát hiện", "Phiên bản tiến độ: 5"; scene rendered the player at the meeting checkpoint with the scanner active.
4. Continued on B to conclusion: reading 67 / investigation 100 — the 67 proves the imported first wrong Q01 answer drove first-try scoring. API restarted, reload → result still 67/100.
5. Re-import into B refused: `Import refused (TargetNotEmpty)`, exit 1, B unchanged.

Scripts on the final revision: `verify.ps1` pass (28 task files, npm ci/lint/typecheck, 30 web tests, build, .NET 0 warnings/0 errors, 11/11 API tests); headed `scripts/e2e.ps1` 4/4; `check-agent-docs.ps1` and `git diff --check` pass.

Limitations: export while the API runs is possible but the runbook requires stopping it for a consistent snapshot; no second provider is claimed ("sẵn ranh giới mở rộng, chưa xác nhận provider thứ hai"); no web UI for backup.

### code_complete readiness (for the BUFFER task)

| Criterion (PROJECT_PLAN §9.3) | State |
| --- | --- |
| T01–T12 complete with browser evidence and scripts | met (T12 here; T13, T14, T27, T11 also done) |
| Full case playable, persistence across reload/restart/replay | met (E2E journey + T12 restart) |
| Clean-database restore of correct state | met (T12 test + browser round-trip) |
| README and local runbook | met (`README.md`, `docs/runbooks/local.md`) |
| No known blocking defect | none open; known non-blocking items: ~1.40 MB Phaser chunk warning, `npm run e2e` needs `pwsh`, OpenAPI TypeScript codegen open |

Next action: BUFFER — triage the non-blocking items, run a final persistence pass, then record `code_complete` in memory with user confirmation.

## Improvement review

- Result: none (new); L010 reused
- Observation/evidence: the hidden Browser pane throttled Phaser input, so gameplay steps were replaced by the app's API modules — the verified L010 technique covered it without weakening evidence, because resume, rendering and scoring were still observed in the visible browser.
- Mechanism changed or no-change reason: no new lesson; the round-trip procedure is now encoded as tests and a runbook.
- Validation: tests, CLI refusals and browser steps above.
- Follow-up trigger: add a runner-level export/import smoke to `verify.ps1` if a schema migration lands before `code_complete`.
