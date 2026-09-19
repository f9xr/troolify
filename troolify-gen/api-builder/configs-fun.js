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
  })
];