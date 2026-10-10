/* ============================================================================
   Troolify - it-tools migration, batch 6
   Developer / dev-ops / security tools:
   regex-tester, regex-memo, git-memo, keycode-info, meta-tag-generator,
   benchmark-builder, docker-run-to-compose, otp-code-generator-and-validator,
   base64-file-converter.
   Run: node troolify-gen/gen-tools-batch6.js   (from the repo root)
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { buildPage, registerTools, CATMAP, panel } = require('./tool-page-lib');

const ROOT = path.resolve(__dirname, '..');
const catFolder = f => (CATMAP[f] || {}).folder || f;

const TOOLS = [];
function add(spec) { TOOLS.push(spec); }

/* ========================================================================
   1. REGEX TESTER
   ======================================================================== */
add({
  file: 'regex-tester.html', folder: 'coding',
  name: 'Regex Tester', tag: 'Testing', icon: 'fa-solid fa-code',
  title: 'Regex Tester | Test & Debug Regular Expressions Online',
  metaDesc: 'Test a regular expression against any text instantly. See every match with index and capture groups, with live output, fully offline.',
  desc: 'Type a pattern and watch every match appear instantly with its index and capture groups. Test flags like g, i and m against any text, right in your browser.',
  keywords: ['regex tester', 'regex test online', 'regular expression tester', 'test regex', 'regex debugger', 'regex live', 'regex match tester', 'regexp tester online', 'regex online tool', 'regex match groups'],
  featureList: ['Live results as you type', 'Match index + capture groups', 'All JS flags supported', 'Invalid pattern handling', 'Unlimited match listing', '100% client-side'],
  panel: panel.wrap('rx', 'fa-solid fa-code', 'Regex Tester',
    '<div class="row3"><div class="field"style="grid-column:1/3"><label for="rxPat">Regular expression</label><input id="rxPat"type="text"spellcheck="false"placeholder="(\\w+)@(\\w+)\\.(\\w+)"></div><div class="field"><label for="rxFlags">Flags</label><input id="rxFlags"type="text"spellcheck="false"value="g"placeholder="gim"></div></div>' +
    '<div class="io-field"style="margin-top:14px"><label for="rxIn">Test string</label><textarea id="rxIn"spellcheck="false"placeholder="Paste the text to search…"></textarea></div>' +
    '<div class="io-field"style="margin-top:14px"><label for="rxOut">Matches</label><textarea id="rxOut"readonly spellcheck="false"placeholder="Matches appear here…"></textarea></div>' +
    panel.actions('rx', 'Test regex') ),
  css: '.rx-panel textarea{min-height:160px}',
  js: String.raw`
    var rxNL = String.fromCharCode(10);
    function rxBuild(m, n){
      var parts = [];
      for (var i = 0; i < m.length; i++) parts.push("group " + i + "=" + (m[i] === undefined ? "<undefined>" : JSON.stringify(m[i])));
      return "Match " + n + " at index " + m.index + "  ->  " + parts.join("  ");
    }
    function run(){
      var pat = document.getElementById("rxPat").value;
      var flags = document.getElementById("rxFlags").value.trim();
      var str = document.getElementById("rxIn").value;
      var out = document.getElementById("rxOut");
      var proc = document.querySelector("#rxProc");
      if (!pat) { out.value = ""; proc.textContent = "Type a pattern to test."; return; }
      var re;
      try { re = new RegExp(pat, flags); } catch (e) { out.value = ""; proc.textContent = "Invalid pattern: " + e.message; return; }
      var gflags = flags.indexOf("g") >= 0 ? flags : flags + "g";
      var loop;
      try { loop = new RegExp(pat, gflags); } catch (e) { out.value = ""; proc.textContent = "Invalid flags."; return; }
      var lines = [], count = 0, m;
      if (flags.indexOf("g") < 0) {
        m = re.exec(str);
        if (m) { count = 1; lines.push(rxBuild(m, 1)); }
      } else {
        while ((m = loop.exec(str)) !== null) {
          count++;
          lines.push(rxBuild(m, count));
          if (loop.lastIndex === m.index) loop.lastIndex++;
          if (count >= 500) { lines.push("(stopped listing at 500 matches)"); break; }
        }
      }
      out.value = lines.length ? lines.join(rxNL) : "(no matches)";
      proc.textContent = count + " match(es) found in this tab.";
    }
    document.getElementById("rxGo").addEventListener("click", run);
    document.getElementById("rxPat").addEventListener("input", run);
    document.getElementById("rxFlags").addEventListener("input", run);
    document.getElementById("rxIn").addEventListener("input", run);
    document.getElementById("rxCopy").addEventListener("click", function(){ window.Troolify.copyToClipboard(document.getElementById("rxOut").value, function(){ document.querySelector("#rxProc").textContent = "Matches copied to clipboard."; }); });
    document.getElementById("rxSample").addEventListener("click", function(){
      document.getElementById("rxPat").value = "(\\w+)@(\\w+)\\.(\\w+)";
      document.getElementById("rxFlags").value = "g";
      document.getElementById("rxIn").value = "Contact alice@example.com or bob@test.org, and admin@troolify.dev for help.";
      run();
    });
    document.getElementById("rxClear").addEventListener("click", function(){ document.getElementById("rxPat").value = ""; document.getElementById("rxIn").value = ""; document.getElementById("rxOut").value = ""; });
  `,
  article: {
    title: 'Regex Tester: No More Guess-and-Check With Patterns',
    lead: '<p>Regular expressions are powerful and famously unforgiving. This <strong>regex tester</strong> shows every match as you type, with its character index and the captured groups, so you can see exactly what your pattern is doing and fix it in seconds.</p><p>Everything runs in the browser, so you can paste sensitive text without it leaving your machine.</p>',
    sections: [
      { id: 'matches', icon: 'fa-solid fa-list-check', heading: 'See every match, not just the first', html: '<p>With the <code>g</code> flag the dump lists up to 500 matches, each with its start index and every group: <code>group 0</code> for the whole match and <code>group 1..N</code> for each sub-pattern. Remove <code>g</code> and only the first match is listed, exactly like <code>str.match</code> without it.</p>' },
      { id: 'flags', icon: 'fa-solid fa-flag', heading: 'Tailor behavior with flags', html: '<p>Test the standard JavaScript flags: <code>g</code> global, <code>i</code> case-insensitive, <code>m</code> multiline, <code>s</code> dot-all and <code>u</code>/<code>y</code> for Unicode and sticky matching. Invalid patterns are reported with the real error message instead of silently failing.</p>' },
      { id: 'debug', icon: 'fa-solid fa-bug', heading: 'Debugging capture groups', html: '<p>Group misalignment is the most common regex bug. The tester numbers each group from zero, so you can verify that <code>([a-z]+)-(\d+)</code> really captures the text you intend before you wire it into your code.</p>' }
    ],
    steps: [
      'Type your pattern and choose flags.',
      'Paste the text you want to search.',
      'Read the match list, fix the pattern, and iterate until it is right.'
    ],
    facts: [['Groups', 'Numbered from group 0'], ['Match limit', 'Lists up to 500'], ['Flags', 'g, i, m, s, u, y'], ['Live', 'Updates as you type'], ['Data handling', 'Runs locally']],
    useCases: [
      ['Checking email or URL patterns', 'Validate that a verbose pattern really accepts every valid input and nothing else.'],
      ['Log forensics', 'Paste a log file and draft the extraction regex interactively before scripting it.'],
      ['Search-and-replace planning', 'Confirm which text a pattern matches before you run a risky replace across files.']],
    tips: [
      'Use (?:...) for non-capturing groups so your group numbers stay predictable.',
      'A pattern with the g flag lets you watch lastIndex behavior across repeated exec calls.',
      'Escaped dots, \d, \w and \s behave exactly like in modern JavaScript engines.'
    ],
    takeaways: [['matches','listed with index + groups'],['flags','g i m s u y supported'],['local','testing stays in the tab']],
    faq: [
      ['Which regex flavor does this use?','Plain JavaScript RegExp, so ES2023-era syntax like named groups and lookbehind works as it would in your code.'],
      ['Why is nothing matching?','Check whitespace and escaping first: in JavaScript string literals a literal backslash needs doubling, but the pattern box here takes the raw pattern.'],
      ['What does the g flag change?','Without g only the first match is reported, like String.match. With g every match is listed by index.'],
      ['Can I match newlines?','Enable the s flag to let the dot match newline characters, or use \s and \n explicitly.'],
      ['Is my data uploaded?','No. All regex testing happens inside your browser.']],
    conclusion: '<p>Regex skills pay off in direct proportion to how fast you can iterate. Use this <strong>regex tester</strong> to land the right pattern quickly, and keep the ones you reuse on the <a href="regex-memo.html">regex memo</a> page.</p>'
  }
});

/* ========================================================================
   2. REGEX MEMO
   ======================================================================== */
