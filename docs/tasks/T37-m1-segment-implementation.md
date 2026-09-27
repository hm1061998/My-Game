# T37 — M1 “Version Two at 8:50” segment

Status: implementation and automated gates passed; target-device and learner acceptance remain open
Owner: Codex
Depends on: T36
Plan version: [M1 Version Two at 8:50 v1.0](../superpowers/plans/2026-09-27-m1-version-two-segment.md), 2026-09-27
Approval: Owner approved the T37 file-level plan in the reply received 2026-09-27. The owner previously approved the segment design, no-spend sample, and owner-led invitations to 5–8 learners. Execution method: inline Codex.
Lifecycle phase: verify and handoff
Entry evidence: approved T36 design; inspected current React, Phaser, API and case-version boundaries
Exit gate: implementation, browser and local script gates passed; target-device performance and owner-led learner validation remain product acceptance gates
Next phase: owner selects target device and reviews consent/data/compensation draft, then runs the scorecard; no deployment

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
- Implementation-plan approval: owner reply “duyệt kế hoạch” received 2026-09-27; inline execution authorized.
- Target hardware and session consent/compensation remain open gates; no learner contact or cash spend is authorized.

## Improvement review

- Result: candidate, task-local.
- Observation/evidence: a full headed rerun repeatedly exposed the legacy E2E route stopping at the email desk's west collision edge, then attempting to move north into the desk. Screenshot and live scene position showed x≈476 against the desk collider beginning at x=490; the gameplay collision itself was correct.
- Mechanism changed or no-change reason: the browser test now steps into the clear lobby lane before moving north. No general movement rule, collision, script, or project-wide lesson was changed from this one route.
- Validation: the focused critical-journey suite passed 2/2 and the final visible headed suite passed 8/8. Existing player movement and collision tests remain unchanged.
- Follow-up: promote a route-planning lesson only if the same boundary-routing failure recurs in another browser journey.

## Handoff

- Baseline: clean `main` at `8e8ec66`; managed worktree created from that revision on `codex/m1-version-two`.
- Current step: Tasks 1–5 and automated portion of Task 6 implemented. V2 translations/session pinning/E06 evidence unlock and the optional session-only E02/E03 theory note are in place. Character sheets have talk/react/dodge states; Maya/Nora emotes travel React→GameHost→Phaser. Scanner warning, dodge and E06 reveal have distinct layered cues; the meeting HUD includes an English transcript with opt-in local speech.
- Checks on final revision: web lint/typecheck/build passed; sequential web suite 19 files/61 passed; API suite 16/16; `scripts/check-agent-docs.ps1` passed for 38 task files; `git diff --check` and production private-answer scan passed. The build retains the existing Vite `advancedChunks` deprecation and 1,167.5 kB Phaser vendor chunk warning. Vitest emits a jsdom environment-time advisory.
- Browser/product tests: final visible headed Chromium suite passed 8/8, including M1 bilingual/note/scanner/retry/E03/E06 without Q02/Q03, with sound muted and reduced motion; full existing case retry/reload/replay; v1 session coverage; missing-art fallback; offline and reduced-motion states. One pre-fix run exposed the older test route pressing into the email desk collision edge; its test now steps into the lobby lane and the critical journey passed 2/2 before the final 8/8. The visual-state test measured `/assets/` transfer of 932,830 bytes (ambience MP3 is separate at 3.84 MB).
- Performance: automated samples ranged 30–60 fps and p95 17–67 ms during this verification; final full run was 30 fps/p95 66 ms. The ≤33 ms target is not accepted. Target hardware/browser/network profile is not supplied.
- Human/product validation: no learner sessions run and no participants contacted. Added an owner-review-only consent/notes draft; retention and compensation remain undecided. Do not treat AI or automated evidence as enjoyment or willingness-to-pay validation.
- Improvement review: candidate. Repeated headed runs showed the shared full-case E2E route could stop at the email desk's west collision boundary and then fail its northward route. Updated the route to step into a clear lobby lane without changing collision/gameplay. The focused critical journey passed 2/2 and final full browser suite passed 8/8; keep the correction task-local unless the same routing pattern recurs elsewhere.
- Handoff: [M1 QA](../quality/M1-segment-qa.md), [M1 gate report](../product/M1-gate-report.md), and [session consent/notes draft](../research/M1-session-consent-and-notes.md). Next action: owner selects target laptop/browser/network profile and reviews consent, retention and compensation before personally inviting learners. No deployment or publishing.
