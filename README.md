# RETROPLAY

A modern web-based music player with sleek UI, AI-powered features, and real-time capabilities. Built with Flask, Socket.IO, and modern web technologies.

## ✨ Features

### 🎨 Modern UI Design
- **Clean Interface**: Professional, mouse-driven design
- **Drag & Drop**: Drop music files directly into the app
- **Hover Effects**: Interactive buttons with neon glow effects
- **Smooth Animations**: Polished transitions and visual feedback
- **Image Support**: Display album artwork and custom images

### 🎵 Music Management
- **Smart Library**: Organize your music collection
- **Playlist Creation**: Build and manage custom playlists
- **Album View**: Browse music by album with artwork
- **Drag & Drop Upload**: Simply drop files to add music
- **Metadata Extraction**: Automatic song info detection

### 🤖 AI-Powered Features
- **BPM Detection**: Automatic beat detection
- **Mood Analysis**: AI classifies song mood (energetic, calm, happy, melancholic)
- **Genre Classification**: Smart genre prediction
- **Smart Recommendations**: Suggests similar songs
- **AI Descriptions**: GPT-powered playlist descriptions
- **Listening Analytics**: Track your music preferences

### 🎨 Visual Features
- **Animated Vinyl Disk**: Rotating disk synced with playback
- **Audio Visualizer**: Real-time frequency bars with particle effects
- **5 Retro Themes**: Synthwave, Tokyo Nights, Cyberpunk Red, Vaporwave Pastels, Matrix Green
- **Dynamic Colors**: Mood-based color palettes
- **Neon Aesthetics**: Authentic retro-futuristic design

### 🔐 User System
- **Secure Authentication**: bcrypt password hashing
- **User Profiles**: Personal libraries and preferences
- **Theme Persistence**: Saves your color scheme choice
- **Session Management**: Secure login sessions

## Installation

1. Install Python 3.10 or higher
2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

Run the application:
```bash
python main.py
```

### Controls

**Login Screen:**
- TAB: Switch between input fields
- ENTER: Submit login/registration
- F1: Toggle between Login and Register modes

**Player Screen:**
- SPACE: Play/Pause
- ESC: Open settings menu
- Click buttons for playback controls

**Settings Menu:**
- UP/DOWN: Navigate themes
- ENTER: Apply selected theme
- ESC: Close settings

## Project Structure

```
RETROPLAY/
├── main.py                 # Application entry point
├── requirements.txt        # Python dependencies
├── src/
│   ├── core/              # Core functionality
│   │   ├── audioEngine.py
│   │   ├── libraryManager.py
│   │   └── playlistManager.py
│   ├── ui/                # User interface
│   │   ├── mainWindow.py
│   │   ├── vinylDisk.py
│   │   ├── controlPanel.py
│   │   ├── loginScreen.py
│   │   └── settingsMenu.py
│   ├── auth/              # Authentication
│   │   └── authenticationManager.py
│   └── utils/             # Utilities
│       └── colorManager.py
└── database/              # SQLite database (auto-created)
```

## Technologies

- **Python 3.10+**
- **Pygame**: Graphics and audio playback
- **SQLite**: Database management
- **bcrypt**: Password hashing
- **mutagen**: Audio metadata extraction

## License

MIT License
