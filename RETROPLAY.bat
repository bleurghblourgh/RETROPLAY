@echo off
title RETROPLAY Music Player
cd /d "%~dp0"
start http://localhost:5000
python app_fixed.py
