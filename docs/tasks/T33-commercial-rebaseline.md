# T33 — Reconcile skills and propose a commercial game plan

Status: done (local documentation proposal; product decisions await owner review)
Owner: Codex
Depends on: T32 and the playable prototype
Plan version: proposal 1.0
Approval: user's 2026-09-27 requests to reconcile preexisting skills with the 16 installed skills, reassess the game for commercial appeal, and add optional Vietnamese subtitles to English dialogue and clues. Approval covers documentation and skill reconciliation, not product implementation or deployment.
Lifecycle phase: discover → define/design → verify → handoff
Workflow step: completed through documentation checks and handoff; browser N/A for documentation and agent instructions

## Outcome and success signal

Provide a reviewable proposal for a browser detective game that is fun to play and teaches A2–B1 English, with a plausible route to self-purchase. Keep useful project skills, resolve any contradictory instruction, and accurately mark proposed changes apart from accepted defaults.

## Evidence and decisions

- User answers: individual learners purchase for themselves; first commercial platform is the browser; the one-person/one-week limit no longer applies; asset sourcing combines licensed assets, AI, and manual finishing. English dialogue and clues need Vietnamese subtitles/translations that players can show or hide.
- Existing prototype: one playable office case with React UI, Phaser gameplay, .NET trusted scoring/progression and SQLite persistence. T27–T31 report technical/browser verification of visual and audio improvements, but no independent target-learner playtest or willingness-to-pay evidence.
- T15–T26 admin documentation remains approved and deferred. Resequencing it is proposed, not silently accepted.
- Source research and limits are linked in `docs/product/commercial-rebaseline-proposal.md`.
- Skill audit: `project-handoff` and `implement-vertical-slice` provide project-specific guidance; `product-lifecycle` needed a narrow push-authority clarification. The current user request and root `AGENTS.md` control priority.
- Windows terminal fault diagnosed from `C:\Users\Minh\.codex\.sandbox\sandbox.2026-09-27.log`: setup refresh could not update a deny ACE on `.agents`. The directory owner was `Admin\CodexSandboxOffline`, unlike the project owner `Admin\Minh`. Auto-review initially rejected owner transfer as an unapproved persistent ACL change. The user explicitly approved that precise transfer; a normal token received `Access is denied`, and an interactive UAC run changed only `.agents` owner. A subsequent non-escalated `git status` succeeded. Existing ACL entries were not deliberately changed.

## Scope

- Included: proposed commercial plan, historical-plan pointer, skill conflict resolution and audit, task/memory handoff, focused documentation checks.
- Excluded: game code, new product dependencies, paid checkout/account setup, deployment, publishing and any engine migration.
- Files: root `AGENTS.md`, `PROJECT_PLAN.md`, `.agents/skills/product-lifecycle/SKILL.md`, `docs/product/commercial-rebaseline-proposal.md`, `docs/agent/skills-reconciliation-2026-09-27.md`, this task, task index and current memory.
- Risks: plan estimates and conversion assumptions are hypotheses; human learner tests, asset cost/licensing and merchant eligibility still require evidence. The previous push rejection remains in force.

## Acceptance and verification

- Skills audit names all three old skills and explains keep/edit decisions; pointer metadata stays valid.
- Proposal describes the current baseline, gameplay/learning loop, visual/animation/audio gaps, optional Vietnamese subtitles, technical bakeoff, phased gates, commercial risks and pending owner decisions.
- `PROJECT_PLAN.md` makes the old one-week assumption visibly historical.
- Run `scripts/check-agent-docs.ps1`, skill frontmatter/pointer checks and `git diff --check`. Browser: N/A because no gameplay or UI code changes. Full app scripts: N/A for the same reason.

## Handoff

- Baseline: `main` at T32 local commit `6da1710`, one ahead of `origin/main` before T33; project files were clean at task start.
- Actual results: Windows sandbox repaired as recorded above; normal `git status` succeeds. The proposal, skill audit, plan pointer, and conflict clarification are saved. `scripts/check-agent-docs.ps1` passed for 34 task files; `git diff --check` passed on tracked edits; the three original skill frontmatter files and their Claude pointers passed a focused check. A final staged diff check is recorded at commit.
- Browser and full app scripts: N/A because this task changes only documentation and agent guidance; no application route or behavior changed.
- Push: prior auto-review rejection for remote ownership/trust remains unresolved; do not retry via another command path.
- Next action: user reviews the proposed product decisions; after approval, split M0 research and M1 visual/game-feel experiment into scoped tasks. The earlier push rejection requires separate resolution before any push.

## Improvement review

- Result: verified update to existing L014
- Observation/evidence: Windows sandbox log identifies an ACL-owner failure on `.agents`, confirmed by restored default terminal after the authorized owner change.
- Mechanism changed or no-change reason: L014 now directs log-first diagnosis and exact-path approval for any ACL/owner repair; no automatic permission change or script was added.
- Validation: default sandboxed `git status` passed after the change, and agent documentation check passed. Skill and pointer checks passed.
- Follow-up trigger: repeat only if a future sandbox setup reports the same ACL target failure.
