# P01 — Docker image, Compose and container smoke test

Status: awaiting_approval
Owner: Claude
Depends on: code_complete (recorded 2026-09-26)
Plan version: PROJECT_PLAN.md 1.4 (§9.3 row P01, §11.4), P01 plan 1.0
Approval: pending user approval of plan 1.0
Lifecycle phase: define
Workflow step: plan drafted; no code changed

## Outcome and success signal

The game runs from one local container built from a clean checkout: open the container URL, play (interaction, encounter, checkpoint, conclusion), recreate the container and resume with progress intact, and confirm private case content is not reachable over HTTP (PROJECT_PLAN §11.4 acceptance).

## Evidence and decisions

Verified facts (baseline `332b599`):

- Docker CLI 29.3.1 and Compose v5.1.1 are installed; the **Docker Desktop daemon is not running** (`dockerDesktopLinuxEngine` pipe missing). Starting it is the user's action.
- Today the API does not serve the React app; Vite proxies `/api` in dev. There is no Dockerfile, `.dockerignore` or `compose.yaml`.
- The session cookie is `HttpOnly`, `SameSite=Strict`, `Path=/api/v1`, and `Secure` outside Development. Chrome treats `http://localhost`/`127.0.0.1` as a secure context, so a Production container on localhost keeps the Secure cookie without weakening it.
- Mutations are accepted from the API's own origin, so serving web and API from one origin in the container needs no CORS change.
- Case content is server-only JSON under `services/api/Content/Cases`; SQLite path comes from `ConnectionStrings:Game`; migrations run only via `--migrate` (T04) and export/import via `--export`/`--import` (T12).

Proposed decisions (accepted on approval):

- **Same-origin hosting:** the API serves the built React files from `wwwroot` with `UseStaticFiles` + SPA fallback to `index.html` for non-`/api` paths, enabled only when `wwwroot/index.html` exists (dev with Vite is unchanged). Case JSON stays outside `wwwroot`.
- **Multi-stage `Dockerfile`:** Node 24 stage builds `apps/web`; .NET SDK 10 stage does a locked restore and `publish`; runtime is `mcr.microsoft.com/dotnet/aspnet:10.0` with no Node/.NET SDK. Base images pinned to exact version tags (digest pinning recorded as a P02/CI follow-up). Runs as the image's non-root `app` user, listens on 8080.
- **`compose.yaml`:** one `app` service bound to `127.0.0.1:8080`, `ASPNETCORE_ENVIRONMENT=Production`, a named volume `ocf-data` mounted at `/data` with `ConnectionStrings__Game=Data Source=/data/office-case-files.db`, a one-shot `migrate` service (same image, `--migrate`) that `app` waits for, and `restart: unless-stopped`. No secrets are needed or committed.
- **Health check:** add a `--healthcheck` CLI switch (HTTP GET to the local `/api/v1/health`, exit 0/1) so the runtime image needs no curl/wget.
- **`.dockerignore`:** excludes `.git`, `.tools`, `.packages`, `node_modules`, `bin/obj`, `dist`, databases, `*.export.json`, test results and logs.
- **Runbook:** add a Docker section to `docs/runbooks/local.md`: build, up, logs, stop, recreate, backup/restore via `docker compose run --rm app --export/--import` into the volume, and a warning that `docker compose down -v` deletes progress.

## Scope

Included: `Dockerfile`, `.dockerignore`, `compose.yaml`, `services/api/Program.cs` (static hosting + `--healthcheck`), a focused API test for SPA fallback and that `/Content/...` and `.json` case paths are not served, runbook/README/memory/task updates.

Excluded: pushing or publishing images, registries, any remote/CI (P02), HTTPS/reverse proxy or hosting, PostgreSQL (P04), changing cookie security, deployment.

Risks and controls: a Production-only difference (static hosting, Secure cookie) is exercised in the visible browser against the container itself; volume loss is prevented by named volumes and the runbook warning; image size and startup time are recorded.

## Acceptance and verification

- `docker compose build` from a clean clone of `origin/main` succeeds; runtime image contains no SDKs and no `Content` under `wwwroot`.
- Visible browser at `http://127.0.0.1:8080`: start session, collect evidence with real keys, answer a question, checkpoint + encounter, conclusion → result.
- `docker compose up -d --force-recreate app` (and `down` + `up` without `-v`) → reload resumes the same session and result.
- `GET /Content/Cases/swapped-report.v1.json`, `/swapped-report.v1.json` and `/appsettings.json` return 404/fallback, never the file.
- Health check reports healthy; logs contain no token values.
- Backup/restore via compose commands round-trips into a fresh volume.
- Local gates still pass: `verify.ps1`, `npm --prefix apps/web run e2e`, `check-agent-docs.ps1`, `git diff --check`.

## Handoff

Pending approval. Needs the user to start Docker Desktop before the build step.

## Improvement review

- Result: pending
- Observation/evidence: pending
- Mechanism changed or no-change reason: pending
- Validation: pending
- Follow-up trigger: pending
