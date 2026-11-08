// NEBULA 전시 페이지 — 모바일 전용 센서 안내 · 진동 · 제스처 (cell.js가 휴대폰에서만 불러옴)
// 각 블록의 센서 효과 자체는 cell.js 안에 있고, 이 파일은 '지금 할 수 있는 동작' 안내와 공통 제스처를 맡습니다.
import { sensor } from './sensors.js?v=3';
import { DICT } from './i18n-dict.js?v=5';
import { tr } from './i18n.js?v=5';

// 이 파일에서 쓰는 문구 번역 (한국어 = 키) [en, zh, ja]
const WORDS = {
  '화면을 한 번 눌러 센서 체험 켜기': ['Tap once to turn on motion play', '轻点一次开启感应体验', '一度タップしてセンサー体験をオン'],
  '기울이면 별이 흐르는 방향이 바뀌어요 · 누르고 있으면 빛의 속도로': ['Tilt to steer the stars · hold to go light-speed', '倾斜改变星流方向 · 按住进入光速', '傾けると星の流れが変わる · 長押しで光速へ'],
  '몸을 돌리면 우주가 함께 돌아요': ['Turn around and the universe turns with you', '转身，宇宙随你旋转', '体を回すと宇宙も回ります'],
  '기울여 별을 둘러보세요': ['Tilt to look around the stars', '倾斜环顾星空', '傾けて星を見渡す'],
  '흔들어 관측 · 기울이면 구름이 움직여요 · 엎어두면 다시 중첩': ['Shake to observe · tilt to move the cloud · lay face down to un-observe', '摇晃观测 · 倾斜移动云 · 朝下放置回到叠加', '振って観測 · 傾けて雲が動く · 伏せると重ね合わせに'],
  '화면을 보며 폰을 돌리면 프리즘이 돌아요 · 기울여 빛': ['Rotate your phone to turn the prism · tilt for light', '面对屏幕旋转手机，棱镜跟着转 · 倾斜移动光', '画面を見たまま回すとプリズムが回る · 傾けて光'],
  '기울여 빛을 옮기고 · 흔들면 상자가 돌고 · 엎어두면 빛이 꺼져요': ['Tilt to move the light · shake to spin · lay face down to turn it off', '倾斜移动光 · 摇晃让方块旋转 · 朝下放置熄灭光', '傾けて光を動かす · 振ると箱が回る · 伏せると光が消える'],
  '기울여 도시를 걷고 · 몸을 돌려 소리의 방향을 · 흔들면 새 장소': ['Tilt to walk the city · turn to hear direction · shake for a new place', '倾斜在城市中行走 · 转身听方向 · 摇晃打开新地点', '傾けて街を歩く · 体を回して音の方向を · 振ると新しい場所'],
  '마이크를 켜면 큰 소리에 폰이 떨려요': ['Turn on the mic — loud sounds make your phone buzz', '打开麦克风，声音大时手机会振动', 'マイクをオンにすると大きな音で震えます'],
  '기울이면 파형이 휘어요 · 흔들면 출렁': ['Tilt to bend the waves · shake to surge', '倾斜让波形弯曲 · 摇晃使其起伏', '傾けると波形が曲がる · 振ると揺れる'],
  '기울이면 음이 휘어요 · 흔들면 화음이 흩어져요': ['Tilt to bend the pitch · shake to scatter a chord', '倾斜让音高弯曲 · 摇晃散开和弦', '傾けると音が揺らぐ · 振ると和音が散る'],
  '기울여 빛줄기를 움직여요': ['Tilt to move the beams', '倾斜移动光束', '傾けて光の筋を動かす'],
  '흔들면 파문이 퍼져요': ['Shake to send ripples', '摇晃扩散涟漪', '振ると波紋が広がる'],
  '천천히 내리면 시간의 마디가 손끝에 닿아요': ['Scroll slowly to feel each moment in your hand', '慢慢滑动，感受时间的节点', 'ゆっくり下ろすと時の節目が指先に'],
  '화면을 보며 폰을 빠르게 돌리면 다음 행성으로': ['Spin your phone to fly to the next planet', '面对屏幕快速旋转手机，前往下一颗行星', '画面を見たまま素早く回すと次の惑星へ'],
  '보지 않는 동안, 다시 중첩으로 돌아갔어요': ['While no one looked, it returned to superposition', '没人看的时候，它又回到了叠加态', '見ていない間に、重ね合わせに戻りました'],
  '기울이거나 눌러서 빛의 각도 바꾸기': ['Tilt or touch to change the light angle', '倾斜或触摸改变光的角度', '傾けるかタッチで光の角度を変える'],
  '빛이 없으면 그림자도 없다': ['No light, no shadow', '没有光，就没有影子', '光がなければ影もない'],
};
const IDX = { en: 0, zh: 1, ja: 2 };
Object.entries(WORDS).forEach(([ko, a]) => Object.entries(IDX).forEach(([l, i]) => { DICT[l][ko] = a[i]; }));

