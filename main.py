"""
RETROPLAY Web Application Launcher
Run this file to start the RETROPLAY web server
"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import and run the Flask app
from app import app, socketio, print_welcome_screen
import webbrowser
import threading
import time

def open_browser():
    """Open browser after short delay"""
    time.sleep(1.5)
    webbrowser.open('http://localhost:5000')

if __name__ == '__main__':
    # Print welcome screen
    print_welcome_screen()
    
    # Open browser in background thread
    threading.Thread(target=open_browser, daemon=True).start()
    
    # Run server
    try:
        socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True)
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down RETROPLAY server...")
        print("✅ Server stopped successfully\n")
        sys.exit(0)
