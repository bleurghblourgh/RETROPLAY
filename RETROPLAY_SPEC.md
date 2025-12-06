# RETROPLAY - Synthwave Music Player Specification

## Project Overview
RETROPLAY is a retro-styled MP3 music player built with Python, featuring a synthwave/Tokyo city aesthetic with dynamic visual elements and AI-powered features.

## Core Technology Stack
- **Framework**: Python 3.10+
- **GUI**: Pygame or CustomTkinter (for retro aesthetics)
- **Audio**: pygame.mixer or python-vlc
- **AI Integration**: OpenAI API or local models (whisper, musicgen)
- **Database**: SQLite for user data and playlists
- **Authentication**: bcrypt for password hashing
- **Audio Processing**: librosa, pydub

## Visual Design Requirements

### Color Scheme (Synthwave/Tokyo Night)
**Primary Palette:**
- neonPink: #FF006E
- neonBlue: #00F5FF
- neonPurple: #8B00FF
- darkBackground: #0A0E27
- midBackground: #1A1F3A
- accentOrange: #FF9E00
- accentGreen: #00FF9F

**Alternative Schemes (Settings):**
- Classic Synthwave
- Tokyo Nights
- Cyberpunk Red
- Vaporwave Pastels
- Matrix Green

### UI Components

#### 1. Animated Vinyl Disk
- Rotating disk visualization (center of screen)
- Speed syncs with BPM detection
- Color shifts based on:
  - Audio frequency analysis
  - Song mood (AI-detected)
  - User-selected theme
- Glow effects and particle trails

#### 2. Waveform Visualizer
- Real-time audio spectrum analyzer
- Retro grid background with perspective
- Neon bars that pulse with music

## Feature Specifications

### Authentication System
```python
# Module: authenticationManager.py

class AuthenticationManager:
    - registerUser(username, email, password)
    - loginUser(username, password)
    - logoutUser()
    - validateSession()
    - resetPassword(email)
    - encryptPassword(password)
```

**Screens:**
- Splash screen with RETROPLAY logo animation
- Login form with neon borders
- Signup form with validation
- Password recovery

### Music Player Core

#### Basic Controls
- Play/Pause with animated button
- Next/Previous track
- Shuffle mode
- Repeat (off/one/all)
- Volume slider with neon trail
- Seek bar with time display
- Queue management

#### Advanced Features
- **Playlist Management**
  - Create/edit/delete playlists
  - Drag-and-drop song ordering
  - Import/export playlists (M3U, JSON)

- **Library Organization**
  - Auto-tag detection (ID3)
  - Album art display
  - Artist/Album/Genre filtering
  - Search functionality

- **Audio Effects**
  - Equalizer (10-band)
  - Bass boost
  - Reverb
  - Speed control (0.5x - 2x)

### AI Implementation

#### 1. Music Analysis
```python
# Module: aiMusicAnalyzer.py

class AiMusicAnalyzer:
    - detectBpm(audioFile)
    - analyzeMood(audioFile)  # happy, sad, energetic, calm
    - extractGenre(audioFile)
    - generateColorPalette(mood)
    - recommendSimilarSongs(currentSong)
```

#### 2. Smart Playlist Generation
- AI-curated playlists based on:
  - Listening history
  - Time of day
  - Mood detection
  - Activity type (workout, study, party)

#### 3. Voice Commands (Optional)
- "Play [song name]"
- "Skip to next"
- "Add to favorites"
- "Create workout playlist"

### Interactive Games

#### Game 1: Rhythm Matcher
- Notes fall in sync with playing song
- Hit notes at correct timing
- Score based on accuracy
- Difficulty scales with BPM

#### Game 2: Music Memory
- Guess the song from short clips
- Uses your library
- Leaderboard system
- Multiplayer mode (local)

#### Game 3: Beat Saber Mini
- Slice beats in VR-style interface
- Generated from song analysis
- Custom difficulty levels

### Settings Menu

#### Visual Settings
- themeSelector (dropdown with preview)
- diskAnimationSpeed (slider)
- particleEffectIntensity (slider)
- visualizerStyle (bars, circular, waveform)
- enableScreensaver (toggle)

#### Audio Settings
- outputDevice (dropdown)
- audioQuality (low, medium, high)
- crossfadeDuration (0-10 seconds)
- normalizationToggle
- equalizerPresets

#### Account Settings
- changePassword
- updateEmail
- profilePicture
- listeningStatistics
- exportUserData

#### AI Settings
- enableAiRecommendations (toggle)
- moodDetectionSensitivity (slider)
- autoPlaylistGeneration (toggle)
- voiceCommandsEnabled (toggle)

