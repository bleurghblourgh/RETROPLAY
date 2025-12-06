"""
RETROPLAY Web Application
Modern music player with Flask backend
"""

from flask import Flask, render_template, request, jsonify, session, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
import os
import sys
from datetime import datetime
from werkzeug.utils import secure_filename
import webbrowser
import threading
import time

from src.auth.authenticationManager import AuthenticationManager
from src.core.libraryManager import LibraryManager
from src.core.playlistManager import PlaylistManager
from src.ai.aiMusicAnalyzer import AiMusicAnalyzer

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'retroplay-secret-key-change-in-production'
app.config['UPLOAD_FOLDER'] = 'uploads/music'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize extensions
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Initialize managers
authManager = AuthenticationManager()
libraryManager = LibraryManager()
playlistManager = PlaylistManager()
aiAnalyzer = AiMusicAnalyzer()

# User class for Flask-Login
class User:
    def __init__(self, userId, username, email):
        self.id = userId
        self.username = username
        self.email = email
        self.is_authenticated = True
        self.is_active = True
        self.is_anonymous = False
    
    def get_id(self):
        return str(self.id)

@login_manager.user_loader
def load_user(userId):
    # Load user from database
    return User(userId, "user", "user@example.com")

# Routes
@app.route('/')
def index():
    """Main application page"""
    return render_template('index.html')

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register new user"""
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    success, message = authManager.registerUser(username, email, password)
    return jsonify({'success': success, 'message': message})

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    success, message = authManager.loginUser(username, password)
    
    if success:
        user = authManager.getCurrentUser()
        userObj = User(user['userId'], user['username'], user['email'])
        login_user(userObj)
        session['userId'] = user['userId']
        
        return jsonify({
            'success': True,
            'message': message,
            'user': {
                'userId': user['userId'],
                'username': user['username'],
                'email': user['email'],
                'themePreference': user.get('themePreference', 'synthwave')
            }
        })
    
    return jsonify({'success': False, 'message': message})

@app.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    """Logout user"""
    logout_user()
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/library/songs', methods=['GET'])
@login_required
def get_songs():
    """Get user's music library"""
    userId = session.get('userId')
    songs = libraryManager.getUserSongs(userId)
    return jsonify({'success': True, 'songs': songs})

@app.route('/api/library/upload', methods=['POST'])
@login_required
def upload_music():
    """Upload music file"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file provided'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No file selected'})
    
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Add to library
        userId = session.get('userId')
        success, songId = libraryManager.addSong(userId, filepath)
        
        if success:
            # Analyze with AI
            bpm = aiAnalyzer.detectBpm(filepath)
            mood = aiAnalyzer.analyzeMood(filepath)
            
            return jsonify({
                'success': True,
                'message': 'File uploaded successfully',
                'songId': songId,
                'analysis': {'bpm': bpm, 'mood': mood}
            })
    
    return jsonify({'success': False, 'message': 'Upload failed'})

@app.route('/api/playlists', methods=['GET'])
@login_required
def get_playlists():
    """Get user's playlists"""
    userId = session.get('userId')
    playlists = playlistManager.getUserPlaylists(userId)
    return jsonify({'success': True, 'playlists': playlists})

@app.route('/api/playlists/create', methods=['POST'])
@login_required
def create_playlist():
    """Create new playlist"""
    data = request.json
    userId = session.get('userId')
    name = data.get('name')
    description = data.get('description', '')
    
    success, playlistId = playlistManager.createPlaylist(userId, name, description)
    return jsonify({'success': success, 'playlistId': playlistId})

@app.route('/api/settings/theme', methods=['POST'])
@login_required
def update_theme():
    """Update user theme preference"""
    data = request.json
    theme = data.get('theme')
    
    success = authManager.updateThemePreference(theme)
    return jsonify({'success': success})

