#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
#  CODZERO WhatsApp Bot — Termux Installer
#  Developer : MRZEROEXPLOIT & PAYOEBOI
#  Contact   : +263780706627
#  Email     : mrzeroexploit@gmail.com
# ============================================================
# This script scaffolds the full CODZERO bot project folder,
# writes all source files, and installs dependencies.
#
# Usage:
#   1) pkg install nano -y   (if you don't have it)
#   2) nano install.sh       (paste this whole file, save with CTRL+O, exit CTRL+X)
#   3) bash install.sh
# ============================================================

set -e

echo "=============================================="
echo "   CODZERO WhatsApp Bot — Installer"
echo "   Dev: MRZEROEXPLOIT & PAYOEBOI"
echo "=============================================="
echo ""

# ---- 1. System packages ----
echo "[1/6] Updating Termux packages..."
pkg update -y && pkg upgrade -y

echo "[2/6] Installing system dependencies (node, git, ffmpeg, imagemagick)..."
pkg install -y nodejs-lts git ffmpeg imagemagick

# ---- 2. Project folder ----
BOT_DIR="$HOME/codzero-bot"
echo "[3/6] Creating project folder at $BOT_DIR ..."
mkdir -p "$BOT_DIR"
cd "$BOT_DIR"

mkdir -p commands/core
mkdir -p commands/group
mkdir -p commands/utility
mkdir -p commands/fun
mkdir -p lib
mkdir -p data
mkdir -p session
mkdir -p media

echo "[4/6] Writing config and source files..."

# ---- package.json ----
cat > package.json << 'EOF'
{
  "name": "codzero-bot",
  "version": "1.0.0",
  "description": "CODZERO WhatsApp Bot by MRZEROEXPLOIT & PAYOEBOI",
  "main": "index.js",
  "type": "commonjs",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@whiskeysockets/baileys": "^6.7.9",
    "pino": "^9.4.0",
    "qrcode-terminal": "^0.12.0",
    "chalk": "^4.1.2",
    "axios": "^1.7.7",
    "sharp": "^0.33.5",
    "node-cache": "^5.1.2",
    "fs-extra": "^11.2.0"
  }
}
EOF

echo "[5/6] Installing npm dependencies (this can take a few minutes)..."
npm install --no-audit --no-fund

echo "[6/6] Setup complete. Source files will now be written by the companion"
echo "      file-writer script (see codzero_files.sh) before first run."
echo ""
echo "Next steps:"
echo "  cd ~/codzero-bot"
echo "  bash codzero_files.sh    # writes all bot source files"
echo "  node index.js            # first run -> enter your phone number for pairing code"
echo ""
