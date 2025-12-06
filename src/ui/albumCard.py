"""Album card component with image support"""

import pygame
import os
from PIL import Image

class AlbumCard:
    def __init__(self, x, y, width, height, album, colorManager, onClick=None):
        self.rect = pygame.Rect(x, y, width, height)
        self.album = album
        self.colorManager = colorManager
        self.onClick = onClick
        
        self.isHovered = False
        self.albumArt = None
        self.albumArtSurface = None
        
        pygame.font.init()
        self.titleFont = pygame.font.Font(None, 24)
        self.textFont = pygame.font.Font(None, 18)
        
        self._loadAlbumArt()
    
    def _loadAlbumArt(self):
        """Load album artwork"""
        # Try to load from first song in album
        if self.album.get('songs'):
            firstSong = self.album['songs'][0]
            artPath = firstSong.get('albumArt')
            
            if artPath and os.path.exists(artPath):
                try:
                    img = Image.open(artPath)
                    img = img.resize((self.rect.width - 20, self.rect.width - 20))
                    
                    # Convert PIL image to pygame surface
                    mode = img.mode
                    size = img.size
                    data = img.tobytes()
                    
                    self.albumArtSurface = pygame.image.fromstring(data, size, mode)
                except Exception as e:
                    print(f"Error loading album art: {e}")
    
    def handleEvent(self, event):
        """Handle mouse events"""
        if event.type == pygame.MOUSEMOTION:
            self.isHovered = self.rect.collidepoint(event.pos)
        
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 1 and self.isHovered:
                if self.onClick:
                    self.onClick(self.album)
                return True
        
        return False
    
    def render(self, surface):
        """Render album card"""
        colors = self.colorManager.getAllColors()
        
        # Draw card background
        bgColor = (*colors['midBackground'], 220) if not self.isHovered else (*colors['midBackground'], 255)
        cardSurface = pygame.Surface((self.rect.width, self.rect.height), pygame.SRCALPHA)
        pygame.draw.rect(cardSurface, bgColor, (0, 0, self.rect.width, self.rect.height), 
                        border_radius=10)
        surface.blit(cardSurface, (self.rect.x, self.rect.y))
        
        # Draw border
        borderColor = colors['neonPink'] if self.isHovered else colors['neonBlue']
        pygame.draw.rect(surface, borderColor, self.rect, 2, border_radius=10)
        
        # Draw glow when hovered
        if self.isHovered:
            glowSurface = pygame.Surface((self.rect.width + 10, self.rect.height + 10), pygame.SRCALPHA)
            pygame.draw.rect(glowSurface, (*colors['neonPink'], 40), 
                           (0, 0, self.rect.width + 10, self.rect.height + 10), 
                           border_radius=12)
            surface.blit(glowSurface, (self.rect.x - 5, self.rect.y - 5))
        
        # Draw album art or placeholder
        artY = self.rect.y + 10
        artSize = self.rect.width - 20
        
        if self.albumArtSurface:
            surface.blit(self.albumArtSurface, (self.rect.x + 10, artY))
        else:
            # Draw circular vinyl placeholder
            centerX = self.rect.centerx
            centerY = artY + artSize // 2
            radius = artSize // 2 - 5
            
            pygame.draw.circle(surface, colors['darkBackground'], (centerX, centerY), radius)
            pygame.draw.circle(surface, borderColor, (centerX, centerY), radius, 3)
            
            # Draw grooves
            for r in range(10, radius - 10, 8):
                pygame.draw.circle(surface, colors['midBackground'], (centerX, centerY), r, 1)
            
            # Center label
            pygame.draw.circle(surface, borderColor, (centerX, centerY), 20)
        
        # Draw album name
        albumName = self.album['name'][:20]
        nameText = self.titleFont.render(albumName, True, borderColor)
        nameRect = nameText.get_rect(center=(self.rect.centerx, self.rect.y + artSize + 25))
        surface.blit(nameText, nameRect)
        
        # Draw artist name
        artistName = self.album['artist'][:20]
        artistText = self.textFont.render(artistName, True, colors['accentGreen'])
        artistRect = artistText.get_rect(center=(self.rect.centerx, self.rect.y + artSize + 45))
        surface.blit(artistText, artistRect)
        
        # Draw song count
        songCount = len(self.album.get('songs', []))
        countText = self.textFont.render(f"{songCount} songs", True, (150, 150, 150))
        countRect = countText.get_rect(center=(self.rect.centerx, self.rect.y + artSize + 65))
        surface.blit(countText, countRect)
