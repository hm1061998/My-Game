# Web client rules

- React owns routes, menus, HUD, dialogs, notebook, accessibility, and server state. Phaser owns the render loop, transforms, input, collision, animation, camera, and transient encounter state.
- Communicate through typed commands/events in `src/game/bridge`; never call React state setters on every frame.
- Create one Phaser game per mount and destroy the game, listeners, timers, and held input on unmount or focus loss. Verify React StrictMode does not create duplicate canvases or input.
- Pause or gate simulation while a dialog/notebook is open. Return focus deliberately when it closes.
- Keep readable learning content in the DOM. Canvas-only text is not sufficient for dialogs, quests, or answers.
- Use generated API types once contract generation exists. Never edit generated files manually.
- Run `npm run lint`, `npm run typecheck`, `npm run test:run`, and `npm run build` for the final web revision, plus headed `scripts/e2e.ps1` when behavior changes (invocation in `docs/memory/current.md`).
- Load runtime art through the validated text-then-load path in `OfficeScene` (never a bare `load.svg`/`load.image` on a URL), keep a code-drawn fallback, and test the missing-file path in the real browser.
