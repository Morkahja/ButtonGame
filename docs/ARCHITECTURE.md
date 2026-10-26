# Button Game — Technical Architecture

**Inspected baseline:** GitHub `main` at `d5ce766`, 2026-10-26. Architectural descriptions below concern code paths; production behavior is not proven solely by reading source.

## Runtime components

```text
Android host (com.babunigaming.buttongame)
  MainActivity / WebView (local player + "Serve on Wi-Fi" UI)
  HostService (foreground server lifecycle)
  GameServer : NanoHTTPD (TCP 8766)
    GET  /            -> web game assets
    GET  /api/scores  -> ScoreStore leaderboard JSON
    POST /api/scores  -> append/trim persisted scores
    GET  /api/presence -> active player snapshot
    POST /api/presence -> upsert live player heartbeat
  ScoreStore -> app-private files/scores-v2.json
  PresenceStore -> in-memory player sessions (5 s TTL)

Browser guests (same Wi-Fi, QR or URL)
  index.html + game.js -> host-served assets
  /api/presence -> send live stats / get peer snapshot
  /api/scores -> submit and read the one host leaderboard
```

The browser game does not establish an independent, durable guest scoreboard. Nickname, session ID and sound-mute preferences may use browser `localStorage`.

## Gameplay runtime

`game.js` is an immediate-invocation script manipulating DOM nodes in `index.html`; it is not a framework app. It owns timing, button lifecycle, floaters, combinations, score and time banks, audio routing, player presence and network leaderboard requests.

The 60-second `deadline` starts on the first tap. State updates include target/fade phases and `requestAnimationFrame` visual updates. Score-bearing floaters retain pending points through merges. When a floater expires, a flying value deposits into `scoreBank`; this bank gradually credits the displayed total. A similar pipeline exists for golden seconds. Game Over checks outstanding transformations, floaters, pickups and banks before freezing final statistics and enabling submission.

## Network and storage contract

### Leaderboard

`GET /api/scores` returns a JSON object shaped like:

```json
{"scores":[{"name":"Player","score":42,"reactionMs":230,"apm":51,"durationMs":61200}]}
```

`POST /api/scores` accepts a JSON body containing the same five fields. The host sanitizes basic negative values and clips names, sorts descending by score and retains at most 50 entries in `scores-v2.json`. The host is the **only persistence authority**, but **not a cryptographic anti-cheat authority**: clients currently supply final numeric values, and remote requests are unauthenticated.

`ScoreStore` directly rewrites a JSON file; atomic persistence and corruption handling remain release-hardening tasks. Historical beta `scores.json` is deliberately deleted when a `ScoreStore` is initialized. The creator does not require preservation of expendable beta records.

### Presence

`POST /api/presence` carries `id`, name, score, timeLeft, reactionMs, apm and playing state. A singleton `PresenceStore` tracks these in memory, prunes entries older than five seconds and assigns seat numbers. Browser presence is sent approximately every 900 ms; Android host UI fetches presence on a faster animation/poll interval. Presence is ephemeral and **not** a persisted result.

### Refresh model

`game.js` loads scores initially, refreshes the playing preview every 12 seconds, refreshes Game Over every three seconds, and fetches again when returning to a visible Game Over tab. The targeted Node test verifies those timer conditions; it is not a two-device integration test.

## Build and assets

- Web source: root `index.html`, `game.js`, `assets/`.
- Android packaged mirror: `android/app/src/main/assets/www/`. Root JS/HTML and packaged copies were byte-identical at this inspected head.
- `scripts/sync-www.sh` currently mirrors HTML/JS and `assets/` files, including OGGs **only from `assets/sfx/`**.
- Three custom source OGGs were added under root `sfx/` at `d5ce766`, but not under `assets/sfx/` or the Android mirror. Thus clean CI output does not yet include their intended cues.
- Android Gradle config: Java 17, compile/target SDK 35, min SDK 26, `applicationId = com.babunigaming.buttongame`, `versionCode = 1` / `versionName = 1.0.0-beta`.
- CI: `.github/workflows/android-build.yml` runs Node syntax and one leaderboard regression, then Gradle `assembleDebug assembleRelease`. It currently does **not** invoke the sync script and does **not** watch `sfx/**`.
- CI release output is unsigned. A release-signed upgrade requires the creator's original certificate; credentials are not part of the repository. See [INSTALL.md](../INSTALL.md).

