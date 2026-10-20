/* Fun-category API tool configs (8 tools). */
const AUTHOR = "Every Troolify tool is built and reviewed by the F9XR Development Team, then checked by our Review Board for correctness, accessibility and clarity. Most tools run 100% client-side with zero data retention; this one is powered by a public web API, which Troolify clearly discloses on the page.";

const FUN = {
  catFolder: "Fun",
  catLabel: "Fun & Games",
  folder: "fun",
  icon: "fa-solid fa-face-smile"
};

module.exports = [
  Object.assign({}, FUN, {
    slug: "random-quote-generator",
    name: "Quote Generator",
    toolTitle: "Quote Generator | Inspirational Quotes",
    desc: "Get an inspirational quote from a public web API - refresh for a new one, copy it, and share it anywhere.",
    features: ["Inspirational quotes", "One-click refresh", "Copy to clipboard"],
    startHint: "Click Get a quote to fetch an inspirational quote from the web API.",
    extraProviders: "",
    keywords: ["quotes", "inspirational quotes", "quote generator", "motivational quotes", "famous quotes", "wisdom", "inspiration", "daily quote"],
    fields: "",
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-quote-right"></i>Get a quote</button></div>',
    article: '<h2>Quote Generator</h2><p>The Quote Generator pulls a random inspirational quote and its author from a public web API. Each click fetches a fresh quote, ready to copy into a bio, a newsletter or a morning post.</p><h2>How to Use</h2><ol><li><strong>Click Get a quote</strong> - the API returns a random quote and author.</li><li><strong>Read or copy it</strong> with the Copy button.</li><li><strong>Refresh</strong> for a different quote whenever you like.</li></ol><h2>Why It Matters</h2><p>Fresh, real quotes from thousands of sources beat a static list - every visit can surface something new, with no sign-up and nothing installed.</p>',
    faq: [{ q: "Is the quote data stored anywhere?", a: "No. Troolify does not store anything - the quote is fetched live from the API and shown on your screen only." }, { q: "Can I use the quotes commercially?", a: "Quotes are provided as-is and may be attributed to their authors; always check rights before commercial use." }],
    conclusion: "Fetch a fresh, shareable quote in one click - powered by a public web API."
  }),

  Object.assign({}, FUN, {
    slug: "random-facts-generator",
    name: "Random Fact Generator",
    toolTitle: "Random Fact Generator | Fun Facts",
    desc: "Discover a random fun fact from a public web API - learn something new, copy it and surprise your friends.",
    features: ["Random fun facts", "One-click refresh", "Copy to clipboard"],
    startHint: "Click Get a fact to fetch a random fact from the web API.",
    extraProviders: "",
    keywords: ["random facts", "fun facts", "fact generator", "did you know", "trivia", "interesting facts", "random fact", "learn something new"],
    fields: "",
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-lightbulb"></i>Get a fact</button></div>',
    article: '<h2>Random Fact Generator</h2><p>The Random Fact Generator fetches a random fun fact from a public web API. Great for ice-breakers, trivia nights and curious breaks.</p><h2>How to Use</h2><ol><li><strong>Click Get a fact</strong> - a random fact appears.</li><li><strong>Copy it</strong> to share or save.</li><li><strong>Hit Get another</strong> for the next fact.</li></ol><h2>Why It Matters</h2><p>Randomised content stays fresh across visits - there is always a new "did you know" waiting, with no accounts or setup required.</p>',
    faq: [{ q: "Are the facts verified?", a: "Facts are sourced as-is from the API provider. We recommend a quick check before using them in homework or paid work." }, { q: "How many facts are there?", a: "The API draws from a large rotating list, so repeated visits usually deliver something new." }],
    conclusion: "Learn a new fact in one click - powered by a public web API."
  }),

  Object.assign({}, FUN, {
    slug: "joke-generator",
    name: "Joke Generator",
    toolTitle: "Joke Generator | One-Liners & Jokes",
    desc: "Generate developer, general or dark one-liner jokes from a public web API - reveal the punchline and copy it.",
    features: ["Developer / general / dark jokes", "Setup & punchline reveal", "Copy to clipboard"],
    startHint: "Pick a style and click Get a joke.",
    extraProviders: "",
    keywords: ["jokes", "joke generator", "developer jokes", "programming jokes", "funny jokes", "one-liner", "clean jokes", "dad jokes"],
    fields: '<div class="field"><label for="jtype">Joke style</label><select id="jtype"><option value="jdev">Developer</option><option value="jgeneral">General</option><option value="jdark">Dark</option></select></div>',
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-face-laugh-squint"></i>Get a joke</button></div>',
    article: '<h2>Joke Generator</h2><p>The Joke Generator pulls a setup-and-punchline joke from a public web API in three styles: developer, general and dark. Reveal the punchline on your own time, then copy the whole joke.</p><h2>How to Use</h2><ol><li><strong>Choose a style</strong> - Developer, General or Dark.</li><li><strong>Click Get a joke</strong> - the setup appears.</li><li><strong>Click Show punchline</strong> to reveal the ending, or Copy for the full joke.</li></ol><h2>Why It Matters</h2><p>A rotating source keeps the comedy fresh - pick the tone that fits your audience, from stand-up prep to a dev-team Slack channel.</p>',
    faq: [{ q: "Are the jokes clean?", a: "General jokes are usually safe for work. Dark jokes can be edgy - choose that style with your audience in mind." }, { q: "Can I copy the joke?", a: "Yes - the Copy button copies the setup and punchline together." }],
    conclusion: "A fresh joke in three styles - powered by a public web API."
  }),

  Object.assign({}, FUN, {
    slug: "roast-generator",
    name: "Roast Generator",
    toolTitle: "Roast Generator | Playful Burns",
    desc: "Get a playful roast from a public web API - perfect for playful banter. Refresh to fire back with a new burn.",
    features: ["Random roasts", "One-click refresh", "Copy to clipboard"],
    startHint: "Click Roast me for a playful burn.",
    extraProviders: "",
    keywords: ["roast", "roast generator", "roast me", "playful roast", "comebacks", "banter", "burn", "funny roasts"],
    fields: "",
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-fire"></i>Roast me</button></div>',
    article: '<h2>Roast Generator</h2><p>The Roast Generator returns a playful, over-the-top burn from a public web API. Use it for friendly banter between friends - never as a genuine put-down.</p><h2>How to Use</h2><ol><li><strong>Click Roast me</strong> - a roast appears.</li><li><strong>Read it aloud</strong> or copy it for a group chat.</li><li><strong>Click again</strong> for a fresh burn.</li></ol><h2>Why It Matters</h2><p>Roasting is a craft - a bottomless source of one-liners keeps the banter flowing without repeating yourself.</p>',
    faq: [{ q: "Are these roasts mean-spirited?", a: "The roasts are intended as playful banter. If anything lands poorly, please keep it to safe audiences or skip the tool." }, { q: "Can I edit the roast?", a: "Yes - copy the roast and tweak it before you use it." }],
    conclusion: "A playful burn in one click - powered by a public web API."
  }),

  Object.assign({}, FUN, {
    slug: "random-meme-generator",
    name: "Random Meme Finder",
    toolTitle: "Random Meme Finder | Fresh Memes",
    desc: "Find a random meme from Reddit's most popular meme subreddits via a public web API - preview the image and open the original post.",
    features: ["Fresh memes from Reddit", "Title, votes & subreddit", "Link to the original post"],
    startHint: "Click Find a meme to load a fresh one.",
    extraProviders: " (the meme images themselves are hosted by Reddit)",
    keywords: ["memes", "meme generator", "random meme", "dank memes", "funny images", "meme finder", "reddit memes", "fresh memes"],
    fields: '<div class="opt-row"><label class="opt-chk" for="nsfw"><input type="checkbox" id="nsfw"><span class="opt-ui"></span>Allow NSFW memes</label></div>',
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-image"></i>Find a meme</button></div>',
    article: '<h2>Random Meme Finder</h2><p>The Random Meme Finder pulls a meme from Reddit\u2019s most popular meme subreddits through a public web API. You get the image, title, subreddit, up-votes and a direct link to the original post.</p><h2>How to Use</h2><ol><li><strong>Optionally allow NSFW</strong> memes (off by default).</li><li><strong>Click Find a meme</strong> - the image loads with its details.</li><li><strong>Click the post link</strong> to open it on Reddit.</li></ol><h2>Why It Matters</h2><p>Memes are inherently community-driven - pulling live from real subreddits means genuinely fresh content, not a stale archive.</p>',
    faq: [{ q: "Where do the memes come from?", a: "Images are served from Reddit via a public API. Content is community-made and can vary - the NSFW filter is on by default to keep things tame." }, { q: "Can I download the meme?", a: "You can open the image and the original post from the result; save it from the browser as you would any image." }],
    conclusion: "Fresh memes from real subreddits in one click - powered by a public web API."
  }),

  Object.assign({}, FUN, {
    slug: "riddle-generator",
    name: "Riddle Generator",
    toolTitle: "Riddle Generator | Brain Teasers",
    desc: "Get a riddle from a public web API - guess the answer, then reveal it. A brain teaser for games, study breaks and family fun.",
    features: ["Random riddles", "Show-answer reveal", "Copy to clipboard"],
    startHint: "Click Get a riddle, guess, then reveal the answer.",
    extraProviders: "",
    keywords: ["riddles", "riddle generator", "brain teasers", "riddle and answer", "puzzles", "logic riddles", "riddle me this", "brain games"],
    fields: "",
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-brain"></i>Get a riddle</button></div>',
    article: '<h2>Riddle Generator</h2><p>The Riddle Generator fetches a riddle from a public web API, shows you the question and hides the answer until you are ready. Great for classroom games, quiz nights and mental breaks.</p><h2>How to Use</h2><ol><li><strong>Click Get a riddle</strong> - the question appears.</li><li><strong>Guess the answer</strong> with friends or on your own.</li><li><strong>Click Show answer</strong> to reveal it, or Copy the riddle.</li></ol><h2>Why It Matters</h2><p>Riddles stretch vocabulary and lateral thinking - a fresh one each time keeps the game going without running out of material.</p>',
    faq: [{ q: "Can I see the answer first?", a: "Yes - the Show answer button reveals it any time you want." }, { q: "Are the riddles suitable for kids?", a: "Mostly, though we recommend previewing one yourself first for very young audiences." }],
    conclusion: "A brain teaser with a hidden answer - powered by a public web API."
  }),

  Object.assign({}, FUN, {
    slug: "truth-or-dare-generator",
    name: "Truth or Dare Generator",
    toolTitle: "Truth or Dare Generator | Party Prompts",
    desc: "Generate truth questions or dares from a public web API - pick Truth, Dare or a random mix for game night.",
    features: ["Truth prompts", "Dare prompts", "Random mode & copy"],
    startHint: "Pick a mode and click Generate.",
    extraProviders: "",
    keywords: ["truth or dare", "truth or dare generator", "party games", "truth questions", "dares", "game night", "truth or dare questions", "party prompts"],
    fields: '<div class="field"><label for="mode">Mode</label><select id="mode"><option value="random">Random</option><option value="truth">Truth</option><option value="dare">Dare</option></select></div>',
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-dice"></i>Generate</button></div>',
    article: '<h2>Truth or Dare Generator</h2><p>The Truth or Dare Generator pulls a prompt from a public web API in Truth, Dare or Random mode - ready for a classic game night with friends.</p><h2>How to Use</h2><ol><li><strong>Choose a mode</strong> - Truth, Dare or Random.</li><li><strong>Click Generate</strong> - a prompt appears.</li><li><strong>Copy it</strong> or click again for the next player.</li></ol><h2>Why It Matters</h2><p>Fresh prompts keep the game moving when imagination runs dry - perfect for parties, sleepovers and team socials.</p>',
    faq: [{ q: "Are the dares family-friendly?", a: "Prompts are served as-is from the API provider. Filter with judgement depending on who is playing." }, { q: "Can I skip a prompt?", a: "Yes - just click Generate again for a fresh one." }],
    conclusion: "Game-night prompts on demand - powered by a public web API."
  }),

  Object.assign({}, FUN, {
    slug: "anime-image-generator",
    name: "Anime Image Finder",
    toolTitle: "Anime Image Finder | Random Anime Art",
    desc: "Find a random anime image from a public web API - pick a character, get a fresh picture and open the full version.",
    features: ["Multiple character themes", "Random fresh image each click", "Open full-size source"],
    startHint: "Pick a theme and click Get image.",
    extraProviders: " (artwork is hosted by third-party image hosts)",
    keywords: ["anime", "anime images", "anime art", "anime picture", "waifu", "random anime", "anime wallpaper", "anime generator"],
    fields: '<div class="field"><label>Theme</label><div class="chip-row" id="themeRow"><button class="chip active" type="button" data-t="waifu">Waifu</button><button class="chip" type="button" data-t="miku">Miku</button><button class="chip" type="button" data-t="naruto">Naruto</button><button class="chip" type="button" data-t="nezuko">Nezuko</button><button class="chip" type="button" data-t="itachi">Itachi</button><button class="chip" type="button" data-t="itori">Itori</button><button class="chip" type="button" data-t="astatus">Astatus</button><button class="chip" type="button" data-t="couplepp">Couple</button></div></div>',
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-tv"></i>Get image</button></div>',
    article: '<h2>Anime Image Finder</h2><p>The Anime Image Finder pulls a random anime artwork from a public web API. Choose a character theme, get an image or short clip, and open the full-size version on its host.</p><h2>How to Use</h2><ol><li><strong>Pick a theme</strong> - Waifu, Miku, Naruto, Nezuko, Itachi, Itori, Astatus or Couple.</li><li><strong>Click Get image</strong> - a random artwork loads.</li><li><strong>Click Open full size</strong> to view or save it.</li></ol><h2>Why It Matters</h2><p>It is a fast, fun way to find anime art and wallpapers for inspiration or personal use - with a fresh result on every request.</p>',
    faq: [{ q: "Who made the images?", a: "Artwork is community fan art served through the API from third-party hosts - not owned by Troolify. Use it for personal inspiration." }, { q: "Can I use the images commercially?", a: "No - check with the original artist first. Fan art is for personal use only." }, { q: "Why is the Couple result two images?", a: "Couple returns a matching male + female pairing, shown side by side." }],
    conclusion: "Fresh anime art on demand - powered by a public web API."
  }),

  Object.assign({}, FUN, {
    slug: "free-games-giveaways",
    name: "Free Games & Giveaways Finder",
    toolTitle: "Free Games & Giveaways Finder | Live Game Giveaways",
    desc: "Find live free games, beta keys and in-game loot from GamerPower giveaways - filter by platform and type, sort by value, then claim in one click.",
    icon: "fa-solid fa-gamepad",
    features: ["Live game, loot & beta giveaways", "Filter by platform & type", "Sort by date, value or popularity", "Total worth estimation"],
    startHint: "Pick your filters and click Find giveaways.",
    pubDate: "2026-10-20",
    authorNote: AUTHOR,
    privacyNote: '<b>Privacy note:</b> this tool is powered by the free GamerPower API (www.gamerpower.com). Only the filter choices you select are sent there to fetch the live listings - Troolify stores nothing, but data does leave your device.',
    keywords: ["free games", "free game keys", "game giveaways", "free steam games", "free epic games", "beta keys", "free dlc", "in game loot", "giveaway tracker", "free pc games"],
    fields:
      '<style>' +
      '.gw-card{display:flex;gap:14px;background:#1B2028;border:1px solid var(--border);border-radius:14px;padding:14px;margin-top:12px;align-items:flex-start}' +
      '.gw-thumb{width:120px;height:68px;object-fit:cover;border-radius:10px;border:1px solid var(--border);flex-shrink:0;background:#12161c}' +
      '.gw-body{flex:1;min-width:0}' +
      '.gw-title{font-size:15.5px;font-weight:800;color:var(--ink);line-height:1.35}' +
      '.gw-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}' +
      '.gw-chip{border:1px solid var(--border);background:rgba(255,255,255,.03);color:var(--muted);border-radius:999px;padding:4px 10px;font-size:11.5px;font-weight:700}' +
      '.gw-chip.worth{color:#FCD34D;border-color:rgba(252,211,77,.35);background:rgba(252,211,77,.08)}' +
      '.gw-chip.kind{color:#93C5FD;border-color:rgba(96,165,250,.35);background:rgba(59,130,246,.1)}' +
      '.gw-sub{font-size:12px;color:var(--faint);font-weight:600;margin-top:7px;display:flex;flex-wrap:wrap;gap:4px 14px}' +
      '.gw-sub i{color:#60A5FA;margin-right:5px}' +
      '.gw-how{margin-top:10px;font-size:12.5px;color:var(--muted);line-height:1.55}' +
      '.gw-how summary{cursor:pointer;font-weight:700;color:#93C5FD}' +
      '.gw-how p{margin:8px 0 0}' +
      '.gw-claim{background:rgba(59,130,246,.16);border:1px solid rgba(96,165,250,.55);color:#93C5FD}' +
      '.gw-sum{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;background:linear-gradient(180deg,rgba(59,130,246,.14),rgba(59,130,246,.04));border:1px solid rgba(96,165,250,.3);border-radius:14px;padding:14px 16px}' +
      '.gw-sum b{color:#93C5FD}' +
      '.gw-count{font-size:15px;font-weight:800;color:var(--ink)}' +
      '.gw-attr{font-size:11.5px;color:var(--faint);font-weight:700}' +
      '.gw-attr a{color:#93C5FD}' +
      '@media(max-width:560px){.gw-card{flex-direction:column}.gw-thumb{width:100%;height:auto;aspect-ratio:16/9}}' +
      '</style>' +
      '<div class="row3">' +
      '<div class="field"><label for="plat">Platform</label><select id="plat"><option value="">All platforms</option><option value="pc">PC</option><option value="steam">Steam</option><option value="epic-games-store">Epic Games Store</option><option value="gog">GOG</option><option value="ps4">PlayStation 4</option><option value="ps5">PlayStation 5</option><option value="xbox-series-xs">Xbox Series X/S</option><option value="xbox-one">Xbox One</option><option value="switch">Nintendo Switch</option><option value="android">Android</option><option value="ios">iOS</option><option value="drm-free">DRM-Free</option><option value="itchio">itch.io</option></select></div>' +
      '<div class="field"><label for="gtype">Giveaway type</label><select id="gtype"><option value="">All types</option><option value="game">Full games</option><option value="loot">In-game loot &amp; DLC</option><option value="beta">Beta &amp; playtests</option></select></div>' +
      '<div class="field"><label for="sortby">Sort by</label><select id="sortby"><option value="date">Newest first</option><option value="value">Highest value first</option><option value="popularity">Most popular</option></select></div>' +
      '</div>' +
      '<div class="field" style="margin-top:12px"><label for="kw">Keyword filter (optional)</label><input type="text" id="kw" maxlength="60" placeholder="e.g. RPG, co-op, strategy"></div>',
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-gamepad"></i>Find giveaways</button></div>',
    article: '<h2>Free Games &amp; Giveaways Finder</h2><p>The Free Games &amp; Giveaways Finder pulls every active giveaway tracked by <a href="https://www.gamerpower.com/" target="_blank" rel="noopener">GamerPower</a> - free games, beta keys and in-game loot - into one live, filterable list. No API key and no sign-up: choose a platform, choose a type, and click Find giveaways.</p><h2>How to Use</h2><ol><li><strong>Choose a platform</strong> - PC, Steam, Epic Games Store, GOG, PlayStation, Xbox, Switch, Android, iOS, DRM-Free or itch.io, or leave it on All platforms.</li><li><strong>Choose a type and a sort order</strong> - full games, in-game loot or beta keys; newest first, highest value first or most popular first.</li><li><strong>Click Find giveaways</strong> - the live list appears with thumbnail, worth, platform tags, claim counts and end dates.</li><li><strong>Open How to claim</strong> for the exact steps, then hit Claim giveaway to jump to the offer page.</li></ol><h2>Why It Matters</h2><p>Good giveaways vanish within hours and are scattered across a dozen stores. One filtered, refreshed feed means you spot the active offers in time - and the worth estimation at the top shows what the current pool is actually worth.</p>',
    faq: [
      { q: "Is this really free to use?", a: "Yes - the GamerPower API is free and needs no API key, and Troolify charges nothing. The giveaway hosts themselves may still require their own free account to hand over a key." },
      { q: "Where do the giveaways come from?", a: "Every listing comes from GamerPower, a giveaway tracker covering free games, beta keys and in-game loot across stores and platforms. Attribution and a link to GamerPower are shown with every result." },
      { q: "Why do offers disappear quickly?", a: "Giveaways end by key count or by date, and the pool changes constantly. Sort by newest and refresh often - every search fetches live data straight from the API." },
      { q: "Does it work on mobile?", a: "Yes - the tool is responsive and runs in any modern browser, with nothing to install." }
    ],
    conclusion: "Every active free game, beta key and loot drop in one filtered live list - powered by the free GamerPower API."
  }),

  Object.assign({}, FUN, {
    slug: "banana-for-scale",
    name: "Banana for Scale Converter",
    toolTitle: "Banana for Scale Converter | Bananas, Smoots & Buses",
    desc: "Convert any measurement into bananas, smoots, double-decker buses and other units nobody asked for - with the real unit basis shown.",
    icon: "fa-solid fa-scale-balanced",
    features: ["70+ real & silly units", "Live conversions via public API", "One-click unit swap", "Basis & source for every silly unit"],
    startHint: "Enter a value, pick your units and click Convert.",
    pubDate: "2026-10-20",
    authorNote: AUTHOR,
    privacyNote: '<b>Privacy note:</b> this tool is powered by the free public API hub api.tasta.space. Only the value and unit IDs you choose are sent there to compute the conversion - Troolify stores nothing, but data does leave your device. The hub allows 30 requests per minute per visitor.',
    keywords: ["banana for scale", "convert to bananas", "banana converter", "smoot converter", "silly unit converter", "double decker bus converter", "fun units", "unusual units", "how many bananas", "banana measurement"],
    fields:
      '<style>' +
      '.bn-hero{font-size:27px;font-weight:800;color:#6EE7B7;text-align:center;padding:4px 0 2px}' +
      '.bn-sent{text-align:center;color:var(--muted);font-weight:600;font-size:14.5px;line-height:1.5}' +
      '.bn-note{font-size:12.5px;color:var(--faint);line-height:1.55;margin-top:10px}' +
      '.bn-note b{color:var(--muted)}' +
      '.bn-note a{color:#93C5FD}' +
      '</style>' +
      '<div class="row3">' +
      '<div class="field"><label for="val">Value</label><input type="number" id="val" step="any" value="1" placeholder="e.g. 330"></div>' +
      '<div class="field"><label for="from">From unit</label><select id="from"><option value="m">metre (m)</option></select></div>' +
      '<div class="field"><label for="to">To unit</label><select id="to"><option value="banana">banana (ban)</option></select></div>' +
      '</div>',
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-scale-balanced"></i>Convert</button><button class="rt-btn" type="button" id="swapBtn"><i class="fa-solid fa-right-left"></i>Swap units</button></div>',
    article: '<h2>Banana for Scale Converter</h2><p>The Banana for Scale Converter answers the internet\'s favourite measuring question: how many bananas is that? It loads the full unit catalogue from the free <a href="https://api.tasta.space/banana-for-scale" target="_blank" rel="noopener">Tasta Space</a> hub - real SI-derived units alongside smoots, double-decker buses, football pitches, Olympic pools, warhols and floppy disks - and converts between any pair of them.</p><h2>How to Use</h2><ol><li><strong>Type a value</strong> - any number, decimals welcome.</li><li><strong>Pick the from and to units</strong> - the selects group units by dimension (length, area, volume, time, mass, data); changing one side to a new dimension automatically re-targets the other.</li><li><strong>Click Convert</strong> - the result appears as a big number, a ready-made sentence, and the documented basis of each silly unit with its source.</li><li><strong>Swap units</strong> to flip the direction instantly.</li></ol><h2>Why It Matters</h2><p>Silly units only work when their basis is honest. Every comedic unit here carries its real definition - the 18 cm USDA medium banana, Oliver Smoot\'s 1.7018 m height, the 8.4 m Routemaster bus - so the joke still measures something.</p>',
    faq: [
      { q: "Where do the units come from?", a: "The unit catalogue is fetched live from the Tasta Space hub: 70+ units across length, area, volume, time, mass and data, each with its SI factor and, for the silly ones, a documented basis and source link." },
      { q: "How accurate are the silly units?", a: "As accurate as their definitions allow - real units use exact SI conversion factors, and each silly unit states its reference (for example a medium banana at 18 cm) right next to the result." },
      { q: "Can I use this for serious work?", a: "You can, but your accountant may object - the conversions are mathematically correct, yet bananas remain a questionable unit of accountancy." },
      { q: "Is it free and private?", a: "Yes - no API key, no sign-up, no storage on Troolify. The value and units you pick are sent to the free public API to compute the answer." }
    ],
    conclusion: "Bananas, smoots and Routemasters as honest units of measure - powered by the free Tasta Space API."
  }),

  Object.assign({}, FUN, {
    slug: "moon-phase-checker",
    name: "Moon Phase Checker",
    toolTitle: "Moon Phase Checker | Tonight\'s Moon & Calendar",
    desc: "See the Moon for any date - phase name, live drawing, illumination, age, distance and the next new and full moons.",
    icon: "fa-solid fa-moon",
    features: ["Any date & hemisphere", "Live phase drawing", "Illumination, age & distance", "Next four phase dates"],
    startHint: "Pick a date (today by default) and click Check the Moon.",
    pubDate: "2026-10-20",
    authorNote: AUTHOR,
    privacyNote: '<b>Privacy note:</b> this tool is powered by the free public API hub api.tasta.space. Only the date and hemisphere you pick are sent there to compute the phase - Troolify stores nothing, but data does leave your device. The hub allows 30 requests per minute per visitor.',
    keywords: ["moon phase", "moon phase today", "lunar phase", "full moon date", "new moon calendar", "moon illumination", "waxing gibbous", "moon calendar", "tonight moon", "lunar cycle"],
    fields:
      '<style>.bn-hero{font-size:23px;font-weight:800;color:#6EE7B7;text-align:center;padding:4px 0 2px;line-height:1.35}</style>' +
      '<div class="row2">' +
      '<div class="field"><label for="date">Date</label><input type="date" id="date"></div>' +
      '<div class="field"><label for="hemi">Hemisphere</label><select id="hemi"><option value="north">Northern</option><option value="south">Southern</option></select></div>' +
      '</div>',
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-moon"></i>Check the Moon</button><button class="rt-btn" type="button" id="todayBtn"><i class="fa-solid fa-calendar-day"></i>Today</button></div>',
    article: '<h2>Moon Phase Checker</h2><p>The Moon Phase Checker computes the lunar phase for any date using the <a href="https://api.tasta.space/moon" target="_blank" rel="noopener">Tasta Space</a> hub, which follows Jean Meeus\' Astronomical Algorithms. Alongside the phase name it draws the exact lit shape, gives the illumination percentage, the Moon\'s age in the current cycle, its distance, and the dates of the next new, first-quarter, full and last-quarter moons. The tool loads tonight\'s Moon as soon as you open the page.</p><h2>How to Use</h2><ol><li><strong>Pick a date</strong> - defaults to today; Today jumps back to now.</li><li><strong>Choose a hemisphere</strong> - waxing and waning are mirrored between north and south, and so is the drawing.</li><li><strong>Click Check the Moon</strong> - the phase drawing, stats and next phase dates appear together.</li></ol><h2>Why It Matters</h2><p>Photographers, gardeners, anglers and night-shift walkers all plan around the Moon. One glance tells you whether tonight is bright enough to walk without a lamp - or dark enough for deep-sky observing.</p>',
    faq: [
      { q: "How accurate is the phase?", a: "The hub computes phases with the Meeus algorithms (chapters 47 to 49), accurate to well under a minute for phase times - far finer than the daily view shown here." },
      { q: "Why does the hemisphere matter?", a: "From the southern hemisphere the Moon is flipped: a waxing gibbous that leans right in the north leans left in the south. Switch hemispheres to match what you actually see overhead." },
      { q: "What are full moon names?", a: "Folklore names such as Harvest Moon or Wolf Moon are shown when the chosen date is close to a full moon and the hub knows the name for that lunation." },
      { q: "What do Blue moon and Supermoon mean?", a: "A Blue moon is the second full moon in a calendar month; a Supermoon is a full moon near perigee, when the disc appears slightly larger and brighter. Both flags appear on the result when they apply." }
    ],
    conclusion: "Every phase, every date, drawn exactly - powered by the free Tasta Space API."
  }),

  Object.assign({}, FUN, {
    slug: "fake-country-generator",
    name: "Fake Country Generator",
    toolTitle: "Fake Country Generator | Flags, Maps & Mottoes",
    desc: "Invent a country that does not exist - flag, map, capital, currency, motto and national dish - all generated from a seed.",
    icon: "fa-solid fa-flag",
    features: ["Generated flag & map art", "Currency, motto & national dish", "Shareable seed permalink"],
    startHint: "Click Generate a country to invent one (or type a seed first).",
    pubDate: "2026-10-20",
    authorNote: AUTHOR,
    privacyNote: '<b>Privacy note:</b> this tool is powered by the free public API hub api.tasta.space. Only the optional seed text you type is sent there to generate the country - Troolify stores nothing, but data does leave your device. The hub allows 30 requests per minute per visitor.',
    keywords: ["fake country generator", "fictional country", "country name generator", "flag generator", "imaginary nation", "worldbuilding tool", "fake nation maker", "country generator", "invent a country", "motto generator"],
    fields:
      '<style>' +
      '.fc-name{font-size:23px;font-weight:800;color:var(--ink);line-height:1.25}' +
      '.fc-official{font-size:13.5px;color:var(--muted);font-weight:600;margin-top:2px}' +
      '.fc-flag{max-width:210px;width:100%;border-radius:10px;border:1px solid var(--border);display:block}' +
      '.fc-motto{font-style:italic;font-size:16px;font-weight:700;color:#93C5FD;text-align:center;padding:8px 4px}' +
      '.fc-motto span{display:block;font-style:normal;font-size:12.5px;color:var(--faint);font-weight:600;margin-top:4px}' +
      '@media(max-width:560px){.fc-two{grid-template-columns:1fr}}' +
      '.fc-two{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:start}' +
      '</style>' +
      '<div class="field"><label for="seed">Seed (optional)</label><input type="text" id="seed" maxlength="40" placeholder="any text - the same seed always builds the same country"></div>',
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-flag"></i>Generate a country</button></div>',
    article: '<h2>Fake Country Generator</h2><p>The Fake Country Generator invents a nation that never existed, complete with a procedurally drawn flag, a map silhouette, a capital, a currency with exchange rates, a motto in Latin with its translation, and a national dish worth pretending to visit. Everything comes from the free <a href="https://api.tasta.space/countries" target="_blank" rel="noopener">Tasta Space</a> hub, which filters real country names out so the results stay fictional.</p><h2>How to Use</h2><ol><li><strong>Optionally type a seed</strong> - any short text; the same seed always rebuilds the same country, so a story bible stays consistent. Leave it blank for a surprise.</li><li><strong>Click Generate a country</strong> - the flag, stats, currency and culture appear instantly.</li><li><strong>Copy the permalink</strong> to share or revisit this exact country, or open the PNG flag and map directly.</li></ol><h2>Why It Matters</h2><p>Writers, game masters and worldbuilders need plausible filler states fast. A seed-stable country with a flag and a motto is a ready-made footnote for any fictional map - no naming muscle required.</p>',
    faq: [
      { q: "Could I get a real country by accident?", a: "The hub filters known real country names before generating, so results stay fictional. If a real one ever slips through, the API authors remove it." },
      { q: "What does the seed do?", a: "The seed deterministically drives every choice - name, flag colours, layout, statistics. The same seed always returns the same country, which is ideal for keeping a fictional world consistent." },
      { q: "Can I use these countries in my stories or games?", a: "Yes - they are generated fiction with no real-world counterpart. Publish, worldbuild and game with them freely." },
      { q: "Is it free?", a: "Completely - no key, no sign-up. Each generation is one request to the free public Tasta Space API." }
    ],
    conclusion: "A whole fictional nation - flag, motto and walnut-sauce duck included - in one click."
  }),

  Object.assign({}, FUN, {
    slug: "dig-to-the-other-side",
    name: "Dig to the Other Side Calculator",
    toolTitle: "Dig to the Other Side | Antipode Finder",
    desc: "Dig straight down from any coordinates and see where you come out - antipode, fall time, top speed and the nearest shore.",
    icon: "fa-solid fa-earth-americas",
    features: ["Antipode of any lat/lon", "Fall time through Earth", "Nearest land & verdict", "Use-my-location support"],
    startHint: "Enter latitude and longitude (or use your location), then click Dig!",
    pubDate: "2026-10-20",
    authorNote: AUTHOR,
    privacyNote: '<b>Privacy note:</b> this tool is powered by the free public API hub api.tasta.space. Only the coordinates you enter (or your location, if you allow it) are sent there - Troolify stores nothing, but data does leave your device. The hub allows 30 requests per minute per visitor.',
    keywords: ["antipode", "dig to the other side", "opposite side of earth", "antipodal point", "fall through earth", "time to fall through earth", "earth tunnel calculator", "antipode finder", "where would i come out", "through the earth"],
    fields:
      '<style>' +
      '.dg-card{background:#1B2028;border:1px solid var(--border);border-radius:12px;padding:12px 14px}' +
      '.dg-card h4{margin:0 0 8px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#93C5FD}' +
      '.dg-place{font-size:16px;font-weight:800;color:var(--ink)}' +
      '.dg-sub{font-size:12.5px;color:var(--muted);font-weight:600;margin-top:4px;line-height:1.5}' +
      '.dg-verdict{font-size:17px;font-weight:800;color:#93C5FD;text-align:center;line-height:1.5;padding:10px 6px}' +
      '.dg-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
      '@media(max-width:560px){.dg-two{grid-template-columns:1fr}}' +
      '</style>' +
      '<div class="row2">' +
      '<div class="field"><label for="lat">Latitude (-90 to 90)</label><input type="number" id="lat" step="any" min="-90" max="90" placeholder="e.g. 44.4268"></div>' +
      '<div class="field"><label for="lon">Longitude (-180 to 180)</label><input type="number" id="lon" step="any" min="-180" max="180" placeholder="e.g. 26.1025"></div>' +
      '</div>' +
      '<div class="opt-row" id="presetRow" style="margin-top:10px">' +
      '<button class="chip" type="button" data-lat="44.4268" data-lon="26.1025">Bucharest</button>' +
      '<button class="chip" type="button" data-lat="51.5074" data-lon="-0.1278">London</button>' +
      '<button class="chip" type="button" data-lat="40.7128" data-lon="-74.006">New York</button>' +
      '<button class="chip" type="button" data-lat="35.6762" data-lon="139.6503">Tokyo</button>' +
      '<button class="chip" type="button" data-lat="-33.8688" data-lon="151.2093">Sydney</button>' +
      '<button class="chip" type="button" data-lat="-33.9249" data-lon="18.4241">Cape Town</button>' +
      '</div>',
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-arrow-down"></i>Dig!</button><button class="rt-btn" type="button" id="locBtn"><i class="fa-solid fa-location-crosshairs"></i>Use my location</button></div>',
    article: '<h2>Dig to the Other Side Calculator</h2><p>Every point on Earth has exactly one antipode - the spot you would reach by drilling straight through the planet. The Dig to the Other Side Calculator takes your coordinates and answers with the <a href="https://api.tasta.space/dig" target="_blank" rel="noopener">Tasta Space</a> hub\'s physics: where you emerge, whether that is land or water, the nearest coast if it is ocean, how long the fall takes through a uniform Earth and through the real layered Earth, and the top speed you would hit at the centre.</p><h2>How to Use</h2><ol><li><strong>Enter latitude and longitude</strong> - or tap a preset city, or press Use my location.</li><li><strong>Click Dig!</strong> - the exit point, verdict and physics appear instantly.</li><li><strong>Read the verdict</strong> - it tells you whether to bring a boat, and how far the nearest shore is.</li></ol><h2>Why It Matters</h2><p>About 71% of the antipodal land question ends in water: most places on land come out in the ocean. The tool also shows the real fall time - roughly 38 to 42 minutes - and stacks it against the Kola Superdeep Borehole, the deepest hole humans have ever made.</p>',
    faq: [
      { q: "What is an antipode?", a: "The antipode is the point diametrically opposite yours on the globe: same distance from the centre, opposite side. Latitude flips sign; longitude is mirrored through the poles." },
      { q: "Why do so many antipodes land in the ocean?", a: "Because the continents are unevenly spread - most land sits in the northern hemisphere, whose antipodes fall in the southern oceans. Only a few places, like parts of Spain and New Zealand, meet land on the other side." },
      { q: "How exact are the fall times?", a: "Two models are shown: a uniform-density Earth (about 42 minutes, a clean physics result) and the real layered Earth from seismic data (about 38 minutes, per Klotz, American Journal of Physics, 2015)." },
      { q: "Is this real physics or a joke?", a: "Both, deliberately. The numbers are real; the boat advice is genuine too - most tunnels end in salt water." }
    ],
    conclusion: "One shaft, one planet, one exit - find your antipode and pack accordingly."
  }),

  Object.assign({}, FUN, {
    slug: "life-stats-calculator",
    name: "Life Stats Calculator",
    toolTitle: "Life Stats Calculator | Your Life in Silly Units",
    desc: "Your life in silly units - seconds, full moons, heartbeats, kilometres around the Sun - plus your age on every planet.",
    icon: "fa-solid fa-cake-candles",
    features: ["Age in seconds & full moons", "Ages on all eight planets", "Next planetary milestones", "Heartbeats & breaths estimates"],
    startHint: "Enter your date of birth and click Show my life.",
    pubDate: "2026-10-20",
    authorNote: AUTHOR,
    privacyNote: '<b>Privacy note:</b> this tool is powered by the free public API hub api.tasta.space. Only the date of birth you enter is sent there - Troolify stores nothing, but data does leave your device. The hub allows 30 requests per minute per visitor.',
    keywords: ["age calculator", "life stats", "seconds since birth", "full moons lived", "birthday statistics", "age on planets", "life in numbers", "heartbeats lived", "gigasecond", "milestone countdown"],
    fields: '<style>.bn-hero{font-size:23px;font-weight:800;color:#6EE7B7;text-align:center;padding:4px 0 2px}</style><div class="field"><label for="born">Date of birth</label><input type="date" id="born"></div>',
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-cake-candles"></i>Show my life</button></div>',
    article: '<h2>Life Stats Calculator</h2><p>The Life Stats Calculator turns a birthday into a set of wonderfully useless numbers, computed by the free <a href="https://api.tasta.space/life" target="_blank" rel="noopener">Tasta Space</a> hub: your age in seconds and in full moons survived, kilometres travelled around the Sun and around the galaxy, estimated heartbeats and breaths, Fridays the 13th outlasted - and your age on every planet, from Mercury to Pluto. It finishes with your next planetary milestone and a countdown to it.</p><h2>How to Use</h2><ol><li><strong>Enter your date of birth</strong> - day, month and year.</li><li><strong>Click Show my life</strong> - the full dashboard appears instantly.</li><li><strong>Open a milestone certificate</strong> - each upcoming planetary birthday links to a printable certificate.</li></ol><h2>Why It Matters</h2><p>Numbers this large stop meaning anything at human scale - which is exactly the point. A billion seconds lands around age 31; a single orbit of the galaxy is a rounding error on your address. It is perspective, with a countdown.</p>',
    faq: [
      { q: "How accurate are the numbers?", a: "Days and seconds are exact for a midnight-to-midnight birth date. Heartbeats, breaths and the kilometre counts are steady-rate estimates from documented adult ranges (75 bpm, 15 breaths per minute), clearly flagged as such." },
      { q: "How is age on planets calculated?", a: "Days alive are divided by each planet\'s sidereal year - 88 days on Mercury, 24.8 years on Pluto - so a 40-year-old Earthling is roughly 165 Mercury years old." },
      { q: "What is a gigasecond?", a: "One billion seconds - about 31.7 years. The tool shows the exact date you passed (or will pass) your first gigasecond." },
      { q: "Is my birth date private?", a: "It is sent to the free Tasta Space API to compute the stats and stored nowhere - not by Troolify and not by the hub beyond the request itself." }
    ],
    conclusion: "Your lifetime, rescaled into full moons and planetary birthdays - one date in, one dashboard out."
  }),

  Object.assign({}, FUN, {
    slug: "proverb-mashup-generator",
    name: "Proverb Mashup Generator",
    toolTitle: "Proverb Mashup Generator | Wisdom, Reassembled",
    desc: "Half of one real proverb glued to half of another - in Romanian or English - with every source linked.",
    icon: "fa-solid fa-quote-left",
    features: ["Real proverb halves", "Romanian & English", "Linked Wikiquote sources", "Shareable seed permalink"],
    startHint: "Pick a language and click Mash them up.",
    pubDate: "2026-10-20",
    authorNote: AUTHOR,
    privacyNote: '<b>Privacy note:</b> this tool is powered by the free public API hub api.tasta.space. Only the language you pick is sent there - Troolify stores nothing, but data does leave your device. The hub allows 30 requests per minute per visitor.',
    keywords: ["proverb generator", "proverb mashup", "mixed proverbs", "romanian proverbs", "english proverbs", "saying generator", "wisdom generator", "proverb mix", "funny proverbs", "fake proverbs"],
    fields: '<style>.pb-src{background:#1B2028;border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-top:10px;font-size:13px;line-height:1.6;color:var(--muted)}.pb-src b{color:var(--ink)}.pb-src a{color:#93C5FD}</style><div class="field"><label for="lang">Language</label><select id="lang"><option value="en">English proverbs</option><option value="ro">Proverbe rom&acirc;ne&#537;ti</option></select></div>',
    actions: '<div class="actions" style="margin-top:16px"><button class="btn btn-primary" type="button" id="runBtn"><i class="fa-solid fa-quote-left"></i>Mash them up</button></div>',
    article: '<h2>Proverb Mashup Generator</h2><p>The Proverb Mashup Generator takes two real proverbs, keeps the first half of one and the second half of the other, and glues them into advice nobody ever gave. Both languages are served by the free <a href="https://api.tasta.space/proverbs" target="_blank" rel="noopener">Tasta Space</a> hub: Romanian proverbs from Wikiquote\'s sourced collection and English proverbs from the same well-kept list, each result linking straight back to both originals.</p><h2>How to Use</h2><ol><li><strong>Pick a language</strong> - English or Romanian.</li><li><strong>Click Mash them up</strong> - a new hybrid proverb appears with its two source proverbs underneath.</li><li><strong>Copy the mashup</strong> or its permalink - the permalink seed rebuilds the exact same mashup later.</li></ol><h2>Why It Matters</h2><p>Proverbs compress centuries of judgement into one line. Reassembling them shows how modular that wisdom really is - and produces perfect fake tradition for a talk, a slide or a story.</p>',
    faq: [
      { q: "Are the halves real proverbs?", a: "Yes - both halves come from sourced proverb collections (Wikiquote), and each result links to the two originals plus their sources so you can verify every word." },
      { q: "Why Romanian and English?", a: "The hub\'s proverb corpus is Romanian and English. Romanian is included with diacritics intact - half the fun is proverbs like the one about the slipper and liberty." },
      { q: "Can I share the mashups?", a: "Yes - they are combinatorics over public proverbs. Copy the text or the seed permalink, and the source links travel with it." },
      { q: "Is it free?", a: "Completely free, no key and no sign-up - each mashup is one request to the public Tasta Space API." }
    ],
    conclusion: "Centuries of wisdom, neatly misquoted - real halves, new nonsense, every source linked."
  })
];