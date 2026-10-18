document.addEventListener('DOMContentLoaded', () => {
    // Note: navbar scroll effect + mobile menu are handled by assets/js/layout.min.js.

    // 1. Scroll Reveal Animation using Intersection Observer
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 2. Subtle Parallax for Backgrounds
    const parallaxBgs = document.querySelectorAll('.hero-bg, .cinematic-bg, .final-cta-bg');
    
    // 1b. Lazy-load below-the-fold CSS background images so they are not fetched
    // on every page load. Sections carry data-bg="path"; swap them in just before
    // they enter the viewport. No-JS users get the images from a <noscript> style.
    const lazyBgs = document.querySelectorAll('[data-bg]');
    const applyBg = (el) => {
        const src = el.getAttribute('data-bg');
        if (src) {
            el.style.backgroundImage = `url('${src}')`;
            el.removeAttribute('data-bg');
        }
    };
    if ('IntersectionObserver' in window && lazyBgs.length) {
        const bgObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    applyBg(entry.target);
                    bgObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '600px 0px' });
        lazyBgs.forEach((el) => bgObserver.observe(el));
    } else if (lazyBgs.length) {
        lazyBgs.forEach(applyBg);
    }
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        let parallaxScheduled = false;
        window.addEventListener('scroll', () => {
            if (parallaxScheduled) return;
            parallaxScheduled = true;
            requestAnimationFrame(() => {
                parallaxScheduled = false;
                const scrollY = window.scrollY;

                parallaxBgs.forEach(bg => {
                    // Adjust this multiplier to change the intensity of the parallax
                    const speed = 0.3;
                    // Use translate3d for better performance (GPU acceleration)
                    bg.style.transform = `scale(1.05) translate3d(0, ${scrollY * speed}px, 0)`;
                });
            });
        }, { passive: true });
    }

    // 3. WebMCP - expose Troolify's key actions to in-browser AI agents.
    //    Feature-detect document.modelContext first, then navigator.modelContext.
    //    Registration is best-effort and must never break the page.
    (function registerWebMcpTools() {
        try {
            var modelContext = (document.modelContext || navigator.modelContext);
            if (!modelContext || typeof modelContext.registerTool !== "function") return;

            var BASE = "https://f9xr.org/troolify/";
            var tools = (window.TOOLS && window.TOOLS.length) ? window.TOOLS : (window.TOOLS_SLIM || []);
            var categories = window.CATEGORIES || [];

            function toUrl(href) {
                return BASE + String(href || "").replace(/^\/+/, "");
            }
            function lower(v) { return String(v == null ? "" : v).toLowerCase(); }

            function searchTools(query) {
                var q = lower(query).trim();
                if (!q) return { query: q, count: 0, results: [] };
                var terms = q.split(/\s+/).filter(Boolean);
                var scored = [];
                tools.forEach(function (t) {
                    var haystack = lower([t.name, t.category, t.desc, (t.keywords || []).join(" ")].join(" "));
                    var name = lower(t.name);
                    var score = 0;
                    terms.forEach(function (term) {
                        if (haystack.indexOf(term) !== -1) score += 1;
                        if (name.indexOf(term) !== -1) score += 2;
                    });
                    if (score > 0) scored.push({ tool: t, score: score });
                });
                scored.sort(function (a, b) { return b.score - a.score; });
                return {
                    query: q,
                    count: scored.length,
                    results: scored.slice(0, 10).map(function (entry) {
                        return {
                            name: entry.tool.name,
                            category: entry.tool.category,
                            description: entry.tool.desc,
                            url: toUrl(entry.tool.href)
                        };
                    })
                };
            }

            function listCategories() {
                return {
                    count: categories.length,
                    categories: categories.map(function (c) {
                        return {
                            name: c.name,
                            folder: c.folder,
                            description: c.desc,
                            url: BASE + "tools/" + lower(c.folder) + "/"
                        };
                    })
                };
            }

            function findTool(input) {
                var raw = input && input.tool;
                var needle = lower(raw).trim();
                if (!needle) return null;
                var exact = tools.filter(function (t) {
                    return lower(t.href) === needle || toUrl(t.href) === String(raw).trim() || lower(t.name) === needle;
                });
                if (exact.length) return exact[0];
                var partial = tools.filter(function (t) {
                    return lower(t.name).indexOf(needle) !== -1 || lower(t.href).indexOf(needle) !== -1;
                });
                return partial.length === 1 ? partial[0] : null;
            }

            var controller = (typeof AbortController !== "undefined") ? new AbortController() : null;
            var options = controller ? { signal: controller.signal } : undefined;
            var toolsToRegister = [
                {
                    name: "search_tools",
                    description: "Search Troolify's catalog of free browser-based tools by keyword. Returns matching tool names, categories, descriptions and URLs.",
                    inputSchema: {
                        type: "object",
                        properties: { query: { type: "string", description: "Keyword(s) describing the tool, e.g. 'json formatter' or 'compress image'." } },
                        required: ["query"],
                        additionalProperties: false
                    },
                    execute: function (input) { return searchTools(input && input.query); }
                },
                {
                    name: "list_categories",
                    description: "List every Troolify tool category with its description and a link to browse the tools in it.",
                    inputSchema: { type: "object", properties: {}, additionalProperties: false },
                    execute: function () { return listCategories(); }
                },
                {
                    name: "get_tool_url",
                    description: "Resolve a Troolify tool by name or page path and return its canonical URL on the site.",
                    inputSchema: {
                        type: "object",
                        properties: { tool: { type: "string", description: "Tool name (e.g. 'Word Counter') or page path (e.g. 'tools/text/word-counter.html')." } },
                        required: ["tool"],
                        additionalProperties: false
                    },
                    execute: function (input) {
                        var match = findTool(input);
                        if (!match) return { found: false, query: input && input.tool };
                        return { found: true, name: match.name, category: match.category, url: toUrl(match.href) };
                    }
                },
                {
                    name: "get_site_info",
                    description: "Return a summary of what Troolify is - a free, privacy-first, client-side tools hub by the F9XR Team - plus its key machine-readable resources.",
                    inputSchema: { type: "object", properties: {}, additionalProperties: false },
                    execute: function () {
                        return {
                            name: "Troolify",
                            url: BASE,
                            description: "Free, privacy-first online tools hub. Tools run 100% client-side in the browser - no sign-up, no uploads, no tracking.",
                            team: "F9XR Team",
                            contact: "hello@f9xr.org",
                            toolCount: tools.length,
                            resources: {
                                llmsTxt: BASE + "llms.txt",
                                aiTxt: BASE + "ai.txt",
                                apiCatalog: BASE + ".well-known/api-catalog",
                                sitemap: BASE + "sitemap.xml",
                                authMd: BASE + "auth.md"
                            }
                        };
                    }
                }
            ];

            var pending = toolsToRegister.map(function (tool) {
                try {
                    return modelContext.registerTool(tool, options);
                } catch (e) { return null; }
            });
            if (typeof Promise !== "undefined") {
                Promise.all(pending.filter(Boolean)).catch(function () {});
            }
            if (controller) {
                window.addEventListener("pagehide", function () {
                    try { controller.abort(); } catch (e) {}
                });
            }
        } catch (e) { /* WebMCP is optional */ }
    })();

    });
