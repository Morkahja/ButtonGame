# Button Game — AI and Contributor Rules

This is a creator-directed artwork and a software project. Preserve the user's authorship, distinctive mechanics and decision history.

## Authority and scope

1. **Creator direction takes precedence.** Do not treat ideas proposed by an assistant as approved features. Never attribute the user's concepts or constraints to AI.
2. **Do not redesign the game without approval.** The existing turquoise jacket-button interaction, physical number mergers, Quick Strike, special 21→42 / 37→73 effects, time/score collectors, and Wi-Fi host model are intentional.
3. The creator has supplied the [nine-item Red Trap Button specification](docs/TRAP_MODE.md), expanding the earlier [six-item historical checklist](docs/HISTORICAL_CHECKLIST_2026-10-25.md). It defines a pre-game toggle, random red replacements with normal button lifecycle, immediate loss on tapping, untouched expiry/shatter, passive +3 points each ⅓ second from center through standard float/fusion, saved mode flag, and red leaderboard icon. **ENTIRE FEATURE NOT STARTED.** This documentation is not authorization to implement. Preserve original user wording and do not invent unresolved timing/probability edge cases.
4. **Creator has already tested and confirmed the working installed game on two phones:** Quick Strike, combos, timers/HUD, sound, player list, guest scores, Game Over live refresh and score persistence. Do not repeatedly re-add these as unfinished QA. Sound packaging is now complete in source; the remaining release gate is to verify the new CI build, then original-certificate sign/install the **same** Android app (not a TEST variant). Beta high scores need not be preserved.
5. **Keep this a simple game.** Do not add an unnecessary score submission retry, complicated startup protection or abstract hardening as milestones without a real user-observed problem or explicit request. Bluetooth and peer-to-peer are exploratory ideas, not roadmap milestones. Never replace or rewrite the archived Flash game or earlier reconstruction while editing the modern game.

## Inspect before editing

- Check GitHub `main` state and open files/commits before describing anything as implemented.
- Distinguish code present, CI-tested, locally verified, device-verified, signed and actually delivered.
- Review [CONCEPT.md](CONCEPT.md), [ROADMAP.md](ROADMAP.md), [docs/DECISIONS.md](docs/DECISIONS.md) and relevant [docs/DEVLOG.md](docs/DEVLOG.md) / legacy [DEVLOG.md](DEVLOG.md).
- Avoid a false "fixed" claim solely because an API route, fallback, or successful APK compile exists.

## Source changes

- Current browser source: `index.html`, `game.js`, `assets/`.
- Android mirror: `android/app/src/main/assets/www/`. Keep mirrored source synchronized and explicitly verify byte equality.
- The three newer custom sounds exist under `sfx/` in current GitHub; current sync script only takes `assets/sfx/`. Fix source-to-bundle handling as a targeted release task and test for missing assets.
- Native Kotlin code is under `android/app/src/main/java/com/babunigaming/buttongame/`. Host remains the only authoritative leaderboard store. Do not add persistent guest score caches.
- Use reviewable, limited changes and test failure conditions as well as success.

## Android and secrets

- Preserve `applicationId = com.babunigaming.buttongame` for normal upgrades.
- Verify signing certificate continuity before distributing an update. Never commit, log, paste, upload or fabricate keystores, private keys, store/key passwords or personal credentials.
- CI's unsigned release and debug APK are **not** substitutes for an installable original-certificate update.
- Do not assert an Android device test, Wi-Fi acceptance test or completed release without direct verification.

## Required project record

For substantive code or design work, update the relevant documents in the same reviewable change:

- `README.md`: overview and current status.
- `CONCEPT.md`: creative purpose and explicitly approved feature boundaries.
- `ROADMAP.md`: active tasks and their evidence-backed statuses.
- `CHANGELOG.md`: changes actually implemented.
- `docs/DEVLOG.md`: narrative of creator intent, AI proposal, iteration, failures and verification; the original `DEVLOG.md` is retained.
- `docs/DECISIONS.md`: accepted/rejected/deferred choices, with provenance.
- `docs/DESIGN.md` and `docs/ARCHITECTURE.md`: observable behavioral/technical changes.
- `docs/CONTENT.md` and `docs/AI_COLLABORATION.md`: publication-safe portfolio and attribution.
- `docs/QA.md`: tested/unverified cases with reproducible evidence.

**Record format:** date; user direction; AI interpretation/contribution; alternatives or corrections; creator's actual decision (or pending); files/commit; tests performed; remaining uncertainty.

Never invent recovered chat dialogue, acceptance, test output, commits, releases, or assets. Unavailable archived conversations remain unavailable until supplied. Do not publish raw private conversations or credentials.

## Verification before completion

At minimum for web-only changes: JavaScript parse check, targeted tests, bundle equality and relevant interaction checks. For Android changes: native compile, host API/persistence tests as applicable, package/signature inspection and physical-device tests when claiming device correctness. For release claims: confirm the exact signed APK, package ID, signer identity, version increment, integrity, source equivalence and intended installation behavior.

A documentation-only change does not validate gameplay, sign an APK, or close release tasks.
