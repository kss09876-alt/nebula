// VALIX 행성 그림 보관소 — 행성 그림을 '한 번만, 화면을 멈추지 않고' 만들고 기기에 저장해 다시 씀
// 1) 처음엔 가벼운 자리표시 그림(SVG)을 바로 보여주고
// 2) 워커(OffscreenCanvas)에서 768px 한 장을 그려 PNG로 받은 뒤 (지원 안 되면 쉬는 틈에 화면에서 그림)
// 3) Cache Storage에 저장 → 다음 실행부터는 즉시 표시. 모든 크기에 같은 그림을 씀.
import { planetCanvas, planetType, hasRing } from './planets.js?v=4';

const VER = 'v4', SIZE = 768;
const urls = new Map(), blobs = new Map(), bitmaps = new Map(), pending = new Set(), listeners = [];
const queue = [];
let busy = false, worker = null, workerOK = true, seq = 0;
const waits = new Map();

export const planetKey = (c) => `${c.id}|${c.color || ''}|${planetType(c)}`;
const cacheReq = (k) => new Request(new URL(`__planet/${VER}/${encodeURIComponent(k)}.png`, location.href).href);

// 진짜 그림과 같은 크기 비율의 자리표시 (색만 맞춘 구)
const ph = new Map();
export function placeholder(c) {
  const k = planetKey(c); if (ph.has(k)) return ph.get(k);
  const col = c.color || '#9db8ff', r = hasRing(c) ? 30 : 38;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><radialGradient id='g' cx='.36' cy='.33' r='.8'><stop offset='0' stop-color='#fff' stop-opacity='.55'/><stop offset='.25' stop-color='${col}'/><stop offset='1' stop-color='#05060c'/></radialGradient><radialGradient id='a' r='.5'><stop offset='.7' stop-color='${col}' stop-opacity='.35'/><stop offset='1' stop-color='${col}' stop-opacity='0'/></radialGradient></defs><circle cx='50' cy='50' r='${r * 1.4}' fill='url(#a)'/><circle cx='50' cy='50' r='${r}' fill='url(#g)'/></svg>`;
  const u = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); ph.set(k, u); return u;
}

/** 지금 쓸 수 있는 그림 주소 (없으면 자리표시를 주고 뒤에서 만들기 시작) */
export function planetSrc(c) {
  const k = planetKey(c);
  if (urls.has(k)) return urls.get(k);
  request(c); return placeholder(c);
}
/** 그림이 준비되면 알림: fn(key, url) */
export function onPlanet(fn) { listeners.push(fn); }
/** 캔버스에 그릴 비트맵 (준비 안 됐으면 null, 대신 만들기 시작) */
export function planetBitmap(c) {
  const k = planetKey(c);
  if (bitmaps.has(k)) return bitmaps.get(k);
  if (blobs.has(k) && typeof createImageBitmap === 'function') { bitmaps.set(k, null); createImageBitmap(blobs.get(k)).then((b) => bitmaps.set(k, b)).catch(() => {}); return null; }
  request(c, true); return null;
}
/** 여러 행성을 미리 준비 (첫 번째가 가장 먼저) */
export function warm(list) { list.forEach((c) => c && request(c)); }

function request(c, front) {
  const k = planetKey(c); if (urls.has(k) || pending.has(k)) { if (front) { const i = queue.findIndex((q) => planetKey(q) === k); if (i > 0) queue.unshift(queue.splice(i, 1)[0]); } return; }
  pending.add(k); front ? queue.unshift(c) : queue.push(c); pump();
}
async function pump() {
  if (busy || !queue.length) return; busy = true;
  const c = queue.shift(), k = planetKey(c);
  try {
    let blob = await fromCache(k);
    if (!blob) { blob = await render(c); toCache(k, blob); }
    blobs.set(k, blob);
    const u = URL.createObjectURL(blob); urls.set(k, u);
    listeners.forEach((f) => { try { f(k, u); } catch (e) {} });
  } catch (e) { /* 실패하면 자리표시 그대로 */ }
  pending.delete(k); busy = false;
  setTimeout(pump, 0);
}
async function fromCache(k) { try { if (!('caches' in self)) return null; const r = await (await caches.open('valix-planets')).match(cacheReq(k)); return r ? await r.blob() : null; } catch (e) { return null; } }
async function toCache(k, blob) { try { if ('caches' in self) await (await caches.open('valix-planets')).put(cacheReq(k), new Response(blob, { headers: { 'Content-Type': 'image/png' } })); } catch (e) {} }

function render(c) {
  const data = { id: c.id, color: c.color, fx: c.fx, planet: c.planet, title: c.title };
  if (workerOK && typeof Worker !== 'undefined') {
    try {
      if (!worker) { worker = new Worker(new URL('./planet-worker.js?v=1', import.meta.url), { type: 'module' }); worker.onmessage = (e) => { const w = waits.get(e.data.id); if (w) { waits.delete(e.data.id); e.data.blob ? w.ok(e.data.blob) : w.no(e.data.error); } }; worker.onerror = () => { workerOK = false; waits.forEach((w) => w.no('worker')); waits.clear(); }; }
      const id = ++seq;
      return new Promise((ok, no) => { waits.set(id, { ok, no }); worker.postMessage({ id, c: data, size: SIZE }); setTimeout(() => { if (waits.has(id)) { waits.delete(id); no('timeout'); } }, 20000); })
        .catch(() => { workerOK = false; return renderHere(data); });
    } catch (e) { workerOK = false; }
  }
  return renderHere(data);
}
// 워커를 못 쓰는 기기: 화면이 쉬는 틈에 그림
function renderHere(c) {
  return new Promise((ok, no) => {
    const go = () => { try { const cv = planetCanvas(c, SIZE); cv.toBlob((b) => (b ? ok(b) : no('blob')), 'image/png'); } catch (e) { no(e); } };
    'requestIdleCallback' in self ? requestIdleCallback(go, { timeout: 1500 }) : setTimeout(go, 50);
  });
}
