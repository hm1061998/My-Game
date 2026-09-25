# T15 — System administration portal developed alongside the game client

Status: approved
Owner: unassigned
Depends on: T05 content contract baseline; identity/analytics foundations align with T06–T12
Plan version: Admin plan 1.0, incorporated into PROJECT_PLAN.md 1.4
Approval: user's 2026-09-25 instruction “duyệt plan, hãy lập task chi tiết vào tài liệu, chưa tiến hành code”; approves Admin plan 1.0 and detailed backlog, while explicitly deferring coding
Lifecycle phase: define/design complete → build deferred
Workflow step: plan and approval recorded; T16–T26 created; implementation must not begin in this documentation-only turn

## Outcome and success signal

Authorized administrators can operate Office Case Files from a separate portal: author and publish case content, manage player accounts and access, inspect sessions/progress for support, monitor product/learning statistics, review audit history and see system health without exposing private answers or weakening player-data protections.

The first end-to-end success signal is:

1. publish a validated case version;
2. register or link a player while preserving an existing guest save;
3. play and generate progress events;
4. find that player in admin, inspect the allowed progress summary and perform an audited support action;
5. see the aggregated dashboard update without exposing raw session tokens, passwords or private case answers;
6. verify a non-admin cannot access any administration API or bundle.

## Entry evidence and material product changes

- T04 provides anonymous cookie sessions, revision/idempotency rules and SQLite behind application ports. It deliberately collects no name or email.
- T05 is currently defining `CaseDefinition`, server-only JSON content, NPC interactions and public DTOs. Its in-progress files must be preserved.
- PROJECT_PLAN.md 1.3 places accounts, CMS and analytics after the original MVP. The user's current direction moves all three into a parallel system-administration program. After this plan is approved, PROJECT_PLAN.md must be amended and an ADR must record identity, privacy, content publishing and analytics boundaries before implementation.
- “Parallel” means coordinated client and admin workstreams behind shared contract gates. With one implementer it is an interleaved schedule and adds substantial work; it does not make the original one-week target feasible unchanged.

## Roles and users

### Product roles

- **Guest player:** current anonymous session behavior; can later claim/link progress after authentication.
- **Registered player:** owns profile, linked play sessions, progress and account preferences.
- **Support admin:** can search players, view allowed support details, revoke sessions and apply narrowly defined support actions; cannot publish content or manage administrator access.
- **Content admin:** manages drafts, validation, preview and publishing; cannot change player access.
- **Super admin:** manages administrator roles and operational settings. This role is tightly limited and all actions are audited.

The first implementation may combine support/content permissions into one seeded admin account for schedule reasons, but authorization must be policy/capability based so roles can be separated without rewriting endpoints. Player and administrator authentication remain logically separate from anonymous play-session cookies.

## Functional scope

### 1. Dashboard and system overview

- Date-range filters and explicit timezone.
- Active/registered players, guest sessions, new/returning players, started/completed cases, completion rate, median time to complete, retry/abandon rate and current content versions.
- Learning metrics: first-attempt accuracy, total attempts, frequently missed questions, evidence unlock funnel and vocabulary saves. Aggregate by case/version and level so versions are never mixed silently.
- Operational cards: API/content/storage health, failed imports/publishes, recent admin actions and supported warning states.
- Empty/loading/error/stale-data states and “last calculated” timestamp; no claim of real-time data unless implemented and measured.

### 2. Case content management

- Case list with draft/published/archived versions and validation status.
- Structured editors for metadata, brief, NPCs, evidence, glossary, questions, unlock rules, solution, review items, interaction/checkpoint IDs and public map references.
- Whole-case validation using the same Domain/Application rules as startup and CI.
- JSON import/export, isolated preview and explicit publish confirmation.
- Publishing creates an immutable version atomically. Active sessions stay pinned; published content is never edited in place or hard-deleted while referenced.
- Asset upload/library and a visual map editor are later slices; the first version manages asset IDs/manifests and validates references only.

### 3. Player and account management

