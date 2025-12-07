/**
 * RETROPLAY Advanced Audio Features
 * - Equalizer with Web Audio API
 * - Crossfade between songs
 * - Lyrics display
 */

// ============================================
// AUDIO CONTEXT & NODES
// ============================================

let audioContext = null;
let sourceNode = null;
let gainNode = null;
let eqFilters = [];
let crossfadeEnabled = false;
let crossfadeDuration = 3; // seconds

// EQ frequency bands (Hz)
const EQ_BANDS = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

// EQ Presets
const EQ_PRESETS = {
    flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    bassBoost: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
    trebleBoost: [0, 0, 0, 0, 0, 2, 4, 5, 6, 6],
    vocal: [-2, -1, 0, 2, 4, 4, 3, 2, 0, -1],
    rock: [4, 3, 2, 0, -1, 0, 2, 3, 4, 4],
    electronic: [4, 3, 0, -2, -1, 0, 2, 4, 5, 4],
    acoustic: [3, 2, 1, 1, 0, 0, 0, 1, 2, 2],
    jazz: [2, 1, 0, 1, 2, 2, 1, 1, 2, 2]
};

// ============================================
// EQUALIZER
// ============================================

function initAudioContext() {
    if (audioContext) return;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('[Audio] AudioContext initialized');
    } catch (e) {
        console.error('[Audio] Failed to create AudioContext:', e);
        return;
    }
}

function connectAudioToEQ() {
    if (!audioPlayer || !audioContext) return;
    
    // Only create source node once
    if (sourceNode) return;
    
    try {
        sourceNode = audioContext.createMediaElementSource(audioPlayer);
        gainNode = audioContext.createGain();
        
        // Create EQ filters
        eqFilters = EQ_BANDS.map((freq, i) => {
            const filter = audioContext.createBiquadFilter();
            filter.type = i === 0 ? 'lowshelf' : i === EQ_BANDS.length - 1 ? 'highshelf' : 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = 0;
            return filter;
        });
        
        // Connect: source -> filters -> gain -> destination
        let lastNode = sourceNode;
        eqFilters.forEach(filter => {
            lastNode.connect(filter);
            lastNode = filter;
        });
        lastNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        console.log('[Audio] EQ connected');
    } catch (e) {
        console.error('[Audio] Failed to connect EQ:', e);
    }
}

function setEQBand(bandIndex, gain) {
    if (eqFilters[bandIndex]) {
        eqFilters[bandIndex].gain.value = gain;
    }
}

function applyEQPreset(presetName) {
    const preset = EQ_PRESETS[presetName];
    if (!preset) return;
    
    preset.forEach((gain, i) => {
        setEQBand(i, gain);
        // Update slider UI
        const slider = document.getElementById(`eq-band-${i}`);
        if (slider) slider.value = gain;
    });
    
    showNotification(`EQ: ${presetName.charAt(0).toUpperCase() + presetName.slice(1)}`, 'info');
}

function setupEqualizerUI() {
    const audioSettings = document.getElementById('audio-settings');
    if (!audioSettings || document.getElementById('eq-section')) return;
    
    const eqSection = document.createElement('div');
    eqSection.id = 'eq-section';
    eqSection.className = 'eq-section';
    eqSection.innerHTML = `
        <h3>🎛️ Equalizer</h3>
        <div class="eq-presets">
            <select id="eq-preset-select" class="eq-preset-select">
                <option value="flat">Flat</option>
                <option value="bassBoost">Bass Boost</option>
                <option value="trebleBoost">Treble Boost</option>
                <option value="vocal">Vocal</option>
                <option value="rock">Rock</option>
                <option value="electronic">Electronic</option>
                <option value="acoustic">Acoustic</option>
                <option value="jazz">Jazz</option>
            </select>
        </div>
        <div class="eq-sliders">
            ${EQ_BANDS.map((freq, i) => `
                <div class="eq-band">
                    <input type="range" id="eq-band-${i}" class="eq-slider" min="-12" max="12" value="0" orient="vertical">
                    <span class="eq-freq">${freq >= 1000 ? (freq/1000) + 'k' : freq}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    // Insert after crossfade setting
    const crossfadeItem = audioSettings.querySelector('.setting-item');
    if (crossfadeItem) {
        crossfadeItem.parentNode.insertBefore(eqSection, crossfadeItem);
    } else {
        audioSettings.appendChild(eqSection);
    }
    
    // Setup event listeners
    document.getElementById('eq-preset-select').addEventListener('change', (e) => {
        applyEQPreset(e.target.value);
    });
    
    EQ_BANDS.forEach((_, i) => {
        const slider = document.getElementById(`eq-band-${i}`);
        slider.addEventListener('input', (e) => {
            setEQBand(i, parseFloat(e.target.value));
        });
    });
    
    console.log('[Audio] EQ UI setup complete');
}

