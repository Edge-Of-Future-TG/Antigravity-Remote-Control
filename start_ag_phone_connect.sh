#!/bin/bash

# Antigravity Phone Connect - Linux / macOS Local Wi-Fi Launcher
cd "$(dirname "$0")" || exit 1

echo "==================================================="
echo "  Antigravity Phone Connect Launcher (Local Wi-Fi)"
echo "==================================================="

# Check for .env file
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "[INFO] .env file not found. Creating from .env.example..."
        cp .env.example .env
        echo "[SUCCESS] .env created from template!"
        echo "[ACTION] Update .env if you wish to change defaults."
        echo ""
    fi
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed (18+ LTS required)."
    exit 1
fi

# Install Node dependencies if missing
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing Node.js dependencies..."
    npm install || exit 1
fi

# Clean up any stale listener on port 3000 (or $PORT from .env)
TARGET_PORT="${PORT:-3000}"
if command -v lsof &> /dev/null; then
    for pid in $(lsof -ti:"$TARGET_PORT" 2>/dev/null); do
        kill -9 "$pid" 2>/dev/null
    done
elif command -v fuser &> /dev/null; then
    fuser -k "${TARGET_PORT}/tcp" >/dev/null 2>&1
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python 3 is not installed. Please install Python 3.9+ to run the launcher."
    exit 1
fi

echo "[STARTING] Launching via Unified Launcher..."

# Create and use Virtual Environment to avoid PEP 668 issues
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

$PYTHON_CMD launcher.py --mode local
STATUS=$?

echo ""
echo "[INFO] Server stopped (exit code $STATUS)."
if [ -t 0 ]; then
    read -r -p "Press Enter to exit..." _
fi
exit $STATUS
