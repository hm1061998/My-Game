# T32 — Install project-local UI/UX and Superpowers skills

Status: done
Owner: Codex
Depends on: T14 agent foundation
Plan version: 1.0
Approval: user's 2026-09-27 instruction to install `ui-ux-pro-max` and the full Superpowers skills set inside this project
Lifecycle phase: build → verify
Workflow step: completed after project-local validation; browser N/A for agent tooling

## Outcome and success signal

The project carries its own usable copies of `ui-ux-pro-max` and all 15 Superpowers skills under `.agents/skills/`, discoverable through the project skill index and Claude pointer files.

## Evidence and decisions

- Baseline: `f390ba4` on clean `main`/`origin/main`.
- Sources: the previously installed `ui-ux-pro-max` skill from `nextlevelbuilder/ui-ux-pro-max-skill` and Superpowers plugin cache version `6.4.2`; both upstream bundles carry MIT licenses, copied with the local installation.
- Project instructions and the user's current request take precedence over bundled third-party guidance.

## Scope

- Copy the skill bundles and their supporting data/scripts without changing product code or dependencies.
- Adapt the UI/UX skill's search examples to the project-local path.
- Add Claude discovery pointers and update `docs/agent/skills-index.md`.
- Excluded: using the skills to redesign the game, modifying global installations, installing npm packages, or changing project permissions.

## Acceptance and verification

- All 16 added skill directories contain `SKILL.md` and their supporting files.
- A project-local UI/UX search returns results.
- Relative links in bundled skills resolve where they refer to bundled files.
- Claude pointers match local skill names and descriptions.
- Agent docs check and `git diff --check` pass; browser verification: N/A because this task changes agent tooling and documentation only.

## Handoff

- Copied 15 Superpowers skill directories (89 source files, hash-matched to the installed `6.4.2` plugin) and one UI/UX directory (73 source files plus its license) to `.agents/skills/`. Three generated Python bytecode files from the personal installation were excluded. The local UI/UX `SKILL.md` uses a repository-relative search path in place of the Claude plugin path.
- Added 16 `.claude/skills/` pointers and indexed the local skills in `docs/agent/skills-index.md`.
- Checked all 16 `SKILL.md` files, matching pointers and Markdown relative links with a standard-library validator: zero errors. The local UI/UX search returned three UX results. `scripts/check-agent-docs.ps1` passed for 33 task files.
- The optional skill-creator quick validator could not start because neither available Python runtime has `yaml`; no dependency was installed for this docs/tooling-only task. The standard-library checks above cover the installation acceptance.
- Browser verification: N/A, because no application route or behavior changed. Full app verification: N/A for the same reason. `git diff --cached --check` passed before the scoped local commit. Push to the configured `origin/main` was rejected by automatic approval review because ownership/trust of the remote destination for these internal docs could not be verified; read-only checks confirmed the URL and branch but `gh` is unavailable to verify the authenticated GitHub account. No alternate push path was attempted. The local commit is one ahead of `origin/main`.
- Next action: resume the project plan review and decide which proposed improvement to pursue.

## Improvement review

- Result: none
- Observation/evidence: the installation required only path adaptation and normal validation; no repeated project workflow failure was found.
- Mechanism changed or no-change reason: the skill index and pointers were updated for this requested installation; no new project rule or skill was warranted.
- Validation: all skill/pointer/link checks, a live local search, and the agent docs check passed.
- Follow-up trigger: reconsider only if a future skill update exposes a reproducible portability issue.
