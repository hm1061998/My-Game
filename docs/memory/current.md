# Current context

Updated: 2026-09-27
Quyết định mới nhất của chủ dự án: tạm hoãn mọi việc thu phí/kiếm tiền đến khi chủ dự án chủ động yêu cầu tiếp tục. Việc này gồm báo giá thương mại, asset hoặc sản xuất vụ án trả phí, checkout/thuê bao và quảng cáo trả phí. Sau khi M2 hoàn tất, thử nghiệm miễn phí với người học chỉ được xem xét tiếp khi qua các cổng về thiết bị, đồng thuận, lưu giữ dữ liệu và bồi hoàn; quyết định này không cho phép liên hệ người tham gia hoặc chi tiền.
Mốc hiện tại: chủ dự án chỉ đạo lập kế hoạch triển khai M2 theo thiết kế mới ngày 2026-09-27. Bản kế hoạch T40 bằng tiếng Việt ở `docs/superpowers/plans/2026-09-27-m2-product-redesign-implementation.md` đang chờ duyệt; chưa có thay đổi code. Hướng đã duyệt: hai vụ án hoàn chỉnh (The Swapped Report dài hơn), giấy ngà–mực/than có điểm nhấn, hai mẫu ngoại hình có thể đổi, Dễ/Trung bình/Khó/Chuyên gia độc lập A2/B1, khảo sát chỉ gợi ý, HUD có minimap và không có right bar. The Swapped Report giữ mục tiêu 25–35 phút/3 hồi/3 vùng/8–10 hồ sơ/2 đoạn né/≥16 cụm tiếng Anh. Tình huống case hai chưa chốt; kế hoạch đặt lựa chọn đó làm cổng trước nhánh nội dung. Thu phí và thử nghiệm người học thật vẫn tạm dừng.
The owner approved T36's E01→E02→scanner→E03→E06 design and T37's implementation, plus T38's Phaser 2.5D visual pass. T37 retains hidden-by-default optional Vietnamese, a skippable session-only working theory and the evidence-led Nora reveal. T38 refined the existing SVG materials and character-sheet shading/poses without changing gameplay geometry or dependencies. Four serial headed critical-journey samples across baseline and post-art revisions measured 60 fps/p95 17 ms at 1280×800. Final `/assets/` transfer is 991,549 bytes (+58,719, 6.3% vs T37; ambience MP3 excluded). Five independent AI role simulations surfaced hypotheses about A2 prompt density, version wording, scanner instructions, optional notes and small character acting; see `docs/research/T38-ai-roleplay-synthesis.md`. They are not human comprehension or revenue evidence. Recommend M2 only as an owner-led 5–8 learner validation pilot after target device/browser/network and consent, retention and compensation are resolved. No real learners contacted, spend, checkout, paid-case production or deployment. T38 QA and same-scene before/after captures: `docs/quality/T38-visual-quality-qa.md` and `docs/research/assets/`.

The Windows sandbox terminal failure was diagnosed from its 2026-09-27 log as an ACL refresh failure on `.agents`, owned by `Admin\CodexSandboxOffline`. Auto-review required explicit approval for an owner change; the user approved that exact path. An interactive UAC command set its owner to `Admin\Minh` without intentionally changing ACL entries, and a normal sandboxed `git status` succeeded. L014 records the verified diagnostic procedure. No broad permission rule or automated ACL change was added.
Never commit `office-case-files.db`, `.tools/`, `test-results/`, `playwright-report/`, Docker exports or user-owned volumes.

This file holds current state only. History and evidence live in task files under `docs/tasks/` and in Git.

## Product and accepted defaults

Browser-based 2.5D action detective RPG teaching A2–B1 English in an office setting. React owns application UI, Phaser owns frame-level gameplay, ASP.NET Core owns trusted progression and scoring (PROJECT_PLAN.md 1.4).

Baseline defaults: Phaser sprite-based 2.5D, desktop keyboard controls, stealth/dodge action, SQLite behind storage ports, server-side JSON case content. For M2, the owner has now approved the warm ivory/pencil-ink visual direction, player preset choice, two-case selection, separate game difficulty and A2/B1 recommendation, and HUD with minimap; these supersede the earlier visual/HUD baseline for M2 only. Record additional material changes before implementation.

Accepted M1 content requirement: English dialogue and clues retain optional Vietnamese alongside the English, hidden by default with a local show/hide preference. Translation must not affect score, progression or answer access. See the approved design and implemented T37 slice.

Still open: public hosting, GitHub visibility, image publishing, PostgreSQL adapter timing, OpenAPI → TypeScript codegen (two generators rejected: TypeScript 6 incompatibility / npm audit advisories; runtime response validation used instead), and the admin-portal production choices that T16 must record. Future comprehensive graphics upgrade options (proposed, not approved): `docs/design/graphics-technology-options.md`.

## Task state

