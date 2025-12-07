# 🎵 RETROPLAY - START HERE!

## Quick Start (3 Steps)

### 1. Install Python Dependencies
```bash
pip install flask flask-cors werkzeug
```

### 2. Start the Server
**Option A - Windows:**
```bash
Double-click START.bat
```

**Option B - Command Line:**
```bash
cd RETROPLAY
python app_fixed.py
```

### 3. Open Browser
Navigate to: **http://localhost:5000**

That's it! 🎉

---

## What's New & Fixed

### ✅ ALL ISSUES RESOLVED

1. **Profile Fetch Error** - FIXED
   - Proper authentication system
   - Session management working
   - Profile loads correctly

2. **Playlist Editing** - FULLY WORKING
   - Create, edit, delete playlists
   - Add/remove songs
   - Full management interface

3. **Albums** - NOW FUNCTIONAL
   - Auto-groups songs by album
   - View album details
   - Play entire albums

4. **AI Chatbot** - BRAND NEW! 🤖
   - Interactive music assistant
   - Song recommendations
   - Library analysis
   - Mood detection

5. **Server Setup** - CLARIFIED
   - Yes, you need Flask server running
   - Use `app_fixed.py` (complete version)
   - Runs on localhost:5000

---

## Features Overview

### 📚 Library
- Upload and manage songs
- Search and filter
- Play music with visualizer
- Auto-metadata extraction

### 🎵 Playlists
- **Create** new playlists
- **Edit** names and descriptions
- **Add/Remove** songs
- **Delete** playlists
- **View** playlist details

### 💿 Albums
- **Auto-grouped** by album name
- **View** all tracks
- **Play** entire albums
- **Album artwork** display

### 🤖 AI Assistant (NEW!)
- **Chat** about your music
- **Get recommendations** based on taste
- **Analyze** song moods
- **Create** themed playlists
- **Discover** new music

**Try asking:**
- "Recommend songs for me"
- "What's my music taste?"
- "Create a workout playlist"
- "Analyze this song"

### 👤 Profile
- View statistics
- Edit bio and genres
- Upload profile picture
- Privacy settings

### ⚙️ Settings
- Theme customization
- Audio settings
- Account management
- Feedback system

---

## File Structure

```
RETROPLAY/
├── START.bat              ← Double-click to start (Windows)
├── app_fixed.py           ← Main server (USE THIS!)
├── templates/
│   └── index.html         ← Web interface
├── static/
│   ├── css/
│   │   └── style.css      ← Styling
│   └── js/
│       ├── app.js         ← Core functionality
│       ├── profile.js     ← Profile features
│       ├── albums-playlists.js ← Playlist/album management
│       └── ai-chat.js     ← AI chatbot (NEW!)
├── database/
│   ├── schema.sql         ← Database structure
│   └── retroplay.db       ← Created automatically
└── uploads/
    ├── music/             ← Your uploaded songs
    └── profiles/          ← Profile pictures
```

---

## Usage Guide

### First Time Setup

1. **Start server** (see Quick Start above)
2. **Open browser** to http://localhost:5000
3. **Register** a new account
4. **Login** with your credentials
5. **Upload** some music files
6. **Enjoy!** 🎵

### Using Playlists

1. Click **"Playlists"** in sidebar
2. Click **"New Playlist"** button
3. Enter name and description
4. Click on playlist to open it
5. Right-click songs to add them
6. Edit or delete from playlist menu

### Using Albums

1. Upload songs with album metadata
2. Click **"Albums"** in sidebar
3. Albums auto-group by name
4. Click album to view tracks
5. Play entire album or individual songs

### Using AI Assistant

1. Click **"AI Assistant"** in sidebar
2. Use **Quick Actions** or type a message
3. Ask for recommendations
4. Get library analysis
5. Create themed playlists

**Quick Actions:**
- 🎵 Get Recommendations
- 📊 Analyze Library
- 📝 Create Playlist
- 😊 Mood Analysis

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Library
- `GET /api/library/songs` - Get all songs
- `POST /api/library/upload` - Upload song

### Playlists (NEW!)
- `GET /api/playlists` - List playlists
- `POST /api/playlists` - Create playlist
- `GET /api/playlists/:id` - Get playlist details
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:id/songs` - Add song
- `DELETE /api/playlists/:id/songs/:songId` - Remove song

### Albums (NEW!)
- `GET /api/albums` - List all albums
- `GET /api/albums/:name` - Get album songs

### AI Assistant (NEW!)
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/analyze-song/:id` - Analyze song
- `POST /api/ai/recommend` - Get recommendations

### Profile
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/stats` - Get statistics

---

## Troubleshooting

### Server won't start
```bash
# Install dependencies
pip install flask flask-cors werkzeug

# Try running directly
python app_fixed.py
```

### Can't access in browser
- Check server is running
- Try: http://localhost:5000
- Try: http://127.0.0.1:5000
- Check firewall settings

### Profile not loading
- Clear browser cache
- Check you're logged in
- Refresh the page
- Check browser console (F12)

### Playlists not working
- Ensure database initialized
- Check server console for errors
- Try logging out and back in

### AI Chat not responding
- Check server is running
- Verify you're logged in
- Check network tab in browser (F12)

---

## Advanced Features

### Keyboard Shortcuts
- `Space` - Play/Pause
- `→` - Next song
- `←` - Previous song
- `↑` - Volume up
- `↓` - Volume down

### Context Menu
- Right-click songs for options
- Add to playlist
- Edit metadata
- Delete song

### Drag & Drop
- Drag files to upload zone
- Multiple files supported
- Auto-metadata extraction

---

## What's Next?

### Planned Features
- [ ] Lyrics display
- [ ] Queue management
- [ ] Social features (follow users)
- [ ] Collaborative playlists
- [ ] Advanced visualizers
- [ ] Mobile app
- [ ] Desktop app (Electron)

### Integration Options
- **OpenAI API** - Better AI responses
- **Suno AI** - Generate music
- **Spotify API** - Import playlists
- **Last.fm** - Scrobbling
- **Discord** - Rich presence

---

## Support

### Need Help?
1. Check **COMPLETE_FIX.md** for detailed docs
2. Check browser console (F12) for errors
3. Check server console for logs
4. Use **Feedback** in Settings → About

### Report Issues
- Use feedback form in app
- Check console for error messages
- Note what you were doing when error occurred

---

## Credits

**RETROPLAY** - Modern Music Player
- Built with Flask, JavaScript, HTML5, CSS3
- AI-powered music assistant
- Beautiful retro-inspired UI
- Full playlist and album management

---

## License

Free to use and modify for personal projects!

---

## 🎉 Ready to Rock!

**Start the server and enjoy your music!**

```bash
python app_fixed.py
```

Then open: **http://localhost:5000**

Have fun! 🎵✨
