// Context Menu System

let contextMenuTarget = null;
let contextMenuType = null;

function setupContextMenus() {
    const contextMenu = document.getElementById('context-menu');
    const playlistSubmenu = document.getElementById('playlist-submenu');
    
    // Close context menu on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.context-menu') && !e.target.closest('.song-card') && !e.target.closest('.playlist-card')) {
            hideContextMenu();
        }
    });
    
    // Handle context menu actions
    document.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', handleContextMenuAction);
    });
    
    // Show playlist submenu on hover
    const addToPlaylistItem = document.querySelector('[data-action="add-to-playlist"]');
    if (addToPlaylistItem) {
        addToPlaylistItem.addEventListener('mouseenter', showPlaylistSubmenu);
    }
}

function showContextMenu(e, target, type) {
    e.preventDefault();
    e.stopPropagation();
    
    const contextMenu = document.getElementById('context-menu');
    contextMenuTarget = target;
    contextMenuType = type;
    
    // Position context menu
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
    
    // Adjust if off screen
    const rect = contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        contextMenu.style.left = `${e.pageX - rect.width}px`;
    }
    if (rect.bottom > window.innerHeight) {
        contextMenu.style.top = `${e.pageY - rect.height}px`;
    }
    
    // Show/hide menu items based on type
    updateContextMenuItems(type);
}

function hideContextMenu() {
    document.getElementById('context-menu').style.display = 'none';
    document.getElementById('playlist-submenu').style.display = 'none';
    contextMenuTarget = null;
    contextMenuType = null;
}

function updateContextMenuItems(type) {
    // Show/hide song-only items
    document.querySelectorAll('.context-menu-item.song-only').forEach(item => {
        item.style.display = type === 'song' ? 'flex' : 'none';
    });
    
    // Show/hide playlist-only items
    document.querySelectorAll('.context-menu-item.playlist-only').forEach(item => {
        item.style.display = type === 'playlist' ? 'flex' : 'none';
    });
    
    // Delete is always visible
    const deleteItem = document.querySelector('[data-action="delete"]');
    if (deleteItem) {
        deleteItem.style.display = 'flex';
    }
    
    if (type !== 'song' && type !== 'playlist') {
        document.querySelectorAll('.context-menu-item.song-only').forEach(item => {
            item.style.display = 'none';
        });
        if (editImage) editImage.style.display = 'none';
    }
}

function showPlaylistSubmenu(e) {
    const submenu = document.getElementById('playlist-submenu');
    const parentItem = e.currentTarget;
    const rect = parentItem.getBoundingClientRect();
    
    // Load playlists
    loadPlaylistsForSubmenu();
    
    // Position submenu
    submenu.style.display = 'block';
    submenu.style.left = `${rect.right + 5}px`;
    submenu.style.top = `${rect.top}px`;
    
    // Adjust if off screen
    const submenuRect = submenu.getBoundingClientRect();
    if (submenuRect.right > window.innerWidth) {
        submenu.style.left = `${rect.left - submenuRect.width - 5}px`;
    }
}

async function loadPlaylistsForSubmenu() {
    try {
        const response = await fetch('/api/playlists');
        const result = await response.json();
        
        if (result.success) {
            const playlistList = document.getElementById('playlist-list');
            playlistList.innerHTML = result.playlists.map(playlist => `
                <div class="context-menu-item" data-action="add-to-playlist-${playlist.playlistId}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M15 6v12a3 3 0 1 0 3-3H15zM9 18a3 3 0 1 0 3-3H9v3z" stroke-width="2"/>
                    </svg>
                    <span>${escapeHtml(playlist.playlistName)}</span>
                </div>
            `).join('');
            
            // Add click handlers
            playlistList.querySelectorAll('.context-menu-item').forEach(item => {
                item.addEventListener('click', handleContextMenuAction);
            });
        }
    } catch (error) {
        console.error('Error loading playlists:', error);
    }
}

