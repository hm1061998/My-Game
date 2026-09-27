# M0 art and audio direction brief

Status: candidate directions for owner review, 2026-09-27. The approved tone is bright office mystery with expressive people and a little humor. Keep Phaser sprite-based 2.5D for the first pilot. These are original written moodboards, with no external image/audio bundled or licensed by this document.

## Current baseline and design constraint

The visible opening shows a readable room, objective marker, mission drawer and character positions, but the tiny SVG figures and largely static composition carry little acting. T31 already improved character silhouettes/portraits and T29 added licensed ambience, so M1 should use those as a baseline rather than buy replacements without a test. The UI/UX Pro Max local search returned a generic SaaS/Swiss layout for this query; its contrast, focus and reduced-motion guidance applies, while the suggested landing-page pattern does not fit in-canvas detective play.

## Three directions inside the approved tone

| Direction | Image and acting | Room, clues and UI | Sound identity | Main risk |
| --- | --- | --- | --- | --- |
| **A. Illustrated mystery** (recommended pilot) | Warm painted 2.5D sprites, readable hands/brows and strong silhouettes; short anticipation–action–recovery poses | Honey daylight, teal shadows, deliberate desk clutter, clue glint only on interactable props; case-file UI with restrained paper texture | Light office bed, soft percussive clue cue, playful character stingers, clear danger tell | Many bespoke frames; style consistency across sources |
| **B. Graphic detective comic** | Bold ink outlines, flat color blocks, expressive portrait cut-ins, comic timing | High-contrast geometric rooms, halftone emphasis on discoveries, compact caption cards | Dry Foley and rhythmic jazz-like motifs, limited voice | Can feel like an illustrated lesson if movement and effects stay stiff |
| **C. Miniature diorama** | Pre-rendered sprite characters with volumetric light and tactile props | Layered orthographic office, warm practical lights, depth and camera parallax | Detailed room Foley, subtle suspense pulse | Higher render/atlas and load costs; small figures can lose facial readability |

Choose A for one scene before commissioning a full set. Review B and C as reference alternatives with the owner. A 3D runtime trial is separate and only justified if good sprites, animation and staging cannot meet the M1 gate for a documented renderer reason.

## Pilot asset contract to quote and sample

One existing room and a 3–5 minute path: protagonist, two visible NPCs, a key clue prop, a dodge hazard and one short spoken English exchange. Request a **single sample first**: one character idle/talk/dodge sequence and one lit room corner at actual game size. Review silhouette at gameplay zoom, face/gesture at dialogue zoom, alpha edges, color consistency, and animation timing before producing the rest.

Provisional deliverables for estimates: one layered room kit (floor, walls, 6–10 props, light masks); three character sheets with idle, 4-direction walk/turn, talk/emotion, dodge anticipation/action/recovery (exact frame count after sample); three expressive busts; 4–6 VFX/UI cues; 5–8 short SFX; one ambience loop treatment; one short music/stinger pair; one English voice exchange with transcript and Vietnamese translation. These are quote units, not orders. Ask for two correction rounds per approved sample and final atlas/source/export files. Check rights for commercial game use, adaptation, attribution, AI input/output terms, resale restrictions and voice consent; record acquired assets in the manifest only when actually received.

## Cost and schedule decision structure

Use three separate estimates in developer days or vendor quotes: art/animation, audio/voice, and integration/QA. Obtain at least two comparable quotes or a tracked internal pilot before fixing a cash ceiling; no market rate or vendor availability is assumed here. Smaller fallback: one NPC, one spoken exchange and fewer room props while keeping the complete clue → theory → dodge → payoff path. Do not cut readable acting, optional translation or the sound-off path just to add more effects.

Next owner choices after this M0 review: preferred direction/sample, maximum cash spend for M1, and whether the lead developer will make the sample or commission it. No vendor has been contacted.
