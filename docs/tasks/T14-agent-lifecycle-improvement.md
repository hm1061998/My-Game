# T14 — Agent lifecycle and continuous improvement

Status: done
Owner: Codex
Depends on: T01
Plan version: agent foundation 2.0
Approval: user request “bổ sung cơ chế tự cải thiện agents skill và rule mỗi khi làm việc. agents có khả năng chạy toàn bộ vòng đời sản phẩm, trừ công đoạn deploy”, 2026-09-25
Lifecycle phase: handoff
Workflow step: complete

## Outcome and success signal

Make the repository agents capable of owning a product increment from discovery through release readiness and handoff, while requiring an evidence-based improvement review on every task and explicitly excluding deployment.

## Scope

Included: root rules, lifecycle protocol, handoff behavior, improvement policy/ledger, reusable lifecycle skill, task template, skill index, validation, and durable memory. Excluded: application code, product feature work, actual packaging/deployment, external services, pushes, publishing, and production changes.

## Acceptance and verification

- Rules and protocol name every lifecycle phase through release readiness and a hard deployment boundary.
- Every task handoff must record an improvement outcome, including `none` when appropriate.
- Promotion rules distinguish lessons, rules, skills, scripts, tests/templates, memory, and ADRs.
- A reusable product-lifecycle skill is discoverable and validates successfully.
- Existing approval, quality, privacy, and safety gates are not weakened.
- Browser verification: N/A because only agent workflow documentation and skills change.

## Handoff

Agent work now has an explicit lifecycle from discovery through release readiness, a hard pre-deployment stop, a mandatory task-level improvement review, a lesson ledger, a reusable lifecycle skill, a task template, and a structural verification script. Browser verification is N/A because runtime product behavior is unchanged.

## Improvement review

- Result: promoted.
- Observation/evidence: the original protocol mentioned learning but did not require an outcome per task, track lesson maturity, cover discovery/release readiness, or enforce a deployment boundary as a lifecycle stop.
- Mechanism changed or no-change reason: promoted the verified repository requirement into root rules, protocol, handoff/lifecycle skills, improvement policy, lesson ledger, task template, and structural gate.
- Validation: official quick validator passed for all three project skills; `scripts/check-agent-docs.ps1` and `git diff --check` passed. Final `scripts/verify.ps1` passed the agent structural gate and every npm stage, then stopped at the known missing `dotnet` prerequisite; browser N/A for workflow-only changes.
- Follow-up trigger: every future handoff runs the review; L001/L002 promote only on their recorded trigger; add deployment as a separate approved phase later.
