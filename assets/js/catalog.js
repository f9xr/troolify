(function () {
    "use strict";

    var TOOLS = window.TOOLS || [];
    var CATEGORIES = window.CATEGORIES || [];
    var category = (document.body && document.body.getAttribute("data-category")) || "";
    var isCategoryPage = !!category;

    var grid = document.getElementById("toolGrid");
    var count = document.getElementById("toolCount");
    var empty = document.getElementById("emptyState");
    var searchInput = document.getElementById("searchInput");
    var filterRow = document.getElementById("filterRow");
    if (!grid || !count || !empty || !searchInput || !filterRow) return;

    var params = new URLSearchParams(window.location.search);
    var qParam = (params.get("q") || "").trim();
    if (qParam) searchInput.value = qParam;

    var activeFilter = "All";

    function rootPrefix() {
        var path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
        /* GitHub Pages project site: all JS-computed links root at /troolify/. */
        if (path === "/troolify" || path.indexOf("/troolify/") === 0) return "/troolify/";
        var dirs = window.location.pathname.split("/").filter(Boolean);
        dirs.pop();
        return dirs.map(function () { return "../"; }).join("");
    }
    var prefix = rootPrefix();

    function catName(folder) {
        for (var i = 0; i < CATEGORIES.length; i++) {
            if (CATEGORIES[i].folder === folder) return CATEGORIES[i].name;
        }
        return folder;
    }

    var scoped = category
        ? TOOLS.filter(function (t) { return t.category === category; })
        : TOOLS.slice();

    /* ItemList structured data for category pages - keeps the schema in sync
       automatically as tools are added to the registry. */
    if (isCategoryPage && !document.querySelector('script[data-catalog-itemlist]')) {
        var itemList = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": catName(category),
            "url": window.location.origin + prefix + "tools/" + category.toLowerCase() + "/index.html",
            "numberOfItems": scoped.length,
            "itemListElement": scoped.map(function (t, i) {
                return { "@type": "ListItem", "position": i + 1, "name": t.name, "url": window.location.origin + prefix + t.href };
            })
        };
        var itemListScript = document.createElement("script");
        itemListScript.type = "application/ld+json";
        itemListScript.setAttribute("data-catalog-itemlist", "");
        itemListScript.text = JSON.stringify(itemList);
        document.head.appendChild(itemListScript);
    }

    /* Filter pills:
       catalog page  -> categories (matches the folder structure)
       category page -> tags used inside that category            */
    var pillSet = [];
    scoped.forEach(function (t) {
        var key = category ? t.tag : t.category;
        if (pillSet.indexOf(key) === -1) pillSet.push(key);
    });
    pillSet.sort();
    pillSet.unshift("All");
    pillSet.forEach(function (key) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = category ? key : catName(key);
        if (key === "All") b.classList.add("active");
        b.addEventListener("click", function () {
            activeFilter = key;
            filterRow.querySelectorAll("button").forEach(function (x) { x.classList.remove("active"); });
            b.classList.add("active");
            render();
        });
        filterRow.appendChild(b);
    });

    function matches(t) {
        var q = searchInput.value.trim().toLowerCase();
        var filterKey = category ? t.tag : t.category;
        var okFilter = activeFilter === "All" || filterKey === activeFilter;
        var okQuery = q === "" ||
            t.name.toLowerCase().indexOf(q) !== -1 ||
            t.desc.toLowerCase().indexOf(q) !== -1 ||
            t.tag.toLowerCase().indexOf(q) !== -1 ||
            t.category.toLowerCase().indexOf(q) !== -1 ||
            (t.keywords || []).join(" ").toLowerCase().indexOf(q) !== -1;
        return okFilter && okQuery;
    }

    function render() {
        grid.innerHTML = "";
        grid.setAttribute("aria-busy", "false");
        var shown = 0;
        scoped.forEach(function (t) {
            if (!matches(t)) return;
            shown++;
            var card = document.createElement("a");
            card.className = "tool-card";
            card.href = prefix + t.href;
            card.setAttribute("aria-label", "Open " + t.name);
            var badge = category ? t.tag : catName(t.category);
            card.innerHTML =
                '<span class="tool-icon"><i class="' + t.icon + '"></i></span>' +
                '<span class="tool-body"><span class="tool-name">' + t.name + '</span><span class="tool-desc">' + t.desc + '</span></span>' +
                '<span class="tool-foot"><span class="tool-tag"><i class="fa-solid fa-tag"></i>' + badge + '</span><span class="tool-go"><i class="fa-solid fa-arrow-right"></i></span></span>';
            grid.appendChild(card);
        });

        if (isCategoryPage && scoped.length === 0) {
            count.textContent = "No utilities in " + catName(category) + " yet - check back soon";
            empty.classList.add("show");
            empty.querySelector("h3").textContent = "This category is coming soon";
            empty.querySelector("p").textContent = "We are actively building " + catName(category) + " utilities. They will appear here automatically.";
            empty.querySelector("a,button").textContent = "Browse all utilities";
            empty.querySelector("a,button").setAttribute("href", prefix + "tools/index.html");
        } else if (shown === 0) {
            count.textContent = "0 of " + scoped.length + " utilities match";
            empty.classList.add("show");
            empty.querySelector("h3").textContent = "No utilities match your search";
            empty.querySelector("p").textContent = "Try a different keyword or clear the filters.";
            empty.querySelector("a,button").textContent = "Clear filters";
            empty.querySelector("a,button").removeAttribute("href");
        } else {
            count.textContent = shown + " of " + scoped.length + " utilities · all run 100% locally";
            empty.classList.remove("show");
        }
    }

    searchInput.addEventListener("input", render);
    var clear = empty.querySelector("a,button");
    clear.addEventListener("click", function (e) {
        if (clear.hasAttribute("href")) return; /* browse-all link navigates */
        e.preventDefault();
        searchInput.value = "";
        activeFilter = "All";
        filterRow.querySelectorAll("button").forEach(function (x) { x.classList.toggle("active", x.textContent === "All"); });
        render();
    });

    render();
})();
