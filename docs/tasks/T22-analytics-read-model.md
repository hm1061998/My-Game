# T22 — Analytics vocabulary and trusted read model

Status: approved
Owner: unassigned
Depends on: T16, stable T06–T08 event/progress semantics
Plan version: PROJECT_PLAN.md 1.4, Admin plan 1.0 / A06
Approval: user's 2026-09-25 approval of Admin plan 1.0; implementation deferred by the same instruction
Lifecycle phase: design → build
Workflow step: approved; no coding until a later user instruction and dependencies pass

## Outcome and success signal

The system produces privacy-minimized, version-aware product and learning aggregates whose formulas are defined, reproducible from trusted state/events and immune to duplicate retries.

## Scope

- Finalize the T16 metric glossary for active/new/returning players, starts/completions, completion time, abandon/retry, first-attempt accuracy, attempts, missed questions, evidence funnel, vocabulary saves and assistance use.
- Choose per metric whether to derive from authoritative progress tables or record a purpose-built idempotent fact/event; do not add a generic free-form event dump.
- Add application contracts and Infrastructure read model/store with case/version and UTC dimensions, documented timezone conversion and freshness.
- Add retention/anonymization handling for player deletion and guest identifiers; events/facts exclude email, display name, tokens and private content bodies.
- Bound date ranges and query costs; add indexes from measured/query-plan evidence. Background/pre-aggregation only if needed and with rebuild/recovery semantics.
- Excluded: dashboard UI (T23), third-party analytics, data warehouse, raw event browser/export, real-time promise and marketing tracking.

## Acceptance and verification

- A fixed fixture yields exact documented counts/rates for each metric by case/version, level, date range and timezone boundary.
- Idempotent request retries and replayed progress do not double-count; first-attempt and later-attempt semantics match domain rules.
- Old/new case versions are not combined unless explicitly requested and labelled.
- Missing/late analytics processing never blocks core gameplay writes; freshness/failure is observable and rebuild/reconciliation is defined if events are used.
- Player anonymization/deletion changes subject linkage per policy while preserving only approved aggregates.
- Browser verification: N/A for isolated read-model implementation only if no UI is added; verify API responses directly. T23/T25 own real dashboard browser evidence.
- Final gates: metric unit/fixture tests, real SQLite integration/query tests, retention/anonymization tests, API contract/privacy checks, migration drift and repository verification.

## Handoff

Pending. Next action: prove metric formulas with fixtures before adding storage or dashboard endpoints.

## Improvement review

- Result: pending
- Observation/evidence: pending
- Mechanism changed or no-change reason: pending
- Validation: pending
- Follow-up trigger: pending