add({
  file: 'regex-memo.html', folder: 'coding',
  name: 'Regex Memo', tag: 'Memo', icon: 'fa-solid fa-bookmark',
  title: 'Regex Memo | Save & Reuse Regular Expressions',
  metaDesc: 'Store your favorite regex patterns with titles, flags and notes. Search, copy and manage them, saved locally in your browser.',
  desc: 'Keep a personal library of regular expressions: title, pattern, flags and a note. Filter the list, copy any pattern, or delete the ones you no longer need.',
  keywords: ['regex memo', 'regex library', 'save regex patterns', 'regex bookmarks', 'regex cheat sheet keeper', 'regex snippets', 'regex collection', 'regex notes online', 'regex pattern library', 'regex organizer'],
  featureList: ['Save titled patterns', 'Flags per entry', 'Notes on each regex', 'Instant filtering', 'One-click copy', 'Stored locally'],
  panel: panel.wrap('rm', 'fa-solid fa-bookmark', 'Regex Memo',
    '<div class="io-field"><label for="rmTitle">Title</label><input id="rmTitle"type="text"spellcheck="false"placeholder="Email pattern"></div>' +
    '<div class="row3"style="margin-top:14px"><div class="field"style="grid-column:1/3"><label for="rmPat">Pattern</label><input id="rmPat"type="text"spellcheck="false"placeholder="^[\\w.+-]+@[\\w-]+\\.[\\w.]+$"></div><div class="field"><label for="rmFlags">Flags</label><input id="rmFlags"type="text"spellcheck="false"value="g"placeholder="gim"></div></div>' +
    '<div class="field"style="margin-top:14px"><label for="rmNote">Note (optional)</label><input id="rmNote"type="text"spellcheck="false"placeholder="Validate email addresses in forms"></div>' +
    '<div class="actions"><button class="btn btn-primary"type="button"id="rmAdd"><i class="fa-solid fa-plus"></i>Save regex</button></div>' +
    '<div class="field"style="margin-top:18px"><label for="rmSearch">Filter saved regexes</label><input id="rmSearch"type="search"spellcheck="false"placeholder="Filter by title, pattern or note…"></div>' +
    '<div id="rmList"style="margin-top:12px;display:flex;flex-direction:column;gap:10px"></div>' ),
  css: '.rm-panel textarea{min-height:120px}',
  js: String.raw`
    var RM_KEY = "troolify.regexMemo";
    function rmLoad(){ try { return JSON.parse(localStorage.getItem(RM_KEY)) || []; } catch (e) { return []; } }
    function rmSave(list){ try { localStorage.setItem(RM_KEY, JSON.stringify(list)); } catch (e) {} }
    function rmDelete(i){ var list = rmLoad(); list.splice(i, 1); rmSave(list); rmRender(); }
    function rmCopy(i){ var list = rmLoad(); window.Troolify.copyToClipboard(list[i].pattern, function(){ document.querySelector("#rmProc").textContent = "Pattern copied to clipboard."; }); }
    function rmRender(){
      var list = rmLoad(), q = (document.getElementById("rmSearch").value || "").toLowerCase();
      var host = document.getElementById("rmList");
      host.innerHTML = "";
      if (!list.length) {
        var p = document.createElement("p"); p.className = "rt-sub"; p.textContent = "No saved regexes yet. Add one above or load the sample.";
        host.appendChild(p);
        document.querySelector("#rmProc").textContent = "0 regex(es) saved in this browser.";
        return;
      }
      var shown = 0;
      list.forEach(function(it, idx){
        var hay = (it.title + " " + it.pattern + " " + (it.note || "")).toLowerCase();
        if (q && hay.indexOf(q) < 0) return;
        shown++;
        var card = document.createElement("div");
        card.className = "result-tile";
        var t = document.createElement("div"); t.className = "rt-label"; t.textContent = (it.title || "Untitled") + "  /" + (it.flags || "") + "/";
        var p2 = document.createElement("div"); p2.className = "rt-value"; p2.textContent = it.pattern;
        var n = document.createElement("div"); n.className = "rt-sub"; n.textContent = it.note || "";
        var row = document.createElement("div"); row.style.marginTop = "8px";
        var b1 = document.createElement("button"); b1.type = "button"; b1.className = "chip-btn"; b1.innerHTML = "<i class=\"fa-solid fa-copy\"></i>Copy";
        b1.addEventListener("click", function(){ rmCopy(idx); });
        var b2 = document.createElement("button"); b2.type = "button"; b2.className = "chip-btn"; b2.innerHTML = "<i class=\"fa-solid fa-trash\"></i>Delete";
        b2.addEventListener("click", function(){ rmDelete(idx); });
        row.appendChild(b1); row.appendChild(b2);
        card.appendChild(t); card.appendChild(p2); card.appendChild(n); card.appendChild(row);
        host.appendChild(card);
      });
      if (!shown) { var p3 = document.createElement("p"); p3.className = "rt-sub"; p3.textContent = "No regexes match that filter."; host.appendChild(p3); }
      document.querySelector("#rmProc").textContent = list.length + " regex(es) saved in this browser.";
    }
    document.getElementById("rmAdd").addEventListener("click", function(){
      var title = document.getElementById("rmTitle").value.trim();
      var pat = document.getElementById("rmPat").value.trim();
      var flags = document.getElementById("rmFlags").value.trim();
      var note = document.getElementById("rmNote").value.trim();
      if (!pat) { document.querySelector("#rmProc").textContent = "A pattern is required."; return; }
      try { new RegExp(pat, flags); } catch (e) { document.querySelector("#rmProc").textContent = "Invalid pattern: " + e.message; return; }
      var list = rmLoad();
      list.push({ title: title, pattern: pat, flags: flags, note: note });
      rmSave(list);
      document.getElementById("rmTitle").value = ""; document.getElementById("rmPat").value = ""; document.getElementById("rmNote").value = "";
      rmRender();
    });
    document.getElementById("rmSample").addEventListener("click", function(){
      var list = rmLoad();
      if (list.length) { document.querySelector("#rmProc").textContent = "You already have saved regexes — clear them if you want the sample."; return; }
      rmSave([
        { title: "Email", pattern: "[\\w.+-]+@[\\w-]+\\.[\\w.]+", flags: "g", note: "Match email addresses" },
        { title: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", flags: "g", note: "Match dotted IPv4 addresses" },
        { title: "Hex color", pattern: "#[0-9a-fA-F]{6}", flags: "gi", note: "Six-digit hex colors" }
      ]);
      rmRender();
    });
    document.getElementById("rmClear").addEventListener("click", function(){ try { localStorage.removeItem(RM_KEY); } catch (e) {} document.getElementById("rmSearch").value = ""; rmRender(); });
    document.getElementById("rmSearch").addEventListener("input", rmRender);
    rmRender();
  `,
  article: {
    title: 'Regex Memo: Your Personal Pattern Library',
    lead: '<p>Every developer has a handful of regexes they retype from memory or dig out of old tickets. This <strong>regex memo</strong> gives them a home: store each pattern with a title, flags and a note, then filter, copy and delete them with one click.</p><p>The list is saved in your browser\'s local storage, so it is private and always available even offline.</p>',
    sections: [
      { id: 'organize', icon: 'fa-solid fa-layer-group', heading: 'Organized by title and note', html: '<p>Give every pattern a memorable title, like <em>Email</em> or <em>Phone (US)</em>, and add a note describing where to use it. The filter box searches titles, patterns and notes simultaneously, so a library of fifty regexes still opens in three keystrokes.</p>' },
      { id: 'local', icon: 'fa-solid fa-shield-halved', heading: 'Stored in your browser only', html: '<p>Everything lives in <code>localStorage</code> under a single key. Nothing is uploaded, no account is needed, and clearing it is one Click on the Clear button. You can also clear just one entry at a time.</p>' },
      { id: 'copy', icon: 'fa-solid fa-copy', heading: 'Copy without transcription errors', html: '<p>Patterns full of backslashes are the worst thing to retype. Copy writes the exact stored pattern to your clipboard, flags and all, avoiding the character-by-character drift that breaks otherwise-fine regexes.</p>' }
    ],
    steps: [
      'Enter a title, the pattern and optional flags.',
      'Press Save regex — the entry appears in the library below.',
      'Filter, copy or delete entries whenever you need them.'
    ],
    facts: [['Storage', 'localStorage in this browser'],['Filter','Searches title + pattern + note'],['Copy','Exact stored pattern'],['Validation','Tested with new RegExp on save'],['Privacy','Never leaves your browser']],
    useCases: [
      ['Standardizing team patterns', 'Keep the canonical IP / email / slug regexes documented in one place.'],
      ['Speeding up auth work', 'Store the password-validation regexes you wrote once and reuse everywhere.'],
      ['Migrating codebases', 'Collect the patterns you need to find and replace across old code, then grep them out.']],
    tips: [
      'Doubling backslashes happens automatically when you paste patterns from code strings.',
      'The sample button loads three sensible starters if you want to see the layout.',
      'Saving is instant; there is no separate save step to forget.'
    ],
    takeaways: [['titles','+ flags + notes'],['search','filters instantly'],['local','browser-only storage']],
    faq: [
      ['Where is my data stored?','In this browser\'s localStorage under the key troolify.regexMemo. Clearing browser data for this site removes it.'],
      ['Can I sync between devices?','Not automatically. Since storage is local by design, your library stays on the device you saved it on.'],
      ['What happens to an invalid pattern?','Saving refuses it and shows the JavaScript error, so your library never holds broken regexes.'],
      ['Does it support flags?','Yes, each entry stores its own flags string such as g, i or gi, copied together with the pattern.'],
      ['Is this a server-side service?','No, it is a purely client-side tool with no backend at all.']],
    conclusion: '<p>Stop re-deriving the same patterns. Build the habit of saving what works and this <strong>regex memo</strong> becomes your personal reference shelf — pair it with <a href="regex-tester.html">regex tester</a> to check a pattern before you save it, and <a href="git-memo.html">git memo</a> for the shell side of your workflow.</p>'
  }
});

/* ========================================================================
   3. GIT MEMO
   ======================================================================== */
