# M0/M1 Commercial Game Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` if the owner approves inline execution. Track each checkbox. M1 product code requires a separate file-level plan after M0; this document does not authorize it.

**Goal:** Learn why target players do or do not enjoy the current case, then build and test one polished 3–5 minute Phaser 2.5D detective segment where English understanding helps solve the case.

**Architecture:** Accelerated M0 uses explicit AI learner-role simulations and a costed creative brief to find likely comprehension/UX issues; it does not claim human enjoyment or demand. M1 improves one passage of the existing case while React owns accessible UI, Phaser owns frame gameplay, and the .NET server retains scoring, progression and private answers. Real target-learner testing moves to the M1 gate, before M2 or a paid content commitment. A 3D probe is conditional on evidence of a renderer limit, with a separate decision.

**Tech Stack:** React 19, Phaser 4.2.1, ASP.NET Core 10, SQLite, server JSON cases, versioned local assets and visible browser QA.

**Spec:** [Approved commercial direction](../../product/commercial-rebaseline-proposal.md); [graphics options](../../design/graphics-technology-options.md).

## Global constraints

- Target self-paying A2–B1 learners aged roughly 18–35 who work or are preparing to work. Browser desktop and keyboard are first.
- Investigation and deduction dominate; use short, fair stealth/dodge moments. Keep the bright, mysterious, expressive and gently humorous tone.
- English dialogue/clues are primary. Vietnamese translation is initially hidden, can be revealed next to the relevant text, and the preference persists. Translation use never reduces score.
- One lead developer may commission art, animation and audio by milestone. No vendor contact, spend, contract, external upload or new service is authorized by this plan.
- Opening case is free and complete; later cases are a one-time purchase pack. Price and pack size wait for content-cost and player-value evidence. No initial subscription.
- Phaser 2.5D is the primary pilot. Keep T15–T26 admin implementation deferred. Preserve existing React/Phaser/API/domain/storage boundaries, licensed asset provenance and server-only solutions.
- Every product browser preview/test is visible. AI roleplay and automated walkthroughs are explicitly labeled simulated evidence and never described as human playtests. No commercial appeal or willingness-to-pay claim is based solely on AI roleplay.

## Review focus

1. New players cannot identify the first goal or clue → use AI personas to find likely friction in M0 Task 2, then observe actual unprompted behavior in M1 Task 8.
2. English feels like a quiz barrier or Vietnamese is hard to find → probe comprehension in M0 Task 2; test translation, replay and score neutrality in M1 Tasks 6 and 8.
3. More effects mask stiff acting → review poses/transitions in M1 Task 7 and players' reading of emotion/action in Task 8.
4. Audio is blocked, too loud or unavailable → check gesture activation, mix, mute, captions and fallback in M1 Tasks 7 and 9.
5. Art increases load/frame cost on ordinary laptops → set hardware/load budget in M0 Task 4 and measure it in M1 Task 9.

## M0 · Accelerated AI-assisted audit and creative brief (planning envelope: 3–5 working days)

### Task 1: Simulation protocol and later human-test boundary

**Files:** Create `docs/research/M0-ai-audit-protocol.md` and `docs/research/M0-ai-notes-template.md`.

- [ ] Define distinct AI role cards: an A2 learner focused on comprehension, a B1 learner focused on deduction and an entertainment-first skeptic. Give each the same public game information; do not provide hidden solutions.
- [ ] Ask each agent for likely first-goal/clue friction, English comprehension, story interest and missing feedback. Require exact screen/text evidence and an uncertainty label; forbid invented player emotions, payment intent or completion claims.
- [ ] Keep agent notes separate from root synthesis. The root compares them with visible browser/code evidence and records contradictions. No personal data or human recruitment occurs in M0.
- [ ] Draft a later 30–45 minute human M1 test script and consent/notes boundary, but do not recruit, contact or compensate anyone without separate authority.

**Gate:** Simulation roles and evidence limits are documented; any later live-session source or compensation is approved before outreach.

