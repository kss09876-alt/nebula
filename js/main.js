// NEBULA — 메인: 성운 가운데에서 태어난 전시 행성계
import * as THREE from 'three';
import { loadData, imageUrl, esc } from './data.js?v=25';
import { hsound } from './home-sound.js?v=6';
import { tr, lang, langSwitcher } from './i18n.js?v=5';
import { IS_MOBILE } from './sensors.js?v=3';
import { initHomeInterface } from './home-interface.js?v=3';
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let calm = motionQuery.matches;
try { calm ||= localStorage.getItem('nebula-calm') === 'true'; } catch (e) {}
document.body.classList.toggle('calm', calm);
const M = {}; // 모바일 전용 기능 연결점 (home-mobile.js가 채움)

const canvas = document.getElementById('stage');
const card = document.getElementById('hover-card');
const wipe = document.getElementById('wipe');
const loader = document.getElementById('loader');
const labelsEl = document.getElementById('labels');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#05060b');
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);

scene.add(new THREE.AmbientLight('#8090b0', 0.35));
const sun = new THREE.PointLight('#fff4e0', 3.2, 0, 0); // 감쇠 없음
scene.add(sun);

const world = new THREE.Group();
scene.add(world);

const shortTitle = (t = '') => t.replace(/^\s*(?:(?:CELL|X|N)\s*-?\s*\d+\s*[·:|–-]\s*)+/i, '');
const code = (i) => 'N-' + String(i + 1).padStart(3, '0');

// ---------- 공통 텍스처 ----------
function canvasTex(w, h, draw) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function glow(color = '#ffffff', a = 0.9) {
  const c = new THREE.Color(color);
  const rgb = `${(c.r * 255) | 0},${(c.g * 255) | 0},${(c.b * 255) | 0}`;
  return canvasTex(256, 256, (g) => {
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, `rgba(${rgb},${a})`); grd.addColorStop(0.3, `rgba(${rgb},${a * 0.3})`); grd.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  });
}
function sprite(tex, scale, opacity = 1, rotation = 0) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity, rotation }));
  s.scale.set(scale[0], scale[1], 1);
  return s;
}
function shade(hex, l, a = 1) {
  const c = new THREE.Color(hex), hsl = {}; c.getHSL(hsl);
  return `hsla(${hsl.h * 360},${hsl.s * 100}%,${Math.max(0, Math.min(100, (hsl.l + l) * 100))}%,${a})`;
}
// 행성 표면 (등장방형 512x256)
function planetTexture(cell, kind) {
  const base = cell.color || '#7ee0d0';
  return canvasTex(512, 256, (g, w, h) => {
    let seed = [...(cell.id || 'x')].reduce((a, ch) => a + ch.charCodeAt(0), 0);
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    if (kind === 'rice') { // 빛쌀: 어둠 위에 흩어진 흰 쌀알
      g.fillStyle = '#16120d'; g.fillRect(0, 0, w, h);
      const gl = g.createLinearGradient(0, 0, 0, h); gl.addColorStop(0, 'rgba(255,246,228,.85)'); gl.addColorStop(0.45, 'rgba(255,246,228,.25)'); gl.addColorStop(1, 'rgba(20,16,12,0)');
      g.fillStyle = gl; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) { const x = rnd() * w, y = Math.pow(rnd(), 1.6) * h; g.save(); g.translate(x, y); g.rotate(rnd() * 6.28); g.fillStyle = `rgba(255,252,240,${0.5 + rnd() * 0.5})`; g.beginPath(); g.ellipse(0, 0, 3, 1.3, 0, 0, 6.283); g.fill(); g.restore(); }
      return;
    }
    if (kind === 'trio') { // 최초의 행성: 우주(푸른 어둠) · 빛(금빛 띠) · 소리(붉은 물결)
      const gl = g.createLinearGradient(0, 0, 0, h); gl.addColorStop(0, '#0c1236'); gl.addColorStop(0.45, '#1b2a66'); gl.addColorStop(0.55, '#3a3060'); gl.addColorStop(1, '#0a0e28'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(230,238,255,${0.3 + rnd() * 0.7})`; g.fillRect(rnd() * w, rnd() * h, 1, 1); }
      const gb = g.createLinearGradient(0, h * 0.38, 0, h * 0.52); gb.addColorStop(0, 'rgba(242,193,78,0)'); gb.addColorStop(0.5, 'rgba(242,193,78,.75)'); gb.addColorStop(1, 'rgba(242,193,78,0)'); g.fillStyle = gb; g.fillRect(0, h * 0.38, w, h * 0.14);
      g.strokeStyle = 'rgba(239,111,108,.55)'; g.lineWidth = 2;
      for (let k = 0; k < 4; k++) { g.beginPath(); for (let x = 0; x <= w; x += 4) g.lineTo(x, h * 0.66 + k * 9 + Math.sin(x / 26 + k) * 5); g.stroke(); }
      return;
    }
    if (kind === 'stars') {
      g.fillStyle = '#0a1030'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 6; i++) { const x = rnd() * w, y = rnd() * h, r = 40 + rnd() * 90; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `hsla(${220 + rnd() * 60},80%,60%,.45)`); gr.addColorStop(1, 'hsla(240,80%,40%,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
      for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(230,238,255,${0.3 + rnd() * 0.7})`; const s = rnd() < 0.05 ? 2 : 1; g.fillRect(rnd() * w, rnd() * h, s, s); }
      return;
    }
    // 가스 행성처럼 띠를 두른 표면
    for (let y = 0; y < h; y++) {
      const v = Math.sin(y * 0.09 + Math.sin(y * 0.021) * 3) * 0.08 + Math.sin(y * 0.33) * 0.03;
      g.fillStyle = shade(base, v - 0.05); g.fillRect(0, y, w, 1);
    }
    for (let i = 0; i < 40; i++) { // 소용돌이
      const x = rnd() * w, y = rnd() * h, rw = 20 + rnd() * 70, rh = 3 + rnd() * 8;
      g.fillStyle = shade(base, (rnd() - 0.5) * 0.25, 0.5);
      g.beginPath(); g.ellipse(x, y, rw, rh, 0, 0, 6.283); g.fill();
    }
    if (kind === 'ripple') {
      g.strokeStyle = 'rgba(255,230,225,.35)'; g.lineWidth = 2;
      for (let k = 1; k < 9; k++) { g.beginPath(); g.ellipse(w * 0.3, h * 0.5, k * 22, k * 11, 0, 0, 6.283); g.stroke(); }
    }
    if (kind === 'coming') { g.fillStyle = 'rgba(5,6,11,.55)'; g.fillRect(0, 0, w, h); }
  });
}

