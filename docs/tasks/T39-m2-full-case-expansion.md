# T39 — M2 full-case expansion: The Swapped Report

Status: design draft written; waiting for owner review  
Owner: Codex/integration lead  
Depends on: T36, T37, T38  
Plan version: design 1.0  
Lifecycle phase: design  
Entry evidence: user says the M1 3–5 minute passage is too small for real learners, wants a broader game and enough English learning content first, and authorizes AI agents to help implement. The owner selected expansion of The Swapped Report, approved a three-act case with several areas, approved the duration/content targets, selected a connected scrolling Phaser map, approved the AI four-stage workflow, and approved the M2 completion gate on 2026-09-27.

## Current step and next action

The written design spec is drafted at [M2 full-case expansion design](../superpowers/specs/2026-09-27-m2-full-case-expansion-design.md). Current workflow step: owner review of written spec. Do not write the implementation plan or modify product code until the owner approves this spec. After approval, create the file-scoped implementation plan and request its review/approval separately.

## Agreed direction

Expand one existing case into a 25–35 minute, three-act investigation across three visually distinct connected areas in one scrolling Phaser map. Target 8–10 evidence records, two short fair dodge beats, at least 16 contextualized workplace-English chunks, optional Vietnamese hidden by default, a cited-evidence conclusion and end-of-case review. Keep current React/Phaser/API ownership and server-side private answers. Paid/monetization work and real learner contact remain out of scope.

AI workflow: content author; independent deduction and A2–B1/translation reviewers; scoped implementation slices with review; five independent AI player-role critiques; integration owner performs visible headed browser QA and script verification. AI simulations are hypotheses only.

## Scope and non-goals

Scope is one complete case expansion, minimum map/content changes, learning content, evidence logic, two dodge beats, conclusion/review, and the verification needed for a real browser game. No second case, admin portal, paid assets/vendor quotes, checkout/subscriptions, participant contact, paid acquisition, publishing or deployment.

## Approval record

- Concept/design sections approved by the owner through the 2026-09-27 replies recorded above. Approval covers writing this design spec.
- Written spec approval: pending.
- Implementation plan approval and execution method: pending; no code change is authorized before those gates.

## Verification

- Browser/app scripts: N/A at this checkpoint because only a written product design and task handoff are being prepared; no application behavior changed.
- Self-review: the spec separates approved facts from later content/ID decisions, keeps old case versions immutable, preserves private solution boundaries, treats AI feedback as hypotheses, and clearly excludes paid work, participant contact and publishing. Relative references resolve within the repository.
- Documentation checks: `scripts/check-agent-docs.ps1` passed for 40 task files; `git diff --check` passed.

## Improvement review

- Result: `none`.
- Observation/evidence: this is the first M2 scope expansion checkpoint; no repeated failure or verified process gap supports changing a reusable mechanism.
- Mechanism: no skill, rule, script or template change proposed. Reassess after the AI content/review workflow has run.
- Validation: documentation self-review, agent-doc foundation check and `git diff --check` passed.
- Follow-up owner/trigger: Codex integration lead after implementation plan/content-agent workflow executes.
