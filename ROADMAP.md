# Button Game — Current Project To-Do

**Updated 26 October 2026 from the creator's own device-testing report and the current GitHub source.**

This is a short **active work list**. Previously tested features must not be repeatedly returned as unfinished QA tasks. The original seven-category checklist is preserved [unchanged as historical evidence](docs/HISTORICAL_CHECKLIST_2026-10-25.md); the [complete Red Trap Button specification](docs/TRAP_MODE.md) is separate.

## Completed — confirmed by the creator on actual devices

- [x] **Button & Quick Strike:** turquoise target, rotation/spawn animations, pulse, impact feedback, shatter, 73 ms Quick Strike, spinning/green dot/double points, Quick Strike sounds.
- [x] **Floating numbers & combinations:** emission, physics, full-label collisions, mergers, visible score collection, 21→42 and 37→73, golden highlights, milestone bells, special sound effects.
- [x] **Timer & interface:** 7/14/42/73 bonuses (+2/+3/+5/+4 s), golden timer/score banks, HUD, Reaction/APM, Game Over, replay, phone presentation.
- [x] **High scores:** real guest-to-host submission works; host Game Over ranking updates automatically every three seconds; the four final statistics are saved correctly and persist across hosting restarts.
- [x] **Two-device Wi-Fi multiplayer:** guest browser joining, connected-player list, live player statistics and shared leaderboard work.
- [x] **Physical-device QA of existing installed game:** gameplay, interface, sound volume and multiplayer tested and reported working by the creator.
- [x] **Source OGG recordings present:** all three custom OGGs were already in root `sfx/`.
- [x] **Documentation baseline:** README, concept, decisions, design, architecture, developer guidance, development journal and recovered historical checklists.

These results are **creator-reported device verification of the installed version**. They are not automatically proof that a newly rebuilt APK has been installed or signed. See [docs/QA.md](docs/QA.md).

## Current release work

- [x] Copy all three custom OGGs to both `assets/sfx/` and `android/app/src/main/assets/www/assets/sfx/`. Preserve bytes from canonical `sfx/`.
- [x] Update `scripts/sync-www.sh` to include original recordings; update Android CI to sync web assets and check exact sounds in debug/unsigned-release APKs.
- [x] Increment Android version to `versionCode = 2` and `versionName = 1.0.1-beta` for the new native build.
- [x] **Native Android debug and unsigned release build passed** with all ten sounds verified inside both APKs, existing leaderboard regression and web asset synchronization: [GitHub Actions 40325603457](https://github.com/babunidev/ButtonGame/actions/runs/40325603457).
- [ ] **Sign the new release using the original certificate** (held outside this repository) and verify update installation compatibility.
- [ ] **Deliver/install the signed normal-package APK**; a brief smoke test of that *new build* is sufficient. Do not introduce a separate TEST app.

## Red Trap Button — entirely not started

The nine-item design is preserved without changing gameplay. [Full checklist and rules](docs/TRAP_MODE.md).

- [ ] Pre-game Traps checkbox/red button icon.
- [ ] Random red replacement spawns using normal position, lifespan, rotation and shatter.
- [ ] Immediate Game Over if clicked; untouched traps shatter and allow next spawn.
- [ ] Passive +3 points every ⅓ second (9/s) from center through ordinary number physics and fusion.
- [ ] Save Traps-enabled state on host high scores and display the red icon beside qualifying names.

**Not part of the current APK update.** The nine exact original tasks remain unchecked in `docs/TRAP_MODE.md`.

## Maintenance and portfolio documentation

- [ ] Keep `CHANGELOG.md`, `docs/DEVLOG.md` and this roadmap aligned with **actual** released changes, not hypothetical fixes.
- [ ] Collect publication-safe gameplay screenshots/video and the story of development for babuni.dev when desired.

## Explicitly not active tasks

Do **not** create a new score-submission retry system based on a one-off old bug. Do **not** turn hypothetical bind conflicts, startup failures, score-file corruption or anti-cheat hardening into mandatory milestones for this simple game. The creator reports no server startup or port conflict issues. Additional complexity requires a real demonstrated problem or a new creator request.

Exploratory alternative network approaches are historical ideas recorded in [CONCEPT.md](CONCEPT.md) and [docs/DECISIONS.md](docs/DECISIONS.md), **not roadmap milestones**.
