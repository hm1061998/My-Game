# T10 — Browser gameplay, E2E and playtest

Status: done
Owner: Codex
Depends on: T08, T09
Plan version: PROJECT_PLAN.md 1.4, T10 implementation 1.0
Approval: user approved implementation plan 1.0 on 2026-09-25 with “duyệt kế hoạch”
Lifecycle phase: handoff complete
Workflow step: implementation, visible browser verification, scripts and completion evidence passed

## Outcome and success signal

Prove that the complete MVP case can be played through the real React, Phaser, ASP.NET Core and SQLite stack without getting stuck, losing a checkpoint, duplicating a canvas/input owner or corrupting progression after reload/retry. Leave a repeatable headed Playwright suite, an isolated local runner and a structured playtest/performance report that later tasks can reuse without touching the developer database.

The exit gate is one automated headed Chromium journey plus one visible manual confirmation on the final revision. Both use a real API and temporary SQLite database and cover spawn → evidence/question retry → checkpoint/scanner retry → conclusion/review → reload → replay. The report must record layout, keyboard/focus, console/network, progression, persistence and an environment-qualified performance sample. All repository gates must pass.

## Entry evidence and proposed decisions

### Verified facts

- Baseline `c7e71d7` is clean and synchronized with `origin/main`; T01–T09, T13 and T14 are complete.
- The current frontend has 18 focused tests but no committed Playwright dependency, configuration, E2E suite or E2E command. The only npm project and lockfile are under `apps/web`.
- T05–T09 supplied visible-browser evidence for individual slices. T10 consolidates the whole case into a repeatable regression path; it does not replace visible inspection of the canvas.
- The production frontend must not receive solutions, accepted evidence sets, raw session tokens or a command hook that bypasses movement/progression. The session cookie remains HttpOnly.
- The developer SQLite file may contain valuable local progress and must not be deleted or reused by tests. Existing `*.db`, Playwright reports and test results are Git ignored.
- The user requires every browser preview/test to be visible. The Codex in-app browser currently fails with `windows sandbox failed: helper_unknown_error`; T09 verified a visible Chrome fallback.
- Playwright supports multiple managed web servers, headed browser runs, version-matched browser binaries and failure-retained traces. Chromium installation is a separate explicit setup step.

### Decisions included in approval

- Add `@playwright/test` as a pinned dev dependency in the existing `apps/web` npm project and update only its lockfile. Install/use Playwright Chromium, not a second JavaScript workspace or a machine-specific executable path.
- Keep E2E configuration and specs under `apps/web/e2e` so module resolution uses the existing package and lockfile. This intentionally differs from the aspirational `tests/e2e` tree until the repository has a root JavaScript workspace.
- Run Chromium headed (`headless: false`) with one worker and no retries locally. Keep screenshots and traces only on failure so artifacts do not accumulate or expose case/session data after successful runs.
- Add a root PowerShell runner that creates and validates an exact ignored temporary directory/database, migrates it, starts the real API and Vite on dedicated test ports, runs Playwright, then stops only its owned processes and removes only its exact temporary database artifacts. It must fail if the test ports are already occupied rather than attach to unknown services.
- Prefer accessible roles/text and real keyboard input. A read-only, E2E-build-only position/scene observability hook is allowed only if route timing proves flaky; it may expose coordinates/readiness but must not move the player, submit answers, reveal private content or exist in the production build.
- Keep E2E answers and expected resolution evidence in test code/server-side fixtures only; scan the production bundle to prove they are absent. Do not add solution data to React state, DOM, local/session storage, query strings, screenshots or traces.
- Measure and report startup/readiness, selected API timings, requestAnimationFrame cadence/long stalls during a representative movement sample, and lazy Phaser chunk size. Treat the numbers as an environment-qualified sample, not a universal hardware promise; sustained freezes, input loss or obvious regressions are blockers.

## Scope

### Included

