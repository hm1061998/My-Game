# T13 — Environment review and README setup guide

Status: done
Owner: Codex
Depends on: T02
Plan version: documentation maintenance 1.1
Approval: original environment/README request plus user instruction “tôi không muốn dùng pnpm, chỉ dùng npm hoặc yarn”, 2026-09-25; npm selected as the simpler Node-bundled option
Workflow step: complete

## Outcome

Review the repository's actual toolchain and provide a durable Windows setup, run, verification, and troubleshooting guide in `README.md`.

## Scope

Included: inspect manifests, lockfiles, scripts and the current command environment; document required and optional tools; document system-wide and local .NET installation; preserve the existing run and verification commands. Excluded: installing software on the user's behalf, dependency upgrades, gameplay work, Docker, GitHub configuration, and deployment.

## Acceptance

- README requirements match `package.json`, `global.json`, launch profiles, and repository scripts.
- A Windows developer can verify prerequisites, install missing tools, restore, run both services, and execute checks.
- Current-machine findings clearly distinguish project requirements from tools merely supplied by the Codex runtime.
- Documentation-only checks are recorded; browser verification is N/A because runtime behavior is unchanged.

## Evidence

- Repository requirements were traced to `apps/web/package.json`, `global.json`, `NuGet.Config`, `scripts/verify.ps1`, API launch settings, lockfiles, and the T02 toolchain record.
- Current developer installation: Node 24.15.0 and npm 11.12.1. The npm version is pinned in `package.json`, Node is recorded in `.nvmrc`, and dependencies are locked by `package-lock.json`. `dotnet` is absent from `PATH`, and no repository-local `.tools/dotnet/dotnet.exe` exists.
- `git diff --check`: passed.
- npm migration: removed pnpm-only configuration and lockfile, generated npm lockfile v3, and confirmed `npm ci` reports 0 vulnerabilities.
- Frontend npm install, lint, typecheck, 1 Vitest test, and production build: passed. The known Phaser chunk-size warning remains unchanged.
- `scripts/verify.ps1`: npm install/lint/typecheck/test/build passed; script then stopped at the expected `dotnet` command because the required SDK is still absent.
- Backend restore/build/test: not run because the environment is missing the required .NET SDK; README now documents both system-wide and exact local installation paths.
- Browser preview/test: N/A because this task changes documentation only and does not alter runtime behavior.
- Official installation guidance was checked against Microsoft Learn and Node.js documentation on 2026-09-25.

## Handoff

The repository now uses npm exclusively. The environment guide covers prerequisites, verification, Windows setup, dependency restore, two-terminal local startup, full checks, and common failures. The user's immediate next action is to install .NET SDK 10 (or exact local 10.0.401), open a new terminal, and run `./scripts/verify.ps1`.

## Improvement review

- Result: candidate.
- Observation/evidence: npm initially failed against the pnpm-created install tree, and the agent runtime exposed different tools from the developer shell.
- Mechanism changed or no-change reason: recorded L001 and L002 in `docs/agent/lessons.md`; neither has enough repeat evidence for a dedicated skill yet.
- Validation: clean npm lock generation, `npm ci`, lint, typecheck, test, build, and environment command inspection.
- Follow-up trigger: promote after recurrence in another toolchain/environment task or authoritative evidence of a high-impact invariant.
