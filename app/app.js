// GTA VI trophy guide + tracker: all 55 trophies, saved progress, filters, spoiler mode,
// export/import, and a roadmap to the platinum. Static, offline, no network calls.
// Progress lives in localStorage on this device only.
const KEY_EARNED = 'gta6-trophy-guide-earned-v1';
const KEY_SPOILER = 'gta6-trophy-guide-spoiler-v1';

const STAGES = [
  { n: 1, title: 'Stage 1 — Play the story', blurb: 'Chapters 1–5 and the story missions. All 12 story trophies pop as you play; none can be missed.' },
  { n: 2, title: 'Stage 2 — Side quests & strangers', blurb: 'Character quest lines and stranger strands. Do them as they appear; all stay available after the story.' },
  { n: 3, title: 'Stage 3 — Collectibles & counts', blurb: 'Meditations, cards, WAiNK scans, stunts, races and the shooting ranges. Start scanning early — the counters run all game.' },
  { n: 4, title: 'Stage 4 — Crime, money & free-roam', blurb: 'Robberies, wanted-level tricks and the odd one-offs. Best done with your partner, once both characters are together.' },
  { n: 5, title: 'Stage 5 — Endgame: 100% & Platinum', blurb: 'Finish the 100% checklist for A Long Road; the platinum follows on its own.' },
];

const KINDS = [
  ['all', 'All'], ['story', 'Story'], ['missable', 'Missable'], ['collectibles', 'Collectibles'],
  ['activities', 'Activities'], ['crime', 'Crime'], ['side', 'Side quests'], ['misc', 'Odd jobs'],
  ['completion', '100% & Platinum'], ['online', 'Online'],
];
const KIND_LABEL = { story: 'Story', side: 'Side quests', collectibles: 'Collectibles', activities: 'Activities', crime: 'Crime', misc: 'Odd jobs', completion: '100% & Platinum' };

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

// Demo states for screenshots (?demo=story ticks the story trophies, without touching saved progress).
let earned = new Set(JSON.parse(localStorage.getItem(KEY_EARNED) ?? '[]'));
if (params.get('demo') === 'story') earned = new Set(trophies.filter(t => t.kind === 'story').map(t => t.id));
let spoiler = params.get('spoiler') === '1' ? true : localStorage.getItem(KEY_SPOILER) === '1';
let kindFilter = 'all';
let gradeFilter = 'all';
let query = '';
let view = params.get('view') === 'roadmap' ? 'roadmap' : 'checklist';
let openId = Number(params.get('open') ?? 0);

const $ = id => document.getElementById(id);
const checklistEl = $('checklist');
const roadmapEl = $('roadmap');
const emptyEl = $('empty');

function save() {
  localStorage.setItem(KEY_EARNED, JSON.stringify([...earned]));
  localStorage.setItem(KEY_SPOILER, spoiler ? '1' : '0');
}

function isMasked(t) {
  return spoiler && t.kind === 'story' && !earned.has(t.id);
}

function badge(text, cls) {
  const s = document.createElement('span');
  s.className = 'badge ' + cls;
  s.textContent = text;
  return s;
}

function trophyCard(t) {
  const masked = isMasked(t);
  const art = document.createElement('article');
  art.className = 'trophy' + (earned.has(t.id) ? ' earned' : '') + (masked ? ' masked' : '');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', 'Earned: ' + t.name);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    save();
    render();
  });
  art.append(box);
  const body = document.createElement('div');
  body.className = 'body';
  const h = document.createElement('h3');
  h.textContent = masked ? 'Hidden story trophy' : t.name;
  body.append(h);
  const badges = document.createElement('div');
  badges.className = 'badges';
  badges.append(badge(t.grade, t.grade));
  badges.append(badge(KIND_LABEL[t.kind], 'kind'));
  if (t.hidden) badges.append(badge('Hidden', 'hidden'));
  if (t.missable) badges.append(badge('Missable', 'missable'));
  if (t.unconfirmed) badges.append(badge('Unconfirmed', 'unconfirmed'));
  body.append(badges);
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = masked ? 'Hidden until earned — tick it off once you have played it.' : t.description;
  body.append(desc);
  if (!masked) {
    const det = document.createElement('details');
    if (openId === t.id) det.open = true;
    const sum = document.createElement('summary');
    sum.textContent = 'Guide + sources';
    det.append(sum);
    const g = document.createElement('p');
    g.className = 'guide-text';
    g.textContent = t.guide;
    det.append(g);
    const src = document.createElement('p');
    src.className = 'sources';
    const strong = document.createElement('strong');
    strong.textContent = 'Sources: ';
    src.append(strong, document.createTextNode(t.sources.join(' · ')));
    det.append(src);
    body.append(det);
  }
  art.append(body);
  return art;
}

function matches(t) {
  if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
  if (kindFilter === 'missable' && !t.missable) return false;
  if (kindFilter === 'online') return false;
  if (kindFilter !== 'all' && kindFilter !== 'missable' && t.kind !== kindFilter) return false;
  if (query) {
    const hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
    if (!hay.includes(query)) return false;
  }
  return true;
}

