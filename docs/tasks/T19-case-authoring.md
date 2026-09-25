# T19 — Case authoring foundation

Status: approved
Owner: unassigned
Depends on: T05, T16, T17
Plan version: PROJECT_PLAN.md 1.4, Admin plan 1.0 / A03
Approval: user's 2026-09-25 approval of Admin plan 1.0; implementation deferred by the same instruction
Lifecycle phase: build
Workflow step: approved; no coding until a later user instruction and dependencies pass

## Outcome and success signal

A content administrator can import or create a case draft, edit foundational case/NPC/evidence/glossary data, validate it and resume after reload without changing any published case or active player session.

## Scope

- Add `ICaseAuthoringStore` and SQLite adapter for mutable drafts with application-managed revision, timestamps and audit events; keep `ICaseCatalog` read-only.
- Add case/draft list, create, import, get and conditional-save use cases under capability-protected admin endpoints.
- Build admin dashboard and structured accessible editors for metadata, brief, NPCs, evidence, glossary and public interaction/map references defined by T05.
- Import validates schema/version and creates a new draft; it never overwrites a published version. Export is a canonical draft backup without credentials or unrelated data.
- Map validator errors to stable section/field paths. Two-tab stale saves return 409 with explicit reload/compare/retry UX; no last-write-wins overwrite.
- Excluded: question/unlock/solution editing, preview/publish (T20), binary asset upload, visual map editor, player/session management.

## Acceptance and verification

- Seed/import current case v1 into a draft, edit/reload and export/import round trip with stable IDs and canonical checksum.
- Duplicate IDs, bad references and unsupported schema versions produce actionable errors; malformed import changes nothing.
- Two admins/tabs editing one revision demonstrate first-save success and stale-save conflict with no silent loss.
- Every create/import/save action records actor, target, old/new revision, result and trace ID without dumping full private content.
- Published JSON case and T05 player flow remain unchanged; no draft appears in public case endpoints or static assets.
- Browser: list/empty/error states; import failure/recovery; keyboard edit/save/reload; stale conflict; 1280px and smaller laptop width.
- Final gates: admin tests/build, domain validator/API/SQLite tests, content/contract checks, migration drift, repository verification and `git diff --check`.

## Handoff

Pending. Next action: implement authoring port and draft concurrency before editor breadth.

## Improvement review

- Result: pending
- Observation/evidence: pending
- Mechanism changed or no-change reason: pending
- Validation: pending
- Follow-up trigger: pending
