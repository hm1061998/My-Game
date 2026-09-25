# T27 — Game-first visual and interface upgrade

Status: in_progress
Owner: Codex
Depends on: T10
Plan version: 1.0
Approval: approved by user 2026-09-25 — option (b): full V0→V5 sequence with the mandatory V0 visual checkpoint; art direction and asset-source choice remain pending at V0 exit gate
Lifecycle phase: define/design
Workflow step: V2 complete and verified (office textures, zones, affordances, validated loading with fallback); next is V3 characters/interaction/motion

## Outcome and success signal

Make *Office Case Files* read immediately as a polished bright 2.5D detective game rather than a functional web prototype. The playable world becomes the dominant surface; characters, zones, evidence and danger are recognizable at a glance; the case-file UI supports play without competing with the scene.

Success is observable when a new player can identify the player, current objective, nearby action and next destination within five seconds; the core scene fits at 1280×800 without document scrolling; every case surface shares one visual language; and the complete T10 journey still passes without changes to collision, progression, scoring or privacy.

## Evidence and decisions

### Accepted constraints

- Preserve the approved bright stylized office, Phaser sprite-based 2.5D presentation, desktop keyboard controls, Vietnamese navigation and English case content.
- Phaser continues to own frame-level world rendering, animation, depth and effects. React continues to own semantic HUD, dialogue, notebook, conclusion, result and accessibility behavior.
- Preserve map coordinates, foot anchors, collision rectangles, scanner rules, session/progression contracts and the one-canvas/input lifecycle from L005/L006.
- All runtime art is local, versioned and recorded in `docs/assets/manifest.md`. No remote hotlinks, private solution data, secrets or unreviewed license obligations enter the frontend.
- Audio, touch controls, new gameplay, new story, backend/storage changes, 3D renderer migration and deployment remain outside this task.

### Current-product audit

- T09 established a coherent palette and accessible HUD, but every world object is still assembled from Phaser rectangles, circles, ellipses and text. The asset manifest contains no sprite, texture atlas, portrait, font or environmental art pipeline.
- Characters differ mostly by palette/badge; movement mirrors left/right but has no true four-direction idle/walk/run set. Props communicate function but not enough material, lighting or office identity to feel like a finished scene.
- The React shell is information-complete but text-heavy. Mission, controls, session diagnostics and action buttons occupy one persistent rail, while overlays reuse a general-purpose panel rather than purpose-specific game surfaces.
- Visible audit on baseline `6af49c0` at 1280×800 measured a 896×496 canvas, a 285×765 mission rail and 979px document height. The player must scroll the page although the game viewport itself is only about 62% of viewport height.
- The notebook dialog measured 820×342 before content growth. Its semantic structure and focus handling are strong foundations, but the visual hierarchy does not yet resemble an evidence board or investigative notebook.
- The Codex in-app browser was tried first and its trusted Node kernel reset. A visible Chrome fallback was used. The temporary preview used an isolated database and was removed after the audit.

### Recommended art direction

Use a **bright editorial detective** direction: warm paper and wood, teal/mint office surfaces, coral/amber action accents, dark blue-green ink outlines, soft contact shadows and restrained halftone/file-stamp details. The world stays friendly for learners while gaining stronger silhouettes, material contrast and mystery cues. Do not switch to dark noir, pixel art or realistic 3D.

Use a hybrid pipeline:

- Phaser texture atlases/local images for the office environment, characters, evidence props and effects.
- CSS/SVG-style local icons, tokens and semantic HTML for React UI; do not rasterize text or form controls.
- One consistent source strategy per asset family. Recommended: original AI-assisted concept/source art with manual cleanup and atlas normalization. Alternative: one licensed coherent asset pack with documented license. Mixing unrelated packs is excluded.
- Generate style frames before production assets. Approval of plan 1.0 authorizes the style-frame/design phase only; the chosen style frame and source/provenance strategy require a second visual checkpoint before runtime assets are bundled.

### Accepted V0 decision (2026-09-25)

