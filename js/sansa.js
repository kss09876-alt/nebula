// 산사, 잠시 머물다 — 3D 온라인 산사 (기획 제안 프로토타입)
// 산문 → 돌길 마당 → 계단 → 법당(고요당). 캐릭터를 뒤에서 따라가며 걷고, 방석에 앉아 좌선.
// 휴대폰: 앞으로 기울이면 걷기 · 몸을 돌리면 방향 · 흔들면 목탁 · 엎었다 들면 절 · 돌리면 염주 · 앉아서 엎어 두면 좌선
// PC: W A S D / 방향키 · 화면 끌기. 소리는 모두 Web Audio 합성. 센서 정보는 기기 안에서만 씀.
import * as THREE from 'three';
import { IS_MOBILE, sensor, keepAwake } from './sensors.js?v=2';
import { lang } from './i18n.js?v=3';

/* ---------- 문구 (한국어 = 키) [en, zh, ja] ---------- */
const W = {
  'ONLINE TEMPLE STAY · 기획 제안 프로토타입': ['ONLINE TEMPLE STAY · PROPOSAL PROTOTYPE', '线上寺院寄宿 · 策划提案原型', 'オンライン・テンプルステイ · 企画提案プロトタイプ'],
  '산사, 잠시 머물다': ['A Mountain Temple, For a While', '山寺，小憩片刻', '山寺で、しばし'],
  '말없이 걸어 들어가 함께 앉는 온라인 절.': ['An online temple you walk into and sit in, in silence.', '静静走进、一同静坐的线上寺院。', '言葉なく歩いて入り、共に座るオンラインのお寺。'],
  '법당 문을 여는 중': ['Opening the hall doors', '正在打开法堂之门', '本堂の扉を開けています'],
  '산문 들어서기': ['Enter the temple gate', '走进山门', '山門をくぐる'],
  '휴대폰을 앞으로 기울이면 걸어요': ['Tilt your phone forward to walk', '将手机向前倾即可行走', 'スマホを前に傾けると歩きます'],
  '몸을 돌리면 바라보는 방향이 바뀌어요': ['Turn your body to change direction', '转动身体即可改变方向', '体を回すと向きが変わります'],
  'W A S D 또는 방향키로 걸어요 · 끌어서 둘러보기': ['Walk with W A S D or arrow keys · drag to look around', '用 W A S D 或方向键行走 · 拖动环顾', 'W A S D か矢印キーで歩く · ドラッグで見回す'],
  '화면을 끌어도 걸을 수 있어요': ['You can also drag the screen to walk', '拖动画面也可以行走', '画面をドラッグしても歩けます'],
  'VALIX가 대한불교조계종과의 협력을 가정해 만든 기획 제안 프로토타입입니다. 실제 주최·후원이 아니며 협의 전입니다.': ['A proposal prototype by VALIX assuming a collaboration with the Jogye Order of Korean Buddhism. Not actual hosting or sponsorship; not yet discussed.', '本作是 VALIX 以与大韩佛教曹溪宗合作为假设制作的策划提案原型，并非实际主办或赞助，尚未协商。', 'VALIXが大韓仏教曹渓宗との協力を想定して制作した企画提案プロトタイプです。実際の主催・後援ではなく、協議前です。'],
  '산사': ['Sansa', '山寺', '山寺'], '산문': ['Gate', '山门', '山門'], '마당': ['Courtyard', '庭院', '境内'], '고요당': ['Goyo Hall', '静寂堂', '静寂堂'],
  '염불 듣기': ['Listen to chant', '聆听念佛', '念仏を聴く'], '염불 멈추기': ['Stop chant', '停止念佛', '念仏を止める'],
  '합장': ['Palms', '合掌', '合掌'], '절하기': ['Bow', '礼拜', '礼拝'], '목탁': ['Moktak', '木鱼', '木魚'], '염주': ['Beads', '念珠', '数珠'], '앉기': ['Sit', '坐下', '座る'], '눈 감기': ['Close eyes', '闭眼', '目を閉じる'],
  '/ 108': ['/ 108', '/ 108', '/ 108'], '숨을 따라가요': ['Follow your breath', '跟随呼吸', '息についていく'], '일어나기': ['Stand up', '起身', '立ち上がる'],
  '설정': ['Settings', '设置', '設定'], '휴대폰 기울여 걷기': ['Walk by tilting the phone', '倾斜手机行走', 'スマホを傾けて歩く'], '몸을 돌려 방향 바꾸기 (나침반)': ['Turn your body to steer (compass)', '转身改变方向（指南针）', '体を回して向きを変える（コンパス）'],
  '지금 자세를 기준으로 다시 맞추기': ['Recalibrate to current posture', '以当前姿势重新校准', '今の姿勢を基準に合わせ直す'], '닫기': ['Close', '关闭', '閉じる'],
  "앉기: 방석 가까이 가면 '앉기'가 나타나요. 앉은 뒤 휴대폰을 엎어 두면 좌선이 시작되고, 들면 종이 울려요.": ["Sit: walk near a cushion and 'Sit' appears. Then lay your phone face down to meditate; lift it and a bell rings.", '坐下：走近蒲团会出现“坐下”。坐下后把手机朝下放即开始坐禅，拿起时钟声响起。', '座る：座布団に近づくと「座る」が現れます。座ったらスマホを伏せると坐禅が始まり、持ち上げると鐘が鳴ります。'],
  '절하기: 버튼을 누르거나, 휴대폰을 엎었다가 들어요. 목탁: 버튼 또는 흔들기. 염주: 버튼 또는 화면을 보며 휴대폰을 살짝 돌리기.': ['Bow: press the button, or lay the phone down and lift it. Moktak: button or shake. Beads: button, or rotate the phone slightly while facing the screen.', '礼拜：按按钮，或把手机朝下放再拿起。木鱼：按钮或摇晃。念珠：按钮，或面对屏幕轻转手机。', '礼拝：ボタンを押すか、スマホを伏せて持ち上げる。木魚：ボタンか振る。数珠：ボタンか、画面を見たままスマホを少し回す。'],
  '센서·마이크 정보는 이 기기 안에서만 쓰이고 저장·전송되지 않아요.': ['Sensor data stays on this device and is never saved or sent.', '传感器信息只在本设备中使用，不会保存或传送。', 'センサー情報はこの端末の中だけで使われ、保存・送信されません。'],
  '나': ['Me', '我', '私'],
  '앞으로 기울이면 걸어요 · 몸을 돌려 방향을 바꿔요': ['Tilt forward to walk · turn your body to steer', '向前倾斜行走 · 转身改变方向', '前に傾けて歩く · 体を回して向きを変える'],
  '화면을 위로 끌면 걸어요 · 좌우로 끌면 돌아요': ['Drag up to walk · drag sideways to turn', '向上拖动行走 · 左右拖动转向', '上にドラッグで歩く · 左右で回る'],
  '방석에 앉았어요 · 휴대폰을 엎어 두면 좌선': ['Seated · lay your phone face down to meditate', '已坐下 · 把手机朝下放开始坐禅', '座りました · スマホを伏せると坐禅'],
  "방석에 앉았어요 · '눈 감기'로 좌선": ["Seated · press 'Close eyes' to meditate", '已坐下 · 按“闭眼”开始坐禅', '座りました ·「目を閉じる」で坐禅'],
  '두 손을 모읍니다': ['Palms together', '双手合十', '両手を合わせます'],
  '번째 절': [' bows', '拜', '回目の礼拝'],
  '108번을 모두 굴렸어요': ['All 108 beads', '108 颗念珠已拨完', '108玉を数え終えました'],
  '동안 머물렀어요': ['of stillness', '的静坐', '座りました'],
  '분': [' min ', '分', '分'], '초': [' s', '秒', '秒'],
};
const IDX = { en: 0, zh: 1, ja: 2 };
const t = (k) => (lang !== 'ko' && W[k] && W[k][IDX[lang]]) || k;
document.documentElement.lang = lang;
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
if (IS_MOBILE) document.body.classList.add('mobile');
const $ = (s) => document.querySelector(s);
let toastT = 0;
function toast(msg, ms = 2200) { const el = $('.toast'); el.textContent = msg; el.hidden = false; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, ms); }
let hintT = 0;
function hint(msg, ms = 6000) { const el = $('.hint'); el.textContent = msg; el.hidden = false; clearTimeout(hintT); if (ms) hintT = setTimeout(() => { el.hidden = true; }, ms); }

