# Current context

Updated: 2026-09-25
Baseline: `main` at the T11 completion commit (see `git log -1`); previous `87bfb7f` (T27 V5)
Dirty workspace: none expected after T11. Never commit `office-case-files.db`, `.tools/`, `test-results/` or `playwright-report/`.

This file holds current state only. History and evidence live in task files under `docs/tasks/` and in Git.

## Product and accepted defaults

Browser-based 2.5D action detective RPG teaching A2–B1 English in an office setting. React owns application UI, Phaser owns frame-level gameplay, ASP.NET Core owns trusted progression and scoring (PROJECT_PLAN.md 1.4).

Accepted defaults: Phaser sprite-based 2.5D, desktop keyboard controls, stealth/dodge action, bright stylized office, Vietnamese navigation with English case content, SQLite behind storage ports, server-side JSON case content. Visual direction A "editorial detective" with original AI-assisted SVG art authored in-repo (T27). Record a decision before materially changing a default.

Still open: public hosting, GitHub visibility, image publishing, PostgreSQL adapter timing, OpenAPI → TypeScript codegen (two generators rejected: TypeScript 6 incompatibility / npm audit advisories; runtime response validation used instead), and the admin-portal production choices that T16 must record.

## Task state

- Done: T01–T11, T13, T14, T27.
- Next: **T12 storage round-trip / local runbook** (depends on T10, T11). No plan file or approval exists yet: draft `docs/tasks/T12-*.md` from `TEMPLATE.md` and get user approval before any code.
- Approved but deferred: T15 admin epic and T16–T26. Documentation only; no admin code, dependency, migration, account, secret or external service until the user starts them.
- After T12 and the BUFFER task: record `code_complete`. Docker/GitHub configuration starts only after that gate.

## Standing approvals and boundaries

- Every task: plan → user approval (recorded in the task) → code → quick checks → visible browser preview/test → fix/retest → final browser confirmation → scripts → improvement review → task then memory update.
- Browser checks must be visible to the user; never headless or a hidden tab.
- After each completed work session: commit only scoped verified changes and push the current branch to the configured `origin` (user standing instruction). Stop and report if branch/remote/auth is ambiguous.
- Never deploy, publish images, change repository visibility, create accounts or use secrets.

## Verification commands (this machine)

- Web: `npm --prefix apps/web run lint`, `typecheck`, `test:run`, `build`, `e2e:list`.
- Headed E2E: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/e2e.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe` (`npm run e2e` needs `pwsh`, which is not installed). 4 tests: critical journey + 3 visual-state checks.
- Full: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe`; agent docs: `scripts/check-agent-docs.ps1`.
- Preflight (L008): stop preview Vite/API servers first; a running API locks `services/api/bin`, a running Vite locks `node_modules` for `npm ci`. Ask before stopping a user-owned process.
- Local preview: `.claude/launch.json` (`api` on 5062 via `.tools/dotnet`, `web` on 5173). Open `http://127.0.0.1:5173`; `localhost` is rejected by the API origin check.

## Verified product state (latest)

- Full case playable end to end: movement/collision/depth, six clues, three NPCs, Q01–Q03 with unlocks, meeting checkpoint, scanner dodge/retry/assist, immutable conclusion with separate reading/investigation scores, five review items, reload persistence, replay. Private answers stay server-side.
- T27: game-first shell (canvas 958×651 at 1280×800, no page scroll), shared tokens (`apps/web/src/theme/tokens.ts`), status badges not relying on color, 17 office + 8 character SVGs via `scripts/art/*.py`, validated asset loading with code-drawn fallback, four-direction character sprites, investigative UI surfaces. QA: `docs/quality/T27-visual-qa.md`.
- Last full gates (T27 V5): `verify.ps1` pass (30 web tests, 9 API tests), headed E2E 4/4, ~60 fps, p95 17 ms.

## Known issues

- Vite warns about the ~1.40 MB lazy Phaser chunk (known optimization item).
- `verify.ps1` may report a Node engine warning when the shell resolves an older Node; the approved Node 24/npm 11 path passes.
- The Codex in-app browser previously failed with a Windows sandbox helper error; the Claude in-app browser and visible Chrome both work.

## Relevant references

- `AGENTS.md`, `CLAUDE.md`, `docs/agent/protocol.md`, `docs/agent/improvement.md`, `docs/agent/lessons.md`, `docs/agent/skills-index.md`
- `docs/tasks/index.md`, `docs/tasks/TEMPLATE.md`, `PROJECT_PLAN.md` (T12 row and §10)
- `apps/web/AGENTS.md`, `services/api/AGENTS.md`, `docs/assets/manifest.md`, `README.md`
