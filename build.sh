#!/bin/bash
# Vercel build script for SATC - runs from repo root
set -e
cd SATC

# Copy character images for static deployment
mkdir -p avatars
cp "../SATC files"/*.png avatars/ 2>/dev/null || true
cp "../SATC files"/*.jpg avatars/ 2>/dev/null || true

# Install deps and build
pip install -r requirements.txt
python build_site.py
