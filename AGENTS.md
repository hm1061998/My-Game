# Office Case Files agent guide

## Project

Build a browser-based 2.5D action detective RPG that teaches A2-B1 English. React owns the application UI, Phaser owns frame-level gameplay, and ASP.NET Core owns trusted progression and scoring. Read `PROJECT_PLAN.md` for the full product plan.

The current approved defaults are: Phaser sprite-based 2.5D, desktop keyboard controls, stealth/dodge action, bright stylized office, Vietnamese navigation with English case content, SQLite behind storage ports, and server-side JSON case content. Record a new decision before changing one of these materially.

## Start every task

1. Read `docs/agent/protocol.md`, `docs/memory/current.md`, and the active task under `docs/tasks/`.
2. Check Git status and preserve changes outside the task.
3. Read the closest nested `AGENTS.md` for directories you will edit.
4. Confirm the workflow checkpoint and approval recorded in the task. Do not ask again for an approval that still covers the same scope.
5. Load only the relevant project skill from `docs/agent/skills-index.md`.
6. Read `docs/agent/improvement.md` and inspect open lessons relevant to the task in `docs/agent/lessons.md`.

## Product lifecycle mandate

- Agents may own work from discovery and requirements through product/design decisions, architecture, implementation, content, QA, security/privacy review, packaging, documentation, release readiness, and handoff.
- Use the smallest lifecycle slice that fits the request, but state the current phase, entry evidence, exit gate, and next phase in the task.
- Release readiness may create local artifacts, runbooks, Docker/CI configuration, and rollback plans when its prerequisite gate is approved. It does not authorize deployment, publishing, pushing, production mutation, account creation, or secret use.
- Deployment is outside the current agent lifecycle until the user adds and approves a deployment phase.

## Working rules

- Follow the approved sequence: plan, approval, coding, quick checks, browser preview, browser test, fix/retest, browser confirmation, scripts, completion.
- Do not mark work done without current browser and script evidence. Use `N/A` only with a concrete reason.
- Keep React, the Phaser runtime, application use cases, domain rules, and storage adapters separated by their documented boundaries.
- Do not put solutions, correct choices, raw session tokens, secrets, or private case bundles in the frontend.
- Do not expose EF types, provider-specific SQL, file paths, or `IQueryable` outside Infrastructure.
- Use commands documented in the repository. Report `not run` or a real blocker rather than claiming success.
- Add dependencies only for a present task and update the lockfile.
- Record decisions as proposed or accepted accurately. Memory never outranks the user's current instruction.
- Update the task and `docs/memory/current.md` at a meaningful checkpoint or handoff.
- Run the improvement review in `docs/agent/improvement.md` before every task handoff. Record `none` with a reason when no durable lesson exists.
- Promote a lesson into a rule, skill, script, template, or ADR only after evidence supports reuse; validate the changed mechanism and avoid creating one for every small fix.
- Docker and GitHub configuration begin only after the `code_complete` gate in `PROJECT_PLAN.md`.

## Quality and safety

- Test gameplay behavior in the real canvas: input, collision, depth, pause/focus, interactions, retry, and checkpoints where relevant.
- Run focused checks while coding and the agreed full gates on the final revision.
- Do not reset, delete, or overwrite unrelated user work.
- Do not deploy, publish an image, make a repository public, or push to an unknown remote without the missing destination and authority.
- Never let a self-improvement change broaden permissions, weaken approvals/tests, rewrite product intent, or authorize deployment.
