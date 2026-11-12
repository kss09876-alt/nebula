// N-004 async · 류이치 사카모토 — 센서로 즐기는 소리 실험 4가지 (모두 Web Audio 실시간 합성, 원곡 음원 없음)
//  async   : 어긋난 박자 — 일곱 개의 추가 조금씩 다른 박자로 흔들리며 울림. 기울이면 더 어긋나고, 흔들면 다시 맞춰짐, 엎어두면 고요
//  rain    : 양동이를 쓰고 빗소리 듣기 — 기울이면 바람·빗줄기, 누르면 빗방울 음, 엎어두면(또는 버튼) 양동이 속 빗소리
//  forest  : 세계의 소리 360° — 다섯 개의 소리가 둘러쌈. 몸을 돌리면(나침반) 그쪽 소리가 커지고, 앞으로 기울이면 가까이
//  silence : 고요 — 폰을 엎어 두거나 버튼을 누르고 10초. 끝나면 한 음(라 A)과 문장
// 센서 값은 기기 안에서만 쓰고 저장·전송하지 않음
import { IS_MOBILE, sensor } from './sensors.js?v=3';
import { lang } from './i18n.js?v=5';

const W = {
  ko: { start: '눌러서 소리 켜기', drift: '어긋남', resync: '다시 맞추기', synced: '맞춤', quiet: '고요', mute: '추를 누르면 그 소리만 끄고 켤 수 있어요',
    wind: '바람', rain: '빗줄기', bucket: '양동이 쓰기', bucketOn: '양동이 속', bucketOff: '양동이 벗기', drops: '빗방울',
    facing: '지금 듣는 소리', turn: '끌어서 몸을 돌려 보세요', stream: '시냇물', birds: '새', windTrees: '바람과 나무', drip: '빙하가 녹는 물방울', piano: '멀리서 피아노',
    hold: '누르고 있는 동안 고요', holdMob: '폰을 엎어 두세요', left: '{n}초', done: '10초 동안 고요를 들었어요', again: '다시', early: '조금 일찍 깼어요. 다시 해 볼까요?',
    quote: 'Ars longa, vita brevis.', quoteT: '예술은 길고, 인생은 짧다' },
  en: { start: 'Tap to turn on sound', drift: 'Drift', resync: 'Resync', synced: 'Resynced', quiet: 'Silence', mute: 'Tap a pendulum to mute or unmute it',
    wind: 'Wind', rain: 'Rain', bucket: 'Wear the bucket', bucketOn: 'Inside the bucket', bucketOff: 'Take it off', drops: 'Drops',
    facing: 'Now hearing', turn: 'Drag to turn around', stream: 'Stream', birds: 'Birds', windTrees: 'Wind in the trees', drip: 'Melting glacier drops', piano: 'A distant piano',
    hold: 'Hold for silence', holdMob: 'Lay your phone face down', left: '{n}s', done: 'You listened to 10 seconds of silence', again: 'Again', early: 'You woke a little early. Try again?',
    quote: 'Ars longa, vita brevis.', quoteT: 'Art is long, life is short' },
  zh: { start: '点击开启声音', drift: '错位', resync: '重新对齐', synced: '对齐', quiet: '寂静', mute: '点击摆锤可单独开关它的声音',
    wind: '风', rain: '雨势', bucket: '戴上水桶', bucketOn: '水桶里', bucketOff: '摘下水桶', drops: '雨滴',
    facing: '正在听', turn: '拖动来转身', stream: '溪流', birds: '鸟', windTrees: '风与树', drip: '冰川融化的水滴', piano: '远处的钢琴',
    hold: '按住时进入寂静', holdMob: '把手机朝下放', left: '{n}秒', done: '你聆听了10秒的寂静', again: '再来一次', early: '醒得有点早，再试一次？',
    quote: 'Ars longa, vita brevis.', quoteT: '艺术长久，人生短暂' },
  ja: { start: 'タップして音をオン', drift: 'ずれ', resync: 'もう一度そろえる', synced: 'そろえた', quiet: '静寂', mute: '振り子を押すとその音だけ消したり戻したりできます',
    wind: '風', rain: '雨脚', bucket: 'バケツをかぶる', bucketOn: 'バケツの中', bucketOff: 'バケツを外す', drops: '雨粒',
    facing: 'いま聴いている音', turn: 'ドラッグして体を回す', stream: '小川', birds: '鳥', windTrees: '風と木々', drip: '氷河が溶ける雫', piano: '遠くのピアノ',
    hold: '押している間、静寂', holdMob: 'スマホを伏せてください', left: '{n}秒', done: '10秒間の静寂を聴きました', again: 'もう一度', early: '少し早く目覚めました。もう一度？',
    quote: 'Ars longa, vita brevis.', quoteT: '芸術は長く、人生は短い' },
};
const t = (k, o) => { let s = (W[lang] || W.ko)[k] || W.ko[k]; if (o) Object.entries(o).forEach(([a, b]) => { s = s.replace(`{${a}}`, b); }); return s; };

