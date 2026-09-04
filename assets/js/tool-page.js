/* ============================================================================
   Troolify - Shared Tool-Page Script
   ----------------------------------------------------------------------------
   Behaviour shared by every tool page:
  - Share / Embed modals (auto-injected if missing, wiring, backdrop/Esc close)
  - Shared clipboard primitive exposed as window.Troolify.copyToClipboard
  - Related tools live search (reads window.TOOLS from tools-data.js)

   The page supplies its own <script> for the tool's unique logic only.
   Everything here is opt-in: if an element is missing, that feature is skipped.
   ============================================================================ */

(function () {
  "use strict";

  var canonical = document.querySelector('link[rel="canonical"]');
  var pageUrl = canonical && canonical.href ? canonical.href : location.href;
  var pageTitle = document.title;
  var heroTitle = document.querySelector(".hero-main h1");
  var pageLabel = (heroTitle ? heroTitle.textContent : "Troolify tool").trim();

  /* ---------------------- Shared clipboard primitive ---------------------- */

  function copyToClipboard(txt, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, done);
    } else {
      var ta = document.createElement("textarea");
      ta.value = txt;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      done();
    }
  }

  /* ---------------------- Share / Embed modal injection ---------------------- */

  function ensureModals() {
    var needsShare = document.getElementById("btnShare") && !document.getElementById("shareModal");
    var needsEmbed = document.getElementById("btnEmbed") && !document.getElementById("embedModal");
    if (!needsShare && !needsEmbed) return;
    var wrap = document.createElement("div");
    wrap.innerHTML =
      (needsShare
        ? '<div class="modal" id="shareModal" role="dialog" aria-modal="true" aria-labelledby="shareModalTitle">' +
          '<div class="modal-backdrop"></div>' +
          '<div class="modal-panel">' +
          '<button type="button" class="modal-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>' +
          '<h3 id="shareModalTitle">Share this tool</h3>' +
          '<p class="modal-sub">Send ' + pageLabel + ' to a teammate, client, or friend.</p>' +
          '<div class="modal-body">' +
          '<div class="modal-field">' +
          '<i class="fa-solid fa-link" style="color:var(--faint);font-size:13px"></i>' +
          '<input type="text" id="shareLink" readonly aria-label="Share link">' +
          '</div>' +
          '<div class="modal-social">' +
          '<a href="#" id="shareTwitter" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-x-twitter"></i>Post on X</a>' +
          '<a href="#" id="shareLinkedin" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-linkedin"></i>LinkedIn</a>' +
          '<a href="#" id="shareWhatsapp" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp"></i>WhatsApp</a>' +
          '</div>' +
          '<div class="modal-actions">' +
          '<button class="btn btn-primary" type="button" id="copyShareLink"><i class="fa-solid fa-copy"></i>Copy link</button>' +
          '</div>' +
          '<p class="modal-note">Tip: on mobile you can also use your browser&#39;s native share menu.</p>' +
          '</div></div></div>'
        : "") +
      (needsEmbed
        ? '<div class="modal" id="embedModal" role="dialog" aria-modal="true" aria-labelledby="embedModalTitle">' +
          '<div class="modal-backdrop"></div>' +
          '<div class="modal-panel">' +
          '<button type="button" class="modal-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>' +
          '<h3 id="embedModalTitle">Embed this tool</h3>' +
          '<p class="modal-sub">Copy the snippet below and paste it into your site&#39;s HTML.</p>' +
          '<div class="modal-body">' +
          '<textarea id="embedCode" readonly spellcheck="false" aria-label="Embed code"></textarea>' +
          '<div class="modal-actions">' +
          '<button class="btn btn-primary" type="button" id="copyEmbedCode"><i class="fa-solid fa-copy"></i>Copy code</button>' +
          '</div>' +
          '<p class="modal-note">The embedded tool stays 100% client-side. No server, no data collection.</p>' +
          '</div></div></div>'
        : "");
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
  }
  ensureModals();

  /* Exposed for per-page scripts so clipboard handling lives in one place. */
  window.Troolify = { copyToClipboard: copyToClipboard };

  /* ---------------------- Copy button helper ---------------------- */

  function copyText(txt, btn) {
    function done() {
      if (btn) {
        var old = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i>Copied';
        setTimeout(function () { btn.innerHTML = old; }, 1600);
      }
    }
    copyToClipboard(txt, done);
  }

  /* ---------------------- Modal wiring ---------------------- */

  /* ---------------------- Modal wiring (a11y: focus in, trap, return) ---------------------- */

  var lastModalTrigger = null;

  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    lastModalTrigger = document.activeElement;
    m.classList.add("open");
    m.setAttribute("aria-hidden", "false");
    var panel = m.querySelector(".modal-panel");
    if (panel && !panel.hasAttribute("tabindex")) panel.setAttribute("tabindex", "-1");
    setTimeout(function () { if (panel) panel.focus(); }, 20);
  }

  function closeModal(m) {
    if (!m) return;
    m.classList.remove("open");
    m.setAttribute("aria-hidden", "true");
    if (lastModalTrigger && lastModalTrigger.focus) lastModalTrigger.focus();
  }

  function modalFocusables(m) {
    var nodes = m.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    return Array.prototype.filter.call(nodes, function (el) {
      return el.offsetParent !== null && !el.disabled;
    });
  }

  document.querySelectorAll(".modal").forEach(function (m) {
    var backdrop = m.querySelector(".modal-backdrop");
    var closeBtn = m.querySelector(".modal-close");
    if (backdrop) backdrop.addEventListener("click", function () { closeModal(m); });
    if (closeBtn) closeBtn.addEventListener("click", function () { closeModal(m); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var openModals = document.querySelectorAll(".modal.open");
      if (openModals.length) closeModal(openModals[openModals.length - 1]);
      return;
    }
    if (e.key === "Tab") {
      var open = document.querySelector(".modal.open");
      if (!open) return;
      var f = modalFocusables(open);
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  var btnShare = document.getElementById("btnShare");
  if (btnShare) {
    btnShare.addEventListener("click", function () {
      var shareUrl = "https://x.com/intent/tweet?text=" + encodeURIComponent(pageTitle) + "&url=" + encodeURIComponent(pageUrl);
      var link = document.getElementById("shareLink");
      var tw = document.getElementById("shareTwitter");
      var li = document.getElementById("shareLinkedin");
      var wa = document.getElementById("shareWhatsapp");
      if (link) link.value = pageUrl;
      if (tw) tw.href = shareUrl;
      if (li) li.href = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(pageUrl);
      if (wa) wa.href = "https://wa.me/?text=" + encodeURIComponent(pageTitle + " " + pageUrl);
      openModal("shareModal");
    });
  }

  var btnEmbed = document.getElementById("btnEmbed");
  if (btnEmbed) {
    btnEmbed.addEventListener("click", function () {
      var code = document.getElementById("embedCode");
      if (code) {
        code.value = '<iframe src="' + pageUrl + '" style="width:100%;min-height:560px;border:0;border-radius:16px;" title="' + pageLabel + ' - Troolify" loading="lazy"></iframe>';
      }
      openModal("embedModal");
    });
  }

  var copyShare = document.getElementById("copyShareLink");
  if (copyShare) {
    copyShare.addEventListener("click", function () {
      copyText(document.getElementById("shareLink").value, this);
    });
  }

  var copyEmbed = document.getElementById("copyEmbedCode");
  if (copyEmbed) {
    copyEmbed.addEventListener("click", function () {
      copyText(document.getElementById("embedCode").value, this);
    });
  }

  /* ---------------------- Related tools (live search) ---------------------- */

  var grid = document.getElementById("relatedGrid");
  if (grid) {
    var search = document.getElementById("relatedSearch");
    var pathNorm = location.pathname.replace(/\/+$/, "").toLowerCase();
    var isProjectSite = pathNorm === "/troolify" || pathNorm.indexOf("/troolify/") === 0;
    var prefix = "";
    if (isProjectSite) {
      /* GitHub Pages project site: root every computed link at /troolify/. */
      prefix = "/troolify/";
    } else {
      var segs = location.pathname.split("/").filter(Boolean);
      var depth = Math.max(0, segs.length - 1);
      while (depth--) prefix += "../";
    }
    var segs2 = location.pathname.split("/").filter(Boolean);
    var current = segs2[segs2.length - 1] || "";

    /* tools-data.js is fetched lazily: only when the related-tools grid is
       about to scroll into view, or the user focuses/types in it. The navbar
       search in layout.js loads the same file on demand too. A shared pending
       callback list (window.__TOOLS_PENDING) prevents duplicate injections
       while a load is already in flight. */
    function loadToolsData(cb) {
      if (window.TOOLS) {
        if (cb) cb();
        return;
      }
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

    var RELATED_PAGE_SIZE = 6;
    var relatedVisible = RELATED_PAGE_SIZE;
    var relatedFiltered = [];

    var tools = [];
    var toolsStarted = false;

    function buildRelatedCard(t) {
      var card = document.createElement("a");
      card.className = "related-card";
      card.href = (t.href || "").indexOf("tools/") === 0 ? prefix + t.href : t.href;
      card.setAttribute("aria-label", "Open " + t.name);
      card.innerHTML =
        '<span class="rc-icon"><i class="' + (t.icon || "fa-solid fa-wrench") + '"></i></span>' +
        '<span class="rc-name">' + t.name + "</span>" +
        '<span class="rc-desc">' + (t.desc || "") + "</span>" +
        '<span class="rc-more">Open tool <i class="fa-solid fa-arrow-right"></i></span>';
      return card;
    }

    function renderRelated(q) {
      q = (q || "").trim().toLowerCase();
      relatedFiltered = tools.filter(function (t) {
        if (!q) return true;
        return (t.name + " " + (t.desc || "") + " " + (t.tag || "") + " " + (t.category || "") + " " + ((t.keywords || []).join(" ")))
          .toLowerCase().indexOf(q) !== -1;
      });
      relatedVisible = RELATED_PAGE_SIZE;
      grid.innerHTML = "";
      grid.setAttribute("aria-busy", "false");
      if (!relatedFiltered.length) {
        grid.innerHTML = '<div class="related-empty"><i class="fa-solid fa-magnifying-glass"></i>No tools match that search.</div>';
        return;
      }
      renderRelatedPage();
    }

    function renderRelatedPage() {
      var existing = grid.querySelector(".related-load-more");
      if (existing) existing.remove();

      var end = Math.min(relatedVisible, relatedFiltered.length);
      for (var i = grid.querySelectorAll(".related-card").length; i < end; i++) {
        grid.appendChild(buildRelatedCard(relatedFiltered[i]));
      }

      if (end < relatedFiltered.length) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "related-load-more";
        btn.innerHTML = '<i class="fa-solid fa-plus"></i>Load more (' + (relatedFiltered.length - end) + ' remaining)';
        btn.addEventListener("click", function () {
          relatedVisible += RELATED_PAGE_SIZE;
          renderRelatedPage();
        });
        grid.appendChild(btn);
      }
    }

    function relatedTools() {
      return (window.TOOLS || []).filter(function (t) {
        return (t.href || "").indexOf(current) === -1;
      });
    }

    function initRelated() {
      if (toolsStarted) return;
      toolsStarted = true;
      loadToolsData(function () {
        tools = relatedTools();
        renderRelated(search ? search.value : "");
      });
    }

    if (search) search.addEventListener("focus", initRelated);
    if (search) {
      search.addEventListener("input", function () {
        if (!toolsStarted) { initRelated(); return; }
        if (window.TOOLS) renderRelated(search.value);
      });
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            io.disconnect();
            initRelated();
          }
        });
      }, { rootMargin: "600px 0px", threshold: 0.01 });
      io.observe(grid);
    } else {
      initRelated();
    }
  }

  /* ---------------------- F9XR custom-development promo ---------------------- */

  var promoAnchor = document.querySelector(".author-box") || document.querySelector(".related-tools");
  if (promoAnchor && promoAnchor.parentNode && !document.querySelector(".f9xr-promo")) {
    var promo = document.createElement("section");
    promo.className = "f9xr-promo";
    promo.setAttribute("aria-label", "Custom website development by the F9XR Development Team");
    promo.innerHTML =
      '<div class="fp-inner">' +
        '<span class="fp-kicker"><i class="fa-solid fa-code" aria-hidden="true"></i>F9XR Team &middot; Custom Web Development</span>' +
        '<h2>Want to develop your own tools site like this?</h2>' +
        '<p>Meet the <strong>F9XR Development Team</strong> - we develop custom, high-quality websites designed just as per your needs.</p>' +
        '<div class="fp-actions">' +
          '<a class="rt-btn fp-btn" href="https://f9xr.github.io/" target="_blank" rel="noopener noreferrer">Meet F9XR Team <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>' +
          '<span class="fp-url"><i class="fa-solid fa-globe" aria-hidden="true"></i>f9xr.github.io</span>' +
        '</div>' +
      '</div>';
    promoAnchor.parentNode.insertBefore(promo, promoAnchor.nextSibling);
  }
})();
