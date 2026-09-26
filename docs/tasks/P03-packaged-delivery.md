# P03 — Packaged retest and final delivery evidence

Status: awaiting_approval
Owner: Codex
Depends on: P01, P02, code_complete
Plan version: PROJECT_PLAN.md 1.4 (§9.3, §11.4–11.5), P03 plan 1.0
Approval: pending user approval of this exact local retest scope
Lifecycle phase: define/design
Workflow step: handoff restored; evidence baseline checked; plan ready for review; no package, data volume or repository setting changed

## Outcome and success signal

Close the packaging stage with current, reproducible evidence that the exact pushed revision builds and runs as a production Docker Compose package, serves the game safely, preserves a real session across container recreation, and passes the repository's local and remote CI gates. Record `delivery_complete` only when P01, P02 and this P03 evidence are all current.

The user can follow the README/runbook, open the packaged game in a visible browser, complete the main case, recreate the app container without losing progress, and inspect a final delivery report that distinguishes verified checks from user-owned repository settings and future hosting work.

## Entry evidence and current state

- `code_complete` was recorded on 2026-09-26 in `docs/tasks/BUFFER-code-complete.md`.
- P01 Docker/Compose implementation and visible container playthrough are complete. It also verified private-file 404s, secure session cookie, recreate/down-up persistence, backup/restore, image contents and a clean-clone build.
- P02 CI configuration is complete. The recorded all-green remote run is GitHub Actions run `36213362487` on commit `6a2f8f7`; verify, headed Chromium E2E and Docker smoke all passed. P03 must verify the CI run for its final pushed implementation revision, not reuse the older run as current evidence.
- Current checkout is clean `main` at `3a41b19`, synchronized with `origin/main`; this is the documentation/review baseline for P03.
- Read-only Docker preflight on 2026-09-26 found Docker client/server 29.3.1, no running container, the developer's persistent `office-case-files_ocf-data` volume, and no listener on ports 8080, 5062 or 5173. Preserve that developer volume and all unrecognized containers/volumes.
- `scripts/docker-smoke.sh` uses the isolated Compose project `ocf-smoke`, binds host port 8080, and normally removes that project's volume on exit. Before using it, confirm no existing `ocf-smoke` container/volume and that 8080 is still free. Its `--keep` option intentionally leaves the smoke stack for the visible gameplay and recreate test.
- The user requires each completed work session to commit scoped changes and push the current branch to configured `origin`. The configured remote is `https://github.com/hm1061998/My-Game.git`; do not change GitHub settings as part of this plan.

## Scope

### Included

- Reconcile P01/P02 runbooks, current Docker/Compose files, `scripts/docker-smoke.sh`, current branch and remote CI evidence against the P03 acceptance gate.
- Build and run the production package using the isolated `ocf-smoke` Compose project and its throwaway volume. Fail closed if its named project resources pre-exist or host port 8080 is occupied; do not stop an unknown process or delete any volume to make room.
- Run smoke checks for health, SPA/deep-link routing, expected API 404s and non-disclosure of case JSON, appsettings, database and server binaries. Inspect runtime image contents and logs for the documented production boundaries and session-token leakage.
- Keep the browser visible. Start a new session, collect E01 with real keyboard input, answer Q01 in the UI, reach the meeting checkpoint, exercise scanner recovery, complete the case, and verify the result. Recreate only the P03 `app` container; reload the same visible browser and confirm the same session/progress/result survive. `docker compose down`/`up` may be used on the P03 project without `-v`; final cleanup may remove only the verified P03 throwaway volume.
- Run final `scripts/verify.ps1`, the headed E2E suite, `scripts/docker-smoke.sh`, agent-doc/privacy checks and `git diff --check` on the final implementation revision.
- Observe the GitHub Actions run associated with the final pushed revision and record commit, run URL, job conclusions and any public error annotation. If observation is unavailable, label remote CI unverified and record the reason.
- Produce `docs/quality/P03-delivery-readiness.md`, update README/runbooks only for reproduced gaps, update P03/index/current memory, and record the final delivery state and follow-up list.

### Excluded

- Publishing/pushing a container image, registry login, release creation, deployment, public hosting, HTTPS/reverse proxy, remote data or production mutation.
- Editing GitHub repository settings, branch protection/rulesets, visibility or secrets. `docs/runbooks/github.md` already assigns branch protection to the repository owner; report it as a user action if still incomplete.
- Destroying, importing into, renaming or otherwise changing `office-case-files_ocf-data`; stopping unknown containers/processes; deleting unrecognized Docker resources.
- New game features, visual redesign, API/schema/provider changes, admin implementation, P04 PostgreSQL work or unrelated dependency updates.
- Repeating the clean-clone and export/import rehearsals unless P03 discovers a concrete gap in the current P01 evidence or current README/runbook. If triggered, use a unique scratch checkout/database/volume and record the reason.

### Expected files and likely changes

