/* ============================================================================
   Troolify — Dashboard Left Sidebar Nav
   ----------------------------------------------------------------------------
   Builds the category navigation list inside the dashboard left sidebar.
   Reads window.CATEGORIES and window.TOOLS from tools-data.js to render a
   searchable list of categories with tool counts.

   Include once on every page that uses the dashboard layout:
       <script src="assets/js/dashboard-nav.js" defer></script>
   ============================================================================ */

(function () {
    "use strict";

    function onReady(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function rootPrefix() {
        var path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
        if (path === "/troolify" || path.indexOf("/troolify/") === 0) return "/troolify/";
        var dirs = window.location.pathname.split("/").filter(Boolean);
        dirs.pop();
        return dirs.map(function () { return "../"; }).join("");
    }

    function loadToolsData(cb) {
        if (window.TOOLS && window.CATEGORIES) {
            if (cb) cb();
            return;
        }
        if (window.__DASH_TOOLS_PENDING) {
            if (cb) window.__DASH_TOOLS_PENDING.push(cb);
            return;
        }
        window.__DASH_TOOLS_PENDING = [cb];
        var prefix = rootPrefix();
        var s = document.createElement("script");
        s.src = prefix + "assets/js/tools-data.js";
        s.onload = s.onerror = function () {
            var list = window.__DASH_TOOLS_PENDING || [];
            window.__DASH_TOOLS_PENDING = null;
            list.forEach(function (fn) { if (fn) fn(); });
        };
        document.head.appendChild(s);
    }

    function isToolsPath() {
        var path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
        return path.indexOf("/tools/") !== -1 || path === "/tools" ||
               path.indexOf("/troolify/tools") !== -1;
    }

    function activeCategory() {
        var path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
        var segs = path.split("/").filter(Boolean);
        var toolsIdx = -1;
        for (var i = 0; i < segs.length; i++) {
            if (segs[i] === "tools") { toolsIdx = i; break; }
        }
        if (toolsIdx === -1) return "";
        var catSeg = segs[toolsIdx + 1];
        if (!catSeg || catSeg === "index.html") return "";
        return catSeg.charAt(0).toUpperCase() + catSeg.slice(1);
    }

    onReady(function () {
        var container = document.querySelector(".dash-cat-nav");
        if (!container) return;

        loadToolsData(function () {
            var CATS = window.CATEGORIES || [];
            var TOOLS = window.TOOLS || [];
            var cats = CATS.slice();
            var current = activeCategory();

            /* Count tools per category folder */
            function countFor(folder) {
                return TOOLS.filter(function (t) { return (t.category || "") === folder; }).length;
            }

            /* Preserve the defined order of CATEGORIES, then append any tools
               that reference a category not present in CATEGORIES. */
            var seen = {};
            cats.forEach(function (c) { seen[c.folder] = true; });

            var unordered = [];
            TOOLS.forEach(function (t) {
                var cat = t.category;
                if (cat && !seen[cat]) {
                    if (!unordered.some(function (u) { return u.folder === cat; })) {
                        unordered.push({ folder: cat, name: cat + " Tools", icon: t.icon || "fa-solid fa-wrench", desc: "" });
                    }
                    seen[cat] = true;
                }
            });
            cats = cats.concat(unordered);

            var search = document.querySelector(".dash-cat-search input");

            function render(filter) {
                container.innerHTML = "";
                filter = (filter || "").trim().toLowerCase();
                var shown = 0;
                cats.forEach(function (c) {
                    var cname = (c.name || c.folder).toLowerCase();
                    if (filter && cname.indexOf(filter) === -1 && (c.folder || "").toLowerCase().indexOf(filter) === -1) return;
                    shown++;
                    var li = document.createElement("li");
                    var href = rootPrefix() + "tools/" + (c.folder).toLowerCase() + "/index.html";
                    var isActive = current.toLowerCase() === (c.folder || "").toLowerCase();
                    var count = countFor(c.folder);
                    li.innerHTML =
                        '<a class="dash-cat-item' + (isActive ? " active" : "") + '" href="' + href + '">' +
                            '<span class="cat-icon"><i class="' + (c.icon || "fa-solid fa-wrench") + '"></i></span>' +
                            '<span class="cat-name">' + (c.name || c.folder) + '</span>' +
                            (count > 0 ? '<span class="cat-count">' + count + '</span>' : '') +
                        '</a>';
                    container.appendChild(li);
                });
                if (shown === 0) {
                    var empty = document.createElement("li");
                    empty.className = "dash-cat-empty";
                    empty.textContent = "No categories match";
                    empty.style.cssText = "padding:12px;font-size:12px;color:#ADB5BD;text-align:center";
                    container.appendChild(empty);
                }
            }

            if (search) {
                search.addEventListener("input", function () { render(search.value); });
            }
            render(search ? search.value : "");

            /* Ensure active category is scrolled into view */
            var activeEl = container.querySelector(".dash-cat-item.active");
            if (activeEl && activeEl.scrollIntoView) {
                try { activeEl.scrollIntoView({ block: "center" }); } catch (e) { activeEl.scrollIntoView(); }
            }
        });
    });
})();