/* ---------- 3D 기본 ---------- */
const canvas = $('#world');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, IS_MOBILE ? 1.6 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
const SKY = new THREE.Color('#c9cfc4');
scene.background = SKY; scene.fog = new THREE.Fog(SKY, 40, 190);
const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 400);
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 64 : 52; camera.updateProjectionMatrix(); }
resize(); addEventListener('resize', resize);

scene.add(new THREE.HemisphereLight('#eef0e6', '#4a3f30', 1.15));
const sun = new THREE.DirectionalLight('#fff1d8', 1.4); sun.position.set(-30, 50, 40); scene.add(sun);

const tex = (w, h, draw, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t2 = new THREE.CanvasTexture(c); t2.colorSpace = THREE.SRGBColorSpace; if (rep) { t2.wrapS = t2.wrapT = THREE.RepeatWrapping; t2.repeat.set(rep[0], rep[1]); } t2.anisotropy = 4; return t2; };
const rnd = (() => { let s = 7; return () => (s = (s * 9301 + 49297) % 233280) / 233280; })();
const mat = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, ...o });
const box = (w, h, d, m, x = 0, y = 0, z = 0, parent = scene) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); parent.add(b); return b; };

// 하늘: 위는 맑고 아래는 안개
const skyTex = tex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9fb3be'); gr.addColorStop(0.5, '#d6dbd1'); gr.addColorStop(1, '#c9cfc4'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const skyDome = new THREE.Mesh(new THREE.SphereGeometry(300, 24, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false }));
scene.add(skyDome);

// 먼 산 (여러 겹 능선)
const ridgeMat = [mat({ color: '#7d8f86' }), mat({ color: '#5f7468' }), mat({ color: '#45584c' })];
for (let ring = 0; ring < 3; ring++) {
  const R = 170 - ring * 35, n = 26 - ring * 4;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + ring, h = 30 + rnd() * 45 - ring * 8;
    const m = new THREE.Mesh(new THREE.ConeGeometry(28 + rnd() * 22, h, 7), ridgeMat[ring]);
    m.position.set(Math.cos(a) * R, h / 2 - 4, Math.sin(a) * R); m.rotation.y = rnd() * 3; scene.add(m);
  }
}

// 땅: 흙과 마른 풀
const groundTex = tex(512, 512, (g, w, h) => { g.fillStyle = '#7b7559'; g.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${90 + rnd() * 70},${85 + rnd() * 60},${50 + rnd() * 30},.35)`; g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 3, 1 + rnd() * 5); } }, [30, 30]);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat({ map: groundTex }));
ground.rotation.x = -Math.PI / 2; scene.add(ground);
// 돌길 (박석)
const stoneTex = tex(512, 512, (g, w, h) => {
  g.fillStyle = '#8c8a83'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 64 + (rnd() * 20 | 0)) for (let x = (rnd() * 40) | 0; x < w; x += 80 + rnd() * 70) { const c = 120 + rnd() * 40; g.fillStyle = `rgb(${c},${c - 3},${c - 10})`; g.fillRect(x + 2, y + 2, 76 + rnd() * 50, 58 + rnd() * 14); }
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(40,38,32,${rnd() * 0.18})`; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
}, [2, 9]);
const path = new THREE.Mesh(new THREE.PlaneGeometry(8, 46), mat({ map: stoneTex, roughness: 0.95 }));
path.rotation.x = -Math.PI / 2; path.position.set(0, 0.02, 21); scene.add(path);
const yard = new THREE.Mesh(new THREE.PlaneGeometry(34, 12), mat({ map: stoneTex.clone(), roughness: 0.95 }));
yard.material.map.repeat.set(6, 2); yard.rotation.x = -Math.PI / 2; yard.position.set(0, 0.015, 4); scene.add(yard);

