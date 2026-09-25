# T09 — Cohesive art, HUD and focus polish

Status: done
Owner: Codex
Depends on: T08
Plan version: PROJECT_PLAN.md 1.4, T09 implementation 1.0
Approval: user approved implementation plan 1.0 on 2026-09-25 with “duyệt kế hoạch”
Lifecycle phase: verify/close
Workflow step: implementation, visible-browser verification and final gates complete

## Outcome and success signal

The complete case flow looks and reads like one bright stylized office game rather than a collection of prototype panels. The Phaser world gets a consistent code-authored visual language for player, NPCs, evidence, furniture, scanner and zones; React presents a compact accessible HUD and polished overlays without taking frame-level state from Phaser. Keyboard focus, pause, replay and overlay transitions remain deterministic.

The exit gate is a visible browser run of the existing full gameplay surface at 1280×800 and 1100×720, plus a 390px DOM/layout check that clearly states keyboard gameplay is desktop-only. The final revision must keep one canvas, one input response, readable overlays and the full existing verification suite.

## Entry evidence and decisions

- Baseline `1c30ba0`, clean `main` synchronized with `origin/main`; T01–T08, T13 and T14 are complete.
- The approved defaults already select a bright stylized office, Phaser sprite-style 2.5D presentation, desktop keyboard controls, Vietnamese navigation and English case content. T09 refines those defaults; it does not reopen renderer, language or action design.
- `OfficeScene` currently draws every object with Phaser primitives. Depth-by-foot, collision, camera, checkpoint, scanner and interactions are working, but NPC/evidence points are generic markers and the player has no movement-facing polish.
- React already exposes game/API/session state and accessible overlays. The interaction prompt is a document-flow banner rather than an in-scene HUD; narrow layout has no explicit desktop-keyboard notice.
- L005 and L006 are verified constraints: overlay Escape must not also toggle Phaser pause; every mount/session boundary must keep one canvas, clear held input and reset scene position.
- Audio remains intentionally disabled. This plan does not introduce audio, external raster assets, fonts, runtime dependencies or image-generation output.

### Decisions included in approval

- Keep art code-authored with Phaser vector primitives for this slice. Consolidate colors, dimensions and visual constructors into a small presentation module instead of adding an asset pipeline late in the MVP.
- Give Maya, Leo and Nora distinct but reusable character variants; render evidence as recognizable office props/icons rather than identical dots. Preserve the existing interaction coordinates and collision model.
- Add low-cost movement presentation owned by Phaser (facing, walk bob/limb pose and dodge feedback) without sending per-frame state to React.
- Move stable player guidance into a DOM HUD layered with the scene card: current objective, checkpoint/encounter state, assist state, interaction prompt and concise control hints. Dodge cooldown may remain canvas-owned because it changes per frame.
- Use existing Vietnamese navigation and English learning content. Visual correctness and alerts must not rely only on color.
- Add a compact narrow-screen state at 390px that keeps case/session/overlay content readable and explicitly says gameplay requires a desktop keyboard; no touch controls or mobile-gameplay claim.
- Browser workflow will try the visible Codex in-app browser first, per user instruction. If its kernel cannot initialize, use a visible Chrome window as the documented fallback; never use headless or hidden browser testing.

## Scope

### Included

- Introduce reusable Phaser presentation tokens/helpers for the approved bright stylized office palette, shadows, character variants, evidence props, interaction affordances and zone treatment.
- Polish the player and three NPC silhouettes while retaining foot anchors, depth sorting and collision boundaries. Add restrained movement/dodge visual feedback that does not change movement speed, hit detection or scoring.
- Improve scene legibility for lobby, work area, meeting zone, archive/scanner lane and checkpoint while preserving the world dimensions and navigable paths.
- Refactor the React scene shell into a compact semantic HUD with current mission/progress, nearby interaction, scanner/checkpoint/assist state and visible focus/pause feedback.
- Polish notebook, dialogue, retry, conclusion, result and review surfaces using shared CSS tokens, consistent buttons, focus rings, spacing and scroll behavior.
- Add the 390px desktop-required notice and ensure DOM content remains keyboard reachable/readable.
- Add focused tests for presentation helpers and React/GameHost lifecycle/focus behavior; update README, task/index/current memory and asset/source notes.

Expected affected areas: `apps/web/src/game/scenes`, a small `apps/web/src/game/presentation` module, `App.tsx`, `App.css`, `index.css`, frontend tests, README and project documentation. No API, domain, database or case-content contract change is planned.

### Excluded

- Audio, voice, pronunciation, music, external fonts, external/downloaded art, AI-generated raster assets or a new asset dependency.
- New gameplay, combat, map geometry, collision rules, quest logic, scoring, storage or API behavior.
- Touch controls or a claim of mobile gameplay support.
- T10 formal Playwright/E2E suite, performance report and structured playtest; T09 only runs regression evidence needed for its visual/focus changes.
- T12 packaging/export, admin work, Docker/CI, deployment or publishing.

### Risks and controls

