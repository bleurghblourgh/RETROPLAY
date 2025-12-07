// RETROPLAY Web Application JavaScript

let currentUser = null;
let audioPlayer = null;
let currentQueue = [];
let currentQueueIndex = 0;
let isPlaying = false;
let isShuffled = false;
let repeatMode = 'off'; // 'off', 'one', 'all'

// Utility function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make it global
window.escapeHtml = escapeHtml;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Setup event listeners first
    setupAuthListeners();
    setupNavigationListeners();
    setupUploadListeners();
    setupPlayerListeners();
    setupSettingsListeners();
    setupContextMenus();
    
    // Check for existing session
    checkExistingSession();
}

// Check if user is already logged in
async function checkExistingSession() {
    try {
        const response = await fetch('/api/auth/check');
        const result = await response.json();
        
        if (result.success && result.user) {
            // User is already logged in
            currentUser = result.user;
            document.getElementById('loading-screen').style.display = 'none';
            showMainApp();
        } else {
            // No session, show login
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('login-screen').style.display = 'block';
        }
    } catch (error) {
        console.error('Session check error:', error);
        // On error, show login screen
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('login-screen').style.display = 'block';
    }
}

// Socket.IO removed - not needed for basic functionality

// Authentication
function setupAuthListeners() {
    const authForm = document.getElementById('auth-form');
    const switchModeBtn = document.getElementById('switch-mode');
    
    authForm.addEventListener('submit', handleAuth);
    switchModeBtn.addEventListener('click', toggleAuthMode);
}

async function handleAuth(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    const isRegister = document.getElementById('email-group').style.display !== 'none';
    
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const data = isRegister ? { username, email, password } : { username, password };
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            if (isRegister) {
                showMessage('Registration successful! Please login.', 'success');
                toggleAuthMode();
            } else {
                currentUser = result.user;
                showMainApp();
            }
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage('Connection error. Please try again.', 'error');
    }
}

function toggleAuthMode() {
    const emailGroup = document.getElementById('email-group');
    const authTitle = document.getElementById('auth-title');
    const authSubmit = document.getElementById('auth-submit');
    const switchText = document.getElementById('switch-text');
    const switchMode = document.getElementById('switch-mode');
    
    if (emailGroup.style.display === 'none') {
        // Switch to register
        emailGroup.style.display = 'block';
        authTitle.textContent = 'Create Account';
        authSubmit.textContent = 'Register';
        switchText.textContent = 'Already have an account?';
        switchMode.textContent = 'Login';
    } else {
        // Switch to login
        emailGroup.style.display = 'none';
        authTitle.textContent = 'Welcome Back';
        authSubmit.textContent = 'Login';
        switchText.textContent = "Don't have an account?";
        switchMode.textContent = 'Register';
    }
}

function showMessage(message, type) {
    const messageEl = document.getElementById('auth-message');
    messageEl.textContent = message;
    messageEl.className = `auth-message ${type}`;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

function showMainApp() {
    // Hide loading and login screens
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'none';
    // Show main app
    document.getElementById('main-app').style.display = 'grid';
    
    // Update user info
    if (currentUser) {
        document.getElementById('sidebar-username').textContent = currentUser.username || 'User';
        var settingsUsername = document.getElementById('settings-username');
        var settingsEmail = document.getElementById('settings-email');
        if (settingsUsername) settingsUsername.textContent = currentUser.username || '';
        if (settingsEmail) settingsEmail.textContent = currentUser.email || '';
    }
    
    // Load initial data
    loadLibrary();
    if (typeof loadPlaylists === 'function') loadPlaylists();
    if (typeof loadAlbums === 'function') loadAlbums();
    if (typeof loadUserProfile === 'function') loadUserProfile();
}

// Navigation
function setupNavigationListeners() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', logout);
}

function switchTab(tabName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tabName) {
            item.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load profile data when switching to profile tab
    if (tabName === 'profile') {
        loadProfileTab();
    }
}

