# T29 — Bundled office ambience

Status: done
Owner: Codex
Depends on: T28
Plan version: 1.0
Approval: user approved the previously recommended “Quiet room ambience with traffic outside” by replying “đồng ý đề xuất của bạn” on 2026-09-26. Scope is to bundle and use this Pixabay asset as the game ambience; it does not authorize deployment, remote hotlinking, or standalone distribution.
Lifecycle phase: handoff and improve complete
Workflow step: implementation, headed browser confirmation, local scripts and documentation complete

## Entry evidence and decisions

- T28 currently generates a quiet, filtered Web Audio noise ambience and event cues in `apps/web/src/audio/gameAudio.ts`; it activates after a player gesture and can be independently muted.
- User approved a quieter realistic room/urban bed rather than melodic background music. Selected source: [Quiet room ambience with traffic outside](https://pixabay.com/sound-effects/city-quiet-room-ambience-with-traffic-outside-120009/), AntonLD, Pixabay sound effect ID 120009, 2:00 MP3.
- User supplied the MP3 downloaded from that official source on 2026-09-26. It is 3,843,552 bytes with SHA-256 `FE3B67FD11691AE2A1C4E36B92573869C6284D3ACCF0BB4B6A2D2ACBFD8AF275`; visible Chromium decoded it as stereo, 120.111 seconds, RMS 0.0120 and peak 0.1246. The page lists “Work from home, Room, Traffic” and tags it as Office.
- The [Pixabay Content License summary](https://pixabay.com/service/license-summary/) permits free use/adaptation without required attribution and bars standalone redistribution. The official [FAQ](https://pixabay.com/service/faq/) names incorporation into a greater work such as an app or game; this MP3 is used as game ambience, with no standalone-download feature. The full license/terms control.
- Record D14 in `PROJECT_PLAN.md`; update `docs/assets/manifest.md` before bundling. No remote playback/hotlink.

## Outcome and success signal

After the user activates audio through the existing start/control gesture, the office feels inhabited by a subtle quiet room tone with distant traffic, while English clues and interaction cues remain clear. Audio continues to honor mute, ambience/effects toggles, pause/focus and teardown; failed local asset fetch/decode retains a quiet procedural fallback.

## Scope

- Incorporate the user-downloaded source at `apps/web/src/audio/office-quiet-traffic.mp3`; record SHA-256 and license/source in the asset manifest; import it through Vite so the production build emits a hashed client asset rather than exposing a named public download route.
- Replace the default synthesized ambience layer with this local file decoded into the existing Web Audio context; preserve the synthesized ambience as fallback if the file is unavailable or cannot decode.
- Preserve start-after-gesture behavior, local-only requests, current volume controls and all SFX behavior. Do not load audio through Phaser.
- Verify decode/load failure, mute/re-enable, background focus/suspend/resume, repeat loop, and teardown in tests/browser.

## Excluded

- Melodic soundtrack, dialogue/voice changes, new effects, remote/CDN playback, analytics, packages, backend/schema, external accounts, deployment/publishing, and asset redistribution outside the game.
- Replacing the approved clip or materially editing it; if the preview reveals an unsuitable recording, stop and ask the user before substituting a different source.

## Acceptance

- The asset is served from the app's own hashed Vite asset path; no request to Pixabay/CDN occurs at runtime.
- No playback starts before explicit user activation; the current master mute and ambience/effects preferences continue to work.
- Local audio decoding feeds the current ambience gain; if fetch/decode fails, the procedural room-tone fallback works without blocking gameplay and can recover on a later activation.
- The asset loops at an unobtrusive volume. A visible headed Chromium check decoded it and measured the first/last edge step at 0. The agent cannot receive subjective audio, so human listening comfort across a full 120-second repeat and masking of speech remain unverified; do not claim an auditory audition.
- Browser request/console checks, focused audio tests, frontend lint/typecheck/tests/build, full local verify, agent-doc check and `git diff --check` pass. Final visible browser confirmation uses the current revision.
- Manifest contains exact source page, contributor, license, file location, download date, SHA-256, and use constraints.

## Verification plan

- Unit tests for successful decode, failed fetch/decode fallback, mute/ambience toggle and idempotent resume/teardown.
- Visible headed Chromium E2E at the project runner's `http://127.0.0.1:5174`: confirm no audio fetch before activation, same-origin MP3 fetch after activation, decode/playback, mute/unmute without a duplicate request. The Codex panel preview at 5173 was attempted but its API was offline (proxy ECONNREFUSED 127.0.0.1:5062); the integrated headed E2E runner started an isolated API + Vite pair and passed instead. The browser measured duration, level and loop-edge samples; subjective listening remains a user-check.
- Run web lint/typecheck/test/build, `scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe`, `scripts/check-agent-docs.ps1`, and `git diff --check`.
- Do not poll GitHub E2E; the user previously waived that wait.

## Risks

- Two minutes may not form a seamless loop; listen and inspect the boundary before acceptance. If a loop artifact is audible, use a short crossfade only if it can be implemented without excessive asset manipulation; otherwise return with evidence and request a different approved recording.
- The recording is tagged for a room with traffic and may sound more home-like than an office. Keep it quiet; the procedural fallback remains available.
- Pixabay says free use/adaptation without required credit but bars standalone redistribution; record the exact page and do not expose the raw file separately from the game.

## Handoff

Outcome: integrated the approved MP3 through a Vite URL import and Web Audio decode. Fetch begins only after explicit audio activation; the 3-second procedural room-tone fallback plays immediately and remains available if fetch or decode fails (including retry on later activation). The recorded clip crossfades in over 0.45 seconds, loops, follows ambience/mute preferences and context suspend/resume, and is stopped on teardown. Its ambience gain was set to 0.24 to bring the low-RMS recording near the existing fallback's estimated output level; master/effects levels and the rest of the sound design are unchanged.

Browser evidence: visible headed Chromium, 6/6 E2E tests passed on the final revision. The audio test saw no media/fetch request before activation; then one same-origin MP3 request with HTTP 200 and successful decode. Mute/unmute did not fetch a duplicate. Decoded properties: 120.111 s, 2 channels, RMS 0.0120124, peak 0.124596, measured loop-edge sample step 0. The loop flag and fallback/retry paths are covered by unit tests. This is signal-level evidence, not a subjective human listening test; hearing comfort across a complete repeat remains unverified by the agent.

Script evidence: focused audio unit tests 5/5; `scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe` passed (web lint/typecheck, 46 web tests, build, API build and 12 API tests); headed browser 6/6; zero npm audit vulnerabilities. The full verify command emitted the documented non-blocking Node 22/npm 10 engine warning (repository requires Node 24/npm 11). The existing Vite `advancedChunks` deprecation warning remains unrelated. `git diff --check` and agent-doc checks passed at handoff. GitHub E2E was not polled, as the user previously waived it.

Preview note: Codex panel preview was attempted at `http://127.0.0.1:5173` but had no API on port 5062, so the real integrated browser exercise used the project’s visible headed Chromium runner, which started its own isolated API + Vite pair. No API data or user database was changed.

## Improvement review

- Result: none.
- Observation/evidence: the first browser assertion counted Vite's `?import&url` JavaScript URL-module request as an audio fetch. Filtering to fetch/media request types distinguished that module from the post-gesture audio body. This task-local test correction is not a broad rule/script lesson.
- Mechanism changed: added a focused audio unit test and visible E2E test; no global rules or dependencies changed.
- Validation: full local verify, full headed E2E, docs validation and diff check.
- Follow-up: none; subjective human listening is disclosed above and can inform a future gain/asset iteration.
