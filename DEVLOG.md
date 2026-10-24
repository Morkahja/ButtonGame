# Development log

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