// ---------- 배경 별 ----------
(() => {
  const n = 2500, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 80 + Math.random() * 60, th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1);
    pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
    const c = new THREE.Color().setHSL(Math.random() < 0.2 ? 0.6 : 0.1, 0.4, 0.75 + Math.random() * 0.25);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.45, vertexColors: true, transparent: true, opacity: 0.9, map: glow('#ffffff', 1), depthWrite: false, blending: THREE.AdditiveBlending })));
})();

// ---------- 가운데 별과 성운 ----------
const core = new THREE.Group();
world.add(core);
core.add(new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 32), new THREE.MeshBasicMaterial({ color: '#fff6e6' })));
const coreGlow = sprite(glow('#e9c9a4', 1), [7, 7], 0.78);
core.add(coreGlow);
core.add(sprite(glow('#91b8be', 0.8), [13, 13], 0.22));
// 성운: 가운데 별을 감싼 색 구름 + 나선 팔의 먼지 (별·전시가 태어나는 곳)
const nebula = new THREE.Group(); world.add(nebula);
const puffTex = canvasTex(256, 256, (g, w, h) => {
  for (let k = 0; k < 14; k++) { const x = w * (0.3 + Math.random() * 0.4), y = h * (0.3 + Math.random() * 0.4), r = w * (0.12 + Math.random() * 0.22); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
});
const NEB_COL = ['#9db7d7', '#b99880', '#7d97af', '#d8c098', '#8b92b3', '#7ab4ad'];
const puffs = [];
for (let k = 0; k < 42; k++) {
  const arm = k % 2, u = (k / 42), ang = arm * Math.PI + u * 5.2 + (Math.random() - 0.5) * 0.6, r = 1.4 + u * 5.2 + Math.random() * 0.8;
  const m = new THREE.SpriteMaterial({ map: puffTex, color: NEB_COL[k % NEB_COL.length], transparent: true, opacity: 0.14 + Math.random() * 0.14, depthWrite: false, blending: THREE.AdditiveBlending, rotation: Math.random() * 6.28 });
  const sp = new THREE.Sprite(m); const sz = 2.2 + Math.random() * 3.2; sp.scale.set(sz, sz, 1);
  sp.position.set(Math.cos(ang) * r, (Math.random() - 0.5) * 0.9, Math.sin(ang) * r); sp.userData = { spin: (Math.random() - 0.5) * 0.15, base: m.opacity, ph: Math.random() * 6.28 };
  nebula.add(sp); puffs.push(sp);
}
{ // 나선 팔의 먼지
  const n = 2600, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const arm = i % 2, u = Math.pow(Math.random(), 0.7), ang = arm * Math.PI + u * 5.6 + (Math.random() - 0.5) * (0.5 + u * 0.6), r = 0.9 + u * 7 + (Math.random() - 0.5) * 0.8;
    pos.set([Math.cos(ang) * r, (Math.random() - 0.5) * (0.25 + u * 0.5), Math.sin(ang) * r], i * 3);
    const c = new THREE.Color(NEB_COL[Math.floor(Math.random() * NEB_COL.length)]).lerp(new THREE.Color('#ffffff'), 0.35 + Math.random() * 0.4); col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  nebula.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.07, vertexColors: true, map: glow('#ffffff', 1), transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending })));
}

