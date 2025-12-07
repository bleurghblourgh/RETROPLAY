// ========== ENHANCED FULLSCREEN VISUALIZER ==========
// Multiple visualization modes, particles, beat detection, dynamic backgrounds

class EnhancedVisualizer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.isActive = false;
        this.animationId = null;
        this.mode = 'circular'; // circular, bars, particles, wave, spectrum
        this.particles = [];
        this.hue = 0;
        this.beatThreshold = 200;
        this.lastBeat = 0;
        this.beatDetected = false;
        this.albumArt = null;
        this.rotation = 0;
    }

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Enhanced visualizer: Canvas not found:', canvasId);
            return false;
        }
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Enhanced visualizer: Could not get 2d context');
            return false;
        }
        this.resize();
        window.addEventListener('resize', () => this.resize());
        console.log('Enhanced visualizer: Canvas initialized', this.canvas.width, 'x', this.canvas.height);
        return true;
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        console.log('Enhanced visualizer: Resized to', this.canvas.width, 'x', this.canvas.height);
    }

    connectAudio(audioElement) {
        try {
            // Try to reuse existing analyser from vinyl panel first
            if (window.vinylPanel && window.vinylPanel.visualizer && window.vinylPanel.visualizer.analyser) {
                this.analyser = window.vinylPanel.visualizer.analyser;
                this.audioContext = window.vinylPanel.visualizer.audioContext;
                this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
                console.log('Enhanced visualizer: Reusing vinyl panel analyser');
                return;
            }
            
            // Fallback: create our own (only works if no other source exists)
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            if (!this.analyser) {
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 512;
                this.analyser.smoothingTimeConstant = 0.8;
                this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
                
                const source = this.audioContext.createMediaElementSource(audioElement);
                source.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
            }
        } catch (e) {
            console.log('Enhanced visualizer audio connection:', e.message);
            // Still try to use vinyl panel's analyser as last resort
            if (window.vinylPanel && window.vinylPanel.visualizer && window.vinylPanel.visualizer.analyser) {
                this.analyser = window.vinylPanel.visualizer.analyser;
                this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            }
        }
    }

    setAlbumArt(url) {
        if (url) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => { this.albumArt = img; };
            img.src = url;
        } else {
            this.albumArt = null;
        }
    }

    start() {
        this.isActive = true;
        this.rotation = 0; // Reset rotation
        
        // Ensure dataArray exists
        if (!this.dataArray) {
            this.dataArray = new Uint8Array(256);
        }
        
        // Test draw - fill with dark background
        if (this.ctx && this.canvas) {
            this.ctx.fillStyle = '#0a0a14';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            console.log('Enhanced visualizer: Initial fill done');
        }
        
        console.log('Enhanced visualizer: Starting animation, canvas:', !!this.canvas, 'ctx:', !!this.ctx, 'dataArray length:', this.dataArray ? this.dataArray.length : 0);
        this.animate();
    }

    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    setMode(mode) {
        this.mode = mode;
        this.particles = [];
    }

    detectBeat() {
        if (!this.dataArray) return false;
        let sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += this.dataArray[i];
        }
        const avg = sum / 10;
        const now = Date.now();
        if (avg > this.beatThreshold && now - this.lastBeat > 100) {
            this.lastBeat = now;
            return true;
        }
        return false;
    }

    animate() {
        if (!this.isActive) return;
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Get frequency data if available
        let hasRealData = false;
        if (this.analyser && this.dataArray) {
            try {
                this.analyser.getByteFrequencyData(this.dataArray);
                // Check if we actually got data (sum of first 10 values)
                let sum = 0;
                for (let i = 0; i < 10; i++) sum += this.dataArray[i];
                hasRealData = sum > 0;
            } catch (e) {
                hasRealData = false;
            }
        }
        
        // If no real audio data, use fake animated data
        if (!hasRealData) {
            this.createFakeData();
        }
        
        this.beatDetected = this.detectBeat();
        this.hue = (this.hue + 0.5) % 360;
        this.rotation += 0.5;
        
        this.draw();
    }
    
    createFakeData() {
        // Create animated fake frequency data that looks like real music
        if (!this.dataArray) {
            this.dataArray = new Uint8Array(256);
        }
        
        // Initialize smoothed values for organic movement
        if (!this.smoothedData) {
            this.smoothedData = new Float32Array(256);
            this.targetData = new Float32Array(256);
            this.lastBeatTime = 0;
            this.beatInterval = 500 + Math.random() * 300; // Random BPM
        }
        
        const time = Date.now();
        const t = time / 1000;
        
        // Simulate beats
        if (time - this.lastBeatTime > this.beatInterval) {
            this.lastBeatTime = time;
            this.beatInterval = 400 + Math.random() * 400; // Vary the beat
            // Create a beat spike in bass frequencies
            for (let i = 0; i < 30; i++) {
                this.targetData[i] = 180 + Math.random() * 75;
            }
        }
        
        for (let i = 0; i < this.dataArray.length; i++) {
            // Different behavior for different frequency ranges
            let target;
            
            if (i < 20) {
                // Bass - strong pulses
                target = 80 + Math.sin(t * 4) * 40 + Math.random() * 60;
                if (Math.random() < 0.05) target += 80; // Random bass hits
            } else if (i < 60) {
                // Low-mids - rhythmic
                target = 60 + Math.sin(t * 3 + i * 0.2) * 30 + Math.random() * 50;
            } else if (i < 120) {
                // Mids - melodic variation
                target = 40 + Math.sin(t * 2.5 + i * 0.15) * 25 + 
                         Math.sin(t * 5 + i * 0.3) * 20 + Math.random() * 40;
            } else if (i < 180) {
                // High-mids - sparkly
                target = 30 + Math.sin(t * 6 + i * 0.1) * 20 + Math.random() * 50;
                if (Math.random() < 0.1) target += 60; // Random sparkles
            } else {
                // Highs - subtle shimmer
                target = 20 + Math.random() * 40;
                if (Math.random() < 0.15) target += 40;
            }
            
            // Smooth interpolation for organic movement
            this.smoothedData[i] += (target - this.smoothedData[i]) * 0.15;
            
            // Add some noise for liveliness
            const noise = (Math.random() - 0.5) * 30;
            this.dataArray[i] = Math.max(0, Math.min(255, Math.floor(this.smoothedData[i] + noise)));
        }
    }

    draw() {
        if (!this.ctx || !this.canvas) {
            console.error('Enhanced visualizer: No canvas or context in draw');
            return;
        }
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        if (w === 0 || h === 0) {
            console.error('Enhanced visualizer: Canvas has zero dimensions');
            this.resize();
            return;
        }
        
        // Dynamic background
        this.drawBackground(ctx, w, h);
        
        // Draw based on mode
        switch (this.mode) {
            case 'circular': this.drawCircular(ctx, w, h); break;
            case 'bars': this.drawBars(ctx, w, h); break;
            case 'particles': this.drawParticles(ctx, w, h); break;
            case 'wave': this.drawWave(ctx, w, h); break;
            case 'spectrum': this.drawSpectrum(ctx, w, h); break;
            case 'kaleidoscope': this.drawKaleidoscope(ctx, w, h); break;
            default: this.drawCircular(ctx, w, h);
        }
        
        // Draw center vinyl/album art
        this.drawCenterVinyl(ctx, w, h);
    }

    drawBackground(ctx, w, h) {
        // Clear on first frame or use fade effect
        if (this.rotation < 1) {
            ctx.fillStyle = '#0a0a14';
            ctx.fillRect(0, 0, w, h);
        } else {
            // Fade effect for trails
            ctx.fillStyle = 'rgba(10, 10, 20, 0.12)';
            ctx.fillRect(0, 0, w, h);
        }
        
        // Beat flash
        if (this.beatDetected) {
            ctx.fillStyle = `hsla(${this.hue}, 80%, 50%, 0.15)`;
            ctx.fillRect(0, 0, w, h);
        }
    }

    drawCircular(ctx, w, h) {
        if (!this.dataArray) return;
        const cx = w / 2;
        const cy = h * 0.4; // Move up to avoid overlap with controls
        const radius = Math.min(w, h) * 0.22;
        const bars = 128;
        
        for (let i = 0; i < bars; i++) {
            const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
            const value = this.dataArray[i % this.dataArray.length] || 0;
            const barHeight = (value / 255) * radius * 0.8;
            
            const x1 = cx + Math.cos(angle) * (radius + 20);
            const y1 = cy + Math.sin(angle) * (radius + 20);
            const x2 = cx + Math.cos(angle) * (radius + 20 + barHeight);
            const y2 = cy + Math.sin(angle) * (radius + 20 + barHeight);
            
            const hue = (this.hue + i * 2) % 360;
            ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            
            // Mirror inner
            const x3 = cx + Math.cos(angle) * (radius - 10);
            const y3 = cy + Math.sin(angle) * (radius - 10);
            const x4 = cx + Math.cos(angle) * (radius - 10 - barHeight * 0.3);
            const y4 = cy + Math.sin(angle) * (radius - 10 - barHeight * 0.3);
            
            ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.4)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x3, y3);
            ctx.lineTo(x4, y4);
            ctx.stroke();
        }
        
        // Glow ring
        ctx.strokeStyle = `hsla(${this.hue}, 80%, 60%, ${this.beatDetected ? 0.6 : 0.2})`;
        ctx.lineWidth = this.beatDetected ? 4 : 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 15, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawBars(ctx, w, h) {
        if (!this.dataArray) return;
        const bars = 64;
        const barWidth = w / bars;
        const maxHeight = h * 0.6;
        
        for (let i = 0; i < bars; i++) {
            const value = this.dataArray[Math.floor(i * this.dataArray.length / bars)] || 0;
            const barHeight = (value / 255) * maxHeight;
            const x = i * barWidth;
            const y = h - barHeight;
            
            const hue = (this.hue + i * 4) % 360;
            const gradient = ctx.createLinearGradient(x, h, x, y);
            gradient.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.9)`);
            gradient.addColorStop(1, `hsla(${(hue + 60) % 360}, 80%, 70%, 0.6)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
            
            // Reflection
            ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.2)`;
            ctx.fillRect(x + 2, h, barWidth - 4, barHeight * 0.3);
        }
    }

    drawParticles(ctx, w, h) {
        // Spawn particles on beat
        if (this.beatDetected) {
            for (let i = 0; i < 10; i++) {
                this.particles.push({
                    x: w / 2,
                    y: h / 2,
                    vx: (Math.random() - 0.5) * 15,
                    vy: (Math.random() - 0.5) * 15,
                    life: 1,
                    hue: this.hue + Math.random() * 60,
                    size: Math.random() * 8 + 4
                });
            }
        }
        
        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.015;
            p.size *= 0.98;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.life})`;
            ctx.fill();
            
            // Glow
            ctx.shadowBlur = 20;
            ctx.shadowColor = `hsla(${p.hue}, 80%, 60%, ${p.life})`;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        // Limit particles
        if (this.particles.length > 300) {
            this.particles = this.particles.slice(-300);
        }
        
        // Draw frequency circles
        if (this.dataArray) {
            const cx = w / 2;
            const cy = h * 0.4;
            for (let i = 0; i < 8; i++) {
                const value = this.dataArray[i * 8] || 0;
                const radius = 100 + i * 30 + (value / 255) * 50;
                ctx.strokeStyle = `hsla(${(this.hue + i * 30) % 360}, 70%, 60%, 0.3)`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }


    drawWave(ctx, w, h) {
        if (!this.dataArray) return;
        const cx = w / 2;
        const cy = h * 0.4;
        
        // Multiple wave layers
        for (let layer = 0; layer < 3; layer++) {
            ctx.beginPath();
            const offset = layer * 50;
            const hue = (this.hue + layer * 40) % 360;
            
            for (let i = 0; i < this.dataArray.length; i++) {
                const value = this.dataArray[i] || 0;
                const x = (i / this.dataArray.length) * w;
                const amplitude = (value / 255) * 150 + offset;
                const y = cy + Math.sin((i / 20) + this.rotation / 30 + layer) * amplitude;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            
            ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.6 - layer * 0.15})`;
            ctx.lineWidth = 3 - layer;
            ctx.stroke();
        }
        
        // Center pulse
        const avgValue = this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length;
        const pulseRadius = 50 + (avgValue / 255) * 100;
        
        ctx.beginPath();
        ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${this.hue}, 80%, 60%, 0.5)`;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    drawSpectrum(ctx, w, h) {
        if (!this.dataArray) return;
        const cx = w / 2;
        const cy = h * 0.4;
        const maxRadius = Math.min(w, h) * 0.35;
        
        // Draw spectrum as filled shape
        ctx.beginPath();
        for (let i = 0; i < this.dataArray.length; i++) {
            const angle = (i / this.dataArray.length) * Math.PI * 2 - Math.PI / 2;
            const value = this.dataArray[i] || 0;
            const radius = 80 + (value / 255) * maxRadius;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        
        const gradient = ctx.createRadialGradient(cx, cy, 80, cx, cy, maxRadius + 80);
        gradient.addColorStop(0, `hsla(${this.hue}, 80%, 50%, 0.1)`);
        gradient.addColorStop(0.5, `hsla(${(this.hue + 60) % 360}, 80%, 50%, 0.3)`);
        gradient.addColorStop(1, `hsla(${(this.hue + 120) % 360}, 80%, 50%, 0.1)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = `hsla(${this.hue}, 80%, 60%, 0.8)`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Inner rings
        for (let r = 0; r < 4; r++) {
            ctx.beginPath();
            ctx.arc(cx, cy, 80 + r * 40, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${(this.hue + r * 30) % 360}, 60%, 50%, 0.2)`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    drawCenterVinyl(ctx, w, h) {
        const cx = w / 2;
        const cy = h * 0.4; // Move up to match circular visualizer
        const radius = Math.min(w, h) * 0.10;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((this.rotation * Math.PI) / 180);
        
        // Vinyl disc
        const discGradient = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius);
        discGradient.addColorStop(0, '#1a1a1a');
        discGradient.addColorStop(0.8, '#0d0d0d');
        discGradient.addColorStop(1, '#000');
        
        ctx.fillStyle = discGradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Grooves
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.55 + i * (radius * 0.4 / 20), 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Album art or label
        if (this.albumArt) {
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(this.albumArt, -radius * 0.5, -radius * 0.5, radius, radius);
        } else {
            const labelGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.5);
            labelGradient.addColorStop(0, `hsl(${this.hue}, 80%, 50%)`);
            labelGradient.addColorStop(1, `hsl(${(this.hue + 60) % 360}, 80%, 30%)`);
            ctx.fillStyle = labelGradient;
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Center spindle
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Glow around vinyl
        ctx.shadowBlur = 30;
        ctx.shadowColor = `hsla(${this.hue}, 80%, 50%, 0.5)`;
        ctx.strokeStyle = `hsla(${this.hue}, 80%, 60%, 0.3)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    drawKaleidoscope(ctx, w, h) {
        if (!this.dataArray) return;
        const cx = w / 2;
        const cy = h * 0.45;
        const segments = 12;
        const angleStep = (Math.PI * 2) / segments;
        
        ctx.save();
        ctx.translate(cx, cy);
        
        // Draw mirrored segments
        for (let seg = 0; seg < segments; seg++) {
            ctx.save();
            ctx.rotate(seg * angleStep + this.rotation * 0.01);
            
            // Mirror every other segment
            if (seg % 2 === 1) {
                ctx.scale(-1, 1);
            }
            
            // Clip to segment
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, Math.min(w, h) * 0.4, 0, angleStep);
            ctx.closePath();
            ctx.clip();
            
            // Draw frequency-reactive shapes
            for (let i = 0; i < 20; i++) {
                const value = this.dataArray[i * 4] || 0;
                const dist = 30 + i * 15 + (value / 255) * 30;
                const size = 5 + (value / 255) * 20;
                const hue = (this.hue + i * 15 + seg * 10) % 360;
                
                ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.6)`;
                ctx.beginPath();
                ctx.arc(dist, 0, size, 0, Math.PI * 2);
                ctx.fill();
                
                // Add connecting lines
                if (i > 0) {
                    const prevValue = this.dataArray[(i - 1) * 4] || 0;
                    const prevDist = 30 + (i - 1) * 15 + (prevValue / 255) * 30;
                    ctx.strokeStyle = `hsla(${hue}, 70%, 50%, 0.3)`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(prevDist, 0);
                    ctx.lineTo(dist, 0);
                    ctx.stroke();
                }
            }
            
            // Draw album art fragment if available
            if (this.albumArt) {
                ctx.globalAlpha = 0.3;
                const artSize = Math.min(w, h) * 0.3;
                ctx.drawImage(this.albumArt, 50, -artSize/4, artSize/2, artSize/2);
                ctx.globalAlpha = 1;
            }
            
            ctx.restore();
        }
        
        ctx.restore();
        
        // Center glow
        const avgValue = this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length;
        const glowSize = 30 + (avgValue / 255) * 40;
        
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize);
        gradient.addColorStop(0, `hsla(${this.hue}, 80%, 70%, 0.8)`);
        gradient.addColorStop(0.5, `hsla(${(this.hue + 60) % 360}, 80%, 50%, 0.3)`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, glowSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ========== ENHANCED FULLSCREEN CONTROLLER ==========

class EnhancedFullscreenController {
    constructor() {
        this.visualizer = null;
        this.isOpen = false;
        this.currentMode = 'circular';
        this.modes = ['circular', 'bars', 'particles', 'wave', 'spectrum', 'kaleidoscope'];
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        
        // Create fullscreen modal
        const modal = document.createElement('div');
        modal.id = 'enhanced-fs-visualizer';
        modal.className = 'enhanced-fs-modal';
        modal.innerHTML = `
            <canvas id="enhanced-vis-canvas"></canvas>
            <div class="enhanced-fs-overlay">
                <button class="enhanced-fs-close" onclick="window.enhancedFS.close()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
                <div class="enhanced-fs-info">
                    <div class="enhanced-fs-title" id="enhanced-fs-title">No song playing</div>
                    <div class="enhanced-fs-artist" id="enhanced-fs-artist">-</div>
                </div>
                <div class="enhanced-fs-controls">
                    <button class="enhanced-fs-btn" onclick="window.playPrevious && window.playPrevious()">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                    </button>
                    <button class="enhanced-fs-play" id="enhanced-fs-play" onclick="document.getElementById('audio-player').paused ? document.getElementById('audio-player').play() : document.getElementById('audio-player').pause()">
                        <svg id="enhanced-fs-play-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                    <button class="enhanced-fs-btn" onclick="window.playNext && window.playNext()">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 18h2V6h-2zM6 18l8.5-6L6 6z"/></svg>
                    </button>
                </div>
                <div class="enhanced-fs-modes">
                    <button class="mode-btn active" data-mode="circular" onclick="window.enhancedFS.setMode('circular')">Circular</button>
                    <button class="mode-btn" data-mode="bars" onclick="window.enhancedFS.setMode('bars')">Bars</button>
                    <button class="mode-btn" data-mode="particles" onclick="window.enhancedFS.setMode('particles')">Particles</button>
                    <button class="mode-btn" data-mode="wave" onclick="window.enhancedFS.setMode('wave')">Wave</button>
                    <button class="mode-btn" data-mode="spectrum" onclick="window.enhancedFS.setMode('spectrum')">Spectrum</button>
                    <button class="mode-btn" data-mode="kaleidoscope" onclick="window.enhancedFS.setMode('kaleidoscope')">Kaleidoscope</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Initialize visualizer
        this.visualizer = new EnhancedVisualizer();
        this.visualizer.init('enhanced-vis-canvas');
        
        // Connect audio - try to reuse vinyl panel's analyser
        const audio = document.getElementById('audio-player');
        if (audio) {
            this.visualizer.connectAudio(audio);
        }
        
        // Get album art from current song
        if (window.vinylPanel && window.vinylPanel.visualizer) {
            this.visualizer.albumArt = window.vinylPanel.visualizer.albumArt;
            // Also copy the dataArray reference if available
            if (window.vinylPanel.visualizer.dataArray) {
                this.visualizer.dataArray = window.vinylPanel.visualizer.dataArray;
            }
        }
        
        // Ensure we have a dataArray
        if (!this.visualizer.dataArray) {
            this.visualizer.dataArray = new Uint8Array(256);
        }
        
        // Update song info
        this.updateInfo();
        this.updatePlayState();
        
        // Start animation immediately
        modal.classList.add('active');
        this.visualizer.start();
        console.log('Enhanced visualizer started, analyser:', !!this.visualizer.analyser, 'dataArray:', !!this.visualizer.dataArray);
        
        // Listen for audio events
        if (audio) {
            audio.addEventListener('play', () => this.updatePlayState());
            audio.addEventListener('pause', () => this.updatePlayState());
        }
        
        // Keyboard controls
        this.keyHandler = (e) => {
            if (e.key === 'Escape') this.close();
            if (e.key === ' ') {
                e.preventDefault();
                const audio = document.getElementById('audio-player');
                if (audio) audio.paused ? audio.play() : audio.pause();
            }
            if (e.key === 'ArrowRight') window.playNext && window.playNext();
            if (e.key === 'ArrowLeft') window.playPrevious && window.playPrevious();
            if (e.key >= '1' && e.key <= '6') {
                this.setMode(this.modes[parseInt(e.key) - 1]);
            }
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        
        const modal = document.getElementById('enhanced-fs-visualizer');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
        
        if (this.visualizer) {
            this.visualizer.stop();
            this.visualizer = null;
        }
        
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
    }

    setMode(mode) {
        this.currentMode = mode;
        if (this.visualizer) {
            this.visualizer.setMode(mode);
        }
        
        // Update button states
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
    }

    updateInfo() {
        const titleEl = document.getElementById('vinyl-song-title');
        const artistEl = document.getElementById('vinyl-song-artist');
        const fsTitle = document.getElementById('enhanced-fs-title');
        const fsArtist = document.getElementById('enhanced-fs-artist');
        
        if (fsTitle && titleEl) fsTitle.textContent = titleEl.textContent || 'No song playing';
        if (fsArtist && artistEl) fsArtist.textContent = artistEl.textContent || '-';
    }

    updatePlayState() {
        const audio = document.getElementById('audio-player');
        const icon = document.getElementById('enhanced-fs-play-icon');
        if (!audio || !icon) return;
        
        if (audio.paused) {
            icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        } else {
            icon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
        }
    }

    updateAlbumArt(img) {
        if (this.visualizer) {
            this.visualizer.albumArt = img;
        }
    }
}

// ========== STYLES ==========
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
.enhanced-fs-modal {
    position: fixed;
    inset: 0;
    z-index: 999999;
    background: #000;
    opacity: 0;
    transition: opacity 0.3s ease;
}
.enhanced-fs-modal.active { opacity: 1; }
.enhanced-fs-modal canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
}
.enhanced-fs-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding: 2rem 2rem 3rem 2rem;
    pointer-events: none;
}
.enhanced-fs-overlay > * { pointer-events: auto; }
.enhanced-fs-close {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 48px;
    height: 48px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 10;
}
.enhanced-fs-close:hover {
    background: rgba(255,255,255,0.2);
    transform: scale(1.1);
}
.enhanced-fs-close svg { width: 24px; height: 24px; }
.enhanced-fs-info {
    text-align: center;
    margin-bottom: 1.5rem;
    background: rgba(0,0,0,0.5);
    padding: 1rem 2rem;
    border-radius: 12px;
    backdrop-filter: blur(10px);
}
.enhanced-fs-title {
    font-size: 2rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 0 30px rgba(236,72,153,0.5);
    margin-bottom: 0.5rem;
}
.enhanced-fs-artist {
    font-size: 1.25rem;
    color: #ec4899;
}
.enhanced-fs-controls {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}
.enhanced-fs-btn {
    width: 56px;
    height: 56px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}
.enhanced-fs-btn:hover {
    background: rgba(255,255,255,0.2);
    transform: scale(1.1);
}
.enhanced-fs-btn svg { width: 24px; height: 24px; }
.enhanced-fs-play {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #ec4899, #8b5cf6);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 40px rgba(236,72,153,0.5);
    transition: all 0.2s;
}
.enhanced-fs-play:hover {
    transform: scale(1.1);
    box-shadow: 0 0 60px rgba(236,72,153,0.7);
}
.enhanced-fs-play svg { width: 36px; height: 36px; }
.enhanced-fs-modes {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
}
.mode-btn {
    padding: 0.5rem 1rem;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px;
    color: white;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
}
.mode-btn:hover {
    background: rgba(255,255,255,0.2);
}
.mode-btn.active {
    background: linear-gradient(135deg, #ec4899, #8b5cf6);
    border-color: transparent;
}
`;
document.head.appendChild(enhancedStyles);

// ========== GLOBAL INSTANCE ==========
window.enhancedFS = new EnhancedFullscreenController();

// Override the vinyl panel's toggleFullscreen method
function overrideFullscreen() {
    // Override the VinylPanelController's toggleFullscreen
    if (window.vinylPanel) {
        window.vinylPanel.toggleFullscreen = function() {
            window.enhancedFS.open();
        };
        console.log('Enhanced visualizer: Overrode vinylPanel.toggleFullscreen');
    }
    
    // Also override the button directly
    const fsBtn = document.getElementById('vinyl-fullscreen-btn');
    if (fsBtn) {
        // Remove all existing listeners by cloning
        const newBtn = fsBtn.cloneNode(true);
        fsBtn.parentNode.replaceChild(newBtn, fsBtn);
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.enhancedFS.open();
        });
        console.log('Enhanced visualizer: Overrode fullscreen button');
    }
}

// Run override after everything loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(overrideFullscreen, 600);
});

// Also try on window load as backup
window.addEventListener('load', () => {
    setTimeout(overrideFullscreen, 300);
});

// Export
window.EnhancedVisualizer = EnhancedVisualizer;
window.EnhancedFullscreenController = EnhancedFullscreenController;
window.overrideFullscreen = overrideFullscreen;