### Task 2: Baseline AI roleplay and visible product audit

**Files:** `docs/research/M0-ai-a2-notes.md`, `docs/research/M0-ai-b1-notes.md`, `docs/research/M0-findings.md`; keep the skeptic's report separately if used.

- [ ] Record baseline revision, browser/OS and current flow; inspect it in a visible browser. Mark any path only read from code/content as unplayed.
- [ ] Run the independent AI learner roles over the same public first-session material. Record likely confusion around first objective/clue, English, NPCs, deduction, dodge, visual impression and audio availability with exact evidence.
- [ ] Compare agent notes and the actual product. Treat agreement as a heuristic to prioritize M1, not independent human validation; discard claims that lack a screen/text anchor.
- [ ] Synthesize likely friction, positive design opportunities and uncertainty without percentages, retention or willingness-to-pay claims.

**Gate:** AI audit and visible baseline report are complete and clearly labeled simulated. Human appeal/commercial validation remains open until M1 Task 8.

### Task 3: Art/audio directions and production brief

**Files:** `docs/design/M0-art-direction-brief.md`; update `docs/assets/manifest.md` only for assets actually acquired.

- [ ] Present two or three distinct moodboards within the approved bright mystery tone, covering silhouette, acting, room depth, lighting, UI and sound. Link sources/rights; do not bundle unlicensed references.
- [ ] Brief a small asset pilot: one room, protagonist, one or two NPCs, clue interaction, dodge tell, key animation states, ambience/SFX and one spoken English exchange with subtitles.
- [ ] Count required assets, revision rounds, delivery formats and integration effort. Public price research may inform a range; vendor contact and orders require separate authorization.
- [ ] Review the directions with the owner. AI roles may critique readability, but this is not target-learner preference evidence.

**Gate:** One selected direction and reviewed asset brief; contractor and budget decisions remain open.

### Task 4: Pre-register M1 scorecard and decision

**Files:** `docs/research/M1-scorecard.md`, `docs/product/M0-gate-report.md`.

- [ ] Choose the ordinary desktop hardware/browser floor from target-player access. Set first-load and frame-time limits; preserve 60 fps / p95 ≤ 33 ms unless a new decision changes the existing budget.
- [ ] Define severe blockers before M1: unable to start/finish, unable to identify needed English clue, unreliable dodge, inaccessible translation, audio fallback failure or unacceptable performance.
- [ ] Predefine a 5–8 person M1 human test: unprompted goal and clue comprehension, voluntary desire to continue, how English informed a theory, translation use, acting/audio impression and measured performance. M0 AI notes are hypotheses, not a human baseline; do not claim statistical proof.
- [ ] Present expected art/audio spend, developer integration time, license/vendor risks and a smaller fallback. Obtain an explicit M1 ceiling and creative brief approval before paid asset work.
- [ ] Report a proceed/revise/pause recommendation grounded in M0 findings. Update the spec and request owner review if evidence contradicts the approved direction.

**Gate:** The owner approves M1 brief, human-test scorecard/source, target hardware, spending ceiling and decision to start M1. Missing inputs keep M1 in planning. No large content pack or commerce work proceeds on AI-only evidence.

## M1 · Polished Phaser segment (planning envelope: 4–6 weeks after its gate)

The deliverables below define M1's scope. Exact files, interfaces and tests belong in a separate implementation plan written from M0's approved scene and asset contract before product code changes.

### Task 5: Segment design and asset contract

**Files:** Create `docs/design/M1-segment-spec.md`, `docs/design/M1-asset-contract.md` and a separate file-level M1 implementation plan.

- [ ] Select a 3–5 minute existing-case passage with a hook, meaningful English clue, NPC exchange, deduction, one short dodge and a clear payoff; specify its start/end state.
- [ ] Write the A2–B1 learning target, original English, accurate Vietnamese, replay behavior and answer-secrecy review. Translation must not inject a deduction absent from English.
- [ ] Approve room/character states, atlas/export formats, audio deliverables, asset names, license/source and missing-asset fallbacks. Review one sample before full production.
- [ ] Map exact React/Phaser/API ownership and affected files in the separate implementation plan. Seek approval for that plan, dependencies and spend before building.

