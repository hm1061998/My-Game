# Current context

Updated: 2026-09-25
Baseline: 10d2aa5
Dirty workspace: approved, uncommitted T03 map/movement implementation, README/task/memory updates, and verification-script correction. No unrelated changes were present at T03 start.

## Confirmed scope

Browser-based 2.5D action detective RPG for A2-B1 English learning, office setting, React client, .NET backend, one developer, AI-friendly repository, extensible storage, and Docker/GitHub after code completion.

## Accepted defaults for current implementation

User approved PROJECT_PLAN.md 1.3: Phaser sprite-based 2.5D, desktop keyboard controls, stealth/dodge action, bright stylized office, Vietnamese navigation with English case content, SQLite behind application storage ports, and server-side JSON case content. Record a new decision before materially changing a default.

## Proposed decisions still open

Case story details, final art source/style, public hosting, GitHub owner/repository visibility, image publishing, and whether a PostgreSQL adapter is included in the first delivery.

## Active task

T03 map and movement is complete; next planned slice is T04 storage/session foundation (not yet started or newly approved as a task). T01, T02, T13, and T14 are complete.

## Workflow checkpoint and approval

T03 was approved by the user's 2026-09-25 instruction “ok tiến hành tiếp theo plan” under PROJECT_PLAN.md 1.3. It reached browser confirmation, final scripts, improvement review, and handoff. No deployment or external publishing is authorized.

## Verified state

- Current office scene supports WASD/arrows, normalized diagonal motion, Shift run, solid furniture/floor bounds, foot-based depth, bounded camera follow, Escape pause/resume, and automatic pause/input reset on blur or hidden tab.
- React displays controls and play state; Phaser retains frame-level gameplay. The API health endpoint and Vite proxy remain connected in browser.
- Desktop canvas uses a stable 520 px host height (440 px at the mobile breakpoint); an earlier resize feedback loop was fixed.
- Browser checks covered held movement, collision, occlusion, camera, pause/resume, simulated blur, final reload and 1100 px laptop width. No page/console errors were observed. The headless browser did not produce a genuine OS focus-change event, so focus-loss behavior was checked with a dispatched `blur` event.
- npm is the sole package manager. Node 24.15.0/npm 11.12.1 were available via the developer installation. An official .NET SDK 10.0.401 is installed locally at the ignored `.tools/dotnet` path for this workspace; system `dotnet` remains unavailable in the sandbox PATH. README documents both system and local installation.
- `scripts/verify.ps1` now checks native command exit codes after each npm/.NET stage. L003 in `docs/agent/lessons.md` records the observed false-success failure and promotion to script enforcement.

## Last checks

- 2026-09-25 T03: `./scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe` passed: agent structural check, npm clean install (118 audited packages, 0 vulnerabilities), lint, typecheck, 5 Vitest tests, Vite build, .NET locked restore/build (0 warnings/errors), and 1 API test.
- Final browser reload showed the playable office and API connected. Playwright exercised the scenarios above on the final runtime revision.
- `git diff --check` passed after documentation updates.

## Blockers and known issues

No blocker for T03. Vite still warns that the lazy Phaser chunk is about 1.38 MB minified; measure and optimize with representative gameplay/assets. The local .NET installation is ignored and may need PATH setup in a new terminal.

## Next action

Start T04 with a task plan for session/storage ports, SQLite behind Infrastructure, and a browser-visible round trip only when that slice is approved. Preserve T03 gameplay as a regression scenario.

## Relevant references

- `PROJECT_PLAN.md`
- `README.md`
- `docs/tasks/T03-map-movement.md`
- `docs/tasks/index.md`
- `docs/agent/lessons.md`
- `apps/web/AGENTS.md`
- `.agents/skills/product-lifecycle/SKILL.md`
