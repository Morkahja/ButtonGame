# Button Game — Verification Ledger

**Baseline:** GitHub `main` at `d5ce766`, 2026-10-26. Tests not run during this documentation task are **not marked passed**. This is a working acceptance plan, not a certificate.

## Evidence actually checked

| Area | Evidence | Status |
| --- | --- | --- |
| Native Kotlin debug + unsigned release compile | [GitHub Actions run 40247849170](https://github.com/babunidev/ButtonGame/actions/runs/40247849170) for `c46ee3f` | CI passed |
| Node JS parsing + Game Over refresh condition | Same CI workflow, `tests/live-leaderboard-refresh.cjs` | CI passed |
| Root vs Android web source files | GitHub head source comparison | Byte-equal at prior audit; recheck before release |
| Source custom OGG files | `sfx/` listing at `d5ce766` | Present in source library |
| Packaged custom OGG files | `assets/sfx/` and Android `www/assets/sfx/` tree inspection | **Missing**; packaging unresolved |
| Newest signed installable update with refresh | No matching completed release artifact established | **Open** |
| Real guest/host network behavior | No two-device verification evidence | **Open** |

Note: the new `d5ce766` sound commit alone did not trigger Android CI because the workflow path filter excludes `sfx/**`.

## Manual host-and-guest acceptance

| ID | Procedure | Pass criterion | Status |
| --- | --- | --- | --- |
| LAN-01 | Host phone: Serve on Wi-Fi; guest: open QR or URL | Page loads without host service error | Not run |
| LAN-02 | Guest completes round; submits score | Clear success; one host ledger entry | Not run |
| LAN-03 | Leave host on Game Over before guest submits | New guest entry appears in about 3 seconds without restarting | Not run |
| LAN-04 | Compare both devices | Same ranking and four stats (points, reaction, APM, elapsed time) | Not run |
| LAN-05 | Restart host app and start hosting again | Previous host results remain present | Not run |
| LAN-06 | Drop Wi-Fi mid-submission and recover | Error and retry; no fabricated success or unintended duplicate | Not run |
| LAN-07 | Background/reopen Android activity | Real hosting state represented; no false "off" state | Not run |
| LAN-08 | Try starting service with port occupied | Controlled failure; no crash | Not run |

## Gameplay acceptance

| ID | Behavior | Status |
| --- | --- | --- |
| GAME-01 | First press starts 60 s; timed spawning and randomized tilt | Physical QA open |
| GAME-02 | First hit in 73 ms Quick Strike window and continuing 2× taps | Physical QA open |
| GAME-03 | Shatter delay, recognizable fragments and scoring throughout | Physical QA open |
| GAME-04 | Floating values collide, merge gradually, and settle without duplicate credit | Broader automated coverage open |
| GAME-05 | 21→42 / 37→73 trigger, sound and exact value payout | Physical QA open |
| GAME-06 | +2 s (7), +3 s (14), +5 s (42), +4 s (73); no direct time bonus for 21/37 | Broader automated coverage open |
| GAME-07 | End-of-round waits for pending score and time settlement | Broader automated coverage open |
| GAME-08 | Play Again resets all state and no stale submission | Physical QA open |
| UI-01 | Four HUD stats readable; 50% fading leaderboard below playfield | Layout QA open |
| UI-02 | Game Over scrollbar hidden while touch scrolling works | Layout QA open |
| UI-03 | Small/rotated screens, overlay alignment and app backgrounding | Layout QA open |
| AUDIO-01 | Special 42/73 and Quick Strike recordings audible and balanced | Packaging + physical QA open |

## Future automated test work

- Run a native host API integration test for POST/GET JSON, ordering, field ranges, and cross-client consistency.
- Test persistent file interruption, corruption and recovery (after atomic storage is implemented).
- Test concurrent guest submissions, collisions of identity, malformed requests and basic denial-of-service conditions.
- Expand deterministic browser tests beyond polling conditions: points/time conservation, collisions, transforms, replay.
- Make CI verify every required sound file exists inside assembled APK, not merely its web entry points.
- Add a repeatable on-device smoke test before declaring a signed release delivered.

## Release acceptance

1. Confirm exact source commit, complete audio bundle, package ID `com.babunigaming.buttongame` and incremented version.
2. Build latest native release, verify APK assets/classes and sign with same original certificate; keep keys private.
3. Verify signature, hash, install/upgrade compatibility and launch on device.
4. Execute LAN-01 through LAN-06 at minimum and audio/gameplay smoke checks.
5. Publish versioned signed APK with immutable commit/release link and attach results to changelog and devlog.

Unobserved test results must remain "Not run"; do not infer PASS from an earlier APK, mock or workflow.
