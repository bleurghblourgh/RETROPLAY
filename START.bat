@echo off
cls
echo.
echo ========================================
echo   RETROPLAY - Music Player
echo ========================================
echo.
echo Starting server...
echo Server will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
python app_fixed.py
pause
