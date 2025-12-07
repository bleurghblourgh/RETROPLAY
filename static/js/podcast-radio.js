// ========== PODCAST SUPPORT & RADIO MODE ==========

// ========== PODCAST MANAGER ==========
class PodcastManager {
    constructor() {
        this.podcasts = [];
        this.currentPodcast = null;
        this.playbackPositions = {}; // Store positions by podcast ID
        this.playbackSpeed = 1.0;
    }

    init() {
        this.loadPlaybackPositions();
        this.setupSpeedControl();
        this.setupSkipButtons();
        console.log('[Podcast] Manager initialized');
    }

    loadPlaybackPositions() {
        try {
            const saved = localStorage.getItem('podcastPositions');
            if (saved) {
                this.playbackPositions = JSON.parse(saved);
            }
        } catch (e) {
            console.log('[Podcast] Could not load positions');
        }
    }

    savePlaybackPosition(podcastId, position) {
        this.playbackPositions[podcastId] = position;
        try {
            localStorage.setItem('podcastPositions', JSON.stringify(this.playbackPositions));
        } catch (e) {}
    }

    getPlaybackPosition(podcastId) {
        return this.playbackPositions[podcastId] || 0;
    }

    setPlaybackSpeed(speed) {
        this.playbackSpeed = Math.max(0.5, Math.min(2.0, speed));
        const audio = document.getElementById('audio-player');
        if (audio) {
            audio.playbackRate = this.playbackSpeed;
        }
        this.updateSpeedDisplay();
        localStorage.setItem('podcastSpeed', this.playbackSpeed);
    }

    updateSpeedDisplay() {
        const display = document.getElementById('speed-display');
        if (display) {
            display.textContent = this.playbackSpeed.toFixed(1) + 'x';
        }
    }

    setupSpeedControl() {
        // Load saved speed
        const saved = localStorage.getItem('podcastSpeed');
        if (saved) {
            this.playbackSpeed = parseFloat(saved);
        }
    }

    setupSkipButtons() {
        // Skip buttons are set up in the UI
    }

    skip(seconds) {
        const audio = document.getElementById('audio-player');
        if (audio) {
            audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
        }
    }

