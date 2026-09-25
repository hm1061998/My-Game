# T04 — Storage and session foundation

Status: done
Owner: Codex
Depends on: T02
Plan version: PROJECT_PLAN.md 1.3, T04 implementation 1.0
Approval: user's 2026-09-25 instruction “tiếp tục bước sau”, following the completed T03 and approved PROJECT_PLAN.md 1.3; scope is T04 only
Lifecycle phase: handoff and improve
Workflow step: complete

## Outcome and success signal

A player can start an anonymous case session, save the prototype meeting checkpoint, reload the page, and resume the same checkpoint from SQLite without exposing the session token or provider details to gameplay/React.

## Evidence, design, and ownership

- Verified entry: T03 is committed at `dece939`; Git was clean at T04 start. API currently has only health/OpenAPI and no storage. Browser can reach API through Vite `/api` proxy.
- Accepted plan: SQLite and EF Core behind an application storage port, server-authoritative progress, HttpOnly session cookie, explicit DTOs and ProblemDetails. No new material product decision is needed.
- Domain/application own session and checkpoint invariants and revision semantics; Infrastructure owns EF Core/SQLite schema, token hash storage and atomic writes; API owns cookies, CSRF/origin checks, route DTOs and OpenAPI; React owns a small accessible start/resume/checkpoint status UI. Phaser remains independent of network and only owns movement.
- This slice uses one case ID/version and two safe checkpoint IDs (`office-entry`, `meeting-zone`) as public bootstrap metadata. Full case content, interaction prerequisites, scores, idempotency receipts for later mutations and export/import belong to later tasks.

## Scope and exclusions

Included: typed session/checkpoint application contract, SQLite adapter and versioned schema migration, anonymous cookie token/hash/expiry, start/resume/checkpoint endpoints, revision conflict and duplicate checkpoint behavior, OpenAPI metadata, browser-visible status/actions, isolated SQLite integration tests, local migration/run instructions.

Excluded: NPC/evidence/questions/conclusion, per-frame position persistence, PostgreSQL, export/import, Docker/CI/GitHub, deployment and publishing.

Risks: session fixation/CSRF, raw token leakage, invalid checkpoint transitions, concurrent writes, schema drift and database persistence. Failure/recovery scenarios must cover no cookie, stale revision, duplicate save, reload and API restart.

## Acceptance and verification

- A new session sets an HttpOnly, SameSite cookie; API/DOM do not reveal raw token or token hash. GET session resolves from cookie, not a client session ID.
- Checkpoint mutation accepts only a known next transition with expected revision. A stale revision returns 409, repeating the current checkpoint is safe, and successful writes increment revision atomically.
- Reload and API restart retain session/checkpoint state in SQLite. Unknown storage provider fails startup; database is not silently replaced by memory storage.
- Mutation endpoints reject cross-site browser requests. Invalid/missing session and invalid input return stable ProblemDetails responses.
- Domain/application code has no EF/SQLite references. Tests exercise SQLite adapter and endpoint behavior. OpenAPI exposes only intended public DTOs.
- Focused build/tests, browser preview/test/final confirmation, full repository verification and `git diff --check` run on the final revision.

## Implementation and browser verification

- Application owns `IPlaySessionStore` and token hashing; domain owns the allowed case/checkpoint transition. EF Core/SQLite, conditional revision update and UTC storage mapping stay in Infrastructure. The API returns explicit DTOs, ProblemDetails with stable `code`/`traceId`, and an HttpOnly/SameSite cookie. Mutations require a custom request header and reject cross-site Fetch Metadata or untrusted Origin.
- A versioned SQLite migration and pinned local `dotnet-ef` tool were added. Applying migration is an explicit local command, not an automatic startup mutation. A provider other than `Sqlite` failed startup with a clear `InvalidOperationException` in a direct check.
- Chrome headless at `http://127.0.0.1:5173`, 1280×800 and 1100×720, 2026-09-25: rendered one Phaser canvas and connected API; started a session, confirmed `document.cookie` and DOM did not expose the HttpOnly session cookie, saved `meeting-zone` at revision 1, reloaded, and saw the same checkpoint/revision. No 5xx or unexpected page/console error and no horizontal overflow. Initial GET `/session` returned an expected 401 before a session existed; the browser logged that expected HTTP status only.
- Final browser confirmation repeated the same path after the last API/frontend change. Screenshot inspection showed readable session status and a stable canvas at both widths.
- The button is explicitly a checkpoint demo, not a proximity-triggered game action. It does not claim proof of player location; that integration belongs to later gameplay tasks.

## Final verification

- SQLite integration/API tests passed with real isolated databases: no cookie → 401 ProblemDetails, create/HttpOnly cookie/token hash, stale revision → 409, parallel and sequential duplicate save → one revision increment, invalid checkpoint → 400, cross-site Origin → 403, new API host resumes persisted checkpoint, expiry → 401, and OpenAPI omits `TokenHash`.
- `dotnet-ef migrations has-pending-model-changes`: no model drift. Migration applied successfully to the ignored local SQLite file. Unknown provider startup check failed as intended.
- `./scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe`: passed on the final code revision. Agent check covered 7 task files; npm clean install audited 118 packages with 0 vulnerabilities; lint, typecheck, 5 frontend tests and Vite build passed; .NET locked restore/build passed with 0 warnings/errors and 2 API tests passed.
- `git diff --check`: passed after the final documentation update.
- Existing Phaser chunk-size warning (~1.38 MB minified) remains. It is unrelated to T04.

## Handoff

T04 meets its session/checkpoint foundation acceptance. T05 can replace the bootstrap case metadata with validated server-side JSON and connect interactions/NPCs to the established session port. The OpenAPI schema is exposed in Development, but TypeScript type generation is not yet automated: `openapi-typescript` 7.13.0 requires TypeScript 5, while the compatible alternative versions tested introduced npm audit advisories; neither dependency was retained. Frontend session responses are runtime-checked locally. Revisit typegen before expanding FE/BE contracts. Export/import, a second provider, actual checkpoint proximity, Docker/GitHub and deploy remain outside this task. Release-readiness gate: N/A until `code_complete`.

## Improvement review

- Result: verified (L004).
- Observation/evidence: EF Core SQLite does not support SQL ordering/comparison of `DateTimeOffset`, which the original expiry predicate would have required. Official provider guidance confirmed the constraint before runtime; the initial generated migration still exposed the mismatch.
- Mechanism changed or no-change reason: Infrastructure maps UTC domain timestamps to provider-supported UTC `DateTime` columns. The migration was regenerated before application. No broad rule/skill was added from this single provider-specific case.
- Validation: SQLite integration tests passed resume, expiry and conditional checkpoint writes; EF reported no pending model changes.
- Follow-up trigger: T12 storage portability or a new provider adapter should revisit UTC mapping and promote a provider checklist if the lesson repeats. Owner: storage task agent.
