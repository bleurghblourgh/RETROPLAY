"""
RETROPLAY Web Application - Fixed Version
"""

from flask import Flask, render_template, request, jsonify, session, send_from_directory
from flask_cors import CORS
from functools import wraps
import os
import sqlite3
from datetime import datetime
from werkzeug.utils import secure_filename
import hashlib

# Load environment variables
from dotenv import load_dotenv
# Try multiple locations for .env file
env_paths = ['.env', os.path.join(os.path.dirname(__file__), '.env')]
for env_path in env_paths:
    if os.path.exists(env_path):
        load_dotenv(env_path)
        print(f"[ENV] Loaded from {env_path}")
        break

# OpenAI integration
OPENAI_CLIENT = None
AI_ENABLED = False
try:
    from openai import OpenAI
    api_key = os.environ.get('OPENAI_API_KEY', '')
    print(f"[AI] API key found: {'Yes' if api_key else 'No'} (length: {len(api_key) if api_key else 0})")
    if api_key:
        OPENAI_CLIENT = OpenAI(api_key=api_key)
        AI_ENABLED = True
        print("[AI] OpenAI client initialized successfully")
    else:
        print("[AI] No API key found in environment")
except ImportError:
    print("[WARNING] OpenAI not installed. Run: pip install openai")
except Exception as e:
    print(f"[AI] Error initializing OpenAI: {e}")

# Store conversation history per user
ai_conversations = {}

app = Flask(__name__)
app.config['SECRET_KEY'] = 'retroplay-secret-key-2024'
app.config['UPLOAD_FOLDER'] = 'uploads/music'
app.config['PROFILE_FOLDER'] = 'uploads/profiles'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['PROFILE_FOLDER'], exist_ok=True)
os.makedirs('database', exist_ok=True)

CORS(app)

# Store conversation history per user session
ai_conversations = {}

