# Button Game — Visual and Interaction Design

Status: **as implemented in current HTML/CSS/JS**, with device layout and sound still requiring QA. This document describes existing presentation and intentional behavior; changes to the visual grammar require creator review.

## Stage, button and gesture

- Logical stage: 450 × 450 coordinates. Earlier Flash and remake assets remain as historical reference rather than a specification for every current mechanic.
- Main target: turquoise four-hole jacket button with white rings, backed by `assets/button.svg`. Nominal art diameter is roughly 62 pixels; the interaction footprint persists during destruction.
- Spawn: randomized in-stage coordinates and rotation limited to roughly ±45°; obstacles near HUD are avoided.
- Player can tap repeatedly during the fade and shatter. Active Quick Strike is entered only via a qualifying first tap in the narrow window after the spawn-in finishes.
- Quick Strike animation enlarges and spins the button, changes its central point emitter to green and doubles every qualifying target tap, including continued taps during its remaining life.

## Look and motion

- Predominantly black stage with cyan, white, green, and gold accents.
- HUD: Points on top-left, Time on top-right; combined Reaction/APM plate near the bottom center. Green unsettled-score balance and gold unsettled-time balance are separate from the final displayed totals.
- Button destruction is a sequence of visible cracks, separation, shatter, then fade using recognizable fragments of the SVG. The creator rejected arbitrary full-screen glowing fragments and destruction-driven enlargement.
- Floating values use directional gravity, bouncing and whole-label collision extents so digits stay inside the playfield. Gradual merges create distinct numerical milestones, rather than collapsing every cluster instantly.
- Green score pickups and gold time pickups cross the foreground layer, deposit into collector balances and visibly decrement as totals rise.

## Number-based moments

| Event | Visible behavior | Current gameplay result |
| --- | --- | --- |
| Ordinary tap | Target pulse/flash; floating number | Pending +1, or +2 on active Quick Strike |
| Merged 7 | Golden eligible floater / cue | +2 s bonus transfer |
| Merged 14 | Golden eligible floater / cue | +3 s bonus transfer |
| Merged 21 | Scatter, duplicate and reassemble into a large golden 42 | 42-point result and +5 s at the 42 |
| Merged 37 | Move and flip to reveal large 73 | 73-point result and +4 s at the 73 |
| Natural 42/73 | Jackpot emphasis and credit flow | Corresponding 42/73 time bonus |

Detailed credit conservation differs between transformations and ordinary merged floaters; consult `game.js` before changing arithmetic.

## Leaderboard and game flow

- Timer starts on first button tap; Game Over waits for already-earned pending scores/time bonuses to settle.
- During active play, a subtle host high-score glimpse sits **beneath** the playfield at approximately 50% opacity with a downward fading gradient and no touch interception.
- At Game Over, the full host leaderboard scrolls vertically without an exposed scrollbar; Play Again resets gameplay.
- Scores shown are host records, not guest-side fabricated or cached rankings. The screen receives new guest data by polling the host at Game Over.

## Responsiveness and accessibility checkpoints

- Phone scaling is controlled by `fitToPhone()`; check that the scaled playfield, collector flight paths, buttons and scrolling score view are aligned.
- Target has keyboard interaction via Enter/Space in the browser. Focus visibility, language, small-screen legibility, reduced-motion accommodation, color contrast, and screen-reader clarity **have not been comprehensively audited**.
- The four statistics must remain legible and separate; no overlay should block replay or intercept active target taps.
- Screenshot/video evidence and a two-phone UX evaluation remain open in [QA.md](QA.md).

## Red/trap button

There is **no verified visual, behavioral or accessibility specification** for this remembered concept. Its color is only a label in a recovered idea, not implementation authority.