add({
  file: 'git-memo.html', folder: 'coding',
  name: 'Git Memo', tag: 'Memo', icon: 'fa-brands fa-git-alt',
  title: 'Git Memo | Git Command Cheat Sheet with Copy Buttons',
  metaDesc: 'A searchable git cheat sheet with one-click command copying. Everyday, branch, undo, sharing and inspection commands, offline.',
  desc: 'The git commands you actually use every day, grouped and searchable, with one-click copy. Setup, commits, branches, sharing, undo and inspection.',
  keywords: ['git memo', 'git cheat sheet', 'git commands', 'git command list', 'git reference', 'git commands copy', 'git cheat sheet online', 'git commands list pdf', 'git quick reference', 'git useful commands'],
  featureList: ['Grouped by workflow', 'Search across commands', 'One-click copy', 'Concise descriptions', 'Core + advanced sets', '100% client-side'],
  panel: panel.wrap('gm', 'fa-brands fa-git-alt', 'Git Memo',
    '<div class="field"style="max-width:440px"><label for="gmSearch">Filter commands</label><input id="gmSearch"type="search"spellcheck="false"placeholder="branch, merge, stash, log…"></div>' +
    '<div id="gmList"style="margin-top:16px;display:flex;flex-direction:column;gap:18px"></div>' ),
  css: '.gm-panel textarea{min-height:100px}',
  js: String.raw`
    var GM_DATA = [
      ["Start a project", [
        ["git init", "Create a new repository in the current folder"],
        ["git clone <url>", "Copy an existing repository locally"]
      ]],
      ["Daily work", [
        ["git status", "See changed, staged and untracked files"],
        ["git add <file>", "Stage a file (use . to stage everything)"],
        ["git commit -m \"msg\"", "Snapshot the staged changes with a message"],
        ["git log --oneline", "Compact history of commits"]
      ]],
      ["Branches", [
        ["git branch", "List local branches"],
        ["git branch <name>", "Create a branch"],
        ["git checkout <name>", "Switch to a branch"],
        ["git checkout -b <name>", "Create and switch to a branch"],
        ["git merge <name>", "Merge a branch into the current one"]
      ]],
      ["Undoing", [
        ["git restore <file>", "Discard uncommitted changes to a file"],
        ["git reset HEAD~1", "Undo the last commit, keeping its changes staged"],
        ["git revert <commit>", "Add a new commit that undoes an older one (safe to push)"]
      ]],
      ["Sharing & updating", [
        ["git remote add origin <url>", "Point your repo at a remote"],
        ["git push", "Upload commits to the remote"],
        ["git pull", "Download and merge remote changes"],
        ["git fetch", "Download remote history without merging"]
      ]],
      ["Stash", [
        ["git stash", "Temporarily set aside uncommitted changes"],
        ["git stash pop", "Restore the most recent stash"],
        ["git stash list", "Show all stashes"]
      ]],
      ["Inspection", [
        ["git diff", "Show unstaged changes"],
        ["git diff --staged", "Show changes ready to commit"],
        ["git show <commit>", "Show a commit and its changes"],
        ["git blame <file>", "Who changed each line and when"]
      ]],
      ["Tagging", [
        ["git tag <name>", "Tag the current commit"],
        ["git tag -a v1.0 -m \"msg\"", "Create an annotated tag"]
      ]]
    ];
    var gmNL = String.fromCharCode(10);
    function gmCopy(cmdText){
      window.Troolify.copyToClipboard(cmdText, function(){ document.querySelector("#gmProc").textContent = "Command copied to clipboard."; });
    }
    function gmRender(){
      var q = (document.getElementById("gmSearch").value || "").toLowerCase();
      var host = document.getElementById("gmList");
      host.innerHTML = "";
      var groups = 0;
      GM_DATA.forEach(function(g){
        var rows = g[1].filter(function(r){ return !q || ((r[0] + " " + r[1]).toLowerCase().indexOf(q) >= 0); });
        if (!rows.length) return;
        groups++;
        var sec = document.createElement("div");
        var head = document.createElement("div");
        head.className = "rt-label";
        head.style.marginBottom = "6px";
        head.textContent = g[0];
        sec.appendChild(head);
        rows.forEach(function(r){
          var tile = document.createElement("div");
          tile.className = "result-tile";
          tile.style.display = "flex"; tile.style.flexWrap = "wrap"; tile.style.alignItems = "center"; tile.style.gap = "10px";
          var code = document.createElement("code");
          code.style.background = "#1B2028"; code.style.border = "1px solid var(--border)"; code.style.borderRadius = "8px";
          code.style.padding = "6px 10px"; code.style.fontSize = "12.5px"; code.style.color = "#93C5FD"; code.style.flex = "1"; code.style.minWidth = "220px";
          code.textContent = r[0];
          var desc = document.createElement("div");
          desc.style.flex = "1"; desc.style.minWidth = "160px"; desc.style.fontSize = "13px"; desc.style.color = "var(--faint)";
          desc.textContent = r[1];
          var b = document.createElement("button");
          b.type = "button"; b.className = "chip-btn"; b.innerHTML = "<i class=\"fa-solid fa-copy\"></i>Copy";
          (function(cmdText){ b.addEventListener("click", function(){ gmCopy(cmdText); }); })(r[0]);
          tile.appendChild(code); tile.appendChild(desc); tile.appendChild(b);
          sec.appendChild(tile);
        });
        host.appendChild(sec);
      });
      if (!groups) { var p = document.createElement("p"); p.className = "rt-sub"; p.textContent = "No commands match that filter."; host.appendChild(p); }
      document.querySelector("#gmProc").textContent = groups + " group(s) shown from this memo.";
    }
    document.getElementById("gmSearch").addEventListener("input", gmRender);
    document.getElementById("gmSample").addEventListener("click", function(){
      document.getElementById("gmSearch").value = "";
      document.querySelector("#gmProc").textContent = "Full memo loaded - click any Copy button.";
      gmRender();
    });
    document.getElementById("gmClear").addEventListener("click", function(){ document.getElementById("gmSearch").value = ""; document.querySelector("#gmProc").textContent = "Memo reset."; gmRender(); });
    gmRender();
  `,
  article: {
    title: 'Git Memo: The Commands You Actually Run',
    lead: '<p>Git\'s power hides behind a wall of subcommands. This <strong>git memo</strong> collects the commands used in a typical week — setup, commits, branches, sharing, undoing, stashing and inspection — each with a one-line description and a Copy button.</p><p>No server, no history being sent anywhere: just a reference card that lives in the page.</p>',
    sections: [
      { id: 'workflow', icon: 'fa-solid fa-diagram-project', heading: 'Organized by workflow, not alphabet', html: '<p>Commands are grouped the way you use them: starting a project, daily commits, branching, undoing, pushing and pulling, stashing, diffing and tagging. The filter searches every command and description, so <em>merge into a branch</em> finds exactly what you want.</p>' },
      { id: 'safety', icon: 'fa-solid fa-shield-halved', heading: 'Undo commands, used safely', html: '<p>The undo section separates the local tools — <code>git restore</code> and <code>git reset HEAD~1</code>, which reshape your own history — from <code>git revert</code>, the one that is safe after pushing because it adds a new commit instead of rewriting the past. Pick by situation, not by habit.</p>' },
      { id: 'copy', icon: 'fa-solid fa-copy', heading: 'Copy, then adapt', html: '<p>Every snippet copies to your clipboard verbatim. Systematically using the same base commands keeps muscle memory aligned with the memo, so you type the right thing even when the tab is closed.</p>' }
    ],
    steps: [
      'Browse the groups or type a filter like branch or stash.',
      'Click Copy on the command you need.',
      'Paste it into your terminal and replace the placeholder bits.'
    ],
    facts: [['Groups','8 workflow sections'],['Entries','25 everyday commands'],['Filter','Live search'],['Copy','One click per command'],['Data handing','Fully offline']],
    useCases: [
      ['Onboarding juniors', 'Point new developers at one curated reference instead of a 50-page manual.'],
      ['Recovering from mistakes', 'Find the correct undo command fast when a revert matters.'],
      ['Keeping teams consistent', 'Standardise the commit and merge workflow the team actually follows.']],
    tips: [
      'Placeholders like <url> and <msg> are meant to be replaced after pasting.',
      'git restore is the modern replacement for checkout -- file.',
      'When in doubt, git status first — it costs nothing and tells you where you are.'
    ],
    takeaways: [['grouped','by workflow'],['search','live filter'],['copy','one click']],
    faq: [
      ['Is this a full git manual?','No — it covers the roughly 25 commands most developers run weekly. Advanced plumbing has its own docs.'],
      ['Are these safe to run blindly?','Commands that rewrite history are marked in the undo group. Read the description before running anything in a shared repo.'],
      ['Does it track my history?','No. The memo is static content; nothing is uploaded or recorded.'],
      ['Can I change the list?','The list is fixed, but the filter makes the relevant slice instant to reach.'],
      ['Does it work offline?','Yes, the whole page is static and self-contained.']],
    conclusion: '<p>Competence with git is mostly about remembering the right command at the right moment. Keep this <strong>git memo</strong> in a tab while you work, and let the <a href="regex-memo.html">regex memo</a> hold the patterns that would otherwise leak into your commit messages.</p>'
  }
});

/* ========================================================================
   4. KEYCODE INFO
   ======================================================================== */
add({
  file: 'keycode-info.html', folder: 'coding',
  name: 'Keycode Info', tag: 'Utilities', icon: 'fa-solid fa-keyboard',
  title: 'Keycode Info | Get Key Code, Key & KeyCode Values',
  metaDesc: 'Press any key to see its event.key, event.code, legacy keyCode, location and modifier state. Instant, offline keyboard event inspector.',
  desc: 'Press any key and read the full event breakdown: key, code, legacy keyCode, which, location and active modifiers. Perfect for keyboard listeners.',
  keywords: ['keycode info', 'keycode lookup', 'javascript keycode', 'keycode chart', 'event.key', 'event.code', 'keydown keycode', 'keyboard event tester', 'keycode tool online', 'js key codes'],
  featureList: ['Live key reporting', 'event.key and event.code', 'Legacy keyCode / which', 'Key location shown', 'Modifier state', '100% client-side'],
  panel: panel.wrap('kc', 'fa-solid fa-keyboard', 'Keycode Info',
    '<div id="kcZone"tabindex="0"role="button"aria-label="Press any key"style="border:2px dashed var(--border);border-radius:14px;padding:30px;text-align:center;cursor:pointer;background:#1B2028;color:var(--faint);font-size:15px;font-weight:700;outline:none">Click here, then press any key</div>' +
    '<div class="result-grid"style="margin-top:14px">' +
    '<div class="result-tile"><span class="rt-label">event.key</span><div class="rt-value"id="kcKey"style="font-size:22px">-</div></div>' +
    '<div class="result-tile"><span class="rt-label">event.code</span><div class="rt-value"id="kcCode"style="font-size:22px">-</div></div>' +
    '<div class="result-tile"><span class="rt-label">keyCode / which</span><div class="rt-value"id="kcNum">-</div></div>' +
    '<div class="result-tile"><span class="rt-label">Location</span><div class="rt-value"id="kcLoc">-</div></div>' +
    '<div class="result-tile"style="grid-column:1/-1"><span class="rt-label">Modifiers</span><div class="rt-value"id="kcMods">None pressed</div></div>' +
    '</div>' ),
  css: '.kc-panel textarea{min-height:100px}',
  js: String.raw`
    function kcSet(id, text){ document.getElementById(id).textContent = String(text); }
    function kcShow(e){
      e.preventDefault();
      kcSet("kcKey", e.key === " " ? "(space)" : (e.key === "Enter" ? "(enter)" : e.key));
      kcSet("kcCode", e.code);
      kcSet("kcNum", (e.keyCode !== undefined ? e.keyCode : e.which) + " / " + e.which);
      var loc = e.location;
      kcSet("kcLoc", loc === 0 ? "Standard" : loc === 1 ? "Left modifier" : loc === 2 ? "Right modifier" : loc === 3 ? "Numpad" : String(loc));
      var mods = [];
      if (e.ctrlKey) mods.push("Ctrl"); if (e.altKey) mods.push("Alt"); if (e.shiftKey) mods.push("Shift"); if (e.metaKey) mods.push("Meta");
      kcSet("kcMods", mods.length ? mods.join(" + ") : "None pressed");
      document.querySelector("#kcProc").textContent = "Key " + (e.key || "").toUpperCase() + " reported in this tab.";
    }
    document.getElementById("kcZone").addEventListener("keydown", kcShow);
    document.getElementById("kcZone").addEventListener("click", function(){ document.getElementById("kcZone").focus(); });
    document.getElementById("kcSample").addEventListener("click", function(){
      document.getElementById("kcZone").focus();
      document.querySelector("#kcProc").textContent = "Zone focused - press any key now.";
    });
    document.getElementById("kcClear").addEventListener("click", function(){
      kcSet("kcKey", "-"); kcSet("kcCode", "-"); kcSet("kcNum", "-"); kcSet("kcLoc", "-"); kcSet("kcMods", "None pressed");
    });
  `,
  article: {
    title: 'Keycode Info: Stop Guessing What the Browser Reports',
    lead: '<p>Keyboard shortcuts, game controls and accessibility flows all depend on the same question: what exactly does a keypress report? This <strong>keycode info</strong> tool answers it live — press a key and read <code>event.key</code>, <code>event.code</code>, the legacy <code>keyCode</code>, the physical location and the active modifiers.</p>',
    sections: [
      { id: 'key-vs-code', icon: 'fa-solid fa-code-compare', heading: 'event.key vs event.code', html: '<p><code>event.key</code> is the character or label the key produces (like <code>a</code> or <code>ArrowUp</code>), while <code>event.code</code> is the physical key position (<code>KeyA</code>, <code>Numpad1</code>) and stays the same across layouts and shifted states. Use <code>code</code> for shortcuts and <code>key</code> for text logic.</p>' },
      { id: 'legacy', icon: 'fa-solid fa-clock-rotate-left', heading: 'The legacy keyCode, still everywhere', html: '<p><code>keyCode</code> is deprecated, but libraries and old code still use it (13 for Enter, 32 for Space, 65 for A regardless of shift). The tool shows <code>keyCode</code> and <code>which</code> side by side so you can verify both in one press.</p>' },
      { id: 'location', icon: 'fa-solid fa-map-pin', heading: 'Location distinguishes the keyboard halves', html: '<p><code>event.location</code> pins whether a modifier is the left or right one and whether a digit came from the numpad. That matters for strict shortcut handlers that only want the left Shift, for example.</p>' }
    ],
    steps: [
      'Click the dashed zone so it gains focus.',
      'Press any key, combination or numpad key.',
      'Read the event properties and adapt your code accordingly.'
    ],
    facts: [['event.key','Logical key value'],['event.code','Physical key position'],['keyCode','Legacy numeric code'],['location','0-3 keyboard region'],['Modifiers','Live state panel']],
    useCases: [
      ['Writing keyboard shortcuts', 'Confirm the exact code your shortcut handler must listen for.'],
      ['Testing game input', 'Verify that numpad arrows and arrow keys report different codes.'],
      ['Debugging layouts', 'See how a French or German layout changes event.key but not event.code.']],
    tips: [
      'Shortcuts should listen to keydown, text input to the input event.',
      'Meta keys report independently: the modifier panel shows every one held.',
      'Prevent default on the tested keys so the browser does not scroll or type.'
    ],
    takeaways: [['key','logical value'],['code','physical position'],['keyCode','legacy + which']],
    faq: [
      ['What is the difference between key and code?','key is what the key means (character, name); code is where it physically sits on standard keyboards. Shift+KeyA gives key "A" but the same code "KeyA".'],
      ['Is keyCode still useful?','It is deprecated but universally available; many existing libraries branch on it (13 = Enter, 27 = Escape, 32 = Space).'],
      ['Why show location?','location tells you if a modifier is left/right or whether a number is from the numpad — useful for games and precise shortcuts.'],
      ['Do all keys work?','Any key your browser can see works, including F-keys, arrows, media keys and the numpad found on most layouts.'],
      ['Is anything sent to a server?','No, key events never leave your browser.']],
    conclusion: '<p>Keyboard events are only mysterious until you inspect them. Keep this <strong>keycode info</strong> tool open while wiring up shortcuts, and cross-reference the patterns you settle on with <a href="regex-tester.html">regex tester</a> when input validation is next on the list.</p>'
  }
});

