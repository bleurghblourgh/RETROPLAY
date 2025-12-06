"""User authentication and session management"""

import bcrypt
import sqlite3
import os
from datetime import datetime

class AuthenticationManager:
    def __init__(self):
        self.dbPath = 'database/retroplay.db'
        self.currentUser = None
        self.sessionActive = False
        self._initializeDatabase()
    
    def _initializeDatabase(self):
        """Initialize database with required tables"""
        os.makedirs('database', exist_ok=True)
        
        conn = sqlite3.connect(self.dbPath)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                userId INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                passwordHash TEXT NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                lastLogin TIMESTAMP,
                profilePicture TEXT,
                themePreference TEXT DEFAULT 'synthwave'
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS songs (
                songId INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                filePath TEXT NOT NULL,
                title TEXT,
                artist TEXT,
                album TEXT,
                genre TEXT,
                duration INTEGER,
                bpm INTEGER,
                mood TEXT,
                playCount INTEGER DEFAULT 0,
                lastPlayed TIMESTAMP,
                addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                albumArt TEXT,
                FOREIGN KEY (userId) REFERENCES users(userId)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS playlists (
                playlistId INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                playlistName TEXT NOT NULL,
                description TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                isAiGenerated BOOLEAN DEFAULT 0,
                coverImage TEXT,
                FOREIGN KEY (userId) REFERENCES users(userId)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS playlistSongs (
                playlistId INTEGER,
                songId INTEGER,
                position INTEGER,
                addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (playlistId, songId),
                FOREIGN KEY (playlistId) REFERENCES playlists(playlistId),
                FOREIGN KEY (songId) REFERENCES songs(songId)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def registerUser(self, username, email, password):
        """Register a new user"""
        try:
            passwordHash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
            conn = sqlite3.connect(self.dbPath)
            cursor = conn.cursor()
            
            cursor.execute(
                'INSERT INTO users (username, email, passwordHash) VALUES (?, ?, ?)',
                (username, email, passwordHash)
            )
            
            conn.commit()
            conn.close()
            return True, "Registration successful"
        except sqlite3.IntegrityError:
            return False, "Username or email already exists"
        except Exception as e:
            return False, f"Registration failed: {str(e)}"
    
    def loginUser(self, username, password):
        """Authenticate user login"""
        try:
            conn = sqlite3.connect(self.dbPath)
            cursor = conn.cursor()
            
            cursor.execute(
                'SELECT userId, username, email, passwordHash, themePreference FROM users WHERE username = ?',
                (username,)
            )
            
            user = cursor.fetchone()
            
            if user and bcrypt.checkpw(password.encode('utf-8'), user[3]):
                self.currentUser = {
                    'userId': user[0],
                    'username': user[1],
                    'email': user[2],
                    'themePreference': user[4]
                }
                self.sessionActive = True
                
                cursor.execute(
                    'UPDATE users SET lastLogin = ? WHERE userId = ?',
                    (datetime.now(), user[0])
                )
                conn.commit()
                conn.close()
                return True, "Login successful"
            
            conn.close()
            return False, "Invalid username or password"
        except Exception as e:
            return False, f"Login failed: {str(e)}"
    
    def logoutUser(self):
        """Log out current user"""
        self.currentUser = None
        self.sessionActive = False
    
    def isLoggedIn(self):
        return self.sessionActive
    
    def getCurrentUser(self):
        return self.currentUser
    
    def updateThemePreference(self, theme):
        """Update user's theme preference"""
        if self.currentUser:
            try:
                conn = sqlite3.connect(self.dbPath)
                cursor = conn.cursor()
                
                cursor.execute(
                    'UPDATE users SET themePreference = ? WHERE userId = ?',
                    (theme, self.currentUser['userId'])
                )
                
                conn.commit()
                conn.close()
                self.currentUser['themePreference'] = theme
                return True
            except Exception as e:
                print(f"Error updating theme: {e}")
        return False
