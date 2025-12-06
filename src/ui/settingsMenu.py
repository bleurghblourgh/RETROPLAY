"""Settings menu UI"""

import pygame

class SettingsMenu:
    def __init__(self, screen, colorManager, authManager):
        self.screen = screen
        self.colorManager = colorManager
        self.authManager = authManager
        
        self.screenWidth = screen.get_width()
        self.screenHeight = screen.get_height()
        
        pygame.font.init()
        self.titleFont = pygame.font.Font(None, 64)
        self.textFont = pygame.font.Font(None, 32)
        self.smallFont = pygame.font.Font(None, 24)
        
        self.selectedThemeIndex = 0
        self.themes = colorManager.getThemeNames()
    
    def handleEvent(self, event):
        """Handle settings menu events"""
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                return 'close'
            elif event.key == pygame.K_UP:
                self.selectedThemeIndex = (self.selectedThemeIndex - 1) % len(self.themes)
            elif event.key == pygame.K_DOWN:
                self.selectedThemeIndex = (self.selectedThemeIndex + 1) % len(self.themes)
            elif event.key == pygame.K_RETURN:
                self._applyTheme()
        
        return None
    
    def _applyTheme(self):
        """Apply selected theme"""
        themeName = self.themes[self.selectedThemeIndex]
        self.colorManager.setTheme(themeName)
        self.authManager.updateThemePreference(themeName)
    
    def render(self):
        """Render settings menu"""
        colors = self.colorManager.getAllColors()
        
        # Draw semi-transparent overlay
        overlay = pygame.Surface((self.screenWidth, self.screenHeight), pygame.SRCALPHA)
        overlay.fill((*colors['darkBackground'], 230))
        self.screen.blit(overlay, (0, 0))
        
        # Draw title
        titleText = self.titleFont.render("SETTINGS", True, colors['neonPink'])
        titleRect = titleText.get_rect(center=(self.screenWidth // 2, 80))
        self.screen.blit(titleText, titleRect)
        
        # Draw theme selection
        themeLabel = self.textFont.render("Color Theme:", True, colors['neonBlue'])
        self.screen.blit(themeLabel, (self.screenWidth // 2 - 200, 180))
        
        yPos = 240
        for i, theme in enumerate(self.themes):
            color = colors['neonPink'] if i == self.selectedThemeIndex else colors['neonPurple']
            themeText = self.textFont.render(f"  {theme}", True, color)
            self.screen.blit(themeText, (self.screenWidth // 2 - 150, yPos))
            
            if i == self.selectedThemeIndex:
                pygame.draw.rect(self.screen, color, 
                               (self.screenWidth // 2 - 180, yPos, 10, 30))
            
            yPos += 50
        
        # Draw instructions
        instructions = [
            "Use UP/DOWN arrows to select theme",
            "Press ENTER to apply",
            "Press ESC to close"
        ]
        
        yPos = self.screenHeight - 150
        for instruction in instructions:
            text = self.smallFont.render(instruction, True, colors['accentGreen'])
            textRect = text.get_rect(center=(self.screenWidth // 2, yPos))
            self.screen.blit(text, textRect)
            yPos += 35
        
        # Draw user info
        if self.authManager.isLoggedIn():
            user = self.authManager.getCurrentUser()
            userText = self.smallFont.render(f"Logged in as: {user['username']}", 
                                            True, colors['neonBlue'])
            self.screen.blit(userText, (20, 20))