// ---------- 행성 ----------
const planets = [];
const sphereGeo = new THREE.SphereGeometry(1, 64, 48);
const pickBodies = [];

function orbitTrail(radius, color) {
  const pts = [], colors = [], c = new THREE.Color(color);
  for (let i = 0; i < 32; i++) {
    const u = i / 31, a = -0.36 * (1 - u);
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    colors.push(c.r * u, c.g * u, c.b * u);
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const trail = new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  world.add(trail);
  return trail;
}

function orbitLine(r, color) {
  const pts = []; for (let i = 0; i <= 160; i++) { const a = (i / 160) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.16 }));
}
function ringMesh(inner, outer) {
  const geo = new THREE.RingGeometry(inner, outer, 128, 1);
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) { const d = Math.hypot(pos.getX(i), pos.getY(i)); uv.setXY(i, (d - inner) / (outer - inner), 0.5); }
  const tex = canvasTex(256, 4, (g, w) => {
    for (let x = 0; x < w; x++) { const k = x / w; const a = (0.25 + 0.5 * Math.abs(Math.sin(k * 22))) * Math.sin(k * Math.PI); g.fillStyle = `hsla(${30 + k * 300},90%,72%,${a})`; g.fillRect(x, 0, 1, 4); }
  });
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  m.rotation.x = -Math.PI / 2 + 0.35;
  return m;
}

