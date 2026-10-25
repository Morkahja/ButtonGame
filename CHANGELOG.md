# Changelog

## 2026-10-25 — Prepared special reveal and Quick Strike audio routing (audio files pending)

- Added a dedicated **`4273` reveal sound hook** for the assembled 42 at the upper-center `Smash it!` position and for the 73 when the 37→73 flip reveals the new digits. It **replaces** the normal bell at those two moments rather than doubling the playback. The original bell still plays when floating totals first reach 21 and 37.
- Prepared two randomly chosen Quick Strike tap recordings: **`QuickStrikepoints`** and **`QuickStrikepoints1`**, used from the *activating first tap* and all later taps while Quick Strike remains active, including during shattering. Ordinary taps keep the original four random impacts.
- Audio preload now includes `assets/sfx/4273.ogg`, `assets/sfx/QuickStrikepoints.ogg`, and `assets/sfx/QuickStrikepoints1.ogg`. Existing sound mute, volume architecture, and other jackpot bells remain unchanged.
- **Audio assets not yet supplied** (not in the conversation files or GitHub). Until those exact files are added, the game falls back to the former random bell for special reveals and ordinary impact for Quick Strike. This is **code wiring only, not an audio-complete APK release**.
- Node sound-routing, existing milestone-bell, special 21→42, golden-bonus, and JS syntax tests passed on the locally mirrored source. Audio content and Android playback cannot be validated until the recordings are received.

## 2026-10-25 — Bell on every jackpot milestone

- Combination bells now sound **each time a merged floating number reaches exactly 7, 14, 21, 37, 42, or 73**. Previously a merged lineage remembered its first bell, silencing later milestones (e.g. 7 → 14), and any value >=7 could ring regardless of eligibility.
- Each eligible number plays a **randomly selected one of the existing three bell recordings**, with the same small pitch and volume variation.
- The special **21 → 42** rings for 21 when reached and again when its fully assembled 42 appears; **37 → 73** rings for 37 when reached and again when the digits flip to 73.
- Normal 42 and 73 jackpots ring once when those values are reached. Removed redundant bells from the generic jackpot and special animation entry points, so a single milestone cannot play two bells simultaneously.
- No changes to impact sounds, master mute preference, scores, golden time bonuses, combination visuals, physics, or multiplayer.
- Node simulated-frame sound regression tests passed for 7 → 14 → 21 → 42, 37 → 73, natural 42 and 73, and silent non-eligible values 8, 22, and 75. Existing physics, special-combination, and time-bank tests passed. APK ZIP integrity and v2 cryptographic signature/content digest verified against prior build using the same certificate. Physical device sound testing pending.

## 2026-10-25 — Full-label floater collisions and slower numerical growth

- Fixed floating-number wall and HUD collisions so they account for the **entire displayed +N label**, including all digits, its actual DOM-measured width/height, CSS scale, and rotation. Previously collisions used a small radius derived from font size, allowing second/third digits to clip outside the field.
- Use the rotated text's full axis-aligned bounding rectangle for wall and HUD contacts. After HUD collision resolution, re-clamp the entire label within the 450px stage, maintaining a small edge margin.
- Slowed floating-number **visual size growth**: `+1` remains 26px, later font sizes rise more gently to a 38px cap instead of 46px; merged scale grows gradually to at most 1.55× instead of 2.4×. Eligible linger growth is reduced.
- Slowed floating-number **value growth**: newly spawned floaters wait 120ms before merging, and every completed merge imposes a short recovery period that increases with the total (roughly 480–780ms). Each floater can participate in at most one merge per frame, avoiding runaway same-frame chains into high values.
- Preserved actual point totals, bonus eligibility, 21→42 and 37→73 specials, green score collection, golden time transfer, and current compact HUD.
- Verified 1–4-digit rotated labels at all field edges, actual measured glyph widths, gradual merger pacing, eventual successful merging, and unchanged 21/37 triggers in a simulated DOM; existing 21→42 and golden bonus bank regression tests passed. Rebuilt APK, verified ZIP content and APK v2 signature/digest with the prior update's certificate. Physical Android visual testing pending.