- Search/paginated list by player ID and normalized email/display name where permitted; status and last activity filters.
- Player detail: profile, account status, linked sessions, case/version progress summary, scores, assistance use, created/last-active times and security-relevant session summary.
- Safe actions: suspend/reactivate account, revoke authenticated sessions, trigger a password-reset workflow, export the player's data and request deletion/anonymization according to policy.
- Support actions must be explicit, reasoned and audited. Direct arbitrary score/progress editing is excluded initially; use defined corrective commands with invariants if a real support case requires them.
- Never display password hashes, raw cookies/tokens, security stamps or full private answer keys. Do not add “login as player”/impersonation to the first release.

### 4. Player identity and guest migration

- Add registered player identity without breaking anonymous play. `PlaySession.PlayerId` is optional; guest sessions continue to work.
- Provide register/login/logout/current-user and guest-save claim/link flows. Linking requires proof from the current guest cookie and authenticated account, is idempotent, and cannot steal another session.
- Define uniqueness, verification, password/reset policy, lockout and account-status behavior before production exposure.
- Recommended foundation is ASP.NET Core Identity behind application use cases. Administrator policies are separate from game progress authorization.
- No default production credential or committed secret. Local/test accounts use an explicit bootstrap command or isolated fixture.

### 5. Session and progress operations

- Paginated session list by player/guest, case/version, status and activity range.
- Read-only timeline of meaningful progress: start, interaction/evidence, question outcome summary, checkpoint, conclusion and completion. Do not store or expose raw token values.
- Session revoke/expire is allowed with confirmation and audit. Restore/reopen, score correction or progress repair require separate domain commands and acceptance tests; they are not generic database edits.
- Existing T04 revision, idempotency and version pinning remain authoritative.

### 6. Statistics and reporting

- Define an application event/metric vocabulary rather than querying EF entities from controllers or letting the frontend infer business metrics.
- Use privacy-minimized events with player pseudonymous ID where needed, case/version, event type, UTC timestamp and approved dimensions. Avoid free-form payloads that could capture content, email or tokens.
- First adapter can compute aggregates from SQLite/read models for the demo. Introduce pre-aggregation/background jobs only after measured query volume requires it.
- Statistics endpoints return aggregate DTOs, apply date-range limits and version filters, and suppress/drill down carefully for very small cohorts if public or multi-tenant use is later introduced.
- CSV export is a later reviewed slice or restricted to aggregate reports; no unrestricted database dump from the browser.

### 7. Administrator access, audit and system settings

- Administrator list, capability/role assignment and revoke access are super-admin-only and audited.
- Audit log filters by actor/action/target/time/result. Audit entries are append-only through the application path and exclude credentials/tokens/private payload dumps.
- Settings are an explicit allowlist with typed validation and restart/activation semantics. Secrets, connection strings, storage providers and arbitrary environment variables are not editable in the browser.
- Health/status is read-only and non-secret. Deployment, database migration execution and production shell operations remain outside the portal.

## Explicit non-goals for the first administration release

- Billing, subscriptions, organizations/tenants, messaging/email campaign UI, leaderboard moderation, live chat and customer-support ticketing.
- Full BI/data warehouse, arbitrary SQL/report builder, raw-event explorer or real-time streaming dashboard.
- Player impersonation, generic database CRUD, arbitrary score/progress edits or browser-triggered schema migrations.
- Visual map/scene editor, asset transcoding/CDN management, live collaborative case editing and AI-generated/published content without review.
- Deployment, secret provisioning, public account creation, production data mutation or external email service setup without a later approved release/deployment phase.

## Architecture and trust boundaries

### Applications

- Keep the game in `apps/web`; add a separate `apps/admin` React/Vite SPA and build artifact. Admin code is not shipped in the player bundle.
- Both apps use versioned OpenAPI-generated contracts after T05 resolves code generation. Shared code is limited to generated contracts, design tokens and deliberately generic UI primitives.
- Route namespaces: player `/api/*`; authenticated player identity `/api/account/*`; administration `/api/admin/*`. Phaser does not know about identity, drafts or analytics.

### Backend ownership

