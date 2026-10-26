# Button Game — Roadmap

Status baseline: 2026-10-26. Entries are not marked complete without implementation evidence and appropriate verification.

## Priority 1 — Reproducible release

- [ ] Ensure the three recordings `4273.ogg`, `QuickStrikepoints.ogg`, and `QuickStrikepoints1.ogg` from `sfx/` are synchronized into web and Android assets.
- [ ] Update asset synchronization and CI so clean builds include required audio.
- [ ] Confirm the original Android signing certificate and securely produce a release-signed APK with the existing package identity.
- [ ] Publish a verifiable installable APK and document versioning.

## Priority 2 — Physical multiplayer verification

- [ ] Test guest score submission and acknowledgment on two devices.
- [ ] Confirm host Game Over leaderboard updates within three seconds.
- [ ] Confirm consistent Points, Reaction (ms), APM, and Session Time.
- [ ] Test persistence across restart and hosting sessions, and retry/error behavior.

## Priority 3 — Reliability and automated testing

- [ ] Handle host server port conflicts and startup failures.
- [ ] Restore actual hosting state after activity recreation.
- [ ] Gate WebView readiness on server availability.
- [ ] Make score file writes atomic and recoverable.
- [ ] Validate score input and decide safeguards against forged LAN submissions.
- [ ] Restrict WebView debugging to development builds.
- [ ] Add API, persistence, concurrent-player, and gameplay regression coverage.

## Priority 4 — Documentation and portfolio

- [ ] Verify documentation against the complete repository and historical conversations.
- [ ] Update INSTALL.md and SOUNDS.md to match release and asset behavior.
- [ ] Capture representative screenshots/video with rights and privacy reviewed.
- [ ] Define portfolio presentation and integration after creator approval.
- [ ] Verify an independently playable portfolio build before publishing.

## Deferred, not approved

Red/trap mode; Bluetooth hosting; true peer-to-peer multiplayer; in-game high-score reset.

## Already implemented, not automatically device-verified

HTML5 gameplay, Android Wi-Fi host, host-owned leaderboard storage, Game Over refresh logic, scoring mechanics, sound playback code, and native Android CI compilation. See CHANGELOG.md for implementation history.