/* ========================================================================
   5. META TAG GENERATOR
   ======================================================================== */
add({
  file: 'meta-tag-generator.html', folder: 'seo',
  name: 'Meta Tag Generator', tag: 'SEO', icon: 'fa-solid fa-tags',
  title: 'Meta Tag Generator | Generate SEO & Social Meta Tags',
  metaDesc: 'Generate complete HTML meta tags for SEO and social sharing: title, description, Open Graph and Twitter Cards, ready to copy into any page.',
  desc: 'Fill in a form and get a complete, copy-paste-ready block of HTML meta tags — SEO basics, Open Graph and Twitter Cards, with escaping handled for you.',
  keywords: ['meta tag generator', 'meta tags generator', 'og tags generator', 'open graph generator', 'twitter card generator', 'meta description generator', 'seo meta tags', 'html meta tags generator', 'social meta tags', 'canonical url generator'],
  featureList: ['Title + description pair', 'Robots and canonical', 'Open Graph tags', 'Twitter Card tags', 'Description length meter', 'Instant code output'],
  panel: panel.wrap('mt', 'fa-solid fa-tags', 'Meta Tag Generator',
    '<div class="row3"><div class="field"style="grid-column:1/3"><label for="mtTitle">Page title</label><input id="mtTitle"type="text"spellcheck="false"placeholder="Troolify - Free Developer Tools"></div><div class="field"><label for="mtLang">Language</label><input id="mtLang"type="text"spellcheck="false"value="en"placeholder="en"></div></div>' +
    '<div class="field"style="margin-top:14px"><label for="mtDesc">Meta description <span id="mtCount"class="rt-sub"style="font-weight:600"></span></label><textarea id="mtDesc"spellcheck="false"rows="3"placeholder="Describe the page in 140-160 characters…"></textarea></div>' +
    '<div class="row3"style="margin-top:14px"><div class="field"><label for="mtCanonical">Canonical URL</label><input id="mtCanonical"type="url"spellcheck="false"placeholder="https://example.com/page"></div><div class="field"><label for="mtRobots">Robots</label><input id="mtRobots"type="text"spellcheck="false"value="index, follow, max-image-preview:large"placeholder="index, follow"></div><div class="field"><label for="mtAuthor">Author</label><input id="mtAuthor"type="text"spellcheck="false"placeholder="Your name or brand"></div></div>' +
    '<div class="field"style="margin-top:14px"><label for="mtKeywords">Keywords (comma separated)</label><input id="mtKeywords"type="text"spellcheck="false"placeholder="tools, converter, online"></div>' +
    '<div class="row3"style="margin-top:14px"><div class="field"><label for="mtOgTitle">og:title</label><input id="mtOgTitle"type="text"spellcheck="false"placeholder="Defaults to page title"></div><div class="field"><label for="mtOgType">og:type</label><input id="mtOgType"type="text"spellcheck="false"value="article"placeholder="article"></div><div class="field"><label for="mtOgUrl">og:url</label><input id="mtOgUrl"type="url"spellcheck="false"placeholder="Defaults to canonical"></div></div>' +
    '<div class="row3"style="margin-top:14px"><div class="field"><label for="mtOgImage">og:image</label><input id="mtOgImage"type="url"spellcheck="false"placeholder="https://example.com/card.png"></div><div class="field"><label for="mtTwCard">twitter:card</label><input id="mtTwCard"type="text"spellcheck="false"value="summary_large_image"placeholder="summary_large_image"></div><div class="field"><label for="mtTwImage">twitter:image</label><input id="mtTwImage"type="url"spellcheck="false"placeholder="https://example.com/card.png"></div></div>' +
    '<div class="io-field"style="margin-top:14px"><label for="mtOut">Generated HTML</label><textarea id="mtOut"readonly spellcheck="false"placeholder="Meta tags appear here…"></textarea></div>' +
    panel.actions('mt', 'Generate tags') ),
  css: '.mt-panel textarea{min-height:170px}',
  js: String.raw`
    function mtEsc(s){ return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    function mtVal(id){ return document.getElementById(id).value.trim(); }
    function mtCountDesc(){
      var n = mtVal("mtDesc").length;
      var el = document.getElementById("mtCount");
      el.textContent = n + "/~160 chars" + (n > 160 ? " - too long" : n >= 120 && n <= 160 ? " - good" : " - aim for 140-160");
      el.style.color = n > 160 ? "#F87171" : "#6EE7B7";
    }
    function run(){
      var title = mtVal("mtTitle");
      var desc = mtVal("mtDesc");
      var canonical = mtVal("mtCanonical");
      var ogUrl = mtVal("mtOgUrl") || canonical;
      var ogTitle = mtVal("mtOgTitle") || title;
      var ogDesc = mtVal("mtOgDesc") || desc;
      var twTitle = mtVal("mtTwTitle") || ogTitle;
      var twDesc = mtVal("mtTwDesc") || ogDesc;
      var lines = [];
      lines.push('<meta charset="UTF-8">');
      lines.push('<meta name="viewport" content="width=device-width, initial-scale=1">');
      if (title) lines.push('<title>' + mtEsc(title) + '</title>');
      if (desc) lines.push('<meta name="description" content="' + mtEsc(desc) + '">');
      if (mtVal("mtAuthor")) lines.push('<meta name="author" content="' + mtEsc(mtVal("mtAuthor")) + '">');
      if (mtVal("mtRobots")) lines.push('<meta name="robots" content="' + mtEsc(mtVal("mtRobots")) + '">');
      if (mtVal("mtKeywords")) lines.push('<meta name="keywords" content="' + mtEsc(mtVal("mtKeywords")) + '">');
      if (canonical) lines.push('<link rel="canonical" href="' + mtEsc(canonical) + '">');
      if (mtVal("mtLang")) lines.push('<html lang="' + mtEsc(mtVal("mtLang")) + '">');
      if (ogTitle) lines.push('<meta property="og:title" content="' + mtEsc(ogTitle) + '">');
      if (ogDesc) lines.push('<meta property="og:description" content="' + mtEsc(ogDesc) + '">');
      if (mtVal("mtOgType")) lines.push('<meta property="og:type" content="' + mtEsc(mtVal("mtOgType")) + '">');
      if (ogUrl) lines.push('<meta property="og:url" content="' + mtEsc(ogUrl) + '">');
      if (mtVal("mtOgImage")) lines.push('<meta property="og:image" content="' + mtEsc(mtVal("mtOgImage")) + '">');
      if (mtVal("mtTwCard")) lines.push('<meta name="twitter:card" content="' + mtEsc(mtVal("mtTwCard")) + '">');
      if (twTitle) lines.push('<meta name="twitter:title" content="' + mtEsc(twTitle) + '">');
      if (twDesc) lines.push('<meta name="twitter:description" content="' + mtEsc(twDesc) + '">');
      if (mtVal("mtTwImage")) lines.push('<meta name="twitter:image" content="' + mtEsc(mtVal("mtTwImage")) + '">');
      document.getElementById("mtOut").value = lines.join("\n");
      document.querySelector("#mtProc").textContent = lines.length + " tag lines generated in this tab.";
    }
    document.getElementById("mtGo").addEventListener("click", run);
    /* mount additional inputs for og:desc and twitter:title/desc that were kept flexible */
    var ogDescWrap = document.createElement("div");
    ogDescWrap.className = "field";
    ogDescWrap.style.marginTop = "14px";
    ogDescWrap.style.gridColumn = "1/-1";
    ogDescWrap.innerHTML = '<label for="mtOgDesc">og:description</label><textarea id="mtOgDesc"rows="2"style="background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:10px;padding:10px 12px;font-family:inherit;font-size:14px;width:100%;box-sizing:border-box"spellcheck="false"placeholder="Defaults to meta description"></textarea>';
    document.getElementById("mtOgImage").closest(".row3").appendChild(ogDescWrap);
    var twWrap = document.createElement("div");
    twWrap.className = "row3";
    twWrap.style.marginTop = "14px";
    twWrap.innerHTML = '<div class="field"><label for="mtTwTitle">twitter:title</label><input id="mtTwTitle"type="text"spellcheck="false"placeholder="Defaults to og:title"></div><div class="field"><label for="mtTwDesc">twitter:description</label><input id="mtTwDesc"type="text"spellcheck="false"placeholder="Defaults to og:description"></div><div class="field"><label for="mtTwSite">twitter:site</label><input id="mtTwSite"type="text"spellcheck="false"placeholder="@handle"></div></div>';
    document.getElementById("mtOut").closest(".io-field").insertAdjacentElement("beforebegin", twWrap);
    document.getElementById("mtDesc").addEventListener("input", mtCountDesc);
    document.getElementById("mtTitle").addEventListener("input", run);
    document.getElementById("mtDesc").addEventListener("input", run);
    document.getElementById("mtOut").addEventListener("input", run);
    document.getElementById("mtCopy").addEventListener("click", function(){ window.Troolify.copyToClipboard(document.getElementById("mtOut").value, function(){ document.querySelector("#mtProc").textContent = "Meta tags copied to clipboard."; }); });
    document.getElementById("mtSample").addEventListener("click", function(){
      document.getElementById("mtTitle").value = "Troolify - Free Developer Tools";
      document.getElementById("mtDesc").value = "Free online developer tools that run in your browser, from JSON converters to TOTP generators. No uploads, no sign-up.";
      document.getElementById("mtCanonical").value = "https://f9xr.org/troolify/";
      document.getElementById("mtAuthor").value = "F9XR Development Team";
      document.getElementById("mtKeywords").value = "online tools, developer tools, json converter, totp generator";
      document.getElementById("mtOgImage").value = "https://f9xr.org/troolify/og.png";
      document.getElementById("mtTwSite").value = "@f9xr";
      run();
    });
    document.getElementById("mtClear").addEventListener("click", function(){
      ["mtTitle","mtDesc","mtCanonical","mtAuthor","mtKeywords","mtOgTitle","mtOgDesc","mtOgImage","mtOgUrl","mtTwTitle","twDesc" ].forEach(function(){});
      document.getElementById("mtTitle").value = ""; document.getElementById("mtDesc").value = ""; document.getElementById("mtCanonical").value = "";
      document.getElementById("mtAuthor").value = ""; document.getElementById("mtKeywords").value = ""; document.getElementById("mtOgTitle").value = "";
      document.getElementById("mtOgDesc").value = ""; document.getElementById("mtOgImage").value = ""; document.getElementById("mtOgUrl").value = "";
      document.getElementById("mtTwTitle").value = ""; document.getElementById("mtTwDesc").value = ""; document.getElementById("mtTwSite").value = "";
      document.getElementById("mtOut").value = ""; mtCountDesc();
    });
    mtCountDesc();
  `,
  article: {
    title: 'Meta Tag Generator: Fill the Form, Paste the Tags',
    lead: '<p>Search engines and social platforms read a page through its meta tags. This <strong>meta tag generator</strong> turns a few field values into a complete, escaped block of HTML: title, description, robots, canonical, Open Graph and Twitter Card tags, ready to paste into any <code>&lt;head&gt;</code>.</p>',
    sections: [
      { id: 'seo', icon: 'fa-solid fa-magnifying-glass', heading: 'The SEO core', html: '<p>A descriptive title and a 140-160 character description remain the highest-leverage tags on the page. The generator also emits <code>robots</code>, <code>author</code>, <code>keywords</code> and a <code>canonical</code> link, and the character counter flags descriptions that are too long to render fully.</p>' },
      { id: 'social', icon: 'fa-brands fa-facebook', heading: 'Open Graph for sharing', html: '<p>og:title, og:description, og:type, og:url and og:image control how Facebook, LinkedIn, WhatsApp and most chat apps preview a link. Empty fields fall back to the page title and description so the card always looks intentional.</p>' },
      { id: 'twitter', icon: 'fa-brands fa-twitter', heading: 'Twitter Cards', html: '<p>twitter:card, title, description, image and site map directly to Tweet previews. With <code>summary_large_image</code> selected the tweet shows the image at full width — the default choice for articles and product pages.</p>' }
    ],
    steps: [
      'Fill in the page title and a description around 150 characters.',
      'Add the canonical URL, image URLs and any social fields you want.',
      'Press Generate tags and paste the block into your page head.'
    ],
    facts: [['Title','Required for every page'],['Description','140-160 chars is the sweet spot'],['Canonical','Fights duplicate content'],['OG tags','Control social previews'],['Escaping','Handled automatically']],
    useCases: [
      ['Launching pages', 'Generate consistent head tags for every page in a new site.'],
      ['Improving share previews', 'Fix vague link cards by setting the missing OG and Twitter images.'],
      ['Client deliverables', 'Hand a branded meta block to a client instead of a PDF of instructions.']],
    tips: [
      'The description counter shows green when you are in the 120-160 sweet spot.',
      'og:url and twitter:title default from the canonical URL and title fields.',
      'Attribute values with quotes, ampersands or angle brackets are escaped for you.'
    ],
    takeaways: [['seo','title + description + canonical'],['social','og: + twitter: tags'],['escaped','ready to paste']],
    faq: [
      ['Do empty fields appear in the output?','No — only filled fields generate tags, so you never emit an empty og:image or author tag.'],
      ['What is the recommended description length?','Roughly 140-160 characters. The counter marks descriptions over 160 as too long.'],
      ['Do I need both Open Graph and Twitter tags?','Twitter falls back to Open Graph when its own tags are missing, but explicit twitter tags let you tune the card style.'],
      ['Are quotes and special characters escaped?','Yes, into &quot;, &amp;, &lt; and &gt; so the generated HTML is always well-formed.'],
      ['Is this page sending anything anywhere?','No. Tag generation runs entirely in your browser.']],
    conclusion: '<p>Solid meta tags are the cheapest SEO and social win a page can get. Use this <strong>meta tag generator</strong> to make them in seconds, pair the copy with <a href="meta-description-checker.html">meta description length checker</a> on existing pages, and audit the structure with <a href="schema-markup-generator.html">schema markup generator</a>.</p>'
  }
});

