"""Animated vinyl disk visualization"""

import pygame
import math

class VinylDisk:
    def __init__(self, x, y, radius, colorManager):
        self.x = x
        self.y = y
        self.radius = radius
        self.colorManager = colorManager
        self.rotation = 0
        self.rotationSpeed = 1.0
        self.isSpinning = False
        
    def update(self, deltaTime, isPlaying):
        """Update disk rotation"""
        self.isSpinning = isPlaying
        if self.isSpinning:
            self.rotation += self.rotationSpeed * deltaTime * 60
            if self.rotation >= 360:
                self.rotation -= 360
    
    def render(self, surface):
        """Render the vinyl disk"""
        colors = self.colorManager.getAllColors()
        
        # Draw outer glow
        glowRadius = self.radius + 10
        glowSurface = pygame.Surface((glowRadius * 2, glowRadius * 2), pygame.SRCALPHA)
        pygame.draw.circle(glowSurface, (*colors['neonPurple'], 30), 
                          (glowRadius, glowRadius), glowRadius)
        surface.blit(glowSurface, (self.x - glowRadius, self.y - glowRadius))
        
        # Draw main disk
        pygame.draw.circle(surface, colors['darkBackground'], (self.x, self.y), self.radius)
        
        # Draw grooves
        for i in range(5, self.radius - 20, 8):
            pygame.draw.circle(surface, colors['midBackground'], (self.x, self.y), i, 1)
        
        # Draw center label
        labelRadius = self.radius // 3
        pygame.draw.circle(surface, colors['neonPink'], (self.x, self.y), labelRadius)
        pygame.draw.circle(surface, colors['neonBlue'], (self.x, self.y), labelRadius - 5, 2)
        
        # Draw rotating line
        if self.isSpinning:
            angle = math.radians(self.rotation)
            endX = self.x + math.cos(angle) * (self.radius - 10)
            endY = self.y + math.sin(angle) * (self.radius - 10)
            pygame.draw.line(surface, colors['neonPurple'], (self.x, self.y), 
                           (endX, endY), 2)
        
        # Draw center hole
        pygame.draw.circle(surface, colors['darkBackground'], (self.x, self.y), 15)
        pygame.draw.circle(surface, colors['neonBlue'], (self.x, self.y), 15, 2)
    
    def setRotationSpeed(self, speed):
        """Set rotation speed"""
        self.rotationSpeed = speed
