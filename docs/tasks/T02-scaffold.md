# T02 — React, Phaser, and .NET scaffold

Status: done
Owner: Codex
Depends on: T01
Plan version: PROJECT_PLAN.md 1.3
Approval: user message “bắt đầu tiến hành theo kế hoạch”, current session, covering implementation of the approved plan
Workflow step: complete

## Outcome

Create the smallest running vertical foundation: React mounts exactly one Phaser canvas, displays a DOM HUD, calls a .NET health endpoint, and cleans up correctly.

## Scope

Included: pinned toolchain, root scripts/docs, client runtime bridge/lifecycle, API health endpoint, meaningful smoke tests, and browser preview. Excluded: map, player movement, SQLite implementation, Docker, and GitHub Actions.

## Acceptance

- A React route renders one Phaser canvas and accessible DOM status.
- StrictMode/remount does not leave duplicate canvases or listeners.
- Client fetches `/api/v1/health` through the Vite proxy.
- API has no template weather endpoint and builds with warnings as errors.
- Frontend lint, typecheck, tests, and build pass; backend build/tests pass.
- Browser preview shows the running game foundation with no blocking console/network error.

## Browser verification

- URL: `http://127.0.0.1:5173`, Vite development build, 2026-09-23.
- Chrome headless at 1440×1000 rendered the React layout and Phaser canvas. Visual inspection confirmed the case heading, mission card, 2.5D foundation scene, one investigator, one desk, and readable controls.
- DOM status displayed “Hiện trường đã sẵn sàng” and “API — Đã kết nối”, confirming the client loaded Phaser and fetched the real `/api/v1/health` endpoint through the proxy.
- Server logs showed Vite on 5173 and ASP.NET Core on 5062 with no stderr output. Integrated CUA browser tabs failed before opening because their kernel exited, so Chrome headless supplied the browser evidence.
- Final screenshot was copied to the task visualization workspace as `browser-preview.png`; it is not a repository artifact.

## Final script checks

- `./scripts/verify.ps1 -DotnetCommand <temporary SDK path>`: passed on the final revision before documentation-only handoff updates.
- Frontend: pnpm frozen install, oxlint, TypeScript, 1 Vitest lifecycle test, and Vite production build passed.
- Backend: locked restore, build with 0 warnings/errors, and 1 xUnit test passed.
- Phaser is lazy-loaded into a separate game chunk. The game chunk is about 1.38 MB minified and Vite reports a size warning; optimization is deferred until gameplay/assets give a meaningful measurement.
- Both project skills passed `skill-creator/scripts/quick_validate.py` using PyYAML installed in a temporary dependency directory.

## Handoff

T02 meets its acceptance. T03 should replace the static foundation scene with a small office map, player movement, collision, foot-based depth, camera bounds, and pause/focus behavior. Keep the existing React/Phaser lifecycle boundary.

## Improvement review

- Result: none (retrospective record added by T14).
- Observation/evidence: lifecycle cleanup, API proxy, and verification behavior were captured in code/tests and the existing vertical-slice skill; the Phaser chunk warning remains a measured backlog item rather than an agent rule.
- Mechanism changed or no-change reason: no new rule or skill was warranted from the completed scaffold alone.
- Validation: T14 agent-foundation structural check includes this task.
- Follow-up trigger: revisit the chunk only after T03 supplies representative gameplay/assets.
