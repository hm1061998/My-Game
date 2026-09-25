# T08 — Conclusion, scores and review

Status: planning
Owner: Codex
Depends on: T06, T07
Plan version: PROJECT_PLAN.md 1.4, T08 implementation 1.0
Approval: pending user approval of this exact scope and the existing case truth
Lifecycle phase: define/design
Workflow step: plan drafted; approval required before coding

## Outcome and success signal

The player can finish *The Swapped Report* by using the English evidence they earned: select one colleague, one reason and exactly two collected evidence records, confirm the irreversible conclusion, receive separate reading and investigation scores, see the full explanation only after submission, and complete five short review items. Completion, scores and review progress survive reload and API restart; starting again creates a new session rather than overwriting the completed one.

The exit gate is one visible browser journey from a T07-complete session through conclusion, result, review, reload and replay, backed by domain/API/SQLite tests and the repository's full verification gates.

## Evidence and decisions

### Verified entry evidence

- Baseline `03259b4`, clean and synchronized `main`. T01–T07, T13 and T14 are done; T15–T26 admin implementation remains deferred.
- T06 stores attempts, first choice and pass state for Q01–Q03; T07 persists checkpoint, encounter and E03. E06 is available only after Q02/Q03 and E02/E03, so the conclusion prerequisite can be enforced entirely on the server.
- The private JSON already contains the proposed truth: Nora misunderstood “previous version”; `E03` and `E06` are the accepted evidence set. Public DTOs and the frontend do not currently expose the solution or correct question choices.
- `PROJECT_PLAN.md` defines reading score as `round(firstTryCorrect / 3 * 100)` and investigation score as suspect 40 + reason 20 + up to two valid evidence records at 20 each. One session has at most one final conclusion.

### Decisions included in approval

- Approving T08 confirms the existing prototype truth for case version 1: Nora replaced the file with version two because she misunderstood Maya's instruction; E03 + E06 is the accepted evidence set. This does not establish the final story/art direction for future case versions.
- Add public, versioned conclusion choices (three colleagues and concise reason options) plus five A2–B1 review items to the server case bundle. Correct combination, accepted evidence sets and correct review choices remain server-only until their disclosure point.
- `ReadyToConclude` requires all three questions passed and E03/E06 collected. The client may display readiness, but the server recomputes it and never accepts scores or unlock IDs from the client.
- A conclusion request contains suspect ID, reason ID, exactly two unique collected evidence IDs, submission ID and expected revision. The server computes both scores, stores one immutable result, moves the session to `Completed`, and returns the explanation. Evidence credit uses the best matching accepted evidence set so future content may define alternatives without changing scoring code.
- Conclusion idempotency is checked before revision conflict: same submission ID and identical payload returns the stored result; a changed payload conflicts. A unique conclusion per session prevents parallel double-finalization.
- Review has five multiple-choice items. `PUT /api/v1/session/review/{id}` sends a choice ID, submission ID and revision; the server decides correctness and marks an item complete only on a correct choice. Review does not change either score and incorrect choices remain retryable.
- React owns accessible conclusion/result/review overlays and confirmation. Phaser remains paused behind overlays and receives no per-frame/network responsibility.

## Scope

### Included

- Extend server case definitions, JSON content and startup validation for public conclusion options and private five-item review answers/explanations.
- Add pure domain rules for readiness and both score calculations, including duplicate/order-independent evidence handling and partial-credit cases.
- Extend the application storage port with conclusion/result/review records and explicit saved/already-applied/conflict/not-found/locked outcomes.
- Add SQLite rows, unique constraints, idempotency receipts and a versioned migration. Conclusion, session status/revision and receipt must commit atomically; review mutation and receipt must also be atomic.
- Add safe session endpoints for conclusion view/submission, completed result and review list/mutation. Use explicit DTOs and ProblemDetails; no correct answer, accepted set or explanation is disclosed before allowed.
- Add React API validation and keyboard-accessible UI for readiness, selection, irreversible confirmation, scores, explanation, five review items and “Chơi lại vụ án”. Pending/error/conflict recovery must not silently submit twice.
- Update README, tests, task/index/memory and handoff evidence.

Expected affected areas: `services/api/Domain`, `Application`, `Contracts`, `Features/Conclusions`, `Infrastructure/Sqlite`, case JSON/validator/migration, `apps/web/src/api`, React resolution UI/styles, API/frontend tests and project docs. No new runtime dependency is planned.