function makePlanet(cell, i, total) {
  const open = cell.status === 'open';
  const fx = open ? cell.fx || '' : 'coming';
  const radius = fx === 'trio' ? 0.78 : open ? 0.55 + ((i * 37) % 5) * 0.06 : 0.38;
  const orbitR = 3.2 + i * 1.55;
  const group = new THREE.Group();
  const tex = planetTexture(cell, fx);
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0, transparent: !open, opacity: open ? 1 : 0.55 });
  if (fx === 'rice') { mat.emissiveMap = tex; mat.emissive = new THREE.Color('#fff4e0'); mat.emissiveIntensity = 0.35; }
  if (fx === 'trio') { mat.emissiveMap = tex; mat.emissive = new THREE.Color('#ffffff'); mat.emissiveIntensity = 0.45; }
  if (fx === 'stars') { mat.emissiveMap = tex; mat.emissive = new THREE.Color('#ffffff'); mat.emissiveIntensity = 0.55; }
  const body = new THREE.Mesh(sphereGeo, mat);
  body.scale.setScalar(radius);
  body.rotation.z = 0.3;
  group.add(body);
  const atmo = sprite(glow(cell.color || '#ffffff', 0.9), [radius * 3.4, radius * 3.4], open ? 0.45 : 0.15);
  group.add(atmo);
  const extra = {};
  extra.trail = orbitTrail(orbitR, cell.color || '#b8cdc4');
  if (fx === 'prism') { extra.ring = ringMesh(radius * 1.4, radius * 2.3); group.add(extra.ring); }
  if (fx === 'rice') {
    const n = 90, p = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) { const r = radius * (1.25 + Math.random() * 0.9), th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1); p.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], k * 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
    extra.dust = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.08, map: glow('#fff4e0', 1), color: '#fff4e0', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    group.add(extra.dust);
    const pts = []; for (let a = 0; a <= 96; a++) { const t = (a / 96) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t) * radius * 1.6, 0, Math.sin(t) * radius * 1.6)); }
    extra.redline = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#c8382f', transparent: true, opacity: 0.7 }));
    extra.redline.rotation.x = 0.35; group.add(extra.redline);
  }
  if (fx === 'stars') {
    const n = 120, p = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) { const r = radius * (1.3 + Math.random() * 0.8), th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1); p.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], k * 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
    extra.dust = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.09, map: glow('#dbe6ff', 1), color: '#dbe6ff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    group.add(extra.dust);
  }
  if (fx === 'ripple') {
    extra.waves = [0, 1, 2].map((k) => {
      const pts = []; for (let a = 0; a <= 64; a++) { const t = (a / 64) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t), 0, Math.sin(t))); }
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: cell.color, transparent: true, opacity: 0.5 }));
      l.userData.k = k; group.add(l); return l;
    });
  }
  if (fx === 'trio' && cell.rooms && !cell.single) { // 세 개의 방 = 세 개의 위성
    extra.moons = cell.rooms.map((r, k) => {
      const mm = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({ color: r.color || '#ffffff', emissive: new THREE.Color(r.color || '#ffffff'), emissiveIntensity: 0.55, roughness: 0.7 }));
      mm.scale.setScalar(radius * 0.22);
      const halo = sprite(glow(r.color || '#ffffff', 0.9), [radius * 1.1, radius * 1.1], 0.5);
      const mg = new THREE.Group(); mg.add(mm); mg.add(halo); group.add(mg);
      const pts = []; const rr = radius * (1.75 + k * 0.42);
      for (let a = 0; a <= 72; a++) { const t = (a / 72) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t) * rr, 0, Math.sin(t) * rr)); }
      const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: r.color, transparent: true, opacity: 0.22 }));
      ring.rotation.x = 0.25 + k * 0.18; ring.rotation.z = (k - 1) * 0.2; group.add(ring);
      return { mg, ring, rr, a: k * 2.1, sp: 0.9 - k * 0.22 };
    });
  }
  const orbit = orbitLine(orbitR, cell.color || '#ffffff');
  world.add(orbit); world.add(group);

  const planet = {
    cell, i, open, group, body, atmo, orbit, label: null, extra, radius, orbitR,
    angle: (i / total) * Math.PI * 2 + 0.6, speed: 0.22 / Math.pow(orbitR / 3, 1.3), spin: 0.25 + Math.random() * 0.2, hover: 0, intro: 0,
  };
  if (labelsEl) {
    const label = document.createElement('button');
    label.className = 'p-label' + (open ? '' : ' is-coming');
    label.style.setProperty('--accent', cell.color || '#7ee0d0');
    label.innerHTML = `<b>${code(i)}</b><span>${esc(open ? shortTitle(cell.title) : 'Coming soon')}</span>`;
    label.addEventListener('click', () => open && (M.onTap ? M.onTap(planet) : enter(planet)));
    label.addEventListener('pointerenter', () => { labelHover = planet; });
    label.addEventListener('pointerleave', () => { labelHover = null; });
    label.addEventListener('focus', () => { labelHover = planet; });
    label.addEventListener('blur', () => { labelHover = null; });
    label.disabled = !open;
    labelsEl.appendChild(label);
    planet.label = label;
  }
  body.userData.planet = planet;
  planets.push(planet);
  pickBodies.push(body);
  if (open && cell.thumbnail) {
    new THREE.TextureLoader().setCrossOrigin('anonymous').load(imageUrl(cell.thumbnail, 1024), (t) => { t.colorSpace = THREE.SRGBColorSpace; mat.map = t; mat.needsUpdate = true; });
  }
  return planet;
}

// ---------- 카메라 / 인터랙션 ----------
const state = { az: 0.6, tAz: 0.6, el: 0.42, tEl: 0.42, dist: 20, tDist: 20, baseDist: 20, dragging: false, moved: 0, hovered: null, entering: null, mx: 0, my: 0 };
let labelHover = null;
const ray = new THREE.Raycaster();
const ptr = new THREE.Vector2(-9, -9);

canvas.addEventListener('pointerdown', (e) => { state.dockFocus = null; state.dragging = true; state.moved = 0; state.px = e.clientX; state.py = e.clientY; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', (e) => {
  ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  state.mx = calm ? 0 : ptr.x; state.my = calm ? 0 : ptr.y;
  if (state.dragging) {
    const dx = e.clientX - state.px, dy = e.clientY - state.py;
    state.moved += Math.abs(dx) + Math.abs(dy);
    state.tAz += dx * 0.005; state.tEl = Math.max(0.08, Math.min(1.25, state.tEl + dy * 0.003));
    state.px = e.clientX; state.py = e.clientY;
  }
  positionCard(e.clientX, e.clientY);
});
canvas.addEventListener('pointerup', (e) => {
  state.dragging = false;
  if (state.moved < 6) {
    ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    const p = pick();
    if (M.onTap) { if (state.swiped) state.swiped = false; else M.onTap(p && p.open ? p : null); ptr.set(-9, -9); }
    else if (p && p.open) enter(p);
  } else if (M.onTap) { state.swiped = false; ptr.set(-9, -9); }
});
canvas.addEventListener('pointerleave', () => ptr.set(-9, -9));
canvas.addEventListener('pointercancel', () => { state.dragging = false; ptr.set(-9, -9); });
addEventListener('blur', () => { state.dragging = false; ptr.set(-9, -9); });
canvas.addEventListener('wheel', (e) => { state.tDist = Math.max(state.baseDist * 0.45, Math.min(state.baseDist * 1.6, state.tDist + e.deltaY * 0.02)); }, { passive: true });

