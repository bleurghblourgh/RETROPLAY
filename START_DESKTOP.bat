@echo off
echo ========================================
echo    RETROPLAY Desktop App Launcher
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if electron dependencies are installed
if not exist "electron\node_modules" (
    echo [INFO] Installing Electron dependencies...
    cd electron
    call npm install
    cd ..
    echo.
)

:: Start the desktop app
echo [INFO] Starting RETROPLAY Desktop...
cd electron
call npm start
cd ..
