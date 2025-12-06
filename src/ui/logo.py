"""RETROPLAY logo renderer with gradient effects"""

import pygame
import math

class Logo:
    def __init__(self, x, y, scale=1.0):
        self.x = x
        self.y = y
        self.scale = scale
        
        # Logo dimensions
        self.iconSize = int(100 * scale)
        self.textHeight = int(80 * scale)
        
        pygame.font.init()
        self.font = pygame.font.Font(None, int(100 * scale))
    
    def render(self, surface):
        """Render the RETROPLAY logo"""
        # Draw icon (rounded square with R)
        self._drawIcon(surface)
        
        # Draw "Retroplay" text with gradient
        self._drawText(surface)
    
    def _drawIcon(self, surface):
        """Draw the rounded square icon with R"""
        iconX = self.x
        iconY = self.y
        size = self.iconSize
        
        # Create gradient surface for icon background
        iconSurface = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Draw gradient from pink to purple
        for y in range(size):
            # Calculate gradient color (pink to purple)
            ratio = y / size
            r = int(236 * (1 - ratio) + 139 * ratio)  # 236 -> 139
            g = int(72 * (1 - ratio) + 92 * ratio)    # 72 -> 92
            b = int(153 * (1 - ratio) + 246 * ratio)  # 153 -> 246
            
            pygame.draw.line(iconSurface, (r, g, b), (0, y), (size, y))
        
        # Create rounded rectangle mask
        maskSurface = pygame.Surface((size, size), pygame.SRCALPHA)
        pygame.draw.rect(maskSurface, (255, 255, 255, 255), 
                        (0, 0, size, size), border_radius=int(20 * self.scale))
        
        # Apply mask to gradient
        iconSurface.blit(maskSurface, (0, 0), special_flags=pygame.BLEND_RGBA_MIN)
        
        # Draw to main surface
        surface.blit(iconSurface, (iconX, iconY))
        
        # Draw white "R" letter
        rFont = pygame.font.Font(None, int(80 * self.scale))
        rText = rFont.render("R", True, (255, 255, 255))
        rRect = rText.get_rect(center=(iconX + size // 2, iconY + size // 2))
        surface.blit(rText, rRect)
    
    def _drawText(self, surface):
        """Draw 'Retroplay' text with gradient"""
        textX = self.x + self.iconSize + int(20 * self.scale)
        textY = self.y + self.iconSize // 2
        
        text = "Retroplay"
        
        # Render each character with gradient color
        currentX = textX
        charWidth = int(50 * self.scale)
        
        for i, char in enumerate(text):
            # Calculate gradient color for this character
            ratio = i / len(text)
            
            # Pink to purple gradient
            r = int(236 * (1 - ratio) + 139 * ratio)
            g = int(72 * (1 - ratio) + 92 * ratio)
            b = int(153 * (1 - ratio) + 246 * ratio)
            
            # Render character
            charSurface = self.font.render(char, True, (r, g, b))
            charRect = charSurface.get_rect(midleft=(currentX, textY))
            surface.blit(charSurface, charRect)
            
            # Move to next character position
            currentX += charSurface.get_width()
    
    def getWidth(self):
        """Get total logo width"""
        return self.iconSize + int(20 * self.scale) + int(600 * self.scale)
    
    def getHeight(self):
        """Get total logo height"""
        return self.iconSize


class AnimatedLogo(Logo):
    """Animated version of the logo with glow effect"""
    
    def __init__(self, x, y, scale=1.0):
        super().__init__(x, y, scale)
        self.glowIntensity = 0
        self.glowDirection = 1
        self.animationSpeed = 2.0
    
    def update(self, deltaTime):
        """Update animation"""
        self.glowIntensity += self.glowDirection * self.animationSpeed * deltaTime
        
        if self.glowIntensity >= 1.0:
            self.glowIntensity = 1.0
            self.glowDirection = -1
        elif self.glowIntensity <= 0:
            self.glowIntensity = 0
            self.glowDirection = 1
    
    def render(self, surface):
        """Render animated logo with glow"""
        # Draw glow effect
        if self.glowIntensity > 0:
            glowSize = int(20 * self.glowIntensity * self.scale)
            glowSurface = pygame.Surface((self.iconSize + glowSize * 2, 
                                         self.iconSize + glowSize * 2), 
                                        pygame.SRCALPHA)
            
            # Draw multiple glow layers
            for i in range(5):
                alpha = int(30 * self.glowIntensity * (1 - i / 5))
                glowRadius = int((20 + i * 5) * self.scale)
                
                # Pink-purple glow
                pygame.draw.rect(glowSurface, (236, 72, 153, alpha),
                               (glowSize - glowRadius, glowSize - glowRadius,
                                self.iconSize + glowRadius * 2, self.iconSize + glowRadius * 2),
                               border_radius=int((20 + glowRadius) * self.scale))
            
            surface.blit(glowSurface, (self.x - glowSize, self.y - glowSize))
        
        # Draw main logo
        super().render(surface)


class CompactLogo:
    """Compact version showing just the icon"""
    
    def __init__(self, x, y, size=50):
        self.x = x
        self.y = y
        self.size = size
        
        pygame.font.init()
        self.font = pygame.font.Font(None, int(size * 0.8))
    
    def render(self, surface):
        """Render compact icon only"""
        # Create gradient surface
        iconSurface = pygame.Surface((self.size, self.size), pygame.SRCALPHA)
        
        # Draw gradient
        for y in range(self.size):
            ratio = y / self.size
            r = int(236 * (1 - ratio) + 139 * ratio)
            g = int(72 * (1 - ratio) + 92 * ratio)
            b = int(153 * (1 - ratio) + 246 * ratio)
            
            pygame.draw.line(iconSurface, (r, g, b), (0, y), (self.size, y))
        
        # Create rounded rectangle mask
        maskSurface = pygame.Surface((self.size, self.size), pygame.SRCALPHA)
        pygame.draw.rect(maskSurface, (255, 255, 255, 255), 
                        (0, 0, self.size, self.size), 
                        border_radius=int(self.size * 0.2))
        
        # Apply mask
        iconSurface.blit(maskSurface, (0, 0), special_flags=pygame.BLEND_RGBA_MIN)
        
        # Draw to surface
        surface.blit(iconSurface, (self.x, self.y))
        
        # Draw "R"
        rText = self.font.render("R", True, (255, 255, 255))
        rRect = rText.get_rect(center=(self.x + self.size // 2, self.y + self.size // 2))
        surface.blit(rText, rRect)
