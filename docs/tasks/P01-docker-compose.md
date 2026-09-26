# P01 — Docker image, Compose and container smoke test

Status: done
Owner: Claude
Depends on: code_complete (recorded 2026-09-26)
Plan version: PROJECT_PLAN.md 1.4 (§9.3 row P01, §11.4), P01 plan 1.0
Approval: user approved plan 1.0 on 2026-09-26 with “duyệt kế hoạch”
Lifecycle phase: handoff
Workflow step: complete — image, Compose, container browser test, persistence, privacy and clean-clone build verified

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

Baseline `332b599`; plan `a3b378d`; implementation `0d689f2`.

Changed: `Dockerfile` (node:24.15.0-bookworm-slim → dotnet/sdk:10.0.401 locked restore/publish → dotnet/aspnet:10.0.12, non-root `app`, port 8080, `/data` owned by `app`, HEALTHCHECK via `--healthcheck`), `.dockerignore`, `compose.yaml` (`migrate` one-shot + `app` on `127.0.0.1:8080`, Production, named volume `ocf-data`, `restart: unless-stopped`), `services/api/Program.cs` (`--healthcheck`; static hosting + SPA fallback only when `wwwroot/index.html` exists; `/api/{**rest}` stays 404), `tests/OfficeCaseFiles.Api.Tests/StaticHostingTests.cs`, runbook §7 Docker, README link.

Evidence (Docker 29.3.1 / Compose v5.1.1, Docker Desktop started by the user):

- `docker compose build` 69 s; image 116 MB; user `app` (uid 1654); no SDK, no Node, no `.db`; `wwwroot` holds only the web build (0 JSON files); case JSON at `/app/Content/Cases`.
- `docker compose up -d`: `migrate` exited 0, `app` healthy.
- HTTP probes: `/` and `/deep/link` 200 (SPA); `/api/v1/health` 200; `/api/v1/nope`, `/Content/Cases/swapped-report.v1.json`, `/swapped-report.v1.json`, `/appsettings.json`, `/office-case-files.db`, `/OfficeCaseFiles.Api.dll` all 404 with no leaked content.
- Visible browser at `http://127.0.0.1:8080`: new session (Secure + HttpOnly cookie works on 127.0.0.1; `document.cookie` empty), E01 collected with real keys and `E`, Q01 answered in the UI, checkpoint/encounter/remaining clues via same-origin API calls, conclusion through the evidence board → 100/100.
- `docker compose up -d --force-recreate app` → reload: same session, result 100/100. `docker compose down` (volume kept) + `up -d` → same.
- Logs (957 lines): no `ocf_session` cookie name, no long token-like strings.
- Backup/restore: `docker compose run --rm ... --export` → new volume `--migrate` + `--import` verified; second import refused (TargetNotEmpty, exit 1).
- Clean clone of `origin/main` at `0d689f2`, `docker build --no-cache` 24 s: identical asset hashes (`index-BTvXHge4.js`, `GameCanvas-BLH8N341.js`, `phaser-DepFvUma.js`); clone and test image removed.
- Local gates: `verify.ps1` pass (30 web, 12/12 API tests, 0 warnings), `npm --prefix apps/web run e2e` 4/4, `check-agent-docs.ps1`, `git diff --check`.

Left running: nothing — `app` stopped with `docker compose stop`; volume `office-case-files_ocf-data` kept with the test session.

Limitations / follow-ups: base images pinned by tag, not digest (P02 CI can add digests); Production logs include EF Core SQL command lines at Information level (no parameter values) — lower `Microsoft.EntityFrameworkCore` to Warning if log volume matters; HTTPS/reverse proxy and any non-local host are out of scope.

Next action: P02 — GitHub workflow, PR template and branch-check guidance; needs its own plan and approval.

## Improvement review

- Result: none (new); L011 applied
- Observation/evidence: testing the production container directly in the browser (L011) covered the Production-only paths (static hosting, Secure cookie); no new failure mode appeared.
- Mechanism changed or no-change reason: static hosting is guarded by a test; container checks are recorded in the runbook.
- Validation: evidence above.
- Follow-up trigger: add the container smoke to CI in P02.
