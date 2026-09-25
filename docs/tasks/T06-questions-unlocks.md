# T06 — Questions, retry, and evidence unlocks

Status: done
Owner: Codex
Depends on: T05
Plan version: PROJECT_PLAN.md 1.4, T06 implementation 1.0
Approval: user's 2026-09-25 “tiếp tục bước sau” after T05 handoff; covers the next game slice T06 only
Lifecycle phase: define/design → build
Workflow step: completed through visible browser confirmation, scripts, improvement and handoff

## Outcome

After collecting a clue, the player can answer its English reading question, retry a wrong answer, and see the resulting evidence unlock without losing progress on reload.

## Entry evidence and design

- T05 is committed at baseline `8069335` and Git was clean at T06 start. Questions Q01–Q03 and prerequisites already exist in the versioned server JSON. Q01 follows E01, Q02 E02, Q03 E03; E03 itself awaits the T07 encounter.
- Expose question prompt and choices only after all source evidence is collected. Never expose correctChoiceId or explanation before a valid answer; keep progression and attempts server-owned.
- Wrong answers may be retried. Persist first choice and attempts; first-attempt success remains immutable for T08 scoring. A pass is terminal. Replaying the same submission ID and payload returns the original outcome without an extra attempt; reuse with a different payload or stale revision conflicts.
- Q01 pass makes Maya's E05 statement available if E01 is collected. Q02 pass alone cannot unlock Nora's E06; Q03 and E03 remain required. Unlock means available, not automatically collected. Use the existing NPC interaction for collection.
- React renders accessible question controls in the notebook, shows answer feedback and attempt count, pauses the canvas while open, and reloads question state after submit. No answer key or private explanation is bundled in web assets.

## Scope and exclusions

Implement question progress store port + SQLite migration, domain/application answer rules, GET/POST question APIs, safe DTOs, React notebook flow, API/browser tests, README and handoff. Preserve T05 session revision/idempotency and existing local database.

Excluded: E03 encounter, final conclusion/scoring display, admin implementation, new provider, Docker/GitHub/deploy.

## Acceptance and verification

- Q01 inaccessible before E01; wrong choice increments attempts and permits retry; correct choice passes and returns feedback. First choice remains unchanged.
- Duplicate answer submission does not increment revision/attempts twice; changed payload and stale revision conflict; unknown/locked IDs have explicit errors.
- Correct Q01 allows E05 collection through Maya; E05 body still cannot be read before collection. Q02 pass alone does not allow E06; Q03 stays locked before E03.
- Reload/new API host preserves attempts/pass and unlocked state. Public question GET/list never reveal correct choice or explanation prematurely.
- Visible browser preview/test/final confirmation: collect E01 in canvas, answer wrong then right in notebook, visit Maya to collect E05, reload and confirm. Exercise overlay Escape/focus as regression for L005.
- Focused tests, final full `verify.ps1`, migration drift and `git diff --check` pass.

## Handoff

- Added domain prerequisite rules, session question/answer application service, safe list/detail/submit DTOs, SQLite `QuestionProgress` and `AnswerReceipts` migration. No correct choice or explanation is exposed before a valid pass; explanation is readable after passing, including after reload. First choice remains immutable for T08 scoring.
- Wrong answers save an attempt and permit retry. Same submission ID and payload replays the saved outcome without an extra attempt; changed payload/stale revision conflicts. A passed question rejects a new answer. Q01 pass enables Maya's E05 collection, while Q02 pass alone leaves E06 locked; Q03 waits for E03 in T07.
- React notebook now renders accessible radio choices, attempts, feedback and retry. It updates session revision and question state without sending answer correctness from the client. The overlay continues to pause Phaser and return focus on Escape.
- Visible Chrome window at `http://127.0.0.1:5173/`, 1280×800: collected E01 via canvas, answered Q01 wrong then right, closed with Escape and moved to Maya, collected E05, reloaded and saw Q01 passed, E05 retained and explanation readable; 1100×720 had no horizontal overflow. Final visible browser confirmation passed after the last runtime change.
- `./scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe` passed on the final runtime revision: agent structure (21 tasks), npm ci/audit 0 vulnerabilities, lint, typecheck, 6 web tests, Vite build, locked .NET restore/build with 0 warnings/errors, 6 API tests. `dotnet-ef migrations has-pending-model-changes` reported none; `git diff --check` passed. Existing SQLite data was preserved and migration applied explicitly.
- Browser runner was visibly headed (`headless: false`) per user instruction. One initial browser script selector ambiguity was fixed and retested; no product bug remained. Docker/GitHub/deployment and admin code were not touched.

## Improvement review

- Result: verified (L005)
- Observation/evidence: T06's new notebook question controls reused the same React–Phaser overlay handoff as T05. Visible Chrome confirmed Escape closed the overlay, restored canvas focus, and allowed movement to Maya without also toggling pause.
- Mechanism changed or no-change reason: upgraded L005 from candidate to verified with a second comparable browser path; retained the narrow T05 product fix and did not create a broader rule or skill.
- Validation: final visible Chrome Q01→Maya path, frontend bridge tests and full gate passed; lesson ledger text inspected for consistency with scoped web rules.
- Follow-up trigger: T07 modal/encounter work should consider an automated keyboard handoff regression test if input handling changes.
