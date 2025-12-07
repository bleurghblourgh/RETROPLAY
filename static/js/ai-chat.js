// AI Chat Functionality

let aiChatHistory = [];

// Load AI chat when tab opens
document.addEventListener('DOMContentLoaded', () => {
    const aiChatBtn = document.querySelector('[data-tab="ai-chat"]');
    if (aiChatBtn) {
        aiChatBtn.addEventListener('click', () => {
            loadAIChatStats();
        });
    }
});

// Load AI chat statistics
async function loadAIChatStats() {
    try {
        const response = await fetch('/api/profile/stats');
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('ai-total-songs').textContent = result.stats.totalSongs || 0;
            document.getElementById('ai-total-playlists').textContent = result.stats.totalPlaylists || 0;
        }
        
        // Load top genre
        const songsResponse = await fetch('/api/library/songs');
        const songsResult = await songsResponse.json();
        
        if (songsResult.success && songsResult.songs.length > 0) {
            const genres = {};
            songsResult.songs.forEach(song => {
                if (song.genre) {
                    genres[song.genre] = (genres[song.genre] || 0) + 1;
                }
            });
            
            const topGenre = Object.keys(genres).reduce((a, b) => 
                genres[a] > genres[b] ? a : b, Object.keys(genres)[0]
            );
            
            document.getElementById('ai-top-genre').textContent = topGenre || '-';
        }
    } catch (error) {
        console.error('Error loading AI chat stats:', error);
    }
}

// Send AI message
async function sendAIMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addAIMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    const typingId = addTypingIndicator();
    
    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        const result = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator(typingId);
        
        if (result.success) {
            addAIMessage(result.response, 'assistant');
            
            // If response mentions recommendations, load them
            if (result.response.toLowerCase().includes('recommend')) {
                loadAIRecommendations();
            }
        } else {
            // Show the actual error message
            addAIMessage('Error: ' + (result.message || 'Unknown error. Check server console.'), 'assistant');
        }
    } catch (error) {
        console.error('AI chat error:', error);
        removeTypingIndicator(typingId);
        addAIMessage('Sorry, I\'m having trouble connecting. Please try again.', 'assistant');
    }
}

// Add message to chat
function addAIMessage(content, type) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    
    if (!messagesContainer) {
        console.error('AI chat messages container not found');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ai-message-${type}`;
    
    const avatar = type === 'assistant' ? '🤖' : '👤';
    
    // Format content - preserve line breaks and basic formatting
    let formattedContent = content;
    if (type === 'assistant') {
        // Convert line breaks to <br>
        formattedContent = content
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/• /g, '&bull; ');
    } else {
        formattedContent = escapeHtml(content);
    }
    
    messageDiv.innerHTML = `
        <div class="ai-message-avatar">${avatar}</div>
        <div class="ai-message-content">
            <p>${formattedContent}</p>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    aiChatHistory.push({ type, content, timestamp: new Date() });
}

// Add typing indicator
function addTypingIndicator() {
    const messagesContainer = document.getElementById('ai-chat-messages');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message ai-message-assistant';
    typingDiv.id = 'ai-typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="ai-message-avatar">🤖</div>
        <div class="ai-message-content">
            <p>Thinking<span class="typing-dots">...</span></p>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return 'ai-typing-indicator';
}

// Remove typing indicator
function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) {
        indicator.remove();
    }
}

// Quick actions
async function aiQuickAction(action) {
    const messages = {
        'recommend': 'Can you recommend some songs for me?',
        'analyze': 'Analyze my music library and tell me about my taste',
        'playlist': 'Help me create a new playlist',
        'mood': 'What\'s the overall mood of my music collection?'
    };
    
    const message = messages[action];
    if (message) {
        document.getElementById('ai-chat-input').value = message;
        sendAIMessage();
    }
}

// Load AI recommendations
async function loadAIRecommendations() {
    try {
        const response = await fetch('/api/ai/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ basedOn: 'library' })
        });
        
        const result = await response.json();
        
        if (result.success && result.recommendations.length > 0) {
            const recommendationsPanel = document.getElementById('ai-recommendations');
            const songsList = document.getElementById('ai-recommended-songs');
            
            songsList.innerHTML = result.recommendations.map(song => `
                <div class="recommended-song-item" onclick="playSong(${song.songId})">
                    <div class="recommended-song-title">${escapeHtml(song.title)}</div>
                    <div class="recommended-song-artist">${escapeHtml(song.artist || 'Unknown Artist')}</div>
                </div>
            `).join('');
            
            recommendationsPanel.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading recommendations:', error);
    }
}

// Analyze specific song
async function analyzeSongWithAI(songId) {
    try {
        const response = await fetch(`/api/ai/analyze-song/${songId}`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            addAIMessage(result.description, 'assistant');
        }
    } catch (error) {
        console.error('Error analyzing song:', error);
    }
}

// Clear AI chat history
function clearAIChat() {
    showConfirm('Clear chat history?', function() {
        fetch('/api/ai/clear', { method: 'POST' })
            .then(function() {
                // Clear the UI
                const messagesContainer = document.getElementById('ai-chat-messages');
                messagesContainer.innerHTML = `
                    <div class="ai-message ai-message-assistant">
                        <div class="ai-message-avatar">🤖</div>
                        <div class="ai-message-content">
                            <p>Hey there! 🎵 I'm your RETROPLAY AI assistant. I can help you:</p>
                            <ul>
                                <li>Discover new music based on your taste</li>
                                <li>Analyze songs and describe their mood</li>
                                <li>Create personalized playlists</li>
                                <li>Get recommendations from your library</li>
                            </ul>
                            <p>What would you like to do today?</p>
                        </div>
                    </div>
                `;
                aiChatHistory = [];
            })
            .catch(function(error) {
                console.error('Error clearing chat:', error);
            });
    });
}

// Make functions global
window.sendAIMessage = sendAIMessage;
window.aiQuickAction = aiQuickAction;
window.loadAIRecommendations = loadAIRecommendations;
window.analyzeSongWithAI = analyzeSongWithAI;
window.clearAIChat = clearAIChat;
