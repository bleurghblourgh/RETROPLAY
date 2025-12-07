#!/usr/bin/env python3
"""
RETROPLAY - Easy Launcher
Just double-click this file to start!
"""

import os
import sys
import webbrowser
import time
from threading import Timer

def open_browser():
    """Open browser after a short delay"""
    time.sleep(2)
    webbrowser.open('http://localhost:5000')

if __name__ == '__main__':
    print("\n" + "="*50)
    print("   RETROPLAY - Music Player")
    print("="*50)
    print("\n🎵 Starting server...")
    print("📍 Server: http://localhost:5000")
    print("🌐 Browser will open automatically...")
    print("\n⚡ Press Ctrl+C to stop\n")
    
    # Open browser in background
    Timer(2.0, open_browser).start()
    
    # Start the app
    os.system('python app_fixed.py')
