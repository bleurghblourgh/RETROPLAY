/**
 * RETROPLAY Audio Waveform Display
 * - Generate waveform visualization
 * - Click to seek
 * - Real-time progress
 */

class WaveformDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.waveformData = [];
        this.progress = 0;
        this.isReady = false;
        
        if (this.container) {
            this.init();
        }
    }
    
    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'waveform-canvas';
        this.canvas.width = this.container.offsetWidth || 400;
        this.canvas.height = 60;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Click to seek
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Resize handler
        window.addEventListener('resize', () => this.resize());
        
        this.drawEmpty();
    }
    
    resize() {
        if (!this.canvas || !this.container) return;
        this.canvas.width = this.container.offsetWidth || 400;
        this.draw();
    }
    
    handleClick(e) {
        if (!audioPlayer || !audioPlayer.duration) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        
        audioPlayer.currentTime = percent * audioPlayer.duration;
    }
    
    // Generate waveform from audio buffer
    async generateFromUrl(url) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            this.generateFromBuffer(audioBuffer);
            audioContext.close();
        } catch (error) {
            console.log('[Waveform] Could not generate:', error);
            this.generateFakeWaveform();
        }
    }
    
    generateFromBuffer(audioBuffer) {
        const rawData = audioBuffer.getChannelData(0);
        const samples = 100;
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];
        
        for (let i = 0; i < samples; i++) {
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
                sum += Math.abs(rawData[i * blockSize + j]);
            }
            filteredData.push(sum / blockSize);
        }
        
        // Normalize
        const max = Math.max(...filteredData);
        this.waveformData = filteredData.map(v => v / max);
        this.isReady = true;
        this.draw();
    }
    
    generateFakeWaveform() {
        // Generate a random but smooth waveform
        this.waveformData = [];
        let value = 0.5;
        
        for (let i = 0; i < 100; i++) {
            value += (Math.random() - 0.5) * 0.3;
            value = Math.max(0.1, Math.min(1, value));
            this.waveformData.push(value);
        }
        
        this.isReady = true;
        this.draw();
    }
    
    setProgress(percent) {
        this.progress = percent;
        this.draw();
    }
    
    draw() {
        if (!this.ctx || !this.canvas) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barWidth = width / this.waveformData.length;
        const gap = 2;
        
        // Clear
        this.ctx.clearRect(0, 0, width, height);
        
        // Get theme colors
        const style = getComputedStyle(document.documentElement);
        const primaryColor = style.getPropertyValue('--primary').trim() || '#EC4899';
        const secondaryColor = style.getPropertyValue('--text-secondary').trim() || '#666';
        
        // Draw bars
        this.waveformData.forEach((value, i) => {
            const x = i * barWidth;
            const barHeight = value * (height - 10);
            const y = (height - barHeight) / 2;
            
            // Color based on progress
            const progressX = (this.progress / 100) * width;
            this.ctx.fillStyle = x < progressX ? primaryColor : secondaryColor;
            
            this.ctx.fillRect(x + gap/2, y, barWidth - gap, barHeight);
        });
        
        // Draw progress line
        if (this.progress > 0) {
            const progressX = (this.progress / 100) * width;
            this.ctx.strokeStyle = primaryColor;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(progressX, 0);
            this.ctx.lineTo(progressX, height);
            this.ctx.stroke();
        }
    }
    
    drawEmpty() {
        if (!this.ctx || !this.canvas) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, height/2 - 2, width, 4);
    }
    
    clear() {
        this.waveformData = [];
        this.progress = 0;
        this.isReady = false;
        this.drawEmpty();
    }
}

// ============================================
// SETUP WAVEFORM IN VINYL PANEL
// ============================================

let waveformDisplay = null;

function setupWaveform() {
    // Add waveform container to vinyl panel
    const vinylProgress = document.querySelector('.vinyl-progress');
    if (!vinylProgress || document.getElementById('waveform-container')) return;
    
    const waveformContainer = document.createElement('div');
    waveformContainer.id = 'waveform-container';
    waveformContainer.className = 'waveform-container';
    vinylProgress.parentNode.insertBefore(waveformContainer, vinylProgress);
    
    waveformDisplay = new WaveformDisplay('waveform-container');
    
    // Update waveform progress with audio
    if (audioPlayer) {
        audioPlayer.addEventListener('timeupdate', () => {
            if (waveformDisplay && audioPlayer.duration) {
                const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                waveformDisplay.setProgress(percent);
            }
        });
        
        audioPlayer.addEventListener('loadedmetadata', () => {
            if (waveformDisplay && audioPlayer.src) {
                waveformDisplay.generateFromUrl(audioPlayer.src);
            }
        });
    }
    
    console.log('[Waveform] Setup complete');
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(setupWaveform, 2000);
});

window.waveformDisplay = waveformDisplay;
