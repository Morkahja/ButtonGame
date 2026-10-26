# Button Game — Human / AI Collaboration Record

## Principle

The creator owns the creative direction of Button Game. AI assistance is a tool used for interpretation, coding, testing, drafting and historical synthesis. **The creator's ideas are never retroactively attributed to an AI**, and an AI suggestion is not accepted simply because it appears in a chat or draft.

## Evidence hierarchy

1. Explicit creator direction or decision preserved in accessible discussion or provided documents.
2. Files, commits, tests and successful/failed CI runs at a specific revision.
3. Dated original `DEVLOG.md` / `CHANGELOG.md` explaining recorded iterations.
4. Retrospective summaries, including the creator-provided 2026-10-26 "Complete To-Do List".
5. Inference or proposal, always clearly labelled and never turned into a historical fact.

Missing archived messages must remain **unrecovered**, not paraphrased from imagination. The red/trap button rules are a concrete example: reference is known, specification is not.

## What each substantial entry records

| Field | Required content |
| --- | --- |
| Date and scope | Precise work session / repository |
| User direction | What the creator requested, intended or objected to |
| AI contribution | Suggested alternatives, generated implementation or investigation |
| Iteration | Rejected attempts, corrections, technical failures and trade-offs |
| Decision | Accepted, rejected, deferred or pending; explicit attribution |
| Implementation | Exact paths and commit/PR when changed |
| Verification | What actually ran and its result; distinguish CI from device testing |
| Remaining uncertainty | Unverified behavior, missing source or unresolved approval |

## Concrete project examples

- **Button shatter:** first AI-produced approximation enlarged the button and used arbitrary glowing shapes; the creator rejected that appearance. The revised solution fractured the recognizable turquoise jacket button into its actual pieces. This change of direction is part of the artwork.
- **High-score ownership:** creator-directed one-host ledger superseded a guest-local score supplementation approach. The latter should remain documented as an abandoned attempt rather than described as current behavior.
- **Android native build:** earlier packaged APKs contained modern web assets but stale Kotlin binaries; later CI compiled the native v2 storage. Successful compilation is not equivalent to an already-installed release.
- **Guest Game Over bug:** user observed missing refresh; assistant traced a client polling condition and implemented a testable change. Physical two-device outcome is still open.

## Recovered collaboration and corrective feedback (2026-10-24–26)

**Faithful shatter.** The creator did not merely request “an explosion.” A first AI prototype enlarged/faded the button and substituted glowing polygon debris; the creator rejected it and insisted on the same four-hole turquoise button visibly cracking apart. AI subsequently restructured the fragment animation around the real SVG and updated timed states. The correction belongs to the creator and should be presented alongside the less accurate first try.

**Numeric choreography.** A working AI implementation of the 21→42 transformation duplicated 21 onscreen `1`s into 42 visual singles. The later creator direction was more particular: 21 independent singles should move, bounce, each transform to `2` in flight, and finally assemble 42. An implementation that passed tests was **not** automatically an accepted visual concept; the follow-up request superseded it. AI implemented the revised version and recorded conservation and simulated motion checks. Avoid claiming the doubling-to-42-units version is the creator's final design.

**Readability over algorithmic convenience.** The creator's iterative critiques and requests led to slower number growth, collision boundaries that respect entire rotated text, a collectible score bank with its own visible arithmetic, refined HUD grouping, and subtle peripheral score preview. Several changes required technical reinterpretation, e.g. moving pickup flights outside a clipped stage stacking context. Distinguish aesthetic criteria supplied by the creator from geometry and DOM solutions designed by AI.

**Misrepresenting release status.** AI repeatedly produced web-only repackaged APKs while referring to saved host statistics that were not yet present in compiled Kotlin. The creator challenged the discrepancy. Full native GitHub Actions compilation was the required corrective implementation, not proof earlier deliverables were complete. Later, when asked for a normal signed update, AI invented a separate TEST variant to protect disposable scores despite explicit creator rejection of that concern; the branch changes were reverted. Record both failures as assistant-origin mistakes, **never** as creator-approved experiments. Repeated unresolvable chat download links reinforced the difference between “file built” and “release received.”

**One ledger and spectator freshness.** The creator specified that all Wi-Fi players submit to one Android-host-owned scoreboard. AI's temporary guest-local statistics cache was an incorrect attempt to bridge the old native host and was removed. The creator then discovered the stationary Game Over list did not update when another player submitted; AI found a polling condition that excluded Game Over and implemented a targeted 3-second refresh and CI check. Actual two-device verification remains a distinct task.

**Evidence and boundaries.** The 2026-10-26 recovery search did not uncover the archived original red/trap mechanics or complete historical to-do inventory. The creator's memory that such discussion existed is itself relevant historical context, but it is not a complete rule specification. A red record button from an unrelated project is not valid evidence for Button Game. Future history entries should distinguish (a) user recollection, (b) directly quoted direction in accessible chat, (c) retrospective GitHub log, and (d) independently tested code.

## Publication rule

Publish an edited account of collaboration, never a raw private transcript. Do not expose credentials, keystore details beyond nonsecret identity checks, personal chat metadata or unrelated information. When a retrospective summary conflicts with the checked-in source, explain and correct it with evidence while retaining the earlier record as history.

## Maintenance links

- Current constraints: [AGENTS.md](../AGENTS.md)
- Chronology: [root DEVLOG.md](../DEVLOG.md), [docs/DEVLOG.md](DEVLOG.md), [CHANGELOG.md](../CHANGELOG.md)
- Creative decisions: [docs/DECISIONS.md](DECISIONS.md)
- Verification: [docs/QA.md](QA.md)
