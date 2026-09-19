import * as store from './store.js';
import { GOALS, SOTU, TOOLS, FEELINGS, STRENGTHS, CHALLENGES, FLOORS, PRACTICE_FLOOR, STATUS_LABEL } from './content.js';
import { houseSvg, legendHtml, logoSvg } from './house.js';

const $app = document.getElementById('app');
const IDLE_MS = 5 * 60 * 1000;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function weekKey(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // Monday
  return ymd(x);
}
const niceWeek = (k) => new Date(k + 'T00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

// ---------- theme (light / dark, remembered on this device) ----------
const root = document.documentElement;
const sysDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
const currentTheme = () => root.dataset.theme || (sysDark() ? 'dark' : 'light');
function applyTheme(t) {
  if (t) root.dataset.theme = t;
  const dark = currentTheme() === 'dark';
  const b = document.getElementById('theme');
  b.textContent = dark ? '☀' : '☾';
  b.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  document.querySelector('meta[name="theme-color"]').content = dark ? '#150f22' : '#4B2882';
}
try { const t = localStorage.getItem('mc_theme'); if (t === 'light' || t === 'dark') root.dataset.theme = t; } catch {}
document.getElementById('theme').addEventListener('click', () => {
  const t = currentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(t);
  try { localStorage.setItem('mc_theme', t); } catch {}
});
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme());
applyTheme();

let msg = '';
let draft = null;
let timer = null;
let sotuStep = 0;
let idleT = null;

const S = () => store.get();
const names = () => S().settings.names.map((n, i) => n || `Partner ${i + 1}`);
const me = () => S().settings.me;

// ---------- router ----------
const ALL = GOALS.flatMap((g) => g.practices);
const floorProgress = (id) => {
  const ps = ALL.filter((p) => PRACTICE_FLOOR[p.id] === id);
  return [ps.filter((p) => S().done[`${weekKey()}|${p.id}|${me()}`]).length, ps.length];
};

const NAV = [
  ['home', '⌂', 'House'],
  ['checkin', '✎', 'Check-In'],
  ['sotu', '◎', 'Talk'],
  ['tools', '⚒', 'Tools'],
  ['progress', '↗', 'Progress'],
];

function route() {
  const [name, arg] = (location.hash.slice(1) || 'home').split('/');
  return { name, arg };
}

function render() {
  clearInterval(timer);
  if (!store.isUnlocked()) return renderLock();
  if (!S().settings.names[0] && !S().settings.names[1]) return renderSetup();
  const { name, arg } = route();
  const views = { home, floor, checkin, sotu, tools, progress, parking, settings };
  const body = (views[name] || home)(arg);
  const nav = NAV.map(([k, ic, l]) => `<a href="#${k}" class="${name === k ? 'on' : ''}"><span>${ic}</span>${l}</a>`).join('');
  $app.innerHTML = `${body}<nav class="nav"><div class="nav-in">${nav}</div></nav>`;
  window.scrollTo(0, 0);
}

// ---------- lock / setup ----------
function renderLock() {
  const first = !store.hasVault();
  $app.innerHTML = `<div class="lock">${logoSvg()}<h1>Marriage Check-In</h1>
  <p class="muted">${first
    ? 'Create a passphrase. Your answers are encrypted with it and stay on this device only. <b>There is no way to recover a forgotten passphrase</b>, so make a backup export once you have data.'
    : 'Enter your passphrase to unlock.'}</p>
  <form data-form="${first ? 'create' : 'unlock'}">
    <label class="lbl" for="p1">Passphrase</label>
    <input id="p1" type="password" autocomplete="${first ? 'new-password' : 'current-password'}" required minlength="${first ? 10 : 1}">
    ${first ? '<label class="lbl" for="p2">Confirm passphrase</label><input id="p2" type="password" autocomplete="new-password" required>' : ''}
    <p class="err">${esc(msg)}</p>
    <button type="submit">${first ? 'Create private vault' : 'Unlock'}</button>
  </form>
  ${first ? '<p class="muted">Use at least 10 characters. A few random words works well.</p>' : ''}</div>`;
  msg = '';
}