// ---------- 블록 HTML ----------
export function labRenderers({ esc, paras }) {
  const head = (b) => `<div class="q-head reveal">${b.title ? `<h2>${esc(b.title)}</h2>` : ''}${paras(b.body)}</div>`;
  const cap = (b) => (b.caption ? `<p class="caption q-cap">${esc(b.caption)}</p>` : '');
  return {
    async: (b) => `<section class="b-lab b-async">${head(b)}<div class="lab-stage sk-stage reveal"><canvas></canvas>
      <div class="q-hud"><span class="sk-a">${t('drift')} 0%</span><button class="sk-btn sk-resync">${t('resync')}</button></div>
      <button class="sk-start">${t('start')}</button><div class="q-tip">${t('mute')}</div></div>${cap(b)}</section>`,
    rain: (b) => `<section class="b-lab b-rain">${head(b)}<div class="lab-stage sk-stage reveal"><canvas></canvas>
      <div class="q-hud"><span class="sk-a">${t('wind')} 0 · ${t('rain')} 0%</span><button class="sk-btn sk-bucket">${t('bucket')}</button></div>
      <button class="sk-start">${t('start')}</button></div>${cap(b)}</section>`,
    forest: (b) => `<section class="b-lab b-forest">${head(b)}<div class="lab-stage sk-stage reveal"><canvas></canvas>
      <div class="q-hud"><span class="sk-a">${t('facing')} —</span><span class="sk-b"></span></div>
      <button class="sk-start">${t('start')}</button><div class="q-tip">${t('turn')}</div></div>${cap(b)}</section>`,
    silence: (b) => `<section class="b-lab b-silence">${head(b)}<div class="lab-stage sk-stage reveal"><canvas></canvas>
      <div class="sk-sil"><button class="sk-hold">${IS_MOBILE ? t('holdMob') : t('hold')}</button><p class="sk-msg"></p>
      <p class="sk-quote" hidden><b>${t('quote')}</b><span>${t('quoteT')}</span></p></div></div>${cap(b)}</section>`,
  };
}

