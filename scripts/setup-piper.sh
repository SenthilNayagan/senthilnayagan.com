#!/usr/bin/env bash
# One-time local setup for the Listen feature's audio pipeline: a project-local Python venv
# running Piper TTS (github.com/OHF-Voice/piper1-gpl), plus the Ryan voice model it narrates
# with. Everything this script creates lives under .piper/ (git-ignored) — nothing here is
# committed, and nothing here is needed by site visitors (see lib/audio.js for why).
#
# Prerequisites (not installed by this script): python3, and espeak-ng (`brew install espeak-ng`
# on macOS) — Piper's phonemizer shells out to it.
set -euo pipefail

cd "$(dirname "$0")/.."

PIPER_DIR=".piper"
VENV_DIR="$PIPER_DIR/venv"
MODEL_DIR="$PIPER_DIR/models"
MODEL_NAME="en_US-ryan-high"

if ! command -v espeak-ng >/dev/null 2>&1; then
  echo "espeak-ng not found. Install it first: brew install espeak-ng (macOS)" >&2
  exit 1
fi

if [ ! -d "$VENV_DIR" ]; then
  echo "Creating Python venv at $VENV_DIR..."
  python3 -m venv "$VENV_DIR"
fi

echo "Installing piper-tts + huggingface_hub..."
"$VENV_DIR/bin/pip" install --quiet --upgrade pip piper-tts huggingface_hub

mkdir -p "$MODEL_DIR"
if [ ! -f "$MODEL_DIR/$MODEL_NAME.onnx" ] || [ ! -f "$MODEL_DIR/$MODEL_NAME.onnx.json" ]; then
  echo "Downloading $MODEL_NAME voice model (~110MB, one-time)..."
  "$VENV_DIR/bin/python" -c "
from huggingface_hub import hf_hub_download
import shutil

for ext in ['onnx', 'onnx.json']:
    path = hf_hub_download(
        repo_id='rhasspy/piper-voices',
        filename=f'en/en_US/ryan/high/${MODEL_NAME}.{ext}',
    )
    shutil.copy(path, '$MODEL_DIR/${MODEL_NAME}.{ext}'.replace('{ext}', ext))
"
fi

echo "Piper setup complete: $MODEL_DIR/$MODEL_NAME.onnx"
