# M1 product gate report

Status: **M1 implementation and automated browser gate passed; learner/product acceptance remains open**, 2026-09-27.

## What is implemented

- New sessions use immutable case v2; active v1 sessions remain pinned to v1. E01/E02/E03/E06 and Maya/Nora dialogue include optional Vietnamese text. English remains primary, translation starts hidden and can be toggled beside the English line.
- The approved E01 → E02 → scanner → E03 → Nora E06 route works without Q02/Q03. A temporary working-theory note can be edited/skipped/reopened without score or API mutation.
- Maya/Nora talk/react animation states and scanner/dodge/reveal sound cues are integrated into the Phaser passage. Speech stays a local provisional browser voice with visible English transcript.
- Full headed browser suite passed 8/8 on the corrected revision, including the integrated M1 journey with mute and reduced motion, failure/retry, missing-art fallback and recovery paths. Web lint/typecheck/build, 61 web tests, 16 API tests, docs checks and production private-answer scan passed; details are in [M1 QA](../quality/M1-segment-qa.md).

## What the evidence does not establish

- No human learner session has run. M0 simulated learner roles and automated browser checks are not evidence of enjoyment, comprehension with real learners, retention, purchase intent or revenue.
- The earlier 30 fps/p95 66 ms full-suite sample was taken while the owner reports the device was running many other tasks. On a follow-up test, two separate serial headed runs on Windows/Playwright Chromium at 1280×800 both measured 60 fps/p95 17 ms; total CPU during one run ranged 17.4–49.2%. This meets the frame-time intent in the sampled state. Exact computer model, normal browser and network profile remain unrecorded, so target-device/load acceptance is still open. The visual-state test measured 932,830 bytes for `/assets/` resources, excluding the separately gesture-loaded 3.84 MB ambience MP3.
- The first sample used no new paid media. Local browser speech is device-dependent and is not a commercial voice recording. Production cost per finished case and paid-pack demand are unknown.

## Gate decision

**Keep M1 open for target-device performance and owner-led learner validation. Do not recommend M2, checkout, subscription, or paid case-pack production yet.** The completed implementation is a reviewable pilot candidate, not a commercially validated product.

Next inputs: (1) owner identifies the ordinary target laptop/browser and network profile; (2) owner reviews the [consent and notes draft](../research/M1-session-consent-and-notes.md), resolves data retention and compensation, then personally invites 5–8 A2–B1 learners aged about 18–35; (3) owner records results with the [M1 scorecard](../research/M1-scorecard.md); (4) revisit this gate with the actual observations and production-time/cost estimate.

No participants were contacted, no money was spent, and nothing was deployed or published as part of this gate.
