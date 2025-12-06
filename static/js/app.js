// RETROPLAY Web Application JavaScript

let currentUser = null;
let socket = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Hide loading screen after 1 second
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('login-screen').style.display = 'block';
    }, 1000);
    
    // Setup event listeners
    setupAuthListeners();
    setupNavigationListeners();
    setupUploadListeners();
    setupPlayerListeners();
    setupSettingsListeners();
    
    // Initialize Socket.IO
    initializeSocket();
}

function initializeSocket() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('connected', (data) => {
        console.log(data.message);
    });
}

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
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'grid';
    
    // Update user info
    document.getElementById('sidebar-username').textContent = currentUser.username;
    document.getElementById('settings-username').textContent = currentUser.username;
    document.getElementById('settings-email').textContent = currentUser.email;
    
    // Load initial data
    loadLibrary();
    loadPlaylists();
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
    try {
        const response = await fetch('/api/library/songs');
        const result = await response.json();
        
        if (result.success) {
            displaySongs(result.songs);
        }
    } catch (error) {
        console.error('Error loading library:', error);
    }
}

function displaySongs(songs) {
    const grid = document.getElementById('songs-grid');
    
    if (songs.length === 0) {
        return; // Show empty state
    }
    
    grid.innerHTML = songs.map(song => `
        <div class="song-card" data-song-id="${song.songId}" onclick="playSong(${song.songId})">
            <div class="song-artwork">
                <div class="play-overlay">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
            </div>
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
        </div>
    `).join('');
}

// Playlists
async function loadPlaylists() {
    try {
        const response = await fetch('/api/playlists');
        const result = await response.json();
        
        if (result.success) {
            displayPlaylists(result.playlists);
        }
    } catch (error) {
        console.error('Error loading playlists:', error);
    }
}

function displayPlaylists(playlists) {
    const grid = document.getElementById('playlists-grid');
    
    if (playlists.length === 0) {
        return; // Show empty state
    }
    
    grid.innerHTML = playlists.map(playlist => `
        <div class="playlist-card" data-playlist-id="${playlist.playlistId}">
            <div class="playlist-icon"></div>
            <div class="playlist-info">
                <div class="playlist-name">${playlist.playlistName}</div>
                <div class="playlist-description">${playlist.description || ''}</div>
            </div>
        </div>
    `).join('');
}

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
    
    uploadQueue.style.display = 'block';
    
    for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const itemEl = document.createElement('div');
        itemEl.className = 'upload-item';
        itemEl.innerHTML = `
            <div class="upload-name">${file.name}</div>
            <div class="upload-progress">
                <div class="upload-bar"></div>
            </div>
            <div class="upload-status">Uploading...</div>
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
                itemEl.querySelector('.upload-bar').style.width = '100%';
                
                // Reload library
                setTimeout(() => loadLibrary(), 1000);
            } else {
                itemEl.querySelector('.upload-status').textContent = 'Failed';
            }
        } catch (error) {
            itemEl.querySelector('.upload-status').textContent = 'Error';
        }
    }
}

// Player State
let audioPlayer = null;
let currentQueue = [];
let currentQueueIndex = 0;
let isPlaying = false;
let isShuffled = false;
let repeatMode = 'off'; // 'off', 'one', 'all'

function initializeAudioPlayer() {
    audioPlayer = new Audio();
    
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

// Player
function setupPlayerListeners() {
    initializeAudioPlayer();
    
    document.getElementById('play-btn').addEventListener('click', togglePlay);
    document.getElementById('prev-btn').addEventListener('click', playPrevious);
    document.getElementById('next-btn').addEventListener('click', playNext);
    document.getElementById('shuffle-btn').addEventListener('click', toggleShuffle);
    document.getElementById('repeat-btn').addEventListener('click', toggleRepeat);
    
    // Volume control
    const volumeSlider = document.querySelector('.player-volume .volume-slider');
    volumeSlider.addEventListener('input', (e) => {
        if (audioPlayer) {
            audioPlayer.volume = e.target.value / 100;
        }
    });
}

function playSong(song, queue = null) {
    if (!audioPlayer) return;
    
    // Set queue if provided
    if (queue) {
        currentQueue = queue;
        currentQueueIndex = queue.findIndex(s => s.songId === song.songId);
    }
    
    // Load and play
    audioPlayer.src = `/uploads/music/${song.filePath.split('/').pop()}`;
    audioPlayer.play();
    isPlaying = true;
    
    // Update UI
    updatePlayerUI(song);
    updatePlayButton();
    
    // Track play count
    fetch(`/api/songs/${song.songId}/play`, { method: 'POST' });
}

function togglePlay() {
    if (!audioPlayer || !audioPlayer.src) return;
    
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
    } else {
        audioPlayer.play();
        isPlaying = true;
    }
    
    updatePlayButton();
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
    if (currentQueueIndex >= currentQueue.length) {
        if (repeatMode === 'all') {
            currentQueueIndex = 0;
        } else {
            isPlaying = false;
            updatePlayButton();
            return;
        }
    }
    
    playSong(currentQueue[currentQueueIndex]);
}

function toggleShuffle() {
    console.log('Toggle shuffle');
}

function toggleRepeat() {
    console.log('Toggle repeat');
}

// Settings
function setupSettingsListeners() {
    const themeSelect = document.getElementById('theme-select');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');
    
    themeSelect.addEventListener('change', async (e) => {
        const theme = e.target.value;
        await fetch('/api/settings/theme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme })
        });
    });
    
    volumeSlider.addEventListener('input', (e) => {
        volumeValue.textContent = `${e.target.value}%`;
    });
}

// Make switchTab global for onclick handlers
window.switchTab = switchTab;
