# Asset and presentation manifest

Updated: 2026-09-25

The T09 MVP presentation uses only code-authored Phaser vector primitives and CSS. No external image, font, audio, generated raster asset or third-party art pack is bundled.

| Surface | Source | License/provenance | Runtime location |
| --- | --- | --- | --- |
| Office environment, furniture and zones | Authored in this repository for Office Case Files | Project source; no third-party asset | `apps/web/src/game/scenes/OfficeScene.ts` |
| Player, Maya, Leo, Nora, evidence markers, scanner and checkpoint | Authored in this repository from reusable presentation tokens | Project source; no third-party asset | `apps/web/src/game/presentation.ts`, `apps/web/src/game/scenes/OfficeScene.ts` |
| React HUD and overlays | Authored in this repository with CSS/semantic HTML | Project source; no third-party asset | `apps/web/src/App.tsx`, `apps/web/src/App.css`, `apps/web/src/index.css` |

Audio remains disabled. Adding external or generated assets later requires recording source, creator/tool, license, version and any attribution requirements before bundling.
