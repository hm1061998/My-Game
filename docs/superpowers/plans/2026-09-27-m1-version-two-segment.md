# M1 Version Two at 8:50 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` for inline implementation or `superpowers:subagent-driven-development` if the owner selects independent implementation tasks. Track each checkbox. This plan does not authorize implementation until the owner approves this plan and its remaining gates.

**Goal:** Build a polished, playable 3–5 minute Phaser 2.5D case segment where A2–B1 learners use English evidence, optionally reveal Vietnamese, cross a fair scanner dodge, and discover why Nora replaced the report.

**Architecture:** Keep React responsible for accessible case text, translations, working notes and dialogs; Phaser owns scene, animation, camera, movement and scanner state; ASP.NET Core and versioned server JSON own evidence availability and private answers. Add case v2 rather than mutate v1 so existing sessions stay pinned to their original definition.

**Tech Stack:** React 19, TypeScript 6, Phaser 4.2.1, ASP.NET Core 10, System.Text.Json, SQLite, existing local SVG generator, existing Web Audio ambience/SFX and visible headed Playwright.

**Spec:** [Approved segment design](../../design/M1-segment-spec.md); [commercial direction](../../product/commercial-rebaseline-proposal.md); [M0 gate](../../product/M0-gate-report.md); [M1 scorecard](../../research/M1-scorecard.md).

## Global Constraints

- Target self-paying A2–B1 learners aged about 18–35; desktop browser first.
- Story sequence: E01 → E02 → fair scanner crossing → E03 → Nora E06; 3–5 minutes for the selected slice.
- English appears first; adjacent Vietnamese starts hidden, can be toggled beside each clue/dialogue line and the preference persists locally. Translation must not change scores, progression, answer access or session revision.
- The owner chose no cash spend for this sample and will personally invite 5–8 target learners. Do not acquire paid assets or contact participants.
- Use original in-repository/A.I.-assisted art with hand finishing and the existing licensed ambience; record provenance in `docs/assets/manifest.md`. If a consistent voice file cannot be produced without spend and clear rights, retain the visible transcript and use current local browser speech only as a provisional prototype voice.
- Preserve React/Phaser/API/domain/storage boundaries, server-only solutions and version-pinned sessions. No new dependency, admin work, payment, deployment or 3D renderer.
- Keep keyboard, pause/focus, collision/depth, checkpoint/retry, missing-asset fallback, reduced-motion behavior and readable DOM text.
- Retain 60 fps intent and p95 frame time ≤33 ms. Before asset/performance acceptance, record the owner's ordinary laptop model, OS, memory, GPU class, viewport and browser; set first-load ceiling from that profile and the measured current build.

## Review Focus

1. A v2 optional translation field is missing or malformed → v1 still loads with no translation, and v2 validates matching English/Vietnamese dialogue counts.
2. A private answer or solution leaks through new text contracts → API returns only public case text/translation for collected evidence; browser production output contains no solution.
3. A quiz again blocks the intended story payoff → E06 in v2 requires collected E02 and E03 plus the encounter clear; Q02/Q03 remain available for review/scoring but do not gate E06.
4. Translation state fails in storage or changes trusted progress → default hidden, inaccessible storage falls back cleanly, and toggling makes no progress/score request.
5. New animation/audio harms gameplay or weak hardware → preserve collision/input, test muted and reduced-motion states, and measure on the named target machine before acceptance.

---

## Task 1: Version the case content and optional Vietnamese fields

**Files:**
- Modify: `services/api/Domain/CaseDefinition.cs`
- Modify: `services/api/Contracts/InvestigationContracts.cs`
- Modify: `services/api/Application/InteractionService.cs`
- Modify: `services/api/Application/InteractionService.cs` result records
- Modify: `services/api/Infrastructure/Content/CaseValidator.cs`
- Create: `services/api/Content/Cases/swapped-report.v2.json`
- Modify: `tests/OfficeCaseFiles.Api.Tests/CaseContentTests.cs`
- Modify: `tests/OfficeCaseFiles.Api.Tests/InvestigationFlowTests.cs`

