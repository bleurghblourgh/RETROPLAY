"""AI-powered music analysis and recommendations"""

import os
from datetime import datetime

try:
    import librosa
    import numpy as np
    LIBROSA_AVAILABLE = True
except ImportError:
    LIBROSA_AVAILABLE = False

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

class AiMusicAnalyzer:
    def __init__(self):
        self.openaiClient = None
        if OPENAI_AVAILABLE:
            apiKey = os.getenv('OPENAI_API_KEY')
            if apiKey:
                self.openaiClient = OpenAI(api_key=apiKey)
    
    def detectBpm(self, audioFilePath):
        """Detect BPM of audio file"""
        if not LIBROSA_AVAILABLE:
            return None
        
        try:
            y, sr = librosa.load(audioFilePath, duration=30)
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            return int(tempo)
        except Exception as e:
            print(f"Error detecting BPM: {e}")
            return None
    
    def analyzeMood(self, audioFilePath):
        """Analyze mood of audio file"""
        if not LIBROSA_AVAILABLE:
            return "unknown"
        
        try:
            y, sr = librosa.load(audioFilePath, duration=30)
            
            # Extract features
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            spectralCentroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
            zeroCrossingRate = np.mean(librosa.feature.zero_crossing_rate(y))
            
            # Simple mood classification
            if tempo > 140 and spectralCentroid > 2000:
                return "energetic"
            elif tempo < 90 and spectralCentroid < 1500:
                return "calm"
            elif tempo > 120:
                return "happy"
            else:
                return "melancholic"
        
        except Exception as e:
            print(f"Error analyzing mood: {e}")
            return "unknown"
    
    def extractGenre(self, audioFilePath, metadata=None):
        """Extract or predict genre"""
        # First try metadata
        if metadata and metadata.get('genre'):
            return metadata['genre']
        
        # Fallback to basic analysis
        if not LIBROSA_AVAILABLE:
            return "Unknown"
        
        try:
            y, sr = librosa.load(audioFilePath, duration=30)
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            
            # Very basic genre classification
            if tempo > 140:
                return "Electronic/Dance"
            elif tempo > 110:
                return "Pop/Rock"
            elif tempo > 80:
                return "R&B/Soul"
            else:
                return "Classical/Ambient"
        
        except Exception as e:
            print(f"Error extracting genre: {e}")
            return "Unknown"
    
    def generateColorPalette(self, mood):
        """Generate color palette based on mood"""
        palettes = {
            "energetic": {
                'primary': (255, 0, 110),
                'secondary': (255, 158, 0),
                'accent': (0, 255, 255)
            },
            "calm": {
                'primary': (142, 202, 230),
                'secondary': (170, 255, 195),
                'accent': (203, 166, 247)
            },
            "happy": {
                'primary': (255, 204, 170),
                'secondary': (255, 158, 100),
                'accent': (255, 117, 181)
            },
            "melancholic": {
                'primary': (139, 0, 255),
                'secondary': (187, 154, 247),
                'accent': (125, 207, 255)
            },
            "unknown": {
                'primary': (0, 245, 255),
                'secondary': (139, 0, 255),
                'accent': (255, 0, 110)
            }
        }
        
        return palettes.get(mood, palettes['unknown'])
    
    def recommendSimilarSongs(self, currentSong, songLibrary, count=5):
        """Recommend similar songs based on current song"""
        if not currentSong or not songLibrary:
            return []
        
        # Simple recommendation based on artist and genre
        recommendations = []
        currentArtist = currentSong.get('artist', '').lower()
        currentGenre = currentSong.get('genre', '').lower()
        
        for song in songLibrary:
            if song['songId'] == currentSong.get('songId'):
                continue
            
            score = 0
            if song.get('artist', '').lower() == currentArtist:
                score += 3
            if song.get('genre', '').lower() == currentGenre:
                score += 2
            
            if score > 0:
                recommendations.append((score, song))
        
        # Sort by score and return top N
        recommendations.sort(reverse=True, key=lambda x: x[0])
        return [song for _, song in recommendations[:count]]
    
    def generatePlaylistDescription(self, playlistName, songs):
        """Generate AI description for playlist"""
        if not self.openaiClient or not songs:
            return f"A collection of {len(songs)} songs"
        
        try:
            # Extract song info
            songInfo = [f"{s.get('title', 'Unknown')} by {s.get('artist', 'Unknown')}" 
                       for s in songs[:5]]
            
            prompt = f"""Generate a short, creative description (max 50 words) for a music playlist named "{playlistName}" 
            containing songs like: {', '.join(songInfo)}. Make it engaging and retro-themed."""
            
            response = self.openaiClient.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100
            )
            
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            print(f"Error generating description: {e}")
            return f"A curated collection of {len(songs)} tracks"
    
    def analyzeListeningPatterns(self, userSongs):
        """Analyze user listening patterns"""
        if not userSongs:
            return {}
        
        patterns = {
            'totalSongs': len(userSongs),
            'totalPlayCount': sum(s.get('playCount', 0) for s in userSongs),
            'topArtists': {},
            'topGenres': {},
            'averagePlayCount': 0
        }
        
        # Count artists and genres
        for song in userSongs:
            artist = song.get('artist', 'Unknown')
            genre = song.get('genre', 'Unknown')
            playCount = song.get('playCount', 0)
            
            patterns['topArtists'][artist] = patterns['topArtists'].get(artist, 0) + playCount
            patterns['topGenres'][genre] = patterns['topGenres'].get(genre, 0) + playCount
        
        # Calculate average
        if patterns['totalSongs'] > 0:
            patterns['averagePlayCount'] = patterns['totalPlayCount'] / patterns['totalSongs']
        
        # Sort top items
        patterns['topArtists'] = dict(sorted(patterns['topArtists'].items(), 
                                            key=lambda x: x[1], reverse=True)[:5])
        patterns['topGenres'] = dict(sorted(patterns['topGenres'].items(), 
                                           key=lambda x: x[1], reverse=True)[:5])
        
        return patterns
