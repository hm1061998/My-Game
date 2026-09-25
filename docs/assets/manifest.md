# Asset and presentation manifest

Updated: 2026-09-25

T09 used only code-authored Phaser primitives and CSS. T27 V2 adds original AI-assisted SVG office textures (direction A). No external image, font, audio, third-party art pack or remote hotlink is bundled.

| Surface | Source | License/provenance | Runtime location |
| --- | --- | --- | --- |
| Office environment, furniture and zones (fallback) | Authored in this repository for Office Case Files | Project source; no third-party asset | `apps/web/src/game/scenes/OfficeScene.ts` (drawn when a texture fails validation) |
| T27 V2 office textures: 4 floor tiles, desk, cabinet, planter, meeting table, lamp, small plant, papers, water cooler, lobby rug, restricted tape, checkpoint pad, scanner drone, evidence card (17 SVG) | Original AI-assisted art: authored as SVG source by Claude Opus 5.5 (claude-opus-5-5) in this repository on 2026-09-25 from the accepted direction-A art bible; generator `scripts/art/office-svg.py`; reviewed in the visible browser, no image-model API or third-party source used | Project source; no third-party asset or license obligation; model output owned per the user's Anthropic terms | `apps/web/public/assets/office/*.svg`, keys/sizes in `apps/web/src/game/officeArt.ts` |
| Player, Maya, Leo, Nora, evidence markers, scanner and checkpoint | Authored in this repository from reusable presentation tokens | Project source; no third-party asset | `apps/web/src/game/presentation.ts`, `apps/web/src/game/scenes/OfficeScene.ts` |
| React HUD and overlays | Authored in this repository with CSS/semantic HTML | Project source; no third-party asset | `apps/web/src/App.tsx`, `apps/web/src/App.css`, `apps/web/src/index.css` |

Audio remains disabled. Adding external or generated assets later requires recording source, creator/tool, license, version and any attribution requirements before bundling.
