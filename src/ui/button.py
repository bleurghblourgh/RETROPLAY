"""Modern button component with hover effects"""

import pygame

class Button:
    def __init__(self, x, y, width, height, text, colorManager, onClick=None, icon=None):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.colorManager = colorManager
        self.onClick = onClick
        self.icon = icon
        
        self.isHovered = False
        self.isPressed = False
        self.enabled = True
        
        pygame.font.init()
        self.font = pygame.font.Font(None, 28)
    
    def handleEvent(self, event):
        """Handle mouse events"""
        if not self.enabled:
            return False
        
        if event.type == pygame.MOUSEMOTION:
            self.isHovered = self.rect.collidepoint(event.pos)
        
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 1 and self.isHovered:
                self.isPressed = True
                return True
        
        elif event.type == pygame.MOUSEBUTTONUP:
            if event.button == 1 and self.isPressed:
                self.isPressed = False
                if self.isHovered and self.onClick:
                    self.onClick()
                    return True
        
        return False
    
    def render(self, surface):
        """Render button with modern styling"""
        colors = self.colorManager.getAllColors()
        
        # Determine button color based on state
        if not self.enabled:
            bgColor = colors['midBackground']
            textColor = (100, 100, 100)
        elif self.isPressed:
            bgColor = colors['neonPurple']
            textColor = colors['darkBackground']
        elif self.isHovered:
            bgColor = colors['neonPink']
            textColor = colors['darkBackground']
        else:
            bgColor = colors['midBackground']
            textColor = colors['neonBlue']
        
        # Draw button background with rounded corners
        pygame.draw.rect(surface, bgColor, self.rect, border_radius=8)
        
        # Draw border
        borderColor = colors['neonPink'] if self.isHovered else colors['neonBlue']
        pygame.draw.rect(surface, borderColor, self.rect, 2, border_radius=8)
        
        # Draw glow effect when hovered
        if self.isHovered:
            glowSurface = pygame.Surface((self.rect.width + 10, self.rect.height + 10), pygame.SRCALPHA)
            pygame.draw.rect(glowSurface, (*colors['neonPink'], 30), 
                           (0, 0, self.rect.width + 10, self.rect.height + 10), 
                           border_radius=10)
            surface.blit(glowSurface, (self.rect.x - 5, self.rect.y - 5))
        
        # Draw text
        textSurface = self.font.render(self.text, True, textColor)
        textRect = textSurface.get_rect(center=self.rect.center)
        surface.blit(textSurface, textRect)
    
    def setEnabled(self, enabled):
        """Enable or disable button"""
        self.enabled = enabled
    
    def setPosition(self, x, y):
        """Update button position"""
        self.rect.x = x
        self.rect.y = y


class IconButton(Button):
    """Button with icon support"""
    
    def __init__(self, x, y, size, iconType, colorManager, onClick=None):
        super().__init__(x, y, size, size, "", colorManager, onClick)
        self.iconType = iconType
        self.size = size
    
    def render(self, surface):
        """Render icon button"""
        colors = self.colorManager.getAllColors()
        
        # Determine colors
        if not self.enabled:
            fillColor = colors['midBackground']
            iconColor = (100, 100, 100)
        elif self.isPressed:
            fillColor = colors['neonPurple']
            iconColor = colors['darkBackground']
        elif self.isHovered:
            fillColor = colors['neonPink']
            iconColor = colors['darkBackground']
        else:
            fillColor = colors['midBackground']
            iconColor = colors['neonBlue']
        
        # Draw circular button
        center = self.rect.center
        radius = self.size // 2
        
        # Glow effect
        if self.isHovered:
            glowSurface = pygame.Surface((self.size + 20, self.size + 20), pygame.SRCALPHA)
            pygame.draw.circle(glowSurface, (*colors['neonPink'], 40), 
                             (self.size // 2 + 10, self.size // 2 + 10), radius + 10)
            surface.blit(glowSurface, (self.rect.x - 10, self.rect.y - 10))
        
        pygame.draw.circle(surface, fillColor, center, radius)
        pygame.draw.circle(surface, iconColor, center, radius, 3)
        
        # Draw icon
        self._drawIcon(surface, center, iconColor)
    
    def _drawIcon(self, surface, center, color):
        """Draw icon based on type"""
        cx, cy = center
        
        if self.iconType == 'play':
            points = [(cx - 8, cy - 12), (cx - 8, cy + 12), (cx + 12, cy)]
            pygame.draw.polygon(surface, color, points)
        
        elif self.iconType == 'pause':
            pygame.draw.rect(surface, color, (cx - 8, cy - 12, 5, 24))
            pygame.draw.rect(surface, color, (cx + 3, cy - 12, 5, 24))
        
        elif self.iconType == 'next':
            points = [(cx - 10, cy - 10), (cx - 10, cy + 10), (cx + 5, cy)]
            pygame.draw.polygon(surface, color, points)
            pygame.draw.rect(surface, color, (cx + 5, cy - 10, 4, 20))
        
        elif self.iconType == 'previous':
            points = [(cx + 10, cy - 10), (cx + 10, cy + 10), (cx - 5, cy)]
            pygame.draw.polygon(surface, color, points)
            pygame.draw.rect(surface, color, (cx - 9, cy - 10, 4, 20))
        
        elif self.iconType == 'shuffle':
            # Draw shuffle icon
            pygame.draw.line(surface, color, (cx - 8, cy - 6), (cx + 8, cy + 6), 3)
            pygame.draw.line(surface, color, (cx - 8, cy + 6), (cx + 8, cy - 6), 3)
        
        elif self.iconType == 'repeat':
            # Draw repeat icon (circular arrows)
            pygame.draw.arc(surface, color, (cx - 10, cy - 10, 20, 20), 0, 3.14, 3)
            pygame.draw.polygon(surface, color, [(cx + 8, cy - 8), (cx + 12, cy - 4), (cx + 8, cy)])
        
        elif self.iconType == 'add':
            pygame.draw.line(surface, color, (cx - 10, cy), (cx + 10, cy), 3)
            pygame.draw.line(surface, color, (cx, cy - 10), (cx, cy + 10), 3)
        
        elif self.iconType == 'settings':
            # Draw gear icon
            pygame.draw.circle(surface, color, center, 8, 2)
            for i in range(6):
                angle = i * 60
                import math
                x = cx + math.cos(math.radians(angle)) * 12
                y = cy + math.sin(math.radians(angle)) * 12
                pygame.draw.circle(surface, color, (int(x), int(y)), 3)