**Gate:** Owner approves segment, sample assets, cost ceiling and file-level implementation plan.

### Task 6: Playable visual and learning loop

**Files:** Named in the approved M1 code plan; likely focused scene/art modules under `apps/web/src/game/`, accessible dialogue/clue UI under `apps/web/src/`, versioned assets under `apps/web/public/assets/`, and `docs/assets/manifest.md`.

- [ ] Improve only the approved room and characters in Phaser. Preserve collision, depth, keyboard, pause/focus, retry and checkpoint behavior. Use lighting/camera/VFX where they improve reading or action feedback.
- [ ] Add English transcript and adjacent Vietnamese show/hide for the chosen clue/exchange; persist the preference, permit replay and verify translation use leaves server scores unchanged.
- [ ] Keep private answers and future bundles on the server. Write focused tests for subtitle state, authorized clue visibility, score neutrality and asset fallback.

**Gate:** A player completes the segment in the real canvas with optional Vietnamese and no trusted-progression regression.

### Task 7: Sound and acting pass

**Files:** Named in the approved M1 code plan; record every bundled audio license/source in the manifest.

- [ ] Integrate approved ambience, steps, clue/UI cues, danger tell, short music/stinger and selected spoken English with a consistent mix.
- [ ] Verify gesture-gated start, volume/mute, text equivalence, replay/stop and unavailable-audio fallback.
- [ ] Inspect animation in motion: readable idle/turn/talk/dodge anticipation, impact and recovery. Fix stiff poses before adding more effects.

**Gate:** Characters and danger remain understandable with sound on or muted; blocked audio never stops play.

### Task 8: Human playtest and M1 decision

**Files:** `docs/research/M1-findings.md`, `docs/product/M1-gate-report.md`.

- [ ] Run the pre-registered scorecard with new target learners where possible, visible browser and fresh profiles; record moderator prompts.
- [ ] Compare behavior and stated reasons with M0. Ask how the English clue affected a theory; note translation discovery, dodge fairness, acting, sound and desire to continue.
- [ ] Classify failures by story/learning design, art, animation, sound, renderer or performance. Fix the cause and repeat affected checks. A 3D probe needs a separate approval and evidence of a renderer limit.

**Gate:** No unresolved severe blocker; a clear majority of new participants independently understands the first goal and English clue and gives a concrete reason to continue. Owner reviews cost/performance and chooses M2, another iteration or pause. This is directional evidence, not proof of willingness to pay.

### Task 9: Final engineering QA and handoff

**Files:** Update the active task, QA evidence, asset manifest and `docs/memory/current.md`.

- [ ] On the final revision run focused tests, web lint/typecheck/test/build, full `scripts/verify.ps1` and visible headed E2E. Check production Vite preview if bundler configuration changes.
- [ ] In a visible browser exercise input, collision/depth, pause/focus, clue, dodge/retry, checkpoint, subtitles, muted/unavailable audio and missing assets; confirm the final revision again after fixes.
- [ ] Measure first-load transfer and frame cadence on the agreed hardware; inspect the built client for private answers and verify asset provenance.
- [ ] Record actual M1 gate outcome, limits, improvement review and next action. Commit only scoped verified work. Preserve the existing remote-push block until separately resolved.

## Execution handoff

The owner approved this plan on 2026-09-27 with the amendment to shorten M0 and use AI learner-role agents. Accelerated M0 is documented in [T35](../../tasks/T35-accelerated-m0.md), with [simulated findings](../../research/M0-findings.md) and a [conditional gate](../../product/M0-gate-report.md). M1 still needs the owner's scene/art, hardware, human-test source and spending decisions, followed by a separate file-level code plan. Release date, pack size, price and checkout vendor remain later evidence-gated decisions.
