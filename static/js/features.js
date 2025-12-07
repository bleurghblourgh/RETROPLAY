/**
 * RETROPLAY Quick Win Features
 * - Keyboard Shortcuts
 * - Song Sorting & Filtering
 * - Recently Played
 * - Favorites/Liked Songs
 * - Sleep Timer
 */

// ============================================
// 1. KEYBOARD SHORTCUTS
// ============================================

let keyboardShortcutsEnabled = true;

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger if typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (!keyboardShortcutsEnabled) return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                if (typeof togglePlay === 'function') togglePlay();
                break;
            case 'ArrowLeft':
                if (e.shiftKey) {
                    // Seek backward 10 seconds
                    if (audioPlayer) audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
                } else {
                    if (typeof playPrevious === 'function') playPrevious();
                }
                break;
            case 'ArrowRight':
                if (e.shiftKey) {
                    // Seek forward 10 seconds
                    if (audioPlayer) audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
                } else {
                    if (typeof playNext === 'function') playNext();
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                adjustVolume(0.1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                adjustVolume(-0.1);
                break;
            case 'KeyM':
                toggleMute();
                break;
            case 'KeyF':
                if (window.vinylPanel) window.vinylPanel.toggleFullscreen();
                break;
            case 'KeyS':
                if (typeof toggleShuffle === 'function') toggleShuffle();
                break;
            case 'KeyR':
                if (typeof toggleRepeat === 'function') toggleRepeat();
                break;
            case 'KeyL':
                // Like current song
                likeCurrentSong();
                break;
            case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4': case 'Digit5':
                // Quick switch tabs
                const tabIndex = parseInt(e.code.replace('Digit', '')) - 1;
                const tabs = ['library', 'playlists', 'albums', 'upload', 'settings'];
                if (tabs[tabIndex]) switchTab(tabs[tabIndex]);
                break;
        }
    });
    
    console.log('[Features] Keyboard shortcuts enabled');
}

let previousVolume = 0.7;

function adjustVolume(delta) {
    if (!audioPlayer) return;
    const newVolume = Math.max(0, Math.min(1, audioPlayer.volume + delta));
    audioPlayer.volume = newVolume;
    
    // Update volume slider if exists
    const volumeSlider = document.getElementById('vinyl-volume');
    if (volumeSlider) volumeSlider.value = newVolume * 100;
    
    showNotification(`Volume: ${Math.round(newVolume * 100)}%`, 'info');
}

function toggleMute() {
    if (!audioPlayer) return;
    
    if (audioPlayer.volume > 0) {
        previousVolume = audioPlayer.volume;
        audioPlayer.volume = 0;
        showNotification('Muted', 'info');
    } else {
        audioPlayer.volume = previousVolume || 0.7;
        showNotification(`Volume: ${Math.round(audioPlayer.volume * 100)}%`, 'info');
    }
    
    // Update volume slider
    const volumeSlider = document.getElementById('vinyl-volume');
    if (volumeSlider) volumeSlider.value = audioPlayer.volume * 100;
}

// ============================================
// 2. SONG SORTING & FILTERING
// ============================================

let currentSortBy = 'createdAt';
let currentSortOrder = 'desc';
let currentFilter = '';
let allSongs = []; // Store all songs for filtering

function setupSortingAndFiltering() {
    // Add sort/filter controls to library header
    const headerActions = document.querySelector('#library-tab .header-actions');
    if (headerActions && !document.getElementById('sort-select')) {
        const sortHtml = `
            <select id="sort-select" class="sort-select" title="Sort by">
                <option value="createdAt-desc">Recently Added</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="artist-asc">Artist A-Z</option>
                <option value="artist-desc">Artist Z-A</option>
                <option value="playCount-desc">Most Played</option>
                <option value="playCount-asc">Least Played</option>
                <option value="duration-desc">Longest</option>
                <option value="duration-asc">Shortest</option>
            </select>
        `;
        headerActions.insertAdjacentHTML('afterbegin', sortHtml);
        
        document.getElementById('sort-select').addEventListener('change', (e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            currentSortBy = sortBy;
            currentSortOrder = sortOrder;
            applySortAndFilter();
        });
    }
    
    // Setup search input
    const searchInput = document.querySelector('#library-tab .search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilter = e.target.value.toLowerCase();
            applySortAndFilter();
        });
    }
    
    console.log('[Features] Sorting and filtering enabled');
}

