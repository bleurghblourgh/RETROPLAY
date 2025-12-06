# RETROPLAY AI Features

## Overview

RETROPLAY includes AI-powered features to enhance your music experience. These features are optional and require additional setup.

## AI Capabilities

### 1. BPM Detection
- Automatically detects beats per minute of songs
- Uses librosa audio analysis
- Syncs vinyl disk rotation speed with BPM

### 2. Mood Analysis
- Analyzes audio characteristics to determine mood
- Categories: energetic, calm, happy, melancholic
- Generates color palettes based on mood

### 3. Genre Classification
- Predicts music genre from audio features
- Falls back to metadata when available
- Helps organize your library

### 4. Smart Recommendations
- Suggests similar songs based on:
  - Artist matching
  - Genre similarity
  - Listening patterns
- Learns from your play history

### 5. AI Playlist Descriptions
- Generates creative descriptions for playlists
- Uses OpenAI GPT models
- Retro-themed and engaging text

### 6. Listening Pattern Analysis
- Tracks your music preferences
- Identifies top artists and genres
- Provides insights into listening habits

## Setup Instructions

### Basic AI Features (Free)

Install librosa for audio analysis:
```bash
pip install librosa
```

This enables:
- BPM detection
- Mood analysis
- Genre classification
- Basic recommendations

### Advanced AI Features (Requires API Key)

For AI-generated playlist descriptions:

1. Get an OpenAI API key from https://platform.openai.com/
2. Copy `.env.example` to `.env`
3. Add your API key:
```
OPENAI_API_KEY=sk-your-key-here
```

## Usage

### Automatic Analysis

When you add a song, RETROPLAY automatically:
1. Extracts metadata
2. Detects BPM
3. Analyzes mood
4. Classifies genre

### Manual Analysis

You can trigger analysis from:
- Song context menu
- Library management panel
- Batch analysis tool

### Viewing AI Data

AI-analyzed data appears in:
- Song details panel
- Library filters
- Playlist creation wizard

## Privacy

- All audio analysis happens locally
- Only playlist descriptions use external API
- No music files are uploaded
- Listening data stays on your device

## Performance

- BPM detection: ~2-5 seconds per song
- Mood analysis: ~3-7 seconds per song
- Recommendations: Instant
- Playlist descriptions: ~1-2 seconds

## Troubleshooting

**Slow Analysis:**
- Analysis uses first 30 seconds of song
- Close other applications
- Disable real-time analysis in settings

**API Errors:**
- Check API key is valid
- Verify internet connection
- Check OpenAI service status

**Missing Features:**
- Ensure librosa is installed
- Check Python version (3.10+ required)
- Reinstall dependencies

## Future AI Features

Coming soon:
- Voice commands
- Auto-playlist generation
- Mood-based recommendations
- Collaborative filtering
- Music similarity search
- Lyrics analysis
- Concert recommendations
