# Current context

Updated: 2026-09-25
Baseline: c7e71d7
Dirty workspace: T10 planning/index/current-memory documentation only; Git was clean and synchronized with `origin/main` before planning.

## Confirmed scope

Browser-based 2.5D action detective RPG for A2-B1 English learning, office setting, React client, .NET backend, one developer, AI-friendly repository, extensible storage, and Docker/GitHub after code completion.

## Accepted defaults for current implementation

User approved PROJECT_PLAN.md 1.4: Phaser sprite-based 2.5D, desktop keyboard controls, stealth/dodge action, bright stylized office, Vietnamese navigation with English case content, SQLite behind application storage ports, and a staged whole-system administration portal. Server JSON remains the bootstrap/transitional case source; the approved admin design adds mutable drafts and immutable published snapshots behind application ports. Record a new decision before materially changing a default.

## Proposed decisions still open

Case story details, final art source/style, public hosting, GitHub owner/repository visibility, image publishing, and whether a PostgreSQL adapter is included in the first delivery.

The detailed identity provider configuration, retention durations, production email/reset delivery, hosting and external analytics/provider choices remain open inside the approved admin boundaries. T16 must record these decisions or explicitly defer production-only choices before dependent implementation.

## Active task

T10 browser/E2E/playtest plan 1.0 is drafted and awaiting approval; T01–T09, T13 and T14 are complete. T15 admin plan 1.0 and detailed tasks T16–T26 are approved but implementation is explicitly deferred; preserve their files and boundaries.

## Workflow checkpoint and approval

The user approved T08 plan 1.0 and its case-v1 truth on 2026-09-25 with “ok tôi duyệt”. Coding, local migration, tests and visible-browser verification are authorized within that scope. User requires all future browser previews/tests to show the browser window; no headless or hidden-tab runs. No deployment or external publishing is authorized.

T09 plan 1.0 was drafted after the user's 2026-09-25 instruction to continue and to try previewing in Codex's browser. That instruction authorizes planning, not unreviewed art/HUD implementation. T09 coding awaits approval of `docs/tasks/T09-art-hud-focus.md`. The visible Codex in-app browser was attempted twice during planning, but its trusted Node kernel reset immediately; implementation must retry it first and use a visible Chrome fallback only if the tool remains unavailable.

The user approved T09 implementation plan 1.0 on 2026-09-25 with “duyệt kế hoạch”. Frontend-only implementation and visible browser verification are authorized within that recorded scope; audio, external raster assets, backend/storage changes and deployment remain excluded.

The user's 2026-09-25 instruction “làm bước tiếp theo” authorizes drafting T10 plan 1.0, not installing Playwright or implementing the unreviewed suite. T10 proposes headed Chromium, a temporary isolated SQLite database, dedicated local ports, a full critical journey, manual visible playtest and an environment-qualified performance sample. Coding awaits approval of `docs/tasks/T10-browser-e2e-playtest.md`.

The user's 2026-09-25 instruction authorizes a standing delivery step for this repository: after each completed work session, commit the scoped verified changes and push the current branch to the already-configured `origin`. This does not authorize unrelated changes, secrets, deployment, image publishing, repository visibility changes or guessing an ambiguous remote/branch.

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
- T06 added question prerequisites, safe GET/list/answer APIs, SQLite question progress and answer receipts, React notebook answer controls, retry feedback and post-pass explanation. First choice and attempt count persist; same submission ID/payload is idempotent. Q01 pass enables E05; Q02 alone does not enable E06; Q03 waits for T07's E03.
- L005 is verified by T05 failure/fix and T06 visible Chrome Escape→canvas focus→movement path. No broader rule or skill was added.
- T07 replaces the prototype checkpoint button with a physical meeting marker, adds a Phaser scanner patrol/dodge/retry loop and a two-failure slow-assist option, and persists encounter failures/clear/assist plus idempotent receipts atomically in SQLite. Completion makes E03 collectible; collecting it exposes Q03 without leaking the correct choice.
- Visible Chrome covered checkpoint revision 1, two detections, assist, clear, E03/Q03 and reload at 1100×720. Browser verification found and fixed StrictMode duplicate canvases and unused Phaser audio-context exceptions; final reload had one canvas and no console/network issues. L006 records this as a candidate lifecycle lesson.
- T08 adds server-owned readiness and 0/33/67/100 first-try reading scoring, independent investigation scoring, one immutable/idempotent conclusion, post-submit explanation, five retryable review items and SQLite persistence. Pre-disclosure endpoints omit solution sets, correct review choices and explanations.
- React now owns conclusion/confirmation/result/review/replay overlays. Visible Chrome produced 100/100 for Nora + misunderstanding + E03/E06, completed one wrong-then-correct review and all 5 items, persisted through reload at 1100×720, and retained one canvas without runtime errors.
- Replay browser testing found the old Phaser position could instantly save the meeting checkpoint in a new session. Remounting `GameCanvas` when a session is created restored revision 0 at `office-entry`; L006 is now verified across T07 and T08.
- T09 centralizes code-authored Phaser presentation tokens/variants, adds distinct character and evidence visuals plus movement/dodge pose feedback, and layers a semantic objective/checkpoint/scanner/assist/interaction HUD over the canvas. Narrow screens retain readable content and explicitly require a desktop keyboard for gameplay.
- T09 visible Chrome fallback confirmed live keyboard movement to the meeting checkpoint, HUD updates, overlay Escape/focus recovery, one canvas, 1100×720 without horizontal overflow and the 390px desktop notice. A fresh-session focus race was fixed in GameHost and regression-tested; L006 is promoted as the complete React/Phaser session boundary.

