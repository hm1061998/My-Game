# Current context

Updated: 2026-09-23
Baseline: d607390 before current working changes
Dirty workspace: approved T01/T02 implementation, not yet committed

## Confirmed scope

Browser-based 2.5D action detective RPG for A2-B1 English learning, office setting, React client, .NET backend, one developer, AI-friendly repository, extensible storage, and Docker/GitHub after code completion.

## Accepted defaults for current implementation

User approved proceeding with PROJECT_PLAN.md 1.3. Use Phaser sprite-based 2.5D, desktop keyboard controls, stealth/dodge action, bright stylized office, Vietnamese navigation with English case content, SQLite behind application storage ports, and server-side JSON case content. These defaults can be revisited by a later user decision.

## Proposed decisions still open

Case story details, final art source/style, public hosting, GitHub owner/repository visibility, image publishing, and whether a PostgreSQL adapter is included in the first delivery.

## Active task

T03 map and movement, owned by Codex, status planning. T01 and T02 are complete.

## Workflow checkpoint and approval

Plan: PROJECT_PLAN.md 1.3. Approved by the user's instruction to begin according to the plan. T02 reached completion. T03 is at the planning checkpoint and remains covered by the same approved project plan/defaults.

## Verified state

- Repository began with only the plan and a clean `main` branch at d607390.
- Node 24.19.0 and pnpm 11.19.0 are available.
- .NET SDK 10.0.401 was installed under ignored `.tools/dotnet` because no system `dotnet` existed.
- React/Vite template and dependencies were resolved into `apps/web/pnpm-lock.yaml`.
- React mounts one lazy-loaded Phaser canvas through a tested lifecycle host and displays an accessible DOM HUD.
- The API exposes `/api/v1/health`; the Vite proxy connected successfully during browser verification.
- Project skills `project-handoff` and `implement-vertical-slice` passed the official quick validator.

## Last checks

- `scripts/verify.ps1` with the temporary .NET SDK path: passed. Frontend lint/typecheck/1 test/build and backend locked restore/build/1 test all passed.
- Chrome headless browser verification at 1440×1000: passed; game ready and API connected were visible.
- Integrated CUA browser tool: unavailable because its trusted Node kernel exited before opening a tab. This is a tool limitation, not an application failure.

## Blockers and known issues

No product blocker. Vite reports the lazy Phaser chunk at about 1.38 MB minified; measure and optimize after T03 rather than hiding the warning. The Codex filesystem sandbox helper began failing after dependency tooling; commands and browser checks used explicit approved execution, and generated caches were removed afterward.

## Next action

Write the T03 task plan from the approved backlog, then implement the small office map and movement vertical slice.

## Relevant references

- `PROJECT_PLAN.md`
- `docs/tasks/T03-map-movement.md` once created
- `apps/web/AGENTS.md`
- `.agents/skills/implement-vertical-slice/SKILL.md`
