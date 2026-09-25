# T11 — Handoff verification and lesson cleanup

Status: awaiting_approval
Owner: Claude
Depends on: T01–T10 (and T27, completed since)
Plan version: PROJECT_PLAN.md 1.4 row T11, T11 plan 1.0
Approval: pending user approval of plan 1.0
Lifecycle phase: handoff
Workflow step: plan drafted; no memory, lesson or rule file changed yet

## Outcome and success signal

A fresh agent with no chat history, entering through `AGENTS.md` (Codex path) or `CLAUDE.md` (Claude Code path), identifies the correct active/next task, its approval state, the required checks and the stop conditions — without relying on stale or contradictory memory.

Success signal (PROJECT_PLAN §9 row T11, §10.1 "Agents"): two blind handoff probes both return answers matching the answer key below, and `docs/memory/current.md` plus `docs/agent/lessons.md` contain only current, non-duplicated guidance.

## Evidence and decisions

Verified facts (2026-09-25, baseline `87bfb7f`):

- `docs/memory/current.md` (107 lines) still carries superseded history: baseline `6af49c0`, "T09 coding awaits approval", "T10 coding awaits approval", "Dirty workspace: none after T27 approval commit", and a "Proposed decisions still open" list that includes the now-decided art source/style.
- `docs/agent/lessons.md` has 10 entries; L003 and L008 overlap (native-process locks during `npm ci`/build); L001/L002 are old candidates with no recurrence since T13.
- `npm run e2e` hard-codes `pwsh`, which is absent on this machine; the working invocation is `powershell -File scripts/e2e.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe`. README does not state this.
- Claude Code entry (`CLAUDE.md` → `@AGENTS.md`, `.claude/skills` pointers) exists since `c80c978`; it has never been exercised by a fresh session.
- `.claude/launch.json` is untracked local preview config.

Decisions proposed in this plan:

- Probe method: launch two isolated subagents with no conversation context (one told to enter via `AGENTS.md`, one via `CLAUDE.md`), read-only tools, and a fixed question list. Their answers are graded against the answer key; a mismatch is a defect in the docs, fixed and re-probed.
- Memory is rewritten as current state only; history stays in task files and Git.
- `.claude/launch.json` is committed as shared local preview config (uses `.tools/dotnet`, no secrets), unless the user prefers it ignored.

## Scope

Included:

- Rewrite `docs/memory/current.md` to current state (baseline, completed tasks, next task, standing approvals, stop boundaries, verification commands).
- Lesson ledger cleanup: merge L008 into a verified Windows-runner preflight entry (with L003/L007 cross-reference), review L001/L002/L010 for retire/keep, keep promoted entries short with pointers.
- README: document the Windows PowerShell 5.1 E2E invocation and "stop preview servers before `verify.ps1`/E2E".
- `docs/tasks/index.md`: add T11 link/status.
- Two blind handoff probes, fix/retest loop, then task/memory handoff.

Excluded: product code, gameplay, API, schema, assets, T12 export/import, admin implementation, Docker/CI, deployment, publishing. No change to approval or verification rules except wording that removes contradictions.

Affected files: `docs/memory/current.md`, `docs/agent/lessons.md`, `docs/tasks/index.md`, `docs/tasks/T11-handoff-verification.md`, `README.md`, optionally `.claude/launch.json`.

Risks: over-pruning memory could drop a live constraint (mitigation: every removed line is either superseded by a task file or restated in the new memory); probe agents could read chat-derived hints (mitigation: prompts contain only the entry file and questions).

## Acceptance and verification

Answer key for both probes:

1. Next task: T12 storage round-trip/local runbook (T11 done); T12 has no approved plan, so the agent must plan and ask for approval before coding.
2. Standing rules: plan → approval → code → quick checks → visible browser → scripts → commit + push to configured `origin`; never deploy/publish; browser must be visible.
3. Required checks for a web change: `npm --prefix apps/web run lint|typecheck|test:run|build`, headed `scripts/e2e.ps1` (via Windows PowerShell on this machine), `scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe`, `scripts/check-agent-docs.ps1`.
4. Stop conditions: admin T15–T26 implementation deferred; Docker/CI only after `code_complete`; no secrets/deployment.
5. Asset rule: runtime art through the validated loader with fallback, listed in `docs/assets/manifest.md`.

Browser verification: N/A — documentation/agent-context task with no product surface change; the probes are the behavioral test.

Scripts: `scripts/check-agent-docs.ps1`, `git diff --check`, clean status after commit.

## Handoff

Pending approval. Baseline `87bfb7f`; untracked `.claude/launch.json`.

## Improvement review

- Result: pending
- Observation/evidence: pending
- Mechanism changed or no-change reason: pending
- Validation: pending
- Follow-up trigger: pending