- Endpoints coordinate application use cases. Domain owns content invariants, account-status rules, support-command rules and metric definitions.
- Add purpose-specific ports such as `ICaseAuthoringStore`, `IPlayerAccountStore`/Identity adapter, `IAdminAuditStore` and `IAnalyticsReadStore`. Do not turn `IPlaySessionStore` into a generic repository.
- EF Core/SQLite, Identity details, aggregate queries and provider SQL stay in Infrastructure. Explicit DTO allowlists prevent EF entities and private content from crossing API boundaries.
- `ICaseCatalog` serves immutable `(caseId, caseVersion)` definitions. Existing JSON v1 remains readable during migration so T05 and pinned sessions do not break.

### Suggested data additions

- `PlayerProfile`: identity user ID, display fields, status, consent/preferences, created/updated timestamps. Authentication secrets stay in the Identity schema, not this profile.
- `PlaySession.PlayerId`: nullable foreign key; guest remains valid. Link history/audit records claims without storing raw cookie/token.
- `CaseDraft`, `PublishedCaseVersion` and immutable content checksum/version metadata.
- `AdminAuditEvent`: actor, capability, action, target, reason, result, trace ID and UTC timestamp.
- `ProductEvent` or purpose-built progress fact/read model: pseudonymous subject where needed, case/version, metric type and approved dimensions.
- Indexes for actual list/range queries; retention/anonymization rules must be specified before collecting more data than T04.

### Security and privacy invariants

- Deny admin access by default. Every `/api/admin/*` endpoint has an explicit capability policy, anti-CSRF/origin protection, secure HttpOnly authentication cookie and authorization tests.
- Player cookie, admin authentication cookie and anonymous play-session cookie have distinct names/purposes and cannot substitute for one another.
- Password reset never returns a reset token through an admin list/detail response. Until email delivery is approved, local development uses an explicit safe test/bootstrap procedure.
- Sensitive player fields are minimized and masked in lists. Structured logs and audit records never contain passwords, raw tokens, cookies, reset links or private case bodies unnecessarily.
- Destructive player actions require confirmation, reason and audit. Deletion follows a defined anonymization/retention workflow and is tested on a copy/isolated database before any production use.
- Published answer keys remain unavailable to player/public APIs. Admin permission to view/edit them does not make the admin bundle or route itself the security boundary; API authorization and DTO tests do.

## Parallel workstreams and gates

| Slice | Estimate | Align with client | Deliverable and exit gate |
| --- | ---: | --- | --- |
| [A00 / T16](T16-admin-decisions.md) — Product, privacy and architecture decisions | 4–6 h | Finish T05 contract baseline | Approved roles/capabilities, player identity model, data inventory/retention, metrics glossary, separate SPA and immutable publish ADRs. |
| [A01 / T17](T17-admin-shell-auth.md) — Admin shell and authorization | 6–9 h | T05/T06 | `apps/admin`, protected routing, admin identity/policies, login/logout, negative authorization/CSRF tests and audited bootstrap procedure. |
| [A02 / T18](T18-player-identity.md) — Player identity and guest linking | 8–12 h | T06 | Register/login/account endpoints and client UI, nullable player link, safe guest claim, session revocation and migration/integration tests. |
| [A03 / T19](T19-case-authoring.md) — Case authoring foundation | 8–12 h | T06/T07 | Draft store, dashboard, import, metadata/NPC/evidence/glossary editors, concurrency and audit. |
| [A04 / T20](T20-content-publishing.md) — Rules, preview and publish | 8–12 h | T06–T08 | Question/unlock/solution/review editors, shared validation, isolated preview, atomic immutable publish and version-pinning proof. |
| [A05 / T21](T21-player-session-admin.md) — Player/session administration | 8–12 h | T07/T08 | Paginated search/detail, progress summary/timeline, suspend/reactivate, revoke sessions, data export request and complete audit coverage. |
| [A06 / T22](T22-analytics-read-model.md) — Analytics vocabulary and read model | 6–10 h | T08/T09 | Version-aware event/fact definitions, privacy-minimized collection, aggregate store/queries and fixture-backed metric correctness tests. |
| [A07 / T23](T23-admin-dashboard.md) — Dashboard and reports | 6–10 h | T09/T10 | Overview, learning funnel, case/version filters, question difficulty, date/timezone behavior and empty/stale/error states. |
| [A08 / T24](T24-admin-governance.md) — Admin roles, audit and safe settings | 5–8 h | T10 | Capability management, audit viewer and allowlisted non-secret settings/health; super-admin flows verified. |
| [A09 / T25](T25-admin-integrated-verification.md) — Integrated browser/security verification | 6–10 h | T10/T11 | Admin + player E2E, accessibility, conflict/recovery, authorization matrix, privacy review, performance sample and final browser confirmation. |
| [A10 / T26](T26-admin-handoff.md) — Handoff and release readiness | 3–5 h | T11/T12 | Runbooks, backup/export/anonymization notes, known limits, improvement review and later Docker/CI integration plan. |

