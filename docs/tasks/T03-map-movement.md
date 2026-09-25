# T03 — Office map and movement

Status: done
Owner: Codex
Depends on: T02
Plan version: PROJECT_PLAN.md 1.3, T03 implementation 1.0
Approval: user's 2026-09-25 instruction “ok tiến hành tiếp theo plan”, covering the next planned T03 slice and previously accepted defaults
Lifecycle phase: handoff and improve
Workflow step: complete

## Outcome and success signal

The player can explore a small bright office map with keyboard controls, walk around solid props, pass visually in front of and behind furniture, and pause safely without movement sticking after focus changes.

## Evidence and decisions

- Verified: T02 mounts exactly one Phaser scene/canvas; its scene is static. React owns the DOM HUD and API health. The current working tree was clean at task start.
- Accepted: Phaser sprite based 2.5D, desktop keyboard, bright office, and T03 scope from `PROJECT_PLAN.md` 1.3.
- Design for this slice: public placeholder geometry and character shapes are rendered in Phaser; collision is defined by floor footprints in world coordinates; visual depth follows each object's foot position. No private case data is added to the client.
- Open: final art, NPC placement/content, encounter, checkpoints and persistence belong to later tasks.

## Scope

Included: playable office floor, static obstacles and boundaries, WASD/arrow movement with normalized diagonals and frame delta, Shift run, foot based collision/depth, bounded camera follow, Escape pause/resume, input reset on blur/visibility loss, DOM control/status copy, focused movement tests, real canvas checks.

Excluded: NPC interaction, dodge/encounter, evidence, quest progression, storage, API changes, asset procurement, Docker, GitHub and deploy.

Affected areas: `apps/web/src/game`, React HUD copy, web tests, task and current memory. No new package dependency is expected. Risk: keyboard focus/blur can leave held input, or depth/collision may disagree with visual furniture; browser testing must cover both.

## Acceptance and verification

- WASD and arrows move at stable time based speed; diagonal travel is normalized and Shift runs faster.
- Player stays within floor bounds and cannot cross desk/cabinet footprints, including at corners.
- Player is correctly occluded when walking behind props and drawn over them when in front.
- Camera follows in the scrollable map without showing outside it; resizing preserves a valid view.
- Escape pause stops movement. Blur or hidden tab stops movement and clears held input; resume requires a deliberate action.
- Canvas actually displays the map at desktop and smaller laptop widths, without blocking console/network errors.
- Focused tests, npm lint/typecheck/test/build, repository verify script (including .NET when available), and `git diff --check` are recorded on the final revision.

## Implementation and browser verification

- Replaced the static foundation scene with a small office map, player, desks/cabinets, floor-footprint collision, foot-based depth, bounded camera follow, normalized keyboard movement and Shift run. React retains the DOM controls/status while Phaser owns frame-level movement.
- URL: `http://127.0.0.1:5173` with Vite and the real API on `http://127.0.0.1:5062`, 2026-09-25. The final in-app browser reload showed the office canvas, “Đang khám phá”, and “API — Đã kết nối”.
- Chrome/Playwright at 1440×900 exercised held-key movement, desk collision, behind-desk occlusion, rightward camera scroll, `Esc` pause/resume and a simulated window `blur`. Visual screenshots also confirmed the player is drawn over furniture when in front and a 1100×720 laptop viewport has no overflow. The browser reported no page/console errors; canvas and host were both 520 px high at desktop size.
- The headless browser did not emit a genuine OS focus-change event when switching tabs, so the blur path was checked by dispatching the browser `blur` event and confirming paused state. The real `Esc` path was also exercised in the in-app browser.
- First browser pass exposed a resize feedback loop: `min-height` on the Phaser host made a 1764 px canvas in a 900 px viewport. Fixed the host to an explicit 520 px height (440 px at the mobile breakpoint), then repeated browser checks on the final runtime revision.

## Final script checks

- `./scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe`: passed on the final runtime/script revision. Agent structural check covered 6 task files; npm clean install audited 118 packages with 0 vulnerabilities; lint, typecheck, 5 Vitest tests and Vite build passed. .NET restore/build passed with 0 warnings/errors, and 1 API test passed.
- Existing Vite Phaser chunk warning remains at about 1.38 MB minified; it is not a blocking error and is deferred to representative gameplay/assets work.
- `git diff --check`: passed after the final documentation pass.

## Handoff

T03 acceptance is met. T04 should establish storage/session ports and the SQLite adapter without exposing provider details above Infrastructure. Keep T03 browser behavior as a regression scenario for later gameplay slices. The local SDK at `.tools/dotnet` is ignored and terminal-specific; README documents the supported setup. No deploy, Docker, GitHub, or production action was taken.

## Improvement review

- Result: promoted (L003).
- Observation/evidence: the first integrated verification had `npm ci` fail with `EPERM` while Vite held a native file, yet PowerShell continued through later failures and returned success after .NET. This could falsely mark a broken revision as verified.
- Mechanism changed or no-change reason: `scripts/verify.ps1` now throws on nonzero native exit codes after every npm and .NET command. This is deterministic verification behavior, not a new agent rule or skill.
- Validation: the failing npm step was observed with the revised script, then the full script passed after stopping the Vite process. Final browser checks passed as above.
- Follow-up trigger: revisit L003 if the script changes shell or invokes new native commands. Owner: next agent editing the verification script.
