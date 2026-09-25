# T23 — Administration dashboard and reports

Status: approved
Owner: unassigned
Depends on: T22
Plan version: PROJECT_PLAN.md 1.4, Admin plan 1.0 / A07
Approval: user's 2026-09-25 approval of Admin plan 1.0; implementation deferred by the same instruction
Lifecycle phase: build
Workflow step: approved; no coding until a later user instruction and T22 passes

## Outcome and success signal

Authorized administrators can understand system usage, case completion and learning difficulty for a chosen period/version, with accurate labels, freshness and recovery states rather than inferred or misleading numbers.

## Scope

- Add aggregate admin endpoints and dashboard UI for player/session overview, case funnel, completion time, question difficulty/first-attempt accuracy, evidence unlocks, vocabulary and assistance use.
- Filters: bounded date range, explicit timezone, case, version and level where valid. URLs/state support reload without placing sensitive data in query strings.
- Show metric definition/help, numerator/denominator where useful, last-calculated/freshness and comparison labels only when mathematically valid.
- Use accessible tables and small, dependency-light charts only where a chart materially improves understanding; provide textual/table equivalents.
- Add operational cards for supported API/content/storage/read-model health and recent failed publish/import summaries without secret internals.
- Excluded: arbitrary report builder/SQL, raw events, unrestricted CSV export, third-party BI, real-time streaming and personal cohort drill-down.

## Acceptance and verification

- UI values match T22 fixture/API results for default and filtered ranges; zero denominators, empty ranges and partial/stale data are represented honestly.
- Date/timezone boundaries, case/version selection and back/forward/reload behavior are deterministic.
- Slow/network/error/unauthorized states remain usable and retryable; stale cached data is labelled.
- Small cohorts and aggregate responses do not reveal individual identity or private case answers.
- Keyboard/screen-reader navigation, focus, contrast and table/chart equivalents work at 1280px and smaller laptop width.
- Browser: default dashboard → filters → empty/stale/error → retry → reload; inspect console/network and verify no unexpected 5xx or sensitive response fields.
- Final gates: admin lint/typecheck/tests/build, API/fixture integration tests, accessibility checks, aggregate query performance sample, E2E and repository verification.

## Handoff

Pending. Next action: implement one overview metric card and filter vertical slice before expanding reports.

## Improvement review

- Result: pending
- Observation/evidence: pending
- Mechanism changed or no-change reason: pending
- Validation: pending
- Follow-up trigger: pending