/* ---------- 법당: 고요당 ---------- */
const HALL_Y = 1.2;
const woodDark = mat({ color: '#4a2f22', roughness: 0.7 }), woodRed = mat({ color: '#6e3326', roughness: 0.65 }), stoneMat = mat({ color: '#9a978d' }), tileMat = mat({ color: '#3d4038', roughness: 0.9 }), dancheong = mat({ color: '#3f6b5c', roughness: 0.6 });
box(32, HALL_Y, 26, stoneMat, 0, HALL_Y / 2, -15); // 기단
for (let s = 0; s < 4; s++) box(12, HALL_Y * (s + 1) / 4, 0.8, stoneMat, 0, HALL_Y * (s + 1) / 8, -0.4 - s * 0.75); // 계단
const floorTex = tex(512, 512, (g, w, h) => { for (let y = 0; y < h; y += 32) { const c = 60 + rnd() * 16; g.fillStyle = `rgb(${c + 14},${c},${c - 10})`; g.fillRect(0, y, w, 31); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y + 31, w, 1); for (let k = 0; k < 20; k++) { g.fillStyle = `rgba(0,0,0,${rnd() * 0.12})`; g.fillRect(rnd() * w, y + rnd() * 30, 40 + rnd() * 120, 1); } } }, [4, 5]);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 22), mat({ map: floorTex, roughness: 0.55 }));
floor.rotation.x = -Math.PI / 2; floor.position.set(0, HALL_Y + 0.01, -15); scene.add(floor);
// 기둥
const colGeo = new THREE.CylinderGeometry(0.38, 0.42, 7.4, 14);
[[-13.4, -4], [-6.8, -4], [6.8, -4], [13.4, -4], [-13.4, -11], [13.4, -11], [-13.4, -18], [13.4, -18], [-13.4, -25], [13.4, -25]].forEach(([x, z]) => { const c = new THREE.Mesh(colGeo, woodRed); c.position.set(x, HALL_Y + 3.7, z); scene.add(c); });
// 벽 (뒤·옆, 옆에는 창살 사이로 빛)
const wallTex = tex(256, 128, (g, w, h) => { g.fillStyle = '#d9d2c2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#5a3a2a'; g.lineWidth = 3; for (let x = 8; x < w; x += 16) { g.beginPath(); g.moveTo(x, 10); g.lineTo(x, h - 10); g.stroke(); } for (let y = 10; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }, [3, 1]);
const sideWall = mat({ map: wallTex, emissive: '#3a3020', emissiveIntensity: 0.2 });
[-13.7, 13.7].forEach((x) => { const wm = new THREE.Mesh(new THREE.PlaneGeometry(21, 5), sideWall); wm.position.set(x, HALL_Y + 3.5, -15); wm.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(wm); });
// 후불벽: 구름과 연꽃 무늬 (VALIX 그림)
const muralTex = tex(1024, 320, (g, w, h) => {
  g.fillStyle = '#3a1e18'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) { const x = rnd() * w, y = rnd() * h, r = 8 + rnd() * 26; g.strokeStyle = rnd() < 0.5 ? 'rgba(94,140,112,.55)' : 'rgba(176,72,52,.45)'; g.lineWidth = 2 + rnd() * 3; g.beginPath(); g.arc(x, y, r, rnd() * 6, rnd() * 6 + 3.5); g.stroke(); }
  [[w / 2, 1], [w * 0.22, 0.75], [w * 0.78, 0.75]].forEach(([cx, s]) => { const gr = g.createRadialGradient(cx, h * 0.45, 0, cx, h * 0.45, 130 * s); gr.addColorStop(0, 'rgba(240,200,120,.5)'); gr.addColorStop(0.7, 'rgba(200,150,70,.2)'); gr.addColorStop(1, 'rgba(200,150,70,0)'); g.fillStyle = gr; g.fillRect(cx - 140 * s, 0, 280 * s, h); g.strokeStyle = 'rgba(232,190,110,.7)'; g.lineWidth = 3; g.beginPath(); g.arc(cx, h * 0.42, 100 * s, 0, 6.283); g.stroke(); });
  for (let i = 0; i < 40; i++) { const x = rnd() * w, y = h - 20 - rnd() * 60; g.fillStyle = 'rgba(214,120,110,.6)'; for (let p = 0; p < 5; p++) { g.beginPath(); g.ellipse(x + (p - 2) * 6, y, 5, 12, (p - 2) * 0.35, 0, 6.283); g.fill(); } }
});
const mural = new THREE.Mesh(new THREE.PlaneGeometry(26, 7.6), mat({ map: muralTex, emissive: '#2a140e', emissiveIntensity: 0.35 }));
mural.position.set(0, HALL_Y + 3.8, -26.6); scene.add(mural);
// 천장과 지붕
const ceil = box(28, 0.3, 24, mat({ color: '#2c1d15' }), 0, HALL_Y + 7.6, -15);
for (let z = -4; z >= -26; z -= 2.2) box(28, 0.35, 0.35, woodDark, 0, HALL_Y + 7.3, z);
box(30, 0.9, 0.7, dancheong, 0, HALL_Y + 7.2, -3.8); // 앞 도리 (단청 초록)
box(30, 0.25, 0.75, woodRed, 0, HALL_Y + 6.75, -3.8);
const roofL = box(36, 0.5, 18, tileMat, 0, 0, 0); roofL.position.set(0, HALL_Y + 10.2, -8.2); roofL.rotation.x = -0.42;
const roofR = box(36, 0.5, 18, tileMat, 0, 0, 0); roofR.position.set(0, HALL_Y + 10.2, -21.8); roofR.rotation.x = 0.42;
box(36, 0.6, 1, tileMat, 0, HALL_Y + 13.6, -15);
// 현판
const signTex = tex(512, 192, (g, w, h) => { g.fillStyle = '#2f4a3e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d8b56a'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20); g.lineWidth = 2; g.strokeRect(24, 24, w - 48, h - 48); g.fillStyle = '#e9c97e'; g.font = 'bold 92px "Noto Serif KR", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('고요당', w / 2, h / 2 - 6); g.font = '18px sans-serif'; g.fillStyle = '#b9a57a'; g.fillText('GOYO HALL · VALIX', w / 2, h - 38); });
const sign = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.4), mat({ map: signTex, emissive: '#1a2a22', emissiveIntensity: 0.4 }));
sign.position.set(0, HALL_Y + 8.7, -3.3); scene.add(sign);
// 연등 (처마 아래)
const lotusMat = mat({ color: '#f1b1a6', emissive: '#e88a7a', emissiveIntensity: 0.55, roughness: 0.6 });
const lanterns = [];
for (let x = -12; x <= 12; x += 3) { const g = new THREE.Group(); const l = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), lotusMat); l.scale.y = 0.8; g.add(l); const s = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1), woodDark); s.position.y = 0.8; g.add(s); g.position.set(x, HALL_Y + 6.1, -3.2); scene.add(g); lanterns.push(g); }
// 단상 · 불상 (단순한 형태)
const gold = new THREE.MeshStandardMaterial({ color: '#c79b45', metalness: 0.55, roughness: 0.32, emissive: '#3a2708', emissiveIntensity: 0.4 });
box(15, 1.1, 3.4, woodRed, 0, HALL_Y + 0.55, -23.8);
box(15.4, 0.15, 3.8, woodDark, 0, HALL_Y + 1.15, -23.8);
const buddha = new THREE.Group(); buddha.position.set(0, HALL_Y + 1.2, -24.2); scene.add(buddha);
const lotusBase = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.3, 0.7, 20), gold); lotusBase.position.y = 0.35; buddha.add(lotusBase);
const legs = new THREE.Mesh(new THREE.SphereGeometry(1.5, 20, 12), gold); legs.scale.set(1.05, 0.38, 0.8); legs.position.y = 0.95; buddha.add(legs);
const torso = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16), gold); torso.scale.set(0.95, 1.35, 0.7); torso.position.y = 2.1; buddha.add(torso);
const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 16), gold); bHead.position.y = 3.65; buddha.add(bHead);
const ush = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), gold); ush.position.y = 4.15; buddha.add(ush);
const halo = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.06, 8, 48), mat({ color: '#e7c47c', emissive: '#e7b45c', emissiveIntensity: 0.8 })); halo.position.set(0, 2.9, -0.6); buddha.add(halo);
const haloDisc = new THREE.Mesh(new THREE.CircleGeometry(1.85, 40), new THREE.MeshBasicMaterial({ color: '#e9c27a', transparent: true, opacity: 0.18 })); haloDisc.position.set(0, 2.9, -0.62); buddha.add(haloDisc);
[-4.8, 4.8].forEach((x) => { const f = new THREE.Group(); f.position.set(x, HALL_Y + 1.2, -24); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.7, 2.8, 14), gold); b.position.y = 1.4; f.add(b); const h = new THREE.Mesh(new THREE.SphereGeometry(0.36, 14, 10), gold); h.position.y = 3.05; f.add(h); scene.add(f); });
// 초 + 촛불 빛
const flames = [];
[-2.9, 2.9].forEach((x) => { box(0.18, 0.8, 0.18, mat({ color: '#efe6d2' }), x, HALL_Y + 1.6, -22.6); const f = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffcc77' })); f.scale.y = 1.8; f.position.set(x, HALL_Y + 2.1, -22.6); scene.add(f); const pl = new THREE.PointLight('#ffb35c', 6, 16, 1.6); pl.position.set(x, HALL_Y + 2.4, -22.2); scene.add(pl); flames.push([f, pl]); });
const hallLight = new THREE.PointLight('#ffd9a0', 10, 34, 1.4); hallLight.position.set(0, HALL_Y + 6.5, -12); scene.add(hallLight);
// 방석
const cushionMat = mat({ color: '#4d4b42', roughness: 0.95 }), cushions = [];
for (let z = -7.5; z >= -19.5; z -= 3) for (let x = -10.2; x <= 10.2; x += 3.4) { if (Math.abs(x) < 1.8) continue; const c = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 1.5), cushionMat); c.position.set(x, HALL_Y + 0.11, z); scene.add(c); cushions.push(c); }
// 석등 · 산문 · 나무
const lamp = (x, z) => { box(0.5, 1.4, 0.5, stoneMat, x, 0.7, z); box(1.1, 0.25, 1.1, stoneMat, x, 1.5, z); const lb = box(0.75, 0.75, 0.75, mat({ color: '#d8d0bc', emissive: '#ffcc80', emissiveIntensity: 0.6 }), x, 2.0, z); box(1.3, 0.3, 1.3, stoneMat, x, 2.5, z); return lb; };
lamp(-5.2, 9); lamp(5.2, 9);
const gate = new THREE.Group(); gate.position.set(0, 0, 36); scene.add(gate);
[-3.6, 3.6].forEach((x) => box(0.6, 6.5, 0.6, woodRed, x, 3.25, 0, gate));
box(10, 0.7, 0.9, dancheong, 0, 6.4, 0, gate); const gr2 = box(12, 0.4, 3.6, tileMat, 0, 7.1, 0, gate); gr2.rotation.x = 0.04;
const treeMat = [mat({ color: '#38503e' }), mat({ color: '#2e4535' }), mat({ color: '#4a5e3c' })];
for (let i = 0; i < 44; i++) { const side = i % 2 ? 1 : -1, x = side * (18 + rnd() * 40), z = 40 - rnd() * 90; const h = 6 + rnd() * 9; const t2 = new THREE.Mesh(new THREE.ConeGeometry(1.8 + rnd() * 1.6, h, 7), treeMat[i % 3]); t2.position.set(x, h / 2, z); scene.add(t2); }

