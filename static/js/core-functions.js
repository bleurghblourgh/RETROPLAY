/**
 * RETROPLAY Core Functions - Theme System
 * This file MUST load before app.js
 */

console.log('Loading core-functions.js...');

// Theme definitions
var THEMES = {
    synthwave: {
        primary: '#EC4899',
        secondary: '#8B5CF6',
        bgDark: '#0A0E27',
        bgMid: '#1A1F3A',
        bgLight: '#2A2F4A'
    },
    neon: {
        primary: '#00FF88',
        secondary: '#FF00FF',
        bgDark: '#0D0D0D',
        bgMid: '#1A1A1A',
        bgLight: '#2D2D2D'
    },
    vaporwave: {
        primary: '#FF71CE',
        secondary: '#01CDFE',
        bgDark: '#1A0A2E',
        bgMid: '#2D1B4E',
        bgLight: '#3D2B5E'
    },
    arcade: {
        primary: '#FFD700',
        secondary: '#FF4500',
        bgDark: '#1A0000',
        bgMid: '#2D1010',
        bgLight: '#3D2020'
    },
    cyberpunk: {
        primary: '#F9E900',
        secondary: '#FF003C',
        bgDark: '#0D0221',
        bgMid: '#1A0A3E',
        bgLight: '#2A1A4E'
    },
    miami: {
        primary: '#FF6B9D',
        secondary: '#00D4AA',
        bgDark: '#0A1628',
        bgMid: '#162447',
        bgLight: '#1F4068'
    },
    terminal: {
        primary: '#00FF00',
        secondary: '#00CC00',
        bgDark: '#000000',
        bgMid: '#0A0A0A',
        bgLight: '#1A1A1A'
    },
    sunset: {
        primary: '#FF6B35',
        secondary: '#F7931E',
        bgDark: '#1A0A0A',
        bgMid: '#2D1515',
        bgLight: '#3D2525'
    }
};


// THE applyTheme function - this is the one that actually works
function applyTheme(themeName) {
    console.log('applyTheme called:', themeName);
    
    var theme = THEMES[themeName];
    if (!theme) {
        console.log('Theme not found, using synthwave');
        themeName = 'synthwave';
        theme = THEMES.synthwave;
    }
    
    // Apply CSS variables to root
    var root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--bg-dark', theme.bgDark);
    root.style.setProperty('--bg-mid', theme.bgMid);
    root.style.setProperty('--bg-light', theme.bgLight);
    root.style.setProperty('--glow-color', theme.primary);
    root.style.setProperty('--shadow', theme.primary + '4D');
    root.style.setProperty('--logo-gradient', 'linear-gradient(135deg, ' + theme.primary + ', ' + theme.secondary + ')');
    
    // Set data-theme attribute
    root.setAttribute('data-theme', themeName);
    
    // Save to localStorage
    localStorage.setItem('retroplay-theme', themeName);
    
    // Update theme card active states
    var cards = document.querySelectorAll('.theme-card');
    cards.forEach(function(card) {
        card.classList.remove('active');
        if (card.getAttribute('data-theme') === themeName) {
            card.classList.add('active');
        }
    });
    
    console.log('Theme applied successfully:', themeName);
}

// Make it globally available immediately
window.applyTheme = applyTheme;

// Apply saved theme on load AND attach click handlers directly to buttons
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded in core-functions.js');
    
    // Apply saved theme
    var savedTheme = localStorage.getItem('retroplay-theme') || 'synthwave';
    console.log('Applying saved theme:', savedTheme);
    applyTheme(savedTheme);
    
    // DIRECTLY attach click handlers to each theme card button
    var themeCards = document.querySelectorAll('.theme-card');
    console.log('Found', themeCards.length, 'theme cards');
    
    themeCards.forEach(function(card) {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var themeName = this.getAttribute('data-theme');
            console.log('Theme button clicked:', themeName);
            if (themeName) {
                applyTheme(themeName);
            }
        });
    });
});

