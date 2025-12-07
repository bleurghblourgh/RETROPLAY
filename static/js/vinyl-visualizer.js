// ========== VINYL DISC VISUALIZER ==========

class VinylVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn('Vinyl canvas not found:', canvasId);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.isPlaying = false;
        this.rotation = 0;
        this.rotationSpeed = 0.5;
        this.albumArt = null;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.animationId = null;
        
        this.init();
        console.log('VinylVisualizer created for canvas:', canvasId);
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }
    
    resize() {
        const container = this.canvas.parentElement;
        if (!container) return;
        
        const size = Math.min(container.offsetWidth, container.offsetHeight) || 250;
        this.canvas.width = size * 2; // Higher resolution
        this.canvas.height = size * 2;
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
    }
    
    setAlbumArt(imageUrl) {
        if (imageUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                this.albumArt = img;
            };
            img.onerror = () => {
                this.albumArt = null;
            };
            img.src = imageUrl;
        } else {
            this.albumArt = null;
        }
    }
    
    connectAudio(audioElement) {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (!this.analyser) {
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 256;
                const bufferLength = this.analyser.frequencyBinCount;
                this.dataArray = new Uint8Array(bufferLength);
                
                const source = this.audioContext.createMediaElementSource(audioElement);
                source.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
            }
        } catch (e) {
            console.log('Audio visualization not available:', e);
        }
    }
    
    play() {
        this.isPlaying = true;
        document.getElementById('tonearm')?.classList.add('playing');
        document.getElementById('audio-visualizer')?.classList.add('playing');
        
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    pause() {
        this.isPlaying = false;
        document.getElementById('tonearm')?.classList.remove('playing');
        document.getElementById('audio-visualizer')?.classList.remove('playing');
    }
    
    stop() {
        this.isPlaying = false;
        this.rotation = 0;
        document.getElementById('tonearm')?.classList.remove('playing');
        document.getElementById('audio-visualizer')?.classList.remove('playing');
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.isPlaying) {
            this.rotation += this.rotationSpeed;
            if (this.rotation >= 360) this.rotation -= 360;
        }
        
        // Update visualizer bars if playing
        if (this.isPlaying && this.analyser && this.dataArray) {
            this.analyser.getByteFrequencyData(this.dataArray);
            this.updateVisualizerBars();
        }
        
        this.draw();
    }
    
    updateVisualizerBars() {
        const bars = document.querySelectorAll('.visualizer-bar');
        const step = Math.floor(this.dataArray.length / bars.length);
        
        bars.forEach((bar, i) => {
            const value = this.dataArray[i * step];
            const height = Math.max(4, (value / 255) * 45);
            bar.style.height = height + 'px';
        });
    }
    
    draw() {
        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context and rotate
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((this.rotation * Math.PI) / 180);
        
        // Draw vinyl disc
        this.drawVinylDisc(ctx, radius);
        
        // Draw album art in center
        if (this.albumArt) {
            this.drawAlbumArt(ctx, radius * 0.55);
        } else {
            this.drawDefaultLabel(ctx, radius * 0.55);
        }
        
        // Draw center spindle
        this.drawSpindle(ctx, radius * 0.08);
        
        ctx.restore();
    }
    
    drawVinylDisc(ctx, radius) {
        // Outer edge gradient
        const outerGradient = ctx.createRadialGradient(0, 0, radius * 0.6, 0, 0, radius);
        outerGradient.addColorStop(0, '#1a1a1a');
        outerGradient.addColorStop(0.8, '#0d0d0d');
        outerGradient.addColorStop(1, '#000000');
        
        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Vinyl grooves
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 60; i++) {
            const r = radius * 0.58 + (i * (radius * 0.38) / 60);
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Shine effect
        const shineGradient = ctx.createLinearGradient(-radius, -radius, radius, radius);
        shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        shineGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.03)');
        shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
        shineGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.03)');
        shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = shineGradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Edge highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius - 1, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    drawAlbumArt(ctx, radius) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.clip();
        
        ctx.drawImage(
            this.albumArt,
            -radius, -radius,
            radius * 2, radius * 2
        );
        
        // Add slight vignette
        const vignette = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = vignette;
        ctx.fill();
        
        ctx.restore();
    }
    
    drawDefaultLabel(ctx, radius) {
        // Label background
        const labelGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        labelGradient.addColorStop(0, '#EC4899');
        labelGradient.addColorStop(0.5, '#8B5CF6');
        labelGradient.addColorStop(1, '#4C1D95');
        
        ctx.fillStyle = labelGradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Label text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold ' + (radius * 0.25) + 'px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('RETROPLAY', 0, -radius * 0.15);
        
        ctx.font = (radius * 0.12) + 'px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('♪ ♫ ♪', 0, radius * 0.2);
    }
    
    drawSpindle(ctx, radius) {
        // Spindle base
        const spindleGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        spindleGradient.addColorStop(0, '#666');
        spindleGradient.addColorStop(0.5, '#444');
        spindleGradient.addColorStop(1, '#222');
        
        ctx.fillStyle = spindleGradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Spindle highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// ========== VINYL PANEL CONTROLLER ==========

class VinylPanelController {
    constructor() {
        this.visualizer = null;
        this.audioElement = null;
        this.isInitialized = false;
    }
    
    init() {
        if (this.isInitialized) return;
        
        // Initialize visualizer
        this.visualizer = new VinylVisualizer('vinyl-canvas');
        this.audioElement = document.getElementById('audio-player');
        
        if (!this.audioElement) {
            console.warn('Audio element not found, will retry...');
            setTimeout(() => this.init(), 500);
            return;
        }
        
        // Setup control listeners
        this.setupControls();
        this.setupProgressBar();
        this.setupVolumeControl();
        
        this.isInitialized = true;
        console.log('Vinyl panel initialized with audio element:', this.audioElement);
    }
    
    setupControls() {
        // Fullscreen button
        const fullscreenBtn = document.getElementById('vinyl-fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        
        // Play button
        const playBtn = document.getElementById('vinyl-play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (this.audioElement.paused) {
                    this.audioElement.play();
                } else {
                    this.audioElement.pause();
                }
            });
        }
        
        // Previous button
        const prevBtn = document.getElementById('vinyl-prev-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (typeof window.playPrevious === 'function') {
                    window.playPrevious();
                }
            });
        }
        
        // Next button
        const nextBtn = document.getElementById('vinyl-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (typeof window.playNext === 'function') {
                    window.playNext();
                }
            });
        }
        
        // Shuffle button
        const shuffleBtn = document.getElementById('vinyl-shuffle-btn');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => {
                shuffleBtn.classList.toggle('active');
                window.shuffleEnabled = shuffleBtn.classList.contains('active');
            });
        }
        
        // Repeat button
        const repeatBtn = document.getElementById('vinyl-repeat-btn');
        if (repeatBtn) {
            repeatBtn.addEventListener('click', () => {
                repeatBtn.classList.toggle('active');
                window.repeatEnabled = repeatBtn.classList.contains('active');
            });
        }
        
        // Audio element events
        if (this.audioElement) {
            this.audioElement.addEventListener('play', () => this.onPlay());
            this.audioElement.addEventListener('pause', () => this.onPause());
            this.audioElement.addEventListener('ended', () => this.onEnded());
            this.audioElement.addEventListener('timeupdate', () => this.onTimeUpdate());
            this.audioElement.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
        }
    }
    
    setupProgressBar() {
        const progressBar = document.getElementById('vinyl-progress-bar');
        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                if (this.audioElement && this.audioElement.duration) {
                    this.audioElement.currentTime = percent * this.audioElement.duration;
                }
            });
        }
    }
    
    setupVolumeControl() {
        const volumeSlider = document.getElementById('vinyl-volume');
        const muteBtn = document.getElementById('vinyl-mute-btn');
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                if (this.audioElement) {
                    this.audioElement.volume = volume;
                }
                this.updateVolumeIcon(volume);
            });
        }
        
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                if (this.audioElement) {
                    this.audioElement.muted = !this.audioElement.muted;
                    this.updateVolumeIcon(this.audioElement.muted ? 0 : this.audioElement.volume);
                }
            });
        }
    }
    
    updateVolumeIcon(volume) {
        const muteBtn = document.getElementById('vinyl-mute-btn');
        if (!muteBtn) return;
        
        let icon;
        if (volume === 0 || this.audioElement?.muted) {
            icon = '<path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" stroke-width="2"/>';
        } else if (volume < 0.5) {
            icon = '<path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07" stroke-width="2"/>';
        } else {
            icon = '<path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke-width="2"/>';
        }
        
        muteBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">${icon}</svg>`;
    }
    
    onPlay() {
        if (this.visualizer) {
            this.visualizer.play();
        }
        if (this.fsVisualizer) {
            this.fsVisualizer.play();
        }
        this.updatePlayButton(true);
        this.updateFullscreenPlayState(true);
    }
    
    onPause() {
        if (this.visualizer) {
            this.visualizer.pause();
        }
        if (this.fsVisualizer) {
            this.fsVisualizer.pause();
        }
        this.updatePlayButton(false);
        this.updateFullscreenPlayState(false);
    }
    
    updateFullscreenPlayState(isPlaying) {
        const fsModal = document.getElementById('fullscreen-visualizer');
        const fsPlayIcon = document.getElementById('fs-play-icon');
        
        if (fsModal) {
            if (isPlaying) {
                fsModal.classList.add('playing');
            } else {
                fsModal.classList.remove('playing');
            }
        }
        
        if (fsPlayIcon) {
            if (isPlaying) {
                fsPlayIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
            } else {
                fsPlayIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
            }
        }
    }
    
    onEnded() {
        if (this.visualizer) {
            this.visualizer.pause();
        }
        this.updatePlayButton(false);
        
        // Auto-play next if repeat or queue
        if (window.repeatEnabled) {
            this.audioElement.currentTime = 0;
            this.audioElement.play();
        } else if (typeof window.playNext === 'function') {
            window.playNext();
        }
    }
    
    onTimeUpdate() {
        if (!this.audioElement) return;
        
        const current = this.audioElement.currentTime;
        const duration = this.audioElement.duration || 0;
        const percent = duration ? (current / duration) * 100 : 0;
        
        // Update progress bar
        const fill = document.getElementById('vinyl-progress-fill');
        if (fill) fill.style.width = percent + '%';
        
        // Update time displays
        const currentEl = document.getElementById('vinyl-time-current');
        const totalEl = document.getElementById('vinyl-time-total');
        
        if (currentEl) currentEl.textContent = this.formatTime(current);
        if (totalEl) totalEl.textContent = this.formatTime(duration);
    }
    
    onLoadedMetadata() {
        const totalEl = document.getElementById('vinyl-time-total');
        if (totalEl && this.audioElement) {
            totalEl.textContent = this.formatTime(this.audioElement.duration);
        }
    }
    
    updatePlayButton(isPlaying) {
        const playIcon = document.getElementById('vinyl-play-icon');
        if (playIcon) {
            if (isPlaying) {
                playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
            } else {
                playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
            }
        }
    }
    
    updateSongInfo(song) {
        const titleEl = document.getElementById('vinyl-song-title');
        const artistEl = document.getElementById('vinyl-song-artist');
        const albumEl = document.getElementById('vinyl-song-album');
        
        const title = song.title || 'Unknown Title';
        const artist = song.customArtist || song.artist || 'Unknown Artist';
        
        if (titleEl) titleEl.textContent = title;
        if (artistEl) artistEl.textContent = artist;
        if (albumEl) albumEl.textContent = song.album || '';
        
        // Update album art on vinyl - check all possible image properties
        const imageUrl = song.customImage || song.albumArt || song.imageUrl || song.artwork || null;
        if (this.visualizer) {
            this.visualizer.setAlbumArt(imageUrl);
        }
        if (this.fsVisualizer) {
            this.fsVisualizer.setAlbumArt(imageUrl);
        }
        
        // Update fullscreen info
        const fsTitle = document.getElementById('fs-title');
        const fsArtist = document.getElementById('fs-artist');
        if (fsTitle) fsTitle.textContent = title;
        if (fsArtist) fsArtist.textContent = artist;
    }
    
    updateQueue(queue, currentIndex) {
        const queueList = document.getElementById('queue-list');
        if (!queueList || !queue || queue.length === 0) {
            if (queueList) queueList.innerHTML = '<div class="queue-empty">Queue is empty</div>';
            return;
        }
        
        // Always show 4 songs, wrapping around to beginning if needed
        const upcoming = [];
        const totalSongs = queue.length;
        
        for (let i = 1; i <= 4; i++) {
            const idx = (currentIndex + i) % totalSongs;
            if (queue[idx]) {
                upcoming.push({ song: queue[idx], index: idx });
            }
        }
        
        if (upcoming.length === 0) {
            queueList.innerHTML = '<div class="queue-empty">Queue is empty</div>';
            return;
        }
        
        let html = '';
        upcoming.forEach((item, i) => {
            html += `
                <div class="queue-item" onclick="playFromQueue(${item.index})">
                    <span class="queue-item-num">${i + 1}</span>
                    <div class="queue-item-info">
                        <div class="queue-item-title">${this.escapeHtml(item.song.title || 'Unknown')}</div>
                        <div class="queue-item-artist">${this.escapeHtml(item.song.artist || 'Unknown')}</div>
                    </div>
                    <span class="queue-item-duration">${this.formatTime(item.song.duration)}</span>
                </div>
            `;
        });
        
        queueList.innerHTML = html;
    }
    
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    toggleFullscreen() {
        // Use enhanced visualizer if available
        if (window.enhancedFS) {
            window.enhancedFS.open();
            return;
        }
        
        let modal = document.getElementById('fullscreen-visualizer');
        
        if (modal) {
            // Close fullscreen
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
            return;
        }
        
        // Create fullscreen modal
        modal = document.createElement('div');
        modal.id = 'fullscreen-visualizer';
        modal.className = 'fullscreen-visualizer';
        modal.innerHTML = `
            <div class="fs-background"></div>
            <button class="fs-close-btn" onclick="window.vinylPanel.toggleFullscreen()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M18 6L6 18M6 6l12 12" stroke-width="2"/>
                </svg>
            </button>
            <div class="fs-content">
                <div class="fs-vinyl-container">
                    <canvas id="fs-vinyl-canvas"></canvas>
                </div>
                <div class="fs-info">
                    <div class="fs-title" id="fs-title">No song playing</div>
                    <div class="fs-artist" id="fs-artist">-</div>
                </div>
                <div class="fs-controls">
                    <button class="fs-control-btn" onclick="window.playPrevious()">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                    </button>
                    <button class="fs-play-btn" id="fs-play-btn" onclick="document.getElementById('audio-player').paused ? document.getElementById('audio-player').play() : document.getElementById('audio-player').pause()">
                        <svg id="fs-play-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                    <button class="fs-control-btn" onclick="window.playNext()">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 18h2V6h-2zM6 18l8.5-6L6 6z"/></svg>
                    </button>
                </div>
                <div class="fs-visualizer-bars" id="fs-visualizer-bars"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Initialize fullscreen vinyl
        setTimeout(() => {
            modal.classList.add('active');
            this.initFullscreenVinyl();
            this.updateFullscreenInfo();
        }, 10);
    }
    
    initFullscreenVinyl() {
        const canvas = document.getElementById('fs-vinyl-canvas');
        if (!canvas) return;
        
        this.fsVisualizer = new VinylVisualizer('fs-vinyl-canvas');
        if (this.fsVisualizer && this.visualizer) {
            this.fsVisualizer.albumArt = this.visualizer.albumArt;
            this.fsVisualizer.isPlaying = this.visualizer.isPlaying;
            this.fsVisualizer.rotation = this.visualizer.rotation;
        }
        
        // Create visualizer bars
        const barsContainer = document.getElementById('fs-visualizer-bars');
        if (barsContainer) {
            let barsHtml = '';
            for (let i = 0; i < 32; i++) {
                barsHtml += '<div class="fs-bar"></div>';
            }
            barsContainer.innerHTML = barsHtml;
        }
    }
    
    updateFullscreenInfo() {
        const titleEl = document.getElementById('fs-title');
        const artistEl = document.getElementById('fs-artist');
        const mainTitle = document.getElementById('vinyl-song-title');
        const mainArtist = document.getElementById('vinyl-song-artist');
        
        if (titleEl && mainTitle) titleEl.textContent = mainTitle.textContent;
        if (artistEl && mainArtist) artistEl.textContent = mainArtist.textContent;
    }
}

// ========== GLOBAL INSTANCE ==========

let vinylPanel = null;

function initVinylPanel() {
    if (!vinylPanel) {
        vinylPanel = new VinylPanelController();
        vinylPanel.init();
        // Update global reference
        window.vinylPanel = vinylPanel;
    }
    return vinylPanel;
}

// Helper function to play from queue
function playFromQueue(index) {
    if (window.currentQueue && window.currentQueue[index]) {
        window.currentQueueIndex = index;
        if (typeof window.playSong === 'function') {
            window.playSong(window.currentQueue[index]);
        }
    }
}

// Export globals
window.VinylVisualizer = VinylVisualizer;
window.VinylPanelController = VinylPanelController;
window.initVinylPanel = initVinylPanel;
window.playFromQueue = playFromQueue;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure all elements are ready
    setTimeout(function() {
        initVinylPanel();
        console.log('Vinyl panel auto-initialized');
    }, 100);
});
