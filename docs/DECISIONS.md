# Decisions and alternatives

## Established direction

**Host-authoritative scores.** The Android host maintains the shared leaderboard; guests submit results rather than keeping separate authoritative score databases. Existing architecture; do not replace without approval.

**One Android app identity.** The creator rejected an unnecessary separate TEST application and does not require preservation of existing test high scores. Deliver updates under the existing package identity and signing certificate.

**Live Game Over leaderboard.** A creator-reported missing guest score while the host remained on Game Over led to a polling fix. Automated regression and compilation passed; two-device behavior is still unverified.

**Preserve existing mechanics.** Reliability work is not authorization to redesign gameplay.

## Unapproved possibilities

Red/trap buttons, Bluetooth hosting, true peer-to-peer multiplayer, and an in-game high-score reset are ideas only. Requirements and creator approval are absent.

## Pending decisions

Portfolio embed versus external launch, visual case-study presentation, release distribution details, and appropriate LAN score-submission safeguards.

## Attribution note

This file reconstructs decisions from the supplied October 26, 2026 project review. It does not claim access to every historical conversation.