// ---------- 공용 소리 ----------
let AC = null;
function ac() {
  if (!AC) {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    document.addEventListener('visibilitychange', () => { if (!document.hidden && AC.state !== 'running') AC.resume().catch(() => {}); });
  }
  if (AC.state !== 'running') AC.resume().catch(() => {});
  return AC;
}
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
let NOISE = null;
function noise() { const c = ac(); if (!NOISE) { NOISE = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const d = NOISE.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return NOISE; }
let BROWN = null;
function brown() { const c = ac(); if (!BROWN) { BROWN = c.createBuffer(1, c.sampleRate * 3, c.sampleRate); const d = BROWN.getChannelData(0); let l = 0; for (let i = 0; i < d.length; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.5; } } return BROWN; }
function loopSrc(buf, rate = 1) { const s = ac().createBufferSource(); s.buffer = buf; s.loop = true; s.playbackRate.value = rate; s.start(0, Math.random() * buf.duration); return s; }
function filt(type, f, q = 0.7) { const b = ac().createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }
function panner(v = 0) { const c = ac(); const p = c.createStereoPanner ? c.createStereoPanner() : c.createGain(); if (p.pan) p.pan.value = v; return p; }
// 피아노 비슷한 한 음 (어긋난 조율을 조금 섞음)
function pluck(dest, f, vel = 0.3, dur = 2.6, detune = 0) {
  const c = ac(), t0 = c.currentTime, out = c.createGain();
  out.gain.setValueAtTime(0, t0); out.gain.linearRampToValueAtTime(vel, t0 + 0.006); out.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
  const lp = filt('lowpass', 2600); out.connect(lp).connect(dest);
  [[1, 1, 'triangle'], [2.001, 0.3, 'sine'], [3.004, 0.1, 'sine'], [4.02, 0.04, 'sine']].forEach(([m, a, ty]) => { const o = c.createOscillator(), g = c.createGain(); o.type = ty; o.frequency.value = f * m * (1 + detune * (Math.random() - 0.5) * 0.01); g.gain.value = a; o.connect(g).connect(out); o.start(t0); o.stop(t0 + dur + 0.05); });
}
function bus(level = 1) { const c = ac(), g = c.createGain(); g.gain.value = 0; g.connect(c.destination); g._lv = level; return g; }
const fade = (g, v, s = 0.4) => { if (g) g.gain.setTargetAtTime(v, ac().currentTime, s); };

// 화면에 보일 때만 그리기·소리 (안 보이면 쉼)
function stage(sec, onFrame) {
  const cv = sec.querySelector('canvas'), g = cv.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2);
  const S = { cv, g, w: 0, h: 0, visible: false, on: false, mx: 0.5, my: 0.5 };
  const size = () => { S.w = cv.clientWidth; S.h = cv.clientHeight; cv.width = S.w * dpr; cv.height = S.h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener('resize', size);
  let last = 0;
  const loop = (now) => { if (!S.visible) return; const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now; try { onFrame(dt, now / 1000); } catch (e) {} requestAnimationFrame(loop); };
  new IntersectionObserver(([e]) => { S.visible = e.isIntersecting; if (S.visible) { last = 0; requestAnimationFrame(loop); } S.onVis && S.onVis(S.visible); }, { threshold: 0.15 }).observe(sec);
  const el = sec.querySelector('.lab-stage');
  el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); S.mx = (e.clientX - r.left) / r.width; S.my = (e.clientY - r.top) / r.height; });
  const startBtn = sec.querySelector('.sk-start');
  if (startBtn) startBtn.addEventListener('click', (e) => { e.stopPropagation(); ac(); S.on = true; startBtn.hidden = true; S.onStart && S.onStart(); if (IS_MOBILE) sensor.enable(); });
  return S;
}
const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#f2f1ec';
const mob = () => IS_MOBILE && sensor.on;
const inView = (sec) => { const r = sec.getBoundingClientRect(); return r.top < innerHeight * 0.7 && r.bottom > innerHeight * 0.3; };