## Historical architecture evolution and failed shortcuts

**Flash reference.** `Game.html` is a Flash wrapper with a 450 × 450 stage, and the retained `Game.swf` is the primary binary artifact. `ChatGPT Remake/README.md` describes a later canvas/Path2D reconstruction of the original ActionScript and extracted SVG-like path/font outlines. It preserved approximately 15 FPS update semantics, old fading/movement rules, one point and second per click, and no sound/replay. This is a *separate historical implementation*, not the browser DOM game now shipped under the root paths.

**Modern browser runtime.** The root `game.js` introduced a different division of responsibilities: button art and fracture fragments are DOM/SVG, floating numbers have physical bounds and a **pending-value** ledger, RAF motion animates effects, while legacy-like target lifecycle ticks remain. The original instantaneous tap-credit path was replaced by delayed floaters → foreground pickups → shared score bank → displayed total; special 21/37 handlers retire their source value before exactly one transformed score pickup. A separate gold time flight/bank eventually feeds integer seconds into the deadline. This means the display can temporarily differ from points earned but not yet credited; Game Over checks outstanding work.

**From standalone to Android-owned LAN play.** Native Kotlin Android wraps a WebView, foreground `HostService` and NanoHTTPD API. Wi-Fi guests receive those same HTML/JS assets over HTTP, while the native host alone persists rankings. Presence heartbeats and transient player-status HUD are *not* remote physics synchronization. The earlier workaround of storing/enriching individual guest scores in `localStorage` was explicitly undone after the creator clarified one shared authority; standalone HTML cannot honestly offer this host scoreboard without the Android server.

**The misleading APK update path (2026-10-25).** Initial Android updates injected only new `index.html`/`game.js` into an older signed APK and re-signed it, leaving compiled Kotlin classes unchanged. The browser UI could display new Reaction/APM/duration fields while native `ScoreStore` still saved just names and points. Source changes to `ScoreStore.kt` were therefore *not proof of an updated distributed host*. A GitHub Actions full native Gradle build corrected that separation. The first CI setup failed on the Android SDK action's obsolete `tools` package; switching to `packages: 'platform-tools'` resolved startup and both debug/unsigned release builds passed. The latest Game Over refresh fix is source/CI verified, but signed upgrade delivery and physical multiplayer acceptance are distinct gates.

**Identity and signing are interface contracts.** A proposed side-by-side `applicationIdSuffix = ".testing"` debug app was not requested and was reverted. The creator explicitly wants normal-package upgrades using the original release certificate and does not require beta test score preservation. A debug APK or unsigned release artifact does not satisfy that contract. Repository `sfx/` contains the custom files, but synchronized web/Android copies are not yet reproducible from the CI path.

## Known failure/abuse surfaces

- Unauthenticated cross-origin HTTP requests on an unencrypted local network; clients can submit fabricated numbers. Intended for trusted LAN play pending safeguards.
- Port bind exceptions and premature WebView load may cause startup trouble; activity-local hosting state can diverge from service.
- Direct score-file writes risk interruption. Presence IDs are client-supplied and transient.
- `WebView.setWebContentsDebuggingEnabled(true)` is currently unconditionally enabled; restrict to development builds.

These are source-review findings, not claims of reproduced crashes or proven exploits on a physical phone. Release gates and QA are tracked in [ROADMAP.md](../ROADMAP.md) and [QA.md](QA.md).