/* ========================================================================
   6. BENCHMARK BUILDER
   ======================================================================== */
add({
  file: 'benchmark-builder.html', folder: 'testing',
  name: 'Benchmark Builder', tag: 'Benchmark', icon: 'fa-solid fa-gauge-high',
  title: 'Benchmark Builder | Compare the Speed of Two Code Snippets',
  metaDesc: 'Benchmark two JavaScript snippets head to head in your browser: run both for N iterations and get ms, µs/op and ops/sec with a winner.',
  desc: 'Paste two JavaScript snippets, choose the iteration count, and see which one is faster with real numbers: total ms, per-op cost and ops per second.',
  keywords: ['benchmark builder', 'javascript benchmark', 'js benchmark online', 'compare code speed', 'performance test js', 'benchmark tool online', 'test snippet speed', 'js performance tester', 'code speed test', 'benchmark two functions'],
  featureList: ['Two-snippet head to head', 'Configurable iterations', 'ms / µs- per-op / ops/sec', 'Automatic winner ratio', 'Safe isolated functions', '100% client-side'],
  panel: panel.wrap('bb', 'fa-solid fa-gauge-high', 'Benchmark Builder',
    '<div class="io-grid two"><div class="io-field"><label for="bbA">Snippet A</label><textarea id="bbA"spellcheck="false"placeholder="let s = 0;&#10;for (let i = 0; i &lt; $v; i++) s += i * i;&#10;return s;"></textarea></div><div class="io-field"><label for="bbB">Snippet B</label><textarea id="bbB"spellcheck="false"placeholder="let s = 0;&#10;for (let i = 0; i &lt; $v; i += 2) { s += i * i + (i + 1) * (i + 1); }&#10;return s;"></textarea></div></div>' +
    '<div class="row3"style="margin-top:14px"><div class="field"><label for="bbIter">Iterations</label><input id="bbIter"type="number"value="100000"min="1"></div><div class="field"><label for="bbArg">Argument for $v</label><input id="bbArg"type="number"value="100000"></div><div class="field"><label for="bbWarm">Warmup runs</label><input id="bbWarm"type="number"value="3"min="0"></div></div>' +
    '<div class="io-field"style="margin-top:14px"><label for="bbOut">Results</label><textarea id="bbOut"readonly spellcheck="false"placeholder="Benchmark results appear here…"></textarea></div>' +
    panel.actions('bb', 'Run benchmark') ),
  css: '.bb-panel textarea{min-height:150px}',
  js: String.raw`
    var bbNL = String.fromCharCode(10);
    function bbBench(code, iters, arg, warm){
      if (!code.trim()) return null;
      var fn;
      try { fn = new Function("$v", '"use strict";var __bb=0;' + code + ';return __bb;'); } catch (e) { return { err: e.message }; }
      for (var w = 0; w < warm; w++) { try { fn(arg); } catch (e) {} }
      var t0 = performance.now();
      for (var i = 0; i < iters; i++) { try { fn(arg); } catch (e) {} }
      var ms = performance.now() - t0;
      return { ms: ms, perOpUs: ms / iters * 1000, ops: Math.round(iters / (ms / 1000)) };
    }
    function run(){
      var iters = Math.max(1, parseInt(document.getElementById("bbIter").value, 10) || 10000);
      var arg = Number(document.getElementById("bbArg").value);
      var warm = Math.max(0, parseInt(document.getElementById("bbWarm").value, 10) || 0);
      var a = bbBench(document.getElementById("bbA").value, iters, arg, warm);
      var b = bbBench(document.getElementById("bbB").value, iters, arg, warm);
      var out = document.getElementById("bbOut"), proc = document.querySelector("#bbProc");
      var lines = [];
      function report(name, r){
        if (r === null) { lines.push(name + ": (empty snippet)"); return; }
        if (r.err) { lines.push(name + ": ERROR - " + r.err); return; }
        lines.push(name + ": " + r.ms.toFixed(2) + " ms total  |  " + (r.perOpUs).toFixed(3) + " µs/op  |  " + r.ops.toLocaleString() + " ops/sec");
      }
      report("A", a); report("B", b);
      lines.push("");
      if (a && b && !a.err && !b.err) {
        var max = Math.max(a.ms, b.ms), min = Math.min(a.ms, b.ms);
        if (max <= 0 || (max - min) / max < 0.03) lines.push("Verdict: too close to call - increase iterations for precision.");
        else lines.push("Verdict: " + (a.ms < b.ms ? "A" : "B") + " is " + (max / min).toFixed(2) + "x faster.");
        lines.push("Note: JIT warm-up affects results; repeat runs and use realistic inputs.");
      }
      out.value = lines.join(bbNL);
      proc.textContent = iters + " iterations per snippet, run in this tab with " + warm + " warmup run(s).";
    }
    document.getElementById("bbGo").addEventListener("click", run);
    document.getElementById("bbA").addEventListener("input", run);
    document.getElementById("bbB").addEventListener("input", run);
    document.getElementById("bbIter").addEventListener("input", run);
    document.getElementById("bbCopy").addEventListener("click", function(){ window.Troolify.copyToClipboard(document.getElementById("bbOut").value, function(){ document.querySelector("#bbProc").textContent = "Results copied to clipboard."; }); });
    document.getElementById("bbSample").addEventListener("click", function(){
      document.getElementById("bbA").value = "let s = 0;\nfor (let i = 0; i < $v; i++) s += i * i;\nreturn s;";
      document.getElementById("bbB").value = "let s = 0;\nfor (let i = 0; i < $v; i += 2) { s += i * i + (i + 1) * (i + 1); }\nreturn s;";
      document.getElementById("bbIter").value = "100000";
      document.getElementById("bbArg").value = "100000";
      document.getElementById("bbWarm").value = "3";
      run();
    });
    document.getElementById("bbClear").addEventListener("click", function(){ document.getElementById("bbA").value = ""; document.getElementById("bbB").value = ""; document.getElementById("bbOut").value = ""; });
  `,
  article: {
    title: 'Benchmark Builder: Settle Code Arguments With Numbers',
    lead: '<p>Micro-optimizing by feel usually ends in a shrug. This <strong>benchmark builder</strong> runs two JavaScript snippets side by side for a chosen number of iterations and reports total milliseconds, microseconds per operation and operations per second — then names a winner.</p><p>The entire workload stays in your tab; nothing is sent to a server.</p>',
    sections: [
      { id: 'how', icon: 'fa-solid fa-gears', heading: 'How the measurements work', html: '<p>Each snippet becomes a function receiving <code>$v</code> as an argument and runs a few warm-up passes first, so the JIT has compiled it before timing starts. Then the same body executes N times while <code>performance.now()</code> drives a single timing window.</p>' },
      { id: 'read', icon: 'fa-solid fa-chart-line', heading: 'Reading the verdict correctly', html: '<p>Operations per second is the headline number, but repeat the run a few times: JIT states vary and results within ~3% should be treated as a tie. The verdict line only calls a winner when the gap is meaningful.</p>' },
      { id: 'pitfalls', icon: 'fa-solid fa-triangle-exclamation', heading: 'What micro-benchmarks get wrong', html: '<p>Synthetic benchmarks measure the pattern, not the program. Real data shape, memory layout and cold starts change what wins in production, so treat the winner here as a hypothesis to bench again inside your actual workload.</p>' }
    ],
    steps: [
      'Write snippet A and snippet B using $v for the input value.',
      'Set the iteration count (100k is a good default for arithmetic).',
      'Run and compare ms, µs/op, ops/sec — and the verdict line.'
    ],
    facts: [['Timing', 'performance.now()'],['Warmup','Configurable passes'],['Metrics','ms, µs/op, ops/sec'],['Verdict','Only when gap > 3%'],['Scope','Runs in the tab']],
    useCases: [
      ['Choosing an algorithm', 'Compare two loop strategies with realistic n before committing to one.'],
      ['Reviewing PRs', 'Adjudicate "my version is faster" claims with a reproducible number.'],
      ['Learning optimization', 'See how op counts actually translate into wall-clock time.']],
    tips: [
      'Benchmark with an input size close to production, not the smallest value that runs.',
      'Run each comparison three times and take the median.',
      'Add a warmup of 2-3 runs so first-call JIT cost does not dominate the result.'
    ],
    takeaways: [['head to head','A vs B'],['metrics','ms + ops/sec'],['verdict','only when it matters']],
    faq: [
      ['What can I put in the snippets?','Any JavaScript that fits in the function body; the value of $v is passed in as an argument, and a return statement is optional.'],
      ['Are results reliable?','They are deterministic in aggregate but JIT noise means you should repeat runs. The verdict only calls a winner above a ~3% gap.'],
      ['How many iterations should I use?','Enough that each run takes at least ~50ms. Start at 100,000 for small arithmetic snippets and raise it for tiny bodies.'],
      ['What do µs/op and ops/sec mean?','µs/op is the average cost per single run; ops/sec is 1,000,000 divided by that — the two are the same data, different lenses.'],
      ['Is my code uploaded?','No. The snippets are evaluated inside your browser only.']],
    conclusion: '<p>The next time a code review turns into an argument, bring this <strong>benchmark builder</strong> and let the tab do the arguing. Pair it with <a href="../coding/regex-tester.html">regex tester</a> when the contested lines happen to be regular expressions.</p>'
  }
});

