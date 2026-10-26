# Button Game — Red Trap Button

**Feature status: ENTIRE FEATURE NOT STARTED.** The implementation plan below incorporates two **explicit Babuni.dev decisions (26 October 2026)**, but no code has been changed.

**Babuni.dev-provided specification:** 26 October 2026, supplied as a follow-up to recovery of the earlier Button Game development checklist. This is a standalone, more detailed specification than the earlier six-item Trap Mode summary. Babuni.dev describes it as **“An optional game mode that rewards patience and punishes careless tapping.”**

## Original feature checklist

- [ ] Add a Traps checkbox with red button icon before the game starts.
- [ ] Randomly replace some normal spawns with red buttons when enabled.
- [ ] Give red buttons the same position, lifespan, rotation, and destruction behavior.
- [ ] Clicking a red button causes immediate Game Over.
- [ ] Untouched red buttons expire, shatter, and allow the next spawn.
- [ ] Generate 3 points every ⅓ second, equivalent to 9 points per second, throughout the trap's active lifetime.
- [ ] Passive points emerge from the center, combine, expire, and fuse into the score like ordinary points.
- [ ] Save whether Traps mode was active with each high score.
- [ ] Display a small red button beside leaderboard names for scores earned with traps enabled.

## Approved implementation parameters — 26 October 2026

These two parameters were selected by **Babuni.dev** after reviewing a proposed staged implementation plan. They are approved **design decisions**, not evidence that the feature has been implemented:

1. **Trap frequency:** With the optional **Traps** mode enabled, a red trap replaces a normal button on **10% of spawns**. With Traps disabled, red traps never spawn. No further guaranteed spacing or streak-prevention rule has been specified.
2. **On red-button tap:** Trigger **Game Over immediately**, ending active tapping/trap generation. **Points that were already earned but are still floating, combining, moving, or held in the green score balance finish collecting** through the existing score-fusion mechanism. The final high-score result should be recorded **after those pending points settle**, avoiding lost or double-counted earned points. This clarification does not authorize additional points to be created after the trap was tapped.

The distinction is important: **the game ends at once, but existing earned points complete their normal visual/accounting transfer**. It is not a delay in triggering Game Over. Handling of pending *time bonuses*, concurrent tap/expiry races, and Traps-toggle persistence between rounds is **not** additionally specified by these decisions.

## Gameplay intent

**Patience and temptation.** A red button is not a normal target. The player can risk ending a run by tapping it, or avoid tapping while points accumulate automatically. Red buttons follow the same normal spawn placement, rotation, lifespan, and destruction cycle; **if untouched**, the trap expires, shatters, and the next button can spawn. Merely letting the trap exist produces three passive points every one-third second (nine per second in Babuni.dev's stated intended rate). The emitted points must enter the ordinary center-origin floating-number physics and score collection flow; no invisible direct award should bypass those visuals or fusion logic.

**Score provenance.** At Game Over, the host-owned leaderboard needs to record whether the run had Traps enabled. A **small red button next to each qualifying player name** communicates this. The new field or migration mechanism has **not** been designed or implemented; do not invent a current API schema. The saved state represents that the mode was active, not necessarily that a trap was clicked.

## Boundaries, unknowns and verification

- All nine items are **unchecked**. Do not treat any as coded, tested, signed, deployed or released.
- No code change is requested by this documentation entry. The existing signed Android release and host/guest QA remain the immediate development priority.
- This specification **resolves** earlier documentation gaps about trap lifetime, retirement, spawn/rotation/destruction parity, passive point emergence and leaderboard icon placement.
- **Now decided:** trap replacement probability is **10% of eligible normal spawns when enabled**, and **already-earned pending points complete score fusion** after instant Game Over.
- **Still unspecified:** handling of rare tap/expiry races, any deterministic spacing guarantee between traps, treatment of pending *time bonuses* after a trap hit, and optional-mode persistence across new rounds. Do not invent answers.
- The original seven-category checklist remains a separate historical source in [HISTORICAL_CHECKLIST_2026-10-25.md](HISTORICAL_CHECKLIST_2026-10-25.md). Its shorter six-item Trap Mode summary must not be retroactively rewritten as though it originally contained these nine tasks.

## Staged implementation plan — approved design, no implementation yet

**Goal:** Reuse existing Button Game systems and keep normal mode unaffected. Each stage is a **future task**, not a completed change.

1. **Pre-game Traps toggle and red artwork.** Reuse the established four-hole clothing-button appearance in red and add the labeled checkbox/icon before the run. Disabled mode remains identical to current normal gameplay. Keep the mode fixed for the duration of each round unless Babuni.dev later directs otherwise.
2. **Spawn selection and ordinary lifecycle.** With traps enabled, select a red replacement on **10%** of button spawns. Use the same spawn position, rotation, animation, life duration and shattering as the normal button. An untouched trap ages out and yields the next normal/random spawn.
3. **Trap taps and immediate Game Over.** A tap on red ends play **immediately**; stop new button/trap activity. It must not be treated as a successful scoring tap. The already-earned pending points still travel/merge/fuse normally, and the finalized score is captured only after that transfer completes. Avoid introducing separate accounting just for traps.
4. **Passive score emission.** During a red button's *active lifetime*, issue **3 points every one-third second** from the normal central emitter. Use the same visible floating numbers, collision/merging, expiry and green score fusion as standard score production. No invisible direct-score shortcut, and no passive emission after a red button has been tapped.
5. **Host-owned leaderboard mode marker.** At completed run submission, save whether **Traps was enabled** alongside the existing four final statistics on the Android **host**. Display a small red-button icon beside names for trap-enabled scores. Do not create guest-owned persistent rankings.
6. **Targeted verification before release.** Test disabled mode for unchanged behavior, enabled spawn frequency with deterministic/randomness-controlled tests, normal red expiry/shatter, immediate loss on tap, no new point creation after loss, correct settling of already-earned pending points, and the host/guest display and persistence of the red icon. Build the normal Android package and perform a short real-device test when implementation is requested.

**Status:** Planning/documentation only, **all nine original checkboxes remain unchecked**. No source changes, builds, APKs or tests are asserted.

## Implementation checkpoint (future only)

The next step requires **Babuni.dev's explicit request to start coding**. Do not treat agreement on these design parameters or this staged plan as authorization to implement the feature.

## Attribution and evidence

All nine requirements and the “rewards patience and punishes careless tapping” design intent come from Babuni.dev-provided message in this project conversation dated 26 October 2026. This document records that creative direction; it does not claim the assistant invented or implemented the feature.