- **Direction: A · Editorial detective**, as specified in `docs/design/t27-v0/direction-boards.html` (palette ink `#1d3b3a`, wall `#2f6f6a`, desk `#8fd3c1`, paper `#efe3cc`, coral `#e76f51`, amber `#f4a261`; 3 px ink outline; 3/4 top-down ~35°, 64 px tiles; soft contact shadow; light halftone/paper grain; ~2.6-head characters; Fraunces display + system sans UI; idle 4f / walk 6f / run 6f × 4 directions).
- **Asset source: original AI-assisted art** with manual cleanup and atlas normalization. No third-party asset packs. Every generated asset records tool, prompt summary, date, cleanup and license/terms note in `docs/assets/manifest.md` before it is bundled.
- Directions B and C are rejected. V0 exit gate passed; V1 may start.

## Scope

### Increment V0 — visual direction checkpoint

- Produce three compact direction boards derived from the same accepted bright-office default: recommended editorial detective, softer educational illustration, and clean modern corporate mystery.
- Show one representative gameplay frame, player/NPC silhouette set, evidence prop set and notebook/dialogue treatment for each direction.
- Record palette, line weight, perspective, shadow, texture, character proportions, icon rules, font stack, animation density, source method and estimated asset budget.
- Deliver one 1280×800 game-first wireframe and one notebook/dialogue wireframe. No product code changes in this increment.
- Exit gate: user selects one direction and approves original AI-assisted assets or a licensed-pack search. Do not infer this choice.

### Increment V1 — game-first shell and design system

- Convert the desktop shell to a viewport-first layout: compact case bar, dominant scene, collapsible mission drawer and short contextual control strip. Keep diagnostic/session detail available but visually secondary.
- Establish shared CSS and Phaser tokens for spacing, typography, elevation, outline, status, motion duration and reduced-motion behavior.
- Give loading, offline, session-missing, locked, success and recovery states distinct icon/text/shape treatments rather than color alone.
- Preserve the 390px readable-content/desktop-keyboard notice; do not claim mobile gameplay.

### Increment V2 — environment art and navigation readability

- Replace code-only furniture and zone fills with a coherent office atlas or small local texture set while retaining exact collision footprints and foot-depth anchors.
- Give lobby, work area, meeting zone and archive distinct floor/material/lighting cues. Add non-colliding details such as papers, cable runs, wall signage, lamps and plants only where they do not obscure routes.
- Upgrade checkpoint, scanner cone/range and evidence affordances with shape, motion and labels that remain legible without color.
- Add explicit asset preload/loading/error fallback. A missing texture must show a recoverable placeholder, not a blank scene.

### Increment V3 — character, interaction and motion polish

- Create consistent player/Maya/Leo/Nora sprite families with four-direction idle/walk/run poses, foot anchors and recognizable silhouettes; use portraits or busts in dialogue from the same style family.
- Add restrained dodge smear, interaction pulse, clue-acquired feedback and scanner alert effects. Motion must not alter movement speed, collision, detection or server progression.
- Keep React free of per-frame state. Use Phaser animation state and the existing typed bridge only for stable semantic events.
- Respect `prefers-reduced-motion` for DOM transitions and provide a Phaser-side reduced-motion setting or low-motion default for nonessential effects.

### Increment V4 — investigative UI surfaces

- Redesign dialogue as a speaker-focused surface with portrait, name, short transcript rhythm and clear locked/unlocked state.
- Redesign notebook as a near-full-height case workspace: evidence index, document reader, contextual vocabulary and question progress with fewer competing columns at laptop height.
- Present conclusion as an evidence-board composition while retaining semantic radios/checkboxes and confirmation; present scores/review with clear progress and explanation hierarchy.
- Keep keyboard navigation, visible focus, screen-reader names, live status and Escape/focus return behavior from the current implementation.

### Increment V5 — integration and visual QA

- Extend the headed T10 route with stable visual-state assertions for game-first layout, asset readiness, one canvas, overlay focus and responsive states. Use screenshots only as local review evidence; avoid brittle whole-page pixel equality.
- Run visible playtests at 1280×800 and 1100×720, inspect the 390px content shell, and cover loading/offline/missing-asset/reduced-motion recovery.
- Compare final frame cadence, readiness and bundle/asset transfer to T10. Investigate sustained frame intervals above 33ms, visible input lag, texture thrashing or a material startup regression.

### Expected affected areas

- `apps/web/src/game/presentation.ts`, `apps/web/src/game/scenes/**`, new `apps/web/src/game/assets/**`, Phaser preload/animation helpers and focused tests.
- `apps/web/src/App.tsx`, `SceneHud.tsx`, `ResolutionPanel.tsx`, CSS/tokens and UI tests.
- `apps/web/public/assets/**` or an equivalent local asset directory, `docs/assets/manifest.md`, README, E2E scenarios, task/quality/memory docs.
- No API, domain, database, case JSON truth, migration or admin implementation is expected.

