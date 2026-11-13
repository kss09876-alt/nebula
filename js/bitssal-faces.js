// A-003 · 빛쌀 — 쌀알로 그리는 얼굴 (가상의 인물 일러스트)
// 얼굴을 선(획)으로 설계하고, 그 선을 따라 쌀알을 결 방향으로 하나씩 놓는다.
// 좌표: 얼굴 가운데가 (0,0), 위쪽 -1 · 아래쪽 +1 (화면 좌표처럼 y가 아래로 커짐)
const PI = Math.PI;
const ell = (cx, cy, rx, ry, a0 = 0, a1 = 2 * PI, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * (i / n); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
const bez = (p0, p1, p2, p3, n = 26) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]); });
const flip = (pts) => pts.map(([x, y]) => [-x, y]);
// 획: pts(점 목록), c(색 0 쌀·1 흐린·3 따뜻한), a(밝기), w(촘촘함)
const S = (pts, o = {}) => ({ pts, c: o.c ?? 0, a: o.a ?? 1, w: o.w ?? 1 });
const pair = (pts, o) => [S(pts, o), S(flip(pts), o)];

// ---- 얼굴 부분 ----
function jaw(rx = 0.5, chin = 0.62, top = -0.3) { return pair(bez([rx, top], [rx + 0.03, chin * 0.42], [rx * 0.5, chin * 0.95], [0, chin])); }
function ears(x = 0.5, y = 0.02) { return pair(bez([x, y - 0.1], [x + 0.11, y - 0.12], [x + 0.11, y + 0.1], [x + 0.01, y + 0.13], 14), { a: 0.85 }); }
function neck(x = 0.19, y0 = 0.58, y1 = 0.84) { return pair(bez([x, y0], [x + 0.01, y0 + 0.1], [x, y1 - 0.08], [x + 0.03, y1], 10), { a: 0.8 }); }
function hanbokCollar() {
  // 저고리 깃과 동정, 어깨선
  return [
    ...pair(bez([0.2, 0.84], [0.45, 0.86], [0.7, 0.92], [0.92, 1.04], 18), { a: 0.85 }),
    S([[-0.19, 0.84], [0.14, 1.08]]), S([[-0.28, 0.86], [0.04, 1.1]]), S([[-0.235, 0.85], [0.09, 1.09]], { a: 0.35, w: 0.6 }), // 왼쪽 깃과 동정
    S([[0.2, 0.84], [0.035, 0.98]], { a: 0.9 }),
  ];
}
function workShirt() {
  return [
    ...pair(bez([0.21, 0.82], [0.45, 0.85], [0.72, 0.92], [0.95, 1.05], 18), { a: 0.85 }),
    ...pair([[0.2, 0.8], [0.06, 0.98]], { a: 0.95 }), ...pair([[0.2, 0.8], [0.4, 0.94]], { a: 0.95 }), ...pair([[0.4, 0.94], [0.12, 1.0]], { a: 0.7 }),
    S([[0, 0.98], [0, 1.08]], { a: 0.6 }),
  ];
}
function eyesRound(y = 0.03, x = 0.21) { // 아이: 둥근 눈 + 큰 눈동자
  return [...pair(ell(x, y, 0.085, 0.07, 0, 2 * PI, 28)), ...pair(ell(x + 0.005, y + 0.008, 0.036, 0.036, 0, 2 * PI, 14), { w: 2.2 }), ...pair(ell(x + 0.005, y + 0.008, 0.016, 0.016, 0, 2 * PI, 8), { w: 2.6 })];
}
function eyesAlmond(y = 0.02, x = 0.2, look = 0) {
  return [...pair(ell(x, y, 0.1, 0.045, PI, 2 * PI, 20)), ...pair(ell(x, y, 0.09, 0.028, 0.15, PI - 0.15, 16), { a: 0.7 }), ...pair(ell(x + look, y + 0.004, 0.026, 0.026, 0, 2 * PI, 10), { w: 2.4 })];
}
function eyesDown(y = 0.03, x = 0.2) { // 내리깐 눈: 눈꺼풀 선 + 속눈썹
  return [...pair(ell(x, y - 0.01, 0.095, 0.04, 0.1, PI - 0.1, 18)), ...pair(ell(x, y + 0.02, 0.02, 0.012, 0, 2 * PI, 6), { w: 2 }), ...pair(bez([x - 0.09, y - 0.035], [x - 0.04, y - 0.06], [x + 0.04, y - 0.06], [x + 0.1, y - 0.03], 12), { a: 0.6 })];
}
function eyesSmile(y = 0.04, x = 0.2) { // 웃으며 감은 눈
  return [...pair(ell(x, y + 0.02, 0.095, 0.05, PI + 0.15, 2 * PI - 0.15, 18)), ...pair(ell(x, y + 0.04, 0.07, 0.025, 0.4, PI - 0.4, 10), { a: 0.3 })];
}
function brows(y = -0.12, x = 0.2, tilt = 0, a = 1, w = 1) { return pair(bez([x - 0.1, y + 0.015 + tilt], [x - 0.04, y - 0.02], [x + 0.05, y - 0.02], [x + 0.12, y + 0.02 - tilt], 14), { a, w }); }
function nose(y0 = 0.06, y1 = 0.24, wing = 0.06) { return [S(bez([0.015, y0], [0.03, (y0 + y1) / 2], [0.04, y1 - 0.03], [0.02, y1], 12), { a: 0.8 }), S(ell(0, y1 + 0.005, wing, 0.022, 0.2, PI - 0.2, 12), { a: 0.8 })]; }
function mouth(y = 0.36, w = 0.13, smile = 0.03, lip = true) {
  const out = [S(bez([-w, y - smile * 0.4], [-w * 0.4, y + smile], [w * 0.4, y + smile], [w, y - smile * 0.4], 16))];
  if (lip) out.push(S(ell(0, y + 0.03, w * 0.55, 0.028, 0.2, PI - 0.2, 10), { a: 0.55 }));
  return out;
}

