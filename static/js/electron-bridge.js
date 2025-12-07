/**
 * RETROPLAY - Electron Bridge
 * Handles communication between web app and Electron desktop wrapper
 */

const ElectronBridge = {
    isElectron: false,
    
    init() {
        // Check if running in Electron
        this.isElectron = !!(window.electronAPI && window.electronAPI.isElectron);
        
        if (this.isElectron) {
            console.log('[Electron] Running in desktop app');
            this.setupMediaCommands();
            this.setupNowPlayingUpdates();
            this.addDesktopIndicator();
        } else {
            console.log('[Electron] Running in browser');
        }
    },
    
    // Setup media command listeners
    setupMediaCommands() {
        if (!window.electronAPI) return;
        
        window.electronAPI.onMediaCommand((command) => {
            console.log('[Electron] Received media command:', command);
            
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
    },
    
    // Setup now playing updates to send to Electron
    setupNowPlayingUpdates() {
        if (!window.electronAPI) return;
        
        // Watch for song changes
        const audio = document.getElementById('audio-player');
        if (audio) {
            audio.addEventListener('play', () => this.updateNowPlaying());
            audio.addEventListener('loadeddata', () => this.updateNowPlaying());
        }
        
        // Also watch vinyl panel title changes
        const vinylTitle = document.querySelector('.vinyl-song-title');
        if (vinylTitle) {
            const observer = new MutationObserver(() => this.updateNowPlaying());
            observer.observe(vinylTitle, { childList: true, characterData: true, subtree: true });
        }
    },
    
    // Send now playing info to Electron
    updateNowPlaying() {
        if (!window.electronAPI) return;
        
        let songInfo = window.currentSong;
        
        // Fallback to vinyl panel
        if (!songInfo || !songInfo.title) {
            const vinylTitle = document.querySelector('.vinyl-song-title');
            const vinylArtist = document.querySelector('.vinyl-song-artist');
            if (vinylTitle && vinylTitle.textContent) {
                songInfo = {
                    title: vinylTitle.textContent,
                    artist: vinylArtist?.textContent || 'Unknown Artist'
                };
            }
        }
        
        if (songInfo && songInfo.title) {
            window.electronAPI.updateNowPlaying(songInfo);
        }
    },
    
    // Add visual indicator that we're in desktop mode
    addDesktopIndicator() {
        document.body.classList.add('electron-app');
        
        // Add desktop badge to sidebar
        const logo = document.querySelector('.logo-compact');
        if (logo && !document.querySelector('.desktop-badge')) {
            const badge = document.createElement('span');
            badge.className = 'desktop-badge';
            badge.textContent = 'Desktop';
            badge.title = 'Running as desktop app with media key support';
            logo.appendChild(badge);
        }
    },
    
    // Show native notification (if in Electron)
    showNotification(title, body) {
        if (this.isElectron && window.electronAPI) {
            // Electron handles notifications via main process
            window.electronAPI.updateNowPlaying({ title, artist: body });
        } else if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body });
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ElectronBridge.init();
});

// Export for global access
window.ElectronBridge = ElectronBridge;