/* ---------- 나 (작은 방랑자 스님) ---------- */
const robe = mat({ color: '#a9b4b6', roughness: 0.9 }), skin = mat({ color: '#e1b48a', roughness: 0.75 }), kasa = mat({ color: '#8a5a3c', roughness: 0.85 });
const me = new THREE.Group(); scene.add(me);
const hip = new THREE.Group(); hip.position.y = 0.55; me.add(hip);
const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 1.15, 16), robe); body.position.y = 0.45; hip.add(body);
const sash = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.15, 0.92), kasa); sash.position.set(0.05, 0.5, 0); sash.rotation.z = 0.55; hip.add(sash);
const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 16), skin); head.position.y = 1.42; hip.add(head);
[-1, 1].forEach((s) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), skin); e.position.set(0.49 * s, 1.42, 0); hip.add(e); });
const arm = (s) => { const g = new THREE.Group(); g.position.set(0.47 * s, 0.85, 0); const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.5, 4, 8), robe); a.position.y = -0.3; g.add(a); const h = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), skin); h.position.y = -0.62; g.add(h); g.rotation.z = 0.18 * s; hip.add(g); return g; };
const armL = arm(-1), armR = arm(1);
const feet = [-1, 1].map((s) => { const f = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), mat({ color: '#eeeae0' })); f.scale.set(1, 0.6, 1.4); f.position.set(0.2 * s, 0.08, 0); me.add(f); return f; });
const legsM = [-1, 1].map((s) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.45, 8), robe); l.position.set(0.2 * s, 0.32, 0); me.add(l); return l; });
const mokObj = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), mat({ color: '#8a5a2b' })); mokObj.scale.set(1.2, 0.85, 1); mokObj.visible = false; armL.add(mokObj); mokObj.position.set(0.25, -0.75, 0.15);
const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.75, 20), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.25, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; scene.add(shadow);
me.scale.setScalar(1.25);

/* ---------- 상태 ---------- */
const st = { x: 0, z: 30, y: 0, yaw: 0, speed: 0, phase: 0, pose: 'walk', poseT: 0, sitting: null, hap: false, bows: 0, beads: 0, joy: { x: 0, y: 0 }, keys: {}, dragYaw: 0, place: '' };
const opts = { tiltwalk: true, compass: true };
const base = { y: 0, x: 0, h: null, yaw: 0 };
function calibrate() { base.y = sensor.tiltY; base.x = sensor.tiltX; base.h = sensor.heading; base.yaw = st.yaw; st.dragYaw = 0; }