async function loadProfileTab() {
    if (!currentUser) return;
    
    try {
        // Load profile data
        const profileResponse = await fetch('/api/profile');
        const profileResult = await profileResponse.json();
        
        if (profileResult.success) {
            const profile = profileResult.profile;
            
            // Update avatar
            const avatarDisplay = document.getElementById('profile-avatar-display');
            if (profile.profilePicture) {
                avatarDisplay.innerHTML = `<img src="${profile.profilePicture}" alt="Profile">`;
            } else {
                avatarDisplay.innerHTML = `<div class="avatar-placeholder-large">${profile.username.charAt(0).toUpperCase()}</div>`;
            }
            
            // Update basic info
            document.getElementById('profile-display-username').textContent = profile.username;
            document.getElementById('profile-display-email').textContent = profile.email;
            
            // Update bio
            const bioEl = document.getElementById('profile-display-bio');
            bioEl.textContent = profile.bio || 'No bio yet. Click "Edit Profile" to add one!';
            
            // Update genres
            const genresEl = document.getElementById('profile-display-genres');
            if (profile.favoriteGenres) {
                const genres = profile.favoriteGenres.split(',').map(g => g.trim()).filter(g => g);
                if (genres.length > 0) {
                    genresEl.innerHTML = genres.map(genre => 
                        `<span class="genre-tag">${escapeHtml(genre)}</span>`
                    ).join('');
                } else {
                    genresEl.innerHTML = '<span class="genre-tag">Not set</span>';
                }
            } else {
                genresEl.innerHTML = '<span class="genre-tag">Not set</span>';
            }
            
            // Update public badge
            const publicBadge = document.getElementById('profile-public-badge');
            if (profile.isPublic) {
                publicBadge.style.display = 'inline-flex';
            } else {
                publicBadge.style.display = 'none';
            }
        }
        
        // Load stats
        const statsResponse = await fetch('/api/profile/stats');
        const statsResult = await statsResponse.json();
        
        if (statsResult.success) {
            document.getElementById('profile-stat-songs').textContent = statsResult.stats.totalSongs || 0;
            document.getElementById('profile-stat-playlists').textContent = statsResult.stats.totalPlaylists || 0;
            document.getElementById('profile-stat-plays').textContent = statsResult.stats.totalPlays || 0;
        }
    } catch (error) {
        console.error('Error loading profile tab:', error);
    }
}

async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        currentUser = null;
        document.getElementById('main-app').style.display = 'none';
        document.getElementById('login-screen').style.display = 'block';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Library
async function loadLibrary() {
    console.log('loadLibrary called');
    try {
        const response = await fetch('/api/library/songs');
        console.log('Library response status:', response.status);
        const result = await response.json();
        console.log('Library result:', result);
        
        if (result.success) {
            console.log('Songs count:', result.songs.length);
            displaySongs(result.songs);
        } else {
            console.error('Library load failed:', result.message);
        }
    } catch (error) {
        console.error('Error loading library:', error);
    }
}

function displaySongs(songs) {
    const grid = document.getElementById('songs-grid');
    
    if (songs.length === 0) {
        grid.innerHTML = '<div class="empty-state">No songs yet. Upload some music!</div>';
        return;
    }
    
    // Store songs for playback queue
    currentQueue = songs;
    
    grid.innerHTML = songs.map((song, index) => `
        <div class="song-card" data-song-id="${song.songId}" onclick="playSongByIndex(${index})" oncontextmenu="showContextMenu(event, this, 'song'); return false;">
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
            <div class="song-duration">${formatDuration(song.duration || 0)}</div>
        </div>
    `).join('');
    
    updateLibraryStats();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDuration(seconds) {
    if (!seconds || seconds === 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Playlists - Functions moved to core-functions.js
// loadPlaylists() and displayPlaylists() are defined there

// Create playlist, closeModal, showNotification - moved to core-functions.js

// Upload
function setupUploadListeners() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });
}

function handleFileSelect(e) {
    handleFiles(e.target.files);
}

