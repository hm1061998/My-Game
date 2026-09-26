# BUFFER — Fixes, final persistence pass and code_complete

Status: in_progress
Owner: Claude
Depends on: T12
Plan version: PROJECT_PLAN.md 1.4 (§9 row BUFFER, §9.3), BUFFER plan 1.0
Approval: user approved plan 1.0 on 2026-09-26 with “duyệt kế hoạch”
Lifecycle phase: verify
Workflow step: fixes, fresh-clone rehearsal, persistence pass and final scripts done; awaiting user confirmation to record code_complete

## Outcome and success signal

The MVP passes the whole local process from a fresh clone with no blocking defect, and the `code_complete` milestone is recorded with evidence. Success signal (§9 row BUFFER): no defect blocks play or MVP data transfer; a fresh clone following only README/runbook installs, migrates, plays, backs up/restores and passes every gate.

## Evidence and decisions

Verified facts (baseline `5fb512c`):

- Open non-blocking items from T12's readiness table: (1) `npm --prefix apps/web run e2e` hard-codes `pwsh`, absent here; (2) Vite warns about the lazily loaded ~1.40 MB Phaser chunk; (3) OpenAPI → TypeScript codegen is open.
- The default shell resolves **Node 22.22.2 / npm 10.9.7**, while `package.json` requires Node 24 / npm 11.12.1 (source of the known engine warning). The verified gates ran through the approved Node 24 path; a fresh clone in the default shell has never been tried.
- No clean-clone rehearsal of README + runbook has been recorded.

Proposed decisions (accepted on approval):

1. **E2E entry point:** add `scripts/run-e2e.mjs`, a tiny Node launcher that runs `scripts/e2e.ps1` with `pwsh` when present and otherwise Windows PowerShell 5.1 (the proven path), forwarding arguments and exit code. `npm run e2e` points to it; README/memory updated.
2. **Phaser chunk warning:** accept. The chunk is already lazy-loaded behind `GameCanvas` and was measured at +6.7 kB over T10 with 60 fps. Set `build.chunkSizeWarningLimit` to 1600 kB with a comment naming the Phaser chunk, so new unexpected growth still warns. Real splitting is deferred to the graphics big update.
3. **OpenAPI → TypeScript codegen:** stays deferred (runtime response validation remains). Recorded as a known non-blocking item, not a code_complete blocker.
4. **Node version:** document the required Node 24 activation clearly (README "Kiểm tra môi trường") and make the fresh-clone rehearsal run with it; no change to engines.

## Scope

Included:

- The three fixes/decisions above plus README/runbook/memory wording.
- **Fresh-clone rehearsal:** `git clone` the pushed `origin/main` into a temporary folder, then follow README + `docs/runbooks/local.md` only: `npm ci`, locked restore, `--migrate`, run API + web, visible browser playthrough, `--export` → clean DB `--import` → resume, `verify.ps1`, headed E2E. Every doc gap found is fixed in the main repo and re-checked.
- **Final persistence pass (visible browser, main repo):** full manual case from a new session through conclusion and review, reload mid-way, API restart, replay; blur/pause and Escape focus; offline API recovery.
- Record `code_complete` in `docs/memory/current.md` and this task **only after** the user confirms the evidence.

Excluded: new features, graphics upgrade, codegen implementation, admin T15–T26, Docker/GitHub/CI (they begin after code_complete under their own approved plan), deployment, publishing.

Affected files: `scripts/run-e2e.mjs` (new), `apps/web/package.json`, `apps/web/vite.config.ts`, `README.md`, `docs/runbooks/local.md`, `docs/tasks/index.md`, this task, `docs/memory/current.md`. Any product defect found is fixed within existing behavior; if a fix needs new scope, stop and re-plan.

Risks: the rehearsal clone downloads npm/NuGet packages (network, time) — uses the temp folder and is deleted afterwards; the repo's `.tools/dotnet` SDK is not in a fresh clone, so the rehearsal follows README's SDK instructions or points to the existing SDK and records which.