def get_db():
    conn = sqlite3.connect('database/retroplay.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Create tables
    cursor.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            userId INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            passwordHash TEXT NOT NULL,
            profilePicture TEXT,
            bio TEXT,
            favoriteGenres TEXT,
            isPublic INTEGER DEFAULT 0,
            themePreference TEXT DEFAULT 'synthwave',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS songs (
            songId INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            title TEXT,
            artist TEXT,
            album TEXT,
            duration REAL,
            filePath TEXT,
            albumArt TEXT,
            customImage TEXT,
            customArtist TEXT,
            playCount INTEGER DEFAULT 0,
            liked INTEGER DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(userId)
        );
        CREATE TABLE IF NOT EXISTS playlists (
            playlistId INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            playlistName TEXT NOT NULL,
            description TEXT,
            coverImage TEXT,
            isAiGenerated INTEGER DEFAULT 0,
            isPublic INTEGER DEFAULT 0,
            shareCode TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(userId)
        );
        CREATE TABLE IF NOT EXISTS playlistSongs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            playlistId INTEGER,
            songId INTEGER,
            position INTEGER,
            addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (playlistId) REFERENCES playlists(playlistId),
            FOREIGN KEY (songId) REFERENCES songs(songId)
        );
    ''')
    conn.commit()
    
    # Migrations for existing databases
    cursor = conn.cursor()
    
    # Check and add 'liked' column
    try:
        cursor.execute("SELECT liked FROM songs LIMIT 1")
    except sqlite3.OperationalError:
        print("[DB] Adding 'liked' column to songs table...")
        cursor.execute("ALTER TABLE songs ADD COLUMN liked INTEGER DEFAULT 0")
        conn.commit()
        print("[DB] Migration: 'liked' column added")
    
    # Check and add 'createdAt' column
    try:
        cursor.execute("SELECT createdAt FROM songs LIMIT 1")
    except sqlite3.OperationalError:
        print("[DB] Adding 'createdAt' column to songs table...")
        cursor.execute("ALTER TABLE songs ADD COLUMN createdAt DATETIME")
        # Set existing rows to current timestamp
        cursor.execute("UPDATE songs SET createdAt = datetime('now') WHERE createdAt IS NULL")
        conn.commit()
        print("[DB] Migration: 'createdAt' column added")
    
    # Check and add 'shareCode' column to playlists
    try:
        cursor.execute("SELECT shareCode FROM playlists LIMIT 1")
    except sqlite3.OperationalError:
        print("[DB] Adding 'shareCode' column to playlists table...")
        cursor.execute("ALTER TABLE playlists ADD COLUMN shareCode TEXT")
        cursor.execute("ALTER TABLE playlists ADD COLUMN isPublic INTEGER DEFAULT 0")
        conn.commit()
        print("[DB] Migration: 'shareCode' column added")
    
    conn.close()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'userId' not in session:
            print(f"[AUTH] No userId in session for {f.__name__}")
            return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        try:
            return f(*args, **kwargs)
        except Exception as e:
            print(f"[ERROR] {f.__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'success': False, 'message': str(e)}), 500
    return decorated_function

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password:
        return jsonify({'success': False, 'message': 'All fields required'})
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (username, email, passwordHash) VALUES (?, ?, ?)',
                      (username, email, password_hash))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Registration successful'})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Username or email already exists'})

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'})
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ? AND passwordHash = ?', (username, password_hash))
    user = cursor.fetchone()
    conn.close()
    if user:
        session['userId'] = user['userId']
        return jsonify({
            'success': True,
            'user': {'userId': user['userId'], 'username': user['username'], 'email': user['email']}
        })
    return jsonify({'success': False, 'message': 'Invalid credentials'})

@app.route('/api/auth/check', methods=['GET'])
def check_session():
    if 'userId' in session:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT userId, username, email, themePreference FROM users WHERE userId = ?', (session['userId'],))
        user = cursor.fetchone()
        conn.close()
        if user:
            return jsonify({'success': True, 'user': dict(user)})
    return jsonify({'success': False, 'message': 'No active session'})

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})


# Library Routes
@app.route('/api/library/songs', methods=['GET'])
@login_required
def get_songs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM songs WHERE userId = ? ORDER BY createdAt DESC', (session['userId'],))
    songs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    print(f"[DEBUG] User {session['userId']} has {len(songs)} songs")
    return jsonify({'success': True, 'songs': songs})

@app.route('/api/library/duplicates', methods=['GET'])
@login_required
def find_duplicates():
    """Find duplicate songs based on title and artist"""
    conn = get_db()
    cursor = conn.cursor()
    # Find duplicates by title (case-insensitive)
    cursor.execute('''
        SELECT title, COUNT(*) as count, GROUP_CONCAT(songId) as songIds
        FROM songs WHERE userId = ?
        GROUP BY LOWER(title)
        HAVING COUNT(*) > 1
    ''', (session['userId'],))
    duplicates = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'duplicates': duplicates})

@app.route('/api/library/duplicates', methods=['DELETE'])
@login_required
def remove_duplicates():
    """Remove duplicate songs, keeping the oldest one (lowest songId)"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Find all duplicate groups
    cursor.execute('''
        SELECT title, GROUP_CONCAT(songId) as songIds
        FROM songs WHERE userId = ?
        GROUP BY LOWER(title)
        HAVING COUNT(*) > 1
    ''', (session['userId'],))
    duplicates = cursor.fetchall()
    
    deleted_count = 0
    for dup in duplicates:
        song_ids = [int(x) for x in dup['songIds'].split(',')]
        # Keep the first one (oldest), delete the rest
        song_ids.sort()
        ids_to_delete = song_ids[1:]  # All except the first
        
        for song_id in ids_to_delete:
            # Remove from playlists first
            cursor.execute('DELETE FROM playlistSongs WHERE songId = ?', (song_id,))
            # Delete the song
            cursor.execute('DELETE FROM songs WHERE songId = ? AND userId = ?', (song_id, session['userId']))
            deleted_count += 1
    
    conn.commit()
    conn.close()
    print(f"[DEBUG] Deleted {deleted_count} duplicate songs for user {session['userId']}")
    return jsonify({'success': True, 'deletedCount': deleted_count})

@app.route('/api/library/stats', methods=['GET'])
@login_required
def get_library_stats():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) as total FROM songs WHERE userId = ?', (session['userId'],))
    total = cursor.fetchone()['total']
    cursor.execute('SELECT COUNT(DISTINCT artist) as artists FROM songs WHERE userId = ?', (session['userId'],))
    artists = cursor.fetchone()['artists']
    cursor.execute('SELECT COUNT(DISTINCT album) as albums FROM songs WHERE userId = ?', (session['userId'],))
    albums = cursor.fetchone()['albums']
    conn.close()
    return jsonify({'success': True, 'stats': {'totalSongs': total, 'totalArtists': artists, 'totalAlbums': albums}})

@app.route('/api/library/albums', methods=['GET'])
@login_required
def get_library_albums():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT album, artist, albumArt, COUNT(*) as songCount 
        FROM songs WHERE userId = ? AND album IS NOT NULL AND album != ''
        GROUP BY album ORDER BY album
    ''', (session['userId'],))
    albums = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'albums': albums})

