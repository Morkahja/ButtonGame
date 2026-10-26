#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$ROOT/android/app/src/main/assets/www"

mkdir -p "$ROOT/assets/sfx" "$DEST/assets/sfx"
cp "$ROOT/index.html" "$ROOT/game.js" "$DEST/"

# Top-level sprites/font; no unrelated source directories.
find "$ROOT/assets" -maxdepth 1 -type f -exec cp {} "$DEST/assets/" \;

# sfx/ holds the original recordings. Always synchronize those exact bytes
# into both the standalone browser game and the Android-hosted web bundle.
for source in "$ROOT/sfx/"*.ogg; do
  test -f "$source" || { echo "Missing sound sources in sfx/" >&2; exit 1; }
  file="${source##*/}"
  cp "$source" "$ROOT/assets/sfx/$file"
  cp "$source" "$DEST/assets/sfx/$file"
  cmp "$source" "$ROOT/assets/sfx/$file"
  cmp "$source" "$DEST/assets/sfx/$file"
done

for file in 4273.ogg QuickStrikepoints.ogg QuickStrikepoints1.ogg; do
  test -s "$ROOT/assets/sfx/$file"
  test -s "$DEST/assets/sfx/$file"
done

echo "Synced HTML, JavaScript, visuals and original OGG files to web and Android."