- `docs/tasks/P03-packaged-delivery.md`, `docs/tasks/index.md`, `docs/memory/current.md`, `docs/quality/P03-delivery-readiness.md`.
- README/runbooks or `scripts/docker-smoke.sh` only if a reproducible documentation/test-isolation gap blocks the agreed acceptance; keep such changes minimal and within P03.
- No application runtime change is expected. If package testing exposes a product defect, fix only within the existing approved behavior, then rebuild and repeat every affected browser/script check. Stop and return to planning if the fix changes product semantics or broadens scope.

## Risks and controls

- **Developer progress loss:** the named volume `office-case-files_ocf-data` contains user progress. Only the unique, verified P03 `ocf-smoke` project volume may be removed. Never use default-project `docker compose down -v`.
- **Port/process collision:** check port 8080 and exact project resources immediately before running. If occupied or ambiguous, stop and report the owner; do not kill it or choose a different port without validating the compose mapping.
- **Browser hides package-specific defects:** test `http://127.0.0.1:8080` served by the Production container itself, not Vite. Keep the window visible through recreate/reload.
- **Stale CI evidence:** tie the run to the final implementation commit SHA; do not claim a plan-only or older run verifies later code.
- **Generated private artifacts:** use only throwaway session data; do not commit Docker exports, DB files, cookies, screenshots with private session material, logs or Playwright traces.
- **CI minutes:** a push triggers the three P02 jobs (about ten minutes in the recorded run). Run local gates first, then commit/push and observe that run once.
- **Scope confusion:** `delivery_complete` means the local container, runbooks and agreed CI evidence pass; it does not mean deployed/hosted or that branch protection has been applied.

## Acceptance and verification

### Packaged browser and persistence

- A clean P03 Compose project builds and reaches healthy state; the runtime image runs as non-root and contains no Node/.NET SDK. Web root contains only public web assets; private server case JSON remains outside `wwwroot`.
- Visible browser at `http://127.0.0.1:8080` shows the game, health is online, a fresh session uses the Secure/HttpOnly cookie without exposing it to `document.cookie`, and the core case can be played through evidence, question, checkpoint/scanner and conclusion/result.
- Expected private paths return 404 or the normal safe SPA fallback without exposing file content. API health works; unknown API route is 404; logs do not reveal session token values.
- Force-recreating the P03 app container and reloading the same visible browser retains the session, progress and submitted result. `docker compose down`/`up` without volume deletion also retains progress.
- P03 cleanup removes only resources whose names and ownership were verified as created by this run. The existing `office-case-files_ocf-data` volume is still present and unchanged.

### Scripts and GitHub

- `scripts/verify.ps1`: pass with counts/versions recorded.
- `npm --prefix apps/web run e2e`: all current headed tests pass with visible local Chromium; record FPS/frame sample where emitted.
- `bash scripts/docker-smoke.sh`: pass from a clean smoke-project preflight; expected private routes stay private.
- `scripts/check-agent-docs.ps1`, production privacy/bundle scan, and `git diff --check`: pass.
- Latest CI run for the final pushed P03 implementation SHA has `verify`, `e2e`, and `docker` green, or is explicitly marked `remote not verified` with evidence and owner follow-up.
- P03 report records branch/commit, image ID/size, Docker/Compose versions, browser, test cases, persistence/recovery, security probes, script/CI outcomes, limitations and user-owned outstanding items.
- Mark P03 and `delivery_complete` done only if all required local acceptance and P01/P02 configuration evidence are satisfied and remote CI is green when the configured repository remains observable/in-scope. Otherwise leave the exact gate incomplete and record the blocker.

### Workflow and delivery boundary

Plan approval authorizes only the P03 checks and minimal in-scope fixes above. After approval: preflight → package smoke/build → visible browser test → container-recreate recovery → fix/retest → final visible confirmation → full scripts → final CI → improvement review → update task then memory → commit scoped changes and push `main`. Stop before deploy/publish or GitHub settings changes.

## Handoff

Planning only; baseline `3a41b19`, clean and synchronized with `origin/main`. The inspected Docker daemon has no running containers. The existing `office-case-files_ocf-data` volume is user progress and is explicitly protected. No package, container, volume, source file or GitHub setting was changed during planning.

Next action: user reviews and approves P03 plan 1.0. Once approved, begin with the exact Docker resource/port preflight and run the smoke/build using only the isolated `ocf-smoke` project.

## Improvement review

- Result: none
- Observation/evidence: P01 already validated isolated Compose volumes and P03 begins with a clean Docker container inventory. No new runner failure or cross-task lesson was observed during planning.
- Mechanism changed or no-change reason: no rule, skill, script or runtime mechanism changed. The plan makes the existing volume-preservation guarantee explicit for final delivery retesting.
- Validation: compared the current memory, P01/P02/BUFFER handoffs, `PROJECT_PLAN.md` §9.3/§11.4–11.5, Docker Compose/runbook, CI workflow, Docker daemon/container/volume inventory and Git baseline.
- Follow-up trigger: reassess after P03 package/browser recovery; promote a lesson only if a repeatable failure mode appears.
