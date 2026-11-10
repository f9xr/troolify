const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (let i=0; i<list.length; i++) {
    const file = list[i];
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith('.html')) {
      results.push(filePath);
    }
  }
  return results;
}
const files = walk('tools');
let broken = 0;
for (let i=0; i<files.length; i++) {
  const f = files[i];
  const content = fs.readFileSync(f, 'utf8');
  const regex = /href=["']([^"']+\.html)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const href = match[1];
    if (href.indexOf('http') === 0 || href.charAt(0) === '#' || href.indexOf('mailto:') === 0) continue;
    const resolved = path.resolve(path.dirname(f), href);
    if (!fs.existsSync(resolved)) {
      broken++;
      if (broken <= 15) console.log('BROKEN:', f, '->', href);
    }
  }
}
console.log('TOTAL BROKEN:', broken);
