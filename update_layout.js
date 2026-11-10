const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, 'assets', 'js', 'layout.js');
let code = fs.readFileSync(layoutPath, 'utf8');

// 1. Fix footer nav closing tags if any were replaced
code = code.replace(
    /('<li><a href="' \+ prefix \+ 'pages\/terms\.html" class="text-white\/80 transition hover:text-\[#3B82F6\]">Terms of Service<\/a><\/li>' \+\s*'<\/ul>' \+\s*)'<\/div>' \+/g,
    "$1'</nav>' +"
);
code = code.replace(
    /('<li><a href="https:\/\/f9xr\.org\/resumio" target="_blank" rel="noopener noreferrer" class="text-white\/80 transition hover:text-\[#3B82F6\]">Resumio<\/a><\/li>' \+\s*'<\/ul>' \+\s*)'<\/div>' \+/g,
    "$1'</nav>' +"
);
code = code.replace(
    /('<div class="mt-4 flex flex-wrap gap-2\.5">[\s\S]*?'<\/div>' \+\s*)'<\/div>' \+\s*(\/\* Categories nav \*\/)/g,
    "$1'</nav>' +\n\n                            $2"
);
code = code.replace(
    /('<div class="mt-3\.5 grid max-w-\[17rem\] grid-cols-2 gap-x-4 gap-y-2">' \+ footerCatsHtml \+ '<\/div>' \+\s*)'<\/div>' \+\s*('<\/div>' \+\s*\/\* --- Compact brand wordmark --- \*\/)/g,
    "$1'</nav>' +\n                        $2"
);

// 2. Replace headerMain
const oldHeaderStart = code.indexOf('var headerMain =');
const oldHeaderEnd = code.indexOf('var footerCategories =', oldHeaderStart);

if (oldHeaderStart !== -1 && oldHeaderEnd !== -1) {
    const newHeaderCode = `var isToolsActive = pageDir === "tools" || fileName === "tools.html" || fileName === "tools";
        var isAboutActive = fileName === "about.html";

        var headerMain =
            '<header class="navbar" id="navbar">' +
                '<div class="nav-container">' +
                    /* Left-side segmented capsule pill matching reference design */
                    '<div class="nav-capsule" role="navigation" aria-label="Main Navigation">' +
                        '<a href="' + homeHref + '" class="nav-capsule-item' + (!isToolsActive && !isAboutActive ? ' nav-capsule-active' : '') + '">Studio</a>' +
                        '<a href="' + prefix + 'tools/" class="nav-capsule-item' + (isToolsActive ? ' nav-capsule-active' : '') + '">Project <span class="nav-item-count">(198)</span></a>' +
                        '<a href="' + homeHref + '#categories" class="nav-capsule-item">Service</a>' +
                        '<a href="' + prefix + 'pages/about.html" class="nav-capsule-item' + (isAboutActive ? ' nav-capsule-active' : '') + '">Blog</a>' +
                    '</div>' +
                    /* Centered geometric crosshair & quadrant emblem matching reference design */
                    '<a href="' + homeHref + '" class="nav-center-brand" aria-label="Troolify - Home">' +
                        '<svg class="nav-emblem-icon" width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
                            '<path d="M16 2V30M2 16H30" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/>' +
                            '<path d="M16 4C22.6274 4 28 9.37258 28 16H16V4Z" fill="#FFFFFF"/>' +
                            '<path d="M16 28C9.37258 28 4 22.6274 4 16H16V28Z" fill="#FFFFFF"/>' +
                        '</svg>' +
                    '</a>' +
                    /* Right-side actions: search + futuristic Menu pill with 4 cyan dots */
                    '<div class="nav-right-actions">' +
                        '<button type="button" class="nav-search-btn" aria-label="Search tools" aria-haspopup="dialog">' +
                            '<i class="fa-solid fa-magnifying-glass"></i>' +
                        '</button>' +
                        '<button type="button" class="nav-menu-pill mobile-menu-btn" aria-label="Toggle menu" aria-expanded="false">' +
                            '<span class="menu-label">Menu</span>' +
                            '<span class="menu-grid-dots" aria-hidden="true">' +
                                '<span class="m-dot"></span><span class="m-dot"></span>' +
                                '<span class="m-dot"></span><span class="m-dot"></span>' +
                            '</span>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</header>' +
            '<div class="mobile-menu" aria-hidden="true">' +
                '<a href="' + homeHref + '">Studio (Home)</a>' +
                '<a href="' + prefix + 'tools/">Project / Tools (198)</a>' +
                '<a href="' + homeHref + '#categories">Service / Categories</a>' +
                '<a href="' + prefix + 'pages/about.html">Blog / About</a>' +
                '<a href="' + prefix + 'pages/contact.html">Support</a>' +
                '<a href="' + toolsHref + '" class="btn btn-primary" style="margin-top: 1rem;">Explore All Tools</a>' +
            '</div>';\n\n        `;

    code = code.slice(0, oldHeaderStart) + newHeaderCode + code.slice(oldHeaderEnd);
    console.log('Replaced headerMain successfully!');
} else {
    console.error('Could not locate headerMain bounds');
}

// 3. Update footerMain with cosmic image
const oldFooterStart = code.indexOf("var footerMain =\n            '<footer class=\"tx-footer\">'");
if (oldFooterStart !== -1) {
    const target = "var footerMain =\n            '<footer class=\"tx-footer\">' +";
    const replacement = "var footerMain =\n            '<footer class=\"tx-footer\">' +\n                /* Cosmic background artwork layer from assets/images/hero-image-3.webp */\n                '<div class=\"footer-cosmic-bg\" style=\"background-image: url(\\'' + prefix + 'assets/images/hero-image-3.webp\\');\" aria-hidden=\"true\"></div>' +\n                '<div class=\"footer-cosmic-overlay\" aria-hidden=\"true\"></div>' +";
    code = code.replace(target, replacement);
    console.log('Added cosmic background to footerMain');
} else {
    // Check if \r\n
    const targetCRLF = "var footerMain =\r\n            '<footer class=\"tx-footer\">' +";
    const replacementCRLF = "var footerMain =\r\n            '<footer class=\"tx-footer\">' +\r\n                /* Cosmic background artwork layer from assets/images/hero-image-3.webp */\r\n                '<div class=\"footer-cosmic-bg\" style=\"background-image: url(\\'' + prefix + 'assets/images/hero-image-3.webp\\');\" aria-hidden=\"true\"></div>' +\r\n                '<div class=\"footer-cosmic-overlay\" aria-hidden=\"true\"></div>' +";
    code = code.replace(targetCRLF, replacementCRLF);
    console.log('Added cosmic background to footerMain (CRLF)');
}

// 4. Update ctaMain with cosmic image
const ctaTarget = "'<div class=\"cta-panel\">' +";
const ctaReplacement = "'<div class=\"cta-panel\">' +\n                        /* Cosmic background image from assets/images/hero-image-3.webp */\n                        '<div class=\"cta-bg-image\" style=\"background-image: url(\\'' + prefix + 'assets/images/hero-image-3.webp\\');\" aria-hidden=\"true\"></div>' +\n                        '<div class=\"cta-overlay-gradient\" aria-hidden=\"true\"></div>' +";
code = code.replace(ctaTarget, ctaReplacement);

// 5. Update toggleMenu to support menu-label & is-active state
const oldToggleMenu = "if (menuBtn) {\n                menuBtn.innerHTML = isMenuOpen\n                    ? '<i class=\"fa-solid fa-xmark\"></i>'\n                    : '<i class=\"fa-solid fa-bars\"></i>';\n                menuBtn.setAttribute(\"aria-expanded\", String(isMenuOpen));\n            }";
const newToggleMenu = `if (menuBtn) {
                var menuLabel = menuBtn.querySelector(".menu-label");
                if (menuLabel) {
                    menuLabel.textContent = isMenuOpen ? "Close" : "Menu";
                } else {
                    menuBtn.innerHTML = isMenuOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
                }
                menuBtn.classList.toggle("is-active", isMenuOpen);
                menuBtn.setAttribute("aria-expanded", String(isMenuOpen));
            }`;

code = code.replace(oldToggleMenu, newToggleMenu);
// Also try with \r\n
code = code.replace(oldToggleMenu.replace(/\n/g, '\r\n'), newToggleMenu.replace(/\n/g, '\r\n'));

// 6. Append new styles to shellStyles
const styleHook = "'.skip-link{position:absolute;";
const customHeaderStyles = `
/* 2030 Futuristic Capsule Header */
.nav-container{max-width:var(--container-max,1280px);margin:0 auto;padding:0 1.5rem;display:flex;justify-content:space-between;align-items:center;position:relative}
.nav-capsule{display:inline-flex;align-items:center;gap:4px;padding:4px;border-radius:9999px;background:rgba(10,14,28,0.65);border:1px solid rgba(56,189,248,0.35);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 4px 20px -2px rgba(0,0,0,0.4),inset 0 0 12px rgba(56,189,248,0.08);transition:border-color .25s ease,box-shadow .25s ease}
.nav-capsule:hover{border-color:rgba(56,189,248,0.55);box-shadow:0 4px 25px -2px rgba(56,189,248,0.18),inset 0 0 16px rgba(56,189,248,0.12)}
.nav-capsule-item{padding:6px 16px;font-size:0.84rem;font-weight:500;color:rgba(255,255,255,0.78);text-decoration:none;border-radius:9999px;transition:all .22s ease;white-space:nowrap;display:inline-flex;align-items:center;gap:4px}
.nav-capsule-item:hover{color:#FFFFFF}
.nav-capsule-item.nav-capsule-active{background:#FFFFFF;color:#000000;font-weight:700;box-shadow:0 2px 10px rgba(0,0,0,0.35)}
.nav-item-count{font-size:0.75rem;opacity:0.65;font-weight:500}
.nav-center-brand{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;text-decoration:none;transition:transform .25s ease,filter .25s ease}
.nav-center-brand:hover{transform:translateX(-50%) scale(1.08);filter:drop-shadow(0 0 12px rgba(255,255,255,0.7))}
.nav-emblem-icon{width:32px;height:32px;display:block}
.nav-right-actions{display:flex;align-items:center;gap:0.75rem}
.nav-search-btn{width:40px;height:40px;border-radius:9999px;background:rgba(10,14,28,0.65);border:1px solid rgba(56,189,248,0.3);color:#E0F2FE;display:grid;place-items:center;cursor:pointer;font-size:0.9rem;transition:all .22s ease;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.nav-search-btn:hover{background:rgba(56,189,248,0.15);border-color:rgba(56,189,248,0.6);color:#FFFFFF;transform:scale(1.05);box-shadow:0 0 16px rgba(56,189,248,0.3)}
.nav-menu-pill{display:inline-flex;align-items:center;gap:10px;padding:8px 18px;border-radius:9999px;background:rgba(10,14,28,0.65);border:1px solid rgba(56,189,248,0.35);color:#FFFFFF;font-size:0.88rem;font-weight:500;cursor:pointer;transition:all .25s ease;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 4px 18px -2px rgba(0,0,0,0.35),inset 0 0 10px rgba(56,189,248,0.06)}
.nav-menu-pill:hover{background:rgba(14,20,38,0.85);border-color:rgba(56,189,248,0.65);transform:translateY(-1px);box-shadow:0 6px 24px -2px rgba(56,189,248,0.25),inset 0 0 15px rgba(56,189,248,0.12)}
.nav-menu-pill.is-active{background:rgba(56,189,248,0.2);border-color:#38BDF8;box-shadow:0 0 20px rgba(56,189,248,0.4)}
.menu-grid-dots{display:grid;grid-template-columns:repeat(2,4px);gap:3px;align-items:center;justify-content:center}
.m-dot{width:4px;height:4px;background:#38BDF8;border-radius:1px;box-shadow:0 0 6px #38BDF8;transition:transform .2s ease,background .2s ease}
.nav-menu-pill:hover .m-dot,.nav-menu-pill.is-active .m-dot{background:#7DD3FC;box-shadow:0 0 8px #38BDF8,0 0 14px rgba(56,189,248,0.8);transform:scale(1.15)}
.hero-agency-badge{display:inline-flex;align-items:center;gap:8px;padding:7px 18px;border-radius:9999px;background:rgba(8,12,28,0.7);border:1.5px solid rgba(56,189,248,0.45);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);color:#E0F2FE;font-size:0.84rem;font-weight:600;letter-spacing:0.04em;box-shadow:0 0 20px -2px rgba(56,189,248,0.25),inset 0 0 12px rgba(56,189,248,0.1);margin-bottom:1.5rem;transition:all .3s ease}
.hero-agency-badge:hover{border-color:rgba(56,189,248,0.75);box-shadow:0 0 28px rgba(56,189,248,0.4),inset 0 0 18px rgba(56,189,248,0.2);transform:translateY(-2px)}
.badge-sparkle{color:#38BDF8;font-size:0.95rem;text-shadow:0 0 8px #38BDF8}
.hero-tech-meta{position:absolute;top:2rem;right:2.5rem;z-index:5;text-align:right;font-family:var(--font-primary,monospace);font-size:0.72rem;line-height:1.45;color:rgba(224,242,254,0.65);letter-spacing:0.04em;pointer-events:none}
.hero-tech-meta .meta-line-1{display:block;font-weight:600;color:#38BDF8;text-shadow:0 0 10px rgba(56,189,248,0.5)}
.hero-tech-meta .meta-line-2{color:rgba(255,255,255,0.6)}
.cta-panel{position:relative;overflow:hidden;border-radius:30px;padding:clamp(2.25rem,5vw,3.75rem) clamp(1.5rem,4.5vw,3.5rem);background:#050712;text-align:center;border:1px solid rgba(56,189,248,0.35);box-shadow:0 20px 60px -15px rgba(0,0,0,0.8),0 0 35px -5px rgba(56,189,248,0.2)}
.cta-bg-image{position:absolute;inset:0;width:100%;height:100%;background-size:cover;background-position:center;background-repeat:no-repeat;opacity:0.45;mix-blend-mode:screen;pointer-events:none;filter:saturate(1.25) contrast(1.1)}
.cta-overlay-gradient{position:absolute;inset:0;background:radial-gradient(circle at center,rgba(56,189,248,0.15) 0%,rgba(5,7,18,0.85) 85%),linear-gradient(140deg,rgba(56,189,248,0.35) 0%,rgba(37,99,235,0.4) 45%,rgba(15,23,42,0.95) 100%);pointer-events:none}
.tx-footer{position:relative;z-index:1;background:#05050A;padding:0;border-top:1px solid rgba(56,189,248,0.18);overflow:hidden}
.footer-cosmic-bg{position:absolute;inset:0;width:100%;height:100%;background-size:cover;background-position:center bottom;background-repeat:no-repeat;opacity:0.28;mix-blend-mode:screen;pointer-events:none;filter:saturate(1.3) brightness(0.95);transition:opacity .5s ease}
.footer-cosmic-overlay{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 80% 50% at 50% 100%,rgba(124,58,237,0.28) 0%,transparent 70%),linear-gradient(to top,rgba(5,5,10,0.7) 0%,rgba(5,5,10,0.96) 60%,#05050A 100%)}
@media(max-width:900px){.nav-capsule-item:nth-child(n+4){display:none}.hero-tech-meta{display:none}}
@media(max-width:680px){.nav-capsule{gap:2px;padding:3px}.nav-capsule-item{padding:5px 10px;font-size:0.78rem}.nav-capsule-item .nav-item-count{display:none}.nav-emblem-icon{width:26px;height:26px}.nav-menu-pill{padding:7px 14px;font-size:0.82rem}}
`;

code = code.replace(styleHook, customHeaderStyles.replace(/\n/g, '') + styleHook);

fs.writeFileSync(layoutPath, code, 'utf8');
console.log('Successfully updated layout.js!');