## 2026-10-25 — Mirrored compact HUD and unified Reaction/APM panel

- Slimmed the Points and Time panels from a 7.75rem baseline to 6.25rem, reduced their horizontal face padding, and moved them from a 22px inset to **10px from their frame edges**, flush with the inner stage boundary.
- The **Time panel is anchored at the right edge** and its golden +seconds bank moved to its **left**, mirroring Points on the left and its green +points bank on the right. Both green and gold balances remain outside the chamfered panels and preserve their existing transfer behavior.
- Replaced the separate lower-left Reaction and lower-right APM boxes with **one 15.5rem bottom-center plate**. Reaction is left-aligned, APM right-aligned, with a thin full-height cyan dividing rule.
- Adjusted physics' stage-space HUD collision bounds for the new two-corner-plus-bottom-center arrangement, including room for the bonus banks, so ordinary floating numbers avoid the relocated panels.
- No point scoring, timers, bonuses, game-state, multiplayer, or Quick Strike behavior changed.
- Verified new DOM IDs and ordering, single divider and bottom plate, frame-edge offsets, Node syntax, 21→42 animation, golden time-bonus bank, APK archive integrity and matching prior APK signing certificate. Headless browser screenshot did not complete in this environment; Android visual testing pending.

## 2026-10-25 — Physical 21 → 42 bounce-and-transform animation

- Reworked the special **21 → 42** animation: exactly **21 normally sized “1” digits** burst from the merged 21 at high velocity, bounce visibly against the 450px stage's four walls, and keep moving freely for approximately **1.14 seconds**.
- Starting about 630 ms after the burst (staggered over 220 ms), each of the 21 “1” digits turns into an equally legible **“2”**, while continuing to bounce. The result is twenty-one 2s, representing 42 total points—**not forty-two 1s or 42 scoring floaters**.
- All twenty-one 2s then travel inwards over approximately 690 ms and assemble into the same large golden 42 at stage center-top (225,110) as the 37→73 special's “Smash it!” position. The 42 holds for 360 ms, then turns green and shrinks during a 250 ms transition before entering the normal green score pickup/bank pipeline.
- Maintained the enlarged 2.64× special-combo size and exact **42-point single payout**, existing +3s golden time bonus, 37→73 animation, and end-of-round settlement/reset safety.
- Verified fast wall rebounds, full-size singles, transformation of all 21 units without duplicate elements, final assembly, single +42 credit, Game Over settlement, Play Again cleanup, golden-time-bank regressions, and 37→73 regressions with deterministic Node simulations. APK signature-v2 content digest/identity and ZIP checks passed; physical Android visual testing pending.

## 2026-10-25 — Golden time-bonus HUD and eligible combo glow

- Eligible floating combination totals **7, 14, 21, 42, 37 and 73** receive the same golden glow as the +3-second bonus pickup while they remain eligible. The glow is removed if the floating number merges into a noneligible total or enters its green score-collection phase.
- Both upper-center special displays (37 → 73 and 21 → 42) glow gold until their final green score pickup phase.
- Added a persistent-position **golden `+Ns` time bank to the right of the Time HUD**, mirroring the shared green score bank. The right-side readout is hidden when empty.
- Golden +3s pickups now fly through the foreground HUD overlay to the golden time bank, rather than being hidden behind the Time HUD or immediately changing the timer on arrival.
- New +3s arrivals merge with the current bank, even while its balance is counting down. The first deposit pauses 350 ms, then banked seconds feed into the timer at 4 seconds per real second, preserving the exact time total without double-awarding. As the golden balance decreases, the timer increases.
- Game Over waits for all inbound time flights **and any remaining banked seconds**, preventing a round from ending before earned time is credited. Play Again clears the time bank and its in-flight pickups.
- Preserved 21 → 42 and 37 → 73 exact green scoring, Quick Strike effects, and score-fusion behavior.
- Tested with a mocked DOM and simulated frame clock: 3+3+3 incoming seconds, mid-drain deposits, 9 seconds of exact deadline credit, foreground pickup placement, gold-on-merge and cleanup, late-game time settlement, Play Again reset, and existing 21/37 specials. APK ZIP and unchanged signing identity validated. Physical Android visual behavior not yet verified.

