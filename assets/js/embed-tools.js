/* ============================================================================
   Troolify - embed code generator engine
   ----------------------------------------------------------------------------
   Shared client-side engine for the tools/embed/* pages. Each page sets
   <body data-embed-platform="slug"> and the engine builds the panel, validates
   the link, generates the platform's standard embed code and renders a live
   preview. Nothing is uploaded; every step runs in this tab.

   Adding a platform later: append a config object to EMBED_PLATFORMS.
   ============================================================================ */
(function () {
  "use strict";

  function ea(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/'/g, "&#39;");
  }

  function q(s) {
    return encodeURIComponent(String(s == null ? "" : s));
  }

  function http(u) {
    u = String(u == null ? "" : u).trim();
    if (u.indexOf("//") === 0) return "https:" + u;
    return u;
  }

  function pick(raw) {
    var s = String(raw == null ? "" : raw).trim();
    if (!s) return "";
    var m = s.match(/(?:src|href|cite|data-instgrm-permalink|data-telegram-post)\s*=\s*["']([^"']+)["']/i);
    if (m) return m[1].trim();
    m = s.match(/https?:\/\/[^\s"'<>]+/i);
    if (m) return m[0].replace(/[),.;]+$/, "");
    return s;
  }

  function num(v, key, def, min, max) {
    var n = parseFloat(v[key]);
    if (!isFinite(n)) n = def;
    if (typeof min === "number" && n < min) n = min;
    if (typeof max === "number" && n > max) n = max;
    return n;
  }

  function iframe(src, w, h, extra) {
    return '<iframe width="' + ea(w) + '" height="' + ea(h) + '" src="' + ea(src) +
      '" frameborder="0" ' + (extra || "") + ' loading="lazy"></iframe>';
  }

  function ytId(u) {
    var m = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    m = u.match(/[?&]v=([A-Za-z0-9_-]{11})/);
    return m ? m[1] : "";
  }

  var P = {};

  P.tiktok = {
    name: "TikTok",
    icon: "fa-brands fa-tiktok",
    label: "TikTok video URL",
    placeholder: "https://www.tiktok.com/@username/video/7300000000000000000",
    hint: "Paste the video URL, or the full embed code TikTok gives you.",
    embedType: "blockquote and script",
    fields: [{ id: "width", label: "Max width (px)", type: "number", value: 605, min: 220, max: 1000 }],
    build: function (v) {
      var u = http(pick(v.url));
      var m = u.match(/\/video\/(\d+)/);
      if (!m) return { error: "That does not look like a TikTok video URL. Open the video, tap Share, choose Copy link, then paste it here." };
      var w = num(v, "width", 605, 220, 1000);
      var code = '<blockquote class="tiktok-embed" cite="' + ea(u) + '" data-video-id="' + ea(m[1]) +
        '" style="max-width: ' + w + 'px; min-width: 325px;"><section><a target="_blank" href="' + ea(u) +
        '">View this post on TikTok</a></section></blockquote>\n<script async src="https://www.tiktok.com/embed.js"></script>';
      return { code: code, note: "TikTok only allows embedding for public videos. Private, deleted or region-locked posts will not render." };
    }
  };

  P.x = {
    name: "X (Twitter)",
    icon: "fa-brands fa-x-twitter",
    label: "Post URL",
    placeholder: "https://x.com/username/status/1234567890123456789",
    hint: "Paste the post URL, or the full blockquote embed X gives you.",
    embedType: "blockquote and script",
    fields: [
      { id: "theme", label: "Theme", type: "select", value: "light", options: [["light", "Light"], ["dark", "Dark"]] },
      { id: "conversation", label: "Conversation", type: "select", value: "show", options: [["show", "Show replies"], ["none", "Hide replies"]] }
    ],
    build: function (v) {
      var u = http(pick(v.url));
      if (!/^https?:\/\/(www\.)?(x|twitter)\.com\//i.test(u)) return { error: "Paste a post URL from x.com or twitter.com." };
      var theme = v.theme === "dark" ? "dark" : "light";
      var conv = v.conversation === "none" ? ' data-conversation="none"' : "";
      var code = '<blockquote class="twitter-tweet" data-theme="' + theme + '"' + conv + '><a href="' + ea(u) +
        '"></a></blockquote>\n<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>';
      return { code: code, note: "X renders the post in each reader's browser. Protected or deleted posts cannot be embedded." };
    }
  };

  P.youtube = {
    name: "YouTube",
    icon: "fa-brands fa-youtube",
    label: "YouTube video URL",
    placeholder: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    hint: "Works with watch, youtu.be, shorts, live and embed URLs.",
    embedType: "iframe",
    fields: [
      { id: "width", label: "Width (px)", type: "number", value: 560, min: 240, max: 1920 },
      { id: "height", label: "Height (px)", type: "number", value: 315, min: 140, max: 1080 },
      { id: "start", label: "Start time (seconds)", type: "number", value: 0, min: 0, max: 86400 }
    ],
    build: function (v) {
      var u = http(pick(v.url));
      var id = ytId(u);
      if (!id) return { error: "Could not find a YouTube video ID. Paste a watch, youtu.be, shorts or live URL." };
      var w = num(v, "width", 560, 240, 1920);
      var h = num(v, "height", 315, 140, 1080);
      var start = num(v, "start", 0, 0, 86400);
      var src = "https://www.youtube.com/embed/" + id + "?rel=0" + (start > 0 ? "&start=" + start : "");
      var code = iframe(src, w, h, 'title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen');
      return { code: code, note: "Private, age-restricted or removed videos will show an error inside the player." };
    }
  };

  P.instagram = {
    name: "Instagram",
    icon: "fa-brands fa-instagram",
    label: "Instagram post or reel URL",
    placeholder: "https://www.instagram.com/p/Cxxxxxxxxxx/",
    hint: "Paste a post, reel or IGTV URL, or the full embed code Instagram gives you.",
    embedType: "blockquote and script",
    fields: [],
    build: function (v) {
      var u = http(pick(v.url));
      if (!/instagram\.com\/(p|reel|tv)\//i.test(u)) return { error: "Paste an Instagram post, reel or TV URL that contains /p/, /reel/ or /tv/." };
      var code = '<blockquote class="instagram-media" data-instgrm-permalink="' + ea(u) +
        '" data-instgrm-version="14" style="max-width:540px;min-width:326px;width:99%;margin:1px auto;border:0;padding:0;"><a href="' +
        ea(u) + '" target="_blank" rel="noopener">View this post on Instagram</a></blockquote>\n' +
        '<script async src="//www.instagram.com/embed.js"></script>';
      return { code: code, note: "Only public posts can be embedded. Instagram may ask the reader to log in for some content." };
    }
  };

  P["google-maps"] = {
    name: "Google Maps",
    icon: "fa-solid fa-map-location-dot",
    label: "Google Maps link or embed URL",
    placeholder: "https://www.google.com/maps/place/Eiffel+Tower/@48.8584,2.2945,15z",
    hint: "Paste a share link, a place URL or a full Google Maps iframe.",
    embedType: "iframe",
    fields: [
      { id: "width", label: "Width (px)", type: "number", value: 600, min: 240, max: 1920 },
      { id: "height", label: "Height (px)", type: "number", value: 450, min: 180, max: 1080 }
    ],
    build: function (v) {
      var u = http(pick(v.url));
      if (!u) return { error: "Paste a Google Maps link or embed URL." };
      var src;
      if (/\/maps\/embed/i.test(u)) {
        src = u;
      } else {
        var m = u.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
        src = m
          ? "https://maps.google.com/maps?q=" + m[1] + "," + m[2] + "&z=15&output=embed"
          : "https://maps.google.com/maps?q=" + q(u) + "&output=embed";
      }
      var w = num(v, "width", 600, 240, 1920);
      var h = num(v, "height", 450, 180, 1080);
      var code = iframe(src, w, h, 'style="border:0;" allowfullscreen referrerpolicy="no-referrer-when-downgrade"');
      return { code: code, note: "If a short maps.app.goo.gl link does not preview, open it first and copy the full URL from the address bar." };
    }
  };

  P.facebook = {
    name: "Facebook",
    icon: "fa-brands fa-facebook",
    label: "Facebook post or video URL",
    placeholder: "https://www.facebook.com/username/posts/1234567890",
    hint: "Paste a public post, video, reel or watch URL.",
    embedType: "iframe",
    fields: [
      { id: "width", label: "Width (px)", type: "number", value: 500, min: 200, max: 1000 },
      { id: "height", label: "Height (px)", type: "number", value: 620, min: 200, max: 1200 }
    ],
    build: function (v) {
      var u = http(pick(v.url));
      if (!/facebook\.com\//i.test(u)) return { error: "Paste a Facebook post or video URL." };
      var isVideo = /\/videos\/|\/watch\/?|\/reel\//i.test(u);
      var plugin = isVideo ? "video" : "post";
      var w = num(v, "width", 500, 200, 1000);
      var h = num(v, "height", isVideo ? 476 : 620, 200, 1200);
      var src = "https://www.facebook.com/plugins/" + plugin + ".php?href=" + q(u) + "&width=" + w +
        "&height=" + h + (plugin === "post" ? "&show_text=true" : "") + "&lazy=true";
      return { code: iframe(src, w, h, 'style="border:none;overflow:hidden" scrolling="no" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"'), note: "Only content that is public can be embedded." };
    }
  };

  P.spotify = {
    name: "Spotify",
    icon: "fa-brands fa-spotify",
    label: "Spotify track, album, playlist or episode URL",
    placeholder: "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC",
    hint: "Paste a share link or the full embed code from Spotify.",
    embedType: "iframe",
    fields: [
      { id: "height", label: "Height (px)", type: "number", value: 352, min: 80, max: 800 },
      { id: "theme", label: "Theme", type: "select", value: "light", options: [["light", "Light"], ["dark", "Dark"]] }
    ],
    build: function (v) {
      var u = http(pick(v.url));
      var m = u.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/i);
      if (!m) return { error: "Paste a Spotify track, album, playlist, artist, episode or show URL." };
      var type = m[1].toLowerCase();
      var def = (type === "track" || type === "episode") ? 152 : 352;
      var h = num(v, "height", def, 80, 800);
      var src = "https://open.spotify.com/embed/" + type + "/" + m[2] + "?utm_source=generator" +
        (v.theme === "dark" ? "&theme=0" : "");
      return { code: iframe(src, "100%", h, 'style="border-radius:12px" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"'), note: "Spotify decides how much of a track plays for each listener. Podcasts and full tracks may require a login." };
    }
  };

  P.canva = {
    name: "Canva",
    icon: "fa-solid fa-palette",
    label: "Canva design URL",
    placeholder: "https://www.canva.com/design/DAFxxxxxxxxx/view",
    hint: "Paste the design link. The design must allow viewing or embedding.",
    embedType: "iframe wrapper",
    fields: [
      { id: "ratio", label: "Aspect ratio", type: "select", value: "56.25", options: [["56.25", "16:9 (widescreen)"], ["75", "4:3"], ["100", "1:1 (square)"], ["133.33", "3:4 (portrait)"]] }
    ],
    build: function (v) {
      var u = http(pick(v.url));
      var m = u.match(/canva\.com\/design\/([A-Za-z0-9_-]+)/);
      if (!m) return { error: "Paste a Canva design URL that contains /design/." };
      var pad = v.ratio || "56.25";
      var src = "https://www.canva.com/design/" + m[1] + "/view?embed";
      var code = '<div style="position: relative; width: 100%; height: 0; padding-top: ' + ea(pad) +
        '%; overflow: hidden;"><iframe src="' + ea(src) +
        '" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0; margin: 0;" allowfullscreen="allowfullscreen" allow="fullscreen" loading="lazy"></iframe></div>';
      return { code: code, note: "Canva only embeds designs that are shared with a link or set to public; private designs will show a permissions error." };
    }
  };

  P.discord = {
    name: "Discord",
    icon: "fa-brands fa-discord",
    label: "Discord server ID or widget code",
    placeholder: "123456789012345678",
    hint: "Use the server ID, or paste the widget iframe from Server Settings > Widget.",
    embedType: "iframe widget",
    fields: [
      { id: "width", label: "Width (px)", type: "number", value: 350, min: 200, max: 800 },
      { id: "height", label: "Height (px)", type: "number", value: 500, min: 200, max: 900 },
      { id: "theme", label: "Theme", type: "select", value: "dark", options: [["dark", "Dark"], ["light", "Light"]] }
    ],
    build: function (v) {
      var raw = String(v.url || "").trim();
      var m = raw.match(/[?&]id=(\d{10,})/i) || raw.match(/^(\d{10,})$/);
      if (!m) return { error: "Paste the server ID (a long number), or the full widget iframe. Invite links cannot be converted because Discord does not expose the server ID." };
      var w = num(v, "width", 350, 200, 800);
      var h = num(v, "height", 500, 200, 900);
      var theme = v.theme === "light" ? "light" : "dark";
      var src = "https://discord.com/widget?id=" + m[1] + "&theme=" + theme;
      var code = iframe(src, w, h, 'allowtransparency="true" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"');
      return { code: code, note: "The server owner must enable Server Settings > Widget before this embed will show online members." };
    }
  };

  P.reddit = {
    name: "Reddit",
    icon: "fa-brands fa-reddit-alien",
    label: "Reddit post URL",
    placeholder: "https://www.reddit.com/r/webdev/comments/xxxxxxxx/post_title/",
    hint: "Paste the post URL, or the full embed code Reddit gives you.",
    embedType: "blockquote and script",
    fields: [{ id: "height", label: "Height (px)", type: "number", value: 500, min: 160, max: 1200 }],
    build: function (v) {
      var u = http(pick(v.url));
      if (!/reddit\.com\//i.test(u)) return { error: "Paste a Reddit post URL." };
      var h = num(v, "height", 500, 160, 1200);
      var code = '<blockquote class="reddit-embed-bq" style="height:' + h + 'px" data-embed-height="' + h +
        '"><a href="' + ea(u) + '">View this post on Reddit</a></blockquote>\n' +
        '<script async src="https://embed.reddit.com/widgets.js" charset="UTF-8"></script>';
      return { code: code, note: "Private, quarantined or NSFW posts may not render for every reader." };
    }
  };

  P.vimeo = {
    name: "Vimeo",
    icon: "fa-brands fa-vimeo",
    label: "Vimeo video URL",
    placeholder: "https://vimeo.com/76979871",
    hint: "Paste the video URL or the full iframe Vimeo gives you.",
    embedType: "iframe",
    fields: [
      { id: "width", label: "Width (px)", type: "number", value: 640, min: 240, max: 1920 },
      { id: "height", label: "Height (px)", type: "number", value: 360, min: 140, max: 1080 }
    ],
    build: function (v) {
      var u = http(pick(v.url));
      var m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (!m) return { error: "Paste a Vimeo video URL that contains the numeric video ID." };
      var w = num(v, "width", 640, 240, 1920);
      var h = num(v, "height", 360, 140, 1080);
      var src = "https://player.vimeo.com/video/" + m[1] + "?title=0&byline=0&portrait=0";
      return { code: iframe(src, w, h, 'allow="autoplay; fullscreen; picture-in-picture" allowfullscreen'), note: "Privacy settings on the video decide where it can be embedded." };
    }
  };

  P.soundcloud = {
    name: "SoundCloud",
    icon: "fa-brands fa-soundcloud",
    label: "SoundCloud track or playlist URL",
    placeholder: "https://soundcloud.com/artist/track-name",
    hint: "Paste the track or playlist URL, or the full embed iframe.",
    embedType: "iframe",
    fields: [
      { id: "height", label: "Height (px)", type: "number", value: 166, min: 120, max: 450 },
      { id: "color", label: "Player accent colour", type: "text", value: "#ff5500" }
    ],
    build: function (v) {
      var u = http(pick(v.url));
      if (!/soundcloud\.com\//i.test(u)) return { error: "Paste a SoundCloud track or playlist URL." };
      var h = num(v, "height", 166, 120, 450);
      var color = v.color || "#ff5500";
      var src = "https://w.soundcloud.com/player/?url=" + q(u) + "&color=" + q(color) +
        "&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true";
      return { code: iframe(src, "100%", h, 'scrolling="no" allow="autoplay"'), note: "Private tracks require a secret link; only public tracks embed reliably." };
    }
  };

  P.twitch = {
    name: "Twitch",
    icon: "fa-brands fa-twitch",
    label: "Twitch channel, video or clip URL",
    placeholder: "https://www.twitch.tv/yourchannel",
    hint: "Paste a channel, video or clip URL. Set the parent domain to the site hosting the embed.",
    embedType: "iframe",
    fields: [
      { id: "width", label: "Width (px)", type: "number", value: 800, min: 240, max: 1920 },
      { id: "height", label: "Height (px)", type: "number", value: 450, min: 160, max: 1080 },
      { id: "parent", label: "Parent domain", type: "text", value: "example.com", hint: "The domain where the embed will live, for example yoursite.com." },
      { id: "autoplay", label: "Autoplay", type: "select", value: "false", options: [["false", "Off"], ["true", "On (muted)"]] }
    ],
    build: function (v) {
      var raw = String(v.url || "").trim();
      var parent = String(v.parent || "").trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
      if (!parent) return { error: "Add the parent domain where the embed will be hosted." };
      var auto = v.autoplay === "true" ? "&autoplay=true&muted=true" : "";
      var src;
      var clip = raw.match(/clips\.twitch\.tv\/([A-Za-z0-9_-]+)/) || raw.match(/twitch\.tv\/[^\/]+\/clip\/([A-Za-z0-9_-]+)/);
      var vid = raw.match(/twitch\.tv\/videos\/(\d+)/);
      if (clip) {
        src = "https://clips.twitch.tv/embed?clip=" + clip[1] + "&parent=" + q(parent) + auto;
      } else if (vid) {
        src = "https://player.twitch.tv/?video=" + vid[1] + "&parent=" + q(parent) + auto;
      } else {
        var ch = raw.match(/twitch\.tv\/([A-Za-z0-9_]+)/);
        var name = ch ? ch[1] : raw.replace(/^@/, "");
        if (!/^[A-Za-z0-9_]{3,25}$/.test(name)) return { error: "Paste a Twitch channel, video or clip URL. Channel names use letters, numbers and underscores." };
        src = "https://player.twitch.tv/?channel=" + name + "&parent=" + q(parent) + auto;
      }
      var w = num(v, "width", 800, 240, 1920);
      var h = num(v, "height", 450, 160, 1080);
      return { code: iframe(src, w, h, 'allowfullscreen allow="autoplay; fullscreen"'), note: "Twitch requires the parent domain to match the site that hosts the embed, otherwise the player refuses to load." };
    }
  };

  P.linkedin = {
    name: "LinkedIn",
    icon: "fa-brands fa-linkedin",
    label: "LinkedIn post URL or embed code",
    placeholder: "https://www.linkedin.com/posts/username_title-activity-7123456789012345678-xxxx",
    hint: "Paste the post URL, or the full embed code from Embed this post.",
    embedType: "iframe",
    fields: [
      { id: "width", label: "Width (px)", type: "number", value: 504, min: 240, max: 1000 },
      { id: "height", label: "Height (px)", type: "number", value: 600, min: 200, max: 1200 }
    ],
    build: function (v) {
      var raw = String(v.url || "").trim();
      var u = http(pick(raw));
      var urnMatch = (raw + " " + u).match(/urn:li:(share|activity|ugcPost):(\d+)/i);
      var urn = "";
      if (urnMatch) {
        urn = "urn:li:" + urnMatch[1] + ":" + urnMatch[2];
      } else {
        var m = u.match(/(?:activity|share|ugcPost)[-:](\d{10,})/i);
        if (m) urn = "urn:li:share:" + m[1];
      }
      if (!urn) return { error: "Could not find a LinkedIn post ID. Open the post, choose Embed this post, then paste the full embed code here." };
      var w = num(v, "width", 504, 240, 1000);
      var h = num(v, "height", 600, 200, 1200);
      var src = "https://www.linkedin.com/embed/feed/update/" + urn;
      return { code: iframe(src, w, h, 'allowfullscreen title="Embedded LinkedIn post"'), note: "Only public posts can be embedded. Use the Embed this post option if the URL does not contain an activity ID." };
    }
  };

  P.pinterest = {
    name: "Pinterest",
    icon: "fa-brands fa-pinterest",
    label: "Pinterest pin URL",
    placeholder: "https://www.pinterest.com/pin/123456789012345678/",
    hint: "Paste the pin URL, or the full embed code Pinterest gives you.",
    embedType: "link and script",
    fields: [{ id: "size", label: "Pin size", type: "select", value: "medium", options: [["small", "Small"], ["medium", "Medium"], ["large", "Large"]] }],
    build: function (v) {
      var u = http(pick(v.url));
      if (!/pinterest\./i.test(u)) return { error: "Paste a Pinterest pin URL." };
      var size = ["small", "medium", "large"].indexOf(v.size) === -1 ? "medium" : v.size;
      var code = '<a data-pin-do="embedPin" data-pin-width="' + size + '" href="' + ea(u) +
        '"></a>\n<script async defer src="https://assets.pinterest.com/js/pinit.js"></script>';
      return { code: code, note: "Boards and pins that are marked secret cannot be embedded." };
    }
  };

  P.telegram = {
    name: "Telegram",
    icon: "fa-brands fa-telegram",
    label: "Telegram post URL",
    placeholder: "https://t.me/durov/123",
    hint: "Paste a public post URL in the form t.me/channel/123.",
    embedType: "script widget",
    fields: [{ id: "width", label: "Width (px or 100%)", type: "text", value: "100%" }],
    build: function (v) {
      var raw = String(v.url || "").trim();
      var m = raw.match(/(?:t\.me\/)?([A-Za-z0-9_]{3,})\/(\d+)/);
      if (!m) return { error: "Paste a public Telegram post URL such as https://t.me/channel/123." };
      var width = String(v.width || "100%").trim() || "100%";
      var code = '<script async src="https://telegram.org/js/telegram-widget.js?22" data-telegram-post="' +
        ea(m[1] + "/" + m[2]) + '" data-width="' + ea(width) + '"></script>';
      return { code: code, note: "The channel must be public. Private channels and secret chats cannot be embedded." };
    }
  };

  P.imgur = {
    name: "Imgur",
    icon: "fa-solid fa-image",
    label: "Imgur post URL",
    placeholder: "https://imgur.com/gallery/abc123",
    hint: "Paste an image, album or gallery URL, or the full embed code.",
    embedType: "blockquote and script",
    fields: [],
    build: function (v) {
      var u = http(pick(v.url));
      var m = u.match(/imgur\.com\/(?:gallery|a)?\/?([A-Za-z0-9]+)/);
      if (!m) return { error: "Paste an Imgur image, album or gallery URL." };
      var id = m[1];
      var code = '<blockquote class="imgur-embed-pub" lang="en" data-id="' + ea(id) + '"><a href="https://imgur.com/' +
        ea(id) + '">View post on Imgur</a></blockquote>\n<script async src="https://s.imgur.com/min/embed.js" charset="utf-8"></script>';
      return { code: code, note: "Deleted or private Imgur posts will not render." };
    }
  };

  P.giphy = {
    name: "GIPHY",
    icon: "fa-solid fa-film",
    label: "GIPHY page or embed URL",
    placeholder: "https://giphy.com/gifs/funny-cat-3o7aD2saalBwwftBIY",
    hint: "Paste the GIF page URL, or the full iframe GIPHY gives you.",
    embedType: "iframe",
    fields: [
      { id: "width", label: "Width (px)", type: "number", value: 480, min: 120, max: 1200 },
      { id: "height", label: "Height (px)", type: "number", value: 270, min: 80, max: 900 }
    ],
    build: function (v) {
      var u = http(pick(v.url));
      var parts = u.split("?")[0].split("/");
      var seg = parts[parts.length - 1] || "";
      var id = seg.split("-").pop();
      if (!/^[A-Za-z0-9]{6,}$/.test(id)) return { error: "Could not find a GIPHY ID. Paste the GIF page or embed URL." };
      var w = num(v, "width", 480, 120, 1200);
      var h = num(v, "height", 270, 80, 900);
      var code = '<iframe src="https://giphy.com/embed/' + ea(id) + '" width="' + w + '" height="' + h +
        '" frameborder="0" class="giphy-embed" allowfullscreen loading="lazy"></iframe>\n' +
        '<p><a href="https://giphy.com/gifs/' + ea(id) + '">via GIPHY</a></p>';
      return { code: code, note: "GIPHY may remove GIFs that violate its content policy, which leaves an empty frame." };
    }
  };

  P["apple-music"] = {
    name: "Apple Music",
    icon: "fa-brands fa-apple",
    label: "Apple Music album, playlist or song URL",
    placeholder: "https://music.apple.com/us/album/album-name/1234567890",
    hint: "Paste a share link, or the full embed code from Apple Music.",
    embedType: "iframe",
    fields: [{ id: "height", label: "Height (px)", type: "number", value: 450, min: 100, max: 800 }],
    build: function (v) {
      var u = http(pick(v.url));
      var m = u.match(/music\.apple\.com\/([a-z]{2})\/(album|playlist|song|music-video)\/(?:[^\/]+\/)?([A-Za-z0-9._-]+)/i);
      if (!m) return { error: "Paste an Apple Music album, playlist or song URL." };
      var region = m[1].toLowerCase();
      var type = m[2].toLowerCase();
      var id = m[3];
      var qi = u.match(/[?&]i=(\d+)/);
      var src = "https://embed.music.apple.com/" + region + "/" + type + "/" + id + (qi ? "?i=" + qi[1] : "");
      var h = num(v, "height", (type === "album" || type === "playlist") ? 450 : 175, 100, 800);
      var code = iframe(src, "100%", h, 'allow="autoplay *; encrypted-media *; fullscreen *" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" style="max-width:660px;overflow:hidden;background:transparent;border-radius:10px"');
      return { code: code, note: "Apple Music players may require an Apple Music subscription for full playback, but the embed itself always renders." };
    }
  };

  P.mastodon = {
    name: "Mastodon",
    icon: "fa-brands fa-mastodon",
    label: "Mastodon post URL",
    placeholder: "https://mastodon.social/@username/123456789012345678",
    hint: "Paste the post URL from any Mastodon instance.",
    embedType: "iframe",
    fields: [{ id: "height", label: "Height (px)", type: "number", value: 400, min: 160, max: 900 }],
    build: function (v) {
      var u = http(pick(v.url));
      var m = u.match(/^(https?:\/\/([^\/]+)\/(@[^\/]+)\/(\d+))/i);
      if (!m) return { error: "Paste a Mastodon post URL in the form https://instance/@user/123456." };
      var host = m[2];
      var user = m[3];
      var id = m[4];
      var h = num(v, "height", 400, 160, 900);
      var src = "https://" + host + "/" + user + "/" + id + "/embed";
      return { code: iframe(src, "100%", h, 'style="max-width:600px;border:0" allowfullscreen'), note: "The instance must allow embedding. Posts from instances with embeds disabled will not render." };
    }
  };

  /* ---------------------- news publisher link cards ---------------------- */

  function newsCardPlatform(o) {
    return {
      name: o.name,
      icon: o.icon,
      label: o.name + " article or video URL",
      placeholder: "https://" + o.placeholderDomain + "/...",
      hint: "Paste a public " + o.name + " article or video page URL. News publishers usually allow a branded link card rather than a framed copy of the page.",
      embedType: "branded link card",
      fields: [{ id: "width", label: "Max width (px)", type: "number", value: 600, min: 280, max: 1000 }],
      build: function (v) {
        var u = http(pick(v.url));
        if (!o.test.test(u)) return { error: "Paste a public " + o.name + " URL from " + o.domain + "." };
        var w = num(v, "width", 600, 280, 1000);
        var href = ea(u);
        var color = o.color;
        var code = '<div style="max-width:' + w + 'px;border:1px solid ' + color + ';border-radius:10px;overflow:hidden;background:#fff;font-family:system-ui,-apple-system,\'Segoe UI\',Roboto,sans-serif;">' +
          '<a href="' + href + '" target="_blank" rel="noopener" style="display:block;padding:16px;text-decoration:none;color:inherit;">' +
          '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">' +
          '<span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:' + color + ';color:#fff;font-size:12px;font-weight:800;letter-spacing:.4px;">' + ea(o.abbr) + '</span>' +
          '<span style="font-size:16px;font-weight:700;color:#111;">' + ea(o.name) + '</span></div>' +
          '<div style="font-size:14px;line-height:1.45;color:#555;">Click to read this story on ' + ea(o.name) + '.</div>' +
          '<div style="font-size:12px;line-height:1.4;color:#888;margin-top:8px;word-break:break-all;">' + href + '</div></a></div>';
        return { code: code, note: "This is a branded link card, not a framed copy of the article. Most news publishers block full-page iframes, so the card keeps attribution clear and the link reliable." };
      }
    };
  }

  [
    { key: "abc-news", name: "ABC News", domain: "abcnews.go.com", placeholderDomain: "abcnews.go.com", color: "#004ABC", abbr: "ABC", icon: "fa-solid fa-newspaper", test: /abcnews\.go\.com/i },
    { key: "bbc", name: "BBC", domain: "bbc.com or bbc.co.uk", placeholderDomain: "bbc.com", color: "#BB1919", abbr: "BBC", icon: "fa-solid fa-tower-broadcast", test: /bbc\.(com|co\.uk)/i },
    { key: "bloomberg", name: "Bloomberg", domain: "bloomberg.com", placeholderDomain: "bloomberg.com", color: "#000000", abbr: "B", icon: "fa-solid fa-chart-line", test: /bloomberg\.com/i },
    { key: "business-insider", name: "Business Insider", domain: "businessinsider.com", placeholderDomain: "businessinsider.com", color: "#185F7F", abbr: "BI", icon: "fa-solid fa-briefcase", test: /businessinsider\.com/i },
    { key: "buzzfeed", name: "BuzzFeed", domain: "buzzfeed.com", placeholderDomain: "buzzfeed.com", color: "#EE3322", abbr: "BF", icon: "fa-solid fa-bolt", test: /buzzfeed\.com/i },
    { key: "cbc", name: "CBC", domain: "cbc.ca", placeholderDomain: "cbc.ca", color: "#E60505", abbr: "CBC", icon: "fa-solid fa-tower-broadcast", test: /cbc\.ca/i },
    { key: "cbs-news", name: "CBS News", domain: "cbsnews.com", placeholderDomain: "cbsnews.com", color: "#003DA5", abbr: "CBS", icon: "fa-solid fa-circle-play", test: /cbsnews\.com/i },
    { key: "cnbc", name: "CNBC", domain: "cnbc.com", placeholderDomain: "cnbc.com", color: "#005594", abbr: "CNBC", icon: "fa-solid fa-chart-line", test: /cnbc\.com/i },
    { key: "cnn", name: "CNN", domain: "cnn.com", placeholderDomain: "cnn.com", color: "#CC0000", abbr: "CNN", icon: "fa-solid fa-tower-broadcast", test: /cnn\.com/i },
    { key: "fox-news", name: "Fox News", domain: "foxnews.com", placeholderDomain: "foxnews.com", color: "#AF1B24", abbr: "FOX", icon: "fa-solid fa-tower-broadcast", test: /foxnews\.com/i },
    { key: "global-news", name: "Global News", domain: "globalnews.ca", placeholderDomain: "globalnews.ca", color: "#E31837", abbr: "GN", icon: "fa-solid fa-globe", test: /globalnews\.ca/i },
    { key: "msnbc", name: "MSNBC", domain: "msnbc.com", placeholderDomain: "msnbc.com", color: "#003D7C", abbr: "MS", icon: "fa-solid fa-tower-broadcast", test: /msnbc\.com/i },
    { key: "nbc-news", name: "NBC News", domain: "nbcnews.com", placeholderDomain: "nbcnews.com", color: "#1A1A1A", abbr: "NBC", icon: "fa-solid fa-tower-broadcast", test: /nbcnews\.com/i },
    { key: "new-york-times", name: "New York Times", domain: "nytimes.com", placeholderDomain: "nytimes.com", color: "#000000", abbr: "NYT", icon: "fa-solid fa-newspaper", test: /nytimes\.com/i },
    { key: "npr", name: "NPR", domain: "npr.org", placeholderDomain: "npr.org", color: "#2C7DBB", abbr: "NPR", icon: "fa-solid fa-microphone-lines", test: /npr\.org/i },
    { key: "reuters", name: "Reuters", domain: "reuters.com", placeholderDomain: "reuters.com", color: "#FF8000", abbr: "R", icon: "fa-solid fa-globe", test: /reuters\.com/i },
    { key: "the-independent", name: "The Independent", domain: "independent.co.uk", placeholderDomain: "independent.co.uk", color: "#D10000", abbr: "IND", icon: "fa-solid fa-newspaper", test: /independent\.co\.uk/i },
    { key: "usa-today", name: "USA TODAY", domain: "usatoday.com", placeholderDomain: "usatoday.com", color: "#0099CC", abbr: "USA", icon: "fa-solid fa-newspaper", test: /usatoday\.com/i },
    { key: "washington-post", name: "Washington Post", domain: "washingtonpost.com", placeholderDomain: "washingtonpost.com", color: "#111111", abbr: "WP", icon: "fa-solid fa-landmark", test: /washingtonpost\.com/i },
    { key: "wall-street-journal", name: "Wall Street Journal", domain: "wsj.com", placeholderDomain: "wsj.com", color: "#000000", abbr: "WSJ", icon: "fa-solid fa-chart-line", test: /wsj\.com/i }
  ].forEach(function (o) { P[o.key] = newsCardPlatform(o); });

  window.EMBED_PLATFORMS = P;

  /* ------------------------------ UI ------------------------------ */

  function fieldHtml(f) {
    var id = "embed_" + f.id;
    var h = '<div class="field"><label for="' + id + '">' + ea(f.label) + "</label>";
    if (f.type === "select") {
      h += '<select id="' + id + '">' + (f.options || []).map(function (o) {
        return '<option value="' + ea(o[0]) + '"' + (String(o[0]) === String(f.value) ? " selected" : "") + ">" + ea(o[1]) + "</option>";
      }).join("") + "</select>";
    } else {
      h += '<input id="' + id + '" type="' + (f.type === "number" ? "number" : "text") + '" value="' + ea(f.value) +
        '"' + (f.min != null ? ' min="' + f.min + '"' : "") + (f.max != null ? ' max="' + f.max + '"' : "") +
        ' autocomplete="off" spellcheck="false">';
    }
    if (f.hint) h += '<span class="embed-hint">' + ea(f.hint) + "</span>";
    return h + "</div>";
  }

  function init() {
    var host = document.getElementById("embedTool");
    if (!host) return;
    var key = document.body.getAttribute("data-embed-platform");
    var cfg = P[key];
    if (!cfg) return;

    host.innerHTML =
      '<div class="embed-head"><span class="tool-label"><i class="' + cfg.icon + '"></i>' + ea(cfg.name) + ' embed code</span>' +
      '<button class="chip-btn" type="button" id="embedReset"><i class="fa-solid fa-rotate-left"></i><span class="hide-sm">Reset</span></button></div>' +
      '<div class="embed-fields"><div class="field embed-url"><label for="embedUrl">' + ea(cfg.label) + "</label>" +
      '<input id="embedUrl" type="text" autocomplete="off" spellcheck="false" placeholder="' + ea(cfg.placeholder) + '">' +
      '<span class="embed-hint">' + ea(cfg.hint) + "</span></div>" +
      (cfg.fields || []).map(fieldHtml).join("") + "</div>" +
      '<div class="actions"><button class="btn btn-primary" type="button" id="embedGenerate"><i class="fa-solid fa-code"></i>Generate embed code</button> ' +
      '<button class="btn btn-ghost" type="button" id="embedCopy" disabled><i class="fa-solid fa-copy"></i>Copy code</button></div>' +
      '<div class="embed-error" id="embedError" role="alert" hidden></div>' +
      '<div class="result-card" id="embedResult" hidden><div class="embed-result-head"><span>Embed code</span><span class="embed-lang">HTML</span></div>' +
      '<textarea id="embedCode" readonly spellcheck="false" aria-label="Generated embed code"></textarea>' +
      '<p class="embed-note" id="embedNote" hidden></p></div>' +
      '<div class="preview-card" id="embedPreview" hidden><div class="preview-label">Live preview</div>' +
      '<iframe id="embedFrame" title="Embed preview" loading="lazy" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" referrerpolicy="no-referrer"></iframe></div>' +
      '<p class="proc-line"><i class="fa-solid fa-bolt"></i><span id="embedProc">Ready - generation happens in this tab.</span></p>';

    var urlEl = document.getElementById("embedUrl");
    var errEl = document.getElementById("embedError");
    var resultEl = document.getElementById("embedResult");
    var copyEl = document.getElementById("embedCopy");
    var codeEl = document.getElementById("embedCode");
    var noteEl = document.getElementById("embedNote");
    var previewEl = document.getElementById("embedPreview");
    var frameEl = document.getElementById("embedFrame");
    var procEl = document.getElementById("embedProc");
    var lastCode = "";

    function collect() {
      var v = { url: urlEl.value };
      (cfg.fields || []).forEach(function (f) {
        var el = document.getElementById("embed_" + f.id);
        if (el) v[f.id] = el.value;
      });
      return v;
    }

    function generate() {
      if (!urlEl.value.trim()) {
        errEl.hidden = true;
        resultEl.hidden = true;
        previewEl.hidden = true;
        copyEl.disabled = true;
        lastCode = "";
        procEl.textContent = "Ready - paste a link to generate its embed code.";
        return;
      }
      var out = cfg.build(collect());
      if (out.error) {
        errEl.hidden = false;
        errEl.textContent = out.error;
        resultEl.hidden = true;
        previewEl.hidden = true;
        copyEl.disabled = true;
        lastCode = "";
        procEl.textContent = "Could not build the embed code - fix the value above.";
        return;
      }
      errEl.hidden = true;
      resultEl.hidden = false;
      previewEl.hidden = false;
      copyEl.disabled = false;
      codeEl.value = out.code;
      noteEl.hidden = !out.note;
      noteEl.textContent = out.note || "";
      procEl.textContent = "Generated in this tab - 0 bytes uploaded.";
      if (out.code !== lastCode) {
        lastCode = out.code;
        frameEl.srcdoc = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
          '<style>html,body{margin:0;padding:14px;background:#fff;color:#111;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}iframe,img,video{max-width:100%}p{font-size:13px;color:#555}</style></head><body>' +
          out.code + "</body></html>";
      }
    }

    function copy() {
      var text = codeEl.value;
      if (!text) return;
      function done() { procEl.textContent = "Copied the embed code - the bytes never left your device."; }
      function fallback() {
        codeEl.select();
        try { document.execCommand("copy"); done(); }
        catch (e) { procEl.textContent = "Select the code and copy it manually."; }
      }
      if (window.Troolify && window.Troolify.copyToClipboard) {
        window.Troolify.copyToClipboard(text, done);
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
    }

    function reset() {
      urlEl.value = "";
      (cfg.fields || []).forEach(function (f) {
        var el = document.getElementById("embed_" + f.id);
        if (el) el.value = f.value;
      });
      lastCode = "";
      generate();
      urlEl.focus();
    }

    document.getElementById("embedGenerate").addEventListener("click", generate);
    copyEl.addEventListener("click", copy);
    document.getElementById("embedReset").addEventListener("click", reset);
    urlEl.addEventListener("input", function () { if (urlEl.value.trim()) generate(); });
    urlEl.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); generate(); } });
    (cfg.fields || []).forEach(function (f) {
      var el = document.getElementById("embed_" + f.id);
      if (el) el.addEventListener("change", function () { if (urlEl.value.trim()) generate(); });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
