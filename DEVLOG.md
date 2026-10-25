# Development log

## 2026-10-25 — Special 37 → 73 transformation

**Request:** Replace “Klick druff da” with “Smash it!” and implement the 37-to-73 special. When a floating number reaches 37, carry it to the upper center at the former instruction's position, enlarge, reverse the digits, and immediately send the green 73 into ordinary score collection.

**Implementation:** `afterFloaterValue()` still detects 37 on merging and grants its pre-existing time bonus, but hands it to `begin37Reverse()` rather than the generic jackpot. That function retires the physics floater and transfers its element to `#stage` with the `.reverse-37` class. `update37Reversals()` runs each animation frame and phases through eased movement to (225,110) over 490 ms, edge-on 3D digit reversal in 360 ms, enlarged hold for 160 ms, and green shrink for 180 ms. It then calls `startScoreFly(73,225,110)` **without creating a new 73 floater**. The pickup moves to the existing green score bank, from which 73 units count down into the total. Because the old 37 pending value is retired rather than credited, the resulting jackpot is precisely 73, not 37+74 or 73+another 73 jackpot.

**Conservation:** `hasPendingScore()` now includes the `reversing37` state, keeping rounds alive until their special and score transfer settle. `clearFloaters()` removes orphaned reversal elements on reset. Other jackpots remain unchanged. Initial HTML and reset text both say `Smash it!`.

**Verification:** Node VM runtime and syntax tests confirm the 20+17 merge to 37, text reversal, green transition, exactly 73 collected after the regular score-flight/bank behavior, Game Over wait, and cancellation on reset. Compared the Android APK against the previous version to verify only the bundled `game.js` and `index.html` changed. Signed with the existing PKCS#12 signing certificate. No physical-device animation verification yet.

## 2026-10-25 — Start reaction clock after spawn-in, not on page load

**User request:** Prevent a slow first tap after the page loads from distorting average Reaction, and report the time from the end of the 320 ms spawn animation until first contact.

**Change:** In `onClick()`, capture `alreadyStarted` before `startGame(now)`. Only add a reaction sample if the round was already underway, the button is receiving its first tap (`spawnTime != null`), and `now >= spawnAnimUntil`. The sample is `now - spawnAnimUntil`; earlier spawn-in taps are ignored for the average rather than recorded as 0 ms. Clear `spawnTime` on any first tap, so later taps do not create additional samples.

**Quick Strike decoupling:** The previous code reused non-null `reactionMs` to decide Quick Strike eligibility. Since first-load and early taps may now have no reaction sample, the Quick Strike check uses `isFirstTapOnButton` independently. The 73 ms window after spawn-in, green dot, 150% spinning feedback and double points are unchanged, including eligibility of the initial button.

**Reaction UI:** Still displays the running mean of valid first-tap samples with existing smoothing. It shows “—” until the first valid spawn-after-start sample.

**Validation:** Node JavaScript syntax; deterministic simulated game tests for 10-second idle before start, new spawn taps at 319 ms (ignored), 320 ms (0 ms), 393 ms (73 ms), 400 ms (80 ms), averaging 0/80/73 → 51 ms, and Play Again resetting the samples. Compared APK entries to previous APK: only `assets/www/game.js` changed. Verified ZIP integrity and matching v2 signing identity/digest. Not device-tested.

## 2026-10-25 — High-impact Quick Strike scale

The existing Quick Strike rotated the button through 360 degrees in 290 ms but reused the general 110% tap pulse, making the spin difficult to notice.

Introduced `QUICK_STRIKE_SCALE = 1.5` into `applyFeindTransform()`. During a Quick Strike, scale reaches 150% of the resting button size immediately and stays enlarged for the first 60% of the 290 ms spin. During the remaining 40%, a smoothstep curve returns it to 100% by the time rotation finishes. Ordinary taps continue using their own 145 ms, 110% pulse. The final scale is `max(pulseScale, quickScale)` rather than a multiplication, preventing double scaling when players tap repeatedly. The base spawn scale and existing 360-degree Quick Strike rotation are preserved. The shatter animation ignores Quick Strike scaling.

Only `game.js` and the corresponding Android-bundled `game.js` changed. No HTML, graphics, score logic, Wi-Fi host code, or server data files were modified.

Verification: Node syntax check, simulated-frame runtime checks at the start, middle, and end of the spin, regular 110% repeat taps, preserved 2x points, green emitter reset, and no destruction scaling. APK v2 signature, archive contents and certificate match were independently verified against the prior Quick Strike APK; no Android hardware test.

## 2026-10-25 — 73 ms post-spawn Quick Strike and active multiplier

**Timing:** Replaced the legacy `reactionMs <= 320` check with a distinct `SPAWN_ANIM_MS = 320` and `QUICK_STRIKE_WINDOW_MS = 73` check: `spawnAnimUntil <= now <= spawnAnimUntil + 73`. The animation still lasts 320 ms, but the Quick Strike opportunity begins when it ends and remains open for the next 73 ms. Reaction time reporting still measures first-tap latency from initial spawn.