- **Presentation changes gameplay geometry:** keep collision rectangles, coordinates and world rules unchanged; test movement/collision and run a real canvas route.
- **React/Phaser lifecycle regression:** preserve the typed bridge, no React setState per frame, remount boundary and synchronous canvas cleanup; assert one canvas and one input response after reload/replay.
- **HUD obscures play or content:** test 1280×800 and 1100×720 outer windows, keep scene HUD compact, and verify overlay scrolling/focus.
- **Color-only communication:** retain text/icon/shape labels for interaction, danger, success and locked states; verify keyboard focus rings and DOM status text.
- **Scope creep into final asset/audio pipeline:** use code-authored primitives only and document that external asset sourcing remains a later explicit decision.
- **Codex browser instability:** the planning preview tried the visible in-app browser twice on 2026-09-25; its trusted Node kernel reset both times. Retry it for implementation preview, then use visible Chrome fallback if the same environment failure persists.

## Acceptance and verification

### Product behavior

- Player, Maya, Leo and Nora are visually distinguishable; evidence/NPC interaction points communicate their type without relying only on color.
- Furniture, walls, zones, characters, scanner, checkpoint and markers share a coherent bright-office palette and preserve correct foot-based occlusion.
- Walking direction/feedback and dodge feedback are visible but do not alter tested movement distance, collision, scanner radius/cooldown or server progression.
- The DOM HUD shows current objective, checkpoint/scanner/assist state and nearby `E` action; no frame-level position/cooldown state is mirrored into React.
- Opening every overlay pauses/gates movement, Escape closes exactly once, focus returns to the canvas, blur pauses, and replay starts with one fresh canvas/input owner.
- Loading, API error, session missing and completion states remain readable. At 390px, DOM controls/overlays remain usable and a desktop-keyboard requirement is explicit.
- No private solution, correct choice, token, database path or server-only bundle enters the frontend.

### Visible browser scenarios

- Try visible Codex in-app browser first. Record success or the exact tool failure; if blocked, open a visible Chrome fallback and continue rather than substituting headless checks.
- At 1280×800, start/replay a session, walk around the desk/cabinet/planter/table, pass in front of and behind depth-sorted objects/NPCs, observe facing/walk/dodge feedback and interact using `E`.
- Reach checkpoint/scanner states and verify HUD text, danger/checkpoint visuals, failure retry and assist messaging without changing progression behavior.
- Open/close dialogue, notebook, retry and conclusion/result/review overlays using keyboard and mouse. Confirm scroll, visible focus, pause status, returned canvas focus, one canvas and no duplicate input.
- Repeat the main navigation/overlay path at 1100×720. At 390px inspect the DOM shell/overlays and desktop-keyboard notice without claiming playable touch controls.
- Reload and replay on the final revision; confirm one canvas, safe checkpoint spawn rules and no unexpected console/network errors.

### Checks

- Focused Vitest coverage for presentation helpers, GameHost StrictMode/remount, movement invariants and accessible HUD/focus states.
- `npm --prefix apps/web run lint`, `typecheck`, `test:run`, `build`.
- Full `./scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe` even though backend behavior is unchanged.
- Frontend privacy/bundle scan, `scripts/check-agent-docs.ps1`, `git diff --check`, visible browser console/network inspection and final Git status.
- Commit scoped verified changes and push the current branch to configured `origin` under the standing repository instruction.

## Handoff

T09 is complete. `presentation.ts` now centralizes the bright-office palette, distinct player/Maya/Leo/Nora variants, evidence symbols, compact interaction labels, movement pose and objective selection. `OfficeScene` applies those helpers without changing coordinates, collision, movement speed, encounter rules or server progression. React now layers a semantic `SceneHud` over the canvas, preserves readable notices and adds an explicit desktop-keyboard notice for narrow screens. GameHost focuses a fresh canvas after session/remount when no overlay is open; a regression test covers the boundary. No dependency, API, database, case contract, external asset or audio change was made; `docs/assets/manifest.md` records the code-authored sources.

Focused frontend checks passed with 18 tests. Visible Chrome fallback passed a live session at 1280×800 and 1100×720, real keyboard movement into the meeting checkpoint, HUD objective/checkpoint update, Space dodge path, notebook open/close, Escape focus return, one-canvas assertion and 390px no-overflow/desktop-notice inspection. The implementation preview first retried the visible Codex in-app browser as requested, but its kernel failed again with `windows sandbox failed: helper_unknown_error`; the already-approved visible Chrome fallback was therefore used. Final `verify.ps1` passed 24 task checks, npm audit with 0 advisories, lint/typecheck/build, 18 web tests, .NET build with 0 warnings/errors and 9 API tests. The frontend bundle privacy scan, agent-doc check and `git diff --check` also passed.

Next phase: T10 browser/E2E/playtest planning. T09 does not authorize T10 implementation, deployment, publishing, Docker/CI or the deferred T15–T26 admin implementation.

## Improvement review

- Result: promoted (L006)
- Observation/evidence: T09's fresh-session preview exposed a focus race at the same React/Phaser remount boundary previously implicated in duplicate canvases and stale position. Focusing the parent after runtime setup restored immediate keyboard ownership while preserving overlay gating.
- Mechanism changed or no-change reason: the invariant is encoded in `GameHost`, its focused regression test, and the existing scoped `apps/web/AGENTS.md` rule to return focus deliberately. L006 now names focus ownership as part of the promoted lifecycle boundary.
- Validation: GameHost/StrictMode tests, 18-test focused suite, visible notebook Escape → canvas focus, live keyboard movement, one-canvas checks and the final repository verification all passed.
- Follow-up trigger: reuse this lifecycle boundary for T10 replay/E2E coverage; retire only when Phaser hosting or the input architecture changes.
