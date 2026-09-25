# Claude Code entry point

@AGENTS.md

## Claude Code mapping

- `AGENTS.md` (above) is the single source of project rules. Do not duplicate or override it here.
- Project skills live in `.agents/skills/`; `docs/agent/skills-index.md` says when to load each. `.claude/skills/*` are thin pointers so Claude Code can discover them — edit the `.agents` originals, never the pointers.
- Nested rules: `apps/web/CLAUDE.md` and `services/api/CLAUDE.md` import their sibling `AGENTS.md`.
