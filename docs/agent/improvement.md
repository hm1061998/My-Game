# Agent improvement loop

Run this review at every task handoff. Its purpose is better future decisions, not mandatory file churn.

## Review

1. Compare the approved plan, actual work, failures/retries, user corrections, and final evidence.
2. Ask what caused avoidable rework, what procedure was reliably useful, and what existing guidance was stale, missing, duplicated, or too broad.
3. Classify the result:
   - `none`: no durable lesson; record why in the task.
   - `candidate`: plausible reusable lesson with one or more evidence links; add/update `docs/agent/lessons.md`.
   - `verified`: reproduced, supported by an authoritative source/test, or successfully repeated in a comparable context.
   - `promoted`: verified knowledge encoded in the narrowest durable mechanism.
   - `retired`: guidance is obsolete or superseded; name its replacement.
4. Select the narrowest target: task evidence, lesson ledger, memory, scoped/root rule, skill, script, template, test, or ADR.
5. Validate the mechanism. For skills run the official quick validator; for scripts/tests execute them; for rules/templates inspect a realistic task path for contradictions.

## Promotion guardrails

- Rules capture broad invariants, safety boundaries, and repository conventions—not one-off commands.
- Skills capture reusable workflows requiring judgment. Keep descriptions discriminating and instructions concise.
- Scripts automate stable deterministic work. Do not script an unsettled decision process.
- Tests prevent product regressions. Do not replace behavioral evidence with text-matching tests for docs.
- Memory records current verified state, not a growing manual.
- A single incident remains a candidate unless it prevents a demonstrated high-impact failure or authoritative evidence makes the correction conclusive.
- Never weaken approval, browser/product verification, privacy, destructive-action safety, or deployment boundaries as an “improvement.”

## Required task record

Every task or handoff includes an `Improvement review` section with:

- result: `none`, `candidate`, `verified`, `promoted`, or `retired`;
- observation and evidence;
- changed mechanism, or reason no change was warranted;
- validation performed;
- follow-up owner/trigger when the lesson remains open.
