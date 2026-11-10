const fs = require('fs');
const path = require('path');

const cssSnippet = `
/* ==========================================================================
   2030 Futuristic Header & Capsule Navigation (matching reference design)
   ========================================================================== */

.navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    padding: 1.5rem 0;
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.navbar.scrolled {
    padding: 0.85rem 0;
    background: rgba(5, 7, 18, 0.85);
    -webkit-backdrop-filter: blur(24px);
    backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(56, 189, 248, 0.15);
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.7);
}

.nav-container {
    max-width: var(--container-max, 1280px);
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
}

/* Left: Segmented capsule pill */
.nav-capsule {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    border-radius: 9999px;
    background: rgba(10, 14, 28, 0.65);
    border: 1px solid rgba(56, 189, 248, 0.35);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4), inset 0 0 12px rgba(56, 189, 248, 0.08);
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.nav-capsule:hover {
    border-color: rgba(56, 189, 248, 0.55);
    box-shadow: 0 4px 25px -2px rgba(56, 189, 248, 0.18), inset 0 0 16px rgba(56, 189, 248, 0.12);
}

.nav-capsule-item {
    padding: 6px 16px;
    font-size: 0.84rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.78);
    text-decoration: none;
    border-radius: 9999px;
    transition: all 0.22s ease;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.nav-capsule-item:hover {
    color: #FFFFFF;
}

/* Active item is a solid pure white pill with black text */
.nav-capsule-item.nav-capsule-active {
    background: #FFFFFF;
    color: #000000;
    font-weight: 700;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}

.nav-item-count {
    font-size: 0.75rem;
    opacity: 0.65;
    font-weight: 500;
}

/* Center: Pure white geometric crosshair & quadrant emblem */
.nav-center-brand {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: transform 0.25s ease, filter 0.25s ease;
}

.nav-center-brand:hover {
    transform: translateX(-50%) scale(1.08);
    filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.7));
}

.nav-emblem-icon {
    width: 30px;
    height: 30px;
    display: block;
}

/* Right: Actions (Search + Menu pill) */
.nav-right-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.nav-search-btn {
    width: 40px;
    height: 40px;
    border-radius: 9999px;
    background: rgba(10, 14, 28, 0.65);
    border: 1px solid rgba(56, 189, 248, 0.3);
    color: #E0F2FE;
    display: grid;
    place-items: center;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.22s ease;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}

.nav-search-btn:hover {
    background: rgba(56, 189, 248, 0.15);
    border-color: rgba(56, 189, 248, 0.6);
    color: #FFFFFF;
    transform: scale(1.05);
    box-shadow: 0 0 16px rgba(56, 189, 248, 0.3);
}

/* Menu pill button with 4 cyan dots */
.nav-menu-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 8px 18px;
    border-radius: 9999px;
    background: rgba(10, 14, 28, 0.65);
    border: 1px solid rgba(56, 189, 248, 0.35);
    color: #FFFFFF;
    font-size: 0.88rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s ease;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 4px 18px -2px rgba(0, 0, 0, 0.35), inset 0 0 10px rgba(56, 189, 248, 0.06);
}

.nav-menu-pill:hover {
    background: rgba(14, 20, 38, 0.85);
    border-color: rgba(56, 189, 248, 0.65);
    transform: translateY(-1px);
    box-shadow: 0 6px 24px -2px rgba(56, 189, 248, 0.25), inset 0 0 15px rgba(56, 189, 248, 0.12);
}

.nav-menu-pill.is-active {
    background: rgba(56, 189, 248, 0.2);
    border-color: #38BDF8;
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
}

.menu-label {
    letter-spacing: -0.01em;
}

/* 4 cyan dots arranged in 2x2 grid */
.menu-grid-dots {
    display: grid;
    grid-template-columns: repeat(2, 4px);
    gap: 3px;
    align-items: center;
    justify-content: center;
}

.m-dot {
    width: 4px;
    height: 4px;
    background: #38BDF8;
    border-radius: 1px;
    box-shadow: 0 0 6px #38BDF8;
    transition: transform 0.2s ease, background 0.2s ease;
}

.nav-menu-pill:hover .m-dot,
.nav-menu-pill.is-active .m-dot {
    background: #7DD3FC;
    box-shadow: 0 0 8px #38BDF8, 0 0 14px rgba(56, 189, 248, 0.8);
    transform: scale(1.15);
}

/* Floating badge below header on the left */
.hero-agency-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 18px;
    border-radius: 9999px;
    background: rgba(8, 12, 28, 0.7);
    border: 1.5px solid rgba(56, 189, 248, 0.45);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    color: #E0F2FE;
    font-size: 0.84rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    box-shadow: 0 0 20px -2px rgba(56, 189, 248, 0.25), inset 0 0 12px rgba(56, 189, 248, 0.1);
    margin-bottom: 1.5rem;
    transition: all 0.3s ease;
}

.hero-agency-badge:hover {
    border-color: rgba(56, 189, 248, 0.75);
    box-shadow: 0 0 28px rgba(56, 189, 248, 0.4), inset 0 0 18px rgba(56, 189, 248, 0.2);
    transform: translateY(-2px);
}

.badge-sparkle {
    color: #38BDF8;
    font-size: 0.95rem;
    text-shadow: 0 0 8px #38BDF8;
}

/* Hero futuristic frame & technical metadata */
.hero {
    position: relative;
    padding: 7rem 1.5rem 4rem;
}

.hero-inner-frame {
    position: relative;
    max-width: var(--container-max, 1280px);
    margin: 0 auto;
    border: 1.5px solid rgba(56, 189, 248, 0.32);
    border-radius: 28px;
    padding: 3rem 2rem 4rem;
    background: radial-gradient(circle at 50% 30%, rgba(124, 58, 237, 0.08) 0%, rgba(5, 7, 18, 0.7) 100%);
    box-shadow: inset 0 0 45px rgba(56, 189, 248, 0.08), 0 0 40px -10px rgba(56, 189, 248, 0.15);
    overflow: hidden;
}

.hero-tech-meta {
    position: absolute;
    top: 2rem;
    right: 2.5rem;
    z-index: 5;
    text-align: right;
    font-family: var(--font-primary, monospace);
    font-size: 0.72rem;
    line-height: 1.45;
    color: rgba(224, 242, 254, 0.65);
    letter-spacing: 0.04em;
    pointer-events: none;
}

.hero-tech-meta .meta-line-1 {
    display: block;
    font-weight: 600;
    color: #38BDF8;
    text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
}

.hero-tech-meta .meta-line-2 {
    color: rgba(255, 255, 255, 0.6);
}

/* Cosmic Planet Background for Footer and CTA (assets/images/hero-image-3.webp) */
.cta-panel {
    position: relative;
    overflow: hidden;
    border-radius: 30px;
    padding: clamp(2.25rem, 5vw, 3.75rem) clamp(1.5rem, 4.5vw, 3.5rem);
    background: #050712;
    text-align: center;
    border: 1px solid rgba(56, 189, 248, 0.35);
    box-shadow: 0 20px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px -5px rgba(56, 189, 248, 0.2);
}

.cta-bg-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.45;
    mix-blend-mode: screen;
    pointer-events: none;
    filter: saturate(1.25) contrast(1.1);
}

.cta-overlay-gradient {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(56, 189, 248, 0.15) 0%, rgba(5, 7, 18, 0.85) 85%),
                linear-gradient(140deg, rgba(56, 189, 248, 0.35) 0%, rgba(37, 99, 235, 0.4) 45%, rgba(15, 23, 42, 0.95) 100%);
    pointer-events: none;
}

/* Final CTA on homepage */
.final-cta {
    position: relative;
    padding: var(--section-pad, 6rem) 0;
    text-align: center;
    overflow: hidden;
}

.final-cta-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.55;
    mix-blend-mode: screen;
    filter: saturate(1.3) contrast(1.1);
}

.final-cta-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, rgba(56, 189, 248, 0.12) 0%, rgba(5, 5, 9, 0.85) 80%),
                linear-gradient(to bottom, rgba(5, 5, 9, 0.7) 0%, rgba(5, 5, 9, 0.95) 100%);
}

/* Footer cosmic artwork */
.tx-footer {
    position: relative;
    z-index: 1;
    background: #05050A;
    padding: 0;
    border-top: 1px solid rgba(56, 189, 248, 0.18);
    overflow: hidden;
}

.footer-cosmic-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center bottom;
    background-repeat: no-repeat;
    opacity: 0.28;
    mix-blend-mode: screen;
    pointer-events: none;
    filter: saturate(1.3) brightness(0.95);
    transition: opacity 0.5s ease;
}

.footer-cosmic-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse 80% 50% at 50% 100%, rgba(124, 58, 237, 0.28) 0%, transparent 70%),
                linear-gradient(to top, rgba(5, 5, 10, 0.7) 0%, rgba(5, 5, 10, 0.96) 60%, #05050A 100%);
}

@media (max-width: 900px) {
    .nav-capsule-item:nth-child(n+4) {
        display: none;
    }
    .hero-tech-meta {
        display: none;
    }
}

@media (max-width: 680px) {
    .nav-capsule {
        gap: 2px;
        padding: 3px;
    }
    .nav-capsule-item {
        padding: 5px 10px;
        font-size: 0.78rem;
    }
    .nav-capsule-item .nav-item-count {
        display: none;
    }
    .nav-emblem-icon {
        width: 26px;
        height: 26px;
    }
    .nav-menu-pill {
        padding: 7px 14px;
        font-size: 0.82rem;
    }
}
`;

function appendCss(filePath) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('2030 Futuristic Header & Capsule Navigation')) {
            content += '\n' + cssSnippet;
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Appended styles to ' + filePath);
        } else {
            console.log('Styles already present in ' + filePath);
        }
    }
}

appendCss(path.join(__dirname, 'assets', 'css', 'style.css'));
appendCss(path.join(__dirname, 'style.css'));
