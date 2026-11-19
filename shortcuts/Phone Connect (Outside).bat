@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
title Phone Connect (Outside) - Remote Access via Internet
cd /d "%~dp0.."

echo ===================================================
echo   Phone Connect (Outside) - Access From Anywhere
echo ===================================================
echo.

:: Cleanup stuck processes from previous runs
echo [0/2] Cleaning up...
taskkill /f /im ngrok.exe >nul 2>&1
taskkill /f /im cloudflared.exe >nul 2>&1
taskkill /f /im pinggy.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

:: Check dependencies
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js missing.
    pause
    exit /b
)

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python missing.
    pause
    exit /b
)

:: Check .env
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Creating .env from template...
        copy .env.example .env >nul
        echo [ACTION] Open .env and configure APP_PASSWORD and TUNNEL_PROVIDER ^(cloudflare, pinggy, serveo, or ngrok^), then re-run this.
        pause
        exit /b
    )
    echo [ERROR] No .env file found.
    pause
    exit /b
)

:: Check if Antigravity Hub or CDP debug port is running
echo [1/2] Checking Antigravity 2.33 Hub...
powershell -Command "if (Get-Process -Name 'language_server*' -ErrorAction SilentlyContinue) { Write-Host '[OK] Antigravity 2.33 Hub daemon detected (zero-flag RPC mode).' } else { try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:9000/json' -UseBasicParsing -TimeoutSec 2; Write-Host '[OK] Antigravity CDP detected.' } catch { Write-Host '[WARNING] Antigravity is not open yet. Open Antigravity anytime to auto-connect.' } }"
echo.

echo [2/2] Launching Phone Connect (Outside)...
python launcher.py --mode web

echo.
echo [INFO] Server stopped. Press any key to exit.
pause