## File Structure
```
retroplay/
├── main.py
├── requirements.txt
├── README.md
├── .gitignore
├── config/
│   ├── settings.json
│   └── themes.json
├── src/
│   ├── __init__.py
│   ├── core/
│   │   ├── audioEngine.py
│   │   ├── playlistManager.py
│   │   └── libraryManager.py
│   ├── ui/
│   │   ├── mainWindow.py
│   │   ├── vinylDisk.py
│   │   ├── visualizer.py
│   │   ├── controlPanel.py
│   │   └── settingsMenu.py
│   ├── auth/
│   │   ├── authenticationManager.py
│   │   └── sessionHandler.py
│   ├── ai/
│   │   ├── aiMusicAnalyzer.py
│   │   ├── recommendationEngine.py
│   │   └── moodDetector.py
│   ├── games/
│   │   ├── rhythmMatcher.py
│   │   ├── musicMemory.py
│   │   └── beatSlasher.py
│   └── utils/
│       ├── colorManager.py
│       ├── animationEngine.py
│       └── audioAnalyzer.py
├── assets/
│   ├── fonts/
│   ├── images/
│   ├── shaders/
│   └── sounds/
├── database/
│   └── schema.sql
└── tests/
    ├── test_audio.py
    ├── test_auth.py
    └── test_ai.py
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastLogin TIMESTAMP,
    profilePicture TEXT,
    themePreference TEXT DEFAULT 'synthwave'
);
```

### Songs Table
```sql
CREATE TABLE songs (
    songId INTEGER PRIMARY KEY AUTOINCREMENT,
    filePath TEXT UNIQUE NOT NULL,
    title TEXT,
    artist TEXT,
    album TEXT,
    genre TEXT,
    duration INTEGER,
    bpm INTEGER,
    mood TEXT,
    playCount INTEGER DEFAULT 0,
    lastPlayed TIMESTAMP,
    addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Playlists Table
```sql
CREATE TABLE playlists (
    playlistId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    playlistName TEXT NOT NULL,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isAiGenerated BOOLEAN DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(userId)
);
```

### PlaylistSongs Table
```sql
CREATE TABLE playlistSongs (
    playlistId INTEGER,
    songId INTEGER,
    position INTEGER,
    addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlistId, songId),
    FOREIGN KEY (playlistId) REFERENCES playlists(playlistId),
    FOREIGN KEY (songId) REFERENCES songs(songId)
);
```

## Implementation Phases

### Phase 1: Core Foundation (Week 1-2)
- Project setup and git initialization
- Basic window with synthwave theme
- Audio playback engine
- File browser and song loading
- Basic play/pause/skip controls

### Phase 2: Visual Enhancement (Week 3)
- Animated vinyl disk implementation
- Color-changing algorithms
- Waveform visualizer
- Theme system foundation

### Phase 3: Authentication (Week 4)
- Database setup
- Login/signup screens
- Session management
- User preferences storage

### Phase 4: Advanced Features (Week 5-6)
- Playlist management
- Library organization
- Settings menu
- Multiple theme support

### Phase 5: AI Integration (Week 7-8)
- BPM detection
- Mood analysis
- Recommendation engine
- Smart playlist generation

### Phase 6: Games (Week 9-10)
- Rhythm Matcher game
- Music Memory game
- Beat Slasher game
- Scoring and leaderboards

### Phase 7: Polish & Testing (Week 11-12)
- Performance optimization
- Bug fixes
- User testing
- Documentation

## Key Dependencies
```
pygame>=2.5.0
customtkinter>=5.2.0
python-vlc>=3.0.0
librosa>=0.10.0
pydub>=0.25.0
numpy>=1.24.0
pillow>=10.0.0
bcrypt>=4.0.0
openai>=1.0.0
sqlalchemy>=2.0.0
mutagen>=1.47.0
scipy>=1.11.0
```

## Performance Requirements
- Startup time: < 2 seconds
- Audio latency: < 50ms
- Smooth 60 FPS animations
- Memory usage: < 500MB
- CPU usage: < 15% during playback

## Security Considerations
- Password hashing with bcrypt (cost factor 12)
- SQL injection prevention (parameterized queries)
- Session token expiration (24 hours)
- Secure API key storage (environment variables)
- Input validation on all forms

## Accessibility Features
- Keyboard shortcuts for all controls
- Screen reader compatibility
- High contrast mode option
- Adjustable font sizes
- Color blind friendly palettes

## Future Enhancements
- Cloud sync for playlists
- Social features (share playlists)
- Plugin system for visualizers
- Mobile companion app
- Streaming service integration
- Lyrics display with sync
- Concert mode (full-screen visualizer)
