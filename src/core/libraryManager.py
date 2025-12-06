"""Music library management"""

import sqlite3
import os
from mutagen import File

class LibraryManager:
    def __init__(self, dbPath='database/retroplay.db'):
        self.dbPath = dbPath
    
    def addSong(self, userId, filePath):
        """Add a song to the library"""
        try:
            metadata = self._extractMetadata(filePath)
            
            conn = sqlite3.connect(self.dbPath)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO songs (userId, filePath, title, artist, album, genre, duration)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (userId, filePath, metadata['title'], metadata['artist'], 
                  metadata['album'], metadata.get('genre', ''), metadata['duration']))
            
            songId = cursor.lastrowid
            conn.commit()
            conn.close()
            return True, songId
        except Exception as e:
            print(f"Error adding song: {e}")
            return False, None
    
    def _extractMetadata(self, filePath):
        """Extract metadata from audio file"""
        metadata = {
            'title': os.path.basename(filePath),
            'artist': 'Unknown Artist',
            'album': 'Unknown Album',
            'genre': '',
            'duration': 0
        }
        
        try:
            audioFile = File(filePath)
            if audioFile is not None:
                if 'TIT2' in audioFile:
                    metadata['title'] = str(audioFile['TIT2'])
                elif 'title' in audioFile:
                    metadata['title'] = str(audioFile['title'][0])
                
                if 'TPE1' in audioFile:
                    metadata['artist'] = str(audioFile['TPE1'])
                elif 'artist' in audioFile:
                    metadata['artist'] = str(audioFile['artist'][0])
                
                if 'TALB' in audioFile:
                    metadata['album'] = str(audioFile['TALB'])
                elif 'album' in audioFile:
                    metadata['album'] = str(audioFile['album'][0])
                
                if 'TCON' in audioFile:
                    metadata['genre'] = str(audioFile['TCON'])
                elif 'genre' in audioFile:
                    metadata['genre'] = str(audioFile['genre'][0])
                
                if hasattr(audioFile.info, 'length'):
                    metadata['duration'] = int(audioFile.info.length)
        except Exception as e:
            print(f"Error extracting metadata: {e}")
        
        return metadata
    
    def getUserSongs(self, userId):
        """Get all songs for a user"""
        try:
            conn = sqlite3.connect(self.dbPath)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT songId, filePath, title, artist, album, genre, duration, playCount
                FROM songs WHERE userId = ?
                ORDER BY addedAt DESC
            ''', (userId,))
            
            songs = cursor.fetchall()
            conn.close()
            
            return [{
                'songId': s[0],
                'filePath': s[1],
                'title': s[2],
                'artist': s[3],
                'album': s[4],
                'genre': s[5],
                'duration': s[6],
                'playCount': s[7]
            } for s in songs]
        except Exception as e:
            print(f"Error fetching songs: {e}")
            return []
    
    def searchSongs(self, userId, query):
        """Search songs by title, artist, or album"""
        try:
            conn = sqlite3.connect(self.dbPath)
            cursor = conn.cursor()
            
            searchPattern = f'%{query}%'
            cursor.execute('''
                SELECT songId, filePath, title, artist, album, genre, duration
                FROM songs 
                WHERE userId = ? AND (title LIKE ? OR artist LIKE ? OR album LIKE ?)
            ''', (userId, searchPattern, searchPattern, searchPattern))
            
            songs = cursor.fetchall()
            conn.close()
            
            return [{
                'songId': s[0],
                'filePath': s[1],
                'title': s[2],
                'artist': s[3],
                'album': s[4],
                'genre': s[5],
                'duration': s[6]
            } for s in songs]
        except Exception as e:
            print(f"Error searching songs: {e}")
            return []
    
    def deleteSong(self, songId):
        """Delete a song from the library"""
        try:
            conn = sqlite3.connect(self.dbPath)
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM playlistSongs WHERE songId = ?', (songId,))
            cursor.execute('DELETE FROM songs WHERE songId = ?', (songId,))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error deleting song: {e}")
            return False
