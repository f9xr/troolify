/* ============================================================================
   Troolify — Recently Used Tools Tracker
   ----------------------------------------------------------------------------
   Stores the last 5 visited tool pages in localStorage so the right sidebar
   can display a "Recently Used" panel. Fully client-side, no data leaves
   the browser.

   Exposes window.TroolifyRecent with:
     .record(href, name, icon)  — call once per page load
     .get()                     — returns [{href, name, icon}, ...]
   ============================================================================ */

(function () {
    "use strict";

    var KEY = "troolify_recent";
    var MAX = 5;

    function read() {
        try {
            var raw = localStorage.getItem(KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function write(arr) {
        try {
            localStorage.setItem(KEY, JSON.stringify(arr));
        } catch (e) {}
    }

    window.TroolifyRecent = {
        /**
         * Record a tool visit. Duplicates are moved to the front.
         * @param {string} href  - tool href relative to site root (e.g. "tools/coding/json-formatter.html")
         * @param {string} name  - display name
         * @param {string} icon  - FontAwesome class (e.g. "fa-solid fa-code")
         */
        record: function (href, name, icon) {
            if (!href) return;
            var list = read();
            /* Remove any existing entry for this href */
            list = list.filter(function (r) { return r.href !== href; });
            /* Prepend the new visit */
            list.unshift({ href: href, name: name || "", icon: icon || "fa-solid fa-wrench" });
            /* Trim to max */
            if (list.length > MAX) list = list.slice(0, MAX);
            write(list);
        },

        /**
         * Return the recent tools list (most recent first).
         * @returns {Array<{href:string, name:string, icon:string}>}
         */
        get: function () {
            return read();
        }
    };
})();