function pick() {
  ray.setFromCamera(ptr, camera);
  const hits = ray.intersectObjects(pickBodies, false);
  return hits.length ? hits[0].object.userData.planet : null;
}
function positionCard(x, y) {
  const w = card.offsetWidth || 290, h = card.offsetHeight || 160;
  card.style.transform = `translate(${Math.max(12, Math.min(innerWidth - w - 12, x + 18))}px, ${Math.max(80, Math.min(innerHeight - h - 15, y + 18))}px)`;
}
const sv = new THREE.Vector3();
function setHover(p) {
  if (state.hovered === p) return;
  state.hovered = p;
  canvas.style.cursor = p && p.open ? 'pointer' : 'grab';
  planets.forEach((q) => q.label && q.label.classList.toggle('on', q === p));
  if (p) {
    p.group.getWorldPosition(sv); sv.project(camera);
    hsound.hover(p.i, p.open, p.open ? p.cell.fx || '' : 'coming', Math.max(-0.9, Math.min(0.9, sv.x)));
  } else hsound.unhover();
  if (p) {
    const c = p.cell;
    card.querySelector('.hc-no').textContent = code(p.i);
    card.querySelector('.hc-title').textContent = p.open ? shortTitle(c.title) : 'Coming soon';
    card.querySelector('.hc-sub').textContent = p.open ? c.subtitle || '' : tr('아직 빛나지 않은 행성');
    card.querySelector('.hc-meta').textContent = c.rooms && !c.single ? `ROOMS · ${c.rooms.map((r) => r.short).join(' · ')}` : [c.artist, c.period].filter(Boolean).join(' · ');
    card.style.setProperty('--accent', c.color || '#7ee0d0');
    const fromDock = state.uiHover || state.dockFocus;
    card.classList.toggle('on', !fromDock);
    if (!fromDock) { p.group.getWorldPosition(sv); sv.project(camera); positionCard((sv.x * 0.5 + 0.5) * innerWidth, (-sv.y * 0.5 + 0.5) * innerHeight); }
  } else card.classList.remove('on');
}
function enter(p) {
  if (state.entering) return;
  state.entering = { p, t: performance.now(), from: camera.position.clone() };
  card.classList.remove('on'); hsound.enter(p.i);
  document.body.classList.add('landing');
  const caption = document.getElementById('landing-caption');
  caption.querySelector('small').textContent = code(p.i);
  caption.querySelector('strong').textContent = shortTitle(p.cell.title);
  p.group.getWorldPosition(sv); sv.project(camera);
  const cx = (sv.x * 0.5 + 0.5) * 100, cy = (-sv.y * 0.5 + 0.5) * 100;
  wipe.style.clipPath = `circle(0% at ${cx}% ${cy}%)`;
  setTimeout(() => { wipe.style.clipPath = `circle(150% at ${cx}% ${cy}%)`; wipe.classList.add('on'); }, calm ? 20 : 850);
  setTimeout(() => { location.href = p.cell.url || `cell.html?id=${encodeURIComponent(p.cell.id)}`; }, calm ? 180 : 1550);
}

