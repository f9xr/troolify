/* ============================================================================
   Troolify - Shared Layout Injector
   ----------------------------------------------------------------------------
   Auto-injects the site header, CTA and footer into every page so navigation
   and footer markup stay DRY (single source of truth).

   A single design is used everywhere (matching index.html):

     • Header - dark navbar + mobile menu (style.css / site-shell.css)
     • CTA - conversion band injected just above the footer
     • Footer - rich brand footer (Tailwind utilities in tailwind.css)

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

    // Site base path. Troolify is deployed to GitHub Pages as a project site,
    // so every JS-computed link must be rooted at /troolify/ - a relative
    // "../" chain breaks there because the project folder counts as a level.
    var SITE_BASE = "/troolify/";

    function rootPrefix() {
        var path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
        if (path === "/troolify" || path.indexOf("/troolify/") === 0) return SITE_BASE;
        /* Local preview served from the repo root: fall back to relative paths. */
        var dirs = window.location.pathname.split("/").filter(Boolean);
        dirs.pop(); // drop the file name
        return dirs.map(function () { return "../"; }).join("");
    }

    // "Featured On" directory badges (ProductBurst, Pro Launch, Nick Launches,
    // PeerPush, LiftOff) shown in the header dropdown + mobile menu, moving as
    // a marquee. Each badge link is duplicated in the track to loop seamlessly.
    var featuredBadges =
        '<a class="badge-link" href="https://productburst.com/product/troolify" target="_blank" rel="noopener noreferrer">' +
            '<img src="https://3188a5210b07f4ad511bbcdc967bc67b.cdn.bubble.io/f1747781918344x939992978866771600/pB-Badge.png" alt="Featured on ProductBurst" width="160" height="50" loading="lazy" decoding="async" />' +
        '</a>' +
        '<a class="badge-link" href="https://prolaunch.net" target="_blank" rel="noopener noreferrer" title="Pro Launch Featured Badge">' +
            '<img src="https://prolaunch.net/images/badges/featured-dark.svg" alt="Pro Launch Featured Badge" width="240" height="52" loading="lazy" decoding="async" />' +
        '</a>' +
        '<a class="badge-link" href="https://nicklaunches.com/products/troolify/?utm_source=f9xr.github.io&utm_medium=badge&utm_campaign=featured" target="_blank" rel="noopener noreferrer">' +
            '<img src="https://nicklaunches.com/badges/featured-dark.png" alt="Troolify on Nick Launches" width="244" height="56" />' +
        '</a>' +
        '<a class="badge-link" href="https://peerpush.com/p/troolify" target="_blank" rel="noopener noreferrer">' +
            '<img src="https://peerpush.com/p/troolify/badge.png" alt="Troolify on PeerPush" width="230" height="56" loading="lazy" decoding="async" />' +
        '</a>' +
        '<a class="badge-link" href="https://lift-off.sh/p/troolify" target="_blank" rel="noopener noreferrer" title="LiftOff launch badge">' +
            '<img src="https://lift-off.sh/images/badges/badgeLaunchedDarkBAR.webp" alt="LiftOff launch badge" width="200" height="56" loading="lazy" decoding="async" />' +
        '</a>';

    /* ------------------------------------------------------------------------
       Dashboard right-sidebar builder
       Generates the right sidebar content per page type inside the dashboard.

         • Tool page  -> quick actions + tool details + related tools mini-list
         • Catalog    -> category info + related categories ("browse more")

       Depends on window.TOOLS / window.CATEGORIES (loaded lazily as needed).
       ------------------------------------------------------------------------ */

    function countCategoryTools(cats) {
        var tools = window.TOOLS || [];
        var count = {};
        cats.forEach(function (c) { count[c.folder] = 0; });
        tools.forEach(function (t) {
            var cat = t.category;
            if (cat && count[cat] !== undefined) count[cat]++;
        });
        return count;
    }

    function findCategory(folder) {
        var cats = window.CATEGORIES || [];
        for (var i = 0; i < cats.length; i++) {
            if ((cats[i].folder || "").toLowerCase() === (folder || "").toLowerCase()) return cats[i];
        }
        return null;
    }

    function currentToolName() {
        var path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
        var segs = path.split("/").filter(Boolean);
        var fname = segs[segs.length - 1] || "";
        return fname === "index.html" ? "" : fname;
    }

    function buildRightSidebar(sidebar, prefix) {
        var isToolPage = !!document.querySelector(".tool-head.hero");

        /* Load tool data before building related lists. */
        loadToolsDataForSidebar(function () {
            var tools = window.TOOLS || [];
            var cats = window.CATEGORIES || [];

            var html = "";

            if (isToolPage) {
                // Category context from the current folder path.
                var path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
                var segs = path.split("/").filter(Boolean);
                var toolsIdx = -1;
                for (var i = 0; i < segs.length; i++) { if (segs[i] === "tools") { toolsIdx = i; break; } }
                var catSeg = toolsIdx > -1 ? segs[toolsIdx + 1] : "";
                var catFolder = catSeg ? catSeg.charAt(0).toUpperCase() + catSeg.slice(1) : "";
                var catInfo = findCategory(catFolder);

                // Current tool filename (e.g. "word-counter.html").
                var cname = currentToolName();

                // --- Quick actions -----------------------------------------
                html += '<div class="dash-rs-panel">' +
                            '<div class="panel-title"><i class="fa-solid fa-bolt"></i>Quick Actions</div>' +
                            '<div class="dash-rs-actions">' +
                                '<button type="button" class="rt-btn" id="rsShare"><i class="fa-solid fa-share-nodes"></i>Share</button>' +
                                '<button type="button" class="rt-btn" id="rsEmbed"><i class="fa-solid fa-code"></i>Embed Tool</button>' +
                                '<a class="rt-btn" href="' + prefix + 'pages/feedback.html"><i class="fa-solid fa-comment"></i>Feedback</a>' +
                            '</div>' +
                        '</div>';

                // --- Category badge -----------------------------------------
                if (catFolder) {
                    html += '<div class="dash-rs-panel">' +
                                '<div class="panel-title"><i class="fa-solid fa-folder-open"></i>Browse ' + (catInfo ? (catInfo.name || catFolder) : catFolder + " Tools") + '</div>' +
                                '<a class="dash-rs-cat-badge" href="' + prefix + 'tools/' + catFolder.toLowerCase() + '/index.html">' +
                                    '<i class="fa-solid fa-folder"></i>' + (catInfo ? (catInfo.name || catFolder) : catFolder + " Tools") +
                                '</a>' +
                            '</div>';
                }

                // --- Tool details (from hero-details if present) ------------
                var details = document.querySelector(".hero-details .tool-details");
                if (details) {
                    var rows = details.querySelectorAll(".detail-row");
                    if (rows.length) {
                        var det = '<div class="dash-rs-panel">' +
                                    '<div class="panel-title"><i class="fa-solid fa-circle-info"></i>Tool Details</div>';
                        rows.forEach(function (row) {
                            var lbl = row.querySelector(".detail-label") || null;
                            var val = row.querySelector(".detail-value") || null;
                            det += '<div class="dash-rs-detail-row">' +
                                        '<span class="dash-rs-detail-label">' + (lbl ? lbl.innerHTML : "") + '</span>' +
                                        '<span class="dash-rs-detail-value">' + (val ? val.innerHTML : "") + '</span>' +
                                    '</div>';
                        });
                        det += '</div>';
                        html += det;
                    }
                }

                // --- Related tools (same category) ---------------------------
                var related = tools.filter(function (t) {
                    return (t.category || "").toLowerCase() === (catFolder || "").toLowerCase() &&
                           (t.href || "").split("/").pop() !== cname;
                }).slice(0, 7);
                if (related.length) {
                    var rel = '<div class="dash-rs-panel">' +
                                '<div class="panel-title"><i class="fa-solid fa-shapes"></i>More ' + (catFolder || "Tools") + '</div>' +
                                '<div class="dash-related-mini">';
                    related.forEach(function (t) {
                        rel += '<a class="dash-related-mini-card" href="' + resultHrefForSidebar(t.href) + '">' +
                                    '<span class="rmm-icon"><i class="' + (t.icon || "fa-solid fa-wrench") + '"></i></span>' +
                                    '<span class="rmm-name">' + t.name + '</span>' +
                                    '<span class="rmm-arrow"><i class="fa-solid fa-arrow-right"></i></span>' +
                                '</a>';
                    });
                    rel += '</div></div>';
                    html += rel;
                }
            } else {
                // --- Catalog page: category info + browse categories ---------
                var count = countCategoryTools(cats);
                var folders = [];
                cats.forEach(function (c) {
                    if (count[c.folder] > 0) folders.push(c);
                });

                html += '<div class="dash-rs-panel">' +
                            '<div class="panel-title"><i class="fa-solid fa-compass"></i>Browse</div>' +
                            '<div class="dash-related-mini">';
                folders.slice(0, 9).forEach(function (c) {
                    html += '<a class="dash-related-mini-card" href="' + prefix + 'tools/' + c.folder.toLowerCase() + '/index.html">' +
                                '<span class="rmm-icon"><i class="' + (c.icon || "fa-solid fa-wrench") + '"></i></span>' +
                                '<span class="rmm-name">' + (c.name || c.folder) + '</span>' +
                                '<span class="rmm-arrow"><i class="fa-solid fa-arrow-right"></i></span>' +
                            '</a>';
                });
                html += '</div></div>';
            }

            sidebar.innerHTML = html;

            var shareBtn = document.getElementById("rsShare");
            var embedBtn = document.getElementById("rsEmbed");
            var originalShare = document.getElementById("btnShare");
            var originalEmbed = document.getElementById("btnEmbed");
            if (shareBtn && originalShare) shareBtn.addEventListener("click", function () { originalShare.click(); });
            if (embedBtn && originalEmbed) embedBtn.addEventListener("click", function () { originalEmbed.click(); });
        });
    }

    function resultHrefForSidebar(href) {
        return href && href.indexOf("tools/") === 0 ? rootPrefix() + href : href;
    }

    function loadToolsDataForSidebar(cb) {
        if (window.TOOLS) {
            if (cb) cb();
            return;
        }
        if (window.__DASH_TOOLS_PENDING) {
            if (cb) window.__DASH_TOOLS_PENDING.push(cb);
            return;
        }
        window.__DASH_TOOLS_PENDING = [cb];
        var s = document.createElement("script");
        s.src = rootPrefix() + "assets/js/tools-data.js";
        s.onload = s.onerror = function () {
            var list = window.__DASH_TOOLS_PENDING || [];
            window.__DASH_TOOLS_PENDING = null;
            list.forEach(function (fn) { if (fn) fn(); });
        };
        document.head.appendChild(s);
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

        /* --------------------------------------------------------------------
           Dashboard conversion (2-sidebar glasmorphism layout)
           Applied automatically to every body[data-layout="tool"] page (tool +
           catalog pages). Wraps the page <main> into a .dashboard grid with a
           sticky category-nav left sidebar and an auto-generated right sidebar,
           plus a mobile toggle + overlay. No per-page HTML edits are required.
           -------------------------------------------------------------------- */

        var mainEl = document.querySelector("main");
        if (mainEl && !mainEl.id) mainEl.id = "main";
        if (mainEl && document.body.getAttribute("data-layout") === "tool") {
            (function () {
                // Inject dashboard.css if not already present.
                if (!document.querySelector('link[href*="dashboard.css"]')) {
                    var dlink = document.createElement("link");
                    dlink.rel = "stylesheet";
                    dlink.href = rootPrefix() + "assets/css/dashboard.css";
                    document.head.appendChild(dlink);
                }

                mainEl.classList.add("dashboard");

                // Wrap all existing main content in the center column.
                var dashMain = document.createElement("div");
                dashMain.className = "dash-main";
                while (mainEl.firstChild) dashMain.appendChild(mainEl.firstChild);
                mainEl.appendChild(dashMain);

                // --- Left sidebar: category nav --------------------------------
                var leftAside = document.createElement("aside");
                leftAside.className = "dash-left";
                leftAside.setAttribute("aria-label", "Category navigation");
                leftAside.innerHTML =
                    '<div class="dash-sidebar-head"><i class="fa-solid fa-layer-group"></i><span>Categories</span></div>' +
                    '<div class="dash-cat-search"><i class="fa-solid fa-magnifying-glass"></i><input type="search" placeholder="Filter categories&hellip;" aria-label="Filter categories"></div>' +
                    '<ul class="dash-cat-nav"></ul>' +
                    '<div class="dash-sidebar-foot"><i class="fa-solid fa-shield-halved"></i>100% client-side &middot; private</div>';
                mainEl.insertBefore(leftAside, dashMain);

                // --- Right sidebar: auto-generated content ----------------------
                var rightAside = document.createElement("aside");
                rightAside.className = "dash-right";
                rightAside.setAttribute("aria-label", "Sidebar");
                mainEl.appendChild(rightAside);
                buildRightSidebar(rightAside, rootPrefix());

                // --- Mobile toggle + overlay -------------------------------------
                var toggle = document.createElement("button");
                toggle.type = "button";
                toggle.className = "dash-sidebar-toggle";
                toggle.setAttribute("aria-label", "Open categories");
                toggle.innerHTML = '<i class="fa-solid fa-bars-staggered"></i>';
                var overlay = document.createElement("div");
                overlay.className = "dash-sidebar-overlay";
                overlay.setAttribute("aria-hidden", "true");

                function closeSidebar() {
                    leftAside.classList.remove("open");
                    overlay.classList.remove("open");
                    overlay.setAttribute("aria-hidden", "true");
                    toggle.innerHTML = '<i class="fa-solid fa-bars-staggered"></i>';
                    document.body.style.overflow = "";
                }
                toggle.addEventListener("click", function () {
                    var open = leftAside.classList.toggle("open");
                    overlay.classList.toggle("open", open);
                    overlay.setAttribute("aria-hidden", String(!open));
                    toggle.innerHTML = open
                        ? '<i class="fa-solid fa-xmark"></i>'
                        : '<i class="fa-solid fa-bars-staggered"></i>';
                    document.body.style.overflow = open ? "hidden" : "";
                });
                overlay.addEventListener("click", closeSidebar);
                body.appendChild(toggle);
                body.appendChild(overlay);

                // Load the category nav builder (left sidebar).
                if (!window.dashboardNavLoaded) {
                    window.dashboardNavLoaded = true;
                    var dnav = document.createElement("script");
                    dnav.src = rootPrefix() + "assets/js/dashboard-nav.js";
                    dnav.defer = true;
                    document.body.appendChild(dnav);
                }
            })();
        }

        var dirs = window.location.pathname.split("/").filter(Boolean);
        var fileName = dirs[dirs.length - 1] || "";
        var pageDir = dirs.length > 1 ? dirs[dirs.length - 2] : "";
        var prefix = rootPrefix();

        // Absolute (from this page) links to the two key destinations.
        var homeHref = prefix + "index.html";
        var toolsHref = pageDir === "tools" ? "./index.html" : prefix + "tools/index.html";

        /* --------------------------------------------------------------------
           MAIN theme - dark navbar + mobile menu + footer (style.css)
           -------------------------------------------------------------------- */

        var headerMain =
            '<header class="navbar" id="navbar">' +
                '<div class="nav-container">' +
                    /* Left-side menu */
                    '<nav class="nav-links nav-links-left" aria-label="Primary">' +
                        '<a href="' + homeHref + '">Home</a>' +
                        '<a href="' + prefix + 'tools/index.html">Tools</a>' +
                        '<a href="' + homeHref + '#categories">Category</a>' +
                    '</nav>' +
                    /* Centered brand */
                    '<a href="' + homeHref + '" class="brand">' +
                        '<img src="' + prefix + 'assets/images/logo_nobg.webp" alt="F9XR Team" class="brand-logo-img">' +
                        '<span class="brand-text">Troolify<span class="brand-sub">by F9XR Team</span></span>' +
                    '</a>' +
                    /* Right-side menu + actions */
                    '<div class="nav-actions">' +
                        '<nav class="nav-links nav-links-right" aria-label="Secondary">' +
                            '<a href="' + prefix + 'pages/about.html">About</a>' +
                            '<a href="' + prefix + 'pages/contact.html">Support</a>' +
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
                '<a href="' + homeHref + '">Home</a>' +
                '<a href="' + prefix + 'tools/index.html">Tools</a>' +
                '<a href="' + homeHref + '#categories">Category</a>' +
                '<a href="' + prefix + 'pages/about.html">About</a>' +
                '<a href="' + prefix + 'pages/contact.html">Support</a>' +
                '<a href="' + toolsHref + '" class="btn btn-primary" style="margin-top: 1rem;">Explore Tools</a>' +
            '</div>';

        var footerMain =
            '<footer class="tx-footer">' +
                /* Full-width canvas - transparent bg so the footer merges with the page content bg */
                '<div class="relative px-6 py-8 sm:px-10 sm:py-9 lg:px-14">' +

                        /* Ambient brand glow - radial accent-blue blobs (DESIGN.md §5) */
                        '<div class="pointer-events-none absolute -top-40 left-1/2 h-80 w-[720px] -translate-x-1/2 rounded-full bg-[#3B82F6]/15 blur-[120px]" aria-hidden="true"></div>' +
                        '<div class="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-[#3B82F6]/10 blur-[100px]" aria-hidden="true"></div>' +

                        /* Subtle grid overlay on the dark canvas (DESIGN.md §5) */
                        '<div class="pointer-events-none absolute inset-0" style="background-image:linear-gradient(rgba(248,249,250,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(248,249,250,0.04) 1px,transparent 1px);background-size:48px 48px;-webkit-mask-image:radial-gradient(ellipse 90% 60% at 50% 0%,#000 30%,transparent 75%);mask-image:radial-gradient(ellipse 90% 60% at 50% 0%,#000 30%,transparent 75%)" aria-hidden="true"></div>' +

                        /* --- Top content grid --- */
                        '<div class="relative grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.4fr] lg:gap-10">' +

                            /* Left column - brand mission */
                            '<div>' +
                                '<a href="' + homeHref + '" class="inline-flex items-center gap-3">' +
                                    '<img src="' + prefix + 'assets/images/logo_nobg.webp" alt="Troolify" class="h-9 w-auto object-contain">' +
                                    '<span class="text-xl font-bold tracking-tight text-white">Troolify</span>' +
                                '</a>' +
                                '<p class="mt-4 max-w-md text-sm leading-[1.7] text-[#F8F9FA]/90 sm:text-[15px]">Troolify is a privacy-first workspace on the internet where your digital workflows run instantly, securely, and entirely inside your browser.</p>' +
                                '<div class="mt-5 flex flex-col gap-1.5 text-sm text-[#9CA3AF]">' +
                                    '<span>Made by <a href="https://f9xr.github.io" target="_blank" rel="noopener noreferrer" class="font-medium text-white/80 transition hover:text-[#3B82F6]">F9XR Team</a></span>' +
                                    '<a href="https://github.com/f9xr/troolify" target="_blank" rel="noopener noreferrer" class="font-medium text-white/80 transition hover:text-[#3B82F6]">This website is Open Source</a>' +
                                '</div>' +
                            '</div>' +

                            /* Middle column 1 - Company links */
                            '<nav aria-label="Company">' +
                                '<h4 class="text-xs font-semibold uppercase tracking-[0.22em] text-[#E9ECEF]">Company</h4>' +
                                '<ul class="mt-3.5 space-y-2">' +
                                    '<li><a href="' + prefix + 'pages/about.html" class="text-white/80 transition hover:text-[#3B82F6]">About</a></li>' +
                                    '<li><a href="' + prefix + 'pages/contact.html" class="text-white/80 transition hover:text-[#3B82F6]">Contact</a></li>' +
                                    '<li><a href="' + prefix + 'pages/feedback.html" class="text-white/80 transition hover:text-[#3B82F6]">Feedback</a></li>' +
                                    '<li><a href="' + prefix + 'tools/index.html" class="text-white/80 transition hover:text-[#3B82F6]">Utilities</a></li>' +
                                    '<li><a href="' + prefix + 'pages/sitemap.html" class="text-white/80 transition hover:text-[#3B82F6]">Sitemap</a></li>' +
                                    '<li><a href="' + prefix + 'pages/accessibility-statement.html" class="text-white/80 transition hover:text-[#3B82F6]">Accessibility</a></li>' +
                                    '<li><a href="' + prefix + 'press/editorial-policies.html" class="text-white/80 transition hover:text-[#3B82F6]">Editorial Policies</a></li>' +
'                                    <li><a href="' + prefix + 'pages/privacy-policy.html" class="text-white/80 transition hover:text-[#3B82F6]">Privacy Policy</a></li>' +
'                                    <li><a href="' + prefix + 'pages/terms.html" class="text-white/80 transition hover:text-[#3B82F6]">Terms of Service</a></li>' +
                                '</ul>' +
                            '</nav>' +

                            /* Middle column 2 - F9XR network links */
                            '<nav aria-label="F9XR Network">' +
                                '<h4 class="text-xs font-semibold uppercase tracking-[0.22em] text-[#E9ECEF]">F9XR Network</h4>' +
                                '<ul class="mt-3.5 space-y-2">' +
                                    '<li><a href="https://f9xr.github.io/" target="_blank" rel="noopener noreferrer" class="text-white/80 transition hover:text-[#3B82F6]">F9XR Team</a></li>' +
                                    '<li><a href="https://f9xr.github.io/services/index.html" target="_blank" rel="noopener noreferrer" class="text-white/80 transition hover:text-[#3B82F6]">Services</a></li>' +
                                    '<li><a href="https://f9xr.github.io/case-studies/index.html" target="_blank" rel="noopener noreferrer" class="text-white/80 transition hover:text-[#3B82F6]">Case Studies</a></li>' +
                                    '<li><a href="https://f9xr.github.io/announcements/index.html" target="_blank" rel="noopener noreferrer" class="text-white/80 transition hover:text-[#3B82F6]">Announcements</a></li>' +
                                    '<li><a href="https://f9xr.github.io/directories/index.html" target="_blank" rel="noopener noreferrer" class="text-white/80 transition hover:text-[#3B82F6]">Directories</a></li>' +
                                    '<li><a href="https://f9xr.github.io/BharatByDay/" target="_blank" rel="noopener noreferrer" class="text-white/80 transition hover:text-[#3B82F6]">भारतByDay</a></li>' +
                                    '<li><a href="https://f9xr.github.io/articles/" target="_blank" rel="noopener noreferrer" class="text-white/80 transition hover:text-[#3B82F6]">Articles</a></li>' +
                                '</ul>' +
                            '</nav>' +

                            /* Middle column 3 - Follow us social icons */
                            '<nav aria-label="Follow us">' +
                                '<h4 class="text-xs font-semibold uppercase tracking-[0.22em] text-[#E9ECEF]">Follow us</h4>' +
                                '<div class="mt-4 flex flex-wrap gap-2.5">' +
                                    '<a href="https://github.com/f9xr" target="_blank" rel="noopener noreferrer" aria-label="GitHub" class="grid h-10 w-10 place-items-center rounded-xl border border-[#343A40] bg-[#212529] text-[#9CA3AF] transition hover:border-[#3B82F6] hover:text-[#3B82F6]"><i class="fa-brands fa-github"></i></a>' +
                                    '<a href="https://linkedin.com/company/f9xrteam" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="grid h-10 w-10 place-items-center rounded-xl border border-[#343A40] bg-[#212529] text-[#9CA3AF] transition hover:border-[#3B82F6] hover:text-[#3B82F6]"><i class="fa-brands fa-linkedin"></i></a>' +
                                    '<a href="https://instagram.com/f9xrteam" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="grid h-10 w-10 place-items-center rounded-xl border border-[#343A40] bg-[#212529] text-[#9CA3AF] transition hover:border-[#3B82F6] hover:text-[#3B82F6]"><i class="fa-brands fa-instagram"></i></a>' +
                                    '<a href="https://youtube.com/@QuarterlyLIV" target="_blank" rel="noopener noreferrer" aria-label="YouTube" class="grid h-10 w-10 place-items-center rounded-xl border border-[#343A40] bg-[#212529] text-[#9CA3AF] transition hover:border-[#3B82F6] hover:text-[#3B82F6]"><i class="fa-brands fa-youtube"></i></a>' +
                                    '<a href="https://www.threads.com/@f9xrteam" target="_blank" rel="noopener noreferrer" aria-label="Threads" class="grid h-10 w-10 place-items-center rounded-xl border border-[#343A40] bg-[#212529] text-[#9CA3AF] transition hover:border-[#3B82F6] hover:text-[#3B82F6]"><i class="fa-brands fa-threads"></i></a>' +
                                '</div>' +
                            '</nav>' +

                            /* Right column - contact + newsletter capture */
                            '<div>' +
                                '<h4 class="text-xs font-semibold uppercase tracking-[0.22em] text-[#E9ECEF]">Stay up to date</h4>' +
                                '<form class="mt-4 flex flex-col gap-3 sm:flex-row" action="mailto:tontufytservices@gmail.com" method="post" enctype="text/plain">' +
                                    '<input type="email" name="email" placeholder="Enter your email" aria-label="Enter your email" class="w-full flex-1 rounded-xl border border-[#343A40] bg-[#212529] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]">' +
                                    '<button type="submit" class="rounded-xl bg-[#3B82F6] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(59,130,246,0.35)] transition hover:bg-[#2563EB]">Sign Up</button>' +
                                '</form>' +
                                '<p class="mt-4 max-w-xs text-xs leading-relaxed text-[#9CA3AF]">Get product updates in your inbox. Questions? <a href="mailto:tontufytservices@gmail.com" class="font-medium text-white/80 transition hover:text-[#3B82F6]">tontufytservices@gmail.com</a></p>' +
                            '</div>' +
                        '</div>' +

                        /* --- Compact brand wordmark --- */
                        '<div class="relative mt-6 select-none lg:mt-8">' +
                            '<div class="text-center text-3xl font-black tracking-tight text-[#3B82F6] sm:text-4xl">troolify</div>' +
                        '</div>' +

                        /* --- Bottom baseline metadata --- */
                        '<div class="relative mt-6 flex flex-col items-center justify-between gap-3 border-t border-[#343A40] pt-4 text-xs text-[#9CA3AF] md:flex-row">' +
                            '<p>&copy; 2026 Troolify. All rights reserved.</p>' +
                            '<div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">' +
                                '<a href="' + prefix + 'pages/terms.html" class="transition hover:text-[#3B82F6]">Terms</a>' +
                                '<a href="' + prefix + 'pages/privacy-policy.html" class="transition hover:text-[#3B82F6]">Privacy Policy</a>' +
                                '<a href="' + prefix + 'pages/contact.html" class="transition hover:text-[#3B82F6]">Contact</a>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
            '</footer>';

        /* --------------------------------------------------------------------
           CTA band - conversion section injected just above the footer
           (skipped on pages that already ship a static CTA, e.g. index.html)
           -------------------------------------------------------------------- */

        var ctaMain =
            '<section class="tx-cta" aria-label="Call to action">' +
                '<div class="cta-3d">' +
                    '<div class="cta-panel">' +

                        /* Glassmorphism shapes - frosted cyan/white blobs behind the copy */
                        '<div class="cta-blob cta-blob-1" aria-hidden="true"></div>' +
                        '<div class="cta-blob cta-blob-2" aria-hidden="true"></div>' +
                        '<div class="cta-blob cta-blob-3" aria-hidden="true"></div>' +
                        '<div class="cta-blob cta-blob-4" aria-hidden="true"></div>' +

                        '<div class="cta-inner">' +
                            '<h2 class="cta-h2">Simplify Tech Deployments, Optimize <i class="fa-solid fa-circle-nodes" aria-hidden="true"></i> Systems.</h2>' +
                            '<p class="cta-sub">No tech bloat, no manual bottlenecks, just a better way to scale your digital infrastructure.</p>' +
                            '<a href="' + prefix + 'pages/contact.html" class="cta-pill">GET A FREE TECH AUDIT</a>' +
                            '<p class="cta-foot"><i class="fa-solid fa-check" aria-hidden="true"></i>Zero commitment required.</p>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</section>';

        /* --------------------------------------------------------------------
           "Featured On" band - scrolling directory badges injected just above
           the CTA on every page (replaces the old nav dropdown placement).
           -------------------------------------------------------------------- */

        var featuredSection =
            '<section class="tx-featured" aria-label="Featured On">' +
                '<div class="tx-featured-inner">' +
                    '<span class="tx-featured-label">Featured On</span>' +
                    '<div class="featured-marquee">' +
                        '<div class="featured-marquee-track">' + featuredBadges + featuredBadges + '</div>' +
                    '</div>' +
                '</div>' +
            '</section>';

        /* --------------------------------------------------------------------
           Back-to-top button - small floating control, injected on every page
           -------------------------------------------------------------------- */

        var backToTopMarkup =
            '<button type="button" id="backToTop" aria-label="Back to top" class="fixed bottom-5 right-5 z-[1500] hidden h-8 w-8 place-items-center rounded-full bg-[#3B82F6] text-white shadow-[0_3px_14px_rgba(59,130,246,0.35)] transition hover:bg-[#2563EB]">' +
                '<svg class="btt-ring" viewBox="0 0 44 44" aria-hidden="true">' +
                    '<circle class="btt-track" cx="22" cy="22" r="20"></circle>' +
                    '<circle class="btt-progress" cx="22" cy="22" r="20"></circle>' +
                '</svg>' +
                '<i class="fa-solid fa-arrow-up btt-icon" aria-hidden="true"></i>' +
            '</button>';

        /* --------------------------------------------------------------------
           Global search modal markup (DESIGN.md §9 Search Modal)
           -------------------------------------------------------------------- */

        var searchModalMarkup =
            '<div class="search-modal" id="searchModal" role="dialog" aria-modal="true" aria-label="Search the tool catalog" aria-hidden="true">' +
                '<div class="search-modal-backdrop"></div>' +
                '<div class="search-modal-panel">' +
                    '<div class="search-modal-input-wrap">' +
                        '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
                        '<input type="text" class="search-modal-input" placeholder="Search the tool catalog\u2026" autocomplete="off" aria-label="Search tools">' +
                        '<button type="button" class="search-modal-close" aria-label="Close search"><i class="fa-solid fa-xmark"></i></button>' +
                    '</div>' +
                    '<div class="search-modal-results"></div>' +
                    '<div class="search-modal-hint">Press <kbd>Ctrl</kbd>+<kbd>K</kbd> to search \u00b7 <kbd>Enter</kbd> to open tool \u00b7 <kbd>Esc</kbd> to close</div>' +
                '</div>' +
            '</div>';

        /* --------------------------------------------------------------------
           Custom styles for the injected CTA + footer wordmark.
           Tailwind utilities are pre-compiled (no build step in this repo), so
           anything new is shipped as plain CSS scoped under .cta-* / .footer-*.
           -------------------------------------------------------------------- */

        var shellStyles =
            '<style>' +
                '.skip-link{position:absolute;left:-9999px;top:0;z-index:9999;display:inline-block;padding:.85rem 1.4rem;background:#3B82F6;color:#fff;font-size:.9rem;font-weight:700;border-radius:0 0 10px 0;text-decoration:none}' +
                '.skip-link:focus{left:0;outline:3px solid #BFDBFE;outline-offset:-3px}' +
                '.cta-panel{position:relative;overflow:hidden;border-radius:30px;padding:clamp(2.25rem,5vw,3.75rem) clamp(1.5rem,4.5vw,3.5rem);background:linear-gradient(140deg,#38BDF8 0%,#2563EB 42%,#1D4ED8 72%,#172554 100%);text-align:center}' +
                '.cta-blob{position:absolute;border-radius:50%;pointer-events:none}' +
                '.cta-blob-1{width:clamp(200px,30vw,340px);height:clamp(200px,30vw,340px);top:-30%;left:-12%;background:linear-gradient(135deg,rgba(224,242,254,.85),rgba(125,211,252,.2));backdrop-filter:blur(8px);filter:blur(2px)}' +
                '.cta-blob-2{width:clamp(220px,32vw,380px);height:clamp(220px,32vw,380px);bottom:-35%;right:-14%;background:radial-gradient(circle at 35% 35%,rgba(255,255,255,.75),rgba(147,197,253,.12));backdrop-filter:blur(10px);filter:blur(3px)}' +
                '.cta-blob-3{width:clamp(120px,18vw,200px);height:clamp(120px,18vw,200px);top:12%;right:10%;background:rgba(165,243,252,.5);backdrop-filter:blur(12px)}' +
                '.cta-blob-4{width:clamp(100px,14vw,160px);height:clamp(100px,14vw,160px);bottom:8%;left:10%;background:rgba(255,255,255,.28);backdrop-filter:blur(14px)}' +
                '.cta-inner{position:relative;z-index:2;margin:0 auto;max-width:840px;display:flex;flex-direction:column;align-items:center}' +
                '.cta-h2{margin:0;font-size:clamp(1.6rem,4vw,3.1rem);line-height:1.14;font-weight:800;letter-spacing:-.02em;color:#fff;text-wrap:balance}' +
                '.cta-h2 .fa-circle-nodes{display:inline-block;margin:0 .12em;font-size:1.06em;color:#fff;vertical-align:-.06em;text-shadow:0 0 26px rgba(255,255,255,.65)}' +
                '.cta-sub{margin:.95rem auto 0;max-width:560px;font-size:clamp(.95rem,1.9vw,1.12rem);line-height:1.7;color:#BFDBFE}' +
                '.cta-pill{margin-top:1.6rem;display:inline-flex;align-items:center;justify-content:center;padding:.95rem 2.3rem;border-radius:999px;background:rgba(15,23,42,.55);border:1px solid rgba(255,255,255,.85);backdrop-filter:blur(8px);color:#fff;font-size:.78rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;box-shadow:0 18px 40px -16px rgba(2,6,23,.55);transition:transform .25s ease,background .25s ease,box-shadow .25s ease}' +
                '.cta-pill:hover{background:rgba(15,23,42,.78);transform:scale(1.045);box-shadow:0 24px 55px -16px rgba(2,6,23,.65)}' +
                '.cta-pill:focus-visible{outline:2px solid #fff;outline-offset:3px}' +
                '.cta-foot{margin:1.2rem 0 0;display:inline-flex;align-items:center;gap:.5rem;font-size:.8rem;color:#BAE6FD}' +
                '.cta-foot i{width:16px;height:16px;flex-shrink:0;display:inline-grid;place-items:center;border:1px solid rgba(255,255,255,.65);border-radius:999px;font-size:8px;color:#fff}' +

                '.tx-cta{perspective:1400px}' +
                '.cta-3d{position:relative;z-index:0;max-width:1280px;width:calc(100% - 2rem);margin:2.5rem auto 0;border-radius:30px;transition:transform .45s cubic-bezier(.16,1,.3,1),box-shadow .45s ease;box-shadow:0 26px 55px -10px rgba(0,0,0,.6),0 14px 28px -12px rgba(0,0,0,.55)}' +
                '.tx-cta:hover .cta-3d{transform:rotateX(3deg) translateY(-5px) scale(1.005);box-shadow:0 40px 80px -16px rgba(0,0,0,.65),0 20px 40px -16px rgba(0,0,0,.6)}' +

                '.tx-footer{position:fixed;bottom:0;left:0;right:0;z-index:0;background:var(--bg-dark,#0A0A0A);padding:0;border-top:1px solid rgba(255,255,255,.06);max-height:100dvh;overflow-y:auto;-webkit-overflow-scrolling:touch}' +
                /* Footer-reveal shell: the outer .page-reveal layer carries NO background so its bottom
                   padding strip stays transparent, letting the pinned footer show through when the user
                   scrolls to the bottom. The opaque page background lives on the inner .reveal-inner so
                   it starts above the footer and slides up to uncover it. (Its color is applied inline
                   from the page body so it matches the page theme.) */
                '.page-reveal{position:relative;z-index:1;min-height:100vh}' +
                '.reveal-inner{min-height:inherit}' +
                '.tx-footer a{text-decoration:none}' +
                '.tx-footer a:not(.grid){position:relative}' +
                '.tx-footer a:not(.grid)::after{content:"";position:absolute;left:0;right:0;bottom:-3px;height:1px;background:linear-gradient(90deg,#60A5FA,#3B82F6);transform:scaleX(0);transform-origin:left;transition:transform .28s cubic-bezier(.16,1,.3,1)}' +
                '.tx-footer a:not(.grid):hover::after,.tx-footer a:not(.grid):focus-visible::after{transform:scaleX(1)}' +

                '.btt-ring{position:absolute;inset:0;width:100%;height:100%}' +
                '.btt-ring .btt-track,.btt-ring .btt-progress{fill:none;stroke-width:3}' +
                '.btt-ring .btt-track{stroke:rgba(255,255,255,.18)}' +
                '.btt-ring .btt-progress{stroke:#BFDBFE;stroke-linecap:round;transform:rotate(-90deg);transform-origin:center;transition:stroke-dashoffset .15s linear}' +
                '.btt-icon{position:relative;z-index:1;font-size:.72rem}' +
                '#backToTop{position:fixed;bottom:1.25rem;right:1.25rem;z-index:1500;width:2rem;height:2rem;display:grid;place-items:center;border-radius:9999px;background:#3B82F6;color:#fff;box-shadow:0 3px 14px rgba(59,130,246,.35);cursor:pointer;border:none;padding:0;transition:background .18s ease,transform .18s ease,box-shadow .18s ease}' +
                '#backToTop:hover{background:#2563EB;transform:translateY(-1px);box-shadow:0 6px 20px rgba(59,130,246,.45)}' +
                '#backToTop:focus-visible{outline:2px solid #60A5FA;outline-offset:2px}' +
                '#backToTop.hidden,body #backToTop.hidden{display:none}' +

                '@media(max-width:640px){.cta-panel{padding:clamp(2rem,12vw,3rem) 1.25rem}.cta-blob-1{left:-35%;top:-18%}.cta-blob-2{right:-35%;bottom:-25%}.cta-h2{font-size:clamp(1.5rem,7vw,2.1rem)}}' +

                '.tx-featured{max-width:1280px;width:calc(100% - 2rem);margin:3rem auto 0;padding:1.5rem 2rem 1.65rem;border:1px solid rgba(255,255,255,.07);border-radius:22px;background:linear-gradient(180deg,rgba(52,58,64,.28),rgba(33,37,41,.12));backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}' +
                '.tx-featured-inner{display:flex;flex-direction:column;align-items:center;gap:1.1rem}' +
                '.tx-featured-label{font-size:.68rem;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:#6C757D}' +
                '.featured-marquee{overflow:hidden;white-space:nowrap;width:100%}' +
                '.featured-marquee:hover .featured-marquee-track,.featured-marquee:focus-within .featured-marquee-track{animation-play-state:paused}' +
                '.featured-marquee-track{display:inline-flex;align-items:center;width:max-content;animation:featured-scroll 32s linear infinite;will-change:transform}' +
                '.featured-marquee-track .badge-link{display:inline-flex;align-items:center;flex-shrink:0;padding-right:2.25rem;line-height:0}' +
                '.featured-marquee-track .badge-link img{display:block;max-height:44px;width:auto;height:auto;object-fit:contain;filter:grayscale(20%) brightness(.98);opacity:.92;transition:opacity .2s ease,filter .2s ease}' +
                '.featured-marquee-track .badge-link:hover img{opacity:1;filter:grayscale(0) brightness(1.05)}' +
                '.featured-marquee-track .badge-link:focus-visible{outline:2px solid #3B82F6;outline-offset:3px;border-radius:6px}' +
                '@keyframes featured-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}' +
                '@media(max-width:640px){.tx-featured{margin-top:2rem;padding:1.25rem 1rem 1.4rem}.featured-marquee-track .badge-link{padding-right:1.5rem}}' +
                '@media(prefers-reduced-motion:reduce){.featured-marquee-track{animation:none}}' +

                /* CSS View Transitions API - smooth cross-document page transitions.
                   Enabled only when the browser supports it and the user has not opted
                   out of reduced motion. Named pseudos allow a subtle rise/fade on the
                   new page and keep the footer pinned during the swap. */
                '@supports (view-transition-name: root){' +
                    '@view-transition{ navigation:auto }' +
                    '::view-transition-old(root){animation:opencode-vt-fade .28s ease both}' +
                    '::view-transition-new(root){animation:opencode-vt-rise .45s cubic-bezier(.16,1,.3,1) both}' +
                    '@keyframes opencode-vt-fade{to{opacity:0}}' +
                    '@keyframes opencode-vt-rise{from{opacity:0;transform:translateY(16px)}}' +
                    '@media(prefers-reduced-motion:reduce){::view-transition-old(root),::view-transition-new(root){animation-duration:.01ms}}' +
                '}' +
            '</style>';

        /* --------------------------------------------------------------------
           Inject into the page
           -------------------------------------------------------------------- */

        var skipLink = '<a class="skip-link" href="#main">Skip to main content</a>';
        body.insertAdjacentHTML("afterbegin", skipLink + headerMain);

        // "Featured On" band is always placed directly above the CTA:
        // - pages with their own static CTA (index.html) -> insert before it
        // - every other page                        -> insert before the injected CTA
        if (document.querySelector(".final-cta, .tx-cta")) {
            document.querySelector(".final-cta, .tx-cta").insertAdjacentHTML("beforebegin", featuredSection);
        } else {
            body.insertAdjacentHTML("beforeend", featuredSection);
            body.insertAdjacentHTML("beforeend", ctaMain);
        }
        body.insertAdjacentHTML("beforeend", shellStyles);
        body.insertAdjacentHTML("beforeend", footerMain);
        body.insertAdjacentHTML("beforeend", searchModalMarkup);
        body.insertAdjacentHTML("beforeend", backToTopMarkup);

        /* --------------------------------------------------------------------
           Footer-reveal shell
           Wrap all page content in a .page-reveal layer that sits on top of the
           pinned .tx-footer. The outer layer carries no background, so its bottom
           padding strip stays transparent and the fixed footer shows through it
           when the user reaches the bottom of the page. The opaque page background
           lives on the inner .reveal-inner, which slides up to uncover the footer.
           -------------------------------------------------------------------- */

        var revealWrap = document.createElement("div");
        revealWrap.className = "page-reveal";
        var revealInner = document.createElement("div");
        revealInner.className = "reveal-inner";
        revealWrap.appendChild(revealInner);
        var afterWrap = document.createDocumentFragment();
        var txFooter = null;
        var keepAtBodyLevel = function (el) {
            var id = el.id;
            var cls = typeof el.className === "string" ? el.className : "";
            return el.tagName === "STYLE" || el.tagName === "SCRIPT" || el.tagName === "NOSCRIPT" ||
                   cls.indexOf("tx-footer") !== -1 || id === "searchModal" || id === "backToTop";
        };
        Array.prototype.slice.call(body.children).forEach(function (el) {
            if (keepAtBodyLevel(el)) {
                if (typeof el.className === "string" && el.className.indexOf("tx-footer") !== -1) txFooter = el;
                afterWrap.appendChild(el);
            } else {
                revealInner.appendChild(el);
            }
        });
        body.innerHTML = "";
        body.appendChild(revealWrap);
        body.appendChild(afterWrap);

        if (txFooter) {
            var syncFooterSpace = function () {
                /* Match the opaque content layer to the page background so it hides the
                   pinned footer until the user scrolls to the very bottom. */
                var bodyBg = window.getComputedStyle(body).backgroundColor;
                revealInner.style.backgroundColor = bodyBg && bodyBg !== "rgba(0, 0, 0, 0)"
                    ? bodyBg
                    : "var(--bg-dark,#0A0A0A)";
                var fh = txFooter.offsetHeight || 0;
                revealWrap.style.paddingBottom = fh + "px";
            };
            syncFooterSpace();
            window.addEventListener("resize", syncFooterSpace, { passive: true });
        }

        /* --------------------------------------------------------------------
           Entity schema - inject an Organization JSON-LD block on any page that
           ships no structured data yet (About, Feedback, Sitemap, Press, etc.).
           Pages with their own JSON-LD (home, tools, contact) are left untouched.
           -------------------------------------------------------------------- */

        if (document.head && !document.head.querySelector('script[type="application/ld+json"]')) {
            var orgScript = document.createElement("script");
            orgScript.type = "application/ld+json";
            orgScript.text = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Troolify",
                "url": "https://f9xr.github.io/troolify/index.html",
                "logo": "https://f9xr.github.io/troolify/assets/images/logo_nobg.webp",
                "email": "tontufytservices@gmail.com",
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer support",
                    "email": "tontufytservices@gmail.com",
                    "availableLanguage": "English"
                },
                "sameAs": [
                    "https://github.com/f9xr",
                    "https://linkedin.com/company/f9xrteam",
                    "https://instagram.com/f9xrteam",
                    "https://youtube.com/@QuarterlyLIV",
                    "https://www.threads.com/@f9xrteam"
                ]
            });
            document.head.appendChild(orgScript);
        }

        /* --------------------------------------------------------------------
           Header behaviour - scroll effect, mobile menu, active link
           -------------------------------------------------------------------- */

        var header = document.querySelector(".navbar, .site-header");

        /* Back-to-top button with circular scroll-progress ring */
        var backToTop = document.getElementById("backToTop");
        var backToTopRing = backToTop ? backToTop.querySelector(".btt-progress") : null;
        var backToTopRadius = backToTopRing ? backToTopRing.r.baseVal.value : 20;
        var backToTopCirc = 2 * Math.PI * backToTopRadius;
        if (backToTopRing) backToTopRing.style.strokeDasharray = String(backToTopCirc);

        /* Single rAF-batched scroll frame: reads first, then writes (no layout thrash) */
        var scrollScheduled = false;
        function onScrollFrame() {
            scrollScheduled = false;
            var y = window.scrollY;
            if (header) header.classList.toggle("scrolled", y > 8);
            if (backToTop) {
                var max = document.documentElement.scrollHeight - window.innerHeight;
                var p = max > 0 ? Math.min(1, y / max) : 0;
                if (backToTopRing) backToTopRing.style.strokeDashoffset = String(backToTopCirc * (1 - p));
                backToTop.classList.toggle("hidden", y < 400);
            }
        }
        function scheduleScroll() {
            if (!scrollScheduled) {
                scrollScheduled = true;
                requestAnimationFrame(onScrollFrame);
            }
        }
        onScrollFrame();
        window.addEventListener("scroll", scheduleScroll, { passive: true });
        window.addEventListener("resize", scheduleScroll, { passive: true });
        if (backToTop) {
            backToTop.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

        var menuBtn = document.querySelector(".mobile-menu-btn");
        var mobileMenu = document.querySelector(".mobile-menu");
        var isMenuOpen = false;
        if (mobileMenu) mobileMenu.style.visibility = "hidden";

        function toggleMenu(force) {
            isMenuOpen = typeof force === "boolean" ? force : !isMenuOpen;
            if (mobileMenu) {
                mobileMenu.classList.toggle("open", isMenuOpen);
                mobileMenu.style.visibility = isMenuOpen ? "visible" : "hidden";
                mobileMenu.setAttribute("aria-hidden", String(!isMenuOpen));
            }
            if (menuBtn) {
                menuBtn.innerHTML = isMenuOpen
                    ? '<i class="fa-solid fa-xmark"></i>'
                    : '<i class="fa-solid fa-bars"></i>';
                menuBtn.setAttribute("aria-expanded", String(isMenuOpen));
            }
            document.body.style.overflow = isMenuOpen ? "hidden" : "";
            if (isMenuOpen) {
                var firstLink = mobileMenu ? mobileMenu.querySelector("a") : null;
                if (firstLink) setTimeout(function () { firstLink.focus(); }, 30);
            } else if (menuBtn && menuBtn.focus) {
                menuBtn.focus();
            }
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
                if (link.getAttribute("href") === homeHref) {
                    link.classList.add("active");
                }
            });
        }

        /* --------------------------------------------------------------------
           Global live search - navbar modal + inline search bars
           -------------------------------------------------------------------- */

        var modal = document.getElementById("searchModal");
        var modalInput = modal ? modal.querySelector(".search-modal-input") : null;
        var modalResults = modal ? modal.querySelector(".search-modal-results") : null;
        var modalOpen = false;
        var searchTrigger = null;

        function modalFocusables() {
            if (!modal) return [];
            var nodes = modal.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            return Array.prototype.filter.call(nodes, function (el) {
                return el.offsetParent !== null && !el.disabled;
            });
        }

        function openSearchModal(trigger) {
            if (!modal) return;
            if (isMenuOpen) toggleMenu(false);
            searchTrigger = trigger && trigger.focus ? trigger : document.activeElement;
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
            document.body.style.overflow = isMenuOpen ? "hidden" : "";
            if (modalInput) modalInput.value = "";
            if (modalResults) modalResults.innerHTML = "";
            if (searchTrigger && searchTrigger.focus) {
                searchTrigger.focus();
                searchTrigger = null;
            }
        }

        function loadToolsData(cb) {
            if (window.TOOLS) {
                if (cb) cb();
                return;
            }
            /* Shared pending list (also used by tool-page.js) prevents
               duplicate <script> injections when several consumers ask for
               the catalog while it is still loading. */
            if (window.__TOOLS_PENDING) {
                if (cb) window.__TOOLS_PENDING.push(cb);
                return;
            }
            window.__TOOLS_PENDING = [cb];
            var s = document.createElement("script");
            s.src = prefix + "assets/js/tools-data.js";
            s.onload = s.onerror = function () {
                var list = window.__TOOLS_PENDING || [];
                window.__TOOLS_PENDING = null;
                list.forEach(function (fn) { if (fn) fn(); });
            };
            document.head.appendChild(s);
        }

        function searchResults(query) {
            var tools = window.TOOLS || [];
            var q = query.trim().toLowerCase();
            if (!q) return [];
            var out = [];
            tools.forEach(function (t) {
                var name = (t.name || "").toLowerCase();
                var body = ((t.desc || "") + " " + (t.tag || "") + " " + (t.category || "")).toLowerCase();
                var kws = (t.keywords || []).map(function (k) { return k.toLowerCase(); });
                var kwJoined = kws.join(" ");
                if (name.indexOf(q) === -1 && body.indexOf(q) === -1 && kwJoined.indexOf(q) === -1) return;
                var score = 0;
                var kwMatch = "";
                if (name === q) score += 200;
                else if (name.indexOf(q) === 0) score += 120;
                else if (name.indexOf(q) !== -1) score += 60;
                if ((t.tag || "").toLowerCase() === q) score += 50;
                if (body.indexOf(q) !== -1) score += 15;
                kws.forEach(function (k) {
                    if (k === q) { score += 30; kwMatch = kwMatch || k; }
                    else if (k.indexOf(q) !== -1) { score += 10; kwMatch = kwMatch || k; }
                });
                if (kwMatch) kwMatch = (t.keywords || [])[kws.indexOf(kwMatch)];
                out.push({ tool: t, score: score, kwMatch: kwMatch });
            });
            out.sort(function (a, b) { return b.score - a.score; });
            return out.slice(0, 8);
        }

        function resultHref(href) {
            return href && href.indexOf("tools/") === 0 ? prefix + href : href;
        }

        function buildResultItem(r) {
            var t = r.tool;
            var a = document.createElement("a");
            a.className = "search-dropdown-item";
            a.href = resultHref(t.href) || "#";
            a.innerHTML =
                '<span class="sd-icon"><i class="' + (t.icon || "fa-solid fa-wrench") + '"></i></span>' +
                '<span class="sd-meta"><span class="sd-name">' + t.name + '</span><br><span class="sd-cat">' + (t.category || "Tool") + '</span></span>' +
                (r.kwMatch
                    ? '<span class="sd-kw"><i class="fa-solid fa-bolt"></i>' + r.kwMatch + '</span>'
                    : '');
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
            list.forEach(function (r) { container.appendChild(buildResultItem(r)); });
        }

        function initLiveSearch(input, container, isModal) {
            input.addEventListener("input", function () {
                if (!isModal && !input.value.trim()) {
                    container.classList.remove("open");
                    return;
                }
                loadToolsData(function () {
                    renderResults(searchResults(input.value), container, input.value);
                    if (!isModal) container.classList.add("open");
                });
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
                        if (isModal) closeSearchModal();
                        window.location.href = first.getAttribute("href");
                    }
                }
            });
        }

        document.querySelectorAll(".nav-search-btn").forEach(function (btn) {
            btn.addEventListener("click", function () { openSearchModal(this); });
        });

        if (modal) {
            var modalCloseBtn = modal.querySelector(".search-modal-close");
            var modalBackdrop = modal.querySelector(".search-modal-backdrop");
            if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeSearchModal);
            if (modalBackdrop) modalBackdrop.addEventListener("click", closeSearchModal);
        }

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && modalOpen) { closeSearchModal(); return; }
            if (e.key === "Tab" && modalOpen) {
                var f = modalFocusables();
                if (!f.length) { e.preventDefault(); return; }
                var first = f[0];
                var last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                if (modalOpen) { if (modalInput) modalInput.focus(); return; }
                openSearchModal();
                return;
            }
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
})();
