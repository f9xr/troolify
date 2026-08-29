/* Homepage catalog - renders the category grid, the featured tools grid with
   functional filters, and the live stats from the shared TOOLS / CATEGORIES
   data in tools-data.js. Runs deferred after tools-data.js and replaces the
   in-page skeleton placeholders. */
(function () {
    "use strict";

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    var tools = window.TOOLS || [];
    var cats = window.CATEGORIES || [];

    /* ---------------------- Shared tool card markup ---------------------- */

    function buildToolCard(t) {
        return '<a class="tool-card tool-card-link" href="' + escapeHtml(t.href) + '" aria-label="Open ' + escapeHtml(t.name) + '">' +
            '<div class="tool-header">' +
                '<div class="tool-icon"><i class="' + escapeHtml(t.icon) + '"></i></div>' +
                '<span class="badge">' + escapeHtml(t.category) + '</span>' +
            '</div>' +
            '<h3 class="tool-title">' + escapeHtml(t.name) + '</h3>' +
            '<p class="tool-desc">' + escapeHtml(t.desc) + '</p>' +
            '<span class="tool-link">Open Tool <i class="fa-solid fa-arrow-right"></i></span>' +
        '</a>';
    }

    /* ---------------------- Category grid ---------------------- */

    var grid = document.getElementById("categoryGrid");
    if (grid) {
        var count = function (folder) {
            var n = 0;
            tools.forEach(function (t) { if (t.category === folder) n++; });
            return n;
        };
        var html = "";
        cats.forEach(function (c) {
            var n = count(c.folder);
            html += '<a href="tools/' + escapeHtml(c.folder.toLowerCase()) + '/index.html" class="category-card">' +
                '<div class="category-icon"><i class="' + escapeHtml(c.icon) + '"></i></div>' +
                '<h3 class="category-title">' + escapeHtml(c.name) + '</h3>' +
                '<p class="category-desc">' + escapeHtml(c.desc) + '</p>' +
                '<div class="category-footer">' +
                    '<span class="tool-count">' + n + (n === 1 ? ' Tool' : ' Tools') + '</span>' +
                    '<i class="fa-solid fa-arrow-right category-arrow"></i>' +
                '</div>' +
            '</a>';
        });
        grid.innerHTML = html;
        grid.setAttribute("aria-busy", "false");
    }

    /* ---------------------- Live stats (auto-counted) ---------------------- */

    var statTools = document.getElementById("statLiveTools");
    if (statTools) statTools.textContent = String(tools.length);
    var statCats = document.getElementById("statCategories");
    if (statCats) statCats.textContent = String(cats.length);

    /* ---------------------- Featured tools grid + filters ---------------------- */

    var featuredGrid = document.getElementById("featuredGrid");
    if (featuredGrid) {
        var currentFilter = "all";

        function renderFeatured() {
            var list = tools.filter(function (t) {
                return currentFilter === "all" ? true : !!t[currentFilter];
            });
            var html = "";
            list.forEach(function (t) {
                html += buildToolCard(t);
            });
            if (!html) {
                html = '<div class="featured-empty">No tools in this group yet. Try another filter.</div>';
            }
            featuredGrid.innerHTML = html;
            featuredGrid.setAttribute("aria-busy", "false");
        }

        document.querySelectorAll(".filter-btn[data-filter]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".filter-btn[data-filter]").forEach(function (b) {
                    b.classList.remove("active");
                });
                btn.classList.add("active");
                currentFilter = btn.getAttribute("data-filter") || "all";
                renderFeatured();
            });
        });

        renderFeatured();
    }

    /* ---------------------- Random Tool For You ---------------------- */

    var randomCard = document.getElementById("randomToolCard");
    var randomBtn = document.getElementById("randomToolBtn");
    if (randomCard && tools.length) {
        var randomIndex = -1;

        function renderRandom() {
            if (tools.length === 1) {
                randomIndex = 0;
            } else {
                var next;
                do {
                    next = Math.floor(Math.random() * tools.length);
                } while (next === randomIndex);
                randomIndex = next;
            }
            randomCard.innerHTML = buildToolCard(tools[randomIndex]);
            randomCard.setAttribute("aria-busy", "false");
        }

        if (randomBtn) {
            randomBtn.addEventListener("click", renderRandom);
        }
        renderRandom();
    }
})();