// ---------- 1. async: 어긋난 박자 ----------
function setupAsync(sec) {
  const MIDI = [50, 57, 62, 65, 69, 72, 76], N = MIDI.length;
  const V = MIDI.map((m, i) => ({ f: mtof(m), ph: 0, mute: false, flash: 0, pan: (i / (N - 1)) * 1.6 - 0.8 }));
  let drift = 0.3, quiet = false, resyncs = 0, out = null;
  const hud = sec.querySelector('.sk-a'), tip = sec.querySelector('.q-tip');
  const S = stage(sec, frame);
  S.onStart = () => { out = bus(); fade(out, 0.9); };
  S.onVis = (v) => fade(out, v && !quiet ? 0.9 : 0, 0.3);
  const resync = () => { V.forEach((v) => { v.ph = 0; }); resyncs++; if (IS_MOBILE) sensor.vibrate([20, 40, 20]); hud.textContent = `${t('synced')} ${resyncs}`; };
  sec.querySelector('.sk-resync').addEventListener('click', (e) => { e.stopPropagation(); resync(); });
  const L = () => S.h * 0.62, ax = (i) => S.w * (0.16 + (0.68 * i) / (N - 1));
  sec.querySelector('.lab-stage').addEventListener('click', (e) => {
    if (!S.on) return; const r = e.currentTarget.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    V.forEach((v, i) => { const a = 0.5 * Math.sin(v.ph), bx = ax(i) + Math.sin(a) * L(), by = S.h * 0.14 + Math.cos(a) * L(); if (Math.hypot(x - bx, y - by) < 30) { v.mute = !v.mute; tip.classList.add('hide'); } });
  });
  if (IS_MOBILE) {
    sensor.onShake(() => { if (S.on && inView(sec)) resync(); });
    sensor.onFaceDown((down) => { if (!S.on || !inView(sec)) return; quiet = down; fade(out, down ? 0 : 0.9, down ? 0.6 : 0.3); if (!down) sensor.vibrate(15); });
  }
  function frame(dt) {
    const { g, w, h } = S;
    const target = mob() ? Math.min(1, Math.abs(sensor.tiltX) * 1.5) : S.mx;
    drift += (target - drift) * 0.04;
    g.fillStyle = 'rgba(8,8,10,.28)'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(242,241,236,.25)'; g.beginPath(); g.moveTo(w * 0.1, h * 0.14); g.lineTo(w * 0.9, h * 0.14); g.stroke();
    const col = accent();
    V.forEach((v, i) => {
      const T = 2.4 * (1 + drift * (i - 3) * 0.05), prev = Math.sin(v.ph);
      v.ph += (dt / T) * Math.PI * 2;
      const now = Math.sin(v.ph);
      if (S.on && !quiet && !v.mute && Math.sign(prev) !== Math.sign(now)) { pluck(panTo(v.pan), v.f, 0.18, 2.4, drift); v.flash = 1; }
      v.flash *= 0.92;
      const a = 0.5 * now, x0 = ax(i), y0 = h * 0.14, bx = x0 + Math.sin(a) * L(), by = y0 + Math.cos(a) * L();
      g.strokeStyle = v.mute ? 'rgba(242,241,236,.12)' : 'rgba(242,241,236,.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0); g.lineTo(bx, by); g.stroke();
      const r = 8 + v.flash * 10;
      if (!v.mute) { const gr = g.createRadialGradient(bx, by, 0, bx, by, r * 3); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.globalAlpha = 0.25 + v.flash * 0.6; g.fillStyle = gr; g.beginPath(); g.arc(bx, by, r * 3, 0, 6.283); g.fill(); g.globalAlpha = 1; }
      g.fillStyle = v.mute ? 'rgba(242,241,236,.2)' : '#f2f1ec'; g.beginPath(); g.arc(bx, by, r * 0.6, 0, 6.283); g.fill();
    });
    if (quiet) { g.fillStyle = 'rgba(242,241,236,.6)'; g.font = '14px Pretendard, sans-serif'; g.textAlign = 'center'; g.fillText(t('quiet'), w / 2, h * 0.92); }
    else if (resyncs === 0 || Math.random() < 0.02) hud.textContent = `${t('drift')} ${Math.round(drift * 100)}%`;
  }
  const pans = {}; function panTo(v) { if (!pans[v]) { const p = panner(v); p.connect(out); pans[v] = p; } return pans[v]; }
}

