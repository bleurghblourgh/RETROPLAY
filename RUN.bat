@echo off
cls
echo.
echo ========================================
echo   RETROPLAY - Starting...
echo ========================================
echo.
cd /d "%~dp0"
start http://localhost:5000
python app_fixed.py
