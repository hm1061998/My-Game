# T36 — Define the M1 playable segment

Status: done; design approved, implementation plan prepared for owner review
Owner: Codex
Depends on: T35
Plan version: design proposal v1.0, 2026-09-27
Approval: Owner approved the segment and choices in the reply received 2026-09-27: E01→E02→scanner→E03→E06, evidence-based E06 access, no cash spend for first sample, and owner-led invitations to 5–8 learners. This approves design only, not implementation.
Lifecycle phase: design complete; next task planning
Entry evidence: T35 accelerated M0 findings and conditional gate; owner-approved direction and M0/M1 roadmap
Exit gate: segment design accepted and file-level plan drafted; task complete
Next phase: T37 plan review; implementation remains gated on plan approval and target machine profile

## Outcome and scope

Define a 3–5 minute investigation → English evidence → fair dodge → deduction payoff passage using the existing case and Phaser 2.5D. The approved segment uses E01, E02, the archive scanner, E03 and Nora's E06 statement, immutable case v2, optional adjacent Vietnamese, a non-scored working theory and E02+E03 access to E06 without quiz gating.

Excluded: product code, new dependency, migration, external asset/vendor contact, participant contact, spending, commerce, deployment and full case redesign.

## Handoff evidence

- The public case source has E01 version instructions, E02 Nora's question, E03 account/time history and E06 Nora's explanation. E06 currently also requires Q02/Q03; case v2 proposal uses the already-supported E02/E03 evidence prerequisites instead. The new version preserves existing v1 sessions through case-version pinning.
- Current stack ownership and paths were inspected in `apps/web/src/App.tsx`, `apps/web/src/game/bridge/events.ts`, `apps/web/src/game/runtime.ts`, `apps/web/src/game/scenes/OfficeScene.ts`, API contracts and `JsonCaseCatalog`.
- The prior push rejection is resolved: user-authorized `main` push returned `f390ba4..9049c6f main -> main`; local branch and `origin/main` tracking ref both name `9049c6f`. An independent network read was unavailable afterward.
- No code was changed and no tests were run; this is design-only work. Docs checks and diff check remain for handoff.
- Owner confirmed the segment, no-spend sample, and that they will invite 5–8 learners. The target laptop/browser and consent/compensation arrangements remain open before performance acceptance and learner sessions.

## Improvement review

- Result: none.
- Observation/evidence: M0 left four production inputs open, so the next useful step was to make the segment concrete while distinguishing product decisions from assumptions. No recurring workflow failure surfaced.
- Mechanism changed or no-change reason: added the segment design and explicit open-decision list; no broader rule, skill or script is warranted.
- Validation: agent docs check passed for 37 task files, relative links in changed design/gate documents resolve, and `git diff --check` passed. No product tests were run because this task only records a design proposal. T35 and current memory record the successful push and the limit on independent remote verification.
- Follow-up: T37 carries the file-level plan for owner review; no product implementation has started.
