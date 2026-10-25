# Changelog

## 2026-10-25 — Quick Strike reward and timing

- Quick Strike opens **after** the button's existing 320 ms spawn-in animation completes, and remains available for 73 ms (320–393 ms after spawn).
- Only the first tap on a new button can activate it; presses during spawn-in or after the narrow window do not qualify.
- A successful Quick Strike retains the existing spin, flash and pulse, and now makes the central point-source dot **glow green** for that button's remaining lifespan, including its destruction sequence.
- Every tap on that qualifying button creates **+2** floating points instead of +1, including repeated taps and taps during shattering. The existing delayed score collection and green score-bank fusion are unaffected.
- The emitter changes back to cyan on the next spawn, restart, or Game Over.
- Tested strict 319/320/393/394 ms boundaries, repeat/shatter doubling, deferred scoring and next-spawn reset in deterministic Node tests. Repacked signed Android APK preserves the previous signer and passes APK v2 content digest and ZIP integrity checks. Physical Android testing pending.

## 2026-10-25 — Pulsing central point-source dot

- Added a tiny, 6 px cyan-white glowing dot directly at the center of the 450 × 450 game field, where normal floating score numbers originate.
- The emitter gently pulses its glow and size on a 2-second cycle, with a faint radial halo.
- The marker stays underneath floating point values and does not catch mouse or touch input. The reduced-motion setting disables the pulse.
- Changes are CSS and HTML only; score fusion, button behavior, time bonuses and multiplayer are unchanged.
- Android package repacked from the prior foreground-score update and signed with the same certificate. APK ZIP integrity, unchanged gameplay JavaScript and signature-v2 content digest verified. Visual behavior on a physical Android device not yet verified.

## 2026-10-25 — Foreground score pickups and right-hand bank

- Move the combined green points bank outside and directly to the right of the Points HUD's chamfered box, at the same 22 px number size as the white total. The panel no longer expands to enclose the bank.
- Render incoming green score pickups in a dedicated frame-level overlay above HUD panels, avoiding clipping and the old behind-the-panel stacking order.
- Use transformed screen-to-frame coordinate conversion so score pickups fly accurately from stage points to the new bank position under responsive frame scaling.
- Preserve the accumulating green bank, ongoing green-to-white countdown, pending-score conservation, score timing, shatter and randomly rotated button spawning.
- Verified delayed collection, concurrent bank deposits, jackpot conservation, Game Over settlement, flight parent/coordinates in mocked runtime, JavaScript syntax, APK ZIP integrity and matching v2 signing certificate; full visual/phone validation remains pending.

## 2026-10-25 — Random button orientation at spawn

- Each newly spawned turquoise jacket button receives an independently chosen starting angle between -45° and +45°, including first page load, subsequent spawns, and the first target after pressing Play Again.
- The angle is stable for the target's full lifespan. Quick Strike spins remain relative to that baseline orientation.
- Crack overlay and all 14 shatter fragments inherit that same orientation because they are rendered inside the rotated button element, varying the final break without modifying the shatter timing or collision area.
- Existing tap pulse, score fusion, and network rules are unchanged.
- Verified initial/reset/60 respawns and unchanged shatter orientation in simulated runtime, JavaScript syntax, archive integrity, and v2 certificate consistency with the prior signed APK. Physical Android gameplay remains untested.

## 2026-10-25 — Shared in-panel score bank

- Green point pickups now travel **inside the Points HUD**, to the right of the total score, instead of lining up outside the panel.
- Their text uses the **same 22 px font size and baseline** as the white score total.
- Every arriving pickup is **added into one shared green +N bank**; arrivals aggregate even while the bank is transferring units into the white score.
- The bank pauses briefly when first filled, then counts down at an adaptive rate while the total counts up by exactly the removed amount; subsequent deposits never interrupt an active countdown.
- The target is measured from the actual HUD position so flight paths follow responsive layout changes.
- Resets and Game Over account for all incoming flights and remaining bank values. Preserved special-combo, shatter and audio behavior.
- Automated deterministic tests confirmed overlapping deposits, conservation across taps and jackpots, round-end settlement, and bank hiding at zero. APK v2 certificate/digest and ZIP integrity verified; device-level rendering remains untested.

## 2026-10-25 — Deferred points and green score fusion

- Replaced immediate per-tap score increases: each tap creates uncredited floating points that can merge until their lifespan ends.
- At the end, earned numbers turn green, shrink and travel to the score HUD, pause briefly, then count down in sync with the total score counting up.
- Removed the old pop-and-fade ending for scoring floaters; values are conserved across merged and simultaneous transfers.
- Preserved jackpot bonus arithmetic by deferring both pending base points and the jackpot bonus until the inert jackpot display finishes. Cosmetic 1-shards cannot credit the same tapped points again.
- The round locks taps at zero time and waits for any pending scoring transfers before showing Game Over or submitting a high score.
- Kept existing time-bonus flow, multiplayer presence, jacket-button tap pulse and shatter behavior unchanged.
- Verified JavaScript syntax, score conservation for normal taps and jackpot, timer-expiry settlement with a simulated JavaScript clock, APK ZIP integrity and APK v2 signature using the prior signing identity. Actual Android-device installation and visual animation performance remain untested.

## 2026-10-24 — Tap size pulse

- Each button press now briefly scales the turquoise jacket button to 110% of its normal 62 px artwork and eases it back to 100% over 145 ms.
- Keeps the existing white hit flash and Quick Strike spin; rapid repeated presses retrigger the pulse.
- The button stays fully opaque for its remaining lifespan. The staged crack/separation/shatter animation does not independently enlarge the button; scoring during the pop remains available.
- Signed the new Android APK with the same certificate as the previous shatter update. Confirmed JavaScript syntax, a headless browser press/repeat test, and the APK v2 signature and digest. Physical-device verification pending.

## 2026-10-24 — Button shatter sequence and tap feedback

- Replaced the previous enlargement-and-particle effect with five clearly ordered destruction stages: intact, cracked, separated into the actual button's vector pieces, scattered, and faded.
- The turquoise button, four black holes, and white rings remain part of each clipped fragment. No unrelated glowing particle burst.
- The button remains at its regular 62 px artwork diameter and 100% opacity throughout its clickable lifespan. Destruction does not enlarge the button or create a screen-filling white flash.
- Every tap produces a brief bright, desaturated Quick Strike-style flash. Quick Strikes retain their spin.
- Presses on the original target area continue awarding points during every stage of its roughly 580 ms destruction.
- Preserve existing timer, scores, multiplayer, audio, and Android hosting mechanics.
- Browser-tested normal tapping, full opacity, crack and scatter stages, scoring during destruction, and clean respawn; APK ZIP integrity and v2 signing digest verified. Physical Android-device testing not performed.

## 2026-10-24 — Earlier button revisions

- Replaced the original two-hole ball graphics with a turquoise four-hole jacket button with two white rings.
- Increased its artwork from 56 px to approximately 62 px (10%).
- Added a first destruction prototype and made every press flash. Superseded the earlier scaling/fading prototype with the staged effect above.

## 2026-10-24 — HTML5 remake and LAN hosting

- Added HTML5 gameplay, animated floating score combinations, sounds and bonuses.
- Added Android Wi-Fi hosting, QR-code browser joining, leaderboard, and per-player live score/time/reaction/APM display.
