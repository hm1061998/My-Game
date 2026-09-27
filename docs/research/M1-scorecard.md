# M1 human playtest and engineering scorecard

Status: draft for the approved M1 segment; learner-session protocol needs consent/compensation details, 2026-09-27. AI M0 reports are hypotheses only. Use 5–8 new target learners aged about 18–35, A2–B1, who work or are preparing to work. The owner will invite participants personally. Settle consent wording and any compensation before sessions. No recording by default; use deidentified notes and avoid storing personal English scores with identities. These are free product-research sessions; paid/monetization work is deferred until the owner explicitly asks to resume it.

## Session, 30–45 minutes each

1. Record browser, viewport, laptop CPU/RAM class, input setup and self-reported English level. Use a fresh profile and visible browser. Explain that the game is being tested, not the participant; ask for consent to take deidentified notes.
2. Let the player start and play the 3–5 minute M1 segment without tutorial prompts from the moderator. Note the time and steps to the first meaningful clue, wrong turns, focus/keyboard issues, and any rescue prompt verbatim.
3. Ask the player to explain what happened and cite the English word, sentence or voice line that changed their theory. Observe whether they find and use adjacent Vietnamese translation, replay, and glossary; translation use never reduces score.
4. Observe one short dodge: whether its warning is seen/heard, whether failure is understood, and whether retry feels fair. Repeat with sound muted if the first run used sound.
5. Ask what character attitude they read, what sound/animation helped, and which moment felt most or least like a game. Ask whether they would voluntarily play the next free segment and why. A hypothetical answer is not proof of payment intent.
6. Record whether the segment reached its payoff, the actual reason for abandonment, and any moderator intervention. Do not coach answers or treat a prompted success as unprompted.

## Decision fields and gates

| Area | Observation to record | Severe blocker |
| --- | --- | --- |
| First goal | Unprompted action and time to first clue; can player point to EMAIL target? | Repeated inability to start or locate necessary clue |
| English in the case | Player cites a relevant English detail in their theory, with or without translation | Required clue unreadable or translation gives away an answer absent from English |
| Desire to continue | Voluntary choice and concrete reason, not a yes/no poll alone | Most sessions stop without a concrete story/game reason to continue |
| Dodge and recovery | Warning understood, outcome visible, retry successful | Unreliable dodge or opaque failure blocks progress |
| Acting and sound | Emotion/action readable at gameplay size with sound on and off | Critical state only available through sound or unclear motion |
| Accessibility | Keyboard/focus, text contrast, transcript, adjacent translation, reduced motion | Necessary information or interaction inaccessible |
| Web performance | First interactive load and frame cadence on agreed target laptop/browser | Target device cannot load or sustain playable response |

M1 succeeds only with no unresolved severe blocker and a clear majority of new participants independently identifying first goal and English clue and giving a concrete reason to continue. Record raw counts and explanations, not statistical claims. If this fails, classify cause (story/learning, staging, art/animation, audio, renderer or performance), fix a focused cause and retest. A 3D probe needs separate evidence and approval.

## Engineering targets and open floor

Retain the existing 60 fps intent and p95 frame time ≤33 ms. Measure final build transfer, first interactive load, memory and frame cadence on the **owner-selected ordinary laptop/browser**; no numeric load ceiling is fixed until that hardware floor and network profile are chosen. Also test pause/focus, movement/collision/depth, clue visibility, retry/checkpoint, muted/blocked audio, missing asset fallback and score neutrality after translation use in a visible browser. Current baseline hardware is not yet a target-market floor.

Gate inputs still needed: target desktop/laptop floor and browser before performance acceptance; consent and any compensation details before learner sessions. The owner chose no cash spend for the first sample and will invite 5–8 participants. Resolve the relevant gates before any learner session. Do not buy/commission assets, obtain commercial quotes, build payment/checkout features, or start paid-case production/acquisition unless the owner explicitly resumes paid work.
