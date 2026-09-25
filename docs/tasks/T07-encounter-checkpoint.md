# T07 — Archive scanner encounter and checkpoint

Status: done
Owner: Codex
Depends on: T03, T04, T05, T06
Plan version: PROJECT_PLAN.md 1.4, T07 implementation 1.0
Approval: user's 2026-09-25 “tiếp tục” after committed T06; covers T07 game slice only
Lifecycle phase: handoff and improve
Workflow step: complete

## Outcome and exit gate

The player reaches a real safe checkpoint, dodges a scanner near the archive, can retry after detection without losing evidence/questions, and unlocks E03 on a successful crossing. Reload restores the checkpoint and encounter completion but resets transient scanner motion. Visible browser gameplay, API persistence and full scripts prove the outcome.

## Entry evidence and decisions

- Baseline `8c434a2`, clean Git. T04 has a prototype meeting checkpoint API/button but no canvas trigger. T05 E03 is hard-locked by `RequiresEncounter`; T06 Q03 waits for E03.
- Keep the approved stealth/dodge direction, not combat. One scanner patrols a marked archive lane. `Space` gives a short dodge window and cooldown; detection returns the player to the meeting checkpoint. Phaser owns position, patrol, detection and transient retries.
- Reaching a physical meeting-zone marker triggers the existing checkpoint save, replacing the prototype button. Archive encounter can complete only after that saved checkpoint. The API trusts only IDs/order/revision; it does not claim to prove the player's path or dodge timing in this single-player MVP.
- Server stores detection count, cleared/assisted flags and idempotent encounter receipts atomically with revision. After two detections, the player may enable a slower scanner; assistance is visibly recorded but does not affect English scoring. Completion unlocks E03 as *available*, and the player still collects it at the terminal with `E`.
- Reload spawns at the saved checkpoint (or office entry) and resets scanner phase. Existing collected evidence and question progress remain. Focus loss/notebook pause stops the scanner and clears held dodge input.

## Scope and exclusions

Implement typed Phaser bridge/commands, checkpoint marker and scanner/dodge/retry, React HUD/assist/feedback, session world progress DTO, encounter mutation and SQLite migration, tests, README and handoff. Preserve unrelated admin files and local SQLite data.

Excluded: real server-side movement proof/anti-cheat, combat, second encounter, final conclusion/scoring (T08), polished art (T09), Docker/GitHub/deployment.

## Acceptance and verification

- Canvas checkpoint requires reaching its marker; reload spawns there. Old prototype button is removed. Duplicate checkpoint save remains idempotent.
- Scanner patrol/depth is visible. `Space` dodge has bounded duration/cooldown. Detection resets safely; no evidence or answered question is lost. Pause, notebook and focus loss freeze encounter motion.
- After two detections, slow assist can be selected; server rejects assisted completion before eligibility. Success and repeated submission never duplicate rewards/revisions; stale/mismatched payload conflicts.
- Before completion, direct E03 access and interaction remain locked. After completion, E03 can be collected once; Q03 becomes available, but correct answer remains server-private. Reload/new API host preserve checkpoint, attempts, completion and E03.
- Focused tests, visible Chrome preview/test/final confirmation (1280×800 and smaller laptop), full verify script, migration drift and `git diff --check` pass.

## Handoff

- Baseline `8c434a2`; implementation arrived in commit `344802f`. Final verification/fixes and docs are uncommitted above that baseline. Dirty paths are limited to T07 React/Phaser lifecycle fixes, README and handoff files; local SQLite data and `.tools` remain ignored.
- React/Phaser/API/domain/SQLite slice now provides the physical meeting checkpoint, scanner patrol, bounded dodge/cooldown, detection retry, two-failure assist eligibility, atomic idempotent encounter progress, E03 unlock and Q03 availability. Private answers remain server-only.
- Visible Chrome at 1280×800 exercised a fresh session, physical checkpoint save (revision 1), two detections without lost progress (revision 3), assist selection, encounter clear (revision 4), E03 collection and Q03 availability (revision 5). Reload at a 1100×720 outer window resumed checkpoint/clear/assist/E03 with no alerts, console exceptions or 5xx responses.
- Browser confirmation initially exposed two canvases plus closed `AudioContext` exceptions during React StrictMode replay. `GameHost` now removes the old parent children synchronously, a StrictMode regression test covers the replay, and Phaser audio is disabled while the game has no audio. Final reload had exactly one canvas and no recorded browser issues.
- `./scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe` passed after stopping preview processes: agent docs, npm clean install/audit (118 packages, 0 vulnerabilities), lint, typecheck, 10 frontend tests, Vite build, locked .NET restore/build (0 warnings/errors), and 7 API tests. The first retries correctly failed while Vite held the Rolldown binding and while the API held its apphost; both passed after those preview processes stopped.
- `dotnet ef migrations has-pending-model-changes` reported no drift and `git diff --check` passed. The known ~1.39 MB lazy Phaser chunk warning remains non-blocking. Next product slice is T08 conclusion/review; admin implementation remains deferred.

## Improvement review

- Result: candidate
- Observation/evidence: visible Chrome reload exposed duplicate canvases and Phaser audio promise exceptions during React StrictMode effect replay even though ordinary component tests passed.
- Mechanism changed or no-change reason: added L006, synchronous parent cleanup, `noAudio` while audio is unused, and a StrictMode regression test; no broad rule was promoted from one incident.
- Validation: focused lint/typecheck and 7 frontend tests passed after the fix; final visible reload at 1100×720 showed one canvas and no console/network issues; full verify passed with 10 frontend and 7 API tests.
- Follow-up trigger: verify the candidate again when T09 adds/remounts Phaser presentation or when audio is introduced; then either promote a scoped lifecycle checklist/test pattern or retire the `noAudio` part.
