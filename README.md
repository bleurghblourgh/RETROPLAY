# RETROPLAY

A retro-themed music player with synthwave aesthetics, featuring animated vinyl disk visualization, customizable themes, and comprehensive music management.

## Features

- **Retro UI Design**: Synthwave-inspired interface with neon colors and animated elements
- **Animated Vinyl Disk**: Rotating disk visualization that syncs with music playback
- **Multiple Themes**: Choose from 5 retro color schemes (Synthwave, Tokyo Nights, Cyberpunk Red, Vaporwave Pastels, Matrix Green)
- **User Authentication**: Secure login system with bcrypt password hashing
- **Music Library**: Upload and organize your music collection
- **Playlist Management**: Create and manage custom playlists
- **Audio Controls**: Play, pause, skip, shuffle, and repeat functionality
- **SQLite Database**: Local storage for user data, songs, and playlists

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
