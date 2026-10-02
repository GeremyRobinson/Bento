#!/usr/bin/env bash
# Builds the app and copies it to the repository root, which GitHub Pages serves at /bento/.
# The original single-file app stays reachable at /bento/legacy/.
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
rm -rf ../assets ../fonts
cp -R dist/. ..
