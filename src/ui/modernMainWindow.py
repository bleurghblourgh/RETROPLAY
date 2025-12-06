"""Modern main window with clean UI and mouse support"""

import pygame
import os
from src.ui.button import Button, IconButton
from src.ui.vinylDisk import VinylDisk
from src.ui.visualizer import Visualizer
from src.ui.modernLoginScreen import ModernLoginScreen
from src.ui.modernSettingsMenu import ModernSettingsMenu
from src.ui.dragDropZone import DragDropZone
from src.ui.fileDialog import FileDialog
from src.ui.albumCard import AlbumCard
from src.ui.playlistCard import PlaylistCard
from src.core.libraryManager import LibraryManager
from src.core.playlistManager import PlaylistManager
from src.ai.aiMusicAnalyzer import AiMusicAnalyzer

class ModernMainWindow:
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
        self.aiAnalyzer = AiMusicAnalyzer()
        
        # UI state
        self.currentScreen = 'login'
        self.showSettings = False
        self.showFileDialog = False
        self.currentView = 'library'  # 'library', 'playlists', 'albums'
        
        # Fonts
        pygame.font.init()
        self.titleFont = pygame.font.Font(None, 72)
        self.textFont = pygame.font.Font(None, 32)
        self.smallFont = pygame.font.Font(None, 24)
        
        # Create UI components
        self._createUIComponents()
        
        # Data
        self.albums = []
        self.playlists = []
        self.currentSongIndex = 0
    
    def _createUIComponents(self):
        """Create all UI components"""
        # Login screen
        self.loginScreen = ModernLoginScreen(self.screen, self.colorManager, self.authManager)
        
        # Settings menu
        self.settingsMenu = ModernSettingsMenu(self.screen, self.colorManager, 
                                              self.authManager, self.audioEngine)
        
        # Vinyl disk (center piece)
        self.vinylDisk = VinylDisk(self.screenWidth // 2, 300, 120, self.colorManager)
        
        # Visualizer
        self.visualizer = Visualizer(100, self.screenHeight - 180, 
                                    self.screenWidth - 200, 60, self.colorManager)
        
        # Drag and drop zone
        self.dragDropZone = DragDropZone(
            self.screenWidth // 2 - 250, 450, 500, 200,
            self.colorManager, self._onFilesDropped
        )
        
        # Control buttons
        buttonY = self.screenHeight - 100
        centerX = self.screenWidth // 2
        
        self.playButton = IconButton(centerX, buttonY, 60, 'play', 
                                     self.colorManager, self._togglePlay)
        self.prevButton = IconButton(centerX - 100, buttonY, 50, 'previous', 
                                     self.colorManager, self._playPrevious)
        self.nextButton = IconButton(centerX + 100, buttonY, 50, 'next', 
                                     self.colorManager, self._playNext)
        self.shuffleButton = IconButton(centerX - 180, buttonY, 45, 'shuffle', 
                                       self.colorManager, self._toggleShuffle)
        self.repeatButton = IconButton(centerX + 180, buttonY, 45, 'repeat', 
                                      self.colorManager, self._toggleRepeat)
        
        # Top bar buttons
        self.settingsButton = IconButton(self.screenWidth - 70, 20, 50, 'settings', 
                                        self.colorManager, self._openSettings)
        self.addMusicButton = IconButton(self.screenWidth - 140, 20, 50, 'add', 
                                        self.colorManager, self._openFileDialog)
        
        # View switcher buttons
        self.libraryViewButton = Button(20, 20, 120, 40, "Library", 
                                       self.colorManager, lambda: self._switchView('library'))
        self.playlistsViewButton = Button(150, 20, 120, 40, "Playlists", 
                                         self.colorManager, lambda: self._switchView('playlists'))
        self.albumsViewButton = Button(280, 20, 120, 40, "Albums", 
                                      self.colorManager, lambda: self._switchView('albums'))
        
        self.fileDialog = None
    
    def _togglePlay(self):
        """Toggle play/pause"""
        if self.audioEngine.isPlaying and not self.audioEngine.isPaused:
            self.audioEngine.pause()
            self.playButton.iconType = 'play'
        elif self.audioEngine.isPaused:
            self.audioEngine.unpause()
            self.playButton.iconType = 'pause'
        else:
            self.audioEngine.play()
            self.playButton.iconType = 'pause'
    
    def _playNext(self):
        """Play next song"""
        self.audioEngine.playNext()
    
    def _playPrevious(self):
        """Play previous song"""
        self.audioEngine.playPrevious()
    
    def _toggleShuffle(self):
        """Toggle shuffle mode"""
        self.audioEngine.toggleShuffle()
    
    def _toggleRepeat(self):
        """Toggle repeat mode"""
        self.audioEngine.toggleRepeat()
    
    def _openSettings(self):
        """Open settings menu"""
        self.showSettings = True
    
    def _openFileDialog(self):
        """Open file dialog"""
        self.fileDialog = FileDialog(self.screen, self.colorManager)
        self.showFileDialog = True
    
    def _switchView(self, view):
        """Switch between different views"""
        self.currentView = view
        if view == 'library' and self.authManager.isLoggedIn():
            self._loadLibrary()
        elif view == 'playlists' and self.authManager.isLoggedIn():
            self._loadPlaylists()
        elif view == 'albums' and self.authManager.isLoggedIn():
            self._loadAlbums()
    
    def _onFilesDropped(self, filePaths):
        """Handle dropped files"""
        for filePath in filePaths:
            self._loadSong(filePath)
    
    def _loadSong(self, filePath):
        """Load and play a song"""
        if self.audioEngine.loadSong(filePath):
            self.audioEngine.clearQueue()
            self.audioEngine.addToQueue(filePath)
            self.audioEngine.play()
            self.playButton.iconType = 'pause'
            
            # Add to library
            if self.authManager.isLoggedIn():
                user = self.authManager.getCurrentUser()
                self.libraryManager.addSong(user['userId'], filePath)
                
                # Analyze with AI
                bpm = self.aiAnalyzer.detectBpm(filePath)
                mood = self.aiAnalyzer.analyzeMood(filePath)
                print(f"AI Analysis - BPM: {bpm}, Mood: {mood}")
    
    def _loadLibrary(self):
        """Load user's music library"""
        if self.authManager.isLoggedIn():
            user = self.authManager.getCurrentUser()
            songs = self.libraryManager.getUserSongs(user['userId'])
            # Process songs for display
    
    def _loadPlaylists(self):
        """Load user's playlists"""
        if self.authManager.isLoggedIn():
            user = self.authManager.getCurrentUser()
            self.playlists = self.playlistManager.getUserPlaylists(user['userId'])
    
    def _loadAlbums(self):
        """Load user's albums"""
        if self.authManager.isLoggedIn():
            user = self.authManager.getCurrentUser()
            songs = self.libraryManager.getUserSongs(user['userId'])
            
            # Group by album
            albumsDict = {}
            for song in songs:
                albumName = song.get('album', 'Unknown Album')
                if albumName not in albumsDict:
                    albumsDict[albumName] = {
                        'name': albumName,
                        'artist': song.get('artist', 'Unknown'),
                        'songs': []
                    }
                albumsDict[albumName]['songs'].append(song)
            
            self.albums = list(albumsDict.values())
    
    def handleEvent(self, event):
        """Handle all events"""
        if self.currentScreen == 'login':
            result = self.loginScreen.handleEvent(event)
            if result == 'logged_in':
                self.currentScreen = 'player'
                user = self.authManager.getCurrentUser()
                theme = user.get('themePreference', 'synthwave')
                self.colorManager.setTheme(theme)
                self._loadLibrary()
        
        elif self.currentScreen == 'player':
            if self.showFileDialog and self.fileDialog:
                result = self.fileDialog.handleEvent(event)
                if result == 'cancel':
                    self.showFileDialog = False
                    self.fileDialog = None
                elif result:
                    self._loadSong(result)
                    self.showFileDialog = False
                    self.fileDialog = None
            
            elif self.showSettings:
                result = self.settingsMenu.handleEvent(event)
                if result == 'close':
                    self.showSettings = False
                elif result == 'logout':
                    self.authManager.logoutUser()
                    self.currentScreen = 'login'
                    self.showSettings = False
            
            else:
                # Handle drag and drop
                dropResult = self.dragDropZone.handleEvent(event)
                if dropResult == 'open_dialog':
                    self._openFileDialog()
                
                # Handle control buttons
                self.playButton.handleEvent(event)
                self.prevButton.handleEvent(event)
                self.nextButton.handleEvent(event)
                self.shuffleButton.handleEvent(event)
                self.repeatButton.handleEvent(event)
                
                # Handle top bar buttons
                self.settingsButton.handleEvent(event)
                self.addMusicButton.handleEvent(event)
                
                # Handle view switcher
                self.libraryViewButton.handleEvent(event)
                self.playlistsViewButton.handleEvent(event)
                self.albumsViewButton.handleEvent(event)
    
    def update(self, deltaTime):
        """Update all components"""
        if self.currentScreen == 'login':
            self.loginScreen.update(deltaTime)
        elif self.currentScreen == 'player':
            isPlaying = self.audioEngine.isPlaying and not self.audioEngine.isPaused
            self.vinylDisk.update(deltaTime, isPlaying)
            self.visualizer.update(deltaTime)
            
            # Update play button icon
            if isPlaying:
                self.playButton.iconType = 'pause'
            else:
                self.playButton.iconType = 'play'
    
    def render(self):
        """Render everything"""
        colors = self.colorManager.getAllColors()
        self.screen.fill(colors['darkBackground'])
        
        if self.currentScreen == 'login':
            self.loginScreen.render()
        
        elif self.currentScreen == 'player':
            self._renderPlayerScreen(colors)
            
            if self.showFileDialog and self.fileDialog:
                self.fileDialog.render()
            elif self.showSettings:
                self.settingsMenu.render()
    
    def _renderPlayerScreen(self, colors):
        """Render main player screen"""
        # Draw top bar
        topBarSurface = pygame.Surface((self.screenWidth, 80), pygame.SRCALPHA)
        pygame.draw.rect(topBarSurface, (*colors['midBackground'], 200), 
                        (0, 0, self.screenWidth, 80))
        self.screen.blit(topBarSurface, (0, 0))
        
        # Draw title
        titleText = self.titleFont.render("RETROPLAY", True, colors['neonPink'])
        self.screen.blit(titleText, (self.screenWidth // 2 - 180, 15))
        
        # Draw view switcher buttons
        self.libraryViewButton.render(self.screen)
        self.playlistsViewButton.render(self.screen)
        self.albumsViewButton.render(self.screen)
        
        # Draw top bar buttons
        self.addMusicButton.render(self.screen)
        self.settingsButton.render(self.screen)
        
        # Draw vinyl disk
        self.vinylDisk.render(self.screen)
        
        # Draw current song info
        currentSong = self.audioEngine.getCurrentSong()
        if currentSong:
            titleText = self.textFont.render(currentSong['title'], True, colors['neonBlue'])
            artistText = self.smallFont.render(currentSong['artist'], True, colors['neonPurple'])
            
            titleRect = titleText.get_rect(center=(self.screenWidth // 2, 440))
            artistRect = artistText.get_rect(center=(self.screenWidth // 2, 470))
            
            self.screen.blit(titleText, titleRect)
            self.screen.blit(artistText, artistRect)
        else:
            # Show drag and drop zone when no song is playing
            self.dragDropZone.render(self.screen)
        
        # Draw visualizer
        self.visualizer.render(self.screen)
        
        # Draw control buttons
        self.playButton.render(self.screen)
        self.prevButton.render(self.screen)
        self.nextButton.render(self.screen)
        self.shuffleButton.render(self.screen)
        self.repeatButton.render(self.screen)
