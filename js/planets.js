// VALIX 행성 그림 생성기 — 전시마다 다른 행성을 캔버스로 그림 (이미지 파일 없음)
// planetCanvas(cell, size) → 캔버스 (같은 전시는 항상 같은 모양), planetURL(cell, size) → 이미지 주소
// 종류: gas(띠 가스행성) · rocky(크레이터) · ice(얼음 균열) · ocean(바다·구름) · lava(용암 균열) · crystal(수정 면) · rice(쌀알 행성)
// 전시의 fx로 종류를 정하고, 없으면 id로 고름. 시트에 planet 칸(gas, rocky …)이 있으면 그게 우선.

const cache = new Map();
const FX_TYPE = { rice: 'rice', prism: 'crystal', ripple: 'ocean', stars: 'gas', trio: 'gas' };
const TYPES = ['gas', 'rocky', 'ice', 'ocean', 'lava', 'crystal'];

function hash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed || 1; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// 값 노이즈 + fbm
function noise2(seed) {
  const r = rng(seed), P = new Uint8Array(512), G = new Float32Array(256);
  for (let i = 0; i < 256; i++) { P[i] = i; G[i] = r(); }
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [P[i], P[j]] = [P[j], P[i]]; }
  for (let i = 0; i < 256; i++) P[i + 256] = P[i];
  const v = (x, y) => G[P[P[x & 255] + (y & 255)]];
  const s = (t) => t * t * (3 - 2 * t);
  const n = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = s(xf), w = s(yf);
    const a = v(xi, yi), b = v(xi + 1, yi), c = v(xi, yi + 1), d = v(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w; };
  // 겹칠 때마다 좌표를 돌려서 축 방향 줄무늬를 없앰 + 살짝 비틀기(domain warp)
  const C = Math.cos(0.83), S = Math.sin(0.83);
  return (x, y, oct = 5) => {
    const wx = x + 0.35 * n(x * 0.7 + 31.4, y * 0.7 + 7.1), wy = y + 0.35 * n(x * 0.7 + 3.3, y * 0.7 + 52.9);
    let px = wx, py = wy, amp = 0.5, sum = 0;
    for (let i = 0; i < oct; i++) { sum += amp * n(px + i * 17.3, py + i * 9.7); const nx = (px * C - py * S) * 2.03, ny = (px * S + py * C) * 2.03; px = nx; py = ny; amp *= 0.5; }
    return sum / (1 - Math.pow(0.5, oct));
  };
}

// 색
function hex2rgb(h) { const m = String(h || '#9db8ff').replace('#', '').match(/^([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i); return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [157, 184, 255]; }
function rgb2hsl([r, g, b]) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; } return [h * 360, s, l]; }
function hsl(h, s, l) { h = ((h % 360) + 360) % 360 / 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q, f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return [Math.round(f(h + 1 / 3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1 / 3) * 255)]; }
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

export function planetType(c) { return (c && c.planet && TYPES.concat('rice').includes(c.planet)) ? c.planet : FX_TYPE[c && c.fx] || TYPES[hash(c && c.id) % TYPES.length]; }
export function hasRing(c) { const t = planetType(c); return t === 'gas' || (t === 'crystal') || (t === 'ice' && hash(c.id) % 2 === 0); }

