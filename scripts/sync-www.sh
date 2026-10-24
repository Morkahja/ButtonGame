#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/android/app/src/main/assets/www"
mkdir -p "$DEST/assets/sfx"
cp "$ROOT/index.html" "$DEST/"
cp "$ROOT/game.js" "$DEST/"
# Root-level assets (sprites, font) — skip nested sfx dir
find "$ROOT/assets" -maxdepth 1 -type f -exec cp {} "$DEST/assets/" \;
cp "$ROOT/assets/sfx/"*.ogg "$DEST/assets/sfx/" 2>/dev/null || true
echo "Synced web assets -> $DEST"