## 2026-10-25 — 21 → 42 scatter, duplicate, and fuse

- Replaced the generic jackpot behavior for floating **21** with a new special transformation: explode into **21 individual “1” units**, duplicate into **42 visible units**, then gather them at the upper-center “Smash it!” location into one enlarged **42**.
- The assembled **42** holds briefly, glows green, shrinks, and enters the existing green score pickup and shared score-bank countdown flow. It awards exactly **42 points once**, rather than the prior 21+42 generic jackpot total.
- The **37 → 73** special’s upper-center number is now **20% larger**, from 2.2× to 2.64×, and the new assembled 42 uses the same 2.64× scale at the same stage coordinates (225,110).
- All 21/42 visual pieces stay outside normal physics scoring, so they cannot merge into additional unintended jackpots; natural 42 and 73 totals retain existing generic jackpot behavior.
- End-of-round settlement waits for in-progress 21→42 fusions and their green pickups. Play Again cancels all active special fragments.
- Verified deterministic Node tests for 21→42 phases, exact 42 payout, normal green bank transfer, retained 37→73 payout, round-end settlement, and reset. Signed updated Android APK with the original signing certificate and checked ZIP integrity; physical Android display testing is pending.

## 2026-10-25 — “Smash it!” greeting and 37 → 73 reversal

- Changed the initial and Play Again guidance from “Klick druff da!!!” to **“Smash it!”**.
- A merged floating value of **37** no longer triggers the generic doubled jackpot. Instead its live number rises to the upper-center `Smash it!` position (stage x=225, y=110), enlarges, flips to display **73**, holds, then turns green.
- After the transformation, **73 points enter the existing foreground green score-fly pipeline immediately**, without a second floating lifespan; the shared score balance then transfers those points to the final total.
- The exact **73-point payout replaces** the original 37 payout (which previously credited 111 total). Reversed 73 does not re-trigger the separate 73 jackpot; the 21/42 and natural 73 combos keep their existing effects.
- Game Over waits for any in-progress 37 reversal and its outgoing score flight; Play Again cancels outstanding reversal animations.
- Verified using Node syntax and deterministic runtime tests: merged 20+17, movement, reversal, green phase, exact 73 credited once, no double-credit, round-end settlement and reset. The Android APK was signed with the same certificate as previous releases; device visual testing is still pending.

## 2026-10-25 — Correct reaction timing

- Excluded the initial page-load button's first tap from Reaction statistics, including when starting a new round with Play Again. The Reaction panel remains “—” until a subsequent button contributes a valid sample.
- Measure the interval from completion of the **320 ms spawn animation** to the **first tap** of each subsequent button, rather than measuring from the start of spawning.
- First taps during spawn-in do not count as zero-millisecond reaction samples. Repeated hits to the same button are still ignored for the average.
- Keep the existing **73 ms Quick Strike window**, 150% spin, green dot and per-tap double-point reward intact, including possible Quick Strikes on the initial button.
- Verified with simulated-clock tests covering first load, reset, 319/320/393/400 ms timing and reaction averages; rebuilt from the prior signed APK using the same signing certificate and verified APK v2 signature, digest and file integrity. Device-level testing remains pending.

## 2026-10-25 — 150% Quick Strike spin

- Increased the successful Quick Strike animation to **150% of the button's normal size** for the first 60% of its existing 290 ms spin, then smoothly returned to 100% by the end.
- Retained the ordinary **110% tap pulse**; consecutive taps do not stack scaling beyond the Quick Strike peak.
- Quick Strike eligibility (73 ms after 320 ms spawn animation), green emitter and double points per tap remain unchanged.
- No enlargement is triggered automatically by the shatter effect.
- Validated JavaScript syntax, simulated animation-scale transitions, repeat taps and shatter behavior, and APK ZIP integrity plus v2 signing digest with the same certificate as the preceding release. Physical Android visual testing remains pending.

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
