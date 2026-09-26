# T28 — First-session onboarding and audio

Status: done
Owner: Codex
Depends on: T27, P03
Plan version: 1.0
Approval: user approved the first-session soft-onboarding proposal and requested audio for gameplay and learning on 2026-09-26 (“đồng ý với phương án của bạn, nhưng cần bổ sung thêm audio, âm thanh cho việc chơi game và học tập sống động hơn”). Approval covers this onboarding + game-audio + English-listening increment; it does not authorize external audio services, licensing commitments, or deployment.
Lifecycle phase: handoff and improve
Workflow step: complete after final visible headed browser confirmation and local scripts

## Entry evidence and decisions

- The case opens directly into the office scene. The mission drawer contains a start-session button and a broad first objective; a control strip lists movement, run, interact, dodge and pause at once.
- During play the HUD shows the current phase objective and proximity prompt for `E`; T27 verified the game-first shell and visual hierarchy, not a staged first-session tutorial.
- Current English learning includes clue text, glossary and multiple-choice questions. The player has no audio playback for clue pronunciation.
- User selected onboarding and explicitly added game/learning audio. This is the first user-approved audio feature; audio was previously a post-MVP idea. Record D12 in `PROJECT_PLAN.md`.
- D13 remains an implementation proposal: synthesize game ambience/effects locally with Web Audio and use only browser/device speech voices marked `localService` for explicitly requested English playback. MDN documents that this flag distinguishes local from remote speech services. The browser/OS voice can vary; if no local English voice is available, explain the limitation rather than use a remote voice. No external TTS call, downloaded licensed media, or automatic speech is in scope.

## Outcome and success signal

A first-time player can start the case, understand and complete the first evidence interaction without external instruction, then listen to English evidence on demand. Gameplay has restrained, meaningful audio feedback; all sound is user-controllable and never blocks reading, keyboard play, or recovery.

## Scope

- Add a concise, game-visible briefing with the case premise, desktop keyboard requirement, and a clear start action; preserve the office as the visual focus.
- Guide the first minute progressively: show a specific first destination, teach movement and `E` only when relevant, then introduce the English listening/glossary affordance after the first clue. The guide is non-blocking, dismissible, and replayable.
- Add an accessible audio preference surface with independently controllable ambience/effects and a master mute; persist only UI preferences in localStorage, never trusted progress.
- Add low-volume, original Web Audio ambience and short event cues for meaningful clue/NPC/question/checkpoint/scanner transitions. Audio is activated from a user gesture, pauses/stops cleanly on mute or teardown, and does not emit per-frame events.
- Add user-initiated English speech playback on clue content using a browser/device speech voice explicitly marked local, with normal/slower rate where supported, stop control, English language hint, clear unsupported/error feedback and no auto-play. Read only content already authorized for that player; never speak answers/solutions.
- Keep tutorial/audio optional; text and gameplay remain complete when audio APIs are unavailable or muted. Do not add packages, remote calls, accounts, backend changes, or migrations.

## Excluded

- Multiple cases/maps, new case content, combat, mobile/touch gameplay, admin, P04/PostgreSQL, external TTS or analytics.
- Commissioned/recorded voice assets, music licensing, downloads, CDN and content schema changes. Revisit voice-source quality only after an audible playtest and explicit decision.
- Changing scoring, progression, checkpoint semantics, English answers, or the approved visual/gameplay defaults.

## Ownership and design constraints

- React owns briefing, tutorial copy, audio controls, speech playback UI, and persisted local preferences.
- Phaser owns scene proximity and gameplay state; communicate only discrete tutorial/audio triggers through typed bridge events. No React state updates every frame.
- Reuse the current evidence endpoint and public text; do not move solution or correct choices client-side.
- Browser autoplay policy requires activation from a user gesture. Every sound path must tolerate suspended/unsupported contexts and fail quietly with an accessible status. Reject Web Speech voices whose `localService` is false so clue text cannot be sent to a remote synthesizer.
- Respect reduced-motion settings for tutorial highlights; provide keyboard-accessible controls, captions/text (existing case text remains canonical), visible focus and balanced default levels.

## Acceptance

- A fresh browser shows a clear case briefing/start CTA, keyboard requirement, and a specific first destination. The first move and first `E` interaction are taught in context, without a blocking tutorial modal.
- After the first clue, the player discovers how to listen to the English text and find word meanings. Playback is initiated only by the player; normal/slower playback can be stopped and repeated.
- A returning session resumes without replaying onboarding automatically; the player can reopen the guide.
- Browser audio starts only after explicit user activation. The player can mute all audio and control ambience/effects independently; preferences survive reload and do not affect server progression.
- At least the accepted game event cues and gentle ambience are audible in the visible supported-browser check, with no console errors, runaway loop, per-frame sound or duplicate sound after React remount/replay.
- If Web Audio or speech synthesis is absent/blocked, gameplay and text learning remain usable and an accessible explanation is shown. No text is sent to an external service; no answer/solution audio leaks.
- At least three fresh-player observations confirm the next action is apparent, and the first clue can be collected without external explanation; record sample size/limitations rather than implying broad usability validation.

