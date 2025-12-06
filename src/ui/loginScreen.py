"""Login and registration screen"""

import pygame

class LoginScreen:
    def __init__(self, screen, colorManager, authManager):
        self.screen = screen
        self.colorManager = colorManager
        self.authManager = authManager
        
        self.screenWidth = screen.get_width()
        self.screenHeight = screen.get_height()
        
        pygame.font.init()
        self.titleFont = pygame.font.Font(None, 96)
        self.textFont = pygame.font.Font(None, 36)
        self.smallFont = pygame.font.Font(None, 24)
        
        self.mode = 'login'
        self.usernameInput = ''
        self.passwordInput = ''
        self.emailInput = ''
        self.activeField = 'username'
        self.message = ''
        self.messageColor = (255, 255, 255)
    
    def handleEvent(self, event):
        """Handle login screen events"""
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_TAB:
                self._switchField()
            elif event.key == pygame.K_RETURN:
                return self._attemptLogin()
            elif event.key == pygame.K_BACKSPACE:
                self._removeChar()
            elif event.key == pygame.K_F1:
                self.mode = 'register' if self.mode == 'login' else 'login'
                self.message = ''
            elif event.unicode.isprintable():
                self._addChar(event.unicode)
        
        elif event.type == pygame.MOUSEBUTTONDOWN:
            self._handleMouseClick(event.pos)
        
        return None
    
    def _switchField(self):
        """Switch between input fields"""
        if self.mode == 'login':
            self.activeField = 'password' if self.activeField == 'username' else 'username'
        else:
            fields = ['username', 'email', 'password']
            currentIndex = fields.index(self.activeField)
            self.activeField = fields[(currentIndex + 1) % len(fields)]
    
    def _addChar(self, char):
        """Add character to active field"""
        if self.activeField == 'username':
            self.usernameInput += char
        elif self.activeField == 'password':
            self.passwordInput += char
        elif self.activeField == 'email':
            self.emailInput += char
    
    def _removeChar(self):
        """Remove character from active field"""
        if self.activeField == 'username':
            self.usernameInput = self.usernameInput[:-1]
        elif self.activeField == 'password':
            self.passwordInput = self.passwordInput[:-1]
        elif self.activeField == 'email':
            self.emailInput = self.emailInput[:-1]
    
    def _attemptLogin(self):
        """Attempt to login or register"""
        if self.mode == 'login':
            success, message = self.authManager.loginUser(self.usernameInput, self.passwordInput)
            if success:
                return 'logged_in'
            else:
                self.message = message
                self.messageColor = (255, 0, 0)
        else:
            if not self.emailInput or '@' not in self.emailInput:
                self.message = "Invalid email address"
                self.messageColor = (255, 0, 0)
                return None
            
            success, message = self.authManager.registerUser(
                self.usernameInput, self.emailInput, self.passwordInput
            )
            self.message = message
            self.messageColor = (0, 255, 0) if success else (255, 0, 0)
            
            if success:
                self.mode = 'login'
                self.usernameInput = ''
                self.passwordInput = ''
                self.emailInput = ''
        
        return None
    
    def _handleMouseClick(self, pos):
        """Handle mouse clicks on buttons"""
        pass
    
    def render(self):
        """Render login screen"""
        colors = self.colorManager.getAllColors()
        
        # Draw title
        titleText = self.titleFont.render("RETROPLAY", True, colors['neonPink'])
        titleRect = titleText.get_rect(center=(self.screenWidth // 2, 100))
        self.screen.blit(titleText, titleRect)
        
        # Draw subtitle
        subtitle = "Login" if self.mode == 'login' else "Register"
        subtitleText = self.textFont.render(subtitle, True, colors['neonBlue'])
        subtitleRect = subtitleText.get_rect(center=(self.screenWidth // 2, 200))
        self.screen.blit(subtitleText, subtitleRect)
        
        # Draw input fields
        yPos = 280
        self._drawInputField("Username", self.usernameInput, yPos, 
                           self.activeField == 'username', colors)
        
        if self.mode == 'register':
            yPos += 80
            self._drawInputField("Email", self.emailInput, yPos, 
                               self.activeField == 'email', colors)
        
        yPos += 80
        self._drawInputField("Password", '*' * len(self.passwordInput), yPos, 
                           self.activeField == 'password', colors)
        
        # Draw message
        if self.message:
            messageText = self.smallFont.render(self.message, True, self.messageColor)
            messageRect = messageText.get_rect(center=(self.screenWidth // 2, yPos + 60))
            self.screen.blit(messageText, messageRect)
        
        # Draw instructions
        instructions = [
            "Press TAB to switch fields",
            "Press ENTER to submit",
            "Press F1 to switch between Login/Register"
        ]
        
        yPos = self.screenHeight - 120
        for instruction in instructions:
            text = self.smallFont.render(instruction, True, colors['accentGreen'])
            textRect = text.get_rect(center=(self.screenWidth // 2, yPos))
            self.screen.blit(text, textRect)
            yPos += 30
    
    def _drawInputField(self, label, value, y, isActive, colors):
        """Draw an input field"""
        labelText = self.textFont.render(label + ":", True, colors['neonPurple'])
        labelRect = labelText.get_rect(midright=(self.screenWidth // 2 - 20, y))
        self.screen.blit(labelText, labelRect)
        
        # Draw input box
        boxColor = colors['neonBlue'] if isActive else colors['midBackground']
        boxRect = pygame.Rect(self.screenWidth // 2 + 20, y - 20, 300, 40)
        pygame.draw.rect(self.screen, boxColor, boxRect, 2, border_radius=5)
        
        # Draw value
        valueText = self.textFont.render(value, True, colors['neonBlue'])
        valueRect = valueText.get_rect(midleft=(self.screenWidth // 2 + 30, y))
        self.screen.blit(valueText, valueRect)
