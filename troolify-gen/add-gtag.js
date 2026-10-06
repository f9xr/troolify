const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const tag =
  '<script async src="https://www.googletagmanager.com/gtag/js?id=G-1D3C2DDCHV"></script>' +
  '<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}' +
  "gtag('js',new Date());gtag('config','G-1D3C2DDCHV');</script>";
let added = 0, skipped = 0, failed = 0;
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const q = path.join(dir, f);
    const st = fs.statSync(q);
    if (st.isDirectory()) {
      if (f !== 'node_modules' && f !== '.git') walk(q);
    } else if (f.endsWith('.html')) {
      let t = fs.readFileSync(q, 'utf8');
      if (t.includes('googletagmanager')) { skipped++; continue; }
      if (!t.includes('</head>')) { console.log('NO </head>:', q); failed++; continue; }
      t = t.replace('</head>', tag + '</head>');
      fs.writeFileSync(q, t);
      added++;
    }
  }
}
walk(root);
console.log('added:', added, 'skipped:', skipped, 'failed:', failed);
