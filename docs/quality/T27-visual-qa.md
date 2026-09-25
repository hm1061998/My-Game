# T27 visual/UI upgrade — V5 integration and visual QA

Date: 2026-09-25. Environment: Windows 11 Home 10.0.26200, Node 24.15.0, npm 11.12.1, .NET SDK 10.0.401 (`.tools/dotnet`), Playwright 1.63.0 headed Chromium, Claude in-app browser for manual inspection.

## Result summary

| Area | Evidence | Result |
| --- | --- | --- |
| Game-first layout | `visual-states.spec.ts`: canvas ≥ 70% of viewport height and no document overflow at 1280×800 and 1100×720; manual 1280×800 canvas 958×651 (T10 baseline 896×496, document 979 px) | pass |
| Mission drawer | Collapse keeps HUD objective, canvas widens > 150 px, reopen restores session facts | pass |
| Asset readiness | 21 texture requests (17 office + 4 sheets) all 200 `image/svg+xml`; no fallback notice; one canvas | pass |
| Missing asset | HTML fallback served for `desk.svg` and `player-sheet.svg`: notice visible, placeholder figures, player still moves, no page error | pass |
| Offline + reduced motion | API refused: ⚠ offline badges and alert; `--motion-base` resolves to 0ms; canvas still mounted | pass |
| 390 px content shell | Desktop-keyboard notice visible, no horizontal overflow; notebook single column at 375 px | pass |
| Grayscale / deuteranopia simulation | Manual: scanner (⚠ label, dashed ring, sweep, striped tape), checkpoint (✓ pad), evidence (card + ring) and four character silhouettes remain distinct | pass after fix below |
| Full T10 journey | `critical-journey.spec.ts` on final revision: spawn, evidence, all NPCs, checkpoint, scanner detect/retry/clear, conclusion, result, review, reload, replay | pass |
| Frame cadence | ~60 fps, p95 17 ms, longest 17 ms (T10: same) | pass |
| Bundle / transfer | Phaser chunk 1,396.6 kB (T10 1,389.87 kB, +6.7 kB); index 329.8 kB; CSS 18.0 kB; texture transfer 402 KB (sheets ~93 KB each, office 12.8 KB) | pass; existing >500 kB chunk warning unchanged |
| Privacy | `dist` contains no correct choice ids, solution text, `__officeCaseFilesE2E`, connection strings or tokens; only `password` hits are Phaser loader config and React input-type lists; SVGs reference only the SVG namespace URL | pass |
| Assets/licensing | All 25 SVGs are original, authored in-repo (see `docs/assets/manifest.md`); no third-party or remote asset | pass |

## Defect found in V5

- The meeting table art occluded part of the scanner danger ring because the whole scanner was depth-sorted at its patrol row. The range ring and sweep now render in their own layer just above the table; the drone keeps foot depth. Rechecked in grayscale and deuteranopia simulation.

## Scripts on the final revision

- `scripts/check-agent-docs.ps1`: pass (26 task files).
- `scripts/verify.ps1 -DotnetCommand ./.tools/dotnet/dotnet.exe`: pass (web lint/typecheck/30 tests/build, .NET 9/9). First attempt failed with npm `EPERM` because the preview Vite server held a native binding; passed after stopping the preview (L003 pattern).
- `npm --prefix apps/web run e2e:list`: 4 tests in 2 files. Headed `scripts/e2e.ps1` (Windows PowerShell 5.1): 4 passed.

## Known limitations

- Dodge smear frames were not captured in a still screenshot (300 ms window); the dodge path is exercised by the E2E journey.
- Browser zoom 200% was not separately automated; the 1100×720 and 390 px checks cover the reflow paths it relies on.
- Character art is vector and hand-authored by the agent; a future raster/image-model pass would need an approved source and manifest entries.
