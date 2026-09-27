# M2 full-case expansion design — The Swapped Report

Status: **design draft for owner review**  
Date: 2026-09-27  
Lifecycle phase: design; implementation plan not started  
Product: Office Case Files, browser-based English-learning detective game

## User intent and current evidence

The owner wants to continue M2 but considers the current 3–5 minute M1 passage too small for real learner sessions. The game must provide a broader investigation and enough contextual English before real users are invited. AI agents should do most content drafting, review and implementation work to simplify the owner's process. The paid/monetization work remains paused until the owner explicitly requests resumption.

Current evidence: case `swapped-report` has v1 and v2 JSON with six evidence records, three questions, three NPCs, a glossary, conclusion and five review items. The approved M1 path uses E01 → E02 → scanner → E03 → Nora E06 and is intentionally short. The Phaser `OfficeScene` already uses a following camera in a 1600×1000 world, but its bounds, floor, room art and obstacles are hard-coded. Case interactions currently have flat world coordinates; the server keeps the solution and correct answers private.

## Approved design sections

The owner approved these sections through individual choices on 2026-09-27:

1. Expand **The Swapped Report** before creating a second case; keep the existing React/Phaser/API architecture.
2. Target a 25–35 minute, three-act case in three connected areas, with 8–10 evidence records, two short dodge beats, about 16 useful workplace-English chunks, a conclusion and end-of-case review. Vietnamese translations remain optional, adjacent to English, and hidden by default.
3. Use a single scrolling Phaser map with connected areas, rather than a separate Phaser scene for each area. Keep React responsible for accessible learning/UI, Phaser for frame-level play, API/domain for trusted progression/scoring, and server JSON for case content.
4. Use a short AI workflow: a writing agent drafts the case; independent agents review deduction logic and A2–B1/translation quality; implementation agents work in scoped slices; AI role simulations and a visible browser test find and fix issues. AI simulations are hypotheses, not human validation.
5. The M2 completion gate is three traversable areas, 8–10 evidence records, at least 16 contextualized language chunks, two fair dodge beats, a conclusion grounded in cited evidence, hidden-by-default translations, no blocking AI review findings, and a complete visible headed browser journey on the final revision.

## Player experience

The player follows one coherent workplace mystery from first instruction to evidence-backed resolution:

1. **Act I — The instruction:** learn the goal and inspect the approved report request, email/chat, and early reactions. The player notices ambiguity in “previous version” and can ask for clarification.
2. **Act II — The timeline:** move through a visually distinct meeting/work area, gather records and compare interviews. A short dodge beat protects the archive route; failure returns to a fair checkpoint without removing evidence or reducing English scores.
3. **Act III — The archive and explanation:** inspect version history and additional context, face a second short dodge beat, hear the relevant statement, choose a conclusion, cite supporting evidence, and review useful language from the case.

The exact dialogue, evidence IDs/unlock graph, areas, vocabulary selection, questions and solutions belong in the implementation plan/content brief after this spec is approved. Keep the established case facts: Nora replaced v3 with v2 after misunderstanding Maya's “previous version” instruction; the account/time log alone does not prove intent. Do not introduce an unsupported malicious motive.

## Learning design

- Retain A2–B1 as an editorial target, not a certification claim. Teach at least 16 practical workplace chunks in context across instructions, clarifying questions, versions/files, chronology and cautious evidence language.
- Reuse high-value language at least twice across evidence, NPC dialogue, objective text or review so the player can infer meaning rather than memorize a list.
- Keep English primary; show optional Vietnamese beside the exact English passage. Translation starts hidden and never changes score, hint count, progression, question access or evidence access.
- Avoid dense reading during danger. Dialogue, clue reading and questions pause/gate movement; audio-off and missing-audio paths retain readable transcripts and visual cues.
- The five-item review remains a concise recall/application wrap-up; the implementation plan may propose a content-compatible count change only if the current contract prevents meaningful coverage and documents the migration/test impact.

## World and system boundaries

