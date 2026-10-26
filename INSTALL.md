# Button Game — Android Installation and Build

Developer / creative direction: **Babuni.dev**. Current normal package: `com.babunigaming.buttongame`.

## Host a session

1. Install a correctly **release-signed** APK of the normal Button Game package.
2. On the host Android phone choose **Serve on Wi-Fi**.
3. Guests join the displayed `http://<host-ip>:8766/` URL or scan the QR code while on the same reachable network.
4. Play from host and guest. The Android server owns the high-score database; guests submit final scores to it.

Babuni.dev has tested host-and-guest Wi-Fi play, live player statistics, high-score submission and automatic Game Over refresh on two actual devices and reports them working.

## Release APK versus CI artifacts

The current GitHub Actions workflow builds an installable **debug-signed** APK and an **unsigned release** APK. Neither is an upgrade to an existing app signed with Babuni.dev's original release certificate. The historical independently signed APK documented in `DEVLOG.md` preceded the most recent guest Game Over refresh change; do not claim it is the newest update.

The earlier unrequested **`TEST` package variant has been removed** (commits `31c2718` / `c46ee3f`); current debug and release variants have the same base app ID, but different signatures. Attempting to install a debug APK over a release-signed copy will fail certificate matching. Babuni.dev does **not** require preserving expendable beta test scores; uninstalling may discard them, but is not itself a substitute for verifying proper release signing.

Private original signing material must stay out of GitHub and logs. Confirm the signed release's certificate matches previous installed releases; the source now reports `versionCode = 3` / `versionName = 1.0.2-beta` for this update.

## Build current native source

CI workflow: [Android native build](https://github.com/babunidev/ButtonGame/actions/workflows/android-build.yml).

For local Java 17 + Android SDK builds:

```bash
./scripts/sync-www.sh
cd android
./gradlew assembleDebug assembleRelease
```

**Audio packaging fixed in source (26 October 2026):** All ten original OGG recordings, including `4273.ogg`, `QuickStrikepoints.ogg` and `QuickStrikepoints1.ogg`, are now present under `sfx/`, `assets/sfx/` and `android/app/src/main/assets/www/assets/sfx/`. `scripts/sync-www.sh` treats `sfx/` as the canonical originals and synchronizes both targets. GitHub Actions runs the script and checks actual audio bytes inside both APKs. **The complete new GitHub Actions build passed** in [run 40365295833](https://github.com/babunidev/ButtonGame/actions/runs/40365295833); both the debug APK and the unsigned release APK were uploaded as workflow artifacts.

No newly signed APK for this source revision has yet been established. GitHub CI compiles debug and unsigned release packages; only Babuni.dev's original signing certificate (kept outside GitHub) can produce an installable update of the existing release-signed app. The existing installed app's two-phone behavior is confirmed by Babuni.dev, independently of the still-pending new-build signing.

## High-score ownership and format

The Android host saves up to 50 sorted entries to its private `scores-v2.json`. Each entry has `name`, `score`, `reactionMs`, `apm`, `durationMs`, and now `trapsEnabled` (false for older records). Guests send `POST /api/scores` and read `GET /api/scores`; no independent guest scoreboard. Earlier `scores.json` beta records are deliberately not migrated; the v2 native store deletes that file on initialization.

To reset all host app data, Android Settings → Apps → Button Game → Storage → Clear data. This also deletes unrelated app-private preferences. Clearing guest browser cache does not reset host rankings.

## Signing the new 1.0.2-beta Trap Mode release locally

GitHub Actions [run 40365295833](https://github.com/babunidev/ButtonGame/actions/runs/40365295833) passed full Kotlin Android compilation, web/asset synchronization and the deterministic Trap Mode regression. It produced a **debug-signed** build and an **unsigned release**; neither installs directly over Babuni.dev's existing **release-signed** game.

To produce an in-place upgrade, use the **same original private release keystore/certificate** and the Android SDK's `zipalign` and `apksigner` **locally on a trusted machine**. Never upload the keystore or its password to GitHub or paste the password into repository files. After extracting the unsigned release artifact:

```bash
zipalign -f -p 4 app-release-unsigned.apk app-release-aligned.apk
apksigner sign --ks "/private/path/to/original-signing-keystore.p12" --ks-type PKCS12 --out ButtonGame-1.0.2-release-signed.apk app-release-aligned.apk
apksigner verify --verbose --print-certs ButtonGame-1.0.2-release-signed.apk
```

`apksigner` prompts securely for the keystore password. The keystore path above is a **placeholder**, not a claim that the file exists on any particular device. The signed certificate must match the original installed app, and `versionCode=3` must be greater than the installed version. The debug APK is only a fallback for a clean install **after uninstalling** the release-signed app; this loses its app-private data and is **not** an in-place update. No separate TEST app was introduced.

## Verification before distribution

Inspect APK entry list for both `assets/www/game.js` and `assets/www/index.html` **and all ten intended audio OGG files**; confirm native classes, hash and signature. The existing installed app's phone checks have already been completed by Babuni.dev. For the **newly signed version**, a brief installation/launch/audio/Wi-Fi smoke test is enough. Refer to [docs/QA.md](docs/QA.md). A release artifact and successful device check must be recorded in [CHANGELOG.md](CHANGELOG.md) and [docs/DEVLOG.md](docs/DEVLOG.md).
