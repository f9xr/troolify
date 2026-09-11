/* ============================================================================
   Troolify — "Translate This Page" widget
   ----------------------------------------------------------------------------
   Replaces the retired Google TranslateElement widget (translate_a/element.js),
   which Google is shutting down on 2026-10-01.

   The widget translates the whole page in place via Google's free, key-less
   translation endpoint (translate.googleapis.com/translate_a/single) using
   small batched requests, so no Google badge, banner or third-party markup is
   injected. It ships with:

     • A language dropdown using native names (selecting translates instantly).
     • A "Back to English" reset that restores every original string.
     • Progress + error feedback and a busy (cancellable) state.
     • A MutationObserver that keeps dynamically added content
       (recent/related tool lists, etc.) translated too.
     • The chosen language remembered in localStorage (not auto-applied, so
       page loads stay fast and predictable).

   API: window.TroolifyTranslate.init()  — called by layout.js once the panel
   exists in the right sidebar.
   ============================================================================ */

(function () {
    "use strict";

    var ENDPOINT = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&dt=t&tl=";
    var STORAGE_KEY = "troolifyTranslateLang";
    var JOIN_CHAR = "\u0001";          // packs several strings per single request
    var CHAR_LIMIT = 1150;             // max chars per packed request
    var CONCURRENCY = 3;               // parallel in-flight requests

    var EXCLUDED = [
        "script", "style", "noscript", "template",
        "textarea", "input", "select", "option",
        "code", "pre", "kbd", "samp", "var",
        "iframe", "svg", "canvas", "object", "embed",
        ".dash-rs-translate", ".ttl-status",
        "[translate=no]", "[translate=\"no\"]",
        "[contenteditable]"
    ].join(",");

    var LANGUAGES = [
        { code: "es", name: "Español" },
        { code: "fr", name: "Français" },
        { code: "de", name: "Deutsch" },
        { code: "it", name: "Italiano" },
        { code: "pt", name: "Português" },
        { code: "nl", name: "Nederlands" },
        { code: "ru", name: "Русский" },
        { code: "uk", name: "Українська" },
        { code: "pl", name: "Polski" },
        { code: "cs", name: "Čeština" },
        { code: "tr", name: "Türkçe" },
        { code: "ro", name: "Română" },
        { code: "hu", name: "Magyar" },
        { code: "el", name: "Ελληνικά" },
        { code: "sv", name: "Svenska" },
        { code: "da", name: "Dansk" },
        { code: "no", name: "Norsk" },
        { code: "fi", name: "Suomi" },
        { code: "ar", name: "العربية" },
        { code: "he", name: "עברית" },
        { code: "hi", name: "हिन्दी" },
        { code: "bn", name: "বাংলা" },
        { code: "ur", name: "اردو" },
        { code: "fa", name: "فارسی" },
        { code: "vi", name: "Tiếng Việt" },
        { code: "th", name: "ไทย" },
        { code: "id", name: "Indonesia" },
        { code: "ms", name: "Melayu" },
        { code: "tl", name: "Filipino" },
        { code: "zh-CN", name: "简体中文" },
        { code: "zh-TW", name: "繁體中文" },
        { code: "ja", name: "日本語" },
        { code: "ko", name: "한국어" }
    ];

    var state = { lang: "", busy: false, seq: 0 };
    var processed = new WeakSet();     // text nodes already translated
    var originals = new WeakMap();     // text node -> original string
    var translatedNodes = [];          // order-preserving list for reset
    var sel = null;
    var resetBtn = null;
    var statusEl = null;
    var scanTimer = null;
    var observer = null;

    /* ---------------------------------------------------------------
       Helpers
       --------------------------------------------------------------- */

    function langName(code) {
        for (var i = 0; i < LANGUAGES.length; i++) {
            if (LANGUAGES[i].code === code) return LANGUAGES[i].name;
        }
        return code;
    }

    function excluded(el) {
        return !!(el && el.closest && el.closest(EXCLUDED));
    }

    function isTranslatableNode(node) {
        if (!node || node.nodeType !== 3) return false;
        if (processed.has(node)) return false;
        var parent = node.parentElement;
        if (!parent || excluded(parent) || parent.isContentEditable) return false;
        var text = node.textContent || "";
        if (!/[A-Za-z\u00C0-\u024F]/.test(text)) return false;
        if (text.trim().length < 2) return false;
        return true;
    }

    function walk(root, out) {
        var node = root.firstChild;
        while (node) {
            var next = node.nextSibling;
            if (node.nodeType === 3) {
                if (isTranslatableNode(node)) out.push(node);
            } else if (node.nodeType === 1 && !excluded(node) && !node.isContentEditable) {
                walk(node, out);
            }
            node = next;
        }
    }

    function collectNodes() {
        var out = [];
        walk(document.body, out);
        return out;
    }

    function nodeText(node) {
        return (node.textContent || "").replace(/\u0001/g, " ");
    }

    function extractTranslation(data) {
        var frags = data && data[0];
        if (!Array.isArray(frags)) throw new Error("Unexpected response");
        var out = "";
        for (var i = 0; i < frags.length; i++) {
            if (frags[i] && frags[i][0] != null) out += frags[i][0];
        }
        return out;
    }

    /* ---------------------------------------------------------------
       Translation pipeline
       --------------------------------------------------------------- */

    function buildChunks(nodes) {
        var chunks = [];
        var cur = [];
        var len = 0;
        for (var i = 0; i < nodes.length; i++) {
            var t = nodeText(nodes[i]).trim();
            if (!t) continue;
            var add = t.length + 1;
            if (cur.length && len + add > CHAR_LIMIT) {
                chunks.push(cur);
                cur = [];
                len = 0;
            }
            cur.push(nodes[i]);
            len += add;
        }
        if (cur.length) chunks.push(cur);
        return chunks;
    }

    function applyChunk(chunk, parts, seq) {
        if (seq !== state.seq) return;
        for (var i = 0; i < chunk.length; i++) {
            var node = chunk[i];
            if (processed.has(node)) continue;
            originals.set(node, node.textContent);
            processed.add(node);
            translatedNodes.push(node);
            node.textContent = parts[i] || "";
        }
    }

    function requestOne(text, code) {
        return fetch(ENDPOINT + encodeURIComponent(code) + "&q=" + encodeURIComponent(text), { cache: "no-store" })
            .then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(function (data) {
                return extractTranslation(data);
            });
    }

    function translateIndividually(chunk, code, seq) {
        return Promise.all(chunk.map(function (node) {
            return requestOne(nodeText(node), code);
        })).then(function (parts) {
            applyChunk(chunk, parts, seq);
        });
    }

    function requestChunk(chunk, code, seq) {
        var joined = [];
        for (var i = 0; i < chunk.length; i++) joined.push(nodeText(chunk[i]));
        var url = ENDPOINT + encodeURIComponent(code) + "&q=" + encodeURIComponent(joined.join(JOIN_CHAR));
        return fetch(url, { cache: "no-store" })
            .then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(function (data) {
                var parts = extractTranslation(data).split(JOIN_CHAR);
                if (parts.length !== chunk.length) {
                    return translateIndividually(chunk, code, seq);
                }
                applyChunk(chunk, parts, seq);
            });
    }

    function runQueue(chunks, code, seq, onProgress) {
        return new Promise(function (resolve) {
            if (!chunks.length) {
                resolve({ ok: 0, failed: 0 });
                return;
            }
            var idx = 0;
            var inFlight = 0;
            var ok = 0;
            var failed = 0;

            function pump() {
                while (inFlight < CONCURRENCY && idx < chunks.length) {
                    var chunk = chunks[idx++];
                    inFlight++;
                    requestChunk(chunk, code, seq).then(
                        function () { ok++; },
                        function () { failed++; }
                    ).then(function () {
                        inFlight--;
                        if (onProgress) onProgress(ok + failed, chunks.length);
                        pump();
                    });
                }
                if (inFlight === 0 && idx >= chunks.length) resolve({ ok: ok, failed: failed });
            }

            pump();
        });
    }

    function translateNodes(nodes, code, seq, onProgress) {
        return runQueue(buildChunks(nodes), code, seq, onProgress);
    }

    /* ---------------------------------------------------------------
       Live re-translation of dynamically added content
       --------------------------------------------------------------- */

    function translateNewNodes(code, seq) {
        if (!state.lang || state.busy || seq !== state.seq) return;
        var nodes = collectNodes();
        if (!nodes.length) return;
        translateNodes(nodes, code, seq, null);
    }

    function scheduleScan() {
        if (scanTimer) clearTimeout(scanTimer);
        scanTimer = setTimeout(function () {
            scanTimer = null;
            translateNewNodes(state.lang, state.seq);
        }, 400);
    }

    function startObserver() {
        if (observer || !window.MutationObserver) return;
        observer = new MutationObserver(function () {
            if (!state.lang || state.busy) return;
            scheduleScan();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /* ---------------------------------------------------------------
       Public flow: translate / reset
       --------------------------------------------------------------- */

    function undoTranslation() {
        for (var i = 0; i < translatedNodes.length; i++) {
            var node = translatedNodes[i];
            if (originals.has(node)) node.textContent = originals.get(node);
            processed.delete(node);
            originals.delete(node);
        }
        translatedNodes.length = 0;
    }

    function setLang(code) {
        if (state.busy) return;
        state.seq++;
        if (!code) {
            resetTranslation();
            return;
        }
        // Switching to a different (or retrying the same) language: restore the
        // original strings first so every node is collected and re-translated.
        if (translatedNodes.length) undoTranslation();
        state.lang = code;
        try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* ignore */ }
        translatePage(code, state.seq);
    }

    function translatePage(code, seq) {
        var nodes = collectNodes();
        setBusy(true);
        if (!nodes.length) {
            setBusy(false);
            showStatus("Translated to " + langName(code) + ".", "ok");
            document.documentElement.lang = code.split("-")[0].toLowerCase();
            startObserver();
            return;
        }

        showBusyProgress(code, 0, 0);

        translateNodes(nodes, code, seq, function (done, total) {
            showBusyProgress(code, done, total);
        }).then(function (res) {
            if (seq !== state.seq) return;
            setBusy(false);
            if (res.failed === 0) {
                showStatus("Translated to " + langName(code) + ".", "ok");
            } else if (res.ok > 0) {
                showStatus("Partly translated to " + langName(code) + " — some sections failed. Try again.", "err");
            } else {
                showStatus("Translation failed. Check your connection and try again.", "err");
            }
            document.documentElement.lang = code.split("-")[0].toLowerCase();
            setTimeout(function () { translateNewNodes(code, seq); }, 300);
            startObserver();
        });
    }

    function resetTranslation() {
        state.seq++;
        if (scanTimer) { clearTimeout(scanTimer); scanTimer = null; }
        undoTranslation();
        state.lang = "";
        state.busy = false;
        if (document.documentElement) document.documentElement.lang = "en";
        setUIIdle();
        showStatus("", null);
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    }

    /* ---------------------------------------------------------------
       UI wiring
       --------------------------------------------------------------- */

    function setBusy(busy) {
        state.busy = busy;
        if (sel) sel.disabled = busy;
        if (resetBtn) resetBtn.hidden = !(busy || state.lang);
    }

    function setUIIdle() {
        if (sel) { sel.disabled = false; sel.value = ""; }
        if (resetBtn) resetBtn.hidden = true;
    }

    function showBusyProgress(code, done, total) {
        var text = "Translating to " + langName(code);
        if (total > 0) text += "… " + Math.min(done, total) + "/" + total;
        else text += "…";
        showStatus(text, "busy");
    }

    function showStatus(text, kind) {
        if (!statusEl) return;
        if (!text) {
            statusEl.hidden = true;
            statusEl.className = "ttl-status";
            statusEl.textContent = "";
            return;
        }
        statusEl.hidden = false;
        statusEl.className = "ttl-status" + (kind ? " " + kind : "");
        statusEl.textContent = "";
        if (kind === "busy") {
            var spin = document.createElement("i");
            spin.className = "fa-solid fa-spinner ttl-spin";
            statusEl.appendChild(spin);
        }
        statusEl.appendChild(document.createTextNode(" " + text));
    }

    function fillSelect(select) {
        var frag = document.createDocumentFragment();
        var origin = document.createElement("option");
        origin.value = "";
        origin.textContent = "Original (English)";
        frag.appendChild(origin);
        for (var i = 0; i < LANGUAGES.length; i++) {
            var opt = document.createElement("option");
            opt.value = LANGUAGES[i].code;
            opt.textContent = LANGUAGES[i].name;
            frag.appendChild(opt);
        }
        select.appendChild(frag);
    }

    function init() {
        if (init.done) return;
        init.done = true;
        var panel = document.querySelector(".dash-rs-translate");
        if (!panel) return;
        sel = panel.querySelector("#ttlLang");
        resetBtn = panel.querySelector("#ttlReset");
        statusEl = panel.querySelector("#ttlStatus");
        if (!sel) return;

        fillSelect(sel);
        sel.addEventListener("change", function () { setLang(sel.value); });
        if (resetBtn) resetBtn.addEventListener("click", function () { resetTranslation(); });

        var saved = null;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
        if (saved) {
            for (var i = 0; i < LANGUAGES.length; i++) {
                if (LANGUAGES[i].code === saved) {
                    sel.value = saved;
                    break;
                }
            }
        }
    }

    window.TroolifyTranslate = {
        init: init,
        reset: resetTranslation,
        lang: function () { return state.lang; }
    };
})();