/* ---------- 소리 ---------- */
// iPhone은 무음 스위치가 켜져 있으면 Web Audio가 꺼짐 → '재생' 모드로 바꾸고, 소리 없는 오디오를 함께 틀어 둠
const IS_IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let unlockEl = null;
function silentWav() { const n = 4000, b = new Uint8Array(44 + n), v = new DataView(b.buffer), w = (o, s) => [...s].forEach((c, i) => { b[o + i] = c.charCodeAt(0); }); w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true); b.fill(128, 44); let s = ''; b.forEach((x) => { s += String.fromCharCode(x); }); return 'data:audio/wav;base64,' + btoa(s); }
function unlock() {
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
  if (IS_IOS) { if (!unlockEl) { unlockEl = document.createElement('audio'); unlockEl.src = silentWav(); unlockEl.loop = true; unlockEl.setAttribute('playsinline', ''); unlockEl.setAttribute('x-webkit-airplay', 'deny'); } unlockEl.play().catch(() => {}); }
  if (!ac) return;
  if (ac.state !== 'running') ac.resume().catch(() => {});
  const s = ac.createBufferSource(); s.buffer = ac.createBuffer(1, 1, 22050); s.connect(ac.destination); s.start(0); // 1샘플로 깨우기
}
let ac, master, amb, ambOut, chantG, noiseBuf, soundOn = false, chantOn = false;
function audio() {
  if (ac) return ac;
  ac = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
  // 휴대폰 스피커에서도 잘 들리게: 압축기로 전체 음량을 고르게 올림
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -22; comp.knee.value = 10; comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.25;
  const lim = ac.createDynamicsCompressor(); lim.threshold.value = -4; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.1; // 찢어지는 소리 방지
  const out = ac.createGain(); out.gain.value = 1.6; comp.connect(out).connect(lim).connect(ac.destination);
  master = ac.createGain(); master.gain.value = 1;
  const conv = ac.createConvolver(), len = ac.sampleRate * 3.5, ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  conv.buffer = ir; const wet = ac.createGain(); wet.gain.value = 0.35;
  master.connect(comp); master.connect(conv).connect(wet).connect(comp);
  amb = ac.createGain(); amb.gain.value = 0; amb.connect(master);
  ambOut = ac.createGain(); ambOut.gain.value = 1; ambOut.connect(amb);
  const noise = (sec, brown) => { const b = ac.createBuffer(1, ac.sampleRate * sec, ac.sampleRate), d = b.getChannelData(0); let l = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; if (brown) { l = (l + 0.02 * w) / 1.02; d[i] = l * 3.5; } else d[i] = w; } return b; };
  noiseBuf = noise(1);
  const loop = (buf) => { const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; };
  const wf = filt('lowpass', 500), wg = ac.createGain(); wg.gain.value = 0.07; loop(noise(4)).connect(wf).connect(wg).connect(ambOut);
  const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.06; lg.gain.value = 280; lfo.connect(lg).connect(wf.frequency); lfo.start();
  const bg = ac.createGain(); bg.gain.value = 0.1; loop(noise(5, true)).connect(filt('highpass', 300)).connect(filt('bandpass', 900, 0.6)).connect(bg).connect(ambOut);
  const room = ac.createGain(); room.gain.value = 0.05; loop(noise(5, true)).connect(filt('lowpass', 160)).connect(room).connect(amb); // 법당 안 공기
  (function bird() { if (soundOn && st.z > -2 && Math.random() < 0.6) { const n = 2 + (Math.random() * 4 | 0), b0 = 2400 + Math.random() * 1600; for (let i = 0; i < n; i++) setTimeout(() => blip(b0 * (1 + Math.random() * 0.15), b0 * (1.3 + Math.random() * 0.4), 0.06 + Math.random() * 0.06, 0.022), i * 120); } setTimeout(bird, 2500 + Math.random() * 6000); })();
  chantG = ac.createGain(); chantG.gain.value = 0; chantG.connect(master);
  // 다른 앱에서 돌아오거나 권한 창이 뜬 뒤 멈춘 소리를 다시 켬
  ac.onstatechange = () => { if (soundOn && !document.hidden && ac.state !== 'running') setTimeout(() => ac.resume().catch(() => {}), 300); };
  return ac;
}
function filt(type, f, q = 0.7) { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }
function env(g, t0, peak, dur, att = 0.003) { g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(peak, t0 + att); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); }
function blip(f0, f1, dur, vol) { const t0 = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f1, t0 + dur); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.connect(g).connect(amb); o.start(t0); o.stop(t0 + dur + 0.05); }
function partials(f, rs, dur, vol) { if (!ac || !soundOn) return; const t0 = ac.currentTime; rs.forEach(([r, a], i) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f * r; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol * a, t0 + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * (1 - i * 0.08)); o.connect(g).connect(master); o.start(t0); o.stop(t0 + dur + 0.1); }); }
const sound = {
  bell() { partials(82, [[1, 1], [2, 0.55], [2.41, 0.5], [2.98, 0.35], [4.17, 0.22], [5.43, 0.15], [0.5, 0.4]], 12, 0.3); },
  bowl() { partials(196, [[1, 1], [2.71, 0.4], [5.1, 0.2]], 8, 0.16); },
  bead() { partials(1320 + Math.random() * 80, [[1, 1], [2.4, 0.3]], 0.35, 0.07); },
  // 목탁: 속이 빈 나무를 치는 '똑' — 짧은 딸깍 + 몸통 울림 두 개
  mok(v = 0.8, when) {
    if (!ac || !soundOn) return; const t0 = Math.max(ac.currentTime, when || 0), r = 1 + (Math.random() - 0.5) * 0.03;
    const bus = ac.createGain(); bus.gain.value = v; bus.connect(master);
    const body = ac.createOscillator(), bg = ac.createGain(); body.frequency.setValueAtTime(760 * r, t0); body.frequency.exponentialRampToValueAtTime(640 * r, t0 + 0.06); env(bg, t0, 0.5, 0.17, 0.0015); body.connect(bg).connect(bus); body.start(t0); body.stop(t0 + 0.2);
    const low = ac.createOscillator(), lg = ac.createGain(); low.frequency.setValueAtTime(380 * r, t0); env(lg, t0, 0.28, 0.09, 0.002); low.connect(lg).connect(bus); low.start(t0); low.stop(t0 + 0.12);
    const hi = ac.createOscillator(), hg = ac.createGain(); hi.frequency.value = 1830 * r; env(hg, t0, 0.1, 0.04, 0.001); hi.connect(hg).connect(bus); hi.start(t0); hi.stop(t0 + 0.06);
    const n = ac.createBufferSource(), ng = ac.createGain(), nf = filt('bandpass', 2600, 1.4); n.buffer = noiseBuf; env(ng, t0, 0.4, 0.025, 0.0008); n.connect(nf).connect(ng).connect(bus); n.start(t0, Math.random() * 0.5, 0.05);
  },
};

