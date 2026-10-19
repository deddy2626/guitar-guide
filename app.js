(() => {
'use strict';

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rand = n => Math.floor(Math.random() * n);

const store = {
  get(k, d) { try { const v = localStorage.getItem('fretwise:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('fretwise:' + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

// Standard tuning, low E -> high e.
const STRINGS = [
  { name: 'E', label: '6th string (low E)', midi: 40 },
  { name: 'A', label: '5th string', midi: 45 },
  { name: 'D', label: '4th string', midi: 50 },
  { name: 'G', label: '3rd string', midi: 55 },
  { name: 'B', label: '2nd string', midi: 59 },
  { name: 'E', label: '1st string (high e)', midi: 64 },
];
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const midiToFreq = m => 440 * Math.pow(2, (m - 69) / 12);
const noteName = m => NOTES[((m % 12) + 12) % 12];

/* ---------- audio ---------- */
let actx, master;
function audio() {
  if (!actx) {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createDynamicsCompressor();
    master.connect(actx.destination);
  }
  if (actx.state === 'suspended') actx.resume();
  return actx;
}

// Karplus-Strong plucked string, cached per pitch.
const pluckCache = new Map();
function pluckBuffer(freq) {
  const ctx = audio();
  const key = Math.round(freq * 100);
  if (pluckCache.has(key)) return pluckCache.get(key);
  const sr = ctx.sampleRate, len = Math.floor(sr * 2.4);
  const buf = ctx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  const N = Math.max(2, Math.round(sr / freq));
  for (let i = 0; i < N; i++) d[i] = Math.random() * 2 - 1;
  for (let i = N; i < len; i++) d[i] = 0.5 * (d[i - N] + d[i - N + 1]) * 0.9985;
  pluckCache.set(key, buf);
  return buf;
}
function playPluck(freq, when, gain = 0.22) {
  const ctx = audio();
  const src = ctx.createBufferSource();
  src.buffer = pluckBuffer(freq);
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(g).connect(master);
  src.start(when);
}
function playChord(c, mode, when) {
  const ctx = audio();
  const t0 = when ?? ctx.currentTime + 0.03;
  const gap = mode === 'arp' ? 0.5 : 0.04;
  let k = 0;
  c.frets.forEach((f, i) => {
    if (f < 0) return;
    playPluck(midiToFreq(STRINGS[i].midi + f), t0 + k * gap);
    k++;
  });
}
// Accurate sine/triangle tone (tuning references, quiz answers, beeps).
function tone(freq, dur, type = 'triangle', gain = 0.2, when) {
  const ctx = audio();
  const t = when ?? ctx.currentTime;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t); o.stop(t + dur + 0.05);
  return { o, g };
}

/* ---------- chord diagram ---------- */
function chordSVG(c) {
  const W = 110, H = 126, x0 = 22, dx = 13.2, y0 = 30, dy = 17;
  let s = `<svg viewBox="0 0 ${W} ${H}" class="chord-svg" role="img" aria-label="${esc(c.full)} chord diagram">`;
  for (let f = 0; f <= 5; f++) s += `<line x1="${x0}" y1="${y0 + f * dy}" x2="${x0 + 5 * dx}" y2="${y0 + f * dy}" class="${f === 0 ? 'nut' : 'fret'}"/>`;
  for (let i = 0; i < 6; i++) s += `<line x1="${x0 + i * dx}" y1="${y0}" x2="${x0 + i * dx}" y2="${y0 + 5 * dy}" class="str"/>`;
  c.frets.forEach((f, i) => {
    const x = x0 + i * dx;
    if (f < 0) s += `<text x="${x}" y="${y0 - 9}" class="mk">×</text>`;
    else if (f === 0) s += `<circle cx="${x}" cy="${y0 - 13}" r="4" class="open"/>`;
    else {
      const y = y0 + (f - 0.5) * dy;
      s += `<circle cx="${x}" cy="${y}" r="6.3" class="dot"/>`;
      if (c.fingers[i]) s += `<text x="${x}" y="${y + 3.6}" class="fn">${c.fingers[i]}</text>`;
    }
  });
  return s + '</svg>';
}

/* ---------- LEARN ---------- */
const checkState = (key, items) => { const saved = store.get(key, []); return items.map((_, i) => !!saved[i]); };
const lessonState = id => checkState('lesson:' + id, LESSONS.find(x => x.id === id).checklist);
const chordHref = n => '#chords/' + encodeURIComponent(n);
function chordRow(names) {
  return `<div class="chord-row">${names.map(n => {
    const c = CHORDS.find(x => x.name === n);
    return `<a href="${chordHref(n)}" class="mini">${chordSVG(c)}<b>${esc(n)}</b></a>`;
  }).join('')}</div>`;
}
function renderLearnList() {
  const done = LESSONS.filter(l => lessonState(l.id).every(Boolean)).length;
  $('#learn-list').innerHTML = `
    <div class="card path-head">
      <b>Your path</b>
      <div class="bar"><i style="width:${Math.round(done / LESSONS.length * 100)}%"></i></div>
      <span class="hint">${done} of ${LESSONS.length} lessons complete</span>
    </div>` + LESSONS.map(l => {
      const st = lessonState(l.id), n = st.filter(Boolean).length, all = n === st.length;
      return `<a class="card lesson-card${all ? ' done' : ''}" href="#learn/${l.id}">
        <span class="num">${all ? '✓' : l.id}</span>
        <span class="lc-body"><b>${esc(l.title)}</b><small>${esc(l.summary)}</small></span>
        <span class="lc-meta">${esc(l.time)}<br>${n}/${st.length}</span>
      </a>`;
    }).join('');
}
function renderLesson(id) {
  const l = LESSONS.find(x => x.id === id);
  if (!l) { location.hash = '#learn'; return; }
  const st = lessonState(id);
  const prev = LESSONS.find(x => x.id === id - 1), next = LESSONS.find(x => x.id === id + 1);
  const el = $('#learn-detail');
  el.innerHTML = `
    <a class="back" href="#learn">← All lessons</a>
    <h2>${l.id}. ${esc(l.title)} <small>${esc(l.time)}</small></h2>
    <div class="card prose">${l.body}</div>
    ${l.chords ? chordRow(l.chords) : ''}
    <div class="card">
      <h3>Checklist</h3>
      <ul class="checks">${l.checklist.map((t, i) => `<li><label><input type="checkbox" data-i="${i}"${st[i] ? ' checked' : ''}><span>${esc(t)}</span></label></li>`).join('')}</ul>
    </div>
    <div class="row between">
      ${prev ? `<a class="btn" href="#learn/${prev.id}">← ${esc(prev.title)}</a>` : '<span></span>'}
      ${next ? `<a class="btn primary" href="#learn/${next.id}">Next: ${esc(next.title)} →</a>` : '<span></span>'}
    </div>`;
  $$('input[type=checkbox]', el).forEach(cb => cb.addEventListener('change', () => {
    const cur = lessonState(id);
    cur[+cb.dataset.i] = cb.checked;
    store.set('lesson:' + id, cur);
  }));
  window.scrollTo(0, 0);
}

/* ---------- CHORDS ---------- */
let chordCat = 'first';
function renderChords(focusName) {
  if (focusName) {
    const c = CHORDS.find(x => x.name === focusName);
    if (c) chordCat = c.cat;
  }
  $('#chord-cats').innerHTML = CHORD_CATS.map(c => `<button data-cat="${c.id}" class="${c.id === chordCat ? 'on' : ''}">${esc(c.label)}</button>`).join('');
  $('#chord-grid').innerHTML = CHORDS.filter(c => c.cat === chordCat).map(c => `
    <article class="card chord" id="chord-${esc(c.name)}">
      ${chordSVG(c)}
      <h3>${esc(c.name)} <small>${esc(c.full)}</small></h3>
      <p>${esc(c.tip)}</p>
      <div class="row">
        <button class="btn primary" data-play="${esc(c.name)}" data-mode="strum">Strum</button>
        <button class="btn" data-play="${esc(c.name)}" data-mode="arp">One by one</button>
      </div>
    </article>`).join('');
  if (focusName) {
    const el = document.getElementById('chord-' + focusName);
    if (el) { el.classList.add('flash'); el.scrollIntoView({ block: 'center' }); }
  }
}
$('#chord-cats').addEventListener('click', e => {
  const b = e.target.closest('button[data-cat]');
  if (b) { chordCat = b.dataset.cat; renderChords(); }
});
$('#chord-grid').addEventListener('click', e => {
  const b = e.target.closest('button[data-play]');
  if (b) playChord(CHORDS.find(c => c.name === b.dataset.play), b.dataset.mode);
});

/* ---------- SONGS ---------- */
function renderSongsList() {
  $('#songs-list').innerHTML = SONGS.map(s => {
    const n = checkState('song:' + s.id, s.checklist).filter(Boolean).length;
    return `<a class="card lesson-card" href="#songs/${esc(s.id)}">
      <span class="num">🎵</span>
      <span class="lc-body"><b>${esc(s.title)} <small>· ${esc(s.artist)}</small></b><small>${esc(s.summary)}</small><small>${esc(s.level)}</small></span>
      <span class="lc-meta">${n}/${s.checklist.length}</span>
    </a>`;
  }).join('');
}
function renderSong(id) {
  const s = SONGS.find(x => x.id === id);
  if (!s) { location.hash = '#songs'; return; }
  const st = checkState('song:' + id, s.checklist);
  const easyOnly = s.easy.filter(n => !s.chords.includes(n));
  const el = $('#songs-detail');
  el.innerHTML = `
    <a class="back" href="#songs">← All songs</a>
    <h2>${esc(s.title)} <small>${esc(s.artist)} · ${esc(s.album)}</small></h2>
    <p class="hint">${esc(s.level)} · target about ${s.targetBpm} BPM</p>
    <div class="card prose">${s.body}</div>
    <h4>Chords</h4>
    ${chordRow(s.chords)}
    <h4>Easier shapes to start with</h4>
    ${chordRow(easyOnly)}
    <div class="card">
      <h3>Practise it</h3>
      <div class="row">
        <button class="btn primary" data-hear="${esc(s.id)}">▶ Hear the loop</button>
        <button class="btn" data-bpm="${s.startBpm}">Metronome at ${s.startBpm} BPM</button>
        <button class="btn" data-bpm="${s.targetBpm}">Metronome at ${s.targetBpm} BPM</button>
      </div>
    </div>
    <div class="card">
      <h3>Checklist</h3>
      <ul class="checks">${s.checklist.map((t, i) => `<li><label><input type="checkbox" data-i="${i}"${st[i] ? ' checked' : ''}><span>${esc(t)}</span></label></li>`).join('')}</ul>
    </div>`;
  $$('input[type=checkbox]', el).forEach(cb => cb.addEventListener('change', () => {
    const cur = checkState('song:' + id, s.checklist);
    cur[+cb.dataset.i] = cb.checked;
    store.set('song:' + id, cur);
  }));
  window.scrollTo(0, 0);
}
$('#songs-detail').addEventListener('click', e => {
  const hear = e.target.closest('button[data-hear]');
  if (hear) {
    const s = SONGS.find(x => x.id === hear.dataset.hear);
    const t0 = audio().currentTime + 0.05, bar = 4 * 60 / s.targetBpm;
    s.chords.forEach((n, i) => playChord(CHORDS.find(c => c.name === n), 'strum', t0 + i * bar));
    return;
  }
  const bpm = e.target.closest('button[data-bpm]');
  if (bpm) { setBpm(+bpm.dataset.bpm); location.hash = '#metronome'; }
});

/* ---------- TUNER ---------- */
// Autocorrelation pitch detection (ACF2+ by Chris Wilson). Returns Hz, or -1 if too quiet/unclear.
function autoCorrelate(input, sampleRate) {
  let size = input.length, rms = 0;
  for (let i = 0; i < size; i++) rms += input[i] * input[i];
  rms = Math.sqrt(rms / size);
  if (rms < 0.01) return -1;

  let r1 = 0, r2 = size - 1;
  const thres = 0.2;
  for (let i = 0; i < size / 2; i++) if (Math.abs(input[i]) < thres) { r1 = i; break; }
  for (let i = 1; i < size / 2; i++) if (Math.abs(input[size - i]) < thres) { r2 = size - i; break; }
  const buf = input.slice(r1, r2);
  size = buf.length;
  if (size < 64) return -1;

  const c = new Float32Array(size);
  for (let i = 0; i < size; i++) for (let j = 0; j < size - i; j++) c[i] += buf[j] * buf[j + i];

  let d = 0;
  while (d < size - 1 && c[d] > c[d + 1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < size; i++) if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
  if (maxpos <= 0 || maxpos >= size - 1) return -1;

  let T0 = maxpos;
  const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
  const a = (x1 + x3 - 2 * x2) / 2, b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);
  return sampleRate / T0;
}
function nearestString(freq) {
  let best = 0, bestCents = Infinity;
  STRINGS.forEach((s, i) => {
    const cents = 1200 * Math.log2(freq / midiToFreq(s.midi));
    if (Math.abs(cents) < Math.abs(bestCents)) { best = i; bestCents = cents; }
  });
  return { index: best, cents: bestCents };
}

const tuner = { stream: null, src: null, analyser: null, timer: null, recent: [], needle: 0, running: false };
async function startTuner() {
  const status = $('#tuner-status');
  if (!navigator.mediaDevices?.getUserMedia) {
    status.textContent = 'This browser can\'t use the microphone here. Try HTTPS (or localhost) and a recent browser.';
    return;
  }
  try {
    const ctx = audio();
    tuner.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    tuner.src = ctx.createMediaStreamSource(tuner.stream);
    tuner.analyser = ctx.createAnalyser();
    tuner.analyser.fftSize = 2048;
    tuner.src.connect(tuner.analyser);
    tuner.running = true;
    tuner.recent = [];
    $('#tuner-toggle').textContent = 'Stop tuner';
    status.textContent = 'Listening… pluck one string.';
    const buf = new Float32Array(tuner.analyser.fftSize);
    tuner.timer = setInterval(() => {
      tuner.analyser.getFloatTimeDomainData(buf);
      handlePitch(autoCorrelate(buf, ctx.sampleRate));
    }, 60);
  } catch (err) {
    status.textContent = err && err.name === 'NotAllowedError'
      ? 'Microphone access was blocked. Allow it in your browser settings and try again.'
      : 'Couldn\'t start the microphone.';
    stopTuner();
  }
}
function stopTuner() {
  clearInterval(tuner.timer);
  tuner.timer = null;
  if (tuner.src) { try { tuner.src.disconnect(); } catch { /* already gone */ } }
  if (tuner.stream) tuner.stream.getTracks().forEach(t => t.stop());
  tuner.stream = tuner.src = tuner.analyser = null;
  tuner.running = false;
  const btn = $('#tuner-toggle');
  if (btn) btn.textContent = 'Start tuner';
}
let silentTicks = 0;
function handlePitch(freq) {
  if (freq < 60 || freq > 500) {
    if (++silentTicks > 15) { tuner.recent = []; setTuner(null); }
    return;
  }
  silentTicks = 0;
  tuner.recent.push(freq);
  if (tuner.recent.length > 5) tuner.recent.shift();
  const sorted = [...tuner.recent].sort((a, b) => a - b);
  setTuner(nearestString(sorted[sorted.length >> 1]));
}
function setTuner(r) {
  const noteEl = $('#tuner-note'), targetEl = $('#tuner-target'), needle = $('#tuner-needle'), status = $('#tuner-status');
  if (!r) {
    noteEl.textContent = '–'; noteEl.className = 'tuner-note';
    targetEl.textContent = 'Pluck a string…'; status.textContent = 'Listening…';
    needle.style.left = '50%';
    return;
  }
  const s = STRINGS[r.index];
  const cents = Math.max(-50, Math.min(50, r.cents));
  const inTune = Math.abs(r.cents) <= 5;
  noteEl.textContent = s.name;
  noteEl.className = 'tuner-note ' + (inTune ? 'good' : Math.abs(r.cents) <= 15 ? 'near' : 'off');
  targetEl.textContent = s.label;
  needle.style.left = (50 + cents) + '%';
  status.textContent = inTune ? 'In tune ✓'
    : r.cents < 0 ? `Too low (${Math.round(-r.cents)} cents). Tighten the string.`
    : `Too high (${Math.round(r.cents)} cents). Loosen the string.`;
}
$('#tuner-toggle').addEventListener('click', () => (tuner.running ? stopTuner() : startTuner()));

// reference tones
let refPlaying = null;
function stopRef() {
  if (!refPlaying) return;
  const { o, g, btn } = refPlaying;
  const ctx = audio();
  g.gain.cancelScheduledValues(ctx.currentTime);
  g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
  try { o.stop(ctx.currentTime + 0.15); } catch { /* already stopped */ }
  btn.classList.remove('on');
  refPlaying = null;
}
$('#ref-strings').innerHTML = STRINGS.map((s, i) =>
  `<button class="btn" data-s="${i}"><b>${s.name}</b><small>${s.label.replace(/ string.*/, '')}</small></button>`).join('');
$('#ref-strings').addEventListener('click', e => {
  const btn = e.target.closest('button[data-s]');
  if (!btn) return;
  const same = refPlaying && refPlaying.btn === btn;
  stopRef();
  if (same) return;
  const { o, g } = tone(midiToFreq(STRINGS[+btn.dataset.s].midi), 6, 'triangle', 0.25);
  btn.classList.add('on');
  refPlaying = { o, g, btn };
  o.onended = () => { if (refPlaying && refPlaying.o === o) { btn.classList.remove('on'); refPlaying = null; } };
});

/* ---------- METRONOME ---------- */
const metro = { bpm: 80, beats: 4, running: false, next: 0, beat: 0, timer: null, queue: [], raf: 0, taps: [] };
function drawBeats(active = -1) {
  $('#beats').innerHTML = Array.from({ length: metro.beats }, (_, i) =>
    `<i class="${i === 0 ? 'accent ' : ''}${i === active ? 'on' : ''}"></i>`).join('');
}
function setBpm(v) {
  metro.bpm = Math.max(40, Math.min(208, Math.round(v)));
  $('#bpm-display').textContent = metro.bpm;
  $('#bpm-range').value = metro.bpm;
  store.set('bpm', metro.bpm);
}
function schedule() {
  const ctx = audio();
  while (metro.next < ctx.currentTime + 0.12) {
    const accent = metro.beat === 0;
    tone(accent ? 1600 : 1000, 0.05, 'square', accent ? 0.12 : 0.07, metro.next);
    metro.queue.push({ t: metro.next, beat: metro.beat });
    metro.next += 60 / metro.bpm;
    metro.beat = (metro.beat + 1) % metro.beats;
  }
}
function frame() {
  if (!metro.running) return;
  const now = audio().currentTime;
  let last = null;
  while (metro.queue.length && metro.queue[0].t <= now) last = metro.queue.shift();
  if (last) drawBeats(last.beat);
  metro.raf = requestAnimationFrame(frame);
}
function startMetro() {
  const ctx = audio();
  metro.running = true; metro.beat = 0; metro.queue = [];
  metro.next = ctx.currentTime + 0.08;
  schedule();
  metro.timer = setInterval(schedule, 25);
  metro.raf = requestAnimationFrame(frame);
  $('#metro-toggle').textContent = 'Stop';
  $('#tabs [data-view=metronome]').classList.add('live');
}
function stopMetro() {
  metro.running = false;
  clearInterval(metro.timer);
  cancelAnimationFrame(metro.raf);
  metro.queue = [];
  drawBeats();
  $('#metro-toggle').textContent = 'Start';
  $('#tabs [data-view=metronome]').classList.remove('live');
}
$('#metro-toggle').addEventListener('click', () => (metro.running ? stopMetro() : startMetro()));
$('#bpm-range').addEventListener('input', e => setBpm(+e.target.value));
$('#bpm-minus').addEventListener('click', () => setBpm(metro.bpm - 1));
$('#bpm-plus').addEventListener('click', () => setBpm(metro.bpm + 1));
$('#metro-beats').addEventListener('change', e => {
  metro.beats = +e.target.value; metro.beat = 0; store.set('beats', metro.beats); drawBeats();
});
$('#bpm-tap').addEventListener('click', () => {
  const now = performance.now();
  if (metro.taps.length && now - metro.taps[metro.taps.length - 1] > 2000) metro.taps = [];
  metro.taps.push(now);
  metro.taps = metro.taps.slice(-5);
  if (metro.taps.length >= 2) {
    const gaps = metro.taps.slice(1).map((t, i) => t - metro.taps[i]);
    setBpm(60000 / (gaps.reduce((a, b) => a + b, 0) / gaps.length));
  }
});

/* ---------- PRACTICE ---------- */
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
function logMinutes(m) {
  if (m <= 0) return;
  const log = store.get('log', {});
  log[dayKey()] = (log[dayKey()] || 0) + m;
  store.set('log', log);
  renderPractice();
}
function renderPractice() {
  const log = store.get('log', {});
  const today = log[dayKey()] || 0;
  let streak = 0, i = today > 0 ? 0 : 1;
  while ((log[dayKey(dayAgo(i))] || 0) > 0) { streak++; i++; }
  const days = Array.from({ length: 7 }, (_, k) => dayAgo(6 - k));
  const mins = days.map(d => log[dayKey(d)] || 0);
  const max = Math.max(15, ...mins);
  $('#stat-streak').textContent = streak;
  $('#stat-today').textContent = today;
  $('#stat-week').textContent = mins.reduce((a, b) => a + b, 0);
  $('#week-bars').innerHTML = days.map((d, k) =>
    `<div class="wk"><div class="wbar"><i style="height:${Math.round(mins[k] / max * 100)}%"></i></div><small>${'SMTWTFS'[d.getDay()]}</small><small>${mins[k] || ''}</small></div>`).join('');
  const checked = store.get('routine:' + dayKey(), {});
  $('#routine').innerHTML = ROUTINE.map(r =>
    `<li><label><input type="checkbox" data-id="${r.id}"${checked[r.id] ? ' checked' : ''}><span><b>${esc(r.label)}</b> <em>${r.min} min</em><small>${esc(r.hint)}</small></span></label></li>`).join('');
}
$('#routine').addEventListener('change', e => {
  const cb = e.target.closest('input[type=checkbox]');
  if (!cb) return;
  const c = store.get('routine:' + dayKey(), {});
  c[cb.dataset.id] = cb.checked;
  store.set('routine:' + dayKey(), c);
});

const timer = { running: false, end: 0, len: 15, tick: null, started: 0 };
const fmt = s => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;
function timerDraw() {
  const left = Math.max(0, Math.ceil((timer.end - Date.now()) / 1000));
  $('#timer-display').textContent = fmt(left);
  if (left <= 0) timerStop(true);
}
function timerStop(finished) {
  clearInterval(timer.tick);
  const elapsedMin = finished ? timer.len : Math.round((Date.now() - timer.started) / 60000);
  timer.running = false;
  $('#timer-toggle').textContent = 'Start';
  $('#timer-len').disabled = false;
  $('#timer-display').textContent = fmt(timer.len * 60);
  $('#timer-msg').textContent = elapsedMin > 0 ? `Logged ${elapsedMin} min. Nice work!` : 'Stopping early logs the time you played.';
  logMinutes(elapsedMin);
  if (finished) { [0, 0.25, 0.5].forEach(t => tone(880, 0.2, 'sine', 0.25, audio().currentTime + t)); }
}
$('#timer-len').addEventListener('change', e => {
  timer.len = +e.target.value;
  if (!timer.running) $('#timer-display').textContent = fmt(timer.len * 60);
});
$('#timer-toggle').addEventListener('click', () => {
  if (timer.running) return timerStop(false);
  audio(); // unlock sound so the end chime can play
  timer.len = +$('#timer-len').value;
  timer.started = Date.now();
  timer.end = timer.started + timer.len * 60000;
  timer.running = true;
  $('#timer-toggle').textContent = 'Stop & log';
  $('#timer-len').disabled = true;
  $('#timer-msg').textContent = 'Keep playing. The chime tells you when time is up.';
  timerDraw();
  timer.tick = setInterval(timerDraw, 250);
});

/* ---------- FRETBOARD TRAINER ---------- */
const fb = { level: 'open', cur: null, right: 0, total: 0, locked: false };
function fretboardSVG(hl) {
  const x0 = 54, fw = 48, y0 = 22, sh = 24, frets = 12;
  const W = x0 + frets * fw + 12, H = y0 + 5 * sh + 36;
  let s = `<svg viewBox="0 0 ${W} ${H}" class="fretboard" role="img" aria-label="Guitar fretboard">`;
  [3, 5, 7, 9].forEach(f => s += `<circle cx="${x0 + (f - 0.5) * fw}" cy="${y0 + 2.5 * sh}" r="4" class="inlay"/>`);
  [-0.5, 0.5].forEach(o => s += `<circle cx="${x0 + 11.5 * fw}" cy="${y0 + (2.5 + o * 2) * sh}" r="4" class="inlay"/>`);
  for (let f = 0; f <= frets; f++) s += `<line x1="${x0 + f * fw}" y1="${y0}" x2="${x0 + f * fw}" y2="${y0 + 5 * sh}" class="${f === 0 ? 'nut' : 'fret'}"/>`;
  for (let r = 0; r < 6; r++) {
    const y = y0 + r * sh, i = 5 - r;
    s += `<line x1="${x0}" y1="${y}" x2="${x0 + frets * fw}" y2="${y}" class="str" style="stroke-width:${0.8 + i * 0.35}"/>`;
    s += `<text x="${x0 - 32}" y="${y + 4}" class="sname">${STRINGS[i].name}</text>`;
  }
  for (let f = 1; f <= frets; f++) s += `<text x="${x0 + (f - 0.5) * fw}" y="${y0 + 5 * sh + 22}" class="fnum">${f}</text>`;
  if (hl) {
    const x = hl.f === 0 ? x0 - 11 : x0 + (hl.f - 0.5) * fw, y = y0 + (5 - hl.s) * sh;
    s += `<circle cx="${x}" cy="${y}" r="9.5" class="hl"/>`;
    if (hl.label) s += `<text x="${x}" y="${y + 4}" class="hlt">${esc(hl.label)}</text>`;
  }
  return s + '</svg>';
}
function nextQuestion() {
  const maxFret = { open: 0, five: 5, twelve: 12 }[fb.level];
  let s, f;
  do { s = rand(6); f = rand(maxFret + 1); } while (fb.cur && fb.cur.s === s && fb.cur.f === f);
  fb.cur = { s, f, midi: STRINGS[s].midi + f };
  fb.locked = false;
  $('#fb-board').innerHTML = fretboardSVG({ s, f });
  // the board scrolls sideways on narrow screens: bring the highlighted spot into view
  const wrap = $('.fb-wrap'), dot = $('#fb-board .hl');
  if (dot) wrap.scrollLeft = Math.max(0, dot.getBoundingClientRect().left - wrap.getBoundingClientRect().left + wrap.scrollLeft - wrap.clientWidth / 2);
  $('#fb-q').textContent = `Which note is on the ${STRINGS[s].label}, ${f === 0 ? 'open' : 'fret ' + f}?`;
  $('#fb-feedback').textContent = ''; $('#fb-feedback').className = 'fb-feedback';
  $$('#fb-notes button').forEach(b => b.className = '');
}
function answer(name, btn) {
  if (fb.locked) return;
  fb.locked = true;
  const correct = noteName(fb.cur.midi), ok = name === correct;
  fb.total++; if (ok) fb.right++;
  btn.classList.add(ok ? 'right' : 'wrong');
  if (!ok) $$('#fb-notes button').find(b => b.textContent === correct).classList.add('right');
  $('#fb-board').innerHTML = fretboardSVG({ ...fb.cur, label: correct });
  $('#fb-feedback').textContent = ok ? 'Correct!' : `It's ${correct}`;
  $('#fb-feedback').className = 'fb-feedback ' + (ok ? 'good' : 'bad');
  $('#fb-score').textContent = `${fb.right} / ${fb.total} correct`;
  tone(midiToFreq(fb.cur.midi), 1.2, 'triangle', 0.25);
  setTimeout(nextQuestion, ok ? 1000 : 1800);
}
function initFretboard() {
  $('#fb-notes').innerHTML = NOTES.map(n => `<button>${n}</button>`).join('');
  $('#fb-notes').addEventListener('click', e => { if (e.target.matches('button')) answer(e.target.textContent, e.target); });
  $('#fb-level').addEventListener('click', e => {
    const b = e.target.closest('button[data-level]');
    if (!b) return;
    fb.level = b.dataset.level; fb.right = fb.total = 0; $('#fb-score').textContent = '';
    $$('#fb-level button').forEach(x => x.classList.toggle('on', x === b));
    nextQuestion();
  });
  // note map table
  let t = '<table class="map"><thead><tr><th></th>' + Array.from({ length: 13 }, (_, f) => `<th>${f}</th>`).join('') + '</tr></thead><tbody>';
  for (let i = 5; i >= 0; i--) {
    t += `<tr><th>${STRINGS[i].name}</th>` + Array.from({ length: 13 }, (_, f) => {
      const n = noteName(STRINGS[i].midi + f);
      return `<td class="${n.includes('#') ? 'sharp' : ''}">${n}</td>`;
    }).join('') + '</tr>';
  }
  $('#note-map').innerHTML = t + '</tbody></table>';
  nextQuestion();
}

/* ---------- router ---------- */
const VIEWS = ['learn', 'chords', 'songs', 'tuner', 'metronome', 'practice', 'fretboard'];
function route() {
  let hash = location.hash.slice(1);
  try { hash = decodeURIComponent(hash); } catch { /* malformed escape: use the raw hash */ }
  const [name, arg] = hash.split('/');
  const view = VIEWS.includes(name) ? name : 'learn';
  if (view !== 'tuner' && tuner.running) stopTuner();
  if (view !== 'tuner') stopRef();
  VIEWS.forEach(v => { $('#view-' + v).hidden = v !== view; });
  $$('#tabs a').forEach(a => a.classList.toggle('active', a.dataset.view === view));

  if (view === 'learn') {
    const id = parseInt(arg, 10);
    $('#learn-list').hidden = !!id; $('#learn-detail').hidden = !id;
    if (id) renderLesson(id); else { renderLearnList(); window.scrollTo(0, 0); }
  } else if (view === 'songs') {
    $('#songs-list').hidden = !!arg; $('#songs-detail').hidden = !arg;
    if (arg) renderSong(arg); else renderSongsList();
  } else if (view === 'chords') renderChords(arg);
  else if (view === 'practice') renderPractice();
  if (view !== 'chords' || !arg) if (view !== 'learn') window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);

/* ---------- boot ---------- */
setBpm(store.get('bpm', 80));
metro.beats = store.get('beats', 4);
$('#metro-beats').value = metro.beats;
drawBeats();
$('#timer-display').textContent = fmt(15 * 60);
initFretboard();
route();

// exposed for tests
window.__fretwise = { autoCorrelate, nearestString, STRINGS };
})();
