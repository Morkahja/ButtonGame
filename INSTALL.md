# Buttongame host — install on Pixel 8 Pro

Developer: **Babuni.dev**

Your phone becomes the Wi‑Fi host. Guests scan a QR code, play in the browser, and scores land on your phone.

## Install the APK

1. Copy `dist/Buttongame-host-debug.apk` to the Pixel (USB, Drive, Nearby Share, etc.).
2. On the phone: **Settings → Apps → Special app access → Install unknown apps** (or open the APK in Files and allow that app to install).
3. Open the APK and install **Buttongame**.

USB option from this PC (with USB debugging on):

```bash
adb install -r dist/Buttongame-host-debug.apk
```

## Host a session

1. Open **Buttongame** on your Pixel.
2. Tap **Serve on Wi‑Fi**. Keep the app open (a notification stays while hosting).
3. Guests on the **same Wi‑Fi** scan the QR code (or open the URL under it).
4. Tap **Play Buttongame** on your phone to play into the same scoreboard.

If café/guest Wi‑Fi blocks phone-to-phone traffic, turn on your **Pixel hotspot** and have guests join that instead. You are still the host.

## Scores

- After Game Over, enter a name and tap **Submit score**.
- The leaderboard is stored on the host phone in app storage (`scores.json`).
- Closing the app stops the server address; saved scores remain.

## Rebuild after web changes

```bash
./scripts/sync-www.sh
cd android && ./gradlew assembleDebug
cp app/build/outputs/apk/debug/app-debug.apk ../dist/Buttongame-host-debug.apk
```

Needs JDK 17+ and Android SDK (`android/local.properties` → `sdk.dir=...`).