- Keep one Phaser scene and a single camera-scroll map with three visually distinct, connected areas. Prefer reusing the existing 1600×1000 canvas world unless layout tests prove it cannot fit the approved journey. Do not add scene-transition machinery by default.
- Preserve the approved layer ownership: React owns DOM text, overlays, translation, focus and UI state; Phaser owns movement, collision, camera, animation and dodge timing; API/application/domain own trusted progress and scoring; Infrastructure loads server-side JSON case data.
- Keep the existing case ID and publish expanded content as an immutable new version. Do not rewrite pinned v1 or v2 sessions. No private solution, correct choices or scoring keys move to the frontend.
- Extend server case schema only when the design demonstrably needs authored area/checkpoint/action metadata that current JSON and map coordinates cannot represent. Any extension must be validated and version-safe; avoid a general level editor or authoring framework.
- Reuse the existing licensed ambience, procedural/local sound cues and in-repo SVG pipeline. No external contact, paid assets, commissioned work, commercial quotes, checkout/subscriptions, paid acquisition, or monetization work is included.

## AI production and review workflow

Keep owner input to milestone approvals and the final review, not per-dialogue approval:

1. A content-author agent proposes the act outline, evidence graph, short dialogue, English/Vietnamese pairs, vocabulary reuse and review items from this spec.
2. Independent agents review (a) timeline, clue sufficiency, alternate theories and answer leakage; (b) A2–B1 readability, translation fidelity, ambiguity and useful language repetition. The integration owner resolves findings and records any ruling that changes the approved facts.
3. Implementation agents work from a written file-scoped plan in independent slices. Each slice gets a focused review before integration; do not let agents concurrently edit shared files without explicit file ownership.
4. Five independent AI player-role simulations critique the final build. Report them only as hypotheses. The integration owner then runs the final headed browser journey visibly, inspects gameplay and scripts, fixes failures and retests.

No agent output is human-player evidence. Completion only makes M2 eligible for a separate owner decision about real learner testing; it does not authorize contacting participants. Paid work stays deferred.

## M2 scope and non-goals

**In scope:** expand one existing case into a complete 25–35 minute three-act experience; three connected areas on one scrolling map; more evidence/dialogue and English learning; two short fair dodge beats; conclusion/evidence citation and review; only the minimum UI, schema, storage or art changes required; AI drafting/reviews/simulations; visible browser and script verification.

**Out of scope:** second case, payment/checkout/subscription, paid acquisition, commercial pricing/quotes, new paid or commissioned assets, external participants, broad admin portal, account system, external analytics, engine/renderer change, publishing/deployment, and claims of validated learning or market demand.

## Risks and responses

- **Content volume becomes padding:** require a clue/reason purpose and a learning purpose for each new record; reuse language in context; use AI reviewers to identify redundant content.
- **Mystery becomes unfair or over-explained:** retain uncertainty in early records, distinguish actions from intent, test at least one plausible alternate theory, and disclose the conclusion only at the authored payoff.
- **AI-generated factual or translation errors:** independent reviews compare every statement to the case fact ledger; owner/integration lead adjudicates, and all private answer rules remain server-side.
- **Map growth increases collision/visual complexity:** keep one scene and connected map, give each region clear landmarks, keep interactions reachable, verify camera bounds/depth/colliders in visible browser play.
- **Long reading interrupts the game:** readings pause action; keep each evidence record within existing content validation limits unless an approved schema change is justified.
- **Performance or asset size regresses:** retain reduced-motion and fallback behavior, measure the final visible journey and asset transfer, compare to the recorded M1 baseline, and report actual limitations rather than inventing a first-load ceiling.

## Acceptance and next gate

M2 implementation is eligible for handoff when the approved numeric/experience gate in section “Approved design sections” passes and:

- existing v1 and v2 sessions still use their pinned content;
- every new English passage has a reviewed optional Vietnamese translation or an explicit decision that translation is not appropriate;
- conclusions cite the required server-validated evidence, with no answer leakage;
- movement, camera scrolling, collision/depth, both dodge beats, pause/focus, translations, checkpoints/retry, conclusion and review pass in a visible headed browser journey;
- web/API checks, content/private-answer checks, build and agent-doc checks pass for changed scope; full repository verification runs when needed by the implementation plan;
- final changes and limitations are recorded in the M2 task and current memory, and the scoped branch is committed/pushed under the repository's standing instruction.

**Next lifecycle phase after owner approval of this written spec:** write a file-level M2 implementation plan with bounded agent ownership, content facts/IDs, tests, browser scenarios and rollback/failure paths. Implementation begins only after the owner reviews and approves that written plan and selects execution method.
