"""Audio visualizer with retro effects"""

import pygame
import math
import random

class Visualizer:
    def __init__(self, x, y, width, height, colorManager):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.colorManager = colorManager
        
        self.barCount = 32
        self.barWidth = width // self.barCount
        self.barHeights = [0] * self.barCount
        self.targetHeights = [0] * self.barCount
        self.smoothingFactor = 0.3
        
        self.particles = []
    
    def update(self, deltaTime, audioData=None):
        """Update visualizer with audio data"""
        if audioData:
            for i in range(min(len(audioData), self.barCount)):
                self.targetHeights[i] = audioData[i] * self.height
        else:
            # Generate random visualization when no audio data
            for i in range(self.barCount):
                self.targetHeights[i] = random.randint(10, 100)
        
        # Smooth bar transitions
        for i in range(self.barCount):
            diff = self.targetHeights[i] - self.barHeights[i]
            self.barHeights[i] += diff * self.smoothingFactor
        
        # Update particles
        self.particles = [p for p in self.particles if p['life'] > 0]
        for particle in self.particles:
            particle['y'] -= particle['speed'] * deltaTime * 60
            particle['life'] -= deltaTime
            particle['alpha'] = int(255 * (particle['life'] / particle['maxLife']))
    
    def render(self, surface):
        """Render the visualizer"""
        colors = self.colorManager.getAllColors()
        
        # Draw bars
        for i in range(self.barCount):
            barHeight = int(self.barHeights[i])
            barX = self.x + i * self.barWidth
            barY = self.y + self.height - barHeight
            
            # Gradient effect
            if barHeight > self.height * 0.7:
                color = colors['neonPink']
            elif barHeight > self.height * 0.4:
                color = colors['neonPurple']
            else:
                color = colors['neonBlue']
            
            # Draw bar with glow
            pygame.draw.rect(surface, color, 
                           (barX + 2, barY, self.barWidth - 4, barHeight), 
                           border_radius=2)
            
            # Add glow effect
            glowSurface = pygame.Surface((self.barWidth, barHeight), pygame.SRCALPHA)
            pygame.draw.rect(glowSurface, (*color, 50), 
                           (0, 0, self.barWidth, barHeight))
            surface.blit(glowSurface, (barX, barY))
            
            # Spawn particles at peaks
            if barHeight > self.height * 0.6 and random.random() < 0.1:
                self._spawnParticle(barX + self.barWidth // 2, barY)
        
        # Draw particles
        for particle in self.particles:
            particleColor = (*particle['color'], particle['alpha'])
            pygame.draw.circle(surface, particleColor, 
                             (int(particle['x']), int(particle['y'])), 
                             particle['size'])
    
    def _spawnParticle(self, x, y):
        """Spawn a particle effect"""
        colors = self.colorManager.getAllColors()
        colorChoices = [colors['neonPink'], colors['neonBlue'], colors['neonPurple']]
        
        self.particles.append({
            'x': x,
            'y': y,
            'speed': random.uniform(50, 150),
            'size': random.randint(2, 4),
            'color': random.choice(colorChoices),
            'life': random.uniform(0.5, 1.5),
            'maxLife': 1.5,
            'alpha': 255
        })