// ---------- 루프 ----------
const v = new THREE.Vector3(), target = new THREE.Vector3(), up = new THREE.Vector3();
let last = performance.now(), elapsed = 0, raf = 0, started = false;
function tick(now) {
  raf = 0;
  if (document.hidden) return;
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  elapsed += calm ? 0 : dt;
  const t = elapsed, motionDt = calm ? 0 : dt;
  if (!state.entering) setHover(state.mFocus || state.uiHover || labelHover || state.dockFocus || pick());
  if (!calm && M.frame) M.frame(dt);
  const slow = state.hovered || state.entering ? 0.15 : 1;
  if (!state.dragging && !state.entering && !state.dockFocus) state.tAz += motionDt * 0.015;

  core.rotation.y += motionDt * 0.1;
  const pulse = 1 + Math.sin(t * 1.4) * 0.04;
  coreGlow.scale.setScalar(7 * pulse);
  nebula.rotation.y += motionDt * 0.018 * (1 + (state.boost || 0) * 2); // 성운이 천천히 돎
  for (const sp of puffs) { sp.material.rotation += motionDt * sp.userData.spin; sp.material.opacity = sp.userData.base * (0.75 + 0.25 * Math.sin(t * 0.4 + sp.userData.ph)) * pulse; }

  planets.forEach((p) => {
    p.intro = calm ? 1.6 : Math.min(1.6, p.intro + dt * 0.8);
    const e = 1 - Math.pow(1 - Math.max(0, Math.min(1, p.intro * 1.4 - p.i * 0.12)), 3);
    p.angle += motionDt * p.speed * slow * (1 + (state.boost || 0)) * (state.sleep ? 0.08 : 1);
    const r = p.orbitR * (0.6 + 0.4 * e);
    p.group.position.set(Math.cos(p.angle) * r, Math.sin(p.angle * 2 + p.i) * 0.08, Math.sin(p.angle) * r);
    p.body.rotation.y += motionDt * p.spin;
    p.hover += ((state.hovered === p ? 1 : 0) - p.hover) * 0.12;
    p.body.scale.setScalar(p.radius * (0.2 + 0.8 * e) * (1 + p.hover * 0.25));
    p.atmo.material.opacity = ((p.open ? 0.4 : 0.12) + p.hover * 0.45 + Math.sin(t * 1.5 + p.i) * 0.05) * e;
    p.orbit.material.opacity = (0.18 + p.hover * 0.34) * e;
    p.extra.trail.rotation.y = -p.angle;
    p.extra.trail.material.opacity = (0.36 + p.hover * 0.45) * e;
    if (p.extra.ring) { p.extra.ring.rotation.z += motionDt * 0.15; p.extra.ring.material.opacity = (0.75 + p.hover * 0.25) * e; }
    if (p.extra.redline) { p.extra.redline.rotation.y += motionDt * 0.2; p.extra.redline.material.opacity = (0.45 + p.hover * 0.5) * e; }
    if (p.extra.moons) p.extra.moons.forEach((m) => { m.a += motionDt * m.sp * (1 + p.hover); target.set(Math.cos(m.a) * m.rr, 0, Math.sin(m.a) * m.rr).applyEuler(m.ring.rotation); m.mg.position.copy(target); m.ring.material.opacity = (0.18 + p.hover * 0.4) * e; });
    if (p.extra.dust) { p.extra.dust.rotation.y += motionDt * 0.4; p.extra.dust.material.size = 0.07 + Math.abs(Math.sin(t * 3)) * 0.05; }
    if (p.extra.waves) p.extra.waves.forEach((l) => { const ph = (t * 0.45 + l.userData.k / 3) % 1; l.scale.setScalar(p.radius * (1.1 + ph * 1.8)); l.material.opacity = (1 - ph) * 0.6 * e; });
  });

  // 카메라
  state.az += (state.tAz - state.az) * 0.06;
  state.el += (state.tEl - state.el) * 0.06;
  state.dist += (state.tDist - state.dist) * 0.06;
  if (state.entering && !calm) {
    const { p } = state.entering;
    const k = Math.min(1, (now - state.entering.t) / 1450), ease = 1 - Math.pow(1 - k, 3);
    p.group.getWorldPosition(target);
    up.set(0, p.radius * 0.8, 0);
    v.copy(target).normalize().multiplyScalar(-p.radius * 3.2).add(target).add(up); // X 쪽(빛이 드는 면)에서 다가감
    camera.position.lerpVectors(state.entering.from, v, ease);
    camera.lookAt(target);
  } else {
    camera.position.set(
      Math.cos(state.az) * Math.cos(state.el) * state.dist + state.mx * 0.6,
      Math.sin(state.el) * state.dist + state.my * 0.4,
      Math.sin(state.az) * Math.cos(state.el) * state.dist);
    camera.lookAt(0, 0, 0);
  }
  camera.updateMatrixWorld(true);

  // 라벨
  planets.forEach((p) => {
    if (!p.label) return;
    p.group.getWorldPosition(v); v.y += p.radius * 1.7; v.project(camera);
    const visible = v.z < 1 && Math.abs(v.x) < 0.95 && v.y > -0.75 && v.y < 0.82 && !state.entering;
    p.label.style.opacity = visible ? 1 : 0;
    p.label.style.visibility = visible ? 'visible' : 'hidden';
    p.label.style.transform = `translate(-50%,-100%) translate(${(v.x * 0.5 + 0.5) * innerWidth}px,${(-v.y * 0.5 + 0.5) * innerHeight}px)`;
  });

  hsound.update({ drag: Math.abs(state.tAz - state.az) + Math.abs(state.tEl - state.el), zoom: (state.dist - state.baseDist * 0.45) / (state.baseDist * 1.15), t, hovering: !!state.hovered, entering: !!state.entering });
  renderer.render(scene, camera);
  raf = requestAnimationFrame(tick);
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(raf); raf = 0; state.dragging = false; }
  else if (started && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
});

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  const maxR = planets.length ? planets[planets.length - 1].orbitR + 1.2 : 10;
  const fit = maxR / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  state.baseDist = camera.aspect >= 1 ? fit * 0.78 : fit / camera.aspect * 0.8; // 세로 화면: 바깥 행성까지 보이게
  state.tDist = state.dist = state.baseDist;
  camera.setViewOffset(innerWidth, innerHeight, innerWidth > 820 ? -innerWidth * 0.055 : 0, innerHeight * (innerWidth > 640 ? 0.055 : 0.10), innerWidth, innerHeight);
}
addEventListener('resize', resize);
addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });

