---
name: product-lifecycle
description: Carry an Office Case Files product increment from discovery through requirements, design, implementation, verification, release readiness, and handoff. Use for multi-phase product or feature work; stop before deployment or publishing.
---

# Product lifecycle

Read the active task, `PROJECT_PLAN.md`, accepted decisions, current memory, and the scoped rules for affected areas. Identify the current lifecycle phase and the evidence required to leave it. Do not repeat completed phases without a concrete contradiction or new user direction.

Trace one coherent chain through the work:

`problem and user → outcome and success signal → scope and acceptance → design and ownership → implementation → product evidence → release readiness → handoff and improvement`

For discovery, distinguish observed facts, user decisions, assumptions, and open questions. Resolve only questions that materially alter scope or risk.

For definition and design, record non-goals, failure/recovery paths, privacy/trust boundaries, data migration impact, accessibility, gameplay/input impact, and the acceptance scenarios that will prove the outcome. Record a decision before changing an accepted default.

For implementation, choose the smallest reviewable increment and use a specialist skill when the work crosses a domain it covers. Keep React, Phaser, API/application, domain, content, and infrastructure ownership explicit.

For verification, test the outcome in its real product surface. Include the highest-risk failure or recovery path, then confirm the final revision and run the required scripts. Do not substitute a build for browser/gameplay evidence when behavior changed.

For release readiness, prepare only what the approved gate permits: local artifacts, migrations, version notes, Docker/CI configuration, runbooks, observability, rollback, and known limitations. Mark remote CI, hosting, credentials, and production checks unverified unless actually authorized and observed.

Stop before deployment. Never infer permission to push, publish, create external infrastructure, mutate production, or use secrets. Record the missing authority or future deployment phase instead.

At handoff, run `docs/agent/improvement.md`. Update the task before current memory, validate any changed skill/rule/script, and leave one concrete next action.
