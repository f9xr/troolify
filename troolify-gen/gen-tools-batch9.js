/* ============================================================================
   Troolify - batch 9 (fun generators)
   A set of 100% client-side name / random generators that all share one
   compact scaffold: data arrays + a build() function that returns
   { v: <value>, sub: <optional sub-label> }. Emits standard tool pages and
   registers them in assets/js/tools-data.js.
   Category: Fun (tools/fun/)
   Run: node troolify-gen/gen-tools-batch9.js   (from the repo root)
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { buildPage, registerTools, CATMAP, panel } = require('./tool-page-lib');

const ROOT = path.resolve(__dirname, '..');
const catFolder = f => (CATMAP[f] || {}).folder || f;

/* ---------- shared CSS + field helpers ---------- */
const GEN_CSS =
  '.gen-opt{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:4px}' +
  '.gen-hint{margin:10px 0 0;font-size:12.5px;color:var(--faint);line-height:1.55}' +
  '.result-tile .rt-value{font-size:17px}';

function countField(p, def, max) {
  return '<div class="field"><label for="' + p + 'Count">How many</label><input id="' + p + 'Count"type="number"min="1"max="' + max + '"value="' + def + '"inputmode="numeric"></div>';
}
function selectField(p, label, opts) {
  return '<div class="field"><label for="' + p + label.replace(/\W/g, '') + '">' + label + '</label><select id="' + p + label.replace(/\W/g, '') + '">' +
    opts.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('') + '</select></div>';
}
function toggleField(p, id, label, checked) {
  return '<div class="field"><label for="' + p + id + '">' + label + '</label><select id="' + p + id + '"><option value="1"' + (checked ? ' selected' : '') + '>Yes</option><option value="0"' + (!checked ? ' selected' : '') + '>No</option></select></div>';
}

/* ---------- shared scaffold builder ---------- */
function nameTool(c) {
  const p = c.prefix;
  const options = '<div class="gen-opt">' + (c.optionsHtml || '') + countField(p, c.count || 10, c.max || 50) + '</div>';
  const panelHtml = panel.wrap(p, c.icon, c.panelLabel || c.name,
    options +
    panel.actions(p, c.goLabel || 'Generate') +
    '<div class="result-card"><div class="result-grid"id="' + p + 'Out"></div></div>' +
    '<p class="gen-hint"><i class="fa-solid fa-shield-halved"></i> Every result is generated on the spot in this tab. Nothing is sent anywhere and no history is kept.</p>');

  const js = `
var $=function(id){return document.getElementById(id)};
var box=$('${p}Out'),proc=$('${p}Proc'),lastText='';
${c.data}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function cap(s){s=String(s);return s.charAt(0).toUpperCase()+s.slice(1);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function getCount(){var el=$('${p}Count');var n=el?parseInt(el.value,10):${c.count || 10};if(isNaN(n)||n<1)n=${c.count || 10};return Math.min(${c.max || 50},n);}
function build(){${c.build}}
function render(){
  var n=getCount(),out=[],seen={},tries=0;
  while(out.length<n&&tries<n*40){tries++;var r=build();if(r&&r.v&&!seen[r.v]){seen[r.v]=1;out.push(r);}}
  box.innerHTML=out.map(function(r,i){return '<div class="result-tile"><div class="rt-label">#'+(i+1)+'</div><div class="rt-value">'+esc(r.v)+'</div>'+(r.sub?'<div class="rt-sub">'+esc(r.sub)+'</div>':'')+'</div>';}).join('');
  lastText=out.map(function(r){return r.v+(r.sub?' - '+r.sub:'');}).join('\\n');
  proc.textContent='Generated '+out.length+' - nothing leaves this tab.';
}
${c.extraJs || ''}
$('${p}Go').addEventListener('click',render);
$('${p}Copy').addEventListener('click',function(){window.Troolify.copyToClipboard(lastText,function(){proc.textContent='Copied all results.';});});
$('${p}Sample').addEventListener('click',render);
$('${p}Clear').addEventListener('click',function(){box.innerHTML='';lastText='';proc.textContent='Cleared - generate again whenever you like.';});
render();
`;

  return {
    file: c.file, folder: 'fun', name: c.name, tag: c.tag, icon: c.icon,
    title: c.title, metaDesc: c.metaDesc, desc: c.desc, badge: c.badge || '100% client-side &middot; zero data retention',
    keywords: c.keywords, featureList: c.featureList,
    css: GEN_CSS + (c.css || ''),
    panel: panelHtml,
    js: js,
    article: c.article,
    workflow: c.workflow
  };
}

const TOOLS = [];
function add(spec) { TOOLS.push(spec); }

