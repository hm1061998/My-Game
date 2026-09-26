# T31 — Character sprite and portrait upgrade

Status: done
Owner: Codex
Depends on: T27, T30
Plan version: 1.0
Approval: user said “ok tiến hành đi” on 2026-09-26 after the proposed Player-first character/portrait upgrade. This approves improving the four existing characters before creating another level, within the accepted T27 bright editorial Phaser direction.
Lifecycle phase: handoff
Workflow step: plan/approval → art implementation → quick checks → visible browser preview/test → fix/retest → browser confirmation → scripts → handoff (complete)

## Outcome and entry evidence

T30 completed office lighting, but the four T27 character sheets remain simple geometric figures and their dialogue portraits are just magnified sprite frames. Current `main`/`origin/main` baseline `845ea01` is clean. The player, Maya, Leo and Nora should have stronger silhouettes, clothing/material detail and distinct expressive portrait busts visible at the real game scale. This is a bounded upgrade of existing authored SVGs, not the proposed large raster/Spine technology change in `docs/design/graphics-technology-options.md`.

## Scope and decisions

- Revise the original in-repo SVG authoring generator and regenerate the existing four 80×120, 3×16 sheets and four 160×160 portraits. Preserve row/column contracts, foot anchor, facing, local asset URLs and fallback behavior.
- Start with Player; then differentiate Maya, Leo and Nora through silhouette, accessories, face/hair and tailored clothing. Give portraits hand-composed busts with character-specific expressions rather than enlarging the game frame.
- Keep React/Phaser/API responsibilities, collisions, animations, progression, map, case content and current UI unchanged. No third-party art, new dependency, engine, raster pipeline, skeletal runtime, next level or admin work.
- Update asset provenance and durable task/memory handoff. User's standing instruction requires scoped commit and push after final verification.

## Acceptance and verification

- In visible headed browser at 1280×800 and 1100×720, player and each NPC are distinguishable without their labels; dialogue portraits match in-world identity. Inspect normal and grayscale views and reduced-motion mode.
- Idle/walk/run frames for down/up/side remain valid, render with correct foot-depth, and movement in all directions, dodge, collision, focus/pause, interactions and case journey remain intact.
- All eight local SVGs load as valid SVG, with no remote asset requests; missing sheet fallback remains recoverable.
- Run focused generator/asset tests, web lint/typecheck/tests/build, visible headed E2E, full local verify, agent-doc check and `git diff --check`. Do not wait for GitHub E2E per user's earlier instruction.

## Handoff

Completed the bounded T31 art pass on the clean `845ea01` baseline. `scripts/art/characters-svg.py` now generates more distinct Player/Maya/Leo/Nora in-world silhouettes with tailored clothing, shading, hair and role accessories across the existing down/up/side × idle/walk/run frames. All four portraits are separately composed shoulder-up SVGs with different facial attitudes and matching visual identities, not magnified sprite frames. Eight existing asset paths and the 80×120 foot/frame contract are unchanged; no runtime code, collision, progression, next level, dependency, third-party asset or admin scope changed. `docs/assets/manifest.md` records the T27 original provenance and T31 refinement.

Visible browser evidence: the integrated `http://127.0.0.1:5174` headed Chromium suite passed 7/7 twice, with the final run after the browser assertions. The real case journey exercised multi-direction walking, dodge/retry, Maya and Nora dialogue, checkpoint, reload and replay; attached screenshots show their 88 px portraits rendering correctly. The visual-state test decoded all four 160×160 portraits, loaded all local art, inspected 1280×800, 1100×720 and grayscale screenshots, reduced motion and missing-sheet/HTML-fallback recovery. Reviewed final screenshots: Player and Leo are legible in the live canvas; the new Maya/Nora portraits show distinct features. The Codex in-app panel open request returned `queued` and CUA kernel exited; the visible headed Chromium window was the working product-browser preview. No developer database was changed. The local asset-transfer measurement was 545,355 bytes including four additionally requested portraits; approximate frame sample remained 60 fps/p95 17 ms. This is visual/browser evidence, not a human taste survey.

Script evidence: focused 4/4 character-art tests; final `scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe` passed docs check, lint, typecheck, all 47 web tests, production build and 12 API tests. `npm --prefix apps/web run e2e:list` found the expected 7 headed tests; `git diff --check` passed. Initial full verify failed only because the new SVG unit test imported `jsdom` without TypeScript declarations; replaced that import with the test environment's `DOMParser`, then typecheck and the entire full verify passed. npm printed the known non-blocking Node 22/npm 10 engine warning; Vite printed its existing `advancedChunks` deprecation warning. GitHub E2E was not awaited per user instruction.

Limitation: these are refined original SVG frame sheets and static expressive dialogue portraits, not the separate proposed raster/skeletal technology upgrade or animated facial lip-sync. Next phase: define the next non-admin playable case/level as a separate scoped task if the user wants to proceed; T15–T26 admin remains deferred. Scoped commit/push to `origin/main` follows this handoff.

## Improvement review

- Result: none.
- Observation/evidence: the only rework was a one-off missing type declaration in the new SVG test, caught by the required full typecheck; the already verified L014 shell-helper/CUA issue recurred without new behavior.
- Mechanism changed or no-change reason: no new rule or lesson; existing typecheck gate and L014 recovery already cover these cases.
- Validation: reran typecheck and full local verify after fixing the test; final headed browser suite, docs check and diff check passed.
- Follow-up trigger: revisit only if vector-art upgrades repeat a failure that current browser/type/asset checks miss.
