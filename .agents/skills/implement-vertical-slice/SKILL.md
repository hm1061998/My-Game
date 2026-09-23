---
name: implement-vertical-slice
description: Implement a reviewable Office Case Files feature that crosses React, Phaser, API, domain, or storage boundaries.
---

# Implement a vertical slice

Read the active task, relevant specification/ADR, and scoped `AGENTS.md` files. Confirm the approved plan covers the slice.

Define one observable player outcome and trace its ownership before coding:

- Phaser owns frame-level gameplay and emits typed events.
- React owns accessible overlays, navigation, and server state.
- API endpoints coordinate application use cases.
- Domain owns scoring and progression invariants.
- Infrastructure implements storage/content ports without leaking provider types.

Change the smallest set of layers needed for that outcome. Keep private answers and trusted progression on the server. Keep per-frame state out of React and network calls.

Verify in this order: focused checks, real browser preview, acceptance scenario, fix/retest, final browser confirmation, then required scripts. Test both the success path and the highest-risk transition such as remount cleanup, duplicate submit, locked evidence, retry, or checkpoint resume.

Update the task and current memory with evidence. If the slice reveals a reusable failure mode, record a candidate lesson; do not create a broad rule from an unverified incident.
