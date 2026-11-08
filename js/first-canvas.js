// One continuous, procedural universe. This is an artistic visualization, not a physical simulation.
export function createFirstCanvas(canvas, { motionQuery }) {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return { update() {}, birth() {}, pulse() {}, setActive() {}, destroy() {} };
  let seed = 71291;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const stars = Array.from({ length: 560 }, () => ({ x: random(), y: random(), r: .35 + random() * 1.15, z: .3 + random() * .7, phase: random() * 6.283 }));
  const dust = Array.from({ length: 880 }, () => ({ a: random() * 6.283, r: Math.pow(random(), .55), stretch: .55 + random() * .8, phase: random() * 6.283 }));
  const puffs = Array.from({ length: 34 }, () => ({ a: random() * 6.283, r: .12 + random() * .84, size: .2 + random() * .35, phase: random() * 6.283, tint: Math.floor(random() * 3) }));
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const smooth = (a, b, value) => { const t = clamp((value - a) / (b - a)); return t * t * (3 - 2 * t); };
  function glow(color) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 160;
    const g = cv.getContext('2d'); const gradient = g.createRadialGradient(80, 80, 0, 80, 80, 80);
    gradient.addColorStop(0, color); gradient.addColorStop(.3, color); gradient.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gradient; g.fillRect(0, 0, 160, 160); return cv;
  }
  const clouds = [glow('rgba(87,164,151,.35)'), glow('rgba(155,138,105,.25)'), glow('rgba(70,105,153,.3)')];
  const starGlow = glow('rgba(244,218,161,.78)');
  let width = 0, height = 0, raf = 0, last = -100, phase = 0, bornAt = -1, birthLevel = 0, pulseAt = -1, pulseLevel = 0, suspended = false, parentActive = true, quiet = false;
  let target = 0, progress = 0, pointer = { x: 0, y: 0 }, trace = [], bounds = null;
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    width = innerWidth; height = innerHeight;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); request();
  }
  function request() { if (!raf && !document.hidden && !suspended && parentActive) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    if (document.hidden || suspended || !parentActive) return;
    if (!motionQuery.matches && now - last < 32) { request(); return; }
    const dt = Math.min(.06, Math.max(0, (now - last) / 1000)); last = now;
    if (!motionQuery.matches && !quiet) phase += dt;
    progress = motionQuery.matches ? target : progress + (target - progress) * .09;
    if (bornAt >= 0) birthLevel = motionQuery.matches || quiet ? 1 : smooth(0, 2.8, (now - bornAt) / 1000);
    if (pulseAt >= 0) pulseLevel = motionQuery.matches || quiet ? .55 : Math.max(0, 1 - (now - pulseAt) / 2400);
    draw();
    if (!motionQuery.matches && (!quiet || Math.abs(target - progress) > .001)) request();
  }
  function draw() {
    const p = progress, drift = motionQuery.matches ? 0 : phase;
    const gather = smooth(.12, .33, p), release = smooth(.4, .57, p), earth = smooth(.57, .7, p) * (1 - smooth(.8, .95, p));
    const px = pointer.x * 26, py = pointer.y * 18;
    const cx = width * (.55 - .1 * smooth(.32, .65, p)) + px, cy = height * .43 + py;
    const spread = Math.min(width * .66, height * .54);
    ctx.fillStyle = '#05090d'; ctx.fillRect(0, 0, width, height);
    const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * .85);
    wash.addColorStop(0, `rgba(34,54,60,${.16 + gather * .15})`); wash.addColorStop(1, 'rgba(5,9,13,0)');
    ctx.fillStyle = wash; ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    for (const cloud of puffs) {
      const angle = cloud.a + drift * .008;
      const radius = spread * cloud.r * (1 - gather * .56 + release * .35 + pulseLevel * .18);
      const x = cx + Math.cos(angle) * radius * 1.1, y = cy + Math.sin(angle) * radius * .72;
      const s = spread * cloud.size * (1 + .1 * Math.sin(drift * .12 + cloud.phase));
      ctx.globalAlpha = (.34 - release * .16) * (1 - earth * .4) * (quiet ? .72 : 1);
      ctx.drawImage(clouds[cloud.tint], x - s, y - s, s * 2, s * 2);
    }
    ctx.globalAlpha = 1; ctx.fillStyle = '#dce8e5'; ctx.beginPath();
    for (const star of stars) {
      const x = ((star.x * width + px * star.z + drift * (2.6 + 2 * release) * star.z) % width + width) % width;
      const y = ((star.y * height + py * star.z + Math.sin(drift * .05 + star.phase) * 3) % height + height) % height;
      ctx.moveTo(x + star.r, y); ctx.arc(x, y, star.r * (.55 + star.z * .4), 0, 6.283);
    }
    ctx.globalAlpha = .43; ctx.fill(); ctx.globalAlpha = 1;
    const compression = 1 - gather * (.65 + .29 * birthLevel) + release * .45;
    ctx.fillStyle = release > .4 ? '#dfd2b0' : '#8bb8b0'; ctx.beginPath();
    for (const dot of dust) {
      const a = dot.a + drift * (.012 + gather * .04) + dot.r * 2.1;
      const r = spread * dot.r * Math.max(.055, compression);
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .58 * dot.stretch;
      const size = .55 + gather * .15; ctx.moveTo(x + size, y); ctx.arc(x, y, size, 0, 6.283);
    }
    ctx.globalAlpha = .21 + gather * .21; ctx.fill(); ctx.globalAlpha = 1;
    const core = gather * (1 - release * .68);
    if (core > .001) {
      const r = (38 + birthLevel * 85 + Math.sin(drift * .28) * 2) * Math.min(1, width / 600);
      ctx.globalAlpha = core * (.28 + birthLevel * .48); ctx.drawImage(starGlow, cx - r, cy - r, r * 2, r * 2);
      ctx.globalAlpha = core * (.25 + birthLevel * .65); ctx.fillStyle = '#f5e5bc';
      ctx.beginPath(); ctx.arc(cx, cy, 1.8 + birthLevel * 2.2, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = 'source-over';
    if (earth > .001) {
      const ex = width * .5, ey = height * 1.14, r = Math.max(width * .84, height * .43);
      ctx.globalAlpha = earth * .8;
      const g = ctx.createRadialGradient(ex, ey, r * .78, ex, ey, r * 1.035);
      g.addColorStop(0, '#03070b'); g.addColorStop(.91, '#061016'); g.addColorStop(.98, '#153841'); g.addColorStop(1, '#66a8b2');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, ey, r, Math.PI, 6.283); ctx.fill(); ctx.globalAlpha = 1;
    }
    if (bounds && trace.length && p > .67) {
      const alpha = smooth(.67, .74, p);
      ctx.globalAlpha = alpha; ctx.strokeStyle = '#c7b990'; ctx.lineWidth = 1;
      ctx.beginPath();
      trace.forEach((point, i) => { const x = bounds.x + point.x * bounds.width, y = bounds.y + point.y * bounds.height; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
      ctx.stroke();
      for (const point of trace) {
        const x = bounds.x + point.x * bounds.width, y = bounds.y + point.y * bounds.height;
        ctx.drawImage(starGlow, x - 13, y - 13, 26, 26); ctx.fillStyle = '#eee1bd'; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // Typography has a stable dark field while the same universe continues behind it.
    const shade = ctx.createLinearGradient(0, 0, width, 0);
    shade.addColorStop(0, 'rgba(2,5,8,.48)'); shade.addColorStop(.58, 'rgba(2,5,8,.1)'); shade.addColorStop(1, 'rgba(2,5,8,.18)');
    ctx.fillStyle = shade; ctx.fillRect(0, 0, width, height);
  }
  const visibility = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else { last = -100; request(); } };
  const onHide = () => { suspended = true; cancelAnimationFrame(raf); raf = 0; };
  const onShow = () => { suspended = false; last = -100; request(); };
  const onMotion = () => { progress = target; request(); };
  addEventListener('resize', size); addEventListener('pagehide', onHide); addEventListener('pageshow', onShow);
  document.addEventListener('visibilitychange', visibility); motionQuery.addEventListener('change', onMotion);
  size();
  return {
    update(state) {
      if (typeof state.progress === 'number') target = clamp(state.progress);
      if (state.pointer) pointer = state.pointer;
      if (state.trace) trace = state.trace;
      if (state.bounds !== undefined) bounds = state.bounds;
      if (typeof state.quiet === 'boolean') quiet = state.quiet;
      request();
    },
    birth() { bornAt = performance.now(); birthLevel = motionQuery.matches ? 1 : 0; request(); },
    pulse() { pulseAt = performance.now(); pulseLevel = motionQuery.matches ? .55 : 1; request(); },
    setActive(value) {
      parentActive = Boolean(value);
      if (!parentActive) { cancelAnimationFrame(raf); raf = 0; }
      else { last = -100; request(); }
    },
    destroy() {
      cancelAnimationFrame(raf); raf = 0; suspended = true;
      removeEventListener('resize', size); removeEventListener('pagehide', onHide); removeEventListener('pageshow', onShow);
      document.removeEventListener('visibilitychange', visibility); motionQuery.removeEventListener('change', onMotion);
    },
  };
}