// ---------- 패널 ----------
let panelTrigger = null;
let activePanel = null;
const panelBackground = document.querySelectorAll('.topbar, .hero-copy, .orbit-dock, .home-footer, #labels, #stage');
function closePanels(restore = true) {
  document.querySelectorAll('.panel').forEach((panel) => { panel.hidden = true; });
  ['btn-index', 'btn-about'].forEach((id) => document.getElementById(id).setAttribute('aria-expanded', 'false'));
  panelBackground.forEach((el) => { el.inert = false; });
  activePanel = null;
  if (restore && panelTrigger) panelTrigger.focus();
  panelTrigger = null;
}
function openPanel(btnId, panelId, trigger) {
  const btn = document.getElementById(btnId), panel = document.getElementById(panelId);
  const open = panel.hidden;
  closePanels(false);
  panel.hidden = !open; btn.setAttribute('aria-expanded', String(open)); hsound.ui(open);
  if (open) {
    panelTrigger = trigger || btn; activePanel = panel;
    panelBackground.forEach((el) => { el.inert = true; });
    panel.querySelector('.panel-inner').focus();
  }
}
function bindPanel(btnId, panelId) {
  const btn = document.getElementById(btnId), panel = document.getElementById(panelId);
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true');
  btn.addEventListener('click', () => openPanel(btnId, panelId, btn));
  panel.addEventListener('click', (e) => { if (e.target === panel || e.target.closest('.panel-close')) closePanels(); });
}
bindPanel('btn-index', 'index-panel');
bindPanel('btn-about', 'about-panel');
addEventListener('keydown', (e) => {
  if (!activePanel) return;
  if (e.key === 'Escape') { e.preventDefault(); closePanels(); return; }
  if (e.key !== 'Tab') return;
  const focusable = [...activePanel.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]')].filter((el) => el.getClientRects().length);
  const first = focusable[0], last = focusable.at(-1);
  if (!first) { e.preventDefault(); return; }
  if (e.shiftKey && (document.activeElement === first || !focusable.includes(document.activeElement))) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && (document.activeElement === last || !focusable.includes(document.activeElement))) { e.preventDefault(); first.focus(); }
});

// ---------- 자동 재생 / 입장 화면 ----------
function sndGate(kicker, title, onStart) {
  const g = document.createElement('div'); g.className = 'snd-gate'; g.setAttribute('role', 'dialog'); g.setAttribute('aria-label', tr('소리와 함께 입장'));
  g.innerHTML = `<div class="g-in"><p class="g-k">${kicker}</p><p class="g-t">${title}</p><button class="g-b"><i><b></b><b></b><b></b></i>${tr('입장하기')}</button><button class="g-s">${tr('소리 없이 보기')}</button><p class="g-n">${tr('헤드폰을 권장합니다')}</p></div>`;
  document.body.appendChild(g);
  const close = () => { g.classList.add('out'); setTimeout(() => g.remove(), 1000); };
  g.querySelector('.g-s').addEventListener('click', (e) => { e.stopPropagation(); onStart(false); close(); });
  g.addEventListener('click', () => { onStart(true); close(); });
  return close;
}

// ---------- 언어 ----------
langSwitcher(document.querySelector('.topbar nav'), { before: document.getElementById('btn-sound') });
if (lang !== 'ko') {
  document.title = tr('NEBULA 네뷸라 — 살아 있는 예술이 태어나는 우주');
  document.querySelector('.hero-copy .lede').innerHTML = `<strong>${tr('네뷸라')}</strong> — ${tr('살아 있는 예술이 태어나는 우주.')}<br />${tr('행성을 골라 착륙해 보세요.')}`;
  document.querySelector('.hint').textContent = tr('드래그해서 둘러보기 · 행성을 눌러 착륙');
  const ap = document.querySelectorAll('#about-panel p');
  if (ap[0]) ap[0].textContent = tr('NEBULA(네뷸라)는 별이 태어나는 성운처럼, 살아 있는 예술이 태어나는 온라인 공간입니다.');
  if (ap[1]) ap[1].textContent = tr(ap[1].textContent.trim());
  if (ap[2]) ap[2].textContent = tr(ap[2].textContent.trim());
}

