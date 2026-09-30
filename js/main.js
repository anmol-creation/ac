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
        if (theme === 'dark') {
            iconSun.style.display = 'block';
            iconMoon.style.display = 'none';
        } else {
            iconSun.style.display = 'none';
            iconMoon.style.display = 'block';
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

    // Interactive Card Glow Effect
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Custom Cursor Logic (Desktop Only)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 1024;

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
