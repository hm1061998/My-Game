# T17 — Admin shell and authorization foundation

Status: approved
Owner: unassigned
Depends on: T16
Plan version: PROJECT_PLAN.md 1.4, Admin plan 1.0 / A01
Approval: user's 2026-09-25 approval of Admin plan 1.0; implementation deferred by the same instruction
Lifecycle phase: build
Workflow step: approved; no coding until a later user instruction and T16 exit gate

## Outcome and success signal

An administrator can open the separate admin SPA, authenticate, see only navigation allowed by capabilities, sign out, and recover cleanly from expired/revoked access. All admin APIs deny anonymous, guest and ordinary player identities.

## Scope

- Scaffold `apps/admin` with React/Vite/TypeScript, routing, query provider, semantic layout, shared design tokens and generated API contract path.
- Add administrator authentication and capability policies using the T16 ADR. Keep admin, player and anonymous session cookies distinct.
- Add `/api/admin/auth/*` and a minimal authorized “current admin”/health summary; use explicit DTOs and ProblemDetails.
- Provide an explicit local/test bootstrap command or fixture with audit; never default credentials or committed secrets.
- Implement CSRF/origin protections, cookie flags, lockout/rate-limit behavior and structured logs without credentials/tokens.
- Add admin package scripts to repository verification without disturbing `apps/web` commands.
- Likely areas: new `apps/admin/`, API Identity/Application/Infrastructure/Contracts/Features, isolated migration and API/admin tests. Exact files follow T16 and closest AGENTS rules.
- Excluded: player accounts, content editors, player search, analytics, production email/SSO, deployment.

## Acceptance and verification

- Anonymous, guest and player cookies cannot authorize any `/api/admin/*` route; non-disclosing 401/403 responses follow the ADR.
- Authorized admin login/logout/current-user works; expiry, lockout and revoked capability lead to a visible recoverable UI state.
- Navigation and API both enforce capabilities; hiding a menu is not treated as authorization.
- CSRF/origin negative tests cover every mutation. Cookies are HttpOnly/Secure as environment requires and have distinct names/scopes.
- Bootstrap is explicit, repeat-safe and audited; logs/responses/OpenAPI omit secrets, hashes, stamps and raw tokens.
- Browser: login → protected shell → logout; wrong password/lockout; expiry/revocation; keyboard navigation at 1280px and smaller laptop width; no unexpected console/network/5xx failures.
- Final gates: admin lint/typecheck/tests/build, relevant .NET tests/build, authorization matrix, migration drift, repository verification and `git diff --check`.

## Handoff

Pending. Next action: after T16, implement the smallest login/shell vertical slice before adding admin features.

## Improvement review

- Result: pending
- Observation/evidence: pending
- Mechanism changed or no-change reason: pending
- Validation: pending
- Follow-up trigger: pending
