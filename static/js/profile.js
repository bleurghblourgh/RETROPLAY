// Profile System

async function loadUserProfile() {
    try {
        const response = await fetch('/api/profile');
        const result = await response.json();
        
        if (result.success) {
            displayProfile(result.profile);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function displayProfile(profile) {
    // Update sidebar user info
    const sidebarUsername = document.getElementById('sidebar-username');
    if (sidebarUsername) {
        sidebarUsername.textContent = profile.username;
    }
    
    // Update settings profile info
    const settingsUsername = document.getElementById('settings-username');
    const settingsEmail = document.getElementById('settings-email');
    
    if (settingsUsername) settingsUsername.textContent = profile.username;
    if (settingsEmail) settingsEmail.textContent = profile.email;
    
    // Update profile picture if exists
    if (profile.profilePicture) {
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
            userAvatar.style.backgroundImage = `url(${profile.profilePicture})`;
            userAvatar.style.backgroundSize = 'cover';
            userAvatar.textContent = '';
        }
    }
}

async function showProfileModal() {
    // Load fresh profile data
    try {
        const response = await fetch('/api/profile');
        const result = await response.json();
        
        if (!result.success) {
            showNotification('Failed to load profile', 'error');
            return;
        }
        
        const profile = result.profile;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content profile-modal">
                <div class="modal-header">
                    <h2>Edit Your Profile</h2>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="profile-section">
                        <div class="profile-avatar-section">
                            <div class="profile-avatar-large" id="profile-avatar-preview">
                                ${profile.profilePicture ? 
                                    `<img src="${profile.profilePicture}" alt="Profile">` :
                                    `<div class="avatar-placeholder">${profile.username.charAt(0).toUpperCase()}</div>`
                                }
                            </div>
                            <button class="btn-secondary" onclick="uploadProfilePicture()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke-width="2"/>
                                    <circle cx="12" cy="13" r="4" stroke-width="2"/>
                                </svg>
                                Change Photo
                            </button>
                            <input type="file" id="profile-picture-input" accept="image/*" style="display: none;">
                        </div>
                        
                        <div class="profile-info-section">
                            <div class="input-group">
                                <label>Username</label>
                                <input type="text" id="profile-username" value="${escapeHtml(profile.username)}" readonly>
                                <small>Username cannot be changed</small>
                            </div>
                            
                            <div class="input-group">
                                <label>Email</label>
                                <input type="email" id="profile-email" value="${escapeHtml(profile.email)}" readonly>
                                <small>Email cannot be changed</small>
                            </div>
                            
                            <div class="input-group">
                                <label>Bio</label>
                                <textarea id="profile-bio" placeholder="Tell us about yourself..." rows="3" maxlength="500">${escapeHtml(profile.bio || '')}</textarea>
                                <small>Max 500 characters</small>
                            </div>
                            
                            <div class="input-group">
                                <label>Favorite Genres</label>
                                <input type="text" id="profile-genres" placeholder="Rock, Jazz, Electronic..." value="${escapeHtml(profile.favoriteGenres || '')}">
                                <small>Separate with commas</small>
                            </div>
                            
                            <div class="input-group">
                                <label>
                                    <input type="checkbox" id="profile-public" ${profile.isPublic ? 'checked' : ''}>
                                    Make profile public
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-stats">
                        <div class="stat-card">
                            <div class="stat-value" id="profile-total-songs">0</div>
                            <div class="stat-label">Songs</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="profile-total-playlists">0</div>
                            <div class="stat-label">Playlists</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="profile-total-plays">0</div>
                            <div class="stat-label">Plays</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                    <button class="btn-primary" onclick="saveProfile()">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke-width="2"/>
                            <polyline points="17 21 17 13 7 13 7 21" stroke-width="2"/>
                            <polyline points="7 3 7 8 15 8" stroke-width="2"/>
                        </svg>
                        Save Changes
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Load profile stats
        loadProfileStats();
        
        // Setup profile picture upload
        document.getElementById('profile-picture-input').addEventListener('change', handleProfilePictureChange);
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Failed to load profile', 'error');
    }
}

function uploadProfilePicture() {
    document.getElementById('profile-picture-input').click();
}

function handleProfilePictureChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('profile-avatar-preview');
        preview.innerHTML = `<img src="${e.target.result}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    };
    reader.readAsDataURL(file);
}

async function saveProfile() {
    const bio = document.getElementById('profile-bio').value.trim();
    const genres = document.getElementById('profile-genres').value.trim();
    const isPublic = document.getElementById('profile-public').checked;
    const pictureInput = document.getElementById('profile-picture-input');
    
    // Validate bio length
    if (bio.length > 500) {
        showNotification('Bio is too long (max 500 characters)', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('favoriteGenres', genres);
    formData.append('isPublic', isPublic);
    
    if (pictureInput.files[0]) {
        formData.append('profilePicture', pictureInput.files[0]);
    }
    
    try {
        const response = await fetch('/api/profile', {
            method: 'PUT',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Profile updated successfully! 🎉', 'success');
            closeModal();
            
            // Reload profile data
            loadUserProfile();
            
            // If on profile tab, reload it
            const profileTab = document.getElementById('profile-tab');
            if (profileTab && profileTab.classList.contains('active')) {
                loadProfileTab();
            }
        } else {
            showNotification(result.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showNotification('Error saving profile', 'error');
    }
}

async function loadProfileStats() {
    try {
        const response = await fetch('/api/profile/stats');
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('profile-total-songs').textContent = result.stats.totalSongs || 0;
            document.getElementById('profile-total-playlists').textContent = result.stats.totalPlaylists || 0;
            document.getElementById('profile-total-plays').textContent = result.stats.totalPlays || 0;
        }
    } catch (error) {
        console.error('Error loading profile stats:', error);
    }
}

// Make functions global
window.loadUserProfile = loadUserProfile;
window.showProfileModal = showProfileModal;
window.uploadProfilePicture = uploadProfilePicture;
window.saveProfile = saveProfile;
