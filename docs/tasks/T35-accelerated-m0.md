# T35 — Accelerated M0 AI-assisted audit

Status: M0 complete; M1 gate conditional on owner choices
Owner: Codex integration owner; independent A2/B1 agents may edit only their assigned note files
Depends on: T34
Plan version: M0/M1 plan amended 2026-09-27
Approval: owner's 2026-09-27 instruction “duyệt kế hoạch, nhưng rút ngắn phần M0 hoặc tự dùng agent AI để đóng vai người học.” This approves an accelerated simulated M0, not recruitment, spending, vendor contact, M1 gameplay code, or deployment.
Lifecycle phase: discover → design
Entry evidence: approved commercial direction; playable T31 baseline; M0/M1 plan and explicit acceleration request
Exit gate: simulated audit, visible baseline, creative brief, M1 human scorecard and M0 recommendation recorded with unresolved owner inputs
Next phase: owner review of M1 scene, art direction, cost ceiling, target hardware, and human-test route; then separate M1 implementation plan

## Scope and evidence

- Public first-session packet and protocol; two independent AI learner-role reports; integration synthesis and contradictions.
- Visible browser opening and start audit, plus code/content anchors clearly distinguished from played interactions.
- Candidate art/audio direction, small asset pilot, production estimate structure, and M1 human scorecard.
- Documentation only. Browser exercise is observational baseline; product code, secrets, paid assets, human outreach, and commerce are excluded.

Baseline: `main` at `40d649a`, ahead of `origin/main` by three commits when this task began; only the two commercial planning documents were modified before T35. Vite started with bundled Node at `127.0.0.1:5173`. API NuGet restore failed with NU1900 because advisory data could not be fetched; existing built API started with `--no-build --no-restore` at `127.0.0.1:5062`. Visible in-app browser loaded the connected game and started the tutorial with Enter. This does not prove full-case behavior.

## Findings and gate

- The A2 and B1 agents received the same public opening packet but no private case data or each other's notes; each wrote only its assigned report. Both flagged the E01 version distinction as a useful deduction anchor and optional translation as a key M1 hypothesis.
- The integration owner compared their reports with the visible game. The connected opening and movement tutorial rendered; the EMAIL ring/label and E legend were visible, partially countering concern about interaction discovery. The browser console had no warnings/errors at that point. This pass did not traverse E01, hear audio, dodge or complete the case; no human enjoyment or payment evidence is claimed.
- [M0 findings](../research/M0-findings.md), [creative brief](../design/M0-art-direction-brief.md), [M1 scorecard](../research/M1-scorecard.md) and [gate report](../product/M0-gate-report.md) recommend a narrow Phaser 2.5D pilot. M1 production awaits owner choices on style, cash ceiling, hardware and recruitment route plus a separate file-level code plan.

## Verification and handoff

Agent documentation check passed for 36 task files. `git diff --check` passed. The listed M0 research/design/gate files exist; relative document links were inspected. Browser observation used a visible Codex in-app tab at `http://127.0.0.1:5173/` on the `40d649a` game baseline, with API connected and tutorial started. Browser/full app scripts are N/A for documentation-only changes; this observation is research evidence, not M1 acceptance testing.

The previously rejected push to `origin` remains blocked by auto-review trust/ownership uncertainty. Do not retry by another path.

## Improvement review

- Result: none.
- Observation/evidence: limiting two role agents to the same public packet prevented hidden-answer contamination and made their anchored hypotheses easy to compare with the visible screen. This was a single M0 procedure; no recurring failure or tested reusable mechanism emerged.
- Mechanism changed or no-change reason: protocol and note template are scoped M0 artifacts; no broad rule, skill or script warranted.
- Validation: independent files reviewed, agent docs check and diff check passed; revisit if M1 human testing reveals a repeated research-process failure.