async function handleFiles(files) {
    const uploadQueue = document.getElementById('upload-queue');
    const uploadItems = document.getElementById('upload-items');
    const uploadCount = document.getElementById('upload-count');
    
    uploadQueue.style.display = 'block';
    uploadCount.textContent = `${files.length} file${files.length > 1 ? 's' : ''}`;
    
    for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const itemEl = document.createElement('div');
        itemEl.className = 'upload-item';
        itemEl.innerHTML = `
            <div class="upload-item-icon">
                <svg viewBox="0 0 24 24" fill="white">
                    <path d="M9 18V5l12-2v13M9 13l12-2"/>
                </svg>
            </div>
            <div class="upload-item-info">
                <div class="upload-name">${escapeHtml(file.name)}</div>
                <div class="upload-progress">
                    <div class="upload-bar"></div>
                </div>
                <div class="upload-status">Analyzing and uploading...</div>
            </div>
        `;
        uploadItems.appendChild(itemEl);
        
        try {
            const response = await fetch('/api/library/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                itemEl.querySelector('.upload-status').textContent = 'Complete!';
                itemEl.querySelector('.upload-status').classList.add('success');
                itemEl.querySelector('.upload-bar').style.width = '100%';
                
                // Show AI analysis if available
                if (result.analysis) {
                    const bpm = result.analysis.bpm;
                    const mood = result.analysis.mood;
                    if (bpm || mood) {
                        itemEl.querySelector('.upload-status').textContent = 
                            `Complete! ${bpm ? `BPM: ${bpm}` : ''} ${mood ? `Mood: ${mood}` : ''}`;
                    }
                }
                
                // Reload library
                setTimeout(() => {
                    loadLibrary();
                    updateLibraryStats();
                }, 1000);
            } else {
                itemEl.querySelector('.upload-status').textContent = 'Failed';
                itemEl.querySelector('.upload-status').classList.add('error');
            }
        } catch (error) {
            itemEl.querySelector('.upload-status').textContent = 'Error';
            itemEl.querySelector('.upload-status').classList.add('error');
        }
    }
}

async function updateLibraryStats() {
    try {
        const response = await fetch('/api/library/stats');
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('total-songs').textContent = result.stats.totalSongs || 0;
            document.getElementById('total-artists').textContent = result.stats.totalArtists || 0;
            document.getElementById('total-albums').textContent = result.stats.totalAlbums || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Player
function initializeAudioPlayer() {
    // Use the HTML audio element so vinyl panel can also access it
    audioPlayer = document.getElementById('audio-player');
    if (!audioPlayer) {
        // Fallback to creating new Audio if element doesn't exist
        audioPlayer = new Audio();
    }
    
    audioPlayer.addEventListener('ended', () => {
        if (repeatMode === 'one') {
            audioPlayer.currentTime = 0;
            audioPlayer.play();
        } else {
            playNext();
        }
    });
    
    audioPlayer.addEventListener('timeupdate', updateProgressBar);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
}

function setupPlayerListeners() {
    initializeAudioPlayer();
    
    document.getElementById('play-btn').addEventListener('click', togglePlay);
    document.getElementById('prev-btn').addEventListener('click', playPrevious);
    document.getElementById('next-btn').addEventListener('click', playNext);
    document.getElementById('shuffle-btn').addEventListener('click', toggleShuffle);
    document.getElementById('repeat-btn').addEventListener('click', toggleRepeat);
    
    // Volume control
    const volumeSlider = document.querySelector('.player-volume .volume-slider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            if (audioPlayer) {
                audioPlayer.volume = e.target.value / 100;
            }
        });
    }
}

function playSongByIndex(index) {
    if (!currentQueue || currentQueue.length === 0) return;
    
    // If clicking the currently playing song, toggle play/pause
    if (currentQueueIndex === index && audioPlayer && audioPlayer.src) {
        togglePlay();
        return;
    }
    
    currentQueueIndex = index;
    const song = currentQueue[index];
    playSong(song);
}

function playSong(song) {
    if (!audioPlayer) {
        console.error('Audio player not initialized');
        return;
    }
    
    console.log('Playing song:', song);
    
    // Update vinyl panel song info immediately (before play)
    if (window.vinylPanel) {
        console.log('Updating vinyl panel with song:', song.title);
        window.vinylPanel.updateSongInfo(song);
        window.vinylPanel.updateQueue(currentQueue, currentQueueIndex);
    }
    
    // Get the filename from the file path
    let filename = song.filePath || song.fileName;
    if (filename.includes('/') || filename.includes('\\')) {
        filename = filename.split(/[/\\]/).pop();
    }
    
    // Load and play
    audioPlayer.src = `/uploads/music/${filename}`;
    
    audioPlayer.play()
        .then(() => {
            isPlaying = true;
            updatePlayerUI(song);
            updatePlayButton();
            
            // The vinyl panel will auto-update via audio 'play' event listener
            // But also explicitly update visualizer
            if (window.vinylPanel && window.vinylPanel.visualizer) {
                window.vinylPanel.visualizer.setAlbumArt(song.customImage || song.albumArt);
                window.vinylPanel.visualizer.play();
            }
            
            // Legacy vinyl visualizer support
            if (window.vinylVisualizer) {
                window.vinylVisualizer.setAlbumArt(song.customImage || song.albumArt);
                window.vinylVisualizer.play();
            }
            
            console.log('Playback started successfully');
        })
        .catch(error => {
            // Only show error if it's not an autoplay policy issue
            // AbortError happens when play() is interrupted by a new play() call
            if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
                console.error('Playback error:', error);
                showNotification('Failed to play song', 'error');
            } else {
                console.log('Play interrupted or autoplay blocked:', error.name);
            }
            isPlaying = false;
            updatePlayButton();
        });
    
    // Track play count (don't wait for response)
    if (song.songId) {
        fetch(`/api/songs/${song.songId}/play`, { method: 'POST' }).catch(e => console.log('Play count error:', e));
    }
}

