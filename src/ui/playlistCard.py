"""Playlist card component"""

import pygame

class PlaylistCard:
    def __init__(self, x, y, width, height, playlist, colorManager, onClick=None):
        self.rect = pygame.Rect(x, y, width, height)
        self.playlist = playlist
        self.colorManager = colorManager
        self.onClick = onClick
        
        self.isHovered = False
        
        pygame.font.init()
        self.titleFont = pygame.font.Font(None, 26)
        self.textFont = pygame.font.Font(None, 20)
    
    def handleEvent(self, event):
        """Handle mouse events"""
        if event.type == pygame.MOUSEMOTION:
            self.isHovered = self.rect.collidepoint(event.pos)
        
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 1 and self.isHovered:
                if self.onClick:
                    self.onClick(self.playlist)
                return True
        
        return False
    
    def render(self, surface):
        """Render playlist card with square disc box theme"""
        colors = self.colorManager.getAllColors()
        
        # Draw card background
        bgColor = (*colors['midBackground'], 220) if not self.isHovered else (*colors['midBackground'], 255)
        cardSurface = pygame.Surface((self.rect.width, self.rect.height), pygame.SRCALPHA)
        pygame.draw.rect(cardSurface, bgColor, (0, 0, self.rect.width, self.rect.height), 
                        border_radius=8)
        surface.blit(cardSurface, (self.rect.x, self.rect.y))
        
        # Draw border
        borderColor = colors['neonPink'] if self.isHovered else colors['neonPurple']
        pygame.draw.rect(surface, borderColor, self.rect, 2, border_radius=8)
        
        # Draw glow when hovered
        if self.isHovered:
            glowSurface = pygame.Surface((self.rect.width + 10, self.rect.height + 10), pygame.SRCALPHA)
            pygame.draw.rect(glowSurface, (*colors['neonPink'], 40), 
                           (0, 0, self.rect.width + 10, self.rect.height + 10), 
                           border_radius=10)
            surface.blit(glowSurface, (self.rect.x - 5, self.rect.y - 5))
        
        # Draw square disc box icon
        iconSize = 80
        iconX = self.rect.x + 15
        iconY = self.rect.y + 15
        
        pygame.draw.rect(surface, borderColor, (iconX, iconY, iconSize, iconSize), 3, border_radius=5)
        pygame.draw.rect(surface, colors['darkBackground'], 
                        (iconX + 5, iconY + 5, iconSize - 10, iconSize - 10), border_radius=3)
        
        # Draw inner pattern
        for i in range(3):
            offset = 15 + i * 15
            pygame.draw.rect(surface, colors['midBackground'], 
                           (iconX + offset, iconY + offset, 
                            iconSize - offset * 2, iconSize - offset * 2), 1)
        
        # Draw playlist name
        nameText = self.titleFont.render(self.playlist['playlistName'][:18], True, borderColor)
        surface.blit(nameText, (iconX + iconSize + 15, iconY + 10))
        
        # Draw description if available
        if self.playlist.get('description'):
            descText = self.textFont.render(self.playlist['description'][:25], 
                                          True, colors['accentGreen'])
            surface.blit(descText, (iconX + iconSize + 15, iconY + 40))
        
        # Draw song count (would need to query)
        countText = self.textFont.render("Playlist", True, (150, 150, 150))
        surface.blit(countText, (iconX + iconSize + 15, iconY + 65))
