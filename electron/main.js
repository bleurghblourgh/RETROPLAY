/**
 * RETROPLAY Desktop App - Electron Main Process
 * Features: System tray, media keys, native notifications
 */

const { app, BrowserWindow, globalShortcut, ipcMain, Notification, Menu, nativeImage } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const Store = require('electron-store');

// Initialize store for settings
const store = new Store();

let mainWindow = null;
let tray = null;
let flaskProcess = null;
let isQuitting = false;

// Flask server URL
const FLASK_URL = 'http://localhost:5000';

// Create the main window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: store.get('windowWidth', 1400),
        height: store.get('windowHeight', 900),
        minWidth: 1000,
        minHeight: 700,
        frame: true,
        titleBarStyle: 'default',
        backgroundColor: '#0A0E27',
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Load the Flask app
    mainWindow.loadURL(FLASK_URL);

    // Save window size on resize
    mainWindow.on('resize', () => {
        const { width, height } = mainWindow.getBounds();
        store.set('windowWidth', width);
        store.set('windowHeight', height);
    });

    // Minimize to tray instead of closing
    mainWindow.on('close', (event) => {
        if (!isQuitting && store.get('minimizeToTray', true)) {
            event.preventDefault();
            mainWindow.hide();
            
            // Show notification on first minimize
            if (!store.get('trayNotificationShown')) {
                showNotification('RETROPLAY', 'App minimized to system tray. Click the icon to restore.');
                store.set('trayNotificationShown', true);
            }
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Open DevTools in development
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }
}

// Start Flask server
function startFlaskServer() {
    return new Promise((resolve, reject) => {
        const pythonPath = process.platform === 'win32' ? 'python' : 'python3';
        const appPath = path.join(__dirname, '..', 'app_fixed.py');
        
        flaskProcess = spawn(pythonPath, [appPath], {
            cwd: path.join(__dirname, '..'),
            env: { ...process.env, FLASK_ENV: 'production' }
        });

        flaskProcess.stdout.on('data', (data) => {
            console.log(`Flask: ${data}`);
            if (data.toString().includes('Running on')) {
                resolve();
            }
        });

        flaskProcess.stderr.on('data', (data) => {
            console.error(`Flask Error: ${data}`);
        });

        flaskProcess.on('error', (err) => {
            console.error('Failed to start Flask:', err);
            reject(err);
        });

        // Give Flask time to start
        setTimeout(resolve, 3000);
    });
}

// Stop Flask server
function stopFlaskServer() {
    if (flaskProcess) {
        flaskProcess.kill();
        flaskProcess = null;
    }
}

// Create system tray
function createTray() {
    const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
    const icon = nativeImage.createFromPath(iconPath);
    
    const { Tray } = require('electron');
    tray = new Tray(icon.resize({ width: 16, height: 16 }));
    
    updateTrayMenu();
    
    tray.setToolTip('RETROPLAY');
    
    // Double-click to show window
    tray.on('double-click', () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        }
    });
}

// Update tray context menu
function updateTrayMenu(songInfo = null) {
    const contextMenu = Menu.buildFromTemplate([
        {
            label: songInfo ? `♪ ${songInfo.title}` : '♪ No song playing',
            enabled: false
        },
        {
            label: songInfo ? `  ${songInfo.artist}` : '',
            enabled: false,
            visible: !!songInfo
        },
        { type: 'separator' },
        {
            label: '⏮ Previous',
            click: () => sendMediaCommand('previous')
        },
        {
            label: '⏯ Play/Pause',
            click: () => sendMediaCommand('playPause')
        },
        {
            label: '⏭ Next',
            click: () => sendMediaCommand('next')
        },
        { type: 'separator' },
        {
            label: 'Show RETROPLAY',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        },
        {
            label: 'Minimize to Tray',
            type: 'checkbox',
            checked: store.get('minimizeToTray', true),
            click: (item) => {
                store.set('minimizeToTray', item.checked);
            }
        },
        { type: 'separator' },
        {
            label: 'Quit RETROPLAY',
            click: () => {
                isQuitting = true;
                app.quit();
            }
        }
    ]);
    
    tray.setContextMenu(contextMenu);
}

// Send media command to renderer
function sendMediaCommand(command) {
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('media-command', command);
    }
}

// Show native notification
function showNotification(title, body, icon = null) {
    if (Notification.isSupported()) {
        const notification = new Notification({
            title,
            body,
            icon: icon || path.join(__dirname, 'assets', 'icon.png'),
            silent: true
        });
        notification.show();
        
        notification.on('click', () => {
            if (mainWindow) {
                mainWindow.show();
                mainWindow.focus();
            }
        });
    }
}

// Register global media key shortcuts
function registerMediaKeys() {
    // Play/Pause
    globalShortcut.register('MediaPlayPause', () => {
        sendMediaCommand('playPause');
    });
    
    // Next track
    globalShortcut.register('MediaNextTrack', () => {
        sendMediaCommand('next');
    });
    
    // Previous track
    globalShortcut.register('MediaPreviousTrack', () => {
        sendMediaCommand('previous');
    });
    
    // Stop
    globalShortcut.register('MediaStop', () => {
        sendMediaCommand('stop');
    });
    
    console.log('Media keys registered');
}

// IPC handlers
function setupIPC() {
    // Update now playing info
    ipcMain.on('now-playing', (event, songInfo) => {
        updateTrayMenu(songInfo);
        
        // Show notification for new song
        if (songInfo && store.get('showSongNotifications', true)) {
            showNotification(songInfo.title, `by ${songInfo.artist}`);
        }
    });
    
    // Toggle notification setting
    ipcMain.on('toggle-notifications', (event, enabled) => {
        store.set('showSongNotifications', enabled);
    });
    
    // Get settings
    ipcMain.handle('get-settings', () => {
        return {
            minimizeToTray: store.get('minimizeToTray', true),
            showSongNotifications: store.get('showSongNotifications', true)
        };
    });
}

// App ready
app.whenReady().then(async () => {
    // Start Flask server first
    console.log('Starting Flask server...');
    try {
        await startFlaskServer();
        console.log('Flask server started');
    } catch (err) {
        console.error('Failed to start Flask server:', err);
    }
    
    createWindow();
    createTray();
    registerMediaKeys();
    setupIPC();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        } else if (mainWindow) {
            mainWindow.show();
        }
    });
});

// Cleanup on quit
app.on('before-quit', () => {
    isQuitting = true;
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    stopFlaskServer();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