@app.route('/uploads/music/<filename>')
@login_required
def serve_music(filename):
    """Serve music files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/player/play', methods=['POST'])
@login_required
def play_song():
    """Get song URL for playback"""
    data = request.json
    songId = data.get('songId')
    
    # Get song details from database
    userId = session.get('userId')
    songs = libraryManager.getUserSongs(userId)
    
    song = next((s for s in songs if s['songId'] == songId), None)
    
    if song:
        filename = os.path.basename(song['filePath'])
        return jsonify({
            'success': True,
            'url': f'/uploads/music/{filename}',
            'song': song
        })
    
    return jsonify({'success': False, 'message': 'Song not found'})

@app.route('/api/playlists/<int:playlistId>/songs', methods=['GET'])
@login_required
def get_playlist_songs(playlistId):
    """Get songs in a playlist"""
    songs = playlistManager.getPlaylistSongs(playlistId)
    return jsonify({'success': True, 'songs': songs})

@app.route('/api/playlists/<int:playlistId>/add', methods=['POST'])
@login_required
def add_to_playlist(playlistId):
    """Add song to playlist"""
    data = request.json
    songId = data.get('songId')
    
    success = playlistManager.addSongToPlaylist(playlistId, songId)
    return jsonify({'success': success})

@app.route('/api/playlists/<int:playlistId>/remove', methods=['POST'])
@login_required
def remove_from_playlist(playlistId):
    """Remove song from playlist"""
    data = request.json
    songId = data.get('songId')
    
    success = playlistManager.removeSongFromPlaylist(playlistId, songId)
    return jsonify({'success': success})

@app.route('/api/playlists/<int:playlistId>/delete', methods=['DELETE'])
@login_required
def delete_playlist(playlistId):
    """Delete playlist"""
    success = playlistManager.deletePlaylist(playlistId)
    return jsonify({'success': success})

@app.route('/api/library/albums', methods=['GET'])
@login_required
def get_albums():
    """Get user's albums"""
    userId = session.get('userId')
    songs = libraryManager.getUserSongs(userId)
    
    # Group by album
    albums = {}
    for song in songs:
        albumName = song.get('album', 'Unknown Album')
        if albumName not in albums:
            albums[albumName] = {
                'name': albumName,
                'artist': song.get('artist', 'Unknown'),
                'songs': [],
                'albumArt': song.get('albumArt')
            }
        albums[albumName]['songs'].append(song)
    
    return jsonify({'success': True, 'albums': list(albums.values())})

@app.route('/api/songs/<int:songId>/play', methods=['POST'])
@login_required
def play_song(songId):
    """Mark song as played and update play count"""
    # Update play count in database
    import sqlite3
    conn = sqlite3.connect('database/retroplay.db')
    cursor = conn.cursor()
    cursor.execute('UPDATE songs SET playCount = playCount + 1, lastPlayed = ? WHERE songId = ?',
                  (datetime.now(), songId))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/ai/analyze/<int:songId>', methods=['POST'])
@login_required
def analyze_song(songId):
    """Analyze song with AI"""
    # Get song from database
    import sqlite3
    conn = sqlite3.connect('database/retroplay.db')
    cursor = conn.cursor()
    cursor.execute('SELECT filePath FROM songs WHERE songId = ?', (songId,))
    result = cursor.fetchone()
    conn.close()
    
    if result:
        filePath = result[0]
        bpm = aiAnalyzer.detectBpm(filePath)
        mood = aiAnalyzer.analyzeMood(filePath)
        genre = aiAnalyzer.extractGenre(filePath)
        
        # Update database
        conn = sqlite3.connect('database/retroplay.db')
        cursor = conn.cursor()
        cursor.execute('UPDATE songs SET bpm = ?, mood = ?, genre = ? WHERE songId = ?',
                      (bpm, mood, genre, songId))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'analysis': {'bpm': bpm, 'mood': mood, 'genre': genre}
        })
    
    return jsonify({'success': False, 'message': 'Song not found'})

# WebSocket events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f'Client connected: {request.sid}')
    emit('connected', {'message': 'Connected to RETROPLAY server'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f'Client disconnected: {request.sid}')

def print_welcome_screen():
    """Print welcome screen with server info"""
    print("\n" + "="*60)
    print("🎵  RETROPLAY - Modern Music Player")
    print("="*60)
    print(f"\n✨ Server Status: RUNNING")
    print(f"🌐 Local URL: http://localhost:5000")
    print(f"🔗 Network URL: http://127.0.0.1:5000")
    print(f"📁 Upload Folder: {app.config['UPLOAD_FOLDER']}")
    print(f"⏰ Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n" + "-"*60)
    print("📖 Quick Start:")
    print("   1. Open http://localhost:5000 in your browser")
    print("   2. Create an account or login")
    print("   3. Upload your music and start playing!")
    print("-"*60)
    print("\n💡 Features:")
    print("   • Drag & Drop music upload")
    print("   • AI-powered music analysis")
    print("   • Smart playlists")
    print("   • 5 retro themes")
    print("   • Real-time visualizer")
    print("-"*60)
    print("\n⚠️  Press CTRL+C to stop the server")
    print("="*60 + "\n")

def open_browser():
    """Open browser after short delay"""
    time.sleep(1.5)
    webbrowser.open('http://localhost:5000')

if __name__ == '__main__':
    # Print welcome screen
    print_welcome_screen()
    
    # Open browser in background thread
    threading.Thread(target=open_browser, daemon=True).start()
    
    # Run server
    try:
        socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True)
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down RETROPLAY server...")
        print("✅ Server stopped successfully\n")
        sys.exit(0)
