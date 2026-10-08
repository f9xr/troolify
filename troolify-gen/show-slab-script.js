const t = require('fs').readFileSync('tools/construction/concrete-slab-calculator.html', 'utf8');
const i = t.indexOf('<script src="../../assets/js/tool-page.min.js"');
console.log(JSON.stringify(t.slice(i, i + 260)));
