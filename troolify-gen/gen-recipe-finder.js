/* ============================================================================
   Troolify - Recipe Finder
   Search the TheMealDB public API by dish name or ingredient, or pull a random
   recipe, then open the full method (ingredients, steps, video, source) in a
   modal. Everything runs from the visitor's browser - Troolify stores nothing.
   Category: Cooking (tools/cooking/)
   Run: node troolify-gen/gen-recipe-finder.js   (from the repo root)
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { buildPage, registerTools, CATMAP } = require('./tool-page-lib');

const ROOT = path.resolve(__dirname, '..');
const catFolder = f => (CATMAP[f] || {}).folder || f;

const RF_CSS =
  '.rf-hint{margin-top:10px;font-size:12.5px;color:var(--faint);line-height:1.55}' +
  '.rf-search{display:flex;gap:8px;flex-wrap:wrap}' +
  '.rf-search input[type=search]{flex:1 1 240px;background:#1B2028;border:1px solid var(--border);color:var(--ink);border-radius:10px;padding:11px 14px;font-family:inherit;font-size:15px;font-weight:600;outline:none;min-width:0}' +
  '.rf-search input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(59,130,246,.15)}' +
  '.rf-message{display:none;margin:14px 0 2px;border:1px solid var(--border);background:rgba(255,255,255,.03);border-radius:12px;padding:11px 14px;font-size:13px;line-height:1.55}' +
  '.rf-message.show{display:block}' +
  '.rf-message.err{border-color:rgba(248,113,113,.4);background:rgba(248,113,113,.08);color:#FCA5A5}' +
  '.rf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px;margin-top:16px}' +
  '.rf-card{background:#1B2028;border:1px solid var(--border);border-radius:14px;overflow:hidden;cursor:pointer;text-align:left;display:flex;flex-direction:column;transition:transform .18s ease,border-color .18s ease}' +
  '.rf-card:hover,.rf-card:focus{transform:translateY(-3px);border-color:rgba(59,130,246,.6);outline:none}' +
  '.rf-card img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:var(--surface-2)}' +
  '.rf-card h3{font-size:13.5px;font-weight:700;color:var(--ink);padding:11px 12px;line-height:1.4;margin:0;flex:1}' +
  '.rf-modal{position:fixed;inset:0;z-index:1200;background:rgba(15,18,24,.72);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;visibility:hidden;transition:opacity .22s ease,visibility 0s linear .22s}' +
  '.rf-modal.open{opacity:1;visibility:visible;transition:opacity .22s ease,visibility 0s}' +
  '.rf-modal-box{background:var(--bg);border:1px solid var(--border);border-radius:16px;max-width:760px;width:100%;max-height:88vh;overflow-y:auto;position:relative;padding:34px 36px 30px}' +
  '.rf-modal-close{position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:999px;border:1px solid var(--border);background:var(--surface);color:var(--muted);font-size:21px;line-height:1;cursor:pointer;transform:rotate(45deg);transition:all .18s ease}' +
  '.rf-modal-close:hover{color:#fff;border-color:var(--accent);background:var(--surface-2)}' +
  '.rf-mh2{font-size:1.5rem;font-weight:800;color:var(--ink);margin:0 0 14px;padding-right:36px;line-height:1.25}' +
  '.rf-meta{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}' +
  '.rf-chip{border:1px solid var(--border);background:#1B2028;color:var(--accent-light);border-radius:999px;padding:5px 12px;font-size:12px;font-weight:700;text-transform:capitalize;display:inline-flex;align-items:center;gap:6px}' +
  '.rf-mimg{width:100%;max-height:420px;object-fit:cover;border-radius:12px;border:1px solid var(--border);display:block}' +
  '.rf-mh3{font-size:.98rem;font-weight:800;color:var(--accent-light);text-transform:uppercase;letter-spacing:.05em;margin:22px 0 10px;border-bottom:1px solid var(--border);padding-bottom:8px;display:flex;align-items:center;gap:8px}' +
  '.rf-ing{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:8px 14px}' +
  '@media(max-width:520px){.rf-ing{grid-template-columns:1fr}}' +
  '.rf-ing li{font-size:13.5px;color:var(--muted);padding:7px 10px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:9px}' +
  '.rf-instr{font-size:14.5px;line-height:1.75;color:var(--muted);white-space:pre-line;margin:0}' +
  '.rf-mlinks{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}' +
  '.rf-mlinks a{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:10px;font-size:13.5px;font-weight:800;text-decoration:none}' +
  '.rf-yt{background:rgba(220,38,38,.16);border:1px solid rgba(248,113,113,.4);color:#FCA5A5}' +
  '.rf-src{background:#1B2028;border:1px solid var(--border);color:var(--accent-light)}' +
  '@media(max-width:600px){.rf-modal-box{padding:24px 18px}}';

const RF_JS = `
var $=function(id){return document.getElementById(id)};
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function safeUrl(u){return /^https?:\\/\\//i.test(String(u||''))?String(u):'';}
function rfFetch(url){
  var ctl=new AbortController();
  var timer=setTimeout(function(){ctl.abort();},15000);
  return fetch(url,{signal:ctl.signal}).then(function(res){
    clearTimeout(timer);
    if(!res.ok)throw new Error('HTTP '+res.status);
    return res.json();
  }).catch(function(e){
    clearTimeout(timer);
    if(e&&e.name==='AbortError')throw new Error('timeout');
    throw e;
  });
}
function rfErrorText(e){
  return e&&e.message==='timeout'
    ?'The recipe API took too long to answer - please try again in a moment.'
    :'Could not reach the recipe API. It may be temporarily unavailable - please try again in a moment.';
}
function setProc(m){var p=$('rfProc');if(p)p.textContent=m;}
function showMsg(m,err){var el=$('rfMsg');el.textContent=m;el.className='rf-message show'+(err?' err':'');}
function hideMsg(){var el=$('rfMsg');if(el)el.className='rf-message';}
var SEARCH_URL='https://www.themealdb.com/api/json/v1/1/search.php?s=';
var RANDOM_URL='https://www.themealdb.com/api/json/v1/1/random.php';
var LOOKUP_URL='https://www.themealdb.com/api/json/v1/1/lookup.php?i=';
function renderCards(items){
  var grid=$('rfGrid');if(!grid)return;
  grid.innerHTML='';
  if(!items||!items.length)return;
  var html='';
  for(var i=0;i<items.length;i++){
    var r=items[i];if(!r)continue;
    var name=esc(r.strMeal||'Recipe');
    var img=safeUrl(r.strMealThumb);
    html+='<div class="rf-card" role="button" tabindex="0" data-id="'+esc(r.idMeal||'')+'" aria-label="View details for '+name+'">'+
      (img?'<img src="'+img+'" alt="'+name+'" loading="lazy">':'')+
      '<h3>'+name+'</h3></div>';
  }
  grid.innerHTML=html;
}
function doSearch(q){
  q=String(q||'').trim();
  if(!q){showMsg('Enter a dish name or ingredient first.',true);return;}
  hideMsg();renderCards(null);
  setProc('Searching TheMealDB for "'+q+'"...');
  rfFetch(SEARCH_URL+encodeURIComponent(q)).then(function(data){
    var meals=(data&&data.meals)||[];
    if(meals.length){renderCards(meals);setProc(meals.length>1?meals.length+' recipes found for "'+q+'".':'One recipe found for "'+q+'".');}
    else{setProc('Search complete.');showMsg('No recipes found for "'+q+'". Try a different name or a main ingredient like "chicken" or "carrot".');}
  }).catch(function(e){
    setProc('Request failed.');
    showMsg(rfErrorText(e),true);
  });
}
function getRandom(){
  hideMsg();renderCards(null);
  setProc('Fetching a random recipe...');
  rfFetch(RANDOM_URL).then(function(data){
    var meal=data&&data.meals&&data.meals[0];
    if(meal){renderCards([meal]);setProc('Random pick ready - click the card to open the method.');}
    else{setProc('Request failed.');showMsg('Could not fetch a random recipe. Please try again.',true);}
  }).catch(function(e){
    setProc('Request failed.');
    showMsg(rfErrorText(e),true);
  });
}
function showModal(){var m=$('rfModal');m.classList.add('open');document.body.style.overflow='hidden';}
function hideModal(){var m=$('rfModal');m.classList.remove('open');document.body.style.overflow='';}
function openModal(meal){
  if(!meal)return;
  var ings=[];
  for(var i=1;i<=20;i++){
    var ing=String(meal['strIngredient'+i]||'').trim();
    if(!ing)continue;
    var ms=String(meal['strMeasure'+i]||'').trim();
    ings.push('<li>'+esc(ms?ms+' ': '')+esc(ing)+'</li>');
  }
  var h='<h2 class="rf-mh2">'+esc(meal.strMeal||'Recipe')+'</h2>';
  var meta=[];
  if(meal.strCategory)meta.push('<span class="rf-chip"><i class="fa-solid fa-tag"></i> '+esc(meal.strCategory)+'</span>');
  if(meal.strArea)meta.push('<span class="rf-chip"><i class="fa-solid fa-globe"></i> '+esc(meal.strArea)+'</span>');
  if(meta.length)h+='<div class="rf-meta">'+meta.join('')+'</div>';
  var img=safeUrl(meal.strMealThumb);
  if(img)h+='<img class="rf-mimg" src="'+img+'" alt="'+esc(meal.strMeal||'Recipe')+'">';
  h+='<h3 class="rf-mh3"><i class="fa-solid fa-basket-shopping"></i> Ingredients</h3><ul class="rf-ing">'+(ings.length?ings.join(''):'<li>No ingredient list available.</li>')+'</ul>';
  h+='<h3 class="rf-mh3"><i class="fa-solid fa-book-open"></i> Method</h3><p class="rf-instr">'+esc(meal.strInstructions||'Instructions not available for this recipe.')+'</p>';
  var links=[];
  var yt=safeUrl(meal.strYoutube);
  if(yt)links.push('<a class="rf-yt" href="'+yt+'" target="_blank" rel="noopener"><i class="fa-brands fa-youtube"></i> Watch video</a>');
  var src=safeUrl(meal.strSource);
  if(src)links.push('<a class="rf-src" href="'+src+'" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i> Original source</a>');
  if(links.length)h+='<div class="rf-mlinks">'+links.join('')+'</div>';
  $('rfModalBody').innerHTML=h;
  showModal();
}
function getDetails(id){
  if(!id)return;
  $('rfModalBody').innerHTML='<p class="rf-instr"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading recipe details...</p>';
  showModal();setProc('Fetching recipe details...');
  rfFetch(LOOKUP_URL+encodeURIComponent(id)).then(function(data){
    var meal=data&&data.meals&&data.meals[0];
    if(meal){openModal(meal);setProc('Recipe details loaded.');}
    else{hideModal();setProc('Request failed.');showMsg('Could not load that recipe. Please try again.',true);}
  }).catch(function(e){
    $('rfModalBody').innerHTML='<p class="rf-message show err">'+esc(rfErrorText(e))+'</p>';
    setProc('Request failed.');
  });
}
$('rfForm').addEventListener('submit',function(e){e.preventDefault();doSearch($('rfQuery').value);});
$('rfRandom').addEventListener('click',getRandom);
$('rfClear').addEventListener('click',function(){$('rfQuery').value='';hideMsg();renderCards(null);setProc('Ready - search for a recipe or hit Random.');});
$('rfGrid').addEventListener('click',function(e){
  var card=e.target.closest('.rf-card');if(!card)return;
  getDetails(card.getAttribute('data-id'));
});
$('rfGrid').addEventListener('keydown',function(e){
  if(e.key!=='Enter'&&e.key!==' '&&e.keyCode!==13&&e.keyCode!==32)return;
  var card=e.target.closest('.rf-card');if(!card)return;
  e.preventDefault();getDetails(card.getAttribute('data-id'));
});
$('rfModalClose').addEventListener('click',hideModal);
$('rfModal').addEventListener('click',function(e){if(e.target===$('rfModal'))hideModal();});
document.addEventListener('keydown',function(e){
  if((e.key==='Escape'||e.keyCode===27)&&$('rfModal').classList.contains('open'))hideModal();
});
`;

const spec = {
  file: 'recipe-finder.html',
  folder: 'cooking',
  name: 'Recipe Finder',
  tag: 'Recipes',
  icon: 'fa-solid fa-bowl-food',
  title: 'Recipe Finder | Search Recipes by Ingredient or Name',
  metaDesc: 'Find a meal to cook tonight. Search recipes by dish name or ingredient, pull a random recipe, and open the full ingredients, method and video — powered by TheMealDB, stored nowhere.',
  desc: 'Search recipes by name or ingredient, grab a random dish for inspiration, and open the full ingredient list, method and video in one click.',
  badge: 'Powered by TheMealDB API &middot; zero data retention',
  keywords: ['recipe finder', 'recipe search', 'find a recipe', 'search by ingredient', 'what can i cook', 'recipe lookup', 'meal planner', 'dinner ideas', 'random recipe', 'recipe database', 'cooking', 'cooking tools'],
  featureList: ['Search by dish name or ingredient', 'Random recipe for inspiration', 'Full ingredient list with measures', 'Step-by-step method and video links'],
  css: RF_CSS,
  panel:
    '<div class="panel clean"><div class="panel-inner">' +
    '<div class="toolbar-row"><span class="tool-label"><i class="fa-solid fa-bowl-food"></i>Recipe Finder</span>' +
    '<div class="toolbar-actions"><button class="chip-btn" type="button" id="rfRandom"><i class="fa-solid fa-dice"></i><span class="hide-sm">Random</span></button> ' +
    '<button class="chip-btn" type="button" id="rfClear"><i class="fa-solid fa-eraser"></i><span class="hide-sm">Clear</span></button></div></div>' +
    '<form id="rfForm" class="rf-search">' +
    '<input type="search" id="rfQuery" placeholder="Search a dish or ingredient, e.g. chicken or carrot" autocomplete="off" aria-label="Search recipes">' +
    '<button type="submit" class="btn btn-primary"><i class="fa-solid fa-magnifying-glass"></i>Search</button>' +
    '</form>' +
    '<p class="rf-hint"><i class="fa-solid fa-shield-halved"></i> Privacy: recipes load straight from TheMealDB\u2019s public API in this tab. Troolify stores nothing, keeps no history and retains zero data.</p>' +
    '<p class="proc-line"><i class="fa-solid fa-bolt"></i><span id="rfProc">Ready - search for a recipe or hit Random.</span></p>' +
    '<div class="rf-message" id="rfMsg"></div>' +
    '<div class="rf-grid" id="rfGrid"></div>' +
    '</div></div>' +
    '<aside class="rf-modal" id="rfModal" aria-hidden="true" aria-label="Recipe details">' +
    '<div class="rf-modal-box" role="dialog" aria-modal="true" aria-label="Recipe details">' +
    '<button type="button" class="rf-modal-close" id="rfModalClose" aria-label="Close">+</button>' +
    '<div id="rfModalBody"></div>' +
    '</div></aside>',
  js: RF_JS,
  article: {
    title: 'Recipe Finder: Find a Meal From a Name or a Single Ingredient',
    lead: '<p>Staring at a full fridge and no plan, or a craving with no recipe? The <strong>recipe finder</strong> searches TheMealDB\u2019s recipe database by dish name or by a single ingredient, hands back ready-to-cook results, and opens the complete ingredients, method and video for any of them.</p>',
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-magnifying-glass', heading: 'How the search works', html: '<p>Type a dish like <em>"lasagne"</em> or an ingredient like <em>"carrot"</em> and hit Search. The tool queries TheMealDB\u2019s public recipe API straight from your browser and lays the matches out as cards, each with a photo and the dish name. Clicking any card opens the full recipe: measured ingredients, step-by-step method, cuisine and category, a YouTube walkthrough when one exists, and the original source when one is credited.</p><p>Because the request runs entirely in your tab, there is no account, no saved history and nothing Troolify ever stores - the same zero-retention promise as every other tool here.</p>' },
      { id: 'random', icon: 'fa-solid fa-dice', heading: 'Surprise me: the random recipe button', html: '<p>When you do not even know what you want, hit <strong>Random</strong>. The tool pulls one dish at random from the database - a great way to break a menu rut, try a cuisine you would not have picked, or settle a "you decide" argument. If it is not right, click again; the next pick only takes a second.</p>' },
      { id: 'whats-in-the-card', icon: 'fa-solid fa-receipt', heading: 'Everything you need in the recipe card', html: '<p>The detail view shows the ingredient list with each amount matched to its measure - no more guessing whether a "cup" is of flour or of something else. Below it sits the method, kept on one scrollable page so you can cook straight from the phone that found the recipe. Category and world-area tags give context at a glance, and the video or source links let you follow a filmed version or the author\u2019s original write-up.</p>' },
      { id: 'cooking-workflow', icon: 'fa-solid fa-utensils', heading: 'Going from found to finished', html: '<p>Once a recipe is open, the kitchen math tools have your back: scale it to the people you are feeding with the <a href="recipe-servings-scaler.html">recipe servings scaler</a>, convert oven calls between fan and conventional with the <a href="oven-temperature-converter.html">oven temperature converter</a>, and estimate roasting time for any meat with the <a href="cooking-time-calculator.html">cooking time calculator</a>.</p>' }
    ],
    steps: [
      'Type a dish name or an ingredient into the search box and press Search.',
      'Click a result card to open the full recipe.',
      'Read the measured ingredients and follow the step-by-step method.',
      'Prefer to be surprised? Hit Random for a dish picked on the spot.'
    ],
    facts: [['Data source', 'TheMealDB public recipe API'], ['Search', 'By dish name or single ingredient'], ['Random', 'One-tap surprise dish'], ['Details', 'Ingredients, measures, method, video, source'], ['Privacy', 'Runs from your browser - zero data retention']],
    useCases: [
      ['Tonight\u2019s dinner', 'Search by what is already in the fridge ("chicken", "spinach") and pick a meal to cook now.'],
      ['Meal planning', 'Plan a week by searching categories of dishes, then scaling the chosen recipes with the servings scaler.'],
      ['Kitchen inspiration', 'Hit Random when you want to try something completely new.'],
      ['Learning cuisines', 'Explore dishes by area tag and follow linked video methods to build technique.']],
    tips: [
      'Search by the main ingredient rather than a full dish name when you want options.',
      'Try a generic term like "curry" or "pasta" for a broad set of results.',
      'If a recipe came out exactly right, remember its name - then scale it with the recipe servings scaler next time.'
    ],
    takeaways: [['search', 'by dish name or a single ingredient'], ['random', 'instant surprise dish'], ['details', 'measured ingredients, method, video and source'], ['privacy', 'fetched in your browser, zero data retained']],
    faq: [
      ['Is the recipe finder really free?', 'Yes. Searching and opening recipes costs nothing, needs no account, and pulls from TheMealDB\u2019s free public API.'],
      ['Where does the recipe data come from?', 'The tool queries TheMealDB, a public recipe database. The card shows the cuisine area and, when available, a link to the original source.'],
      ['Do you store my searches?', 'No. The search runs in your browser and Troolify retains nothing - no account, no history, no tracking.'],
      ['Can you search by ingredient?', 'Yes. Type any single ingredient such as "chicken", "cheese" or "spinach" and the tool returns recipes built around it.'],
      ['How do I adjust a found recipe for my family size?', 'Open the recipe to get its ingredient amounts, then paste them into the recipe servings scaler in Cooking Tools to multiply or divide them cleanly.'],
      ['What if the video or source link is missing?', 'Not every recipe has one. The details card shows the method either way, and only renders video and source links when TheMealDB provides them.']
    ],
    conclusion: '<p>From a single ingredient to a full dinner plan, the <strong>recipe finder</strong> turns the "what do we eat?" question into a menu in seconds - then the <a href="recipe-servings-scaler.html">recipe servings scaler</a>, <a href="oven-temperature-converter.html">oven temperature converter</a> and <a href="cooking-time-calculator.html">cooking time calculator</a> carry the recipe across the finish line.</p>'
  }
};

const html = buildPage(spec);
const outPath = path.join(ROOT, 'tools', spec.folder, spec.file);
fs.writeFileSync(outPath, html, 'utf8');
console.log('wrote', path.relative(ROOT, outPath), '(' + html.length + ' bytes)');

const res = registerTools([{
  name: spec.name, desc: spec.desc, icon: spec.icon, tag: spec.tag,
  category: catFolder(spec.folder), href: 'tools/' + spec.folder + '/' + spec.file,
  keywords: spec.keywords, recent: true
}]);
console.log('registry: added', res.added, 'skipped', res.skipped);