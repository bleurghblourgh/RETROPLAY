# RETROPLAY Web Application Guide

## 🚀 Quick Start

### Installation

1. **Install Dependencies**
```bash
pip install -r requirements.txt
```

2. **Run the Application**
```bash
python main.py
```

3. **Access RETROPLAY**
The application will automatically open in your browser at:
- **Local**: http://localhost:5000
- **Network**: http://127.0.0.1:5000

## 📱 Features

### Modern Web Interface
- **Sleek Design**: State-of-the-art web UI inspired by modern streaming platforms
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Socket.IO for instant synchronization
- **Smooth Animations**: CSS transitions and transforms

### Navigation Tabs
1. **Library** - Browse all your music
2. **Playlists** - Create and manage playlists
3. **Albums** - View music organized by album
4. **Upload** - Drag & drop music files
5. **Settings** - Customize your experience

### Drag & Drop Upload
- Drop music files anywhere in the Upload tab
- Supports: MP3, WAV, OGG, FLAC, M4A
- Real-time upload progress
- Automatic AI analysis

### AI Features
- **BPM Detection**: Automatic beat detection
- **Mood Analysis**: AI classifies song mood
- **Smart Recommendations**: Suggests similar songs
- **Genre Classification**: Predicts music genre

### Player Controls
- Play/Pause
- Next/Previous track
- Shuffle mode
- Repeat mode
- Volume control
- Progress bar

## 🎨 Themes

Choose from 5 retro-inspired themes:
1. **Synthwave** (Default) - Classic 80s neon
2. **Tokyo Nights** - Neon cityscape
3. **Cyberpunk Red** - Dark with red accents
4. **Vaporwave Pastels** - Soft pastel colors
5. **Matrix Green** - Terminal green

## 🔐 Authentication

### Register
1. Click "Register" on login screen
2. Enter username, email, and password
3. Click "Register" button
4. Login with your credentials

### Login
1. Enter username and password
2. Click "Login" button
3. Access your personal library

## 📤 Uploading Music

### Method 1: Drag & Drop
1. Go to Upload tab
2. Drag music files from your computer
3. Drop them in the upload zone
4. Wait for upload and AI analysis

### Method 2: Click to Browse
1. Go to Upload tab
2. Click the upload zone
3. Select files from file picker
4. Upload begins automatically

## 🎵 Managing Music

### Library
- View all your songs
- Search by title, artist, or album
- Click to play
- Right-click for options

### Playlists
- Create custom playlists
- Add/remove songs
- Reorder tracks
- Share with friends (coming soon)

### Albums
- Automatic album grouping
- Album artwork display
- Play entire album
- View album details

## ⚙️ Settings

### Appearance
- Change theme
- Adjust colors
- Toggle animations

### Audio
- Volume control
- Audio quality
- Crossfade duration

### Account
- View profile
- Change password
- Export data
- Delete account

## 🌐 Network Access

### Local Network
To access from other devices on your network:
1. Find your computer's IP address
2. Open http://YOUR_IP:5000 on other device
3. Login with your account

### Port Configuration
Default port is 5000. To change:
```python
# In app.py, modify:
socketio.run(app, host='0.0.0.0', port=YOUR_PORT)
```

## 🔧 Advanced Configuration

### Environment Variables
Create `.env` file:
```
OPENAI_API_KEY=your_key_here
SECRET_KEY=your_secret_key
DEBUG=False
```

### Upload Limits
Modify in `app.py`:
```python
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB
```

### Database Location
Default: `database/retroplay.db`
Change in `src/auth/authenticationManager.py`

## 📊 Server Logs

When you run `python main.py`, you'll see:
```
============================================================
🎵  RETROPLAY - Modern Music Player
============================================================

✨ Server Status: RUNNING
🌐 Local URL: http://localhost:5000
🔗 Network URL: http://127.0.0.1:5000
📁 Upload Folder: uploads/music
⏰ Started: 2024-01-01 12:00:00

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

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5000 | xargs kill -9
```

### Can't Access from Network
- Check firewall settings
- Ensure port 5000 is open
- Verify IP address is correct

### Upload Fails
- Check file size (max 100MB)
- Verify file format is supported
- Ensure uploads folder exists

### Database Errors
- Delete `database/retroplay.db`
- Restart application
- Database will be recreated

## 🚀 Future Features

Coming soon:
- Social features (friends, sharing)
- Collaborative playlists
- Live listening parties
- Mobile apps
- Cloud sync
- Lyrics display
- Concert recommendations
- Music discovery

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Library
- `GET /api/library/songs` - Get user songs
- `POST /api/library/upload` - Upload music

### Playlists
- `GET /api/playlists` - Get user playlists
- `POST /api/playlists/create` - Create playlist

### Settings
- `POST /api/settings/theme` - Update theme

## 🤝 Contributing

RETROPLAY is open for contributions!
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - Feel free to use and modify!
