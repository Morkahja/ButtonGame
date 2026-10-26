# Button Game

Button Game is an interactive HTML5 reaction-and-scoring game by the creator of [babuni.dev](https://babuni.dev), with an Android application that hosts local Wi-Fi sessions and maintains the shared high-score leaderboard.

## Gameplay

Players tap spawned, rotating targets, collect floating score values, combine numerical results, and manage a timed session. Existing mechanics include Quick Strike, special 21→42 and 37→73 transformations, time bonuses, and a Game Over leaderboard showing Points, Reaction (ms), APM, and Session Time.

## Platforms and architecture

- Web game: HTML, JavaScript, and audio assets.
- Android host: native application, embedded web content, Wi-Fi HTTP server, and host-owned score storage.
- Guests: join the Android host over local Wi-Fi; score submissions go to the host.

See [architecture](docs/ARCHITECTURE.md) and [installation](INSTALL.md).

## Project status (2026-10-26)

Core gameplay and Android hosting are implemented. A Game Over leaderboard refresh fix passed automated tests and native compilation, but the corrected signed APK and two-device verification remain outstanding. Three sound recordings need reproducible packaging in clean builds.

See [roadmap](ROADMAP.md) and [changelog](CHANGELOG.md). Do not interpret compilation success as physical-device verification.

## Portfolio record

The game is a standalone project intended for future presentation within babuni.dev. Its repository preserves creative direction, development history, technical decisions, and verification boundaries. See [concept](CONCEPT.md), [development journal](docs/DEVLOG.md), and [collaboration record](docs/AI_COLLABORATION.md).

## Authorship

Creative direction and approval belong to the human creator. AI assistance is documented separately and does not imply ownership of the original concept.