## Verification plan

- Focused unit/component checks for tutorial transitions, preference persistence, audio mute/teardown, speech stop/fallback and no auto-play.
- Visible browser at `http://127.0.0.1:5173`: fresh start → movement hint → first clue → clue listening normal/slow/stop → glossary → mute/reload/resume/replay guide. Keep the window visible. Inspect 1280×800 and narrow DOM shell; no touch-gameplay claim.
- Browser failure/recovery: speech API unsupported/mock absent, audio context suspended then user activation, mute while ambience runs, pause/blur/remount without duplicate loops, API/offline state does not trap onboarding.
- Final headed local E2E must exercise the first-session route; do not wait for GitHub E2E per the user's separate instruction. Run frontend lint/typecheck/tests/build, full `scripts/verify.ps1`, agent-doc checks, and `git diff --check`.

## Risks

- Installed speech voice/accent varies by device and may be unavailable. Make the text primary, stop/replay accessible, do not claim consistent pronunciation quality; record playtest evidence and keep recorded voice as a future decision.
- Audio can start unexpectedly or compete with English reading. Require user gesture, conservative levels, independent toggles, no automatic voice, and no default autoplay on page load.
- First-run tutorial can obscure play. Keep it short, in-world, dismissible, and replayable.

## Outcome and verification evidence

- Added a concise case briefing/start action, progressive move → first email → `E` prompts, and a replayable/dismissible tutorial. Tutorial completion is persisted as a UI preference only.
- Added user-activated, low-level procedural ambience and event cues, master mute plus independent ambience/effects controls, and persisted audio preferences. React/Phaser communication uses one discrete `player-moved` event; no per-frame React updates or backend/schema changes.
- Added clue English listen/slow/stop controls using only a local English Web Speech voice. Completion is recorded only on the utterance `onstart` event; a pre-start speech error leaves the lesson incomplete and shows readable fallback guidance. No remote voice or autoplay.
- Fresh-state observation: the visible headed E2E ran three isolated clean browser contexts. All three showed the first destination, movement and interaction prompts, and reached E01 without external guidance. This is a controlled automated walkthrough (one evaluator), not a three-person usability study; pronunciation quality and audio preference comprehension still need human listening feedback on target devices.
- Final local browser: 5/5 headed Chromium E2E passed, including complete case retry/reload/replay, 3 fresh-state onboarding walkthroughs and 3 visual/offline-state checks. The critical journey exercised local speech start/stop in this browser; installed voices and audible quality can vary by device.
- Final web gates: lint, typecheck, 41/41 frontend tests and production build passed. `scripts/verify.ps1` passed, including 12/12 API tests and clean .NET build. `scripts/check-agent-docs.ps1` passed (29 task files); `git diff --check` passed.
- Known non-blocking warnings: Vite reports the pre-existing deprecated `advancedChunks` option. `verify.ps1`'s npm launcher reported Node 22.22.2 despite Node 24.19.0 being available in the bundled runtime; npm 11.12.1 continued and every gate passed. One transient speech-engine failure path is covered by the visible fallback and regression test.
- GitHub E2E was not polled, per the user's explicit waiver. No GitHub workflow changes were made.

## Handoff

Entry baseline: `12e2e47` on clean `main` synced to `origin/main`. Scoped T28 changes are the only dirty paths. The normal workspace command helper repeatedly failed with `helper_unknown_error: setup refresh had errors`; the same authorized workspace commands worked with the elevated shell fallback. The Codex CUA kernel also exited unexpectedly, so browser evidence is from visible headed Chromium rather than the Codex in-app preview.

Next action: no T28 implementation work remains. If voice quality is a priority, collect human listening feedback on the target OS/browser before proposing licensed/recorded voice assets.

## Improvement review

- Result: candidate.
- Observation/evidence: repeated `exec_command` startup failures returned `helper_unknown_error: setup refresh had errors`; the same workspace read/build/test/Git commands completed when invoked through the elevated-shell fallback. The Codex CUA Node kernel also exited unexpectedly. No project source change caused either tool failure.
- Mechanism changed: recorded candidate L014 in the lesson ledger; no project permission or browser-verification rule was weakened.
- Validation: the fallback ran the full local verification and visible headed E2E successfully; ordinary sandbox shell startup was retried and remained unavailable.
- Follow-up: promote only if the same helper failure recurs on another task and a supportable, minimally scoped recovery is confirmed.
