# Technical architecture

## Established structure

The game uses HTML5 and JavaScript. Android packages a copy of the web assets under `android/app/src/main/assets/www/`. The Android host runs a local HTTP server for guests on the same Wi-Fi network.

The host is the authoritative score store. Guest clients submit results through `POST /api/scores` and read rankings through `GET /api/scores`. Stored result fields are Points, Reaction (ms), APM, and Session Time.

Game Over leaderboard polling was changed to every three seconds while visible; gameplay preview polling remains at twelve seconds. The welcome screen does not poll. A foregrounded Game Over page refreshes immediately.

## Build and deployment

GitHub Actions compiles native Android builds. The documented recent build succeeded, but its debug certificate does not replace the existing release certificate and its unsigned release artifact is not directly installable. Asset synchronization and signing remain release blockers.

## Risks requiring verification

Server startup failure, activity hosting-state restoration, readiness timing, direct JSON score writes, permissive submission parsing, unauthenticated LAN score submissions, and release WebView debugging.

## Verification boundary

This document summarizes the supplied development record and repository documentation; it is not a complete independent source-code security audit. See ROADMAP.md.
