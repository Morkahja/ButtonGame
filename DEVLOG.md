# Development log

## 2026-10-26 — Remote guest score missing from the host's stationary Game Over view

**User observation:** A guest finished a round and submitted their high score while the creator was looking at Game Over on the Android host. The host's existing high-score list remained unchanged. The intended model is still one authoritative list on the host; a guest should appear without requiring the host player to submit a score, replay, or reopen Game Over.

**Diagnosis:** The native server's `GET /api/scores` always reads `ScoreStore`; `POST /api/scores` writes the posted entry and returns updated host scores. The web UI called `loadLeaderboard()` immediately when entering Game Over and when submitting its *own* score. Its recurring 12-second fetch was explicitly guarded by `started && !gameOver`. That made an already-open Game Over view a frozen snapshot. Based on source review, this explains the reported display behavior, though the guest's actual persisted host record has not yet been confirmed on a physical device.

**Implementation:** Added a separate 3-second `gameOver`-only refresh to the common game script and a `visibilitychange` listener to refresh when returning to an open Game Over page. Kept the 12-second active-round preview and the host-only data contract unchanged. Committed equivalent `game.js` content to the root and the Android asset mirror. Added the executable Node regression `tests/live-leaderboard-refresh.cjs` and wired it into CI so this class of regression cannot silently recur.

**Verification:** Ran the Node regression locally on the updated game script: passed startup, idle, active play, host Game Over, hidden/visible return, and replay states; `node --check` passed. GitHub Actions builds the complete Android host, but proof of a native compile is distinct from a signed distributable and physical host/guest testing. Remaining QA: actually submit from a guest and observe the host Game Over list refresh within three seconds, then verify score remains after app restart. No evidence yet of server-side score-loss bug.

## 2026-10-25 — First successful native Kotlin build and preserved-signature Android release

**Problem resolved:** The previous series of APKs were manually repacked from an older binary: they contained current JavaScript but stale compiled Kotlin (`scores.json`, only name/points). The creator repeatedly requested permanent four-stat host storage, and the assistant's earlier to-do reports incorrectly implied the unfinished compilation was an unimplemented feature. To resolve this, configured a first-party CI pipeline rather than continuing to patch web files into an old binary.

