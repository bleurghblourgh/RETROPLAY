<p align="center">
  <img src="https://img.shields.io/badge/RETROPLAY-🎵-EC4899?style=for-the-badge&labelColor=1A1F3A" alt="RETROPLAY"/>
</p>

<h1 align="center">🎵 RETROPLAY</h1>
<h3 align="center">A Modern Music Player with Retro Vibes</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-3776AB?style=flat-square&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Flask-3.0+-000000?style=flat-square&logo=flask&logoColor=white"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square"/>
  <img src="https://img.shields.io/badge/Version-2.0-EC4899?style=flat-square"/>
</p>

<p align="center">
  A beautiful, feature-rich music player featuring spinning vinyl visualizer, 8+ themes, Picture-in-Picture mode, equalizer, podcasts, and much more!
</p>

---

## ⚡ Quick Start

```bash
# Clone and run in 3 commands
git clone https://github.com/bleurghblourgh/RETROPLAY.git
cd RETROPLAY
pip install -r requirements.txt && python app_fixed.py
```

Then open **http://localhost:5000** in your browser.

---

## ✨ What's New in v2.0

| Feature | Description |
|---------|-------------|
| 🖼️ **Picture-in-Picture** | Floating player that stays on top of other browser tabs! |
| 🎨 **Custom Theme Creator** | Design your own color themes and share with friends |
| 🎛️ **10-Band Equalizer** | Fine-tune your audio with presets |
| 🎙️ **Podcast Support** | Separate podcast section with speed control & position saving |
| 📻 **Radio Mode** | Auto-queue similar songs based on artist/genre |
| 🎬 **6 Visualizer Modes** | Circular, Bars, Particles, Wave, Spectrum, Kaleidoscope |
| ⏰ **Sleep Timer** | Auto-stop playback after set time |
| 📊 **Stats Dashboard** | Track your listening habits |
| 🔀 **Crossfade** | Smooth transitions between songs |
| 📝 **Lyrics Display** | Auto-fetch lyrics for current song |
| 🖥️ **Desktop App** | Electron wrapper with system tray & media keys |

---

## 🖥️ Desktop App (NEW!)

Run RETROPLAY as a native desktop application with:
- **System Tray** - Minimize to tray, quick playback controls
- **Media Keys** - Control playback with keyboard media keys
- **Native Notifications** - Song change notifications

### Quick Start (Desktop)
```bash
cd electron
npm install
npm start
```

Or on Windows, just double-click `START_DESKTOP.bat`

---

## 🎯 Features Overview

### 🎵 Music Player
- **Spinning Vinyl** with album art center
- **Fullscreen Visualizer** with 6 stunning modes
- **Picture-in-Picture** - control music while browsing other tabs
- **Mini Player** - collapsible floating player
- **Infinite Shuffle** - never run out of music
- **Crossfade** - smooth song transitions
- **Queue Management** - drag to reorder, right-click menu

### 🎛️ Audio Features
- **10-Band Equalizer** with presets (Rock, Pop, Jazz, Classical, etc.)
- **Playback Speed** control (0.5x - 2x)
- **Volume Control** with keyboard shortcuts

### 🎙️ Podcast Support
- Separate podcast upload section
- **Playback Speed** control (0.5x - 2x)
- **Skip 15s/30s** buttons
- **Position Saving** - resume where you left off

### 📻 Radio Mode
- Right-click any song → "Start Radio"
- Auto-queues similar songs by artist/album/genre

### 🎨 Themes & Customization
- **8 Built-in Themes**: Synthwave, Neon, Vaporwave, Arcade, Cyberpunk, Miami, Terminal, Sunset
- **Custom Theme Creator** - pick your own colors
- **Share Themes** - export/import theme codes

### 📊 Stats & Social
- **Stats Dashboard** - listening time, top artists, genres
- **Social Sharing** - share songs to Twitter, Facebook, WhatsApp
- **Profile System** - avatar, bio, favorite genres

### ⌨️ Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `←` / `→` | Previous/Next track |
| `↑` / `↓` | Volume up/down |
| `M` | Mute/Unmute |
| `S` | Toggle shuffle |
| `R` | Toggle repeat |
| `F` | Fullscreen visualizer |
| `L` | Like/Unlike song |
| `1-6` | Switch visualizer mode (in fullscreen) |
| `Ctrl+Shift+P` | Picture-in-Picture |

---

## 🎨 Available Themes

```
🌸 Synthwave     - Pink & purple neon (Default)
💚 Neon Nights   - Electric green & magenta  
🌊 Vaporwave     - Aesthetic pink & cyan
🎮 Retro Arcade  - Golden classics
🔴 Cyberpunk     - Yellow & red dystopia
🌴 Miami Vice    - 80s beach vibes
💻 Terminal      - Classic green screen
🌅 Sunset        - Warm orange glow
🎨 Custom        - Create your own!
```

---

## 📦 Installation

### Option 1: Git Clone (Recommended)
```bash
git clone https://github.com/bleurghblourgh/RETROPLAY.git
cd RETROPLAY
pip install -r requirements.txt
python app_fixed.py
```

### Option 2: Download ZIP
1. Click **Code** → **Download ZIP**
2. Extract the ZIP file
3. Open terminal in the folder
4. Run: `pip install -r requirements.txt && python app_fixed.py`

### Option 3: Windows Quick Start
Double-click `START.bat`

---

## 🖥️ System Requirements

| Requirement | Minimum |
|-------------|---------|
| **Python** | 3.8+ |
| **Browser** | Chrome 116+ (for PiP), Firefox, Edge, Safari |
| **RAM** | 512 MB |
| **OS** | Windows, macOS, Linux |

---

## 🎮 How to Use

### Getting Started
1. **Register/Login** on the login screen
2. **Upload Music** - drag & drop files in Upload tab
3. **Play** - click any song to start
4. **Customize** - pick a theme in Settings

### Picture-in-Picture Mode
1. Click the PiP button in the vinyl panel (or press `Ctrl+Shift+P`)
2. A floating player appears that stays on top of other tabs
3. Control playback while browsing YouTube, working, etc.

### Custom Themes
1. Go to **Settings** → **Themes**
2. Click **+ Create Theme**
3. Pick your colors and save
4. Share theme codes with friends!

### Podcasts
1. Go to **Podcasts** tab
2. Upload podcast files separately from music
3. Use speed controls and skip buttons
4. Position is saved automatically

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | `netstat -ano \| findstr :5000` then kill the process |
| Module not found | `pip install -r requirements.txt` |
| PiP not working | Use Chrome 116+ or Edge 116+ |
| Audio not playing | Check browser console (F12), try different browser |

---

## 📁 Project Structure

```
RETROPLAY/
├── app_fixed.py          # Main Flask app (use this!)
├── requirements.txt      # Python dependencies
├── templates/
│   └── index.html        # Main UI
├── static/
│   ├── css/              # Stylesheets
│   └── js/               # JavaScript modules
├── database/
│   └── retroplay.db      # SQLite database
└── uploads/
    ├── music/            # Uploaded songs
    └── images/           # Album art & avatars
```

---

## 🛠️ Tech Stack

- **Backend**: Python, Flask, SQLite
- **Frontend**: HTML5, CSS3, JavaScript
- **Audio**: Web Audio API
- **Visualizer**: HTML5 Canvas
- **PiP**: Document Picture-in-Picture API

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing`
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

---

<p align="center">
  <b>Made with ❤️ and synthwave vibes</b>
</p>
