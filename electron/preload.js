/**
 * RETROPLAY Desktop App - Preload Script
 * Bridges Electron and web app for media controls & notifications
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose Electron APIs to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // Send now playing info to main process
    updateNowPlaying: (songInfo) => {
        ipcRenderer.send('now-playing', songInfo);
    },
    
    // Toggle notifications
    toggleNotifications: (enabled) => {
        ipcRenderer.send('toggle-notifications', enabled);
    },
    
    // Get settings
    getSettings: () => ipcRenderer.invoke('get-settings'),
    
    // Listen for media commands from main process
    onMediaCommand: (callback) => {
        ipcRenderer.on('media-command', (event, command) => {
            callback(command);
        });
    },
    
    // Check if running in Electron
    isElectron: true,
    
    // Platform info
    platform: process.platform
});

// Inject media command handler when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    console.log('[Electron] Preload script loaded');
    
    // Listen for media commands
    ipcRenderer.on('media-command', (event, command) => {
        console.log('[Electron] Media command:', command);
        
        switch (command) {
            case 'playPause':
                if (window.togglePlay) window.togglePlay();
                break;
            case 'next':
                if (window.playNext) window.playNext();
                break;
            case 'previous':
                if (window.playPrevious) window.playPrevious();
                break;
            case 'stop':
                const audio = document.getElementById('audio-player');
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
                break;
        }
    });
});