## Acceptance and verification

- `npm --prefix apps/web run e2e` works on this machine without `pwsh`.
- `npm run build` shows no chunk warning at the current size; a test build with an artificially larger chunk still warns (checked once, not committed).
- Fresh-clone rehearsal passes end to end with only documented steps; gaps fixed.
- Visible-browser persistence pass passes; no blocking defect open.
- Scripts on the final revision: `verify.ps1`, headed E2E via the new launcher, `check-agent-docs.ps1`, `git diff --check`, clean status.
- User confirms, then `code_complete` is recorded.

## Handoff

Baseline `5fb512c`; plan `6bcf08e`; fixes `45c756c`.

Fixes and decisions applied:

- `scripts/run-e2e.mjs` + `apps/web/package.json`: `npm --prefix apps/web run e2e` uses `pwsh` if present, else Windows PowerShell 5.1, runs from the repo root and forwards arguments/exit code. Verified: 4/4 via npm on Node 24.15.0 / npm 11.12.1.
- `apps/web/vite.config.ts`: `chunkSizeWarningLimit: 1600` with a comment; build no longer warns at ~1.40 MB; a temporary 1000 kB limit still warned (checked, reverted).
- OpenAPI → TypeScript codegen stays deferred (non-blocking).
- README: Node 24 activation for nvm-windows (global `nvm use` or per-terminal PATH), no `pwsh` requirement, SDK installer invoked with `powershell`; runbook/memory use the npm E2E entry point.

Fresh-clone rehearsal (`git clone` of `origin/main` at `45c756c` into the session scratchpad; deleted afterwards; the repo's `.tools/dotnet` SDK reused instead of re-downloading, as README allows): `npm ci` (0 vulnerabilities), locked restore, `--migrate`, API + web, visible-browser playthrough, `--export` → new `restored.db` `--migrate` + `--import` (all 10 tables incl. conclusion and review), `verify.ps1` pass (30 web / 11 API tests, 0 warnings), headed E2E 4/4. Doc gap found and fixed: README said the default DB is created at the repo root; it is `services/api/office-case-files.db`.

Visible-browser persistence pass (on the clone): new session; E01 collected with real keyboard movement and `E`; notebook stamp; Q01 wrong then right in the UI; Escape → canvas focus; reload → identical facts (revision 3); window blur → "Đã tạm dừng", Escape → "Đang khám phá"; remaining steps prepared through the app's API modules (L010), then the conclusion submitted through the evidence board (2/2, confirmation) → 67/100 and 100/100; review R01 correct (1/5); API stopped → two ⚠ offline alerts, one canvas; restore into a clean DB and API restart → result 67/100 and review 1/5 persist; "Chơi lại vụ án" → revision 0 at the lobby, one canvas.

Final scripts on the main repo: `verify.ps1` pass (28 task files, 30 web tests, build without chunk warning, .NET 0 warnings/0 errors, 11/11 API tests); `npm --prefix apps/web run e2e` 4/4; `check-agent-docs.ps1`, `git diff --check` pass.

Open items (non-blocking, accepted): OpenAPI TypeScript codegen; Phaser chunk splitting deferred to the graphics big update (`docs/design/graphics-technology-options.md`); the default shell here still resolves Node 22 until the developer switches (documented).

No blocking defect is open. Next action: on user confirmation, record `code_complete` here and in `docs/memory/current.md`; then Docker/GitHub packaging (P01–P03) needs its own approved plan.

## Improvement review

- Result: none (new)
- Observation/evidence: the fresh-clone rehearsal found one real doc error (DB location) that no in-repo check caught; L008 preflight (stop dev servers before `verify.ps1`) and L010 were applied without incident.
- Mechanism changed or no-change reason: fixed the README; no new rule — rehearsing from a clean clone before a milestone is already required by this plan and PROJECT_PLAN §9.3.
- Validation: rehearsal and final scripts above.
- Follow-up trigger: repeat the fresh-clone rehearsal before `delivery_complete`.