- Add Playwright configuration, a headed Chromium project, semantic helpers and deterministic test-data/session setup around the real public application flow.
- Add `scripts/e2e.ps1` (or the smallest equivalent runner) with a configurable .NET command, dedicated ports, exact temporary SQLite path, migration/startup readiness, process ownership, cleanup and fail-fast native exit handling.
- Add an `npm` E2E command and document the one-time Chromium install plus local run commands. Keep normal `verify.ps1` deterministic; either add an explicit `-IncludeE2E` switch or run the visible E2E gate separately so ordinary verification never silently opens a browser.
- Automate one serial critical journey: new session; one evidence interaction; wrong then correct question retry; unlocked NPC evidence; meeting checkpoint; scanner detection/retry and dodge/clear; remaining prerequisites; immutable conclusion; one wrong/correct review retry; completion; reload persistence; replay with revision 0, office-entry spawn and one canvas.
- Assert no unexpected console errors, page errors, 5xx responses, horizontal overflow at 1280×800 and 1100×720, leaked raw cookie/session data, duplicate canvas or duplicate progression request. Document expected initial 401 and intentional wrong-answer/conflict responses separately.
- Perform a visible manual playtest of collision/depth, facing/walk/dodge feedback, HUD/overlay readability, pause/blur/focus recovery and route usability. Inspect 390px DOM layout and desktop-keyboard notice without claiming touch gameplay.
- Record environment, revision, scenario matrix, performance sample, defects/fixes/retests, known limitations and final evidence in `docs/quality/T10-browser-playtest.md`; update README, task/index/current memory and improvement review.
- Fix defects discovered inside the approved existing MVP behavior and add narrow regression coverage. Stop for reapproval if a fix requires new gameplay, contract, schema or product semantics.

Expected affected areas: `apps/web/package.json`, `apps/web/package-lock.json`, `apps/web/playwright.config.ts`, `apps/web/e2e/**`, `scripts/e2e.ps1`, `.gitignore` only if a missing generated path is found, README, `docs/quality`, task/index/current memory, and narrowly affected product/test files when a reproduced defect requires a fix.

### Excluded

- New gameplay, story/content, scoring, API contract, database schema, storage provider, admin implementation or visual redesign.
- Test-only commands that teleport, grant evidence, answer questions, clear the scanner, inject a conclusion or otherwise bypass the real player path.
- Headless browser evidence, hidden browser tabs, mobile/touch support claims, broad visual snapshot baselines or a multi-browser compatibility matrix.
- Load/stress testing, production SLOs, remote CI, Docker, deployment, publishing, external accounts/secrets or GitHub workflow changes. These remain behind later gates.
- T11 handoff exercise and T12 export/import/storage round-trip except for documentation of evidence T10 produces for them.

### Risks and controls

- **Flaky canvas navigation:** use stable landmarks and semantic HUD/interactions, serial execution and bounded waits. Add only read-only test-build observability if real keyboard routes cannot be made reliable; never add a bypass.
- **Test damages developer progress:** use a unique validated ignored database and dedicated ports; fail closed on ambiguous paths/processes and clean only runner-owned artifacts.
- **Browser artifacts leak private content:** retain trace/screenshot only on failure, keep artifacts ignored, inspect before sharing, and scan the production bundle independently.
- **Automation hides visual/gameplay defects:** keep the browser headed and add a manual final pass for collision, depth, animation, focus and readability.
- **Performance assertions become hardware-flaky:** record the machine/browser/build and raw measurements; gate only on hangs, sustained input loss, severe regressions or failure to complete the route.
- **E2E changes runtime ownership:** preserve React/Phaser boundaries and L005/L006. Test one canvas, fresh replay position, cleared held input and focus return at every overlay/session boundary.

## Acceptance and verification

### Automated headed journey