- Done: T01–T12, T13, T14, T27, T28, BUFFER, P01, P02. **Milestone `code_complete` recorded 2026-09-26** (evidence: `docs/tasks/BUFFER-code-complete.md`).
- Done: T29 approved office ambience. User supplied the official MP3 at `apps/web/src/audio/office-quiet-traffic.mp3`; manifest/task include source, license and SHA-256. Gesture-gated local fetch/decode, procedural fallback/retry and Web Audio integration are covered in `docs/tasks/T29-office-ambience.md`.
- Done: T30 visual polish on the existing office only. Added a local SVG daylight pool, window mullions/reflections/sills and eight reduced-motion-aware motes; no new level or gameplay/coordinate change. Final visible headed E2E 7/7, grayscale screenshots reviewed, 60 fps/p95 17 ms, +~1.9 KB visual transfer; full local verify and docs check passed. Codex browser-panel preview queued; standalone 5173 lacked its API, so integrated 5174 headed runner is the product-browser evidence. Details/evidence and local preview limitation are in `docs/tasks/T30-visual-polish.md`. The next level remains a separate future task.
- Done: T31 existing character art upgrade, approved by the user's 2026-09-26 “ok tiến hành đi”. Refined all four original SVG sheets, replaced enlarged-frame portraits with dedicated expressive busts, preserved runtime contracts and added SVG/browser checks. Final visible headed E2E 7/7 (twice), 1280×800/1100×720/grayscale/reduced-motion, missing-art fallback, 60 fps/p95 17 ms; full verify passed 47 web + 12 API tests. `docs/tasks/T31-character-art-upgrade.md` holds detailed evidence. No new level, raster/Spine runtime or animated expressions were added.
- Done: T36 M1 segment design approved 2026-09-27. Accepted passage is E01→E02→scanner→E03→Nora E06; E06 in v2 uses evidence prerequisites, Vietnamese is hidden by default, initial sample has no cash spend, and the owner invites 5–8 learners. See `docs/design/M1-segment-spec.md` and `docs/tasks/T36-m1-segment-design.md`.
- Done: T37 M1 implementation and automated gates passed and were pushed in `3b0509f` on managed worktree branch `codex/m1-version-two`; follow-up baseline/performance details are in the M1 QA report.
- Done: T38 visual pass completed on `codex/m1-version-two`. Two post-art headed critical-journey samples again measured 60 fps/p95 17 ms. The visible full suite passed 8/8, web tests 61/61, production build and docs checks passed; target-machine/network acceptance remains open. Five AI role simulations are hypotheses only.
- In progress: T39 design approved as direction; T40 implementation plan is ready for review. Current code has a case list endpoint/catalog and session pinning, but the web hardcodes starting `swapped-report`; world/checkpoint/encounter data remains single-case and there is no case picker, difficulty selection, A2/B1 survey, avatar preset selection or minimap. These are confirmed gaps, not implemented features. Two cases plus setup/HUD greatly expand M2 from its original single-case scope. See T39/T40 for details.
- Done: P03 local package/browser/scripts evidence; user explicitly waived waiting for GitHub E2E on 2026-09-26. Run [36239427269](https://github.com/hm1061998/My-Game/actions/runs/36239427269) was last observed with verify/Docker green and E2E in progress. Remote E2E is unverified and is not claimed green. No workflow change was made.
- Approved admin tasks T15–T26 remain deferred and unchanged. P04 is optional infrastructure work pending a provider decision, not a player-facing feature.
- Approved but deferred: T15 admin epic and T16–T26. Documentation only; no admin code, dependency, migration, account, secret or external service until the user starts them.
- `code_complete` and `delivery_complete` are recorded. P03 delivery is closed under the user's explicit waiver of remote E2E waiting; report the remote E2E as unverified. No deployment, image publishing, or GitHub settings changes were authorized or performed.
- The earlier non-admin backlog and newly approved T31 are complete; leave T15–T26 admin implementation deferred and unchanged.

## Standing approvals and boundaries

- Every task: plan → user approval (recorded in the task) → code → quick checks → visible browser preview/test → fix/retest → final browser confirmation → scripts → improvement review → task then memory update.
- Browser checks must be visible to the user; never headless or a hidden tab.
- After each completed work session: commit only scoped verified changes and push the current branch to the configured `origin` (user standing instruction). Stop and report if branch/remote/auth is ambiguous.
- Never deploy, publish images, change repository visibility, create accounts or use secrets.

## Verification commands (this machine)

- Web: `npm --prefix apps/web run lint`, `typecheck`, `test:run`, `build`, `e2e:list`.
- Headed E2E: `npm --prefix apps/web run e2e -- -DotnetCommand ./.tools/dotnet/dotnet.exe` (launcher `scripts/run-e2e.mjs` uses `pwsh` if present, else Windows PowerShell 5.1). 6 tests: audio gesture/local fetch plus critical journey, onboarding and 3 visual-state checks.
- Full: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe`; agent docs: `scripts/check-agent-docs.ps1`.
- Preflight (L008): stop preview Vite/API servers first; a running API locks `services/api/bin`, a running Vite locks `node_modules` for `npm ci`. Ask before stopping a user-owned process.
- CI (P02): `.github/workflows/ci.yml` runs on push/PR to `main` (verify + e2e on Windows, docker smoke on Ubuntu); repository is public, runs visible at https://github.com/hm1061998/My-Game/actions. Route-correction run 36235584949 passed all jobs. Later reruns exposed slow-runner E2E behavior. User waived waiting for GitHub E2E; do not spend further time polling it, and do not describe the latest remote E2E as passed. CI remains enabled.
- Docker (P01): `docker compose up -d` → `http://127.0.0.1:8080` (needs Docker Desktop running); progress in volume `office-case-files_ocf-data`; `down -v` deletes it. Runbook §7.
- P03 (2026-09-26): packaged retest complete and isolated `ocf-smoke` resources cleaned. Docker client/server 29.3.1; default `office-case-files` containers remain stopped; `office-case-files_ocf-data` was preserved. P03 delivery report: `docs/quality/P03-delivery-readiness.md`.
- T28 (2026-09-26): first-session briefing/tutorial and optional local audio completed. Visible headed Chromium E2E 5/5, including three isolated clean first-run contexts reaching E01; these were automated walkthroughs by one evaluator, not a three-person usability study. Web lint/typecheck/41 tests/build, agent-doc checks, full verify (12 API tests) and `git diff --check` passed. Local speech voices and audible quality remain device-dependent; GitHub E2E remains waived/unverified. Task and exact failures are recorded in `docs/tasks/T28-onboarding-audio.md`.
- T29 (2026-09-26): Pixabay office ambience integrated. Visible headed Chromium E2E 6/6 confirms no audio-body fetch before activation, one successful same-origin fetch, mute/unmute and decoded signal (120.111 s, stereo, loop-edge step 0). 5 focused audio unit tests; full verify passed (46 web tests, 12 API tests); audio asset is ~3.84 MB. Browser/audio measurement is not a human subjective listening test; see `docs/tasks/T29-office-ambience.md`. Codex panel's standalone 5173 preview lacked API at 5062; isolated headed runner worked. GitHub E2E was not polled.
- Local preview: `.claude/launch.json` (`api` on 5062 via `.tools/dotnet`, `web` on 5173). Open `http://127.0.0.1:5173`; `localhost` is rejected by the API origin check.

## Verified product state (latest)

- Full case playable end to end: movement/collision/depth, six clues, three NPCs, Q01–Q03 with unlocks, meeting checkpoint, scanner dodge/retry/assist, immutable conclusion with separate reading/investigation scores, five review items, reload persistence, replay. Private answers stay server-side.
- T27: game-first shell (canvas 958×651 at 1280×800, no page scroll), shared tokens (`apps/web/src/theme/tokens.ts`), status badges not relying on color, 17 office + 8 character SVGs via `scripts/art/*.py`, validated asset loading with code-drawn fallback, four-direction character sprites, investigative UI surfaces. QA: `docs/quality/T27-visual-qa.md`.
- Storage round-trip (T12): `--export`/`--import` on the API host, private checksummed JSON (`*.export.json` ignored), import only into an empty migrated DB; runbook `docs/runbooks/local.md`.
- Last full gates (T31): `verify.ps1` pass (47 web tests, 12 API tests), visible headed E2E 7/7, ~60 fps, p95 17 ms.

## Known issues

- Phaser is built from `phaser-no-physics.js` with shared build flags (`apps/web/vite.config.ts`); vendor chunk 1,167.5 kB. After any bundler change, also check `vite preview` in the browser (L011).
- `verify.ps1` may report a Node engine warning when the shell resolves an older Node; the approved Node 24/npm 11 path passes.
- The Codex in-app browser previously failed with a Windows sandbox helper error; the Claude in-app browser and visible Chrome both work.
- T28: `exec_command` repeatedly failed in the workspace sandbox with `helper_unknown_error: setup refresh had errors`; scoped commands worked through elevated-shell fallback. Codex CUA Node kernel also exited. Candidate L014 records the incident; do not broaden project permissions. npm 11 verification emitted a non-blocking Node 22.22.2 engine warning despite the bundled Node 24.19.0 path; all scripts passed.

## Relevant references

- `AGENTS.md`, `CLAUDE.md`, `docs/agent/protocol.md`, `docs/agent/improvement.md`, `docs/agent/lessons.md`, `docs/agent/skills-index.md`
- `docs/tasks/index.md`, `docs/tasks/TEMPLATE.md`, `PROJECT_PLAN.md` (§9 BUFFER row, §9.3 code_complete), `docs/runbooks/local.md`
- `docs/tasks/P03-packaged-delivery.md`
- `apps/web/AGENTS.md`, `services/api/AGENTS.md`, `docs/assets/manifest.md`, `README.md`
