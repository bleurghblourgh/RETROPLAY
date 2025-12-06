"""Main window UI manager"""

import pygame
from src.ui.vinylDisk import VinylDisk
from src.ui.controlPanel import ControlPanel
from src.ui.loginScreen import LoginScreen
from src.ui.settingsMenu import SettingsMenu
from src.ui.visualizer import Visualizer
from src.ui.fileDialog import FileDialog
from src.core.libraryManager import LibraryManager
from src.core.playlistManager import PlaylistManager

class MainWindow:
    def __init__(self, screen, colorManager, audioEngine, authManager):
        self.screen = screen
        self.colorManager = colorManager
        self.audioEngine = audioEngine
        self.authManager = authManager
        
        self.screenWidth = screen.get_width()
        self.screenHeight = screen.get_height()
        
        # Initialize managers
        self.libraryManager = LibraryManager()
        self.playlistManager = PlaylistManager()
        
        # UI Components
        self.vinylDisk = VinylDisk(self.screenWidth // 2, self.screenHeight // 2 - 50, 150, colorManager)
        self.controlPanel = ControlPanel(self.screenWidth // 2 - 250, self.screenHeight - 150, 
                                        500, 100, colorManager, audioEngine)
        self.visualizer = Visualizer(50, self.screenHeight - 200, self.screenWidth - 100, 80, colorManager)
        self.loginScreen = LoginScreen(screen, colorManager, authManager)
        self.settingsMenu = SettingsMenu(screen, colorManager, authManager)
        self.fileDialog = None
        
        self.currentScreen = 'login'
        self.showSettings = False
        self.showFileDialog = False
        
        # Font
        pygame.font.init()
        self.titleFont = pygame.font.Font(None, 72)
        self.textFont = pygame.font.Font(None, 36)
        self.smallFont = pygame.font.Font(None, 24)
    
    def handleEvent(self, event):
        """Handle events"""
        if self.currentScreen == 'login':
            result = self.loginScreen.handleEvent(event)
            if result == 'logged_in':
                self.currentScreen = 'player'
                theme = self.authManager.getCurrentUser().get('themePreference', 'synthwave')
                self.colorManager.setTheme(theme)
        
        elif self.currentScreen == 'player':
            if self.showFileDialog:
                result = self.fileDialog.handleEvent(event)
                if result == 'cancel':
                    self.showFileDialog = False
                    self.fileDialog = None
                elif result:
                    self._loadSelectedFile(result)
                    self.showFileDialog = False
                    self.fileDialog = None
            elif self.showSettings:
                result = self.settingsMenu.handleEvent(event)
                if result == 'close':
                    self.showSettings = False
            else:
                self.controlPanel.handleEvent(event)
                
                # Check for keyboard shortcuts
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        self.showSettings = True
                    elif event.key == pygame.K_SPACE:
                        if self.audioEngine.isPlaying:
                            self.audioEngine.pause()
                        else:
                            self.audioEngine.unpause()
                    elif event.key == pygame.K_o:
                        self._openFileDialog()
                    elif event.key == pygame.K_l:
                        self.authManager.logoutUser()
                        self.currentScreen = 'login'
    
    def _openFileDialog(self):
        """Open file selection dialog"""
        self.fileDialog = FileDialog(self.screen, self.colorManager)
        self.showFileDialog = True
    
    def _loadSelectedFile(self, filePath):
        """Load selected music file"""
        if self.audioEngine.loadSong(filePath):
            self.audioEngine.clearQueue()
            self.audioEngine.addToQueue(filePath)
            self.audioEngine.play()
            
            # Add to library
            if self.authManager.isLoggedIn():
                user = self.authManager.getCurrentUser()
                self.libraryManager.addSong(user['userId'], filePath)
    
    def update(self, deltaTime):
        """Update UI components"""
        if self.currentScreen == 'player':
            self.vinylDisk.update(deltaTime, self.audioEngine.isPlaying and not self.audioEngine.isPaused)
            self.visualizer.update(deltaTime)
    
    def render(self):
        """Render the main window"""
        colors = self.colorManager.getAllColors()
        self.screen.fill(colors['darkBackground'])
        
        if self.currentScreen == 'login':
            self.loginScreen.render()
        
        elif self.currentScreen == 'player':
            self._renderPlayerScreen(colors)
            
            if self.showFileDialog:
                self.fileDialog.render()
            elif self.showSettings:
                self.settingsMenu.render()
    
    def _renderPlayerScreen(self, colors):
        """Render the player screen"""
        # Draw title
        titleText = self.titleFont.render("RETROPLAY", True, colors['neonPink'])
        titleRect = titleText.get_rect(center=(self.screenWidth // 2, 50))
        self.screen.blit(titleText, titleRect)
        
        # Draw vinyl disk
        self.vinylDisk.render(self.screen)
        
        # Draw current song info
        currentSong = self.audioEngine.getCurrentSong()
        if currentSong:
            titleText = self.textFont.render(currentSong['title'], True, colors['neonBlue'])
            artistText = self.smallFont.render(currentSong['artist'], True, colors['neonPurple'])
            
            titleRect = titleText.get_rect(center=(self.screenWidth // 2, self.screenHeight // 2 + 150))
            artistRect = artistText.get_rect(center=(self.screenWidth // 2, self.screenHeight // 2 + 185))
            
            self.screen.blit(titleText, titleRect)
            self.screen.blit(artistText, artistRect)
        
        # Draw visualizer
        self.visualizer.render(self.screen)
        
        # Draw control panel
        self.controlPanel.render(self.screen)
        
        # Draw keyboard shortcuts
        shortcuts = [
            "ESC: Settings | O: Open File | L: Logout | SPACE: Play/Pause"
        ]
        hintText = self.smallFont.render(shortcuts[0], True, colors['accentGreen'])
        self.screen.blit(hintText, (10, self.screenHeight - 30))