    markAsPodcast(songId) {
        // Mark a song as a podcast episode
        fetch(`/api/songs/${songId}/podcast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPodcast: true })
        }).catch(e => console.log('Could not mark as podcast'));
    }
}

// ========== RADIO MODE ==========
class RadioMode {
    constructor() {
        this.isActive = false;
        this.seedSong = null;
        this.radioQueue = [];
        this.playedSongs = new Set();
    }

    init() {
        this.addRadioButton();
        console.log('[Radio] Mode initialized');
    }

    addRadioButton() {
        // Add "Start Radio" to context menu options
        if (window.contextMenuOptions) {
            window.contextMenuOptions.push({
                label: '📻 Start Radio',
                action: (song) => this.startRadio(song)
            });
        }
    }

    async startRadio(seedSong) {
        this.isActive = true;
        this.seedSong = seedSong;
        this.radioQueue = [];
        this.playedSongs.clear();
        this.playedSongs.add(seedSong.id);

        showNotification('📻 Radio started from: ' + seedSong.title, 'success');

        // Play the seed song first
        if (typeof window.playSong === 'function') {
            window.playSong(seedSong);
        }

        // Queue similar songs
        await this.queueSimilarSongs();

        // Listen for song end to auto-queue more
        const audio = document.getElementById('audio-player');
        if (audio) {
            audio.addEventListener('ended', () => this.onSongEnded());
        }
    }

    async queueSimilarSongs() {
        if (!this.seedSong || !this.isActive) return;

        try {
            // Get all songs
            const response = await fetch('/api/library/songs');
            const data = await response.json();
            if (!data.success || !data.songs) return;

            const allSongs = data.songs;
            const similar = this.findSimilarSongs(allSongs, this.seedSong);

            // Add to radio queue
            this.radioQueue = similar.filter(s => !this.playedSongs.has(s.id)).slice(0, 20);
            
            console.log('[Radio] Queued', this.radioQueue.length, 'similar songs');
        } catch (e) {
            console.log('[Radio] Error queuing songs:', e);
        }
    }

    findSimilarSongs(allSongs, seedSong) {
        // Score songs by similarity
        const scored = allSongs.map(song => {
            let score = 0;

            // Same artist = high score
            if (song.artist && seedSong.artist && 
                song.artist.toLowerCase() === seedSong.artist.toLowerCase()) {
                score += 50;
            }

            // Same album = medium score
            if (song.album && seedSong.album && 
                song.album.toLowerCase() === seedSong.album.toLowerCase()) {
                score += 30;
            }

            // Similar genre (if available)
            if (song.genre && seedSong.genre && 
                song.genre.toLowerCase() === seedSong.genre.toLowerCase()) {
                score += 40;
            }

            // Similar duration (within 60 seconds)
            if (song.duration && seedSong.duration) {
                const diff = Math.abs(song.duration - seedSong.duration);
                if (diff < 60) score += 20;
                else if (diff < 120) score += 10;
            }

            // Add some randomness
            score += Math.random() * 15;

            return { song, score };
        });

        // Sort by score and return songs
        return scored
            .filter(s => s.song.id !== seedSong.id)
            .sort((a, b) => b.score - a.score)
            .map(s => s.song);
    }

    onSongEnded() {
        if (!this.isActive) return;

        if (this.radioQueue.length > 0) {
            const nextSong = this.radioQueue.shift();
            this.playedSongs.add(nextSong.id);
            
            if (typeof window.playSong === 'function') {
                window.playSong(nextSong);
            }

            // Queue more if running low
            if (this.radioQueue.length < 5) {
                this.queueSimilarSongs();
            }
        } else {
            // No more songs, try to queue more
            this.queueSimilarSongs().then(() => {
                if (this.radioQueue.length > 0) {
                    this.onSongEnded();
                } else {
                    this.stopRadio();
                    showNotification('📻 Radio ended - no more similar songs', 'info');
                }
            });
        }
    }

    stopRadio() {
        this.isActive = false;
        this.seedSong = null;
        this.radioQueue = [];
        showNotification('📻 Radio stopped', 'info');
    }
}

// ========== PLAYBACK CONTROLS UI ==========
function addPodcastControls() {
    // Add speed and skip controls to the player
    const vinylControls = document.querySelector('.vinyl-controls');
    if (!vinylControls) return;

    // Check if already added
    if (document.getElementById('podcast-controls')) return;

    const controls = document.createElement('div');
    controls.id = 'podcast-controls';
    controls.className = 'podcast-controls';
    controls.innerHTML = `
        <button class="podcast-btn skip-btn" onclick="window.podcastManager.skip(-15)" title="Skip back 15s">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 4v6h6M12 20a8 8 0 1 0 0-16 8 8 0 0 0-6 2.7L1 10"/>
                <text x="12" y="14" font-size="6" fill="currentColor" text-anchor="middle">15</text>
            </svg>
        </button>
        <button class="podcast-btn speed-btn" onclick="cycleSpeed()" title="Playback speed">
            <span id="speed-display">1.0x</span>
        </button>
        <button class="podcast-btn skip-btn" onclick="window.podcastManager.skip(30)" title="Skip forward 30s">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6M12 20a8 8 0 1 1 0-16 8 8 0 0 1 6 2.7L23 10"/>
                <text x="12" y="14" font-size="6" fill="currentColor" text-anchor="middle">30</text>
            </svg>
        </button>
    `;

    vinylControls.parentNode.insertBefore(controls, vinylControls.nextSibling);
}

function cycleSpeed() {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
    const current = window.podcastManager.playbackSpeed;
    const idx = speeds.indexOf(current);
    const next = speeds[(idx + 1) % speeds.length];
    window.podcastManager.setPlaybackSpeed(next);
}

// Add Radio button to song cards
function addRadioButtonToCards() {
    // This is handled via context menu
}

// ========== STYLES ==========
const podcastStyles = document.createElement('style');
podcastStyles.textContent = `
.podcast-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
}

.podcast-btn {
    width: 36px;
    height: 36px;
    background: var(--bg-dark);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.podcast-btn:hover {
    background: var(--bg-light);
    color: var(--primary);
    border-color: var(--primary);
}

.podcast-btn svg {
    width: 18px;
    height: 18px;
}

.speed-btn {
    width: auto;
    padding: 0 0.75rem;
    font-size: 12px;
    font-weight: 600;
}

.radio-indicator {
    position: fixed;
    bottom: 100px;
    right: 20px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
    padding: 0.75rem 1.25rem;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);
    z-index: 1000;
    cursor: pointer;
}

.radio-indicator:hover {
    transform: scale(1.05);
}

.radio-pulse {
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    animation: radioPulse 1s ease-in-out infinite;
}

@keyframes radioPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
}
`;
document.head.appendChild(podcastStyles);

// ========== PODCASTS TAB ==========
function setupPodcastsTab() {
    // Speed selector buttons
    document.querySelectorAll('.speed-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const speed = parseFloat(btn.dataset.speed);
            window.podcastManager.setPlaybackSpeed(speed);
            document.querySelectorAll('.speed-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Setup podcast upload zone
    setupPodcastUpload();
    
    // Load podcasts
    loadPodcastEpisodes();
    loadContinueListening();
}

function setupPodcastUpload() {
    const dropZone = document.getElementById('podcast-drop-zone');
    const fileInput = document.getElementById('podcast-file-input');
    
    if (!dropZone || !fileInput) return;
    
    // Click to upload
    dropZone.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            uploadPodcasts(e.target.files);
        }
    });
    
    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            uploadPodcasts(e.dataTransfer.files);
        }
    });
}

async function uploadPodcasts(files) {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('audio/'));
    
    if (validFiles.length === 0) {
        showNotification('Please select audio files', 'error');
        return;
    }
    
    showNotification(`Uploading ${validFiles.length} podcast(s)...`, 'info');
    
    let uploaded = 0;
    for (const file of validFiles) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('isPodcast', 'true'); // Mark as podcast
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            if (result.success) {
                uploaded++;
                // Mark as podcast in database
                if (result.songId) {
                    await fetch(`/api/songs/${result.songId}/podcast`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isPodcast: true })
                    }).catch(() => {});
                }
            }
        } catch (e) {
            console.log('[Podcast] Upload error:', e);
        }
    }
    
    if (uploaded > 0) {
        showNotification(`Uploaded ${uploaded} podcast(s)!`, 'success');
        loadPodcastEpisodes();
    } else {
        showNotification('Failed to upload podcasts', 'error');
    }
}

async function loadPodcastEpisodes() {
    try {
        const response = await fetch('/api/library/songs');
        const data = await response.json();
        if (!data.success || !data.songs) return;
        
        // Filter for podcasts (marked as podcast OR longer than 10 minutes)
        const podcasts = data.songs.filter(s => s.isPodcast || (s.duration && s.duration > 600));
        
        const container = document.getElementById('podcast-episodes');
        if (!container) return;
        
        if (podcasts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No podcasts yet</p>
                    <p class="subtitle">Upload podcasts above to see them here</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = podcasts.map(ep => `
            <div class="podcast-episode" onclick="playPodcastEpisode(${ep.songId})">
                <div class="podcast-episode-art">🎙️</div>
                <div class="podcast-episode-info">
                    <div class="podcast-episode-title">${escapeHtml(ep.title || 'Unknown')}</div>
                    <div class="podcast-episode-meta">${escapeHtml(ep.artist || 'Unknown Artist')}</div>
                </div>
                <div class="podcast-episode-duration">${formatDuration(ep.duration)}</div>
            </div>
        `).join('');
    } catch (e) {
        console.log('[Podcast] Error loading episodes:', e);
    }
}

function loadContinueListening() {
    const container = document.getElementById('continue-listening');
    if (!container) return;
    
    const positions = window.podcastManager.playbackPositions;
    const inProgress = Object.entries(positions).filter(([id, pos]) => pos > 30); // More than 30 seconds in
    
    if (inProgress.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No episodes in progress</p>
                <p class="subtitle">Your partially played episodes will appear here</p>
            </div>
        `;
        return;
    }
    
    // We'd need to fetch song details for each - for now show IDs
    container.innerHTML = `<p class="subtitle">${inProgress.length} episode(s) in progress</p>`;
}

