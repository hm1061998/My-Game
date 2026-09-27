# Project skills index

Load only the skill relevant to the current task.

| Skill | Use when | Path |
| --- | --- | --- |
| Project handoff | Starting, pausing, resuming, or transferring a task | `.agents/skills/project-handoff/SKILL.md` |
| Product lifecycle | Taking a multi-phase product increment from discovery through release readiness and handoff, without deployment | `.agents/skills/product-lifecycle/SKILL.md` |
| Implement vertical slice | A feature crosses API, React, Phaser, or storage boundaries | `.agents/skills/implement-vertical-slice/SKILL.md` |

## Project-local third-party skills

These are vendored in `.agents/skills/` so this repository can use them without a global Codex installation. Apply only the skill relevant to the task. Current user instructions and `AGENTS.md` take precedence over third-party guidance. Claude Code pointer skills in `.claude/skills/` refer to these local copies.

| Skill | Use when | Path |
| --- | --- | --- |
| UI/UX Pro Max | Designing or reviewing interfaces, interaction, accessibility, responsive layout, typography, or visual systems | `.agents/skills/ui-ux-pro-max/SKILL.md` |
| Brainstorming | Before creative feature, component, or behavior work | `.agents/skills/brainstorming/SKILL.md` |
| Diagnosing Superpowers | Investigating a Superpowers workflow failure | `.agents/skills/diagnosing-superpowers/SKILL.md` |
| Dispatching parallel agents | Independent tasks explicitly permit parallel agent work | `.agents/skills/dispatching-parallel-agents/SKILL.md` |
| Executing plans | Carrying out an approved implementation plan inline | `.agents/skills/executing-plans/SKILL.md` |
| Finishing a development branch | Choosing integration after implementation and verification | `.agents/skills/finishing-a-development-branch/SKILL.md` |
| Receiving code review | Evaluating review feedback before changing code | `.agents/skills/receiving-code-review/SKILL.md` |
| Requesting code review | Reviewing a completed implementation | `.agents/skills/requesting-code-review/SKILL.md` |
| Subagent-driven development | An approved plan explicitly uses independent agent tasks | `.agents/skills/subagent-driven-development/SKILL.md` |
| Systematic debugging | Investigating a bug, test failure, or unexpected behavior | `.agents/skills/systematic-debugging/SKILL.md` |
| Test-driven development | Implementing a feature or bug fix | `.agents/skills/test-driven-development/SKILL.md` |
| Using Git worktrees | Starting isolated feature work or an implementation plan | `.agents/skills/using-git-worktrees/SKILL.md` |
| Using Superpowers | Selecting applicable skills at task start | `.agents/skills/using-superpowers/SKILL.md` |
| Verification before completion | Claiming work complete or creating a commit/PR | `.agents/skills/verification-before-completion/SKILL.md` |
| Writing plans | Turning multi-step requirements into an implementation plan | `.agents/skills/writing-plans/SKILL.md` |
| Writing skills | Creating, editing, or verifying a skill | `.agents/skills/writing-skills/SKILL.md` |

Sources: `ui-ux-pro-max` from `nextlevelbuilder/ui-ux-pro-max-skill` (retrieved 2026-09-27); Superpowers from the installed plugin cache version `6.4.2`. The UI/UX skill's search commands use the repository-local path. Preserve the bundled license notices when updating either source.

Planned specialist skills such as 2.5D gameplay, case authoring, storage migration, and release verification are created after their first real workflow supplies evidence. Do not treat planned names as existing skills.

Claude Code discovers these through pointer skills in `.claude/skills/<name>/SKILL.md` and loads rules through `CLAUDE.md` → `@AGENTS.md`. Keep `.agents/skills` as the only source; when adding or renaming a skill here, add or update its pointer with the same `name` and `description`.
