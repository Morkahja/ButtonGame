# Button Game — Portfolio Content and Publication Outline

The website **babuni.dev** is itself a portfolio project. Button Game should eventually show not only a playable artifact but also the creator's decisions and the AI-assisted engineering process.

## Entry metadata

- **Name:** Button Game / Buttongame
- **Type:** Arcade game; historical Flash-to-HTML5 reconstruction; native Android Wi-Fi host
- **Creative director / project creator:** Babuni.dev
- **Current condition:** Playable beta in source; latest normal-app signed release update and on-device multiplayer acceptance remain open
- **Repository:** https://github.com/babunidev/ButtonGame
- **Primary evidence:** `Game.swf`, `ChatGPT Remake/`, `DEVLOG.md`, `CHANGELOG.md`, active code, GitHub commits and CI runs

## Proposed portfolio sections (presentation proposal, not approved site implementation)

1. **Play it:** direct current game experience, with honest indication that host-based shared rankings require Android.
2. **Origin:** the preserved Flash artifact and its original one-button loop.
3. **Transformation:** earlier remake and present visual language—four-hole turquoise button, staged shatter, physical score numbers.
4. **Unexpected systems:** Quick Strike, milestone numbers, 21→42 and 37→73 transformations, gold time bank and green score collector.
5. **Social layer:** Serve on Wi-Fi, QR joining and host-owned standings.
6. **Development journal:** creator requests, AI interpretations, rejected prototypes, mistakes, recovered facts and actual tests.
7. **Historical future designs:** the creator's [complete nine-item Red Trap Button design](TRAP_MODE.md), **entire feature not started**, plus separate deferred Bluetooth/peer-to-peer ideas.

## Media/evidence inventory

| Media | Current status | Notes |
| --- | --- | --- |
| Original Flash game and wrapper | Stored in repository | Requires appropriate legacy viewing method; do not claim modern browser support |
| Earlier HTML5 reconstruction | Stored under `ChatGPT Remake/` | Separate phase, not the modern game |
| Current HTML/JS and SVG target | Stored in repository | Suitable source for future captured screenshots |
| Game Over, number merges, Android host joining | No publication-ready screenshots/video verified by this audit | Capture only after checking actual output |
| Latest delivered, original-certificate Android build | Not established for newest Game Over fix | Do not present earlier signed APK as newest release |
| Original seven-category checklist with Trap Mode rules | [Recovered historical checklist](HISTORICAL_CHECKLIST_2026-10-25.md) | Earlier six historical tasks preserved; later nine-item detailed design at [TRAP_MODE.md](TRAP_MODE.md); not implemented |
| Full archived development conversation | Not directly recovered | Additional dialogue, rationale and unrecorded details remain unavailable |

## Recovered in-game content and narrative beats

This section describes **established historical game content**, not approved portfolio page copy or new features:

- **Earlier Flash/remake presentation:** a black 450 × 450 stage with original German instructions/graphics, a simple appearing/fading cyan target and direct click-based point/time addition. The separate `ChatGPT Remake/README.md` says the source game lacked sound and a restart action. Preserve the distinction between this source-backed retrospective analysis and the creator's missing original conversations.
- **Instruction wording:** the modern current-game text `Smash it!` explicitly replaced `Klick druff da` during the October 25 work on the 37→73 sequence. This language change marks the move to a more kinetic, international-feeling presentation; a broader branding rationale is not documented.
- **Recognizable identity:** a turquoise four-hole button is not disposable scenery; it must remain visually identifiable while cracking, scattering and accepting late hits. Subtle central cyan emitter becomes green for a Quick Strike.
- **Numerical theater:** the 37 moves upward, flips to 73 and is collected as exactly 73; the 21 animation first used duplication, later became 21 rebounding `1`s changing into `2`s to form a single 42. Ordinary totals also merge, glow, ring at exact milestones, become collectible green values and feed the visible score balance.
- **Time and reward cues:** gold indicates number-based time eligibility. The currently established table is 7→2s, 14→3s, 42→5s, 73→4s; 21/37 are transitions, not themselves time payouts. Older journal entries awarded +3s more broadly—retain them as earlier builds rather than current rules.
- **Co-presence:** Android `Serve on Wi-Fi`, QR joining, host-owned ranking, animated live players and a faded list beneath the running game are the local-social story, **not** a real-time synchronized shared playfield.

**Recovered historical concept:** The creator subsequently supplied a dedicated [nine-item Red Trap Button specification](TRAP_MODE.md). It adds ordinary target position/lifespan/rotation/destruction parity, untouched expiration/shatter/next spawn, center-emitted passive points (3 each ⅓ second; 9/s), and a small red indicator beside leaderboard names. The entire feature is **not started**, and the original full chat remains inaccessible. The earlier six-part checklist is preserved separately.

## Attribution and privacy

Credit the creator for original game vision, direction, requirements, decisions, criticism and acceptance/rejection. Credit AI for concrete code generation, documentation synthesis and engineering proposals as applicable. Avoid raw private chats, personal details, passwords, signing credentials and unverified claims of user intent.

A good case study explains **why the first shatter was rejected**, **why host-only score ownership mattered**, and **why an older APK could have new JavaScript but old Kotlin**, without laundering AI guesses into the creator's narrative.

## Publication readiness

Only mark features demonstrated when executable source or actual media support them. For multiplayer, show real two-device and persistence tests. For releases, link the exact versioned APK and verification record. For archived ideas, mark provenance and uncertainty explicitly.
