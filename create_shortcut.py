#!/usr/bin/env python3
"""
Create a desktop shortcut for RETROPLAY
Run this once to create an easy-to-use shortcut
"""

import os
import sys

def create_windows_shortcut():
    """Create a Windows desktop shortcut"""
    try:
        import winshell
        from win32com.client import Dispatch
        
        desktop = winshell.desktop()
        path = os.path.join(desktop, "RETROPLAY.lnk")
        target = os.path.join(os.getcwd(), "RUN.bat")
        icon = os.path.join(os.getcwd(), "RUN.bat")
        
        shell = Dispatch('WScript.Shell')
        shortcut = shell.CreateShortCut(path)
        shortcut.Targetpath = target
        shortcut.WorkingDirectory = os.getcwd()
        shortcut.IconLocation = icon
        shortcut.save()
        
        print("✅ Desktop shortcut created!")
        print(f"📍 Location: {path}")
        print("\n🎵 Double-click 'RETROPLAY' on your desktop to start!")
        
    except ImportError:
        print("⚠️  Required packages not installed")
        print("\nInstall with:")
        print("pip install pywin32 winshell")
        print("\nOr just use RUN.bat directly!")

def create_batch_shortcut():
    """Create a simple batch file shortcut"""
    desktop = os.path.join(os.path.expanduser("~"), "Desktop")
    shortcut_path = os.path.join(desktop, "RETROPLAY.bat")
    
    current_dir = os.getcwd()
    
    with open(shortcut_path, 'w') as f:
        f.write(f'@echo off\n')
        f.write(f'cd /d "{current_dir}"\n')
        f.write(f'start "" "{os.path.join(current_dir, "RUN.bat")}"\n')
    
    print("✅ Desktop shortcut created!")
    print(f"📍 Location: {shortcut_path}")
    print("\n🎵 Double-click 'RETROPLAY.bat' on your desktop to start!")

if __name__ == '__main__':
    print("\n" + "="*50)
    print("   RETROPLAY - Shortcut Creator")
    print("="*50 + "\n")
    
    if sys.platform == 'win32':
        try:
            create_windows_shortcut()
        except:
            create_batch_shortcut()
    else:
        print("⚠️  This script is for Windows only")
        print("\nOn Mac/Linux, just run:")
        print("python3 run.py")
    
    input("\nPress Enter to close...")
