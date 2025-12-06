"""
RETROPLAY - Retro-themed Music Player
Main entry point for the application
"""

import pygame
import sys
from src.core.audioEngine import AudioEngine
from src.ui.modernMainWindow import ModernMainWindow
from src.auth.authenticationManager import AuthenticationManager
from src.utils.colorManager import ColorManager
import os

# Enable drag and drop
os.environ['SDL_VIDEO_ALLOW_SCREENSAVER'] = '1'

class RetroplayApp:
    def __init__(self):
        pygame.init()
        pygame.mixer.init(frequency=44100, size=-16, channels=2, buffer=512)
        
        self.screenWidth = 1280
        self.screenHeight = 720
        self.screen = pygame.display.set_mode((self.screenWidth, self.screenHeight))
        pygame.display.set_caption("RETROPLAY")
        
        self.clock = pygame.time.Clock()
        self.running = True
        self.fps = 60
        
        # Initialize managers
        self.colorManager = ColorManager()
        self.authManager = AuthenticationManager()
        self.audioEngine = AudioEngine()
        
        # Initialize UI
        self.mainWindow = ModernMainWindow(self.screen, self.colorManager, self.audioEngine, self.authManager)
        
        # Enable file drop events
        pygame.event.set_allowed([pygame.DROPFILE])
        
    def run(self):
        """Main application loop"""
        while self.running:
            deltaTime = self.clock.tick(self.fps) / 1000.0
            
            # Event handling
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                else:
                    self.mainWindow.handleEvent(event)
            
            # Update
            self.mainWindow.update(deltaTime)
            
            # Render
            self.mainWindow.render()
            pygame.display.flip()
        
        self.cleanup()
    
    def cleanup(self):
        """Clean up resources"""
        self.audioEngine.cleanup()
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    app = RetroplayApp()
    app.run()
