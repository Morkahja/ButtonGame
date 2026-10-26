# Button Game — Curated Development Journal

This is the structured continuation and reading guide to the original [root DEVLOG.md](../DEVLOG.md), which remains intact as a primary historical source. [CHANGELOG.md](../CHANGELOG.md) records implemented change chronology; this journal records *why*, revisions, creator direction, AI collaboration, and what remained unverified. Earlier events below are summaries grounded in repository documents rather than newly discovered transcripts.

## 2026-10-26 — Documentation foundation and recovery boundaries

**Creator direction.** After recovering a comprehensive project to-do list and discovering that a long archived development chat would not open reliably, the creator asked for the missing GitHub documentation structure to be established. The creator wants a complete record suitable for future work and eventual babuni.dev portfolio publication. The red button/trap or trip discussion and its longer to-do history may be inside the inaccessible chat.

**Available evidence and limitation.** Inspected current GitHub tree and source at `d5ce766`. The repository held only `DEVLOG.md` and `CHANGELOG.md` as broad history, plus `INSTALL.md` and `SOUNDS.md`; no root `README.md`, `CONCEPT.md`, `ROADMAP.md`, `AGENTS.md` or structured `docs/` records existed. The creator-provided "Button Game — Complete To-Do List" is useful **recovered secondary evidence**, not a complete transcript of the lost conversation. Therefore it confirms a *reference* to a red/trap mode but does not reveal mechanic rules or authorization.

**AI contribution.** Added a documentation framework that links the existing journal, describes demonstrable mechanics, explicitly tracks pending Android packaging/signing and two-device QA, records unresolved decisions, and establishes review/attribution conventions. Updated the existing install/sound references to reflect the current `sfx/` source-library layout and packaged-audio gap. Preserved old entries rather than replacing earlier creative iterations with a cleaned-up fiction.

**Repository observations.** At the inspected head: separate `TEST` build configuration has been removed (commits `31c2718` and `c46ee3f`); all three custom sounds were committed under `sfx/` (commit `d5ce766`), but `assets/sfx/` and the Android web asset tree lacked them. The CI workflow does not trigger for changes limited to `sfx/**` and does not run the synchronizer before Gradle. Android `versionCode` is still 1. The existing three-second Game Over fetch regression was in CI and native compilation passed earlier; this does **not** verify a newly signed APK update or two real devices.

**Decision boundary.** This session establishes **documentation only**. It does not approve/redesign the trap mechanic, implement fixes, modify application behavior, sign a release, or claim hardware QA. No archived dialogue is reconstructed as if directly retrieved.

**Verification.** Source/tree inspection plus confirmation that the documentation files were committed are the relevant checks. No new runtime tests performed during this documentation change.

## 2026-10-26 — Creator-reported remote score refresh issue (retrospective summary)

The creator observed that when a guest completed a round and submitted a score, an Android host already on Game Over did not update its visible ranking. The engineering diagnosis was that an initial fetch and the active-play 12-second poll excluded Game Over. The assistant implemented a three-second Game Over-specific fetch plus a foreground refresh, preserved host-owned storage, and added a targeted Node regression to CI. This addresses the identified display path **in source**. The root journal explicitly leaves host/guest device verification and persistence confirmation open. See [root journal entry](../DEVLOG.md) and [QA ledger](QA.md).

## 2026-10-25 — From repackaged web files to a true native build (retrospective summary)

Earlier APK iterations packaged refreshed HTML/JS around stale Kotlin classes, so desired final statistics were **not** stored by the then-installed native host. The creator repeatedly emphasized host-owned four-stat persistence. The assistant switched to an Android SDK/Gradle CI build, resolved an initial SDK tool-package failure, and later built a native package with updated `ScoreStore`/`GameServer`. Historical journal entries describe a locally signed APK with the original certificate; they do not establish that the subsequent Game Over refresh fix was included in a *newer delivered signed update*. This is why release completion is still open.

## 2026-10-24–25 — Button destruction and physical scoring (retrospective summary)

The first shatter proposal produced arbitrary glowing fragments and enlarged the button; the creator rejected it because the four-hole jacket button itself had to visibly crack and break apart. A staged fracture using clipped pieces of the real SVG replaced the earlier effect, and taps remain meaningful during destruction. Floating point units became a conserved **pending-value ledger**, so visual merges and green collection precede score credit, and Game Over waits for final settlement. The 21→42 and 37→73 sequences were then given separate visual treatments, audio cues, and time/score behavior. See the root [DEVLOG.md](../DEVLOG.md) for exact dated implementation and verification details.

## Provenance note

This file is an **editorial index and continuation**, not a verbatim reproduction of inaccessible archived ChatGPT conversations. The creator retains authorship of the direction and decisions; AI implementation and retrospective summarization are distinguished. Future dated entries should include requested change, alternate approaches, acceptance/rejection, file and commit pointers, actual verification and unresolved problems.
