"""Playlist management system"""

import sqlite3
from datetime import datetime

class PlaylistManager:
    def __init__(self, dbPath='database/retroplay.db'):
        self.dbPath = dbPath
    
    def createPlaylist(self, userId, playlistName, description=''):
        """Create a new playlist"""
        try:
            conn = sqlite3.connect(self.dbPath)
            cursor = conn.cursor()
            
            cursor.execute(
                'INSERT INTO playlists (userId, playlistName, description) VALUES (?, ?, ?)',
                (userId, playlistName, description)
            )
            
            playlistId = cursor.lastrowid
            conn.commit()
            conn.close()
            return True, playlistId
        except Exception as e:
            return False, str(e)
    
    def getUserPlaylists(self, userId):
        """Get all playlists for a user"""
        try:
            conn = sqlite3.connect(self.dbPath)
            cursor = conn.cursor()
            
            cursor.execute(
                'SELECT playlistId, playlistName, description, createdAt FROM playlists WHERE userId = ?',
                (userId,)
            )
            
            playlists = cursor.fetchall()
            conn.close()
            
            return [{
                'playlistId': p[0],
                'playlistName': p[1],
                'description': p[2],
                'createdAt': p[3]
            } for p in playlists]
        except Exception as e:
            print(f"Error fetching playlists: {e}")
            return []
    
    def addSongToPlaylist(self, playlistId, songId, position=None):
        """Add a song to a playlist"""
        try:
            conn = sqlite3.connect(self.dbPath)
            cursor = conn.cursor()
            
            if position is None:
                cursor.execute(
                    'SELECT MAX(position) FROM playlistSongs WHERE playlistId = ?',
                    (playlistId,)
                )
                maxPos = cursor.fetchone()[0]
                position = (maxPos + 1) if maxPos is not None else 0
            
            cursor.execute(
                'INSERT INTO playlistSongs (playlistId, songId, position) VALUES (?, ?, ?)',
                (playlistId, songId, position)
            )
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error adding song to playlist: {e}")
            return False
    
    def getPlaylistSongs(self, playlistId):
        """Get all songs in a playlist"""
        try:
            conn = sqlite3.connect(self.dbPath)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT s.songId, s.filePath, s.title, s.artist, s.album, s.duration, ps.position
                FROM songs s
                JOIN playlistSongs ps ON s.songId = ps.songId
                WHERE ps.playlistId = ?
                ORDER BY ps.position
            ''', (playlistId,))
            
            songs = cursor.fetchall()
            conn.close()
            
            return [{
                'songId': s[0],
                'filePath': s[1],
                'title': s[2],
                'artist': s[3],
                'album': s[4],
                'duration': s[5],
                'position': s[6]
            } for s in songs]
        except Exception as e:
            print(f"Error fetching playlist songs: {e}")
            return []
    
    def removeSongFromPlaylist(self, playlistId, songId):
        """Remove a song from a playlist"""
        try:
            conn = sqlite3.connect(self.dbPath)
            cursor = conn.cursor()
            
            cursor.execute(
                'DELETE FROM playlistSongs WHERE playlistId = ? AND songId = ?',
                (playlistId, songId)
            )
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error removing song from playlist: {e}")
            return False
    
    def deletePlaylist(self, playlistId):
        """Delete a playlist"""
        try:
            conn = sqlite3.connect(self.dbPath)
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM playlistSongs WHERE playlistId = ?', (playlistId,))
            cursor.execute('DELETE FROM playlists WHERE playlistId = ?', (playlistId,))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error deleting playlist: {e}")
            return False