// ---------- 사운드 ----------
const sndBtn = document.getElementById('btn-sound');
function sndUI() { sndBtn.classList.toggle('on', hsound.on); sndBtn.setAttribute('aria-pressed', String(hsound.on)); sndBtn.querySelector('span').textContent = hsound.on ? 'SOUND ON' : 'SOUND OFF'; }
sndBtn.addEventListener('click', () => { hsound.toggle(); setTimeout(sndUI, 30); });
const GEST = ['pointerdown', 'keydown', 'touchstart'];
const firstGesture = (e) => {
  if (e.target && e.target.closest && e.target.closest('#btn-sound, .snd-gate')) return;
  GEST.forEach((ev) => removeEventListener(ev, firstGesture));
  if (hsound.pref !== 'off' && !hsound.on) hsound.start().then(sndUI).catch(() => {});
  if (closeGate) { closeGate(); closeGate = null; }
};
GEST.forEach((ev) => addEventListener(ev, firstGesture, { passive: true }));
let closeGate = null;
function autoSound() {
  if (hsound.pref === 'off') return;
  hsound.tryAuto().then((ok) => {
    if (ok) { GEST.forEach((ev) => removeEventListener(ev, firstGesture)); sndUI(); return; }
    closeGate = sndGate('ONLINE INTERACTIVE EXHIBITION', 'NEBULA', (withSound) => {
      GEST.forEach((ev) => removeEventListener(ev, firstGesture));
      M.onGateEnter && M.onGateEnter();
      if (withSound) hsound.start().then(sndUI); else { hsound.stop(); sndUI(); }
    });
  });
}
document.querySelectorAll('.cell-list').forEach((l) => l.addEventListener('pointerover', (e) => { const li = e.target.closest('li'); if (li && li !== l._last) { l._last = li; hsound.tick(); } }));

// ---------- 시작 ----------
// Show the atmosphere immediately; live CMS and web fonts must not block first paint.
resize();
started = true;
raf = requestAnimationFrame(tick);
loader.classList.add('done');
document.body.classList.add('ready');
document.querySelector('.orbit-dock').setAttribute('aria-busy', 'true');
(async () => {
  const { cells, source } = await loadData();
  document.body.dataset.source = source;
  cells.forEach((c, i) => makePlanet(c, i, cells.length));
  initHomeInterface({ planets, state, enter, code, shortTitle, motionQuery, onExplore: (trigger) => openPanel('btn-index', 'index-panel', trigger), onMotion: (value) => { calm = value; if (calm) { state.mx = 0; state.my = 0; } } });
  document.getElementById('cell-list').innerHTML = cells.map((c, i) => `
    <li class="${c.status === 'open' ? '' : 'is-coming'}" style="--accent:${esc(c.color || '#7ee0d0')}">
      ${c.status === 'open' ? `<a href="${esc(c.url || 'cell.html?id=' + encodeURIComponent(c.id))}">` : '<div>'}
        <span class="no">${code(i)}</span>
        <span class="t">${esc(shortTitle(c.title) || 'Coming soon')}</span>
        <span class="m">${esc([c.artist, c.period].filter(Boolean).join(' · '))}</span>
      ${c.status === 'open' ? '</a>' : '</div>'}
      ${c.rooms && !c.single ? `<ol class="rooms">${c.rooms.map((r, k) => `<li style="--accent:${esc(r.color || '#fff')}"><a href="cell.html?id=${encodeURIComponent(c.id)}#room-${k + 1}"><span class="no">ROOM ${String(k + 1).padStart(2, '0')}</span><span class="t">${esc(r.short)}</span><span class="m">${esc(r.subtitle || '')}</span></a></li>`).join('')}</ol>` : ''}
    </li>`).join('');
  resize();
  last = performance.now();
  if (IS_MOBILE) { const { initHomeMobile } = await import('./home-mobile.js?v=5'); initHomeMobile(Object.assign(M, { state, planets, world, camera, THREE, enter, hsound, code, shortTitle, canvas })); }
  document.querySelector('.orbit-dock').setAttribute('aria-busy', 'false');
  document.body.dataset.loaded = 'true';
  autoSound();
})();