/* ---------- 염불: 나무아미타불 (목소리 합성) ---------- */
// 사람 목소리처럼: 성대(톱니파) → 입 모양(포먼트 필터 3개). 세 사람이 함께 외는 소리 + 음절마다 목탁
const FM = { // [주파수, 세기] × 3 (낮은 남자 목소리)
  a: [[720, 1], [1100, 0.5], [2450, 0.18]],
  u: [[330, 1], [780, 0.32], [2250, 0.1]],
  i: [[290, 1], [2200, 0.26], [2950, 0.18]],
  m: [[260, 0.9], [1050, 0.05], [2300, 0.03]],
  n: [[260, 0.9], [1650, 0.07], [2600, 0.04]],
  l: [[380, 1], [1250, 0.22], [2650, 0.1]],
};
const BWS = [90, 120, 170];
const SYL = [ // 소리 · 첫소리 · 끝소리 · 음높이(배수) · 박자
  { k: '나', on: 'n', v: 'a', p: 1, b: 1 },
  { k: '무', on: 'm', v: 'u', p: 1, b: 1 },
  { k: '아', on: '', v: 'a', p: 9 / 8, b: 1 },
  { k: '미', on: 'm', v: 'i', p: 9 / 8, b: 1 },
  { k: '타', on: 't', v: 'a', p: 1, b: 1 },
  { k: '불', on: 'p', v: 'u', coda: 'l', p: 8 / 9, b: 2 },
];
const F0 = 108, BEAT = 0.5;
let voices = null, chantNext = 0, chantIdx = 0, chantTimer = 0;
function makeVoices() {
  return [[0, 0, 1, 0], [-9, 0.018, 0.75, -0.35], [7, 0.032, 0.7, 0.35]].map(([cents, lag, lvl, pan]) => {
    const o = ac.createOscillator(); o.type = 'sawtooth';
    const vib = ac.createOscillator(), vg = ac.createGain(); vib.frequency.value = 4.2 + Math.random() * 0.8; vg.gain.value = 1.1; vib.connect(vg).connect(o.frequency);
    const e = ac.createGain(); e.gain.value = 0;
    const p = ac.createStereoPanner ? ac.createStereoPanner() : ac.createGain(); if (p.pan) p.pan.value = pan;
    const f = BWS.map(() => filt('bandpass', 500, 5)), fg = BWS.map(() => ac.createGain());
    f.forEach((x, i) => { o.connect(x).connect(fg[i]).connect(e); });
    const br = ac.createBufferSource(), bg = ac.createGain(); br.buffer = noiseBuf; br.loop = true; bg.gain.value = 0.05; br.connect(bg); f.forEach((x) => bg.connect(x)); br.start(0, Math.random()); // 숨소리
    const chest = filt('lowpass', 220, 0.7), cg = ac.createGain(); cg.gain.value = 0.25; o.connect(chest).connect(cg).connect(e); // 가슴 울림
    e.connect(p).connect(chantG);
    o.start(); vib.start();
    return { o, f, fg, e, k: Math.pow(2, cents / 1200), lag, lvl: lvl * 0.5 };
  });
}
function shape(v, name, t, tau) { FM[name].forEach(([fr, a], i) => { v.f[i].frequency.setTargetAtTime(fr, t, tau); v.f[i].Q.setTargetAtTime(fr / BWS[i], t, tau); v.fg[i].gain.setTargetAtTime(a, t, tau); }); }
function burst(t, vol) { const n = ac.createBufferSource(), g = ac.createGain(), f = filt('bandpass', 3600, 1.2); n.buffer = noiseBuf; env(g, t, vol, 0.06, 0.004); n.connect(f).connect(g).connect(chantG); n.start(t, Math.random() * 0.5, 0.08); }
function sing(v, t, s, i) {
  const D = s.b * BEAT, L = v.lvl, eg = v.e.gain;
  v.o.frequency.setTargetAtTime(F0 * s.p * v.k, t, 0.035);
  if (s.on === 'n' || s.on === 'm') { shape(v, s.on, t, 0.012); eg.setTargetAtTime(L * 0.42, t, 0.015); shape(v, s.v, t + 0.085, 0.025); eg.setTargetAtTime(L, t + 0.085, 0.025); }
  else if (s.on === 't') { eg.setTargetAtTime(0, t, 0.006); shape(v, s.v, t, 0.01); if (i === 0) burst(t + 0.045, 0.16); eg.setTargetAtTime(L, t + 0.075, 0.02); }
  else if (s.on === 'p') { eg.setTargetAtTime(0, t, 0.006); shape(v, s.v, t, 0.01); eg.setTargetAtTime(L, t + 0.05, 0.02); }
  else { eg.setTargetAtTime(L * 0.25, t, 0.008); shape(v, s.v, t, 0.02); eg.setTargetAtTime(L, t + 0.03, 0.03); }
  if (s.coda) shape(v, s.coda, t + D * 0.45, 0.06);
  if (s.b > 1) { v.o.frequency.setTargetAtTime(F0 * s.p * v.k * 0.97, t + D * 0.5, 0.3); eg.setTargetAtTime(0, t + D - 0.28, 0.07); } // 길게 끌다 내려놓기
  else eg.setTargetAtTime(L * 0.8, t + D - 0.07, 0.02);
}
const capEl = $('.chant-cap');
function chantTick(ahead = 1.0) {
  if (!chantOn || !ac) return;
  while (chantNext < ac.currentTime + ahead) {
    const i = chantIdx % SYL.length, s = SYL[i], t = chantNext;
    voices.forEach((v, n) => sing(v, t + v.lag, s, n));
    sound.mok(i === 0 ? 0.85 : 0.65, t);
    if (s.b > 1) sound.mok(0.4, t + BEAT);
    setTimeout(() => { if (chantOn) capEl.querySelectorAll('b').forEach((b, j) => b.classList.toggle('on', j === i)); }, Math.max(0, (t - ac.currentTime) * 1000));
    if (chantIdx > 0 && i === 0 && (chantIdx / SYL.length) % 4 === 0) partials(196, [[1, 1], [2.71, 0.4], [5.1, 0.2]], 6, 0.07); // 네 번마다 경쇠
    chantNext += s.b * BEAT; chantIdx++;
  }
}
function chant(on) {
  chantOn = on; audio();
  if (on) {
    if (!voices) voices = makeVoices();
    chantNext = ac.currentTime + 0.35; chantIdx = 0;
    chantG.gain.cancelScheduledValues(ac.currentTime); chantG.gain.setTargetAtTime(1, ac.currentTime, 0.2);
    clearInterval(chantTimer); chantTimer = setInterval(chantTick, 200); chantTick();
    if (window.__snd) window.__snd.tick = chantTick;
  } else {
    clearInterval(chantTimer);
    chantG.gain.cancelScheduledValues(ac.currentTime); chantG.gain.setTargetAtTime(0, ac.currentTime, 0.4);
    if (voices) voices.forEach((v) => { v.e.gain.cancelScheduledValues(ac.currentTime); v.e.gain.setTargetAtTime(0, ac.currentTime + 0.6, 0.1); });
  }
  capEl.hidden = !on; capEl.querySelectorAll('b').forEach((b) => b.classList.remove('on'));
  updChant();
}

const sndBtn = $('[data-sound]');
function setSound(on) {
  soundOn = on; audio(); unlock();
  amb.gain.setTargetAtTime(on ? 1 : 0, ac.currentTime, 0.8);
  if (!on) { if (chantOn) chant(false); if (unlockEl) unlockEl.pause(); }
  sndBtn.setAttribute('aria-pressed', String(on));
}
sndBtn.addEventListener('click', () => setSound(!soundOn));
const chantBtn = $('[data-chant]');
function updChant() { chantBtn.classList.toggle('on', chantOn); chantBtn.querySelector('span').textContent = t(chantOn ? '염불 멈추기' : '염불 듣기'); }
chantBtn.addEventListener('click', () => { if (!soundOn) setSound(true); else unlock(); chant(!chantOn); });
// 손이 닿을 때마다 멈춘 소리가 있으면 다시 깨움 (iPhone)
addEventListener('touchend', () => { if (soundOn && ac && ac.state !== 'running') unlock(); }, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (!ac) return;
  if (document.hidden) { ac.suspend().catch(() => {}); if (unlockEl) unlockEl.pause(); }
  else if (soundOn) { unlock(); if (chantOn) { chantNext = ac.currentTime + 0.3; } }
});

