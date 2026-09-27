# T36 — Define the M1 playable segment

Status: design draft awaiting owner review
Owner: Codex
Depends on: T35
Plan version: design proposal v1.0, 2026-09-27
Approval: user's “tiếp tục thực hiện công việc” authorizes continuing after M0. It permits preparing the next reviewable design artifact; it does not name the segment, confirm a cash ceiling, target hardware, participant source or approve implementation.
Lifecycle phase: design
Entry evidence: T35 accelerated M0 findings and conditional gate; owner-approved direction and M0/M1 roadmap
Exit gate: owner accepts/revises the segment, creative sample and remaining M1 inputs; then write a separate file-level implementation plan
Next phase: planning after design approval; no product code in this task

## Outcome and scope

Define a 3–5 minute investigation → English evidence → fair dodge → deduction payoff passage using the existing case and Phaser 2.5D. The draft uses E01, E02, the archive scanner, E03 and Nora's E06 statement. It proposes an immutable case v2, optional adjacent Vietnamese, a non-scored working theory and E02+E03 access to E06 without quiz gating. These are design proposals for owner review, not accepted behavior yet.

Excluded: product code, new dependency, migration, external asset/vendor contact, participant contact, spending, commerce, deployment and full case redesign.

## Handoff evidence

- The public case source has E01 version instructions, E02 Nora's question, E03 account/time history and E06 Nora's explanation. E06 currently also requires Q02/Q03; case v2 proposal uses the already-supported E02/E03 evidence prerequisites instead. The new version preserves existing v1 sessions through case-version pinning.
- Current stack ownership and paths were inspected in `apps/web/src/App.tsx`, `apps/web/src/game/bridge/events.ts`, `apps/web/src/game/runtime.ts`, `apps/web/src/game/scenes/OfficeScene.ts`, API contracts and `JsonCaseCatalog`.
- The prior push rejection is resolved: user-authorized `main` push returned `f390ba4..9049c6f main -> main`; local branch and `origin/main` tracking ref both name `9049c6f`. An independent network read was unavailable afterward.
- No code was changed and no tests were run; this is design-only work. Docs checks and diff check remain for handoff.

## Improvement review

- Result: none.
- Observation/evidence: M0 left four production inputs open, so the next useful step was to make the segment concrete while distinguishing product decisions from assumptions. No recurring workflow failure surfaced.
- Mechanism changed or no-change reason: added the segment design and explicit open-decision list; no broader rule, skill or script is warranted.
- Validation: agent docs check passed for 37 task files, relative links in changed design/gate documents resolve, and `git diff --check` passed. No product tests were run because this task only records a design proposal. T35 and current memory record the successful push and the limit on independent remote verification.
- Follow-up: owner review is the trigger for writing the file-level implementation plan.