function playPodcastEpisode(songId) {
    // Find the song and play it
    if (window.allSongs) {
        const song = window.allSongs.find(s => s.songId == songId);
        if (song && typeof window.playSong === 'function') {
            window.playSong(song);
            
            // Restore position if saved
            const savedPos = window.podcastManager.getPlaybackPosition(songId);
            if (savedPos > 0) {
                setTimeout(() => {
                    const audio = document.getElementById('audio-player');
                    if (audio) audio.currentTime = savedPos;
                }, 500);
            }
        }
    }
}

function formatDuration(seconds) {
    if (!seconds) return '--:--';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Save position periodically for podcasts
function setupPositionSaving() {
    const audio = document.getElementById('audio-player');
    if (!audio) return;
    
    audio.addEventListener('timeupdate', () => {
        // Save position every 10 seconds for long audio
        if (audio.duration > 600 && audio.currentTime > 30) {
            const songId = window.currentSong?.songId;
            if (songId) {
                window.podcastManager.savePlaybackPosition(songId, audio.currentTime);
            }
        }
    });
}

// ========== INITIALIZATION ==========
window.podcastManager = new PodcastManager();
window.radioMode = new RadioMode();

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.podcastManager.init();
        window.radioMode.init();
        addPodcastControls();
        setupPodcastsTab();
        setupPositionSaving();
    }, 500);
});

// Export
window.cycleSpeed = cycleSpeed;
window.playPodcastEpisode = playPodcastEpisode;
window.loadPodcastEpisodes = loadPodcastEpisodes;