**Interfaces:**
- `EvidenceDefinition` gains nullable `BodyVi`; omitted v1 JSON deserializes to `null`.
- `NpcDefinition` gains nullable, index-aligned `DialogueVi`; omitted v1 JSON deserializes to `null`.
- `EvidenceResponse` adds nullable `BodyVi` after `Body`.
- `InteractionResult` and `InteractionResponse` add nullable `DialogueVi: IReadOnlyList<string>?` parallel to `Dialogue`.

- [x] **Step 1: Pin compatibility and unlock tests**

Add API tests that load v1 unchanged, load v2 as current, keep a v1 session readable after v2 is added, reject a translation array whose count differs from its English dialogue, and reject empty translations. Add an investigation flow test proving v2 Nora E06 is locked until E02, E03 and scanner clear, then is available without Q02/Q03; assert v1's previous Q02/Q03 gate remains unchanged.

- [x] **Step 2: Run the focused tests and observe the expected failures**

Run: `dotnet test tests/OfficeCaseFiles.Api.Tests --filter "FullyQualifiedName~CaseContentTests|FullyQualifiedName~InvestigationFlowTests" --no-restore`
Expected: compile or assertion failures for missing translation fields/version behavior.

- [x] **Step 3: Add optional translation fields and validation**

Add `string? BodyVi = null` to `EvidenceDefinition` and `IReadOnlyList<string>? DialogueVi = null` to `NpcDefinition`. In `CaseValidator.Validate`, allow null; otherwise require dialogue translations to align with English count and every translated string to be nonblank. Keep English text validation and server-only solution validation unchanged.

- [x] **Step 4: Return translations only with the corresponding authorized content**

Add `DialogueVi` to `InteractionResult`; fill it from the matched NPC definition, including locked-statement NPC interactions where the public opening dialogue is already returned. Add `BodyVi` to `EvidenceResponse`; never include private solution/explanation fields in notebook, evidence or interaction DTOs.

- [x] **Step 5: Create immutable v2 case content**

Copy the current case into `swapped-report.v2.json`, set `version` to `2`, translate E01/E02/E03/E06 and the short Maya/Nora dialogue lines, preserve all solution/scoring values, and clear `requiredCorrectQuestionIds` only for E06. Keep E06's `sourceEvidenceIds` as E02 and E03; preserve `requiresEncounter` on E03. Do not edit v1.

- [x] **Step 6: Run the focused API tests again**

Run: `dotnet test tests/OfficeCaseFiles.Api.Tests --filter "FullyQualifiedName~CaseContentTests|FullyQualifiedName~InvestigationFlowTests" --no-restore`
Expected: PASS; v2's API metadata selects version `2` for new sessions, and v1 sessions still resolve their pinned version.

## Task 2: Parse bilingual API content and implement persisted reveal preference

