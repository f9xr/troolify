/* ============================================================================
   Troolify - Dynamic Ad Network Loader
   ----------------------------------------------------------------------------
   Single source of truth for every ad unit on the site. Ad codes are NOT
   hardcoded into pages. Instead, any element can opt into advertising by
   declaring a placeholder slot:

       <div class="ad-slot" data-ad-slot="native">
           <span class="ad-badge">Advertisement</span>
       </div>

   When this script loads it scans the DOM for [data-ad-slot] placeholders,
   looks the slot name up in the UNITS config below, then injects the correct
   network script for that unit. No other file needs to know the ad keys.

   Supported slot names:
       native     -> Native banner (ProfitablerR CPM network)
       300x250    -> Medium rectangle       728x90 -> Leaderboard
       468x60     -> Full banner            160x300-> Half page column
       160x600    -> Wide skyscraper        320x50 -> Mobile leaderboard
       leaderboard-> Compound slot: renders a 728x90 (desktop) plus a
                     320x50 (mobile) pair; CSS reveals the right one.
   ============================================================================ */

(function (w) {
    "use strict";

    if (w.TroolifyAds) return; // single instance per page

    var VERSION = "1.0.0";

    /* ---------------------------------------------------------------------
       Ad unit registry. Each unit maps to the network that owns it and the
       publisher key for that size. To add, remove or resize a unit, edit
       this table only - no per-page markup or script tags need to change.
       --------------------------------------------------------------------- */

    var UNITS = {
        "native":   { network: "profitableratecpm", key: "a1428e0145a751d1afeef46551bd8659" },
        "300x250":  { network: "hrf", key: "e58fca3a70b7f6440770fea6a6a69f63", width: 300,  height: 250 },
        "468x60":   { network: "hrf", key: "9ce62f49850e881a324389bebe164f21", width: 468,  height: 60 },
        "160x300":  { network: "hrf", key: "ac3309be794e1178ae237439dc60bc92", width: 160,  height: 300 },
        "160x600":  { network: "hrf", key: "1c569984e7a0764bbf8b9723c425c0a2", width: 160,  height: 600 },
        "320x50":   { network: "hrf", key: "0f0b8e84550094fe90b04478fd4e4bd2", width: 320,  height: 50 },
        "728x90":   { network: "hrf", key: "691095927c5cc31c826edaffd3f5a717", width: 728,  height: 90 }
    };

    /* Compound slots: a single placeholder that maps to multiple real units.
       The CSS below shows/hides each child frame so only the right size is
       visible for the current viewport (leaderboard on desktop, mobile
       leaderboard on phones). */
    var COMPOUND = {
        "leaderboard": ["728x90", "320x50"]
    };

    var NETWORKS = {
        /* Native banner - (async script + matching container div). The
           container id MUST match the key suffix the network expects. */
        "profitableratecpm": {
            script: "https://pl31337382.profitableratecpmnetwork.com/",
            containerPrefix: "container-"
        },
        /* Banner units - classic atOptions + invoke.js pattern. Scripts emit
           an iframe at the script location, so we always mount the script
           inside the slot element itself. */
        "hrf": {
            script: "https://www.highrevenueformat.com/"
        }
    };

    /* ------------------------------------------------------------------------
       Internal state
       ------------------------------------------------------------------------ */

    var STYLES_INJECTED = false;
    var HRF_BUSY = false;
    var HRF_QUEUE = [];
    var bodyEl = (w.document && w.document.body) ? w.document.body : null;
    var NO_ADS = typeof w.document === "undefined" ||
                 (bodyEl && bodyEl.getAttribute("data-ads") === "off");

    /* ------------------------------------------------------------------------
       CSS - injected once so slot styling travels with the loader (no extra
       stylesheet edits required on individual pages).
       ------------------------------------------------------------------------ */

    function injectStyles() {
        if (STYLES_INJECTED) return;
        STYLES_INJECTED = true;

        var css =
            ".ad-slot{position:relative;margin:0 auto;display:flex;align-items:center;justify-content:center;width:100%;max-width:100%;min-height:1px}" +
            ".ad-slot>.ad-badge{position:absolute;top:2px;left:50%;transform:translateX(-50%);font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:rgba(173,181,189,.55);line-height:1;pointer-events:none}" +
            ".ad-slot>.ad-badge+.ad-frame{margin-top:14px}" +
            ".ad-slot .ad-frame{display:flex;align-items:center;justify-content:center;width:100%;max-width:100%;overflow:hidden}" +
            ".ad-slot .ad-frame>iframe{display:block;margin:0 auto}" +
            ".dash-rs-ad{padding:14px 16px;min-height:0}" +
            ".dash-rs-ad .ad-slot{min-height:0}" +
            /* Compound leaderboard: only one frame visible per breakpoint. */
            ".ad-slot[data-ad-slot='leaderboard'] .ad-frame[data-ad-size='320x50']{display:none}" +
            "@media(max-width:767px){.ad-slot[data-ad-slot='leaderboard'] .ad-frame[data-ad-size='728x90']{display:none}" +
            ".ad-slot[data-ad-slot='leaderboard'] .ad-frame[data-ad-size='320x50']{display:flex}}" +
            /* Keep wide fixed-size banners from breaking narrow layouts. */
            ".ad-slot[data-ad-slot='728x90']{max-width:728px}" +
            ".ad-slot[data-ad-slot='300x250']{max-width:300px}" +
            ".ad-slot[data-ad-slot='468x60']{max-width:468px}" +
            ".ad-slot[data-ad-slot='160x600'],.ad-slot[data-ad-slot='160x300']{max-width:160px}" +
            ".ad-slot[data-ad-slot='320x50']{max-width:320px}";

        var style = w.document.createElement("style");
        style.id = "troolify-ads-css";
        style.setAttribute("data-troolify", "ads");
        style.textContent = css;
        w.document.head.appendChild(style);
    }

    /* ------------------------------------------------------------------------
       Rendering helpers
       ------------------------------------------------------------------------ */

    function buildFrame(name, unit) {
        var frame = w.document.createElement("div");
        frame.className = "ad-frame";
        frame.setAttribute("data-ad-size", name);
        return frame;
    }

    function renderNative(slot, unit) {
        var frame = buildFrame("native", unit);
        var script = w.document.createElement("script");
        script.async = true;
        script.setAttribute("data-cfasync", "false");
        script.src = NETWORKS["profitableratecpm"].script + unit.key + "/invoke.js";
        var holder = w.document.createElement("div");
        holder.id = NETWORKS["profitableratecpm"].containerPrefix + unit.key;
        frame.appendChild(script);
        frame.appendChild(holder);
        slot.appendChild(frame);
    }

    /* High-revenue banner units depend on the shared window.atOptions global,
       so they must be mounted one at a time. The queue guarantees each
       invoke.js reads the atOptions that belongs to it before the next unit
       overrides it (avoids the classic multiple-banner race). */
    function queueHRF(slot, unit) {
        HRF_QUEUE.push({ slot: slot, unit: unit });
        drainHRF();
    }

    function drainHRF() {
        if (HRF_BUSY || !HRF_QUEUE.length) return;
        var job = HRF_QUEUE.shift();
        HRF_BUSY = true;

        w.atOptions = {
            key: job.unit.key,
            format: "iframe",
            height: job.unit.height,
            width: job.unit.width,
            params: {}
        };

        var frame = buildFrame(job.unit.width + "x" + job.unit.height, job.unit);
        var script = w.document.createElement("script");
        script.src = NETWORKS["hrf"].script + job.unit.key + "/invoke.js";
        script.async = false;
        script.onload = script.onerror = function () { HRF_BUSY = false; drainHRF(); };
        frame.appendChild(script);
        job.slot.appendChild(frame);
    }

    function resolveSlot(name) {
        if (COMPOUND[name]) {
            var units = [];
            COMPOUND[name].forEach(function (part) {
                if (UNITS[part]) units.push({ name: part, unit: UNITS[part] });
            });
            return units;
        }
        return UNITS[name] ? [{ name: name, unit: UNITS[name] }] : [];
    }

    /* Render a single [data-ad-slot] placeholder (safe to call repeatedly). */
    function renderSlot(el) {
        if (!el || !el.nodeType || el.getAttribute("data-ad-state") === "loaded") return;
        var name = el.getAttribute("data-ad-slot");
        if (!name || el.getAttribute("data-ad-disabled") === "true") return;

        var parts = resolveSlot(name);
        if (!parts.length) return;

        el.setAttribute("data-ad-state", "loaded");

        // Remove any stale frames so a re-init never duplicates ad units.
        Array.prototype.forEach.call(el.querySelectorAll(".ad-frame"), function (f) { f.parentNode.removeChild(f); });

        parts.forEach(function (part) {
            if (part.unit.network === "profitableratecpm") {
                renderNative(el, part.unit);
            } else {
                queueHRF(el, part.unit);
            }
        });
    }

    /* ------------------------------------------------------------------------
       Public API
       ------------------------------------------------------------------------ */

    function init() {
        if (NO_ADS) return;
        injectStyles();
        var slots = w.document.querySelectorAll("[data-ad-slot]");
        Array.prototype.forEach.call(slots, renderSlot);
    }

    /* Late-mount helper: call after dynamic content (e.g. an SPA view or a
       lazily rendered panel) introduces a new [data-ad-slot] placeholder. */
    function render(selectorOrEl) {
        if (NO_ADS) return;
        injectStyles();
        if (typeof selectorOrEl === "string") {
            Array.prototype.forEach.call(w.document.querySelectorAll(selectorOrEl), renderSlot);
        } else if (selectorOrEl) {
            renderSlot(selectorOrEl);
        }
    }

    w.TroolifyAds = {
        version: VERSION,
        UNITS: UNITS,
        COMPOUND: COMPOUND,
        init: init,
        render: render
    };

    /* init() runs immediately when the DOM is ready - never later, so dynamic
       slots injected by layout.js are already on the page by the time this
       loader scans for them. */
    function boot() {
        if (w.document.readyState === "loading") {
            w.document.addEventListener("DOMContentLoaded", init);
        } else {
            init();
        }
    }
    boot();
})(window);