### Excluded

- T09 art/HUD polish, audio, mobile controls or new Phaser gameplay.
- T10 Playwright suite/performance report and T12 export/import portability work, beyond regression coverage needed for T08.
- Free-text answers, generative feedback, timers, leaderboards, analytics providers or account identity.
- Admin T16–T26 implementation, Docker/CI changes, deployment, image publishing or repository visibility changes.

### Risks and controls

- **Solution/privacy leak:** allowlist DTOs and bundle/network assertions; keep private scoring inputs in the server content path.
- **Irreversible duplicate submit:** atomic unique conclusion + receipt, disabled pending UI, explicit confirmation and retry with the same submission ID.
- **Stale revision after the long play flow:** typed conflict response, refetch current session/result and never invent a second conclusion.
- **Schema regression:** additive migration, real SQLite restart test and EF pending-model check; do not delete the developer database.
- **Content ambiguity:** approval of this plan is the explicit decision for case v1 truth and conclusion wording; later story changes require a new case version/decision.

## Acceptance and verification

### Domain/API/storage

- Early conclusion is locked until Q01–Q03 pass and E03/E06 are collected; unknown/uncollected/duplicate/wrong-count evidence is rejected without changing revision.
- Reading score is 0/33/67/100 according to first-try correctness. Later correct retries unlock progress but do not recover first-try points.
- Investigation score gives independent partial credit: suspect 40, reason 20 and 20 per unique evidence matching the best accepted set, maximum 100; input order does not matter.
- Correct full submission returns 100 investigation points and the approved explanation. A wrong/partial submission is still final and returns its earned score plus the correct explanation only after completion.
- Same conclusion or review submission ID/payload is idempotent; changed payload, stale revision and parallel finalization behave deterministically. Only one conclusion exists per session.
- Result/review before completion is unavailable. After completion, API restart preserves result, scores, selected evidence and completed review items. A new play session does not mutate the old stored conclusion.
- Public case/session/conclusion-view/question/review-list payloads before disclosure omit solution IDs, accepted sets, correct choices and private explanations.

### Visible browser scenarios

- At 1280×800, resume a T07-complete session, finish remaining evidence/questions, observe conclusion locked/unlocked state, choose Nora + misunderstanding + E03/E06, review the confirmation summary and submit once.
- Result shows separate reading/investigation scores, evidence-based explanation, assistance as neutral context only, and no ability to resubmit the conclusion.
- Complete one review item incorrectly then correctly, complete all five, reload and confirm completion/result/review persistence with exactly one canvas and no unexpected console/network errors.
- Exercise a simulated mutation failure or stale revision: UI preserves the pending conclusion payload, provides a clear retry/refetch path and does not create a second result.
- Confirm at a smaller laptop window (1100×720 outer bounds) that conclusion, result and review remain readable and keyboard reachable.
- Select “Chơi lại vụ án”; verify a fresh revision-0 session appears while the prior result remains persisted in SQLite. This local product action does not delete the old session.

### Checks

- Focused domain scoring/readiness tests, content validator tests, conclusion/review API integration tests using isolated SQLite, and React behavior tests for confirmation/pending/error/review.
- `npm --prefix apps/web run lint`, `typecheck`, `test:run`, `build`.
- Locked .NET restore/build/test through `./scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe`.
- `dotnet ef migrations has-pending-model-changes`, privacy/bundle checks appropriate to the implementation, `scripts/check-agent-docs.ps1`, and `git diff --check`.
- Final verified changes are committed and pushed to the configured `origin` under the standing repository instruction.

## Handoff

Baseline `03259b4`, clean `main` synchronized with `origin/main`. This planning slice changes only T08 planning/index/current-memory documentation. Coding, migrations, dependencies and browser execution are not started until approval. Next action: user approves or revises T08 implementation 1.0, including the case v1 truth above.

## Improvement review

- Result: none
- Observation/evidence: this slice formalizes an existing product-plan increment; no new failure mode or repeated friction was observed.
- Mechanism changed or no-change reason: no lesson/rule/skill change; the existing product-lifecycle and vertical-slice workflows cover implementation.
- Validation: task structure, links/statuses and `git diff --check` will be run before the planning commit.
- Follow-up trigger: run a new improvement review after T08 implementation/browser verification.
