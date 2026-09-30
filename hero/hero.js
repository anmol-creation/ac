(function() {
    const container = document.getElementById('hero-container');
    const canvas = document.getElementById('hero-canvas');
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    const brandName = container.querySelector('.hero-brand-name');
    const tagline = container.querySelector('.hero-tagline');

    // Muted Color Palette
    const COLORS = ['#ffffff', '#60a5fa', '#22d3ee', '#f472b6', '#a78bfa', '#2dd4bf'];
    const DOT_COUNT = 20;

    let width, height;
    let dots = [];
    let animationFrameId;
    let phase = 'intro'; // intro, explode, float, connect, unify, idle
    let phaseTimer = 0;

    // Animation Phases Duration (frames approx 60fps)
    const PHASES = {
        FLOAT: 120,    // 2 seconds float
        CONNECT: 300,  // 5 seconds connecting
        UNIFY: 180,    // 3 seconds fading to white
        IDLE: -1       // Indefinite
    };

    // Mouse Interaction for Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    // Parallax strength
    const PARALLAX_FACTOR = 0.02;

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        targetMouseX = e.clientX - rect.left - (width / 2);
        targetMouseY = e.clientY - rect.top - (height / 2);
    });

    container.addEventListener('mouseleave', () => {
        targetMouseX = 0;
        targetMouseY = 0;
    });

    class Dot {
        constructor(isFirst) {
            this.baseX = Math.random() * width;
            this.baseY = Math.random() * height;
            this.x = this.baseX;
            this.y = this.baseY;
            // Depth for parallax effect (closer dots move more)
            this.z = Math.random() * 2 + 0.1;
            // Slow idle motion
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.radius = (2 + Math.random()) * (this.z * 0.5 + 0.5); // size relative to depth
    // Check first visit
    const isFirstVisit = !sessionStorage.getItem('ac_intro_played');

    class Dot {
        constructor(x, y, isFirst, isExploding = false) {
            this.x = x !== null ? x : Math.random() * width;
            this.y = y !== null ? y : Math.random() * height;

            if (isExploding) {
                // Outward burst velocity
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.5 + Math.random() * 4;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.alpha = 0;
            } else {
                // Slow idle motion
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
                this.alpha = 1;
            }

            this.radius = 2 + Math.random(); // 2-3px
            this.baseColor = isFirst ? '#ffffff' : COLORS[Math.floor(Math.random() * (COLORS.length - 1)) + 1];
            this.color = this.baseColor;
            this.targetAlpha = 1;
        }

        update() {
            this.baseX += this.vx;
            this.baseY += this.vy;

            // Soft bounce based on base coordinates
            if (this.baseX < 0 || this.baseX > width) this.vx *= -1;
            if (this.baseY < 0 || this.baseY > height) this.vy *= -1;

            // Apply parallax offset
            this.x = this.baseX + (mouseX * PARALLAX_FACTOR * this.z);
            this.y = this.baseY + (mouseY * PARALLAX_FACTOR * this.z);
            if (phase === 'explode') {
                this.vx *= 0.95;
                this.vy *= 0.95;
                if (this.alpha < this.targetAlpha) this.alpha += 0.05;

                // Drift
                this.vx += (Math.random() - 0.5) * 0.1;
                this.vy += (Math.random() - 0.5) * 0.1;
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
        window.addEventListener('resize', resize);

        // Hide initial content if first visit
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (isFirstVisit && !prefersReducedMotion) {
            try { sessionStorage.setItem('ac_intro_played', 'true'); } catch(e) {}

            // Build dynamic overlay
            const overlay = document.createElement('div');
            overlay.id = 'intro-overlay';
            overlay.innerHTML = `
                <h1 class="intro-brand-name" id="intro-brand">
                    <span class="intro-brand-dot" id="intro-dot">.</span><span class="intro-brand-a">a</span><span class="intro-brand-nmol">nmol</span><span class="intro-brand-c">c</span><span class="intro-brand-reations">reations</span>
                </h1>
            `;
            document.body.appendChild(overlay);

            // Initially hide real content to avoid flash
            if (brandName) brandName.style.opacity = '0';
            if (tagline) tagline.style.opacity = '0';

            // Start the sequence
            runIntroSequence(overlay);
        } else {
            // Standard start (skip intro)
            spawnParticles(null, null, false);
            phase = 'float';
            animate();

            setTimeout(() => { if (brandName) brandName.classList.add('visible'); }, 600);
            setTimeout(() => { if (tagline) tagline.classList.add('visible'); }, 1400);
        }
    }

    function runIntroSequence(overlay) {
        const introBrand = document.getElementById('intro-brand');
        const introDot = document.getElementById('intro-dot');

        // Let canvas be empty initially
        animate();

        // 0.5s -> slow expansion
        setTimeout(() => {
            introBrand.classList.add('reveal');
        }, 500);

        // 2.0s -> dot explodes
        setTimeout(() => {
            introDot.classList.add('hidden');
            const rect = introDot.getBoundingClientRect();
            spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, true);
            phase = 'explode';
        }, 2000);

        // 3.5s -> transition to main content
        setTimeout(() => {
            phase = 'float';
            overlay.classList.add('hidden');

            // Reveal real content
            if (brandName) {
                brandName.style.opacity = '';
                brandName.classList.add('visible');
            }
            if (tagline) {
                tagline.style.opacity = '';
                tagline.classList.add('visible');
            }
        }, 3500);

        // 4.5s -> remove overlay
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 4500);
    }

    function spawnParticles(x, y, isExploding) {
        dots = [];
        for (let i = 0; i < DOT_COUNT; i++) {
            dots.push(new Dot(x, y, i === 0, isExploding));
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

        // Smooth mouse following for parallax
        mouseX += (targetMouseX - mouseX) * 0.1;
        mouseY += (targetMouseY - mouseY) * 0.1;

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
        if (brandName) brandName.classList.add('visible');
        if (tagline) tagline.classList.add('visible');
    } else {
        init();
    }
})();