/* ========================================================================
   7. DOCKER RUN TO DOCKER COMPOSE CONVERTER
   ======================================================================== */
add({
  file: 'docker-run-to-compose.html', folder: 'coding',
  name: 'Docker Run to Docker Compose Converter', tag: 'Docker', icon: 'fa-brands fa-docker',
  title: 'Docker Run to Compose | Convert docker run CLI to docker-compose.yml',
  metaDesc: 'Turn a docker run command into a docker-compose.yml service automatically. Handles ports, environment, volumes, restart and more, offline.',
  desc: 'Paste a docker run command and get a ready-to-use docker-compose service block. Images, ports, env vars, volumes, restart policies and entrypoints are mapped for you.',
  keywords: ['docker run to compose', 'docker run to docker compose', 'docker compose converter', 'docker run command to yaml', 'compose file generator', 'docker run to compose file', 'docker compose yaml from run', 'docker cli to compose', 'compose service generator', 'docker run flags to compose'],
  featureList: ['docker run parsing', 'Ports and publishes', 'Environment variables', 'Volumes and mounts', 'Restart policies', '100% client-side'],
  panel: panel.wrap('dc', 'fa-brands fa-docker', 'Docker Run to Compose',
    '<div class="io-field"><label for="dcIn">docker run command</label><textarea id="dcIn"spellcheck="false"placeholder="docker run -d --name web -p 8080:80 -e MODE=prod -v ./html:/usr/share/nginx/html --restart unless-stopped nginx:latest"></textarea></div>' +
    '<div class="field"style="max-width:320px;margin-top:12px"><label for="dcName">Service name</label><input id="dcName"type="text"spellcheck="false"value="app"placeholder="app"></div>' +
    '<div class="io-field"style="margin-top:12px"><label for="dcOut">docker-compose.yml service</label><textarea id="dcOut"readonly spellcheck="false"placeholder="Compose YAML appears here…"></textarea></div>' +
    panel.actions('dc', 'Convert') ),
  css: '.dc-panel textarea{min-height:180px}',
  js: String.raw`
    function dcTokens(cmd){
      var toks = [], cur = "", q = null;
      for (var i = 0; i < cmd.length; i++) {
        var c = cmd.charAt(i);
        if (q) { if (c === q) q = null; else cur += c; continue; }
        if (c === '"' || c === "'") { q = c; continue; }
        if (c === " " || c === "\t") { if (cur) { toks.push(cur); cur = ""; } continue; }
        cur += c;
      }
      if (cur) toks.push(cur);
      return toks;
    }
    var DC_TAKES = { "--name":1, "-n":1, "--restart":1, "-p":1, "--publish":1, "-e":1, "--env":1, "--env-var":1, "--env-file":1, "-v":1, "--volume":1, "--mount":1, "--network":1, "--net":1, "--entrypoint":1, "--hostname":1, "--cap-add":1, "--gpus":1, "--cpus":1, "--memory":1, "-m":1, "--user":1, "-u":1, "--workdir":1, "-w":1, "--platform":1, "--pull":1, "--label":1, "-l":1, "--health-cmd":1 };
    var DC_BOOL = { "-d":1, "--detach":1, "--rm":1, "--privileged":1, "-P":1, "--publish-all":1, "-it":1, "-ti":1, "-i":1, "-t":1, "--tty":1, "--interactive":1 };
    function dcY(s){
      s = String(s);
      return /^[A-Za-z0-9_.\/:@-]+$/.test(s) && !/^(true|false|null|~|\d+)$/.test(s) ? s : JSON.stringify(s);
    }
    function dcConvert(cmd, name){
      var toks = dcTokens(cmd);
      var i = (toks[0] === "docker" && toks[1] === "run") ? 2 : 0;
      var svc = { image: null, container_name: null, restart: null, ports: [], envMap: [], envList: [], volumes: [], command: null, entrypoint: null, hostname: null, privileged: false, network_mode: null, env_file: null, capAdd: [], cpus: null, memory: null, gpus: null, publishAll: false };
      for (; i < toks.length; i++) {
        var t = toks[i], key = t, inline = null, value = null;
        var eq = t.indexOf("=");
        if (eq > 0 && t.charAt(0) === "-") { key = t.slice(0, eq); inline = t.slice(eq + 1); }
        var isFlag = t.charAt(0) === "-";
        if (isFlag && DC_TAKES[key] === 1) {
          value = inline !== null ? inline : toks[i + 1];
          if (inline === null) {
            if (value === undefined || (value && value.charAt(0) === "-")) value = null; else i++;
          }
        }
        if (!isFlag) {
          if (svc.image === null) svc.image = t;
          else svc.command = svc.command === null ? t : svc.command + " " + t;
          continue;
        }
        switch (key) {
          case "--name": case "-n": svc.container_name = value; break;
          case "--restart": svc.restart = value; break;
          case "-p": case "--publish": if (value !== null) svc.ports.push(String(value)); break;
          case "-P": case "--publish-all": svc.publishAll = true; break;
          case "-e": case "--env": case "--env-var":
            if (value !== null) {
              var ei = value.indexOf("=");
              if (ei >= 0) svc.envMap.push({ k: value.slice(0, ei), v: value.slice(ei + 1) });
              else svc.envList.push(value);
            }
            break;
          case "--env-file": if (value !== null) svc.env_file = value; break;
          case "-v": case "--volume": if (value !== null) svc.volumes.push(String(value)); break;
          case "--mount": if (value !== null) svc.volumes.push("mount:" + value); break;
          case "--network": case "--net": if (value !== null) svc.network_mode = value; break;
          case "--entrypoint": if (value !== null) svc.entrypoint = value; break;
          case "--hostname": if (value !== null) svc.hostname = value; break;
          case "--privileged": svc.privileged = true; break;
          case "--cap-add": if (value !== null) svc.capAdd.push(String(value)); break;
          case "--gpus": if (value !== null) svc.gpus = value; break;
          case "--cpus": if (value !== null) svc.cpus = value; break;
          case "--memory": case "-m": if (value !== null) svc.memory = value; break;
        }
      }
      var L = [];
      L.push("services:");
      L.push("  " + (name || "app") + ":");
      if (svc.image) L.push("    image: " + dcY(svc.image));
      if (svc.container_name) L.push("    container_name: " + dcY(svc.container_name));
      if (svc.hostname) L.push("    hostname: " + dcY(svc.hostname));
      if (svc.privileged) L.push("    privileged: true");
      if (svc.restart) L.push("    restart: " + dcY(svc.restart));
      if (svc.entrypoint) L.push("    entrypoint: " + dcY(svc.entrypoint));
      if (svc.ports.length || svc.publishAll) {
        L.push("    ports:");
        if (svc.publishAll && !svc.ports.length) L.push("      - published");
        svc.ports.forEach(function(p){ L.push("      - " + JSON.stringify(p)); });
      }
      if (svc.envMap.length || svc.envList.length) {
        L.push("    environment:");
        svc.envMap.forEach(function(e){ L.push("      " + (e.k || "") + ": " + dcY(e.v === null || e.v === undefined ? "" : e.v)); });
        svc.envList.forEach(function(k){ L.push("      - " + dcY(k)); });
      }
      if (svc.env_file) L.push("    env_file: " + dcY(svc.env_file));
      if (svc.volumes.length) { L.push("    volumes:"); svc.volumes.forEach(function(v){ L.push("      - " + dcY(v)); }); }
      if (svc.capAdd.length) { L.push("    cap_add:"); svc.capAdd.forEach(function(c){ L.push("      - " + c); }); }
      if (svc.network_mode) L.push("    network_mode: " + dcY(svc.network_mode));
      if (svc.cpus) L.push("    cpus: " + dcY(svc.cpus));
      if (svc.memory) L.push("    mem_limit: " + dcY(svc.memory));
      if (svc.gpus) L.push("    gpus: " + dcY(svc.gpus));
      if (svc.command) L.push("    command: " + dcY(svc.command));
      return L.join("\n");
    }
    function run(){
      var cmd = document.getElementById("dcIn").value.trim();
      var out = document.getElementById("dcOut");
      var proc = document.querySelector("#dcProc");
      if (!cmd) { out.value = ""; proc.textContent = "Paste a docker run command to convert."; return; }
      try {
        out.value = dcConvert(cmd, document.getElementById("dcName").value.trim());
        proc.textContent = "Compose service generated in this tab.";
      } catch (e) { out.value = ""; proc.textContent = "Could not parse the command: " + e.message; }
    }
    document.getElementById("dcGo").addEventListener("click", run);
    document.getElementById("dcIn").addEventListener("input", run);
    document.getElementById("dcName").addEventListener("input", run);
    document.getElementById("dcCopy").addEventListener("click", function(){ window.Troolify.copyToClipboard(document.getElementById("dcOut").value, function(){ document.querySelector("#dcProc").textContent = "Compose YAML copied to clipboard."; }); });
    document.getElementById("dcSample").addEventListener("click", function(){
      document.getElementById("dcIn").value = "docker run -d --name web -p 8080:80 -e MODE=prod -e DEBUG=1 -v ./html:/usr/share/nginx/html --restart unless-stopped nginx:latest";
      document.getElementById("dcName").value = "web";
      run();
    });
    document.getElementById("dcClear").addEventListener("click", function(){ document.getElementById("dcIn").value = ""; document.getElementById("dcOut").value = ""; });
  `,
  article: {
    title: 'Docker Run to Docker Compose Converter: Get Your Container to the Manifest',
    lead: '<p>Someday, that one-off <code>docker run</code> becomes a service the team needs. This <strong>docker run to docker compose converter</strong> turns a CLI command into a <code>docker-compose.yml</code> service block, mapping image, ports, environment, volumes, restart policy and more — including a <code>docker compose up</code>-ready YAML you can paste and edit.</p>',
    sections: [
      { id: 'mapping', icon: 'fa-solid fa-diagram-project', heading: 'What maps into the service block', html: '<p>The image becomes <code>image:</code>, <code>--name</code> becomes <code>container_name</code>, each <code>-p</code> becomes a quoted ports entry, <code>-e KEY=value</code> becomes an <code>environment:</code> mapping, and <code>-v</code> and <code>--mount</code> become <code>volumes:</code> entries. <code>--restart</code>, <code>--network</code>, <code>--entrypoint</code>, <code>--hostname</code>, <code>--privileged</code>, <code>--cap-add</code>, <code>--cpus</code> and <code>--memory</code> are carried across.</p>' },
      { id: 'positional', icon: 'fa-solid fa-list', heading: 'Image and command detection', html: '<p>The first non-flag token after the flags is the image. Anything that follows becomes the container <code>command:</code>, re-joined sensibly. Quoted segments survive tokenizing, so <code>nginx -g "daemon off;"</code> stays one command.</p>' },
      { id: 'limits', icon: 'fa-solid fa-circle-info', heading: 'A pragmatic subset', html: '<p>Volumes work best in their simple <code>host:container</code> form, and advanced options like <code>--device</code> or inline health-check flags are accepted but not mapped. Compare the result against your <code>docker compose config</code> when in doubt.</p>' }
    ],
    steps: [
      'Paste a docker run command (with or without the leading docker run).',
      'Adjust the service name if you want something other than app.',
      'Copy the YAML into your compose file and iterate from there.'
    ],
    facts: [['Image','First positional token'],['Ports','-p and -P supported'],['Env','-e inline or next token'],['Restart','--restart mapped'],['Scope','Local conversion']],
    useCases: [
      ['Formalizing ad-hoc containers', 'Turn the command you run every morning into a tracked compose service.'],
      ['Team handover', 'Ship a readable manifest instead of a screenshot of a terminal.'],
      ['Migrating to compose', 'Convert existing run commands file-by-file when adopting Compose.']],
    tips: [
      'Keep one port per -p so the mapping stays predictable.',
      'Use the sample to see how a full example renders before pasting your own.',
      'Validate the output with docker compose config once, especially in CI.'
    ],
    takeaways: [['flags','mapped to compose keys'],['yaml','copy-ready block'],['local','runs in the tab']],
    faq: [
      ['Does the leading docker run need to be present?','Either way works; the converter skips the docker run prefix when it is there.'],
      ['Which flags are supported?','Name, restart, ports, env, env-file, volumes, mounts, network, entrypoint, hostname, privileged, cap-add, gpus, cpus and memory — the everyday set.'],
      ['How are environment variables mapped?','KEY=value becomes a mapping entry; a bare KEY with no equals becomes a plain list entry.'],
      ['Is the image required?','Yes — the first non-flag token is taken as the image and appears as image: in the output.'],
      ['Does it run online?','No, the parsing happens entirely in your browser.']],
    conclusion: '<p>Containers started by hand are containers destined to be forgotten. This <strong>docker run to docker compose converter</strong> makes versioning them cheap, and the <a href="../testing/benchmark-builder.html">benchmark builder</a> can even tell you which image config runs faster.</p>'
  }
});

