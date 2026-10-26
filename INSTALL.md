# Button Game — Android Installation and Build

Developer / creative direction: **Babuni.dev**. Current normal package: `com.babunigaming.buttongame`.

## Host a session

1. Install a correctly **release-signed** APK of the normal Button Game package.
2. On the host Android phone choose **Serve on Wi-Fi**.
3. Guests join the displayed `http://<host-ip>:8766/` URL or scan the QR code while on the same reachable network.
4. Play from host and guest. The Android server owns the high-score database; guests submit final scores to it.

Some guest/café Wi-Fi networks isolate clients; a personal hotspot may help. Client-to-host access and backgrounding must be verified on the actual devices.

## Release APK versus CI artifacts

The current GitHub Actions workflow builds an installable **debug-signed** APK and an **unsigned release** APK. Neither is an upgrade to an existing app signed with the creator's original release certificate. The historical independently signed APK documented in `DEVLOG.md` preceded the most recent guest Game Over refresh change; do not claim it is the newest update.

The earlier unrequested **`TEST` package variant has been removed** (commits `31c2718` / `c46ee3f`); current debug and release variants have the same base app ID, but different signatures. Attempting to install a debug APK over a release-signed copy will fail certificate matching. The creator does **not** require preserving expendable beta test scores; uninstalling may discard them, but is not itself a substitute for verifying proper release signing.

Private original signing material must stay out of GitHub and logs. Confirm the signed release's certificate matches previous installed releases; increment `versionCode` for the release process (current source reports code 1 / name `1.0.0-beta`).

## Build current native source

CI workflow: [Android native build](https://github.com/babunidev/ButtonGame/actions/workflows/android-build.yml).

For local Java 17 + Android SDK builds:

```bash
./scripts/sync-www.sh
cd android
./gradlew assembleDebug assembleRelease
```

**Known incomplete build step (26 October 2026):** The source recordings `sfx/4273.ogg`, `sfx/QuickStrikepoints.ogg` and `sfx/QuickStrikepoints1.ogg` are committed, but missing under `assets/sfx/` and `android/app/src/main/assets/www/assets/sfx/`. The current script only copies from `assets/sfx/`; the CI workflow does not run it before Gradle and does not watch `sfx/**`. Until corrected, a clean CI build has fallback sounds but is **not custom-audio complete**. See [ROADMAP.md](ROADMAP.md).

GitHub currently has no published release entry for the newest corrected APK. CI's successful Kotlin/JavaScript compile does not prove signed-release installation or two-phone networking.

## High-score ownership and format

The Android host saves up to 50 sorted entries to its private `scores-v2.json`. Each entry has `name`, `score`, `reactionMs`, `apm`, `durationMs`. Guests send `POST /api/scores` and read `GET /api/scores`; no independent guest scoreboard. Earlier `scores.json` beta records are deliberately not migrated; the v2 native store deletes that file on initialization.

To reset all host app data, Android Settings → Apps → Button Game → Storage → Clear data. This also deletes unrelated app-private preferences. Clearing guest browser cache does not reset host rankings.

## Verification before distribution

Inspect APK entry list for both `assets/www/game.js` and `assets/www/index.html` **and all ten intended audio OGG files**; confirm native classes, hash and signature. Install on a real device and run [docs/QA.md](docs/QA.md), especially guest score submission and automatic host Game Over refresh within about three seconds. A release artifact and successful device check must be recorded in [CHANGELOG.md](CHANGELOG.md) and [docs/DEVLOG.md](docs/DEVLOG.md).
