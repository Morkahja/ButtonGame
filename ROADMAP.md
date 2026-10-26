# Button Game — Roadmap and Active Work

**Baseline:** 2026-10-26; checked against `main` at `d5ce766` and the creator-provided "Complete To-Do List". A checked-in implementation is not a verified device behavior, and a successful unsigned build is not a delivered signed release.

## Status key

- **Implemented (source):** code exists; may still need physical testing.
- **Verified (CI):** named automated check has passed.
- **Open:** actionable work remains.
- **Proposed:** idea only; no implementation authorization.

## Milestone 0 — Existing Android update (highest priority; OPEN)

The objective is **one complete, correctly signed update of the normal Button Game app**, containing the latest guest Game Over refresh fix and every intended sound. Do not create a parallel TEST package, preserve expendable beta scores, or add new modes.

- [ ] **Package three recordings:** `sfx/4273.ogg`, `sfx/QuickStrikepoints.ogg` and `sfx/QuickStrikepoints1.ogg` currently exist in GitHub, but not under `assets/sfx/` or the Android `www/assets/sfx/` bundle.
- [ ] Update `scripts/sync-www.sh` so the canonical sound source is copied correctly; synchronize HTML, JavaScript and all audio into Android before compiling.
- [ ] Update `.github/workflows/android-build.yml` to synchronize, verify exact required asset entries, and trigger when `sfx/**` changes.
- [ ] Build the latest native unsigned release using the established Gradle pipeline.
- [ ] Sign using the **original** release certificate outside committed source; verify APK package ID, signature/certificate continuity and integrity.
- [ ] Establish incrementing `versionCode` and release naming; current `versionCode = 1` / `versionName = 1.0.0-beta`.
- [ ] Deliver an installable, verified signed `.apk` for the **existing** package; preferably publish to a persistent GitHub release after verifying the artifact.

