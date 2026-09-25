# Current context

Updated: 2026-09-25
Baseline: dece939
Dirty workspace: approved, uncommitted T04 session/storage implementation, migrations, API/web tests, README/task/memory updates and NuGet lockfiles. Git was clean at T04 start.

## Confirmed scope

Browser-based 2.5D action detective RPG for A2-B1 English learning, office setting, React client, .NET backend, one developer, AI-friendly repository, extensible storage, and Docker/GitHub after code completion.

## Accepted defaults for current implementation

User approved PROJECT_PLAN.md 1.3: Phaser sprite-based 2.5D, desktop keyboard controls, stealth/dodge action, bright stylized office, Vietnamese navigation with English case content, SQLite behind application storage ports, and server-side JSON case content. Record a new decision before materially changing a default.

## Proposed decisions still open

Case story details, final art source/style, public hosting, GitHub owner/repository visibility, image publishing, and whether a PostgreSQL adapter is included in the first delivery.

## Active task

T04 storage/session foundation is complete; T01–T03, T13 and T14 are complete. The next planned slice is T05 case/NPC/notebook, not yet started as a task.

## Workflow checkpoint and approval

T04 was approved by the user's 2026-09-25 instruction “tiếp tục bước sau” under PROJECT_PLAN.md 1.3. It reached browser confirmation, final scripts, improvement review and handoff. No deployment or external publishing is authorized.

## Verified state

- T03 office movement/collision/depth/camera/pause remains the gameplay baseline. React still owns UI and server state; Phaser owns frame-level play.
- T04 added `IPlaySessionStore`, domain checkpoint rules, EF Core SQLite adapter, explicit versioned migration, and anonymous session/checkpoint endpoints. Raw token stays in an HttpOnly/SameSite cookie; database stores only its SHA-256 hash. API responses and OpenAPI omit token/hash.
- Browser start → save meeting checkpoint → reload resumed revision 1 at 1280px and 1100px. Isolated SQLite/API tests cover stale revision, parallel duplicates, cross-site rejection, expiry and resume through a new API host. An unsupported storage provider fails startup clearly.
- The meeting checkpoint button is a prototype UI action, not a real proximity-triggered Phaser event. No full case content, question progression or scoring exists yet.
- npm is the only JS package manager. SDK 10.0.401 remains available in ignored `.tools/dotnet`; the developer should follow README to set up a normal shell. SQLite database `office-case-files.db` is ignored and must not be deleted casually.
- OpenAPI is available in Development. Automatic TypeScript codegen remains open: the two generators tried were incompatible with TypeScript 6 or brought npm audit advisories, so neither was retained. The frontend validates its session response at runtime for now.
- L004 is a verified provider-specific lesson: SQLite expiry predicates use UTC `DateTime` fields in Infrastructure because EF Core SQLite cannot compare `DateTimeOffset` in SQL.

## Last checks

- 2026-09-25 T04: `./scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe` passed: agent structural check (7 tasks), npm clean install (118 packages, 0 vulnerabilities), lint, typecheck, 5 frontend tests, Vite build, .NET locked restore/build (0 warnings/errors), and 2 API tests.
- Final Chrome/Playwright browser run passed session create/save/reload, cookie privacy, API connectivity, one canvas, smaller laptop width and no unexpected page/console/5xx error. Initial 401 without cookie is expected.
- `dotnet-ef migrations has-pending-model-changes` found no drift; direct unknown-provider startup check failed as intended; `git diff --check` passed.

## Blockers and known issues

No blocker for T04. TypeScript type generation from OpenAPI is not automated yet; address before expanding contract use in T05. The prototype checkpoint is not tied to in-canvas position. Vite still warns about the ~1.38 MB lazy Phaser chunk. The local SDK may need PATH setup in each new terminal.

## Next action

Start T05 with a task plan for validated server-side case JSON, NPC/interactions and notebook/glossary. Reuse the T04 session port and add safe public DTOs; resolve OpenAPI typegen compatibility before broad FE/BE contract growth.

## Relevant references

- `PROJECT_PLAN.md`
- `README.md`
- `docs/tasks/T04-storage-session.md`
- `docs/tasks/index.md`
- `docs/agent/lessons.md`
- `apps/web/AGENTS.md`
- `services/api/AGENTS.md`
- `.agents/skills/product-lifecycle/SKILL.md`