function togglePlay() {
    if (!audioPlayer || !audioPlayer.src) return;
    
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        if (window.vinylVisualizer) window.vinylVisualizer.pause();
        if (window.vinylPanel && window.vinylPanel.visualizer) {
            window.vinylPanel.visualizer.pause();
        }
    } else {
        audioPlayer.play();
        isPlaying = true;
        if (window.vinylVisualizer) window.vinylVisualizer.play();
        if (window.vinylPanel && window.vinylPanel.visualizer) {
            window.vinylPanel.visualizer.play();
        }
    }
    
    updatePlayButton();
}

function setupVolumeDisplay() {
    const volumeSlider = document.getElementById('player-volume');
    const volumeDisplay = document.getElementById('volume-display');
    
    if (volumeSlider && volumeDisplay) {
        volumeSlider.addEventListener('input', (e) => {
            volumeDisplay.textContent = `${e.target.value}%`;
        });
    }
}

function playPrevious() {
    if (currentQueue.length === 0) return;
    
    currentQueueIndex--;
    if (currentQueueIndex < 0) {
        currentQueueIndex = currentQueue.length - 1;
    }
    
    playSong(currentQueue[currentQueueIndex]);
}

function playNext() {
    if (currentQueue.length === 0) return;
    
    currentQueueIndex++;
    
    // If we've reached the end of the queue
    if (currentQueueIndex >= currentQueue.length) {
        if (repeatMode === 'all') {
            // Repeat all - go back to start
            currentQueueIndex = 0;
        } else {
            // Infinite shuffle - reshuffle the queue and continue playing
            shuffleQueue();
            currentQueueIndex = 0;
            console.log('Queue reshuffled for continuous playback');
        }
    }
    
    playSong(currentQueue[currentQueueIndex]);
}

// Shuffle the current queue (Fisher-Yates algorithm)
function shuffleQueue() {
    if (currentQueue.length <= 1) return;
    
    // Get the currently playing song to avoid playing it again immediately
    const currentSong = currentQueue[currentQueueIndex] || null;
    
    // Shuffle the array
    for (let i = currentQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentQueue[i], currentQueue[j]] = [currentQueue[j], currentQueue[i]];
    }
    
    // If the current song ended up at position 0, swap it to avoid immediate repeat
    if (currentSong && currentQueue[0] && currentQueue[0].songId === currentSong.songId && currentQueue.length > 1) {
        const randomIndex = Math.floor(Math.random() * (currentQueue.length - 1)) + 1;
        [currentQueue[0], currentQueue[randomIndex]] = [currentQueue[randomIndex], currentQueue[0]];
    }
    
    // Update the vinyl panel queue display
    if (window.vinylPanel) {
        window.vinylPanel.updateQueue(currentQueue, -1); // -1 so it shows from index 0
    }
}

function toggleShuffle() {
    isShuffled = !isShuffled;
    const shuffleBtn = document.getElementById('shuffle-btn');
    const vinylShuffleBtn = document.getElementById('vinyl-shuffle-btn');
    
    shuffleBtn?.classList.toggle('active', isShuffled);
    vinylShuffleBtn?.classList.toggle('active', isShuffled);
    
    // If shuffle is enabled, shuffle the queue now (keeping current song)
    if (isShuffled && currentQueue.length > 1) {
        const currentSong = currentQueue[currentQueueIndex];
        
        // Remove current song from queue temporarily
        const otherSongs = currentQueue.filter((_, i) => i !== currentQueueIndex);
        
        // Shuffle the other songs
        for (let i = otherSongs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]];
        }
        
        // Put current song at the beginning, followed by shuffled songs
        currentQueue = [currentSong, ...otherSongs];
        currentQueueIndex = 0;
        
        // Update queue display
        if (window.vinylPanel) {
            window.vinylPanel.updateQueue(currentQueue, currentQueueIndex);
        }
        
        showNotification('Queue shuffled!', 'success');
    }
}

