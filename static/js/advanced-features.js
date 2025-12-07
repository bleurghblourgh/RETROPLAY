/**
 * RETROPLAY Advanced Features
 * - Folder/Batch Upload
 * - Smart Playlists
 * - Queue Management
 */

// ============================================
// FOLDER/BATCH UPLOAD
// ============================================

function setupFolderUpload() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    
    if (!dropZone || !fileInput) return;
    
    // Add folder upload button
    const dropInner = dropZone.querySelector('.drop-zone-inner');
    if (dropInner && !document.getElementById('folder-upload-btn')) {
        const btnContainer = document.createElement('div');
        btnContainer.className = 'upload-mode-btns';
        btnContainer.innerHTML = `
            <button id="files-upload-btn" class="upload-mode-btn active" onclick="setUploadMode('files')">
                📄 Files
            </button>
            <button id="folder-upload-btn" class="upload-mode-btn" onclick="setUploadMode('folder')">
                📁 Folder
            </button>
        `;
        dropInner.appendChild(btnContainer);
    }
    
    console.log('[Advanced] Folder upload enabled');
}

let uploadMode = 'files';

function setUploadMode(mode) {
    uploadMode = mode;
    const fileInput = document.getElementById('file-input');
    
    document.querySelectorAll('.upload-mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${mode}-upload-btn`)?.classList.add('active');
    
    if (mode === 'folder') {
        fileInput.setAttribute('webkitdirectory', '');
        fileInput.setAttribute('directory', '');
    } else {
        fileInput.removeAttribute('webkitdirectory');
        fileInput.removeAttribute('directory');
    }
}

// ============================================
// SMART PLAYLISTS
// ============================================

const SMART_PLAYLISTS = [
    {
        id: 'most-played',
        name: '🔥 Most Played',
        description: 'Your top 25 most played songs',
        icon: '🔥',
        endpoint: '/api/smart-playlists/most-played'
    },
    {
        id: 'recently-added',
        name: '✨ Recently Added',
        description: 'Songs from the last 30 days',
        icon: '✨',
        endpoint: '/api/smart-playlists/recently-added'
    },
    {
        id: 'forgotten-gems',
        name: '💎 Forgotten Gems',
        description: 'Never played, added 30+ days ago',
        icon: '💎',
        endpoint: '/api/smart-playlists/forgotten-gems'
    },
    {
        id: 'liked-songs',
        name: '❤️ Liked Songs',
        description: 'All your favorite songs',
        icon: '❤️',
        endpoint: '/api/library/liked'
    }
];

function setupSmartPlaylists() {
    const playlistsTab = document.getElementById('playlists-tab');
    if (!playlistsTab || document.getElementById('smart-playlists-section')) return;
    
    const contentHeader = playlistsTab.querySelector('.content-header');
    if (!contentHeader) return;
    
    const smartSection = document.createElement('div');
    smartSection.id = 'smart-playlists-section';
    smartSection.className = 'smart-playlists-section';
    smartSection.innerHTML = `
        <div class="section-header">
            <h3>🤖 Smart Playlists</h3>
        </div>
        <div class="smart-playlists-grid">
            ${SMART_PLAYLISTS.map(sp => `
                <div class="smart-playlist-card" onclick="playSmartPlaylist('${sp.id}')">
                    <div class="smart-playlist-icon">${sp.icon}</div>
                    <div class="smart-playlist-info">
                        <div class="smart-playlist-name">${sp.name}</div>
                        <div class="smart-playlist-desc">${sp.description}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    contentHeader.insertAdjacentElement('afterend', smartSection);
    console.log('[Advanced] Smart playlists enabled');
}

async function playSmartPlaylist(playlistId) {
    const playlist = SMART_PLAYLISTS.find(p => p.id === playlistId);
    if (!playlist) return;
    
    try {
        const response = await fetch(playlist.endpoint);
        const result = await response.json();
        
        if (result.success && result.songs && result.songs.length > 0) {
            window.currentQueue = result.songs;
            window.currentQueueIndex = 0;
            playSong(result.songs[0]);
            showNotification(`Playing ${playlist.name}`, 'success');
            
            if (window.vinylPanel) {
                window.vinylPanel.updateQueue(result.songs, 0);
            }
        } else {
            showNotification(`No songs in ${playlist.name}`, 'info');
        }
    } catch (error) {
        console.error('Error loading smart playlist:', error);
        showNotification('Failed to load playlist', 'error');
    }
}

// ============================================
// QUEUE MANAGEMENT
// ============================================

function setupQueueManagement() {
    const queueSection = document.querySelector('.vinyl-queue');
    if (!queueSection || document.getElementById('queue-controls')) return;
    
    const queueHeader = queueSection.querySelector('h4') || queueSection.querySelector('.queue-header');
    if (queueHeader) {
        const controls = document.createElement('div');
        controls.id = 'queue-controls';
        controls.className = 'queue-controls';
        controls.innerHTML = `
            <button class="queue-ctrl-btn" onclick="saveQueueAsPlaylist()" title="Save as Playlist">💾</button>
            <button class="queue-ctrl-btn" onclick="shuffleCurrentQueue()" title="Shuffle Queue">🔀</button>
        `;
        queueHeader.appendChild(controls);
    }
    
    console.log('[Advanced] Queue management enabled');
}

function shuffleCurrentQueue() {
    if (!window.currentQueue || window.currentQueue.length <= 1) return;
    
    const currentSong = window.currentQueue[window.currentQueueIndex];
    const otherSongs = window.currentQueue.filter((_, i) => i !== window.currentQueueIndex);
    
    // Fisher-Yates shuffle
    for (let i = otherSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]];
    }
    
    window.currentQueue = [currentSong, ...otherSongs];
    window.currentQueueIndex = 0;
    
    if (window.vinylPanel) {
        window.vinylPanel.updateQueue(window.currentQueue, 0);
    }
    
    showNotification('Queue shuffled', 'success');
}

