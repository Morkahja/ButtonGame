# Button Game — Red Trap Button

**Feature status: ENTIRE FEATURE NOT STARTED.**

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

## Gameplay intent

**Patience and temptation.** A red button is not a normal target. The player can risk ending a run by tapping it, or avoid tapping while points accumulate automatically. Red buttons follow the same normal spawn placement, rotation, lifespan, and destruction cycle; **if untouched**, the trap expires, shatters, and the next button can spawn. Merely letting the trap exist produces three passive points every one-third second (nine per second in Babuni.dev's stated intended rate). The emitted points must enter the ordinary center-origin floating-number physics and score collection flow; no invisible direct award should bypass those visuals or fusion logic.

**Score provenance.** At Game Over, the host-owned leaderboard needs to record whether the run had Traps enabled. A **small red button next to each qualifying player name** communicates this. The new field or migration mechanism has **not** been designed or implemented; do not invent a current API schema. The saved state represents that the mode was active, not necessarily that a trap was clicked.

## Boundaries, unknowns and verification

- All nine items are **unchecked**. Do not treat any as coded, tested, signed, deployed or released.
- No code change is requested by this documentation entry. The existing signed Android release and host/guest QA remain the immediate development priority.
- This specification **resolves** earlier documentation gaps about trap lifetime, retirement, spawn/rotation/destruction parity, passive point emergence and leaderboard icon placement.
- The exact random replacement probability, handling of rare tap/expiry races, pending-score settlement after immediate Game Over and optional-mode persistence across new rounds are **not explicitly specified** here; do not invent answers.
- The original seven-category checklist remains a separate historical source in [HISTORICAL_CHECKLIST_2026-10-25.md](HISTORICAL_CHECKLIST_2026-10-25.md). Its shorter six-item Trap Mode summary must not be retroactively rewritten as though it originally contained these nine tasks.

## Implementation checkpoint (future only)

Only once Babuni.dev requests development: plan the pre-game checkbox; extend target lifecycle carefully without changing existing normal button rules; reuse existing floater/fusion accounting for passive points; define behavior at immediate Game Over; add host-score mode metadata and the leaderboard icon; add deterministic tests and Android two-device verification. **No such implementation has started.**

## Attribution and evidence

All nine requirements and the “rewards patience and punishes careless tapping” design intent come from Babuni.dev-provided message in this project conversation dated 26 October 2026. This document records that creative direction; it does not claim the assistant invented or implemented the feature.
