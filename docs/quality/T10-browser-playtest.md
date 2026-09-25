# T10 browser E2E and playtest report

Date: 2026-09-25

Branch/revision: `main`, parent `c80336e`; this report and the tested implementation are in the T10 completion commit.

Environment: Windows 11 Home 10.0.26200, Node 24.15.0, npm 11.12.1, .NET SDK 10.0.401, Playwright 1.63.0, bundled Chromium 153 and Chrome 153.0.8010.53.

## Result

T10 passed. The headed Chromium journey completed the real React → Phaser → ASP.NET Core → temporary SQLite path in 35.7 seconds. A separate visible Chrome pass confirmed movement, pause/resume, focus ownership, single-canvas ownership and responsive shell behavior. No developer database, hidden browser run, deployment or external service was used.

The Codex in-app browser was tried first at `http://127.0.0.1:5174/`, but its trusted Node process exited with `windows sandbox failed: helper_unknown_error: setup refresh had errors`. The approved visible Chrome/Playwright fallback was used.

## Scenario evidence

| Area | Evidence | Result |
| --- | --- | --- |
| Isolated startup | Unique ignored SQLite database; dedicated 5063/5174 ports; explicit migration and direct/proxied health checks; runner-owned processes and cleanup | pass |
| Port safety | A temporary listener on 5063 caused the runner to stop immediately with `E2E port 5063 is already occupied` | pass |
| New session | Empty script-visible cookie, one canvas, revision 0 and office-entry position | pass |
| Evidence/questions | E01, E02 and E04 collected with real movement/E; Q01 wrong then correct, Q02 correct; identical Q01 mutation replay kept the same attempt/revision | pass |
| NPC unlocks | Maya/E05 and Nora/E06 were reached through the real prerequisite path | pass |
| Checkpoint/encounter | Meeting checkpoint saved; scanner detection returned to it; Space dodge, scanner clear, E03 and Q03 all completed | pass |
| Conclusion/review | Nora + misunderstanding + E03/E06 produced reading 67 and investigation 100; R01 wrong/correct and R02–R05 correct completed 5/5 | pass |
| Persistence/replay | Reload retained result and 5/5; replay returned to revision 0, office-entry position and one canvas | pass |
| Errors/privacy | Only the narrowly expected initial 401 appeared; no other console/page/request/5xx error; production bundle contained no E2E hook, private answer, solution or token/hash strings | pass |
| Layout | No horizontal overflow at 1100×720 or 390×800; 390px shell showed the desktop-keyboard notice | pass |

## Visible manual confirmation

The final implementation was opened in a normal visible Chrome window against a separate temporary database. Real keyboard input moved the player from `(260, 645)` to `(260, 704.4)` while the adjacent horizontal obstruction continued to block movement, confirming input and collision remained active. Escape changed the scene to paused and the second Escape resumed it. The canvas retained focus and ownership, and the DOM reported exactly one canvas.

The visible headed critical journey additionally exercised the desk, NPC, meeting/checkpoint, scanner/archive and conclusion/review overlays. It confirmed route completion, interaction HUD changes, overlay close/focus recovery, retry behavior and fresh replay without duplicate input or canvas. At 1100×720 and 390×800, horizontal overflow remained zero; the narrow layout did not claim touch gameplay.

## Performance sample

These are local measurements, not production SLOs:

- Migration: 5,606 ms.
- API readiness after launch: 1,247 ms; Vite readiness: 99 ms; proxied health: 29 ms; total to ready: 7,063 ms.
- 1.607-second requestAnimationFrame sample: 97 frames, approximately 60 FPS, p95 frame interval 17 ms, longest interval 17 ms.
- Browser resource timings: health 28 ms, session lookup 112 ms, session creation 499 ms, map 15 ms, notebook 437 ms, questions 447 ms.
- Production lazy Phaser chunk: 1,389.87 kB (362.36 kB gzip). Vite's existing >500 kB warning remains a known optimization item; no freeze or input loss appeared.

## Defects found and retested

- Quoted Windows paths with spaces and set the API working directory so child processes receive the DLL path correctly and load `appsettings`.
- Added proxied API readiness so a healthy direct API cannot race the browser shell.
- Made movement bounds, checkpoint coordinates and role selectors deterministic without adding teleport or mutation hooks.
- Excluded `e2e/**` from Vitest while retaining Vitest defaults.
- Corrected the expected 67 reading score after the intentional first wrong answer.
- Restricted the production cleanup branch behind the same E2E build flag; the rebuilt bundle no longer contains `__officeCaseFilesE2E`.

Every fix was retested in the final headed journey. The final repository verification passed 18 frontend tests and 9 API tests with zero .NET warnings/errors.

## Commands and limitations

- `npm --prefix apps/web run e2e:list`: 1 test in 1 file.
- `./scripts/e2e.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe`: 1 passed, exit 0.
- `./scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe`: exit 0.
- Bundle privacy scan and `git diff --check`: pass.

Compatibility evidence is limited to local Chromium/Chrome on Windows. Firefox, WebKit, touch gameplay, load testing and production performance remain outside T10.