function renderSetup() {
  $app.innerHTML = `<div class="lock">${logoSvg()}<h1>Welcome</h1><p class="muted">Who is who? This stays on your device.</p>
  <form data-form="setup">
    <label class="lbl">Partner 1</label><input type="text" name="n0" value="Janet" required>
    <label class="lbl">Partner 2</label><input type="text" name="n1" value="Matt" required>
    <label class="lbl">Which one are you on THIS device?</label>
    <select name="me"><option value="0">Partner 1</option><option value="1" selected>Partner 2</option></select>
    <p></p><button type="submit">Continue</button>
  </form></div>`;
}

// ---------- views ----------
function pri(p) { return p.priority ? `<span class="tag">${p.priority === 1 ? '★ priority' : '★★ priority'}</span>` : ''; }

function practiceRow(p) {
  const k = `${weekKey()}|${p.id}|${me()}`;
  return `<label class="check"><input type="checkbox" data-change="toggle" data-id="${p.id}" ${S().done[k] ? 'checked' : ''}>
      <span>${pri(p)}${esc(p.text)} ${TOOLS[p.tool] ? `<a href="#tools/${p.tool}">how</a>` : ''}</span></label>`;
}

function floor(id) {
  const f = FLOORS.find((x) => x.id === id) || FLOORS[0];
  const ps = ALL.filter((p) => PRACTICE_FLOOR[p.id] === f.id);
  const [done, total] = floorProgress(f.id);
  return `<p><a href="#home">← The house</a></p><h1>${esc(f.title)}</h1>
  <p><span class="tag st-${f.status}">${STATUS_LABEL[f.status]}</span>${total ? `<span class="muted">${done} of ${total} practices this week</span>` : ''}</p>
  <p>${esc(f.desc)}</p>
  <div class="card"><h3>Your Gottman Checkup</h3><p>${esc(f.note)}</p></div>
  ${ps.length ? `<h2>This week</h2><div class="card">${ps.map(practiceRow).join('')}</div>` : '<p class="muted">No weekly practice is assigned to this floor. Keep it strong by appreciating it out loud.</p>'}
  ${f.tools.length ? `<h2>Tools</h2>${f.tools.map((k) => `<a class="card" href="#tools/${k}"><h3>${esc(TOOLS[k].title)}</h3><p class="muted">${esc(TOOLS[k].blurb)}</p></a>`).join('')}` : ''}`;
}

function home() {
  const st = S(), w = weekKey(), n = names(), m = me();
  const all = GOALS.flatMap((g) => g.practices);
  const doneCount = all.filter((p) => st.done[`${w}|${p.id}|${m}`]).length;
  const mine = st.checkins[`${w}-${m}`], theirs = st.checkins[`${w}-${1 - m}`];
  const next = st.settings.nextSession;
  const left = 5 - (st.settings.sessionsSinceReview % 5);
  const goals = GOALS.map((g) => `<div class="card"><h3>${esc(g.title)}</h3><p class="muted">${esc(g.area)}</p>${g.practices.map(practiceRow).join('')}</div>`).join('');
  return `<h1>Hi ${esc(n[m])}</h1><p class="muted">Week of ${niceWeek(w)}. Tap any floor of our house.</p>
  <div class="house">${houseSvg(floorProgress)}</div>${legendHtml()}
  <p class="muted"></p>
  <div class="card"><div class="row"><div class="grow"><b>${doneCount} of ${all.length}</b> practices this week</div>
  <a class="btn ${mine ? 'ghost' : ''}" href="#checkin">${mine ? 'Edit check-in' : 'Do check-in (5 min)'}</a></div>
  <p class="muted">${esc(n[1 - m])}: ${theirs ? 'checked in ✓' : 'no check-in yet (import their export to see it)'}</p></div>
  <div class="card"><div class="row"><div class="grow">Next session with Susan: <b>${next ? esc(next) : 'not set'}</b>
  <p class="muted">Goals are reviewed about every 5 sessions. ${left === 5 ? 'Review due now.' : `${left} more until review.`}</p></div><a class="btn ghost small" href="#settings">Edit</a></div></div>
  <h2>Weekly practices</h2>${goals}
  <a class="btn ghost" href="#parking">Gridlocked issues (Parking Lot)</a>`;
}

