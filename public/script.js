// ========================================
// STRANGER THINGS API - JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavbar();
    initTabs();
    initCopyButtons();
    initCounters();
    loadCharacters();
});

// ========================================
// PARTICLE SYSTEM
// ========================================
function initParticles() {
    const container = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Random properties
    const size = Math.random() * 6 + 2;
    const left = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 10;

    // Apply styles
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${left}%`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;

    container.appendChild(particle);
}

// ========================================
// NAVBAR
// ========================================
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add background on scroll
        if (currentScroll > 50) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.9)';
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80; // Navbar height
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// DOCUMENTATION TABS
// ========================================
function initTabs() {
    const tabs = document.querySelectorAll('.docs-tab');
    const sections = document.querySelectorAll('.docs-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and sections
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');

            // Show corresponding section
            const targetId = tab.dataset.tab;
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// ========================================
// COPY BUTTONS
// ========================================
function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const textToCopy = btn.dataset.copy || btn.previousElementSibling.textContent;

            try {
                await navigator.clipboard.writeText(textToCopy);

                // Visual feedback
                const originalHTML = btn.innerHTML;
                btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>`;
                btn.style.background = 'rgba(40, 167, 69, 0.2)';

                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    });
}

// ========================================
// ANIMATED COUNTERS
// ========================================
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ========================================
// LOAD CHARACTERS
// ========================================
async function loadCharacters() {
    const grid = document.getElementById('characters-grid');

    try {
        const response = await fetch('/api/characters?limit=12');
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            grid.innerHTML = '';
            data.results.forEach(character => {
                grid.appendChild(createCharacterCard(character));
            });
        } else {
            throw new Error('No characters found');
        }
    } catch (error) {
        console.error('Error loading characters:', error);
        grid.innerHTML = `
            <div class="loading-spinner">
                <p>Unable to load characters. <a href="/api/characters" target="_blank" style="color: var(--color-red);">Try the API directly</a></p>
            </div>
        `;
    }
}

function createCharacterCard(character) {
    const card = document.createElement('a');
    card.className = 'character-card';
    card.href = `/api/characters/${character.id}`;
    card.target = '_blank';

    // Get status class
    const statusClass = character.status === 'Deceased' ? 'deceased' :
        character.status === 'Alive' ? '' : 'unknown';

    // Get first quote
    const quote = character.quotes && character.quotes.length > 0
        ? character.quotes[0]
        : 'No quote available';

    // Character image handling
    let imageHtml;
    // Check if we have a valid portrait path (not a placeholder or empty)
    // We assume the API now returns correct paths (e.g. .png) after our update
    if (character.portrait_path) {
        imageHtml = `<img src="${character.portrait_path}" alt="${character.name}" class="character-img" onerror="this.parentElement.innerHTML = '${getCharacterEmoji(character.name)}'">`;
    } else {
        imageHtml = getCharacterEmoji(character.name);
    }

    // Check for powers
    const hasPowers = character.powers && character.powers.length > 0;

    card.innerHTML = `
        <div class="character-image">
            ${imageHtml}
        </div>
        <div class="character-info">
            <h3 class="character-name">${character.name}</h3>
            <p class="character-occupation">${character.occupation || 'Unknown'}</p>
            <div class="character-badges">
                ${character.age ? `<span class="badge badge-age">Age: ${character.age}</span>` : ''}
                <span class="badge badge-status ${statusClass}">${character.status}</span>
                ${hasPowers ? `<span class="badge badge-powers">Has Powers</span>` : ''}
            </div>
            <p class="character-quote">"${truncateText(quote, 60)}"</p>
        </div>
    `;

    return card;
}

function getCharacterEmoji(name) {
    const emojiMap = {
        'Eleven': '🔮',
        'Mike Wheeler': '📻',
        'Dustin Henderson': '🧢',
        'Lucas Sinclair': '🎯',
        'Will Byers': '🎨',
        'Jim Hopper': '👮',
        'Joyce Byers': '💡',
        'Nancy Wheeler': '📝',
        'Jonathan Byers': '📷',
        'Steve Harrington': '🦇',
        'Max Mayfield': '🛹',
        'Billy Hargrove': '🚗',
        'Robin Buckley': '🎬',
        'Murray Bauman': '🔍',
        'Erica Sinclair': '🍦',
        'Dr. Martin Brenner': '🧪',
        'Eddie Munson': '🎸',
        'Argyle': '🍕',
        'Bob Newby': '🖥️',
        'Barbara Holland': '📚',
        'Dmitri Antonov': '🔓',
        'Suzie Bingham': '🎵',
        'Vecna': '💀',
        'Alexei': '🥤',
        'Terry Ives': '🌻'
    };

    return emojiMap[name] || '👤';
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

// ========================================
// EASTER EGGS
// ========================================
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateUpsideDown();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateUpsideDown() {
    document.body.style.transition = 'transform 1s ease, filter 1s ease';
    document.body.style.transform = 'rotate(180deg)';
    document.body.style.filter = 'hue-rotate(180deg) invert(0.9)';

    // Create floating particles effect
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="1" fill="%23fff" opacity="0.3"/></svg>');
        pointer-events: none;
        z-index: 9999;
        animation: particleFloat 2s infinite;
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
        document.body.style.transform = '';
        document.body.style.filter = '';
        overlay.remove();
    }, 5000);

    console.log('🔮 Welcome to the Upside Down...');
}

// Console Easter Egg
console.log(`
%c ███████╗████████╗██████╗  █████╗ ███╗   ██╗ ██████╗ ███████╗██████╗ 
%c ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗████╗  ██║██╔════╝ ██╔════╝██╔══██╗
%c ███████╗   ██║   ██████╔╝███████║██╔██╗ ██║██║  ███╗█████╗  ██████╔╝
%c ╚════██║   ██║   ██╔══██╗██╔══██║██║╚██╗██║██║   ██║██╔══╝  ██╔══██╗
%c ███████║   ██║   ██║  ██║██║  ██║██║ ╚████║╚██████╔╝███████╗██║  ██║
%c ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
%c                    THINGS API 🔦
%c
%c "Friends don't lie." - Eleven
%c
%c Try the Konami Code for a surprise! ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️
`,
    'color: #e50914; font-family: monospace;',
    'color: #e50914; font-family: monospace;',
    'color: #e50914; font-family: monospace;',
    'color: #e50914; font-family: monospace;',
    'color: #e50914; font-family: monospace;',
    'color: #e50914; font-family: monospace;',
    'color: #fff; font-size: 14px;',
    '',
    'color: #aaa; font-style: italic;',
    '',
    'color: #666; font-size: 10px;'
);
