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

## Publication rule

Publish an edited account of collaboration, never a raw private transcript. Do not expose credentials, keystore details beyond nonsecret identity checks, personal chat metadata or unrelated information. When a retrospective summary conflicts with the checked-in source, explain and correct it with evidence while retaining the earlier record as history.

## Maintenance links

- Current constraints: [AGENTS.md](../AGENTS.md)
- Chronology: [root DEVLOG.md](../DEVLOG.md), [docs/DEVLOG.md](DEVLOG.md), [CHANGELOG.md](../CHANGELOG.md)
- Creative decisions: [docs/DECISIONS.md](DECISIONS.md)
- Verification: [docs/QA.md](QA.md)
