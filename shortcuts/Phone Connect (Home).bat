@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
title Phone Connect (Home) - Same Wi-Fi Connection
cd /d "%~dp0.."

:: Cleanup port 3000 if occupied by previous runs
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo.
echo  ====================================================
echo   Phone Connect - Control Antigravity From Your Phone
echo  ====================================================
echo.

:: Check for .env file
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Creating .env from template...
        copy .env.example .env >nul
    )
)

:: Check if Antigravity Hub or CDP debug port is running
echo [1/3] Checking Antigravity 2.33 Hub...
powershell -Command "if (Get-Process -Name 'language_server*' -ErrorAction SilentlyContinue) { Write-Host '[OK] Antigravity 2.33 Hub daemon detected (zero-flag RPC mode).' } else { try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:9000/json' -UseBasicParsing -TimeoutSec 2; Write-Host '[OK] Antigravity CDP detected.' } catch { Write-Host '[WARNING] Antigravity is not open yet. Open Antigravity anytime to auto-connect.' } }"
echo.

:: Check Node.js
echo [2/3] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Install from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found.
echo.

:: Check dependencies
echo [3/3] Checking dependencies...
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    npm install
)
echo [OK] Ready.
echo.

echo  ====================================================
echo   Starting server... QR code will appear below!
echo  ====================================================
echo.

python launcher.py --mode local

echo.
echo [INFO] Server stopped. Press any key to exit.
pause >nul
