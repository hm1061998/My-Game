# BUFFER — Fixes, final persistence pass and code_complete

Status: awaiting_approval
Owner: Claude
Depends on: T12
Plan version: PROJECT_PLAN.md 1.4 (§9 row BUFFER, §9.3), BUFFER plan 1.0
Approval: pending user approval of plan 1.0
Lifecycle phase: define
Workflow step: plan drafted; no code changed

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

Pending approval. Baseline `5fb512c`, clean tree.

## Improvement review

- Result: pending
- Observation/evidence: pending
- Mechanism changed or no-change reason: pending
- Validation: pending
- Follow-up trigger: pending