// ---------- 2. rain: 양동이를 쓰고 빗소리 듣기 ----------
function setupRain(sec) {
  const drops = [], ripples = [], hits = [];
  let wind = 0, intens = 0.45, bucket = false, out = null, rainG = null, rainLP = null, tickNormal = null, tickBucket = null;
  const hud = sec.querySelector('.sk-a'), btn = sec.querySelector('.sk-bucket');
  const S = stage(sec, frame);
  S.onStart = () => {
    out = bus(); fade(out, 0.9);
    const n = loopSrc(noise()); rainLP = filt('lowpass', 5200); rainG = ac().createGain(); rainG.gain.value = 0.12; n.connect(filt('highpass', 600)).connect(rainLP).connect(rainG).connect(out);
    tickNormal = ac().createGain(); tickNormal.gain.value = 0.5; tickNormal.connect(filt('highpass', 1800)).connect(out);
    tickBucket = ac().createGain(); tickBucket.gain.value = 0; // 양동이: 금속 울림 세 개
    const lp = filt('lowpass', 2600); lp.connect(out); [[430, 22, 0.9], [1040, 26, 0.5], [1810, 30, 0.3]].forEach(([f, q, a]) => { const b = filt('bandpass', f, q), gg = ac().createGain(); gg.gain.value = a * 6; tickBucket.connect(b).connect(gg).connect(lp); });
  };
  S.onVis = (v) => fade(out, v ? 0.9 : 0, 0.4);
  const setBucket = (on) => {
    bucket = on; btn.textContent = on ? t('bucketOff') : t('bucket'); btn.classList.toggle('on', on);
    if (!out) return; fade(tickBucket, on ? 1 : 0, 0.2); fade(tickNormal, on ? 0.05 : 0.5, 0.2); rainLP.frequency.setTargetAtTime(on ? 700 : 5200, ac().currentTime, 0.2); fade(rainG, on ? 0.2 : 0.12, 0.3);
    if (IS_MOBILE) sensor.vibrate(on ? [30, 30, 30] : 15);
  };
  btn.addEventListener('click', (e) => { e.stopPropagation(); if (!S.on) return; setBucket(!bucket); });
  if (IS_MOBILE) sensor.onFaceDown((down) => { if (S.on && inView(sec)) setBucket(down); });
  sec.querySelector('.lab-stage').addEventListener('pointerdown', (e) => {
    if (!S.on || e.target.closest('button')) return; const r = e.currentTarget.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    ripples.push({ x, y, r: 2, a: 1 }); const scale = [74, 76, 79, 81, 84, 86, 88]; pluck(out, mtof(scale[(Math.random() * scale.length) | 0]), 0.16, 2.2, 0.3); if (IS_MOBILE) sensor.vibrate(8);
  });
  function tick(gain) { const c = ac(), s = c.createBufferSource(), g = c.createGain(); s.buffer = noise(); s.playbackRate.value = 0.6 + Math.random() * 1.2; g.gain.setValueAtTime(gain, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0005, c.currentTime + 0.03); s.connect(g).connect(bucket ? tickBucket : tickNormal); s.start(c.currentTime, Math.random() * 1.5, 0.04); }
  function frame(dt) {
    const { g, w, h } = S;
    const tw = mob() ? sensor.tiltX : (S.mx - 0.5) * 2, ti = mob() ? Math.min(1, Math.max(0.1, 0.55 + sensor.tiltY * 0.6)) : Math.min(1, Math.max(0.1, S.my));
    wind += (tw - wind) * 0.05; intens += (ti - intens) * 0.05;
    if (rainG && !bucket) rainG.gain.setTargetAtTime(0.05 + intens * 0.22, ac().currentTime, 0.3);
    const n = Math.round(intens * 10); for (let k = 0; k < n; k++) drops.push({ x: Math.random() * (w + 200) - 100, y: -20, v: 9 + Math.random() * 7, l: 10 + Math.random() * 18 });
    if (S.on && S.visible) { const ticks = Math.round(intens * (bucket ? 4 : 6) * Math.random()); for (let k = 0; k < ticks; k++) tick(bucket ? 0.35 : 0.08 + Math.random() * 0.08); if (bucket && ticks) hits.push({ a: Math.random() * 6.283, life: 1 }); }
    g.fillStyle = bucket ? 'rgba(6,6,8,.5)' : 'rgba(8,9,12,.35)'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(190,210,230,.45)'; g.lineWidth = 1; g.beginPath();
    for (let i = drops.length - 1; i >= 0; i--) { const d = drops[i]; d.x += wind * 5; d.y += d.v; g.moveTo(d.x, d.y); g.lineTo(d.x - wind * d.l * 0.5, d.y - d.l); if (d.y > h) { drops.splice(i, 1); if (Math.random() < 0.15) ripples.push({ x: d.x, y: h - 6 - Math.random() * 30, r: 1, a: 0.5 }); } }
    g.stroke(); if (drops.length > 600) drops.splice(0, drops.length - 600);
    for (let i = ripples.length - 1; i >= 0; i--) { const r = ripples[i]; r.r += 1.6; r.a *= 0.95; g.strokeStyle = `rgba(220,235,245,${r.a})`; g.beginPath(); g.ellipse(r.x, r.y, r.r, r.r * 0.3, 0, 0, 6.283); g.stroke(); if (r.a < 0.03) ripples.splice(i, 1); }
    if (bucket) { // 양동이 속: 둥근 금속 테두리, 빗방울이 닿는 곳이 반짝임
      const R = Math.min(w, h) * 0.46; g.save(); g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.rect(0, 0, w, h); g.arc(w / 2, h / 2, R, 0, 6.283, true); g.fill('evenodd'); g.restore();
      g.strokeStyle = 'rgba(200,205,215,.6)'; g.lineWidth = 3; g.beginPath(); g.arc(w / 2, h / 2, R, 0, 6.283); g.stroke(); g.lineWidth = 1;
      for (let i = hits.length - 1; i >= 0; i--) { const q = hits[i]; q.life *= 0.9; const x = w / 2 + Math.cos(q.a) * R, y = h / 2 + Math.sin(q.a) * R; g.fillStyle = `rgba(255,250,235,${q.life})`; g.beginPath(); g.arc(x, y, 3 + (1 - q.life) * 10, 0, 6.283); g.fill(); if (q.life < 0.05) hits.splice(i, 1); }
    }
    if (Math.random() < 0.1) hud.textContent = `${t('wind')} ${wind > 0.05 ? '→' : wind < -0.05 ? '←' : '·'} · ${t('rain')} ${Math.round(intens * 100)}%${bucket ? ` · ${t('bucketOn')}` : ''}`;
  }
}

