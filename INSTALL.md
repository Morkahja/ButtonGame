# Button Game — Android host build and installation

Developer: **Babuni.dev**

The Android app is the **single score authority** for every player in its Wi-Fi session. The host saves records in its own private app storage; guests send results to the host via `POST /api/scores` and read them through `GET /api/scores`. Guests do not maintain separate leaderboards.

## Install a signed release APK

Install the signed release build on the Android host by opening the APK in Files and approving installation by that source if Android asks. A build signed with the existing project release certificate upgrades the installed app without uninstalling it.

**Do not confuse the GitHub Actions debug APK with the project's release-signed APK.** The workflow's debug APK uses a different signing certificate and cannot upgrade an app signed with the existing release certificate. The unsigned release artifact also cannot be installed as-is; it needs local developer signing.

USB installation of the signed APK, if Android debugging/ADB is configured:

```bash
adb install -r ButtonGame-Native-Host-Highscores-Full-Build.apk
```

## Host a Wi-Fi session

1. Open Button Game on the Android host.
2. Tap **Serve on Wi-Fi**.
3. Players on the same Wi-Fi join using the host URL or QR code.
4. The Android host and all guests play against the same high-score leaderboard.

## What the host stores

New records in `scores-v2.json` have five fields:

- Player name (`name`)
- Final points (`score`)
- Final average reaction in milliseconds (`reactionMs`)
- Final actions per minute (`apm`)
- Elapsed time in milliseconds from first click until Game Over (`durationMs`)

The Game Over UI shows the four *statistics*—points, reaction, APM, and elapsed time—alongside player name. The host owns and persists all five fields.

This beta intentionally starts a new database: earlier `scores.json` records are not migrated. The v2 Android host deletes the old beta file on initialization.

## Reset high scores

Android Settings → Apps → Button Game → Storage & cache → **Clear storage / Clear data**. This deletes all host records, plus other app-private data/preferences. It does not uninstall Button Game.

A guest browser cannot reset host records by deleting its own browsing data.

## Build native Android code with GitHub Actions

Workflow: [Android native build](https://github.com/babunidev/ButtonGame/actions/workflows/android-build.yml).

Changes to `android/**`, `game.js`, `index.html`, `assets/**`, or the workflow trigger a full Gradle build. You can also launch it from the Actions tab using **Run workflow**.

The GitHub Actions runner installs JDK 17, Android SDK platform 35, and Gradle 8.9 through the checked-in wrapper, then builds both debug and unsigned release APKs. Build artifacts are retained for 30 days:

- `ButtonGame-Native-Android-Debug`: test APK, debug-signed; **cannot upgrade release-signed app**
- `ButtonGame-Native-Android-Release-Unsigned`: compiled native release APK **requiring original release signing**

**Private signing credentials are not stored in the GitHub repository or GitHub Actions.** The original PKCS#12 keystore is held separately by the developer and is used to sign the release artifact locally. A successful CI build proves Kotlin/Android compilation, not release signing or device behavior.

To build locally instead (JDK 17 / Android SDK installed):

```bash
./scripts/sync-www.sh
cd android
./gradlew assembleDebug assembleRelease
```

For a source-complete release, ensure the three user-supplied special sounds exist both in `assets/sfx/` and `android/app/src/main/assets/www/assets/sfx/`; GitHub's source currently lacks those binary recordings even though separately packaged APKs include them. Do not distribute a plain CI APK as audio-complete until those assets are added.

