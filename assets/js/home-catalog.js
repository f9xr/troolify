/* Homepage catalog — renders the category grid from the shared TOOLS/CATEGORIES data.
   Runs deferred after tools-data.js. Replaces the in-page skeleton placeholders. */
(function () {
    "use strict";
    var grid = document.getElementById("categoryGrid");
    if (!grid) return;
    var cats = window.CATEGORIES || [];
    var tools = window.TOOLS || [];
    var count = function (folder) {
        var n = 0;
        tools.forEach(function (t) { if (t.category === folder) n++; });
        return n;
    };
    var html = "";
    cats.forEach(function (c) {
        var n = count(c.folder);
        html += '<a href="tools/' + c.folder + '/index.html" class="category-card">' +
            '<div class="category-icon"><i class="' + c.icon + '"></i></div>' +
            '<h3 class="category-title">' + c.name + '</h3>' +
            '<p class="category-desc">' + c.desc + '</p>' +
            '<div class="category-footer">' +
                '<span class="tool-count">' + n + (n === 1 ? ' Tool' : ' Tools') + '</span>' +
                '<i class="fa-solid fa-arrow-right category-arrow"></i>' +
            '</div>' +
        '</a>';
    });
    grid.innerHTML = html;
    grid.setAttribute("aria-busy", "false");
})();
