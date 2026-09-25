# Current context

Updated: 2026-09-25
Baseline: af0b33b
Dirty workspace: approved, uncommitted T05 case/content/interaction/notebook implementation and handoff docs. The separately approved T15–T26 admin planning edits are also present and must be preserved.

## Confirmed scope

Browser-based 2.5D action detective RPG for A2-B1 English learning, office setting, React client, .NET backend, one developer, AI-friendly repository, extensible storage, and Docker/GitHub after code completion.

## Accepted defaults for current implementation

User approved PROJECT_PLAN.md 1.4: Phaser sprite-based 2.5D, desktop keyboard controls, stealth/dodge action, bright stylized office, Vietnamese navigation with English case content, SQLite behind application storage ports, and a staged whole-system administration portal. Server JSON remains the bootstrap/transitional case source; the approved admin design adds mutable drafts and immutable published snapshots behind application ports. Record a new decision before materially changing a default.

## Proposed decisions still open

Case story details, final art source/style, public hosting, GitHub owner/repository visibility, image publishing, and whether a PostgreSQL adapter is included in the first delivery.

The detailed identity provider configuration, retention durations, production email/reset delivery, hosting and external analytics/provider choices remain open inside the approved admin boundaries. T16 must record these decisions or explicitly defer production-only choices before dependent implementation.

## Active task

T05 case/NPC/notebook is complete in the working tree; T01–T04, T13 and T14 are complete. T06 questions/unlocks is the next game slice. T15 admin plan 1.0 and detailed tasks T16–T26 are approved but implementation is explicitly deferred by the user's current instruction; they must not overwrite or destabilize the game contract work.

## Workflow checkpoint and approval

T05 was approved by the user's 2026-09-25 continuation under PROJECT_PLAN.md 1.3 (updated to 1.4 by parallel admin planning). It reached browser confirmation, scripts, improvement review and handoff. No deployment or external publishing is authorized.

Admin plan 1.0 was approved by the user's 2026-09-25 instruction “duyệt plan, hãy lập task chi tiết vào tài liệu, chưa tiến hành code”. PROJECT_PLAN.md 1.4 and T16–T26 may be documented now; no admin code, dependency, migration, account, secret or external service is authorized in this turn.

## Verified state

- T03 office movement/collision/depth/camera/pause remains the gameplay baseline. React still owns UI and server state; Phaser owns frame-level play.
- T04 added `IPlaySessionStore`, domain checkpoint rules, EF Core SQLite adapter, explicit versioned migration, and anonymous session/checkpoint endpoints. Raw token stays in an HttpOnly/SameSite cookie; database stores only its SHA-256 hash. API responses and OpenAPI omit token/hash.
- Browser start → save meeting checkpoint → reload resumed revision 1 at 1280px and 1100px. Isolated SQLite/API tests cover stale revision, parallel duplicates, cross-site rejection, expiry and resume through a new API host. An unsupported storage provider fails startup clearly.
- The meeting checkpoint button is a prototype UI action, not a real proximity-triggered Phaser event. No full case content, question progression or scoring exists yet.
- npm is the only JS package manager. SDK 10.0.401 remains available in ignored `.tools/dotnet`; the developer should follow README to set up a normal shell. SQLite database `office-case-files.db` is ignored and must not be deleted casually.
- OpenAPI is available in Development. Automatic TypeScript codegen remains open: the two generators tried were incompatible with TypeScript 6 or brought npm audit advisories, so neither was retained. The frontend validates its session response at runtime for now.
- L004 is a verified provider-specific lesson: SQLite expiry predicates use UTC `DateTime` fields in Infrastructure because EF Core SQLite cannot compare `DateTimeOffset` in SQL.
- T05 added versioned server-only JSON case content with six clues, three NPCs, glossary and private future questions/solution; startup validation checks integrity. Public case/map DTOs do not include private answers.
- Phaser proximity and `E` interaction events feed React dialogue/notebook overlays. SQLite persists collected evidence and idempotent interaction receipts behind the store port. E01/E02/E04 are collectible; E03 awaits T07, E05/E06 await T06.
- Browser testing found and fixed the scene pre-create input race and overlay Escape double-handling. The meeting checkpoint button remains a separate prototype action.

## Last checks

- 2026-09-25 T04: `./scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe` passed: agent structural check (7 tasks), npm clean install (118 packages, 0 vulnerabilities), lint, typecheck, 5 frontend tests, Vite build, .NET locked restore/build (0 warnings/errors), and 2 API tests.
- Final Chrome/Playwright browser run passed session create/save/reload, cookie privacy, API connectivity, one canvas, smaller laptop width and no unexpected page/console/5xx error. Initial 401 without cookie is expected.
- `dotnet-ef migrations has-pending-model-changes` found no drift; direct unknown-provider startup check failed as intended; `git diff --check` passed.
- T05 Chrome/Playwright at 1280×800 passed keyboard travel and `E` for E01/E02/E04, notebook content, reload retention and 1100×720 layout. One transient Chrome `ERR_NO_BUFFER_SPACE` did not reproduce on rerun.
- T05 final `verify.ps1` passed agent structural check (20 tasks), npm ci/audit (0 advisories), lint/typecheck/build, 6 web tests, .NET locked restore/build (0 warnings/errors) and 5 API tests. EF T05 migration drift check found none.

## Blockers and known issues

No blocker for T05. T06/T07 unlocks and scoring remain intentionally absent. TypeScript type generation from OpenAPI remains open. The prototype checkpoint is not tied to in-canvas position. Vite still warns about the ~1.38 MB lazy Phaser chunk. The local SDK may need PATH setup in each new terminal.

## Next action

Continue T06 questions/unlocks if the user asks for the next game step. Keep admin implementation stopped. When the user later authorizes admin coding, start T16 only: confirm the T05 contract baseline and write the approved identity/privacy/publishing/analytics decisions before T17–T24 implementation.

## Relevant references

- `PROJECT_PLAN.md`
- `README.md`
- `docs/tasks/T04-storage-session.md`
- `docs/tasks/T05-case-npc-notebook.md`
- `docs/tasks/T15-admin-console.md`
- `docs/tasks/index.md`
- `docs/agent/lessons.md`
- `apps/web/AGENTS.md`
- `services/api/AGENTS.md`
- `.agents/skills/product-lifecycle/SKILL.md`