**CI implementation and iteration:** New GitHub Actions workflow `.github/workflows/android-build.yml` checks out main, configures Temurin 17 and the Android SDK/platform 35, and invokes the repository's existing Gradle 8.9 wrapper. Initial [run 40243115955](https://github.com/babunidev/ButtonGame/actions/runs/40243115955) failed at SDK setup due the setup action's default obsolete `tools` package. Corrected the action input to `packages: 'platform-tools'`; subsequent [run 40243235351](https://github.com/babunidev/ButtonGame/actions/runs/40243235351) built the complete native debug APK successfully. Expanded the workflow to compile both `assembleDebug` and `assembleRelease`; [run 40243610565](https://github.com/babunidev/ButtonGame/actions/runs/40243610565) completed successfully, uploading two artifacts.

**Release signing:** Downloaded the CI-produced unsigned release APK to the private working container. Validated it has the new Kotlin `ScoreStore` (`scores-v2.json` marker) and the latest Android web assets. GitHub source is still missing three user-supplied OGG binary files, so attached their original bytes from the supplied recordings to the compiled release's `assets/www/assets/sfx/`. Signed the *new compiled native release* using the creator's original PKCS#12 key held outside GitHub; neither key nor password was sent to GitHub or printed. Reused APK v2 RSA/SHA-256 signature machinery and verified the final byte stream cryptographically and against the previous release certificate fingerprint. The exact resulting file is `ButtonGame-Native-Host-Highscores-Full-Build.apk` (5,355,669 bytes, SHA-256 `09bfc6a34dc3f2f5dc3997b7ee5a49079b49a14f4553e9991c9de0ded1096097`). A second byte-identical attachment is provided for download retry.

**Actual code now present in the package:** Native `GameServer` parses all five submitted fields (name, score, reactionMs, apm, durationMs), and native `ScoreStore` stores and returns all via `scores-v2.json` on **the host alone**. The old `scores.json` is deleted on host startup, intentionally beginning a fresh beta ledger. Game JavaScript freezes final stats at Game Over, submits them to the host, and displays the host's persisted leaderboard; it never caches guest scores. The live gradient-faded preview under the playfield polls the host. The special new sounds were included unmodified, with sound output volume controlled in game JavaScript.

**Verification limits and next steps:** CI native compilation passed. Local signed ZIP integrity, APK v2 cryptographic digest/signature, original certificate identity, native-v2 marker and OGG payload presence passed. This session could not physically run the app on the creator's phone, verify Android UI or network persistence across restart, or test audio loudness by ear; those remain device QA. GitHub `assets/sfx` and `android/app/src/main/assets/www/assets/sfx` are still missing the three user-made OGG blobs; committing these is the remaining source-completeness task, although the delivered APK already contains them.

## 2026-10-25 — Live high-score ambience and Android host-storage verification

**Intent and design decision:** Player wants the host's high-score list visible *underneath* the game during play, faded to approximately half opacity and dissolving gradually so it enhances the presentation rather than occupying a competing UI panel. The full Game Over leaderboard should remain unchanged. Interpreted “underneath” literally as **below the 470px framed playfield**, not as an overlay above the interactive button or frame HUD.

**Presentation:** Added a 114px-high `#live-leaderboard` section immediately after `#scaler` in the flex page. It has `opacity:0.5`, `mask-image` and `-webkit-mask-image` with a fade from opaque (within that 50%) to fully transparent at the bottom, no box border/background, no scrolling, and `pointer-events:none`. Width is constrained to the frame's 420px interior, with a restrained cyan heading and spaced columns for rank/player and points. Its height is **always reserved** and initial state uses `visibility:hidden` (rather than `display:none`), preventing vertical reflow when an asynchronous host response arrives. Only a few leading records are intended to be legible; up to five DOM records contribute to the fade.

**Data ownership and lifecycle:** Reuses the host's `GET /api/scores` endpoint and existing `normalizeScores`. New `renderScorePreview` and `syncScorePreview` functions depend on `started`, `gameOver`, and the latest host records. The preview fetches on init, automatically becomes visible on the first tap if data is already loaded, refreshes approximately every 12s while playing, and is hidden when `endGame` is entered or `resetGame` returns to the initial state. Failure and empty results hide the preview rather than displaying a misleading cached/guest-local ranking. The **full** leaderboard continues to display all records and currently available Reaction/APM/duration fields on Game Over; the in-game preview intentionally contains only names and points.

**Native discrepancy diagnosed:** Inspected the signed APK's `classes4.dex`: it references `scores.json` and not `scores-v2.json`, whereas the latest committed Kotlin `ScoreStore.kt` defines `ScoreEntry(name,score,reactionMs,apm,durationMs)` and `scores-v2.json`. Existing signed APKs merely replaced web assets and did **not** recompile native classes, explaining the disparity between JavaScript leaderboard display and persistent host storage. Since this environment lacks the Android SDK, Gradle distribution and D8, the compiled Android host remains the old name/points implementation. Do not claim the four metrics have been permanently stored by this APK, and do not implement guest-side storage as a substitute.

**Clear high scores:** Current Android package stores records only on the host, in its app-private `scores.json`. Android Settings → Apps → Button Game → Storage & cache → Clear storage/data resets those records (and other host app data). Browser guests merely read the host scores, and clearing their browser cache is not a leaderboard reset. A host-only score-reset UI could be added in a future native build if a targeted reset is required, but is not part of this UI change.

**Validation:** New simulated DOM harness exercises normalizing/sorting host scores, showing five compact rows, showing the preview only after the first tap with host data, and hiding it when empty or at Game Over. Existing full ranking remains independent. `node --check` passed. Cumulative Android web assets repackaged with the previous OGGs, original app resources and classes.dex files intact; verified against identical APK v2 signer SHA256 fingerprint. Headless Chromium screenshot attempt stalled in the execution environment, so the visual appearance has not been verified on device.

## 2026-10-25 — Correct score ownership and polish breakup/audio/scrolling

**Clarification:** Host controls the only authoritative high-score ledger. Wi-Fi players POST their finished result—including name, points, reactionMs, apm, durationMs—to that same Android server; they merely read the host's `GET /api/scores` leaderboard. The previously introduced per-player `buttongame_scores_v2` localStorage cache/enrichment was incorrect and has been removed. Submission failure must show a retryable error, not claim a guest-local save. Standalone HTML without an Android host cannot persist a networked leaderboard; nickname and mute preferences are still device-local.

**Native API status:** Kotlin `ScoreEntry`, `ScoreStore` (fresh `scores-v2.json`), and `GameServer.handlePostScore` are already updated on GitHub to retain the four final metrics, and no backward compatibility is required. Today's cumulative APK cannot include that Kotlin change because no Android SDK/build chain is installed; it still embeds the older native server which accepts new JSON but retains only `name` and `score`. Browser code accurately reports `Points on host · host update needed for stats` for that older API, and DOES NOT retain stats on any guest device. Full native APK compilation is the remaining blocker for host statistics.

**Destruction timing:** Maintained the per-target post-fade interval at approximately 580 ms but divided it into 160 ms of still-intact, still-tappable state and 420 ms of breakup. Added `pendingPopAt` (reset/respawn-safe); `feindEnterFrame` schedules `beginPopPhase` after the delay. Retuned shatter keyframes proportionally: CRACK 100 ms; BREAK 165 ms; SCATTER_FADE 325 ms; POP_DURATION 420 ms. Existing Quick Strike and score multipliers are active during the short extra intact hold.

**Sound and scrollbar:** Reduced playback gains by another ~3 dB (4273 0.35; QuickStrikepoints choices 0.26–0.30), leaving original recording bytes untouched. Hide `#leaderboard` scrollbar on desktop and mobile via standard, old IE/Edge and WebKit rules while retaining `overflow-y:auto`, touch pan and inertia.

**Validation/build:** Eight tests pass: host-only POST with four final stats/no local leaderboard, 160ms delayed/420ms shatter and preserved 580ms cycle, timer/bonus, combo bells, special 21→42/37→73, new sounds, and full-width collision. JavaScript syntax valid. Repacked the previous cumulative signed APK with game.js and index.html only; three uploaded OGG files preserved. APK ZIP integrity/content and APK v2 signature checked against unchanged certificate fingerprint `3f7a1386adb23903ebd09c54a4f7105d197b7a6611be4b5dd53c7fe5e0902392`. Device-side UI/audio QA and native recompilation pending.

## 2026-10-25 — Session stats, dynamic time awards, replay position and audio attenuation

**Gameplay balance:** Removed `deadline += fadeDurationMs(flupp)` from the fresh-button click handler while retaining the button lifecycle variable `flupp`. Initial 60 seconds still begins on first click. `TIME_BONUS_SECONDS = {7:2,14:3,42:5,73:4}` replaces all +3s awards; early 21 and 37 do not fly any time bonus. At the first fully visible special 42 or 73 result, `grantTimeBonusFly(centerX,centerY,resultValue)` enqueues the +5/+4 seconds once. Natural 42/73 are eligible too. The golden time bank continues to collect variable-value pickups and decrement into the timer at four seconds per real second. When pending time revives the countdown, `roundExpired` can be cleared.

**Audio:** Measured source mean levels using ffmpeg: new recordings ~−20 to −21 dB versus previous impacts/bells ~−24 to −26 dB. Lowered new audio *playback gain* (not destructive re-encoding) by approximately 4–5 dB. All original OGG bytes are preserved in the signed APK.

**Final stats:** `endGame()` now freezes `finalStats`, recording durationMs = performance.now() − startTime (including final pending-point settlement), reactionMs = rounded reactionSumMs/reactionSamples (0 if no eligible samples), and apm = rounded hitCount*60000/durationMs. `submitScore()` POSTs these along with name/points, and the high-score list displays all four. No session clock has been added to the game HUD.

**Storage/versioning:** New `buttongame_scores_v2` localStorage key. Native Kotlin `ScoreEntry` and `GameServer` API request/response now include the three new integer fields; `ScoreStore` uses a fresh `scores-v2.json`, deleting the old beta `scores.json`. The Kotlin source has been committed but **cannot be compiled in the currently available local environment (Android SDK and build tools absent)**, so today's APK retains the old Android native classes. Until a full native rebuild, each submitting browser caches its own session details and enriches its locally viewed host leaderboard; other devices' old-host records have dashes for unknown metrics. Full cross-device metrics and host record reset need a native rebuild. Do not treat the APK as an implementation of the new native server.

**Replay:** The existing `#play-again` button had z-index 4 versus the redesigned lower stats panel z-index 6, hiding it. Moved button to z-index 12 and aligned it to the 15.5rem lower HUD at bottom 10px, so it overlays both React and APM after Game Over for host and guest browsers. Reset hides the button again.

**Tests/build:** Node syntax; mock DOM checks for the 7/14/21→42/37→73 time model, freeze at Game Over, stored stat formatting and Play Again visibility; legacy native score-only response enrichment; bouncy 21→42, 37→73, Quick Strike new audio, and exact milestone-bell regressions. Repacked cumulative signed APK with updated game.js and index.html, preserved all original and three user-supplied OGG assets, and verified APK v2 content digest/signing certificate and ZIP integrity. Native Kotlin compilation, cross-device score-stat propagation, GitHub binary OGG commit, and device-level visual/audio QA remain open.

## 2026-10-25 — Package user-supplied 4273 and QuickStrikepoints recordings

**Inputs:** Received `4273.ogg` (12,035 bytes; 0.937 s), `QuickStrikepoints.ogg` (6,967 bytes; 0.252 s), and `QuickStrikepoints1.ogg` (9,023 bytes; 0.482 s). All files successfully decoded as stereo, 44.1 kHz Ogg Vorbis audio. The files already use the case-sensitive paths named by `SPECIAL_REVEAL_FILE` and `QUICK_STRIKE_IMPACT_FILES`.

**Integration:** Repacked the cumulative `ButtonGame-Jackpot-Bells-Update.apk` using the up-to-date local game JavaScript and included all three OGG assets as `assets/www/assets/sfx/{4273,QuickStrikepoints,QuickStrikepoints1}.ogg`. The code sends the fully assembled 42 and flipped 73 to the single 4273 clip, and randomly selects the two QuickStrikepoints clips for the first successful Quick Strike button tap and subsequent active taps. Normal taps and other bell milestones retain their prior recordings. If audio buffering is unavailable, the existing fallback remains.

**Checks:** `node --check`; mocked sound/Quick Strike regression, milestone-bell regression, golden time-bank transfer and number-collision tests. APK ZIP integrity, audio bytes within the APK, Android v2 signature/content digest, and original signer certificate matching previous build all passed. No device-level sound audition.

**Remaining repository task:** Text JS sound hooks are already on GitHub, but the OGG binary files are not. The produced APK is audio-complete; a future GitHub binary-asset commit is required for a clean checkout to have identical audio.

## 2026-10-25 — Audio trigger routing prepared; waiting for recordings

**Requested files:** 4273 for the moment a special 73 or assembled 42 appears at the shared center-top; QuickStrikepoints and QuickStrikepoints1 for button taps while a Quick Strike is active.

**Audio architecture:** Introduced `SPECIAL_REVEAL_FILE = assets/sfx/4273.ogg` and `QUICK_STRIKE_IMPACT_FILES` containing `assets/sfx/QuickStrikepoints.ogg` and `assets/sfx/QuickStrikepoints1.ogg`, added all three to `preloadSfx`, and introduced `playSpecialRevealSound`, `playQuickStrikeImpact`, and `playTapImpact`. Existing audio assets remain available. Until the new recordings have been committed to the web and bundled Android asset trees, the new hooks fall back to the current bell and impact sounds; missing audio never breaks gameplay.

**Trigger placement:** The special reveals previously played `ringJackpotBell(73)` halfway through the 37→73 flip and `ringJackpotBell(42)` when the bouncing 21→42 pieces finish gathering. Those spots now use `playSpecialRevealSound()`, resulting in one special sample rather than two simultaneous bells. The earlier 21 and 37 milestone bells remain unchanged. Moved ordinary impact routing in `onClick` to occur *after* the first-tap Quick Strike window check, ensuring the activating tap itself selects a QuickStrikepoints sample; fading and shattering branches route through the same active-state helper. No change to 2x points, colors, HUD, timing or score lifecycle.

**Validation:** Local JS syntax, simulated active/inactive tap sounds, special reveal once, and fallback behavior passed. Existing milestone-bell and 21→42 special-regression tests passed. New files were not present in this turn's uploads or the known GitHub asset paths. **No signed APK published**, because such a release would not yet contain the requested audio. When received, transcode to supported audio if needed, commit originals/converted OGGs to `assets/sfx/` and `android/app/src/main/assets/www/assets/sfx/`, verify in runtime, then sign the complete APK using the existing certificate.

## 2026-10-25 — Distinct jackpot bell per reached value

**Problem:** `maybeComboBell(f)` rang the first time a merged floating number reached any value of seven or higher, then set `bellPlayed` and inherited it through subsequent merges. A continuous chain like 7 → 14 → 21 therefore stopped ringing, even though each is an important milestone. The 21/37/42/73 special handlers separately played their own bell when triggered.

**Change:** Replaced threshold/lineage behavior with an exact `COMBO_BELL_VALUES` map for 7, 14, 21, 37, 42, and 73 and a stateless `ringJackpotBell(value)` helper. `afterFloaterValue()` now calls the helper exactly once for each newly reached sum, before special transformation routing. Removed the obsolete `bellPlayed` floater flag and merge inheritance. Removed `playRandomBell()` calls from `begin21To42()`, `begin37Reverse()` and generic `explodeJackpot()`, preventing same-event double-rings.

**Transformed results:** The 21 special rings at the moment it triggers and sounds a second, separately randomized bell when the fully assembled 42 first appears at the upper center. The 37 special rings when reached and a second time when its upper-center flip displays 73 (halfway through rotation). Each special effect tracks `resultBellPlayed` to guarantee at most one sound for its result even across repeated frames or frame skips. Scores still award exactly 42/73 once using the existing green score-bank transfer.

**Tests:** A mocked DOM/clock harness intercepts the sound helper and simulates 6+1→7, then 7+7→14, then 14+7→21, then assembly into 42. It confirms distinct sounds at all four milestones, 36+1→37 then flip to 73, natural 41+1→42 and 72+1→73, and no sound from merged values 8/22/75. Existing `test_floater_bounds.cjs`, `test_bouncy_21_to_42.cjs`, `test_time_bonus_bank.cjs`, `test_37.cjs`, and JavaScript syntax checks passed. Android APK repacked from the prior cumulative collision-fix build with only `assets/www/game.js` changed, using the same PKCS#12 signing key; cryptographic APK v2 content digest, signature and ZIP checks passed. Not tested on physical Android.

## 2026-10-25 — Correct floating-number bounding boxes and pace merges

**Observed bug:** Collision radius was `max(11, floaterFontSize(value)*scale*0.38)`, independent of the number's text length. For `+37`, `+123` and longer labels, the first glyph could collide while later digits extended past a wall or overlapped HUD boundaries. Visual scale was also aggressive (up to 2.4×), and the merge loop could immediately chain several collisions in one frame, pushing values rapidly into the hundreds.

**Geometry:** Introduced `floaterBounds(f)`: measure `f.el.offsetWidth/offsetHeight` (full `+N` text) with a conservative font/character-count fallback, apply current floater scale, then calculate the axis-aligned half-extents of the *rotated* label using absolute sine/cosine. Add 3px clearance for the glow. Both `resolveAabb` (HUD contacts) and `collideFloatersWorld` (stage walls) use these x/y half-extents instead of a font-size circle. Re-clamp after HUD resolution so correction cannot leave any digit offstage. Use a center fallback only when text ever exceeds both available horizontal or vertical space.

**Visual growth:** Keep `floaterFontSize(1)=26` but lower the growth curve to `23 + min(15, 3*log2(value+1))`, versus `18 + min(28, 8*log2(value+1))`. Spawn scale range is slightly reduced from 0.95–1.35 to 0.95–1.25. Merged scale now uses `min(1.55, 1 + 0.075*log2(value+1))`; lingering increases use 1.04× capped at 1.58, not 1.08× capped at 2.2.

**Numerical growth:** Introduced `mergeReadyAt` on normal floaters. New spawns wait 120ms; after merging, the survivor waits `320 + min(460, 100*log2(total+1))` ms before merging again. The physics merge loop checks readiness for both participants and breaks following the first successful merge, slowing chain combinations without capping values or changing the scoring ledger.

**Validation:** Node syntax; deterministic collision tests covering 1-, 2-, 3- and 4-digit labels rotated at 0°/±45°/75° and colliding with all four walls and corners. Explicit DOM-width test verifies measured full-label dimensions. Four overlapping +1s merge into two +2s after 144ms and only later into a +4. Verified 21→42 and 37→73 trigger paths directly; previous bouncy-combo and golden-time-bonus tests pass. Android APK rebuild replaced the game JavaScript, retained existing HTML and resources, and passed ZIP integrity, APK v2 signature/content digest and unchanged signer check. Visual verification on physical Android device is still pending.

## 2026-10-25 — Compact, mirrored HUD and combined lower statistics

**Layout request:** Narrow the four corner panels, move Points and Time nearer the outer game frame, mirror the Time golden bonus readout to the left of the right-anchored Time plate, and combine Reaction/APM into one centered lower plate with a vertical separator.

**Implementation:** The top panels use a nominal 6.25rem instead of 7.75rem width and 10px rather than 14px horizontal inner padding. Points and Time groups anchor 10px from their respective top/side frame edges instead of 22px; the extra padding corresponds to the frame's 10px inset, so panels visually abut the 450px field boundary. Points keeps its right-hand green `#score-buffer`; the Time group orders `#time-buffer` **before** the time panel, reserves bank width to stabilize the position, and right-aligns the gold text next to the panel. Gold pick-ups still target the buffer using its measured DOM rectangle (no hardcoded flight target changes).

**Lower statistics:** A single chamfered `.hud-panel.stats-panel` is horizontally centered at the field's bottom edge, with two flex cells: left `#react` and right `#apm`. A 1px cyan `.stats-divider` separates them from top to bottom of the inner face. Existing element IDs and JS setters are retained, so reaction smoothing, APM updates, and presence payloads are unchanged.

**Collision handling:** The old four `HUD_BOXES` are now three stage-relative AABBs, matching the two top HUD groups and the combined lower-center plate. Existing physics exclusion, collision and button spawn avoidance use the revised regions.

**Validation:** Confirmed HTML order (points→green on left, gold→time on right), one shared bottom panel and divider, original IDs, CSS widths/anchors, root+Android APK asset parity, JavaScript syntax and existing scripted bouncy 21→42 / gold time-bank regressions. Signed APK uses the same PKCS#12 certificate as the preceding user-installed build, ZIP entries checked. Chromium screenshot attempt timed out; mobile display not physically tested.

## 2026-10-25 — Refine 21-to-42: outward throw, wall physics, ones become twos

**Requested flow:** Twenty-one single-digit numbers pop from the 21 at their normal spawn size, blast outward, rebound repeatedly against the stage boundaries, then each becomes a 2 while moving. All 21 twos eventually gather at the “Smash it!” / 37→73 upper-center position and form a larger golden 42, hold, and turn green before regular score pickup and bank fusion.

**Implementation:** Replaced the previous scripted scatter / duplication of 21 ones into 42 ones with physics-assisted visual parts. `begin21To42` creates exactly 21 independent, non-scoring `.combo-unit` elements at the 21's former position, with `floaterFontSize(1)` (26px), evenly distributed outward angles, and initial speed between 780 and 1180 stage pixels per second. `bounceComboUnit` integrates movement in ≤16ms steps and reflects x/y velocities on collision with all four bounds (16..434), retaining 90% speed. Each unit is stagger-converted from '1' to '2' about 630–850ms after the burst, uses the natural 2-floater font size, and briefly pops to 115% to make the change legible. These transformations occur while the particles continue freely bouncing.

At 1140ms, moving positions are snapshotted once and particles smoothly converge for 690ms onto (225,110) using smoothstep easing. Pieces shrink/fade near the end of this flight while the large golden `42` fades into place at `SPECIAL_LABEL_SCALE=2.64`. It holds 360ms at full size, turns green and shrinks over 250ms, and calls `startScoreFly(42,225,110)` exactly once. No physics scoring floaters are generated from the visual fragments, so no double credit, accidental merges, or recursive special triggers are possible. The 21's independent +3s golden time bonus remains intact.

**Lifecycle:** `hasPendingScore` already includes in-progress `fusing42` effects; resets clear all moving pieces and the result label. The score bank credits the final 42 in the usual delayed fashion. The existing 37→73 flow and golden time balance are unchanged.

**Verification:** Node syntax; simulated frame-by-frame tests of 21 visible normal-size units, early wall rebounds, all units converting to 2s, no extra nodes, assembly size, hold and green transition, exactly 42 points entering the green collector, late Game Over waiting and reset cleanup; plus previous golden bonus bank and 37→73 regression tests. APK ZIP integrity and APK-v2 RSA signature/content digest verified cryptographically, including exact same signer as the preceding golden-time-bank APK. Android visual test pending.

## 2026-10-25 — Shared gold time bank and jackpot eligibility colors

**Intent:** Match the existing green score collector with a right-of-Time golden bonus collector. Make eligible special numbers visibly gold until their eligibility changes or their score is collected.

**Golden states:** Added `.bonus-eligible` to non-inert floaters with values 7, 14, 21, 42, 37, or 73, and updated it whenever numbers merge. A stale `.score-ready` class is cleared on merging, so the new value's color wins. Added golden styling for the enlarged upper-center 37→73 and 21→42 displays until they become green. Time pickup and bank use the existing `#ffd24a` golden hue and soft glow. Green score pickups remain green.

**HUD layout:** Added `time-hud-group` with a chamfered Time panel and a fixed-reserved-space golden `#time-buffer` to its right, anchored at the frame's top-right. The buffer reads `+3s`, `+6s`, etc. and fades out when empty. Updated the Time HUD physics exclusion region to match the grouped layout. Both green score and golden time pickups use the existing frame-level `#score-fly-layer`, ensuring foreground rendering and correct responsive-scale coordinate transforms.

**Time ledger:** `grantTimeBonusFly` creates a golden pickup from the combination origin, easing into the buffer over `TIME_FLY_MS=690`. At its destination it deposits 3 integer seconds into one `timeBankSeconds` balance. The first deposit waits `TIME_HOLD_MS=350`, after which `updateTimeBank` debits whole seconds at `TIME_FEED_SECONDS_PER_SECOND=4` and increments the actual game `deadline` by exactly 1000 ms per second. Refill arrivals never restart the countdown or duplicate the ledger. The bonus flash remains on the Time display while seconds are being credited. Game Over requires both `timeFlies.length===0` and `timeBankSeconds===0`; reset clears both and restores the empty HUD.

**Validation:** Node syntax and scripted mock-DOM simulation passed: elapsed 350ms hold, balance +6 and replenishment +3 mid-debit, exact 9-second total deadline increase, pickup foreground parent/initial geometry, gold eligibility and merge cleanup, zero-second round with pending flight/bank, eventual Game Over, Play Again clearing, and 21→42/37→73 tests. Repacked the immediately preceding APK with only `assets/www/game.js` and `assets/www/index.html` changed, signed with the existing PKCS#12 certificate, ZIP integrity checked. Physical Android visual test not performed; headless Chromium screenshot attempt timed out.

## 2026-10-25 — 21-to-42 special, enlargement of 37-to-73

**Goal:** Give the value 21 a distinct three-phase transformation: 21 visible singles explode out, each splits into a second single for 42 total, and all converge on the upper-center “Smash it!” location to form a large 42. The finished 42 turns green and is transferred to the normal collector. Increase the 37→73's upper-center result by 20%.

**Implementation:** `afterFloaterValue(f)` hands merged 21 to `begin21To42(f)`, before generic jackpot logic. This retires the normal floater and allocates 21 independent, visual-only `.combo-unit` elements in `#stage`; `update21To42(now)` scatters them over 480 ms, duplicates 21 additional elements over 300 ms, and gathers all 42 into the shared upper-center landing point (225,110) over 580 ms. The individual units shrink and fade as one `42` label is revealed at `SPECIAL_LABEL_SCALE=2.64`. It holds for 180 ms, turns green and shrinks for 190 ms, then sends one `startScoreFly(42,225,110)` pickup into the score-bank pipeline. Neither visual shards nor the assembled display are ordinary floaters, preventing recursive jackpots or double credits. An eligible 21 still triggers its normal +3s time bonus.

**Common special layout:** The existing 37→73 transformation now uses the common `SPECIAL_LABEL_SCALE=2.64` for both its moving/turning phase and its hold; it still sends one exact 73-point green pickup. Green shrink transitions to the same final size for both effects.

**Lifecycle and verification:** `hasPendingScore()` accounts for both special queues, keeping Game Over pending until animated rewards are fully collected. `clearFloaters()` now clears 21→42 parts/label on reset, as it already does for 37→73. Node syntax and simulated-frame tests confirm initial 21 units, duplication to 42, gather at 2.64×, green phase, single exact +42 collection, 37→73 retaining +73 and growing 20%, end-of-round settlement, and safe Play Again cancellation. Repacked and APK-v2 signed from the previously installed Smash-It build with the same signing certificate, preserving all other game assets. Android device-level visuals not verified.

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