### Delivery order and effort

Do not implement this as one large art replacement. Recommended order is V0 → V1 → V2 → V3 → V4 → V5, with a reviewable commit and visible browser checkpoint after each completed work session. V1 can land before final sprite production; V2/V3 must share the selected art bible; V4 can proceed in parallel only after tokens and portraits are stable.

Rough single-developer/AI-assisted effort after direction approval: V0 0.5–1 day, V1 1 day, V2 1.5–2.5 days, V3 1.5–2.5 days, V4 1–2 days, V5 1 day. A smaller 2–3 day slice should stop after V1 plus the highest-impact part of V2; it must not claim the full character/animation upgrade.

## Risks and controls

- **Style inconsistency:** approve one art bible and one source method before batching assets; reject unrelated one-off images even if individually attractive.
- **Generated/licensed provenance ambiguity:** record prompt/tool/source, creator, license, version, edits and attribution before bundling; do not ship an asset with unresolved rights.
- **Art changes gameplay geometry:** keep world coordinates/colliders in code, use foot-anchor metadata and run the complete real-keyboard route after each environment/character increment.
- **UI polish hides accessibility:** retain native semantic controls and focus order; decorative canvases/images never replace readable text, labels or status announcements.
- **Large textures hurt startup/frame rate:** use atlases sized for the viewport, lazy-load case art, avoid base64 embedding, cap individual atlases at 2048×2048 unless measurement justifies more, and compare against T10 metrics.
- **Scope expands into redesigning the game:** no new map, mechanic, dialogue branch, audio or backend contract. Any such need returns to define/approval.
- **Browser tooling remains unstable:** try the visible Codex browser first, then use visible Chrome/Playwright fallback and record the exact failure; never substitute a hidden/headless visual review.

## Acceptance and verification

### Visual/product acceptance

- At 1280×800 and 1100×720, the active game scene and essential HUD fit without document scrolling; the scene is the dominant visual surface and the mission rail can be collapsed without losing the current objective.
- Player, Maya, Leo and Nora are distinguishable by silhouette/portrait/details, not only hue or letter badge. Four-direction movement reads correctly and foot-based occlusion still works around desk, cabinet, planter and meeting table.
- Lobby, office, meeting and archive read as distinct connected zones; evidence, checkpoint and scanner danger are identifiable within one glance and remain understandable in grayscale/color-deficiency inspection.
- Dialogue, notebook, conclusion, result and review each have a purpose-specific hierarchy while keeping all current content, error, retry, locked and completion states.
- Loading or missing local art produces a visible recoverable state. No blank canvas, stuck input, duplicate canvas, lost focus or progression mutation occurs.
- Production bundles contain no private answers, solution sets, raw session values, source prompts containing secrets or unlicensed temporary art.

### Browser scenarios

- Visible preview of V0 direction boards/mockups before implementation approval.
- On the final revision, run the full T10 journey in a visible browser and manually inspect spawn, evidence, every NPC, checkpoint, scanner/dodge/retry, conclusion, result, review, reload and replay.
- Repeat the main route at 1100×720; inspect the 390px DOM shell and overlays without asserting touch gameplay.
- Exercise blur/pause, Escape close, canvas focus return, reduced motion, network error and intentionally missing-asset fallback.
- Record representative screenshots for local review, frame cadence, readiness, asset transfer size and the largest texture/JavaScript chunks.

### Script gates

- Focused presentation, GameHost, HUD/overlay and missing-asset tests.
- `npm --prefix apps/web run lint`, `typecheck`, `test:run`, `build`, `e2e:list` and headed `scripts/e2e.ps1`.
- Full `./scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe`.
- Asset manifest/license audit, production privacy scan, agent-doc check, `git diff --check`, clean status, scoped commit and push to configured `origin`.

## Handoff

Planning audit only on clean baseline `6af49c0`. The preview used visible Chrome after the Codex browser kernel reset; no product code, package, runtime asset, developer database or accepted product decision changed. T11 remains queued while the user considers this visual/UI detour.

Next action: start V3 — direction-A player/NPC sprites with 4-direction idle/walk/run and interaction feedback, keeping foot anchors and collision unchanged.

