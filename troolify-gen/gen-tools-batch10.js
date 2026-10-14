/* ============================================================================
   Troolify - batch 10 (more random generators)
   A second set of 100% client-side random generators sharing the same compact
   scaffold as batch 9: data + a build() returning { v, sub }. Emits standard
   tool pages into tools/fun/ and registers them in assets/js/tools-data.js.
   Category: Fun (tools/fun/)
   Run: node troolify-gen/gen-tools-batch10.js   (from the repo root)
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
   1. RANDOM ANIMAL GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'animal', file: 'random-animal-generator.html',
  name: 'Random Animal Generator', tag: 'Random', icon: 'fa-solid fa-feather',
  title: 'Random Animal Generator | Pick a Random Animal Instantly',
  metaDesc: 'Get a random animal with one click - mammals, birds, reptiles, sea life or insects, each with a short note. Free, instant and 100% client-side.',
  desc: 'Get a random animal with one click, from mammals and birds to reptiles, sea life and insects.',
  keywords: ['random animal generator', 'random animal', 'animal picker', 'pick a random animal', 'random animals', 'animal name generator', 'random creature', 'animal ideas', 'random animal list', 'animal generator'],
  featureList: ['Mammals, birds, reptiles, sea life and insects', 'A short note on each animal', 'Generate up to 50 at once', 'Duplicate-free within a run', 'Copy the whole list', '100% client-side'],
  optionsHtml: selectField('animal', 'Category', [['any', 'Any category'], ['mammal', 'Mammals'], ['bird', 'Birds'], ['reptile', 'Reptiles'], ['sea', 'Sea life'], ['bug', 'Insects & bugs']]),
  data: `var D={
 mammal:[['Lion','the pride rests nearby'],['Elephant','memory in every step'],['Red Fox','sharp-eyed at dusk'],['Grey Wolf','howls to the pack'],['Grizzly Bear','heavy as a fallen tree'],['Humpback Whale','sings across the ocean'],['Kangaroo','built for the long hop'],['Giant Panda','content with bamboo'],['Cheetah','fastest thing on land'],['Hedgehog','armoured and shy'],['Otter','plays in the current'],['Bat','navigates by sound']],
 bird:[['Bald Eagle','scans from a high perch'],['Barn Owl','silent on the wing'],['Emperor Penguin','marches through the cold'],['Hummingbird','beats the air to hover'],['Common Raven','clever and unbothered'],['Flamingo','stands on one thin leg'],['Kingfisher','a flash of blue'],['Peacock','fans a hundred eyes'],['Swan','glides without a ripple'],['Peregrine Falcon','the fastest dive alive'],['Woodpecker','drums against the trunk'],['Macaw','loud and brightly dressed']],
 reptile:[['Komodo Dragon','ambushes without warning'],['Green Iguana','basks on warm stone'],['Chameleon','changes with its mood'],['King Cobra','raises a warning hood'],['Galapagos Tortoise','older than the map'],['Saltwater Crocodile','still as a log'],['Gecko','climbs the smoothest glass'],['Python','coils in patient loops'],['Frilled Lizard','opens a sudden collar'],['Box Turtle','carries its own door']],
 sea:[['Great White Shark','a shadow beneath the swell'],['Bottlenose Dolphin','curious and quick'],['Blue Whale','the largest heart on Earth'],['Giant Octopus','folds into any space'],['Sea Turtle','returns to the same beach'],['Clownfish','guards a small anemone'],['Manta Ray','soars through the blue'],['Seahorse','a knight of the shallows'],['Jellyfish','drifts without a spine'],['Electric Eel','carries its own current']],
 bug:[['Honeybee','knows the way home'],['Monarch Butterfly','travels on paper wings'],['Praying Mantis','waits, perfectly still'],['Ladybug','a small red omen'],['Dragonfly','hovers like a tiny machine'],['Ant','carries ten times its weight'],['Atlas Moth','wears a map on its wings'],['Stag Beetle','duels with its own jaws'],['Firefly','signals in the dark'],['Tarantula','old, patient and hairy']]
};`,
  build: `
    var cat=$('animalCategory')?$('animalCategory').value:'any';
    var key=cat==='any'?pick(['mammal','bird','reptile','sea','bug']):cat;
    var a=pick(D[key]);
    var label=key.charAt(0).toUpperCase()+key.slice(1);
    return {v:a[0],sub:label+' - '+a[1]};`,
  extraJs: `['animalCategory'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  workflow: ['tools/fun/random-object-generator.html', 'tools/fun/random-pokemon-generator.html'],
  article: {
    title: 'Random Animal Generator: A Creature on Demand',
    lead: `<p>Draw an animal at random for a quiz, a drawing warm-up, a writing prompt or a game. This <strong>random animal generator</strong> pulls from mammals, birds, reptiles, sea life and insects, and gives each result a one-line note so you have something concrete to work with.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-shuffle', heading: 'A broad, fair draw', html: `<p>Animals are grouped into five categories and every entry has an equal chance. Each pick carries a short note - the octopus <em>folds into any space</em>, the hummingbird <em>beats the air to hover</em> - which turns a plain name into a starting point. Within a single run the generator avoids repeats, so a shortlist stays varied.</p>` },
      { id: 'uses', icon: 'fa-solid fa-lightbulb', heading: 'Where people use it', html: `<p>Teachers use it for animal-of-the-day activities and research projects. Artists use it to warm up with an unfamiliar subject. Writers use the note as the seed of a description. Game groups use it for rapid-fire categories and charades.</p>` }
    ],
    steps: [
      'Pick a category, or leave it on "Any" to draw from all five.',
      'Set how many animals you want.',
      'Press <strong>Generate</strong>.',
      'Copy the list to keep or share it.'
    ],
    facts: [['Categories', 'Mammals, birds, reptiles, sea, insects'], ['Extras', 'A short note per animal'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Data', 'Generated locally']],
    useCases: [
      ['Classroom activities', 'Assign each student a different animal to research.'],
      ['Drawing practice', 'Sketch an animal you would not have chosen yourself.'],
      ['Writing prompts', 'Use the note as the first detail of a scene.']
    ],
    tips: ['Generate a handful and pick the one that sparks the strongest image.', 'Mix categories for a more surprising set.', 'Use the note as a constraint, not just a suggestion.'],
    takeaways: ['A fair pick across five animal groups.', 'Every animal comes with a usable detail.', 'One click gives a whole list.'],
    faq: [
      ['Is the draw fair?', 'Yes. Every animal in the selected pool has an equal chance of being picked.'],
      ['Can I restrict it to one category?', 'Yes. Choose a category, or leave it on "Any" to draw from all of them.'],
      ['Will I get the same animal twice?', 'Not within a single run - repeats are avoided until the pool is exhausted.'],
      ['Is it free?', 'Yes, and no sign-up is needed.'],
      ['Do you store my results?', 'No. Everything is generated in your browser.']
    ],
    conclusion: `<p>Let chance choose your creature. The <strong>random animal generator</strong> is quick, fair and fun. For everyday things instead, try the <a href="random-object-generator.html">random object generator</a>.</p>`
  }
}));

/* ========================================================================
   2. RANDOM EMOJI GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'emoji', file: 'random-emoji-generator.html',
  name: 'Random Emoji Generator', tag: 'Random', icon: 'fa-solid fa-face-smile',
  title: 'Random Emoji Generator | Pick a Random Emoji or Combo',
  metaDesc: 'Get a random emoji or a random 3-emoji combo in one click. Filter by category and copy the result - free, instant and 100% client-side.',
  desc: 'Get a random emoji, or a random three-emoji combo, in one click.',
  keywords: ['random emoji generator', 'random emoji', 'emoji picker', 'random emoji combo', 'emoji randomizer', 'pick an emoji', 'random emojis', 'emoji ideas', 'emoji generator', 'random smiley'],
  featureList: ['Smileys, animals, food, nature, objects and symbols', 'Single emoji or 3-emoji combos', 'Generate up to 50 at once', 'Duplicate-free within a run', 'Copy the results', '100% client-side'],
  optionsHtml: selectField('emoji', 'Category', [['any', 'Any category'], ['smileys', 'Smileys'], ['animals', 'Animals'], ['food', 'Food'], ['nature', 'Nature'], ['objects', 'Objects'], ['symbols', 'Symbols']]) +
    selectField('emoji', 'Mode', [['single', 'Single emoji'], ['combo', '3-emoji combo']]),
  data: `var D={
 smileys:['😀','😁','😂','🤣','😊','😍','😎','🤔','😴','🥳','😇','🤩','😭','😡','🤯','🥺','😅','🙃'],
 animals:['🐶','🐱','🦊','🐻','🐼','🦁','🐯','🐨','🐸','🐵','🦄','🐝','🦋','🐢','🐙','🦉','🐬','🦕'],
 food:['🍕','🍔','🍣','🍎','🍓','🍩','🍪','🍰','🌮','🥑','🍉','🍫','🍿','🥨','🍇','🍟','🌯','🍤'],
 nature:['🌲','🌻','🌈','⭐','🌙','☀️','⚡','🔥','❄️','🌊','🍀','🌸','🌵','🌍','🌋','🌠'],
 objects:['💡','🎸','📚','🚀','⚽','🎲','🔮','🎧','⌚','📷','🧭','🕹️','🎯','🏆','🎁','🧩'],
 symbols:['❤️','💯','✅','❌','✨','💫','💥','🌀','🔱','♾️','☯️','⚖️','🌟','🔔','💬','🕛']
};`,
  build: `
    var cat=$('emojiCategory')?$('emojiCategory').value:'any';
    var pool=cat==='any'?D.smileys.concat(D.animals,D.food,D.nature,D.objects,D.symbols):D[cat];
    var mode=$('emojiMode')?$('emojiMode').value:'single';
    if(mode==='combo'){return {v:pick(pool)+pick(pool)+pick(pool),sub:'3-emoji combo'};}
    return {v:pick(pool),sub:''};`,
  extraJs: `['emojiCategory','emojiMode'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  workflow: ['tools/fun/random-drawing-generator.html', 'tools/fun/random-theme-generator.html'],
  article: {
    title: 'Random Emoji Generator: One Emoji, or a Whole Combo',
    lead: `<p>Need a random emoji fast - for a reaction, a caption, a game or a bit of decoration? This <strong>random emoji generator</strong> picks from six themed categories and can even build a random three-emoji combo when one is not enough.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-shuffle', heading: 'Categories and combos', html: `<p>Choose from smileys, animals, food, nature, objects and symbols, or leave it on "Any" to draw from the whole set. Switch the mode to <strong>3-emoji combo</strong> and each result is built from three random picks - handy for a quick mood, a caption or a reaction string.</p>` },
      { id: 'uses', icon: 'fa-solid fa-lightbulb', heading: 'Everyday uses', html: `<p>Use single emoji as a fair draw for a game, a random reaction in a group chat, or a starting point for a themed post. Combos work well as quick captions, sticker ideas or a prompt for a short story. Copy the whole set and paste it wherever you need it.</p>` }
    ],
    steps: ['Pick a category, or leave it on "Any".', 'Choose single emoji or a 3-emoji combo.', 'Set how many you want and press <strong>Generate</strong>.', 'Use <strong>Copy all</strong> to paste the results.'],
    facts: [['Categories', 'Six themed groups'], ['Modes', 'Single emoji or 3-emoji combo'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Data', 'Generated locally']],
    useCases: [
      ['Games and icebreakers', 'Draw a random emoji and act it out or describe it.'],
      ['Captions and posts', 'Get a quick combo for a caption or a mood.'],
      ['Creative prompts', 'Use an emoji or combo as the seed for a drawing or story.']
    ],
    tips: ['Leave the category on "Any" for the widest variety.', 'Combos make better captions than single emoji.', 'Generate a set and pick the one that fits the moment.'],
    takeaways: ['Single emoji or three-emoji combos.', 'Six categories, or everything at once.', 'One click and a copy button.'],
    faq: [
      ['Can I get a combo instead of one emoji?', 'Yes. Switch the mode to "3-emoji combo" and each result will use three emoji.'],
      ['Are all categories available?', 'Yes - smileys, animals, food, nature, objects and symbols, plus an "Any" option.'],
      ['Will the same emoji repeat?', 'Not within a single run; repeats are avoided while the pool allows.'],
      ['Do the emoji render everywhere?', 'They are standard Unicode emoji, so they display on modern phones, tablets and computers.'],
      ['Is anything stored?', 'No. Everything is generated in your browser.']
    ],
    conclusion: `<p>One click, one emoji - or three. The <strong>random emoji generator</strong> is the fastest way to a random reaction. Want a drawing subject instead? Try the <a href="random-drawing-generator.html">random drawing generator</a>.</p>`
  }
}));

/* ========================================================================
   3. SUPERHERO NAME GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'hero', file: 'superhero-name-generator.html',
  name: 'Superhero Name Generator', tag: 'Names', icon: 'fa-solid fa-user-secret',
  title: 'Superhero Name Generator | Create Hero Names & Powers',
  metaDesc: 'Create a superhero name with a matching power in one click. Add a title like the Unstoppable, or keep it clean - free and 100% client-side.',
  desc: 'Create a superhero name with a matching power in one click.',
  keywords: ['superhero name generator', 'superhero names', 'hero name ideas', 'random superhero name', 'superhero name maker', 'comic book names', 'hero and power', 'superhero alias', 'cape name', 'character name generator'],
  featureList: ['Prefix, word and title combinations', 'A random power attached to each name', 'Generate up to 50 at once', 'Duplicate-free within a run', 'Copy the whole list', '100% client-side'],
  optionsHtml: selectField('hero', 'Format', [['title', 'Name + title'], ['plain', 'Name only']]),
  data: `var D={
 first:['Captain','Doctor','The','Lady','Lord','Mister','Miss','Agent','Commander','Professor','Shadow','Night','Star','Iron','Crimson','Silver','Turbo','Mega','Ultra','Quantum','Cobalt','Solar','Frost','Ember','Void','Nova','Prime','Rogue','Bolt','Ghost'],
 last:['Phantom','Justice','Vanguard','Sentinel','Comet','Guardian','Storm','Blade','Falcon','Titan','Seraph','Cyclone','Bastion','Specter','Halo','Rift','Warden','Archer','Knight','Wraith','Nova','Pulse','Cipher','Oracle','Meteor','Aegis','Tempest','Rook','Cinder','Vertex'],
 powers:['super strength','flight','telepathy','invisibility','super speed','energy blasts','force fields','rapid healing','shapeshifting','time control','telekinesis','laser vision','weather control','intangibility','genius intellect'],
 titles:['the Unstoppable','the Guardian','the Relentless','the Bright','the Unseen','the Defender','the Invincible','the Swift','the Wise','the Fearless']
};`,
  build: `
    var name=pick(D.first)+' '+pick(D.last);
    var fmt=$('heroFormat')?$('heroFormat').value:'title';
    if(fmt==='title'){name+=' '+pick(D.titles);}
    return {v:name,sub:cap(pick(D.powers))};`,
  extraJs: `['heroFormat'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  workflow: ['tools/fun/villain-name-generator.html', 'tools/fun/warrior-name-generator.html'],
  article: {
    title: 'Superhero Name Generator: A Code Name and a Power',
    lead: `<p>Every hero needs a name that fits on a cover. This <strong>superhero name generator</strong> blends a title, a word and an optional honorific into a codename, then attaches a random power so the character arrives ready to use.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-wand-magic-sparkles', heading: 'How the codenames are built', html: `<p>Names combine a strong opener - <em>Captain</em>, <em>Shadow</em>, <em>Quantum</em> - with a resonant noun such as <em>Sentinel</em>, <em>Vanguard</em> or <em>Specter</em>. Add a title like "the Unstoppable" for a silver-age feel, or leave it clean for something more modern. Each result also carries a power, from super strength to time control.</p>` },
      { id: 'using-it', icon: 'fa-solid fa-lightbulb', heading: 'Using it for characters and games', html: `<p>Shortlist a few names and pair the coolest with the power that fits your concept rather than the one you rolled. In tabletop games the name plus power makes a ready-made NPC. For fiction, an ironic pairing - a hero called "the Unseen" who craves the spotlight - is often more memorable than a perfect match.</p>` }
    ],
    steps: ['Choose whether to include a title.', 'Set how many names you want.', 'Press <strong>Generate</strong>.', 'Copy the shortlist for your project.'],
    facts: [['Format', 'Opener + word + optional title'], ['Extras', 'A random power per name'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Data', 'Generated locally']],
    useCases: [
      ['Comics and fiction', 'Name a hero whose codename hints at their origin.'],
      ['Tabletop games', 'Generate a hero NPC or an entire super-team.'],
      ['Costumes and roleplay', 'Find a name to match a look you already have in mind.']
    ],
    tips: ['Pair the rolled power with the name you like best rather than accepting both.', 'Reserve titles for classic or comedic heroes.', 'Keep the codename easy to shout in a fight scene.'],
    takeaways: ['A codename plus power in one click.', 'Titles are optional.', 'Works for comics, games and roleplay.'],
    faq: [
      ['Does each name come with a power?', 'Yes. Every result includes a random superpower.'],
      ['Can I leave off the title?', 'Yes. Set the format to "Name only".'],
      ['Are the names free to use?', 'Yes. Anything you create here is yours to use.'],
      ['Will names repeat?', 'Not within a single run.'],
      ['Do you store anything?', 'No. Everything is generated in your browser.']
    ],
    conclusion: `<p>Find the name behind the mask. The <strong>superhero name generator</strong> gives you a codename and a power in one click. Need an antagonist? Try the <a href="villain-name-generator.html">villain name generator</a>.</p>`
  }
}));

/* ========================================================================
   4. RANDOM JOB GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'job', file: 'random-job-generator.html',
  name: 'Random Job Generator', tag: 'Random', icon: 'fa-solid fa-briefcase',
  title: 'Random Job Generator | Pick a Random Occupation',
  metaDesc: 'Get a random job or occupation in one click, from tech and trades to creative, science and public work. Free, instant and 100% client-side.',
  desc: 'Get a random job or occupation in one click, across seven career fields.',
  keywords: ['random job generator', 'random job', 'random occupation generator', 'job picker', 'career ideas', 'random profession', 'occupation list', 'random career', 'job ideas', 'what job generator'],
  featureList: ['Tech, creative, trades, business, science and public work', 'Generate up to 50 at once', 'Duplicate-free within a run', 'Copy the whole list', 'No sign-up required', '100% client-side'],
  optionsHtml: selectField('job', 'Category', [['any', 'Any field'], ['tech', 'Tech'], ['creative', 'Creative'], ['trades', 'Trades'], ['business', 'Business'], ['science', 'Science'], ['public', 'Public service']]),
  data: `var D={
 tech:['Software Engineer','Data Scientist','DevOps Engineer','Cybersecurity Analyst','Cloud Architect','QA Tester','Mobile Developer','Machine Learning Engineer','IT Support Specialist','Database Administrator','Product Manager','UX Researcher'],
 creative:['Graphic Designer','Illustrator','Copywriter','Photographer','Video Editor','Animator','Art Director','Interior Designer','Fashion Designer','Music Producer','Game Designer','Content Creator'],
 trades:['Electrician','Plumber','Carpenter','Welder','HVAC Technician','Mason','Roofer','Locksmith','Painter and Decorator','Auto Mechanic','Landscaper','Heavy Equipment Operator'],
 business:['Account Manager','Financial Analyst','Marketing Manager','HR Specialist','Operations Manager','Sales Executive','Business Analyst','Consultant','Supply Chain Manager','Recruiter','Brand Manager','Entrepreneur'],
 science:['Biologist','Chemist','Physicist','Geologist','Astronomer','Lab Technician','Environmental Scientist','Pharmacist','Veterinarian','Research Scientist','Oceanographer','Epidemiologist'],
 public:['Teacher','Nurse','Paramedic','Firefighter','Police Officer','Social Worker','Librarian','Civil Engineer','Urban Planner','Dietitian','Therapist','Journalist']
};`,
  build: `
    var cat=$('jobCategory')?$('jobCategory').value:'any';
    var key=cat==='any'?pick(['tech','creative','trades','business','science','public']):cat;
    var label=key.charAt(0).toUpperCase()+key.slice(1);
    return {v:pick(D[key]),sub:label};`,
  extraJs: `['jobCategory'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  workflow: ['tools/fun/random-hobby-generator.html', 'tools/fun/random-object-generator.html'],
  article: {
    title: 'Random Job Generator: A Random Occupation in One Click',
    lead: `<p>Draw a job at random for a game of charades, a story, a careers lesson or a bit of daydreaming. This <strong>random job generator</strong> pulls from seven broad fields - tech, creative, trades, business, science and public service - and labels each pick with its category.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-shuffle', heading: 'Seven fields, one draw', html: `<p>Jobs are grouped so you can keep things coherent or mix them freely. The tech pool is modern and digital, the trades pool is hands-on, and the creative pool spans design, writing, music and games. Each result shows its field, which is useful when you want a themed round rather than a total surprise.</p>` },
      { id: 'uses', icon: 'fa-solid fa-lightbulb', heading: 'Where it comes in handy', html: `<p>Teachers use it for "when I grow up" activities and interview role-play. Writers use it to give a background character a believable day job. Party games use it for charades and quick-fire guessing. And sometimes you just want a prompt to think about a career you had not considered.</p>` }
    ],
    steps: ['Pick a field, or leave it on "Any".', 'Set how many jobs you want.', 'Press <strong>Generate</strong>.', 'Copy the list for your game or project.'],
    facts: [['Fields', 'Tech, creative, trades, business, science, public'], ['Shows', 'Job title and field'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Data', 'Generated locally']],
    useCases: [
      ['Charades and party games', 'Act out or draw a random job for the group to guess.'],
      ['Writing and characters', 'Give a background character a concrete occupation.'],
      ['Careers exploration', 'Spark discussion about fields a student has not considered.']
    ],
    tips: ['Keep one field selected for a themed round.', 'Mix fields for a wider, more surprising draw.', 'Use the field label as an extra clue in guessing games.'],
    takeaways: ['A fair draw across seven career fields.', 'The field label adds useful context.', 'Perfect for games, writing and lessons.'],
    faq: [
      ['How many jobs are included?', 'Dozens spread across seven fields, from tech and trades to science and public service.'],
      ['Can I pick just one field?', 'Yes. Choose a field, or leave it on "Any" to draw from all of them.'],
      ['Will the same job repeat?', 'Not within a single run.'],
      ['Is it suitable for children?', 'Yes. All entries are ordinary, real-world jobs.'],
      ['Do you store anything?', 'No. Everything is generated in your browser.']
    ],
    conclusion: `<p>Pick a career out of thin air. The <strong>random job generator</strong> is quick and fair. For a pastime instead, try the <a href="random-hobby-generator.html">random hobby generator</a>.</p>`
  }
}));

/* ========================================================================
   5. RANDOM HOBBY GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'hobby', file: 'random-hobby-generator.html',
  name: 'Random Hobby Generator', tag: 'Random', icon: 'fa-solid fa-palette',
  title: 'Random Hobby Generator | Find a New Pastime',
  metaDesc: 'Get a random hobby with a one-line idea in one click - creative, active, social, relaxing or learning. Free, instant and 100% client-side.',
  desc: 'Get a random hobby with a one-line idea, across five types of pastime.',
  keywords: ['random hobby generator', 'random hobby', 'hobby ideas', 'hobby picker', 'new hobby', 'things to do', 'pastime ideas', 'random activity', 'hobby list', 'what to do generator'],
  featureList: ['Creative, active, social, relaxing and learning hobbies', 'A one-line idea with each hobby', 'Generate up to 50 at once', 'Duplicate-free within a run', 'Copy the list', '100% client-side'],
  optionsHtml: selectField('hobby', 'Type', [['any', 'Any type'], ['creative', 'Creative'], ['active', 'Active'], ['social', 'Social'], ['relaxing', 'Relaxing'], ['learning', 'Learning']]),
  data: `var D={
 creative:[['Painting','start with one colour'],['Pottery','let the wheel do the rest'],['Knitting','row by patient row'],['Photography','chase the light'],['Woodworking','measure twice, cut once'],['Creative writing','a page a day'],['Origami','fold, unfold, refold'],['Sewing','small stitches, big projects']],
 active:[['Rock climbing','solve the wall with your body'],['Cycling','take the long way home'],['Running','one more kilometre'],['Swimming','find a steady rhythm'],['Hiking','collect summits'],['Yoga','breathe and hold'],['Dancing','count the beat'],['Martial arts','drill the basics']],
 social:[['Board games','the table is the arena'],['Book club','argue about the ending'],['Volunteering','give the hours away'],['Cooking club','trade recipes'],['Team sports','pass first'],['Language exchange','teach while you learn']],
 relaxing:[['Gardening','grow something slow'],['Fishing','wait and watch'],['Baking','warm the kitchen'],['Meditation','sit with the quiet'],['Puzzles','find the missing piece'],['Birdwatching','let the birds come to you']],
 learning:[['Learning a language','ten minutes a day'],['Astronomy','map the night sky'],['Chess','think three moves ahead'],['Coding','build something small'],['History','follow one thread'],['Speedcubing','learn the algorithms']]
};`,
  build: `
    var cat=$('hobbyType')?$('hobbyType').value:'any';
    var key=cat==='any'?pick(['creative','active','social','relaxing','learning']):cat;
    var h=pick(D[key]);
    var label=key.charAt(0).toUpperCase()+key.slice(1);
    return {v:h[0],sub:label+' - '+h[1]};`,
  extraJs: `['hobbyType'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  workflow: ['tools/fun/random-job-generator.html', 'tools/fun/random-theme-generator.html'],
  article: {
    title: 'Random Hobby Generator: Something New to Try',
    lead: `<p>Stuck for something to do that is not a screen? This <strong>random hobby generator</strong> serves up pastimes across five types - creative, active, social, relaxing and learning - each with a one-line idea to get you started.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-shuffle', heading: 'Five types of pastime', html: `<p>Pick a type to match your mood, or leave it on "Any" for the widest spread. Creative hobbies make things, active hobbies move you, social hobbies bring people together, relaxing hobbies slow the day down, and learning hobbies stretch a skill. The one-line idea with each result - <em>row by patient row</em>, <em>chase the light</em> - is there to lower the barrier to starting.</p>` },
      { id: 'uses', icon: 'fa-solid fa-lightbulb', heading: 'Using it well', html: `<p>Try the first suggestion that raises an eyebrow rather than the one that sounds easiest. If a hobby appeals but feels too big, search for a beginner version - most have a cheap starter kit or a five-minute version. Generative prompts like this work best when you actually attempt one, not when you keep rerolling.</p>` }
    ],
    steps: ['Choose a type, or leave it on "Any".', 'Set how many hobbies you want.', 'Press <strong>Generate</strong>.', 'Pick one and give it a try this week.'],
    facts: [['Types', 'Creative, active, social, relaxing, learning'], ['Extras', 'A one-line idea per hobby'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Data', 'Generated locally']],
    useCases: [
      ['Trying something new', 'Get a nudge out of a routine and into a fresh pastime.'],
      ['Family and group activities', 'Find something to do together at the weekend.'],
      ['Screen-free time', 'Swap scrolling for a hobby you can pick up today.']
    ],
    tips: ['Commit to the first one you like rather than rerolling endlessly.', 'Look for a beginner or taster version before buying gear.', 'Mix types if you are not sure what mood you are in.'],
    takeaways: ['Hobbies grouped by type.', 'Each result includes a starter idea.', 'A quick way to break a routine.'],
    faq: [
      ['Can I choose a type of hobby?', 'Yes. Pick creative, active, social, relaxing or learning, or leave it on "Any".'],
      ['Are these suitable for beginners?', 'Yes. Most have cheap starter versions; the note gives you a first step.'],
      ['Will hobbies repeat?', 'Not within a single run.'],
      ['Is it free?', 'Yes. No sign-up and no limits.'],
      ['Do you store anything?', 'No. Everything is generated in your browser.']
    ],
    conclusion: `<p>Find something worth your evenings. The <strong>random hobby generator</strong> is a gentle nudge out of the routine. For a career idea instead, try the <a href="random-job-generator.html">random job generator</a>.</p>`
  }
}));

/* ========================================================================
   6. RANDOM COUNTRY GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'country', file: 'random-country-generator.html',
  name: 'Random Country Generator', tag: 'Random', icon: 'fa-solid fa-globe',
  title: 'Random Country Generator | Pick a Country & Capital',
  metaDesc: 'Get a random country in one click, with its capital city and continent. Ideal for quizzes, games and geography - free and 100% client-side.',
  desc: 'Get a random country in one click, with its capital and continent.',
  keywords: ['random country generator', 'random country', 'country picker', 'random nation', 'geography quiz', 'country and capital', 'random countries', 'country list', 'world geography', 'pick a country'],
  featureList: ['Countries from every continent', 'Capital city and continent included', 'Generate up to 50 at once', 'Duplicate-free within a run', 'Copy the list', '100% client-side'],
  optionsHtml: selectField('country', 'Detail', [['full', 'Country + capital'], ['short', 'Country + continent'], ['name', 'Country only']]),
  data: `var D=[['United States','Washington, D.C.','North America'],['Canada','Ottawa','North America'],['Mexico','Mexico City','North America'],['Cuba','Havana','North America'],['Brazil','Brasilia','South America'],['Argentina','Buenos Aires','South America'],['Peru','Lima','South America'],['Chile','Santiago','South America'],['Colombia','Bogota','South America'],['United Kingdom','London','Europe'],['France','Paris','Europe'],['Germany','Berlin','Europe'],['Italy','Rome','Europe'],['Spain','Madrid','Europe'],['Portugal','Lisbon','Europe'],['Netherlands','Amsterdam','Europe'],['Belgium','Brussels','Europe'],['Switzerland','Bern','Europe'],['Austria','Vienna','Europe'],['Sweden','Stockholm','Europe'],['Norway','Oslo','Europe'],['Denmark','Copenhagen','Europe'],['Finland','Helsinki','Europe'],['Poland','Warsaw','Europe'],['Greece','Athens','Europe'],['Ireland','Dublin','Europe'],['Iceland','Reykjavik','Europe'],['Ukraine','Kyiv','Europe'],['Turkey','Ankara','Europe'],['Egypt','Cairo','Africa'],['Nigeria','Abuja','Africa'],['Kenya','Nairobi','Africa'],['South Africa','Pretoria','Africa'],['Morocco','Rabat','Africa'],['Ethiopia','Addis Ababa','Africa'],['Ghana','Accra','Africa'],['China','Beijing','Asia'],['Japan','Tokyo','Asia'],['India','New Delhi','Asia'],['South Korea','Seoul','Asia'],['Indonesia','Jakarta','Asia'],['Thailand','Bangkok','Asia'],['Vietnam','Hanoi','Asia'],['Philippines','Manila','Asia'],['Malaysia','Kuala Lumpur','Asia'],['Singapore','Singapore','Asia'],['Pakistan','Islamabad','Asia'],['Saudi Arabia','Riyadh','Asia'],['United Arab Emirates','Abu Dhabi','Asia'],['Australia','Canberra','Oceania'],['New Zealand','Wellington','Oceania'],['Fiji','Suva','Oceania']];`,
  build: `
    var r=pick(D);
    var detail=$('countryDetail')?$('countryDetail').value:'full';
    var sub=detail==='name'?'':(detail==='short'?r[2]:r[1]+' - '+r[2]);
    return {v:r[0],sub:sub};`,
  extraJs: `['countryDetail'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  workflow: ['tools/fun/random-state-generator.html', 'tools/fun/island-name-generator.html'],
  article: {
    title: 'Random Country Generator: A Nation and Its Capital',
    lead: `<p>Pick a country at random for a quiz, a travel daydream or a geography game. This <strong>random country generator</strong> draws from every continent and can show the capital city and region alongside the name.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-shuffle', heading: 'A fair, worldwide draw', html: `<p>The pool spans North and South America, Europe, Africa, Asia and Oceania, so a run feels global rather than Euro-centric. Choose how much detail to show: just the country, the country with its continent, or the full line with its capital. Duplicates are avoided within a single run, which makes it easy to build a round of ten distinct questions.</p>` },
      { id: 'uses', icon: 'fa-solid fa-lightbulb', heading: 'Quizzes, lessons and travel', html: `<p>Quiz masters use it to draw "name the capital" questions. Teachers use it to assign countries for a geography project. Travellers use it for a bit of armchair tourism. Writers use it to place a scene somewhere unfamiliar and specific.</p>` }
    ],
    steps: ['Choose the level of detail.', 'Set how many countries you want.', 'Press <strong>Generate</strong>.', 'Copy the list for your quiz or project.'],
    facts: [['Coverage', 'Every continent'], ['Shows', 'Capital and continent on demand'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Data', 'Generated locally']],
    useCases: [
      ['Geography quizzes', 'Draw "country and capital" questions fairly.'],
      ['Classroom projects', 'Assign each student a different country.'],
      ['Travel inspiration', 'Pick a destination to read about next.']
    ],
    tips: ['Use capital mode for "name the capital" rounds.', 'Draw ten at once to build a full quiz.', 'Switch to continent mode for easier questions.'],
    takeaways: ['A global, unbiased country draw.', 'Capital and continent available on demand.', 'Great for quizzes, classes and travel daydreams.'],
    faq: [
      ['Are all continents represented?', 'Yes. The pool includes countries from the Americas, Europe, Africa, Asia and Oceania.'],
      ['Can it show the capital city?', 'Yes. Pick the full detail level and each result shows the capital.'],
      ['Will countries repeat?', 'Not within a single run.'],
      ['Is it suitable for a quiz?', 'Yes - it draws the questions; you keep the score.'],
      ['Do you store anything?', 'No. Everything is generated in your browser.']
    ],
    conclusion: `<p>Spin the globe. The <strong>random country generator</strong> gives you a nation and its capital in one click. For a US state instead, try the <a href="random-state-generator.html">random state generator</a>.</p>`
  }
}));

/* ========================================================================
   7. RANDOM CITY GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'city', file: 'random-city-generator.html',
  name: 'Random City Generator', tag: 'Random', icon: 'fa-solid fa-city',
  title: 'Random City Generator | Pick a Random World City',
  metaDesc: 'Get a random city from around the world with its country in one click. Filter by region - free, instant and 100% client-side.',
  desc: 'Get a random city from around the world, with its country, in one click.',
  keywords: ['random city generator', 'random city', 'city picker', 'pick a city', 'world cities', 'random places', 'city and country', 'random destination', 'city generator', 'random town'],
  featureList: ['Cities from the Americas, Europe, Asia and beyond', 'Country shown with each city', 'Generate up to 50 at once', 'Duplicate-free within a run', 'Copy the list', '100% client-side'],
  optionsHtml: selectField('city', 'Region', [['any', 'Any region'], ['north', 'Americas'], ['europe', 'Europe'], ['asia', 'Asia'], ['other', 'Oceania, Africa & more']]),
  data: `var D={
 north:[['New York','United States'],['Toronto','Canada'],['Chicago','United States'],['Los Angeles','United States'],['Vancouver','Canada'],['Montreal','Canada'],['Miami','United States'],['Seattle','United States'],['Boston','United States'],['Austin','United States'],['Denver','United States'],['San Francisco','United States'],['Havana','Cuba'],['Mexico City','Mexico'],['Portland','United States'],['Nashville','United States']],
 europe:[['London','United Kingdom'],['Paris','France'],['Berlin','Germany'],['Madrid','Spain'],['Rome','Italy'],['Amsterdam','Netherlands'],['Barcelona','Spain'],['Vienna','Austria'],['Prague','Czechia'],['Lisbon','Portugal'],['Stockholm','Sweden'],['Oslo','Norway'],['Copenhagen','Denmark'],['Dublin','Ireland'],['Athens','Greece'],['Budapest','Hungary'],['Warsaw','Poland'],['Zurich','Switzerland']],
 asia:[['Tokyo','Japan'],['Seoul','South Korea'],['Beijing','China'],['Shanghai','China'],['Bangkok','Thailand'],['Singapore','Singapore'],['Mumbai','India'],['Hong Kong','China'],['Taipei','Taiwan'],['Osaka','Japan'],['Jakarta','Indonesia'],['Manila','Philippines'],['Hanoi','Vietnam'],['Kuala Lumpur','Malaysia'],['Dubai','United Arab Emirates'],['Delhi','India']],
 other:[['Sydney','Australia'],['Melbourne','Australia'],['Auckland','New Zealand'],['Cape Town','South Africa'],['Nairobi','Kenya'],['Cairo','Egypt'],['Lagos','Nigeria'],['Marrakech','Morocco'],['Rio de Janeiro','Brazil'],['Buenos Aires','Argentina'],['Lima','Peru'],['Santiago','Chile'],['Istanbul','Turkey'],['Moscow','Russia'],['Reykjavik','Iceland'],['Tel Aviv','Israel']]
};`,
  build: `
    var reg=$('cityRegion')?$('cityRegion').value:'any';
    var key=reg==='any'?pick(['north','europe','asia','other']):reg;
    var c=pick(D[key]);
    return {v:c[0],sub:c[1]};`,
  extraJs: `['cityRegion'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  article: {
    title: 'Random City Generator: A Random Place on the Map',
    lead: `<p>Need a city at random - for a game, a writing prompt, a travel fantasy or a bit of trivia? This <strong>random city generator</strong> draws from major cities around the world and shows the country each one belongs to.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-shuffle', heading: 'Cities grouped by region', html: `<p>The set is organised into the Americas, Europe, Asia, and a fourth group covering Oceania, Africa and the Middle East. Each result names the city and its country, so it is immediately useful even if the city is unfamiliar. Repeats are avoided within a single run.</p>` },
      { id: 'uses', icon: 'fa-solid fa-compass', heading: 'Where it helps', html: `<p>Writers use a random city to drop a scene somewhere unexpected and concrete. Game hosts use it for travel-themed quizzes. Teachers use it for geography warm-ups. And when you simply want to daydream about somewhere else, letting the generator choose is half the fun.</p>` }
    ],
    steps: ['Pick a region, or leave it on "Any".', 'Set how many cities you want.', 'Press <strong>Generate</strong>.', 'Copy the list for your project.'],
    facts: [['Regions', 'Americas, Europe, Asia and more'], ['Shows', 'City and country'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Data', 'Generated locally']],
    useCases: [
      ['Writing prompts', 'Set a scene in a city you would not have chosen.'],
      ['Travel and trivia games', 'Draw a destination for a round of questions.'],
      ['Daydreaming', 'Get a fresh place to read about or plan a trip around.']
    ],
    tips: ['Restrict to one region for a themed list.', 'Use the country label as an automatic extra clue.', 'Draw several to build a world-tour itinerary.'],
    takeaways: ['A global city draw with country labels.', 'Filter by region when you want.', 'Good for writing, games and travel ideas.'],
    faq: [
      ['Which cities are included?', 'Major cities from the Americas, Europe, Asia, Oceania, Africa and the Middle East.'],
      ['Does it show the country?', 'Yes. Every result includes the country the city is in.'],
      ['Can I limit it to one region?', 'Yes. Pick a region, or leave it on "Any".'],
      ['Will the same city repeat?', 'Not within a single run.'],
      ['Do you store anything?', 'No. Everything is generated in your browser.']
    ],
    conclusion: `<p>Land somewhere new. The <strong>random city generator</strong> hands you a place in one click. For a whole country instead, try the <a href="random-country-generator.html">random country generator</a>.</p>`
  }
}));

/* ========================================================================
   8. BAND NAME GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'band', file: 'band-name-generator.html',
  name: 'Band Name Generator', tag: 'Names', icon: 'fa-solid fa-music',
  title: 'Band Name Generator | Create a Band Name Instantly',
  metaDesc: 'Create band name ideas in one click, from classic The-names to modern two-word names. Generate a whole list and copy it. Free and 100% client-side.',
  desc: 'Create band name ideas in one click, from classic The-names to modern two-word names.',
  keywords: ['band name generator', 'band names', 'band name ideas', 'random band name', 'music name generator', 'group name generator', 'band name maker', 'rock band names', 'indie band names', 'band names list'],
  featureList: ['Several name patterns, mixed automatically', 'Indie, rock and pop flavoured words', 'Generate up to 50 at once', 'Duplicate-free within a run', 'Copy the whole list', '100% client-side'],
  optionsHtml: '',
  data: `var D={
 adj:['Velvet','Neon','Midnight','Electric','Golden','Silver','Broken','Wild','Crimson','Silent','Lonely','Atomic','Crystal','Fuzzy','Hollow','Radiant','Static','Paper','Marble','Scarlet','Analog','Feral','Cosmic','Amber'],
 noun:['Tigers','Echoes','Parade','Riot','Wolves','Circus','Hearts','Machines','Ghosts','Rivers','Motors','Sirens','Crowns','Harbor','Lanterns','Anthem','Mirage','Panthers','Signals','Canyon','Arrows','Comets','Wanderers','Static']
};`,
  build: `
    var r=Math.random();
    if(r<0.35){return {v:'The '+pick(D.adj)+' '+pick(D.noun),sub:'The + adjective + noun'};}
    if(r<0.6){return {v:pick(D.adj)+' '+pick(D.noun),sub:'Two-word name'};}
    if(r<0.8){return {v:'The '+pick(D.noun),sub:'The + noun'};}
    return {v:pick(D.noun)+' and the '+pick(D.noun),sub:'Noun and the noun'};`,
  workflow: ['tools/fun/random-theme-generator.html', 'tools/fun/random-theme-generator.html'],
  article: {
    title: 'Band Name Generator: Find a Name for Your Group',
    lead: `<p>Every band starts with a name. This <strong>band name generator</strong> mixes evocative adjectives and punchy nouns into four different patterns - from the classic "The Velvet Wolves" to a modern two-word name like "Neon Parade".</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-wand-magic-sparkles', heading: 'Four patterns, one pool', html: `<p>The generator chooses a pattern at random and fills it from a shared pool of words. Some results take the form "The + adjective + noun", others are a bare two-word name, some are just "The + noun", and a few use the "X and the Y" pattern. Reload and you get a different flavour each time, which is useful when you are chasing a specific mood.</p>` },
      { id: 'choosing', icon: 'fa-solid fa-lightbulb', heading: 'Picking the right one', html: `<p>Say each name out loud as if introducing the band from a stage. Short names are easier to remember and search for; a "The" prefix reads as classic rock, while a two-word name often suits indie and electronic acts. Use the list as inspiration and tweak one word until the name is unmistakably yours.</p>` }
    ],
    steps: ['Set how many names you want.', 'Press <strong>Generate</strong>.', 'Read them aloud and shortlist a few.', 'Copy the list and refine your favourite.'],
    facts: [['Patterns', 'Four name structures'], ['Flavour', 'Indie, rock and pop words'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Data', 'Generated locally']],
    useCases: [
      ['Starting a band', 'Find a name that fits your sound before the first gig.'],
      ['Playing and worldbuilding', 'Name fictional bands for a story, game or film.'],
      ['Creative warm-ups', 'Get unstuck when a project needs a name.']
    ],
    tips: ['Say the name out loud - if it is hard to pronounce, it is hard to remember.', 'Short names are easier to search for online.', 'Change one word of a near-miss to make it yours.'],
    takeaways: ['Four patterns for different moods.', 'A large shared word pool.', 'A whole list of ideas in one click.'],
    faq: [
      ['Are these names available to use?', 'The generator combines common words; check availability for trademarks and domain names before committing.'],
      ['What styles are included?', 'Words lean indie, rock and pop, with classic "The ..." names and modern two-word names.'],
      ['Can I get more names?', 'Yes - raise the count up to 50 per run and generate again.'],
      ['Will names repeat?', 'Not within a single run.'],
      ['Do you store anything?', 'No. Everything is generated in your browser.']
    ],
    conclusion: `<p>Find a name that sounds good on a poster. The <strong>band name generator</strong> gives you a full list in one click. Need a theme for the artwork? Try the <a href="random-theme-generator.html">random theme generator</a>.</p>`
  }
}));

/* ========================================================================
   9. STORY PROMPT GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'story', file: 'story-prompt-generator.html',
  name: 'Story Prompt Generator', tag: 'Writing', icon: 'fa-solid fa-book-open',
  title: 'Story Prompt Generator | Random Writing Ideas & Twists',
  metaDesc: 'Get a random story prompt - a setting, a character and a conflict, with an optional twist. Beat writer\u0027s block for free, 100% client-side.',
  desc: 'Get a random story prompt built from a setting, a character, a conflict and a twist.',
  keywords: ['story prompt generator', 'random story ideas', 'writing prompts', 'story ideas', 'plot generator', 'creative writing prompts', 'random writing prompt', 'story starter', 'fiction prompts', 'writers block'],
  featureList: ['A setting, character, conflict and twist combined', 'Reveal the twist separately or inline', 'Generate up to 50 at once', 'Duplicate-free within a run', 'Copy the whole list', '100% client-side'],
  optionsHtml: selectField('story', 'Mode', [['twist', 'Setup + twist separate'], ['full', 'Everything in one line']]),
  data: `var D={
 settings:['a lighthouse cut off by a storm','a colony ship running low on air','a village that forgets one person every year','a library where the books rewrite themselves','a subway that stops at stations that do not exist','a desert town with one working telephone','an underwater research station','a floating city above the clouds','a farm where the crops grow in perfect rows','a hotel that rents rooms to the dead'],
 characters:['a retired thief','a teenage inventor','a lighthouse keeper','a disgraced detective','a travelling magician','a nurse on the night shift','a translator for the crown','a shepherd who can read the sky','a piano tuner with perfect pitch','a courier who never opens the parcels'],
 conflicts:['must find a missing sibling','has to repay a debt by dawn','is accused of a crime they did not commit','must choose between two loyalties','needs to deliver a message before the border closes','has one week to save their home','discovers a secret they were never meant to know','must keep a promise to someone who is gone','is running out of time and money','has to decide who to trust'],
 twists:['the ally has been lying from the start','the deadline is not what it seems','the rescue is a trap','the map is upside down','the stranger already knows their name','the machine was never broken','the door only opens from the outside','the treasure is worthless','the curse is a gift','the hero is the child of the villain']
};`,
  build: `
    var s=pick(D.settings),ch=pick(D.characters),co=pick(D.conflicts),tw=pick(D.twists);
    var setup='In '+s+', '+ch+' '+co+'.';
    var mode=$('storyMode')?$('storyMode').value:'twist';
    if(mode==='full'){return {v:setup+' Twist: '+tw+'.',sub:''};}
    return {v:setup,sub:'Twist: '+tw};`,
  extraJs: `['storyMode'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  article: {
    title: 'Story Prompt Generator: A Setting, a Character and a Twist',
    lead: `<p>Writer\u0027s block often needs a single concrete starting point. This <strong>story prompt generator</strong> combines a setting, a character, a conflict and an optional twist into a ready-to-use prompt - so you can start writing instead of staring at the page.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-book', heading: 'Four ingredients, combined at random', html: `<p>Each prompt is assembled from four independent pools. The <em>setting</em> gives the world, the <em>character</em> gives a point of view, the <em>conflict</em> gives the engine of the plot, and the <em>twist</em> - shown separately by default - gives the turn. Because the pieces are drawn independently, the combinations are surprising and rarely repeat within a run.</p>` },
      { id: 'using-it', icon: 'fa-solid fa-pen-nib', heading: 'Using a prompt well', html: `<p>Read the setup first and let it sit for a moment before reading the twist. Write the opening scene from the setup alone, then decide whether the twist is a reveal, a red herring or something to discard. Treat the prompt as a starting point, not a plot - the strongest stories grow from a single unexpected detail.</p>` }
    ],
    steps: ['Choose whether to show the twist separately or inline.', 'Set how many prompts you want.', 'Press <strong>Generate</strong>.', 'Pick one and start writing immediately.'],
    facts: [['Parts', 'Setting, character, conflict, twist'], ['Modes', 'Setup + twist, or all in one line'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Data', 'Generated locally']],
    useCases: [
      ['Beating writer\u0027s block', 'Start a scene from a concrete prompt instead of a blank page.'],
      ['Writing exercises', 'Use a prompt as a timed ten-minute warm-up.'],
      ['Games and groups', 'Deal a prompt to each writer and compare results.']
    ],
    tips: ['Write the setup scene before revealing the twist to yourself.', 'Discard any prompt element that does not serve the story - they are seeds, not rules.', 'Draw several and pick the one that already suggests a voice.'],
    takeaways: ['A prompt assembled from four random parts.', 'The twist is optional and separable.', 'A fast cure for a blank page.'],
    faq: [
      ['How is the prompt built?', 'From a random setting, character, conflict and twist combined into a sentence.'],
      ['Can I hide the twist?', 'Yes. In the default mode the twist is shown separately so you can read the setup first.'],
      ['Are the prompts free to use?', 'Yes. They are generic ideas; anything you write from them is yours.'],
      ['Will prompts repeat?', 'Not within a single run.'],
      ['Do you store anything?', 'No. Everything is generated in your browser.']
    ],
    conclusion: `<p>Stop waiting for the muse. The <strong>story prompt generator</strong> hands you a scene in one click. Need a character name to go with it? Try the <a href="greek-name-generator.html">Greek name generator</a>.</p>`
  }
}));

/* ========================================================================
   10. RANDOM LOTTERY NUMBER GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'lotto', file: 'random-lottery-number-generator.html',
  name: 'Random Lottery Number Generator', tag: 'Games', icon: 'fa-solid fa-dice-d6',
  title: 'Random Lottery Number Generator | Pick Lucky Numbers',
  metaDesc: 'Generate random lottery numbers for popular formats - 6/49, Powerball-style, Euromillions-style and Pick 3. Free, instant and 100% client-side.',
  desc: 'Generate random lottery numbers for popular formats, from 6/49 to Powerball and Pick 3.',
  keywords: ['random lottery number generator', 'lottery numbers', 'lucky numbers generator', 'random lottery numbers', 'lotto number generator', 'pick lottery numbers', 'powerball numbers', 'random picks', 'lottery picker', 'number generator'],
  featureList: ['6/49, 6/59, Powerball-style, Euromillions-style and Pick 3', 'Numbers sorted and de-duplicated', 'Generate several sets at once', 'Copy the results', 'No repeats within a set', '100% client-side'],
  optionsHtml: selectField('lotto', 'Game', [['lotto649', 'Lotto 6/49'], ['lotto659', 'Lotto 6/59'], ['powerball', 'Powerball style (5 + 1)'], ['euromillions', 'Euromillions style (5 + 2)'], ['pick3', 'Pick 3 digits']]),
  count: 1, max: 5,
  data: `function draw(n,max){var a=[],pool=[],i;for(i=1;i<=max;i++)pool.push(i);for(i=0;i<n;i++){var k=Math.floor(Math.random()*pool.length);a.push(pool.splice(k,1)[0]);}a.sort(function(x,y){return x-y;});return a;}
function digits(n){var a=[],i;for(i=0;i<n;i++)a.push(Math.floor(Math.random()*10));return a;}`,
  build: `
    var g=$('lottoGame')?$('lottoGame').value:'lotto649';
    if(g==='powerball'){return {v:draw(5,69).join(', ')+'  |  Powerball '+draw(1,26)[0],sub:'5 numbers + Powerball'};}
    if(g==='euromillions'){return {v:draw(5,50).join(', ')+'  |  Stars '+draw(2,12).join(' & '),sub:'5 numbers + 2 lucky stars'};}
    if(g==='lotto659'){return {v:draw(6,59).join(', '),sub:'6 numbers from 59'};}
    if(g==='pick3'){return {v:digits(3).join(' - '),sub:'Three digits'};}
    return {v:draw(6,49).join(', '),sub:'6 numbers from 49'};`,
  extraJs: `['lottoGame'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  article: {
    title: 'Random Lottery Number Generator: Quick Pick Numbers',
    lead: `<p>Let the generator choose your lottery numbers for the next draw. This <strong>random lottery number generator</strong> supports the most common formats - Lotto 6/49, 6/59, a Powerball-style 5+1, a Euromillions-style 5+2 and a three-digit Pick 3 - and sorts each set for you.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-dice', heading: 'Fair, de-duplicated picks', html: `<p>Numbers are drawn without replacement, so a set never contains the same number twice, and the result is sorted into ascending order for readability. Powerball and Euromillions styles add the right number of bonus balls from their own ranges. Every set is an independent draw - there is no memory between runs.</p>` },
      { id: 'odds', icon: 'fa-solid fa-chart-simple', heading: 'A word on odds', html: `<p>Every combination in a fair draw has the same chance, so a quick pick is mathematically as good as a chosen one. This tool is for fun and convenience, not prediction - no method can improve your odds. Generate a few sets, pick the one you like, and play responsibly.</p>` }
    ],
    steps: ['Choose a lottery format.', 'Set how many sets to generate.', 'Press <strong>Generate</strong>.', 'Copy the numbers for your ticket.'],
    facts: [['Formats', '6/49, 6/59, Powerball, Euromillions, Pick 3'], ['Order', 'Sorted ascending'], ['Repeats', 'None within a set'], ['Batch', 'Up to 5 sets per run'], ['Data', 'Generated locally']],
    useCases: [
      ['Quick picks', 'Get a set of numbers without choosing by hand.'],
      ['Workplace and family pools', 'Generate several sets to share around.'],
      ['Fun and games', 'Use the numbers for a sweepstake or a private draw.']
    ],
    tips: ['Each set is equally likely - there is no lucky method.', 'Generate several sets and stop; more sets do not improve odds.', 'Play within your means and for entertainment only.'],
    takeaways: ['Five common lottery formats.', 'Numbers are sorted and repeat-free.', 'Quick, free and entirely in your browser.'],
    faq: [
      ['Does this improve my odds of winning?', 'No. Every combination has the same probability; this tool only picks numbers for you.'],
      ['Can numbers repeat in a set?', 'No. Each number is drawn without replacement, so a set is always unique.'],
      ['Which formats are supported?', 'Lotto 6/49, Lotto 6/59, a Powerball-style 5+1, a Euromillions-style 5+2 and a three-digit Pick 3.'],
      ['Is it affiliated with any lottery?', 'No. It is an independent tool and is not associated with any lottery operator.'],
      ['Do you store anything?', 'No. Numbers are generated in your browser and never saved.']
    ],
    conclusion: `<p>Let chance fill in the ticket. The <strong>random lottery number generator</strong> produces sorted, repeat-free sets in one click. For pure fun, try the <a href="random-playing-card-generator.html">random playing card generator</a>.</p>`
  }
}));

/* ========================================================================
   11. RANDOM PLAYING CARD GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'card', file: 'random-playing-card-generator.html',
  name: 'Random Playing Card Generator', tag: 'Games', icon: 'fa-solid fa-clone',
  title: 'Random Playing Card Generator | Draw a Random Card',
  metaDesc: 'Draw a random playing card or a random hand of cards in one click. Standard 52-card deck, no repeats within a draw - free and 100% client-side.',
  desc: 'Draw a random playing card, or a random hand, in one click from a standard 52-card deck.',
  keywords: ['random playing card generator', 'random card generator', 'draw a card', 'random card', 'playing cards picker', 'random hand of cards', 'card deck generator', 'pick a card', 'random poker hand', 'card draw'],
  featureList: ['A full standard 52-card deck', 'No repeats within a draw', 'Show the suit name or just the card', 'Draw up to 10 cards at once', 'Copy the result', '100% client-side'],
  optionsHtml: selectField('card', 'Detail', [['symbol', 'Rank + symbol'], ['full', 'Rank of suit']]),
  count: 5, max: 10,
  data: `var D={
 ranks:['A','2','3','4','5','6','7','8','9','10','J','Q','K'],
 suits:[['♠','Spades'],['♥','Hearts'],['♦','Diamonds'],['♣','Clubs']]
};`,
  build: `
    var r=pick(D.ranks),s=pick(D.suits);
    var detail=$('cardDetail')?$('cardDetail').value:'symbol';
    if(detail==='full'){return {v:r+' of '+s[1],sub:''};}
    return {v:r+s[0],sub:s[1]};`,
  extraJs: `['cardDetail'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  article: {
    title: 'Random Playing Card Generator: Draw a Card or a Hand',
    lead: `<p>Draw a card from a standard deck - for a game, a magic trick, a decision or a bit of fun. This <strong>random playing card generator</strong> can deal a single card or a whole hand, and never repeats a card within the same draw.</p>`,
    sections: [
      { id: 'how-it-works', icon: 'fa-solid fa-shuffle', heading: 'A fair draw from 52', html: `<p>The deck contains all 52 cards across four suits and thirteen ranks. Each draw picks at random, and because the result is de-duplicated, a five-card hand can never contain the same card twice - it behaves like dealing from a shuffled deck. Show the crisp rank-and-symbol form or the full "King of Hearts" name.</p>` },
      { id: 'uses', icon: 'fa-solid fa-lightbulb', heading: 'Where it is useful', html: `<p>Use a single card to settle a decision or to practise card magic. Deal a hand for solo card-game drills or to improvise a poker scenario. Teachers and trainers use random cards for probability demonstrations. And game masters can draw cards to drive random events in a session.</p>` }
    ],
    steps: ['Choose the detail level.', 'Set how many cards to draw (up to 10).', 'Press <strong>Generate</strong>.', 'Copy the result if you need it.'],
    facts: [['Deck', 'Standard 52 cards'], ['Suits', 'Spades, hearts, diamonds, clubs'], ['Repeats', 'None within a draw'], ['Batch', 'Up to 10 cards per run'], ['Data', 'Generated locally']],
    useCases: [
      ['Card games and drills', 'Deal a hand to practise a game or a strategy.'],
      ['Decisions and dares', 'Let a drawn card decide who goes first or what happens next.'],
      ['Magic and probability', 'Draw cards for tricks or for teaching chance.']
    ],
    tips: ['Draw several cards at once to get a realistic hand with no repeats.', 'Use the symbol mode for a compact, quick-to-read result.', 'Re-generate for a genuinely fresh deal each time.'],
    takeaways: ['A fair draw from a real 52-card deck.', 'No duplicate cards within a draw.', 'Single card or a full hand.'],
    faq: [
      ['Is the deck a full 52 cards?', 'Yes - four suits across all thirteen ranks.'],
      ['Can the same card appear twice?', 'Not within a single draw; repeats are avoided.'],
      ['How many cards can I draw at once?', 'Up to ten per run.'],
      ['Can I use it for card magic practice?', 'Yes, though for real magic you would use a physical deck.'],
      ['Do you store anything?', 'No. Everything is generated in your browser.']
    ],
    conclusion: `<p>Pick a card - any card. The <strong>random playing card generator</strong> deals fairly in one click. For lucky numbers instead, try the <a href="random-lottery-number-generator.html">random lottery number generator</a>.</p>`
  }
}));

/* ========================================================================
   12. RANDOM NICKNAME GENERATOR
   ======================================================================== */