## Last checks

- 2026-09-25 T04: `./scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe` passed: agent structural check (7 tasks), npm clean install (118 packages, 0 vulnerabilities), lint, typecheck, 5 frontend tests, Vite build, .NET locked restore/build (0 warnings/errors), and 2 API tests.
- Final Chrome/Playwright browser run passed session create/save/reload, cookie privacy, API connectivity, one canvas, smaller laptop width and no unexpected page/console/5xx error. Initial 401 without cookie is expected.
- `dotnet-ef migrations has-pending-model-changes` found no drift; direct unknown-provider startup check failed as intended; `git diff --check` passed.
- T05 Chrome/Playwright at 1280×800 passed keyboard travel and `E` for E01/E02/E04, notebook content, reload retention and 1100×720 layout. One transient Chrome `ERR_NO_BUFFER_SPACE` did not reproduce on rerun.
- T05 final `verify.ps1` passed agent structural check (20 tasks), npm ci/audit (0 advisories), lint/typecheck/build, 6 web tests, .NET locked restore/build (0 warnings/errors) and 5 API tests. EF T05 migration drift check found none.
- T06 final headed Chrome at 1280×800 passed E01, wrong/correct Q01, Maya E05, Escape focus, reload with explanation and 1100×720 layout. `verify.ps1` passed 21 structural task checks, npm ci/audit 0, lint/typecheck/build, 6 web tests and 6 API tests; .NET build had 0 warnings/errors. T06 EF migration drift check and `git diff --check` passed.
- T07 final visible Chrome at 1280×800 and a 1100×720 outer window passed physical checkpoint, two detections, assist, encounter clear, E03/Q03, reload/resume, single-canvas StrictMode cleanup and no console/network issues. Final `verify.ps1` passed 22 task checks, npm ci/audit (118 packages, 0 advisories), lint/typecheck/build, 10 web tests, locked .NET restore/build with 0 warnings/errors and 7 API tests. EF migration drift and `git diff --check` passed.
- T08 final visible Chrome at 1280×800 and 1100×720 passed conclusion confirmation, 100/100 result, assist-neutral messaging, wrong/correct review retry, 5/5 reload persistence, single canvas and fresh replay revision 0. `verify.ps1` passed 23 task checks, npm audit 0, lint/typecheck/build, 13 web tests and 9 API tests; .NET build had 0 warnings/errors. EF migration drift, privacy/bundle search and `git diff --check` passed.
- T09 visible Chrome at 1280×800 and 1100×720 plus a 390px emulated viewport passed layout, live checkpoint movement, HUD, overlay focus and single-canvas checks. The visible Codex in-app browser was retried first but failed with `windows sandbox failed: helper_unknown_error`; visible Chrome remained the documented fallback. Final `verify.ps1` passed 24 task checks, npm audit with 0 advisories, lint/typecheck/build, 18 web tests, .NET build with 0 warnings/errors and 9 API tests. Frontend bundle privacy scan, agent-doc check and `git diff --check` passed; only the known ~1.39 MB lazy Phaser chunk warning remains.

## Blockers and known issues

T10 coding is intentionally blocked on approval of plan 1.0. TypeScript type generation from OpenAPI remains open. Vite still warns about the ~1.39 MB lazy Phaser chunk. The local SDK may need PATH setup in each new terminal. Audio and external raster assets remain outside the MVP. The visible Codex browser failed during both T09 planning and implementation with the same Windows sandbox helper error; visible Chrome is the verified local fallback until the host issue is fixed.

## Next action

Ask the user to approve or revise `docs/tasks/T10-browser-e2e-playtest.md` plan 1.0. After approval, install only the scoped Playwright dependency/browser and implement the isolated headed E2E runner. Keep admin implementation stopped and do not deploy or publish.

## Relevant references

- `PROJECT_PLAN.md`
- `README.md`
- `docs/tasks/T04-storage-session.md`
- `docs/tasks/T05-case-npc-notebook.md`
- `docs/tasks/T06-questions-unlocks.md`
- `docs/tasks/T07-encounter-checkpoint.md`
- `docs/tasks/T08-conclusion-review.md`
- `docs/tasks/T09-art-hud-focus.md`
- `docs/tasks/T10-browser-e2e-playtest.md`
- `docs/tasks/T15-admin-console.md`
- `docs/tasks/index.md`
- `docs/agent/lessons.md`
- `apps/web/AGENTS.md`
- `services/api/AGENTS.md`
- `.agents/skills/product-lifecycle/SKILL.md`
