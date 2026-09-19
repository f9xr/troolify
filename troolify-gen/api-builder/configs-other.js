/* Image, Coding and Text-category API tool configs (5 tools). */
const AUTHOR = "Every Troolify tool is built and reviewed by the F9XR Development Team, then checked by our Review Board for correctness, accessibility and clarity. Most tools run 100% client-side with zero data retention; this one is powered by a public web API, which Troolify clearly discloses on the page.";

const IMG = { catFolder: "Image", catLabel: "Image Tools", folder: "image", icon: "fa-solid fa-image" };
const CODING = { catFolder: "Coding", catLabel: "Developer Tools", folder: "coding", icon: "fa-solid fa-code" };
const TEXT = { catFolder: "Text", catLabel: "Text Tools", folder: "text", icon: "fa-solid fa-font" };

module.exports = [
  Object.assign({}, IMG, {
    slug: "text-logo-generator",
    name: "Text Logo Generator",
    toolTitle: "Text Logo Generator | 9 Styles",
    desc: "Turn words into a bold PNG logo in 9 pre-set styles, rendered by a public web API - download it and use it straight away.",
    features: ["9 pre-set logo styles", "High-res PNG output", "One-click download"],
    startHint: "Enter text, pick a style and click Generate logo.",
    extraProviders: "",
    keywords: ["logo generator", "text logo", "logo maker", "png logo", "word logo", "name logo", "text to logo", "logo styles"],
    fields: '<div class="field"><label for="word">Brand / word to render</label><input type="text" id="word" maxlength="60" placeholder="e.g. Troolify"></div><div class="field"><label>Style</label><div class="chip-row" id="styleRow"><button class="chip active" type="button" data-t="neon">Neon</button><button class="chip" type="button" data-t="neonDream">Neon Dream</button><button class="chip" type="button" data-t="glitch">Glitch</button><button class="chip" type="button" data-t="gold">Gold</button><button class="chip" type="button" data-t="retroWave">Retro Wave</button><button class="chip" type="button" data-t="matrix">Matrix</button><button class="chip" type="button" data-t="cyberMask">Cyber Mask</button><button class="chip" type="button" data-t="leaves">Leaves</button><button class="chip" type="button" data-t="shadow">Shadow</button></div></div>',
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-pen-fancy"></i>Generate logo</button></div>',
    article: '<h2>Text Logo Generator</h2><p>The Text Logo Generator renders your word or brand name into a PNG logo using one of 9 stylised effects from a public web API: Neon, Neon Dream, Glitch, Gold, Retro Wave, Matrix, Cyber Mask, Leaves and Shadow.</p><h2>How to Use</h2><ol><li><strong>Type your word</strong> - a brand name or short phrase.</li><li><strong>Pick a style</strong> from the chips.</li><li><strong>Click Generate logo</strong> and Download PNG.</li></ol><h2>Tip</h2><p>Upload the PNG to <a href="remove-background.html">our background remover</a> for a clean, transparent marketing asset.</p>',
    faq: [{ q: "What styles are available?", a: "Nine: Neon, Neon Dream, Glitch, Gold, Retro Wave, Matrix, Cyber Mask, Leaves and Shadow - try a few to find your vibe." }, { q: "What format do I get?", a: "A PNG image you can download directly from your browser." }, { q: "Can I use the logo commercially?", a: "Use it as a starting point - the result is generated from text you supply and is free to use." }],
    conclusion: "A bold PNG logo from any word - powered by a public web API."
  }),

  Object.assign({}, IMG, {
    slug: "text-photo-gif-maker",
    name: "Text to Photo / GIF Maker",
    toolTitle: "Text to Photo / GIF Maker | TTP & Monte",
    desc: "Turn your message into a photo (TTP) or an animated GIF (Monte style) via a public web API - export it as a shareable image.",
    features: ["TTP photo generation", "Monte animated GIF", "Download your export"],
    startHint: "Enter text, pick a mode and click Generate.",
    extraProviders: "",
    keywords: ["text to gif", "text to photo", "gif maker", "text photo", "ttp", "monte", "animated text", "text generator"],
    fields: '<div class="field"><label for="txt">Text to display</label><input type="text" id="txt" maxlength="60" placeholder="e.g. Say it loud"></div><div class="field"><label>Mode</label><div class="chip-row" id="modeRow"><button class="chip active" type="button" data-t="ttp">Photo (TTP)</button><button class="chip" type="button" data-t="attp">GIF (Monte)</button></div></div>',
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-clapperboard"></i>Generate</button></div>',
    article: '<h2>Text to Photo / GIF Maker</h2><p>Turn a short message into a photo (TTP) or an animated Monte-style GIF using a public web API - then download it as a shareable file.</p><h2>How to Use</h2><ol><li><strong>Enter your text.</strong></li><li><strong>Choose Photo (TTP)</strong> for a static image or <strong>GIF (Monte)</strong> for an animated one.</li><li><strong>Click Generate</strong>, preview it, then Download.</li></ol><h2>Why It Matters</h2><p>Motion text out-performs static text in most feeds - this is the quickest way to produce a share-ready animated graphic without editing software.</p>',
    faq: [{ q: "What is the difference?", a: "TTP produces a static photo-style image; Monte produces an animated GIF with moving text." }, { q: "Can I increase the text size?", a: "Keep to a short phrase - the renderer works best with a word or a short slogan." }],
    conclusion: "Turn any message into a photo or GIF - powered by a public web API."
  }),

  Object.assign({}, CODING, {
    slug: "url-shortener",
    name: "URL Shortener",
    toolTitle: "URL Shortener | TinyURL & Bitly",
    desc: "Shorten any link with TinyURL or Bitly through a public web API - copy the short URL in one click.",
    features: ["TinyURL + Bitly options", "Instant short link", "One-click copy"],
    startHint: "Paste a link, pick a service and click Shorten.",
    extraProviders: " and to the shortening service you choose (TinyURL or Bitly)",
    keywords: ["url shortener", "shorten link", "tinyurl", "bitly", "short links", "link shortener", "short url", "compact link"],
    fields: '<div class="field"><label for="url">Long URL</label><input type="url" id="url" placeholder="https://example.com/very/long/link"></div><div class="field"><label for="svc">Service</label><select id="svc"><option value="tinyurl">TinyURL</option><option value="bitly">Bitly</option></select></div>',
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-link"></i>Shorten URL</button></div>',
    article: '<h2>URL Shortener</h2><p>The URL Shortener hands your link to TinyURL or Bitly through a public web API and returns a compact, shareable short URL.</p><h2>How to Use</h2><ol><li><strong>Paste your long URL.</strong></li><li><strong>Choose a service</strong> - TinyURL or Bitly.</li><li><strong>Click Shorten URL</strong> and copy the result.</li></ol><h2>Why It Matters</h2><p>Short links fit in messages, bios and printed materials - and both services are free, with no account needed on our side.</p>',
    faq: [{ q: "Is the URL stored?", a: "No. The link is forwarded to the shortening service (TinyURL/Bitly), which keeps a record for its own service; Troolify stores nothing." }, { q: "Why two services?", a: "Choice and resilience - if one service is down, the other usually still works." }, { q: "Is it free?", a: "Yes - both TinyURL and Bitly free tiers are used." }],
    conclusion: "Any long link, shortened instantly - powered by a public web API."
  }),

  Object.assign({}, CODING, {
    slug: "github-profile-viewer",
    name: "GitHub Profile Viewer",
    toolTitle: "GitHub Profile Viewer | Lookup Any User",
    desc: "Look up any GitHub username through a public web API - see avatar, bio, followers, repos and join date at a glance.",
    features: ["Profile info in one view", "Followers, repos & join date", "Quick GitHub visit link"],
    startHint: "Enter a GitHub username and click Look up.",
    extraProviders: " (profile data is fetched from the GitHub API)",
    keywords: ["github profile", "github viewer", "github user", "profile lookup", "github stats", "github lookup", "developer profile", "github search"],
    fields: '<div class="field"><label for="user">GitHub username</label><input type="text" id="user" placeholder="e.g. f9xr"></div>',
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-user"></i>Look up profile</button></div>',
    article: '<h2>GitHub Profile Viewer</h2><p>The GitHub Profile Viewer fetches a user\u2019s public profile through a public web API that wraps the GitHub API - avatar, bio, name, followers, following, public repos and join date in a single glance.</p><h2>How to Use</h2><ol><li><strong>Enter a GitHub username.</strong></li><li><strong>Click Look up profile</strong> - the cards fill in.</li><li><strong>Click Visit GitHub</strong> to open the real profile.</li></ol><h2>Why It Matters</h2><p>Quick due diligence: screen a hire, check a project\u2019s maintainer, or settle a trivia bet on repo counts - all without a GitHub visit.</p>',
    faq: [{ q: "What if the user is private or does not exist?", a: "The API returns an error message and we show it inline - retire behind a valid username and try again." }, { q: "Does it post to GitHub?", a: "No - it only reads public profile data." }],
    conclusion: "Any GitHub profile, summarized - powered by a public web API."
  }),

  Object.assign({}, TEXT, {
    slug: "text-to-speech",
    name: "Text to Speech",
    toolTitle: "Text to Speech | Read Aloud",
    desc: "Listen to any text read aloud with natural Google voices via a public web API - play online or download as an audio file.",
    features: ["Natural Google voices", "Playback right on the page", "MP3 download"],
    startHint: "Type or paste text and click Speak.",
    extraProviders: " and to Google Translate\u2019s text-to-speech engine",
    keywords: ["text to speech", "tts", "read aloud", "audio generator", "text reader", "voice generator", "mp3 text", "speak text"],
    fields: '<div class="field"><label for="ttsText">Text to speak</label><textarea id="ttsText" placeholder="Type or paste the text you want spoken&hellip;"></textarea></div>',
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-volume-high"></i>Speak</button></div>',
    article: '<h2>Text to Speech</h2><p>The Text to Speech tool turns your text into spoken audio using Google Translate\u2019s TTS engine through a public web API. Play the speech instantly or download it as an audio file.</p><h2>How to Use</h2><ol><li><strong>Type or paste your text.</strong></li><li><strong>Click Speak</strong> - the audio plays in place.</li><li><strong>Click Download</strong> to save it for later.</li></ol><h2>Tip</h2><p>Keep your text under a few hundred characters for the most natural pacing - review the length of an article to give it a full read-aloud test.</p>',
    faq: [{ q: "Is the text sent anywhere?", a: "Yes - your text is sent to the API provider and on to Google Translate\u2019s TTS engine to synthesise audio. Nothing is stored by Troolify." }, { q: "Can I download the audio?", a: "Yes - the Download button saves the MP3-style audio to your device." }, { q: "Does it work offline?", a: "No - this tool needs a live connection to synthesize speech." }],
    conclusion: "Any text, spoken aloud - powered by a public web API."
  })
];