// 화면 안의 블록별 안내 (먼저 맞는 것)
const HINTS = [
  ['.b-cosmos', '기울이면 별이 흐르는 방향이 바뀌어요 · 누르고 있으면 빛의 속도로', 'tilt'],
  ['.b-quantum', '흔들어 관측 · 기울이면 구름이 움직여요 · 엎어두면 다시 중첩', 'shake'],
  ['.b-prism', '화면을 보며 폰을 돌리면 프리즘이 돌아요 · 기울여 빛', 'spin'],
  ['.b-shadow', '기울여 빛을 옮기고 · 흔들면 상자가 돌고 · 엎어두면 빛이 꺼져요', 'tilt'],
  ['.b-soundmap', '기울여 도시를 걷고 · 몸을 돌려 소리의 방향을 · 흔들면 새 장소', 'walk'],
  ['.b-listen', '마이크를 켜면 큰 소리에 폰이 떨려요', 'mic'],
  ['.b-wave', '기울이면 파형이 휘어요 · 흔들면 출렁', 'tilt'],
  ['.b-piano', '기울이면 음이 휘어요 · 흔들면 화음이 흩어져요', 'tilt'],
  ['.b-timeline', '천천히 내리면 시간의 마디가 손끝에 닿아요', 'touch'],
  ['.b-end', '화면을 보며 폰을 빠르게 돌리면 다음 행성으로', 'spin'],
  ['.b-cover:has(.beam-cv)', '기울여 빛줄기를 움직여요', 'tilt'],
  ['.b-cover:has(.rip-cv)', '흔들면 파문이 퍼져요', 'shake'],
  ['.b-cover:has(.star-cv)', '기울여 별을 둘러보세요', 'tilt'],
];
const ICON = {
  tilt: '<path d="M7 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" transform="rotate(-14 11 12)"/><path d="M19 8c1 1.2 1.5 2.6 1.5 4M3.5 12c0-1.4.5-2.8 1.5-4"/>',
  shake: '<rect x="8" y="3" width="8" height="18" rx="2"/><path d="M4 8l-1.5 2L4 12l-1.5 2L4 16M20 8l1.5 2L20 12l1.5 2L20 16"/>',
  spin: '<rect x="8" y="5" width="8" height="14" rx="2"/><path d="M4 12a8 8 0 0 1 13-6.2M20 12a8 8 0 0 1-13 6.2M17 3v3h-3M7 21v-3h3"/>',
  walk: '<circle cx="12" cy="12" r="8"/><path d="M12 4v3M12 12l4-5"/><circle cx="12" cy="12" r="1.5"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  touch: '<path d="M9 11V5a2 2 0 0 1 4 0v6M13 10a2 2 0 0 1 4 0v4a6 6 0 0 1-6 6h-1a5 5 0 0 1-4-2l-3-4 1-1a2 2 0 0 1 3 0l1 1"/>',
};