// ============================================
// CROSSFADE
// ============================================

let nextAudioPlayer = null;
let isCrossfading = false;

function setupCrossfade() {
    const crossfadeSlider = document.getElementById('crossfade-slider');
    if (crossfadeSlider) {
        crossfadeSlider.addEventListener('input', (e) => {
            crossfadeDuration = parseInt(e.target.value);
            crossfadeEnabled = crossfadeDuration > 0;
        });
    }
}

function startCrossfade(nextSong) {
    if (!crossfadeEnabled || crossfadeDuration === 0 || isCrossfading) {
        return false;
    }
    
    isCrossfading = true;
    
    // Create second audio element for crossfade
    if (!nextAudioPlayer) {
        nextAudioPlayer = new Audio();
        nextAudioPlayer.volume = 0;
    }
    
    // Get filename
    let filename = nextSong.filePath || nextSong.fileName;
    if (filename.includes('/') || filename.includes('\\')) {
        filename = filename.split(/[/\\]/).pop();
    }
    
    nextAudioPlayer.src = `/uploads/music/${filename}`;
    nextAudioPlayer.volume = 0;
    nextAudioPlayer.play();
    
    const fadeSteps = 20;
    const stepDuration = (crossfadeDuration * 1000) / fadeSteps;
    const volumeStep = audioPlayer.volume / fadeSteps;
    
    let step = 0;
    const fadeInterval = setInterval(() => {
        step++;
        
        // Fade out current
        audioPlayer.volume = Math.max(0, audioPlayer.volume - volumeStep);
        // Fade in next
        nextAudioPlayer.volume = Math.min(1, nextAudioPlayer.volume + volumeStep);
        
        if (step >= fadeSteps) {
            clearInterval(fadeInterval);
            
            // Swap players
            audioPlayer.pause();
            audioPlayer.src = nextAudioPlayer.src;
            audioPlayer.currentTime = nextAudioPlayer.currentTime;
            audioPlayer.volume = nextAudioPlayer.volume;
            audioPlayer.play();
            
            nextAudioPlayer.pause();
            nextAudioPlayer.volume = 0;
            
            isCrossfading = false;
        }
    }, stepDuration);
    
    return true;
}

// ============================================
// LYRICS
// ============================================

let currentLyrics = null;

async function fetchLyrics(artist, title) {
    if (!artist || !title) return null;
    
    // Clean up artist and title
    artist = artist.replace(/[^\w\s]/g, '').trim();
    title = title.replace(/[^\w\s]/g, '').trim();
    
    try {
        // Try lyrics.ovh API
        const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.lyrics) {
                return data.lyrics;
            }
        }
    } catch (e) {
        console.log('[Lyrics] API error:', e);
    }
    
    return null;
}

async function loadLyricsForCurrentSong() {
    if (!window.currentQueue || window.currentQueueIndex < 0) return;
    
    const song = window.currentQueue[window.currentQueueIndex];
    if (!song) return;
    
    const lyricsContainer = document.getElementById('lyrics-container');
    const lyricsContent = document.getElementById('lyrics-content');
    
    if (!lyricsContainer || !lyricsContent) return;
    
    lyricsContent.innerHTML = '<div class="lyrics-loading">🎵 Searching for lyrics...</div>';
    lyricsContainer.style.display = 'block';
    
    const lyrics = await fetchLyrics(song.artist, song.title);
    
    if (lyrics) {
        currentLyrics = lyrics;
        lyricsContent.innerHTML = `<pre class="lyrics-text">${escapeHtml(lyrics)}</pre>`;
    } else {
        currentLyrics = null;
        lyricsContent.innerHTML = '<div class="lyrics-not-found">No lyrics found for this song</div>';
    }
}

