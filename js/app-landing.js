// Landing keeps the existing astronaut/planet artwork, with a cancellable lifecycle.
export function createAppLanding({ planetBitmap, hasRing, name, translate: t, motionQuery, onFinished, onRetry }) {
  const element = document.querySelector('#landing'), canvas = document.querySelector('#land-cv');
  const ctx = canvas.getContext('2d');
  const code = document.querySelector('#land-code'), title = document.querySelector('#land-title');
  const state = document.querySelector('#land-state'), retry = document.querySelector('#land-retry');
  let raf = 0, timeout = 0, hideTimer = 0, generation = 0;
  let started = 0, progress = 0, loaded = false, loadedAt = 0, cell = null;
  let width = 0, height = 0, stars = [], active = true, pausedAt = 0, lastDraw = 0, percent = -1;
  const minimum = 900, finishDuration = 420, interval = 1000 / 30;

  function size() {
    const dpr = Math.min(1.5, devicePixelRatio || 1);
    width = innerWidth; height = innerHeight;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function astronaut(x, y, scale, angle) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, scale);
    ctx.fillStyle = '#e9ecf5'; ctx.strokeStyle = '#5a6280'; ctx.lineWidth = 3;
    const rect = (a, b, w, h, r) => { ctx.beginPath(); ctx.roundRect(a, b, w, h, r); ctx.fill(); ctx.stroke(); };
    rect(-34, -10, 68, 80, 20); rect(-58, 0, 26, 58, 13); rect(32, -20, 26, 58, 13);
    rect(-30, 62, 24, 46, 12); rect(6, 62, 24, 46, 12);
    ctx.fillStyle = '#d3d8e8'; ctx.beginPath(); ctx.roundRect(-30, 10, 60, 40, 10); ctx.fill();
    ctx.fillStyle = '#e9ecf5'; ctx.beginPath(); ctx.arc(0, -46, 40, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1c2240'; ctx.beginPath(); ctx.ellipse(0, -44, 28, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,214,140,.8)'; ctx.beginPath(); ctx.ellipse(-10, -52, 8, 5, -.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function surface(x, y, radius) {
    const bitmap = planetBitmap(cell), ratio = hasRing(cell) ? .30 : .38, size = radius / ratio;
    if (bitmap) { ctx.drawImage(bitmap, x - size / 2, y - size / 2, size, size); return; }
    const gradient = ctx.createRadialGradient(x - radius * .35, y - radius * .35, radius * .1, x, y, radius);
    gradient.addColorStop(0, cell.color || '#9db8ff'); gradient.addColorStop(1, '#0b0c18');
    ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  }
  function finish() {
    if (!cell || element.classList.contains('out')) return;
    cancelAnimationFrame(raf); raf = 0; clearTimeout(timeout); timeout = 0;
    state.textContent = t('착륙 완료'); element.classList.add('out');
    const token = generation;
    hideTimer = setTimeout(() => {
      if (token !== generation) return;
      hideTimer = 0; element.hidden = true; onFinished();
    }, motionQuery.matches ? 0 : 360);
  }
  function draw(now) {
    const calm = motionQuery.matches, elapsed = now - started;
    const target = loaded && elapsed > minimum ? Math.min(1, .82 + .18 * Math.min(1, (now - Math.max(loadedAt, started + minimum)) / finishDuration)) : Math.min(.82, elapsed / minimum * .82);
    progress += (target - progress) * .20;
    if (target === 1 && progress > .995) progress = 1;
    const eased = calm ? 0 : progress * progress * (3 - 2 * progress);
    ctx.fillStyle = '#05060c'; ctx.fillRect(0, 0, width, height);
    const cx = width / 2, cy = height * .4;
    for (const star of stars) {
      const k = 1 + eased * 1.6 * star.depth;
      ctx.fillStyle = `rgba(255,255,255,${.3 + .35 * star.depth / 2.3})`;
      ctx.fillRect(cx + (star.x - cx) * k, cy + (star.y - cy) * k, star.depth * .9, star.depth * .9);
    }
    const radius = Math.min(width, height) * .16 + eased * eased * Math.max(width, height) * 1.1;
    ctx.save(); ctx.globalAlpha = .22; ctx.fillStyle = cell.color || '#9db8ff'; ctx.beginPath(); ctx.arc(cx, cy, radius * 1.12, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    surface(cx, cy, radius);
    const waiting = !loaded && progress > .8 && !calm, orbit = waiting ? now / 1400 : 0;
    const ax = waiting ? cx + Math.cos(orbit) * radius * 1.35 : cx - width * .25 * (1 - eased);
    const ay = waiting ? cy + Math.sin(orbit) * radius * .5 : height * .78 - (height * .78 - cy) * eased;
    const scale = Math.min(width, height) / 600 * (waiting ? .35 : 1.1 * (1 - eased * .92));
    if (scale > .03) astronaut(ax, ay, scale, calm ? -.35 : -.35 + Math.sin(now / 600) * .08 + eased * .8);
    if (!calm && progress > .88) { ctx.fillStyle = `rgba(255,236,190,${(progress - .88) / .12})`; ctx.fillRect(0, 0, width, height); }
    element.classList.toggle('bright', !calm && progress > .93);
    const nextPercent = Math.round(progress * 100);
    if (nextPercent !== percent) { percent = nextPercent; state.textContent = calm ? t('착륙하는 중') : `${t('대기권 진입')} ${percent}%`; }
    if (loaded && (calm || progress >= 1)) finish();
  }
  function schedule() {
    if (active && !document.hidden && cell && !element.hidden && !element.classList.contains('out') && !motionQuery.matches && !raf) raf = requestAnimationFrame(frame);
  }
  function frame(now) {
    raf = 0;
    if (!active || document.hidden || !cell || element.hidden) return;
    if (now - lastDraw >= interval) { lastDraw = now; draw(now); }
    schedule();
  }
  function stop() {
    ++generation; cancelAnimationFrame(raf); clearTimeout(timeout); clearTimeout(hideTimer);
    raf = timeout = hideTimer = 0; cell = null; pausedAt = 0; element.hidden = true;
  }
  function setActive(value) {
    if (active === value) return;
    active = value;
    if (!active) { pausedAt = performance.now(); cancelAnimationFrame(raf); raf = 0; }
    else if (cell && !element.hidden) {
      if (pausedAt) { const pause = performance.now() - pausedAt; started += pause; if (loadedAt) loadedAt += pause; }
      pausedAt = 0; lastDraw = 0; draw(performance.now()); schedule();
    }
  }
  retry.addEventListener('click', onRetry);
  addEventListener('resize', () => { if (cell && !element.hidden && active && !document.hidden) { size(); draw(performance.now()); } }, { passive: true });
  motionQuery.addEventListener('change', () => { if (cell && !element.hidden && active && !document.hidden) { cancelAnimationFrame(raf); raf = 0; draw(performance.now()); schedule(); } });
  return {
    start(next) {
      stop(); cell = next; size(); stars = Array.from({ length: 120 }, () => ({ x: Math.random() * width, y: Math.random() * height, depth: Math.random() * 2 + .3 }));
      progress = 0; loaded = false; loadedAt = 0; started = performance.now(); percent = -1; lastDraw = 0;
      active = !document.hidden; pausedAt = active ? 0 : started;
      element.hidden = false; element.classList.remove('out', 'bright');
      code.textContent = next.code || ''; title.textContent = `${name(next)} — ${t('착륙하는 중')}`;
      retry.hidden = true; retry.textContent = t('다시 시도');
      const token = generation;
      timeout = setTimeout(() => { if (token === generation && !loaded) { retry.hidden = false; title.textContent = t('신호가 약해요. 연결을 확인해 주세요.'); } }, 12000);
      if (active) { draw(started); schedule(); }
    },
    loaded() {
      if (!cell || loaded) return;
      loaded = true; loadedAt = performance.now(); clearTimeout(timeout); timeout = 0; retry.hidden = true;
      if (active && !document.hidden && motionQuery.matches) draw(performance.now());
    },
    stop, setActive,
  };
}
