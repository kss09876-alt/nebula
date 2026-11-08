// Decorative sky: capped density / 30 fps, static under reduced motion.
export function createAppSky({ sensor, motionQuery, getTilt }) {
  const canvas = document.createElement('canvas');
  canvas.id = 'sky'; canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, diagonal = 0, stars = [], meteor = null;
  let raf = 0, resizeRaf = 0, enabled = false, previous = 0, lastDraw = 0;
  let scrollPosition = 0, heading = 0, elapsed = 0;
  const interval = 1000 / 30;

  function size() {
    const dpr = Math.min(1.5, devicePixelRatio || 1);
    width = innerWidth; height = innerHeight; diagonal = Math.hypot(width, height);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(650, Math.max(80, Math.round(diagonal * diagonal / 3200)));
    stars = Array.from({ length: count }, () => ({
      x: width / 2 + (Math.random() - .5) * diagonal,
      y: height / 2 + (Math.random() - .5) * diagonal,
      depth: Math.random() ** 2, phase: Math.random() * Math.PI * 2,
      color: Math.random() < .15 ? '255,226,180' : Math.random() < .3 ? '190,205,255' : '255,255,255',
    }));
    if (enabled && !document.hidden) { draw(0); schedule(); }
  }
  function draw(dt) {
    const calm = motionQuery.matches;
    if (!calm) elapsed += dt;
    const tilt = calm ? { x: 0, y: 0 } : getTilt();
    const sy = calm ? 0 : scrollY * .15, dy = sy - scrollPosition;
    scrollPosition = sy;
    if (!calm && sensor.on && sensor.heading != null) {
      const diff = Math.atan2(Math.sin(sensor.heading * Math.PI / 180 - heading), Math.cos(sensor.heading * Math.PI / 180 - heading));
      heading += diff * .08;
    }
    const angle = calm ? 0 : -heading, ch = Math.cos(angle), sh = Math.sin(angle);
    const cx = width / 2, cy = height / 2, left = cx - diagonal / 2, top = cy - diagonal / 2;
    ctx.clearRect(0, 0, width, height);
    for (const s of stars) {
      if (!calm) { s.x -= (.004 + s.depth * .02) * dt; s.y -= dy * (.3 + s.depth); }
      if (s.x < left) s.x += diagonal;
      if (s.y < top) s.y += diagonal;
      if (s.y > top + diagonal) s.y -= diagonal;
      const twinkle = calm ? .72 : .45 + .55 * Math.sin(elapsed / (900 + s.depth * 600) + s.phase);
      ctx.fillStyle = `rgba(${s.color},${(.15 + s.depth * .75) * twinkle})`;
      const dx = s.x - cx, dy2 = s.y - cy, r = .4 + s.depth * 1.3;
      ctx.fillRect(cx + dx * ch - dy2 * sh - tilt.x * (4 + s.depth * 26), cy + dx * sh + dy2 * ch - tilt.y * (4 + s.depth * 22), r, r);
    }
    if (!calm && !meteor && Math.random() < dt / 7000) meteor = { x: width * (.3 + Math.random() * .7), y: Math.random() * height * .4, time: 0 };
    if (!calm && meteor) {
      meteor.time += dt;
      const k = meteor.time / 900, x = meteor.x - k * 260, y = meteor.y + k * 130;
      const gradient = ctx.createLinearGradient(x, y, x + 90, y - 45);
      gradient.addColorStop(0, `rgba(255,255,255,${Math.max(0, .9 * (1 - k))})`);
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = gradient; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 90, y - 45); ctx.stroke();
      if (k >= 1) meteor = null;
    }
  }
  function schedule() {
    if (enabled && !document.hidden && !motionQuery.matches && !raf) raf = requestAnimationFrame(frame);
  }
  function frame(now) {
    raf = 0;
    if (!enabled || document.hidden || motionQuery.matches) return;
    if (now - lastDraw >= interval) {
      const dt = previous ? Math.min(50, now - previous) : 0;
      previous = lastDraw = now; draw(dt);
    }
    schedule();
  }
  function stop() { enabled = false; cancelAnimationFrame(raf); raf = 0; previous = lastDraw = 0; }
  function start() {
    if (enabled) return;
    enabled = true; previous = lastDraw = 0; scrollPosition = scrollY * .15;
    if (!document.hidden) { draw(0); schedule(); }
  }
  addEventListener('resize', () => {
    if (!resizeRaf) resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; size(); });
  }, { passive: true });
  motionQuery.addEventListener('change', () => {
    cancelAnimationFrame(raf); raf = 0; previous = lastDraw = 0; meteor = null;
    if (enabled && !document.hidden) { draw(0); schedule(); }
  });
  size();
  return { start, stop };
}