@app.route('/api/library/upload', methods=['POST'])
@login_required
def upload_music():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file provided'})
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No file selected'})
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # Extract metadata including duration
    title = os.path.splitext(filename)[0]
    artist = 'Unknown Artist'
    album = None
    duration = None
    
    try:
        from mutagen import File as MutagenFile
        audio = MutagenFile(filepath)
        if audio:
            # Get duration
            if hasattr(audio, 'info') and hasattr(audio.info, 'length'):
                duration = audio.info.length
            
            # Try to get tags
            if hasattr(audio, 'tags') and audio.tags:
                # ID3 tags (MP3)
                if hasattr(audio.tags, 'get'):
                    if audio.tags.get('TIT2'):
                        title = str(audio.tags.get('TIT2'))
                    if audio.tags.get('TPE1'):
                        artist = str(audio.tags.get('TPE1'))
                    if audio.tags.get('TALB'):
                        album = str(audio.tags.get('TALB'))
                # Other formats (FLAC, OGG, etc.)
                elif hasattr(audio, 'get'):
                    if audio.get('title'):
                        title = audio.get('title')[0]
                    if audio.get('artist'):
                        artist = audio.get('artist')[0]
                    if audio.get('album'):
                        album = audio.get('album')[0]
    except Exception as e:
        print(f"[Upload] Metadata extraction error: {e}")
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO songs (userId, title, artist, album, duration, filePath) VALUES (?, ?, ?, ?, ?, ?)',
                  (session['userId'], title, artist, album, duration, filename))
    conn.commit()
    song_id = cursor.lastrowid
    conn.close()
    return jsonify({'success': True, 'songId': song_id, 'title': title, 'duration': duration})

