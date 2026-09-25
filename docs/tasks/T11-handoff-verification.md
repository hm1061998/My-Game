# T11 — Handoff verification and lesson cleanup

Status: done
Owner: Claude
Depends on: T01–T10 (and T27, completed since)
Plan version: PROJECT_PLAN.md 1.4 row T11, T11 plan 1.0
Approval: user approved plan 1.0 on 2026-09-25 with “duyệt kế hoạch”; `.claude/launch.json` committed as proposed (no objection raised)
Lifecycle phase: handoff
Workflow step: complete — cleanup done, two blind probes graded, defects fixed, clean-state re-probe passed

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

Baseline before T11: `87bfb7f`; plan commit `c95f768`.

Changed:

- `docs/memory/current.md` rewritten to current state only (107 → ~60 lines): product/defaults, task state (next T12 needs plan + approval), standing approvals, verification commands with the Windows E2E invocation and L008 preflight, latest verified state, known issues.
- `docs/agent/lessons.md`: L008 promoted (third recurrence: T03 EPERM, T27 V1 lock, T27 V5 EPERM) into memory + README; L002 and L010 verified by recurrence; L001 unchanged candidate.
- `README.md`: troubleshooting for missing `pwsh`, `npm ci` EPERM / MSB3027 locks and the `localhost` 403; lifecycle paragraph no longer contradicts the standing commit-and-push instruction.
- `docs/tasks/index.md`: T27 row corrected from stale `awaiting_approval` to `done`, T11 done, BUFFER row added, meaning of `approved` on T15–T26 stated.
- `apps/web/AGENTS.md`: final web checks mention headed E2E when behavior changes.
- `.claude/launch.json` committed (local preview config, no secrets).

Blind probes (Explore subagents, no chat context, read-only):

| Probe | Entry | Answer key 1–5 | Findings acted on |
| --- | --- | --- | --- |
| A | `AGENTS.md` | 5/5 correct | T27 index row stale; T11 file handoff said "Pending approval"; `apps/web/AGENTS.md` listed 4 checks only |
| B | `CLAUDE.md` → `@AGENTS.md` → `.claude/skills` pointers | 5/5 correct, plus correct skill choice and `.agents` source of truth | BUFFER missing from index; `approved` ambiguity |

Both also reported the in-progress T11 state and dirty workspace, which were expected mid-task. `npm run e2e` still calls `pwsh`; this is documented rather than changed (script change was out of plan scope).

Browser: N/A — documentation/agent-context task with no product surface change; the probes are the behavioral test.

Next action: draft the T12 plan from `TEMPLATE.md` and ask for approval.

## Improvement review

- Result: promoted (L008), verified (L002, L010)
- Observation/evidence: stale memory accumulated because each task appended history instead of replacing state; a status sed in T27 silently failed and left the index wrong, which only the blind probe caught.
- Mechanism changed or no-change reason: memory now states "current state only" at the top; L008 preflight encoded in memory and README. No new script: the probe is judgment-based and cheap to rerun with a subagent.
- Validation: two blind probes graded against the answer key; `scripts/check-agent-docs.ps1` and `git diff --check` pass; clean-state re-probe after commit found one stale line (T27 "Next action: resume queued T11"), fixed; no other mismatch.
- Follow-up trigger: rerun a blind probe at the end of T12 and before `code_complete`; if a status edit silently fails again, add an index-vs-task status consistency check to `check-agent-docs.ps1`.