Estimated system-admin program: **68–106 hours**, excluding deployment, production email/SSO, advanced analytics and visual map/asset tooling. This is roughly 2–3 additional focused developer weeks, or longer when interleaved with the remaining game work. If the original one-week game deadline is fixed, use the staged release below rather than weakening authentication or data protection.

## Recommended staged release

### Stage 1 — Operational foundation

A00–A02: secure admin access, player identity, guest linking and audit baseline. This is required before claiming player management exists.

### Stage 2 — Content operations

A03–A04: draft/edit/validate/preview/publish immutable case versions. This can proceed alongside T06–T08 once contracts stabilize.

### Stage 3 — Player support

A05: player/session search, safe account actions and progress support views. No arbitrary state editing.

### Stage 4 — Statistics and governance

A06–A08: trusted metric definitions/read models, dashboards, admin roles, audit viewer and safe settings.

### Stage 5 — Integrated hardening

A09–A10: browser/security/privacy/performance evidence, runbooks and release readiness. Deployment remains separately authorized.

## Coordination rules

- One integration owner controls shared domain contracts, OpenAPI and migrations. When multiple workers are explicitly authorized, each slice gets an owner and non-overlapping allowed files; only the integration owner updates central memory.
- T05 owns the first `CaseDefinition` and public/private projections. Admin consumes the stable contract and proposes explicit diffs instead of rewriting T05 opportunistically.
- A02 must land before player-admin mutations. A03 may start after T05's content contract gate. A04 aligns with T06/T08 rules. A06 begins only after event meanings and retention are approved.
- Contract/migration changes land before dependent UIs. All pagination, filtering, date/timezone and authorization semantics are in OpenAPI and integration tests.
- Feature branches/worktrees are optional workflow mechanisms; “parallel” does not itself authorize spawning agents, pushing branches or using external services.

## Acceptance scenarios

### Access and identity

1. Anonymous, guest and ordinary registered players cannot load admin UI data or call any admin API; responses do not disclose whether a target account/content record exists.
2. Admin login/logout, expiry, lockout and revoked access behave predictably; cookies are isolated and no admin/player cookie can authorize the other context.
3. A guest registers or logs in and claims the current save exactly once. A stolen/other guest session cannot be linked; retry is idempotent.

### Content

4. Invalid duplicate IDs, missing references, wrong answer counts, cycles and invalid solution evidence produce actionable errors and cannot publish.
5. Two admins edit the same draft; stale save gets a conflict and cannot overwrite silently.
6. Preview is marked unpublished and isolated. Publish is atomic/idempotent, new sessions use the selected version and existing sessions remain pinned.

### Players and support

7. Admin finds players/sessions with bounded pagination and filters, sees only allowed profile/progress data and never raw credentials/tokens.
8. Suspend/reactivate and session revoke require reason/confirmation, enforce domain behavior in the player app and create complete audit entries.
9. Data export/deletion request follows the specified status workflow; failure leaves account/data consistent and recoverable. Actual irreversible production deletion requires a later authorized operation/runbook.

### Statistics and operations

10. A fixed event fixture produces known counts/rates by case version and date range; timezone boundaries and empty ranges are correct.
11. Player activity updates the expected aggregate after the documented freshness interval. Retries/idempotent mutations do not double-count.
12. Dashboard and reports never expose small-cohort personal details, private answers or unrestricted raw-event payloads.
13. Audit captures successful/failed admin mutations with actor/action/target/reason/result while omitting sensitive values.

### Integrated quality

