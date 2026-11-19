#!/bin/bash

# Antigravity Phone Connect - Linux / macOS Web Tunnel Launcher
cd "$(dirname "$0")" || exit 1

echo "==================================================="
echo "  Antigravity Phone Connect - WEB ACCESS MODE"
echo "==================================================="
echo ""

# 0. Safe Orphan Cleanup
echo "[0/2] Cleaning up orphans..."
pkill -f "[n]ode server.js" >/dev/null 2>&1 || true
pkill -f "[n]grok" >/dev/null 2>&1 || true
pkill -f "[c]loudflared" >/dev/null 2>&1 || true
pkill -f "[p]inggy" >/dev/null 2>&1 || true

TARGET_PORT="${PORT:-3000}"
if command -v lsof &> /dev/null; then
    for pid in $(lsof -ti:"$TARGET_PORT" 2>/dev/null); do
        kill -9 "$pid" 2>/dev/null
    done
elif command -v fuser &> /dev/null; then
    fuser -k "${TARGET_PORT}/tcp" >/dev/null 2>&1
fi

# 1. Check Node.js & ensure dependencies are installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed (18+ LTS required)."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing Node.js dependencies..."
    npm install || exit 1
fi

# 2. Check Python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python 3 is not installed."
    exit 1
fi

# 3. Check for .env file
if [ ! -f ".env" ]; then
    echo "[WARNING] .env file not found. Creating configuration template..."
    echo ""
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "[SUCCESS] .env created from .env.example!"
        echo "[ACTION] Open .env and set APP_PASSWORD and TUNNEL_PROVIDER (cloudflare, pinggy, serveo, or ngrok)."
        exit 0
    else
        echo "[ERROR] .env.example not found. Cannot create .env template."
        exit 1
    fi
fi
echo "[INFO] .env configuration found."

# 4. Launch everything via Python
echo "[1/1] Launching Antigravity Phone Connect..."
echo "(This will start both the server and the web tunnel)"

if [ ! -d "venv" ]; then
    echo "[INFO] Creating Python virtual environment..."
    if ! $PYTHON_CMD -m venv venv; then
        echo "[ERROR] Failed to create Python venv. On Debian/Ubuntu install: sudo apt-get install -y python3-venv"
        exit 1
    fi
fi

if [ -f "venv/bin/activate" ]; then
    # shellcheck disable=SC1091
    source venv/bin/activate
fi

$PYTHON_CMD launcher.py --mode web
exit $?