// ---- 머리 모양 ----
function hairBob() { // 열 살 순이: 단발 + 앞머리
  const out = [S(ell(0, -0.12, 0.74, 0.76, PI + 0.08, 2 * PI - 0.08, 44)), ...pair([[0.735, -0.18], [0.75, 0.38]]), ...pair([[0.75, 0.38], [0.5, 0.4]], { a: 0.9 })];
  out.push(S(bez([-0.56, -0.33], [-0.2, -0.27], [0.2, -0.27], [0.56, -0.33], 24)));
  for (let j = 0; j <= 12; j++) { const x = -0.5 + j / 12; out.push(S(bez([x * 0.3, -0.86], [x * 0.75, -0.84], [x * 1.0, -0.6], [x * 1.04, -0.31], 16), { a: 0.75, w: 0.8 })); }
  for (let j = 0; j < 4; j++) { const x0 = 0.56 + j * 0.05; out.push(...pair(bez([x0 * 0.92, -0.62], [x0 + 0.06, -0.35], [x0 + 0.04, 0.0], [x0 + 0.02, 0.37], 18), { a: 0.75, w: 0.8 })); }
  return out;
}
function hairBun(grey = false) { // 쪽진 머리: 가르마 + 양옆으로 빗어 넘긴 결 + 뒤로 보이는 쪽과 비녀
  const c = grey ? 1 : 0, o = { c, a: grey ? 0.9 : 1 };
  const out = [S(ell(0, -0.1, 0.64, 0.72, PI + 0.12, 2 * PI - 0.12, 40), o), S([[0, -0.82], [0, -0.48]], o)];
  out.push(...pair(bez([0, -0.46], [0.2, -0.47], [0.4, -0.4], [0.5, -0.26], 16), o));
  for (let j = 0; j < 7; j++) { const k = j / 6; out.push(...pair(bez([0.02, -0.8 + k * 0.32], [0.3 + k * 0.1, -0.78 + k * 0.3], [0.55, -0.55 + k * 0.25], [0.6 - k * 0.06, -0.12 + k * 0.1], 16), { c, a: grey ? 0.7 : 0.75, w: 0.8 })); }
  out.push(...pair(bez([0.6, -0.14], [0.62, -0.02], [0.58, 0.06], [0.52, 0.1], 10), { c, a: 0.7 })); // 귀 뒤로 넘긴 머리
  return out;
}
function cap() { // 큰오빠: 작업모
  return [
    S(ell(0, -0.36, 0.6, 0.46, PI + 0.02, 2 * PI - 0.02, 40)), S(bez([-0.6, -0.36], [-0.2, -0.42], [0.2, -0.42], [0.6, -0.36], 20)),
    S(bez([-0.62, -0.34], [-0.3, -0.2], [0.3, -0.2], [0.62, -0.34], 22)), S(bez([-0.58, -0.36], [-0.3, -0.26], [0.3, -0.26], [0.58, -0.36], 20), { a: 0.6 }),
    S([[0, -0.82], [0, -0.42]], { a: 0.5 }), S(ell(0, -0.83, 0.03, 0.02, 0, 2 * PI, 6), { w: 2 }),
    ...pair(bez([0.52, -0.32], [0.54, -0.22], [0.53, -0.12], [0.5, -0.04], 10), { a: 0.7 }), // 모자 밑 옆머리
  ];
}