/* ---------- 동작 ---------- */
const actBtns = (a) => document.querySelector(`[data-act="${a}"]`);
function doBow() {
  if (st.pose === 'bow') return;
  st.pose = 'bow'; st.poseT = 0; st.bows++; st.hap = false; actBtns('hap').classList.remove('on');
  sound.bowl(); if (IS_MOBILE) sensor.vibrate([40, 80, 40]);
  toast(lang === 'ko' ? `${st.bows}번째 절` : `${st.bows}${t('번째 절')}`, 1600);
}
function doMok() { st.pose = 'mok'; st.poseT = 0; mokObj.visible = true; sound.mok(); if (IS_MOBILE) sensor.vibrate(12); }
let beadHide = 0;
function doBead() {
  st.beads = (st.beads % 108) + 1; sound.bead(); if (IS_MOBILE) sensor.vibrate(6);
  const el = $('.beads'); el.hidden = false; $('.b-n').textContent = st.beads; clearTimeout(beadHide); beadHide = setTimeout(() => { el.hidden = true; }, 2500);
  if (st.beads === 108) { sound.bell(); toast(t('108번을 모두 굴렸어요')); }
}
function doHap() { st.hap = !st.hap; actBtns('hap').classList.toggle('on', st.hap); if (st.hap) { sound.bowl(); toast(t('두 손을 모읍니다'), 1400); } }
let zenStart = 0, zenTick = 0;
function zenIn() { if (!$('.zen').hidden) return; zenStart = Date.now(); $('.zen').hidden = false; if (ac) amb.gain.setTargetAtTime(0.3, ac.currentTime, 2); sound.bowl(); keepAwake(); zenTick = setInterval(() => { const s = Math.floor((Date.now() - zenStart) / 1000); $('.z-t').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }, 500); }
function zenOut() { if ($('.zen').hidden) return; clearInterval(zenTick); $('.zen').hidden = true; if (ac) amb.gain.setTargetAtTime(soundOn ? 1 : 0, ac.currentTime, 1.5); sound.bell(); if (IS_MOBILE) sensor.vibrate([200, 150, 200]); const s = Math.round((Date.now() - zenStart) / 1000); toast(`${Math.floor(s / 60)}${t('분')}${s % 60}${t('초')} ${t('동안 머물렀어요')}`, 3200); }
function sitDown(c) {
  st.sitting = c; st.x = c.position.x; st.z = c.position.z + 0.05; st.yaw = 0; st.pose = 'sit'; st.hap = true; actBtns('hap').classList.add('on');
  base.yaw = 0; if (base.h != null) base.h = sensor.heading; st.dragYaw = 0;
  sound.bowl(); hint(t(IS_MOBILE && sensor.on ? '방석에 앉았어요 · 휴대폰을 엎어 두면 좌선' : "방석에 앉았어요 · '눈 감기'로 좌선"), 7000);
}
function standUp() { if (!st.sitting) return; st.sitting = null; st.pose = 'walk'; st.hap = false; actBtns('hap').classList.remove('on'); }
document.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => {
  audio(); if (!soundOn) setSound(true);
  const a = b.dataset.act;
  if (a === 'bow') doBow(); else if (a === 'mok') doMok(); else if (a === 'beads') doBead(); else if (a === 'hap') doHap();
  else if (a === 'sit') { if (st.sitting) zenIn(); else if (nearCushion) sitDown(nearCushion); }
}));
$('.z-out').addEventListener('click', zenOut);
// 센서 동작
sensor.onShake((f) => { if (started && $('.zen').hidden && f > 0.3) doMok(); });
let downAt = 0;
sensor.onFaceDown((down) => {
  if (!started) return;
  if (st.sitting) { down ? zenIn() : zenOut(); return; }
  if (down) downAt = Date.now(); else if (downAt && Date.now() - downAt < 8000) { downAt = 0; doBow(); }
});
sensor.onSpin(() => { if (started && $('.zen').hidden) doBead(); });

/* ---------- 설정 ---------- */
const sheetEl = $('.sheet'), sbg = $('.sheet-bg');
const openSheet = (o) => { sheetEl.hidden = sbg.hidden = !o; };
$('[data-settings]').addEventListener('click', () => openSheet(true));
sbg.addEventListener('click', () => openSheet(false)); $('[data-close]').addEventListener('click', () => openSheet(false));
document.querySelectorAll('[data-opt]').forEach((i) => i.addEventListener('change', () => { opts[i.dataset.opt] = i.checked; calibrate(); }));
$('[data-recal]').addEventListener('click', () => { calibrate(); openSheet(false); toast('✓', 900); });

/* ---------- 입력: 끌기 · 키보드 ---------- */
let drag = null;
canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, id: e.pointerId }; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', (e) => { if (!drag || e.pointerId !== drag.id) return; st.joy.x = Math.max(-1, Math.min(1, (e.clientX - drag.x) / 90)); st.joy.y = Math.max(-1, Math.min(1, (drag.y - e.clientY) / 90)); });
const endDrag = () => { drag = null; st.joy.x = st.joy.y = 0; };
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
addEventListener('keydown', (e) => { st.keys[e.key.toLowerCase()] = true; if (e.key === ' ' && started) { e.preventDefault(); doMok(); } });
addEventListener('keyup', (e) => { st.keys[e.key.toLowerCase()] = false; });

