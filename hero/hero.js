(function() {
    const container = document.getElementById('hero-container');
    const canvas = document.getElementById('hero-canvas');
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    const brandName = container.querySelector('.hero-brand-name');
    const tagline = container.querySelector('.hero-tagline');

    // Muted Color Palette
    const COLORS = ['#ffffff', '#60a5fa', '#22d3ee', '#f472b6', '#a78bfa', '#2dd4bf'];
    let DOT_COUNT = window.innerWidth < 768 ? 15 : 25; // Reduce on mobile

    let width, height;
    let dots = [];
    let animationFrameId;
    let phase = 'pre-reveal'; // pre-reveal, explode, spread, connect, unify, idle
    let phaseTimer = 0;

    // Elements for timing
    const brandDot = container.querySelector('#brand-dot');

    // Check first visit
    const isFirstVisit = !sessionStorage.getItem('ac_intro_played');

    class Dot {
        constructor(x, y, isFirst, isExploding = false) {
            this.x = x !== null ? x : Math.random() * width;
            this.y = y !== null ? y : Math.random() * height;

            if (isExploding) {
                // Outward burst velocity
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 3;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
            } else {
                // Slow idle motion
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
            }

            this.radius = 1.5 + Math.random() * 1.5;
            this.baseColor = isFirst ? '#ffffff' : COLORS[Math.floor(Math.random() * (COLORS.length - 1)) + 1];

            // Adjust alpha based on device capabilities (simulated via width here)
            this.targetAlpha = 1;
            this.alpha = isExploding ? 0 : 1;
            this.color = this.baseColor;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Apply friction if exploding to slow down nicely
            if (phase === 'explode' || phase === 'spread') {
                this.vx *= 0.95;
                this.vy *= 0.95;
                if (this.alpha < this.targetAlpha) this.alpha += 0.05;

                // Add a bit of organic drift
                this.vx += (Math.random() - 0.5) * 0.1;
                this.vy += (Math.random() - 0.5) * 0.1;
            } else {
                // Normal speed cap for idle
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > 0.5) {
                    this.vx *= 0.9;
                    this.vy *= 0.9;
                } else if (speed < 0.1) {
                    this.vx += (Math.random() - 0.5) * 0.05;
                    this.vy += (Math.random() - 0.5) * 0.05;
                }
            }

            // Soft bounce
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.alpha;
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }

    function init() {
        resize();
        window.addEventListener('resize', () => {
            resize();
            DOT_COUNT = window.innerWidth < 768 ? 15 : 25;
        });

        if (isFirstVisit) {
            document.body.classList.add('intro-running');
            try {
                sessionStorage.setItem('ac_intro_played', 'true');
            } catch (e) {
                // Handle potential quota or privacy mode errors
            }
            runIntroSequence();
        } else {
            // Shorter sequence for returning visits
            runFastSequence();
        }
    }

    function getDotPosition() {
        if (!brandDot) return { x: width/2, y: height/2 };
        const rect = brandDot.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        return {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2
        };
    }

    function runIntroSequence() {
        // 0.0-0.4s -> ".ac" appears
        brandName.classList.add('visible');

        // 0.4-1.0s -> brand reveal
        setTimeout(() => {
            brandName.classList.add('reveal');
        }, 400);

        // 0.8-1.5s -> dot splitting into particles
        setTimeout(() => {
            if (brandDot) brandDot.classList.add('hidden');
            const pos = getDotPosition();
            spawnParticles(pos.x, pos.y);
            phase = 'explode';
            animate();
        }, 800);

        // 1.2-2.0s -> particles spread and connect
        setTimeout(() => {
            phase = 'spread';
        }, 1200);

        // 1.8-2.5s -> homepage smoothly appears (header/cards)
        // Handled globally via CSS or simply tagline reveal here
        setTimeout(() => {
            if (tagline) tagline.classList.add('visible');
            phase = 'connect';
            // Trigger header and cards to fade in if they were hidden
            document.body.classList.remove('intro-running');
        }, 1800);

        // 2.5-3.0s -> settles into subtle background
        setTimeout(() => {
            phase = 'idle';
        }, 2800);
    }

    function runFastSequence() {
        brandName.classList.add('visible');
        brandName.classList.add('reveal');
        if (tagline) tagline.classList.add('visible');
        if (brandDot) brandDot.classList.add('hidden');

        const pos = getDotPosition();
        spawnParticles(pos.x, pos.y, false); // No explosion
        phase = 'idle';
        animate();
    }

    function spawnParticles(x, y, isExploding = true) {
        dots = [];
        for (let i = 0; i < DOT_COUNT; i++) {
            if (isExploding) {
                dots.push(new Dot(x, y, i === 0, true));
            } else {
                dots.push(new Dot(null, null, i === 0, false));
            }
        }
    }

    function resize() {
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update Phase
        if (phase !== 'idle') {
            phaseTimer++;
            if (phase === 'float' && phaseTimer > PHASES.FLOAT) {
                phase = 'connect';
                phaseTimer = 0;
            } else if (phase === 'connect' && phaseTimer > PHASES.CONNECT) {
                phase = 'unify';
                phaseTimer = 0;
            } else if (phase === 'unify' && phaseTimer > PHASES.UNIFY) {
                phase = 'idle';
                // Reveal handled by independent timers now
            }
        }

        // Draw Dots
        dots.forEach(dot => {
            dot.update();

            // Handle Color Unification
            if (phase === 'unify') {
                let progress = phaseTimer / PHASES.UNIFY;
                if (progress > 0.9) dot.color = '#ffffff';
            }

            dot.draw(ctx);
        });

        // Draw Connections
        if (phase === 'connect' || phase === 'unify' || phase === 'idle') {
            let maxDist = 100;
            if (phase === 'connect') maxDist = 150;

            for (let i = 0; i < dots.length; i++) {
                for (let j = i + 1; j < dots.length; j++) {
                    const dx = dots[i].x - dots[j].x;
                    const dy = dots[i].y - dots[j].y;
                    const dist = Math.sqrt(dx*dx + dy*dy);

                    if (dist < maxDist) {
                        let alpha = 1 - (dist / maxDist);

                        if (phase === 'connect') {
                             alpha *= Math.min(1, phaseTimer / 60);
                        } else if (phase === 'unify') {
                             ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
                        } else if (phase === 'idle') {
                             alpha *= 0.3;
                             ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        }

                        if (phase !== 'unify' && phase !== 'idle') {
                            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
                        }

                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(dots[i].x, dots[i].y);
                        ctx.lineTo(dots[j].x, dots[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    // Prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        brandName.classList.add('visible');
        brandName.classList.add('reveal');
        if (tagline) tagline.classList.add('visible');
        if (brandDot) brandDot.classList.add('hidden');
        document.body.classList.remove('intro-running');
    } else {
        init();
    }
})();