function setupLyricsUI() {
    // Add lyrics button to vinyl panel
    const vinylHeader = document.querySelector('.vinyl-header-actions');
    if (vinylHeader && !document.getElementById('lyrics-btn')) {
        const lyricsBtn = document.createElement('button');
        lyricsBtn.id = 'lyrics-btn';
        lyricsBtn.className = 'vinyl-header-btn';
        lyricsBtn.title = 'Show Lyrics';
        lyricsBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 6h16M4 12h16M4 18h10"/>
            </svg>
        `;
        lyricsBtn.onclick = toggleLyricsPanel;
        vinylHeader.insertBefore(lyricsBtn, vinylHeader.firstChild);
    }
    
    // Create lyrics panel
    if (!document.getElementById('lyrics-panel')) {
        const lyricsPanel = document.createElement('div');
        lyricsPanel.id = 'lyrics-panel';
        lyricsPanel.className = 'lyrics-panel';
        lyricsPanel.style.display = 'none';
        lyricsPanel.innerHTML = `
            <div class="lyrics-header">
                <h3>📝 Lyrics</h3>
                <button class="lyrics-close" onclick="toggleLyricsPanel()">✕</button>
            </div>
            <div id="lyrics-container" class="lyrics-container">
                <div id="lyrics-content" class="lyrics-content">
                    <div class="lyrics-placeholder">Play a song to see lyrics</div>
                </div>
            </div>
        `;
        
        const vinylPanel = document.querySelector('.vinyl-panel-right');
        if (vinylPanel) {
            vinylPanel.appendChild(lyricsPanel);
        }
    }
}

function toggleLyricsPanel() {
    const panel = document.getElementById('lyrics-panel');
    if (!panel) return;
    
    const isVisible = panel.style.display !== 'none';
    panel.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        loadLyricsForCurrentSong();
    }
}

// ============================================
// INITIALIZATION
// ============================================

function initAudioFeatures() {
    // Initialize on first user interaction (required for AudioContext)
    document.addEventListener('click', function initOnClick() {
        initAudioContext();
        if (audioPlayer && audioContext) {
            connectAudioToEQ();
        }
        document.removeEventListener('click', initOnClick);
    }, { once: true });
    
    // Setup UI components
    setTimeout(() => {
        setupEqualizerUI();
        setupCrossfade();
        setupLyricsUI();
    }, 1500);
    
    // Load lyrics when song changes
    if (audioPlayer) {
        audioPlayer.addEventListener('play', () => {
            const lyricsPanel = document.getElementById('lyrics-panel');
            if (lyricsPanel && lyricsPanel.style.display !== 'none') {
                loadLyricsForCurrentSong();
            }
        });
    }
    
    console.log('[Audio Features] Initialized');
}

// ============================================
// DURATION SYNC
// ============================================

function setupDurationSync() {
    if (!audioPlayer) return;
    
    audioPlayer.addEventListener('loadedmetadata', () => {
        const duration = audioPlayer.duration;
        if (!duration || duration <= 0) return;
        
        // Get current song
        if (window.currentQueue && window.currentQueueIndex >= 0) {
            const song = window.currentQueue[window.currentQueueIndex];
            if (song && song.songId && (!song.duration || song.duration === 0)) {
                // Update duration on server
                fetch(`/api/songs/${song.songId}/duration`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ duration: duration })
                }).catch(e => console.log('[Duration] Sync error:', e));
                
                // Update local data
                song.duration = duration;
            }
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initAudioFeatures();
        setupDurationSync();
    }, 1000);
});

// Make functions global
window.applyEQPreset = applyEQPreset;
window.toggleLyricsPanel = toggleLyricsPanel;
window.loadLyricsForCurrentSong = loadLyricsForCurrentSong;
window.startCrossfade = startCrossfade;
