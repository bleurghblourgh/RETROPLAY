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
        socketio.run(app, host='127.0.0.1', port=5000, debug=False, allow_unsafe_werkzeug=True)
    except OSError as e:
        if "10048" in str(e) or "address already in use" in str(e).lower():
            print("\n❌ ERROR: Port 5000 is already in use!")
            print("\n💡 Solutions:")
            print("   1. Close any other RETROPLAY instances")
            print("   2. Kill the process using port 5000:")
            print("      Windows: netstat -ano | findstr :5000")
            print("               taskkill /PID <PID> /F")
            print("   3. Or change the port in main.py\n")
        else:
            print(f"\n❌ ERROR: {e}\n")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down RETROPLAY server...")
        print("✅ Server stopped successfully\n")
        sys.exit(0)
