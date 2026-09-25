# Graphics technology options for a future major version

Status: **proposed — not approved**. Recorded 2026-09-26 at the user's request as input for a future "big update" that upgrades graphics comprehensively. Nothing here changes the accepted default (Phaser sprite-based 2.5D). Choosing an option below requires a new task, a recorded decision and user approval. Re-check library versions, licenses and browser support when that work starts; this note is written from general knowledge, not a fresh benchmark.

## Constraints any option must keep

- React keeps the DOM HUD, dialogue, notebook, conclusion and all readable English learning content (accessibility, screen readers, keyboard focus). Canvas-only text is not acceptable.
- Server stays authoritative for progression/scoring; no solutions in the client.
- Desktop keyboard, visible-browser testing, the E2E journey and the 60 fps / p95 ≤ 33 ms budget.
- Local, versioned, licensed assets listed in `docs/assets/manifest.md`; validated loading with a fallback (`apps/web/AGENTS.md`).

## Why an engine swap is feasible here

Phaser is imported only by `apps/web/src/game/createGame.ts` and `apps/web/src/game/scenes/OfficeScene.ts`. React talks to the world only through `GameRuntime` / `GameFactory` (`src/game/runtime.ts`) and the typed events in `src/game/bridge/events.ts`. Movement, collision and scanner rules are pure modules (`movement.ts`, `encounter.ts`) with unit tests. A new renderer implements the same `GameFactory`; the React shell, API, storage and most tests stay unchanged. The E2E observability hook (`window.__officeCaseFilesE2E.snapshot`) must be re-implemented by the new scene.

## Options

| # | Option | What it gives | Cost / risk | Fit |
| --- | --- | --- | --- | --- |
| A | **Stay on Phaser 4, upgrade the art pipeline** | Painted/raster sprites in texture atlases, normal maps + dynamic 2D lights, post-processing filters (bloom, vignette, glow, color grading), particle effects, Tiled tilemaps for the office | Lowest: same engine, same tests; mainly art production and atlas tooling | **Best first step** |
| B | **Skeletal 2D animation (Spine or DragonBones) on Phaser** | Smooth, expressive character animation (walk, talk, idle gestures, facial expressions for dialogue) with small file sizes | Spine needs a paid editor license and its Phaser runtime; DragonBones is free but less maintained; animator skill needed | Strong add-on to A |
| C | **Pre-rendered 3D → 2.5D sprites** (model in Blender, render 8-direction sprites and props) | Real 3D lighting/volume look while keeping the cheap 2D runtime and current collision/depth model | Needs a 3D modelling + render pipeline; many frames per character; larger atlases | Good if a "3D look" is wanted without a 3D runtime |
| D | **PixiJS (WebGL/WebGPU renderer)** | Very fast 2D rendering, filters, mature ecosystem | Lower-level than Phaser: re-implement scenes, input, camera, tweens; little visual gain over A | Low value unless Phaser becomes a limit |
| E | **Three.js / React Three Fiber, orthographic 2.5D or full 3D** | Real 3D office with lights, shadows, depth, camera moves; R3F fits the React codebase | Rewrite the world layer; 3D asset pipeline (glTF); larger bundle; must keep DOM overlays and the 60 fps budget on laptops | **Best path to true 3D** while keeping React |
| F | **Babylon.js** | Full 3D engine: WebGPU, physics, inspector, PBR materials, GUI | Heavier than Three.js; same rewrite scope as E; less React-native | Alternative to E if built-in tooling matters more |
| G | **PlayCanvas** | Browser-based 3D editor + engine, good web performance | Editor/cloud workflow; engine is open source but tooling ties to their service | Consider only if a visual editor is required |
| H | **Full engine with web export (Godot 4, Unity WebGL, Defold)** | Rich editors, physics, animation tools | Large downloads (Unity especially), weaker DOM/React integration so learning content and accessibility get harder, some exports need COOP/COEP headers; the React ↔ game bridge would be rebuilt | **Not recommended** for this product |

## Recommendation for the big update

1. **Phase 1 — Option A (+ B for characters):** keep Phaser 4; move to painted raster art in atlases, add 2D lighting and post-processing, and give characters skeletal animation with dialogue expressions. Highest visual gain per hour, no architecture change.
2. **Phase 2 — optional Option E:** if a real 3D office is wanted, prototype a Three.js / React Three Fiber scene behind the existing `GameFactory` for one zone, measure fps and bundle size against T27 (`docs/quality/T27-visual-qa.md`), and only then decide.
3. Option C is the middle ground if a 3D look is wanted but Phase 2 is too costly.

## Questions to settle before starting

- Art source for raster/3D assets: AI image model (needs an approved tool/API and license terms), commissioned artist, or licensed asset pack.
- Target hardware floor (integrated-GPU laptop?) and acceptable download size.
- Whether mobile/touch is in scope for the big update (it is excluded today).
