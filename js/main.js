document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const iconSun = document.querySelector('.icon-sun');
    const iconMoon = document.querySelector('.icon-moon');

    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    updateIcons(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateIcons(newTheme);
        });
    }

    function updateIcons(theme) {
        // Smooth toggle transition using transforms/opacity instead of display: none
        if (theme === 'dark') {
            iconSun.style.opacity = '1';
            iconSun.style.transform = 'rotate(0deg) scale(1)';
            iconMoon.style.opacity = '0';
            iconMoon.style.transform = 'rotate(90deg) scale(0)';
        } else {
            iconSun.style.opacity = '0';
            iconSun.style.transform = 'rotate(-90deg) scale(0)';
            iconMoon.style.opacity = '1';
            iconMoon.style.transform = 'rotate(0deg) scale(1)';
        }
    }

    // Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // Scroll Animations setup
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optional: stop observing once visible for one-time animation
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const revealElements = document.querySelectorAll('.reveal-up');
        revealElements.forEach((el, index) => {
            // Add a slight stagger based on DOM order
            el.style.transitionDelay = `${index * 0.1}s`;
            observer.observe(el);
        });
    }

    // Custom Cursor Logic (Desktop Only)
    // Use pointer-fine to detect true mouse users (desktop) rather than guessing by screen width or user agent string
    const isDesktop = window.matchMedia("(pointer: fine)").matches;
    const isMobile = !isDesktop;

    // Interactive Card Glow & 3D Tilt Effect
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Glow effect
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // 3D Tilt effect (desktop only)
            if (!isMobile && !prefersReducedMotion) {
                card.classList.add('is-tilting');
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Calculate rotation (max 4 degrees)
                const rotateX = ((y - centerY) / centerY) * -4;
                const rotateY = ((x - centerX) / centerX) * 4;

                card.style.setProperty('--rx', `${rotateX}deg`);
                card.style.setProperty('--ry', `${rotateY}deg`);
            }
        });

        card.addEventListener('mouseleave', () => {
            if (!isMobile && !prefersReducedMotion) {
                card.style.setProperty('--rx', `0deg`);
                card.style.setProperty('--ry', `0deg`);
                card.classList.remove('is-tilting');
            }
        });
    });

    // Magnetic elements (Desktop Only)
    if (!isMobile && !prefersReducedMotion) {
        const magneticElements = document.querySelectorAll('.theme-toggle, .menu-toggle, .brand-logo');
        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                // Move element towards cursor (strength 0.3)
                el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = `translate(0px, 0px)`;
            });
        });
    }

    // Custom Cursor Setup


    if (!isMobile && !prefersReducedMotion) {
        const cursor = document.getElementById('custom-cursor');
        const cursorFollower = document.getElementById('custom-cursor-follower');

        if (cursor && cursorFollower) {
            document.body.classList.add('custom-cursor-active');

            // Show cursors initially after a brief delay to avoid flash
            setTimeout(() => {
                cursor.style.opacity = '1';
                cursorFollower.style.opacity = '1';
            }, 500);

            let mouseX = window.innerWidth / 2;
            let mouseY = window.innerHeight / 2;
            let followerX = mouseX;
            let followerY = mouseY;

            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;

                // Immediate update for dot
                cursor.style.left = `${mouseX}px`;
                cursor.style.top = `${mouseY}px`;
            });

            // Lerp function for smooth following
            const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

            const animateCursor = () => {
                followerX = lerp(followerX, mouseX, 0.15);
                followerY = lerp(followerY, mouseY, 0.15);

                cursorFollower.style.left = `${followerX}px`;
                cursorFollower.style.top = `${followerY}px`;

                requestAnimationFrame(animateCursor);
            };
            animateCursor();

            // Hover states
            const hoverTriggers = document.querySelectorAll('a, button, .hover-trigger');

            hoverTriggers.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    cursor.classList.add('hovering');
                    cursorFollower.classList.add('hovering');
                });

                el.addEventListener('mouseleave', () => {
                    cursor.classList.remove('hovering');
                    cursorFollower.classList.remove('hovering');
                });
            });

            // Hide cursor when leaving window
            document.addEventListener('mouseleave', () => {
                cursor.style.opacity = '0';
                cursorFollower.style.opacity = '0';
            });

            document.addEventListener('mouseenter', () => {
                cursor.style.opacity = '1';
                cursorFollower.style.opacity = '1';
            });
        }
    }
});
