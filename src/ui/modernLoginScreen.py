"""Modern login screen with clean UI"""

import pygame
from src.ui.button import Button
from src.ui.textInput import TextInput

class ModernLoginScreen:
    def __init__(self, screen, colorManager, authManager):
        self.screen = screen
        self.colorManager = colorManager
        self.authManager = authManager
        
        self.screenWidth = screen.get_width()
        self.screenHeight = screen.get_height()
        
        self.mode = 'login'  # 'login' or 'register'
        
        pygame.font.init()
        self.titleFont = pygame.font.Font(None, 96)
        self.subtitleFont = pygame.font.Font(None, 42)
        self.textFont = pygame.font.Font(None, 28)
        self.smallFont = pygame.font.Font(None, 22)
        
        # Create UI elements
        self._createUIElements()
        
        self.message = ""
        self.messageColor = (255, 255, 255)
        self.messageTimer = 0
    
    def _createUIElements(self):
        """Create login UI elements"""
        centerX = self.screenWidth // 2
        startY = 300
        
        # Text inputs
        inputWidth = 400
        inputHeight = 55
        
        self.usernameInput = TextInput(
            centerX - inputWidth // 2, startY, inputWidth, inputHeight,
            "Username", self.colorManager
        )
        
        self.emailInput = TextInput(
            centerX - inputWidth // 2, startY + 80, inputWidth, inputHeight,
            "Email", self.colorManager
        )
        
        self.passwordInput = TextInput(
            centerX - inputWidth // 2, startY + 160, inputWidth, inputHeight,
            "Password", self.colorManager, isPassword=True
        )
        
        # Buttons
        buttonWidth = 180
        buttonHeight = 50
        
        self.loginButton = Button(
            centerX - buttonWidth - 10, startY + 240, buttonWidth, buttonHeight,
            "LOGIN", self.colorManager, self._handleLogin
        )
        
        self.registerButton = Button(
            centerX + 10, startY + 240, buttonWidth, buttonHeight,
            "REGISTER", self.colorManager, self._handleRegister
        )
        
        self.switchModeButton = Button(
            centerX - 100, startY + 310, 200, 40,
            "Switch to Register", self.colorManager, self._switchMode
        )
    
    def _handleLogin(self):
        """Handle login button click"""
        username = self.usernameInput.getText()
        password = self.passwordInput.getText()
        
        if not username or not password:
            self._showMessage("Please fill in all fields", (255, 100, 100))
            return
        
        success, message = self.authManager.loginUser(username, password)
        if success:
            return 'logged_in'
        else:
            self._showMessage(message, (255, 100, 100))
    
    def _handleRegister(self):
        """Handle register button click"""
        username = self.usernameInput.getText()
        email = self.emailInput.getText()
        password = self.passwordInput.getText()
        
        if not username or not email or not password:
            self._showMessage("Please fill in all fields", (255, 100, 100))
            return
        
        if '@' not in email:
            self._showMessage("Invalid email address", (255, 100, 100))
            return
        
        success, message = self.authManager.registerUser(username, email, password)
        self._showMessage(message, (100, 255, 100) if success else (255, 100, 100))
        
        if success:
            self.usernameInput.clear()
            self.emailInput.clear()
            self.passwordInput.clear()
            self.mode = 'login'
            self._updateUIForMode()
    
    def _switchMode(self):
        """Switch between login and register modes"""
        self.mode = 'register' if self.mode == 'login' else 'login'
        self._updateUIForMode()
    
    def _updateUIForMode(self):
        """Update UI based on current mode"""
        if self.mode == 'login':
            self.switchModeButton.text = "Need an account? Register"
            self.loginButton.setEnabled(True)
            self.registerButton.setEnabled(False)
        else:
            self.switchModeButton.text = "Have an account? Login"
            self.loginButton.setEnabled(False)
            self.registerButton.setEnabled(True)
    
    def _showMessage(self, message, color):
        """Show temporary message"""
        self.message = message
        self.messageColor = color
        self.messageTimer = 3.0
    
    def handleEvent(self, event):
        """Handle events"""
        # Handle text inputs
        result = self.usernameInput.handleEvent(event)
        if result == 'submit' or result == 'tab':
            if self.mode == 'register':
                self.emailInput.isFocused = True
                self.usernameInput.isFocused = False
            else:
                self.passwordInput.isFocused = True
                self.usernameInput.isFocused = False
        
        if self.mode == 'register':
            result = self.emailInput.handleEvent(event)
            if result == 'submit' or result == 'tab':
                self.passwordInput.isFocused = True
                self.emailInput.isFocused = False
        
        result = self.passwordInput.handleEvent(event)
        if result == 'submit':
            if self.mode == 'login':
                return self._handleLogin()
            else:
                return self._handleRegister()
        
        # Handle buttons
        self.loginButton.handleEvent(event)
        self.registerButton.handleEvent(event)
        self.switchModeButton.handleEvent(event)
        
        result = self.loginButton.onClick if self.loginButton.isPressed else None
        if result:
            return result
        
        return None
    
    def update(self, deltaTime):
        """Update login screen"""
        self.usernameInput.update(deltaTime)
        if self.mode == 'register':
            self.emailInput.update(deltaTime)
        self.passwordInput.update(deltaTime)
        
        if self.messageTimer > 0:
            self.messageTimer -= deltaTime
    
    def render(self):
        """Render modern login screen"""
        colors = self.colorManager.getAllColors()
        
        # Draw animated background
        self._drawAnimatedBackground()
        
        # Draw main panel
        panelWidth = 600
        panelHeight = 650
        panelX = (self.screenWidth - panelWidth) // 2
        panelY = (self.screenHeight - panelHeight) // 2
        
        # Panel with transparency
        panelSurface = pygame.Surface((panelWidth, panelHeight), pygame.SRCALPHA)
        pygame.draw.rect(panelSurface, (*colors['darkBackground'], 240), 
                        (0, 0, panelWidth, panelHeight), border_radius=20)
        self.screen.blit(panelSurface, (panelX, panelY))
        
        # Panel border with glow
        pygame.draw.rect(self.screen, colors['neonPink'], 
                        (panelX, panelY, panelWidth, panelHeight), 3, border_radius=20)
        
        # Draw title
        titleText = self.titleFont.render("RETROPLAY", True, colors['neonPink'])
        titleRect = titleText.get_rect(center=(self.screenWidth // 2, panelY + 80))
        self.screen.blit(titleText, titleRect)
        
        # Draw subtitle
        subtitle = "Welcome Back" if self.mode == 'login' else "Create Account"
        subtitleText = self.subtitleFont.render(subtitle, True, colors['neonBlue'])
        subtitleRect = subtitleText.get_rect(center=(self.screenWidth // 2, panelY + 150))
        self.screen.blit(subtitleText, subtitleRect)
        
        # Draw inputs
        self.usernameInput.render(self.screen)
        if self.mode == 'register':
            self.emailInput.render(self.screen)
        self.passwordInput.render(self.screen)
        
        # Draw buttons
        self.loginButton.render(self.screen)
        self.registerButton.render(self.screen)
        self.switchModeButton.render(self.screen)
        
        # Draw message
        if self.messageTimer > 0:
            messageText = self.textFont.render(self.message, True, self.messageColor)
            messageRect = messageText.get_rect(center=(self.screenWidth // 2, panelY + panelHeight - 60))
            self.screen.blit(messageText, messageRect)
    
    def _drawAnimatedBackground(self):
        """Draw animated retro background"""
        colors = self.colorManager.getAllColors()
        
        # Draw grid lines
        gridSpacing = 50
        for x in range(0, self.screenWidth, gridSpacing):
            pygame.draw.line(self.screen, (*colors['neonPurple'], 30), 
                           (x, 0), (x, self.screenHeight), 1)
        
        for y in range(0, self.screenHeight, gridSpacing):
            pygame.draw.line(self.screen, (*colors['neonPurple'], 30), 
                           (0, y), (self.screenWidth, y), 1)
