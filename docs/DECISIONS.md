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

## D-010 — Replace click-based time extension with earned combination rewards
- **Historical baseline:** `ChatGPT Remake/README.md` describes one point **and one second** per click, and the earlier modern build still contained a button-cycle time increment.
- **Revision:** ordinary taps/button fading no longer add time; the modern 60-second round is extended through **7→2s, 14→3s, 42→5s, 73→4s**. The previously used uniform +3-second bonus and direct awards on 21/37 were superseded.
- **Status:** Implemented in game source; prior behavior is historic, not an open TODO.
- **Evidence:** [root DEVLOG](../DEVLOG.md), October 25 “Session stats, dynamic time awards.”

## D-011 — Rewrite the 21→42 transformation after the initial prototype
- **Earlier implemented attempt:** throw out 21 `1`s, duplicate them into **42 units**, gather and assemble 42.
- **Creator's later requested choreography:** emit **21 units**, rebound against walls and each change from `1` to `2` while moving, then gather into a large 42. They must remain non-scoring decoration until the one exact 42 pickup.
- **Decision:** The latter replaces the former. This is a specific superseded concept, **not** two independently active modes.
- **Status:** Implemented; simulated runtime checks recorded. On-device visuals unverified.
- **Evidence:** [root DEVLOG](../DEVLOG.md), successive October 25 entries on 21→42.

## D-012 — Make Quick Strike a post-spawn challenge, distinct from Reaction measurement
- **Early model:** Quick Strike was coupled to a reaction-time threshold around the 320 ms spawn animation; first idle page tap could distort Reaction.
- **Revision:** 320 ms is the **spawn-in period**; a separate **73 ms** window immediately afterward enables Quick Strike. A qualifying first tap activates 2× values on all taps for that target, including the shatter. Reaction samples start after spawn-in and exclude page-load idle/early taps.
- **State:** Implemented; simulated boundary tests recorded. Physical input timing not yet certified.
- **Evidence:** [root DEVLOG](../DEVLOG.md), October 25 Quick Strike and Reaction entries.

## D-013 — Favor intact button identity and readable numerical motion over maximal spectacle
- **Rejected / corrected:** the first swollen/glowing pseudo-shatter, a floater hit-radius that ignored digit width, excessive number scaling and unthrottled same-frame chain merges.
- **Result:** recognizable clipped SVG shards, rotated full-text bounding boxes, reduced scale, short merge recovery and score conservation. A later revision delayed fracture onset while shortening breakup.
- **State:** Implemented changes; historic alternatives superseded.
- **Evidence:** [root DEVLOG](../DEVLOG.md), October 24–25 shatter, collisions and merge pacing.

## D-014 — Make each milestone and active hit audibly distinguishable
- **Early approach:** a floater lineage rang a bell just once when reaching seven or more.
- **Revision:** ring on each exact eligible value (7/14/21/37/42/73), then assign the special 42 and 73 *reveal* to `4273.ogg` rather than stacking a second ordinary bell. During active Quick Strike, the **activating** press and later presses select one of two custom impact sounds; ordinary hits use existing impacts.
- **State:** Routing implemented; historic APKs included supplied audio; reproducible asset packaging and physical listening remain separate open work.
- **Evidence:** [root DEVLOG](../DEVLOG.md), October 25 bell/sound entries.

## D-015 — Keep a live ranking peripheral rather than obstructive
- **Creator request:** Show the leading host high scores **underneath** the game with roughly **50%** opacity and a descending fade; do not replace the full Game Over leaderboard.
- **AI interpretation:** `#live-leaderboard` sits below the framed playfield, has no pointer events, holds up to five names/point totals, and hides during Game Over when the full ranking takes over.
- **State:** Implemented in web/Android HTML/JS; device visual check open.
- **Evidence:** [root DEVLOG](../DEVLOG.md), October 25 live score ambience entry.

## D-016 — Historical red/trap/trip mechanics remain an evidence gap
- **Known:** The creator recalls specific original discussion and a large to-do list in an archived thread. A later recovered checklist names a red/trap button.
- **Not retrieved:** Exact rules, penalties, conditions, intended timing, design alternatives, approval, or placement in the original list. A separate project's movable red recording button is unrelated and must **not** be imported as evidence.
- **Status:** Known **mention**, missing specification, **not an implementation task**. The creator's recollection should be preserved without retroactively inventing dialogue.
- **Recovery condition:** Reassess only if actual archived text, an original design file, or direct creator reconstruction is supplied.

## Recording a new decision

Use: **ID — date — creator request and reasons — AI suggestions and alternatives — accepted/rejected/deferred (with explicit evidence) — implementation file/commit — verification and uncertainty**. If no user approval occurred, record `pending`, not `accepted`.
