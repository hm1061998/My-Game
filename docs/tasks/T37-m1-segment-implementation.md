# T37 — M1 “Version Two at 8:50” segment

Status: plan ready for owner review; implementation not authorized yet
Owner: Codex
Depends on: T36
Plan version: [M1 Version Two at 8:50 v1.0](../superpowers/plans/2026-09-27-m1-version-two-segment.md), 2026-09-27
Approval: Owner approved the segment design in T36, including E01→E02→scanner→E03→E06, optional Vietnamese hidden by default, no quiz gate for E06 in v2, no cash spend for the first sample, and owner-led invitations to 5–8 learners. This is not approval of this implementation plan.
Lifecycle phase: define/plan
Entry evidence: approved T36 design; inspected current React, Phaser, API and case-version boundaries
Exit gate: owner approves or revises the file-level plan; then implementation can start within the approved scope
Next phase: build after plan approval; record target browser/device before performance acceptance; settle consent/compensation before learner sessions

## Outcome and scope

Deliver a playable 3–5 minute case slice using the existing Phaser 2.5D runtime. New sessions use immutable case v2; existing v1 sessions retain their pinned content. Learners can reveal Vietnamese alongside English without changing score/progression, optionally record a non-scored working theory, cross the existing scanner, and reach Nora's statement after E02/E03 and encounter completion without Q02/Q03. Improve acting, scene staging and sound feedback using a no-spend self-produced first sample and already licensed ambience.

The exact file-level tasks, API/data contracts, focused checks, visible browser scenarios, and stop conditions are in the linked implementation plan. No new dependencies, paid assets, admin portal, payment flow, deployment or full-case rewrite are included. Do not contact participants; the owner will invite them. Learner sessions are a later verification gate and require settled consent/compensation.

## Risks and gates

- Preserve v1 session behavior and private answer boundaries while adding optional v2 translations.
- Keep translation presentation-only and guard storage exceptions.
- Make character emotes presentation-only so animation cannot change collision, scoring or scanner timing.
- Sound must have equivalent visual/text cues; speech is provisional and OS-dependent under the no-spend choice.
- Keep a target-hardware performance/load acceptance gate. Implementation work not dependent on that profile may proceed after plan approval, but final performance claims may not.
- Human learner evidence is directional for 5–8 people. Do not claim market validation or payment willingness from it.

## Approval record

- Design approval: owner reply received 2026-09-27, recorded in T36 and `docs/design/M1-segment-spec.md`.
- Implementation-plan approval: pending.
- No implementation, asset generation, cash spend or learner contact has occurred for T37.

## Improvement review

- Result: none.
- Observation/evidence: this is the first file-level plan after design approval; the earlier gate still asked for resolved inputs that the approved design had already answered. Separating implementation approval from target-device and research-session gates prevents unrelated planning inputs from blocking code work.
- Mechanism changed or no-change reason: corrected the M1 spec/gate and added explicit plan gates in T37; no broad rule or skill change is warranted from one occurrence.
- Validation: `scripts/check-agent-docs.ps1` passed for 38 task files; `git diff --check` passed. Product tests/browser checks are N/A because this task changes planning documents only.
- Follow-up: reassess if the same gate confusion recurs in another lifecycle plan.

## Handoff

- Baseline: `main` was clean at `origin/main` before starting the planning updates; the implementation plan was the only untracked file.
- Current step: detailed file-level plan written; task/spec/gate/memory records updated; docs checks and `git diff --check` pending.
- Browser/product tests: N/A, planning-only; no gameplay code changed.
- Improvement review: pending the docs-only checks. Current observation: split the design approval from implementation approval and keep target-hardware and participant-session inputs at their actual acceptance gates. Promote no durable rule unless this reveals a repeated failure.
- Next action: owner reviews the linked plan and supplies plan approval, plus an ordinary target laptop/browser profile before performance acceptance.
