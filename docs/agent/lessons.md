# Agent lesson ledger

Keep only cross-task lessons here. Task files retain detailed evidence.

| ID | Status | Scope | Lesson | Evidence | Promotion / next trigger |
| --- | --- | --- | --- | --- | --- |
| L001 | candidate | Toolchain migration | When changing JavaScript package managers, an existing install tree may need a clean reinstall before the new manager can generate a reliable lockfile. | T13 npm migration: npm failed against the pnpm-created `node_modules`, then lock generation and all frontend gates passed after removing only that generated cache. | Promote to a toolchain migration skill/checklist if the repository changes manager again or the same failure recurs. |
| L002 | candidate | Environment audit | Distinguish tools supplied by the agent runtime from tools available in the developer's normal shell before declaring prerequisites satisfied. | T13 environment audit found different Node/npm visibility and no system `dotnet`; README was corrected to reflect the developer setup. | Promote to a reusable environment audit checklist after another environment/bootstrap task confirms the pattern. |