function renderProgress() {
  const n = earned.size;
  const total = trophies.length;
  $('earned-count').textContent = n;
  $('bar-fill').style.width = Math.round((n / total) * 100) + '%';
  $('progress-text').textContent = Math.round((n / total) * 100) + '% to the platinum';
  const counts = {};
  for (const t of trophies) if (earned.has(t.id)) counts[t.grade] = (counts[t.grade] ?? 0) + 1;
  $('grade-counts').textContent =
    'Platinum ' + (counts.platinum ?? 0) + '/1 · Gold ' + (counts.gold ?? 0) + '/2 · Silver ' + (counts.silver ?? 0) + '/6 · Bronze ' + (counts.bronze ?? 0) + '/46';
}

function renderChecklist() {
  checklistEl.replaceChildren();
  let shown = 0;
  for (const st of STAGES) {
    const list = trophies.filter(t => t.stage === st.n && matches(t));
    if (!list.length) continue;
    shown += list.length;
    const head = document.createElement('div');
    head.className = 'stage-head';
    const h = document.createElement('h2');
    h.textContent = st.title + ' — ' + list.filter(t => earned.has(t.id)).length + '/' + trophies.filter(t => t.stage === st.n).length + ' earned';
    const p = document.createElement('p');
    p.textContent = st.blurb;
    head.append(h, p);
    checklistEl.append(head);
    for (const t of list) checklistEl.append(trophyCard(t));
  }
  emptyEl.hidden = shown > 0;
  $('filter-note').textContent = kindFilter === 'online'
    ? 'No online trophies — all 55 trophies are single-player.'
    : (shown === trophies.length ? '' : 'Showing ' + shown + ' of ' + trophies.length + ' trophies.');
}

function renderRoadmap() {
  roadmapEl.replaceChildren();
  for (const st of STAGES) {
    const list = trophies.filter(t => t.stage === st.n);
    const done = list.filter(t => earned.has(t.id)).length;
    const sec = document.createElement('section');
    sec.className = 'road-stage';
    const h = document.createElement('h2');
    h.textContent = st.title + ' — ' + done + '/' + list.length;
    const p = document.createElement('p');
    p.textContent = st.blurb;
    sec.append(h, p);
    const ol = document.createElement('ol');
    for (const t of list) {
      const li = document.createElement('li');
      if (earned.has(t.id)) li.className = 'done';
      li.textContent = (isMasked(t) ? 'Hidden story trophy' : t.name) + ' (' + t.grade + ')' + (t.missable ? ' — missable' : '');
      ol.append(li);
    }
    sec.append(ol);
    roadmapEl.append(sec);
  }
}

function render() {
  renderProgress();
  if (view === 'roadmap') {
    checklistEl.hidden = true;
    roadmapEl.hidden = false;
    renderRoadmap();
    $('filter-note').textContent = '';
    emptyEl.hidden = true;
  } else {
    roadmapEl.hidden = true;
    checklistEl.hidden = false;
    renderChecklist();
  }
  $('view-checklist').classList.toggle('active', view === 'checklist');
  $('view-roadmap').classList.toggle('active', view === 'roadmap');
}

// Filter buttons.
const filterWrap = $('kind-filters');
for (const [value, label] of KINDS) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label + (value === 'missable' ? ' (1)' : '');
  if (value === kindFilter) b.classList.add('active');
  b.addEventListener('click', () => {
    kindFilter = value;
    for (const x of filterWrap.children) x.classList.remove('active');
    b.classList.add('active');
    render();
  });
  filterWrap.append(b);
}

$('grade').addEventListener('change', e => { gradeFilter = e.target.value; render(); });
$('search').addEventListener('input', e => { query = e.target.value.trim().toLowerCase(); render(); });
$('spoiler').checked = spoiler;
$('spoiler').addEventListener('change', e => { spoiler = e.target.checked; save(); render(); });
$('view-checklist').addEventListener('click', () => { view = 'checklist'; render(); });
$('view-roadmap').addEventListener('click', () => { view = 'roadmap'; render(); });

$('export').addEventListener('click', () => {
  const payload = { app: 'gta6-trophy-guide', version: 1, earned: [...earned].sort((a, b) => a - b), spoiler, exportedAt: new Date().toISOString() };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('import').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list');
    const valid = new Set(trophies.map(t => t.id));
    const next = new Set();
    for (const id of ids) {
      const n = typeof id === 'number' ? id : Number(id);
      if (valid.has(n)) next.add(n);
    }
    earned = next;
    if (typeof data.spoiler === 'boolean') { spoiler = data.spoiler; $('spoiler').checked = spoiler; }
    save();
    render();
  } catch {
    $('filter-note').textContent = 'That file could not be imported — it is not a progress file from this guide.';
  }
  e.target.value = '';
});

render();
