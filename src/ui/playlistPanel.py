"""Playlist panel UI with disc box theming"""

import pygame

class PlaylistPanel:
    def __init__(self, x, y, width, height, colorManager, playlistManager, audioEngine):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.colorManager = colorManager
        self.playlistManager = playlistManager
        self.audioEngine = audioEngine
        
        self.playlists = []
        self.selectedPlaylistIndex = 0
        self.scrollOffset = 0
        self.maxVisible = 8
        
        pygame.font.init()
        self.titleFont = pygame.font.Font(None, 36)
        self.textFont = pygame.font.Font(None, 24)
        self.smallFont = pygame.font.Font(None, 18)
    
    def loadPlaylists(self, userId):
        """Load user playlists"""
        self.playlists = self.playlistManager.getUserPlaylists(userId)
    
    def handleEvent(self, event):
        """Handle playlist panel events"""
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_UP:
                self.selectedPlaylistIndex = max(0, self.selectedPlaylistIndex - 1)
                self._adjustScroll()
            elif event.key == pygame.K_DOWN:
                self.selectedPlaylistIndex = min(len(self.playlists) - 1, self.selectedPlaylistIndex + 1)
                self._adjustScroll()
            elif event.key == pygame.K_RETURN:
                self._playSelectedPlaylist()
        
        return None
    
    def _adjustScroll(self):
        """Adjust scroll offset"""
        if self.selectedPlaylistIndex < self.scrollOffset:
            self.scrollOffset = self.selectedPlaylistIndex
        elif self.selectedPlaylistIndex >= self.scrollOffset + self.maxVisible:
            self.scrollOffset = self.selectedPlaylistIndex - self.maxVisible + 1
    
    def _playSelectedPlaylist(self):
        """Play selected playlist"""
        if self.playlists and 0 <= self.selectedPlaylistIndex < len(self.playlists):
            playlist = self.playlists[self.selectedPlaylistIndex]
            songs = self.playlistManager.getPlaylistSongs(playlist['playlistId'])
            
            if songs:
                self.audioEngine.clearQueue()
                for song in songs:
                    self.audioEngine.addToQueue(song['filePath'])
                
                self.audioEngine.loadSong(songs[0]['filePath'])
                self.audioEngine.play()
    
    def render(self, surface):
        """Render playlist panel with disc box theme"""
        colors = self.colorManager.getAllColors()
        
        # Draw panel background
        panelSurface = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
        pygame.draw.rect(panelSurface, (*colors['midBackground'], 220), 
                        (0, 0, self.width, self.height), border_radius=10)
        surface.blit(panelSurface, (self.x, self.y))
        
        # Draw border
        pygame.draw.rect(surface, colors['neonPurple'], 
                        (self.x, self.y, self.width, self.height), 2, border_radius=10)
        
        # Draw title
        titleText = self.titleFont.render("PLAYLISTS", True, colors['neonPink'])
        surface.blit(titleText, (self.x + 20, self.y + 15))
        
        # Draw playlists as disc boxes
        boxSize = 80
        boxSpacing = 10
        startY = self.y + 60
        
        visiblePlaylists = self.playlists[self.scrollOffset:self.scrollOffset + self.maxVisible]
        
        for i, playlist in enumerate(visiblePlaylists):
            actualIndex = self.scrollOffset + i
            isSelected = actualIndex == self.selectedPlaylistIndex
            
            boxY = startY + i * (boxSize + boxSpacing)
            
            # Draw disc box (square icon)
            boxColor = colors['neonPink'] if isSelected else colors['neonBlue']
            pygame.draw.rect(surface, boxColor, 
                           (self.x + 20, boxY, boxSize, boxSize), 
                           3, border_radius=5)
            
            # Draw inner square
            pygame.draw.rect(surface, colors['darkBackground'], 
                           (self.x + 25, boxY + 5, boxSize - 10, boxSize - 10), 
                           border_radius=3)
            
            # Draw playlist name
            nameText = self.textFont.render(playlist['playlistName'], True, boxColor)
            surface.blit(nameText, (self.x + boxSize + 35, boxY + 15))
            
            # Draw song count
            songs = self.playlistManager.getPlaylistSongs(playlist['playlistId'])
            countText = self.smallFont.render(f"{len(songs)} songs", True, colors['accentGreen'])
            surface.blit(countText, (self.x + boxSize + 35, boxY + 45))
