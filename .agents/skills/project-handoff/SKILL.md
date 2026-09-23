---
name: project-handoff
description: Restore or record durable project context when starting, pausing, resuming, or transferring an Office Case Files task.
---

# Project handoff

Read `AGENTS.md`, `docs/agent/protocol.md`, `docs/memory/current.md`, the active task, and relevant nested rules. Compare their claims with Git status and the actual files before acting.

When starting, report the approved scope, workflow checkpoint, verified state, and next action. Treat stale or contradictory memory as a finding to correct, not as authority over the user or code.

When pausing or finishing, update the task first, then `docs/memory/current.md`. Record:

- baseline and dirty paths;
- plan version, approval source/scope, and workflow step;
- behavior verified by current commands or browser scenarios;
- exact failed/not-run checks and blockers;
- one concrete next action and only the references needed for it.

Do not copy chat transcripts, secrets, raw tokens, large logs, or speculative conclusions into memory. A task is `done` only when its acceptance, browser evidence or justified N/A, and required scripts are recorded.
