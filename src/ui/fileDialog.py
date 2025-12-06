"""File dialog for selecting music files"""

import pygame
import os

class FileDialog:
    def __init__(self, screen, colorManager, startPath=None):
        self.screen = screen
        self.colorManager = colorManager
        self.screenWidth = screen.get_width()
        self.screenHeight = screen.get_height()
        
        self.currentPath = startPath or os.path.expanduser("~")
        self.files = []
        self.selectedIndex = 0
        self.scrollOffset = 0
        self.maxVisible = 15
        
        pygame.font.init()
        self.titleFont = pygame.font.Font(None, 48)
        self.textFont = pygame.font.Font(None, 28)
        self.smallFont = pygame.font.Font(None, 20)
        
        self._loadDirectory()
    
    def _loadDirectory(self):
        """Load files from current directory"""
        try:
            entries = os.listdir(self.currentPath)
            self.files = []
            
            # Add parent directory option
            if self.currentPath != os.path.dirname(self.currentPath):
                self.files.append({'name': '..', 'isDir': True, 'path': os.path.dirname(self.currentPath)})
            
            # Add directories first
            for entry in sorted(entries):
                fullPath = os.path.join(self.currentPath, entry)
                if os.path.isdir(fullPath):
                    self.files.append({'name': entry, 'isDir': True, 'path': fullPath})
            
            # Add audio files
            audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a']
            for entry in sorted(entries):
                fullPath = os.path.join(self.currentPath, entry)
                if os.path.isfile(fullPath):
                    ext = os.path.splitext(entry)[1].lower()
                    if ext in audioExtensions:
                        self.files.append({'name': entry, 'isDir': False, 'path': fullPath})
            
            self.selectedIndex = 0
            self.scrollOffset = 0
        except Exception as e:
            print(f"Error loading directory: {e}")
    
    def handleEvent(self, event):
        """Handle file dialog events"""
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                return 'cancel'
            elif event.key == pygame.K_UP:
                self.selectedIndex = max(0, self.selectedIndex - 1)
                self._adjustScroll()
            elif event.key == pygame.K_DOWN:
                self.selectedIndex = min(len(self.files) - 1, self.selectedIndex + 1)
                self._adjustScroll()
            elif event.key == pygame.K_RETURN:
                return self._selectFile()
        
        return None
    
    def _adjustScroll(self):
        """Adjust scroll offset to keep selection visible"""
        if self.selectedIndex < self.scrollOffset:
            self.scrollOffset = self.selectedIndex
        elif self.selectedIndex >= self.scrollOffset + self.maxVisible:
            self.scrollOffset = self.selectedIndex - self.maxVisible + 1
    
    def _selectFile(self):
        """Select current file or directory"""
        if not self.files:
            return None
        
        selected = self.files[self.selectedIndex]
        
        if selected['isDir']:
            self.currentPath = selected['path']
            self._loadDirectory()
            return None
        else:
            return selected['path']
    
    def render(self):
        """Render file dialog"""
        colors = self.colorManager.getAllColors()
        
        # Draw overlay
        overlay = pygame.Surface((self.screenWidth, self.screenHeight), pygame.SRCALPHA)
        overlay.fill((*colors['darkBackground'], 240))
        self.screen.blit(overlay, (0, 0))
        
        # Draw dialog box
        dialogWidth = 800
        dialogHeight = 600
        dialogX = (self.screenWidth - dialogWidth) // 2
        dialogY = (self.screenHeight - dialogHeight) // 2
        
        pygame.draw.rect(self.screen, colors['midBackground'], 
                        (dialogX, dialogY, dialogWidth, dialogHeight), 
                        border_radius=10)
        pygame.draw.rect(self.screen, colors['neonPurple'], 
                        (dialogX, dialogY, dialogWidth, dialogHeight), 
                        3, border_radius=10)
        
        # Draw title
        titleText = self.titleFont.render("Select Music File", True, colors['neonPink'])
        titleRect = titleText.get_rect(center=(self.screenWidth // 2, dialogY + 40))
        self.screen.blit(titleText, titleRect)
        
        # Draw current path
        pathText = self.smallFont.render(self.currentPath, True, colors['neonBlue'])
        pathRect = pathText.get_rect(center=(self.screenWidth // 2, dialogY + 80))
        self.screen.blit(pathText, pathRect)
        
        # Draw file list
        listY = dialogY + 120
        visibleFiles = self.files[self.scrollOffset:self.scrollOffset + self.maxVisible]
        
        for i, fileEntry in enumerate(visibleFiles):
            actualIndex = self.scrollOffset + i
            isSelected = actualIndex == self.selectedIndex
            
            # Draw selection highlight
            if isSelected:
                highlightRect = pygame.Rect(dialogX + 20, listY + i * 30, dialogWidth - 40, 28)
                pygame.draw.rect(self.screen, colors['neonPurple'], highlightRect, border_radius=5)
            
            # Draw file icon and name
            icon = "📁" if fileEntry['isDir'] else "🎵"
            color = colors['neonPink'] if isSelected else colors['neonBlue']
            
            fileText = self.textFont.render(f"{icon} {fileEntry['name']}", True, color)
            self.screen.blit(fileText, (dialogX + 30, listY + i * 30))
        
        # Draw instructions
        instructions = [
            "UP/DOWN: Navigate | ENTER: Select | ESC: Cancel"
        ]
        
        instructY = dialogY + dialogHeight - 40
        for instruction in instructions:
            text = self.smallFont.render(instruction, True, colors['accentGreen'])
            textRect = text.get_rect(center=(self.screenWidth // 2, instructY))
            self.screen.blit(text, textRect)
