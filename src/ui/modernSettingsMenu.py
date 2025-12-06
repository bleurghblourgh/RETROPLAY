"""Enhanced settings menu with more options"""

import pygame
from src.ui.button import Button, IconButton

class ModernSettingsMenu:
    def __init__(self, screen, colorManager, authManager, audioEngine):
        self.screen = screen
        self.colorManager = colorManager
        self.authManager = authManager
        self.audioEngine = audioEngine
        
        self.screenWidth = screen.get_width()
        self.screenHeight = screen.get_height()
        
        pygame.font.init()
        self.titleFont = pygame.font.Font(None, 64)
        self.sectionFont = pygame.font.Font(None, 42)
        self.textFont = pygame.font.Font(None, 28)
        self.smallFont = pygame.font.Font(None, 22)
        
        self.selectedThemeIndex = 0
        self.themes = colorManager.getThemeNames()
        self.volumeLevel = audioEngine.getVolume()
        
        self._createUIElements()
    
    def _createUIElements(self):
        """Create settings UI elements"""
        centerX = self.screenWidth // 2
        
        # Close button
        self.closeButton = IconButton(
            self.screenWidth - 80, 30, 50, 'settings',
            self.colorManager, self._close
        )
        
        # Theme buttons
        self.themeButtons = []
        startY = 250
        for i, theme in enumerate(self.themes):
            btn = Button(
                centerX - 200, startY + i * 60, 400, 50,
                theme.replace('_', ' ').title(), self.colorManager,
                lambda t=theme: self._selectTheme(t)
            )
            self.themeButtons.append(btn)
        
        # Volume slider (simulated with buttons)
        self.volumeDownButton = Button(
            centerX - 220, 600, 50, 40, "-", self.colorManager,
            self._decreaseVolume
        )
        
        self.volumeUpButton = Button(
            centerX + 170, 600, 50, 40, "+", self.colorManager,
            self._increaseVolume
        )
        
        # Logout button
        self.logoutButton = Button(
            centerX - 100, self.screenHeight - 100, 200, 50,
            "LOGOUT", self.colorManager, self._logout
        )
    
    def _selectTheme(self, theme):
        """Select and apply theme"""
        self.colorManager.setTheme(theme)
        self.authManager.updateThemePreference(theme)
        self.selectedThemeIndex = self.themes.index(theme)
    
    def _decreaseVolume(self):
        """Decrease volume"""
        self.volumeLevel = max(0.0, self.volumeLevel - 0.1)
        self.audioEngine.setVolume(self.volumeLevel)
    
    def _increaseVolume(self):
        """Increase volume"""
        self.volumeLevel = min(1.0, self.volumeLevel + 0.1)
        self.audioEngine.setVolume(self.volumeLevel)
    
    def _logout(self):
        """Logout user"""
        return 'logout'
    
    def _close(self):
        """Close settings"""
        return 'close'
    
    def handleEvent(self, event):
        """Handle settings events"""
        # Handle close button
        self.closeButton.handleEvent(event)
        if self.closeButton.isPressed:
            return 'close'
        
        # Handle theme buttons
        for btn in self.themeButtons:
            btn.handleEvent(event)
        
        # Handle volume buttons
        self.volumeDownButton.handleEvent(event)
        self.volumeUpButton.handleEvent(event)
        
        # Handle logout button
        self.logoutButton.handleEvent(event)
        if self.logoutButton.isPressed:
            return 'logout'
        
        # ESC to close
        if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
            return 'close'
        
        return None
    
    def render(self):
        """Render enhanced settings menu"""
        colors = self.colorManager.getAllColors()
        
        # Draw semi-transparent overlay
        overlay = pygame.Surface((self.screenWidth, self.screenHeight), pygame.SRCALPHA)
        overlay.fill((*colors['darkBackground'], 245))
        self.screen.blit(overlay, (0, 0))
        
        # Draw main panel
        panelWidth = 700
        panelHeight = 750
        panelX = (self.screenWidth - panelWidth) // 2
        panelY = (self.screenHeight - panelHeight) // 2
        
        panelSurface = pygame.Surface((panelWidth, panelHeight), pygame.SRCALPHA)
        pygame.draw.rect(panelSurface, (*colors['midBackground'], 250), 
                        (0, 0, panelWidth, panelHeight), border_radius=20)
        self.screen.blit(panelSurface, (panelX, panelY))
        
        pygame.draw.rect(self.screen, colors['neonPink'], 
                        (panelX, panelY, panelWidth, panelHeight), 3, border_radius=20)
        
        # Draw title with logo
        from src.ui.logo import CompactLogo
        if not hasattr(self, 'settingsLogo'):
            self.settingsLogo = CompactLogo(panelX + 50, panelY + 40, size=40)
        
        self.settingsLogo.render(self.screen)
        
        titleText = self.titleFont.render("SETTINGS", True, colors['neonPink'])
        self.screen.blit(titleText, (panelX + 110, panelY + 45))
        
        # Draw close button
        self.closeButton.render(self.screen)
        
        # Theme section
        sectionText = self.sectionFont.render("Color Theme", True, colors['neonBlue'])
        self.screen.blit(sectionText, (panelX + 50, 180))
        
        # Draw theme buttons
        for i, btn in enumerate(self.themeButtons):
            if self.themes[i] == self.colorManager.currentTheme:
                # Highlight current theme
                highlightRect = pygame.Rect(btn.rect.x - 10, btn.rect.y - 5, 
                                           btn.rect.width + 20, btn.rect.height + 10)
                pygame.draw.rect(self.screen, colors['neonPink'], highlightRect, 3, border_radius=10)
            btn.render(self.screen)
        
        # Volume section
        sectionText = self.sectionFont.render("Volume", True, colors['neonBlue'])
        self.screen.blit(sectionText, (panelX + 50, 540))
        
        # Draw volume slider
        sliderX = self.screenWidth // 2 - 150
        sliderY = 610
        sliderWidth = 300
        sliderHeight = 20
        
        # Slider background
        pygame.draw.rect(self.screen, colors['darkBackground'], 
                        (sliderX, sliderY, sliderWidth, sliderHeight), border_radius=10)
        
        # Slider fill
        fillWidth = int(sliderWidth * self.volumeLevel)
        pygame.draw.rect(self.screen, colors['neonPink'], 
                        (sliderX, sliderY, fillWidth, sliderHeight), border_radius=10)
        
        # Volume buttons
        self.volumeDownButton.render(self.screen)
        self.volumeUpButton.render(self.screen)
        
        # Volume percentage
        volumeText = self.textFont.render(f"{int(self.volumeLevel * 100)}%", True, colors['neonBlue'])
        volumeRect = volumeText.get_rect(center=(self.screenWidth // 2, sliderY + 50))
        self.screen.blit(volumeText, volumeRect)
        
        # User info section
        if self.authManager.isLoggedIn():
            user = self.authManager.getCurrentUser()
            userText = self.textFont.render(f"Logged in as: {user['username']}", 
                                          True, colors['accentGreen'])
            self.screen.blit(userText, (panelX + 50, panelY + panelHeight - 180))
            
            emailText = self.smallFont.render(f"Email: {user['email']}", 
                                            True, (150, 150, 150))
            self.screen.blit(emailText, (panelX + 50, panelY + panelHeight - 150))
        
        # Logout button
        self.logoutButton.render(self.screen)
