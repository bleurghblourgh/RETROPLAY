"""Color management for retro themes"""

class ColorManager:
    def __init__(self):
        self.themes = {
            'synthwave': {
                'neonPink': (255, 0, 110),
                'neonBlue': (0, 245, 255),
                'neonPurple': (139, 0, 255),
                'darkBackground': (10, 14, 39),
                'midBackground': (26, 31, 58),
                'accentOrange': (255, 158, 0),
                'accentGreen': (0, 255, 159)
            },
            'tokyoNights': {
                'neonPink': (255, 117, 181),
                'neonBlue': (125, 207, 255),
                'neonPurple': (187, 154, 247),
                'darkBackground': (26, 27, 38),
                'midBackground': (36, 40, 59),
                'accentOrange': (255, 158, 100),
                'accentGreen': (158, 206, 106)
            },
            'cyberpunkRed': {
                'neonPink': (255, 0, 85),
                'neonBlue': (0, 255, 255),
                'neonPurple': (255, 0, 255),
                'darkBackground': (15, 5, 10),
                'midBackground': (40, 10, 20),
                'accentOrange': (255, 100, 0),
                'accentGreen': (0, 255, 100)
            },
            'vaporwavePastels': {
                'neonPink': (255, 113, 206),
                'neonBlue': (142, 202, 230),
                'neonPurple': (203, 166, 247),
                'darkBackground': (30, 20, 40),
                'midBackground': (50, 40, 70),
                'accentOrange': (255, 204, 170),
                'accentGreen': (170, 255, 195)
            },
            'matrixGreen': {
                'neonPink': (0, 255, 65),
                'neonBlue': (0, 200, 100),
                'neonPurple': (0, 255, 150),
                'darkBackground': (0, 0, 0),
                'midBackground': (0, 20, 10),
                'accentOrange': (0, 255, 100),
                'accentGreen': (0, 255, 65)
            }
        }
        self.currentTheme = 'synthwave'
    
    def setTheme(self, themeName):
        if themeName in self.themes:
            self.currentTheme = themeName
            return True
        return False
    
    def getColor(self, colorName):
        return self.themes[self.currentTheme].get(colorName, (255, 255, 255))
    
    def getAllColors(self):
        return self.themes[self.currentTheme]
    
    def getThemeNames(self):
        return list(self.themes.keys())
