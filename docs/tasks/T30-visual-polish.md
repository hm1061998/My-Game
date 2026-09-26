# T30 — Existing office lighting and atmosphere pass

Status: done
Owner: Codex
Depends on: T27, T29
Plan version: 1.0
Approval: user instructed on 2026-09-26: “triển khai nâng cấp đồ họa trước khi tiến hành tạo màn chơi tiếp theo”. This approves a bounded visual upgrade of the existing office scene before any new level work; the existing T27 bright editorial detective direction and Phaser 2.5D defaults remain in force.
Lifecycle phase: handoff
Workflow step: plan/approval → implementation → focused checks → visible browser test/review → fix/retest → scripts → improvement review → handoff

## Entry evidence and decision

- Git baseline: `06a4993` (`main`, `origin/main`), clean at task start; T29 office ambience is complete.
- T27 already delivered 17 office SVGs, four-direction character sheets, purpose-specific interface surfaces, depth sorting, shadows, evidence feedback and reduced-motion handling. Its V5 QA recorded a 958×651 scene at 1280×800, approximately 60 fps, p95 frame time 17 ms and 402 KB visual asset transfer.
- Current scene still draws the top wall as flat rectangles and three plain blue window rectangles (`OfficeScene.drawOffice`). It has no environmental light layers or atmospheric particles. Existing object collisions/foot anchors are data-driven and can remain unchanged.
- `docs/design/graphics-technology-options.md` remains proposed for large raster/lighting/engine changes. This task deliberately selects no renderer, raster-art-source or atlas change: extend approved T27 Direction A with one original local SVG light texture, a few code-drawn window details and a small deterministic dust-mote treatment in Phaser.

## Outcome and success signal

Before adding the next game level, the current bright office should gain immediately visible warm daylight and material depth: windows read as framed glass, soft sun pools/shafts connect the windows to the floor, and a few subtle motes make the space feel inhabited. The scene remains readable, responsive, keyboard-playable, and recognizable in grayscale; movement, route, collision, depth anchors, progression, learning content and UI semantics do not change.

## Scope

- Add one authored, local SVG light-pool asset using the accepted T27 palette and validated local asset-loader path; record source, authoring method, date and use in `docs/assets/manifest.md`.
- Enrich existing wall windows with simple pane dividers/reflections/sills using Phaser geometry.
- Layer soft daylight beneath furniture/characters and add a small deterministic, non-interactive dust-mote treatment; disable mote motion under reduced-motion preference.
- Keep all changes in the existing map/world presentation; retain original sprite direction, camera, React overlays, sound, layout, coordinates, collision and server/domain contracts.
- Add focused asset/scene coverage and one headed-browser assertion for successful light-asset load, layout/one canvas, reduced motion and unchanged movement route.

## Excluded

- Creating a new level/map, gameplay mechanic, story/case content, collision or scanner changes, new UI/learning/audio flow, new dependency, raster/AI image generation, third-party assets, engine migration, backend/schema/storage changes, deployment or image publishing.
- Materially changing the T27 art bible, accepted 2.5D direction, or existing sprite families.

## Risks and controls

- Daylight can reduce clue, label or scanner contrast: keep the local SVG transparent/subtle and inspect normal + grayscale views at the actual camera scale.
- Decorative sprites must stay under interactables and must not affect world coordinates/collisions; keep them in a depth layer below furniture/characters.
- Particle motion can distract or affect reduced-motion users: use a small fixed count, restrained opacity/speed, deterministic positions and no animation when reduced motion is requested.
- Preserve load recovery: if the new SVG is missing/invalid, retain the current scene plus a recoverable art notice and no blank canvas.

## Acceptance and evidence