- Runner rejects occupied test ports and never opens the developer database. API migration/startup and Vite readiness are explicit, with cleanup on success, failure and Ctrl+C.
- Chromium opens visibly at 1280×800. A fresh browser has no exposed session token and creates one session/canvas at revision 0.
- Real keyboard movement reaches evidence/NPC/checkpoint/scanner interactions. Wrong then correct question and review attempts update exactly once; an identical replayed mutation does not add an attempt, score, reward or revision.
- Detection resets to the saved checkpoint without losing evidence/questions; dodge and encounter clear unlock the archive path. Reload resumes the same checkpoint/progression.
- Conclusion is submitted once, score/explanation/review are readable, completion persists after reload, and replay starts a new session at office-entry with one canvas and no inherited input/position.
- No unexpected page/console error, failed resource, 5xx, unhandled request, horizontal overflow or private frontend payload/bundle string occurs. Expected errors are allowlisted narrowly with scenario evidence.

### Visible manual playtest and performance sample

- Try the visible Codex in-app browser first; record the exact failure if unchanged, then use a visible Playwright/Chrome window. Never substitute a headless run.
- At 1280×800, walk around desk/cabinet/planter/table and in front of/behind props and NPCs; verify collision, foot-depth, facing/walk/dodge feedback, nearby HUD and no blocked route.
- Exercise notebook/dialogue/retry/conclusion/result/review with keyboard and mouse; verify pause/blur, Escape closes once, focus returns, scrolling is usable and no duplicate input/canvas appears.
- Repeat the main navigation/overlay/reload path at 1100×720. Inspect the 390px DOM shell, overlays and desktop-keyboard notice.
- Capture an environment-qualified performance sample during startup and movement/encounter. Record Phaser chunk size, readiness/API timings, approximate frame cadence and longest observed stall; investigate any visible freeze or input loss before completion.

### Scripts and final gates

- Focused E2E runner checks, Playwright test listing and the headed critical journey on the final revision.
- `npm --prefix apps/web run lint`, `typecheck`, `test:run`, `build` and the new E2E command.
- Full `./scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe`; if E2E remains separate, record both commands and exit codes.
- Frontend privacy/bundle scan; agent-doc check; `git diff --check`; final Git status; scoped commit and push to configured `origin` under the standing instruction.

## Handoff

Implemented the pinned Playwright dependency, headed Chromium config, read-only E2E scene observability, isolated PowerShell runner, complete critical journey and README instructions. The runner validates dedicated ports, uses a unique temporary SQLite database, owns and cleans only its child processes/data, and records migration/readiness timings. Vitest explicitly excludes E2E specs while preserving its defaults.

Final headed E2E passed the complete case, idempotent replay, detection/retry, conclusion/review, reload and replay in 35.7 seconds. A separate visible Chrome confirmation passed movement/collision, pause/resume, one-canvas ownership, 1100×720 layout and the 390px desktop notice. The Codex in-app browser was retried first and failed with the documented Windows sandbox helper error. Full evidence and limitations are in `docs/quality/T10-browser-playtest.md`.

`scripts/verify.ps1` passed 18 frontend tests and 9 API tests with zero .NET warnings/errors. The final production bundle scan contains no E2E hook/private solution/token strings. The known lazy Phaser chunk warning remains. Next phase: plan T11 handoff verification; do not begin T12, admin implementation, Docker/CI or deployment without their applicable checkpoint.

## Improvement review

- Result: promoted
- Observation/evidence: early Windows runs split DLL/script paths containing spaces, started the API without its content root, and could reach Vite before its API proxy was usable. These failures reproduced in the real repository and prevented deterministic E2E startup.
- Mechanism changed or no-change reason: L007 records the reusable rule; `scripts/e2e.ps1` now quotes child arguments, sets explicit working directories, rejects occupied ports, waits for direct and proxied health, tracks owned PIDs and cleans only a validated unique run directory/database.
- Validation: occupied-port rejection passed; repeated isolated success runs cleaned their databases/processes; the final headed journey and full repository verification passed.
- Follow-up trigger: T12 should reuse the ownership/path/readiness pattern for storage round-trip processes; revisit only if the runner gains another service or cross-platform shell.
