/**
 * RETROPLAY Social Features
 * - Public playlists
 * - Activity feed
 * - Share links
 */

// ============================================
// ACTIVITY TRACKING
// ============================================

let currentlyListening = null;

function updateListeningActivity(song) {
    if (!song) return;
    
    currentlyListening = {
        songId: song.songId,
        title: song.title,
        artist: song.artist,
        timestamp: Date.now()
    };
    
    // Update server (fire and forget)
    fetch('/api/activity/listening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentlyListening)
    }).catch(() => {});
}

// Hook into playSong
const originalPlaySong = window.playSong;
if (originalPlaySong) {
    window.playSong = function(song) {
        originalPlaySong(song);
        updateListeningActivity(song);
    };
}

// ============================================
// SHARE PLAYLIST
// ============================================

async function sharePlaylist(playlistId) {
    try {
        // Make playlist public
        const response = await fetch(`/api/playlists/${playlistId}/share`, {
            method: 'POST'
        });
        const result = await response.json();
        
        if (result.success) {
            const shareUrl = `${window.location.origin}/shared/playlist/${result.shareCode}`;
            
            // Copy to clipboard
            await navigator.clipboard.writeText(shareUrl);
            showNotification('Share link copied!', 'success');
            
            // Show share modal
            showShareModal(shareUrl);
        }
    } catch (error) {
        console.error('Error sharing playlist:', error);
        showNotification('Failed to share', 'error');
    }
}

function showShareModal(url) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 450px;">
            <div class="modal-header">
                <h2>🔗 Share Playlist</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 1rem; color: var(--text-secondary);">
                    Share this link with friends:
                </p>
                <div class="share-url-box">
                    <input type="text" value="${url}" readonly id="share-url-input" class="share-url-input">
                    <button class="btn-primary" onclick="copyShareUrl()">Copy</button>
                </div>
                <div class="share-buttons" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="share-btn" onclick="shareToTwitter('${url}')">
                        🐦 Twitter
                    </button>
                    <button class="share-btn" onclick="shareToWhatsApp('${url}')">
                        💬 WhatsApp
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function copyShareUrl() {
    const input = document.getElementById('share-url-input');
    input.select();
    navigator.clipboard.writeText(input.value);
    showNotification('Copied!', 'success');
}

function shareToTwitter(url) {
    window.open(`https://twitter.com/intent/tweet?text=Check out my playlist!&url=${encodeURIComponent(url)}`, '_blank');
}

function shareToWhatsApp(url) {
    window.open(`https://wa.me/?text=Check out my playlist! ${encodeURIComponent(url)}`, '_blank');
}

// ============================================
// ACTIVITY FEED
// ============================================

async function loadActivityFeed() {
    try {
        const response = await fetch('/api/activity/feed');
        const result = await response.json();
        
        if (result.success) {
            displayActivityFeed(result.activities);
        }
    } catch (error) {
        console.error('Error loading activity:', error);
    }
}

function displayActivityFeed(activities) {
    const feedContainer = document.getElementById('activity-feed');
    if (!feedContainer) return;
    
    if (!activities || activities.length === 0) {
        feedContainer.innerHTML = '<div class="empty-feed">No recent activity</div>';
        return;
    }
    
    feedContainer.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-avatar">${activity.username.charAt(0).toUpperCase()}</div>
            <div class="activity-content">
                <span class="activity-user">${escapeHtml(activity.username)}</span>
                <span class="activity-action">${activity.action}</span>
                <span class="activity-target">${escapeHtml(activity.target)}</span>
            </div>
            <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
        </div>
    `).join('');
}

function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

// ============================================
// ADD SHARE BUTTON TO PLAYLIST CONTEXT MENU
// ============================================

function addShareToContextMenu() {
    const originalHandleAction = window.handleContextMenuAction;
    
    if (originalHandleAction) {
        window.handleContextMenuAction = async function(e) {
            const action = e.currentTarget.dataset.action;
            
            if (action === 'share-playlist') {
                const playlistId = window.contextMenuTarget?.dataset?.playlistId;
                if (playlistId) {
                    sharePlaylist(playlistId);
                }
                hideContextMenu();
                return;
            }
            
            return originalHandleAction.call(this, e);
        };
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        addShareToContextMenu();
        console.log('[Social] Features initialized');
    }, 2000);
});

// Make functions global
window.sharePlaylist = sharePlaylist;
window.copyShareUrl = copyShareUrl;
window.shareToTwitter = shareToTwitter;
window.shareToWhatsApp = shareToWhatsApp;
