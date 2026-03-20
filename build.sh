#!/bin/bash
# Vercel build script for SATC - runs from repo root
# Uses the existing index.html (your custom design) and fixes asset paths for deployment
set -e
cd SATC

# Copy all assets (character images, backgrounds) for static deployment
mkdir -p avatars
cp "../SATC files"/*.png avatars/ 2>/dev/null || true
cp "../SATC files"/*.jpg avatars/ 2>/dev/null || true
cp "../SATC files"/*.svg avatars/ 2>/dev/null || true

# Fix asset paths in index.html for Vercel (only when VERCEL env is set)
# Relative paths won't work when served from root - use /avatars/
if [ -n "$VERCEL" ]; then
  perl -i -pe 's|\.\./SATC%20files/|/avatars/|g' index.html
  perl -i -pe "s|AVATAR_BASE = '\.\./SATC files/'|AVATAR_BASE = '/avatars/'|g" index.html
fi
