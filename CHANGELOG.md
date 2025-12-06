# RETROPLAY Changelog

## Version 2.0.0 - Modern UI Overhaul

### Major Changes

#### UI/UX Improvements
- **Complete UI Redesign**: Modern, clean interface with professional styling
- **Mouse Support**: Full mouse control - no more keyboard-only navigation
- **Drag and Drop**: Drop music files directly into the application
- **Hover Effects**: Interactive buttons with glow and color transitions
- **Smooth Animations**: Polished transitions and visual feedback

#### New Components
- **Modern Login Screen**: Clean authentication with animated background
- **Enhanced Settings Menu**: Expanded options with volume slider and theme previews
- **Button System**: Reusable button components with icons
- **Text Input Fields**: Professional input fields with focus states
- **Album Cards**: Visual album display with image support
- **Playlist Cards**: Square disc box themed playlist cards
- **Drag Drop Zone**: Visual file upload area

#### AI Integration
- **BPM Detection**: Automatic beat detection using librosa
- **Mood Analysis**: AI-powered mood classification (energetic, calm, happy, melancholic)
- **Genre Classification**: Smart genre prediction from audio features
- **Smart Recommendations**: Suggests similar songs based on listening patterns
- **AI Playlist Descriptions**: GPT-powered creative playlist descriptions
- **Listening Analytics**: Track and analyze your music preferences

#### Image Support
- **Album Artwork**: Display album art from metadata
- **Custom Images**: Support for PNG, JPG image formats
- **Fallback Graphics**: Circular vinyl placeholders when no art available
- **PIL Integration**: Professional image handling and resizing

#### Enhanced Features
- **Volume Control**: Visual slider with percentage display
- **Better File Dialog**: Improved file browser with audio file filtering
- **View Switcher**: Toggle between Library, Playlists, and Albums views
- **Top Bar Navigation**: Quick access to all major features
- **Status Indicators**: Visual feedback for shuffle, repeat modes
- **Glow Effects**: Neon glow on hover for retro aesthetic

### Technical Improvements
- Modular component architecture
- Event-driven button system
- Improved state management
- Better error handling
- Performance optimizations

### Dependencies Added
- `pygame-gui>=0.6.9` - Enhanced UI components
- `librosa>=0.10.0` - Audio analysis
- `openai>=1.0.0` - AI features
- `python-dotenv>=1.0.0` - Environment configuration

### Breaking Changes
- Replaced keyboard-only controls with mouse-first interface
- New main window class (ModernMainWindow)
- Updated event handling system
- Changed settings menu structure

### Migration Guide
1. Update dependencies: `pip install -r requirements.txt`
2. Copy `.env.example` to `.env` for AI features
3. Existing databases remain compatible
4. User preferences are preserved

## Version 1.0.0 - Initial Release

### Features
- Basic music playback
- User authentication
- Playlist management
- 5 retro themes
- Vinyl disk visualization
- Audio visualizer
- SQLite database
- Keyboard controls