const css = document.createElement('style');
css.textContent = `
.mx-chip{position:fixed;z-index:12;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 16px);transform:translate(-50%,24px);opacity:0;display:flex;align-items:center;gap:10px;max-width:calc(100vw - 32px);padding:10px 16px 10px 12px;border-radius:999px;background:rgba(12,13,22,.78);border:1px solid rgba(255,255,255,.14);color:#f2f3f8;font-size:12.5px;line-height:1.4;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);transition:opacity .4s,transform .45s cubic-bezier(.2,.9,.2,1);pointer-events:none}
.mx-chip.on{opacity:1;transform:translate(-50%,0)}
.mx-chip svg{width:22px;height:22px;flex-shrink:0;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.mx-chip.tilt svg{animation:mx-tilt 2.2s ease-in-out infinite}.mx-chip.shake svg{animation:mx-shake 1.2s ease-in-out infinite}.mx-chip.spin svg{animation:mx-spin 3s linear infinite}.mx-chip.walk svg{animation:mx-walk 2.4s ease-in-out infinite}.mx-chip.mic svg,.mx-chip.touch svg{animation:mx-pulse 1.6s ease-in-out infinite}
@keyframes mx-tilt{50%{transform:rotate(22deg)}}@keyframes mx-shake{10%,30%,50%{transform:translateX(-3px)}20%,40%{transform:translateX(3px)}60%{transform:none}}@keyframes mx-spin{to{transform:rotate(360deg)}}@keyframes mx-walk{50%{transform:rotate(-40deg)}}@keyframes mx-pulse{50%{transform:scale(1.15)}}
.mx-chip.ask{pointer-events:auto}
.q-stage.unseen{filter:brightness(.25) blur(2px);transition:filter .8s}
@media (prefers-reduced-motion:reduce){.mx-chip svg{animation:none!important}}`;
document.head.appendChild(css);

const chip = document.createElement('div');
chip.className = 'mx-chip'; chip.setAttribute('aria-live', 'polite');
document.body.appendChild(chip);
let shown = '', hideT = 0;
function show(key, kind) {
  if (shown === key) return; shown = key;
  chip.className = 'mx-chip ' + kind; chip.innerHTML = `<svg viewBox="0 0 24 24">${ICON[kind] || ICON.tilt}</svg><span>${tr(key)}</span>`;
  requestAnimationFrame(() => chip.classList.add('on'));
  clearTimeout(hideT); hideT = setTimeout(() => chip.classList.remove('on'), 6500); // 잠깐 보였다가 들어감
}
function hide() { if (!shown) return; shown = ''; chip.classList.remove('on'); }

// 지금 화면 가운데에 있는 블록의 안내
function current() {
  const y = innerHeight * 0.5;
  for (const [sel, key, kind] of HINTS) {
    for (const el of document.querySelectorAll(sel)) { const r = el.getBoundingClientRect(); if (r.top < y && r.bottom > y * 0.6) return [key, kind]; }
  }
  return null;
}
let ticking = false;
function update() {
  ticking = false;
  if (!sensor.on) { show('화면을 한 번 눌러 센서 체험 켜기', 'touch'); chip.classList.add('ask'); return; }
  chip.classList.remove('ask');
  const c = current(); c ? show(c[0], c[1]) : hide();
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
addEventListener('click', () => setTimeout(update, 600), true);
setTimeout(update, 1500);

// 진동: 타임라인의 한 마디, 네 장면의 한 단계를 지날 때 '톡'
const tickIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && sensor.on) sensor.vibrate(e.target.matches('.step') ? 14 : 9); }), { rootMargin: '-48% 0px -48% 0px' });
const watch = () => {
  document.querySelectorAll('.b-timeline li, .b-sticky .step').forEach((el) => { if (!el._mx) { el._mx = 1; tickIO.observe(el); } });
  // PC용 '마우스/커서' 안내를 휴대폰용으로
  document.querySelectorAll('.b-prism .q-tip, .b-shadow .q-tip').forEach((el) => { el.textContent = tr('기울이거나 눌러서 빛의 각도 바꾸기'); });
  document.querySelectorAll('.q-stage .q-tip').forEach((el) => { el.textContent = tr('흔들어 관측 · 기울이면 구름이 움직여요 · 엎어두면 다시 중첩'); });
};
watch(); new MutationObserver(watch).observe(document.getElementById('story') || document.body, { childList: true, subtree: false });

// 끝 블록에서 폰을 돌리면 다음 행성(또는 다음 방)으로
sensor.onSpin(() => {
  const end = [...document.querySelectorAll('.b-end')].find((el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight * 0.7 && r.bottom > innerHeight * 0.3; });
  const a = end && end.querySelector('a.next');
  if (a) { sensor.vibrate([30, 60, 30, 60, 120]); a.click(); }
});