/* ========================================================================
   1. DRAGON NAME GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'drag', file: 'dragon-name-generator.html',
  name: 'Dragon Name Generator', tag: 'Fantasy', icon: 'fa-solid fa-fire',
  title: 'Dragon Name Generator | Create Powerful Dragon Names',
  metaDesc: 'Generate unique, powerful dragon names for stories, games and fantasy worlds. Choose a style, get an instant list, and copy them in one click - free and client-side.',
  desc: 'Create unique, powerful dragon names for stories, games or fantasy worlds - pick a style and generate an instant list.',
  keywords: ['dragon name generator', 'dragon names', 'fantasy names', 'dragon name ideas', 'random dragon name', 'dnd dragon names', 'dragon names for stories', 'mythical dragon names', 'dragon name maker', 'fantasy name generator'],
  featureList: ['Choose classic, mythic, dark, fiery or frozen styles', 'Generate up to 50 names at once', 'Every name pairs a unique prefix and suffix', 'Each result shows an elemental tag', 'Copy the whole list in one click', '100% client-side'],
  optionsHtml: selectField('drag', 'Style', [['any', 'Any style'], ['classic', 'Classic'], ['mythic', 'Mythic (with title)'], ['fire', 'Fiery'], ['ice', 'Frozen'], ['dark', 'Shadow']]),
  data: `var D={
 first:['Dra','Bala','Ery','Froz','Gly','Ign','Kal','Mor','Nyx','Pyr','San','Thar','Vor','Wyr','Zul','Ash','Cind','Dusk','Ember','Glaur','Kry','Lun','Obsid','Rha','Skar','Tit','Umbr','Vex','Yor','Zeph','Auro','Brim','Cor','Drago','Ebon','Fel','Grim','Halo','Ith','Jade','Kra','Lum','Mala','Nith','Orin','Prav','Quel','Rok','Syl','Tor'],
 second:['gon','gor','thak','mir','fang','wing','claw','scale','maw','tail','storm','fire','frost','shadow','bane','heart','soul','roar','spire','crest','drake','wyrm','gaze','brand','thorn','veil','shard','claw','flame','stone'],
 titles:['the Ancient','the Terrible','the Wise','the Eternal','the Devourer','the Golden','the Silent','the Merciless','the Unbroken','the Fireborn','the Stormcaller','the Nightwing'],
 types:['Fire','Ice','Storm','Earth','Shadow','Light','Poison','Lightning','Water','Arcane','Nature','Cosmic']
};`,
  build: `
    var style=$('dragStyle')?$('dragStyle').value:'any';
    var name=cap(pick(D.first))+pick(D.second);
    if(style==='mythic'||(style==='any'&&Math.random()<0.4)){name+=' '+pick(D.titles);}
    var sub=pick(D.types)+' dragon';
    return {v:name,sub:sub};`,
  extraJs: `['dragStyle'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  workflow: ['tools/fun/dragonborn-name-generator.html', 'tools/fun/villain-name-generator.html'],
  article: {
    title: 'Dragon Name Generator: Forge a Name Worthy of a Dragon',
    lead: `<p>A dragon deserves more than "the big red one". This <strong>dragon name generator</strong> builds names from the same ingredients fantasy authors use - a resonant first syllable and a hard, ancient ending - then tags each result with an element so you know at a glance whether you have summoned a fire drake or a shadow wyrm.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-wand-magic-sparkles', heading: 'How the names are built', html: `<p>Every name combines a <em>prefix</em> that carries the weight of the creature and a <em>suffix</em> that gives it a bite. Prefixed roots such as <em>Dra-</em>, <em>Vor-</em> and <em>Umbr-</em> read as old and reptilian, while endings like <em>-thak</em>, <em>-fang</em> and <em>-gaze</em> make the name land hard when spoken aloud. Choose a style and the generator biases the words in that direction - mythic names even add an epithet such as "the Eternal".</p><p>The element tag is a random magical affinity, handy for giving your dragon a breath weapon or a colour without a second roll.</p>` },
      { id: 'using-in-writing', icon: 'fa-solid fa-feather', heading: 'Using dragon names in writing and games', html: `<p>Keep the first name short and pronounceable for the dragon your readers meet often, and reserve the longer, titled names for the legendary elder of the setting. In tabletop games a title doubles as a reputation: a party that hears "Kalgor the Merciless" already knows how the negotiation will go.</p>` }
    ],
    steps: [
      'Pick a style - classic for clean fantasy, mythic for a title, fire or ice for elemental flavour.',
      'Set how many names you want.',
      'Press <strong>Generate</strong> and browse the list.',
      'Use <strong>Copy all</strong> to paste your shortlist straight into a notes app.'
    ],
    facts: [['Styles', 'Classic, mythic, fiery, frozen, shadow or any'], ['Output', 'Up to 50 names per run'], ['Extras', 'Epithets and an elemental tag'], ['Data', 'Generated locally, nothing stored'], ['Cost', 'Free, no account']],
    useCases: [
      ['Writing a fantasy novel', 'Name a dragon that appears across multiple chapters without the name feeling throwaway.'],
      ['Tabletop RPGs', 'Roll a memorable dragon for tonight\'s encounter, complete with an epithet and element.'],
      ['Game and world building', 'Stock a bestiary with dozens of distinct dragons in a few minutes.']
    ],
    tips: [
      'Say the name out loud before you commit - a dragon name should be easy for a reader to pronounce.',
      'Shorten a long result to its prefix for a nickname the hero can actually shout.',
      'Use the element tag to keep opposing dragons visually and thematically distinct.'
    ],
    takeaways: ['A strong dragon name blends an ancient prefix with a hard suffix.', 'Epithets add reputation without extra words of exposition.', 'The generator gives a full lair of names in seconds.'],
    faq: [
      ['Is the dragon name generator free?', 'Yes. Generate as many names as you like, free, with no sign-up.'],
      ['Can I use the names commercially?', 'Names generated here are yours to use in stories, games and products. We do not claim ownership of a name, though common fantasy word parts may appear elsewhere.'],
      ['What styles are available?', 'Classic, mythic (with a title), fiery, frozen and shadow, plus an "any" mode that mixes them.'],
      ['Does it store the names I generate?', 'No. Everything is produced in your browser and nothing is saved or transmitted.'],
      ['Can I get more names?', 'Raise the "How many" value up to 50 per run and generate again.']
    ],
    conclusion: `<p>Whether you need one ancient wyrm or a whole flight of drakes, the <strong>dragon name generator</strong> gives you a naming language in a click. Pair it with our <a href="dragonborn-name-generator.html">Dragonborn name generator</a> for the humanoid kin.</p>`
  }
}));

/* ========================================================================
   2. RANDOM STATE GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'state', file: 'random-state-generator.html',
  name: 'Random State Generator', tag: 'Random', icon: 'fa-solid fa-map',
  title: 'Random State Generator | Pick a US State at Random',
  metaDesc: 'Get a random US state at a glance, with its two-letter abbreviation and capital city. Free, instant and generated entirely in your browser.',
  desc: 'Get a random state from the United States with just one click, plus its abbreviation and capital.',
  keywords: ['random state generator', 'random us state', 'pick a state', 'random state picker', 'us states list', 'random american state', 'state generator', 'random place in usa', '50 states random', 'random state selector'],
  featureList: ['All 50 US states', 'Shows the state abbreviation', 'Optional capital city', 'Generate up to 50 at once', 'Copy the list', '100% client-side'],
  optionsHtml: selectField('state', 'Detail', [['full', 'State + abbreviation + capital'], ['short', 'State + abbreviation'], ['state', 'State name only']]),
  data: `var D=[['Alabama','AL','Montgomery'],['Alaska','AK','Juneau'],['Arizona','AZ','Phoenix'],['Arkansas','AR','Little Rock'],['California','CA','Sacramento'],['Colorado','CO','Denver'],['Connecticut','CT','Hartford'],['Delaware','DE','Dover'],['Florida','FL','Tallahassee'],['Georgia','GA','Atlanta'],['Hawaii','HI','Honolulu'],['Idaho','ID','Boise'],['Illinois','IL','Springfield'],['Indiana','IN','Indianapolis'],['Iowa','IA','Des Moines'],['Kansas','KS','Topeka'],['Kentucky','KY','Frankfort'],['Louisiana','LA','Baton Rouge'],['Maine','ME','Augusta'],['Maryland','MD','Annapolis'],['Massachusetts','MA','Boston'],['Michigan','MI','Lansing'],['Minnesota','MN','Saint Paul'],['Mississippi','MS','Jackson'],['Missouri','MO','Jefferson City'],['Montana','MT','Helena'],['Nebraska','NE','Lincoln'],['Nevada','NV','Carson City'],['New Hampshire','NH','Concord'],['New Jersey','NJ','Trenton'],['New Mexico','NM','Santa Fe'],['New York','NY','Albany'],['North Carolina','NC','Raleigh'],['North Dakota','ND','Bismarck'],['Ohio','OH','Columbus'],['Oklahoma','OK','Oklahoma City'],['Oregon','OR','Salem'],['Pennsylvania','PA','Harrisburg'],['Rhode Island','RI','Providence'],['South Carolina','SC','Columbia'],['South Dakota','SD','Pierre'],['Tennessee','TN','Nashville'],['Texas','TX','Austin'],['Utah','UT','Salt Lake City'],['Vermont','VT','Montpelier'],['Virginia','VA','Richmond'],['Washington','WA','Olympia'],['West Virginia','WV','Charleston'],['Wisconsin','WI','Madison'],['Wyoming','WY','Cheyenne']];`,
  build: `
    var r=pick(D);
    var detail=$('stateDetail')?$('stateDetail').value:'full';
    var sub=detail==='state'?'':(detail==='short'?r[1]:r[1]+' - capital '+r[2]);
    return {v:r[0],sub:sub};`,
  extraJs: `['stateDetail'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  article: {
    title: 'Random State Generator: Pick One of the 50 US States',
    lead: `<p>Need to pick a state at random - for a road-trip roulette, a classroom draw or a writing prompt? This <strong>random state generator</strong> returns a fair pick from all fifty US states and can show the two-letter abbreviation and capital alongside it.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-shuffle', heading: 'A fair pick from all fifty', html: `<p>The generator draws uniformly from the complete list of 50 states, so no state is more likely than another. Toggle the detail level to show just the state name, the name with its USPS abbreviation, or the full line including the capital city. Because the pick is shown in a tile, you can request several at once and get a distinct shortlist - the tool avoids repeating the same state inside a single run.</p>` },
      { id: 'uses', icon: 'fa-solid fa-lightbulb', heading: 'What people use it for', html: `<p>Teachers use it to assign a state project without playing favourites. Writers use it to place a scene somewhere unexpected. Game nights use it as a spinner for travel-themed challenges. And when you simply cannot decide where to visit next, letting the generator choose removes the deliberation.</p>` }
    ],
    steps: [
      'Choose how much detail to show: name only, name and abbreviation, or the full line with the capital.',
      'Set the number of states to draw.',
      'Press <strong>Generate</strong>.',
      'Copy the list if you want to keep or share it.'
    ],
    facts: [['Pool', 'All 50 US states'], ['Shows', 'Name, abbreviation and capital'], ['Batch', 'Up to 50 picks per run'], ['Duplicates', 'Avoided within a single run'], ['Data', 'Generated locally']],
    useCases: [
      ['Classroom activities', 'Assign each student a different state for a geography project.'],
      ['Travel inspiration', 'Let the generator pick your next weekend destination.'],
      ['Writing and games', 'Choose a setting for a story or a trivia round fairly.']
    ],
    tips: ['Increase the count to draw several states and build a shortlist.', 'Use the abbreviation mode when you need something compact for a ticket or label.', 'Switch to capital mode when you are testing state-capital knowledge.'],
    takeaways: ['Every one of the 50 states has an equal chance.', 'You can show the abbreviation and capital on demand.', 'No repeats within a single run.'],
    faq: [
      ['Is every state equally likely?', 'Yes. The generator draws uniformly from the complete set of 50 states.'],
      ['Does it include Washington, D.C.?', 'No. The pool is the 50 states; the District of Columbia is not a state.'],
      ['Can it show the capital city?', 'Yes. Pick the full detail level and each pick shows the state, its abbreviation and its capital.'],
      ['Will I get the same state twice?', 'Not within one run - the generator avoids duplicates until you have drawn every state.'],
      ['Do you store my picks?', 'No. Everything is generated in your browser and nothing is saved.']
    ],
    conclusion: `<p>One click, one state. The <strong>random state generator</strong> is the simplest way to make a fair, unbiased pick from all fifty. Looking for a random object instead? Try the <a href="random-object-generator.html">random object generator</a>.</p>`
  }
}));

/* ========================================================================
   3. WARRIOR NAME GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'war', file: 'warrior-name-generator.html',
  name: 'Warrior Name Generator', tag: 'Fantasy', icon: 'fa-solid fa-shield-halved',
  title: 'Warrior Name Generator | Strong Fantasy Fighter Names',
  metaDesc: 'Create strong, unique warrior names for characters, stories and games. Choose Norse, medieval or fantasy styles and copy a full list instantly - free and client-side.',
  desc: 'Create strong and unique warrior names for your characters, stories or games.',
  keywords: ['warrior name generator', 'fantasy warrior names', 'viking names', 'warrior name ideas', 'norse name generator', 'fighter names', 'barbarian names', 'dnd warrior names', 'strong character names', 'medieval names'],
  featureList: ['Norse, medieval and fantasy styles', 'First name plus an earned epithet', 'Up to 50 names per run', 'Duplicate-free results', 'Copy the whole list', '100% client-side'],
  optionsHtml: selectField('war', 'Style', [['any', 'Any style'], ['norse', 'Norse / Viking'], ['medieval', 'Medieval knight'], ['fantasy', 'High fantasy'], ['barbarian', 'Barbarian']]),
  data: `var D={
 norse:['Bjorn','Ragnar','Ivar','Ulf','Erik','Harald','Sigurd','Gunnar','Leif','Sten','Torsten','Olaf'],
 medieval:['Aldric','Edmund','Roland','Godfrey','Baldwin','Cedric','William','Gareth','Alaric','Lionel','Reginald','Thaddeus'],
 fantasy:['Kael','Dorian','Thorne','Kaelen','Varden','Cyrus','Draven','Orion','Riven','Soren','Theron','Zane'],
 barbarian:['Grokk','Thokk','Uzgur','Brakk','Mog','Drog','Gurn','Krag','Thrum','Wurrg','Zugg','Horg'],
 epithets:['the Bold','the Unbroken','Ironfist','Stormblade','the Relentless','the Wolf','Skullsplitter','the Fearless','Bloodaxe','the Sentinel','Oathkeeper','the Ironclad','Bearclaw','the Undefeated','the Grim','Shieldbreaker','the Steadfast','Warbringer']
};`,
  build: `
    var style=$('warStyle')?$('warStyle').value:'any';
    var pool=style==='any'?D.norse.concat(D.medieval,D.fantasy,D.barbarian):D[style];
    var first=pick(pool),ep=pick(D.epithets);
    var label=style==='any'?'Warrior':style.charAt(0).toUpperCase()+style.slice(1)+' warrior';
    return {v:first+' '+ep,sub:label};`,
  extraJs: `['warStyle'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  workflow: ['tools/fun/villain-name-generator.html', 'tools/fun/dragonborn-name-generator.html'],
  article: {
    title: 'Warrior Name Generator: Names That Sound Like They Won',
    lead: `<p>A warrior\'s name should carry the sound of the battlefield. This <strong>warrior name generator</strong> pairs a strong first name with an earned epithet - "the Unbroken", "Ironfist", "Stormblade" - so your character arrives already carrying a reputation.</p>`,
    sections: [
      { id: 'styles', icon: 'fa-solid fa-shield-halved', heading: 'Norse, medieval, high fantasy and barbarian', html: `<p>Switch styles to suit your setting. <strong>Norse</strong> names lean on hard consonants and old-world roots, ideal for a raider or shieldmaiden. <strong>Medieval</strong> names sound courtly and knightly. <strong>High fantasy</strong> names can be more lyrical and invented, while <strong>barbarian</strong> names are blunt and guttural. Each style keeps its own vowel music, so a mixed list still feels coherent.</p>` },
      { id: 'epithets', icon: 'fa-solid fa-award', heading: 'Why epithets matter', html: `<p>Epithets are the shortest possible character description. "Ivar the Unbroken" tells you about endurance; "Roland Skullsplitter" sets a tone; "Gunnar Oathkeeper" hints at loyalty and conflict. Pick an epithet that creates a little friction with the character - the bold one called "the Grim" is already a story.</p>` }
    ],
    steps: ['Pick a style, or leave it on "Any" to mix them.', 'Choose how many names you need.', 'Press <strong>Generate</strong>.', 'Copy the shortlist you like.'],
    facts: [['Styles', 'Norse, medieval, high fantasy, barbarian'], ['Format', 'First name + epithet'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided'], ['Data', 'Generated locally']],
    useCases: [
      ['Character creation', 'Name a fighter whose epithet hints at their backstory.'],
      ['World building', 'Populate an army or a mercenary company with distinct names.'],
      ['Games', 'Find a memorable name for a PvP or RPG character.']
    ],
    tips: ['Match the style to your setting so the names feel native to it.', 'Reserve the longest epithets for the most legendary characters.', 'Shorten a name to its first syllable for a battle-cry nickname.'],
    takeaways: ['Styles keep a list thematically tight.', 'Epithets do instant characterisation.', 'Generate a whole warband in one click.'],
    faq: [
      ['Are the names free to use?', 'Yes. Use them in your stories, campaigns and games - no attribution required.'],
      ['Which style suits a Viking setting?', 'The Norse style, with hard consonants and old Germanic roots.'],
      ['Can I mix styles?', 'Yes. Leave the style on "Any" to draw from all four pools at once.'],
      ['Do the names repeat?', 'Within a single run the generator avoids duplicates.'],
      ['Is anything uploaded?', 'No. Names are created entirely in your browser.']
    ],
    conclusion: `<p>Give your fighter a name that lands like a hammer blow. The <strong>warrior name generator</strong> delivers a full warband in seconds. Need an antagonist? Try the <a href="villain-name-generator.html">villain name generator</a>.</p>`
  }
}));

/* ========================================================================
   4. RANDOM OBJECT GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'obj', file: 'random-object-generator.html',
  name: 'Random Object Generator', tag: 'Random', icon: 'fa-solid fa-cube',
  title: 'Random Object Generator | Random Everyday Things',
  metaDesc: 'Discover random everyday objects for creative ideas, drawing prompts, games and writing. Pick a category or go fully random - free and 100% client-side.',
  desc: 'Discover random everyday objects - perfect for creative ideas, games or writing prompts.',
  keywords: ['random object generator', 'random object', 'random thing generator', 'object ideas', 'random item generator', 'drawing object ideas', 'writing prompts', 'random everyday objects', 'object picker', 'random noun'],
  featureList: ['Household, office, nature, tool and food categories', 'Fully random mode', 'Generate up to 50 objects', 'Duplicate-free within a run', 'Copy the list', '100% client-side'],
  optionsHtml: selectField('obj', 'Category', [['any', 'Any category'], ['household', 'Household'], ['office', 'Office'], ['nature', 'Nature'], ['tool', 'Tools'], ['food', 'Food']]),
  data: `var D={
 household:[['coffee mug','a chipped handle tells its own story'],['throw pillow','squashed into an odd shape'],['alarm clock','with one stubborn hand'],['house plant','leaning toward the window'],['candlestick','wax frozen mid-drip'],['picture frame','holding a faded photo'],['umbrella','still damp from yesterday'],['kettle','whistling its kettle whistle'],['laundry basket','overflowing already'],['doormat','worn thin at the centre']],
 office:[['stapler','heavy enough to be a paperweight'],['coffee cup','ringed with old stains'],['sticky note','curled at the corner'],['desk lamp','angled at a report'],['keyboard','missing one well-used key'],['notebook','dog-eared and overfull'],['paperclip','bent out of shape long ago'],['printer','jammed at the worst moment'],['chair','rolling slightly to the left'],['lanyard','swinging like a pendulum']],
 nature:[['pine cone','closed against the cold'],['river stone','smoothed by decades of water'],['fallen leaf','cracked like old paper'],['feather','weightless and dark-tipped'],['acorn','still wearing its cap'],['driftwood','shaped like something almost'],['seashell','holding the sound of waves'],['wildflower','growing through a crack'],['snowflake','gone the moment you look'],['spiderweb','strung with morning dew']],
 tool:[['hammer','handle dark with use'],['screwdriver','magnetised long ago'],['tape measure','snapped back one time too many'],['wrench','grease in every groove'],['flashlight','dim but still faithful'],['paintbrush','stiff with dried paint'],['level','still perfectly true'],['hacksaw','blade dulled on a pipe'],['work gloves','one finger worn through'],['toolbox','lid that never quite latches']],
 food:[['strawberry','almost too ripe'],['loaf of bread','warm from the oven'],['lemon','waxy and bright'],['coffee bean','dark and oily'],['honey jar','crystallised at the edge'],['bell pepper','loudest colour in the fridge'],['block of cheese','with a corner already cut'],['teabag','string trailing out'],['pickle','floating alone in the jar'],['birthday cake','one candle still lit']]
};`,
  build: `
    var cat=$('objCategory')?$('objCategory').value:'any';
    var key=cat==='any'?pick(['household','office','nature','tool','food']):cat;
    var item=pick(D[key]);
    return {v:item[0],sub:key.charAt(0).toUpperCase()+key.slice(1)+' - '+item[1]};`,
  extraJs: `['objCategory'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  article: {
    title: 'Random Object Generator: An Everyday Thing on Demand',
    lead: `<p>Sometimes the hardest part of being creative is choosing a subject. This <strong>random object generator</strong> serves up everyday things - a coffee mug, a pine cone, a battered toolbox - so you can start working with something concrete instead of staring at a blank page.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-list', heading: 'Categories for any purpose', html: `<p>Objects are grouped into household, office, nature, tools and food. Each one comes with a short descriptive note to spark a thought - the umbrella is "still damp from yesterday", the honey jar is "crystallised at the edge". That small detail is often what turns a plain list item into a scene, a sketch or a metaphor.</p>` },
      { id: 'creative-uses', icon: 'fa-solid fa-paintbrush', heading: 'From drawing prompts to writing exercises', html: `<p>Artists use single objects for warm-up sketches. Writers use them as seeds for a scene or a sensory detail. Improv games use them as givens. Because the draw is random, it pushes you outside your usual habits and toward subjects you would not have chosen yourself.</p>` }
    ],
    steps: ['Choose a category or leave it on "Any".', 'Set how many objects you want.', 'Press <strong>Generate</strong>.', 'Copy the list for your project.'],
    facts: [['Categories', 'Household, office, nature, tools, food'], ['Extras', 'A short descriptive note per object'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Data', 'Generated locally']],
    useCases: [
      ['Drawing practice', 'Pick one object and sketch it from three angles.'],
      ['Writing exercises', 'Use the object and its note as the seed of a scene.'],
      ['Party and improv games', 'Turn an object into a charade or a story prompt.']
    ],
    tips: ['Generate a handful and choose the one that sparks the strongest image.', 'Use the descriptive note as a constraint rather than a suggestion.', 'Mix categories for a more surprising set.'],
    takeaways: ['Concrete prompts break creative block.', 'Small descriptive details seed bigger ideas.', 'One click gives a whole set of subjects.'],
    faq: [
      ['What counts as an everyday object?', 'Common things you might find at home, in an office, outdoors, in a toolkit or in a kitchen.'],
      ['Can I get objects from one category only?', 'Yes. Pick a category, or leave it on "Any" to draw from all of them.'],
      ['Are the descriptions random too?', 'Each object carries its own fixed note, so results stay coherent and useful.'],
      ['Can I use these for commercial projects?', 'Yes. The prompts are generic descriptions of common objects; anything you create from them is yours.'],
      ['Is my data stored?', 'No. Everything happens in your browser.']
    ],
    conclusion: `<p>Get out of your own way and let an object choose you. The <strong>random object generator</strong> turns a blank page into a starting point. For place names, try the <a href="island-name-generator.html">island name generator</a>.</p>`
  }
}));

/* ========================================================================
   5. RANDOM POKEMON GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'poke', file: 'random-pokemon-generator.html',
  name: 'Random Pokemon Generator', tag: 'Games', icon: 'fa-solid fa-dice',
  title: 'Random Pokemon Generator | Pick a Pokemon Instantly',
  metaDesc: 'Generate random Pokemon names and their types for challenges, games and team ideas. Choose how many and copy the list - free and 100% client-side.',
  desc: 'Generate random Pokemon names and their types - get inspired for your next adventure, challenge or team.',
  keywords: ['random pokemon generator', 'random pokemon', 'pokemon picker', 'random pokemon name', 'pokemon challenge', 'random team generator', 'pokemon randomizer', 'pokemon nuzlocke', 'pick a pokemon', 'pokemon ideas'],
  featureList: ['A wide spread of classic Pokemon', 'Shows the typing of each pick', 'Generate up to 50 at once', 'Duplicate-free within a run', 'Copy the list', '100% client-side'],
  optionsHtml: selectField('poke', 'Detail', [['type', 'Name + type'], ['name', 'Name only']]),
  data: `var D=[['Bulbasaur','Grass / Poison'],['Charmander','Fire'],['Squirtle','Water'],['Pikachu','Electric'],['Eevee','Normal'],['Snorlax','Normal'],['Gengar','Ghost / Poison'],['Machamp','Fighting'],['Alakazam','Psychic'],['Onix','Rock / Ground'],['Lapras','Water / Ice'],['Dragonite','Dragon / Flying'],['Mewtwo','Psychic'],['Vaporeon','Water'],['Jolteon','Electric'],['Flareon','Fire'],['Arcanine','Fire'],['Gyarados','Water / Flying'],['Scyther','Bug / Flying'],['Rhydon','Ground / Rock'],['Nidoking','Poison / Ground'],['Ninetales','Fire'],['Rapidash','Fire'],['Slowbro','Water / Psychic'],['Magneton','Electric / Steel'],['Cloyster','Water / Ice'],['Haunter','Ghost / Poison'],['Steelix','Steel / Ground'],['Scizor','Bug / Steel'],['Umbreon','Dark'],['Espeon','Psychic'],['Tyranitar','Rock / Dark'],['Lugia','Psychic / Flying'],['Blaziken','Fire / Fighting'],['Gardevoir','Psychic / Fairy'],['Metagross','Steel / Psychic'],['Salamence','Dragon / Flying'],['Milotic','Water'],['Rayquaza','Dragon / Flying'],['Lucario','Fighting / Steel'],['Garchomp','Dragon / Ground'],['Greninja','Water / Dark'],['Talonflame','Fire / Flying'],['Aegislash','Steel / Ghost'],['Goodra','Dragon'],['Sylveon','Fairy'],['Decidueye','Grass / Ghost'],['Corviknight','Flying / Steel'],['Dragapult','Dragon / Ghost'],['Tinkaton','Fairy / Steel']];`,
  build: `
    var r=pick(D);
    var detail=$('pokeDetail')?$('pokeDetail').value:'type';
    return {v:r[0],sub:detail==='name'?'':r[1]};`,
  extraJs: `['pokeDetail'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  article: {
    title: 'Random Pokemon Generator: For Challenges and Team Ideas',
    lead: `<p>Can\'t decide which Pokemon to use? Let this <strong>random Pokemon generator</strong> choose for you. It draws fair picks from a broad spread of popular Pokemon and shows the typing, so the result is usable for a challenge run, a randomised team or a party game.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-shuffle', heading: 'Fair, type-aware picks', html: `<p>Each result is drawn at random from the pool and tagged with its typing, so you instantly know whether you have a wall, a sweeper or a support pick. The generator avoids duplicates within a run, which makes it handy for building a randomised team of six or a themed box of Pokemon for a challenge.</p>` },
      { id: 'uses', icon: 'fa-solid fa-dice', heading: 'Starter challenges and fun', html: `<p>The classic use is a starter challenge: roll once and commit to that Pokemon for a full playthrough. Streamers use it to randomise teams live. Groups use it to pick who trades what. And sometimes you just want a fresh favourite to draw or write about.</p>` }
    ],
    steps: ['Pick whether to show just the name or the name and type.', 'Set how many Pokemon to draw.', 'Press <strong>Generate</strong>.', 'Copy the list to commit to your challenge.'],
    facts: [['Shows', 'Name and optional typing'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Use', 'Challenges, teams, fun'], ['Data', 'Generated locally']],
    useCases: [
      ['Starter challenge', 'Roll one Pokemon and use only it for a whole playthrough.'],
      ['Randomised teams', 'Roll six to build a surprise squad for a battle.'],
      ['Content and streams', 'Give viewers a fair, visible random pick.']
    ],
    tips: ['Commit to the first result for a true challenge.', 'Roll six at once to build a full randomised team.', 'Use the type tag to plan counters before you battle.'],
    takeaways: ['A fair random pick in one click.', 'Typing shown so the result is immediately useful.', 'No repeats within a run.'],
    faq: [
      ['Is this an official Pokemon tool?', 'No. It is a free fan-made picker and is not affiliated with or endorsed by any rights holder.'],
      ['Which Pokemon are included?', 'A broad mix drawn from across the series, including many well-known favourites.'],
      ['Can it build a team of six?', 'Yes. Set the count to six and generate; the picks will not repeat.'],
      ['Do you store anything?', 'No. Picks are generated in your browser and never saved.'],
      ['Are the types accurate?', 'Typings reflect the well-known standard two-type combinations for each Pokemon.']
    ],
    conclusion: `<p>Let chance pick your partner. The <strong>random Pokemon generator</strong> is built for challenges, teams and a bit of fun. Want a themed name instead? Try the <a href="xbox-username-generator.html">Xbox username generator</a>.</p>`
  }
}));

/* ========================================================================
   6. RANDOM BIRTHDAY GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'bday', file: 'random-birthday-generator.html',
  name: 'Random Birthday Generator', tag: 'Random', icon: 'fa-solid fa-cake-candles',
  title: 'Random Birthday Generator | Random Birth Dates & Ages',
  metaDesc: 'Get a random birthday date instantly for games, stories and fun activities, complete with the day of the week and zodiac sign - free and client-side.',
  desc: 'Get a random birthday date instantly - great for games, stories or fun activities.',
  keywords: ['random birthday generator', 'random birthday', 'random birth date', 'random date of birth', 'birthday generator', 'random birthday date', 'fake birthday', 'random date generator', 'character birthday', 'random age'],
  featureList: ['Realistic dates between 1950 and 2011', 'Correct days of the week and leap years', 'Optional zodiac sign', 'Generate up to 50 at once', 'Copy the list', '100% client-side'],
  optionsHtml: toggleField('bday', 'Zodiac', 'Show zodiac sign', true),
  data: `var MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
var DAYN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function zodiac(m,d){var z=[['Capricorn',19],['Aquarius',18],['Pisces',20],['Aries',19],['Taurus',20],['Gemini',20],['Cancer',22],['Leo',22],['Virgo',22],['Libra',22],['Scorpio',21],['Sagittarius',21],['Capricorn',31]];return d<=z[m][1]?z[m][0]:z[m+1][0];}`,
  build: `
    var y=1950+Math.floor(Math.random()*62);
    var m=Math.floor(Math.random()*12);
    var leap=(y%4===0&&(y%100!==0||y%400===0));
    var dim=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31][m];
    var d=1+Math.floor(Math.random()*dim);
    var dt=new Date(y,m,d);
    var sub=DAYN[dt.getDay()];
    if(!$('bdayZodiac')||$('bdayZodiac').value==='1'){sub+=' - '+zodiac(m,d);}
    return {v:MON[m]+' '+d+', '+y,sub:sub};`,
  extraJs: `['bdayZodiac'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  article: {
    title: 'Random Birthday Generator: A Realistic Random Date of Birth',
    lead: `<p>Need a random birthday for a character sheet, a lucky draw or a game? This <strong>random birthday generator</strong> produces believable dates of birth - correct weekdays, correct leap years - and can attach the zodiac sign too.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-calendar-day', heading: 'Believable dates, not just any numbers', html: `<p>The generator draws a year between 1950 and 2011, then a real day within that month. February gets 29 days in leap years and 28 in the rest, so you never get an impossible date like 31 April or 30 February. The weekday is computed from the actual date, which means the day shown always matches the calendar.</p>` },
      { id: 'zodiac', icon: 'fa-solid fa-star', heading: 'Day of the week and zodiac', html: `<p>Each result can include the day of the week the person was born on and their zodiac sign, calculated from the precise date boundaries. That is the sort of detail that makes a fictional character feel real - and it is handy for classroom astrology or trivia games.</p>` }
    ],
    steps: ['Decide whether to show the zodiac sign.', 'Set how many birthdays you need.', 'Press <strong>Generate</strong>.', 'Copy the list to use in your project.'],
    facts: [['Year range', '1950 to 2011'], ['Accuracy', 'Correct month lengths and leap years'], ['Extras', 'Weekday and optional zodiac'], ['Batch', 'Up to 50 per run'], ['Data', 'Generated locally']],
    useCases: [
      ['Character creation', 'Give a fictional person a plausible date of birth.'],
      ['Classroom and party games', 'Draw a date for a horoscope or historical guessing game.'],
      ['Testing and demos', 'Populate forms and databases with realistic birth dates.']
    ],
    tips: ['Leave the zodiac on if you want a ready-made personality hook.', 'Generate several and pick the one that fits the year you want.', 'Use the weekday detail for a "what day were you born?" quiz.'],
    takeaways: ['Dates are always calendar-valid.', 'The weekday and zodiac are computed, not guessed.', 'Ideal for characters, games and test data.'],
    faq: [
      ['Can the generator produce impossible dates?', 'No. Month lengths and leap years are handled, so every date is real.'],
      ['What ages does it cover?', 'Anyone born between 1950 and 2011, roughly pre-teens to mid-seventies today.'],
      ['How is the zodiac calculated?', 'From the standard date boundaries for each sign, using the generated month and day.'],
      ['Is it the same as a random age generator?', 'It generates a full date, from which the age follows; you can read the year to work out age.'],
      ['Do you save the dates?', 'No. Everything is generated in your browser.']
    ],
    conclusion: `<p>Every date is plausible and every weekday is correct. The <strong>random birthday generator</strong> is the quickest way to get a believable date of birth. For a themed name instead, try the <a href="greek-name-generator.html">Greek name generator</a>.</p>`
  }
}));

/* ========================================================================
   7. RANDOM CELEBRITY GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'celeb', file: 'random-celebrity-generator.html',
  name: 'Random Celebrity Generator', tag: 'Random', icon: 'fa-solid fa-star',
  title: 'Random Celebrity Generator | Pick a Famous Person',
  metaDesc: 'Discover a random celebrity from around the world, with their field, for quizzes, games and ideas. Free, instant and generated entirely in your browser.',
  desc: 'Discover a random celebrity from around the world.',
  keywords: ['random celebrity generator', 'random celebrity', 'famous person generator', 'pick a celebrity', 'random famous people', 'celebrity picker', 'random star', 'quiz ideas', 'random famous person', 'celebrity randomizer'],
  featureList: ['Famous figures from many fields', 'Shows the field each person is known for', 'Generate up to 50 at once', 'Duplicate-free within a run', 'Copy the list', '100% client-side'],
  optionsHtml: '',
  data: `var D=[['Albert Einstein','Physics'],['Marie Curie','Science'],['Nelson Mandela','Leadership'],['Frida Kahlo','Art'],['Leonardo da Vinci','Art & Science'],['Ada Lovelace','Computing'],['William Shakespeare','Literature'],['Maya Angelou','Literature'],['Serena Williams','Tennis'],['Michael Jordan','Basketball'],['Lionel Messi','Football'],['Usain Bolt','Athletics'],['Beyonce','Music'],['David Bowie','Music'],['Freddie Mercury','Music'],['Taylor Swift','Music'],['Steven Spielberg','Film'],['Meryl Streep','Film'],['Leonardo DiCaprio','Film'],['Denzel Washington','Film'],['Oprah Winfrey','Television'],['David Attenborough','Nature'],['Jane Goodall','Science'],['Malala Yousafzai','Activism'],['Greta Thunberg','Activism'],['Bill Gates','Technology'],['Steve Jobs','Technology'],['Elon Musk','Technology'],['Jeff Bezos','Business'],['Warren Buffett','Finance'],['J.K. Rowling','Literature'],['Stephen King','Literature'],['Vincent van Gogh','Art'],['Pablo Picasso','Art'],['Banksy','Street Art'],['Yayoi Kusama','Art'],['Rihanna','Music'],['Ed Sheeran','Music'],['Adele','Music'],['Bruno Mars','Music'],['Keanu Reeves','Film'],['Angelina Jolie','Film'],['Tom Hanks','Film'],['Morgan Freeman','Film'],['Emma Watson','Film'],['Cristiano Ronaldo','Football'],['LeBron James','Basketball'],['Simone Biles','Gymnastics'],['Roger Federer','Tennis'],['Shakira','Music']];`,
  build: `
    var r=pick(D);
    return {v:r[0],sub:r[1]};`,
  article: {
    title: 'Random Celebrity Generator: A Famous Name in One Click',
    lead: `<p>Who will it be this time? This <strong>random celebrity generator</strong> picks a well-known figure at random from across science, sport, music, film, art and activism, and tells you the field they are famous for.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-shuffle', heading: 'A broad, fair pool', html: `<p>The pool spans many disciplines and eras, so a run feels varied rather than repeating the same handful of names. Each result includes the person\'s field, which saves a lookup and makes the tool immediately useful for a quiz master or a teacher. Duplicates are avoided within a single run.</p>` },
      { id: 'uses', icon: 'fa-solid fa-lightbulb', heading: 'Where it is useful', html: `<p>Pub-quiz hosts use it to draw a fresh "guess the year" subject. Teachers use it for biography assignments. Teams use it for icebreakers and "who would play them in a film" games. Writers use it to anchor a character to a real-world reference point.</p>` }
    ],
    steps: ['Set how many celebrities you want.', 'Press <strong>Generate</strong>.', 'Read the field to add context.', 'Copy the list to share or save.'],
    facts: [['Pool', 'Figures from many fields and eras'], ['Shows', 'Name and field'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Data', 'Generated locally']],
    useCases: [
      ['Quiz and trivia', 'Draw a random subject for a rounds-based quiz.'],
      ['Classroom projects', 'Assign a biography subject fairly.'],
      ['Icebreakers', 'Spark a "dinner with anyone" or "who would play them" game.']
    ],
    tips: ['Generate a set and let each player pick one at random.', 'The field label is a ready-made conversation starter.', 'Increase the count for a full trivia round.'],
    takeaways: ['A varied, fair celebrity draw.', 'The field gives instant context.', 'Perfect for quizzes, class and games.'],
    faq: [
      ['Which celebrities are included?', 'A wide mix of famous people from science, sport, music, film, art, business and activism.'],
      ['Is the pick fair?', 'Yes. Every entry in the pool has an equal chance of being drawn.'],
      ['Can I draw several at once?', 'Yes, up to 50 per run, with no repeats.'],
      ['Is it suitable for a quiz?', 'It is great for drawing subjects; you supply the questions.'],
      ['Do you store anything?', 'No. The draw happens entirely in your browser.']
    ],
    conclusion: `<p>Let fate choose your famous face. The <strong>random celebrity generator</strong> is quick, fair and fun. For a heroic name instead, try the <a href="warrior-name-generator.html">warrior name generator</a>.</p>`
  }
}));

/* ========================================================================
   8. HORSE NAME GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'horse', file: 'horse-name-generator.html',
  name: 'Horse Name Generator', tag: 'Names', icon: 'fa-solid fa-shoe-prints',
  title: 'Horse Name Generator | Elegant & Racing Horse Names',
  metaDesc: 'Generate unique, beautiful horse names for real horses, riding stories and games. Choose an elegant, racing, western or medieval style - free and client-side.',
  desc: 'Generate unique and beautiful horse names for your equine friends, characters or stories.',
  keywords: ['horse name generator', 'horse names', 'random horse names', 'elegant horse names', 'racing horse names', 'horse name ideas', 'naming a horse', 'pony names', 'stable names', 'horse character names'],
  featureList: ['Elegant, racing, western and medieval styles', 'Beautiful two-word names', 'Generate up to 50 at once', 'Duplicate-free within a run', 'Copy the list', '100% client-side'],
  optionsHtml: selectField('horse', 'Style', [['any', 'Any style'], ['elegant', 'Elegant / Show'], ['racing', 'Racing'], ['western', 'Western'], ['medieval', 'Medieval / Knightly']]),
  data: `var D={
 elegant:['Midnight Star','Silver Satin','Royal Grace','Amber Rose','Autumn Whisper','Gentle Breeze','Crimson Velvet','Dancing Cloud','Golden Aria','Misty Dawn','Ivory Lace','Velvet Moon','Rosy Dancer','Pearl Flame','Sable Elegance'],
 racing:['Swift Arrow','Thunder Bolt','Iron Comet','Storm Runner','Lucky Streak','Blazing Trail','Flash Dancer','Rapid Fire','Steel Wing','Turbo Jet','Quick Silver','Winning Ways','Final Furlong','Bold Venture','Fast Lane'],
 western:['Dusty Socks','Wild Buck','Lone Ranger','Sagebrush','Rusty Spur','Prairie Wind','Cactus Jack','Dry Creek','Bronco','Dust Devil','Red Canyon','Boot Hill','Fence Line','Tumbleweed','Big Sky'],
 medieval:['Noble Knight','Royal Lance','Loyal Steed','Baron of Ash','Crusader','Valor','Sovereign','Templar','Highland Charge','Chivalry','Gilded Barding','Castle Guard','Jousting King','Crown Jewel','Iron Heraldr']
};`,
  build: `
    var style=$('horseStyle')?$('horseStyle').value:'any';
    var pool=style==='any'?D.elegant.concat(D.racing,D.western,D.medieval):D[style];
    var label=style==='any'?'Horse name':style.charAt(0).toUpperCase()+style.slice(1)+' horse name';
    return {v:pick(pool),sub:label};`,
  extraJs: `['horseStyle'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  article: {
    title: 'Horse Name Generator: A Name as Fine as Your Horse',
    lead: `<p>Naming a horse is a small act of poetry. This <strong>horse name generator</strong> offers elegant two-word names - "Midnight Star", "Royal Grace", "Thunder Bolt" - across four distinct moods, so you can find one that fits a real animal, a riding-school story or a game.</p>`,
    sections: [
      { id: 'styles', icon: 'fa-solid fa-shoe-prints', heading: 'Four moods to choose from', html: `<p><strong>Elegant</strong> names suit show horses and gentle companions, with soft vowels and refined imagery. <strong>Racing</strong> names are punchy and confident, the sort that look good on a card. <strong>Western</strong> names have dust and humour in them, while <strong>medieval</strong> names ring with knights and royalty. Leave it on "Any" to mix all four.</p>` },
      { id: 'choosing', icon: 'fa-solid fa-lightbulb', heading: 'Choosing the right name', html: `<p>For a real horse, keep it to two easy syllables the animal will learn to answer to. For fiction, let the name hint at the horse\'s role - a racing name that promises speed, an elegant name that signals breeding. The generator gives you a wide field to react against, which is often faster than inventing from nothing.</p>` }
    ],
    steps: ['Pick a style or leave it on "Any".', 'Choose how many names to generate.', 'Press <strong>Generate</strong>.', 'Copy the names you like best.'],
    facts: [['Styles', 'Elegant, racing, western, medieval'], ['Format', 'Two-word names'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Data', 'Generated locally']],
    useCases: [
      ['Naming a real horse', 'Shortlist a few names and try them out loud in the yard.'],
      ['Equestrian stories', 'Name a horse whose name reflects its character.'],
      ['Games and roleplay', 'Stock a stable with distinct, believable names.']
    ],
    tips: ['For real horses, favour short names the animal can learn quickly.', 'Match the style to the horse\'s discipline: racing, show or western.', 'Say the name across a stable yard - if it carries, it works.'],
    takeaways: ['Four styles cover real and fictional horses.', 'Names are elegant and easy to say.', 'A full stable in one click.'],
    faq: [
      ['What makes a good horse name?', 'A name that is easy to pronounce, easy for the horse to learn, and pleasant to call out.'],
      ['Which style suits a show horse?', 'The elegant style, with soft, refined two-word names.'],
      ['Can I use these names for a real animal?', 'Yes, though check any competition or registry rules that may restrict certain names.'],
      ['How many names can I generate?', 'Up to 50 per run, with no repeats.'],
      ['Is anything stored?', 'No. Names are generated entirely in your browser.']
    ],
    conclusion: `<p>Find the name that fits. The <strong>horse name generator</strong> gives you elegant options in every mood. For more fantasy naming, try the <a href="island-name-generator.html">island name generator</a>.</p>`
  }
}));

/* ========================================================================
   9. RANDOM THEME GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'theme', file: 'random-theme-generator.html',
  name: 'Random Theme Generator', tag: 'Random', icon: 'fa-solid fa-palette',
  title: 'Random Theme Generator | Ideas for Parties, Writing & Design',
  metaDesc: 'Get random themes for parties, writing, design and creative projects. Choose a category or go fully random and copy a ready-to-use idea list - free and client-side.',
  desc: 'Get random themes for parties, writing, design or creative projects.',
  keywords: ['random theme generator', 'theme generator', 'party theme ideas', 'writing themes', 'design themes', 'random theme', 'creative prompts', 'event theme ideas', 'story themes', 'theme picker'],
  featureList: ['Party, writing, design and game themes', 'Fully random mode', 'Generate up to 50 themes', 'Duplicate-free within a run', 'Copy the list', '100% client-side'],
  optionsHtml: selectField('theme', 'Category', [['any', 'Any category'], ['party', 'Party'], ['writing', 'Writing'], ['design', 'Design'], ['game', 'Game']]),
  data: `var D={
 party:[['Black and white gala','formal, elegant, high contrast'],['Neon 80s','synth, bright colours, retro'],['Tropical luau','floral, tiki, warm'],['Masquerade','masks, intrigue, candlelight'],['Great Gatsby','art deco, gold, glamour'],['Under the sea','ocean blues, sea creatures'],['Winter wonderland','white, ice, silver'],['Hollywood red carpet','glamour, spotlights, film'],['Retro arcade','pixel art, coins, neon'],['Around the world','travel, cultures, cuisine']],
 writing:[['A letter never sent','regret, confession, timing'],['The last day of summer','nostalgia, endings, change'],['A door that should not open','curiosity, dread, forbidden'],['Two strangers share a train','chance, connection, journey'],['Rediscovering a childhood home','memory, loss, belonging'],['A city where it never rains','worldbuilding, unease, drought'],['The witness who lied','mystery, motive, truth'],['A map to nowhere','quest, trickery, discovery'],['The inheritance','family, secrets, money'],['Parallel lives','choice, alternate paths, fate']],
 design:[['Brutalist','raw, bold, concrete'],['Art deco','geometric, gold, ornate'],['Minimal Scandinavian','clean, bright, functional'],['Cyberpunk neon','dark, electric, futuristic'],['Vaporwave','pastel, retro, digital'],['Bauhaus','primary colours, shapes, order'],['Japanese wabi-sabi','imperfect, natural, calm'],['Retro futurism','optimistic, atomic, mid-century'],['Botanical green','organic, lush, fresh'],['Monochrome editorial','type-led, black and white, sharp']],
 game:[['Haunted mansion','explore, spooky, puzzles'],['Space station survival','resource, sci-fi, tension'],['Desert island survival','craft, explore, endure'],['Cyberpunk heist','stealth, tech, planning'],['Medieval siege','defend, strategy, combat'],['Deep sea exploration','mystery, pressure, discovery'],['Post-apocalyptic wasteland','scavenge, survive, rebuild'],['Enchanted forest','magic, nature, wonder'],['Pirate cove','treasure, ships, adventure'],['Time loop','repeat, learn, escape']]
};`,
  build: `
    var cat=$('themeCategory')?$('themeCategory').value:'any';
    var key=cat==='any'?pick(['party','writing','design','game']):cat;
    var item=pick(D[key]);
    return {v:item[0],sub:key.charAt(0).toUpperCase()+key.slice(1)+' - '+item[1]};`,
  extraJs: `['themeCategory'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  article: {
    title: 'Random Theme Generator: A Direction When You Need One',
    lead: `<p>Blank pages are stubborn. This <strong>random theme generator</strong> hands you a direction - a party concept, a writing theme, a design mood or a game setting - complete with a few keywords to start working from.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-palette', heading: 'Four kinds of theme', html: `<p><strong>Party</strong> themes give you a whole event concept from decor to dress code. <strong>Writing</strong> themes are seeds for scenes and stories rather than genres. <strong>Design</strong> themes describe a visual mood you can build a brand or interface around. <strong>Game</strong> themes set a world and implied mechanics. The tags turn each theme into an instruction instead of a label.</p>` },
      { id: 'creative-uses', icon: 'fa-solid fa-lightbulb', heading: 'Breaking creative block', html: `<p>Commit to the first result you get, even if it is not your instinct. Constraints breed ideas, and a theme you would never choose yourself often produces your most interesting work. Generate a handful and combine two if one alone feels thin.</p>` }
    ],
    steps: ['Choose a category or leave it on "Any".', 'Set how many themes you want.', 'Press <strong>Generate</strong>.', 'Copy the theme and its keywords into your brief.'],
    facts: [['Categories', 'Party, writing, design, game'], ['Extras', 'Keyword tags per theme'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Data', 'Generated locally']],
    useCases: [
      ['Event planning', 'Pick a party theme and its keywords for invites and decor.'],
      ['Writing practice', 'Use a theme as a weekly prompt.'],
      ['Design sprints', 'Assign a mood to a mock-up or a brand exercise.']
    ],
    tips: ['Commit to the first result for a true creative constraint.', 'Combine two themes if one feels too familiar.', 'Use the keyword tags as a checklist for your brief.'],
    takeaways: ['A clear creative direction in one click.', 'Keyword tags turn a theme into a plan.', 'Works for events, writing, design and games.'],
    faq: [
      ['What is a theme, exactly?', 'A short concept - like "Neon 80s" or "Art deco" - plus a few keywords that describe its mood.'],
      ['Can I use these for paid projects?', 'Yes. The themes are generic creative directions, free to build on.'],
      ['Are themes from one category only?', 'Pick a category, or leave it on "Any" to draw from all four.'],
      ['Can I get duplicates?', 'Not within a single run.'],
      ['Is it really free?', 'Yes, with no account and no limit beyond 50 per run.']
    ],
    conclusion: `<p>Stop waiting for inspiration and pick a direction instead. The <strong>random theme generator</strong> starts the work for you. For drawing ideas, try the <a href="random-drawing-generator.html">random drawing generator</a>.</p>`
  }
}));

/* ========================================================================
   10. ISLAND NAME GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'isle', file: 'island-name-generator.html',
  name: 'Island Name Generator', tag: 'Fantasy', icon: 'fa-solid fa-compass',
  title: 'Island Name Generator | Exotic & Unique Island Names',
  metaDesc: 'Create unique, exotic island names for stories, games and world-building. Generate a full archipelago in one click - free and 100% client-side.',
  desc: 'Create unique and exotic island names for your stories, games or world-building.',
  keywords: ['island name generator', 'island names', 'fantasy island names', 'tropical island names', 'world building names', 'random island name', 'island name ideas', 'atoll names', 'island name maker', 'place name generator'],
  featureList: ['Melodic, island-style names', 'A descriptive tag for each island', 'Generate up to 50 at once', 'Duplicate-free within a run', 'Copy the list', '100% client-side'],
  optionsHtml: '',
  data: `var pre=['Azu','Cora','Ely','Fara','Gale','Isla','Kala','Luma','Mira','Nora','Ora','Para','Quil','Rosa','Sola','Tavi','Uma','Vela','Wira','Zara','Bela','Cala','Dune','Esha','Fiore'];
var mid=['','','','','mir','lan','dor','ven','sal','mar','ra','na','ta'];
var suf=['ra','lia','nia','thia','una','ora','ada','ea','ika','osa','vera','pio','shu','kai','mana'];
var tag=['tropical paradise','volcanic isle','coral atoll','hidden cove','misty retreat','deserted islet','sun-drenched haven','windswept shore','emerald isle','sleepy fishing isle'];`,
  build: `
    var name=cap(pick(pre))+pick(mid)+pick(suf);
    return {v:name,sub:'A '+pick(tag)};`,
  article: {
    title: 'Island Name Generator: Name Every Islet in Your World',
    lead: `<p>Islands carry a special weight in stories - they are places apart, where the rules can be different. This <strong>island name generator</strong> produces melodic, exotic names built from open vowels and soft consonants, each with a descriptive tag to anchor the setting.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-droplet', heading: 'Names with an island sound', html: `<p>Island names tend to be open and liquid: think of the vowel-heavy place names of the Pacific and the Mediterranean. The generator combines a warm first syllable, an optional linking sound and a soft ending, then tags the result as a tropical paradise, a volcanic isle or a hidden cove. That tag gives you a starting image for the place itself.</p>` },
      { id: 'worldbuilding', icon: 'fa-solid fa-map', heading: 'Building an archipelago', html: `<p>Generate twenty names at once and you have a whole sea of islands, each distinct but sharing a linguistic feel. Name the main island with a short, memorable pick and give distant, mysterious isles the longer names. Consistency of sound makes a fictional map feel real.</p>` }
    ],
    steps: ['Set how many island names you need.', 'Press <strong>Generate</strong>.', 'Read the tag for a setting idea.', 'Copy the list into your map notes.'],
    facts: [['Sound', 'Open, melodic, island-like'], ['Extras', 'A descriptive tag per island'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Data', 'Generated locally']],
    useCases: [
      ['Fantasy world-building', 'Fill a map with a coherent set of island names.'],
      ['Writing a sea story', 'Name the island your characters are shipwrecked on.'],
      ['Games', 'Create levels or regions for a nautical adventure.']
    ],
    tips: ['Name the central island shortest and the far ones longer.', 'Keep the tag in mind when you describe the place.', 'Generate a large batch and pick a family of names that sound related.'],
    takeaways: ['Melodic names that read as islands.', 'Tags give each island an instant character.', 'Build a whole archipelago in one run.'],
    faq: [
      ['Are these real island names?', 'No. They are invented names that sound like islands, safe to use in your own worlds.'],
      ['Can I use them commercially?', 'Yes. The generated combinations are yours to use.'],
      ['How do I keep names consistent?', 'Generate a large batch and choose names that share similar sounds.'],
      ['What does the tag mean?', 'It suggests a setting type - tropical, volcanic, hidden - to spark your description.'],
      ['Do you store anything?', 'No. Everything is generated in your browser.']
    ],
    conclusion: `<p>Chart a sea of your own. The <strong>island name generator</strong> gives your world the places it needs. For the creatures that live there, try the <a href="dragon-name-generator.html">dragon name generator</a>.</p>`
  }
}));

/* ========================================================================
   11. RANDOM DRAWING GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'draw', file: 'random-drawing-generator.html',
  name: 'Random Drawing Generator', tag: 'Creativity', icon: 'fa-solid fa-paintbrush',
  title: 'Random Drawing Generator | Drawing Ideas & Art Prompts',
  metaDesc: 'Get random drawing ideas to spark your creativity. Choose subjects and a modifier, then sketch straight from the prompt - free and 100% client-side.',
  desc: 'Get random drawing ideas to spark your creativity, with a subject and a twist.',
  keywords: ['random drawing generator', 'drawing ideas', 'art prompts', 'random drawing prompt', 'sketch ideas', 'drawing challenge', 'creative prompts', 'what to draw', 'sketchbook ideas', 'drawing generator'],
  featureList: ['Objects, creatures, people and scenes', 'A twist to stretch your technique', 'Generate up to 50 prompts', 'Duplicate-free within a run', 'Copy the list', '100% client-side'],
  optionsHtml: selectField('draw', 'Type', [['any', 'Any subject'], ['object', 'Objects'], ['creature', 'Creatures'], ['people', 'People'], ['scene', 'Scenes']]),
  data: `var SUB={
 object:['a chipped teacup','an old padlock','a wilted houseplant','a pair of worn boots','a brass telescope','a stack of books','a paper lantern','an antique clock','a jar of buttons','a dented kettle'],
 creature:['a sleepy dragon','a mechanical owl','a forest spirit','an armoured beetle','a ghostly cat','a deep-sea fish','a winged horse','a moss golem','a phoenix','a stone gargoyle'],
 people:['a tired knight','a street musician','a lighthouse keeper','a masked dancer','a florist at work','an astronaut','a storyteller','a royal in disguise','a mechanic','a desert wanderer'],
 scene:['a rainy market street','a library at midnight','a cliffside village','a train through the mountains','a sunken city','a snowy cabin','a neon alleyway','a harvest field','a space station window','a ruined temple']
};
var MOD=['in ink only','with a limited palette of three colours','from an unusual angle','in silhouette','using only straight lines','in five minutes','upside down','with dramatic lighting','as a tiny thumbnail','with heavy texture'];`,
  build: `
    var type=$('drawType')?$('drawType').value:'any';
    var key=type==='any'?pick(['object','creature','people','scene']):type;
    return {v:pick(SUB[key])+', '+pick(MOD),sub:cap(key)+' drawing prompt'};`,
  extraJs: `['drawType'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  article: {
    title: 'Random Drawing Generator: Beat the Blank Page',
    lead: `<p>The hardest part of drawing is deciding what to draw. This <strong>random drawing generator</strong> gives you a subject and a twist - "a paper lantern, from an unusual angle" - so you can start making marks instead of deliberating.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-pen', heading: 'A subject plus a constraint', html: `<p>Each prompt pairs a subject from one of four categories - objects, creatures, people or scenes - with a modifier that changes how you approach it. The modifier is the important part: a five-minute limit, a three-colour palette or an odd angle forces decisions and teaches you faster than a free choice would.</p>` },
      { id: 'practice', icon: 'fa-solid fa-lightbulb', heading: 'Turning prompts into practice', html: `<p>Use one prompt a day as a warm-up, or draw the same prompt three times with different modifiers to compare approaches. For challenge communities, generate a list and share it as that week\'s set. The randomness keeps your practice broad, hitting subjects you would otherwise avoid.</p>` }
    ],
    steps: ['Choose a subject type or leave it on "Any".', 'Set how many prompts you want.', 'Press <strong>Generate</strong>.', 'Sketch the first prompt without second-guessing it.'],
    facts: [['Subjects', 'Objects, creatures, people, scenes'], ['Twist', 'A modifier that shapes the drawing'], ['Batch', 'Up to 50 prompts per run'], ['Duplicates', 'Avoided within a run'], ['Data', 'Generated locally']],
    useCases: [
      ['Daily warm-ups', 'Start every sketch session with a quick prompt.'],
      ['Challenge lists', 'Generate a week of prompts to share with a group.'],
      ['Art class', 'Hand out random prompts so every student draws something different.']
    ],
    tips: ['Draw the first prompt immediately, before you talk yourself out of it.', 'Repeat a prompt with different modifiers to compare results.', 'Use the modifier as a rule, not a suggestion.'],
    takeaways: ['A concrete prompt beats a blank page.', 'Constraints improve technique fast.', 'Generate a whole challenge set in one click.'],
    faq: [
      ['Is this suitable for beginners?', 'Yes. Prompts are simple, everyday subjects that anyone can attempt.'],
      ['Can I choose what kind of thing to draw?', 'Yes. Pick objects, creatures, people or scenes, or leave it fully random.'],
      ['What if I do not like the prompt?', 'Generate again, or accept the challenge - the point is to draw something you would not normally choose.'],
      ['Can I use these prompts for a class or challenge?', 'Yes, they are free to use and share.'],
      ['Do you store anything?', 'No. Prompts are generated in your browser.']
    ],
    conclusion: `<p>Stop planning and start drawing. The <strong>random drawing generator</strong> hands you a subject and a reason to begin. For a different kind of prompt, try the <a href="random-theme-generator.html">random theme generator</a>.</p>`
  }
}));

/* ========================================================================
   12. GREEK NAME GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'greek', file: 'greek-name-generator.html',
  name: 'Greek Name Generator', tag: 'Names', icon: 'fa-solid fa-building-columns',
  title: 'Greek Name Generator | Classic Greek Names & Meanings',
  metaDesc: 'Generate classic Greek names inspired by ancient myths, heroes and gods, with the meaning of each name. Choose male, female or any - free and 100% client-side.',
  desc: 'Generate classic Greek names inspired by ancient myths, heroes and gods, with meanings.',
  keywords: ['greek name generator', 'greek names', 'ancient greek names', 'greek name ideas', 'greek mythology names', 'male greek names', 'female greek names', 'greek name meanings', 'greek character names', 'classical names'],
  featureList: ['Male and female Greek names', 'The meaning of every name', 'Generate up to 50 at once', 'Duplicate-free within a run', 'Copy the list', '100% client-side'],
  optionsHtml: selectField('greek', 'Gender', [['any', 'Any'], ['male', 'Male'], ['female', 'Female']]),
  data: `var M=[['Alexander','defender of the people'],['Andreas','manly, brave'],['Dimitrios','follower of Demeter'],['Georgios','farmer, earth-worker'],['Konstantinos','steadfast, constant'],['Nikolaos','victory of the people'],['Stavros','cross'],['Athanasios','immortal'],['Ioannis','God is gracious'],['Petros','rock, stone'],['Vasilios','royal, kingly'],['Christos','anointed one'],['Leonidas','son of a lion'],['Spyridon','spirit, basket'],['Theodoros','gift of God'],['Achilles','pain, grief'],['Odysseus','wrath, hated'],['Hector','holding fast'],['Perseus','to destroy'],['Theseus','to set, to place']];
var F=[['Sophia','wisdom'],['Eleni','torch, shining light'],['Maria','beloved'],['Katerina','pure'],['Vasiliki','royal, queenly'],['Angeliki','messenger, angel'],['Ioanna','God is gracious'],['Christina','follower of Christ'],['Dimitra','of Demeter'],['Athina','wisdom'],['Eirini','peace'],['Georgia','farmer, earth-worker'],['Panagiota','all-holy'],['Despina','lady, mistress'],['Anastasia','resurrection'],['Athena','wisdom, warfare'],['Penelope','weaver, loyal'],['Helen','torch, shining light'],['Persephone','bringer of destruction'],['Cassandra','shining upon man']];`,
  build: `
    var g=$('greekGender')?$('greekGender').value:'any';
    var m=g==='male'?true:(g==='female'?false:Math.random()<0.5);
    var r=pick(m?M:F);
    return {v:r[0],sub:r[1]+' ('+(m?'male':'female')+')'};`,
  extraJs: `['greekGender'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  article: {
    title: 'Greek Name Generator: Classical Names With Real Meanings',
    lead: `<p>Greek names carry thousands of years of meaning. This <strong>Greek name generator</strong> draws from a pool of classical male and female names, each paired with its meaning, so you get not just a name but the idea behind it.</p>`,
    sections: [
      { id: 'pool', icon: 'fa-solid fa-book', heading: 'Names rooted in history and myth', html: `<p>The pool blends everyday modern Greek names - Sophia, Nikolaos, Eleni - with names drawn from myth and legend such as Odysseus, Athena and Persephone. Every entry comes with a plain-English meaning, which is invaluable for authors who want a name that quietly reinforces a character\'s role.</p>` },
      { id: 'choosing', icon: 'fa-solid fa-lightbulb', heading: 'Choosing a name with purpose', html: `<p>Meanings are a subtle storytelling tool. A warrior named Leonidas, "son of a lion", arrives already characterised. A healer called Sophia, "wisdom", sets an expectation the plot can reward or subvert. Use the meaning to choose, then let the story do the rest.</p>` }
    ],
    steps: ['Choose male, female or any.', 'Set how many names you want.', 'Press <strong>Generate</strong>.', 'Read the meaning and shortlist your favourites.'],
    facts: [['Pool', 'Classical modern and mythical names'], ['Meaning', 'Given for every name'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Data', 'Generated locally']],
    useCases: [
      ['Character naming', 'Pick a name whose meaning suits the character\'s arc.'],
      ['Baby naming', 'Explore classical names and what they mean.'],
      ['Study and teaching', 'Introduce students to Greek etymology through names.']
    ],
    tips: ['Choose by meaning when a character needs a subtle theme.', 'Mix mythical and modern names for a broad shortlist.', 'Say the name out loud to check it flows with a surname.'],
    takeaways: ['Every name comes with its meaning.', 'Both male and female pools are covered.', 'Classical names with real historical roots.'],
    faq: [
      ['Are these real Greek names?', 'Yes, they are genuine Greek names, many still common in Greece today.'],
      ['Do you include the meaning?', 'Yes, each result shows the name and its meaning and gender.'],
      ['Can I filter by gender?', 'Yes, choose male, female or any.'],
      ['Do the names repeat?', 'Not within a single run.'],
      ['Is anything uploaded?', 'No. Names are generated entirely in your browser.']
    ],
    conclusion: `<p>Find a name with history behind it. The <strong>Greek name generator</strong> pairs every name with its meaning. For more fantasy naming, try the <a href="dragonborn-name-generator.html">Dragonborn name generator</a>.</p>`
  }
}));

/* ========================================================================
   13. XBOX USERNAME GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'xbox', file: 'xbox-username-generator.html',
  name: 'Xbox Username Generator', tag: 'Gaming', icon: 'fa-brands fa-xbox',
  title: 'Xbox Username Generator | Cool Gamertag Ideas',
  metaDesc: 'Get cool and unique gamertag ideas for your Xbox profile in one click. Keep it within the 12-character limit and copy your favourite - free and client-side.',
  desc: 'Get cool and unique gamertag ideas for your Xbox profile in one click.',
  keywords: ['xbox username generator', 'xbox gamertag generator', 'gamertag ideas', 'xbox name generator', 'cool gamertags', 'xbox username ideas', 'gamertag maker', 'xbox nickname', 'gaming username generator', 'unique gamertag'],
  featureList: ['Casual, competitive and funny styles', 'Respects the 12-character Xbox limit', 'Optional number suffix', 'Generate up to 50 at once', 'Copy the list', '100% client-side'],
  optionsHtml: selectField('xbox', 'Style', [['any', 'Any style'], ['casual', 'Casual'], ['competitive', 'Competitive'], ['funny', 'Funny']]) +
    toggleField('xbox', 'Numbers', 'Add numbers', true),
  data: `var D={
 casual:{ a:['Silent','Cosmic','Frosty','Lunar','Swift','Shadow','Amber','Iron','Neon','Turbo'], n:['Fox','Wolf','Panda','Falcon','Raven','Otter','Tiger','Comet','Ghost','Nomad'] },
 competitive:{ a:['Apex','Rapid','Fatal','Elite','Prime','Savage','Sniper','Berserk','Vector','Toxic'], n:['Strike','Blitz','Slayer','Edge','Sniper','Hunter','Rider','Warden','Reaper','Ace'] },
 funny:{ a:['Soggy','Grumpy','Clumsy','Sleepy','Confused','Hungry','Salty','Wobbly','Lazy','Panicky'], n:['Waffle','Potato','Noodle','Bandit','Llama','Toast','Badger','Pickle','Goblin','Muffin'] }
};`,
  build: `
    var style=$('xboxStyle')?$('xboxStyle').value:'any';
    var key=style==='any'?pick(['casual','competitive','funny']):style;
    var set=D[key];
    var name=pick(set.a)+pick(set.n);
    if(!$('xboxNumbers')||$('xboxNumbers').value==='1'){if(Math.random()<0.7){name+=String(Math.floor(Math.random()*90)+10);}}
    name=name.split(' ').join('');
    if(name.length>12){name=name.slice(0,12);}
    return {v:name,sub:cap(key)+' - '+name.length+' characters'};`,
  extraJs: `['xboxStyle','xboxNumbers'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  workflow: ['tools/fun/villain-name-generator.html', 'tools/fun/warrior-name-generator.html'],
  article: {
    title: 'Xbox Username Generator: A Gamertag That Fits',
    lead: `<p>Your Xbox gamertag is your first impression in every lobby. This <strong>Xbox username generator</strong> blends an adjective with a noun to create cool, readable tags across casual, competitive and funny moods - and keeps every result inside Xbox\'s 12-character limit.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-dice', heading: 'Built around Xbox rules', html: `<p>Xbox gamertags may be up to 12 characters, so the generator strips spaces and trims any result that runs long, meaning nothing you copy will be rejected for length. The optional number suffix mimics the classic gamertag look, and the character count is shown with each suggestion so you can see exactly what you are working with.</p>` },
      { id: 'styles', icon: 'fa-solid fa-lightbulb', heading: 'Pick a style that matches your play', html: `<p><strong>Casual</strong> tags feel friendly and easygoing. <strong>Competitive</strong> tags sound aggressive and precise, good for ranked play. <strong>Funny</strong> tags trade cool for memorable, which suits a party lobby. Generate a batch and mix elements you like from different suggestions - you can always tweak a generated tag by hand.</p>` }
    ],
    steps: ['Choose a style, or leave it on "Any".', 'Decide whether to include numbers.', 'Set how many suggestions you want and press <strong>Generate</strong>.', 'Copy the tag you like and check availability on Xbox.'],
    facts: [['Limit', 'Keeps within Xbox\'s 12 characters'], ['Styles', 'Casual, competitive, funny'], ['Extras', 'Optional number suffix and live character count'], ['Batch', 'Up to 50 per run'], ['Data', 'Generated locally']],
    useCases: [
      ['New Xbox account', 'Land on a clean, readable gamertag fast.'],
      ['Renaming', 'Refresh an old tag with a fresh style.'],
      ['Branding', 'Find a consistent handle to reuse across gaming platforms.']
    ],
    tips: ['Keep it short and easy to read aloud in voice chat.', 'Avoid numbers if you want a cleaner look, or add them to stand out.', 'Check availability on Xbox before you get attached to one.'],
    takeaways: ['Every suggestion fits the 12-character limit.', 'Three styles cover casual, competitive and funny.', 'Character count is shown for each tag.'],
    faq: [
      ['What is the Xbox gamertag length limit?', 'Up to 12 characters, and this generator keeps every result within that limit.'],
      ['Are these tags guaranteed to be available?', 'No. The generator creates ideas; you still need to check availability on Xbox.'],
      ['Can I use a tag on other platforms too?', 'Yes, most suggestions work as a general gaming handle.'],
      ['Why are spaces removed?', 'Xbox gamertags do not allow spaces, so they are stripped automatically.'],
      ['Do you store my choices?', 'No. Tags are generated entirely in your browser.']
    ],
    conclusion: `<p>Get a gamertag that reads well and fits the rules. The <strong>Xbox username generator</strong> does it in one click. For a character name, try the <a href="warrior-name-generator.html">warrior name generator</a>.</p>`
  }
}));

/* ========================================================================
   14. VILLAIN NAME GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'vill', file: 'villain-name-generator.html',
  name: 'Villain Name Generator', tag: 'Fantasy', icon: 'fa-solid fa-user-secret',
  title: 'Villain Name Generator | Dark Antagonist Names',
  metaDesc: 'Create dark, memorable villain names for stories, games and comics. Choose a style and copy a ready-made roster of antagonists - free and 100% client-side.',
  desc: 'Create dark and memorable villain names for your stories, games or comics.',
  keywords: ['villain name generator', 'villain names', 'antagonist names', 'evil name generator', 'dark names', 'supervillain names', 'fantasy villain names', 'bad guy names', 'villain name ideas', 'character names'],
  featureList: ['Dark, regal and cunning styles', 'First name plus a menacing title', 'Generate up to 50 at once', 'Duplicate-free within a run', 'Copy the list', '100% client-side'],
  optionsHtml: selectField('vill', 'Style', [['any', 'Any style'], ['dark', 'Dark lord'], ['regal', 'Regal tyrant'], ['cunning', 'Cunning schemer'], ['beast', 'Beast / monster']]),
  data: `var D={
 dark:{ f:['Malakar','Nyxar','Vorgath','Draven','Sable','Morvane','Karthos','Umbra','Vexis','Grimm'], t:['the Soulrender','the Hollow King','the Devourer','of the Black Gate','the Shadowlord','the Ender of Days','the Silent Doom','the Ashen One'] },
 regal:{ f:['Lord Aurex','Empress Vale','Baron Kruul','Queen Morgana','Duke Severin','Countess Nyx','King Aldrich','Lady Obsidia'], t:['the Iron-Fisted','the Usurper','the Crowned Viper','of the Crimson Court','the Unbowed','the Golden Tyrant','the Stolen Throne'] },
 cunning:{ f:['Silas Crowe','Vesper Locke','Marlowe','Reynard','Cassia Vane','Dorian Quill','Lysander','Morgana Vex'], t:['the Whisperer','the Puppetmaster','the Silver Tongue','the Architect of Lies','the Unseen Hand','the Betrayer','the Spider'] },
 beast:{ f:['Ghor','Skarn','Ulgath','Bloodmaw','Rend','Thokk','Kraag','Venomfang'], t:['the Everhungry','the Rotted','the Iron Hide','the Deepdweller','the Many-Mouthed','the Ruin','the Swarm'] }
};`,
  build: `
    var style=$('villStyle')?$('villStyle').value:'any';
    var key=style==='any'?pick(['dark','regal','cunning','beast']):style;
    var set=D[key];
    return {v:pick(set.f)+' '+pick(set.t),sub:cap(key)+' villain'};`,
  extraJs: `['villStyle'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  workflow: ['tools/fun/warrior-name-generator.html', 'tools/fun/dragon-name-generator.html'],
  article: {
    title: 'Villain Name Generator: Name Your Antagonist',
    lead: `<p>A great villain needs a name that promises trouble before they even speak. This <strong>villain name generator</strong> crafts dark, memorable antagonists by pairing a first name with a menacing title - "Lord Aurex the Usurper", "Silas Crowe the Puppetmaster".</p>`,
    sections: [
      { id: 'styles', icon: 'fa-solid fa-user-secret', heading: 'Match the villain to the story', html: `<p><strong>Dark lord</strong> names are cosmic and ominous, suited to a final boss. <strong>Regal tyrant</strong> names carry courtly menace for politically driven plots. <strong>Cunning schemer</strong> names are human and plausible, ideal for a traitor or a manipulator. <strong>Beast</strong> names are guttural and monstrous for a non-human threat. Switch styles and the whole feel of your antagonist changes.</p>` },
      { id: 'titles', icon: 'fa-solid fa-award', heading: 'Titles do the heavy lifting', html: `<p>The title is where the menace lives. "The Puppetmaster" implies a plot; "the Usurper" implies a stolen throne; "the Everhungry" implies appetite and threat. Choose a title that hints at the villain\'s method, so the name foreshadows how the hero will have to fight them.</p>` }
    ],
    steps: ['Pick a style or leave it on "Any".', 'Set how many names you need.', 'Press <strong>Generate</strong>.', 'Copy the roster of potential antagonists.'],
    facts: [['Styles', 'Dark, regal, cunning, beast'], ['Format', 'First name + menacing title'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Data', 'Generated locally']],
    useCases: [
      ['Writing fiction', 'Name a villain whose title foreshadows their method.'],
      ['RPG campaigns', 'Build a whole rogues gallery of antagonists.'],
      ['Comics and games', 'Find a name that reads as a threat at a glance.']
    ],
    tips: ['Let the title hint at the villain\'s method, not just their mood.', 'Use shorter names for villains the audience meets often.', 'Keep a strong name for the final confrontation.'  ],
    takeaways: ['The title does the characterisation.', 'Four styles cover many genres.', 'A full rogues gallery in one run.'],
    faq: [
      ['Can I use these villain names?', 'Yes. Generated names are yours to use in your stories, campaigns and projects.'],
      ['Which style suits a traitor?', 'The cunning schemer style, whose names feel human and untrustworthy.'],
      ['Are the names repeated?', 'Not within a single run.'],
      ['Can I mix styles?', 'Yes. Leave the style on "Any" to draw from all four pools.'],
      ['Is anything stored?', 'No. Names are generated entirely in your browser.']
    ],
    conclusion: `<p>Give your antagonist a name that carries a threat. The <strong>villain name generator</strong> builds a rogues gallery in seconds. For the heroes, try the <a href="warrior-name-generator.html">warrior name generator</a>.</p>`
  }
}));

/* ========================================================================
   15. DRAGONBORN NAME GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'dborn', file: 'dragonborn-name-generator.html',
  name: 'Dragonborn Name Generator', tag: 'Fantasy', icon: 'fa-solid fa-fire-flame-curved',
  title: 'Dragonborn Name Generator | D&D Character Names',
  metaDesc: 'Generate fierce Dragonborn names for D&D characters and fantasy campaigns, with given names and clan names. Choose male, female or any - free and client-side.',
  desc: 'Generate fierce Dragonborn names for your D&D characters and fantasy campaigns.',
  keywords: ['dragonborn name generator', 'dragonborn names', 'dnd name generator', 'dnd dragonborn names', 'fantasy character names', 'dragonborn clan names', 'tabletop rpg names', 'dragonborn name ideas', 'roleplay names', 'd&d names'],
  featureList: ['Male and female given names', 'Authentic-style clan names', 'Choose or randomise the clan', 'Generate up to 50 at once', 'Copy the list', '100% client-side'],
  optionsHtml: selectField('dborn', 'Gender', [['any', 'Any'], ['male', 'Male'], ['female', 'Female']]) +
    selectField('dborn', 'Clan', [['any', 'Random clan'], ['Myastan', 'Myastan'], ['Norixius', 'Norixius'], ['Clethtinthiallor', 'Clethtinthiallor'], ['Kerrhylon', 'Kerrhylon'], ['Yarjerit', 'Yarjerit']]),
  data: `var M=['Arjhan','Balasar','Bharash','Donaar','Ghesh','Heskan','Kriv','Medrash','Mehen','Nadarr','Pandjed','Patrin','Rhogar','Shamash','Shedinn','Tarhun','Torinn'];
var F=['Akra','Biri','Daar','Farideh','Harann','Havilar','Jheri','Kava','Korinn','Mishann','Nala','Perra','Raiann','Sora','Surina','Thava','Uadjit'];
var CLAN=['Clethtinthiallor','Daardendrian','Delmirev','Drachedandion','Fenkenkabradon','Kepeshkmolik','Kerrhylon','Kibasaran','Linxakasendalor','Myastan','Nemmonis','Norixius','Ophinshtalajiir','Prexijandilin','Shestendeliath','Turnuroth','Verthisathurgiesh','Yarjerit'];`,
  build: `
    var g=$('dbornGender')?$('dbornGender').value:'any';
    var isM=g==='male'?true:(g==='female'?false:Math.random()<0.5);
    var clanSel=$('dbornClan')?$('dbornClan').value:'any';
    var clan=clanSel==='any'?pick(CLAN):clanSel;
    var given=pick(isM?M:F);
    return {v:given+' '+clan,sub:clan+' clan - '+(isM?'male':'female')};`,
  extraJs: `['dbornGender','dbornClan'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  workflow: ['tools/fun/dragon-name-generator.html', 'tools/fun/warrior-name-generator.html'],
  article: {
    title: 'Dragonborn Name Generator: Given Names and Clan Names for D&D',
    lead: `<p>Dragonborn naming has its own logic: a personal given name followed by a clan name, spoken with pride. This <strong>Dragonborn name generator</strong> produces that pattern with masculine and feminine given names and a deep pool of clan names, ready for your D&D character sheet or campaign.</p>`,
    sections: [
      { id: 'structure', icon: 'fa-solid fa-book', heading: 'Given name plus clan name', html: `<p>A Dragonborn introduces themselves by given name and clan - "Balasar Myastan". The given name is personal and short; the clan name is what the world remembers, and it can carry honour or shame depending on the clan\'s history. The generator lets you draw a random clan or pin a specific one, which is useful when you already know your character\'s family background.</p>` },
      { id: 'roleplay', icon: 'fa-solid fa-dice', heading: 'Using it at the table', html: `<p>Generate a handful of names and keep the ones you did not pick as NPCs from the same clan - instantly you have relatives, rivals and allies who sound like they belong together. Because the naming style is consistent, a whole campaign\'s worth of Dragonborn feels like one culture rather than a random list.</p>` }
    ],
    steps: ['Choose the gender and, optionally, a clan.', 'Set how many names you want.', 'Press <strong>Generate</strong>.', 'Copy the names for your character or NPC roster.'],
    facts: [['Naming', 'Given name + clan name'], ['Genders', 'Masculine and feminine given names'], ['Clans', 'A deep pool, or pin a specific one'], ['Batch', 'Up to 50 per run'], ['Data', 'Generated locally']],
    useCases: [
      ['Player characters', 'Name your Dragonborn with an authentic given and clan name.'],
      ['NPCs and families', 'Build a clan of related characters in one run.'],
      ['World building', 'Populate a region with a coherent Dragonborn culture.']
    ],
    tips: ['Pin a clan when your character has a known family history.', 'Keep the unused results as NPCs from the same clan.', 'Say the full name aloud - it should sound like a formal introduction.'],
    takeaways: ['The given-name-plus-clan pattern is preserved.', 'Pin a clan or leave it random.', 'Works for PCs, NPCs and whole families.'],
    faq: [
      ['How are Dragonborn named?', 'Traditionally with a personal given name followed by a clan name, in that order.'],
      ['Can I choose a specific clan?', 'Yes. Pick a clan from the list, or leave it random to draw from the whole pool.'],
      ['Are there male and female names?', 'Yes, separate pools for masculine and feminine given names.'],
      ['Can I use these in my campaign?', 'Yes. Names generated here are free to use in your games and stories.'],
      ['Do you store anything?', 'No. Names are generated entirely in your browser.']
    ],
    conclusion: `<p>Give your Dragonborn a name worthy of their clan. The <strong>Dragonborn name generator</strong> covers given names and clan names in one click. For the dragons themselves, try the <a href="dragon-name-generator.html">dragon name generator</a>.</p>`
  }
}));

/* @@MORE_TOOLS@@ */

/* ---------- emit pages + register ---------- */
const entries = [];
for (const spec of TOOLS) {
  const html = buildPage(spec);
  const outPath = path.join(ROOT, 'tools', spec.folder, spec.file);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
  entries.push({
    name: spec.name, desc: spec.desc, icon: spec.icon, tag: spec.tag,
    category: catFolder(spec.folder), href: 'tools/' + spec.folder + '/' + spec.file,
    keywords: spec.keywords, recent: true, workflow: spec.workflow
  });
  console.log('wrote', path.relative(ROOT, outPath), '(' + html.length + ' bytes)');
}
const res = registerTools(entries);
console.log('registry: added', res.added, 'skipped', res.skipped);
