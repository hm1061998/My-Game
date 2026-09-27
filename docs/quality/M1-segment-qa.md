# M1 “Version Two at 8:50” QA record

Date: 2026-09-27; revision: `codex/m1-version-two` (based on `8e8ec66`).
Status: implementation/browser checks passed; product acceptance remains open.

## Visible browser evidence

- Full headed Chromium suite on the corrected revision: **8/8 passed** in 2.3 minutes. The browser was visible during the run. Coverage included local audio activation, first-session onboarding in three fresh contexts, full case retry/reload/replay, the dedicated M1 v2 route, texture readiness, missing-art fallback, reduced motion, and offline readable states.
- The dedicated M1 route reached E01, toggled Vietnamese on/off without changing progress, edited/skipped/reopened the session-only working theory, deliberately failed and retried the scanner, succeeded, collected E03, and reached Nora E06 without Q02/Q03. It checked the Maya/Nora acting states, translated dialogue controls, and absence of browser console/page/request errors.
- Existing full-case journey and onboarding tests passed after updating the route around the email desk. A headed run had exposed the test walking into the desk's collision edge at x≈476 before moving north. The test now steps into the clear lobby lane first; no collision geometry or gameplay rule changed.
- The visual-state test measured **932,830 bytes** for `/assets/` resources; this excludes the separately gesture-loaded 3.84 MB ambience MP3. Earlier full-suite samples varied from 30–60 fps and p95 17–67 ms while the owner reports the machine was running other tasks. The follow-up controlled samples below met the frame-time intent; exact target profile and first-load network acceptance remain open.
- Follow-up recheck after the owner identified concurrent applications as the likely source of the earlier variation: two separate serial headed critical-journey runs on Windows/Playwright Chromium at 1280×800 both measured **60 fps, p95 17 ms**. During the second run, total CPU samples ranged 17.4–49.2% (14 two-second samples, average 30.7%). This meets the frame-time intent in the current browser/device state. The owner's exact computer model, normal browser and network profile are not recorded, so target-device/load acceptance remains open.
- The M1 route screenshot attachments were visually inspected at normal browser size for the case/dialogue states and in-world actor staging. Emote state assertions were read from the live Phaser scene. This is technical visual QA, not learner feedback.

## Automated checks

| Gate | Result | Evidence/limit |
| --- | --- | --- |
| API tests | Pass, 16/16 | `dotnet test tests/OfficeCaseFiles.Api.Tests --no-restore`. |
| Web lint and types | Pass | `npm run lint`, `npm run typecheck` from `apps/web`. |
| Web unit tests | Pass, 19 files/61 tests | `npm run test:run` from `apps/web`; sequential run. |
| Production build | Pass | `npm run build`; existing Vite `advancedChunks` deprecation and large Phaser vendor chunk warnings remain. |
| Production private-answer scan | Pass | Scanned generated JavaScript for the v2 solution explanation, quiz answer IDs and review answer IDs; v2 case JSON is absent from `dist`. |
| Agent docs and diff checks | Pass | `scripts/check-agent-docs.ps1` passed for 38 task files; `git diff --check` passed. |
| Headed Chromium E2E | Pass, 8/8 | Final corrected revision including the muted and reduced-motion M1 route; visible browser; isolated ports 5063/5174. |
| Target-device performance/load | Open | No ordinary target laptop/browser or network profile supplied; automated samples are inconsistent. |
| 5–8 learner sessions | Not run | Consent/compensation need owner review; owner invites learners. No participants were contacted. |

## Remaining acceptance gates

1. Owner names the ordinary target laptop, OS/browser, viewport and network profile; rerun first-load and frame cadence there and decide the load ceiling from the baseline.
2. Owner reviews and approves the separate consent/session-notes draft and resolves compensation before inviting participants.
3. Owner conducts 5–8 sessions with the M1 scorecard. Record deidentified raw counts and concrete explanations; do not infer statistical market demand or willingness to pay.
4. Revisit the M1 product gate report after those observations. T38 recommends M2 as a validation pilot only; automated or AI-role evidence does not authorize paid case-pack production.

## T38 visual-quality follow-up (2026-09-27)

T38 retained the approved 2.5D renderer and improved the reproducible office/character SVG art. Two post-art headed samples again measured **60 fps, p95 17 ms** at 1280×800. Final visual-state `/assets/` measurement is **991,549 bytes**, +58,719 bytes (6.3%) against the T37 932,830-byte sample; the separately gesture-loaded 3.84 MB ambience MP3 is excluded. Exact target hardware/browser/network acceptance remains open. See [T38 visual QA](T38-visual-quality-qa.md) for before/after captures, verification, and the five AI role simulations, and [the T38 synthesis](../research/T38-ai-roleplay-synthesis.md) for limits and the conditional M2 validation recommendation.
