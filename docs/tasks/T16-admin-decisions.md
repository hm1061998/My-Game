# T16 — Admin product, privacy, and architecture decisions

Status: approved
Owner: unassigned
Depends on: T05 content contract baseline
Plan version: PROJECT_PLAN.md 1.4, Admin plan 1.0 / A00
Approval: user's 2026-09-25 instruction “duyệt plan, hãy lập task chi tiết vào tài liệu, chưa tiến hành code”; implementation deferred
Lifecycle phase: design
Workflow step: approved; do not begin implementation until a later user instruction

## Outcome and success signal

The admin program has decision records precise enough that identity, privacy, publishing, analytics and authorization can be implemented without inventing policy inside endpoints or UI. Exit succeeds when downstream tasks can name stable roles, data ownership, retention, versioning and failure semantics.

## Evidence and decisions

- Preserve T04 anonymous sessions and T05 public/private content boundaries.
- Approved defaults: separate `apps/admin`; ASP.NET Core Identity; guest plus registered player; capability policies for support/content/super-admin; SQLite behind purpose-specific ports; immutable published case snapshots; privacy-minimized, version-aware analytics.
- Open details to resolve: player identifiers/profile fields, email verification/reset behavior before production, exact capabilities, retention/anonymization periods, metric formulas/freshness, audit retention and content-version allocation.

## Scope

- Confirm the actual T05 `CaseDefinition`, DTOs and `ICaseCatalog` baseline before recording decisions.
- Create ADRs/specs for: identity and guest claim; admin authorization/cookie separation; personal-data inventory/retention/export/deletion; draft/preview/publish/version pinning; analytics event/metric glossary; audit invariants.
- Produce a role-capability matrix covering every planned `/api/admin/*` use case and a data-flow/trust-boundary description.
- Define stable error codes, concurrency/idempotency rules, pagination/date/timezone semantics and database migration/rollback expectations.
- Affected documentation: `PROJECT_PLAN.md`, `docs/adr/`, `docs/product/`, `docs/architecture/`, T16 and current memory. No application code, migration, dependency or external service.
- Excluded: scaffolding apps, creating accounts/secrets, choosing production hosting/email vendor, coding schemas/endpoints.

## Acceptance and verification

- Decisions distinguish accepted defaults, deferred production choices and prohibited behavior; no unresolved item is silently implemented later.
- Role matrix denies by default and separates player, support, content and super-admin capabilities.
- Data inventory names purpose, source, visibility, retention/anonymization and export/deletion treatment for profile, session, progress, audit and analytics data.
- Metrics define numerator, denominator, event source, case/version dimension, timezone, freshness and duplicate handling.
- Publish ADR proves old sessions remain pinned and published versions are never mutated in place.
- Browser verification: N/A, documentation-only; later tasks own browser evidence.
- Run `scripts/check-agent-docs.ps1` and `git diff --check`; inspect internal links and contradictions against T04/T05 and scoped AGENTS rules.

## Handoff

Pending. Next action after implementation authorization: verify T05 contract state, then draft the identity/privacy ADR before any auth/schema work.

## Improvement review

- Result: pending
- Observation/evidence: pending
- Mechanism changed or no-change reason: pending
- Validation: pending
- Follow-up trigger: pending