# Playlist Routes
@app.route('/api/playlists', methods=['GET'])
@login_required
def get_playlists():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT p.*, COUNT(ps.songId) as songCount 
        FROM playlists p LEFT JOIN playlistSongs ps ON p.playlistId = ps.playlistId
        WHERE p.userId = ? GROUP BY p.playlistId ORDER BY p.createdAt DESC
    ''', (session['userId'],))
    playlists = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'playlists': playlists})

@app.route('/api/playlists', methods=['POST'])
@login_required
def create_playlist():
    data = request.json
    name = data.get('name')
    description = data.get('description', '')
    if not name:
        return jsonify({'success': False, 'message': 'Playlist name required'})
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO playlists (userId, playlistName, description) VALUES (?, ?, ?)',
                  (session['userId'], name, description))
    conn.commit()
    playlist_id = cursor.lastrowid
    conn.close()
    return jsonify({'success': True, 'playlistId': playlist_id})

@app.route('/api/playlists/<int:playlist_id>/songs', methods=['GET'])
@login_required
def get_playlist_songs(playlist_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM playlists WHERE playlistId = ? AND userId = ?', (playlist_id, session['userId']))
    playlist = cursor.fetchone()
    if not playlist:
        conn.close()
        return jsonify({'success': False, 'message': 'Playlist not found'})
    cursor.execute('''
        SELECT s.* FROM songs s
        JOIN playlistSongs ps ON s.songId = ps.songId
        WHERE ps.playlistId = ? ORDER BY ps.position
    ''', (playlist_id,))
    songs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'playlist': dict(playlist), 'songs': songs})

@app.route('/api/playlists/<int:playlist_id>/songs', methods=['POST'])
@login_required
def add_song_to_playlist(playlist_id):
    data = request.json
    song_id = data.get('songId')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT MAX(position) as maxPos FROM playlistSongs WHERE playlistId = ?', (playlist_id,))
    result = cursor.fetchone()
    position = (result['maxPos'] or 0) + 1
    cursor.execute('INSERT INTO playlistSongs (playlistId, songId, position) VALUES (?, ?, ?)',
                  (playlist_id, song_id, position))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


@app.route('/api/playlists/<int:playlist_id>', methods=['PUT'])
@login_required
def update_playlist(playlist_id):
    """Update playlist name and description"""
    data = request.json
    new_name = data.get('name', '').strip()
    description = data.get('description', '')
    if not new_name:
        return jsonify({'success': False, 'message': 'Name required'})
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('UPDATE playlists SET playlistName = ?, description = ? WHERE playlistId = ? AND userId = ?',
                  (new_name, description, playlist_id, session['userId']))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


@app.route('/api/playlists/<int:playlist_id>/image', methods=['POST'])
@login_required
def update_playlist_image(playlist_id):
    """Update playlist cover image"""
    if 'image' not in request.files:
        return jsonify({'success': False, 'message': 'No image provided'})
    file = request.files['image']
    filename = secure_filename(f"playlist_{playlist_id}_{file.filename}")
    filepath = os.path.join(app.config['PROFILE_FOLDER'], filename)
    file.save(filepath)
    image_url = f"/uploads/profiles/{filename}"
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('UPDATE playlists SET coverImage = ? WHERE playlistId = ? AND userId = ?',
                  (image_url, playlist_id, session['userId']))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'imageUrl': image_url})


@app.route('/api/playlists/<int:playlist_id>/songs/<int:song_id>', methods=['DELETE'])
@login_required
def remove_song_from_playlist(playlist_id, song_id):
    """Remove a song from a playlist"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM playlistSongs WHERE playlistId = ? AND songId = ?', (playlist_id, song_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


@app.route('/api/playlists/<int:playlist_id>', methods=['DELETE'])
@login_required
def delete_playlist(playlist_id):
    """Delete a playlist"""
    conn = get_db()
    cursor = conn.cursor()
    # Delete songs from playlist first
    cursor.execute('DELETE FROM playlistSongs WHERE playlistId = ?', (playlist_id,))
    # Delete the playlist
    cursor.execute('DELETE FROM playlists WHERE playlistId = ? AND userId = ?', (playlist_id, session['userId']))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


# Album Routes
@app.route('/api/albums/<path:album_name>/songs', methods=['GET'])
@login_required
def get_album_songs(album_name):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM songs WHERE userId = ? AND album = ? ORDER BY title', (session['userId'], album_name))
    songs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    if songs:
        return jsonify({
            'success': True,
            'album': {'name': album_name, 'artist': songs[0].get('artist', 'Various')},
            'songs': songs
        })
    return jsonify({'success': False, 'message': 'Album not found'})

# Profile Routes
@app.route('/api/profile', methods=['GET'])
@login_required
def get_profile():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE userId = ?', (session['userId'],))
    user = cursor.fetchone()
    conn.close()
    if user:
        return jsonify({'success': True, 'profile': dict(user)})
    return jsonify({'success': False, 'message': 'User not found'})

@app.route('/api/profile', methods=['PUT'])
@login_required
def update_profile():
    # Handle both JSON and FormData
    if request.content_type and 'multipart/form-data' in request.content_type:
        bio = request.form.get('bio', '')
        genres = request.form.get('favoriteGenres', '')
        is_public = request.form.get('isPublic', 'false').lower() in ('true', '1', 'on')
        
        # Handle profile picture upload
        profile_picture_url = None
        if 'profilePicture' in request.files:
            file = request.files['profilePicture']
            if file and file.filename:
                filename = secure_filename(f"profile_{session['userId']}_{file.filename}")
                filepath = os.path.join(app.config['PROFILE_FOLDER'], filename)
                file.save(filepath)
                profile_picture_url = f"/uploads/profiles/{filename}"
    else:
        data = request.json or {}
        bio = data.get('bio', '')
        genres = data.get('favoriteGenres', '')
        is_public = data.get('isPublic', 0)
        profile_picture_url = None
    
    conn = get_db()
    cursor = conn.cursor()
    
    if profile_picture_url:
        cursor.execute('''
            UPDATE users SET bio = ?, favoriteGenres = ?, isPublic = ?, profilePicture = ? WHERE userId = ?
        ''', (bio, genres, 1 if is_public else 0, profile_picture_url, session['userId']))
    else:
        cursor.execute('''
            UPDATE users SET bio = ?, favoriteGenres = ?, isPublic = ? WHERE userId = ?
        ''', (bio, genres, 1 if is_public else 0, session['userId']))
    
    conn.commit()
    conn.close()
    print(f"[DEBUG] Profile updated for user {session['userId']}")
    return jsonify({'success': True})

@app.route('/api/profile/stats', methods=['GET'])
@login_required
def get_profile_stats():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) as songs FROM songs WHERE userId = ?', (session['userId'],))
    songs = cursor.fetchone()['songs']
    cursor.execute('SELECT COUNT(*) as playlists FROM playlists WHERE userId = ?', (session['userId'],))
    playlists = cursor.fetchone()['playlists']
    cursor.execute('SELECT SUM(playCount) as plays FROM songs WHERE userId = ?', (session['userId'],))
    plays = cursor.fetchone()['plays'] or 0
    conn.close()
    return jsonify({'success': True, 'stats': {'totalSongs': songs, 'totalPlaylists': playlists, 'totalPlays': plays}})

# Song Routes
@app.route('/api/songs/<int:song_id>/play', methods=['POST'])
@login_required
def increment_play_count(song_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('UPDATE songs SET playCount = playCount + 1 WHERE songId = ?', (song_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/songs/<int:song_id>/duration', methods=['POST'])
@login_required
def update_song_duration(song_id):
    """Update song duration from client-side audio element"""
    data = request.json
    duration = data.get('duration')
    if duration and duration > 0:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('UPDATE songs SET duration = ? WHERE songId = ? AND (duration IS NULL OR duration = 0)', 
                      (duration, song_id))
        conn.commit()
        conn.close()
    return jsonify({'success': True})

@app.route('/api/songs/<int:song_id>/image', methods=['POST'])
@login_required
def update_song_image(song_id):
    if 'image' not in request.files:
        return jsonify({'success': False, 'message': 'No image provided'})
    file = request.files['image']
    filename = secure_filename(f"song_{song_id}_{file.filename}")
    filepath = os.path.join(app.config['PROFILE_FOLDER'], filename)
    file.save(filepath)
    image_url = f"/uploads/profiles/{filename}"
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('UPDATE songs SET customImage = ? WHERE songId = ?', (image_url, song_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'imageUrl': image_url})

# Theme Settings
@app.route('/api/settings/theme', methods=['POST'])
@login_required
def save_theme():
    data = request.json
    theme = data.get('theme', 'synthwave')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET themePreference = ? WHERE userId = ?', (theme, session['userId']))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'theme': theme})

# Serve uploaded files
@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory('uploads', filename)

@app.route('/uploads/music/<path:filename>')
def serve_music(filename):
    return send_from_directory('uploads/music', filename)

@app.route('/uploads/profiles/<path:filename>')
def serve_profile(filename):
    return send_from_directory('uploads/profiles', filename)


# ============================================
# AI CHAT ROUTES (Smart Rule-Based)
# ============================================

import random
import re

# Music knowledge base
MUSIC_FACTS = [
    "The Beatles hold the record for most #1 hits on the Billboard Hot 100 with 20 songs! 🎸",
    "Vinyl records are making a huge comeback - sales have grown for 17 consecutive years! 💿",
    "The longest song ever recorded is 'The Rise and Fall of Bossanova' at over 13 hours! 🎵",
    "Mozart wrote his first symphony at age 8. Talk about a prodigy! 🎹",
    "The 'Wilhelm Scream' sound effect has been used in over 400 films and TV shows! 🎬",
    "Spotify's most-streamed song ever is 'Blinding Lights' by The Weeknd with over 4 billion streams! 🎧",
    "The term 'rock and roll' was originally African American slang! 🎸",
    "Queen's 'Bohemian Rhapsody' took 3 weeks to record - unheard of in 1975! 👑",
    "The harmonica is the world's best-selling musical instrument! 🎶",
    "Elvis Presley never performed outside North America! 🕺",
]

GENRE_MOODS = {
    'happy': ['pop', 'dance', 'disco', 'funk', 'reggae'],
    'sad': ['blues', 'soul', 'ballad', 'acoustic'],
    'energetic': ['rock', 'metal', 'punk', 'edm', 'drum and bass'],
    'chill': ['jazz', 'lofi', 'ambient', 'chillwave', 'bossa nova'],
    'focus': ['classical', 'instrumental', 'ambient', 'lofi'],
    'party': ['dance', 'edm', 'hip hop', 'pop', 'disco'],
    'romantic': ['r&b', 'soul', 'jazz', 'ballad'],
    'workout': ['rock', 'metal', 'edm', 'hip hop', 'drum and bass'],
}

GREETINGS = [
    "Hey there! 🎵 What's on your mind?",
    "Yo! Ready to talk music? 🎧",
    "Hey! What can I help you with today? 🎶",
    "Hi! Let's chat about some tunes! 💿",
]

def get_smart_response(message, songs, playlists, username):
    """Generate intelligent responses based on user input and library"""
    msg = message.lower().strip()
    
    # Greetings
    if any(g in msg for g in ['hello', 'hi', 'hey', 'sup', 'yo', 'hiya']):
        return random.choice([
            f"Hey {username}! 🎵 What's up? Want some music recommendations or just wanna chat?",
            f"Yo {username}! 🎧 Ready to explore some tunes?",
            f"Hey there! 💿 What can I help you with today?",
        ])
    
    # How are you
    if any(p in msg for p in ['how are you', 'how r u', "how's it going", 'whats up', "what's up"]):
        return random.choice([
            "I'm vibing! 🎶 Just here spinning virtual records. What about you?",
            "Doing great! Been listening to some classics. What can I help you with?",
            "Living the dream in the digital realm! 🎧 What's on your mind?",
        ])
    
    # Thanks
    if any(t in msg for t in ['thank', 'thanks', 'thx', 'cheers']):
        return random.choice([
            "You're welcome! 🎵 Anything else you wanna know?",
            "No problem! Happy to help! 🎧",
            "Anytime! That's what I'm here for! 💿",
        ])
    
    # Recommendations
    if any(r in msg for r in ['recommend', 'suggestion', 'what should i listen', 'play something']):
        if songs:
            picks = random.sample(songs, min(3, len(songs)))
            song_list = '\n'.join([f"• {s['title']} by {s.get('artist', 'Unknown')}" for s in picks])
            return f"Based on your library, here are some picks! 🎵\n\n{song_list}\n\nWant more suggestions or something specific?"
        else:
            return "Your library is empty! 📭 Upload some songs first and I can give you personalized recommendations!"
    
    # Playlist creation
    if any(p in msg for p in ['create playlist', 'make playlist', 'new playlist', 'playlist for']):
        if not songs:
            return "You'll need some songs in your library first! Upload some music and I can help create awesome playlists! 🎶"
        
        # Check for mood keywords
        for mood, genres in GENRE_MOODS.items():
            if mood in msg:
                return f"Great idea! For a {mood} playlist, I'd suggest:\n\n" + \
                       f"1. Look for songs with {', '.join(genres[:3])} vibes\n" + \
                       f"2. Check your library for upbeat/mellow tracks\n" + \
                       f"3. Mix in some classics!\n\n" + \
                       f"Want me to pick some songs from your library? 🎵"
        
        return "I'd love to help! What kind of playlist are you thinking? 🎧\n\n" + \
               "• Party vibes? 🎉\n• Chill & relax? 😌\n• Workout energy? 💪\n• Focus mode? 🎯\n\nJust tell me the mood!"
    
    # Library analysis
    if any(a in msg for a in ['analyze', 'analysis', 'my library', 'my music', 'my taste', 'my collection']):
        if not songs:
            return "Your library is empty! Upload some songs and I'll tell you all about your music taste! 🎵"
        
        artists = {}
        for s in songs:
            artist = s.get('artist', 'Unknown')
            artists[artist] = artists.get(artist, 0) + 1
        
        top_artists = sorted(artists.items(), key=lambda x: x[1], reverse=True)[:3]
        artist_str = ', '.join([a[0] for a in top_artists])
        
        return f"📊 Library Analysis for {username}!\n\n" + \
               f"🎵 Total songs: {len(songs)}\n" + \
               f"🎤 Top artists: {artist_str}\n" + \
               f"📁 Playlists: {len(playlists)}\n\n" + \
               f"You've got a nice collection going! Want recommendations based on your taste?"
    
    # Music facts/trivia
    if any(f in msg for f in ['fact', 'trivia', 'tell me something', 'did you know', 'fun fact']):
        return f"🎵 Fun Music Fact!\n\n{random.choice(MUSIC_FACTS)}\n\nWant another one?"
    
    # Mood-based queries
    for mood in GENRE_MOODS.keys():
        if mood in msg:
            genres = GENRE_MOODS[mood]
            return f"For a {mood} mood, I'd recommend {', '.join(genres[:3])} music! 🎧\n\n" + \
                   f"Some artists to check out: {get_artists_for_mood(mood)}\n\n" + \
                   f"Want me to find matching songs in your library?"
    
    # What can you do
    if any(w in msg for w in ['what can you do', 'help', 'features', 'capabilities']):
        return "I'm your music buddy! Here's what I can do: 🎵\n\n" + \
               "• 🎧 Recommend songs from your library\n" + \
               "• 📝 Help create playlists by mood\n" + \
               "• 📊 Analyze your music taste\n" + \
               "• 🎸 Share music facts & trivia\n" + \
               "• 💬 Chat about music!\n\n" + \
               "Just ask away!"
    
    # Favorite/best songs
    if any(f in msg for f in ['favorite', 'best song', 'top song', 'most played']):
        if songs:
            # Sort by play count if available
            sorted_songs = sorted(songs, key=lambda x: x.get('playCount', 0), reverse=True)
            top = sorted_songs[0] if sorted_songs else songs[0]
            return f"Based on your plays, '{top['title']}' seems to be a favorite! 🎵\n\n" + \
                   f"Want me to find similar songs?"
        return "Upload some songs and play them, then I can tell you your favorites! 🎧"
    
    # Genre questions
    if 'genre' in msg:
        return "I love all genres! 🎶 From classic rock to electronic, jazz to hip-hop. " + \
               "What's YOUR favorite genre? I can recommend some tracks!"
    
    # Artist questions
    if any(a in msg for a in ['artist', 'band', 'singer', 'musician']):
        if songs:
            artists = list(set([s.get('artist', 'Unknown') for s in songs]))[:5]
            return f"I see you've got music from: {', '.join(artists)}! 🎤\n\n" + \
                   f"Want recommendations based on any of these artists?"
        return "Tell me your favorite artists and I can suggest similar music! 🎵"
    
    # Default conversational responses
    defaults = [
        f"Interesting! 🎵 Tell me more about what kind of music you're into!",
        f"I'm all ears! 🎧 Want me to recommend something or share a music fact?",
        f"Cool! Want to explore your library or chat about music? 💿",
        f"I'm here to help with all things music! 🎶 Try asking for recommendations or a fun fact!",
    ]
    return random.choice(defaults)


def get_artists_for_mood(mood):
    """Return artist suggestions for a mood"""
    mood_artists = {
        'happy': 'Pharrell, Bruno Mars, Dua Lipa',
        'sad': 'Adele, Sam Smith, Billie Eilish',
        'energetic': 'AC/DC, Metallica, The Prodigy',
        'chill': 'Norah Jones, Jack Johnson, Khruangbin',
        'focus': 'Hans Zimmer, Ludovico Einaudi, Tycho',
        'party': 'Daft Punk, Calvin Harris, The Weeknd',
        'romantic': 'John Legend, Sade, Frank Ocean',
        'workout': 'Eminem, Rage Against the Machine, Skrillex',
    }
    return mood_artists.get(mood, 'various artists')


@app.route('/api/ai/chat', methods=['POST'])
@login_required
def ai_chat():
    data = request.json
    user_message = data.get('message', '').strip()
    
    if not user_message:
        return jsonify({'success': False, 'message': 'No message provided'})
    
    user_id = session['userId']
    
    # Get user's music library
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT title, artist, album, genre, playCount FROM songs WHERE userId = ?', (user_id,))
    songs = [dict(row) for row in cursor.fetchall()]
    cursor.execute('SELECT playlistName FROM playlists WHERE userId = ?', (user_id,))
    playlists = [row['playlistName'] for row in cursor.fetchall()]
    cursor.execute('SELECT username FROM users WHERE userId = ?', (user_id,))
    user = cursor.fetchone()
    username = user['username'] if user else 'User'
    conn.close()
    
    # Generate smart response
    response = get_smart_response(user_message, songs, playlists, username)
    
    return jsonify({'success': True, 'response': response})


@app.route('/api/ai/clear', methods=['POST'])
@login_required
def clear_ai_chat():
    """Clear conversation history"""
    user_id = session['userId']
    if user_id in ai_conversations:
        ai_conversations[user_id] = []
    return jsonify({'success': True})


# ============================================
# QUICK WIN FEATURES API ENDPOINTS
# ============================================

@app.route('/api/library/recent', methods=['GET'])
@login_required
def get_recently_played():
    """Get recently played songs (last 20)"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM songs 
        WHERE userId = ? AND playCount > 0
        ORDER BY playCount DESC, createdAt DESC
        LIMIT 20
    ''', (session['userId'],))
    songs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'songs': songs})