function stepper(f, v) {
  return `<div class="stepper"><button type="button" class="ghost" data-act="step" data-f="${f}" data-d="-1">−</button><span class="n" id="n-${f}">${v}</span><button type="button" class="ghost" data-act="step" data-f="${f}" data-d="1">+</button></div>`;
}
function seg(f, v, opts) {
  return `<div class="seg">${opts.map(([val, l]) => `<label><input type="radio" name="${f}" value="${val}" data-change="field" data-f="${f}" ${v === val ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>`;
}

function checkin() {
  const w = weekKey(), id = `${w}-${me()}`;
  if (!draft) draft = { connection: 6, bidsNoticed: 0, bidsToward: 0, gentle: 'na', flooded: 'no', appreciation: '', need: '', win: '', ...S().checkins[id] };
  const d = draft;
  return `<h1>Weekly check-in</h1><p class="muted">Week of ${niceWeek(w)}. About 5 minutes. Only you see this until you share an export.</p>
  <div class="card"><label class="lbl">How connected did we feel this week? <span id="conn-v">${d.connection}</span>/10</label>
  <input type="range" min="1" max="10" value="${d.connection}" data-input="field" data-f="connection"></div>
  <div class="card"><label class="lbl">Bids from my partner that I noticed</label>${stepper('bidsNoticed', d.bidsNoticed)}
  <label class="lbl">...that I turned toward</label>${stepper('bidsToward', d.bidsToward)}</div>
  <div class="card"><label class="lbl">I used a Gentle Start-Up</label>${seg('gentle', d.gentle, [['yes', 'Yes'], ['no', 'No'], ['na', 'No conflict']])}
  <label class="lbl">I got flooded</label>${seg('flooded', d.flooded, [['no', 'No'], ['yes', 'Yes']])}</div>
  <div class="card"><label class="lbl" for="ap">One thing I appreciated about my partner</label><textarea id="ap" data-input="field" data-f="appreciation">${esc(d.appreciation)}</textarea>
  <label class="lbl" for="nd">A need I want to express (gently)</label><textarea id="nd" data-input="field" data-f="need">${esc(d.need)}</textarea>
  <label class="lbl" for="wn">A win from this week</label><textarea id="wn" data-input="field" data-f="win">${esc(d.win)}</textarea></div>
  <button data-act="saveCheckin">Save check-in</button> <span class="ok">${esc(msg)}</span>`;
}

function sotu() {
  const s = SOTU[sotuStep];
  return `<h1>State of the Union</h1><p class="muted">A weekly guided conversation. Step ${sotuStep + 1} of ${SOTU.length}.</p>
  <div class="card"><h2>${esc(s.t)}</h2><p>${esc(s.p)}</p>
  <div class="big" id="clock">${pad(s.min)}:00</div>
  <div class="row"><button data-act="timer" data-min="${s.min}">Start ${s.min} min timer</button>
  <button class="ghost" data-act="sotuPrev" ${sotuStep === 0 ? 'disabled' : ''}>Back</button>
  <button class="ghost" data-act="sotuNext">${sotuStep === SOTU.length - 1 ? 'Finish' : 'Next'}</button></div></div>
  <p class="muted">If either of you floods, stop and use the break plan: <a href="#tools/flooding">flooding card</a>.</p>`;
}

function tools(arg) {
  if (arg && (TOOLS[arg])) return tool(arg);
  const keys = Object.keys(TOOLS);
  return `<h1>Tools</h1>${keys.map((k) => `<a class="card" href="#tools/${k}"><h3>${esc(TOOLS[k].title)}</h3><p class="muted">${esc(TOOLS[k].blurb)}</p></a>`).join('')}
  <div class="card"><h3>Feelings wheel (quick)</h3>${FEELINGS.map(([a, b]) => `<p><b>${a}:</b> ${esc(b)}</p>`).join('')}</div>`;
}

function tool(k) {
  const t = TOOLS[k];
  const list = (a, ordered) => a ? `<ul class="tight">${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
  const chips = (a) => a ? a.map((x) => `<span class="chip">${esc(x)}</span>`).join('') : '';
  const builder = t.builder ? `<div class="card"><h3>Build a Gentle Start-Up</h3>
    <label class="lbl">I feel...</label><input type="text" data-input="su" data-f="feel" placeholder="overwhelmed">
    <label class="lbl">about what...</label><input type="text" data-input="su" data-f="about" placeholder="the dishes piling up tonight">
    <label class="lbl">I need...</label><input type="text" data-input="su" data-f="need" placeholder="help tidying after dinner">
    <div class="quote" id="su-out">I feel ___ about ___. I need ___.</div></div>` : '';
  return `<p><a href="#tools">← All tools</a></p><h1>${esc(t.title)}</h1><p class="muted">${esc(t.blurb)}</p>
  ${list(t.points)}${t.questions ? `<h2>Questions</h2>${list(t.questions)}` : ''}
  ${t.phrases ? `<h2>Phrases</h2>${chips(t.phrases)}` : ''}${t.ideas ? `<h2>Ideas</h2>${list(t.ideas)}` : ''}${builder}
  ${k === 'parking' ? '<a class="btn" href="#parking">Open Parking Lot</a>' : ''}`;
}

function parking(arg) {
  const items = Object.values(S().parking).filter((p) => !p.deleted).sort((a, b) => b.createdAt - a.createdAt);
  const n = names();
  return `<p><a href="#home">← Home</a></p><h1>Parking Lot</h1><p class="muted">Perpetual, gridlocked issues (money, raising children / school). Do not solve them here. Record the dream under each position, then talk it through.</p>
  <form class="card" data-form="addIssue"><label class="lbl">Issue</label><input type="text" name="title" required>
  <label class="lbl">${esc(n[0])}’s dream / need underneath</label><textarea name="d0"></textarea>
  <label class="lbl">${esc(n[1])}’s dream / need underneath</label><textarea name="d1"></textarea>
  <p></p><button type="submit">Add issue</button></form>
  ${items.map((p) => `<div class="card"><div class="row"><h3 class="grow">${esc(p.title)}</h3><button class="ghost small" data-act="delIssue" data-id="${p.id}">Remove</button></div>
  <p><span class="who-a">${esc(n[0])}:</span> ${esc(p.d0) || '<span class="muted">not yet filled in</span>'}</p>
  <p><span class="who-b">${esc(n[1])}:</span> ${esc(p.d1) || '<span class="muted">not yet filled in</span>'}</p></div>`).join('') || '<p class="muted">Nothing parked yet.</p>'}`;
}

function chart(weeks, get, label) {
  const W = 320, H = 150, L = 26, R = 8, T = 10, B = 24;
  const x = (i) => (weeks.length < 2 ? (L + W - R) / 2 : L + (i / (weeks.length - 1)) * (W - L - R));
  const y = (v) => H - B - ((v - 1) / 9) * (H - B - T);
  const line = (who, cls) => {
    const pts = weeks.map((w, i) => [i, get(w, who)]).filter(([, v]) => v != null);
    if (!pts.length) return '';
    return `<polyline class="ln ${cls}" points="${pts.map(([i, v]) => `${x(i)},${y(v)}`).join(' ')}"/>` + pts.map(([i, v]) => `<circle class="${cls}" cx="${x(i)}" cy="${y(v)}" r="3"/>`).join('');
  };
  const grid = [1, 5, 10].map((v) => `<line class="axis" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="2" y="${y(v) + 3}">${v}</text>`).join('');
  const lab = weeks.map((w, i) => (i % Math.ceil(weeks.length / 6) === 0 ? `<text x="${x(i) - 12}" y="${H - 8}">${niceWeek(w)}</text>` : '')).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">${grid}${lab}${line(0, 'ga')}${line(1, 'gb')}</svg>`;
}

function progress() {
  const st = S(), n = names();
  const weeks = [...new Set(Object.values(st.checkins).map((c) => c.week))].sort().slice(-12);
  if (!weeks.length) return '<h1>Progress</h1><p class="muted">Complete a check-in and your trends will appear here.</p>';
  const c = (w, who) => st.checkins[`${w}-${who}`];
  const pct = (w, who) => { const e = c(w, who); return e && e.bidsNoticed ? Math.round((e.bidsToward / e.bidsNoticed) * 10) : null; };
  const last5 = weeks.slice(-5);
  const entries = last5.flatMap((w) => [0, 1].map((who) => c(w, who)).filter(Boolean));
  const avg = (f) => (entries.length ? (entries.reduce((s, e) => s + f(e), 0) / entries.length).toFixed(1) : '-');
  const cnt = (f) => entries.filter(f).length;
  const totNot = entries.reduce((s, e) => s + e.bidsNoticed, 0), totTow = entries.reduce((s, e) => s + e.bidsToward, 0);
  const done = Object.keys(st.done).filter((k) => last5.includes(k.split('|')[0])).length;
  const notes = weeks.slice().reverse().slice(0, 6).flatMap((w) => [0, 1].map((who) => c(w, who)).filter((e) => e && (e.appreciation || e.need || e.win)).map((e) => `<div class="card"><span class="${e.who === 0 ? 'who-a' : 'who-b'}">${esc(n[e.who])}</span> <span class="muted">${niceWeek(w)}</span>
    ${e.appreciation ? `<p><b>Appreciated:</b> ${esc(e.appreciation)}</p>` : ''}${e.need ? `<p><b>Need:</b> ${esc(e.need)}</p>` : ''}${e.win ? `<p><b>Win:</b> ${esc(e.win)}</p>` : ''}</div>`)).join('');
  return `<h1>Progress</h1>
  <div class="card"><h3>Connection score</h3><p class="muted"><span class="who-a">● ${esc(n[0])}</span> &nbsp; <span class="who-b">● ${esc(n[1])}</span></p>${chart(weeks, (w, who) => c(w, who)?.connection ?? null, 'Connection score by week')}</div>
  <div class="card"><h3>Bids turned toward (scaled 1-10 = 10-100%)</h3>${chart(weeks, pct, 'Bids turned toward by week')}<p class="muted">Goal: stay near 86% or more.</p></div>
  <div class="card"><h3>Review pack for Susan (last ${last5.length} weeks)</h3>
  <ul class="tight"><li>Average connection: <b>${avg((e) => e.connection)}</b>/10</li>
  <li>Bids turned toward: <b>${totNot ? Math.round((totTow / totNot) * 100) + '%' : '-'}</b> (${totTow} of ${totNot})</li>
  <li>Gentle Start-Ups used: <b>${cnt((e) => e.gentle === 'yes')}</b>, missed: <b>${cnt((e) => e.gentle === 'no')}</b></li>
  <li>Flooding reported in <b>${cnt((e) => e.flooded === 'yes')}</b> of ${entries.length} check-ins</li>
  <li>Practices completed: <b>${done}</b></li></ul>
  <p class="muted">Checkup baseline. Strengths: ${esc(STRENGTHS.join(', '))}. Growth areas: ${esc(CHALLENGES.join(', '))}.</p>
  <button class="ghost" data-act="print">Print / save as PDF</button></div>
  <h2>Recent notes</h2>${notes || '<p class="muted">No notes yet.</p>'}`;
}

function settings() {
  const st = S().settings, n = names();
  return `<p><a href="#home">← Home</a></p><h1>Settings</h1>
  <form class="card" data-form="settings"><label class="lbl">Partner 1</label><input type="text" name="n0" value="${esc(st.names[0])}">
  <label class="lbl">Partner 2</label><input type="text" name="n1" value="${esc(st.names[1])}">
  <label class="lbl">I am (on this device)</label><select name="me"><option value="0" ${st.me === 0 ? 'selected' : ''}>${esc(n[0])}</option><option value="1" ${st.me === 1 ? 'selected' : ''}>${esc(n[1])}</option></select>
  <label class="lbl">Next session date</label><input type="date" name="next" value="${esc(st.nextSession)}">
  <label class="lbl">Sessions since last goal review (of 5)</label><input type="number" name="ssr" min="0" max="20" value="${st.sessionsSinceReview}">
  <p></p><button type="submit">Save</button> <span class="ok">${esc(msg)}</span></form>
  <div class="card"><h3>Share &amp; back up</h3><p class="muted">Exports are encrypted with a passphrase you choose. Send the file to your partner by any channel (AirDrop, message, drive) and tell them the passphrase separately. Never commit exports to git.</p>
  <label class="lbl">Export passphrase</label><input id="xp" type="password" autocomplete="off">
  <p></p><button data-act="export">Download encrypted export</button>
  <label class="lbl">Import a partner’s export</label><input id="xf" type="file" accept=".json,application/json">
  <label class="lbl">Its passphrase</label><input id="xp2" type="password" autocomplete="off">
  <p></p><button class="ghost" data-act="import">Import &amp; merge</button></div>
  <div class="card"><h3>Where your data lives</h3><p class="muted">Only encrypted in this browser’s local storage. No server, no analytics, no outside scripts. Clearing browser data or losing the passphrase loses the data, so keep a backup export.</p>
  <div class="row"><button class="ghost" data-act="lock">Lock now</button><button class="danger" data-act="wipe">Wipe all data</button></div></div>`;
}

// ---------- events ----------
document.addEventListener('submit', async (e) => {
  const f = e.target.closest('[data-form]');
  if (!f) return;
  e.preventDefault();
  const kind = f.dataset.form, fd = new FormData(f);
  try {
    if (kind === 'create') {
      if (f.p1.value !== f.p2.value) { msg = 'Passphrases do not match.'; return renderLock(); }
      await store.create(f.p1.value); startIdle(); render();
    } else if (kind === 'unlock') {
      try { await store.unlock(f.p1.value); startIdle(); render(); } catch { msg = 'Wrong passphrase.'; renderLock(); }
    } else if (kind === 'setup' || kind === 'settings') {
      const s = S().settings;
      s.names = [fd.get('n0').trim(), fd.get('n1').trim()];
      s.me = Number(fd.get('me'));
      if (kind === 'settings') { s.nextSession = fd.get('next') || ''; s.sessionsSinceReview = Number(fd.get('ssr')) || 0; msg = 'Saved.'; }
      await store.save(); render(); msg = '';
    } else if (kind === 'addIssue') {
      const id = crypto.randomUUID(), t = Date.now();
      S().parking[id] = { id, title: fd.get('title').trim(), d0: fd.get('d0').trim(), d1: fd.get('d1').trim(), createdAt: t, updatedAt: t };
      await store.save(); render();
    }
  } catch (err) { console.error(err); }
});

document.addEventListener('change', async (e) => {
  const el = e.target.closest('[data-change]');
  if (!el) return;
  if (el.dataset.change === 'toggle') {
    const k = `${weekKey()}|${el.dataset.id}|${me()}`;
    if (el.checked) S().done[k] = true; else delete S().done[k];
    await store.save();
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
  } else if (el.dataset.change === 'field') draft[el.dataset.f] = el.value;
});

document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-input]');
  if (!el) return;
  if (el.dataset.input === 'field') {
    draft[el.dataset.f] = el.type === 'range' ? Number(el.value) : el.value;
    if (el.type === 'range') document.getElementById('conn-v').textContent = el.value;
  } else if (el.dataset.input === 'su') {
    const v = (f) => document.querySelector(`[data-f="${f}"]`).value.trim() || '___';
    document.getElementById('su-out').textContent = `I feel ${v('feel')} about ${v('about')}. I need ${v('need')}.`;
  }
});

