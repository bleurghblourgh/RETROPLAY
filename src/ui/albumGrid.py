"""Album grid view with circular icons"""

import pygame
import math

class AlbumGrid:
    def __init__(self, x, y, width, height, colorManager, libraryManager, audioEngine):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.colorManager = colorManager
        self.libraryManager = libraryManager
        self.audioEngine = audioEngine
        
        self.albums = {}
        self.albumList = []
        self.selectedIndex = 0
        self.scrollOffset = 0
        
        self.iconRadius = 60
        self.iconsPerRow = 4
        self.iconSpacing = 40
        
        pygame.font.init()
        self.titleFont = pygame.font.Font(None, 32)
        self.textFont = pygame.font.Font(None, 20)
    
    def loadAlbums(self, userId):
        """Load albums from user library"""
        songs = self.libraryManager.getUserSongs(userId)
        
        # Group songs by album
        self.albums = {}
        for song in songs:
            albumName = song['album'] or 'Unknown Album'
            if albumName not in self.albums:
                self.albums[albumName] = {
                    'name': albumName,
                    'artist': song['artist'],
                    'songs': []
                }
            self.albums[albumName]['songs'].append(song)
        
        self.albumList = list(self.albums.values())
    
    def handleEvent(self, event):
        """Handle album grid events"""
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_LEFT:
                self.selectedIndex = max(0, self.selectedIndex - 1)
            elif event.key == pygame.K_RIGHT:
                self.selectedIndex = min(len(self.albumList) - 1, self.selectedIndex + 1)
            elif event.key == pygame.K_UP:
                self.selectedIndex = max(0, self.selectedIndex - self.iconsPerRow)
            elif event.key == pygame.K_DOWN:
                self.selectedIndex = min(len(self.albumList) - 1, 
                                        self.selectedIndex + self.iconsPerRow)
            elif event.key == pygame.K_RETURN:
                self._playSelectedAlbum()
        
        return None
    
    def _playSelectedAlbum(self):
        """Play selected album"""
        if self.albumList and 0 <= self.selectedIndex < len(self.albumList):
            album = self.albumList[self.selectedIndex]
            songs = album['songs']
            
            if songs:
                self.audioEngine.clearQueue()
                for song in songs:
                    self.audioEngine.addToQueue(song['filePath'])
                
                self.audioEngine.loadSong(songs[0]['filePath'])
                self.audioEngine.play()
    
    def render(self, surface):
        """Render album grid with circular icons"""
        colors = self.colorManager.getAllColors()
        
        # Draw background
        panelSurface = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
        pygame.draw.rect(panelSurface, (*colors['midBackground'], 200), 
                        (0, 0, self.width, self.height), border_radius=10)
        surface.blit(panelSurface, (self.x, self.y))
        
        # Draw title
        titleText = self.titleFont.render("ALBUMS", True, colors['neonPink'])
        surface.blit(titleText, (self.x + 20, self.y + 15))
        
        # Draw album icons in grid
        startX = self.x + 40
        startY = self.y + 70
        
        for i, album in enumerate(self.albumList):
            row = i // self.iconsPerRow
            col = i % self.iconsPerRow
            
            iconX = startX + col * (self.iconRadius * 2 + self.iconSpacing)
            iconY = startY + row * (self.iconRadius * 2 + self.iconSpacing + 40)
            
            isSelected = i == self.selectedIndex
            
            # Draw circular album icon
            if isSelected:
                # Draw glow
                glowRadius = self.iconRadius + 10
                glowSurface = pygame.Surface((glowRadius * 2, glowRadius * 2), pygame.SRCALPHA)
                pygame.draw.circle(glowSurface, (*colors['neonPink'], 80), 
                                 (glowRadius, glowRadius), glowRadius)
                surface.blit(glowSurface, (iconX - 10, iconY - 10))
            
            # Draw main circle
            circleColor = colors['neonPink'] if isSelected else colors['neonBlue']
            pygame.draw.circle(surface, circleColor, (iconX, iconY), self.iconRadius, 3)
            pygame.draw.circle(surface, colors['darkBackground'], (iconX, iconY), self.iconRadius - 5)
            
            # Draw vinyl grooves
            for r in range(15, self.iconRadius - 10, 8):
                pygame.draw.circle(surface, colors['midBackground'], (iconX, iconY), r, 1)
            
            # Draw center label
            labelRadius = 20
            pygame.draw.circle(surface, circleColor, (iconX, iconY), labelRadius)
            
            # Draw album name below icon
            nameText = self.textFont.render(album['name'][:15], True, circleColor)
            nameRect = nameText.get_rect(center=(iconX, iconY + self.iconRadius + 20))
            surface.blit(nameText, nameRect)
