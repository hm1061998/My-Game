# M0 AI-assisted first-session findings

Status: simulated heuristic audit plus visible browser observation, 2026-09-27. Baseline code revision `40d649a`; no gameplay code changed. Sources: independent [A2](M0-ai-a2-notes.md) and [B1](M0-ai-b1-notes.md) role reports, [public packet](M0-player-packet.md), and the visible in-app browser at `http://127.0.0.1:5173/` with API at `127.0.0.1:5062`.

## What was actually observed

The browser loaded the connected case, accepted the start action via Enter, and displayed the first movement tutorial. The 2.5D canvas showed the player at WELCOME, a labelled EMAIL clue with a ring, a CHAT clue, Leo, a room objective box, right-side mission drawer, and keyboard legend. Browser warnings/errors checked at that state: none. The screenshot shows clear clue labels and an E interaction legend, so the AI concern that the player might have no indication of how to interact is **partly contradicted** by the actual UI. No full movement-to-E01, sound listening, dodge or case-completion path was performed in this M0 observation; earlier automated T31 evidence covers technical playability, not human enjoyment. E01 text was read from public server content, not reached in this browser pass.

## Prioritized hypotheses for M1

| Priority | Hypothesis and evidence | What to change/test in M1 |
| --- | --- | --- |
| 1 | Both roles identify the version distinction in E01 (“approved report, version three”; “Do not use the previous version”; `v3`) as the first meaningful deduction. Yet the first screen currently says “Explore the office” and “Thu thập hồ sơ”, with no specific question about what was swapped. | Let the player make a small prediction after E01 and later compare it with conflicting evidence. In real sessions ask them to cite the English words that shaped their theory. Do not add a quiz that blocks progress. |
| 1 | Current canvas and drawer have legible labels but simple small figures; screenshot alone shows little facial acting or scene reaction. User explicitly flagged stiff characters and weak game feel. | Use the M1 sample to test readable gesture/pose at gameplay zoom, a dialogue close-up and clue feedback. Ask real players which moment felt like a game and why. |
| 1 | Approved adjacent Vietnamese reveal is absent in the current baseline. A2/B1 role reports both say it could support version comprehension, with unknown real effect. | Implement only for the chosen M1 clue/exchange, hidden at first, persistent, with replay and no score penalty. Observe discovery/use with real participants; compare translation against English for answer leakage. |
| 2 | A2 notes the mixed hierarchy: English “Explore the office”, Vietnamese start/tutorial and a broad follow-up checkpoint. Visible screenshot confirms these elements, but also shows a stronger EMAIL ring and label than the packet alone conveyed. | Test first destination and post-E01 next step without moderator prompts. Keep the highlighted clue; simplify simultaneous tutorial, objective and control messaging if people hesitate. |
| 2 | B1 notes that five controls including dodge are introduced before their story relevance is clear. Visible screenshot confirms the full legend but does not show actual memory load or interference. | Reveal dodge when its short set-piece begins; test whether players can keep reading/deducing without action interruption. |
| 2 | E01 has time, sender, version and attachment details; B1 role asks whether time/sender feel relevant or like noise. | Give the player a reason to compare at least two details. Ask which facts they would save and why. |

## Limits and next evidence

These are design hypotheses, not findings from real participants. The role reports agree on the first clue and optional translation, but both received the same curated packet and cannot validate enjoyment, pacing, audio, frame rate, payment intent or completion. Human testing with 5–8 target learners in M1 remains mandatory before M2 or a paid-content commitment. No percent success, retention or willingness-to-pay estimate is made here.
