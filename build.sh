#!/bin/bash
# Vercel build: SATC app at site root + standalone pages (e.g. new-page/)
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

OUT="dist"
rm -rf "$OUT"
mkdir -p "$OUT/avatars" "$OUT/new-page"

cp SATC/index.html "$OUT/index.html"
cp new-page/index.html "$OUT/new-page/index.html"

cp "SATC files"/*.png "$OUT/avatars/" 2>/dev/null || true
cp "SATC files"/*.jpg "$OUT/avatars/" 2>/dev/null || true
cp "SATC files"/*.svg "$OUT/avatars/" 2>/dev/null || true

# Paths in SATC index: ../SATC%20files/ → /avatars/ when deployed
if [ -n "$VERCEL" ]; then
  perl -i -pe 's|\.\./SATC%20files/|/avatars/|g' "$OUT/index.html"
  perl -i -pe "s|AVATAR_BASE = '\.\./SATC files/'|AVATAR_BASE = '/avatars/'|g" "$OUT/index.html"
fi
