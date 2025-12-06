"""Drag and drop zone for music files"""

import pygame
import os

class DragDropZone:
    def __init__(self, x, y, width, height, colorManager, onFilesDropped=None):
        self.rect = pygame.Rect(x, y, width, height)
        self.colorManager = colorManager
        self.onFilesDropped = onFilesDropped
        
        self.isHovered = False
        self.isDragging = False
        
        pygame.font.init()
        self.titleFont = pygame.font.Font(None, 36)
        self.textFont = pygame.font.Font(None, 24)
    
    def handleEvent(self, event):
        """Handle drag and drop events"""
        if event.type == pygame.MOUSEMOTION:
            self.isHovered = self.rect.collidepoint(event.pos)
        
        elif event.type == pygame.DROPFILE:
            # Handle file drop
            filePath = event.file
            if self._isAudioFile(filePath):
                if self.onFilesDropped:
                    self.onFilesDropped([filePath])
                return True
        
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if self.isHovered:
                # Open file dialog
                return 'open_dialog'
        
        return False
    
    def _isAudioFile(self, filePath):
        """Check if file is an audio file"""
        audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac']
        ext = os.path.splitext(filePath)[1].lower()
        return ext in audioExtensions
    
    def render(self, surface):
        """Render drag and drop zone"""
        colors = self.colorManager.getAllColors()
        
        # Draw background
        bgColor = (*colors['midBackground'], 150) if self.isHovered else (*colors['darkBackground'], 100)
        dropSurface = pygame.Surface((self.rect.width, self.rect.height), pygame.SRCALPHA)
        pygame.draw.rect(dropSurface, bgColor, (0, 0, self.rect.width, self.rect.height), 
                        border_radius=15)
        surface.blit(dropSurface, (self.rect.x, self.rect.y))
        
        # Draw dashed border
        borderColor = colors['neonPink'] if self.isHovered else colors['neonBlue']
        self._drawDashedRect(surface, self.rect, borderColor, 3, 15)
        
        # Draw icon and text
        centerX = self.rect.centerx
        centerY = self.rect.centery
        
        # Draw upload icon
        iconSize = 60
        pygame.draw.circle(surface, borderColor, (centerX, centerY - 40), iconSize // 2, 3)
        
        # Draw arrow
        arrowPoints = [
            (centerX, centerY - 60),
            (centerX - 15, centerY - 45),
            (centerX + 15, centerY - 45)
        ]
        pygame.draw.polygon(surface, borderColor, arrowPoints)
        pygame.draw.rect(surface, borderColor, (centerX - 5, centerY - 45, 10, 30))
        
        # Draw text
        titleText = self.titleFont.render("Drop Music Here", True, borderColor)
        titleRect = titleText.get_rect(center=(centerX, centerY + 30))
        surface.blit(titleText, titleRect)
        
        subtitleText = self.textFont.render("or click to browse", True, colors['accentGreen'])
        subtitleRect = subtitleText.get_rect(center=(centerX, centerY + 60))
        surface.blit(subtitleText, subtitleRect)
        
        # Supported formats
        formatsText = self.textFont.render("MP3, WAV, OGG, FLAC, M4A", True, (150, 150, 150))
        formatsRect = formatsText.get_rect(center=(centerX, centerY + 90))
        surface.blit(formatsText, formatsRect)
    
    def _drawDashedRect(self, surface, rect, color, width, dashLength):
        """Draw dashed rectangle border"""
        # Top
        for x in range(rect.left, rect.right, dashLength * 2):
            pygame.draw.line(surface, color, (x, rect.top), 
                           (min(x + dashLength, rect.right), rect.top), width)
        
        # Bottom
        for x in range(rect.left, rect.right, dashLength * 2):
            pygame.draw.line(surface, color, (x, rect.bottom), 
                           (min(x + dashLength, rect.right), rect.bottom), width)
        
        # Left
        for y in range(rect.top, rect.bottom, dashLength * 2):
            pygame.draw.line(surface, color, (rect.left, y), 
                           (rect.left, min(y + dashLength, rect.bottom)), width)
        
        # Right
        for y in range(rect.top, rect.bottom, dashLength * 2):
            pygame.draw.line(surface, color, (rect.right, y), 
                           (rect.right, min(y + dashLength, rect.bottom)), width)
