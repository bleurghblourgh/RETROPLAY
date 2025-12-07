/**
 * RETROPLAY Listening Stats Dashboard
 * - Total listening time
 * - Top artists/albums charts
 * - Listening history
 */

// ============================================
// STATS TAB SETUP
// ============================================

function setupStatsTab() {
    // Check if stats tab already exists
    if (document.getElementById('stats-tab')) return;
    
    // Add stats nav item
    const settingsNav = document.querySelector('.nav-item[data-tab="settings"]');
    if (settingsNav) {
        const statsNav = document.createElement('button');
        statsNav.className = 'nav-item';
        statsNav.dataset.tab = 'stats';
        statsNav.innerHTML = `
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 20V10M12 20V4M6 20v-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Stats</span>
        `;
        statsNav.addEventListener('click', () => switchTab('stats'));
        settingsNav.parentNode.insertBefore(statsNav, settingsNav);
    }
    
    // Add stats tab content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const statsTab = document.createElement('div');
        statsTab.className = 'tab-content';
        statsTab.id = 'stats-tab';
        statsTab.innerHTML = `
            <div class="content-header">
                <h1>📊 Your Listening Stats</h1>
                <div class="stats-period-selector">
                    <button class="period-btn active" data-period="week">Week</button>
                    <button class="period-btn" data-period="month">Month</button>
                    <button class="period-btn" data-period="year">Year</button>
                    <button class="period-btn" data-period="all">All Time</button>
                </div>
            </div>
            
            <div class="stats-grid">
                <!-- Overview Cards -->
                <div class="stats-overview">
                    <div class="stat-card">
                        <div class="stat-icon">🎵</div>
                        <div class="stat-value" id="stat-total-songs">0</div>
                        <div class="stat-label">Songs Played</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⏱️</div>
                        <div class="stat-value" id="stat-total-time">0h 0m</div>
                        <div class="stat-label">Listening Time</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🎤</div>
                        <div class="stat-value" id="stat-top-artist">-</div>
                        <div class="stat-label">Top Artist</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-value" id="stat-streak">0</div>
                        <div class="stat-label">Day Streak</div>
                    </div>
                </div>
                
                <!-- Top Artists -->
                <div class="stats-section">
                    <h3>🎤 Top Artists</h3>
                    <div class="top-list" id="top-artists-list">
                        <div class="loading-placeholder">Loading...</div>
                    </div>
                </div>
                
                <!-- Top Songs -->
                <div class="stats-section">
                    <h3>🎵 Most Played Songs</h3>
                    <div class="top-list" id="top-songs-list">
                        <div class="loading-placeholder">Loading...</div>
                    </div>
                </div>
                
                <!-- Listening Activity -->
                <div class="stats-section full-width">
                    <h3>📈 Listening Activity</h3>
                    <div class="activity-chart" id="activity-chart">
                        <div class="loading-placeholder">Loading...</div>
                    </div>
                </div>
            </div>
        `;
        mainContent.appendChild(statsTab);
        
        // Setup period selector
        statsTab.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                statsTab.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                loadStats(btn.dataset.period);
            });
        });
    }
    
    console.log('[Stats] Dashboard setup complete');
}

// ============================================
// LOAD STATS DATA
// ============================================

async function loadStats(period = 'week') {
    try {
        const response = await fetch(`/api/stats?period=${period}`);
        const result = await response.json();
        
        if (result.success) {
            displayStats(result.stats);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function displayStats(stats) {
    // Overview cards
    document.getElementById('stat-total-songs').textContent = stats.totalPlays || 0;
    
    const hours = Math.floor((stats.totalMinutes || 0) / 60);
    const mins = Math.round((stats.totalMinutes || 0) % 60);
    document.getElementById('stat-total-time').textContent = `${hours}h ${mins}m`;
    
    document.getElementById('stat-top-artist').textContent = stats.topArtist || '-';
    document.getElementById('stat-streak').textContent = stats.streak || 0;
    
    // Top Artists
    const artistsList = document.getElementById('top-artists-list');
    if (stats.topArtists && stats.topArtists.length > 0) {
        artistsList.innerHTML = stats.topArtists.slice(0, 5).map((artist, i) => `
            <div class="top-item">
                <span class="top-rank">${i + 1}</span>
                <div class="top-info">
                    <div class="top-name">${escapeHtml(artist.name)}</div>
                    <div class="top-plays">${artist.plays} plays</div>
                </div>
                <div class="top-bar">
                    <div class="top-bar-fill" style="width: ${(artist.plays / stats.topArtists[0].plays) * 100}%"></div>
                </div>
            </div>
        `).join('');
    } else {
        artistsList.innerHTML = '<div class="empty-stats">No data yet. Start listening!</div>';
    }
    
    // Top Songs
    const songsList = document.getElementById('top-songs-list');
    if (stats.topSongs && stats.topSongs.length > 0) {
        songsList.innerHTML = stats.topSongs.slice(0, 5).map((song, i) => `
            <div class="top-item" onclick="playSongById(${song.songId})">
                <span class="top-rank">${i + 1}</span>
                <div class="top-info">
                    <div class="top-name">${escapeHtml(song.title)}</div>
                    <div class="top-plays">${song.plays} plays • ${escapeHtml(song.artist || 'Unknown')}</div>
                </div>
                <div class="top-bar">
                    <div class="top-bar-fill" style="width: ${(song.plays / stats.topSongs[0].plays) * 100}%"></div>
                </div>
            </div>
        `).join('');
    } else {
        songsList.innerHTML = '<div class="empty-stats">No data yet. Start listening!</div>';
    }
    
    // Activity Chart
    displayActivityChart(stats.dailyActivity || []);
}

function displayActivityChart(dailyData) {
    const chart = document.getElementById('activity-chart');
    
    if (!dailyData || dailyData.length === 0) {
        chart.innerHTML = '<div class="empty-stats">No activity data yet</div>';
        return;
    }
    
    const maxPlays = Math.max(...dailyData.map(d => d.plays), 1);
    
    chart.innerHTML = `
        <div class="chart-bars">
            ${dailyData.map(day => `
                <div class="chart-bar-container">
                    <div class="chart-bar" style="height: ${(day.plays / maxPlays) * 100}%">
                        <span class="chart-tooltip">${day.plays} plays</span>
                    </div>
                    <div class="chart-label">${day.label}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        setupStatsTab();
    }, 2000);
});

// Load stats when tab is shown
const originalSwitchTab = window.switchTab;
window.switchTab = function(tabName) {
    if (originalSwitchTab) originalSwitchTab(tabName);
    if (tabName === 'stats') {
        loadStats('week');
    }
};
