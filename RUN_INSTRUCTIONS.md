# 🚀 RETROPLAY - Quick Start Guide

## Installation & Running

### Step 1: Install Dependencies
```bash
cd RETROPLAY
pip install -r requirements.txt
```

### Step 2: Run the Application
```bash
python main.py
```

### Step 3: Access RETROPLAY
The application will:
1. Display a welcome screen in the terminal
2. Automatically open your browser to http://localhost:5000
3. Show you the login screen

## What You'll See

### Terminal Output
```
============================================================
🎵  RETROPLAY - Modern Music Player
============================================================

✨ Server Status: RUNNING
🌐 Local URL: http://localhost:5000
🔗 Network URL: http://127.0.0.1:5000
📁 Upload Folder: uploads/music
⏰ Started: 2024-12-06 14:30:00

------------------------------------------------------------
📖 Quick Start:
   1. Open http://localhost:5000 in your browser
   2. Create an account or login
   3. Upload your music and start playing!
------------------------------------------------------------

💡 Features:
   • Drag & Drop music upload
   • AI-powered music analysis
   • Smart playlists
   • 5 retro themes
   • Real-time visualizer
------------------------------------------------------------

⚠️  Press CTRL+C to stop the server
============================================================
```

### Browser Interface
1. **Login Screen**: Modern gradient design with logo
2. **Main App**: Sidebar navigation with 5 tabs
3. **Player Bar**: Bottom controls for playback

## First Time Setup

### 1. Create Account
- Click "Register" on login screen
- Enter username, email, password
- Click "Register" button

### 2. Login
- Enter your credentials
- Click "Login"

### 3. Upload Music
- Click "Upload" tab in sidebar
- Drag & drop music files OR click to browse
- Supported formats: MP3, WAV, OGG, FLAC, M4A

### 4. Start Playing
- Go to "Library" tab
- Click on any song to play
- Use player controls at bottom

## Features Overview

### Navigation Tabs
1. **Library** 📚 - All your songs
2. **Playlists** 🎵 - Custom playlists
3. **Albums** 💿 - Organized by album
4. **Upload** ⬆️ - Drag & drop zone
5. **Settings** ⚙️ - Themes & preferences

### Player Controls
- ⏮️ Previous
- ▶️ Play/Pause
- ⏭️ Next
- 🔀 Shuffle
- 🔁 Repeat
- 🔊 Volume

### AI Features
- BPM Detection
- Mood Analysis
- Genre Classification
- Smart Recommendations

## Troubleshooting

### Port Already in Use
If port 5000 is busy:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Dependencies Not Installing
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### Browser Doesn't Open
Manually open: http://localhost:5000

### Upload Fails
- Check file size (max 100MB)
- Verify file format
- Ensure `uploads/music` folder exists

## Stopping the Server

Press `CTRL+C` in the terminal to stop the server gracefully.

## Network Access

To access from other devices:
1. Find your computer's IP address
2. Open http://YOUR_IP:5000 on other device
3. Login with your account

## Need Help?

Check these files:
- `WEB_GUIDE.md` - Comprehensive guide
- `AI_FEATURES.md` - AI features documentation
- `CHANGELOG.md` - Version history

## System Requirements

- Python 3.10+
- 2GB RAM minimum
- Modern web browser (Chrome, Firefox, Safari, Edge)
- 100MB+ free disk space

Enjoy RETROPLAY! 🎵✨
