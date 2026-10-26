# Button Game — Audio Cues and Asset Status

**State as of 2026-10-26:** All three newer custom recordings are in GitHub under root `sfx/`, but are **not yet present in the packaged web/Android asset trees**. The current game code references them and falls back to older recordings when unavailable.

| Audio | Trigger | Current source |
| --- | --- | --- |
| `impact1.ogg`–`impact4.ogg` | Ordinary button hits | `sfx/` and `assets/sfx/`; bundled Android copies exist |
| `Bell1.ogg`–`Bell3.ogg` | Eligible combination milestones such as 7, 14, 21 and 37 | `sfx/` and `assets/sfx/`; bundled Android copies exist |
| `4273.ogg` | Special center-stage 42/73 reveal | `sfx/4273.ogg` **only** |
| `QuickStrikepoints.ogg`, `QuickStrikepoints1.ogg` | Randomly chosen successful Quick Strike tap cue | `sfx/` **only** |

The custom files are referenced by `game.js` at relative paths inside `assets/sfx/`. The earlier signed, manually packaged APKs historically included these recordings. A clean current GitHub checkout / CI build cannot reproduce them until source files are copied into `assets/sfx/` and the Android `www/assets/sfx/` mirror.

## Implementation notes

- Playback uses the Web Audio API, preloaded buffers, impact pitch variation and softened attacks for frequent input.
- The original special reveal and Quick Strike playback gains were adjusted during development to avoid drowning out ordinary cues; physical phone loudness is still not verified on the newest source build.
- A qualifying combination milestone plays the appropriate standard cue; the two center-stage special reveals choose `4273.ogg` instead of duplicating a standard bell at that exact moment.
- Fallback keeps the game playable if a custom recording fails to load. Fallback is **not** evidence of complete sound packaging.

## Required release checks

1. Resolve canonical source and sync behavior for `sfx/` → `assets/sfx/` → Android packaged assets.
2. Have GitHub Actions check all custom OGG paths **inside** the assembled APK and trigger on `sfx/**` changes.
3. Verify cue routing, no missing-file errors and volume balance on an Android phone.
4. Do not remove or transcode the creator-supplied originals without a documented reason and approval.

See [ROADMAP.md](ROADMAP.md) and [docs/QA.md](docs/QA.md).
