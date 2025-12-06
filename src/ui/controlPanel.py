"""Control panel for music playback"""

import pygame

class ControlPanel:
    def __init__(self, x, y, width, height, colorManager, audioEngine):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.colorManager = colorManager
        self.audioEngine = audioEngine
        
        self.buttonRadius = 30
        self.buttonSpacing = 80
        self.buttons = self._createButtons()
        
    def _createButtons(self):
        """Create control buttons"""
        centerX = self.x + self.width // 2
        centerY = self.y + self.height // 2
        
        return {
            'previous': {'x': centerX - self.buttonSpacing * 2, 'y': centerY, 'radius': self.buttonRadius - 10},
            'play': {'x': centerX, 'y': centerY, 'radius': self.buttonRadius},
            'next': {'x': centerX + self.buttonSpacing * 2, 'y': centerY, 'radius': self.buttonRadius - 10},
            'shuffle': {'x': centerX - self.buttonSpacing, 'y': centerY, 'radius': self.buttonRadius - 15},
            'repeat': {'x': centerX + self.buttonSpacing, 'y': centerY, 'radius': self.buttonRadius - 15}
        }
    
    def handleEvent(self, event):
        """Handle mouse events"""
        if event.type == pygame.MOUSEBUTTONDOWN:
            mouseX, mouseY = event.pos
            
            for buttonName, button in self.buttons.items():
                distance = ((mouseX - button['x'])**2 + (mouseY - button['y'])**2)**0.5
                if distance <= button['radius']:
                    self._handleButtonClick(buttonName)
                    return True
        return False
    
    def _handleButtonClick(self, buttonName):
        """Handle button clicks"""
        if buttonName == 'play':
            if self.audioEngine.isPlaying and not self.audioEngine.isPaused:
                self.audioEngine.pause()
            elif self.audioEngine.isPaused:
                self.audioEngine.unpause()
            else:
                self.audioEngine.play()
        elif buttonName == 'next':
            self.audioEngine.playNext()
        elif buttonName == 'previous':
            self.audioEngine.playPrevious()
        elif buttonName == 'shuffle':
            self.audioEngine.toggleShuffle()
        elif buttonName == 'repeat':
            self.audioEngine.toggleRepeat()
    
    def render(self, surface):
        """Render control panel"""
        colors = self.colorManager.getAllColors()
        
        # Draw panel background
        panelSurface = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
        pygame.draw.rect(panelSurface, (*colors['midBackground'], 200), 
                        (0, 0, self.width, self.height), border_radius=15)
        surface.blit(panelSurface, (self.x, self.y))
        
        # Draw buttons
        for buttonName, button in self.buttons.items():
            color = colors['neonPink'] if buttonName == 'play' else colors['neonBlue']
            pygame.draw.circle(surface, color, (button['x'], button['y']), button['radius'])
            pygame.draw.circle(surface, colors['darkBackground'], 
                             (button['x'], button['y']), button['radius'] - 3)
            
            # Draw button icons
            self._drawButtonIcon(surface, buttonName, button, colors)
    
    def _drawButtonIcon(self, surface, buttonName, button, colors):
        """Draw icon for each button"""
        x, y = button['x'], button['y']
        
        if buttonName == 'play':
            if self.audioEngine.isPlaying and not self.audioEngine.isPaused:
                # Pause icon
                pygame.draw.rect(surface, colors['neonPink'], (x - 6, y - 10, 4, 20))
                pygame.draw.rect(surface, colors['neonPink'], (x + 2, y - 10, 4, 20))
            else:
                # Play icon
                points = [(x - 5, y - 10), (x - 5, y + 10), (x + 10, y)]
                pygame.draw.polygon(surface, colors['neonPink'], points)
        
        elif buttonName == 'next':
            points = [(x - 8, y - 8), (x - 8, y + 8), (x + 2, y)]
            pygame.draw.polygon(surface, colors['neonBlue'], points)
            pygame.draw.rect(surface, colors['neonBlue'], (x + 2, y - 8, 3, 16))
        
        elif buttonName == 'previous':
            points = [(x + 8, y - 8), (x + 8, y + 8), (x - 2, y)]
            pygame.draw.polygon(surface, colors['neonBlue'], points)
            pygame.draw.rect(surface, colors['neonBlue'], (x - 5, y - 8, 3, 16))
