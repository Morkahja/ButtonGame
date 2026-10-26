# Button Game — Creative Concept

**Direction:** Creator-led project, Babuni.dev.  
**State:** A reconstruction of the demonstrable concept, not a claim to recover every discussion from the inaccessible long development chat.  
**Last reviewed:** 2026-10-26.

## Core experience

The player tries to score as much as possible within a round begun by striking a single moving button. Its simple input conceals a layered, tactile system: a four-hole turquoise jacket button appears, reacts to rapid hits, fractures into recognizable pieces, and returns elsewhere. Each press releases a number into the playfield. Numbers bounce and combine; their transformations become part of the spectacle rather than merely updating a counter.

The intended feeling is a playful physical toy, not a menu-heavy game. Numbers have motion and apparent weight. Scores are *earned and collected visibly*: floating values and special effects move to a green score balance before being credited to the white Points total. Golden time bonuses likewise fly to a separate balance and flow into the countdown. Game Over waits for pending earned rewards to finish resolving.

## Currently implemented mechanics (source level)

- 450 × 450 logical stage, 60-second starting countdown on the first target press, with legacy-style 15 FPS target-state updates alongside animated visual effects.
- Button appears at randomized stage coordinates with a small randomized tilt. Presses during the button's fade and destruction remain meaningful.
- Quick Strike is available to the first hit after the spawn-in animation in a 73 ms window; successful strikes give that target doubled per-tap points and distinctive visual/audio response.
- Floating score units collide with the playfield and HUD boundaries, merge gradually and eventually settle into the score collector.
- Combination milestones include 7, 14, 21, 37, 42 and 73. Implemented time rewards: 7 → +2 s; 14 → +3 s; 42 → +5 s; 73 → +4 s. Values 21 and 37 are transformation triggers, not direct time awards.
- Special 21 → 42 and 37 → 73 sequences create deliberate center-stage animations and resolved score payouts.
- Game Over provides a scrolling host-owned high-score table and Play Again. A translucent, gradient-faded preview of the top scores is visible beneath the game during play.

These are statements about the current source, not confirmation of physical-device behavior.

## Shared social play

The creator's **Serve on Wi-Fi** direction lets one Android phone act as host while other players join from devices on the same network using an address or QR code. The Android host controls the shared score ledger; players report final points, reaction time, actions per minute and session duration. This is **parallel local play and shared rankings**, not a synchronized physics simulation or peer-to-peer game.

## Visual and interaction identity

- Turquoise button with four holes, white concentric details, cracks made from fragments of the actual button art.
- Black field, cyan and white interface, green score collector and gold time rewards.
- Compact Points / Time panels above and Reaction / APM panel below.
- Bouncy numerical combinatorics and changing sound cues without losing the focus on one central action.

Specific sizes, animation and positioning contracts are recorded in [docs/DESIGN.md](docs/DESIGN.md).

## Historical roots

`Game.swf` and `Game.html` preserve an earlier Flash-era game. `ChatGPT Remake/` is a separate HTML5 reconstruction of that legacy artifact, with its own behavior and retrospective notes. The current game diverges through button graphics, score physics, special combinations, audio, Android hosting and the host-owned multiplayer leaderboard. Keep these stages distinct when telling the portfolio story.

## Future concept boundary: red button / trap

A recovered to-do list mentions a **red/trap button game mode**; the user also remembers a **red button trip/trap mechanic** from a long archived conversation. No reliable primary specification was retrieved. Trigger, penalties, spawn logic, accessibility implications and connection to current scoring are **unknown**. Status: **idea / original discussion not recovered / not approved for implementation**. It must not be silently treated as an existing or scheduled feature.

Other exploratory concepts mentioned: Bluetooth hosting and true peer-to-peer multiplayer. Neither replaces the approved Android Wi-Fi model.

## Non-goals for the immediate release

Do not redesign the core button, invent new game modes, add a second TEST application or implement unapproved features while completing the existing Android update. High-score preservation for the beta test data is not required by the creator. Reliability, sound completeness, signing and actual two-device verification come first.
