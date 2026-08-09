/* ============================================================================
   Troolify — Shared Layout Injector
   ----------------------------------------------------------------------------
   Auto-injects the site header, CTA and footer into every page so navigation
   and footer markup stay DRY (single source of truth).

   A single design is used everywhere (matching index.html):

     • Header — dark navbar + mobile menu (style.css / site-shell.css)
     • CTA    — conversion band injected just above the footer
     • Footer — rich brand footer (Tailwind utilities in tailwind.css)

   The CTA is skipped on pages that already ship their own (e.g. index.html,
   which has a static  .final-cta  section).

   Include this script on every page with (adjust the path for subfolders):

       <script src="assets/js/layout.js" defer></script>

   Relative links (home / tools catalog / anchors) are resolved automatically
   from the current page's directory depth.
   ============================================================================ */

(function () {
    "use strict";

    /* ------------------------------------------------------------------------
       Small helpers
       ------------------------------------------------------------------------ */

    function onReady(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    // Directory depth of the current page relative to the site root.
    //   /index.html                     -> 0 levels -> ""
    //   /tools/word-counter.html        -> 1 level  -> "../"
    //   /press/editorial-policies.html  -> 1 level  -> "../"
    function rootPrefix() {
        var dirs = window.location.pathname.split("/").filter(Boolean);
        dirs.pop(); // drop the file name
        return dirs.map(function () { return "../"; }).join("");
    }

    /* ------------------------------------------------------------------------
       Main injection routine
       ------------------------------------------------------------------------ */

    onReady(function () {
        var body = document.body;
        if (!body) return;

        // Avoid double injection if the script is loaded more than once
        // or a page already ships a static header/footer.
        if (document.querySelector(".navbar, .site-header")) return;

        var dirs = window.location.pathname.split("/").filter(Boolean);
        var fileName = dirs[dirs.length - 1] || "";
        var pageDir = dirs.length > 1 ? dirs[dirs.length - 2] : "";
        var prefix = rootPrefix();

        // Absolute (from this page) links to the two key destinations.
        var homeHref = prefix + "index.html";
        var toolsHref = pageDir === "tools" ? "./index.html" : prefix + "tools/index.html";

        /* --------------------------------------------------------------------
           MAIN theme — dark navbar + mobile menu + footer (style.css)
           -------------------------------------------------------------------- */

        var headerMain =
            '<header class="navbar" id="navbar">' +
                '<div class="nav-container">' +
                    /* Left-side menu */
                    '<nav class="nav-links nav-links-left" aria-label="Primary">' +
                        '<a href="' + homeHref + '#home">Home</a>' +
                        '<a href="' + homeHref + '#tools">Tools</a>' +
                        '<a href="' + homeHref + '#categories">Categories</a>' +
                    '</nav>' +
                    /* Centered brand */
                    '<a href="' + homeHref + '" class="brand">' +
                        '<img src="https://f9xr.github.io/logo.webp" alt="F9XR Team" class="brand-logo-img">' +
                        '<span class="brand-text">Troolify<span class="brand-sub">by F9XR Team</span></span>' +
                    '</a>' +
                    /* Right-side menu + actions */
                    '<div class="nav-actions">' +
                        '<nav class="nav-links nav-links-right" aria-label="Secondary">' +
                            '<a href="' + homeHref + '#about">About</a>' +
                            '<a href="mailto:tontufytservices@gmail.com">Support</a>' +
                        '</nav>' +
                        '<button type="button" class="nav-search-btn" aria-label="Search tools" aria-haspopup="dialog">' +
                            '<i class="fa-solid fa-magnifying-glass"></i>' +
                        '</button>' +
                        '<a href="' + toolsHref + '" class="btn btn-nav">Explore Tools</a>' +
                        '<button class="mobile-menu-btn" aria-label="Toggle menu" aria-expanded="false">' +
                            '<i class="fa-solid fa-bars"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</header>' +
            '<div class="mobile-menu" aria-hidden="true">' +
                '<a href="' + homeHref + '#home">Home</a>' +
                '<a href="' + homeHref + '#tools">Tools</a>' +
                '<a href="' + homeHref + '#categories">Categories</a>' +
                '<a href="' + homeHref + '#about">About</a>' +
                '<a href="mailto:tontufytservices@gmail.com">Support</a>' +
                '<a href="' + toolsHref + '" class="btn btn-primary" style="margin-top: 1rem;">Explore Tools</a>' +
            '</div>';

        var footerMain =
            '<footer class="tx-footer">' +
                /* Accent-blue border frame with blue-tinted shadow (DESIGN.md §3, §5) */
                '<div class="mx-4 my-8 rounded-[32px] bg-[#3B82F6] p-[3px] shadow-[0_0_60px_rgba(59,130,246,0.25)] sm:mx-6">' +
                    '<div class="relative overflow-hidden rounded-[29px] bg-[#0A0A0A] px-6 py-12 sm:px-10 sm:py-14 lg:px-16">' +

                        /* Ambient brand glow — radial accent-blue blobs (DESIGN.md §5) */
                        '<div class="pointer-events-none absolute -top-40 left-1/2 h-80 w-[720px] -translate-x-1/2 rounded-full bg-[#3B82F6]/15 blur-[120px]" aria-hidden="true"></div>' +
                        '<div class="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-[#3B82F6]/10 blur-[100px]" aria-hidden="true"></div>' +

                        /* Subtle grid overlay on the dark canvas (DESIGN.md §5) */
                        '<div class="pointer-events-none absolute inset-0" style="background-image:linear-gradient(rgba(248,249,250,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(248,249,250,0.04) 1px,transparent 1px);background-size:48px 48px;-webkit-mask-image:radial-gradient(ellipse 90% 60% at 50% 0%,#000 30%,transparent 75%);mask-image:radial-gradient(ellipse 90% 60% at 50% 0%,#000 30%,transparent 75%)" aria-hidden="true"></div>' +

                        /* --- Top content grid --- */
                        '<div class="relative grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.35fr] lg:gap-14">' +

                            /* Left column — brand mission */
                            '<div>' +
                                '<a href="' + homeHref + '" class="inline-flex items-center gap-3">' +
                                    '<span class="grid h-9 w-9 place-items-center rounded-xl bg-[#3B82F6] text-white shadow-[0_0_20px_rgba(59,130,246,0.45)]"><i class="fa-solid fa-cube"></i></span>' +
                                    '<span class="text-xl font-bold tracking-tight text-white">Troolify</span>' +
                                '</a>' +
                                '<p class="mt-7 max-w-md text-base leading-[1.8] text-[#F8F9FA]/90 sm:text-lg">Troolify is a privacy-first workspace on the internet where your digital workflows run instantly, securely, and entirely inside your browser.</p>' +
                                '<div class="mt-8 flex flex-col gap-2 text-sm text-[#9CA3AF]">' +
                                    '<span>Made by <a href="https://f9xr.github.io" target="_blank" rel="noopener" class="font-medium text-white/80 transition hover:text-[#3B82F6]">F9XR Team</a></span>' +
                                    '<a href="https://github.com/f9xr/troolify" target="_blank" rel="noopener" class="font-medium text-white/80 transition hover:text-[#3B82F6]">This website is Open Source</a>' +
                                '</div>' +
                            '</div>' +

                            /* Middle column 1 — Company links */
                            '<nav aria-label="Company">' +
                                '<h4 class="text-xs font-semibold uppercase tracking-[0.22em] text-[#E9ECEF]">Company</h4>' +
                                '<ul class="mt-6 space-y-3">' +
                                    '<li><a href="' + homeHref + '#about" class="text-white/80 transition hover:text-[#3B82F6]">About</a></li>' +
                                    '<li><a href="' + toolsHref + '" class="text-white/80 transition hover:text-[#3B82F6]">Utilities</a></li>' +
                                    '<li><a href="https://f9xr.github.io/legals/privacy.html" target="_blank" rel="noopener" class="inline-flex items-center gap-2 text-white/80 transition hover:text-[#3B82F6]">Privacy Engine' +
                                        '<span class="rounded-full bg-[#3B82F6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">New</span>' +
                                    '</a></li>' +
                                    '<li><a href="https://github.com/f9xr/troolify/releases" target="_blank" rel="noopener" class="text-white/80 transition hover:text-[#3B82F6]">Changelog</a></li>' +
                                    '<li><a href="' + prefix + 'press/editorial-policies.html" class="text-white/80 transition hover:text-[#3B82F6]">Editorial Policies</a></li>' +
                                '</ul>' +
                            '</nav>' +

                            /* Middle column 2 — Follow us links + social icons */
                            '<nav aria-label="Follow us">' +
                                '<h4 class="text-xs font-semibold uppercase tracking-[0.22em] text-[#E9ECEF]">Follow us</h4>' +
                                '<ul class="mt-6 space-y-3">' +
                                    '<li><a href="https://github.com/f9xr" target="_blank" rel="noopener" class="inline-flex items-center gap-2.5 text-white/80 transition hover:text-[#3B82F6]"><i class="fa-brands fa-github w-4 text-center"></i>GitHub</a></li>' +
                                    '<li><a href="https://linkedin.com/company/f9xrteam" target="_blank" rel="noopener" class="inline-flex items-center gap-2.5 text-white/80 transition hover:text-[#3B82F6]"><i class="fa-brands fa-linkedin w-4 text-center"></i>LinkedIn</a></li>' +
                                    '<li><a href="https://instagram.com/f9xrteam" target="_blank" rel="noopener" class="inline-flex items-center gap-2.5 text-white/80 transition hover:text-[#3B82F6]"><i class="fa-brands fa-instagram w-4 text-center"></i>Instagram</a></li>' +
                                    '<li><a href="https://youtube.com/@QuarterlyLIV" target="_blank" rel="noopener" class="inline-flex items-center gap-2.5 text-white/80 transition hover:text-[#3B82F6]"><i class="fa-brands fa-youtube w-4 text-center"></i>YouTube</a></li>' +
                                    '<li><a href="https://www.threads.com/@f9xrteam" target="_blank" rel="noopener" class="inline-flex items-center gap-2.5 text-white/80 transition hover:text-[#3B82F6]"><i class="fa-brands fa-threads w-4 text-center"></i>Threads</a></li>' +
                                '</ul>' +
                            '</nav>' +

                            /* Right column — contact + newsletter capture */
                            '<div>' +
                                '<h4 class="text-xs font-semibold uppercase tracking-[0.22em] text-[#E9ECEF]">Stay up to date</h4>' +
                                '<form class="mt-6 flex flex-col gap-3 sm:flex-row" action="mailto:tontufytservices@gmail.com" method="post" enctype="text/plain">' +
                                    '<input type="email" name="email" placeholder="Enter your email" aria-label="Enter your email" class="w-full flex-1 rounded-xl border border-[#343A40] bg-[#212529] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]">' +
                                    '<button type="submit" class="rounded-xl bg-[#3B82F6] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(59,130,246,0.35)] transition hover:bg-[#2563EB]">Sign Up</button>' +
                                '</form>' +
                                '<p class="mt-4 max-w-xs text-xs leading-relaxed text-[#9CA3AF]">Get product updates in your inbox. Questions? <a href="mailto:tontufytservices@gmail.com" class="font-medium text-white/80 transition hover:text-[#3B82F6]">tontufytservices@gmail.com</a></p>' +
                            '</div>' +
                        '</div>' +

                        /* --- Massive brand marquee watermark --- */
                        '<div class="relative mt-16 select-none lg:mt-20">' +
                            '<div class="text-center text-[clamp(64px,15vw,210px)] font-black leading-[0.8] tracking-tighter text-[#3B82F6] drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]">troolify</div>' +
                        '</div>' +

                        /* --- Bottom baseline metadata --- */
                        '<div class="relative mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#343A40] pt-8 text-sm text-[#9CA3AF] md:flex-row">' +
                            '<p>&copy; 2026 Troolify. All rights reserved.</p>' +
                            '<div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">' +
                                '<a href="https://f9xr.github.io/legals/terms.html" target="_blank" rel="noopener" class="transition hover:text-[#3B82F6]">Terms</a>' +
                                '<a href="https://f9xr.github.io/legals/privacy.html" target="_blank" rel="noopener" class="transition hover:text-[#3B82F6]">Privacy Policy</a>' +
                                '<a href="mailto:tontufytservices@gmail.com" class="transition hover:text-[#3B82F6]">Contact</a>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</footer>';

        /* --------------------------------------------------------------------
           CTA band — conversion section injected just above the footer
           (skipped on pages that already ship a static CTA, e.g. index.html)
           -------------------------------------------------------------------- */

        var ctaMain =
            '<section class="tx-cta" aria-label="Call to action">' +
                '<div class="mx-4 my-8 rounded-[32px] bg-[#3B82F6] p-[3px] shadow-[0_0_60px_rgba(59,130,246,0.25)] sm:mx-6">' +
                    '<div class="relative overflow-hidden rounded-[29px] bg-[#0A0A0A] px-6 py-16 text-center sm:px-10 sm:py-20">' +

                        /* Ambient brand glow — radial accent-blue blobs */
                        '<div class="pointer-events-none absolute -top-40 left-1/2 h-80 w-[720px] -translate-x-1/2 rounded-full bg-[#3B82F6]/15 blur-[120px]" aria-hidden="true"></div>' +
                        '<div class="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-[#3B82F6]/10 blur-[100px]" aria-hidden="true"></div>' +

                        '<div class="relative">' +
                            '<span class="inline-block rounded-full border border-[#3B82F6]/40 bg-[#3B82F6]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#60A5FA]">Troolify &middot; Free Tools</span>' +
                            '<h2 class="mx-auto mt-6 max-w-2xl text-3xl font-black uppercase italic leading-tight tracking-tight text-white sm:text-5xl">Your Next Useful Tool Is Already Here.</h2>' +
                            '<p class="mx-auto mt-5 max-w-xl text-base leading-[1.8] text-[#9CA3AF] sm:text-lg">Explore Troolify and discover a growing collection of tools built to make everyday digital tasks simpler &mdash; free, fast and 100% client-side.</p>' +
                            '<div class="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">' +
                                '<a href="' + toolsHref + '" class="inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-7 py-3.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(59,130,246,0.35)] transition hover:bg-[#2563EB]">Explore All Tools <i class="fa-solid fa-arrow-right"></i></a>' +
                                '<a href="' + homeHref + '#about" class="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition hover:border-[#3B82F6] hover:text-[#60A5FA]">Learn More</a>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</section>';

        /* --------------------------------------------------------------------
           Back-to-top button — small floating control, injected on every page
           -------------------------------------------------------------------- */

        var backToTopMarkup =
            '<button type="button" id="backToTop" aria-label="Back to top" class="fixed bottom-6 right-6 z-[1500] hidden h-11 w-11 place-items-center rounded-full bg-[#3B82F6] text-white shadow-[0_4px_20px_rgba(59,130,246,0.35)] transition hover:bg-[#2563EB]">' +
                '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>' +
            '</button>';

        /* --------------------------------------------------------------------
           Global search modal markup (DESIGN.md §9 Search Modal)
           -------------------------------------------------------------------- */

        var searchModalMarkup =
            '<div class="search-modal" id="searchModal" aria-hidden="true">' +
                '<div class="search-modal-backdrop"></div>' +
                '<div class="search-modal-panel">' +
                    '<div class="search-modal-input-wrap">' +
                        '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
                        '<input type="text" class="search-modal-input" placeholder="Search the tool catalog\u2026" autocomplete="off" aria-label="Search tools">' +
                        '<button type="button" class="search-modal-close" aria-label="Close search"><i class="fa-solid fa-xmark"></i></button>' +
                    '</div>' +
                    '<div class="search-modal-results"></div>' +
                    '<div class="search-modal-hint">Press <kbd>Enter</kbd> to open tool \u00b7 <kbd>Esc</kbd> to close</div>' +
                '</div>' +
            '</div>';

        /* --------------------------------------------------------------------
           Inject into the page
           -------------------------------------------------------------------- */

        if (document.querySelector(".final-cta, .tx-cta")) {
            body.insertAdjacentHTML("afterbegin", headerMain);
            body.insertAdjacentHTML("beforeend", footerMain);
        } else {
            body.insertAdjacentHTML("afterbegin", headerMain);
            body.insertAdjacentHTML("beforeend", ctaMain);
            body.insertAdjacentHTML("beforeend", footerMain);
        }
        body.insertAdjacentHTML("beforeend", searchModalMarkup);
        body.insertAdjacentHTML("beforeend", backToTopMarkup);

        /* --------------------------------------------------------------------
           Header behaviour — scroll effect, mobile menu, active link
           -------------------------------------------------------------------- */

        var header = document.querySelector(".navbar, .site-header");

        function updateScrolled() {
            header.classList.toggle("scrolled", window.scrollY > 8);
        }
        updateScrolled();
        window.addEventListener("scroll", updateScrolled, { passive: true });

        /* Back-to-top button */
        var backToTop = document.getElementById("backToTop");

        function updateBackToTop() {
            if (backToTop) backToTop.classList.toggle("hidden", window.scrollY < 400);
        }
        updateBackToTop();
        window.addEventListener("scroll", updateBackToTop, { passive: true });
        if (backToTop) {
            backToTop.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

        var menuBtn = document.querySelector(".mobile-menu-btn");
        var mobileMenu = document.querySelector(".mobile-menu");
        var isMenuOpen = false;

        function toggleMenu(force) {
            isMenuOpen = typeof force === "boolean" ? force : !isMenuOpen;
            if (mobileMenu) {
                mobileMenu.classList.toggle("open", isMenuOpen);
                mobileMenu.setAttribute("aria-hidden", String(!isMenuOpen));
            }
            if (menuBtn) {
                menuBtn.innerHTML = isMenuOpen
                    ? '<i class="fa-solid fa-xmark"></i>'
                    : '<i class="fa-solid fa-bars"></i>';
                menuBtn.setAttribute("aria-expanded", String(isMenuOpen));
            }
            document.body.style.overflow = isMenuOpen ? "hidden" : "";
        }

        if (menuBtn) menuBtn.addEventListener("click", function () { toggleMenu(); });
        if (mobileMenu) {
            mobileMenu.querySelectorAll("a").forEach(function (link) {
                link.addEventListener("click", function () { toggleMenu(false); });
            });
        }
        window.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && isMenuOpen) toggleMenu(false);
        });

        // Highlight the active nav link on the root home page only.
        var isHome = dirs.length === 1 && (fileName === "" || fileName === "index.html");
        if (isHome) {
            document.querySelectorAll(".nav-links a").forEach(function (link) {
                if (link.getAttribute("href").indexOf("#home") !== -1) {
                    link.classList.add("active");
                }
            });
        }

        /* --------------------------------------------------------------------
           Global live search — navbar modal + inline search bars
           -------------------------------------------------------------------- */

        var modal = document.getElementById("searchModal");
        var modalInput = modal ? modal.querySelector(".search-modal-input") : null;
        var modalResults = modal ? modal.querySelector(".search-modal-results") : null;
        var modalOpen = false;

        function openSearchModal() {
            if (!modal) return;
            modalOpen = true;
            modal.classList.add("open");
            modal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
            setTimeout(function () { if (modalInput) modalInput.focus(); }, 30);
        }

        function closeSearchModal() {
            if (!modal) return;
            modalOpen = false;
            modal.classList.remove("open");
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
            if (modalInput) modalInput.value = "";
            if (modalResults) modalResults.innerHTML = "";
        }

        function loadToolsData(cb) {
            if (window.TOOLS) { cb(); return; }
            var s = document.createElement("script");
            s.src = prefix + "assets/js/tools-data.js";
            s.onload = function () { cb(); };
            s.onerror = function () { cb(); };
            document.head.appendChild(s);
        }

        function searchResults(query) {
            var tools = window.TOOLS || [];
            var q = query.trim().toLowerCase();
            if (!q) return [];
            return tools.filter(function (t) {
                return (t.name + " " + (t.desc || "") + " " + (t.tag || "") + " " + (t.category || ""))
                    .toLowerCase().indexOf(q) !== -1;
            }).slice(0, 8);
        }

        function resultHref(href) {
            return href && href.indexOf("tools/") === 0 ? prefix + href : href;
        }

        function buildResultItem(t) {
            var a = document.createElement("a");
            a.className = "search-dropdown-item";
            a.href = resultHref(t.href) || "#";
            a.innerHTML =
                '<span class="sd-icon"><i class="' + (t.icon || "fa-solid fa-wrench") + '"></i></span>' +
                '<span class="sd-meta"><span class="sd-name">' + t.name + '</span><br><span class="sd-cat">' + (t.category || "Tool") + '</span></span>';
            return a;
        }

        function renderResults(list, container, query) {
            container.innerHTML = "";
            if (!list.length) {
                var empty = document.createElement("div");
                empty.className = "search-dropdown-empty";
                empty.textContent = query.trim()
                    ? "No tools match that search."
                    : "Start typing to search the catalog\u2026";
                container.appendChild(empty);
                return;
            }
            list.forEach(function (t) { container.appendChild(buildResultItem(t)); });
        }

        function initLiveSearch(input, container, isModal) {
            input.addEventListener("input", function () {
                if (!isModal && !input.value.trim()) {
                    container.classList.remove("open");
                    return;
                }
                renderResults(searchResults(input.value), container, input.value);
                if (!isModal) container.classList.add("open");
            });
            input.addEventListener("focus", function () {
                if (!isModal && input.value.trim() && !container.classList.contains("open")) {
                    container.classList.add("open");
                }
            });
            input.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    var first = container.querySelector(".search-dropdown-item");
                    if (first) {
                        e.preventDefault();
                        closeSearchModal();
                        window.location.href = first.getAttribute("href");
                    }
                }
            });
        }

        document.querySelectorAll(".nav-search-btn").forEach(function (btn) {
            btn.addEventListener("click", openSearchModal);
        });

        if (modal) {
            var modalCloseBtn = modal.querySelector(".search-modal-close");
            var modalBackdrop = modal.querySelector(".search-modal-backdrop");
            if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeSearchModal);
            if (modalBackdrop) modalBackdrop.addEventListener("click", closeSearchModal);
        }

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && modalOpen) { closeSearchModal(); return; }
            if (e.key === "/" && !modalOpen) {
                var tag = (e.target && e.target.tagName) || "";
                if (tag !== "INPUT" && tag !== "TEXTAREA") {
                    e.preventDefault();
                    openSearchModal();
                }
            }
        });

        document.addEventListener("click", function (e) {
            if (!e.target.closest(".hero-search") && !e.target.closest(".search-container")) {
                document.querySelectorAll(".search-dropdown.open").forEach(function (dd) {
                    dd.classList.remove("open");
                });
            }
        });

        loadToolsData(function () {
            if (modalInput && modalResults) initLiveSearch(modalInput, modalResults, true);

            var heroInput = document.getElementById("heroSearchInput");
            var heroDropdown = document.getElementById("heroSearchDropdown");
            var heroClear = document.getElementById("heroSearchClear");
            if (heroInput && heroDropdown) {
                initLiveSearch(heroInput, heroDropdown, false);
                heroInput.addEventListener("input", function () {
                    if (heroClear) heroClear.classList.toggle("show", !!heroInput.value.trim());
                });
            }
            if (heroClear && heroInput) {
                heroClear.addEventListener("click", function () {
                    heroInput.value = "";
                    heroClear.classList.remove("show");
                    heroDropdown.classList.remove("open");
                    heroInput.focus();
                });
            }

            var discInput = document.querySelector(".search-input");
            var discWrap = document.querySelector(".search-container");
            if (discInput && discWrap) {
                var dd = document.createElement("div");
                dd.className = "search-dropdown";
                discWrap.appendChild(dd);
                initLiveSearch(discInput, dd, false);
            }
        });
    });
})();