**Active state:** The first qualifying press sets `quickStrikeActive`, reuses the existing Quick Strike spin/flash feedback, and adds `.is-quick-strike` to `#point-source`. CSS renders the pulsing emitter core and halo green rather than cyan. The flag stays active for the button's normal tapped lifespan and every stage of its clickable shatter; it resets only when the next button spawns, on Play Again, initialization, or Game Over.

**Scoring:** `tapPoints()` returns 2 while the active flag is set and otherwise 1. The first, subsequent, and destruction-period taps all use it. Multiplied values enter the ordinary floating score system, so merging, jackpot triggers, pending-value conservation, airborne pickups and shared-green-bank countdown behave normally. No extra immediate score writes.

**Validation:** Node syntax check; simulated-clock runtime tests at 0, 319, 320, 356, 393, 394 and 450 ms, including repeated taps, score being deferred, the green state persisting during destruction, and proper reset on next spawn. Verified APK ZIP entries, v2 signature/digest and unchanged signing certificate versus preceding user-installed build. Physical Android screen/interaction timing not verified.

## 2026-10-25 — Central point emitter indicator

**Goal:** Give the origin of normal floating point numbers a subtle, recognizable visual landmark without interfering with the game.

**Implementation:** Added `<div id="point-source" aria-hidden="true"></div>` to `#stage` immediately before `#float-layer`, styled with a 6 px cyan-white core, soft CSS `box-shadow`, and a 30 px radial-gradient pseudo-element halo. The element is absolutely positioned at 50%/50% inside the 450 px stage (225,225), matching the center used by `spawnFloater()` for normal floating points (with a small random spawn offset). The `point-source-breathe` CSS animation adjusts opacity and scale from 0.88 to 1.23 over 2 seconds, continuously repeating. A `prefers-reduced-motion` override disables the animation.

**Layering:** The dot uses `z-index: 0` and `pointer-events: none`; `#float-layer` remains at `z-index: 5` so numbers emerge above the glow. No gameplay, scoring, collision, or input handlers changed.

**Verification:** Confirmed exactly one DOM point-source marker, center-positioned styles, ordering beneath the score-float layer, and identical `game.js` bytes between the new and previous APK. Repackaged APK ZIP passed integrity checks; APK signing-scheme v2 content digest and same update certificate were verified. No physical Android rendering test performed.

## 2026-10-25 — Correct pickup overlay stacking and bank position

**Issue:** The green pickup elements were appended to `#float-layer` inside `#stage`. Although `.score-fly` had `z-index: 8`, `#stage` creates a lower stacking context (`z-index: 0`, clipped with `overflow: hidden` and `clip-path`). Consequently, incoming pickups passed **behind** the absolutely positioned Points HUD, making the top of the flight difficult to see.

**Fix:** Added a separate `#score-fly-layer` as a last child of `#frame` and sibling of the HUD panels and `#stage`, with `z-index: 9` and `pointer-events: none`. Only credit-bearing green pickup flights use this foreground overlay; normal physics floaters still collide within the stage. Origin and destination geometry are converted from DOM client rectangles into the overlay's local unscaled coordinates to account for responsive frame scaling.

**HUD:** Introduced `.points-hud-group` as a shared layout for the rectangular Points plate and green bank. The `#score-buffer` is now a flex sibling **outside the panel's clip path**, to the right of it, bottom-aligned to the white points number. The panel stays compact as the bank accumulates values. No scoring arithmetic or time constants were changed.

**Validation:** Node syntax, deterministic simulated DOM tests covering overlay parentage, pickup coordinate conversion, two simultaneous score transfers, bank refills during countdown, deferred taps, jackpot 21, end-of-round settlement. APK ZIP integrity and v2 signature digest checked against the previous update's certificate. Chromium headless navigation did not complete in this environment; physical Android layout still needs visual verification.

## 2026-10-25 — Per-spawn randomized jacket-button tilt

The button already accumulated a random `rotation += randomint(1,369)` after respawns, but the first button and the first button after restarting always began at zero. The accumulated full-circle orientation also gave no predictable range of subtle tilt.

Implemented `randomSpawnRotation()` with an independent integer selection between -45° and +45° on **all three spawn paths**: initial bootstrap, reset/Play Again, and post-shatter respawn. Each target stores its selected angle in the existing `rotation` state. `applyFeindTransform()` uses it as a constant baseline, allowing the existing Quick Strike spin to remain additive. The fracture overlay and the 14 clipped SVG fragments are children of `#feind`, so they follow its rotation naturally without altering piece geometry or destruction timing.

Validation: JavaScript syntax and deterministic simulated-DOM testing of first spawn, reset, 60 subsequent respawns, inherited shatter rotation, and full shard count. Android APK repackages the exact same existing application with only updated game.js; new signing uses the previously established update identity. APK signature v2 integrity checked. Not tested on a physical device.

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
