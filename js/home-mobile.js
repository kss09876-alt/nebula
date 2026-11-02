// XPACE 홈 — 모바일 전용 경험
// 나침반: 폰을 돌리면 행성계 전체가 나침반처럼 돌고, 가운데 X 둘레에 방위 고리가 생깁니다.
// 기울이기: 행성계가 따라 기울어짐 · 흔들기: 별빛이 흩어지고 행성이 빨라짐(+소리·진동)
// 스와이프: 좌우로 밀어 행성 넘기기 · 탭: 행성 소개 → 한 번 더 탭(또는 착륙 버튼)으로 착륙
import { sensor } from './sensors.js?v=1';
import { tr } from './i18n.js?v=2';

export function initHomeMobile(api) {
  const { state, planets, world, camera, THREE, enter, hsound, code, shortTitle, canvas } = api;
  document.body.classList.add('is-mobile');

  // ---- 하단 시트 (행성 소개) ----
  const sheet = document.createElement('div'); sheet.className = 'm-sheet'; sheet.hidden = true;
  sheet.innerHTML = `<button class="ms-nav prev" aria-label="prev">‹</button>
    <div class="ms-body"><span class="ms-no"></span><strong class="ms-title"></strong><span class="ms-sub"></span><span class="ms-meta"></span></div>
    <button class="ms-nav next" aria-label="next">›</button>
    <button class="ms-go">${tr('착륙하기')}</button>`;
  document.body.appendChild(sheet);
  const hint = document.createElement('div'); hint.className = 'm-hint';
  hint.innerHTML = `<span>${tr('좌우로 밀어 행성 넘기기 · 폰을 기울이거나 흔들어 보세요')}</span><button class="m-sense">${tr('기울이기·흔들기 켜기')}</button>`;
  document.body.appendChild(hint);
  const senseBtn = hint.querySelector('.m-sense');

  const open = () => planets.filter((p) => p.open);
  function focus(p, dir = 0) {
    if (!p) { state.mFocus = null; sheet.hidden = true; return; }
    state.mFocus = p;
    const c = p.cell;
    sheet.querySelector('.ms-no').textContent = code(p.i);
    sheet.querySelector('.ms-title').textContent = shortTitle(c.title);
    sheet.querySelector('.ms-sub').textContent = c.subtitle || '';
    sheet.querySelector('.ms-meta').textContent = c.rooms ? `ROOMS · ${c.rooms.map((r) => r.short).join(' · ')}` : [c.artist, c.period].filter(Boolean).join(' · ');
    sheet.style.setProperty('--accent', c.color || '#7ee0d0');
    sheet.hidden = false; sheet.classList.remove('in-l', 'in-r'); void sheet.offsetWidth; sheet.classList.add(dir < 0 ? 'in-l' : 'in-r');
    // 고른 행성이 정면에 오도록 카메라를 천천히 돌림
    p.group.getWorldPosition(tmp);
    const a = Math.atan2(tmp.z, tmp.x);
    let d = a - state.tAz; d = Math.atan2(Math.sin(d), Math.cos(d)); state.tAz += d;
    sensor.vibrate(12);
  }
  const tmp = new THREE.Vector3();
  function step(dir) {
    const list = open(); if (!list.length) return;
    const i = Math.max(0, list.indexOf(state.mFocus));
    focus(list[(i + dir + list.length) % list.length], dir);
  }
  sheet.querySelector('.prev').addEventListener('click', () => step(-1));
  sheet.querySelector('.next').addEventListener('click', () => step(1));
  sheet.querySelector('.ms-go').addEventListener('click', () => { if (state.mFocus) { sensor.vibrate([20, 40, 30]); enter(state.mFocus); } });

  // 탭: 처음엔 소개, 같은 행성을 한 번 더 누르면 착륙 (main.js의 pointerup에서 호출)
  api.onTap = (p) => {
    if (!p) { focus(null); return; }
    if (state.mFocus === p) { sensor.vibrate([20, 40, 30]); enter(p); } else focus(p);
  };
  // 빠르게 좌우로 밀기 = 행성 넘기기
  let sx = 0, sy = 0, st = 0;
  canvas.addEventListener('touchstart', (e) => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = performance.now(); }, { passive: true });
  canvas.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (performance.now() - st < 350 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { state.swiped = true; step(dx < 0 ? 1 : -1); }
  }, { passive: true });

  // ---- 센서 켜기: iPhone은 탭 안에서만 권한을 물을 수 있음 ----
  const enableSensors = async () => {
    const ok = await sensor.enable();
    hint.classList.toggle('sensing', ok);
    if (ok) senseBtn.remove();
  };
  senseBtn.addEventListener('click', (e) => { e.stopPropagation(); enableSensors(); });
  addEventListener('click', function once() { removeEventListener('click', once, true); enableSensors(); }, true);
  api.onGateEnter = enableSensors;

  // ---- 나침반 고리 ----
  const ring = document.createElement('div'); ring.className = 'm-compass'; ring.hidden = true;
  ring.innerHTML = `<div class="mc-rot">${['N', 'E', 'S', 'W'].map((d, k) => `<b style="--k:${k}">${d}</b>`).join('')}${Array.from({ length: 36 }, (_, k) => `<i style="--k:${k}"></i>`).join('')}</div><span class="mc-deg"></span>`;
  document.body.appendChild(ring);
  const rot = ring.querySelector('.mc-rot'), deg = ring.querySelector('.mc-deg');
  let worldYaw = 0;
  const o = new THREE.Vector3();

  // 흔들기
  sensor.onShake((v) => {
    state.boost = Math.min(8, (state.boost || 0) + 4 + v * 6);
    sensor.vibrate([30, 30, 50]);
    hsound.shake && hsound.shake(v);
    document.body.classList.remove('shaken'); void document.body.offsetWidth; document.body.classList.add('shaken');
  });

  // 매 프레임 (main.js tick에서 호출)
  api.frame = (dt) => {
    if (sensor.on) {
      state.mx = sensor.tiltX * 1.6; state.my = -sensor.tiltY * 1.1;
      state.tEl = Math.max(0.12, Math.min(1.2, 0.42 - sensor.tiltY * 0.35));
    }
    state.boost = (state.boost || 0) * Math.pow(0.25, dt);
    if (sensor.heading != null) {
      ring.hidden = false;
      const target = -sensor.heading * Math.PI / 180;
      let d = target - worldYaw; d = Math.atan2(Math.sin(d), Math.cos(d)); worldYaw += d * 0.08;
      world.rotation.y = worldYaw;
      o.set(0, 0, 0).project(camera);
      ring.style.left = (o.x * 0.5 + 0.5) * innerWidth + 'px'; ring.style.top = (-o.y * 0.5 + 0.5) * innerHeight + 'px';
      rot.style.transform = `rotate(${-sensor.heading}deg)`;
      deg.textContent = Math.round(sensor.heading) + '°';
    }
  };
}
