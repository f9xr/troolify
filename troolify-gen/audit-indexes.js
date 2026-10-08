const fs = require('fs');
global.window = {};
eval(fs.readFileSync('assets/js/tools-data.js', 'utf8'));
const cats = global.window.CATEGORIES;
for (const c of cats) {
  const p = 'tools/' + c.folder.toLowerCase() + '/index.html';
  try {
    const t = fs.readFileSync(p, 'utf8');
    const dataCat = (t.match(new RegExp('data-category="([^"]+)"')) || [])[1];
    const ti = t.indexOf('<title>'); const tj = t.indexOf('</title>', ti);
    const title = ti >= 0 ? t.slice(ti + 7, tj) : '';
    if (dataCat !== c.folder) {
      console.log(p, '| data-category=' + dataCat + ' (expected ' + c.folder + ')');
    } else if (!title || title.toLowerCase().indexOf(c.name.toLowerCase().replace(/ tools$/i, '').trim()) === -1) {
      console.log(p, '| title=' + JSON.stringify(title));
    }
  } catch (e) {
    console.log(p, 'MISSING');
  }
}
const dirs = fs.readdirSync('tools').filter(x => fs.statSync('tools/' + x).isDirectory());
for (const d of dirs) {
  if (!cats.find(c => c.folder.toLowerCase() === d)) console.log('UNREGISTERED FOLDER tools/' + d);
}
console.log('audit done');
