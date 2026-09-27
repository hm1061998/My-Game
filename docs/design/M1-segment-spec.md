# M1 segment design spec — “Version Two at 8:50”

Status: **design approved by owner**, 2026-09-27. Approved choices: E01→E02→scanner→E03→Nora E06; no Q02/Q03 gate for E06 in v2; Vietnamese hidden by default with adjacent toggle; no cash spend for the first art/audio sample; owner personally invites 5–8 learners. Approval covers design only, not product code, external contact, spending or deployment.

## Audience and intended result

For self-paying A2–B1 learners aged roughly 18–35 who work or are preparing to work and play on desktop web. The player should feel like they noticed a workplace-language clue, formed a cautious theory, crossed a fair short hazard, and uncovered a new reason to question the report change. Vietnamese helps recover meaning without replacing the English evidence.

M1 tests one 3–5 minute passage from the existing **The Swapped Report** case. Its success is that real players can tell the first goal, cite the English wording behind their theory, find optional Vietnamese when needed, understand the scanner warning with or without sound, and give a concrete reason to continue. This is directional evidence from 5–8 target learners, not proof of market demand.

## Proposed creative direction and scope

- Art direction: **Illustrated mystery** from [M0 art/audio brief](M0-art-direction-brief.md): warm painted 2.5D sprites, teal shadows, expressive gestures, restrained clue lighting and a small sound signature. The owner approved a self-produced, no-spend sample before any broader art commitment.
- Keep React as the owner of readable content, focus, translation controls and dialogs; Phaser owns room rendering, character animation, camera, movement, collision and scanner timing; the API remains authoritative for collected evidence and session state. The server JSON remains the source for versioned case text and private solution.
- Use an immutable new case content version for M1. Existing sessions stay pinned to v1; new sessions use v2. Keep all answers and scoring rules server-side.
- Include the existing E01 email, E02 chat, scanner crossing and E03 version history, followed by the Nora statement E06. Do not redesign the whole case, case ending, admin backlog, checkout, identity or analytics.
- M0's AI reports are hypotheses only. M1 includes a real-player scorecard and separately approved participant source/compensation.

## Player journey

1. **Hook, Maya at the desk:** Maya says the client meeting is close and the team needs the approved report. Her gesture points to the lit desk. A short English line appears as accessible DOM text; the player can reveal its Vietnamese translation beside it. Close dialogue returns keyboard focus to the Phaser canvas.
2. **E01, the decision clue:** collect Maya's email. Highlight “approved report, version three” and “Do not use the previous version” as readable evidence without highlighting an answer. English is shown first; each evidence passage has an adjacent “Hiện tiếng Việt” control, hidden by default. Preference persists locally; use never affects score.
3. **E02, an unresolved question:** collect the chat where Nora asks whether she should send the previous version. Show Nora's brief reaction using the approved acting sample. The evidence supports uncertainty about meaning; it does not establish intent.
4. **Working theory, not a quiz gate:** invite a temporary, non-scored note such as “What do we know?” / “What is still unknown?” before the archive route. The player can skip it and can change it after E03. It must not reveal the server solution or block movement, evidence, or statement access.
5. **Fair action beat:** Maya's English direction is short and voiced or replayable with transcript: “Wait until the scanner turns away. Move when the light points to the wall.” A visible sweep and danger mark communicate the same timing. Player can pause, dodge and retry from the meeting checkpoint; a failed dodge keeps evidence and never reduces English score. Existing scanner mechanics are reused unless the asset sample shows a clear readability gap.
6. **E03, evidence changes the theory:** after the scan is cleared, collect version history. It says Nora's account replaced the client file with v2 at 8:50, and the record alone does not explain why. The player gets a chance to revise their temporary note; the game does not declare motive from an account log.
7. **E06, character payoff:** after E02 and E03 are collected, Nora's statement is available without requiring Q02/Q03. She explains that she misread “previous version” and corrected the mistake when she learned about it. The expression, English transcript, adjacent optional Vietnamese and a short musical cue land the reveal. End the slice on the open question of how the team will prevent another version mix-up.

## Learning and language requirements

- Target phrases: “approved report”, “previous version”, “send”, “replaced”, “account”, and “at 8:50”. Keep exact English authoritative; translation must preserve ambiguity and must not add motive or answer information missing from English.
- Evidence body translation is an adjacent reveal. NPC dialogue translations are paired with their English line, not placed in a separate glossary-only screen. Transcript remains visible when audio is off or unavailable.
- Persist the player's show/hide preference locally, initially hidden, and expose it with keyboard and screen-reader labels. A reveal changes presentation only; it does not alter session revision, reading score, investigation score, hint count or answer availability.
- Keep full-case comprehension questions in the notebook/review path. In this segment they may be used as optional reflection after a beat but cannot gate E06, the archive, or the scene payoff. Use the current server evidence prerequisites E02 + E03 for E06 in case v2. Keep the final conclusion and existing scoring policy outside this segment.

## Art and audio sample acceptance

Commission or make one sample before producing the full segment: a room corner at actual gameplay size and one Maya or Nora idle → talk → reaction sequence. Review silhouette and gesture at normal zoom, eye/face readability in dialogue, color under grayscale, reduced motion, and a missing-asset fallback. Only after the sample passes should the owner approve the remaining scope and cash ceiling.

The segment needs: the updated room passage, protagonist walk/turn/idle/dodge, two NPC talk/reaction states, readable scanner tell, clue interaction feedback, existing ambience plus a small clue/dodge/payoff mix, one short English voice exchange with transcript, and complete mute/fallback support. Existing licensed ambience can be reused with its manifest entry; any new audio/art needs source, commercial rights, adaptation terms and voice consent documented before use. No outside asset has been acquired for this proposal.

## Quality and access gates

- Preserve Phaser 2.5D, keyboard controls, depth/collision, pause/focus, checkpoint/retry, validated asset loading/fallback and the server/private-answer boundary.
- Keep learning content in semantic DOM. Maintain visible keyboard focus, readable contrast, reduced-motion behavior, clear non-color danger cues and text equivalence when muted.
- Retain the existing 60 fps intent and p95 frame time ≤33 ms. Owner must name the ordinary laptop/browser and network profile before fixing a first-load size ceiling.
- The [M1 scorecard](../research/M1-scorecard.md) defines the 5–8 learner session and severe blockers. A majority should independently identify the first goal and relevant English clue and state a concrete reason to continue; no unresolved severe blocker may remain.

## Open decisions before an implementation plan

1. Name an ordinary target laptop, browser, viewport and network profile for performance/load checks.
2. Settle consent and any compensation arrangements with the owner before learner sessions; the owner will invite participants.
3. Review and approve the separate file-level M1 implementation plan before code begins.

The design decisions above are settled. The file-level implementation plan is at [2026-09-27 M1 implementation plan](../superpowers/plans/2026-09-27-m1-version-two-segment.md). M1 code starts after plan approval; target-machine details are required before performance acceptance, and consent/compensation are required before learner sessions.