**Existing baseline:** Android build workflow and Game Over polling code are implemented. CI run [40247849170](https://github.com/babunidev/ButtonGame/actions/runs/40247849170) passed on the commit that removed the TEST variant. The subsequent `sfx/` source commit `d5ce766` did not trigger the workflow (no `sfx/**` path trigger). Earlier locally signed packages are historical artifacts, not evidence that the newest update has been signed and delivered.

## Milestone 1 — Two-device multiplayer acceptance (OPEN)

- [ ] Host on Android, join from a second device on the same Wi-Fi.
- [ ] Submit guest score; verify clear acknowledgment and no separate guest-owned score database.
- [ ] Leave host on its Game Over screen; verify guest entry appears automatically within roughly **3 seconds** of a successful host submission (allow network scheduling margin).
- [ ] Compare guest/host rankings and all four final statistics: Points, Reaction (ms), APM and Session Time.
- [ ] Restart host and a hosting session; verify persisted records return.
- [ ] Simulate network loss; verify failure message and retry without false success.
- [ ] If a score remains absent after a fresh host leaderboard load, inspect POST and native storage rather than assuming another UI refresh defect.
- [ ] Confirm Quick Strike and 42/73 special audio output and volume on the actual device.

## Milestone 2 — Host hardening (OPEN; prioritize reproduced failures)

- [ ] Handle HTTP bind/port 8766 failures without crashing `HostService` or reporting false success.
- [ ] Reconcile UI hosting state with the actual service after reopening/recreating `MainActivity`.
- [ ] Gate/retry WebView game loading until the server responds.
- [ ] Make `ScoreStore` writes atomic; expose a recoverable error on corrupt data.
- [ ] Validate score/post fields, ranges, name length and request sizes; consider sensible request throttling.
- [ ] Decide which anti-forgery measures suit friendly LAN play. A client-provided score is **not** intrinsically verifiable.
- [ ] Disable WebView debugging in release builds.

## Milestone 3 — Gameplay and quality verification (OPEN)

- [ ] Test spawn distribution, tilts, tap response, 73 ms Quick Strike, 2× score and early presses.
- [ ] Test delayed crack/shatter and clicks through destruction.
- [ ] Test floater collision, merges, pending-value conservation and end-of-round settlement.
- [ ] Test 21 → 42 and 37 → 73 transforms and exact associated score/time bonuses (7/14/42/73).
- [ ] Test replay/reset state and no duplicate score posting.
- [ ] Test portrait/landscape layout, HUD overlap, leaderboard scroll, 50% fade/gradient and background/foreground recovery.
- [ ] Expand CI beyond the one committed leaderboard polling regression; add API, persistence and multi-client integration testing.

See [docs/QA.md](docs/QA.md) for cases and current evidence.

## Milestone 4 — Documentation and presentation

- [x] Create a documentation baseline: root README, concept, roadmap, development rules, structured project history, design, architecture, decisions, content and collaboration references. (Documentation commit, 2026-10-26.)
- [x] Keep existing `DEVLOG.md` and `CHANGELOG.md` as primary historical records rather than replacing them.
- [ ] Update status after each actual build, install and device check with commit/release references.
- [ ] Prepare portfolio-safe imagery, original-to-current evolution, and representative video after validation.

## Historical and exploratory backlog — NOT scheduled for current release

- **Red Trap Button / Trap Mode:** **entire feature NOT STARTED**. The creator recovered a complete [nine-item checklist](docs/TRAP_MODE.md): Traps checkbox/red icon; random replacements; normal spawn position/lifespan/rotation/destruction; immediate Game Over if tapped; untouched expiry/shatter/next spawn; +3 center-emitted passive points every ⅓ second (9/s) through ordinary physics, expiry and fusion; persistent mode flag on host high scores; small red button beside relevant leaderboard names. This is a documented future game mode, **not the immediate APK release task**.
- Bluetooth hosting.
- True peer-to-peer multiplayer.
- Optional in-app reset of high scores.

The above are research/design topics, **not release blockers or authorization to implement**.

## Historical research dependency — not a feature-development task

- [x] **Preserve the recovered historical seven-category checklist** with the earlier six documented Trap Mode requirements in [docs/HISTORICAL_CHECKLIST_2026-10-25.md](docs/HISTORICAL_CHECKLIST_2026-10-25.md). The source is creator-pasted historical text, **not** a retrieved full transcript.
- [ ] **If accessible, obtain the complete original archived conversation or original creator-authored notes** to resolve remaining trap spawn probability, race conditions and Game Over score-settlement details, historical debates and omissions from the condensed checklist. Do not invent those missing rules or convert archived ideas into new implementation tasks without the creator's current direction.

Existing shipped-feature release work and the approved host-owned Wi-Fi model remain the practical roadmap. Any “future feature” mentioned only in a generated audit is not automatically creator-approved.

## Historical planning evidence: original seven categories

The creator recovered a checklist dated **25 October 2026** with seven original sections: (1) Button & Quick Strike, (2) Floating Numbers & Combinations, (3) Timer & Interface, (4) High Scores & Session Statistics, (5) Trap Mode, (6) Multiplayer & Networking, and (7) Release & Quality Assurance. The recovered task wording is archived in [docs/HISTORICAL_CHECKLIST_2026-10-25.md](docs/HISTORICAL_CHECKLIST_2026-10-25.md).

This living roadmap must not be misrepresented as that original checklist. It separates historical items already implemented, the intentionally cancelled old-score compatibility requirement, exploratory ideas, and newer AI recommendations from current creator priorities.

## Already implemented: do not relist as missing features

Current HTML5 game; Android NanoHTTPD hosting and QR join; native v2 host-owned score fields; POST/GET leaderboard API; three-second Game Over polling code and CI regression; in-play leaderboard preview; Quick Strike, shatter, floaters and combinations; replay; sound cue routing; native Android compilation. Separately track **integration, packaging, signing and verification** still required for these.
