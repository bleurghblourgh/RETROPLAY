"""Core audio playback engine"""

import pygame
import os
from mutagen import File

class AudioEngine:
    def __init__(self):
        self.currentSong = None
        self.currentSongPath = None
        self.isPlaying = False
        self.isPaused = False
        self.volume = 0.7
        self.queue = []
        self.queueIndex = 0
        self.repeatMode = 'off'
        self.shuffleMode = False
        
        pygame.mixer.music.set_volume(self.volume)
    
    def loadSong(self, filePath):
        """Load a song file"""
        try:
            if os.path.exists(filePath):
                pygame.mixer.music.load(filePath)
                self.currentSongPath = filePath
                self.currentSong = self._extractMetadata(filePath)
                return True
        except Exception as e:
            print(f"Error loading song: {e}")
        return False
    
    def _extractMetadata(self, filePath):
        """Extract metadata from audio file"""
        metadata = {
            'title': os.path.basename(filePath),
            'artist': 'Unknown Artist',
            'album': 'Unknown Album',
            'duration': 0,
            'filePath': filePath
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
                
                if hasattr(audioFile.info, 'length'):
                    metadata['duration'] = int(audioFile.info.length)
        except Exception as e:
            print(f"Error extracting metadata: {e}")
        
        return metadata
    
    def play(self):
        """Start playback"""
        if self.currentSongPath:
            pygame.mixer.music.play()
            self.isPlaying = True
            self.isPaused = False
    
    def pause(self):
        """Pause playback"""
        if self.isPlaying:
            pygame.mixer.music.pause()
            self.isPaused = True
    
    def unpause(self):
        """Resume playback"""
        if self.isPaused:
            pygame.mixer.music.unpause()
            self.isPaused = False
    
    def stop(self):
        """Stop playback"""
        pygame.mixer.music.stop()
        self.isPlaying = False
        self.isPaused = False
    
    def setVolume(self, volume):
        """Set volume (0.0 to 1.0)"""
        self.volume = max(0.0, min(1.0, volume))
        pygame.mixer.music.set_volume(self.volume)
    
    def getVolume(self):
        return self.volume
    
    def getPosition(self):
        """Get current playback position in seconds"""
        if self.isPlaying:
            return pygame.mixer.music.get_pos() / 1000.0
        return 0
    
    def setPosition(self, position):
        """Set playback position in seconds"""
        if self.currentSongPath:
            pygame.mixer.music.play(start=position)
    
    def addToQueue(self, filePath):
        """Add song to queue"""
        self.queue.append(filePath)
    
    def clearQueue(self):
        """Clear the queue"""
        self.queue = []
        self.queueIndex = 0
    
    def playNext(self):
        """Play next song in queue"""
        if self.queue and self.queueIndex < len(self.queue) - 1:
            self.queueIndex += 1
            self.loadSong(self.queue[self.queueIndex])
            self.play()
            return True
        elif self.repeatMode == 'all' and self.queue:
            self.queueIndex = 0
            self.loadSong(self.queue[self.queueIndex])
            self.play()
            return True
        return False
    
    def playPrevious(self):
        """Play previous song in queue"""
        if self.queue and self.queueIndex > 0:
            self.queueIndex -= 1
            self.loadSong(self.queue[self.queueIndex])
            self.play()
            return True
        return False
    
    def toggleRepeat(self):
        """Cycle through repeat modes"""
        modes = ['off', 'one', 'all']
        currentIndex = modes.index(self.repeatMode)
        self.repeatMode = modes[(currentIndex + 1) % len(modes)]
        return self.repeatMode
    
    def toggleShuffle(self):
        """Toggle shuffle mode"""
        self.shuffleMode = not self.shuffleMode
        return self.shuffleMode
    
    def getCurrentSong(self):
        return self.currentSong
    
    def cleanup(self):
        """Clean up resources"""
        pygame.mixer.music.stop()
