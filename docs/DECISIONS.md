# Button Game — Decisions and Open Questions

**Notation:** Accepted = established creator direction or documented decision. Implemented = present in source. Verified = actually checked at the stated level. Proposed = not authorized. Retrospective entries rely on [original DEVLOG](../DEVLOG.md), [CHANGELOG](../CHANGELOG.md), and the creator-provided 2026-10-26 to-do list, not an invented transcript.

## D-001 — Preserve original game identity while building a modern edition
- **Direction:** Treat `Game.swf` and the earlier HTML5 reconstruction as stages in the project, not replaceable clutter.
- **State:** Accepted for documentation; historical assets remain in GitHub.
- **Reason:** The development process, discarded prototypes, and evolution are portfolio material.
- **Alternative not taken:** Overwrite the original with an unrelated modernized game.

## D-002 — The button must break as the recognizable button
- **Direction:** The creator rejected the first swollen, glowing shatter prototype.
- **Decision:** Use clipped fragments of the actual turquoise four-hole button with staged cracks/separation/scatter; still allow taps during destruction.
- **State:** Implemented in `game.js` and `index.html`; documented tests in 2026-10-24 history; latest physical-device verification not established.
- **Source:** [root DEVLOG](../DEVLOG.md) (2026-10-24).

## D-003 — Visibly conserved numerical score transfer
- **Direction/iteration:** Rather than credit on tap and merely decorate with floaters, numbers carry `pendingValue` through collision and fusion, then collect into the green balance and finally the main total.
- **Decision:** Pending values must be settled before Game Over and must not pay twice.
- **State:** Implemented; simulated tests historically reported; broader regression and phone QA remain open.
- **Source:** [root DEVLOG](../DEVLOG.md) (2026-10-25).

## D-004 — The Android host owns the one leaderboard
- **Direction:** All Wi-Fi players see the host's results and the four final statistics; avoid divergent guest-local rankings.
- **Decision:** Guests POST finished runs to host `/api/scores` and GET the same list; browser may retain nickname/mute preference but not a separate high-score ledger.
- **State:** Implemented in JavaScript/Kotlin; physical cross-device acceptance unverified.
- **Rejected approach:** Guest-local persistence or enrichment used to compensate for stale native host builds.
- **Source:** [root DEVLOG](../DEVLOG.md) (2026-10-25).

## D-005 — Correct the stationary Game Over screen, not the data model
- **Observation:** Creator reported guest high score absent from host Game Over view until another local action.
- **Decision:** Poll host scores every three seconds during Game Over and refresh on return; keep host data authority unchanged.
- **State:** Implemented and CI-regression tested; real two-device confirmation open.
- **Source:** [root DEVLOG](../DEVLOG.md) (2026-10-26).

## D-006 — Release the same installed app, not a new TEST app
- **Direction:** Creator wants an original-certificate, normal-package APK update. Experimental TEST packaging was not requested; no need to preserve disposable test scores.
- **State:** The TEST build variant was introduced and subsequently removed in commits `31c2718` / `c46ee3f`. Signed and delivered latest update **open**.
- **Do not reintroduce** an alternate package identity without explicit approval.

## D-007 — Treat custom sound recordings as first-class source assets
- **Fact:** Three custom recordings are committed at `sfx/4273.ogg`, `sfx/QuickStrikepoints.ogg`, and `sfx/QuickStrikepoints1.ogg` as of `d5ce766`.
- **Current problem:** Web/Android packaged asset trees lack these exact files; the synchronizer copies only `assets/sfx/`.
- **Decision still to implement:** Reproducible copy/sync/check in release pipeline. Do not say this is already fixed.
- **State:** Source recordings present; packaging open.

## D-008 — Red/trap or trip button mechanic
- **Evidence:** A reference in the creator's recovered to-do list and creator recollection of a long unavailable conversation.
- **Unknown:** Original functionality, spawn conditions, penalties, goals, user acceptance and design reasoning.
- **State:** **Proposed / undocumented / not approved**. Do not create a speculative implementation or attribute one to the creator.

## D-009 — Other exploratory multiplayer options
- **Ideas:** Bluetooth hosting, genuine peer-to-peer network model, optional host score reset.
- **State:** Proposed only. None supersedes the current Wi-Fi Android host or blocks the next signed update.

## Recording a new decision

Use: **ID — date — creator request and reasons — AI suggestions and alternatives — accepted/rejected/deferred (with explicit evidence) — implementation file/commit — verification and uncertainty**. If no user approval occurred, record `pending`, not `accepted`.