**Files:**
- Modify: `apps/web/src/api/investigation.ts`
- Create: `apps/web/src/api/investigation.test.ts`
- Create: `apps/web/src/language/preferences.ts`
- Create: `apps/web/src/language/preferences.test.ts`
- Create: `apps/web/src/language/BilingualText.tsx`
- Create: `apps/web/src/language/BilingualText.test.tsx`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/App.css`

**Interfaces:**
- `Evidence` adds optional `bodyVi?: string | null` so v1 remains compatible.
- `InteractionResult` adds optional `dialogueVi?: string[] | null`; its array must match dialogue length when present.
- `BilingualText` consumes `{ english: string; vietnamese?: string | null; showTranslation: boolean; onToggle: () => void; }` and renders English as primary `lang="en"`, adjacent Vietnamese as `lang="vi"` only when enabled, and a keyboard-operable button.
- Preferences expose `loadTranslationPreference(): boolean` and `saveTranslationPreference(value: boolean): void`, defaulting to `false` and using a separate versioned localStorage key.

- [x] **Step 1: Add parser tests for v1 and v2 responses**

Pin the existing parsers' acceptance of absent/null optional translation fields and rejection of malformed translation arrays. Verify translated content is returned only by the evidence/interaction public DTO shape.

- [x] **Step 2: Run focused web tests and observe expected failures**

Run: `npm --prefix apps/web run test:run -- src/api/investigation.test.ts src/language/preferences.test.ts src/language/BilingualText.test.tsx`
Expected: missing tests/modules and translation parser assertions fail before implementation.

- [x] **Step 3: Parse optional translation fields**

Add nullable-string parsing for `bodyVi`; parse `dialogueVi` only when null/absent or a same-length array of string/null values. Throw `Invalid investigation response` for malformed data rather than displaying misaligned translations.

- [x] **Step 4: Add hidden-by-default persisted preference**

Implement defensive localStorage load/save with a key such as `office-case-files.translation.v1`; a storage exception returns the default and never interrupts play.

- [x] **Step 5: Add accessible bilingual text control**

Render English first in a semantic paragraph/list item. The adjacent button says “Hiện bản dịch” or “Ẩn bản dịch”; expose translated Vietnamese only when enabled. Use one global preference shared by all clue/dialogue lines so repeated buttons stay synchronized.

- [x] **Step 6: Wire evidence and dialogue rendering**

Replace direct E01/E02/E03/E06 English-only rendering in `EvidenceDetail` and the dialogue transcript with `BilingualText`. Persist preference changes. Keep speech controls bound to English text. Confirm translation reveal never calls an API mutation or modifies session state.

- [x] **Step 7: Run the focused web tests again**

Run: `npm --prefix apps/web run test:run -- src/api/investigation.test.ts src/language/preferences.test.ts src/language/BilingualText.test.tsx`
Expected: PASS for default-hidden state, reveal/hide, keyboard labels, storage persistence/failure and v1/v2 parser behavior.

## Task 3: Add the non-scored working note and evidence-driven access

**Files:**
- Create: `apps/web/src/WorkingTheory.tsx`
- Create: `apps/web/src/WorkingTheory.test.tsx`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/App.css`
- Modify: `services/api/Content/Cases/swapped-report.v2.json` (E06 prerequisites only)
- Modify: `tests/OfficeCaseFiles.Api.Tests/InvestigationFlowTests.cs`

**Interfaces:**
- `WorkingTheory` accepts `open`, `known: string`, `uncertain: string`, change handlers, `onOpen`, and `onSkip`; each textarea is optional and capped at 160 characters. It makes no API request and awards no score.
- React session state holds the note only for the current active case session; it is not sent to the API and is cleared when a new case session starts. Reopening the note panel preserves both fields.

- [x] **Step 1: Test editable, skippable, non-scored working notes**

Add tests showing both fields can be changed, Skip dismisses the panel, editing does not invoke network callbacks, and revisiting the panel preserves the note until the session ends.

- [x] **Step 2: Implement the note panel**

Use short Vietnamese labels “Điều đã biết” and “Điều còn chưa rõ” with optional English phrase citations as hints. Keep the UI out of the movement canvas and ensure opening it pauses gameplay through the existing overlay mechanism.

- [x] **Step 3: Place the note beat after E02 and before the scanner**

Offer it inline in the notebook while E02 or E03 is selected. Let the player open, skip and continue immediately. After E03, the note remains editable as “Sửa ghi chú” without showing a correct/incorrect result.

- [x] **Step 4: Use evidence prerequisites for E06 in v2**

In v2 only, E06 requires collected E02 and E03 and no correct-answer IDs. Keep the encounter requirement on E03 so the statement cannot precede the scanner crossing. Leave Q02/Q03 available as optional notebook reflection and preserve v1's gate.

- [x] **Step 5: Re-run focused component/API checks**

