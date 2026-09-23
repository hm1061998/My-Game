# Web client rules

- React owns routes, menus, HUD, dialogs, notebook, accessibility, and server state. Phaser owns the render loop, transforms, input, collision, animation, camera, and transient encounter state.
- Communicate through typed commands/events in `src/game/bridge`; never call React state setters on every frame.
- Create one Phaser game per mount and destroy the game, listeners, timers, and held input on unmount or focus loss. Verify React StrictMode does not create duplicate canvases or input.
- Pause or gate simulation while a dialog/notebook is open. Return focus deliberately when it closes.
- Keep readable learning content in the DOM. Canvas-only text is not sufficient for dialogs, quests, or answers.
- Use generated API types once contract generation exists. Never edit generated files manually.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test:run`, and `pnpm build` for the final web revision.
