# Current context

Updated: 2026-09-25
Baseline: 8e772be
Dirty workspace: approved T13 npm/environment changes plus approved T14 agent lifecycle/improvement rules, docs, skills, task records, and verification script

## Confirmed scope

Browser-based 2.5D action detective RPG for A2-B1 English learning, office setting, React client, .NET backend, one developer, AI-friendly repository, extensible storage, and Docker/GitHub after code completion.

## Accepted defaults for current implementation

User approved proceeding with PROJECT_PLAN.md 1.3. Use Phaser sprite-based 2.5D, desktop keyboard controls, stealth/dodge action, bright stylized office, Vietnamese navigation with English case content, SQLite behind application storage ports, and server-side JSON case content. These defaults can be revisited by a later user decision.

## Proposed decisions still open

Case story details, final art source/style, public hosting, GitHub owner/repository visibility, image publishing, and whether a PostgreSQL adapter is included in the first delivery.

## Active task

T03 map and movement, owned by Codex, status planning. T01 and T02 are complete.

## Workflow checkpoint and approval

Plan: PROJECT_PLAN.md 1.3. Approved by the user's instruction to begin according to the plan. T02 reached completion. T03 is at the planning checkpoint and remains covered by the same approved project plan/defaults. T13 npm/environment work is complete. T14 was approved by the user's request for continuous agent improvement and full product lifecycle except deployment, and is complete.

## Verified state

- Repository began with only the plan at d607390; current committed baseline is 8e772be.
- Git 2.45.0 and PowerShell 7.6.5 are available in the checked environment.
- The developer installation exposes Node 24.15.0 and npm 11.12.1. npm is the sole repository package manager; Node is recorded in `.nvmrc`, npm in `package.json`, and dependencies in `package-lock.json`.
- No system `dotnet` is exposed and the earlier temporary `.tools/dotnet` installation is no longer present. README documents system-wide SDK 10 installation and an exact local 10.0.401 fallback.
- React/Vite dependencies are reproducibly resolved by `apps/web/package-lock.json`.
- React mounts one lazy-loaded Phaser canvas through a tested lifecycle host and displays an accessible DOM HUD.
- The API exposes `/api/v1/health`; the Vite proxy connected successfully during browser verification.
- Project skills `project-handoff` and `implement-vertical-slice` passed the official quick validator.
- Agents now cover discovery through release readiness and handoff; deployment/publish/push/production mutation remains outside the lifecycle.
- Every task must record an improvement result. `docs/agent/lessons.md` tracks cross-task maturity, and `scripts/check-agent-docs.ps1` enforces the required foundation/sections.
- Project skill `product-lifecycle` is discoverable and passed the official quick validator; the updated handoff and vertical-slice skills also pass.

## Last checks

- 2026-09-25 T13 npm migration: `npm ci` audited 118 packages with 0 vulnerabilities; lint, typecheck, 1 test, and production build passed.
- `scripts/verify.ps1`: all npm stages passed and the script then failed at `dotnet restore` because the required SDK is absent. Backend checks remain not run. Browser verification: N/A because package-manager and documentation changes do not alter runtime behavior.
- 2026-09-25 T14: all three project skills passed the official quick validator. Final `scripts/verify.ps1` passed the agent structural check and all npm stages, then stopped at the known missing `dotnet` prerequisite. `git diff --check` passed; browser N/A for workflow-only changes.
- 2026-09-23 T02 historical evidence: full `scripts/verify.ps1` passed using the temporary SDK; Chrome headless showed game ready and API connected.

## Blockers and known issues

Local backend work is blocked until .NET SDK 10 is installed again. Vite reports the lazy Phaser chunk at about 1.38 MB minified; measure and optimize after T03 rather than hiding the warning.

## Next action

User: install .NET SDK 10 using README, then run `./scripts/verify.ps1`. Project work after environment setup: write the T03 task plan, then implement the small office map and movement vertical slice.

## Relevant references

- `PROJECT_PLAN.md`
- `README.md`
- `docs/tasks/T13-environment-readme.md`
- `docs/tasks/T03-map-movement.md` once created
- `apps/web/AGENTS.md`
- `.agents/skills/implement-vertical-slice/SKILL.md`