function applySortAndFilter() {
    let songs = [...allSongs];
    
    // Filter
    if (currentFilter) {
        songs = songs.filter(song => 
            (song.title || '').toLowerCase().includes(currentFilter) ||
            (song.artist || '').toLowerCase().includes(currentFilter) ||
            (song.album || '').toLowerCase().includes(currentFilter)
        );
    }
    
    // Sort
    songs.sort((a, b) => {
        let valA = a[currentSortBy] || '';
        let valB = b[currentSortBy] || '';
        
        // Handle numeric values
        if (currentSortBy === 'playCount' || currentSortBy === 'duration') {
            valA = valA || 0;
            valB = valB || 0;
        }
        
        // Handle dates
        if (currentSortBy === 'createdAt') {
            valA = new Date(valA || 0).getTime();
            valB = new Date(valB || 0).getTime();
        }
        
        // String comparison
        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        
        if (currentSortOrder === 'asc') {
            return valA > valB ? 1 : valA < valB ? -1 : 0;
        } else {
            return valA < valB ? 1 : valA > valB ? -1 : 0;
        }
    });
    
    displaySongsFiltered(songs);
}

function displaySongsFiltered(songs) {
    const grid = document.getElementById('songs-grid');
    
    if (songs.length === 0) {
        grid.innerHTML = `<div class="empty-state">
            ${currentFilter ? 'No songs match your search.' : 'No songs yet. Upload some music!'}
        </div>`;
        return;
    }
    
    // Update queue with filtered songs
    window.currentQueue = songs;
    
    grid.innerHTML = songs.map((song, index) => `
        <div class="song-card ${song.liked ? 'liked' : ''}" data-song-id="${song.songId}" onclick="playSongByIndex(${index})" oncontextmenu="showContextMenu(event, this, 'song'); return false;">
            <div class="song-artwork">
                ${song.customImage || song.albumArt ? 
                    `<img src="${song.customImage || song.albumArt}" alt="Album art">` :
                    `<div class="vinyl-disc">
                        <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                        </svg>
                    </div>`
                }
                <div class="play-overlay">
                    <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
            </div>
            <div class="song-info">
                <div class="song-title">${escapeHtml(song.title || 'Unknown Title')}</div>
                <div class="song-artist">${escapeHtml(song.customArtist || song.artist || 'Unknown Artist')}</div>
            </div>
            <button class="like-btn ${song.liked ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLike(${song.songId})" title="Like">
                <svg viewBox="0 0 24 24" fill="${song.liked ? 'var(--primary)' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
            </button>
            <div class="song-duration">${formatDuration(song.duration || 0)}</div>
        </div>
    `).join('');
}

// Override loadLibrary to store songs
const originalLoadLibrary = window.loadLibrary;
window.loadLibrary = async function() {
    try {
        const response = await fetch('/api/library/songs');
        const result = await response.json();
        
        if (result.success) {
            allSongs = result.songs;
            applySortAndFilter();
            updateLibraryStats();
        }
    } catch (error) {
        console.error('Error loading library:', error);
    }
};

// ============================================
// 3. RECENTLY PLAYED SECTION
// ============================================

async function loadRecentlyPlayed() {
    try {
        const response = await fetch('/api/library/recent');
        const result = await response.json();
        
        if (result.success && result.songs.length > 0) {
            displayRecentlyPlayed(result.songs);
        }
    } catch (error) {
        console.error('Error loading recently played:', error);
    }
}

