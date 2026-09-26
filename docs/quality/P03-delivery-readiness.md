# P03 — Packaged delivery readiness

Date: 2026-09-26

Status: complete — packaged acceptance, E2E correction, and all remote CI jobs passed

Branch/evidence commit: `main` at `a63e3072eb26efe83939ff4353f06c28441165dd` (pushed to `origin`)
GitHub Actions: [run 36233739417](https://github.com/hm1061998/My-Game/actions/runs/36233739417) — `verify`, headed Chromium `e2e`, and `docker` all succeeded.
Follow-up: [run 36234356486](https://github.com/hm1061998/My-Game/actions/runs/36234356486) passed `verify` and `docker`, but E2E failed because the test targeted the cabinet collision boundary (`y=495`) and slow CI movement stopped at `y=503.308`. The route now targets safe `y=500`; local headed E2E is 4/4 and full `verify.ps1` passes. Final remote rerun [36235584949](https://github.com/hm1061998/My-Game/actions/runs/36235584949) passed all three jobs.
Final correction commit `98448555c85815d0523c5ced457080b5c0b2da6d`: [run 36235584949](https://github.com/hm1061998/My-Game/actions/runs/36235584949) — `verify`, headed Chromium `e2e`, and `docker` all succeeded.

Package URL: `http://127.0.0.1:8080/` (production Docker Compose package)

## Scope and outcome

Retested the existing P01 package after P02 CI was configured. No gameplay/API code changed. This closes the only open non-admin implementation task; T15–T26 remain deferred admin work per the user's current instruction. Deployment, image publishing, GitHub settings, hosting and secrets remain out of scope.

## Environment and artifact

- Windows, Docker Engine 29.3.1, Docker Compose v5.1.1.
- Node 24.15.0 / npm 11.12.1; repository .NET SDK 10.0.401.
- Visible Google Chrome 153.0.8010.53 at `127.0.0.1:8080`.
- Final local image `office-case-files:local`: `sha256:9cce587ce3799e022c232446f67fa7228555040e104d10b7b2d0f4e44d8af675`, 116,260,727 bytes (~116.3 MB decimal).
- Runtime UID/GID 1654 (`app`); Node and .NET SDK absent. Server case JSON exists outside `wwwroot`; matching private path under `wwwroot` is absent. Production web root contains the built public app/assets only.
- Client bundle scan found zero matches for the probed correct-answer/solution strings.

## Packaged browser journey and recovery

On the visible production page, started a fresh session; used WASD/E for E01, answered Q01 first incorrectly then correctly, talked to Maya, collected E02 and answered Q02, reached the meeting checkpoint, read E04, and deliberately entered the scanner. The retry dialog recorded two detections; enabled the offered slow-scanner assistance, retried, dodged, crossed via the upper archive lane, cleared the scanner at the terminal, collected E03 and answered Q03, then spoke to Nora. The evidence board accepted Nora + Misunderstood + E03/E06. The submitted result showed reading 67/100 and investigation 100/100; all five review answers persisted at 5/5.

Force-recreated only `ocf-smoke`'s `app` container and reloaded the same Chrome tab. The HttpOnly session resumed at progress revision 21 with meeting checkpoint, scanner cleared, assistance state, result and 5/5 review intact. The canvas remained singular. The cookie was `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/api/v1`; `document.cookie` was empty.

## HTTP, privacy and runtime checks

| Probe | Result |
| --- | --- |
| `/`, `/api/v1/health`, `/case/deep-link` | 200 |
| `/api/v1/does-not-exist` | 404 |
| `/Content/Cases/swapped-report.v1.json`, `/swapped-report.v1.json`, `/appsettings.json`, `/office-case-files.db` | 404; no private content served |
| Throwaway start-session response | 201; Secure/HttpOnly/SameSite Strict cookie attributes present |
| 24-line app log after session creation | 0 matches for raw 64-hex session token/cookie patterns |
| Runtime/container private-file boundary | pass; server content outside public web root |
| `office-case-files_ocf-data` | preserved with `office-case-files` Compose label |
| P03-only `ocf-smoke_ocf-data` | removed after its ownership was confirmed; no `ocf-smoke` container/network remained |

The previous P01 957-line log review also recorded no `ocf_session` cookie name or long token-like strings.

## Local gates

| Check | Result |
| --- | --- |
| `scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe` | pass: lint, typecheck, 30 web tests, production build, .NET build, 12 API tests, agent-doc check |
| `npm --prefix apps/web run e2e -- -DotnetCommand ./.tools/dotnet/dotnet.exe` | pass: 4/4 headed Chromium tests; ~57 FPS, p95 frame 33 ms, longest frame 50 ms |
| `scripts/docker-smoke.sh` from a clean `ocf-smoke` preflight | pass: healthy app, expected SPA/API/private-route responses above; automatic cleanup |
| Production runtime and bundle privacy probes | pass |
| `git diff --check` | pass after the current documentation edits |
| Remote GitHub Actions, run 36233739417 for `a63e3072eb26efe83939ff4353f06c28441165dd` | pass: verify, headed Chromium E2E, Docker smoke |
| Follow-up CI run 36234356486 for `0af22cd91ca716e25eb0d20383a45a5d10973a56` | verify/docker pass; E2E failure diagnosed as route targeting exact collider boundary |
| Final route-correction CI run 36235584949 for `98448555c85815d0523c5ced457080b5c0b2da6d` | pass: verify, headed Chromium E2E, Docker smoke |

The Vite build emits the already-known `advancedChunks` deprecation warning; the build succeeds. No product fix was needed.

## Boundaries and remaining user actions

- No deployment, image publication, GitHub settings, branch protection/rulesets, hosting or secrets were changed.
- Apply the branch checks described in `docs/runbooks/github.md` as repository owner if desired. Base-image digest pinning and HTTPS hosting remain future work.
- The temporary package and its throwaway volume were removed after persistence/log verification; the user's default volume remains untouched.

## Improvement review

- Result: verified (L013).
- Observation/evidence: on this Windows machine, bare `bash` resolved to the WSL shim and failed because `/bin/bash` was unavailable; invoking Git for Windows' `bin/bash.exe` passed the same Docker smoke.
- Mechanism: documented the Windows PowerShell invocation in `docs/runbooks/github.md` and recorded L013; no gate or runtime behavior changed.
- Validation: reran the documented Git Bash command successfully; `scripts/check-agent-docs.ps1` and `git diff --check` are final documentation gates.
- Follow-up: reuse this invocation for local Docker smoke on Windows; revisit only if a future runner should discover Git Bash automatically.
