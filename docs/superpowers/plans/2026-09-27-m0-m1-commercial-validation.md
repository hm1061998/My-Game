# M0/M1 Commercial Game Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` if the owner approves inline execution. Track each checkbox. M1 product code requires a separate file-level plan after M0; this document does not authorize it.

**Goal:** Learn why target players do or do not enjoy the current case, then build and test one polished 3–5 minute Phaser 2.5D detective segment where English understanding helps solve the case.

**Architecture:** M0 uses real learner observations and a costed creative brief; it changes no product behavior. M1 improves one passage of the existing case while React owns accessible UI, Phaser owns frame gameplay, and the .NET server retains scoring, progression and private answers. A 3D probe is conditional on evidence of a renderer limit, with a separate decision.

**Tech Stack:** React 19, Phaser 4.2.1, ASP.NET Core 10, SQLite, server JSON cases, versioned local assets and visible browser QA.

**Spec:** [Approved commercial direction](../../product/commercial-rebaseline-proposal.md); [graphics options](../../design/graphics-technology-options.md).

## Global constraints

- Target self-paying A2–B1 learners aged roughly 18–35 who work or are preparing to work. Browser desktop and keyboard are first.
- Investigation and deduction dominate; use short, fair stealth/dodge moments. Keep the bright, mysterious, expressive and gently humorous tone.
- English dialogue/clues are primary. Vietnamese translation is initially hidden, can be revealed next to the relevant text, and the preference persists. Translation use never reduces score.
- One lead developer may commission art, animation and audio by milestone. No vendor contact, spend, contract, external upload or new service is authorized by this plan.
- Opening case is free and complete; later cases are a one-time purchase pack. Price and pack size wait for content-cost and player-value evidence. No initial subscription.
- Phaser 2.5D is the primary pilot. Keep T15–T26 admin implementation deferred. Preserve existing React/Phaser/API/domain/storage boundaries, licensed asset provenance and server-only solutions.
- Every product browser preview/test is visible. Automated walkthroughs are never described as human playtests.

## Review focus

1. New players cannot identify the first goal or clue → observe unprompted first-minute behavior in M0 Task 2 and M1 Task 8.
2. English feels like a quiz barrier or Vietnamese is hard to find → probe comprehension in M0 Task 2; test translation, replay and score neutrality in M1 Tasks 6 and 8.
3. More effects mask stiff acting → review poses/transitions in M1 Task 7 and players' reading of emotion/action in Task 8.
4. Audio is blocked, too loud or unavailable → check gesture activation, mix, mute, captions and fallback in M1 Tasks 7 and 9.
5. Art increases load/frame cost on ordinary laptops → set hardware/load budget in M0 Task 4 and measure it in M1 Task 9.

## M0 · Evidence and approved creative brief (planning envelope: 2–3 weeks)

### Task 1: Research protocol and privacy

**Files:** Create `docs/research/M0-playtest-protocol.md` and `docs/research/M0-session-notes-template.md`.

- [ ] Write a neutral 30–45 minute script: watch the first case without hints, then ask for the player's theory, English learning moments, desire to continue and reasons. Record every moderator prompt.
- [ ] Define 5–8 eligible target learners unfamiliar with the game. The owner arranges recruitment or separately authorizes outreach and any compensation.
- [ ] Use participant codes and broad age/English-level bands. Obtain consent for notes; do not record audio/video or put contact details in Git by default. Set retention/deletion rules.
- [ ] Check the template separates observed action, participant wording, moderator help and researcher inference.

**Gate:** Owner reviews the script, participant source and any compensation before live sessions.

### Task 2: Baseline playtest of the current case

**Files:** `docs/research/M0-findings.md`; de-identified session notes only if the protocol allows them in the repository.

- [ ] Record baseline revision, browser/OS and the current case flow. Use a visible browser and fresh profile for each session.
- [ ] Observe first objective/clue discovery, English comprehension, NPC interaction, deduction, dodge fairness, visual impression and audio comprehension with 5–8 real target learners.
- [ ] Ask after play what they remember, whether they want another case and why, and what felt like learning versus play. Treat hypothetical purchase intent as weak evidence.
- [ ] Aggregate recurring friction and positive moments with numerator/denominator and limitations. Keep observation separate from interpretation.

**Gate:** At least five usable human sessions, or report the shortfall and leave this gate open. T28's automated contexts cannot count.

### Task 3: Art/audio directions and production brief

**Files:** `docs/design/M0-art-direction-brief.md`; update `docs/assets/manifest.md` only for assets actually acquired.

- [ ] Present two or three distinct moodboards within the approved bright mystery tone, covering silhouette, acting, room depth, lighting, UI and sound. Link sources/rights; do not bundle unlicensed references.
- [ ] Brief a small asset pilot: one room, protagonist, one or two NPCs, clue interaction, dodge tell, key animation states, ambience/SFX and one spoken English exchange with subtitles.
- [ ] Count required assets, revision rounds, delivery formats and integration effort. Public price research may inform a range; vendor contact and orders require separate authorization.
- [ ] Review the directions with the owner and, if possible, target learners. Record what they can read and remember, not only aesthetic preference.

**Gate:** One selected direction and reviewed asset brief; contractor and budget decisions remain open.

### Task 4: Pre-register M1 scorecard and decision

**Files:** `docs/research/M1-scorecard.md`, `docs/product/M0-gate-report.md`.

- [ ] Choose the ordinary desktop hardware/browser floor from target-player access. Set first-load and frame-time limits; preserve 60 fps / p95 ≤ 33 ms unless a new decision changes the existing budget.
- [ ] Define severe blockers before M1: unable to start/finish, unable to identify needed English clue, unreliable dodge, inaccessible translation, audio fallback failure or unacceptable performance.
- [ ] Predefine a 5–8 person M1 test with new learners where possible: unprompted goal and clue comprehension, voluntary desire to continue, how English informed a theory, translation use, acting/audio impression and measured performance. Compare with M0; do not claim statistical proof.
- [ ] Present expected art/audio spend, developer integration time, license/vendor risks and a smaller fallback. Obtain an explicit M1 ceiling and creative brief approval before paid asset work.
- [ ] Report a proceed/revise/pause recommendation grounded in M0 findings. Update the spec and request owner review if evidence contradicts the approved direction.

**Gate:** The owner approves M1 brief, scorecard, target hardware, spending ceiling and decision to start M1. Missing inputs keep M1 in planning.

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

The product direction is approved; **this M0/M1 plan awaits owner review**. Approval may start M0 only. M1 also needs M0 evidence, spending approval, a segment/art brief and its file-level code plan. Release date, pack size, price and checkout vendor remain later evidence-gated decisions.
