@echo off
title Launch Antigravity
echo ===================================================
echo   Launching Antigravity with Phone Connect support
echo ===================================================
echo [1/2] Closing existing Antigravity instances...
taskkill /F /IM "Antigravity IDE.exe" >nul 2>&1
taskkill /F /IM "Antigravity.exe" >nul 2>&1
timeout /t 1 /nobreak >nul

echo [2/2] Launching Antigravity IDE with Remote Debugging (Port 9000)...
if exist "%LOCALAPPDATA%\Programs\Antigravity IDE\Antigravity IDE.exe" (
    start "" "%LOCALAPPDATA%\Programs\Antigravity IDE\Antigravity IDE.exe" --remote-debugging-port=9000
) else (
    start "" "%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe" --remote-debugging-port=9000
)
echo [OK] Antigravity launched. You can close this window.
timeout /t 3 /nobreak >nul