14. Final browser passes cover admin and player together at 1280px and smaller laptop width, keyboard navigation and visible loading/error/conflict/recovery states.
15. Final revision passes admin/player lint, typecheck, tests and builds; .NET locked restore/build/tests; content/contract/docs/E2E checks; migration drift; privacy/security review; and `git diff --check`.

## Verification strategy

- **Domain/application:** content validation, account status, guest claim, support commands, publish versioning and metric calculations as provider-independent tests.
- **Infrastructure:** real isolated SQLite tests for Identity/profile/session links, authoring concurrency, atomic publish, audit, analytics queries, retention/anonymization and migrations.
- **API/security:** authorization capability matrix, CSRF/origin, pagination/filter bounds, idempotency, stale revisions, masked DTOs, rate limits and non-disclosure responses.
- **React:** accessible forms/tables/dialogs, conflict recovery, sensitive-data absence, date/filter behavior and server error mapping.
- **Browser E2E:** admin content flow; guest → registered claim; support action reflected in client; metrics flow with documented freshness; expired/revoked admin recovery.
- **Failure/recovery:** database failure during publish/link/support action, bad import, stale save, expired auth, analytics write/read failure and rollback/backup rehearsal on isolated data.

## Risks and mitigations

- **Schedule expansion:** this is a second application plus identity and reporting. Deliver in stages and do not call Stage 1 a complete admin system.
- **Privacy/compliance:** decide data inventory, lawful purpose/consent where applicable, retention/export/deletion semantics before collecting email or analytics. Minimize data by default.
- **Privilege escalation:** policy-based authorization, deny-by-default endpoints, separate cookies, capability-matrix tests and audited role changes.
- **Account takeover/save theft:** secure Identity configuration, verification/reset design, lockout/rate limit and proof-of-current-guest-cookie for linking.
- **Metrics drift/double count:** canonical metric glossary, version-aware facts, idempotent event identity or derivation from trusted progress and fixture-backed calculations.
- **Active sessions broken by content edits:** immutable versions and session pinning; no in-place published edit/deletion.
- **Admin becoming generic database UI:** every mutation is a named use case with invariants, confirmation, audit and recovery; no EF entity exposure or arbitrary SQL.
- **SQLite scale/concurrency:** bounded queries/indexes and measured thresholds; move analytics/provider only through a separate adapter/ADR and real migration rehearsal.

## Decisions required before build

Recommended defaults for approval:

- Full system administration delivered in the five stages above, with the 68–106 hour schedule addition.
- Separate `apps/admin` SPA and `/api/admin/*` surface.
- Guest play remains; registered players are added with safe save claiming.
- ASP.NET Core Identity for player/admin authentication; capability policies for support/content/super-admin access.
- SQLite first behind purpose-specific ports; immutable published case snapshots; privacy-minimized version-aware analytics read model.
- No player impersonation, arbitrary progress edits, visual map editor, unrestricted exports or secret/config editing in the first release.

If the deadline cannot move, the recommended reduced milestone is Stage 1 plus a read-only system dashboard and content validation/import preview. Player mutations, publishing and trusted analytics must remain clearly incomplete rather than being implemented without the required security/data gates.

## Handoff

- Plan 1.0 supersedes the earlier content-only admin plan 0.1 from this task.
- Planning only; no admin app, account schema, analytics event, endpoint, migration or dependency has been added.
- T05 remains the active implementation and its existing dirty files are preserved.
- PROJECT_PLAN.md 1.4 and detailed tasks T16–T26 now record the approved program. No implementation has started.
- Next action when the user authorizes implementation: start T16 only, confirm the T05 content contract baseline, then record identity/privacy/content-publishing/analytics ADRs before scaffolding `apps/admin`.

## Improvement review

- Result: none
- Observation/evidence: the user corrected the proposed boundary from content-only to whole-system administration. This is a task-specific scope clarification, not yet a reusable implementation lesson.
- Mechanism changed or no-change reason: revised this task plan and current memory; no rule/skill change is warranted before real implementation evidence.
- Validation: checked the plan against T04 anonymous-session behavior, T05 content boundaries, API/web scoped rules and the lifecycle/security gates.
- Follow-up trigger: revisit after identity, publishing or analytics implementation reveals repeatable workflow evidence.