- At visible 1280×800 and 1100×720 previews, framed windows and warm light are apparent but do not obscure objective/evidence text, interactions or scanner danger; mission drawer and responsive DOM remain unchanged.
- Scene movement, foot-depth ordering, furniture collisions, pause/focus and one-canvas lifecycle behave as before; the existing full T10 E2E journey passes.
- The light texture loads locally through validated SVG handling and missing/broken-asset recovery remains functional. No remote runtime art request is added.
- Under `prefers-reduced-motion: reduce`, the world lights remain static and mote animation is absent; grayscale still differentiates zones, interactables, checkpoint and danger.
- Focused checks, lint/typecheck/all web tests/build, headed browser tests, full local verify, agent-doc check and `git diff --check` pass. GitHub E2E is not awaited per the user's earlier instruction.

## Verification plan

1. Open the visible Codex browser/preview where possible; otherwise use the project visible headed Chromium runner. Confirm current layout and current scene before/after.
2. Exercise the complete keyboard journey in headed Chromium plus 1280×800/1100×720 visual states; inspect normal and reduced-motion settings, local asset/network state, console, grayscale and route movement.
3. Run `npm --prefix apps/web run lint`, `typecheck`, `test:run`, `build`, `e2e:list`, `scripts/e2e.ps1` through `npm --prefix apps/web run e2e -- -DotnetCommand ./.tools/dotnet/dotnet.exe`, `scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe`, `scripts/check-agent-docs.ps1` and `git diff --check` on the final revision.

## Handoff

Implemented the existing-office lighting/atmosphere upgrade before any new level work. The scene now has one validated local daylight SVG placed at each of the three existing windows; the wall windows gain pane dividers, restrained reflections and sills; eight fixed, non-interactive dust motes drift gently unless `prefers-reduced-motion` is set. Lighting/decor remain below props and gameplay depth; map bounds, route, collisions, interactions, UI, case content and contracts are unchanged. If the SVG is missing, the previous room and window treatment remain and the existing recoverable art notice appears.

Browser evidence: full visible headed Chromium suite passed 7/7 on the final revision. The full T10 gameplay route, three isolated first-clue runs, audio behavior, one-canvas layout, local texture responses, explicit `window-light.svg` HTTP 200, HTML-fallback recovery without page error plus movement, and real reduced-motion scene (8 static motes) all passed. Visual-state screenshots at 1280×800 and 1100×720 show no overflow; the grayscale 1280×800 screenshot retains distinct floor zones, character, clue markers and UI. Final route sample: approximately 60 fps, p95 17 ms, longest frame 17 ms. Local visual asset transfer was 404,106 bytes versus T27's 402,228-byte reference (~1.9 KB incremental). Screenshots are attached to the local ignored Playwright HTML report; no screenshots/generated state are committed.

Preview note: the Codex panel `open_in_codex` request was accepted as `queued`. The visible integrated headed runner supplied the functioning app preview at `http://127.0.0.1:5174`. I also tried the user's existing standalone preview URL `http://127.0.0.1:5173`; it had no API at 5062 (expected `ECONNREFUSED`), so that preview was not treated as integrated product verification. No developer database was changed. GitHub E2E was not polled per the user's standing request.

Script evidence: final web lint, typecheck, all 47 web tests, production build, full local `scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe` (12 API tests), `scripts/check-agent-docs.ps1` (31 task files) and `git diff --check` passed. `npm ci` reported the known non-blocking Node 22/npm 10 engine mismatch (the repo declares Node 24/npm 11); build emitted the existing `advancedChunks` deprecation warning. No new dependency was added. The final revision is ready for scoped commit/push; no level/map was created.

## Improvement review

- Result: verified.
- Observation/evidence: the workspace shell helper again returned `helper_unknown_error: setup refresh had errors`, as in T28; the documented, scoped elevated-shell fallback allowed inspection, tests and verification without changing workspace permissions. This repeated T28's recovery path in T30.
- Mechanism changed: updated existing L014 in `docs/agent/lessons.md` to verified with the second occurrence. Kept it as a bounded operational lesson; did not broaden project permissions or add another general rule.
- Validation: `scripts/check-agent-docs.ps1`, full local verification, final visible headed E2E and `git diff --check`.
- Follow-up: use only as a task-scoped recovery if the sandbox helper fails; reassess if the recovery itself stops working. The next level remains a separate task.