/* ---------- 움직임 ---------- */
let nearCushion = null;
const sitBtn = actBtns('sit');
function groundY(x, z) { if (z < -3.1) return HALL_Y; if (z < 0) return HALL_Y * Math.min(1, -z / 3); return 0; }
function step(dt) {
  const k = st.keys;
  let fwd = (k.w || k.arrowup ? 1 : 0) - (k.s || k.arrowdown ? 1 : 0) + st.joy.y;
  let turn = (k.a || k.arrowleft ? 1 : 0) - (k.d || k.arrowright ? 1 : 0) - st.joy.x;
  const sens = IS_MOBILE && sensor.on;
  if (sens && opts.tiltwalk && $('.zen').hidden) { const p = sensor.tiltY - base.y; if (p < -0.1) fwd += Math.min(1, (-p - 0.1) * 3); else if (p > 0.3) fwd -= Math.min(0.6, (p - 0.3) * 2); }
  st.dragYaw += turn * dt * 1.9;
  if (sens && opts.compass && sensor.heading != null && base.h != null) { let d = sensor.heading - base.h; d = ((d + 540) % 360) - 180; const target = base.yaw - d * Math.PI / 180 + st.dragYaw; let dd = target - st.yaw; dd = Math.atan2(Math.sin(dd), Math.cos(dd)); st.yaw += dd * Math.min(1, dt * 6); }
  else { if (sens && opts.tiltwalk && Math.abs(sensor.tiltX - base.x) > 0.2) st.dragYaw -= (sensor.tiltX - base.x) * dt * 1.6; st.yaw = base.yaw + st.dragYaw; }
  fwd = Math.max(-0.6, Math.min(1, fwd));
  if (st.sitting && Math.abs(fwd) > 0.3) standUp();
  if (st.sitting || st.pose === 'bow') fwd = 0;
  st.speed += (fwd * 4.2 - st.speed) * Math.min(1, dt * 6);
  const nx = st.x - Math.sin(st.yaw) * st.speed * dt, nz = st.z - Math.cos(st.yaw) * st.speed * dt;
  let ox = Math.max(-16, Math.min(16, nx)), oz = Math.max(-21, Math.min(40, nz));
  if (oz < -3.1) ox = Math.max(-12.4, Math.min(12.4, ox));
  if (oz < 0.6 && oz > -3.4 && Math.abs(ox) > 5.6) { if (st.z >= 0.6) oz = 0.6; else if (st.z <= -3.4) oz = -3.4; else ox = Math.sign(ox) * 5.6; } // 계단으로만
  if (!st.sitting) { st.x = ox; st.z = oz; }
  st.y += (groundY(st.x, st.z) - st.y) * Math.min(1, dt * 10);
  // 가까운 방석
  nearCushion = null; let best = 1.6;
  if (!st.sitting) for (const c of cushions) { const d = Math.hypot(c.position.x - st.x, c.position.z - st.z); if (d < best) { best = d; nearCushion = c; } }
  sitBtn.hidden = !(nearCushion || st.sitting); sitBtn.querySelector('span').textContent = t(st.sitting ? '눈 감기' : '앉기');
  // 위치 이름
  const place = st.z < -1 ? '고요당' : st.z < 14 ? '마당' : '산문';
  if (place !== st.place) { st.place = place; const el = $('.place'); el.textContent = t(place); }
}
function animate(dt, time) {
  st.phase += Math.abs(st.speed) * dt * 2.6; st.poseT += dt;
  const walking = Math.abs(st.speed) > 0.25 && !st.sitting;
  me.position.set(st.x, st.y, st.z); me.rotation.y = st.yaw;
  shadow.position.set(st.x, st.y + 0.02, st.z);
  const sw = walking ? Math.sin(st.phase * 3) : 0;
  hip.position.y = 0.55 + (walking ? Math.abs(Math.cos(st.phase * 3)) * 0.06 : Math.sin(time * 1.5) * 0.01);
  hip.rotation.x = 0; hip.position.z = 0;
  feet[0].position.z = sw * 0.22; feet[1].position.z = -sw * 0.22; legsM[0].position.z = sw * 0.12; legsM[1].position.z = -sw * 0.12;
  let la = { x: sw * 0.5, z: -0.18 }, ra = { x: -sw * 0.5, z: 0.18 };
  if (st.hap || st.pose === 'sit') { la = { x: 1.25, z: 0.55 }; ra = { x: 1.25, z: -0.55 }; }
  if (st.pose === 'bow') {
    const T = 2.6, p = Math.min(1, st.poseT / T), s = Math.sin(p * Math.PI);
    hip.rotation.x = -s * 1.15; hip.position.y = 0.55 - s * 0.45; hip.position.z = -s * 0.2; la = { x: 1.2 + s * 0.6, z: 0.45 }; ra = { x: 1.2 + s * 0.6, z: -0.45 };
    if (p >= 1) st.pose = st.sitting ? 'sit' : 'walk';
  }
  if (st.pose === 'mok') { const p = st.poseT / 0.3; ra = { x: 1.1 - Math.abs(Math.sin(p * Math.PI)) * 0.5, z: -0.2 }; la = { x: 0.9, z: 0.3 }; if (st.poseT > 0.35) { st.pose = st.sitting ? 'sit' : 'walk'; setTimeout(() => { if (st.pose !== 'mok') mokObj.visible = false; }, 1200); } }
  if (st.sitting) { hip.position.y = 0.2 + Math.sin(time * 0.8) * 0.012; feet.forEach((f) => f.position.set(f.position.x, 0.12, -0.35)); legsM.forEach((l) => { l.visible = false; }); } else legsM.forEach((l) => { l.visible = true; });
  armL.rotation.x += (la.x - armL.rotation.x) * Math.min(1, dt * 10); armL.rotation.z += (la.z - armL.rotation.z) * Math.min(1, dt * 10);
  armR.rotation.x += (ra.x - armR.rotation.x) * Math.min(1, dt * 10); armR.rotation.z += (ra.z - armR.rotation.z) * Math.min(1, dt * 10);
  // 연등 흔들림 · 촛불
  lanterns.forEach((l, i) => { l.rotation.z = Math.sin(time * 0.9 + i) * 0.06; });
  flames.forEach(([f, pl], i) => { const k = 1 + Math.sin(time * 13 + i * 3) * 0.1 + Math.sin(time * 7.3 + i) * 0.08; f.scale.set(1, 1.8 * k, 1); pl.intensity = 6 * k; });
  // 카메라: 뒤에서 따라감 (앉으면 가까이)
  const dist = st.sitting ? 5.6 : 6.4, hgt = st.sitting ? 4.2 : 3.4;
  const cx = st.x + Math.sin(st.yaw) * dist, cz = st.z + Math.cos(st.yaw) * dist, cy = st.y + hgt;
  camera.position.x += (cx - camera.position.x) * Math.min(1, dt * 4); camera.position.z += (cz - camera.position.z) * Math.min(1, dt * 4); camera.position.y += (cy - camera.position.y) * Math.min(1, dt * 4);
  camera.lookAt(st.x - Math.sin(st.yaw) * (st.sitting ? 9 : 5), st.y + (st.sitting ? 2.6 : 1.9), st.z - Math.cos(st.yaw) * (st.sitting ? 9 : 5));
  // 이름표
  const v = new THREE.Vector3(st.x, st.y + 2.7, st.z).project(camera);
  tag.style.left = `${(v.x * 0.5 + 0.5) * innerWidth}px`; tag.style.top = `${(-v.y * 0.5 + 0.5) * innerHeight}px`;
}
// 이름표: VALIX 앱의 항해명이 있으면 그 이름
let nick = '느린 방랑자'; try { const p = JSON.parse(localStorage.getItem('valix-me')); if (p && p.nick) nick = p.nick; } catch (e) {}
const tag = document.createElement('div'); tag.className = 'tag'; tag.innerHTML = `<i>${t('나')}</i><span></span>`; tag.querySelector('span').textContent = nick; $('#tags').appendChild(tag);

/* ---------- 시작 ---------- */
let started = false; if (location.hash === "#debug") { window.__st = st; window.__base = base; window.__snd = { sound, chant, setSound, get ac() { return ac; } }; }
camera.position.set(0, 5, 40);
const gateEl = $('#gate'), enterBtn = $('#enter');
setTimeout(() => { enterBtn.disabled = false; $('.g-state').style.visibility = 'hidden'; }, 900);
enterBtn.addEventListener('click', async () => {
  setSound(true); keepAwake();
  if (IS_MOBILE) { await sensor.enable(); setTimeout(calibrate, 400); }
  started = true; gateEl.classList.add('out'); setTimeout(() => gateEl.remove(), 1000);
  document.querySelectorAll('.hud-top, .hud-bot, [data-chant]').forEach((el) => { el.hidden = false; });
  hint(t(IS_MOBILE && sensor.on ? '앞으로 기울이면 걸어요 · 몸을 돌려 방향을 바꿔요' : '화면을 위로 끌면 걸어요 · 좌우로 끌면 돌아요'), 7000);
});
let last = performance.now();
(function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (started) step(dt);
  animate(dt, now / 1000);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
})(last);