// ---------- 3. forest: 세계의 소리 360° ----------
function setupForest(sec) {
  const SRC = [['stream', 0], ['birds', 72], ['windTrees', 144], ['drip', 216], ['piano', 288]].map(([k, ang]) => ({ k, ang, g: null, p: null, act: 0, level: 0 }));
  let head = 0, target = null, base = null, near = 0.6, out = null, master = null, drag = null, timers = [];
  const hud = sec.querySelector('.sk-a'), hud2 = sec.querySelector('.sk-b'), tip = sec.querySelector('.q-tip');
  const S = stage(sec, frame);
  S.onStart = () => {
    out = bus(); master = filt('lowpass', 6000); master.connect(out); fade(out, 0.9);
    SRC.forEach((s) => { s.g = ac().createGain(); s.g.gain.value = 0; s.p = panner(0); s.g.connect(s.p).connect(master); });
    const by = (k) => SRC.find((s) => s.k === k);
    { const n = loopSrc(noise(), 0.9), a = filt('bandpass', 900, 0.6), b = filt('bandpass', 2600, 1.2), ga = ac().createGain(); ga.gain.value = 0.35; n.connect(a).connect(ga).connect(by('stream').g); n.connect(b).connect(ga); } // 시냇물
    { const n = loopSrc(brown(), 0.8), lp = filt('lowpass', 520), ga = ac().createGain(); ga.gain.value = 0.9; const lfo = ac().createOscillator(), lg = ac().createGain(); lfo.frequency.value = 0.09; lg.gain.value = 0.5; lfo.connect(lg).connect(ga.gain); lfo.start(); n.connect(lp).connect(ga).connect(by('windTrees').g); } // 바람과 나무
    const every = (fn, a, b) => { const go = () => { if (S.on && S.visible) fn(); timers.push(setTimeout(go, (a + Math.random() * (b - a)) * 1000)); }; go(); };
    every(() => { const s = by('birds'); s.act = 1; const c = ac(); let t0 = c.currentTime; for (let i = 0; i < 3 + (Math.random() * 4 | 0); i++) { const o = c.createOscillator(), g = c.createGain(), f = 2600 + Math.random() * 1600; o.frequency.setValueAtTime(f, t0); o.frequency.exponentialRampToValueAtTime(f * (1.3 + Math.random() * 0.4), t0 + 0.07); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.12, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.09); o.connect(g).connect(s.g); o.start(t0); o.stop(t0 + 0.1); t0 += 0.1 + Math.random() * 0.1; } }, 1.4, 4);
    every(() => { const s = by('drip'); s.act = 1; const c = ac(), t0 = c.currentTime, o = c.createOscillator(), g = c.createGain(), f = 1200 + Math.random() * 900; o.frequency.setValueAtTime(f, t0); o.frequency.exponentialRampToValueAtTime(f * 0.45, t0 + 0.08); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.25, t0 + 0.004); g.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.2); o.connect(g).connect(s.g); o.start(t0); o.stop(t0 + 0.22); }, 0.6, 2.2);
    every(() => { const s = by('piano'); s.act = 1; const m = [62, 65, 69, 72, 74, 77][(Math.random() * 6) | 0]; pluck(s.g, mtof(m), 0.3, 3.5, 0.6); }, 2.8, 6.5);
    if (IS_MOBILE && sensor.heading != null) base = sensor.heading;
  };
  S.onVis = (v) => fade(out, v ? 0.9 : 0, 0.5);
  const el = sec.querySelector('.lab-stage');
  el.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; drag = { x: e.clientX, h: head }; tip.classList.add('hide'); });
  addEventListener('pointerup', () => { drag = null; });
  el.addEventListener('pointermove', (e) => { if (drag) { head = drag.h - (e.clientX - drag.x) * 0.5; target = null; } });
  el.addEventListener('click', (e) => { // 소리 점을 누르면 그쪽으로 돌아봄
    if (!S.on) return; const r = el.getBoundingClientRect(), cx = r.width / 2, cy = r.height / 2, x = e.clientX - r.left - cx, y = e.clientY - r.top - cy;
    if (Math.hypot(x, y) < Math.min(r.width, r.height) * 0.25) return; const a = Math.atan2(x, -y) * 180 / Math.PI; target = head + a;
  });
  function frame(dt) {
    const { g, w, h } = S;
    if (mob() && sensor.heading != null) { if (base == null) base = sensor.heading; let d = (sensor.heading - base) - head; d = ((d + 540) % 360) - 180; head += d * 0.12; near += ((0.4 + Math.min(1, Math.max(0, -sensor.tiltY + 0.3))) - near) * 0.05; }
    else if (target != null) { let d = ((target - head + 540) % 360) - 180; head += d * 0.08; if (Math.abs(d) < 0.5) target = null; }
    if (master) master.frequency.setTargetAtTime(1200 + near * 7000, ac().currentTime, 0.3);
    g.fillStyle = 'rgba(7,10,9,.4)'; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.36, col = accent();
    // 듣는 방향(위쪽)으로 부채꼴
    const fg = g.createRadialGradient(cx, cy, 0, cx, cy, R * 1.2); fg.addColorStop(0, 'rgba(242,241,236,.12)'); fg.addColorStop(1, 'rgba(242,241,236,0)');
    g.fillStyle = fg; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R * 1.2, -Math.PI / 2 - 0.4, -Math.PI / 2 + 0.4); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(242,241,236,.15)'; g.beginPath(); g.arc(cx, cy, R, 0, 6.283); g.stroke();
    let best = null, bd = 999;
    SRC.forEach((s) => {
      const rel = ((s.ang - head) % 360 + 540) % 360 - 180, rad = rel * Math.PI / 180, face = (1 + Math.cos(rad)) / 2, lvl = 0.06 + 0.94 * Math.pow(face, 2.5);
      if (s.g) { s.g.gain.setTargetAtTime(lvl, ac().currentTime, 0.15); if (s.p.pan) s.p.pan.setTargetAtTime(Math.sin(rad) * 0.9, ac().currentTime, 0.15); }
      s.level = lvl; s.act *= 0.95; if (Math.abs(rel) < bd) { bd = Math.abs(rel); best = s; }
      const x = cx + Math.sin(rad) * R, y = cy - Math.cos(rad) * R;
      for (let k = 0; k < 3; k++) { const rr = ((performance.now() / 1000 * 18 + k * 14) % 42) * (0.4 + lvl) + s.act * 20; g.strokeStyle = `rgba(242,241,236,${(1 - rr / 60) * 0.35 * lvl})`; g.beginPath(); g.arc(x, y, rr, 0, 6.283); g.stroke(); }
      g.fillStyle = Math.abs(rel) < 25 ? col : 'rgba(242,241,236,.7)'; g.beginPath(); g.arc(x, y, 5 + lvl * 5, 0, 6.283); g.fill();
      g.fillStyle = `rgba(242,241,236,${0.35 + lvl * 0.6})`; g.font = '12px Pretendard, sans-serif'; g.textAlign = 'center'; g.fillText(t(s.k), x, y + 26);
    });
    g.fillStyle = '#f2f1ec'; g.beginPath(); g.arc(cx, cy, 6, 0, 6.283); g.fill(); g.strokeStyle = col; g.beginPath(); g.moveTo(cx, cy - 10); g.lineTo(cx, cy - 26); g.stroke();
    hud.textContent = `${t('facing')} · ${best && bd < 30 ? t(best.k) : '—'}`; hud2.textContent = `${Math.round(((head % 360) + 360) % 360)}°`;
  }
}