function displayRecentlyPlayed(songs) {
    // Check if recently played section exists, if not create it
    let recentSection = document.getElementById('recently-played-section');
    
    if (!recentSection) {
        const libraryTab = document.getElementById('library-tab');
        const contentHeader = libraryTab.querySelector('.content-header');
        
        recentSection = document.createElement('div');
        recentSection.id = 'recently-played-section';
        recentSection.className = 'recently-played-section';
        contentHeader.insertAdjacentElement('afterend', recentSection);
    }
    
    recentSection.style.display = 'block';
    recentSection.innerHTML = `
        <div class="section-header">
            <h3>🕐 Recently Played</h3>
            <button class="btn-link-small" onclick="toggleRecentlyPlayed()" id="recent-toggle-btn">Hide</button>
        </div>
        <div class="recent-songs-row" id="recent-songs-content">
            ${songs.slice(0, 6).map((song) => `
                <div class="recent-song-card" onclick="playSongById(${song.songId})">
                    <div class="recent-song-art">
                        ${song.customImage || song.albumArt ? 
                            `<img src="${song.customImage || song.albumArt}" alt="">` :
                            `<div class="recent-song-placeholder">🎵</div>`
                        }
                    </div>
                    <div class="recent-song-title">${escapeHtml(song.title || 'Unknown')}</div>
                    <div class="recent-song-artist">${escapeHtml(song.artist || 'Unknown')}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ============================================
// 4. FAVORITES / LIKED SONGS
// ============================================

async function toggleLike(songId) {
    try {
        const response = await fetch(`/api/songs/${songId}/like`, { method: 'POST' });
        const result = await response.json();
        
        if (result.success) {
            // Update local data
            const song = allSongs.find(s => s.songId === songId);
            if (song) song.liked = result.liked;
            
            // Update UI
            const songCard = document.querySelector(`[data-song-id="${songId}"]`);
            if (songCard) {
                const likeBtn = songCard.querySelector('.like-btn');
                const svg = likeBtn.querySelector('svg');
                
                if (result.liked) {
                    likeBtn.classList.add('liked');
                    songCard.classList.add('liked');
                    svg.setAttribute('fill', 'var(--primary)');
                    showNotification('Added to Liked Songs ❤️', 'success');
                } else {
                    likeBtn.classList.remove('liked');
                    songCard.classList.remove('liked');
                    svg.setAttribute('fill', 'none');
                    showNotification('Removed from Liked Songs', 'info');
                }
            }
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        showNotification('Failed to update', 'error');
    }
}

function likeCurrentSong() {
    if (window.currentQueue && window.currentQueue.length > 0 && window.currentQueueIndex >= 0) {
        const currentSong = window.currentQueue[window.currentQueueIndex];
        if (currentSong && currentSong.songId) {
            toggleLike(currentSong.songId);
        }
    }
}

async function loadLikedSongs() {
    try {
        const response = await fetch('/api/library/liked');
        const result = await response.json();
        
        if (result.success) {
            return result.songs;
        }
    } catch (error) {
        console.error('Error loading liked songs:', error);
    }
    return [];
}

// ============================================
// 5. SLEEP TIMER
// ============================================

let sleepTimerId = null;
let sleepTimeRemaining = 0;

function setupSleepTimer() {
    // Sleep timer is now in the sidebar (HTML), no dynamic creation needed
    console.log('[Features] Sleep timer enabled');
}

function updateSidebarSleepTimer() {
    const countdown = document.getElementById('sleep-timer-countdown');
    const timeDisplay = document.getElementById('sidebar-sleep-time');
    const timerSection = document.getElementById('sidebar-sleep-timer');
    
    if (sleepTimerId && sleepTimeRemaining > 0) {
        if (countdown) countdown.style.display = 'flex';
        if (timeDisplay) timeDisplay.textContent = formatSleepTime(sleepTimeRemaining);
        if (timerSection) timerSection.classList.add('active');
    } else {
        if (countdown) countdown.style.display = 'none';
        if (timerSection) timerSection.classList.remove('active');
    }
}

function showSleepTimerModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'sleep-timer-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 350px;">
            <div class="modal-header">
                <h2>⏰ Sleep Timer</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                ${sleepTimerId ? `
                    <div class="sleep-timer-active">
                        <p>Timer active: <strong id="sleep-time-display">${formatSleepTime(sleepTimeRemaining)}</strong></p>
                        <button class="btn-secondary" onclick="cancelSleepTimer()">Cancel Timer</button>
                    </div>
                ` : `
                    <p style="margin-bottom: 1rem; color: var(--text-secondary);">Stop playback after:</p>
                    <div class="sleep-timer-options">
                        <button class="sleep-option-btn" onclick="setSleepTimer(5)">5 min</button>
                        <button class="sleep-option-btn" onclick="setSleepTimer(15)">15 min</button>
                        <button class="sleep-option-btn" onclick="setSleepTimer(30)">30 min</button>
                        <button class="sleep-option-btn" onclick="setSleepTimer(45)">45 min</button>
                        <button class="sleep-option-btn" onclick="setSleepTimer(60)">1 hour</button>
                        <button class="sleep-option-btn" onclick="setSleepTimer(90)">1.5 hours</button>
                    </div>
                    <div class="sleep-custom" style="margin-top: 1rem;">
                        <input type="number" id="custom-sleep-minutes" placeholder="Custom minutes" min="1" max="480" style="width: 100%;">
                        <button class="btn-primary" style="margin-top: 0.5rem; width: 100%;" onclick="setCustomSleepTimer()">Set Custom</button>
                    </div>
                `}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function setSleepTimer(minutes) {
    if (sleepTimerId) {
        clearInterval(sleepTimerId);
    }
    
    sleepTimeRemaining = minutes * 60;
    updateSidebarSleepTimer();
    
    sleepTimerId = setInterval(() => {
        sleepTimeRemaining--;
        
        // Update sidebar countdown
        updateSidebarSleepTimer();
        
        // Update display if modal is open
        const display = document.getElementById('sleep-time-display');
        if (display) display.textContent = formatSleepTime(sleepTimeRemaining);
        
        if (sleepTimeRemaining <= 0) {
            // Stop playback
            if (audioPlayer && !audioPlayer.paused) {
                audioPlayer.pause();
                if (typeof updatePlayButton === 'function') updatePlayButton();
            }
            
            cancelSleepTimer();
            showNotification('Sleep timer ended. Goodnight! 🌙', 'info');
        }
    }, 1000);
    
    closeModal();
    showNotification(`Sleep timer set for ${minutes} minutes ⏰`, 'success');
}

function setCustomSleepTimer() {
    const input = document.getElementById('custom-sleep-minutes');
    const minutes = parseInt(input.value);
    
    if (minutes && minutes > 0 && minutes <= 480) {
        setSleepTimer(minutes);
    } else {
        showNotification('Please enter 1-480 minutes', 'error');
    }
}

function cancelSleepTimer() {
    if (sleepTimerId) {
        clearInterval(sleepTimerId);
        sleepTimerId = null;
        sleepTimeRemaining = 0;
        
        updateSidebarSleepTimer();
        
        showNotification('Sleep timer cancelled', 'info');
    }
    closeModal();
}

function formatSleepTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setupKeyboardShortcuts();
    setupSortingAndFiltering();
    
    // Setup sleep timer after vinyl panel loads
    setTimeout(() => {
        setupSleepTimer();
    }, 1000);
    
    // Load recently played after login
    setTimeout(() => {
        if (document.getElementById('main-app').style.display !== 'none') {
            loadRecentlyPlayed();
        }
    }, 2000);
    
    console.log('[Features] All quick win features initialized');
});