async function saveQueueAsPlaylist() {
    if (!window.currentQueue || window.currentQueue.length === 0) {
        showNotification('Queue is empty', 'warning');
        return;
    }
    
    const name = prompt('Enter playlist name:', `Queue - ${new Date().toLocaleDateString()}`);
    if (!name) return;
    
    try {
        const createRes = await fetch('/api/playlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description: 'Saved from queue' })
        });
        const createResult = await createRes.json();
        
        if (createResult.success) {
            for (const song of window.currentQueue) {
                await fetch(`/api/playlists/${createResult.playlistId}/songs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ songId: song.songId })
                });
            }
            
            showNotification(`Saved as "${name}"`, 'success');
            if (typeof loadPlaylists === 'function') loadPlaylists();
        }
    } catch (error) {
        console.error('Error saving queue:', error);
        showNotification('Failed to save playlist', 'error');
    }
}

// Play Next / Add to Queue functions
function playNextSong(song) {
    if (!window.currentQueue) window.currentQueue = [];
    if (!song) return;
    
    const insertIndex = (window.currentQueueIndex || 0) + 1;
    window.currentQueue.splice(insertIndex, 0, song);
    
    if (window.vinylPanel) {
        window.vinylPanel.updateQueue(window.currentQueue, window.currentQueueIndex);
    }
    
    showNotification(`"${song.title}" plays next`, 'success');
}

function addToQueue(song) {
    if (!window.currentQueue) window.currentQueue = [];
    if (!song) return;
    
    window.currentQueue.push(song);
    
    if (window.vinylPanel) {
        window.vinylPanel.updateQueue(window.currentQueue, window.currentQueueIndex);
    }
    
    showNotification(`Added "${song.title}" to queue`, 'success');
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        setupFolderUpload();
        setupSmartPlaylists();
        setupQueueManagement();
        console.log('[Advanced Features] All features initialized');
    }, 1500);
});

// Make functions global
window.setUploadMode = setUploadMode;
window.playSmartPlaylist = playSmartPlaylist;
window.shuffleCurrentQueue = shuffleCurrentQueue;
window.saveQueueAsPlaylist = saveQueueAsPlaylist;
window.playNextSong = playNextSong;
window.addToQueue = addToQueue;