// ---------- 4. silence: 고요 10초 ----------
function setupSilence(sec) {
  const btn = sec.querySelector('.sk-hold'), msg = sec.querySelector('.sk-msg'), quote = sec.querySelector('.sk-quote');
  let holding = false, held = 0, done = false, motes = [];
  const S = stage(sec, frame);
  const start = () => { if (done) return; ac(); holding = true; msg.textContent = ''; btn.classList.add('on'); };
  const stop = () => { if (!holding) return; holding = false; btn.classList.remove('on'); if (!done && held > 0.5) msg.textContent = t('early'); held = 0; };
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); if (done) { done = false; held = 0; quote.hidden = true; btn.textContent = IS_MOBILE ? t('holdMob') : t('hold'); return; } start(); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, stop));
  addEventListener('keydown', (e) => { if (e.code === 'Space' && inView(sec) && !e.repeat) { e.preventDefault(); start(); } });
  addEventListener('keyup', (e) => { if (e.code === 'Space') stop(); });
  if (IS_MOBILE) { btn.addEventListener('click', () => sensor.enable()); sensor.onFaceDown((down) => { if (!inView(sec)) return; if (down) start(); else stop(); }); }
  function finish() {
    done = true; holding = false; btn.classList.remove('on'); btn.textContent = t('again'); msg.textContent = t('done'); quote.hidden = false;
    const c = ac(), o = c.createGain(); o.gain.value = 0.9; o.connect(c.destination); pluck(o, 440, 0.32, 7, 0); // 라(A) 한 음
    if (IS_MOBILE) sensor.vibrate([60, 120, 60]);
  }
  function frame(dt) {
    const { g, w, h } = S;
    if (holding) { held += dt; if (held >= 10) finish(); }
    g.fillStyle = 'rgba(5,5,6,.3)'; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.44, p = done ? 1 : held / 10;
    if (Math.random() < (holding ? 0.15 : 0.05)) motes.push({ x: cx + (Math.random() - 0.5) * w * 0.8, y: h + 10, v: 0.2 + Math.random() * 0.5, a: 0.5 });
    motes.forEach((m) => { m.y -= m.v * (holding ? 0.4 : 1); m.a *= 0.997; g.fillStyle = `rgba(242,241,236,${m.a * 0.4})`; g.fillRect(m.x, m.y, 1.5, 1.5); }); motes = motes.filter((m) => m.y > -10 && m.a > 0.05).slice(-300);
    g.strokeStyle = 'rgba(242,241,236,.12)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R, 0, 6.283); g.stroke();
    g.strokeStyle = accent(); g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + p * 6.283); g.stroke(); g.lineWidth = 1;
    if (holding && !done) { g.fillStyle = 'rgba(242,241,236,.5)'; g.font = '13px Pretendard, sans-serif'; g.textAlign = 'center'; g.fillText(t('left', { n: Math.ceil(10 - held) }), cx, cy + R + 28); }
  }
}

export function setupSakamotoLab() {
  document.querySelectorAll('.b-async').forEach(setupAsync);
  document.querySelectorAll('.b-rain').forEach(setupRain);
  document.querySelectorAll('.b-forest').forEach(setupForest);
  document.querySelectorAll('.b-silence').forEach(setupSilence);
}