@app.route('/api/library/liked', methods=['GET'])
@login_required
def get_liked_songs():
    """Get all liked songs"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM songs 
        WHERE userId = ? AND liked = 1
        ORDER BY createdAt DESC
    ''', (session['userId'],))
    songs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'songs': songs})


# ============================================
# SMART PLAYLISTS
# ============================================

@app.route('/api/smart-playlists/most-played', methods=['GET'])
@login_required
def get_most_played():
    """Get top 25 most played songs"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM songs 
        WHERE userId = ? AND playCount > 0
        ORDER BY playCount DESC
        LIMIT 25
    ''', (session['userId'],))
    songs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'songs': songs})


@app.route('/api/smart-playlists/recently-added', methods=['GET'])
@login_required
def get_recently_added():
    """Get songs added in the last 30 days"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM songs 
        WHERE userId = ? AND createdAt >= datetime('now', '-30 days')
        ORDER BY createdAt DESC
    ''', (session['userId'],))
    songs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'songs': songs})


@app.route('/api/smart-playlists/forgotten-gems', methods=['GET'])
@login_required
def get_forgotten_gems():
    """Get songs with 0 plays, added 30+ days ago"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM songs 
        WHERE userId = ? AND (playCount = 0 OR playCount IS NULL)
        AND createdAt <= datetime('now', '-30 days')
        ORDER BY createdAt ASC
    ''', (session['userId'],))
    songs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'songs': songs})


# ============================================
# LISTENING STATS
# ============================================

@app.route('/api/stats', methods=['GET'])
@login_required
def get_listening_stats():
    """Get listening statistics for the user"""
    period = request.args.get('period', 'week')
    
    # Calculate date range
    if period == 'week':
        date_filter = "datetime('now', '-7 days')"
    elif period == 'month':
        date_filter = "datetime('now', '-30 days')"
    elif period == 'year':
        date_filter = "datetime('now', '-365 days')"
    else:
        date_filter = "datetime('1970-01-01')"
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Total plays and time
    cursor.execute(f'''
        SELECT COUNT(*) as totalPlays, SUM(duration) as totalSeconds
        FROM songs WHERE userId = ? AND playCount > 0
    ''', (session['userId'],))
    totals = cursor.fetchone()
    total_plays = totals['totalPlays'] or 0
    total_minutes = (totals['totalSeconds'] or 0) / 60
    
    # Top artists
    cursor.execute('''
        SELECT artist as name, SUM(playCount) as plays
        FROM songs WHERE userId = ? AND playCount > 0
        GROUP BY artist ORDER BY plays DESC LIMIT 10
    ''', (session['userId'],))
    top_artists = [dict(row) for row in cursor.fetchall()]
    
    # Top songs
    cursor.execute('''
        SELECT songId, title, artist, playCount as plays
        FROM songs WHERE userId = ? AND playCount > 0
        ORDER BY playCount DESC LIMIT 10
    ''', (session['userId'],))
    top_songs = [dict(row) for row in cursor.fetchall()]
    
    # Daily activity (last 7 days)
    daily_activity = []
    for i in range(6, -1, -1):
        day_label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        from datetime import datetime, timedelta
        day = datetime.now() - timedelta(days=i)
        daily_activity.append({
            'label': day_label[day.weekday()] if i > 0 else 'Today',
            'plays': 0  # Would need play history table for accurate data
        })
    
    # Estimate daily plays from total
    if total_plays > 0 and len(daily_activity) > 0:
        avg_per_day = total_plays // 7
        for i, day in enumerate(daily_activity):
            day['plays'] = avg_per_day + (i % 3)  # Slight variation
    
    conn.close()
    
    return jsonify({
        'success': True,
        'stats': {
            'totalPlays': total_plays,
            'totalMinutes': total_minutes,
            'topArtist': top_artists[0]['name'] if top_artists else None,
            'streak': 1,  # Would need daily tracking
            'topArtists': top_artists,
            'topSongs': top_songs,
            'dailyActivity': daily_activity
        }
    })


# ============================================
# SOCIAL / ACTIVITY
# ============================================

@app.route('/api/activity/listening', methods=['POST'])
@login_required
def update_listening_activity():
    """Update what user is currently listening to"""
    data = request.json
    # Store in session for now (could use Redis for real-time)
    session['currently_listening'] = {
        'songId': data.get('songId'),
        'title': data.get('title'),
        'artist': data.get('artist'),
        'timestamp': data.get('timestamp')
    }
    return jsonify({'success': True})


@app.route('/api/playlists/<int:playlist_id>/share', methods=['POST'])
@login_required
def share_playlist(playlist_id):
    """Generate a share link for a playlist"""
    import hashlib
    import time
    
    # Generate share code
    share_code = hashlib.md5(f"{playlist_id}-{session['userId']}-{time.time()}".encode()).hexdigest()[:12]
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Update playlist to be public with share code
    cursor.execute('''
        UPDATE playlists SET isPublic = 1, shareCode = ?
        WHERE playlistId = ? AND userId = ?
    ''', (share_code, playlist_id, session['userId']))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'shareCode': share_code})


@app.route('/shared/playlist/<share_code>')
def view_shared_playlist(share_code):
    """View a shared playlist (public, no login required)"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT p.*, u.username FROM playlists p
        JOIN users u ON p.userId = u.userId
        WHERE p.shareCode = ? AND p.isPublic = 1
    ''', (share_code,))
    playlist = cursor.fetchone()
    
    if not playlist:
        conn.close()
        return "Playlist not found", 404
    
    cursor.execute('''
        SELECT s.* FROM songs s
        JOIN playlistSongs ps ON s.songId = ps.songId
        WHERE ps.playlistId = ?
    ''', (playlist['playlistId'],))
    songs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    # Return JSON for now (could render a template)
    return jsonify({
        'playlist': dict(playlist),
        'songs': songs,
        'sharedBy': playlist['username']
    })


@app.route('/api/songs/<int:song_id>/like', methods=['POST'])
@login_required
def toggle_like_song(song_id):
    """Toggle like status for a song"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get current like status
    cursor.execute('SELECT liked FROM songs WHERE songId = ? AND userId = ?', 
                   (song_id, session['userId']))
    result = cursor.fetchone()
    
    if not result:
        conn.close()
        return jsonify({'success': False, 'message': 'Song not found'})
    
    # Toggle the like status
    new_liked = 0 if result['liked'] else 1
    cursor.execute('UPDATE songs SET liked = ? WHERE songId = ?', (new_liked, song_id))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'liked': bool(new_liked)})


@app.route('/api/songs/<int:song_id>/artist', methods=['PUT'])
@login_required
def update_song_artist(song_id):
    """Update song artist name"""
    data = request.json
    artist = data.get('artist', '').strip()
    
    if not artist:
        return jsonify({'success': False, 'message': 'Artist name required'})
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('UPDATE songs SET customArtist = ? WHERE songId = ? AND userId = ?',
                   (artist, song_id, session['userId']))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})


@app.route('/api/songs/<int:song_id>/podcast', methods=['POST'])
@login_required
def mark_as_podcast(song_id):
    """Mark a song as a podcast"""
    data = request.json
    is_podcast = data.get('isPodcast', True)
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if isPodcast column exists, if not add it
    try:
        cursor.execute('ALTER TABLE songs ADD COLUMN isPodcast INTEGER DEFAULT 0')
        conn.commit()
    except:
        pass  # Column already exists
    
    cursor.execute('UPDATE songs SET isPodcast = ? WHERE songId = ? AND userId = ?',
                   (1 if is_podcast else 0, song_id, session['userId']))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})


@app.route('/api/songs/<int:song_id>', methods=['DELETE'])
@login_required
def delete_song(song_id):
    """Delete a song"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get file path first
    cursor.execute('SELECT filePath FROM songs WHERE songId = ? AND userId = ?',
                   (song_id, session['userId']))
    result = cursor.fetchone()
    
    if result:
        # Delete from playlists
        cursor.execute('DELETE FROM playlistSongs WHERE songId = ?', (song_id,))
        # Delete song record
        cursor.execute('DELETE FROM songs WHERE songId = ?', (song_id,))
        conn.commit()
        
        # Try to delete file
        try:
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], result['filePath'])
            if os.path.exists(filepath):
                os.remove(filepath)
        except:
            pass
    
    conn.close()
    return jsonify({'success': True})


# Initialize database on module load (important for fresh clones!)
init_db()
print("[DB] Database initialized")

# Initialize and run
if __name__ == '__main__':
    print("\n" + "="*50)
    print("  RETROPLAY Server Starting...")
    print("  Open: http://localhost:5000")
    print("="*50 + "\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