function toggleRepeat() {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    repeatMode = modes[(currentIndex + 1) % modes.length];
    
    const repeatBtn = document.getElementById('repeat-btn');
    repeatBtn.classList.toggle('active', repeatMode !== 'off');
    repeatBtn.dataset.mode = repeatMode;
}

function updatePlayerUI(song) {
    document.getElementById('player-title').textContent = song.title;
    document.getElementById('player-artist').textContent = song.artist;
}

function updatePlayButton() {
    const playBtn = document.getElementById('play-btn');
    const icon = playBtn.querySelector('svg path');
    
    if (isPlaying) {
        // Pause icon
        icon.setAttribute('d', 'M6 4h4v16H6V4zm8 0h4v16h-4V4z');
    } else {
        // Play icon
        icon.setAttribute('d', 'M8 5v14l11-7z');
    }
}

function updateProgressBar() {
    if (!audioPlayer || !audioPlayer.duration) return;
    
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    
    // Update time displays
    const currentTimeEl = document.getElementById('time-current');
    const totalTimeEl = document.getElementById('time-total');
    
    if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    }
    if (totalTimeEl && audioPlayer.duration) {
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
    }
}

function updateDuration() {
    if (!audioPlayer || !audioPlayer.duration) return;
    
    const totalTimeEl = document.getElementById('time-total');
    if (totalTimeEl) {
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
    }
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Settings
function setupSettingsListeners() {
    const themeSelect = document.getElementById('theme-select');
    
    if (themeSelect) {
        themeSelect.addEventListener('change', async (e) => {
            const theme = e.target.value;
            await fetch('/api/settings/theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme })
            });
            applyTheme(theme);
        });
    }
    
    // Settings tab switching
    const settingsTabBtns = document.querySelectorAll('.settings-tab-btn');
    settingsTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.settingsTab;
            
            // Update buttons
            settingsTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update panels
            document.querySelectorAll('.settings-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            document.getElementById(`${tabName}-settings`).classList.add('active');
        });
    });
    
    // Crossfade slider
    const crossfadeSlider = document.getElementById('crossfade-slider');
    const crossfadeValue = document.getElementById('crossfade-value');
    if (crossfadeSlider && crossfadeValue) {
        crossfadeSlider.addEventListener('input', (e) => {
            crossfadeValue.textContent = `${e.target.value}s`;
        });
    }
}

// Theme is handled by inline script in index.html - do not override applyTheme here

// Play song by ID
function playSongById(songId) {
    const song = currentQueue.find(s => s.songId === songId);
    if (song) {
        const index = currentQueue.indexOf(song);
        currentQueueIndex = index;
        playSong(song);
    }
}

// Make functions global for onclick handlers
window.switchTab = switchTab;
window.playSongById = playSongById;
window.playSongByIndex = playSongByIndex;
window.loadLibrary = loadLibrary;
window.playSong = playSong;
window.shuffleQueue = shuffleQueue;
window.toggleShuffle = toggleShuffle;
// Note: currentQueue and currentQueueIndex are accessed via window in other files
// Note: closeModal, showNotification, loadPlaylists, loadAlbums are in core-functions.js

// Keep queue references updated
Object.defineProperty(window, 'currentQueue', {
    get: function() { return currentQueue; },
    set: function(val) { currentQueue = val; }
});
Object.defineProperty(window, 'currentQueueIndex', {
    get: function() { return currentQueueIndex; },
    set: function(val) { currentQueueIndex = val; }
});


// Settings Tab Switching
document.addEventListener('DOMContentLoaded', () => {
    const settingsTabBtns = document.querySelectorAll('.settings-tab-btn');
    
    settingsTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.settingsTab;
            
            // Update buttons
            settingsTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update panels
            document.querySelectorAll('.settings-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            document.getElementById(`${tabName}-settings`).classList.add('active');
        });
    });
    
    // Crossfade slider
    const crossfadeSlider = document.getElementById('crossfade-slider');
    const crossfadeValue = document.getElementById('crossfade-value');
    if (crossfadeSlider && crossfadeValue) {
        crossfadeSlider.addEventListener('input', (e) => {
            crossfadeValue.textContent = `${e.target.value}s`;
        });
    }
});