/* ========================================================================
   8. OTP CODE GENERATOR AND VALIDATOR
   ======================================================================== */
add({
  file: 'otp-code-generator-and-validator.html', folder: 'crypto',
  name: 'OTP Code Generator and Validator', tag: 'Security', icon: 'fa-solid fa-shield-halved',
  title: 'OTP Code Generator & Validator | TOTP Authenticator Online',
  metaDesc: 'Generate TOTP codes from a base32 secret (SHA-1/256/512) and validate codes against the current window. A fully client-side authenticator.',
  desc: 'Turn any base32 TOTP secret into the current 6-8 digit code, live, or validate a code you were sent. SHA-1, SHA-256 and SHA-512, all in your browser.',
  keywords: ['otp generator', 'totp generator', 'otp validator', 'totp authenticator online', 'one time password generator', 'totp code generator', '2fa code generator', 'totp secret to code', 'otp code validator', 'authenticator code online'],
  featureList: ['RFC 6238 TOTP', 'SHA-1 / SHA-256 / SHA-512', '6-8 digit codes', '30s / 60s periods', 'Validates +/- 1 window', '100% client-side'],
  panel: panel.wrap('ot', 'fa-solid fa-shield-halved', 'OTP Code Generator & Validator',
    '<div class="io-field"><label for="otSecret">Base32 secret</label><input id="otSecret"type="text"spellcheck="false"autocomplete="off"placeholder="JBSWY3DPEHPK3PXP"></div>' +
    '<div class="row3"style="margin-top:14px"><div class="field"><label for="otDigits">Digits</label><select id="otDigits"><option value="6"selected>6</option><option value="7">7</option><option value="8">8</option></select></div><div class="field"><label for="otPeriod">Period (seconds)</label><select id="otPeriod"><option value="30"selected>30</option><option value="60">60</option></select></div><div class="field"><label for="otAlgo">Algorithm</label><select id="otAlgo"><option value="SHA-1"selected>SHA-1</option><option value="SHA-256">SHA-256</option><option value="SHA-512">SHA-512</option></select></div></div>' +
    '<div class="result-card"style="margin-top:16px"><div class="result-grid"><div class="result-tile"style="grid-column:1/-1"><span class="rt-label">Current code</span><div class="rt-value"id="otCode"style="font-size:34px;letter-spacing:8px;font-variant-numeric:tabular-nums">------</div><div class="rt-sub"id="otLeft"></div></div></div></div>' +
    '<div class="row3"style="margin-top:16px"><div class="field"><label for="otCheck">Code to validate</label><input id="otCheck"type="text"inputmode="numeric"spellcheck="false"autocomplete="off"placeholder="Paste a code"></div><div class="field"style="grid-column:1/3"><label for="otResult">Validation result</label><textarea id="otResult"readonly rows="3"style="min-height:64px;resize:none;background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:10px;padding:10px 12px;font-family:inherit;font-size:13.5px;width:100%;box-sizing:border-box"placeholder="Valid, expired or incorrect…"></textarea></div></div>' +
    '<div class="actions"><button class="btn btn-ghost"type="button"id="otAuto"><i class="fa-solid fa-dice"></i>Random secret</button><button class="btn btn-ghost"type="button"id="otVal"><i class="fa-solid fa-check"></i>Validate code</button></div>' +
    panel.actions('ot', 'Generate code') ),
  css: '.ot-panel textarea{min-height:100px}',
  js: String.raw`
    var OT_B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    function base32Decode(s){
      s = String(s).toUpperCase().replace(/[^A-Z2-7]/g, "");
      var bits = 0, val = 0, out = [];
      for (var i = 0; i < s.length; i++) {
        var idx = OT_B32.indexOf(s.charAt(i));
        if (idx < 0) continue;
        val = (val << 5) | idx;
        bits += 5;
        if (bits >= 8) { out.push((val >>> (bits - 8)) & 255); bits -= 8; }
      }
      return new Uint8Array(out);
    }
    function otRandSecret(len){
      var bytes = crypto.getRandomValues(new Uint8Array(len || 20));
      var s = "";
      for (var i = 0; i < bytes.length; i++) s += OT_B32.charAt(bytes[i] % 32);
      return s;
    }
    function hotp(key, counter, digits, algo){
      var buf = new ArrayBuffer(8), dv = new DataView(buf);
      dv.setUint32(0, counter >>> 0, false);
      dv.setUint32(4, 0, false);
      return crypto.subtle.importKey("raw", key, { name: "HMAC", hash: algo }, false, ["sign"])
        .then(function(k){ return crypto.subtle.sign("HMAC", k, buf); })
        .then(function(sig){
          var arr = new Uint8Array(sig);
          var off = arr[arr.length - 1] & 15;
          var bin = ((arr[off] & 127) << 24) | (arr[off + 1] << 16) | (arr[off + 2] << 8) | arr[off + 3];
          var pow = 1; for (var p = 0; p < digits; p++) pow *= 10;
          return ("0000000000" + (bin % pow)).slice(-digits);
        });
    }
    function otConfig(){
      return {
        sec: document.getElementById("otSecret").value.trim(),
        digits: parseInt(document.getElementById("otDigits").value, 10) || 6,
        period: parseInt(document.getElementById("otPeriod").value, 10) || 30,
        algo: document.getElementById("otAlgo").value
      };
    }
    function otCode(cfg, offset){
      var counter = Math.floor(Date.now() / 1000 / cfg.period) + (offset || 0);
      return hotp(base32Decode(cfg.sec), counter, cfg.digits, cfg.algo);
    }
    function otRender(){
      var cfg = otConfig();
      var el = document.getElementById("otCode"), left = document.getElementById("otLeft");
      if (!cfg.sec) { el.textContent = "------"; left.textContent = "Paste a base32 secret or generate a random one."; return; }
      if (!/^[A-Za-z2-7]+$/.test(cfg.sec.toUpperCase()) || base32Decode(cfg.sec).length === 0) { el.textContent = "??????"; left.textContent = "That secret is not valid base32."; return; }
      otCode(cfg, 0).then(function(code){
        el.textContent = code;
        var rem = cfg.period - (Math.floor(Date.now() / 1000) % cfg.period);
        left.textContent = "Changes in " + rem + "s - " + cfg.algo + ", " + cfg.digits + " digits, " + cfg.period + "s period";
      }).catch(function(){ el.textContent = "??????"; left.textContent = "This browser needs a secure context (https or localhost)."; });
    }
    function otValidate(){
      var cfg = otConfig();
      var input = document.getElementById("otCheck").value.trim();
      var res = document.getElementById("otResult");
      if (!cfg.sec || !input) { res.value = "Add a secret and a code to validate."; return; }
      otCode(cfg, 0).then(function(cur){
        return Promise.all([cur, otCode(cfg, -1), otCode(cfg, 1)]);
      }).then(function(codes){
        if (input === codes[0]) res.value = "VALID - this is the current code.";
        else if (input === codes[1]) res.value = "EXPIRED - this was the previous code window.";
        else if (input === codes[2]) res.value = "FUTURE - this code belongs to the next window.";
        else res.value = "INCORRECT - no match in the current, previous or next window.";
        document.querySelector("#otProc").textContent = "Validation finished in this tab.";
      }).catch(function(){ res.value = "Check the secret (valid base32) and retry."; });
    }
    document.getElementById("otGo").addEventListener("click", otRender);
    document.getElementById("otCopy").addEventListener("click", function(){ window.Troolify.copyToClipboard(document.getElementById("otCode").textContent, function(){ document.querySelector("#otProc").textContent = "Code copied to clipboard."; }); });
    document.getElementById("otAuto").addEventListener("click", function(){ document.getElementById("otSecret").value = otRandSecret(20); otRender(); });
    document.getElementById("otVal").addEventListener("click", otValidate);
    document.getElementById("otCheck").addEventListener("keydown", function(e){ if (e.key === "Enter") otValidate(); });
    document.getElementById("otSecret").addEventListener("input", otRender);
    document.getElementById("otDigits").addEventListener("change", otRender);
    document.getElementById("otPeriod").addEventListener("change", otRender);
    document.getElementById("otAlgo").addEventListener("change", otRender);
    document.getElementById("otSample").addEventListener("click", function(){
      document.getElementById("otSecret").value = "JBSWY3DPEHPK3PXP";
      document.getElementById("otDigits").value = "6";
      document.getElementById("otPeriod").value = "30";
      document.getElementById("otAlgo").value = "SHA-1";
      otRender();
    });
    document.getElementById("otClear").addEventListener("click", function(){ document.getElementById("otSecret").value = ""; document.getElementById("otCheck").value = ""; document.getElementById("otResult").value = ""; otRender(); });
    if (window.crypto && crypto.subtle) setInterval(otRender, 1000); else document.getElementById("otLeft").textContent = "Requires a secure context (https or localhost) for WebCrypto.";
    otRender();
  `,
  article: {
    title: 'OTP Code Generator and Validator: Authenticate Like a Hardware Key',
    lead: '<p>Two-factor codes follow the RFC 6238 time-based algorithm — a shared secret, the current time, and HMAC. This <strong>OTP code generator and validator</strong> does the math in your browser: paste a base32 secret to see the live code, or validate a code you were handed against the current window.</p><p>Secrets never leave your machine, and WebCrypto provides the HMAC locally.</p>',
    sections: [
      { id: 'totp', icon: 'fa-solid fa-clock', heading: 'How TOTP codes are built', html: '<p>The Unix time is divided by the period (30 or 60 seconds), the counter is HMAC-signed with the decoded secret key, and a dynamic truncation extracts six to eight digits. Because both sides share the same secret and clock, the code can be verified without any server round-trip.</p>' },
      { id: 'algorithms', icon: 'fa-solid fa-microchip', heading: 'SHA-1, SHA-256 or SHA-512', html: '<p>Most authenticators default to HMAC-SHA-1, but the validator also supports SHA-256 and SHA-512 variants used by some apps. Select the matching option or the generated code will never line up with your app.</p>' },
      { id: 'validate', icon: 'fa-solid fa-shield-halved', heading: 'Validation with clock drift tolerance', html: '<p>The validator checks the current, previous and next windows, which absorbs a few seconds of client/server clock drift. A code your app rejects while this page says VALID usually means a seconds-level clock skew — sync your time and retry.</p>' }
    ],
    steps: [
      'Paste a base32 secret (from a QR setup or your provider) — or generate a random one.',
      'Pick the digits, period and algorithm that match your authenticator app.',
      'Copy the live code, or paste a code into the validator to check it.'
    ],
    facts: [['Std','RFC 6238 TOTP'],['Algo','SHA-1/256/512'],['Digits','6-8'],['Windows','+/- 1 checked'],['Privacy','All local']],
    useCases: [
      ['Recovering a lost device', 'Compute the current code from the backup secret while setting up a new authenticator.'],
      ['Testing automation', 'Add TOTP to your own scripts by deriving the expected code locally.'],
      ['Learning 2FA', 'Understand exactly what your authenticator computes on every tap.']],
    tips: [
      'The secret is entered without spaces; the decoder strips anything outside A-Z, 2-7 anyway.',
      'Always match the algorithm and digits your service uses, or codes will never match.',
      'Keep secrets only on devices you trust — anyone with the secret can derive every future code.'
    ],
    takeaways: [['totp','RFC 6238'],['algo','SHA-1/256/512'],['validate','+/- 1 window']],
    faq: [
      ['Where do I find my base32 secret?','QR-code settups encode it; many services also offer a manual key that is exactly the base32 string this tool expects.'],
      ['Why does my app\'s code differ from mine?','Likely a different algorithm (SHA-256/512), digits, or a few seconds of clock skew. Check the settings and your device time.'],
      ['Is this safe to use for real 2FA?','It computes the same RFC 6238 math your authenticator does. Use it on machines you trust, and never paste live codes into unknown sites.'],
      ['Can it validate codes from any provider?','If the provider follows standard TOTP (secret, digits, period, algorithm), yes.'],
      ['Is the secret uploaded?','No. All HMAC computation runs in your browser via WebCrypto — nothing leaves the page.']],
    conclusion: '<p>Two-factor math is simple once you can watch it run. This <strong>OTP code generator and validator</strong> keeps the TOTP computation local and transparent, and it pairs neatly with <a href="rsa-key-pair-generator.html">RSA key pair generator</a> if key-based auth is more your speed.</p>'
  }
});