// Toggle recently played visibility
let recentlyPlayedHidden = false;

function toggleRecentlyPlayed() {
    const section = document.getElementById('recently-played-section');
    const content = document.getElementById('recent-songs-content');
    const btn = section?.querySelector('.btn-link-small');
    
    if (!section || !content) return;
    
    recentlyPlayedHidden = !recentlyPlayedHidden;
    
    if (recentlyPlayedHidden) {
        content.style.display = 'none';
        if (btn) btn.textContent = 'Show';
    } else {
        content.style.display = 'flex';
        if (btn) btn.textContent = 'Hide';
    }
}

// Make functions global
window.toggleLike = toggleLike;
window.likeCurrentSong = likeCurrentSong;
window.loadLikedSongs = loadLikedSongs;
window.loadRecentlyPlayed = loadRecentlyPlayed;
window.toggleRecentlyPlayed = toggleRecentlyPlayed;

// Toggle recently played section visibility
function toggleRecentlyPlayed() {
    const section = document.getElementById('recently-played-section');
    const content = document.getElementById('recent-songs-content');
    const btn = document.getElementById('recent-toggle-btn');
    
    if (!section || !content || !btn) return;
    
    if (content.style.display === 'none') {
        content.style.display = 'flex';
        btn.textContent = 'Hide';
    } else {
        content.style.display = 'none';
        btn.textContent = 'Show';
    }
}
window.setSleepTimer = setSleepTimer;
window.setCustomSleepTimer = setCustomSleepTimer;
window.cancelSleepTimer = cancelSleepTimer;
window.showSleepTimerModal = showSleepTimerModal;
window.updateSidebarSleepTimer = updateSidebarSleepTimer;
window.toggleRecentlyPlayed = toggleRecentlyPlayed;
