# Development log

## 2026-10-25 — Aggregated Points HUD counter

**User request:** The green collection number should no longer sit next to the Points panel outside its border. It should live inside the panel to the right of the total, at the same font size, and combine arriving score pickups even as it counts down and credits the total.

**Implementation:** Added a `#score-buffer` element alongside `#punkte` inside `.points-values`, sharing the existing 22 px HUD typography. The Points panel expands horizontally when necessary. Score pickups now fly to the actual `#score-buffer` bounding-box center converted to stage-space coordinates (honoring phone scaling). On arrival they deposit their full uncredited value into one `scoreBank` variable and disappear; no individual pickup stays parked at the HUD.

**Timing:** When a new bank starts, it holds 350 ms. It then steadily moves integer units from `scoreBank` to `score`, displaying the remaining green `+N` in the same frame that the white total increases. The adaptive transfer rate is 18–180 points/sec for readable low counts and a bounded high-value backlog. New pickups add to the same bank without pausing the countdown; no additional score is created.

**Conservation:** `hasPendingScore()` includes alive score-bearing floaters, arriving pickups, and the bank balance; round completion is deferred until they clear. A reset removes pending flights and empties the bank. The native Android files mirror these source files.

**Verification:** Node syntax, deterministic simulated-frame tests (two initial deposits, refill mid-countdown, multiple incoming flights, normal taps, jackpot 21, end-of-round) and APK ZIP integrity + matching APK v2 signature/digest against the previous release. Browser navigation was blocked by the execution environment; not tested on a physical Android phone.

## 2026-10-25 — Score fusion transfer pipeline

**Problem:** `addPoints()` previously called `setScore()` at every tap, while score floaters could later merge or fade. The display had no relationship to when points were actually credited.

**Implementation:** Each live floater carries a separate `pendingValue` ledger. Merging combines both visual numbers and pending values. After 90% of the lifetime a credit-bearing floater becomes green; at expiration it creates a `score-fly` element and is removed from the physics collection. That pickup flies toward the upper-left Points HUD (690 ms, eased shrinking), remains beside the score for 350 ms, then spends 560 ms transferring exact integer units into the total. During transfer, `remaining = value - applied` is rendered as green `+N`, while `setScore(score + delta, false)` increases the total by the exact same amount. Network presence is refreshed at transfer completion and by the existing periodic presence updates.

**Jackpots:** Old behavior awards an additional 2× the combined number beyond its already-scored taps. The payout is now held until the inert jackpot floater finishes, where its amount is the pending base plus that same 2× bonus. Decorative jackpot shards have `pendingValue: 0` so they cannot re-credit taps, although their pre-existing visual combination behavior and potential jackpot triggers remain intact.

**End of round:** Once the timer expires without time bonuses in flight, taps are disabled. Game Over waits until every credit-bearing floater and score-flight completes, so the displayed high score includes outstanding points.

**Scope:** This replaces the score-number pop-and-fade idea. Special 37→73 and 21→42 transformation sequences and the separate green timer-bonus indicator remain future work.

**Verification:** Node syntax check, deterministic simulated-DOM/runtime test (delayed normal taps, exact jackpot credit, end-of-round settlement), matching APK v2 signing certificate and content digest, intact ZIP entries. Headless browser navigation was blocked by the runtime; no physical Android test was performed.

## 2026-10-24 — Per-tap micro pulse

User feedback requested a brief size increase on **every** tap in addition to the existing white flash. The animation now reuses `tapFlashStartedAt`, scales to 1.10 immediately on press, and eases back to 1.00 with a squared decay over 145 ms. Every subsequent press restarts the curve, even during the existing scoring window. It also works during the clickable destruction phase, but destruction itself causes no scale-up.

The pulse is applied in `applyFeindTransform()` and checked on every animation frame, independently of the 15 FPS legacy frame updates. Quick Strike spinning and the five-stage shatter remain unchanged. The Android bundle mirrors the game logic.

Verified JavaScript syntax and press/second-press behavior in headless Chromium (resting scale 1, tap scale above 1, restored to 1 after 165 ms, opacity 1, filter flash active) and confirmed ZIP integrity plus matching v2 signing certificate against the previous APK. Not tested physically on Android.

## 2026-10-24 — Faithful button destruction

**Problem.** The original destruction prototype created arbitrary glowing polygons and scaled/faded the whole button. It did not preserve the visual continuity of the four-hole jacket button or the intended five-stage concept.

**Implementation.** Built an explicitly timed 580 ms state machine. For the first 140 ms the intact full-opacity SVG gains dark fracture lines. The same SVG is clipped into 14 complementary polygon fragments, with no initial growth. From 140 to 230 ms the fragments separate slightly. They then scatter radially and rotate while retaining their original turquoise fill, white rings, and black holes. After 460 ms they fade and are removed at 580 ms. The original target remains a 72×72 px interaction area throughout so taps still award points even as the visual pieces depart.

**Tap feedback.** A 125 ms bright/desaturated filter, matching the Quick Strike-style flash, restarts for every press; Quick Strike additionally spins. Shattering itself does not trigger hit feedback, white flash, shake, or scaling. The lifespan is maintained internally without reducing displayed opacity.

**Implementation locations.** `game.js` manages the shatter phases, fragment rendering, tap feedback, and scoring during the pop. `index.html` positions and clips the button fragments. `assets/button.svg` is the single reusable vector artwork. The Android bundle mirrors these files at `android/app/src/main/assets/www/`.

**Verification.** Node JavaScript syntax check, headless Chromium test of the original gameplay and 14 fragments, scoring during destruction, cleanup on respawn, APK archive integrity and APK signature v2 digest. A physical device test has not been performed.

**Signing.** Rebuilt APK retains the signing certificate established with the earlier independently signed button-update APK; Android updates require the same certificate.

## 2026-10-24 — Earlier work

Created HTML5 recreation and Android LAN host with local player presence. Replaced the target with a minimalist four-hole jacket button, increased visual size approximately 10%, and added the first flash/shatter proof of concept. The first shatter implementation was rejected because it swelled and flashed large on death instead of cracking the actual jacket button into recognizable pieces.