export function planetCanvas(c, size = 512) {
  const key = `${c.id}|${c.color}|${planetType(c)}|${size}`;
  if (cache.has(key)) return cache.get(key);
  const type = planetType(c), seed = hash(c.id || c.title || 'x'), R = rng(seed), N = noise2(seed), N2 = noise2(seed ^ 0x9e3779b9);
  const [H, S, L] = rgb2hsl(hex2rgb(c.color));
  const sat = Math.max(S, 0.28);
  const pal = {
    gas: [hsl(H - 18, sat * 0.9, 0.30), hsl(H, sat, 0.55), hsl(H + 22, sat * 0.7, 0.78), hsl(H + 40, sat * 0.6, 0.42)],
    rocky: [hsl(H, sat * 0.35, 0.22), hsl(H + 8, sat * 0.4, 0.42), hsl(H - 10, sat * 0.3, 0.62)],
    ice: [hsl(H - 10, sat * 0.4, 0.62), hsl(H, sat * 0.35, 0.80), hsl(H + 10, sat * 0.2, 0.94)],
    ocean: [hsl(H + 10, sat * 0.9, 0.22), hsl(H, sat, 0.42), hsl(H - 60, sat * 0.6, 0.45), hsl(H - 80, sat * 0.4, 0.62)],
    lava: [hsl(H - 10, sat * 0.25, 0.08), hsl(H, sat * 0.3, 0.18), hsl(28, 1, 0.55), hsl(48, 1, 0.75)],
    crystal: [hsl(H - 30, sat, 0.35), hsl(H, sat, 0.60), hsl(H + 40, sat * 0.8, 0.82)],
    rice: [hsl(36, 0.30, 0.58), hsl(40, 0.45, 0.80), hsl(44, 0.6, 0.93)],
  }[type];

  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const x = cv.getContext('2d');
  const cx = size / 2, cy = size / 2, pr = size * (hasRing(c) ? 0.30 : 0.38);
  const tilt = (R() - 0.5) * 0.7 - 0.25;
  const glow = type === 'lava' ? hsl(24, 1, 0.5) : type === 'rice' ? hsl(42, 0.9, 0.7) : hsl(H, sat, 0.65);

  // 대기 빛
  const ag = x.createRadialGradient(cx, cy, pr * 0.9, cx, cy, pr * 1.45);
  ag.addColorStop(0, css(glow, 0.45)); ag.addColorStop(1, css(glow, 0));
  x.fillStyle = ag; x.fillRect(0, 0, size, size);

  // 고리 (뒤쪽 절반)
  const ring = (front) => {
    if (!hasRing(c)) return;
    x.save(); x.translate(cx, cy); x.rotate(tilt); x.scale(1, 0.26);
    x.beginPath(); x.rect(-size, front ? 0 : -size, size * 2, size); x.clip();
    const bands = type === 'crystal' ? 3 : 7;
    for (let i = 0; i < bands; i++) {
      const rr = pr * (1.25 + i * (type === 'crystal' ? 0.13 : 0.058));
      x.beginPath(); x.ellipse(0, 0, rr, rr, 0, 0, Math.PI * 2);
      x.lineWidth = pr * (type === 'crystal' ? 0.025 : 0.035 + R() * 0.04);
      const rc = type === 'crystal' ? hsl(H + i * 60, 0.8, 0.75) : mix(pal[1], pal[2], R());
      x.strokeStyle = css(rc, 0.25 + R() * 0.45); x.stroke();
    }
    x.restore();
  };
  ring(false);

  // 수정 행성의 면 기준점
  const SEEDS = type === 'crystal' ? Array.from({ length: 46 }, () => { let p = [R() * 2 - 1, R() * 2 - 1, R() * 2 - 1]; const l = Math.hypot(...p) || 1; p = p.map((v) => v / l); return [p[0], p[1], Math.abs(p[2]), R()]; }) : [];
  // 표면 텍스처 (픽셀 단위, 구면 좌표)
  const img = x.getImageData(0, 0, size, size), d = img.data;
  const freq = type === 'gas' ? 2.2 : type === 'rocky' ? 3.2 : type === 'lava' ? 3.4 : 2.6;
  for (let py = Math.floor(cy - pr); py <= cy + pr; py++) {
    for (let px = Math.floor(cx - pr); px <= cx + pr; px++) {
      const nx = (px - cx) / pr, ny = (py - cy) / pr, r2 = nx * nx + ny * ny;
      if (r2 > 1) continue;
      const nz = Math.sqrt(1 - r2);
      const u = Math.asin(nx / Math.sqrt(1 - ny * ny || 1)) / Math.PI + 0.5, v = Math.asin(ny) / Math.PI + 0.5;
      const sx = u * freq + 5, sy = v * freq + 5;
      let col;
      if (type === 'gas') {
        const w = N(sx * 0.6, sy * 3, 4);
        const band = Math.sin((v * 13 + w * 2.6) * Math.PI) * 0.5 + 0.5;
        const fine = N2(sx * 1.5, sy * 14, 3);
        col = mix(mix(pal[0], pal[1], band), mix(pal[2], pal[3], fine), Math.pow(fine, 1.5) * 0.7);
        const sp = Math.hypot(u - 0.62, (v - 0.62) * 1.8); if (sp < 0.07) col = mix(col, pal[3], (1 - sp / 0.07) * 0.8); // 큰 소용돌이
      } else if (type === 'rocky') {
        const h = N(sx, sy, 6); col = h < 0.45 ? mix(pal[0], pal[1], h / 0.45) : mix(pal[1], pal[2], (h - 0.45) / 0.55);
      } else if (type === 'ice') {
        const h = N(sx, sy, 5), cr = Math.abs(N2(sx * 2, sy * 2, 4) - 0.5);
        col = mix(pal[0], pal[2], h); if (cr < 0.025) col = mix(col, hsl(H - 20, 0.7, 0.45), (1 - cr / 0.025) * 0.8);
        const pole = Math.max(0, Math.max(0.2 - v, v - 0.8) * 6 + (N2(sx * 3, sy * 3, 3) - 0.5) * 0.8); if (pole > 0) col = mix(col, [250, 252, 255], Math.min(0.85, pole));
      } else if (type === 'ocean') {
        const h = N(sx, sy, 6), cl = N2(sx * 1.3 + 3, sy * 2.2, 5);
        col = h > 0.5 ? mix(pal[2], pal[3], (h - 0.5) / 0.5) : mix(pal[0], pal[1], Math.pow(h / 0.5, 2)); if (h > 0.49 && h < 0.51) col = mix(col, [230, 220, 180], 0.5);
        if (cl > 0.55) col = mix(col, [245, 248, 255], Math.min(1, (cl - 0.55) * 3.2));
      } else if (type === 'lava') {
        const h = N(sx, sy, 6), cr = Math.abs(N2(sx * 1.6, sy * 1.6, 5) - 0.5);
        col = mix(pal[0], pal[1], h); if (cr < 0.05) col = mix(col, cr < 0.018 ? pal[3] : pal[2], 1 - cr / 0.05);
      } else if (type === 'crystal') {
        // 보로노이 면: 가장 가까운 점 두 개로 면과 모서리를 나눔
        let b1 = -2, b2 = -2, k = 0;
        for (let j = 0; j < SEEDS.length; j++) { const q = SEEDS[j], dt = q[0] * nx + q[1] * ny + q[2] * nz; if (dt > b1) { b2 = b1; b1 = dt; k = j; } else if (dt > b2) b2 = dt; }
        const q = SEEDS[k];
        const fl = Math.max(0, -0.55 * q[0] - 0.5 * q[1] + 0.67 * q[2]); // 면마다 다른 기울기
        col = mix(mix(pal[0], pal[2], q[3]), hsl(H + q[3] * 140 - 40, 0.75, 0.72), 0.3);
        col = mix(col, [255, 255, 255], Math.pow(fl, 6) * 0.6);
        if (b1 - b2 < 0.012) col = mix(col, [255, 255, 255], (1 - (b1 - b2) / 0.012) * 0.75);
      } else { // rice
        const h = N(sx, sy, 5); col = mix(pal[0], pal[2], h * 0.9 + 0.05);
      }
      // 빛: 왼쪽 위에서
      const lit = Math.max(0, -0.55 * nx - 0.5 * ny + 0.67 * nz);
      const shade = 0.12 + 0.95 * Math.pow(lit, 0.9), rim = Math.pow(1 - nz, 3) * 0.35;
      const i = (py * size + px) * 4, a = Math.min(1, (1 - Math.sqrt(r2)) * pr * 0.9); // 가장자리 부드럽게
      const o = [col[0] * shade + glow[0] * rim, col[1] * shade + glow[1] * rim, col[2] * shade + glow[2] * rim];
      d[i] = d[i] * (1 - a) + o[0] * a; d[i + 1] = d[i + 1] * (1 - a) + o[1] * a; d[i + 2] = d[i + 2] * (1 - a) + o[2] * a; d[i + 3] = Math.max(d[i + 3], 255 * a);
    }
  }
  x.putImageData(img, 0, 0);

  // 표면 위 그림 (크레이터 · 쌀알)
  x.save(); x.beginPath(); x.arc(cx, cy, pr, 0, Math.PI * 2); x.clip();
  if (type === 'rocky' || type === 'ice') {
    const n = type === 'rocky' ? 26 : 9;
    for (let i = 0; i < n; i++) {
      const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * pr * 0.9, px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr;
      const k = Math.sqrt(Math.max(0, 1 - (rr / pr) ** 2)), cr = pr * (0.025 + R() * R() * 0.12);
      x.save(); x.translate(px, py); x.rotate(a); x.scale(Math.max(0.25, k), 1);
      x.beginPath(); x.arc(0, 0, cr, 0, Math.PI * 2); x.fillStyle = 'rgba(0,0,0,.28)'; x.fill();
      x.beginPath(); x.arc(-cr * 0.12, -cr * 0.12, cr * 0.82, 0, Math.PI * 2); x.fillStyle = 'rgba(255,255,255,.07)'; x.fill();
      x.beginPath(); x.arc(0, 0, cr, Math.PI * 0.9, Math.PI * 1.8); x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = Math.max(1, cr * 0.12); x.stroke();
      x.restore();
    }
  }
  if (type === 'rice') {
    for (let i = 0; i < 520; i++) {
      const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * pr, px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr;
      const k = Math.sqrt(Math.max(0.05, 1 - (rr / pr) ** 2)), g = pr * (0.028 + R() * 0.01);
      x.save(); x.translate(px, py); x.rotate(R() * Math.PI); x.scale(1, 0.48 * (0.6 + k * 0.4));
      x.beginPath(); x.arc(g * 0.15, g * 0.25, g, 0, Math.PI * 2); x.fillStyle = 'rgba(80,55,20,.18)'; x.fill();
      x.beginPath(); x.arc(0, 0, g, 0, Math.PI * 2); x.fillStyle = `rgba(255,${246 + R() * 9 | 0},${222 + R() * 30 | 0},${0.55 + R() * 0.4})`; x.fill();
      x.restore();
    }
  }
  // 그림자 (밤 쪽)
  const sh = x.createRadialGradient(cx - pr * 0.45, cy - pr * 0.45, pr * 0.2, cx, cy, pr * 1.15);
  sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.62, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,8,.75)');
  x.fillStyle = sh; x.fillRect(0, 0, size, size);
  // 반사광
  const hl = x.createRadialGradient(cx - pr * 0.42, cy - pr * 0.45, 0, cx - pr * 0.42, cy - pr * 0.45, pr * 0.6);
  hl.addColorStop(0, 'rgba(255,255,255,.18)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = hl; x.fillRect(0, 0, size, size);
  x.restore();

  // 대기 가장자리 선
  x.beginPath(); x.arc(cx, cy, pr + 0.5, 0, Math.PI * 2); x.strokeStyle = css(glow, 0.35); x.lineWidth = size * 0.004; x.stroke();
  ring(true);

  cache.set(key, cv);
  return cv;
}

const urls = new Map();
export function planetURL(c, size = 384) {
  const key = `${c.id}|${c.color}|${planetType(c)}|${size}`;
  if (!urls.has(key)) urls.set(key, planetCanvas(c, size).toDataURL('image/png'));
  return urls.get(key);
}
