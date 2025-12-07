# 🎵 RETROPLAY - Modern Music Player

A feature-rich, retro-styled music player with AI-powered analysis, spinning vinyl visualizer, and modern web interface.

![RETROPLAY](https://img.shields.io/badge/RETROPLAY-Music%20Player-EC4899?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.8+-blue?style=flat-square)
![Flask](https://img.shields.io/badge/Flask-3.0+-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## 🚀 Quick Install

### Option 1: Git Clone (Recommended)
```bash
git clone https://github.com/YOUR_USERNAME/RETROPLAY.git
cd RETROPLAY
pip install -r requirements.txt
python app.py
```

### Option 2: Download ZIP
1. Download the repository as ZIP
2. Extract to your desired location
3. Open terminal in the RETROPLAY folder
4. Run the commands below

### Start the App
```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

Browser opens automatically to **http://localhost:5000**

## ✨ Features

### 🎨 Beautiful UI
- Retro synthwave aesthetic with animations
- 8 complete themes (Synthwave, Neon, Vaporwave, Arcade, Cyberpunk, Miami, Terminal, Sunset)
- Spinning vinyl visualizer with album art
- Fullscreen visualizer mode
- Responsive design

### 🎵 Music Management
- Drag & drop upload
- Circular album art display
- Album view with disc grouping
- Playlist management with cover images
- Custom metadata (artist, images)
- Infinite shuffle - never run out of music!

### 🎛️ Vinyl Panel
- Spinning vinyl disc with album art center
- Real-time audio visualizer bars
- Playback controls (play, pause, next, prev)
- Volume control with mute
- "Up Next" queue (always shows 4 songs)
- Fullscreen mode

### 🤖 AI-Powered
- BPM detection
- Mood analysis
- Genre classification
- Smart recommendations

### 👤 Profile System
- User profiles with pictures
- Bio and favorite genres
- Public/private toggle
- Statistics dashboard

### 🖱️ Context Menus
Right-click on songs/playlists to:
- Edit artist name
- Change cover image
- Add to playlist
- Delete items

## 🎯 First Time Use

1. **Register** - Create your account
2. **Upload** - Drag & drop music files (MP3, WAV, OGG, FLAC, M4A)
3. **Organize** - Create playlists and albums
4. **Customize** - Change theme and profile
5. **Play** - Enjoy your music with the vinyl visualizer!

## 🎨 Themes

| Theme | Description |
|-------|-------------|
| Synthwave | Pink/purple neon (Default) |
| Neon Nights | Electric green & magenta |
| Vaporwave | Aesthetic pink & cyan |
| Retro Arcade | Golden classics |
| Cyberpunk | Yellow & red dystopia |
| Miami Vice | 80s beach vibes |
| Terminal | Classic green screen |
| Sunset | Warm orange glow |

## 🔧 Tech Stack

**Backend:**
- Flask 3.0+
- Flask-SocketIO
- Flask-Login
- SQLite
- bcrypt

**Frontend:**
- HTML5 Canvas (Vinyl visualizer)
- CSS3 with animations
- JavaScript (ES6+)

**Audio:**
- librosa (audio analysis)
- mutagen (metadata)

## 📁 Project Structure

```
RETROPLAY/
├── app.py               # Flask backend
├── requirements.txt     # Dependencies
├── templates/
│   └── index.html       # Main UI
├── static/
│   ├── css/             # Stylesheets
│   └── js/              # JavaScript
├── database/            # SQLite database
└── uploads/             # User uploads
```

## 🖥️ System Requirements

- Python 3.8 or higher
- Modern web browser (Chrome, Firefox, Edge, Safari)
- 100MB free disk space (plus space for music)

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change port in app.py or kill existing process
python app.py  # Uses port 5000 by default
```

**Dependencies fail to install:**
```bash
# Try upgrading pip first
pip install --upgrade pip
pip install -r requirements.txt
```

**Audio files not playing:**
- Ensure files are in supported formats (MP3, WAV, OGG, FLAC, M4A)
- Check browser console for errors

## 📄 License

MIT License - feel free to use, modify, and distribute!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🎵 Enjoy!

Your modern music player with retro vibes is ready to rock! ✨

---

**Made with ❤️ and synthwave vibes**