// Load Profile Tab Data
async function loadProfileTab() {
    try {
        // Load profile info
        const profileResponse = await fetch('/api/profile');
        const profileResult = await profileResponse.json();
        
        if (profileResult.success) {
            const profile = profileResult.profile;
            
            // Update profile display
            document.getElementById('profile-display-username').textContent = profile.username;
            document.getElementById('profile-display-email').textContent = profile.email;
            
            // Update avatar
            const avatarDisplay = document.getElementById('profile-avatar-display');
            if (profile.profilePicture) {
                avatarDisplay.innerHTML = `<img src="${profile.profilePicture}" alt="Profile">`;
            } else {
                avatarDisplay.innerHTML = `<div class="avatar-placeholder-large">${profile.username.charAt(0).toUpperCase()}</div>`;
            }
            
            // Update bio
            const bioElement = document.getElementById('profile-display-bio');
            if (profile.bio && profile.bio.trim()) {
                bioElement.textContent = profile.bio;
            } else {
                bioElement.textContent = 'No bio yet. Click "Edit Profile" to add one!';
            }
            
            // Update genres
            const genresElement = document.getElementById('profile-display-genres');
            if (profile.favoriteGenres && profile.favoriteGenres.trim()) {
                const genres = profile.favoriteGenres.split(',').map(g => g.trim());
                genresElement.innerHTML = genres.map(genre => 
                    `<span class="genre-tag">${escapeHtml(genre)}</span>`
                ).join('');
            } else {
                genresElement.innerHTML = '<span class="genre-tag">Not set</span>';
            }
            
            // Update public badge
            const publicBadge = document.getElementById('profile-public-badge');
            if (profile.isPublic) {
                publicBadge.style.display = 'inline-flex';
            } else {
                publicBadge.style.display = 'none';
            }
            
            // Update sidebar avatar
            const sidebarAvatar = document.getElementById('sidebar-avatar');
            if (profile.profilePicture) {
                sidebarAvatar.style.backgroundImage = `url(${profile.profilePicture})`;
                sidebarAvatar.style.backgroundSize = 'cover';
                sidebarAvatar.textContent = '';
            } else {
                sidebarAvatar.textContent = profile.username.charAt(0).toUpperCase();
            }
            
            // Update sidebar username
            document.getElementById('sidebar-username').textContent = profile.username;
        }
        
        // Load stats
        const statsResponse = await fetch('/api/profile/stats');
        const statsResult = await statsResponse.json();
        
        if (statsResult.success) {
            const stats = statsResult.stats;
            document.getElementById('profile-stat-songs').textContent = stats.totalSongs || 0;
            document.getElementById('profile-stat-playlists').textContent = stats.totalPlaylists || 0;
            document.getElementById('profile-stat-plays').textContent = stats.totalPlays || 0;
        }
        
    } catch (error) {
        console.error('Error loading profile tab:', error);
        showNotification('Failed to load profile', 'error');
    }
}

// Call loadProfileTab when profile tab is opened
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener to profile nav button
    const profileNavBtn = document.querySelector('[data-tab="profile"]');
    if (profileNavBtn) {
        profileNavBtn.addEventListener('click', () => {
            loadProfileTab();
        });
    }
});


// Load playlists when tab is opened
document.addEventListener('DOMContentLoaded', () => {
    const playlistsBtn = document.querySelector('[data-tab="playlists"]');
    if (playlistsBtn) {
        playlistsBtn.addEventListener('click', () => {
            loadPlaylists();
        });
    }
    
    // Load albums when tab is opened
    const albumsBtn = document.querySelector('[data-tab="albums"]');
    if (albumsBtn) {
        albumsBtn.addEventListener('click', () => {
            loadAlbums();
        });
    }
});


// closeModal and showNotification are defined in core-functions.js

// Initialize vinyl panel when app loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize vinyl panel after a short delay to ensure DOM is ready
    setTimeout(() => {
        if (typeof initVinylPanel === 'function') {
            initVinylPanel();
        }
    }, 500);
});

// Make playPrevious and playNext global for vinyl panel
window.playPrevious = playPrevious;
window.playNext = playNext;
