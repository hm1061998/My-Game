# T29 — Bundled office ambience

Status: blocked — official download did not complete
Owner: Codex
Depends on: T28
Plan version: 1.0
Approval: user approved the previously recommended “Quiet room ambience with traffic outside” by replying “đồng ý đề xuất của bạn” on 2026-09-26. Scope is to bundle and use this Pixabay asset as the game ambience; it does not authorize deployment, remote hotlinking, or standalone distribution.
Lifecycle phase: define/design complete; build
Workflow step: approved source confirmed; official download blocked before implementation

## Entry evidence and decisions

- T28 currently generates a quiet, filtered Web Audio noise ambience and event cues in `apps/web/src/audio/gameAudio.ts`; it activates after a player gesture and can be independently muted.
- User approved a quieter realistic room/urban bed rather than melodic background music. Selected source: [Quiet room ambience with traffic outside](https://pixabay.com/sound-effects/city-quiet-room-ambience-with-traffic-outside-120009/), AntonLD, Pixabay sound effect ID 120009, 2:00 MP3.
- The source page lists “Work from home, Room, Traffic”, also tags it as Office, and states free use under Pixabay Content License. The license summary permits free use and adaptation without required attribution, while prohibiting standalone redistribution. The full license/terms remain controlling; record download date, source URL and SHA-256.
- Record D14 in `PROJECT_PLAN.md`; update `docs/assets/manifest.md` before bundling. No remote playback/hotlink.

## Outcome and success signal

After the user activates audio through the existing start/control gesture, the office feels inhabited by a subtle quiet room tone with distant traffic, while English clues and interaction cues remain clear. Audio continues to honor mute, ambience/effects toggles, pause/focus and teardown; failed local asset fetch/decode retains a quiet procedural fallback.

## Scope

- Download the approved source from Pixabay to `apps/web/src/audio/assets/office-quiet-traffic.mp3` and record SHA-256 and the license/source in the asset manifest; import it through Vite so it is packaged with the client bundle rather than exposed as a named public download route.
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
- The asset loops at an unobtrusive volume. In a visible supported-browser check, listen across the loop boundary and confirm it does not click or mask reading/speech/effects; note browser/OS and any limitation.
- Browser request/console checks, focused audio tests, frontend lint/typecheck/tests/build, full local verify, agent-doc check and `git diff --check` pass. Final visible browser confirmation uses the current revision.
- Manifest contains exact source page, contributor, license, file location, download date, SHA-256, and use constraints.

## Verification plan

- Unit tests for successful decode, failed fetch/decode fallback, mute/ambience toggle and idempotent resume/teardown.
- Visible local preview at `http://127.0.0.1:5173`: explicit start → hear ambience → independently mute ambience/effects → reload/resume → observe no remote audio requests; inspect loop across at least one repeat. Keep browser visible. Codex in-app preview helper has previously failed; if still unavailable, use the project headed Chromium runner and record the reason.
- Run web lint/typecheck/test/build, `scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe`, `scripts/check-agent-docs.ps1`, and `git diff --check`.
- Do not poll GitHub E2E; the user previously waived that wait.

## Risks

- Two minutes may not form a seamless loop; listen and inspect the boundary before acceptance. If a loop artifact is audible, use a short crossfade only if it can be implemented without excessive asset manipulation; otherwise return with evidence and request a different approved recording.
- The recording is tagged for a room with traffic and may sound more home-like than an office. Keep it quiet; the procedural fallback remains available.
- Pixabay says free use/adaptation without required credit but bars standalone redistribution; record the exact page and do not expose the raw file separately from the game.

## Handoff

Entry baseline: `b7c7f48` on `main`, pushed to `origin/main`. Approved asset and license decision are recorded in D14 and this task. Visible headed Chromium opened the official source page and confirmed its metadata (2:00 MP3, AntonLD); this was not an audible audition. The official page's download control did not emit a browser download event within 12 seconds. Earlier direct requests to the official CDN returned HTTP 403. No MP3 was obtained, no implementation started, and no substitute/mirror was used. The official source page is queued in the Codex browser panel for user access.

Blocker and next action: keep T29 blocked until the user downloads the approved MP3 directly from the official [Pixabay page](https://pixabay.com/sound-effects/city-quiet-room-ambience-with-traffic-outside-120009/) and places it at `apps/web/src/audio/assets/office-quiet-traffic.mp3` (or attaches it for placement). Then verify the supplied file against its source/duration, calculate SHA-256, and continue the already-approved local integration. If the downloaded recording is unsuitable when auditioned, ask before substituting another track.

## Improvement review

- Result: none.
- Observation/evidence: official download control timed out without producing a download; direct official CDN requests returned 403. One blocked acquisition attempt does not establish a reusable workflow change. Browser/CUA setup errors are already recorded as L014 candidate; no permission or validation policy change is justified.
- Mechanism changed: task and memory record the exact blocker; no new reusable mechanism.
- Validation: inspected the official page in visible headed Chromium, attempted the official page's download control, and verified no asset file was created.
- Follow-up: resume when the user supplies the approved source file at the recorded path.
