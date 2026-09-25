# T05 — Case content, interactions, and notebook

Status: done
Owner: Codex
Depends on: T03, T04
Plan version: PROJECT_PLAN.md 1.3, T05 implementation 1.0
Approval: user's 2026-09-25 instruction “tiếp tục bước sau”, following committed T04 and the approved plan; covers T05 only
Lifecycle phase: define/design → build
Workflow step: completed through browser confirmation, scripts and handoff

## Outcome and success signal

The player can walk to a real point in the office, use `E` to interact, receive a short English clue through the API, read it in an accessible DOM notebook with glossary help, and reload without losing collected clues.

## Evidence and decisions

- Entry: T04 is committed at `af0b33b`; Git is clean. Phaser has movement but no interaction bridge; API has a SQLite session port but no content or evidence rows.
- Use the plan's provisional D01 “The Swapped Report” story for case version 1, consistent with the existing UI. This is an accepted working content choice for T05, not a claim that final prose or learner level has been playtested.
- Author six 25–60-word English evidence items, three NPCs, 12–15 contextual glossary terms, three future questions and private solution metadata in server-only versioned JSON. Validate IDs, references, answer counts, unlock cycles and solution evidence at startup/tests.
- E01, E02 and E04 are collectible from reachable office objects. E03 remains locked for T07's archive encounter; E05 and E06 remain locked until T06 question prerequisites. NPCs can give short non-spoiler dialogue now. This preserves the planned unlock order instead of prematurely giving every clue to the player.

## Ownership and scope

- Phaser owns proximity, prompt and `E` key. Typed bridge emits an interaction ID only on deliberate input; React never receives per-frame position.
- React owns an accessible dialogue/notebook overlay, API state, focus restoration and pause command. Visible errors cover no session, locked/not-found evidence, network failure and retry.
- API/Application own session validation, interaction rules and public DTO projection; `ICaseCatalog` is the content port. Infrastructure owns JSON loading/validation and SQLite evidence/receipt persistence. Private solution/correct choices never enter web assets, map metadata, OpenAPI response DTOs or logs.
- Interaction mutation uses expected revision and submission ID. Same ID/payload is idempotent; stale revision or mismatched reuse conflicts. Database writes are atomic.
- Include public case metadata/map points, session interaction and notebook/evidence routes, migration, tests, documentation and local type generation from OpenAPI if a safe compatible generator can be established without vulnerable dependencies.

Excluded: actual answers/unlocks and scoring (T06), encounter/dodge (T07), final conclusion (T08), second case/provider, mobile controls, Docker/GitHub/deployment.

## Acceptance and verification

- Six server-only clue bodies and glossary entries pass validator checks; bad references, duplicate IDs, invalid question correctness and unlock cycles fail clearly.
- Canvas renders three NPCs and reachable interaction points. `E` only triggers within radius; no collection by clicking a distant item. A locked point gives a clear non-spoiler response.
- A fresh session can collect E01/E02/E04 at their real map points; notebook lists only collected evidence. E03/E05/E06 remain gated. Evidence body is unavailable before collection; server does not trust a client-sent coordinate as proof of proximity or return private solutions.
- Duplicate submission does not increment revision twice; stale revision conflicts. Reload and a new API host retain collected evidence in SQLite.
- Opening notebook/dialogue pauses movement and clears held input; closing returns focus to canvas. Keyboard and DOM content remain usable at desktop and smaller laptop widths.
- Focused tests, real browser preview/test/final confirmation, full repository verification, content validation, migration drift and `git diff --check` pass on the final revision.

## Handoff

- Versioned server-only JSON case includes six clues, three NPCs, 13 glossary terms, three future questions and private answer/solution. Startup validation and negative tests cover IDs, references, answer validity and unlock cycles.
- Public case/map DTOs omit private answers. Interaction endpoint applies session cookie, CSRF guard, revision/submission ID, server unlock rules and SQLite evidence/receipt persistence. E01/E02/E04 are available; E03 awaits T07, E05/E06 await T06.
- Phaser renders map markers and emits nearby/`E` interaction events; React owns dialogue, notebook, glossary, errors and focus. Overlay pauses movement. Browser testing found and fixed an initial-scene input race and an Esc double-handling bug.
- Chrome/Playwright at 1280×800 traversed E01, E02 and E04 by keyboard and pressed E at each real point; notebook content and vocabulary appeared, reload retained all three, 1100×720 did not overflow. Initial 401 for a browser without session is expected. A transient Chrome `ERR_NO_BUFFER_SPACE` on one run did not reproduce on rerun.
- Final `scripts/verify.ps1` passed: agent structural check (20 tasks), npm clean install/audit 0 advisories, lint/typecheck/build, 6 web tests, .NET locked restore/build 0 warnings/errors and 5 API tests. EF migration drift check reported none; `git diff --check` passed. No typegen package was added because the previously tested generators did not meet TypeScript 6/audit constraints.
- T15–T26 administration planning files are a parallel workstream; this task did not edit their scope. No deploy or publishing occurred.

## Improvement review

- Result: candidate
- Observation/evidence: Chrome testing caught the React→Phaser pre-create input race and simultaneous Esc handling when an overlay closes. Both errors passed typecheck/unit tests but failed real canvas behavior.
- Mechanism changed or no-change reason: fixed scene pre-create guard and capture-phase overlay Escape handling in product code; kept this as a candidate lesson rather than broadening agent rules after one feature.
- Validation: repeated Chrome path through E01/E02/E04 and notebook reload; web tests cover bridge updates.
- Follow-up trigger: T06/T07 overlays and modal/canvas keyboard handoff should repeat browser checks, then promote a focused interaction test pattern if reproduced.