async function handleContextMenuAction(e) {
    const action = e.currentTarget.dataset.action;
    
    if (!action) return;
    
    if (action === 'edit-artist') {
        await editArtist();
    } else if (action === 'edit-image') {
        await editImage();
    } else if (action === 'delete') {
        await deleteItem();
    } else if (action === 'new-playlist') {
        hideContextMenu();
        showCreatePlaylistModal();
    } else if (action === 'play-playlist') {
        await playPlaylistFromMenu();
    } else if (action === 'rename-playlist') {
        await renamePlaylistFromMenu();
    } else if (action === 'play-next') {
        await playNextFromMenu();
    } else if (action === 'add-to-queue') {
        await addToQueueFromMenu();
    } else if (action === 'start-radio') {
        await startRadioFromMenu();
    } else if (action.startsWith('add-to-playlist-')) {
        const playlistId = action.replace('add-to-playlist-', '');
        await addToPlaylist(playlistId);
    }
    
    hideContextMenu();
}

async function startRadioFromMenu() {
    if (!contextMenuTarget) return;
    const songId = contextMenuTarget.dataset.songId;
    const song = (window.allSongs || []).find(s => s.songId == songId) ||
                (window.currentQueue || []).find(s => s.songId == songId);
    if (song && window.radioMode) {
        window.radioMode.startRadio(song);
    }
}

async function playNextFromMenu() {
    if (!contextMenuTarget) return;
    const songId = contextMenuTarget.dataset.songId;
    const song = (window.allSongs || []).find(s => s.songId == songId) ||
                (window.currentQueue || []).find(s => s.songId == songId);
    if (song && typeof playNextSong === 'function') {
        playNextSong(song);
    }
}

async function addToQueueFromMenu() {
    if (!contextMenuTarget) return;
    const songId = contextMenuTarget.dataset.songId;
    const song = (window.allSongs || []).find(s => s.songId == songId) ||
                (window.currentQueue || []).find(s => s.songId == songId);
    if (song && typeof addToQueue === 'function') {
        addToQueue(song);
    }
}

async function playPlaylistFromMenu() {
    if (!contextMenuTarget) return;
    const playlistId = contextMenuTarget.dataset.playlistId;
    if (playlistId && typeof playPlaylist === 'function') {
        playPlaylist(parseInt(playlistId));
    }
}

async function renamePlaylistFromMenu() {
    if (!contextMenuTarget) return;
    const playlistId = contextMenuTarget.dataset.playlistId;
    if (!playlistId) return;
    
    // Use showConfirm-style modal for rename
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h2>Rename Playlist</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="input-group">
                    <label>New Name</label>
                    <input type="text" id="rename-playlist-input" placeholder="Enter new name">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="submitRenamePlaylist(${playlistId})">Rename</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('rename-playlist-input').focus();
}

async function submitRenamePlaylist(playlistId) {
    const newName = document.getElementById('rename-playlist-input').value.trim();
    if (!newName) {
        showNotification('Please enter a name', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/playlists/${playlistId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName })
        });
        const result = await response.json();
        
        if (result.success) {
            showNotification('Playlist renamed!', 'success');
            closeModal();
            if (typeof loadPlaylists === 'function') loadPlaylists();
        } else {
            showNotification(result.message || 'Failed to rename', 'error');
        }
    } catch (error) {
        console.error('Error renaming playlist:', error);
        showNotification('Error renaming playlist', 'error');
    }
}

window.submitRenamePlaylist = submitRenamePlaylist;

async function editPlaylist() {
    if (!contextMenuTarget) return;
    
    const playlistId = contextMenuTarget.dataset.playlistId;
    
    // Get current playlist info
    try {
        const response = await fetch(`/api/playlists/${playlistId}`);
        const result = await response.json();
        
        if (result.success) {
            const playlist = result.playlist;
            
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Edit Playlist</h2>
                        <button class="modal-close" onclick="closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="input-group">
                            <label>Playlist Name</label>
                            <input type="text" id="edit-playlist-name" value="${escapeHtml(playlist.playlistName)}" autofocus>
                        </div>
                        <div class="input-group">
                            <label>Description</label>
                            <textarea id="edit-playlist-desc" rows="3">${escapeHtml(playlist.description || '')}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-primary" onclick="submitEditPlaylist(${playlistId})">Save Changes</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            setTimeout(() => document.getElementById('edit-playlist-name').focus(), 100);
        }
    } catch (error) {
        console.error('Error loading playlist:', error);
    }
}

