const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const snip =
  '<meta name="google-adsense-account"content="ca-pub-9769892721842144">' +
  '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9769892721842144"crossorigin="anonymous"></script>';
let added = 0, skipped = 0, failed = 0;
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    if (f === 'node_modules' || f === '.git') continue;
    const q = path.join(dir, f);
    const st = fs.statSync(q);
    if (st.isDirectory()) walk(q);
    else if (f.endsWith('.html')) {
      let t = fs.readFileSync(q, 'utf8');
      if (t.includes('pagead2.googlesyndication.com')) { skipped++; continue; }
      if (!t.includes('</head>')) { console.log('NO </head>:', q); failed++; continue; }
      t = t.replace('</head>', snip + '</head>');
      fs.writeFileSync(q, t);
      added++;
    }
  }
}
walk(root);
console.log('AdSense loader -> added:', added, 'skipped:', skipped, 'failed:', failed);
