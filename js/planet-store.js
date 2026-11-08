// VALIX 행성 그림 보관소 — 한 번 만든 그림을 모든 크기에 재사용.
// 그림 생성 알고리즘은 planets.js에 두고, 워커/캐시/디코딩만 여기서 관리한다.
import { planetCanvas, planetType, hasRing } from './planets.js?v=4';

const VER = 'v5', SIZE = 768, WORKER_TIMEOUT = 20000;
const urls = new Map(), blobs = new Map(), bitmaps = new Map();
const pending = new Set(), failed = new Set(), listeners = new Set();
const queue = [], waits = new Map(), visibilityWaiters = new Set();
let busy = false, worker = null, workerOK = true, seq = 0, cachePromise;

export const planetKey = (c) => `${c.id}|${c.color || ''}|${planetType(c)}|${hasRing(c) ? 'ring' : 'plain'}`;
const cacheReq = (k) => new Request(new URL(`__planet/${VER}/${encodeURIComponent(k)}.png`, location.href).href);
const hidden = () => document.hidden;
const whenVisible = () => hidden() ? new Promise((resolve) => visibilityWaiters.add(resolve)) : Promise.resolve();
document.addEventListener('visibilitychange', () => {
  if (hidden()) return;
  visibilityWaiters.forEach((resolve) => resolve());
  visibilityWaiters.clear();
  pump();
});

// 이전 버전 그림은 삭제하지 않는다. 저장소가 막힌 기기에서도 한 번만 열기를 시도한다.
function getCache() {
  if (!cachePromise) {
    cachePromise = Promise.resolve().then(() => 'caches' in self ? caches.open('valix-planets') : null).catch(() => null);
  }
  return cachePromise;
}
async function fromCache(k) {
  try {
    const cache = await getCache();
    const response = cache && await cache.match(cacheReq(k));
    return response ? await response.blob() : null;
  } catch (e) { return null; }
}
async function toCache(k, blob) {
  try {
    const cache = await getCache();
    if (cache) await cache.put(cacheReq(k), new Response(blob, { headers: { 'Content-Type': 'image/png' } }));
  } catch (e) { /* 저장이 막혀도 현재 실행의 그림은 그대로 사용 */ }
}

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
/** 그림이 준비되면 알림: fn(key, url). 기존 호출자는 반환값을 무시해도 된다. */
export function onPlanet(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
/** drawImage에 쓸 ImageBitmap 또는 HTMLImageElement (준비 전/디코딩 실패는 null). */
export function planetBitmap(c) {
  const k = planetKey(c);
  if (bitmaps.has(k)) return bitmaps.get(k);
  if (blobs.has(k)) {
    // null도 기록해 프레임마다 새 디코딩을 시작하지 않는다.
    bitmaps.set(k, null);
    decode(k);
  } else request(c, true);
  return null;
}
async function decode(k) {
  try {
    await whenVisible();
    if (typeof createImageBitmap === 'function') {
      try {
        const bitmap = await createImageBitmap(blobs.get(k));
        bitmaps.set(k, bitmap);
        return;
      } catch (e) { /* 지원은 하지만 디코딩이 안 되는 기기도 img로 대체 */ }
    }
    await whenVisible();
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      const finish = (error) => {
        clearTimeout(timer);
        img.onload = img.onerror = null;
        error ? reject(error) : resolve(img);
      };
      const timer = setTimeout(() => finish(new Error('image timeout')), WORKER_TIMEOUT);
      img.onload = () => finish(null);
      img.onerror = () => finish(new Error('image decode'));
      img.src = urls.get(k);
    });
    bitmaps.set(k, image);
  } catch (e) { /* 영구 실패는 null로 유지. 렌더링/디코딩을 반복하지 않는다. */ }
}
/** 여러 행성을 미리 준비 (첫 번째가 가장 먼저) */
export function warm(list) { list.forEach((c) => c && request(c)); }

function request(c, front) {
  const k = planetKey(c);
  if (urls.has(k) || failed.has(k)) return;
  if (pending.has(k)) {
    if (front) {
      const i = queue.findIndex((q) => q.key === k);
      if (i > 0) queue.unshift(queue.splice(i, 1)[0]);
    }
    return;
  }
  // 호출자의 데이터가 나중에 바뀌어도 요청한 키와 그림은 일치한다.
  const job = { key: k, data: { id: c.id, color: c.color, fx: c.fx, planet: c.planet, title: c.title } };
  pending.add(k);
  front ? queue.unshift(job) : queue.push(job);
  pump();
}
async function pump() {
  // 워커에 한 요청만 보낸다. 숨겨진 동안 요청은 버리지 않고 보관한다.
  if (busy || hidden() || !queue.length) return;
  busy = true;
  const { key: k, data } = queue.shift();
  try {
    let blob = await fromCache(k);
    if (!blob) {
      await whenVisible();
      blob = await render(data);
      toCache(k, blob);
    }
    blobs.set(k, blob);
    // 현재 img가 주소를 소유하므로 실행 중에는 URL을 임의로 회수하지 않는다.
    const u = URL.createObjectURL(blob);
    urls.set(k, u);
    listeners.forEach((fn) => { try { fn(k, u); } catch (e) {} });
  } catch (e) {
    failed.add(k); // 같은 키의 영구 실패는 자리표시로 유지한다.
  } finally {
    pending.delete(k);
    busy = false;
    setTimeout(pump, 0);
  }
}

function stopWorker(error) {
  workerOK = false;
  if (worker) {
    worker.onmessage = worker.onerror = worker.onmessageerror = null;
    worker.terminate();
    worker = null;
  }
  waits.forEach((wait) => {
    clearTimeout(wait.timer);
    wait.reject(error);
  });
  waits.clear();
}
function render(c) {
  if (workerOK && typeof Worker !== 'undefined') {
    try {
      if (!worker) {
        worker = new Worker(new URL('./planet-worker.js?v=1', import.meta.url), { type: 'module' });
        worker.onmessage = ({ data }) => {
          const wait = waits.get(data.id);
          if (!wait) return;
          if (!data.blob) { stopWorker(new Error(data.error || 'worker blob')); return; }
          clearTimeout(wait.timer);
          waits.delete(data.id);
          wait.resolve(data.blob);
        };
        worker.onerror = worker.onmessageerror = () => stopWorker(new Error('worker'));
      }
      const id = ++seq;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => stopWorker(new Error('worker timeout')), WORKER_TIMEOUT);
        waits.set(id, { resolve, reject, timer });
        try { worker.postMessage({ id, c, size: SIZE }); }
        catch (e) { stopWorker(e); }
      }).catch(() => renderHere(c));
    } catch (e) { stopWorker(e); }
  }
  return renderHere(c);
}
// 워커를 못 쓰는 기기: 화면이 보이며 쉬는 틈에 그림. 예약 뒤 가려져도 기다린다.
function renderHere(c) {
  return new Promise((resolve, reject) => {
    const schedule = () => {
      if (hidden()) { whenVisible().then(schedule); return; }
      'requestIdleCallback' in self ? requestIdleCallback(go, { timeout: 1500 }) : setTimeout(go, 50);
    };
    const go = () => {
      if (hidden()) { whenVisible().then(schedule); return; }
      try {
        const canvas = planetCanvas(c, SIZE);
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('blob')), 'image/png');
      } catch (e) { reject(e); }
    };
    schedule();
  });
}
