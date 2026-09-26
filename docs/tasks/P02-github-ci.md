# P02 — GitHub workflow, PR template and branch-check guidance

Status: done
Owner: Claude
Depends on: P01
Plan version: PROJECT_PLAN.md 1.4 (§9.3 row P02, §11.5), P02 plan 1.0
Approval: user approved plan 1.0 on 2026-09-26 with “duyệt”
Lifecycle phase: handoff
Workflow step: complete — CI green on GitHub (run 36213362487)

## Outcome and success signal

Every push and pull request to `main` runs the same checks the developer runs locally, plus a Docker build and container smoke test, with least-privilege permissions and pinned actions. Success signal (§9.3 row P02): valid workflow YAML; CI runs the repository scripts and builds the image; the run URL is recorded if the remote run can be observed.

## Evidence and decisions

Verified facts (baseline `3e1ec08`):

- `origin` is `https://github.com/hm1061998/My-Game.git`, default branch `main`; pushing there is a standing user instruction. Repository visibility/settings are unknown and will not be changed.
- No `.github/` directory exists. GitHub CLI (`gh`) is not installed, so remote runs can only be observed through the public GitHub API/web page if the repository is public, or by the user.
- `scripts/verify.ps1` and `scripts/e2e.ps1` are PowerShell; `e2e.ps1` uses `Start-Process -WindowStyle Hidden` (Windows-only) and a headed Chromium. Docker smoke needs a Linux runner.
- Current official action tags: `actions/checkout` v7, `actions/setup-node` v7, `actions/setup-dotnet` v6, `actions/upload-artifact` v7 (to be pinned by commit SHA).

Proposed decisions (accepted on approval):