Run the Task 1 investigation-flow filter and the `WorkingTheory.test.tsx` filter. Expected: v2 reveals E06 only after the evidence/action chain and never after quiz answers alone.

## Task 4: Upgrade acting and scene staging for the selected room passage

**Files:**
- Modify: `scripts/art/characters-svg.py`
- Modify: `apps/web/src/game/characterArt.ts`
- Modify: `apps/web/src/game/characterArt.test.ts`
- Modify: `apps/web/src/game/runtime.ts`
- Modify: `apps/web/src/game/createGame.ts`
- Modify: `apps/web/src/game/GameHost.tsx`
- Modify: `apps/web/src/game/GameCanvas.tsx`
- Modify: `apps/web/src/game/scenes/OfficeScene.ts`
- Modify: `apps/web/src/game/GameHost.test.tsx`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/public/assets/characters/*` (generated local SVG sheets/portraits)
- Modify: `docs/assets/manifest.md`

**Interfaces:**
- Extend `AnimState` to `idle | walk | run | talk | react | dodge` with explicit frame counts, names and rates in `characterArt.ts`. Keep 3 direction rows and 80×120 frames; append talk 4, react 4 and dodge 6 frames after the current 16, for a 30-column, 2400×360 sheet. Dodge frames represent anticipation/action/recovery (2 each).
- Add `setCharacterEmote(characterId: CharacterId, emote: 'talk' | 'react' | null): void` to `GameRuntime`; `createGame` forwards it to `OfficeScene`; `GameHost` forwards a current emote request to the mounted scene.
- Gameplay animation remains presentation-only; it cannot change movement, collision, scanner rules or scoring.

- [x] **Step 1: Pin sprite sheet layout and emote dispatch**

Update character-art tests for all direction/state frames staying inside generated sheet dimensions, stable foot anchors, mirrored side movement and emote priority while dialogs are open. Update GameHost tests to verify commands reach the current Phaser runtime and clear on teardown.

- [x] **Step 2: Generate new character states and expressions**

Extend the local SVG generator with talk, reaction and dodge anticipation/action/recovery poses. Retain original editable sources, current file names, validated loading and fallback behavior. At normal gameplay zoom, confirm Maya and Nora's body gestures read during dialogue; refine the in-sheet pose if needed without adding a portrait animation system.

- [x] **Step 3: Add emote control across the React–Phaser boundary**

Implement `setCharacterEmote` in `GameRuntime`, `createGame`, `GameHost` and `OfficeScene`. Set Maya/Nora to talk/react while their matching dialogue is active; clear the emote on close, pause, focus loss and scene teardown.

- [x] **Step 4: Review and preserve the existing room passage staging**

Reuse the existing zoned floor tiles, window light, depth-sorted foreground props, clue pulses and scanner sweep above the meeting table. These already meet the approved bright office direction; the art pass changes actor performance without adding collision geometry or evidence/dialogue canvas text. Verify the passage and scanner remain readable in the visible headed browser.

- [x] **Step 5: Run focused art/runtime checks**

Run: `npm --prefix apps/web run test:run -- src/game/characterArt.test.ts src/game/GameHost.test.tsx`
Expected: PASS; run `py -3 scripts/art/characters-svg.py` and verify generated assets load via the validated SVG path in the visible browser.

## Task 5: Improve the action cue and small sound mix without paid assets

**Files:**
- Modify: `apps/web/src/audio/gameAudio.ts`
- Modify: `apps/web/src/audio/gameAudio.test.ts`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/App.css`
- Modify: `docs/assets/manifest.md` only if a new file asset is actually added

- [x] **Step 1: Test predictable scanner cue and payoff mix behavior**

Add focused audio tests for the authored cue names, mute/effects-off behavior and cleanup. Existing gesture-gated activation and ambience fetch rules remain unchanged.

- [x] **Step 2: Compose a distinct dodge tell and reveal cue**

Use short, layered Web Audio envelopes for the scanner sweep warning, dodge response, clue collect and E06 reveal. Reuse the existing licensed ambience and sound controls; avoid adding a dependency or external audio file. Keep visual sweep and text instruction equivalent so sound is never required.

- [x] **Step 3: Add spoken line to the pilot**

Reuse `EnglishAudioPlayer` for the short scanner direction and keep its transcript in DOM. The voice is provisional and device-local under the no-spend decision; mark voice consistency as an M1 test risk, and do not count local OS speech as a commercial-quality recording.

- [x] **Step 4: Re-run focused audio checks**

Run: `npm --prefix apps/web run test:run -- src/audio/gameAudio.test.ts src/audio/EnglishAudioPlayer.test.tsx`
Expected: PASS for gesture gating, mute, fallback, transcript visibility and playback cleanup.

## Task 6: Integrate the segment and verify the player journey

**Files:**
- Create: `apps/web/e2e/m1-segment.spec.ts`
- Modify: `apps/web/e2e/critical-journey.spec.ts` only if the versioned v2 changes shared setup
- Modify: `scripts/e2e.ps1` to accept an optional Playwright file filter for the approved focused browser gate
- Modify: `docs/quality/M1-segment-qa.md`
- Create: `docs/research/M1-session-consent-and-notes.md` (draft template for owner review; not approved consent language)
- Modify: `docs/assets/manifest.md`
- Modify: `docs/tasks/T37-m1-segment-implementation.md`
- Modify: `docs/memory/current.md`

- [x] **Step 1: Add a visible headed browser scenario**

In `m1-segment.spec.ts`, start new v2 session, reach E01, reveal and hide Vietnamese, read E02, skip or edit working note, traverse scanner with keyboard and visual warning, collect E03, reach E06 without Q02/Q03, and confirm the final theory can still be edited. Assert focus returns to canvas, progress is stable when translations toggle, and no console/network errors arise.

- [x] **Step 2: Exercise recovery/access cases**

Repeat the route with sound muted and reduced motion; test scanner detection → meeting checkpoint retry → success, browser reload recovery, a missing generated art asset fallback, and v1 active-session continuity. Verify no answer/solution string enters the built frontend bundle.

- [x] **Step 3: Run the agreed focused browser and script gates on the final revision**

Run web lint, typecheck, unit suite and production build; `dotnet test tests/OfficeCaseFiles.Api.Tests`; run headed E2E with the documented PowerShell launcher and `.tools/dotnet/dotnet.exe`. Keep the product browser visible and run production `vite preview` if bundler configuration changes.

- [ ] **Step 4: Validate the art and performance on the agreed target laptop**

Record actual model/browser/viewport/network profile, first interactive load, transferred bytes and frame cadence. Acceptance retains 60 fps intent and p95 ≤33 ms, no severe blocker on the target device, and no numeric load ceiling until the owner approves it after the baseline measurement.

- [ ] **Step 5: Run the 5–8 user scorecard and record results**

The owner personally invites participants. Prepare a consent and deidentified note sheet for the owner's review; do not run sessions until its wording is approved. No recording by default; use fresh browser profiles and the [M1 scorecard](../../research/M1-scorecard.md). Codex does not contact participants. Report raw counts and quotes only in deidentified form; do not treat this small directional sample as statistical or payment validation.

- [x] **Step 6: Complete the implementation gate report and handoff**

Update `docs/product/M1-gate-report.md`, the active task, `docs/memory/current.md`, asset provenance and improvement review. Recommend another iteration, pause, or M2 only after the observed blocker/player evidence and production cost are reviewed. Commit/push only scoped verified changes.

## Execution handoff

The owner approved this file-level plan and inline execution on 2026-09-27. The owner chose a no-spend first sample and will personally invite the 5–8 learners. Record an ordinary target laptop/browser before performance acceptance; settle consent and compensation before any learner session. These open inputs do not block unrelated implementation work.