document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  try {
    if (act === 'step') {
      const f = el.dataset.f;
      draft[f] = Math.max(0, (draft[f] || 0) + Number(el.dataset.d));
      if (f === 'bidsToward' && draft.bidsToward > draft.bidsNoticed) draft.bidsNoticed = draft.bidsToward;
      if (f === 'bidsNoticed' && draft.bidsToward > draft.bidsNoticed) draft.bidsToward = draft.bidsNoticed;
      for (const k of ['bidsNoticed', 'bidsToward']) document.getElementById('n-' + k).textContent = draft[k];
    } else if (act === 'saveCheckin') {
      const w = weekKey();
      S().checkins[`${w}-${me()}`] = { ...draft, id: `${w}-${me()}`, week: w, who: me(), updatedAt: Date.now() };
      await store.save(); draft = null; msg = ''; location.hash = 'home'; render();
    } else if (act === 'timer') {
      let left = Number(el.dataset.min) * 60; clearInterval(timer);
      const tick = () => { const c = document.getElementById('clock'); if (c) c.textContent = `${pad(Math.floor(left / 60))}:${pad(left % 60)}`; if (left-- <= 0) clearInterval(timer); };
      tick(); timer = setInterval(tick, 1000);
    } else if (act === 'sotuNext') {
      if (sotuStep === SOTU.length - 1) { sotuStep = 0; location.hash = 'home'; } else sotuStep++;
      render();
    } else if (act === 'sotuPrev') { sotuStep = Math.max(0, sotuStep - 1); render(); }
    else if (act === 'delIssue') { const p = S().parking[el.dataset.id]; p.deleted = true; p.updatedAt = Date.now(); await store.save(); render(); }
    else if (act === 'print') window.print();
    else if (act === 'lock') { store.lock(); draft = null; render(); }
    else if (act === 'wipe') { if (confirm('Permanently erase ALL data on this device? This cannot be undone.')) { store.wipe(); draft = null; render(); } }
    else if (act === 'export') {
      const p = document.getElementById('xp').value;
      if (p.length < 10) return alert('Use an export passphrase of at least 10 characters.');
      const blob = new Blob([await store.exportFile(p)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = `checkin-export-${ymd(new Date())}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } else if (act === 'import') {
      const file = document.getElementById('xf').files[0], p = document.getElementById('xp2').value;
      if (!file || !p) return alert('Choose a file and enter its passphrase.');
      try { const n = await store.importFile(await file.text(), p); alert(`Imported. ${n} item(s) added or updated.`); render(); }
      catch { alert('Could not import: wrong passphrase or not a valid export file.'); }
    }
  } catch (err) { console.error(err); }
});

window.addEventListener('hashchange', () => { draft = route().name === 'checkin' ? draft : null; render(); });

let idleWired = false;
function startIdle() {
  const reset = () => { clearTimeout(idleT); if (store.isUnlocked()) idleT = setTimeout(() => { store.lock(); draft = null; render(); }, IDLE_MS); };
  if (!idleWired) {
    idleWired = true;
    ['click', 'keydown', 'touchstart', 'scroll'].forEach((ev) => document.addEventListener(ev, reset, { passive: true }));
  }
  reset();
}

render();
