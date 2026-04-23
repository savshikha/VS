#!/usr/bin/env bash
# Serve the whole repo so /SATC/ and /new-page/ both work (not only the SATC folder).
cd "$(cd "$(dirname "$0")" && pwd)"
exec python3 -m http.server "${1:-8000}"
