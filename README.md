<p align="center">
  <img src="https://img.shields.io/badge/RETROPLAY-🎵-EC4899?style=for-the-badge&labelColor=1A1F3A" alt="RETROPLAY"/>
</p>

<h1 align="center">🎵 RETROPLAY</h1>
<h3 align="center">A Modern Music Player with Retro Vibes</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-3776AB?style=flat-square&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Flask-3.0+-000000?style=flat-square&logo=flask&logoColor=white"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square"/>
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=flat-square"/>
</p>

<p align="center">
  A beautiful, feature-rich music player featuring a spinning vinyl visualizer, 8 retro themes, infinite shuffle, and AI-powered music analysis.
</p>

---

## 📸 Screenshots

| Library View | Vinyl Player | Fullscreen Mode |
|:---:|:---:|:---:|
| Browse your music | Spinning vinyl with album art | Immersive visualizer |

---

## ⚡ Quick Start

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/bleurghblourgh/RETROPLAY.git
cd RETROPLAY
```

### 2️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

### 3️⃣ Run the App
```bash
python app.py
```

### 4️⃣ Open in Browser
Navigate to **http://localhost:5000** (opens automatically)

---

## 🎯 Features Overview

### 🎨 Stunning Visual Design

| Feature | Description |
|---------|-------------|
| **Retro Aesthetic** | Synthwave-inspired UI with neon colors and glow effects |
| **8 Themes** | Synthwave, Neon, Vaporwave, Arcade, Cyberpunk, Miami, Terminal, Sunset |
| **Animations** | Smooth transitions, hover effects, and loading animations |
| **Responsive** | Works on desktop, tablet, and mobile |

### 🎵 Music Player

| Feature | Description |
|---------|-------------|
| **Spinning Vinyl** | Real vinyl disc animation with your album art in the center |
| **Visualizer Bars** | Audio-reactive bars that bounce to your music |
| **Fullscreen Mode** | Immersive fullscreen visualizer experience |
| **Infinite Shuffle** | Never run out of music - auto-reshuffles when queue ends |
| **Queue Display** | Always shows next 4 songs (wraps around playlist) |

### 📚 Library Management

| Feature | Description |
|---------|-------------|
| **Drag & Drop Upload** | Simply drag music files to upload |
| **Supported Formats** | MP3, WAV, OGG, FLAC, M4A |
| **Circular Album Art** | Beautiful circular artwork display |
| **Custom Metadata** | Edit artist names and cover images |
| **Search** | Find songs quickly |

### 📁 Playlists

| Feature | Description |
|---------|-------------|
| **Create Playlists** | Organize your music your way |
| **Custom Covers** | Upload custom playlist artwork |
| **Right-Click Menu** | Quick actions via context menu |
| **Play/Shuffle** | One-click playback options |

### 👤 User Profiles

| Feature | Description |
|---------|-------------|
| **Profile Pictures** | Upload your avatar |
| **Bio & Genres** | Share your music taste |
| **Statistics** | Track your listening habits |
| **Public/Private** | Control your visibility |

### 🤖 AI Features

| Feature | Description |
|---------|-------------|
| **BPM Detection** | Automatic tempo analysis |
| **Mood Analysis** | Detect song mood/energy |
| **Genre Classification** | Auto-categorize music |
| **Smart Recommendations** | AI-powered suggestions |

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
```

---

## 🖥️ System Requirements

| Requirement | Minimum |
|-------------|---------|
| **Python** | 3.8 or higher |
| **RAM** | 512 MB |
| **Storage** | 100 MB + music files |
| **Browser** | Chrome, Firefox, Edge, Safari (modern versions) |
| **OS** | Windows, macOS, Linux |

---

## 📦 Installation Methods

### Method 1: Git Clone (Recommended)
```bash
# Clone the repository
git clone https://github.com/bleurghblourgh/RETROPLAY.git

# Navigate to folder
cd RETROPLAY

# Install Python dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

### Method 2: Download ZIP
1. Click the green **Code** button above
2. Select **Download ZIP**
3. Extract the ZIP file
4. Open terminal/command prompt in the extracted folder
5. Run:
```bash
pip install -r requirements.txt
python app.py
```

### Method 3: Windows Quick Start
```batch
# Double-click START.bat
# Or run in Command Prompt:
cd RETROPLAY
START.bat
```

---

## 🎮 How to Use

### First Time Setup
1. **Register** - Create your account on the login screen
2. **Login** - Enter your credentials
3. **Upload Music** - Go to Upload tab, drag & drop your files
4. **Create Playlists** - Organize your music
5. **Customize** - Pick a theme in Settings

### Playing Music
- **Click any song** to start playing
- **Vinyl panel** on the right shows current track
- **Click fullscreen button** for immersive mode
- **Shuffle/Repeat** buttons for playback modes

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `←` | Previous track |
| `→` | Next track |
| `↑/↓` | Volume up/down |

### Right-Click Menus
- **On Songs**: Add to playlist, edit artist, change image, delete
- **On Playlists**: Play, rename, delete

---

## 🔧 Configuration

### Change Port
Edit `app.py` and modify:
```python
app.run(host='0.0.0.0', port=5000)  # Change 5000 to your preferred port
```

### Database Location
SQLite database is stored at:
```
RETROPLAY/database/retroplay.db
```

### Upload Location
Music files are stored at:
```
RETROPLAY/uploads/music/
```

---

## 🐛 Troubleshooting

### "Port already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### "Module not found"
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### "Audio not playing"
- Check browser console (F12) for errors
- Ensure audio files are valid MP3/WAV/OGG/FLAC/M4A
- Try a different browser

### "Database error"
```bash
# Delete and recreate database
rm database/retroplay.db
python app.py  # Will create fresh database
```

---

## 📁 Project Structure

```
RETROPLAY/
├── 📄 app.py                 # Main Flask application
├── 📄 requirements.txt       # Python dependencies
├── 📄 README.md              # This file
│
├── 📁 templates/
│   └── index.html            # Main UI template
│
├── 📁 static/
│   ├── 📁 css/               # Stylesheets
│   │   ├── style.css         # Main styles
│   │   ├── themes.css        # Theme definitions
│   │   ├── vinyl-panel.css   # Vinyl player styles
│   │   └── ...
│   └── 📁 js/                # JavaScript
│       ├── app.js            # Main application logic
│       ├── vinyl-visualizer.js # Vinyl animation
│       └── ...
│
├── 📁 database/
│   └── retroplay.db          # SQLite database
│
├── 📁 uploads/
│   ├── 📁 music/             # Uploaded songs
│   └── 📁 images/            # Album art & avatars
│
└── 📁 config/
    └── themes.json           # Theme configurations
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python, Flask, SQLite |
| **Frontend** | HTML5, CSS3, JavaScript |
| **Visualizer** | HTML5 Canvas |
| **Audio** | Web Audio API, librosa |
| **Auth** | Flask-Login, bcrypt |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by classic vinyl players and synthwave aesthetics
- Built with Flask and modern web technologies
- Icons and design elements from various open-source projects

---

<p align="center">
  <b>Made with ❤️ and synthwave vibes</b>
</p>

<p align="center">
  <a href="#-retroplay">⬆️ Back to Top</a>
</p>