## V2 evidence (2026-09-25)

- Changed: 17 SVG textures in `apps/web/public/assets/office` generated by `scripts/art/office-svg.py`; `src/game/officeArt.ts` (keys, sizes, foot anchors, zones, decor, `isSvgDocument`); `OfficeScene` preloads, tiles four zone floors (lobby wood, office carpet, archive paper, meeting mint), draws furniture from textures on the unchanged collision rects, adds non-colliding decor, restricted tape, zone signs, pulsing evidence ring, checkpoint pad with ✓, scanner drone with sweep and dashed hazard corridor (tweens off under reduced motion); `art-missing` bridge event surfaces a DOM notice. Collision rects, scanner/checkpoint rules and API are unchanged.
- Defect found in browser: with a texture missing, Vite's SPA fallback returned `index.html` with 200 and Phaser's SVG loader threw `hasAttribute` uncaught, leaving a blank scene. Fix: load each texture as text, validate it with `isSvgDocument`, then feed a blob URL to the SVG loader; invalid files fall back to code-drawn primitives. Retest with `desk.svg` removed: scene renders, primitive desk shown, notice “Một số hình ảnh văn phòng không tải được…” visible. File restored.
- Visible browser 1280×800: all texture requests 200; zones distinct; player depth-sorts behind the planter; checkpoint pad, tape and meeting sign visible; final revision reloaded with textured desk and no fallback notice.
- Scripts on final revision: lint pass, typecheck pass, `test:run` 26/26 (5 new officeArt tests: files exist and match size, no remote URLs, zones tile the floor exactly, foot anchors, decor outside every interaction radius, HTML/broken SVG rejected), build pass (pre-existing Phaser chunk warning), headed `scripts/e2e.ps1`: 1 passed, ~60 fps, p95 17 ms.

## V1 evidence (2026-09-25)

- Changed: `apps/web/src/theme/tokens.ts` (colors, fonts, outline, motion, status glyphs, reduced-motion helper), `index.css` tokens and reduced-motion override, `App.tsx`/`App.css` viewport-first shell (compact case bar, dominant scene, collapsible mission drawer, control strip, secondary diagnostics), `StatusBadge.tsx` (loading/offline/missing/locked/success/recovery with distinct glyph + border shape), Phaser palette/fonts/camera-lerp reading tokens. No change to map, collision, scanner, session, scoring or API.
- 1280×800 in-app browser: canvas 958×651 (baseline 896×496), document height 800 (baseline 979, no scroll). Drawer collapse: `aria-expanded=false`, body hidden, canvas widens to 1234 px; re-open restores 1010 px.
- 375×812: no horizontal scroll, desktop-keyboard notice visible, API-down path shows two `offline` alerts with ⚠ glyph.
- Scripts on final revision: `lint` pass, `typecheck` pass, `test:run` 21/21 (3 new StatusBadge/token tests), `build` pass (pre-existing Phaser chunk-size warning), headed `scripts/e2e.ps1` via Windows PowerShell 5.1 + `.tools/dotnet`: 1 passed, ~60 fps, p95 frame 17 ms.
- Environment: the user-approved stop of the developer API (PID 5848) was required because it locked `OfficeCaseFiles.Api.exe` during the E2E build. `npm run e2e` needs `pwsh`, which is not installed here.

## Improvement review

- Result: candidate (L008, L009)
- V2 observation: a missing static asset can be served as a 200 HTML fallback, which crashes Phaser's SVG loader instead of firing its load-error event. Recorded as candidate L009 with the validate-then-load fix and a unit test.
- V1 observation: `npm run e2e` hard-codes `pwsh`, absent on this machine, and a running developer API locks the build output the E2E runner needs. Recorded as candidate L008; no script change until it recurs.
- Observation/evidence: T09 and T10 already supply the reusable React/Phaser lifecycle, visible-browser and integration-runner lessons. This audit found product-specific visual gaps, not a new cross-task failure mode.
- Mechanism changed or no-change reason: no rule, skill, script or runtime mechanism changed; the proposed art pipeline remains unapproved design scope.
- Validation: source/asset manifest review plus visible 1280×800 layout measurement on baseline `6af49c0`; generated preview state was removed and Git remained clean before documentation edits.
- Follow-up trigger: reassess after V0 direction-board review or the first real texture-atlas implementation failure.