- **`.github/workflows/ci.yml`**, triggers: `push` and `pull_request` on `main`, plus `workflow_dispatch`; top-level `permissions: contents: read`; `concurrency` cancels superseded runs of the same ref; job timeouts.
  - **`verify` (windows-latest):** Node 24.15.0 (npm cache keyed on the lockfile), .NET SDK from `global.json`, then `scripts/verify.ps1` unchanged (npm ci, lint, typecheck, unit tests, build, locked restore, .NET build/tests, agent-doc check).
  - **`e2e` (windows-latest, needs `verify`):** install Playwright Chromium, run `npm --prefix apps/web run e2e` (headed on the runner's desktop session, isolated temp DB). On failure, upload `playwright-report/` and `test-results/` (screenshots/traces from the isolated test DB, no real data) with 7-day retention.
  - **`docker` (ubuntu-latest):** `docker build`, `docker compose up -d`, wait for `healthy`, curl `/`, `/api/v1/health`, a deep link, and assert 404 for `/Content/Cases/swapped-report.v1.json`, `/appsettings.json`, `/office-case-files.db`; then `docker compose down -v` (CI's own throwaway volume only). No image push, no registry login, no secrets.
  - All third-party actions pinned to full commit SHAs with the version tag in a comment. No `pull_request_target`; fork PRs get no secrets (none exist).
- **`.github/pull_request_template.md`:** problem/behavior, scope and approval reference, browser evidence, scripts run, schema/storage change and rollback.
- **Branch-check guidance** in `docs/runbooks/github.md`: which checks to mark required (`verify`, `e2e`, `docker`), blocking force-pushes on `main`, and not requiring a second reviewer for a solo maintainer. These are instructions for the user to apply in GitHub settings; the agent does not change repository settings.
- **Local validation:** YAML parsed locally; `actionlint` run via its official Docker image if available (no new project dependency).

## Scope

Included: `.github/workflows/ci.yml`, `.github/pull_request_template.md`, `docs/runbooks/github.md`, README link, task/index/memory. Pushing these to `origin/main` (standing instruction) will start the first CI run.

Excluded: changing repository settings, visibility, branch protection or secrets; publishing images or releases; deployment; Dependabot/renovate (can be proposed later); P03 retest.

Risks and controls: Windows runner minutes cost more than Linux — only `verify`/`e2e` use Windows, Docker smoke uses Linux; headed Chromium on the Windows runner may behave differently from local — if it fails for an environmental reason, fix within the workflow or record it rather than weakening the test; the first remote run may be unobservable without `gh` — record "remote not verified" with the reason.

## Acceptance and verification

- Workflow and template YAML/Markdown valid locally (parser + actionlint when available); every `uses:` is a 40-char SHA.
- Docker smoke steps rehearsed locally with the same commands against the P01 image.
- After push: first run observed via the public Actions page/API (record run URL and job results), or recorded as not verifiable with the reason and a request for the user to share the run link.
- Local gates unchanged and passing: `verify.ps1`, `npm --prefix apps/web run e2e`, `check-agent-docs.ps1`, `git diff --check`.
- Browser: N/A for new product behavior (CI configuration only); the E2E job itself runs the browser journey.

## Handoff

Baseline `3e1ec08`; plan `41b3268`; first workflow `0bbb7e8`; green at `6a2f8f7`.

Delivered: `.github/workflows/ci.yml` (verify + e2e on windows-latest, docker on ubuntu-latest; `contents: read`; concurrency; timeouts; all actions pinned to SHAs — checkout v7.0.1, setup-node v7.0.0, setup-dotnet v6.0.0, upload-artifact v7.0.1), `scripts/docker-smoke.sh` (shared by CI and local), `.github/pull_request_template.md`, `docs/runbooks/github.md`, README link. `actionlint` (official image) reports no issues.

Remote verification (repository is public; runs observed through the public Actions pages/annotations — job logs need sign-in, `gh` not installed):

| Run | Commit | Result | Finding / fix |
| --- | --- | --- | --- |
| #1 36206432456 | 0bbb7e8 | verify ✗, docker ✓ | verify failure without readable log; did not recur (cause unknown — user can read the log when signed in) |
| #2–#3 | 73e7a56, 0e0bc24 | verify ✓, docker ✓, e2e ✗ | failures surfaced as public `::error` annotations; E2E movement budget (24 presses) too small on a GPU-less runner |
| #4 | 521c778 | e2e ✗ | runner ~29 fps, journey exceeded 180 s; CI-only 480 s timeout; failure artifact 460 MB → screenshots + error-context only |
| #5–#6 | 360f693, 169f076 | e2e ✗ | overshoot/oscillation around targets → halve hold time on direction flip, min 50 ms hold, 3 stuck presses = blocked |
| #7–#9 | 7ee0bd4, 3f02e7a, a20db42 | e2e ✗ | fixed 1.8 s walk into the scanner → wait for the detection dialog; route clipped the meeting table → move x first |
| #10–#11 | c56c728, 563efd5 | e2e ✗ | 300 ms dodge window missed by polling → E2E-only `dodgeCount`; 24 px tolerance entered the scanner edge (y≥509) → lane y=495 ±8 |
| **#12 36213362487** | **6a2f8f7** | **all green** | verify 1m32s, docker 52s, e2e 8m2s (total 9m43s) |

Product code changed only by the E2E-only `dodgeCount` in the scene snapshot (the snapshot exists only in the E2E build); gameplay, collision and scanner rules are unchanged. Local gates on the final revision: `verify.ps1` pass, `npm --prefix apps/web run e2e` 4/4, `bash scripts/docker-smoke.sh` pass.

Not done (out of scope, for the user): branch protection/rulesets per `docs/runbooks/github.md`; base-image digest pinning; the `ubuntu-latest` → Ubuntu 26 migration notice (October 2026) needs no action now.

Next action: P03 — retest the packaged build end to end and write the final delivery evidence toward `delivery_complete`; needs its own plan and approval.

## Improvement review

- Result: candidate (L012)
- Observation/evidence: 11 red runs came from one root cause — the E2E journey relied on fixed hold times, a single-press "blocked" check and a wide 24 px position tolerance that happened to work at 60 fps and failed at ~29 fps on a GPU-less runner. Each fix replaced a timing assumption with a waited-for outcome or a damped, tighter control loop.
- Mechanism changed or no-change reason: recorded as L012; the fixes live in `apps/web/e2e/critical-journey.spec.ts`; public failure annotations in `ci.yml` made remote diagnosis possible without sign-in.
- Validation: CI run 36213362487 green; local 4/4.
- Follow-up trigger: promote to an E2E rule if another spec adds fixed waits or positional routes.