async function submitEditPlaylist(playlistId) {
    const name = document.getElementById('edit-playlist-name').value.trim();
    const description = document.getElementById('edit-playlist-desc').value.trim();
    
    if (!name) {
        showNotification('Please enter a playlist name', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/playlists/${playlistId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Playlist updated successfully', 'success');
            loadPlaylists();
            closeModal();
        } else {
            showNotification('Failed to update playlist', 'error');
        }
    } catch (error) {
        console.error('Error updating playlist:', error);
        showNotification('Error updating playlist', 'error');
    }
}

// Make functions global
window.submitEditPlaylist = submitEditPlaylist;

async function editArtist() {
    if (!contextMenuTarget) return;
    
    const songId = contextMenuTarget.dataset.songId;
    const currentArtist = contextMenuTarget.querySelector('.song-artist')?.textContent || '';
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Artist</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="input-group">
                    <label>Artist Name</label>
                    <input type="text" id="artist-input" value="${escapeHtml(currentArtist)}" autofocus>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="submitEditArtist(${songId})">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => document.getElementById('artist-input').focus(), 100);
}

async function submitEditArtist(songId) {
    const artist = document.getElementById('artist-input').value.trim();
    
    if (!artist) {
        showNotification('Please enter an artist name', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/songs/${songId}/artist`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ artist })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Artist updated successfully', 'success');
            loadLibrary();
            closeModal();
        } else {
            showNotification('Failed to update artist', 'error');
        }
    } catch (error) {
        console.error('Error updating artist:', error);
        showNotification('Error updating artist', 'error');
    }
}

async function editImage() {
    if (!contextMenuTarget) return;
    
    const songId = contextMenuTarget.dataset.songId;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Change Image</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="input-group">
                    <label>Upload Image</label>
                    <input type="file" id="image-input" accept="image/*">
                </div>
                <div class="image-preview" id="image-preview"></div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn-primary" onclick="submitEditImage(${songId})">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Preview image
    document.getElementById('image-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('image-preview').innerHTML = `
                    <img src="${e.target.result}" style="max-width: 100%; border-radius: 8px;">
                `;
            };
            reader.readAsDataURL(file);
        }
    });
}

async function submitEditImage(songId) {
    const fileInput = document.getElementById('image-input');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Please select an image', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch(`/api/songs/${songId}/image`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Image updated successfully', 'success');
            loadLibrary();
            closeModal();
        } else {
            showNotification('Failed to update image', 'error');
        }
    } catch (error) {
        console.error('Error updating image:', error);
        showNotification('Error updating image', 'error');
    }
}

async function deleteItem() {
    if (!contextMenuTarget) return;
    
    const target = contextMenuTarget;
    const songId = target.dataset.songId;
    const playlistId = target.dataset.playlistId;
    
    // Use custom confirm modal
    if (typeof showConfirm === 'function') {
        showConfirm('Are you sure you want to delete this item?', async function() {
            await performDelete(songId, playlistId);
        });
    } else {
        // Fallback to native confirm
        if (!confirm('Are you sure you want to delete this item?')) return;
        await performDelete(songId, playlistId);
    }
}

async function performDelete(songId, playlistId) {
    try {
        let endpoint;
        if (songId) {
            endpoint = `/api/songs/${songId}`;
        } else if (playlistId) {
            endpoint = `/api/playlists/${playlistId}`;
        }
        
        const response = await fetch(endpoint, { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
            if (typeof showAlert === 'function') {
                showAlert('Deleted successfully!', 'success');
            } else {
                showNotification('Deleted successfully', 'success');
            }
            if (songId && typeof loadLibrary === 'function') loadLibrary();
            if (playlistId && typeof loadPlaylists === 'function') loadPlaylists();
        } else {
            if (typeof showAlert === 'function') {
                showAlert('Failed to delete', 'error');
            } else {
                showNotification('Failed to delete', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting:', error);
        showNotification('Error deleting item', 'error');
    }
}

async function addToPlaylist(playlistId) {
    if (!contextMenuTarget) return;
    
    const songId = contextMenuTarget.dataset.songId;
    
    try {
        const response = await fetch(`/api/playlists/${playlistId}/songs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ songId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Added to playlist', 'success');
        } else {
            showNotification(result.message || 'Failed to add to playlist', 'error');
        }
    } catch (error) {
        console.error('Error adding to playlist:', error);
        showNotification('Error adding to playlist', 'error');
    }
}

// Make functions global
window.submitEditArtist = submitEditArtist;
window.submitEditImage = submitEditImage;
window.showContextMenu = showContextMenu;
window.hideContextMenu = hideContextMenu;
window.setupContextMenus = setupContextMenus;
