# T34 — Approve commercial direction and plan M0/M1

Status: done; accelerated M0 approved and executed under T35
Owner: Codex
Depends on: T33
Plan version: 1.0
Approval: user's 2026-09-27 approval of the updated product direction and instruction to prepare a detailed M0/M1 plan. The later 2026-09-27 instruction approved that plan with a shorter AI-assisted M0; see T35. Recruitment, spending, M1 product code and deployment remain outside this approval.
Lifecycle phase: define → design → handoff
Workflow step: planning handed off; accelerated M0 began in T35; browser N/A for T34 documentation-only work

## Outcome and success signal

Convert the confirmed player, gameplay, art, language, team, monetization and sequencing choices into an evidence-gated M0/M1 plan the owner can review before execution.

## Evidence and decisions

- Accepted in the user review: investigation/deduction dominates, with short dodge beats; bright mysterious tone with expressive characters and gentle humor; target learner 18–35 working or preparing to work; one lead developer plus commissioned art/animation/audio per milestone.
- Accepted: a complete free opening case followed by one-time paid case packs; the earlier subscription selection was explicitly withdrawn. English text appears first; Vietnamese is hidden initially and available adjacent to dialogue/clues with a persistent choice.
- Accepted: Phaser 2.5D pilot first; a 3D probe only if the pilot fails for a renderer limitation. M0/M1 and minimum content pipeline precede the full T15–T26 admin backlog; the backlog remains approved and deferred.
- T27–T31 provide technical baseline, but T28's automated fresh contexts are not independent learner playtests. Commercial willingness to pay and production cost remain unknown.

## Scope

- Included: update `docs/product/commercial-rebaseline-proposal.md`, write `docs/superpowers/plans/2026-09-27-m0-m1-commercial-validation.md`, record this task and current memory.
- Excluded: actual participant recruitment/contact, vendor contact or payment, M0 live sessions, M1 implementation, engine change, checkout, deployment or push retry.
- M0 is an executable research plan after its approval. M1's production scope and gates are described; exact files/interfaces depend on M0 creative and budget decisions and require a separate implementation plan.

## Acceptance and verification

- Every accepted user choice appears in the product direction and does not turn an unknown price/budget/timeline into a claim.
- The approved amendment moves real learner sessions to M1; M0 uses labelled AI-role hypotheses. M1 retains privacy/recruitment boundary, creative brief, cost structure, player/learning, visual, audio and browser quality gates, including conditional 3D criteria.
- `scripts/check-agent-docs.ps1`, `git diff --check`, link inspection and staged diff check pass. Browser and full app checks are N/A because only documents changed.

## Handoff

- Baseline: clean `main` at `3097ae3`, two commits ahead of `origin/main`; the earlier push rejection is unresolved.
- Final checks: `scripts/check-agent-docs.ps1` passed for 35 task files; `git diff --check` passed; the two relative links in the M0/M1 plan resolve. No browser or full app checks were run because this work changes only documentation. The scoped local commit is created at handoff; the remote push restriction remains.
- Next action: follow T35's accelerated M0 gate; M1 product-code planning follows owner decisions about scene, art, target hardware, real learner source and spending ceiling.

## Improvement review

- Result: none
- Observation/evidence: the product direction review supplied clear choices and the phase plan explicitly separates M0 evidence from M1 code decisions. No new repeated process failure arose.
- Mechanism changed or no-change reason: the product direction and plan/task documents were updated for this request; no new rule, skill or script is warranted.
- Validation: agent documentation check, relative-link check and diff check passed.
- Follow-up trigger: revisit only if M0 execution shows a recurring gap in research or asset approval workflow.
