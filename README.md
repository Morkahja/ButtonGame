# Button Game (Buttongame)

A one-minute, arcade-style button-smashing game with roaming targets, physical-looking number combinations and deliberately theatrical score collection. The game is a creative project directed by its creator, **Babuni.dev**. This repository preserves the original Flash artifact, earlier HTML5 reconstruction, current browser game, and native Android Wi-Fi host.

**Project status (26 October 2026): gameplay and real two-device Wi-Fi multiplayer tested and working according to the creator.** Reproducible sound packaging and the [latest full native Android CI build](https://github.com/babunidev/ButtonGame/actions/runs/40325603457) **passed**; only the new original-certificate signed APK/installation remains unverified.

## Play and hosting

- The game begins when the player first presses the moving turquoise button; it starts with 60 seconds.
- Each press generates a floating number. Nearby numbers combine, and earned values travel through visible score and bonus-time collection sequences.
- A qualifying Quick Strike within the narrow post-spawn window awards double points on that button.
- Specific combinations create unusual transformations, notably **21 → 42** and **37 → 73**.
- An Android phone can host the browser version on its local Wi-Fi using **Serve on Wi-Fi**. Guests join through the displayed address or QR code and share the Android host's high-score list.

The web game source is `index.html` and `game.js`, with assets under `assets/`. The Android WebView and guest pages use copies in `android/app/src/main/assets/www/`. Host-only high scores require the Android server; opening a standalone HTML file does not provide a persistent shared leaderboard.

## Current source and historical material

| Location | Purpose |
| --- | --- |
| `game.js`, `index.html`, `assets/` | Current HTML5 gameplay and presentation |
| `android/` | Native Android host, API, WebView and build |
| `sfx/` | Canonical source for all ten OGG recordings, mirrored into browser/Android assets |
| `scripts/sync-www.sh` | Copies the web source and original OGGs into browser/Android assets |
| `Game.swf`, `Game.html` | Preserved original Flash-era material |
| `ChatGPT Remake/` | Earlier reconstruction; **not** the current game |
| `tests/` | Committed regression tests |
| `CHANGELOG.md` | Historical implementation and release/build chronology |
| `DEVLOG.md` | Original detailed creative and technical development journal |
| `INSTALL.md`, `SOUNDS.md` | Installation/build and sound reference |

## Documentation map

- [CONCEPT.md](CONCEPT.md) — creative vision, mechanics and boundaries
- [ROADMAP.md](ROADMAP.md) — prioritized, status-labelled remaining work
- [AGENTS.md](AGENTS.md) — rules for AI and other development contributors
- [docs/DEVLOG.md](docs/DEVLOG.md) — curated journal continuation and entry point to the original journal
- [docs/DECISIONS.md](docs/DECISIONS.md) — recorded creator decisions, rejected approaches and open choices
- [docs/DESIGN.md](docs/DESIGN.md) — visual and interaction specifications
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — runtime and data flow
- [docs/QA.md](docs/QA.md) — creator-confirmed device testing and release check ledger
- [docs/CONTENT.md](docs/CONTENT.md) — future portfolio presentation and evidence inventory
- [docs/AI_COLLABORATION.md](docs/AI_COLLABORATION.md) — authorship and AI collaboration conventions
- [INSTALL.md](INSTALL.md) — APK and Wi-Fi use
- [SOUNDS.md](SOUNDS.md) — sound cues and source/packaging status

## Development and validation

CI currently runs `node --check game.js`, `node tests/live-leaderboard-refresh.cjs` and Gradle `assembleDebug assembleRelease`. The workflow has compiled the native app, but it is **not** a complete gameplay or hardware test.

To synchronize current web files manually: `bash scripts/sync-www.sh`; then build under `android/` with Gradle. All ten OGGs are now committed and synchronized from canonical `sfx/`, and CI compares the exact recordings inside both compiled APK variants. See [ROADMAP.md](ROADMAP.md) for remaining **release signing and delivery**, not redundant feature rework.

The active Android application ID is `com.babunigaming.buttongame`. The separate TEST application variant introduced in an earlier experiment was subsequently removed. Release upgrades require the original signing certificate, held outside GitHub; unsigned or debug-signed CI artifacts cannot upgrade an existing release-signed installation.

## Creative record and unanswered ideas

The creator supplied a recovered October 26 release to-do list emphasizing **finish the existing Android update before new modes**, with no need to preserve beta test high scores. Another recovered passage from the earlier conversation preserves the [original seven-category development checklist](docs/HISTORICAL_CHECKLIST_2026-10-25.md). It includes an earlier six-part red-button Trap Mode summary, now supplemented by the creator's **[complete nine-item Red Trap Button specification](docs/TRAP_MODE.md)**: pre-game Traps checkbox, random replacement red spawns, ordinary position/lifespan/rotation/shatter behavior, instant loss if tapped, harmless expiry and next spawn if untouched, passive +3 points every ⅓ second (9/s) emitted from center through regular physics/fusion, host-persisted mode flag, and a small red button beside names in the leaderboard. **The entire feature is not started.**

This website/game and its documented development process are intended to form part of the babuni.dev portfolio. The original journal remains intact to preserve changing decisions, including rejected prototypes and earlier technical limitations.