add(nameTool({
  prefix: 'nick', file: 'nickname-generator.html',
  name: 'Random Nickname Generator', tag: 'Names', icon: 'fa-solid fa-tag',
  title: 'Random Nickname Generator | Cute, Cool & Funny Names',
  metaDesc: 'Generate random nicknames in one click - cute, cool, funny or fantasy styles. Find a gamertag, pet name or group nickname. Free and 100% client-side.',
  desc: 'Generate random nicknames in one click - cute, cool, funny or fantasy styles.',
  keywords: ['random nickname generator', 'nickname generator', 'nicknames', 'cute nicknames', 'cool nicknames', 'funny nicknames', 'gamertag ideas', 'random name generator', 'nickname ideas', 'pet names'],
  featureList: ['Cute, cool, funny and fantasy styles', 'Generate up to 50 at once', 'Duplicate-free within a run', 'Copy the whole list', 'Great for gamertags and groups', '100% client-side'],
  optionsHtml: selectField('nick', 'Style', [['any', 'Any style'], ['cute', 'Cute'], ['cool', 'Cool'], ['funny', 'Funny'], ['fantasy', 'Fantasy']]),
  data: `var D={
 cute:['Bubbles','Snuggles','Peaches','Muffin','Pumpkin','Sprinkle','Cuddlebug','Puffy','Tiny','Cottonball','Biscuit','Waffles'],
 cool:['Ace','Maverick','Rogue','Viper','Blaze','Falcon','Ghost','Storm','Rex','Neo','Jax','Knox'],
 funny:['Sir Snoresalot','Captain Chaos','Noodle','Waffle','Banana','Socks','Pickles','Goose','Beans','Tater','Squiggle','Doodle'],
 fantasy:['Shadowblade','Moonwhisper','Stormborn','Nightfall','Ironheart','Firebrand','Silverwing','Duskwalker','Starweaver','Frostborn','Emberkin','Ravencrest']
};`,
  build: `
    var style=$('nickStyle')?$('nickStyle').value:'any';
    var key=style==='any'?pick(['cute','cool','funny','fantasy']):style;
    var label=key.charAt(0).toUpperCase()+key.slice(1);
    return {v:pick(D[key]),sub:label+' nickname'};`,
  extraJs: `['nickStyle'].forEach(function(id){if($(id))$(id).addEventListener('change',render);});`,
  workflow: ['tools/fun/xbox-username-generator.html', 'tools/fun/random-pokemon-generator.html'],
  article: {
    title: 'Random Nickname Generator: Cute, Cool, Funny or Fantasy',
    lead: `<p>Need a nickname in a hurry - for a new pet, a group chat, a gamertag or a character? This <strong>random nickname generator</strong> serves up names in four distinct styles, so you can match the mood instead of settling for the first thing that comes to mind.</p>`,
    sections: [
      { id: 'styles', icon: 'fa-solid fa-tag', heading: 'Four styles, one click', html: `<p><strong>Cute</strong> nicknames are soft and affectionate, good for pets and partners. <strong>Cool</strong> nicknames are short and confident, ideal for gamertags. <strong>Funny</strong> nicknames lean into silliness and absurdity. <strong>Fantasy</strong> nicknames sound like something out of a novel, perfect for roleplay and characters. Leave it on "Any" to mix all four.</p>` },
      { id: 'choosing', icon: 'fa-solid fa-lightbulb', heading: 'Choosing a nickname that sticks', html: `<p>Short, easy-to-say nicknames last longest. For a gamertag, check that it is not already taken and easy to spell aloud. For a pet, pick something you will not mind calling across a park. Use the list as a springboard and tweak one word until it fits the person or animal exactly.</p>` }
    ],
    steps: ['Pick a style or leave it on "Any".', 'Set how many nicknames you want.', 'Press <strong>Generate</strong>.', 'Copy the ones you like best.'],
    facts: [['Styles', 'Cute, cool, funny, fantasy'], ['Batch', 'Up to 50 per run'], ['Duplicates', 'Avoided within a run'], ['Best for', 'Pets, gamertags, groups, characters'], ['Data', 'Generated locally']],
    useCases: [
      ['Pets and family', 'Find an affectionate nickname for a new addition.'],
      ['Gamertags and groups', 'Get a short, memorable name for online play.'],
      ['Characters and roleplay', 'Give a character a nickname that fits their world.']
    ],
    tips: ['Favour names that are short and easy to spell out loud.', 'Keep one style selected for a consistent list.', 'Tweak a favourite result by a word or two to make it yours.'],
    takeaways: ['Four nickname styles in one tool.', 'A whole list per click.', 'Ideal for pets, gamertags and characters.'],
    faq: [
      ['What styles are available?', 'Cute, cool, funny and fantasy, plus an "Any" mode that mixes them.'],
      ['Can I use these as gamertags?', 'Yes, though check availability on your platform first.'],
      ['Will nicknames repeat?', 'Not within a single run.'],
      ['Are these good for pets?', 'The cute style works well, but any short, sayable name makes a good pet nickname.'],
      ['Do you store anything?', 'No. Everything is generated in your browser.']
    ],
    conclusion: `<p>Find the name everyone will actually use. The <strong>random nickname generator</strong> delivers four styles in one click. For a gamertag specifically, try the <a href="xbox-username-generator.html">Xbox username generator</a>.</p>`
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