const KINDS = {
  suniChild: () => [...hairBob(), ...jaw(0.52, 0.6, -0.3), ...ears(0.52, 0.06).map((s) => ({ ...s, a: 0.4 })), ...eyesRound(0.04), ...brows(-0.12, 0.2, 0, 0.55), ...nose(0.12, 0.24, 0.045), ...mouth(0.38, 0.1, 0.045, false), ...neck(0.17, 0.58), ...hanbokCollar()],
  brother: () => [...cap(), ...jaw(0.5, 0.66, -0.12), ...ears(0.52, 0.03), ...eyesAlmond(0.02, 0.2), ...brows(-0.1, 0.2, -0.01, 1, 1.6), ...nose(0.04, 0.24, 0.06), ...mouth(0.4, 0.14, 0.02), ...neck(0.21, 0.64), ...workShirt()],
  mother: () => [...hairBun(false), ...jaw(0.5, 0.64, -0.26), ...ears(0.5, 0.05), ...eyesDown(0.04), ...brows(-0.1, 0.2, 0.01, 0.75), ...nose(0.06, 0.25, 0.05), ...mouth(0.4, 0.11, 0.015), ...neck(0.19, 0.62), ...hanbokCollar()],
  suni44: () => [...hairBun(false), ...jaw(0.5, 0.64, -0.26), ...ears(0.5, 0.05), ...eyesAlmond(0.03, 0.2, 0.01), ...brows(-0.1, 0.2, 0, 0.8), ...nose(0.06, 0.25, 0.05), ...mouth(0.4, 0.12, 0.03), ...neck(0.19, 0.62), ...hanbokCollar()],
  suniOld: () => [
    ...hairBun(true), ...jaw(0.52, 0.62, -0.26), ...ears(0.52, 0.06), ...eyesSmile(0.04), ...brows(-0.1, 0.2, 0.02, 0.7),
    ...nose(0.06, 0.26, 0.055), S(bez([-0.12, 0.41], [-0.05, 0.46], [0.05, 0.46], [0.12, 0.41], 14)),
    S(bez([-0.24, -0.3], [-0.08, -0.33], [0.08, -0.33], [0.24, -0.3], 14), { a: 0.5 }), S(bez([-0.2, -0.24], [-0.06, -0.26], [0.06, -0.26], [0.2, -0.24], 12), { a: 0.4 }), // 이마 주름
    ...pair(bez([0.08, 0.27], [0.15, 0.32], [0.18, 0.4], [0.19, 0.47], 12), { a: 0.55 }), // 팔자 주름
    ...[0, 1, 2].flatMap((k) => pair([[0.31, 0.02 + k * 0.035], [0.37, -0.01 + k * 0.05]], { a: 0.45 })), // 눈가 주름
    ...pair(ell(0.2, 0.12, 0.06, 0.018, 0.3, PI - 0.3, 6), { a: 0.25 }),
    ...neck(0.19, 0.6), ...hanbokCollar(),
  ],
};

// 획을 따라 쌀알 n개를 고르게 놓음 → {x, y, r(결 방향), c, a}
const cache = {};
export function facePoints(kind, n = 1000) {
  const key = kind + n; if (cache[key]) return cache[key];
  const strokes = (KINDS[kind] || KINDS.suniChild)();
  let L = 0; const lens = strokes.map((s) => { let l = 0; for (let i = 1; i < s.pts.length; i++) l += Math.hypot(s.pts[i][0] - s.pts[i - 1][0], s.pts[i][1] - s.pts[i - 1][1]); L += l * s.w; return l; });
  const step = L / n, out = []; let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  strokes.forEach((s, si) => {
    const sp = step / s.w; let carry = rnd() * sp;
    for (let i = 1; i < s.pts.length; i++) {
      const [x0, y0] = s.pts[i - 1], [x1, y1] = s.pts[i], seg = Math.hypot(x1 - x0, y1 - y0); if (!seg) continue;
      const ang = Math.atan2(y1 - y0, x1 - x0), nx = -(y1 - y0) / seg, ny = (x1 - x0) / seg;
      let d = carry;
      while (d <= seg) { const t = d / seg, j = (rnd() - 0.5) * 0.012; out.push({ x: x0 + (x1 - x0) * t + nx * j, y: y0 + (y1 - y0) * t + ny * j, r: ang + (rnd() - 0.5) * 0.35, c: s.c, a: s.a * (0.8 + rnd() * 0.2) }); d += sp; }
      carry = d - seg;
    }
    void lens[si];
  });
  while (out.length > n) out.splice(Math.floor(rnd() * out.length), 1);
  return (cache[key] = out);
}

// 카드 안의 작은 초상 (정지 그림)
const COL = [[255, 248, 230], [150, 142, 128], [200, 56, 47], [255, 214, 150]];
export function drawPortrait(cv, kind, { light = false } = {}) {
  const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth || 120, h = cv.clientHeight || 140;
  cv.width = w * dpr; cv.height = h * dpr; const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  const s = Math.min(w, h) * 0.46, cx = w / 2, cy = h * 0.47;
  facePoints(kind, 620).forEach((p) => {
    const col = light ? COL[3] : COL[p.c];
    g.save(); g.translate(cx + p.x * s, cy + p.y * s); g.rotate(p.r); g.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${p.a})`;
    g.beginPath(); g.ellipse(0, 0, 1.9, 0.85, 0, 0, 6.283); g.fill(); g.restore();
  });
}
export const FACE_KINDS = Object.keys(KINDS);
