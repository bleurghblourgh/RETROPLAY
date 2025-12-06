"""Modern text input field"""

import pygame

class TextInput:
    def __init__(self, x, y, width, height, placeholder, colorManager, isPassword=False):
        self.rect = pygame.Rect(x, y, width, height)
        self.placeholder = placeholder
        self.colorManager = colorManager
        self.isPassword = isPassword
        
        self.text = ""
        self.isFocused = False
        self.cursorVisible = True
        self.cursorTimer = 0
        
        pygame.font.init()
        self.font = pygame.font.Font(None, 32)
    
    def handleEvent(self, event):
        """Handle input events"""
        if event.type == pygame.MOUSEBUTTONDOWN:
            self.isFocused = self.rect.collidepoint(event.pos)
            return self.isFocused
        
        if self.isFocused and event.type == pygame.KEYDOWN:
            if event.key == pygame.K_BACKSPACE:
                self.text = self.text[:-1]
            elif event.key == pygame.K_RETURN:
                return 'submit'
            elif event.key == pygame.K_TAB:
                return 'tab'
            elif event.unicode.isprintable():
                self.text += event.unicode
            return True
        
        return False
    
    def update(self, deltaTime):
        """Update cursor blink"""
        self.cursorTimer += deltaTime
        if self.cursorTimer >= 0.5:
            self.cursorVisible = not self.cursorVisible
            self.cursorTimer = 0
    
    def render(self, surface):
        """Render text input"""
        colors = self.colorManager.getAllColors()
        
        # Draw background
        bgColor = colors['midBackground']
        pygame.draw.rect(surface, bgColor, self.rect, border_radius=8)
        
        # Draw border
        borderColor = colors['neonPink'] if self.isFocused else colors['neonBlue']
        borderWidth = 3 if self.isFocused else 2
        pygame.draw.rect(surface, borderColor, self.rect, borderWidth, border_radius=8)
        
        # Draw glow when focused
        if self.isFocused:
            glowSurface = pygame.Surface((self.rect.width + 10, self.rect.height + 10), pygame.SRCALPHA)
            pygame.draw.rect(glowSurface, (*colors['neonPink'], 30), 
                           (0, 0, self.rect.width + 10, self.rect.height + 10), 
                           border_radius=10)
            surface.blit(glowSurface, (self.rect.x - 5, self.rect.y - 5))
        
        # Draw text or placeholder
        textX = self.rect.x + 15
        textY = self.rect.centery
        
        if self.text:
            displayText = '*' * len(self.text) if self.isPassword else self.text
            textSurface = self.font.render(displayText, True, colors['neonBlue'])
        else:
            textSurface = self.font.render(self.placeholder, True, (100, 100, 120))
        
        textRect = textSurface.get_rect(midleft=(textX, textY))
        surface.blit(textSurface, textRect)
        
        # Draw cursor
        if self.isFocused and self.cursorVisible and self.text:
            cursorX = textRect.right + 2
            pygame.draw.line(surface, colors['neonPink'], 
                           (cursorX, textY - 12), (cursorX, textY + 12), 2)
    
    def getText(self):
        return self.text
    
    def setText(self, text):
        self.text = text
    
    def clear(self):
        self.text = ""
