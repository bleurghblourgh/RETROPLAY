# RETROPLAY Desktop App

Electron wrapper for RETROPLAY with native desktop features.

## Features

- **System Tray** - Minimize to tray, quick controls
- **Media Keys** - Play/Pause, Next, Previous using keyboard media keys
- **Native Notifications** - Song change notifications
- **Auto-start Flask** - Automatically starts the backend server

## Setup

### 1. Install Node.js
Download from https://nodejs.org/ (LTS version recommended)

### 2. Install Dependencies
```bash
cd electron
npm install
```

### 3. Run the Desktop App
```bash
npm start
```

## Building Distributable

### Windows
```bash
npm run build:win
```

### macOS
```bash
npm run build:mac
```

### Linux
```bash
npm run build:linux
```

Built files will be in the `electron/dist` folder.

## Icons

Place your icons in the `assets` folder:
- `icon.png` - 512x512 PNG for all platforms
- `icon.ico` - Windows icon
- `icon.icns` - macOS icon
- `tray-icon.png` - 16x16 or 32x32 for system tray

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Media Play/Pause | Play/Pause current song |
| Media Next | Skip to next song |
| Media Previous | Go to previous song |
| Media Stop | Stop playback |

## Tray Menu

Right-click the tray icon for:
- Current song info
- Playback controls
- Show/Hide window
- Quit app

## Settings

- **Minimize to Tray** - Close button minimizes instead of quitting
- **Song Notifications** - Show notification when song changes

## Development

Run with DevTools:
```bash
npm start -- --dev
```

## Troubleshooting

### Flask server not starting
Make sure Python and requirements are installed:
```bash
pip install -r ../requirements.txt
```

### Media keys not working
Some systems require the app to be focused first, or may have conflicts with other media apps.

### Tray icon not showing
Make sure `assets/tray-icon.png` exists (16x16 or 32x32 PNG).
