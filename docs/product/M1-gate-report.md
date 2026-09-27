# M1 product gate report

Status: **M1 implementation and automated browser gate passed; learner/product acceptance remains open**, 2026-09-27.

## What is implemented

- New sessions use immutable case v2; active v1 sessions remain pinned to v1. E01/E02/E03/E06 and Maya/Nora dialogue include optional Vietnamese text. English remains primary, translation starts hidden and can be toggled beside the English line.
- The approved E01 → E02 → scanner → E03 → Nora E06 route works without Q02/Q03. A temporary working-theory note can be edited/skipped/reopened without score or API mutation.
- Maya/Nora talk/react animation states and scanner/dodge/reveal sound cues are integrated into the Phaser passage. Speech stays a local provisional browser voice with visible English transcript.
- Full headed browser suite passed 8/8 on the corrected revision, including the integrated M1 journey with mute and reduced motion, failure/retry, missing-art fallback and recovery paths. Web lint/typecheck/build, 61 web tests, 16 API tests, docs checks and production private-answer scan passed; details are in [M1 QA](../quality/M1-segment-qa.md).

## What the evidence does not establish

- No human learner session has run. M0 simulated learner roles and automated browser checks are not evidence of enjoyment, comprehension with real learners, retention, purchase intent or revenue.
- The earlier 30 fps/p95 66 ms full-suite sample was taken while the owner reports the device was running many other tasks. Four serial headed runs on Windows/Playwright Chromium at 1280×800 measured 60 fps/p95 17 ms: two before and two after T38's vector-art pass. This meets the frame-time intent in the sampled state. Exact computer model, normal browser and network profile remain unrecorded, so target-device/load acceptance is still open. T38 measured 991,549 bytes for `/assets/` resources (+58,719 bytes, 6.3%, against the T37 932,830-byte sample); the separately gesture-loaded 3.84 MB ambience MP3 is excluded.
- The first sample used no new paid media. Local browser speech is device-dependent and is not a commercial voice recording. Production cost per finished case and paid-pack demand are unknown.

## Gate decision

**Keep M1 open for target-device performance and owner-led learner validation. Recommend M2 as a small, free player-validation milestone; all paid/monetization work is deferred until the owner explicitly asks to resume it.** Five AI role simulations found useful hypotheses but cannot establish learner comprehension, enjoyment, retention, purchase intent or revenue. They generally found the objective and clue trail legible and wanted to continue to Nora; repeated risks were scanner timing/control clarity, exact version wording, the optional theory note feeling like homework, and character identity/acting at gameplay scale. See [T38 feedback synthesis](../research/T38-ai-roleplay-synthesis.md).

M2 entry gates: (1) owner identifies the ordinary target laptop, OS/browser, viewport and network profile; (2) owner reviews the [consent and notes draft](../research/M1-session-consent-and-notes.md) and resolves data retention and compensation; (3) owner personally invites 5–8 A2–B1 learners aged about 18–35 and records sessions with the [M1 scorecard](../research/M1-scorecard.md). Agree pass criteria before sessions. This is free product research only. Do not prepare commercial quotes, buy assets, produce paid cases, build checkout/subscriptions, or run paid acquisition until the owner explicitly requests resumption. Any resumed paid work needs a separately scoped plan and approval.

No participants were contacted, no money was spent, and nothing was deployed or published as part of this gate.