/* ========================================================================
   9. BASE64 FILE CONVERTER
   ======================================================================== */
add({
  file: 'base64-file-converter.html', folder: 'coding',
  name: 'Base64 File Converter', tag: 'Files', icon: 'fa-solid fa-file-arrow-up',
  title: 'Base64 File Converter | Encode or Decode Files as Base64',
  metaDesc: 'Convert any file to a base64 data URL or raw base64, then decode it back to a downloadable file. Fully offline file-to-text conversion.',
  desc: 'Turn any file into base64 text — as a data URL for &lt;img&gt;, &lt;script&gt; or &lt;style&gt;, or raw base64 — and decode base64 back into a downloadable file.',
  keywords: ['base64 file converter', 'file to base64', 'base64 to file', 'data url converter', 'encode file base64', 'pdf to base64', 'image to base64 file', 'base64 decode to file', 'file to base64 online', 'data uri generator'],
  featureList: ['Drag & drop encoding', 'Data URL or raw base64', 'Decode back to a file', 'Filestem from MIME type', 'Runs on large files', '100% client-side'],
  panel: panel.wrap('bf', 'fa-solid fa-file-arrow-up', 'Base64 File Converter',
    '<div class="field"><label for="bfMode">Output format</label><select id="bfMode"><option value="dataurl"selected>Data URL (data:...)</option><option value="raw">Raw base64</option></select></div>' +
    '<div class="field"style="margin-top:12px"><input id="bfFile"type="file"style="padding:8px"><div id="bfDrop"style="border:2px dashed var(--border);border-radius:14px;padding:22px;text-align:center;margin-top:8px;color:var(--faint);cursor:pointer;background:#1B2028;font-weight:700;font-size:14px">Drop a file here or click to choose</div></div>' +
    '<div class="io-field"style="margin-top:14px"><label for="bfOut">Encoded output</label><textarea id="bfOut"readonly spellcheck="false"placeholder="Data URL or base64 appears here…"></textarea></div>' +
    '<div class="io-grid two"style="margin-top:14px"><div class="io-field"><label for="bfDec">Decode base64 / data URL</label><textarea id="bfDec"spellcheck="false"style="min-height:90px"placeholder="Paste base64 or a data URL, then press Save decoded file…"></textarea></div><div class="io-field"><label for="bfName">Output file name</label><input id="bfName"type="text"spellcheck="false"placeholder="download"></div></div>' +
    '<div class="actions"><button class="btn btn-ghost"type="button"id="bfSave"><i class="fa-solid fa-download"></i>Save decoded file</button></div>' +
    panel.actions('bf', 'Encode file') ),
  css: '.bf-panel textarea{min-height:150px}',
  js: String.raw`
    function bfEncodeFile(file){
      var mode = document.getElementById("bfMode").value;
      var fr = new FileReader();
      fr.onload = function(){
        var dataUrl = String(fr.result);
        document.getElementById("bfOut").value = mode === "raw" ? dataUrl.slice(dataUrl.indexOf(",") + 1) : dataUrl;
        document.querySelector("#bfProc").textContent = "Encoded " + file.name + " (" + (file.size || 0) + " bytes) in this tab.";
      };
      fr.onerror = function(){ document.querySelector("#bfProc").textContent = "Could not read that file."; };
      fr.readAsDataURL(file);
    }
    function bfPick(){
      var f = document.getElementById("bfFile").files[0];
      if (f) bfEncodeFile(f);
    }
    document.getElementById("bfGo").addEventListener("click", bfPick);
    document.getElementById("bfFile").addEventListener("change", bfPick);
    var drop = document.getElementById("bfDrop");
    drop.addEventListener("click", function(){ document.getElementById("bfFile").click(); });
    drop.addEventListener("dragover", function(e){ e.preventDefault(); drop.style.borderColor = "var(--accent)"; });
    drop.addEventListener("dragleave", function(){ drop.style.borderColor = "var(--border)"; });
    drop.addEventListener("drop", function(e){
      e.preventDefault();
      drop.style.borderColor = "var(--border)";
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) bfEncodeFile(e.dataTransfer.files[0]);
    });
    document.getElementById("bfSave").addEventListener("click", function(){
      var s = document.getElementById("bfDec").value.trim();
      var name = document.getElementById("bfName").value.trim() || "download";
      var mime = "application/octet-stream", data = s;
      if (/^data:/i.test(s)) {
        var cs = s.slice(5);
        var semi = cs.indexOf(";"), comma = cs.indexOf(",");
        var endMime = semi >= 0 ? semi : comma;
        if (endMime < 0) endMime = 0;
        mime = cs.slice(0, endMime) || mime;
        data = cs.slice(comma + 1);
      }
      try {
        var bin = atob(data.replace(/\\s+/g, ""));
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        var ext = (mime.split("/")[1] || "").replace("+", "");
        var blob = new Blob([bytes], { type: mime });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = name + (ext && name.indexOf(".") < 0 ? "." + ext : "");
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function(){ URL.revokeObjectURL(url); }, 5000);
        document.querySelector("#bfProc").textContent = "Decoded " + bytes.length + " bytes and started the download.";
      } catch (e) { document.querySelector("#bfProc").textContent = "Could not decode: the text is not valid base64."; }
    });
    document.getElementById("bfSample").addEventListener("click", function(){
      document.getElementById("bfDec").value = "SGVsbG8sIFRyb29saWZ5IQ==";
      document.getElementById("bfName").value = "hello.txt";
      document.querySelector("#bfProc").textContent = "Sample base64 pasted - press Save decoded file to download hello.txt.";
    });
    document.getElementById("bfClear").addEventListener("click", function(){ document.getElementById("bfFile").value = ""; document.getElementById("bfOut").value = ""; document.getElementById("bfDec").value = ""; });
  `,
  article: {
    title: 'Base64 File Converter: Move Any File Through Plain Text',
    lead: '<p>Base64 lets binary data ride along inside JSON, email, URLs and inline styles. This <strong>base64 file converter</strong> turns any file into a data URL or raw base64 string — and turns base64 back into a downloadable file — with a drag-and-drop, fully offline flow.</p>',
    sections: [
      { id: 'encode', icon: 'fa-solid fa-arrow-up-from-bracket', heading: 'Encoding a file', html: '<p>Drop a file or pick one and you get either the full <code>data:</code> URL (perfect for <code>&lt;img src&gt;</code>, <code>&lt;style&gt;</code> and inline embeds) or the raw base64 payload for APIs that expect just the text. The panel reports the original size so you can estimate the ~33% size increase.</p>' },
      { id: 'decode', icon: 'fa-solid fa-arrow-down-to-bracket', heading: 'Decoding back to a file', html: '<p>Paste raw base64 or a full data URL into the decode box and press Save decoded file. The MIME type inside the data URL becomes the suggested file extension (<code>application/pdf</code> &rarr; <code>.pdf</code>), and the browser downloads the freshly reconstructed file.</p>' },
      { id: 'use', icon: 'fa-solid fa-diagram-project', heading: 'Where this pattern is useful', html: '<p>Embedding small assets in single-file HTML, sending binary payloads through text-only APIs, storing file blobs in localStorage or in database TEXT columns, and pasting images into bug reports that only accept text.</p>' }
    ],
    steps: [
      'Drop a file onto the zone or use Encode file.',
      'Choose Data URL or raw base64 and copy the result.',
      'To go the other way, paste base64 and press Save decoded file.'
    ],
    facts: [['Encoding','Drag & drop or file picker'],['Format','Data URL or raw base64'],['Decoding','Reconstructs the file'],['Extension','Suggested from MIME type'],['Privacy','Fully offline']],
    useCases: [
      ['Inline assets', 'Turn a logo into a data URL for a self-contained HTML page.'],
      ['Text-only APIs', 'Send files through JSON endpoints as base64 strings.'],
      ['Embedding in code', 'Pastable base64 in demos, dashboards and docs.']],
    tips: [
      'Base64 is about 33% larger than the original file — plan for it in size limits.',
      'A data URL contains the MIME type; raw base64 is just the payload, so keep the type in mind.',
      'For very large files the page still works, but a few hundred MB may be slow in older browsers.'
    ],
    takeaways: [['encode','file -> data URL / base64'],['decode','base64 -> downloadable file'],['local','nothing uploaded']],
    faq: [
      ['Why is base64 bigger than the original file?','Each group of three bytes becomes four base64 characters, adding roughly 33% overhead plus any data-URL prefix.'],
      ['Can I decode a data URL directly?','Yes — the decode box accepts both raw base64 and full data: URLs and picks the MIME type from the latter.'],
      ['Is this safe for passwords or secrets?','Base64 is encoding, not encryption. Anyone who sees the string can decode it.'],
      ['What file types are supported?','Any file — images, PDFs, archives, executables. The browser reads them as raw bytes.'],
      ['Is the file uploaded anywhere?','No. Every conversion happens locally in your browser.']],
    conclusion: '<p>Whenever a system insists on text but your artifact is binary, this <strong>base64 file converter</strong> is the adaptor. For the string-level version of the same idea, grab the <a href="base64-encoder-decoder.html">base64 encoder &amp; decoder</a>.</p>'
  }
});

/* ---------- emit pages + register ---------- */
const entries = [];
for (const spec of TOOLS) {
  const html = buildPage(spec);
  const outPath = path.join(ROOT, 'tools', spec.folder, spec.file);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
  entries.push({
    name: spec.name, desc: spec.desc, icon: spec.icon, tag: spec.tag,
    category: catFolder(spec.folder), href: 'tools/' + spec.folder + '/' + spec.file, keywords: spec.keywords
  });
  console.log('wrote', path.relative(ROOT, outPath), '(' + html.length + ' bytes)');
}
const res = registerTools(entries);
console.log('registry: added', res.added, 'skipped', res.skipped);