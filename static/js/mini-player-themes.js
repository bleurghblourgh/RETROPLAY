/**
 * RETROPLAY - Mini Player Mode & Custom Theme Creator
 */

// ============================================
// MINI PLAYER MODE
// ============================================

const MiniPlayer = {
    isMinimized: false,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    element: null,
    pipWindow: null,
    pipSupported: false,
    
    init() {
        // Check for Picture-in-Picture support
        this.pipSupported = 'documentPictureInPicture' in window;
        console.log('[MiniPlayer] PiP supported:', this.pipSupported);
        
        this.createMiniPlayer();
        this.attachEvents();
        console.log('[MiniPlayer] Initialized');
    },
    
    createMiniPlayer() {
        const miniPlayer = document.createElement('div');
        miniPlayer.id = 'mini-player';
        miniPlayer.className = 'mini-player';
        miniPlayer.innerHTML = `
            <div class="mini-player-drag-handle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
                    <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
                </svg>
            </div>
            <div class="mini-player-art">
                <div class="mini-player-vinyl">
                    <div class="mini-vinyl-inner"></div>
                </div>
            </div>
            <div class="mini-player-info">
                <div class="mini-player-title">No song playing</div>
                <div class="mini-player-artist">-</div>
                <div class="mini-player-progress">
                    <div class="mini-progress-bar">
                        <div class="mini-progress-fill"></div>
                    </div>
                    <div class="mini-progress-time">
                        <span class="mini-current">0:00</span>
                        <span class="mini-duration">0:00</span>
                    </div>
                </div>
            </div>
            <div class="mini-player-controls">
                <button class="mini-btn mini-prev" title="Previous">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>
                <button class="mini-btn mini-play" title="Play/Pause">
                    <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    <svg class="pause-icon" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                </button>
                <button class="mini-btn mini-next" title="Next">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                </button>
            </div>
            <button class="mini-player-expand" title="Expand">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                </svg>
            </button>
            <button class="mini-player-close" title="Close Mini Player">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;
        document.body.appendChild(miniPlayer);
        this.element = miniPlayer;
        
        // Add minimize button to vinyl panel
        this.addMinimizeButton();
    },
    
    addMinimizeButton() {
        // Add to vinyl header
        const vinylHeader = document.querySelector('.vinyl-header');
        if (vinylHeader && !document.getElementById('minimize-player-btn')) {
            const minimizeBtn = document.createElement('button');
            minimizeBtn.id = 'minimize-player-btn';
            minimizeBtn.className = 'vinyl-control-btn';
            minimizeBtn.title = 'Mini Player';
            minimizeBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <rect x="12" y="10" width="8" height="6" rx="1" fill="currentColor" opacity="0.3"/>
                </svg>
            `;
            minimizeBtn.onclick = () => this.show();
            vinylHeader.appendChild(minimizeBtn);
        }
        
        // Add PiP button if supported
        if (this.pipSupported && vinylHeader && !document.getElementById('pip-player-btn')) {
            const pipBtn = document.createElement('button');
            pipBtn.id = 'pip-player-btn';
            pipBtn.className = 'vinyl-control-btn';
            pipBtn.title = 'Picture-in-Picture (stays on top of other tabs)';
            pipBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <path d="M22 17v4h-4" stroke-linecap="round"/>
                    <path d="M17 22l5-5" stroke-linecap="round"/>
                </svg>
            `;
            pipBtn.onclick = () => this.openPiP();
            vinylHeader.appendChild(pipBtn);
        }
        
        // Add floating toggle button in sidebar (always visible)
        const sidebar = document.querySelector('.sidebar-nav');
        if (sidebar && !document.getElementById('mini-player-toggle')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'mini-player-toggle';
            toggleBtn.className = 'nav-item mini-player-nav-btn';
            toggleBtn.title = this.pipSupported ? 'Picture-in-Picture Player' : 'Mini Player';
            toggleBtn.innerHTML = `
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <rect x="12" y="10" width="8" height="6" rx="1" fill="currentColor" opacity="0.3"/>
                </svg>
                <span>PiP Player</span>
            `;
            toggleBtn.onclick = (e) => {
                e.preventDefault();
                if (this.pipSupported) {
                    this.openPiP();
                } else {
                    this.toggle();
                }
            };
            sidebar.appendChild(toggleBtn);
        }
    },
    
    toggle() {
        if (this.isMinimized) {
            this.hide();
        } else {
            this.show();
        }
    },
    
    attachEvents() {
        const mini = this.element;
        if (!mini) return;
        
        // Drag functionality
        const handle = mini.querySelector('.mini-player-drag-handle');
        handle.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
        
        // Control buttons
        mini.querySelector('.mini-prev').onclick = () => window.playPrevious?.();
        mini.querySelector('.mini-next').onclick = () => window.playNext?.();
        mini.querySelector('.mini-play').onclick = () => window.togglePlay?.();
        mini.querySelector('.mini-player-expand').onclick = () => this.hide();
        mini.querySelector('.mini-player-close').onclick = () => this.hide();
        
        // Progress bar click
        mini.querySelector('.mini-progress-bar').onclick = (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const audio = document.getElementById('audio-player');
            if (audio && audio.duration) {
                audio.currentTime = percent * audio.duration;
            }
        };
        
        // Listen for audio updates
        this.setupAudioSync();
    },
    
    setupAudioSync() {
        const audio = document.getElementById('audio-player');
        if (!audio) {
            setTimeout(() => this.setupAudioSync(), 1000);
            return;
        }
        
        audio.addEventListener('timeupdate', () => this.updateProgress());
        audio.addEventListener('play', () => this.updatePlayState(true));
        audio.addEventListener('pause', () => this.updatePlayState(false));
    },
    
    updateProgress() {
        if (!this.isMinimized) return;
        const audio = document.getElementById('audio-player');
        if (!audio) return;
        
        const current = audio.currentTime;
        const duration = audio.duration || 0;
        const percent = duration ? (current / duration) * 100 : 0;
        
        const fill = this.element.querySelector('.mini-progress-fill');
        const currentTime = this.element.querySelector('.mini-current');
        const durationTime = this.element.querySelector('.mini-duration');
        
        if (fill) fill.style.width = `${percent}%`;
        if (currentTime) currentTime.textContent = this.formatTime(current);
        if (durationTime) durationTime.textContent = this.formatTime(duration);
    },
    
    updatePlayState(isPlaying) {
        const playIcon = this.element.querySelector('.play-icon');
        const pauseIcon = this.element.querySelector('.pause-icon');
        const vinyl = this.element.querySelector('.mini-player-vinyl');
        
        if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
        if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';
        if (vinyl) vinyl.classList.toggle('spinning', isPlaying);
    },
    
    updateSongInfo(song) {
        if (!this.element) return;
        const title = this.element.querySelector('.mini-player-title');
        const artist = this.element.querySelector('.mini-player-artist');
        
        if (title) title.textContent = song?.title || 'No song playing';
        if (artist) artist.textContent = song?.artist || '-';
    },
    
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    startDrag(e) {
        this.isDragging = true;
        const rect = this.element.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        this.element.style.transition = 'none';
    },
    
    drag(e) {
        if (!this.isDragging) return;
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        // Keep within viewport
        const maxX = window.innerWidth - this.element.offsetWidth;
        const maxY = window.innerHeight - this.element.offsetHeight;
        
        this.element.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
        this.element.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        this.element.style.right = 'auto';
        this.element.style.bottom = 'auto';
    },
    
    stopDrag() {
        this.isDragging = false;
        if (this.element) this.element.style.transition = '';
    },
    
    show() {
        this.isMinimized = true;
        this.element.classList.add('visible');
        document.querySelector('.vinyl-panel-right')?.classList.add('minimized');
        
        // Sync current song info
        if (window.currentSong) {
            this.updateSongInfo(window.currentSong);
        }
        this.updateProgress();
        
        const audio = document.getElementById('audio-player');
        this.updatePlayState(audio && !audio.paused);
    },
    
    hide() {
        this.isMinimized = false;
        this.element.classList.remove('visible');
        document.querySelector('.vinyl-panel-right')?.classList.remove('minimized');
    },
    
    // Picture-in-Picture mode - works across browser tabs!
    async openPiP() {
        if (!this.pipSupported) {
            showAlert('Picture-in-Picture is not supported in your browser. Try Chrome 116+.', 'warning');
            return;
        }
        
        try {
            // Close existing PiP window if open
            if (this.pipWindow && !this.pipWindow.closed) {
                this.pipWindow.close();
                return;
            }
            
            // Open PiP window
            this.pipWindow = await documentPictureInPicture.requestWindow({
                width: 350,
                height: 200
            });
            
            // Copy styles to PiP window
            const styles = document.querySelectorAll('link[rel="stylesheet"], style');
            styles.forEach(style => {
                this.pipWindow.document.head.appendChild(style.cloneNode(true));
            });
            
            // Add custom PiP styles
            const pipStyle = this.pipWindow.document.createElement('style');
            pipStyle.textContent = `
                body {
                    margin: 0;
                    padding: 12px;
                    background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
                    font-family: 'Inter', sans-serif;
                    color: white;
                    overflow: hidden;
                }
                .pip-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    height: 100%;
                }
                .pip-vinyl {
                    width: 80px;
                    height: 80px;
                    background: conic-gradient(from 0deg, #1a1a2e, #2d2d44, #1a1a2e);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 20px rgba(236, 72, 153, 0.3);
                    flex-shrink: 0;
                }
                .pip-vinyl.spinning {
                    animation: spin 3s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .pip-vinyl-inner {
                    width: 30px;
                    height: 30px;
                    background: linear-gradient(135deg, #EC4899, #8B5CF6);
                    border-radius: 50%;
                    border: 3px solid rgba(255,255,255,0.2);
                }
                .pip-info {
                    flex: 1;
                    min-width: 0;
                }
                .pip-title {
                    font-size: 16px;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-bottom: 4px;
                }
                .pip-artist {
                    font-size: 13px;
                    color: #a0aec0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-bottom: 10px;
                }
                .pip-progress {
                    height: 5px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 3px;
                    overflow: hidden;
                    margin-bottom: 8px;
                    cursor: pointer;
                }
                .pip-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #EC4899, #8B5CF6);
                    width: 0%;
                    transition: width 0.1s linear;
                }
                .pip-time {
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    color: #a0aec0;
                    font-family: monospace;
                    margin-bottom: 12px;
                }
                .pip-controls {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .pip-btn {
                    width: 36px;
                    height: 36px;
                    border: none;
                    background: rgba(255,255,255,0.1);
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .pip-btn:hover {
                    background: rgba(236, 72, 153, 0.3);
                    transform: scale(1.1);
                }
                .pip-btn svg {
                    width: 18px;
                    height: 18px;
                }
                .pip-btn.play-btn {
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, #EC4899, #8B5CF6);
                    box-shadow: 0 0 20px rgba(236, 72, 153, 0.4);
                }
                .pip-btn.play-btn:hover {
                    box-shadow: 0 0 30px rgba(236, 72, 153, 0.6);
                }
            `;
            this.pipWindow.document.head.appendChild(pipStyle);
            
            // Create PiP content
            const container = this.pipWindow.document.createElement('div');
            container.className = 'pip-container';
            container.innerHTML = `
                <div class="pip-vinyl" id="pip-vinyl">
                    <div class="pip-vinyl-inner"></div>
                </div>
                <div class="pip-info">
                    <div class="pip-title" id="pip-title">No song playing</div>
                    <div class="pip-artist" id="pip-artist">-</div>
                    <div class="pip-progress" id="pip-progress">
                        <div class="pip-progress-fill" id="pip-progress-fill"></div>
                    </div>
                    <div class="pip-time">
                        <span id="pip-current">0:00</span>
                        <span id="pip-duration">0:00</span>
                    </div>
                    <div class="pip-controls">
                        <button class="pip-btn" id="pip-prev">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                        </button>
                        <button class="pip-btn play-btn" id="pip-play">
                            <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            <svg class="pause-icon" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        </button>
                        <button class="pip-btn" id="pip-next">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                        </button>
                    </div>
                </div>
            `;
            this.pipWindow.document.body.appendChild(container);
            
            // Setup PiP controls
            this.setupPiPControls();
            
            // Update with current song
            this.updatePiP();
            
            // Listen for PiP window close
            this.pipWindow.addEventListener('pagehide', () => {
                this.pipWindow = null;
            });
            
            console.log('[MiniPlayer] PiP window opened');
            
        } catch (error) {
            console.error('[MiniPlayer] PiP error:', error);
            showAlert('Failed to open Picture-in-Picture. Try the regular mini player instead.', 'error');
        }
    },
    
    setupPiPControls() {
        if (!this.pipWindow) return;
        
        const doc = this.pipWindow.document;
        
        // Control buttons
        doc.getElementById('pip-prev').onclick = () => window.playPrevious?.();
        doc.getElementById('pip-next').onclick = () => window.playNext?.();
        doc.getElementById('pip-play').onclick = () => window.togglePlay?.();
        
        // Progress bar click
        doc.getElementById('pip-progress').onclick = (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const audio = document.getElementById('audio-player');
            if (audio && audio.duration) {
                audio.currentTime = percent * audio.duration;
            }
        };
        
        // Setup audio sync for PiP
        const audio = document.getElementById('audio-player');
        if (audio) {
            const updatePiPProgress = () => {
                if (!this.pipWindow || this.pipWindow.closed) return;
                
                const current = audio.currentTime;
                const duration = audio.duration || 0;
                const percent = duration ? (current / duration) * 100 : 0;
                
                const fill = this.pipWindow.document.getElementById('pip-progress-fill');
                const currentEl = this.pipWindow.document.getElementById('pip-current');
                const durationEl = this.pipWindow.document.getElementById('pip-duration');
                
                if (fill) fill.style.width = `${percent}%`;
                if (currentEl) currentEl.textContent = this.formatTime(current);
                if (durationEl) durationEl.textContent = this.formatTime(duration);
            };
            
            const updatePiPPlayState = () => {
                if (!this.pipWindow || this.pipWindow.closed) return;
                
                const isPlaying = !audio.paused;
                const playIcon = this.pipWindow.document.querySelector('.play-icon');
                const pauseIcon = this.pipWindow.document.querySelector('.pause-icon');
                const vinyl = this.pipWindow.document.getElementById('pip-vinyl');
                
                if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
                if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';
                if (vinyl) vinyl.classList.toggle('spinning', isPlaying);
            };
            
            audio.addEventListener('timeupdate', updatePiPProgress);
            audio.addEventListener('play', updatePiPPlayState);
            audio.addEventListener('pause', updatePiPPlayState);
            
            // Initial state
            updatePiPPlayState();
        }
    },
    
    updatePiP() {
        if (!this.pipWindow || this.pipWindow.closed) return;
        
        const doc = this.pipWindow.document;
        const song = window.currentSong;
        
        const title = doc.getElementById('pip-title');
        const artist = doc.getElementById('pip-artist');
        
        if (title) title.textContent = song?.title || 'No song playing';
        if (artist) artist.textContent = song?.artist || '-';
        
        // Update play state
        const audio = document.getElementById('audio-player');
        if (audio) {
            const isPlaying = !audio.paused;
            const playIcon = doc.querySelector('.play-icon');
            const pauseIcon = doc.querySelector('.pause-icon');
            const vinyl = doc.getElementById('pip-vinyl');
            
            if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
            if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';
            if (vinyl) vinyl.classList.toggle('spinning', isPlaying);
        }
    }
};

// ============================================
// CUSTOM THEME CREATOR
// ============================================

const ThemeCreator = {
    customThemes: {},
    
    init() {
        this.loadCustomThemes();
        this.addCreatorButton();
        console.log('[ThemeCreator] Initialized');
    },
    
    loadCustomThemes() {
        try {
            const saved = localStorage.getItem('retroplay-custom-themes');
            if (saved) {
                this.customThemes = JSON.parse(saved);
                // Register custom themes
                Object.keys(this.customThemes).forEach(name => {
                    THEMES[name] = this.customThemes[name];
                });
            }
        } catch (e) {
            console.error('Failed to load custom themes:', e);
        }
    },
    
    saveCustomThemes() {
        localStorage.setItem('retroplay-custom-themes', JSON.stringify(this.customThemes));
    },
    
    addCreatorButton() {
        // Wait for theme selector to exist
        const checkSelector = setInterval(() => {
            const themeSelector = document.querySelector('.theme-selector');
            if (themeSelector && !document.getElementById('create-theme-btn')) {
                clearInterval(checkSelector);
                
                // Add create button
                const createCard = document.createElement('button');
                createCard.id = 'create-theme-btn';
                createCard.className = 'theme-card theme-card-create';
                createCard.innerHTML = `
                    <div class="theme-preview">
                        <div class="theme-color" style="background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1)"></div>
                    </div>
                    <div class="theme-name">+ Create Theme</div>
                    <div class="theme-description">Design your own colors</div>
                `;
                createCard.onclick = () => this.showCreator();
                themeSelector.appendChild(createCard);
                
                // Add custom theme cards
                this.renderCustomThemeCards();
            }
        }, 500);
    },
    
    renderCustomThemeCards() {
        const themeSelector = document.querySelector('.theme-selector');
        if (!themeSelector) return;
        
        // Remove existing custom theme cards
        themeSelector.querySelectorAll('.custom-theme-card').forEach(el => el.remove());
        
        // Add custom themes
        Object.entries(this.customThemes).forEach(([name, theme]) => {
            const card = document.createElement('button');
            card.className = 'theme-card custom-theme-card';
            card.setAttribute('data-theme', name);
            card.innerHTML = `
                <div class="theme-preview">
                    <div class="theme-color" style="background: ${theme.primary}"></div>
                    <div class="theme-color" style="background: ${theme.secondary}"></div>
                    <div class="theme-color" style="background: ${theme.bgDark}"></div>
                </div>
                <div class="theme-name">${name}</div>
                <div class="theme-description">Custom theme</div>
                <button class="theme-delete-btn" title="Delete theme">×</button>
                <button class="theme-share-btn" title="Share theme">↗</button>
            `;
            
            card.onclick = (e) => {
                if (e.target.classList.contains('theme-delete-btn')) {
                    e.stopPropagation();
                    this.deleteTheme(name);
                } else if (e.target.classList.contains('theme-share-btn')) {
                    e.stopPropagation();
                    this.shareTheme(name);
                } else {
                    applyTheme(name);
                }
            };
            
            // Insert before create button
            const createBtn = document.getElementById('create-theme-btn');
            if (createBtn) {
                themeSelector.insertBefore(card, createBtn);
            } else {
                themeSelector.appendChild(card);
            }
        });
    },
    
    showCreator() {
        const modal = document.createElement('div');
        modal.className = 'custom-modal-overlay theme-creator-modal';
        modal.innerHTML = `
            <div class="theme-creator">
                <div class="theme-creator-header">
                    <h2>🎨 Create Custom Theme</h2>
                    <button class="theme-creator-close">×</button>
                </div>
                <div class="theme-creator-body">
                    <div class="theme-creator-preview">
                        <div class="preview-sidebar"></div>
                        <div class="preview-main">
                            <div class="preview-header"></div>
                            <div class="preview-content">
                                <div class="preview-card"></div>
                                <div class="preview-card"></div>
                            </div>
                        </div>
                        <div class="preview-vinyl">
                            <div class="preview-disc"></div>
                        </div>
                    </div>
                    <div class="theme-creator-controls">
                        <div class="color-input-group">
                            <label>Theme Name</label>
                            <input type="text" id="theme-name-input" placeholder="My Theme" maxlength="20">
                        </div>
                        <div class="color-input-group">
                            <label>Primary Color</label>
                            <div class="color-input-wrapper">
                                <input type="color" id="theme-primary" value="#EC4899">
                                <input type="text" id="theme-primary-hex" value="#EC4899" maxlength="7">
                            </div>
                        </div>
                        <div class="color-input-group">
                            <label>Secondary Color</label>
                            <div class="color-input-wrapper">
                                <input type="color" id="theme-secondary" value="#8B5CF6">
                                <input type="text" id="theme-secondary-hex" value="#8B5CF6" maxlength="7">
                            </div>
                        </div>
                        <div class="color-input-group">
                            <label>Background Dark</label>
                            <div class="color-input-wrapper">
                                <input type="color" id="theme-bg-dark" value="#0A0E27">
                                <input type="text" id="theme-bg-dark-hex" value="#0A0E27" maxlength="7">
                            </div>
                        </div>
                        <div class="color-input-group">
                            <label>Background Mid</label>
                            <div class="color-input-wrapper">
                                <input type="color" id="theme-bg-mid" value="#1A1F3A">
                                <input type="text" id="theme-bg-mid-hex" value="#1A1F3A" maxlength="7">
                            </div>
                        </div>
                        <div class="color-input-group">
                            <label>Background Light</label>
                            <div class="color-input-wrapper">
                                <input type="color" id="theme-bg-light" value="#2A2F4A">
                                <input type="text" id="theme-bg-light-hex" value="#2A2F4A" maxlength="7">
                            </div>
                        </div>
                        <div class="theme-import-section">
                            <label>Import Theme Code</label>
                            <div class="import-wrapper">
                                <input type="text" id="theme-import-code" placeholder="Paste theme code here...">
                                <button id="theme-import-btn">Import</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="theme-creator-footer">
                    <button class="btn-secondary" id="theme-cancel-btn">Cancel</button>
                    <button class="btn-primary" id="theme-save-btn">Save Theme</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupCreatorEvents(modal);
        this.updatePreview(modal);
    },
    
    setupCreatorEvents(modal) {
        // Close button
        modal.querySelector('.theme-creator-close').onclick = () => modal.remove();
        modal.querySelector('#theme-cancel-btn').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        // Color inputs sync
        const colorInputs = ['primary', 'secondary', 'bg-dark', 'bg-mid', 'bg-light'];
        colorInputs.forEach(name => {
            const colorInput = modal.querySelector(`#theme-${name}`);
            const hexInput = modal.querySelector(`#theme-${name}-hex`);
            
            colorInput.oninput = () => {
                hexInput.value = colorInput.value.toUpperCase();
                this.updatePreview(modal);
            };
            
            hexInput.oninput = () => {
                if (/^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) {
                    colorInput.value = hexInput.value;
                    this.updatePreview(modal);
                }
            };
        });
        
        // Save button
        modal.querySelector('#theme-save-btn').onclick = () => this.saveTheme(modal);
        
        // Import button
        modal.querySelector('#theme-import-btn').onclick = () => this.importTheme(modal);
    },
    
    updatePreview(modal) {
        const primary = modal.querySelector('#theme-primary').value;
        const secondary = modal.querySelector('#theme-secondary').value;
        const bgDark = modal.querySelector('#theme-bg-dark').value;
        const bgMid = modal.querySelector('#theme-bg-mid').value;
        const bgLight = modal.querySelector('#theme-bg-light').value;
        
        const preview = modal.querySelector('.theme-creator-preview');
        preview.style.setProperty('--preview-primary', primary);
        preview.style.setProperty('--preview-secondary', secondary);
        preview.style.setProperty('--preview-bg-dark', bgDark);
        preview.style.setProperty('--preview-bg-mid', bgMid);
        preview.style.setProperty('--preview-bg-light', bgLight);
        
        // Update preview elements
        preview.querySelector('.preview-sidebar').style.background = bgMid;
        preview.querySelector('.preview-main').style.background = bgDark;
        preview.querySelector('.preview-header').style.background = `linear-gradient(90deg, ${primary}, ${secondary})`;
        preview.querySelectorAll('.preview-card').forEach(card => {
            card.style.background = bgLight;
            card.style.borderColor = primary + '40';
        });
        preview.querySelector('.preview-vinyl').style.background = bgMid;
        preview.querySelector('.preview-disc').style.background = `conic-gradient(${primary}, ${secondary}, ${primary})`;
    },
    
    saveTheme(modal) {
        const name = modal.querySelector('#theme-name-input').value.trim();
        if (!name) {
            showAlert('Please enter a theme name', 'warning');
            return;
        }
        
        if (THEMES[name] && !this.customThemes[name]) {
            showAlert('Cannot overwrite built-in themes', 'error');
            return;
        }
        
        const theme = {
            primary: modal.querySelector('#theme-primary').value,
            secondary: modal.querySelector('#theme-secondary').value,
            bgDark: modal.querySelector('#theme-bg-dark').value,
            bgMid: modal.querySelector('#theme-bg-mid').value,
            bgLight: modal.querySelector('#theme-bg-light').value
        };
        
        this.customThemes[name] = theme;
        THEMES[name] = theme;
        this.saveCustomThemes();
        this.renderCustomThemeCards();
        
        modal.remove();
        applyTheme(name);
        showAlert(`Theme "${name}" saved!`, 'success');
    },
    
    deleteTheme(name) {
        showConfirm(`Delete theme "${name}"?`, () => {
            delete this.customThemes[name];
            delete THEMES[name];
            this.saveCustomThemes();
            this.renderCustomThemeCards();
            
            // Switch to default if current theme was deleted
            if (localStorage.getItem('retroplay-theme') === name) {
                applyTheme('synthwave');
            }
            showAlert('Theme deleted', 'success');
        });
    },
    
    shareTheme(name) {
        const theme = this.customThemes[name];
        if (!theme) return;
        
        const code = btoa(JSON.stringify({ name, ...theme }));
        
        // Copy to clipboard
        navigator.clipboard.writeText(code).then(() => {
            showAlert('Theme code copied to clipboard! Share it with friends.', 'success');
        }).catch(() => {
            // Fallback
            prompt('Copy this theme code:', code);
        });
    },
    
    importTheme(modal) {
        const code = modal.querySelector('#theme-import-code').value.trim();
        if (!code) {
            showAlert('Please paste a theme code', 'warning');
            return;
        }
        
        try {
            const data = JSON.parse(atob(code));
            if (!data.name || !data.primary || !data.secondary) {
                throw new Error('Invalid theme data');
            }
            
            // Fill in the form
            modal.querySelector('#theme-name-input').value = data.name;
            modal.querySelector('#theme-primary').value = data.primary;
            modal.querySelector('#theme-primary-hex').value = data.primary;
            modal.querySelector('#theme-secondary').value = data.secondary;
            modal.querySelector('#theme-secondary-hex').value = data.secondary;
            modal.querySelector('#theme-bg-dark').value = data.bgDark || '#0A0E27';
            modal.querySelector('#theme-bg-dark-hex').value = data.bgDark || '#0A0E27';
            modal.querySelector('#theme-bg-mid').value = data.bgMid || '#1A1F3A';
            modal.querySelector('#theme-bg-mid-hex').value = data.bgMid || '#1A1F3A';
            modal.querySelector('#theme-bg-light').value = data.bgLight || '#2A2F4A';
            modal.querySelector('#theme-bg-light-hex').value = data.bgLight || '#2A2F4A';
            
            this.updatePreview(modal);
            showAlert('Theme imported! Click Save to add it.', 'success');
        } catch (e) {
            showAlert('Invalid theme code', 'error');
        }
    }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    MiniPlayer.init();
    ThemeCreator.init();
    
    // Hook into song changes
    const originalPlaySong = window.playSong;
    if (originalPlaySong) {
        window.playSong = function(song) {
            originalPlaySong.apply(this, arguments);
            MiniPlayer.updateSongInfo(song);
            MiniPlayer.updatePiP(); // Also update PiP window
        };
    }
    
    // Keyboard shortcut for PiP (Ctrl+Shift+P)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            if (MiniPlayer.pipSupported) {
                MiniPlayer.openPiP();
            } else {
                MiniPlayer.toggle();
            }
        }
    });
});

// Export for global access
window.MiniPlayer = MiniPlayer;
window.ThemeCreator = ThemeCreator;