// ALSO handle via event delegation as backup
document.addEventListener('click', function(e) {
    var card = e.target.closest('.theme-card');
    if (card) {
        var themeName = card.getAttribute('data-theme');
        if (themeName) {
            console.log('Theme card clicked via delegation:', themeName);
            e.preventDefault();
            e.stopPropagation();
            applyTheme(themeName);
        }
    }
});

console.log('core-functions.js loaded - applyTheme is ready');


// ============================================
// CUSTOM MODAL SYSTEM (replaces alert/confirm)
// ============================================

function showAlert(message, type, callback) {
    type = type || 'info';
    var icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    var modal = document.createElement('div');
    modal.className = 'custom-modal-overlay';
    modal.innerHTML = 
        '<div class="custom-modal">' +
            '<div class="custom-modal-icon custom-modal-icon-' + type + '">' + icons[type] + '</div>' +
            '<div class="custom-modal-message">' + message + '</div>' +
            '<div class="custom-modal-buttons">' +
                '<button type="button" class="custom-modal-btn custom-modal-btn-primary">OK</button>' +
            '</div>' +
        '</div>';
    
    document.body.appendChild(modal);
    
    // Focus the button
    modal.querySelector('button').focus();
    
    // Close handlers
    function closeModal() {
        modal.remove();
        if (callback) callback();
    }
    
    modal.querySelector('.custom-modal-btn-primary').onclick = closeModal;
    modal.onclick = function(e) {
        if (e.target === modal) closeModal();
    };
}

function showConfirm(message, onConfirm, onCancel) {
    var modal = document.createElement('div');
    modal.className = 'custom-modal-overlay';
    modal.innerHTML = 
        '<div class="custom-modal">' +
            '<div class="custom-modal-icon custom-modal-icon-warning">?</div>' +
            '<div class="custom-modal-message">' + message + '</div>' +
            '<div class="custom-modal-buttons">' +
                '<button type="button" class="custom-modal-btn custom-modal-btn-secondary">Cancel</button>' +
                '<button type="button" class="custom-modal-btn custom-modal-btn-primary">Confirm</button>' +
            '</div>' +
        '</div>';
    
    document.body.appendChild(modal);
    
    // Focus confirm button
    modal.querySelectorAll('button')[1].focus();
    
    function closeModal() {
        modal.remove();
    }
    
    modal.querySelector('.custom-modal-btn-primary').onclick = function() {
        closeModal();
        if (onConfirm) onConfirm();
    };
    
    modal.querySelector('.custom-modal-btn-secondary').onclick = function() {
        closeModal();
        if (onCancel) onCancel();
    };
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeModal();
            if (onCancel) onCancel();
        }
    };
}

window.showAlert = showAlert;
window.showConfirm = showConfirm;


// ============================================
// REMOVE DUPLICATES FEATURE
// ============================================

function removeDuplicates() {
    showConfirm(
        'This will remove duplicate songs from your library (keeping the oldest copy of each). Continue?',
        function() {
            // User confirmed
            fetch('/api/library/duplicates', { method: 'DELETE' })
                .then(function(response) { return response.json(); })
                .then(function(result) {
                    if (result.success) {
                        var count = result.deletedCount;
                        if (count > 0) {
                            showAlert('Removed ' + count + ' duplicate song(s)!', 'success', function() {
                                // Reload the library
                                if (typeof loadLibrary === 'function') {
                                    loadLibrary();
                                } else if (typeof window.loadLibrary === 'function') {
                                    window.loadLibrary();
                                } else {
                                    location.reload();
                                }
                            });
                        } else {
                            showAlert('No duplicates found!', 'info');
                        }
                    } else {
                        showAlert('Error: ' + (result.message || 'Failed to remove duplicates'), 'error');
                    }
                })
                .catch(function(error) {
                    console.error('Remove duplicates error:', error);
                    showAlert('Error removing duplicates', 'error');
                });
        }
    );
}

// Attach click handler for remove duplicates button
document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('remove-duplicates-btn');
    if (btn) {
        btn.addEventListener('click', removeDuplicates);
    }
});

window.removeDuplicates = removeDuplicates;
