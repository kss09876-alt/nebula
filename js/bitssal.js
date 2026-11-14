// A-003 · 빛쌀 — 한 톨의 쌀을 따라가는 연속 스크롤 이야기
// 사실 서술 출처: 진실·화해를위한과거사정리위원회 「대구10월사건 관련 민간인 희생 사건」(jinsil.go.kr/KoreanWar/30.do),
//                「경산 코발트광산 사건」(jinsil.go.kr/KoreanWar/36.do)
import { sound } from './bitssal-sound.js?v=7';
import { lang, tr, langSwitcher } from './i18n.js?v=6';
import { videoHTML, mountVideos, playVideo, onVideo, stopVideos } from './video.js?v=2';
import { IS_MOBILE, sensor, startCamera, startMic, getPosition, distanceKm, keepAwake } from './sensors.js?v=4';
import { buildScenes, YEARS_AT } from './bitssal-scenes.js?v=5';
import { facePoints, drawPortrait } from './bitssal-faces.js?v=3';
import * as MB from './membership.js?v=6';
// 화면 문구 (읽기 → 체험 · 내레이션)
const LX = ({
  ko: { play: '체험', wait: '위의 이야기를 다 읽으면 체험이 열려요', next: '이야기를 다 읽으면, 아래에서 직접 해 볼 수 있어요.', narr: '내레이션', listen: '듣기', stop: '멈춤', chapter: '장' },
  en: { play: 'Experience', wait: 'This opens once you finish the story above', next: 'When you finish reading, try it yourself just below.', narr: 'Narration', listen: 'Listen', stop: 'Stop', chapter: 'Chapter' },
  zh: { play: '体验', wait: '读完上面的故事后即可体验', next: '读完故事后，可以在下方亲自体验。', narr: '旁白', listen: '收听', stop: '停止', chapter: '第' },
  ja: { play: '体験', wait: '上の物語を読み終えると体験できます', next: '読み終えたら、すぐ下で体験できます。', narr: 'ナレーション', listen: '聴く', stop: '停止', chapter: '章' },
})[lang] || {};
const SRC1 = tr('진실·화해를위한과거사정리위원회, 「대구10월사건 관련 민간인 희생 사건」');
const SRC2 = tr('진실·화해를위한과거사정리위원회, 「경산 코발트광산 사건」');
const RICE = [255, 248, 230], DIM = [92, 86, 76], RED = [200, 56, 47], WARM = [255, 214, 150];

// ---------------- 미디어 (드라이브 공개 폴더) ----------------
const PH = ['15d1sLu91hipfxO8ddm25u4n7qco7alsc','1MY-CUpUsRSLZhghj0w4i4Hs9bEIZyedL','1ngIx4QLpCHLUA4gwIs5opQ3-g_Uvly5F','1TmD4uyMaMPUqZ5cmIoXWmJeug_JH4n-r','1b4IlSDkHVz2AL_8yG5RsFD62BuCJUcxB','1BHTfhpn-EvynJodo8UQmRpupzAh210pR','1eCURrQmRTLJ-FGiTsDyi0gMN497RFX6P','1YffnDcS7W363-XxsYjjfisna8hSVAn-u','1W0tIK-Gyjw_SCmZQllLGlt2v1ApChOTQ','12FADaTqwJsGPUoeIyqiBeXA-f6rMaZZ7'];
const VD = { main: '1IskIt7_532XzkI-EFmp4HIVoULe07rLm', acc: '1IhotvWTDYgaouAzXPX6IeqXgYHuP4oK-', dark: '1LVBEhxrpaSxzqn0ySEGwjK_WLLLcJ6uZ', light: '1sOsHOO04lWBDgpbmUepU-k42aVMKaksF', doc: '1Ri0vh-D6Hi3DG4noeNJVElIxuYVJLzZi',
  p1: '1eUCOhBt45uu0yZlK_c6Vz0jqUCBbeiBr', p2: '1dMtHJBziALi63Wsqe0ZXONfMbJuNlzjD', p3: '1seN9QKF6RN7IsgijglWuXJYn1K-QFpRh', p4: '1lt1-A70xBVklii3ASgWHdZsjNP_c1xo8', p5: '1mHd8BkmPC2keoUjIaxlUcn2Jc024PxXg', p6: '1GI-K6Pog-J2UPQ9Ns4r07qOTaStNG8Kw' };
const WORK = tr('진시영 · 김동선, 《빛쌀》, 2026');
const img = (id, w = 1400) => `https://lh3.googleusercontent.com/d/${id}=w${w}`;
const thumb = (id) => `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
const photo = (k, cap) => ({ kind: 'photo', id: PH[k], cap: cap || tr('작품 사진 — {w}', { w: WORK }) });
const vid = (id, cap, title) => ({ kind: 'vid', id, cap, title });

// ---------------- 장면 정의 (bitssal-scenes.js) ----------------
// 이야기 중심: 장면마다 순이의 이야기 → 이야기에 맞춘 조작 → 짧은 기록
const TOUCH = matchMedia('(hover: none), (pointer: coarse)').matches;
// 유료 전시(c005): 입장권·멤버십이 없으면 앞 장면 몇 개만 보여 주고 안내 (결제가 꺼져 있으면 모두 열림)
const CELL = { id: 'c005', title: '빛쌀' };
const LOCKED = !MB.canView(CELL);
const { SCENES: ALL_SCENES, UI, NOTE, LABEL, PARTS } = buildScenes({ lang, IS_MOBILE, TOUCH, PH, VD, photo, vid, SRC1, SRC2 });
const SCENES = LOCKED ? ALL_SCENES.slice(0, MB.previewCount(CELL)) : ALL_SCENES;
const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
const CREDITS = `<footer class="bs-credits"><div>
  <h3>${tr('출처와 안내')}</h3>
  <p>${NOTE}</p>
  <p>${tr('역사 서술: ')}${SRC1}(jinsil.go.kr/KoreanWar/30.do), ${SRC2}(jinsil.go.kr/KoreanWar/36.do)</p>
  <p>${tr('밥상·약도·광산 통로 장면은 이해를 돕기 위한 일러스트이며 실제 장소나 인물을 재현하지 않습니다. ‘전시 문안’으로 표시된 문장은 창작 문안으로, 희생자나 유족의 실제 발언이 아닙니다.')}</p>
  <p>${tr('작품: 진시영 · 김동선, 《빛쌀》, 2026 · 기획: ARTMOS (VALIX LAB)')}</p>
  <a class="bs-back" href="./">${tr('← ARTMOS 행성계로 돌아가기')}</a></div></footer>`;

// ---------------- DOM 구성 ----------------
const story = document.getElementById('story');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
story.innerHTML = SCENES.map((s, si) => `<section class="scene" id="s-${s.id}" data-i="${si}" data-h="${s.h}" style="height:${s.h}vh">${s.cards.map((c, ci) => cardHTML(s, c, si, ci)).join('')}</section>`).join('') + (LOCKED ? MB.paywallHTML(CELL) : '') + CREDITS;
if (LOCKED) story.addEventListener('click', (e) => { MB.handleMembershipClick(e, { notify: (m) => { const el = document.querySelector('#paywall .mb-state'); if (el) el.textContent = m; }, refresh: () => location.reload() }); });
else MB.enter(CELL).then(MB.passChip); // 입장권이면 이때 24시간 시작
if (window === window.top) import('./app-shop.js?v=4').then((SHOP) => SHOP.loadShop().then(() => { const box = document.querySelector('.bs-credits > div'), html = SHOP.collectBannerHTML(CELL.id); if (box && html) box.insertAdjacentHTML('afterbegin', html); })).catch(() => {}); // 웹에서만
// 카드가 길어져도(작은 화면·번역·이야기 카드) 서로 겹치지 않게: 원래 자리보다 위로는 안 올리고, 앞 카드 밑으로만 밀어냄. 모자라면 장면을 늘림
function relayout() {
  const gap = Math.max(40, innerHeight * 0.1);
  document.querySelectorAll('.scene').forEach((sc) => {
    const base = (+sc.dataset.h / 100) * innerHeight;
    const cards = [...sc.querySelectorAll(':scope > .card')].sort((a, b) => a.dataset.at - b.dataset.at);
    let y = 0;
    let prev = null;
    cards.forEach((c) => {
      // 장 표지 → 이야기, 이야기 → 체험 사이는 한 화면 가까이 띄워서 서로 겹쳐 보이지 않게
      // 다른 종류로 넘어갈 때는 넉넉히 띄움 → 한 화면에 한 가지만
      const P = (k) => prev && prev.classList.contains(k), C = (k) => c.classList.contains(k);
      const extra = !prev ? 0 : P('chap-open') ? innerHeight * 0.55 : P('story') && !C('story') ? innerHeight * 0.9 : P('play') ? innerHeight * 0.6 : C('story') ? innerHeight * 0.6 : 0;
      const top = Math.max(+c.dataset.at * base, y + extra); c.style.top = `${Math.round(top)}px`; y = top + c.offsetHeight + gap; prev = c;
    });
    sc.style.height = `${Math.round(Math.max(base, y + innerHeight * 0.7))}px`; // 체험 뒤에도 한 화면 가까이 머물 자리
  });
}
let relT = 0; const relSoon = () => { cancelAnimationFrame(relT); relT = requestAnimationFrame(relayout); };
const portraits = () => document.querySelectorAll('canvas.st-face').forEach((c) => drawPortrait(c, c.dataset.face));
relayout(); portraits(); addEventListener('resize', () => { relSoon(); portraits(); }); addEventListener('load', relSoon);
if (document.fonts) document.fonts.ready.then(relSoon);
if (window.ResizeObserver) { const ro = new ResizeObserver(relSoon); document.querySelectorAll('.card').forEach((c) => ro.observe(c)); }

function cardHTML(s, c, si, ci) {
  const pos = `style="top:${c.at * 100}%" data-at="${c.at}"`;
  const src = c.src ? `<p class="src">${tr('출처: ')}${esc(c.src)}</p>` : '';
  if (c.kind === 'story') return `<article class="card story" ${pos}${c.face ? ` data-face="${c.face}"` : ''}>${c.face ? '<div class="st-stage" aria-hidden="true"></div>' : ''}<div class="st-box">${c.chap ? `<p class="chap">${esc(c.chap)}</p>` : ''}<div class="st-top">${c.face ? `<canvas class="st-face" data-face="${c.face}" aria-hidden="true"></canvas>` : ''}<div><p class="st-who"><b>${esc(LABEL)}</b>${esc(c.who)}</p><h2>${esc(c.head)}</h2></div></div>${c.html}${c.first ? `<p class="note st-note">${esc(NOTE)}</p>` : ''}${s.cards.some((d) => d.play && d.at > c.at) ? `<p class="st-next">↓ ${esc(LX.next)}</p>` : ''}</div></article>`;
  if (c.kind === 'record') return `<article class="card rec brief ${c.tone || ''}" ${pos}><p class="rec-label">${tr('기록')}</p><h3>${esc(c.title)}</h3>${c.html}${src}</article>`;
  if (c.kind === 'reveal') return `<article class="card rec reveal-rec" ${pos}><p class="rec-label">${tr('기록')}</p><h3>${esc(c.title)}</h3><div class="blur">${c.html}</div><button class="rv-btn">${tr('기록 읽기')}</button>${src}</article>`;
  if (c.kind === 'correct') return `<article class="card rec reveal-rec correct" ${pos}><p class="rec-label">${tr('기록')}</p><h3>${esc(c.title)}</h3><div class="blur">${c.html}</div><button class="rv-btn">${tr('기록 읽기')}</button><button class="fix-btn" hidden>${tr('기록 바로잡기')}</button><p class="fix-note" hidden>${esc(c.fix)}</p>${src}</article>`;
  if (c.kind === 'choice') return `<article class="card choice" ${pos}>${c.html}<div class="ch-btns"><button data-go="mine">${tr('계속 보기')}</button><button data-sum>${tr('요약만 보기')}</button><button data-go="truth">${tr('다음 장으로')}</button></div><div class="ch-sum" hidden><p>${esc(c.summary)}</p></div></article>`;
  if (c.kind === 'input') return `<article class="card mem" ${pos}><h3>${tr('기억을 위한 한 문장')}</h3><p>${tr('한 문장을 남기면 작은 빛이 되어 떠오릅니다. 쓰지 않아도 끝까지 볼 수 있어요.')}</p><form class="mem-f"><textarea maxlength="120" rows="2" placeholder="${tr('오늘 기억하고 싶은 것 (120자 이내, 이름은 적지 않아도 됩니다)')}" aria-label="${tr('기억을 위한 한 문장')}"></textarea><div class="mem-r"><span class="mem-n">0 / 120</span><button type="submit">${tr('빛으로 남기기')}</button></div></form><p class="note">${tr('남긴 문장은 이 브라우저에만 저장되며 공개되지 않습니다.')}</p></article>`;
  if (c.kind === 'photo') return `<figure class="card ph" ${pos}><button class="ph-btn" data-lb-img="${c.id}" aria-label="${tr('사진 크게 보기')}"><img src="${img(c.id, 1000)}" alt="${esc(c.cap)}" loading="lazy"></button><figcaption>${esc(c.cap)}</figcaption></figure>`;
  if (c.kind === 'vid') return `<figure class="card vd" ${pos}>${vidHTML(c.id, c.title)}<figcaption>${esc(c.cap)}</figcaption></figure>`;
  if (c.kind === 'carousel') return `<div class="card car" ${pos}><div class="car-view">${c.items.map((it, k) => `<button class="car-slide${k ? '' : ' on'}" data-lb-img="${it.id}" aria-label="${esc(it.t)}"><img src="${img(it.id, 1200)}" alt="${esc(it.t)}" loading="lazy"></button>`).join('')}</div>
    <div class="car-txt">${c.items.map((it, k) => `<div class="car-cap${k ? '' : ' on'}"><b>${esc(it.t)}</b><span>${esc(it.d)}</span></div>`).join('')}</div>
    <div class="car-nav"><button class="car-prev" aria-label="${tr('이전 사진')}">←</button>${c.items.map((_, k) => `<i class="${k ? '' : 'on'}"></i>`).join('')}<button class="car-next" aria-label="${tr('다음 사진')}">→</button></div><p class="note">${tr('작품 사진 — {w}', { w: WORK })} · ${tr('사진을 누르면 크게 볼 수 있습니다.')}</p></div>`;
  if (c.kind === 'archive') return `<div class="card arch" ${pos}><p class="kicker">ARCHIVE</p><h2>${tr('작품의 기록')}</h2><p>${tr('《빛쌀》이 만들어진 과정과 다큐멘터리, 작업 영상과 사진을 모았습니다. 눌러서 재생하세요.')}</p>
    <div class="arch-doc">${vidHTML(VD.doc, tr('《빛쌀》 다큐멘터리'))}<p class="note">${tr('《빛쌀》 다큐멘터리 · 용량이 커서 재생까지 시간이 걸릴 수 있습니다.')}</p></div>
    <h3>${tr('작업 영상')}</h3><div class="arch-grid">${['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].map((k, i) => `<button class="arch-v" data-lb-vid="${VD[k]}"><img src="${thumb(VD[k])}" alt="" loading="lazy" onerror="this.remove()"><span>▶ ${tr('작업 영상 {n}', { n: String(i + 1).padStart(2, '0') })}</span></button>`).join('')}</div>
    <h3>${tr('사진')}</h3><div class="arch-grid ph6">${PH.map((id, i) => `<button class="arch-p" data-lb-img="${id}" aria-label="${tr('사진 크게 보기')} ${i + 1}"><img src="${img(id, 500)}" alt="" loading="lazy"></button>`).join('')}</div>
    <p class="note">${tr('영상·사진: ')}${WORK}</p></div>`;
  if (c.kind === 'open') return `<header class="card chap-open" ${pos} aria-label="${esc(c.num)} ${esc(c.title)}"><small>${esc(c.num)}</small><b>${esc(c.title)}</b><i aria-hidden="true"></i></header>`;
  if (c.play) return `<article class="card play" ${pos}><p class="play-tag">${esc(LX.play)}</p>${c.html}</article>`;
  return `<article class="card ${c.kind || ''}" ${pos}>${c.html}</article>`;
}
function vidHTML(id, title) { // 썸네일만 먼저, 누르면 그때 재생 (video.js)
  return videoHTML(id, { title: title || tr('영상 재생'), cls: 'bs-video', btn: 'vplay' });
}


// ---------- 자동 재생 / 입장 화면 ----------
function sndGate(kicker, title, onStart) {
  const g = document.createElement('div'); g.className = 'snd-gate'; g.setAttribute('role', 'dialog'); g.setAttribute('aria-label', tr('소리와 함께 입장'));
  g.innerHTML = `<div class="g-in"><p class="g-k">${kicker}</p><p class="g-t">${title}</p><button class="g-b"><i><b></b><b></b><b></b></i>${tr('입장하기')}</button><button class="g-s">${tr('소리 없이 보기')}</button><p class="g-n">${tr('헤드폰을 권장합니다')}</p></div>`;
  document.body.appendChild(g);
  const close = () => { g.classList.add('out'); setTimeout(() => g.remove(), 1000); };
  g.querySelector('.g-s').addEventListener('click', (e) => { e.stopPropagation(); onStart(false); close(); });
  g.addEventListener('click', () => { onStart(true); close(); });
  return close;
}

// 사운드: 첫 터치/클릭/키 입력에서 시작 (브라우저 자동재생 정책), 상단 버튼으로 켜고 끄기
const sndBtn = document.querySelector('.bs-snd');
let sndUserOff = (() => { try { return localStorage.getItem('xpace-sound') === 'off'; } catch (e) { return false; } })();
function sndUI() { sndBtn.classList.toggle('on', sound.on); sndBtn.setAttribute('aria-pressed', String(sound.on)); sndBtn.querySelector('span').textContent = sound.on ? tr('소리 켜짐') : tr('소리 켜기'); }
sndBtn.addEventListener('click', (e) => { e.stopPropagation(); const v = sound.toggle(); sndUserOff = !v; try { localStorage.setItem('xpace-sound', v ? 'on' : 'off'); } catch (e2) {} setTimeout(sndUI, 30); });
// 내레이션: 순이의 이야기를 읽어 줌 (기기 음성). 말하는 동안 배경 소리는 낮춤
// 내레이션(기기 음성)은 껐음 — ElevenLabs 녹음이 준비되면 녹음 파일로 다시 붙임 (bitssal-narrator.js는 남겨 둠)
const narr = { follow() {}, stop() {}, unlock() {}, set() {}, card: null };
const GEST = ['pointerdown', 'keydown', 'touchstart'];
const firstGesture = (e) => {
  if (e.target && e.target.closest && e.target.closest('.bs-snd, .snd-gate')) return; // 버튼은 자체 처리
  GEST.forEach((ev) => removeEventListener(ev, firstGesture));
  if (!sndUserOff && !sound.on) sound.start().then(sndUI).catch(() => {});
  narr.unlock();
  if (closeGate) { closeGate(); closeGate = null; }
};
GEST.forEach((ev) => addEventListener(ev, firstGesture, { passive: true }));
let closeGate = null;
function autoSound() {
  if (sndUserOff) return;
  sound.tryAuto().then((ok) => {
    if (ok) { GEST.forEach((ev) => removeEventListener(ev, firstGesture)); sndUI(); return; }
    closeGate = sndGate(tr('A-003 · 진시영 · 김동선'), tr('빛쌀 — 80년의 기억'), (withSound) => {
      GEST.forEach((ev) => removeEventListener(ev, firstGesture));
      sensor.enable();
      if (withSound) { sound.start().then(sndUI); narr.unlock(); }
      else { sndUserOff = true; sndUI(); narr.set(false); }
    });
  });
}

// 언어 선택 · 상단 문구
langSwitcher(document.querySelector('.bs-top'), { before: document.querySelector('.bs-menu-btn'), cls: 'bs-lang' });
if (lang !== 'ko') {
  document.querySelector('.bs-menu-btn').textContent = tr('이야기 목차');
  document.querySelector('.bs-title').textContent = 'A-003 · ' + tr('빛쌀 — 80년의 기억').split(' — ')[0];
  document.title = `A-003 · ${tr('빛쌀 — 80년의 기억')} | ARTMOS`;
  sndUI();
}

// 목차 / 진행 막대
const menu = document.getElementById('bs-menu'), menuBtn = document.querySelector('.bs-menu-btn');
menu.innerHTML = `<ol>${SCENES.map((s, i) => `${i === 0 || s.part !== SCENES[i - 1].part ? `<li class="m-part">${esc(PARTS[(s.part || 1) - 1])}</li>` : ''}<li><a href="#s-${s.id}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(s.title)}</a></li>`).join('')}</ol>`;
menuBtn.addEventListener('click', () => { menu.hidden = !menu.hidden; menuBtn.setAttribute('aria-expanded', String(!menu.hidden)); });
menu.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); jump(a.getAttribute('href').slice(3)); menu.hidden = true; });
const prog = document.querySelector('.bs-progress');
prog.style.gridTemplateColumns = `repeat(${SCENES.length}, 1fr)`;
prog.innerHTML = SCENES.map((s, i) => `<button title="${esc(s.title)}" data-id="${s.id}" class="part${s.part || 1}"><i></i></button>`).join('');
prog.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) jump(b.dataset.id); });
function jump(id) { const el = document.getElementById('s-' + id); if (el) window.scrollTo({ top: el.offsetTop + 2, behavior: 'smooth' }); }

// 카드 등장
const reading = new Set(); // 이야기 카드를 읽는 동안 화면 위 큰 숫자·라벨을 흐리게 (작은 화면)
const io = new IntersectionObserver((es) => { es.forEach((e) => { e.target.classList.toggle('in', e.isIntersecting); if (e.target.classList.contains('story')) { if (e.isIntersecting) reading.add(e.target); else reading.delete(e.target); } }); document.body.classList.toggle('reading', reading.size > 0); }, { rootMargin: '-12% 0px -12% 0px' });
document.querySelectorAll('.card').forEach((c) => io.observe(c));

// 이야기 문단은 하나씩: 카드가 보이면 얼굴이 먼저 그려지고, 그다음 문단을 읽을 만큼 시간을 두고 차례로 띄움.
// 화면에서 카드가 벗어나면 기다렸다가 돌아오면 이어서. 다 읽으면 그 장의 체험이 열림.
const SEQ_RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const seqParas = (c) => [...c.querySelectorAll('p')].filter((p) => !p.matches('.st-who, .chap'));
document.querySelectorAll('.card.story').forEach((c) => { c.classList.add('seq'); seqParas(c).forEach((p) => p.classList.add('seq-p')); });
// 체험 카드는 바로 앞 이야기 카드를 다 읽을 때까지 잠김
document.querySelectorAll('.scene').forEach((sc) => {
  const cards = [...sc.querySelectorAll(':scope > .card')].sort((a, b) => a.dataset.at - b.dataset.at); let lastStory = null;
  cards.forEach((c) => { if (c.classList.contains('story')) lastStory = c; else if (c.classList.contains('play') && lastStory) { c._story = lastStory; (lastStory._plays = lastStory._plays || []).push(c); c.classList.add('locked'); c.insertAdjacentHTML('afterbegin', `<p class="lock-note">${esc(LX.wait)}</p>`); } });
});
function unlockAfter(c) { c.classList.add('done'); (c._plays || []).forEach((pl) => { pl.classList.remove('locked'); pl.classList.add('opened'); }); }
function runSeq(c) {
  if (c._seq) return; c._seq = true;
  const ps = seqParas(c);
  if (SEQ_RM) { ps.forEach((p) => p.classList.add('shown')); unlockAfter(c); return; }
  // 쌀알 얼굴이 먼저 그려지고(1.4초) → 문단이 함께 나타남 → 읽을 시간이 지나면 체험이 열림
  const chars = ps.reduce((n, p) => n + p.textContent.trim().length, 0);
  let wait = 1400, read = Math.max(4000, Math.min(14000, chars * (lang === 'en' ? 18 : 45))), shown = false;
  const tick = () => {
    if (!c.classList.contains('in')) { setTimeout(tick, 400); return; } // 화면 밖이면 멈춤
    if (!shown) { if ((wait -= 200) > 0) { setTimeout(tick, 200); return; } shown = true; ps.forEach((p, k) => setTimeout(() => p.classList.add('shown'), k * 350)); }
    if ((read -= 200) > 0) { setTimeout(tick, 200); return; }
    unlockAfter(c);
  };
  tick();
}
{ const so = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) runSeq(e.target); }), { threshold: 0.35 }); document.querySelectorAll('.card.story').forEach((c) => so.observe(c)); }

// 기록 읽기 / 바로잡기
document.querySelectorAll('.reveal-rec').forEach((c) => {
  const rv = c.querySelector('.rv-btn'), fix = c.querySelector('.fix-btn');
  rv.addEventListener('click', () => { sound.ping('reveal'); c.classList.add('open'); rv.hidden = true; if (fix) fix.hidden = false; });
  fix && fix.addEventListener('click', () => { sound.ping('fix'); c.classList.add('fixed'); fix.hidden = true; c.querySelector('.fix-note').hidden = false; });
});
// 선택 카드
document.querySelectorAll('.choice').forEach((c) => {
  c.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => jump(b.dataset.go)));
  c.querySelector('[data-sum]').addEventListener('click', (e) => { const s = c.querySelector('.ch-sum'); s.hidden = !s.hidden; e.target.textContent = s.hidden ? tr('요약만 보기') : tr('요약 닫기'); });
});

// 영상: 눌렀을 때만 불러오기
mountVideos(story);
// 영상을 보는 동안: 배경 소리 낮추고 쌀알 캔버스는 쉬게 함 (휴대폰에서 영상이 끊기지 않도록)
onVideo('play', () => { state.videoOn = true; narr.stop(); sound.duck(0.15); });
onVideo('stop', () => { state.videoOn = false; sound.duck(1); });
// 라이트박스
const lb = document.createElement('div'); lb.className = 'lb'; lb.hidden = true; lb.innerHTML = '<button class="lb-x" aria-label="' + tr('닫기') + '">×</button><div class="lb-in"></div>'; document.body.appendChild(lb);
function openLB(html) { narr.stop(); lb.querySelector('.lb-in').innerHTML = html; lb.hidden = false; document.body.classList.add('lb-open'); }
function closeLB() { stopVideos(); sound.duck(1); lb.hidden = true; lb.querySelector('.lb-in').innerHTML = ''; document.body.classList.remove('lb-open'); }
lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('.lb-x')) closeLB(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) closeLB(); });
document.addEventListener('click', (e) => {
  const i = e.target.closest('[data-lb-img]'), v = e.target.closest('[data-lb-vid]');
  if (i) openLB(`<img src="${img(i.dataset.lbImg, 2200)}" alt=""><p>${tr('작품 사진 — {w}', { w: WORK })}</p>`);
  if (v) { openLB(`<div class="lb-vid">${videoHTML(v.dataset.lbVid, { title: tr('작업 영상'), w: 1600 })}</div><p>${tr('작업 영상')} — ${WORK}</p>`); const el = lb.querySelector('.vx-v'); mountVideos(lb); playVideo(el); }
});
// 캐러셀
document.querySelectorAll('.car').forEach((c) => {
  const sl = [...c.querySelectorAll('.car-slide')], cp = [...c.querySelectorAll('.car-cap')], dots = [...c.querySelectorAll('.car-nav i')]; let k = 0;
  const go = (n) => { k = (n + sl.length) % sl.length; [sl, cp, dots].forEach((arr) => arr.forEach((el, j) => el.classList.toggle('on', j === k))); state.carK = k; sound.ping('slide'); };
  c.querySelector('.car-prev').addEventListener('click', () => go(k - 1)); c.querySelector('.car-next').addEventListener('click', () => go(k + 1));
  dots.forEach((d, j) => d.addEventListener('click', () => go(j)));
  let sx = null; const v = c.querySelector('.car-view');
  v.addEventListener('pointerdown', (e) => (sx = e.clientX)); v.addEventListener('pointerup', (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 40) { go(k + (e.clientX < sx ? 1 : -1)); c._sw = true; } sx = null; });
  v.addEventListener('click', (e) => { if (c._sw) { c._sw = false; e.stopPropagation(); e.preventDefault(); } }, true);
});
// 한 톨 보태기
document.querySelectorAll('.add-voice').forEach((b) => b.addEventListener('click', () => { state.voice = Math.min(200, state.voice + 1); sound.ping('voice'); sensor.vibrate(12); document.querySelectorAll('.voice-n').forEach((n) => (n.textContent = state.voice)); }));

// ---------------- 캔버스 / 입자 ----------------
const cv = document.getElementById('stage'), g = cv.getContext('2d');
const glass = document.getElementById('glass');
const hud = { clock: document.querySelector('.hud-clock'), count: document.querySelector('.hud-count'), year: document.querySelector('.hud-year'), depth: document.querySelector('.hud-depth'), tip: document.querySelector('.hud-tip') };
const labelsEl = document.getElementById('labels');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let W = 0, H = 0, DPR = Math.min(devicePixelRatio, 2), CX = 0, CY = 0, R = 0, mobile = false;
function resize() {
  W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0);
  mobile = W < 820; CX = mobile ? W / 2 : W * 0.64; CY = mobile ? H * 0.38 : H * 0.5; /* 휴대폰: 아래쪽은 체험 안내 자리 */ R = Math.min(mobile ? W * 0.42 : W * 0.3, H * 0.36);
}
resize(); addEventListener('resize', resize);

const N = 1900;
const X = new Float32Array(N), Y = new Float32Array(N), A = new Float32Array(N), ROT = new Float32Array(N);
const TX = new Float32Array(N), TY = new Float32Array(N), TA = new Float32Array(N);
const C = new Uint8Array(N), R1 = new Float32Array(N), R2 = new Float32Array(N), R3 = new Float32Array(N);
for (let i = 0; i < N; i++) { R1[i] = Math.random(); R2[i] = Math.random(); R3[i] = Math.random(); X[i] = Math.random() * innerWidth; Y[i] = Math.random() * innerHeight; ROT[i] = Math.random() * 6.28; }
const COLORS = [RICE, DIM, RED, WARM];

const ptr = { x: -1, y: -1, in: false, t: 0 };
addEventListener('pointermove', (e) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.in = true; ptr.t = performance.now(); });
// 터치: 누른 곳을 잠시(2.5초) 커서처럼 사용
addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' || e.target.closest('.card, .bs-top, .bs-menu, .bs-progress, .lab, .lb')) return; ptr.x = e.clientX; ptr.y = e.clientY; ptr.in = true; ptr.t = performance.now(); });
cv.addEventListener && document.addEventListener('contextmenu', (e) => { if (TOUCH && !e.target.closest('.card, a, textarea')) e.preventDefault(); });
document.addEventListener('pointerleave', () => { ptr.in = false; });

const sm = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (p, a, b) => sm((p - a) / (b - a));

// 상태 (인터랙션)
let stopARref = null;
const state = { entered: false, share: 0, balls: [], memories: [], bowls: new Array(10).fill(0), voice: 0, hold: 0, lamps: [], rub: new Float32Array(900), carK: 0, flowT: 0, jar: 0, jarOut: 0, wait: 0, dawn: false, july: 0, brotherLight: false };
const TROT = new Float32Array(N);
let ptrDown = false;
addEventListener('pointerdown', (e) => { if (!e.target.closest('.card, .bs-top, .bs-menu, .bs-progress, .lab, .lb')) ptrDown = true; });
addEventListener('pointerup', () => (ptrDown = false)); addEventListener('pointercancel', () => (ptrDown = false));
try { state.memories = JSON.parse(localStorage.getItem('xpace-bitssal-v2') || '[]'); } catch (e) {}

// 지도 노드 (약도, 상대 좌표)
const DAEGU = [
  { k: 'station', name: tr('대구역'), x: -0.15, y: -0.55, text: tr('10월 1일 저녁, 경찰과 철도노조원이 충돌하고 경찰이 발포한 곳.') },
  { k: 'hall', name: tr('공회당 · 시투 사무실'), x: 0.35, y: -0.25, text: tr('노동자 시위대가 모여든 곳. 10월 2일 오후에도 이 일대에서 발포가 있었다.') },
  { k: 'city', name: tr('대구부청'), x: -0.6, y: 0.1, text: tr('10월 1일 오전, 시민 1,000여 명이 쌀을 요구한 곳.') },
  { k: 'police', name: tr('대구경찰서'), x: 0.15, y: 0.42, text: tr('10월 2일, 학생과 시민이 행진해 점거한 곳.') },
];
const REGIONS = [
  { name: tr('경북'), x: 0.38, y: 0.02, day: 1 }, { name: tr('경남'), x: 0.2, y: 0.55, day: 7 },
  { name: tr('충북'), x: -0.02, y: -0.3, day: 17 }, { name: tr('충남'), x: -0.45, y: -0.25, day: 17 },
  { name: tr('경기 · 황해'), x: -0.35, y: -0.75, day: 20 }, { name: tr('강원'), x: 0.3, y: -0.7, day: 29 },
  { name: tr('전남'), x: -0.5, y: 0.6, day: 29 }, { name: tr('전북'), x: -0.5, y: 0.18, day: 79 },
];
const YEARS = [1993, 2000, 2001, 2007, 2009].map((y) => ({ y, at: YEARS_AT[y] }));
const labelEls = {};
function label(key, text, cls = '') {
  if (!labelEls[key]) { const d = document.createElement('button'); d.className = 'lab ' + cls; d.textContent = text; labelsEl.appendChild(d); labelEls[key] = d; }
  return labelEls[key];
}
DAEGU.forEach((n) => { const l = label('d-' + n.k, n.name, 'node'); l.addEventListener('click', () => showTip(n.name, n.text, l)); });
REGIONS.forEach((r) => { const l = label('r-' + r.name, r.name, 'region'); l.addEventListener('click', () => { const s = document.getElementById('s-spread'); const at = 0.1 + ((r.day - 1) / 79) * 0.82 + 0.01; window.scrollTo({ top: s.offsetTop + s.offsetHeight * at - innerHeight * 0.5, behavior: 'smooth' }); }); });
YEARS.forEach((yy) => { const l = label('y-' + yy.y, String(yy.y), 'year'); l.addEventListener('click', () => { const s = document.getElementById('s-truth'); window.scrollTo({ top: s.offsetTop + (s.offsetHeight - innerHeight) * yy.at + innerHeight * 0.5 - innerHeight / 2, behavior: 'smooth' }); }); });
let tipTimer;
function showTip(title, text, el) {
  hud.tip.innerHTML = `<b>${esc(title)}</b><span>${esc(text)}</span>`;
  const r = el ? el.getBoundingClientRect() : { left: ptr.x, top: ptr.y, width: 0 };
  hud.tip.style.left = Math.min(W - 280, Math.max(12, r.left)) + 'px'; hud.tip.style.top = (r.top + 34) + 'px';
  hud.tip.classList.add('on'); clearTimeout(tipTimer); tipTimer = setTimeout(() => hud.tip.classList.remove('on'), 4200);
}

// 밥상 그릇 (일러스트)
const BOWLS = UI.family.map((t, k) => ({ t: fmt(UI.bowlOf, { n: t }), a: (k / 10) * Math.PI * 2 - Math.PI / 2 })); // 열 식구의 그릇
const bowlPos = (k) => ({ x: CX + Math.cos(BOWLS[k].a) * R * 0.85, y: CY + Math.sin(BOWLS[k].a) * R * 0.62 });
// 쌀독 (굶주림 장면, 왼쪽) — 털 때마다 나오는 쌀이 줄어듦
const jarPos = () => ({ x: CX - R * 1.05, y: CY + R * 0.75 });
const JAR_YIELD = [6, 5, 4, 3, 3, 2, 2, 1, 1, 1, 0];
function jarShake() {
  const n = JAR_YIELD[Math.min(state.jar, JAR_YIELD.length - 1)]; state.jar++;
  state.jarOut = Math.min(40, state.jarOut + n); state.jarShakeT = performance.now();
  document.querySelectorAll('.jar-n').forEach((el) => (el.textContent = state.jarOut));
  if (n) { sound.rattle(0.15 + n * 0.07); sensor.vibrate(n * 6); } else { sound.ping('reveal'); sensor.vibrate([10, 60, 10]); if (!state.jarTip) { state.jarTip = true; const q = jarPos(); showTip(UI.jarEmpty, UI.jarEmptyT, { getBoundingClientRect: () => ({ left: q.x - 40, top: q.y - 90 }) }); } }
}
// 7월의 밥 한 그릇 (진실규명 장면): 한 번 누를 때마다 한 해
const julyPos = (k) => { const cols = mobile ? 12 : 19, gw = R * 2 / (cols - 1); return { x: CX - R + (k % cols) * gw, y: CY - R * 0.78 + Math.floor(k / cols) * R * (mobile ? 0.1 : 0.12) }; };
function addJuly() {
  if (state.july >= 76) return; state.july++; sound.ping('bowl'); sensor.vibrate(10);
  document.querySelectorAll('.july-n').forEach((el) => (el.textContent = state.july)); document.querySelectorAll('.july-y').forEach((el) => (el.textContent = 1950 + state.july));
  if (state.july === 76) showTip(UI.julyDone, UI.julyDoneT, { getBoundingClientRect: () => ({ left: CX - 120, top: CY - R * 0.4 }) });
}
// 쌀로 그린 얼굴: 지금 읽는 이야기 카드의 인물을 무대의 쌀알이 그림
const face = { kind: null, k: 0, col: 0, pts: null };
const FN = 1000;
function wantFace(id) {
  if (id === 'light' && state.brotherLight) return { kind: 'brother', col: 3 };
  if (id === 'street' && state.dawn) return { kind: 'brother', col: 0, max: 0.92 };
  return readCard && readCard.dataset.face ? { kind: readCard.dataset.face, col: 0 } : null;
}
function applyFace(id) {
  const want = wantFace(id);
  if (want && want.kind !== face.kind) { if (face.k > 0.04) face.k = Math.max(0, face.k - 0.06); else { face.kind = want.kind; face.pts = facePoints(want.kind, FN); } }
  else if (want) face.k = Math.min(want.max || 1, face.k + 0.025);
  else face.k = Math.max(0, face.k - 0.04);
  if (want) face.col = want.col;
  if (face.k <= 0 || !face.pts) { face.lastFy = null; return; }
  TA[0] *= 1 - face.k; // 첫 쌀알(빛)이 얼굴을 가리지 않게
  let sc = R * (mobile ? 0.55 : 0.62), fx = CX, fy = mobile ? CY - R * 0.32 : CY - R * 0.05; const k = face.k;
  // 휴대폰: 이야기 카드 위쪽의 빈 자리(.st-stage)에 얼굴을 그려 글과 겹치지 않게, 스크롤하면 카드와 함께 움직임
  const stage = mobile && readCard ? readCard.querySelector('.st-stage') : null;
  if (stage) { const r = stage.getBoundingClientRect(); sc = Math.min(r.height * 0.42, W * 0.4); fy = r.top + r.height / 2 - sc * 0.1; face.fy = fy; face.sc = sc; }
  else if (mobile && face.fy != null && !readCard) { fy = face.fy; sc = face.sc; }
  if (mobile && face.lastFy != null && Math.abs(fy - face.lastFy) < 600) { const dy = fy - face.lastFy; for (let i = 1; i <= FN; i++) Y[i] += dy; } // 카드와 함께 그대로 따라 움직임
  face.lastFy = mobile ? fy : null;
  const n = face.pts.length;
  for (let j = 0; j < n; j++) { const q = face.pts[j], i = j + 1, kj = Math.max(0, Math.min(1, k * 1.7 - (j / n) * 0.7)); TX[i] = lerp(TX[i], fx + q.x * sc, kj); TY[i] = lerp(TY[i], fy + q.y * sc, kj); TA[i] = lerp(TA[i], q.a, kj); if (kj > 0.5) C[i] = face.col === 3 ? 3 : q.c; TROT[i] = q.r; }
  for (let i = face.pts.length + 1; i < N; i++) TA[i] *= 1 - 0.97 * k; // 얼굴을 그리는 동안 다른 쌀알은 거의 끔
}
// 주먹밥
function initBalls() { state.balls = Array.from({ length: 10 }, (_, k) => ({ a: (k / 10) * Math.PI * 2, r: 0.75, tr: 0.75, ta: (k / 10) * Math.PI * 2, size: 1 })); }
initBalls();

// ---------------- 장면별 목표 위치 ----------------
function setT(i, x, y, a, c) { TX[i] = x; TY[i] = y; TA[i] = a; C[i] = c; }
function hideAll(from = 0, x = CX, y = CY) { for (let i = from; i < N; i++) setT(i, x + (R1[i] - 0.5) * W * 1.4, y + (R2[i] - 0.5) * H * 1.4, 0, 0); }

const TARGETS = {
  prologue(p) {
    if (!state.entered) {
      const fx = ptr.in ? ptr.x : CX, fy = ptr.in ? ptr.y : CY - R * 0.2;
      setT(0, fx, fy, 1, 0);
    } else setT(0, CX, CY - R * 0.95, 1, 0);
    hideAll(1, CX, CY - R * 0.95);
    for (let i = 1; i < 140; i++) setT(i, CX + (R1[i] - 0.5) * R * 1.6, CY - R * 0.95 + (R2[i] - 0.5) * 18, seg(p, 0.75, 1) * 0.9, 0);
  },
  work(p) {
    // 유리 조형물 실루엣을 따라 흐르는 쌀알 (윗 접시 → 좁은 목 → 아래 그릇)
    const sc = R / 260;
    for (let i = 0; i < 900; i++) {
      const u = (R1[i] + state.flowT * (0.5 + R3[i])) % 1; let x, y;
      if (u < 0.25) { const a = R2[i] * 6.28, r = Math.sqrt(u / 0.25); x = Math.cos(a) * 130 * r; y = -230 + Math.sin(a) * 18 * r; }
      else if (u < 0.75) { const v = (u - 0.25) / 0.5; const w = lerp(120, 10, Math.min(1, v * 3)) * (R2[i] - 0.5) * 2; x = w; y = -220 + v * 380; }
      else { const v = (u - 0.75) / 0.25, a = R2[i] * Math.PI; x = Math.cos(a + Math.PI) * 90 * Math.sqrt(R3[i]); y = 170 + Math.sin(a) * 30 * v; }
      setT(i, CX + x * sc, CY + y * sc, 0.35 + 0.65 * (state.carK === (u < 0.2 ? 0 : u < 0.5 ? 1 : u < 0.75 ? 2 : 3) ? 1 : 0.4), state.carK === 3 && u >= 0.75 ? 3 : 0);
    }
    hideAll(900);
  },
  life(p) {
    const k = seg(p, 0, 0.3);
    let gi = 0;
    for (let i = 0; i < 140; i++, gi++) {
      const b = bowlPos(i % 10), ang = R2[i] * 6.28, rr = Math.sqrt(R3[i]) * 16;
      setT(i, lerp(CX + (R1[i] - 0.5) * R * 1.6, b.x + Math.cos(ang) * rr, k), lerp(CY - R * 0.95, b.y + Math.sin(ang) * rr * 0.6, k), 1, 0);
    }
    // 눌러서 담은 밥 (그릇마다 최대 40알)
    for (let b = 0; b < 10; b++) {
      const q = bowlPos(b), n = Math.round(state.bowls[b] * 40);
      for (let j = 0; j < 40; j++, gi++) { const ang = R2[gi] * 6.28, rr = Math.sqrt(R3[gi]) * 20; setT(gi, j < n ? q.x + Math.cos(ang) * rr : q.x, j < n ? q.y - 6 + Math.sin(ang) * rr * 0.5 - (1 - Math.sqrt(R3[gi])) * 8 : q.y - 260, j < n ? 1 : 0, j < n ? 3 : 0); }
    }
    hideAll(gi);
  },
  hunger(p) {
    state.hold = ptrDown && !hold ? Math.min(1, state.hold + 0.02) : Math.max(0, state.hold - 0.03);
    const gone = Math.max(0, seg(p, 0.1, 0.9) - 0.25 * state.hold * (1 - seg(p, 0.6, 0.9))), sx = CX + R * 1.05, sy = CY + R * 0.75;
    for (let i = 0; i < 140; i++) {
      const b = bowlPos(i % 10), ang = R2[i] * 6.28, rr = Math.sqrt(R3[i]) * 16;
      if (R1[i] < gone) setT(i, sx + (R2[i] - 0.5) * 50, sy + (R3[i] - 0.5) * 30, 0.35, 1);
      else setT(i, b.x + Math.cos(ang) * rr, b.y + Math.sin(ang) * rr * 0.6, 1, 0);
    }
    const sb = bowlPos(3), jp = jarPos();
    for (let j = 0; j < 40; j++) { const i = 140 + j; if (j < state.jarOut) { const ang = R2[i] * 6.28, rr = Math.sqrt(R3[i]) * 14; setT(i, sb.x + Math.cos(ang) * rr, sb.y - 4 + Math.sin(ang) * rr * 0.5, 1, 3); } else setT(i, jp.x + (R1[i] - 0.5) * 20, jp.y + 4, 0, 0); }
    hideAll(180);
  },
  demand(p) {
    const n = Math.round(lerp(100, 1500, seg(p, 0.55, 0.85)));
    const att = ptr.in && (TOUCH || (!mobile && ptr.x > W * 0.38)), tlt = IS_MOBILE && sensor.on; const ax = (att ? lerp(CX, ptr.x, TOUCH ? 0.75 : 0.55) : CX) + (tlt ? sensor.tiltX * R * 0.55 : 0), ay = (att ? lerp(CY, ptr.y, TOUCH ? 0.75 : 0.55) : CY) + (tlt ? sensor.tiltY * R * 0.4 : 0);
    const rc = R * 0.92 * Math.sqrt(n / 1500) + 14;
    for (let i = 0; i < N; i++) {
      if (i < n) { const r = Math.sqrt((i + 0.5) / n) * rc, a = i * 2.39996; setT(i, ax + Math.cos(a) * r, ay + Math.sin(a) * r, 1, 0); }
      else { const a = R1[i] * 6.28; setT(i, CX + Math.cos(a) * Math.max(W, H), CY + Math.sin(a) * Math.max(W, H), 0, 0); }
    }
    for (let j = 0; j < state.voice; j++) { const i = 1500 + j, a = j * 2.39996 + 0.7, r = Math.sqrt((j + 0.5) / 200) * rc * 0.6; setT(i, ax + Math.cos(a) * r, ay + Math.sin(a) * r, 1, 3); }
    hud.count.innerHTML = `${tr('{n}명', { n: `<b>${(n * 10).toLocaleString()}</b>` })} <small>${n < 400 ? tr('10월 1일 오전 · 대구부청 앞') : tr('10월 1일 · 대구역 앞')}</small>`;
  },
  street(p) {
    const node = (k) => { const n = DAEGU.find((d) => d.k === k); return { x: CX + n.x * R, y: CY + n.y * R }; };
    const st = node('station'), hl = node('hall'), ct = node('city'), pl = node('police');
    let cA = ct, cB = st, nB = 1500;
    const fire1 = p >= 0.36 && p < 0.47, march = seg(p, 0.48, 0.66), fire2 = p >= 0.72, curfew = seg(p, 0.86, 0.98);
    for (let i = 0; i < 1500; i++) {
      let x, y;
      const a = i * 2.39996, r = Math.sqrt((i + 0.5) / nB) * R * 0.3;
      if (p < 0.12 && i < 100) { const r2 = Math.sqrt((i + 0.5) / 100) * R * 0.14; x = ct.x + Math.cos(a) * r2; y = ct.y + Math.sin(a) * r2; }
      else {
        const mid = { x: lerp(st.x, hl.x, 0.5), y: lerp(st.y, hl.y, 0.5) };
        x = lerp(mid.x, pl.x, march) + Math.cos(a) * r; y = lerp(mid.y, pl.y, march) + Math.sin(a) * r * 0.8;
      }
      let alpha = p < 0.12 && i >= 100 ? seg(p, 0.02, 0.12) * (i < 1500 ? 1 : 0) : 1;
      let col = 0;
      alpha *= 1 - curfew * 0.85;
      setT(i, x, y, alpha, col);
    }
    hideAll(1500);
    state.freeze = fire1;
    // 시계
    // 순이네 집의 시간: 오빠가 나간 아침부터 돌아온 새벽까지
    const at = [0, 0.2, 0.4, 0.58, 0.82]; let k = 0; at.forEach((v, i) => { if (p >= v) k = i; }); const cur = UI.clock[k];
    hud.clock.innerHTML = `<small>${UI.year}</small><b>${esc(cur[0])}</b><span>${esc(cur[1])}</span>`;
    hud.clock.classList.remove('red');
  },
  spread(p) {
    const day = Math.round(lerp(1, 80, seg(p, 0.1, 0.92)));
    let gi = 0;
    REGIONS.forEach((rg, k) => {
      const on = day >= rg.day, cx = CX + rg.x * R, cy = CY + rg.y * R;
      for (let j = 0; j < 40; j++, gi++) { const a = R1[gi] * 6.28, r = Math.sqrt(R2[gi]) * R * 0.16; setT(gi, cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8, on ? 0.95 : 0.18, on ? 0 : 1); }
    });
    hideAll(gi);
    const d = new Date(1946, 9, day);
    hud.clock.innerHTML = `<small>${tr('1946년')}</small><b>${tr('{m}월 {d}일', { m: d.getMonth() + 1, d: d.getDate() })}</b><span></span>`;
    hud.clock.classList.remove('red');
  },
  erased(p) {
    // 쌀알이 기록 문서의 글줄이 됨
    const bx = CX - R * 0.75, bw = R * 1.5, by = CY - R * 0.85;
    for (let i = 0; i < 900; i++) {
      const line = Math.floor(i / 36), col = i % 36;
      const x = bx + (col / 36) * bw * (line % 4 === 3 ? 0.6 : 1), y = by + line * (R * 1.7 / 25);
      if (ptr.in && Math.hypot(ptr.x - x, ptr.y - y) < (TOUCH ? 70 : 46)) state.rub[i] = Math.min(1, state.rub[i] + 0.12);
      const rb = state.rub[i];
      setT(i, x, y, Math.min(1, 0.25 + seg(p, 0.2, 0.9) * 0.35 * (R1[i] > 0.3 ? 1 : 0) + rb * 0.75), rb > 0.5 ? 0 : 1);
    }
    hideAll(900);
  },
  boundary(p) {
    for (let i = 0; i < N; i++) setT(i, CX + (R1[i] - 0.5) * W * 0.9, H + 40 + R2[i] * 60, 0, 1);
    const y = Math.round(lerp(1946, 1950, seg(p, 0.05, 0.45)));
    hud.year.innerHTML = `<b>${y}</b>`;
  },
  mine(p) {
    const shown = Math.round(lerp(0, 1800, seg(p, 0.08, 0.8)));
    const hy = CY + R * 0.8, hw = R * 0.85;
    for (let i = 0; i < 1800; i++) {
      // 127개는 밝게(신원 확인), 나머지는 희미하게(추정)
      const lit = i % 14 === 0 && i / 14 < 127;
      if (i < shown) { const a = R1[i] * Math.PI, r = Math.sqrt(R2[i]); setT(i, CX + Math.cos(a + Math.PI) * hw * r, hy - Math.sin(a) * R * 0.28 * r, lit ? 1 : 0.32, lit ? 3 : 1); }
      else setT(i, CX + (R1[i] - 0.5) * 16, -20, 0, 1);
    }
    hideAll(1800);
    hud.depth.innerHTML = `<small>${tr('깊이')}</small><b>${Math.round(seg(p, 0, 0.9) * 100)}</b>`;
    state.torch = seg(p, 0.05, 0.2);
  },
  truth(p) {
    const hy = CY + R * 0.8, hw = R * 0.85;
    const rise = p > 0.44 ? seg(p, 0.44, 0.56) : 0, line = seg(p, 0.66, 0.74);
    let lifted = 0;
    for (let i = 0; i < 1800; i++) {
      const lit = i % 14 === 0 && i / 14 < 127;
      const a = R1[i] * Math.PI, r = Math.sqrt(R2[i]);
      let x = CX + Math.cos(a + Math.PI) * hw * r, y = hy - Math.sin(a) * R * 0.28 * r, al = lit ? 1 : 0.3, c = lit ? 3 : 1;
      if (!lit && lifted < 40 && R3[i] < 0.05) { lifted++; y = lerp(y, CY - R * 0.85 + R3[i] * 200, rise); x = lerp(x, CX + (R1[i] - 0.5) * R * 1.4, rise); al = lerp(al, 1, rise); c = rise > 0.5 ? 3 : 1; }
      setT(i, x, y, al, c);
    }
    hideAll(1800);
    state.truthLine = line;
  },
  share(p) {
    const k = seg(p, 0.05, 0.35);
    for (let i = 0; i < 600; i++) {
      const b = state.balls[i % 10], ang = R2[i] * 6.28, rr = Math.sqrt(R3[i]) * 22 * b.size;
      const bx = CX + Math.cos(b.a) * R * b.r, by = CY + Math.sin(b.a) * R * b.r * 0.75;
      setT(i, lerp(CX + (R1[i] - 0.5) * R * 2, bx + Math.cos(ang) * rr, k), lerp(CY + (R2[i] - 0.5) * R * 2, by + Math.sin(ang) * rr, k), 1, 0);
    }
    hideAll(600);
  },
  light(p) {
    const n = 700 + state.memories.length * 30;
    for (let i = 0; i < Math.min(N, n); i++) {
      const f = i % 7, fc = { x: CX + Math.cos(f / 7 * 6.28) * R * 0.75, y: CY + Math.sin(f / 7 * 6.28) * R * 0.6 - seg(p, 0, 1) * 40 };
      const th = R1[i] * 6.28, rr = Math.abs(Math.cos(2.5 * th)) * 46 * (0.4 + 0.6 * seg(p, 0, 0.4));
      setT(i, fc.x + Math.cos(th) * rr, fc.y + Math.sin(th) * rr, 0.85, i % 9 === 0 ? 3 : 0);
    }
    hideAll(Math.min(N, n));
  },
  records(p) { // 조용한 문서의 글줄
    const bx = CX - R * 0.8, bw = R * 1.6, by = CY - R * 0.9;
    for (let i = 0; i < 720; i++) { const line = Math.floor(i / 30), col = i % 30; setT(i, bx + (col / 30) * bw * (line % 5 === 4 ? 0.55 : 1), by + line * (R * 1.8 / 24), 0.16 + (line / 24 < p ? 0.22 : 0), 0); }
    hideAll(720);
  },
  archive(p) {
    for (let i = 0; i < 400; i++) { const a = R1[i] * 6.28, r = R * (0.9 + R2[i] * 0.6); setT(i, CX + Math.cos(a) * r, CY + Math.sin(a) * r * 0.7, 0.25, 0); }
    hideAll(400);
  },
};

// ---------------- 진행 계산 ----------------
let cur = 0, curP = 0;
const sections = [...document.querySelectorAll('.scene')];
function measure() {
  const mid = innerHeight * 0.5;
  for (let i = 0; i < sections.length; i++) {
    const r = sections[i].getBoundingClientRect();
    if (r.top <= mid && r.bottom > mid) { cur = i; curP = (mid - r.top) / r.height; return; }
  }
  if (sections[sections.length - 1].getBoundingClientRect().bottom <= mid) { cur = sections.length - 1; curP = 1; }
}

// 쌀알 그리기
function grain(x, y, rot, a, col, s = 1) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a})`;
  g.beginPath(); g.ellipse(0, 0, 3.4 * s, 1.5 * s, 0, 0, 6.283); g.fill();
  g.restore();
}

// ---------------- 장면별 배경 일러스트 ----------------
function drawBackdrop(id, p, t) {
  g.lineWidth = 1;
  if (id === 'life' || id === 'hunger') {
    // 밥상(원형 상) + 그릇
    g.strokeStyle = 'rgba(255,248,230,.12)'; g.beginPath(); g.ellipse(CX, CY, R * 1.12, R * 0.82, 0, 0, 6.283); g.stroke();
    BOWLS.forEach((b, k) => {
      const q = bowlPos(k);
      g.strokeStyle = 'rgba(255,248,230,.35)'; g.beginPath(); g.ellipse(q.x, q.y, 26, 14, 0, 0, 6.283); g.stroke();
      g.beginPath(); g.ellipse(q.x, q.y + 4, 18, 9, 0, 0, Math.PI); g.stroke();
    });
    if (id === 'hunger') {
      const sx = CX + R * 1.05, sy = CY + R * 0.75, k = seg(p, 0.05, 0.3);
      g.strokeStyle = `rgba(255,248,230,${0.45 * k})`;
      g.beginPath(); g.moveTo(sx - 36, sy - 30); g.quadraticCurveTo(sx - 46, sy + 30, sx, sy + 34); g.quadraticCurveTo(sx + 46, sy + 30, sx + 36, sy - 30); g.closePath(); g.stroke();
      g.fillStyle = `rgba(255,248,230,${0.55 * k})`; g.font = '12px Pretendard, sans-serif'; g.textAlign = 'center'; g.fillText(tr('수집'), sx, sy - 40);
      // 쌀독 (항아리) — 털면 잠깐 흔들림
      const jp = jarPos(), jk = seg(p, 0.02, 0.2), wob = Math.max(0, 1 - (performance.now() - (state.jarShakeT || 0)) / 400) * Math.sin(t * 40) * 0.08;
      g.save(); g.translate(jp.x, jp.y); g.rotate(wob); g.strokeStyle = `rgba(255,248,230,${0.5 * jk})`;
      g.beginPath(); g.moveTo(-18, -34); g.quadraticCurveTo(-44, -18, -38, 10); g.quadraticCurveTo(-30, 36, 0, 38); g.quadraticCurveTo(30, 36, 38, 10); g.quadraticCurveTo(44, -18, 18, -34); g.closePath(); g.stroke();
      g.beginPath(); g.ellipse(0, -34, 18, 5, 0, 0, 6.283); g.stroke(); g.restore();
      g.fillStyle = `rgba(255,248,230,${0.6 * jk})`; g.font = '12px Pretendard, sans-serif'; g.textAlign = 'center'; g.fillText(UI.jar, jp.x, jp.y - 46);
      // 콜레라·수해: 물결 (p 0.6~)
      const wv = seg(p, 0.6, 0.8);
      if (wv > 0) { g.strokeStyle = `rgba(150,180,200,${0.25 * wv})`; for (let k2 = 0; k2 < 4; k2++) { g.beginPath(); for (let x = 0; x <= W; x += 12) g.lineTo(x, H - 30 - k2 * 14 + Math.sin(x / 40 + t * 1.5 + k2) * 5); g.stroke(); } }
    }
  }
  if (id === 'work') {
    // 유리 조형물 윤곽 (일러스트)
    const sc = R / 260, P = (x, y) => [CX + x * sc, CY + y * sc];
    g.strokeStyle = 'rgba(255,248,230,.22)'; g.lineWidth = 1.2;
    g.beginPath(); g.ellipse(CX, CY - 230 * sc, 140 * sc, 20 * sc, 0, 0, 6.283); g.stroke();
    [-1, 1].forEach((sg) => { g.beginPath(); g.moveTo(...P(sg * 140, -226)); g.quadraticCurveTo(...P(sg * 20, -150), ...P(sg * 12, -100)); g.lineTo(...P(sg * 14, 120)); g.quadraticCurveTo(...P(sg * 100, 150), ...P(sg * 100, 175)); g.stroke(); });
    g.beginPath(); g.moveTo(...P(-100, 175)); g.quadraticCurveTo(...P(0, 260), ...P(100, 175)); g.stroke();
    const parts = [[-230, '밥상'], [-60, '통로'], [90, '어둠'], [205, '그릇']];
    g.font = '12px Pretendard, sans-serif'; g.textAlign = 'left';
    parts.forEach(([yy, nm0], k) => { const nm = tr(nm0); const on = state.carK === k; g.fillStyle = `rgba(255,248,230,${on ? 0.95 : 0.35})`; g.fillText(`0${k + 1} ${nm}`, CX + 160 * sc, CY + yy * sc + 4); g.strokeStyle = `rgba(255,248,230,${on ? 0.6 : 0.15})`; g.beginPath(); g.moveTo(CX + 150 * sc, CY + yy * sc); g.lineTo(CX + 110 * sc, CY + yy * sc); g.stroke(); });
    g.lineWidth = 1;
  }
  if (id === 'street') {
    // 약도: 거리 선
    g.strokeStyle = 'rgba(255,248,230,.08)';
    for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(CX - R * 1.2, CY + k * R * 0.28); g.lineTo(CX + R * 1.2, CY + k * R * 0.28 + 20); g.stroke(); g.beginPath(); g.moveTo(CX + k * R * 0.3, CY - R); g.lineTo(CX + k * R * 0.3 + 30, CY + R); g.stroke(); }
    g.strokeStyle = 'rgba(255,248,230,.18)'; g.setLineDash([4, 6]);
    g.beginPath(); g.moveTo(CX - R * 1.2, CY - R * 0.62); g.lineTo(CX + R * 1.2, CY - R * 0.5); g.stroke(); g.setLineDash([]);
    const cf = seg(p, 0.86, 0.98) * (1 - (state.dawnK || 0) * 0.8); if (cf > 0) { g.fillStyle = `rgba(0,0,0,${cf * 0.6})`; g.fillRect(0, 0, W, H); }
    if (state.dawnK > 0) { const dg = g.createLinearGradient(0, H, 0, H * 0.3); dg.addColorStop(0, `rgba(255,190,120,${0.22 * state.dawnK})`); dg.addColorStop(1, 'rgba(255,190,120,0)'); g.fillStyle = dg; g.fillRect(0, 0, W, H); }
    if (p > 0.82 && !state.dawn && state.wait > 0.01) { g.strokeStyle = 'rgba(255,214,150,.7)'; g.lineWidth = 2; g.beginPath(); g.arc(CX, CY + R * 0.9, 22, -Math.PI / 2, -Math.PI / 2 + state.wait * 6.283); g.stroke(); g.lineWidth = 1; }
  }
  if (id === 'spread') {
    REGIONS.forEach((rg) => {
      const day = Math.round(lerp(1, 80, seg(p, 0.1, 0.92))), on = day >= rg.day, x = CX + rg.x * R, y = CY + rg.y * R;
      const gr = g.createRadialGradient(x, y, 0, x, y, R * 0.3); gr.addColorStop(0, on ? 'rgba(255,214,150,.22)' : 'rgba(255,255,255,.03)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, R * 0.3, 0, 6.283); g.fill();
    });
    // 대구 표시
    const dx = CX + 0.3 * R, dy = CY + 0.08 * R; g.strokeStyle = 'rgba(200,56,47,.8)'; g.beginPath(); g.arc(dx, dy, 6 + Math.sin(t * 3) * 2, 0, 6.283); g.stroke();
  }
  if (id === 'erased') {
    g.strokeStyle = 'rgba(255,248,230,.1)'; g.strokeRect(CX - R * 0.85, CY - R * 0.95, R * 1.7, R * 1.9);
  }
  if (id === 'mine' || id === 'truth') {
    // 수직 통로와 바닥 그릇
    const top = id === 'mine' ? -40 : -40, hy = CY + R * 0.8;
    g.strokeStyle = 'rgba(255,248,230,.2)';
    g.beginPath(); g.moveTo(CX - 14, top); g.bezierCurveTo(CX - 20, CY * 0.6, CX - 8, CY, CX - 16, hy - R * 0.35); g.stroke();
    g.beginPath(); g.moveTo(CX + 14, top); g.bezierCurveTo(CX + 20, CY * 0.6, CX + 8, CY, CX + 16, hy - R * 0.35); g.stroke();
    g.beginPath(); g.moveTo(CX - R * 0.95, hy - R * 0.32); g.quadraticCurveTo(CX, hy + R * 0.3, CX + R * 0.95, hy - R * 0.32); g.stroke();
    g.beginPath(); g.ellipse(CX, hy - R * 0.32, R * 0.95, 10, 0, 0, 6.283); g.stroke();
    if (id === 'mine') {
      const d = seg(p, 0, 0.9); g.fillStyle = `rgba(0,0,0,${0.15 + d * 0.35})`; g.fillRect(0, 0, W, H);
      // 동굴 벽: 가장자리를 어둡게 감싸 좁은 굴 속에 있는 느낌
      const vg = g.createRadialGradient(CX, CY, R * 0.4, CX, CY, Math.max(W, H) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${0.55 + d * 0.3})`); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      const drips = state.drips || (state.drips = []);
      if (performance.now() > (state.nextDrip || 0)) { state.nextDrip = performance.now() + 900 + Math.random() * 2600; drips.push({ x: CX + (Math.random() - 0.5) * R * 1.4, y: CY - R * 1.1, vy: 0, fy: hy - R * 0.3 + Math.random() * R * 0.25, r: 0 }); }
      for (let k = drips.length - 1; k >= 0; k--) { const q = drips[k];
        if (q.r === 0) { q.vy += 0.35; q.y += q.vy; g.fillStyle = 'rgba(200,220,235,.55)'; g.beginPath(); g.ellipse(q.x, q.y, 1.4, 3.2, 0, 0, 6.283); g.fill(); if (q.y >= q.fy) { q.r = 1; sound.drip((q.x - CX) / R, 0.6 + Math.random() * 0.5); } }
        else { q.r += 1.1; const a = Math.max(0, 0.4 - q.r / 90); g.strokeStyle = `rgba(200,220,235,${a})`; g.beginPath(); g.ellipse(q.x, q.fy, q.r, q.r * 0.28, 0, 0, 6.283); g.stroke(); if (a <= 0) drips.splice(k, 1); } }
    }
    if (id === 'truth') for (let k = 0; k < state.july; k++) { const q = julyPos(k); g.strokeStyle = 'rgba(255,214,150,.55)'; g.beginPath(); g.ellipse(q.x, q.y, 9, 4, 0, 0, 6.283); g.stroke(); g.beginPath(); g.ellipse(q.x, q.y + 2, 6, 3, 0, 0, Math.PI); g.stroke(); g.fillStyle = 'rgba(255,248,230,.9)'; for (let m = 0; m < 4; m++) { g.beginPath(); g.ellipse(q.x - 4 + m * 2.6, q.y - 1.5 - (m % 2), 1.6, 0.8, m, 0, 6.283); g.fill(); } }
    if (id === 'truth' && state.truthLine > 0) { const y = CY - R * 0.95; g.strokeStyle = `rgba(255,214,150,${0.6 * state.truthLine})`; g.beginPath(); g.moveTo(CX - R * state.truthLine, y); g.lineTo(CX + R * state.truthLine, y); g.stroke(); }
  }
  if (id === 'share') {
    state.balls.forEach((b) => { b.a += (b.ta - b.a) * 0.05; b.r += (b.tr - b.r) * 0.05; });
  }
  if (id === 'light') {
    const gr = g.createRadialGradient(CX, CY, 0, CX, CY, R * 1.4); gr.addColorStop(0, 'rgba(255,240,215,.08)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    state.memories.forEach((m, k) => { const x = CX + Math.cos(k * 2.4) * R * 0.9, y = CY - R * 0.9 - ((t * 8 + k * 40) % (H * 0.3)); const gg = g.createRadialGradient(x, y, 0, x, y, 18); gg.addColorStop(0, 'rgba(255,250,235,.95)'); gg.addColorStop(1, 'rgba(255,250,235,0)'); g.fillStyle = gg; g.beginPath(); g.arc(x, y, 18, 0, 6.283); g.fill(); m._x = x; m._y = y; });
  }
}

// ---------------- 라벨 위치 ----------------
function placeLabels(id, p) {
  Object.values(labelEls).forEach((l) => (l.style.opacity = 0, l.style.pointerEvents = 'none'));
  const put = (key, x, y, op = 1) => { const l = labelEls[key]; l.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`; l.style.opacity = op; l.style.pointerEvents = op > 0.3 ? 'auto' : 'none'; };
  if (id === 'spread') { const day = Math.round(lerp(1, 80, seg(p, 0.1, 0.92))); REGIONS.forEach((r) => put('r-' + r.name, CX + r.x * R, CY + r.y * R - R * 0.2, day >= r.day ? 1 : 0.35)); }
}

// ---------------- 루프 ----------------
let last = performance.now();
// 지금 읽고 있는 이야기 카드 (화면 가운데 띠에 걸친 것) → 읽기 단계
let readCard = null, hold = false; // hold: 지금은 체험을 받지 않음 (읽는 중이거나 아직 이야기를 다 읽지 않음)
function findReadCard() {
  const band0 = innerHeight * 0.22, band1 = innerHeight * 0.78; let best = null, bd = 1e9;
  sections[cur].querySelectorAll(':scope > .card.story').forEach((el) => { const r = el.getBoundingClientRect(); if (r.bottom < band0 || r.top > band1) return; const d = Math.abs(r.top + r.height / 2 - innerHeight / 2); if (d < bd) { bd = d; best = el; } });
  return best;
}
let frameErr = 0;
function frame(now) {
  requestAnimationFrame(frame); // 먼저 다음 프레임을 예약 → 한 프레임에서 오류가 나도 화면이 멈추지 않음
  try { draw(now); } catch (e) { if (frameErr++ < 3) console.warn('[빛쌀] frame', e); }
}
function draw(now) {
  if (state.videoOn || !lb.hidden) { last = now; return; } // 영상·라이트박스 보는 동안 쉼
  const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
  if (TOUCH && ptr.in && now - ptr.t > 2500) ptr.in = false;
  measure();
  const sc = SCENES[cur], id = sc.id, p = curP;
  { const tl = IS_MOBILE && sensor.on ? Math.min(1, Math.abs(sensor.tiltX) + Math.abs(sensor.tiltY)) : 0; state.flowT += dt * 0.03 * (1 + tl * 3.5); }
  readCard = findReadCard();
  // 휴대폰: 체험 카드에 닿으면 화면 아래에 고정 → 위쪽 그림을 가리지 않고 보면서 해 볼 수 있게
  if (mobile) document.querySelectorAll('.card.play').forEach((pc) => {
    const sr = pc.parentElement.getBoundingClientRect(), top = sr.top + (parseFloat(pc.style.top) || 0);
    let nx = pc.nextElementSibling; while (nx && !nx.classList.contains('card')) nx = nx.nextElementSibling;
    const nextTop = nx ? sr.top + (parseFloat(nx.style.top) || 0) : Infinity;
    pc.classList.toggle('docked', top < innerHeight * 0.72 && sr.bottom > innerHeight * 0.9 && nextTop > innerHeight * 0.9); // 다음 카드·다음 장이 보이기 전에 내려감
  });
  sections[cur].querySelectorAll(':scope > .card.story, :scope > .card.chap-open').forEach((el) => { const r = el.getBoundingClientRect(); el.classList.toggle('past', r.bottom < innerHeight * (el.classList.contains('chap-open') ? 0.42 : 0.3)); });
  const reading = !!readCard; hold = reading || !!sections[cur].querySelector(':scope > .card.play.locked'); state.readK = Math.max(0, Math.min(1, (state.readK || 0) + (reading ? dt * 2.5 : -dt * 2)));
  document.body.classList.toggle('phase-read', reading);
  // 장 표지가 화면 가운데 있으면 쌀알·장면 그림을 거의 꺼서 제목만 보이게
  const opening = !reading && [...sections[cur].querySelectorAll(':scope > .card.chap-open')].some((el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.45; });
  state.openK = Math.max(0, Math.min(1, (state.openK || 0) + (opening ? dt * 2.5 : -dt * 1.5)));
  document.body.classList.toggle('phase-open', opening);
  narr.follow(readCard);
  TARGETS[id](p);
  applyFace(id);
  document.body.dataset.scene = id;
  // HUD 가시성
  hud.clock.classList.toggle('on', id === 'street' || id === 'spread');
  hud.count.classList.remove('on'); // 이야기 장면에선 숫자를 띄우지 않음
  hud.year.classList.toggle('on', id === 'boundary');
  hud.depth.classList.toggle('on', id === 'mine');
  glass.classList.toggle('on', id === 'prologue' && state.entered);
  glass.style.opacity = id === 'prologue' ? seg(p, 0.2, 0.55) * (state.entered ? 0.9 : 0.5) * (1 - face.k) : 0;
  document.body.classList.toggle('facing', face.k > 0.3);
  [...prog.children].forEach((b, i) => b.classList.toggle('on', i <= cur));
  prog.children[cur].querySelector('i').style.width = Math.round(p * 100) + '%';

  if (!state.ar) { g.fillStyle = id === 'mine' ? '#020202' : '#050505'; g.fillRect(0, 0, W, H); }
  g.globalAlpha = 1 - Math.max(0.97 * state.readK, 0.95 * state.openK); drawBackdrop(id, p, t); g.globalAlpha = 1; // 읽는 동안 장면 그림은 뒤로 물러남
  const wander = TOUCH && !ptr.in; // 터치: 누르지 않을 땐 손전등이 천천히 바닥을 훑음
  const torch = id === 'mine' && !hold && (ptr.in || TOUCH) ? state.torch || 0 : 0, tx = wander ? CX + Math.sin(t * 0.5) * R * 0.7 : ptr.x, ty = wander ? CY + R * 0.62 + Math.sin(t * 0.9) * R * 0.08 : ptr.y;
  // 모바일: 기울이면 쌀알이 낮은 쪽으로 쏠리고(밥상·굶주림 장면에선 그릇에서 쏟아짐), 흔들면 떨림. 광산·진실규명 장에서는 쓰지 않음
  const calm = hold || id === 'boundary' || id === 'mine' || id === 'truth';
  const gx = IS_MOBILE && sensor.on && !calm ? sensor.tiltX : 0, gy = IS_MOBILE && sensor.on && !calm ? sensor.tiltY : 0, sh = IS_MOBILE && !calm ? sensor.shake : 0;
  // 밥상: 폰을 기울인 쪽 그릇에 밥이 담김
  if (IS_MOBILE && sensor.on && !hold && id === 'life' && Math.abs(gx) > 0.3) {
    let changed = false;
    BOWLS.forEach((b, k) => { if (Math.sign(Math.cos(b.a)) === Math.sign(gx) && Math.abs(Math.cos(b.a)) > 0.2 && state.bowls[k] < 1) { state.bowls[k] = Math.min(1, state.bowls[k] + dt * 0.5 * Math.abs(gx)); changed = true; } });
    if (changed && now - (state.rt || 0) > 160) { state.rt = now; sound.rattle(0.2 + Math.abs(gx) * 0.3); sensor.vibrate(6); const done = state.bowls.filter((v) => v >= 1).length; document.querySelectorAll('.bowl-n').forEach((n) => (n.textContent = done)); if (done === 10 && !state.bowlTip) { state.bowlTip = true; sound.ping('bowlsDone'); showTip(UI.bowlsDone, UI.bowlsDoneT, { getBoundingClientRect: () => ({ left: CX - 120, top: CY + R * 0.7 }) }); } }
  }
  // 통행금지의 밤: 움직이지 않고 기다리면 새벽이 옴 (폰은 기울기·흔들림, PC는 마우스)
  if (id === 'street' && !hold && sections[cur].querySelector('.card.play.in') && !state.dawn) {
    const still = IS_MOBILE && sensor.on ? Math.abs(sensor.tiltX - (state.ptx ?? 0)) + Math.abs(sensor.tiltY - (state.pty ?? 0)) < 0.004 && sensor.shake < 0.05 : now - ptr.t > 700;
    state.wait = Math.max(0, Math.min(1, state.wait + (still ? dt / 6 : -dt / 2)));
    if (now - (state.wt || 0) > 200) { state.wt = now; document.querySelectorAll('.wait-n').forEach((el) => (el.textContent = Math.round(state.wait * 100))); }
    if (state.wait >= 1) { state.dawn = true; document.querySelectorAll('.wait-n').forEach((el) => (el.textContent = 100)); sound.ping('enter'); sensor.vibrate([40, 80, 40]); showTip(UI.dawn, UI.dawnT, { getBoundingClientRect: () => ({ left: CX - 120, top: CY + R * 0.5 }) }); }
  }
  if (IS_MOBILE) { state.ptx = sensor.tiltX; state.pty = sensor.tiltY; }
  state.dawnK = Math.min(1, (state.dawnK || 0) + (state.dawn && id === 'street' ? dt / 3 : -dt));
  if (state.dawnK < 0) state.dawnK = 0;
  // 빛이 열 개 모이면 오빠의 얼굴이 빛으로 떠오름
  if (id === 'light' && !state.brotherLight && state.lamps.length >= 10) { state.brotherLight = true; sound.ping('memory'); sensor.vibrate([30, 60, 30, 60, 90]); showTip(UI.brotherLight, UI.brotherLightT, { getBoundingClientRect: () => ({ left: CX - 120, top: CY + R * 0.6 }) }); }
  const ox = gx * W * 0.07, oy = gy * H * 0.05;
  const ease = reduced ? 1 : state.freeze ? 0 : id === 'mine' ? 0.035 : 0.075;
  if (state.ar) { g.clearRect(0, 0, W, H); g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(0, 0, W, H); }
  for (let i = 0; i < N; i++) {
    X[i] += (TX[i] - X[i]) * ease; Y[i] += (TY[i] - Y[i]) * ease; A[i] += (TA[i] - A[i]) * 0.08;
    if (A[i] < 0.01) continue;
    if (face.k > 0.3 && i > 0 && i <= FN) { const d = ((TROT[i] - ROT[i]) % Math.PI + Math.PI * 1.5) % Math.PI - Math.PI / 2; ROT[i] += d * 0.12; }
    else if (!state.freeze) ROT[i] += (R3[i] - 0.5) * 0.01;
    let al = A[i] * (1 - 0.98 * state.openK);
    if (torch > 0) { const d = Math.hypot(X[i] - tx, Y[i] - ty); al *= lerp(1, d < 150 ? 1.25 - d / 300 : 0.12, torch); }
    if (al < 0.01) continue;
    const k = 0.4 + R1[i], jx = sh ? (Math.random() - 0.5) * sh * 16 : 0, jy = sh ? (Math.random() - 0.5) * sh * 16 : 0;
    grain(X[i] + ox * k + jx, Y[i] + oy * k + jy, ROT[i] + jx * 0.1, Math.min(1, al), COLORS[C[i]], i === 0 && id === 'prologue' ? 3 : 1);
  }
  if (id === 'prologue') { // 첫 쌀알의 빛
    const hg = g.createRadialGradient(X[0], Y[0], 0, X[0], Y[0], 120); hg.addColorStop(0, 'rgba(255,240,210,.22)'); hg.addColorStop(1, 'rgba(255,240,210,0)'); g.fillStyle = hg; g.fillRect(X[0] - 120, Y[0] - 120, 240, 240);
  }
  if (torch > 0) { const tg = g.createRadialGradient(tx, ty, 0, tx, ty, 170); tg.addColorStop(0, `rgba(255,236,200,${0.1 * torch})`); tg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = tg; g.fillRect(tx - 170, ty - 170, 340, 340); }
  const ax = state.ar ? -sensor.tiltX * W * 0.6 : 0, ay = state.ar ? -sensor.tiltY * H * 0.5 : 0;
  if (id === 'light') state.lamps.forEach((l0) => { l0.y -= l0.v * (1 + sensor.blow * 7); l0.x += Math.sin(t + l0.ph) * 0.3; const l = { x: l0.x + (l0.ar ? ax : 0), y: l0.y + (l0.ar ? ay : 0) }; const r = 10 + Math.sin(t * 3 + l0.ph) * 2; const lg = g.createRadialGradient(l.x, l.y, 0, l.x, l.y, r * 2.4); lg.addColorStop(0, 'rgba(255,240,205,.95)'); lg.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = lg; g.beginPath(); g.arc(l.x, l.y, r * 2.4, 0, 6.283); g.fill(); if (l0.y < -40) l0.y = H + 40; });
  if (state.ar && id !== 'light') stopAR();
  if (id === 'hunger' && !hold && state.hold > 0.05) { g.strokeStyle = `rgba(255,248,230,${0.5 * state.hold})`; g.beginPath(); g.arc(ptr.x, ptr.y, 26 + state.hold * 10, -Math.PI / 2, -Math.PI / 2 + state.hold * 6.283); g.stroke(); }
  sound.update(id, p, { freeze: state.freeze, lamps: state.lamps.length });
  placeLabels(id, p);
}

// ---------------- 캔버스 인터랙션 ----------------
addEventListener('click', (e) => {
  if (e.target.closest('.card, .bs-top, .bs-menu, .bs-progress, .lab, .bs-credits, .lb')) return;
  if (hold) return; // 이야기를 읽는 동안·다 읽기 전에는 체험을 받지 않음
  const id = SCENES[cur].id;
  if (id === 'prologue' && Math.hypot(e.clientX - X[0], e.clientY - Y[0]) < 60) { state.entered = true; sound.ping('enter'); sensor.vibrate(25); setTimeout(() => window.scrollTo({ top: sections[0].offsetTop + sections[0].offsetHeight * 0.55, behavior: 'smooth' }), 300); }
  if (id === 'life') {
    BOWLS.forEach((b, k) => { const q = bowlPos(k); if (Math.hypot(e.clientX - q.x, e.clientY - q.y) < 36 && state.bowls[k] < 1) { state.bowls[k] = Math.min(1, state.bowls[k] + 0.5); const done = state.bowls.filter((v) => v >= 1).length; sound.ping(done === 10 && state.bowls[k] >= 1 ? 'bowlsDone' : 'bowl'); sensor.vibrate(done === 10 && state.bowls[k] >= 1 ? [30, 50, 30, 50, 60] : 15); sound.rattle(0.3); document.querySelectorAll('.bowl-n').forEach((n) => (n.textContent = done)); if (done === 10) { state.bowlTip = true; showTip(UI.bowlsDone, UI.bowlsDoneT, { getBoundingClientRect: () => ({ left: CX - 120, top: CY + R * 0.7 }) }); } else showTip(b.t, state.bowls[k] >= 1 ? UI.bowlFull : UI.bowlMore, { getBoundingClientRect: () => ({ left: q.x - 40, top: q.y - 10 }) }); } });
  }
  if (id === 'hunger') { const q = jarPos(); if (Math.hypot(e.clientX - q.x, e.clientY - q.y) < 60) jarShake(); }
  if (id === 'truth') addJuly();
  if (TOUCH && (id === 'mine' || id === 'truth')) { // 터치: 밝은 점 근처를 누르면 설명
    for (let i = 0; i < 1800; i += 14) { if (C[i] === 3 && A[i] > 0.5 && Math.hypot(e.clientX - X[i], e.clientY - Y[i]) < 24) { showTip(tr('신원이 확인된 사람'), tr('127명 가운데 한 사람입니다. 이 전시는 이름을 표시하지 않습니다.'), { getBoundingClientRect: () => ({ left: X[i] - 20, top: Y[i] }) }); break; } }
  }
  if (id === 'light' && state.lamps.length < 60) { sound.ping('lamp'); state.lamps.push({ x: e.clientX - (state.ar ? -sensor.tiltX * W * 0.6 : 0), y: e.clientY - (state.ar ? -sensor.tiltY * H * 0.5 : 0), v: state.ar ? 0.12 + Math.random() * 0.15 : 0.25 + Math.random() * 0.35, ph: Math.random() * 6, ar: !!state.ar }); sensor.vibrate(15); document.querySelectorAll('.lamp-n').forEach((n) => (n.textContent = state.lamps.length)); }
  if (id === 'share') {
    // 가장 가까운 주먹밥을 옆 자리로 건넴
    let best = null, bd = 1e9;
    state.balls.forEach((b) => { const x = CX + Math.cos(b.a) * R * b.r, y = CY + Math.sin(b.a) * R * b.r * 0.75, d = Math.hypot(e.clientX - x, e.clientY - y); if (d < bd) { bd = d; best = b; } });
    if (best && bd < 70) { best.ta += Math.PI * 2 / 10 * (1 + Math.floor(Math.random() * 3)); best.tr = 0.55 + Math.random() * 0.35; state.share++; sound.ping('share'); sensor.vibrate(20); document.querySelectorAll('.share-n').forEach((n) => (n.textContent = state.share)); }
  }
});
addEventListener('pointermove', (e) => {
  const id = SCENES[cur].id;
  if (id === 'life') {
    BOWLS.forEach((b, k) => { const q = bowlPos(k); if (Math.hypot(e.clientX - q.x, e.clientY - q.y) < 30 && hud._last !== k) { hud._last = k; showTip(b.t, UI.bowlHover, { getBoundingClientRect: () => ({ left: q.x - 40, top: q.y - 10 }) }); } });
  }
  if (id === 'mine' || id === 'truth') {
    for (let i = 0; i < 1800; i += 14) { if (C[i] === 3 && A[i] > 0.5 && Math.hypot(e.clientX - X[i], e.clientY - Y[i]) < 8) { if (hud._last !== i) { hud._last = i; showTip(tr('신원이 확인된 사람'), tr('127명 가운데 한 사람입니다. 이 전시는 이름을 표시하지 않습니다.'), { getBoundingClientRect: () => ({ left: X[i] - 20, top: Y[i] }) }); } break; } }
  }
  if (id === 'light') state.memories.forEach((m) => { if (m._x && Math.hypot(e.clientX - m._x, e.clientY - m._y) < 20) showTip(tr('남긴 문장'), m.text, { getBoundingClientRect: () => ({ left: m._x - 60, top: m._y }) }); });
});
// 첫 쌀알 호버 시 안내
addEventListener('keydown', (e) => { if (SCENES[cur].id === 'prologue' && (e.key === 'Enter' || e.key === ' ') && !e.target.closest('textarea, button, a')) { state.entered = true; } });

// 기억 입력
document.querySelectorAll('.mem-f').forEach((f) => {
  const ta = f.querySelector('textarea'), n = f.querySelector('.mem-n');
  ta.addEventListener('input', () => (n.textContent = `${ta.value.length} / 120`));
  f.addEventListener('submit', (e) => {
    e.preventDefault(); const text = ta.value.trim().slice(0, 120); if (!text) return ta.focus();
    state.memories.push({ text }); sound.ping('memory'); try { localStorage.setItem('xpace-bitssal-v2', JSON.stringify(state.memories.slice(-20).map((m) => ({ text: m.text })))); } catch (e2) {}
    ta.value = ''; n.textContent = '0 / 120';
    f.parentElement.querySelector('.note').textContent = tr('당신의 문장이 빛이 되어 떠올랐습니다. 빛 위에 커서를 올리면 다시 볼 수 있어요. (이 브라우저에만 저장)');
  });
});

// 시작
document.fonts.ready.catch(() => {}).then(() => { document.querySelector('.bs-loader').classList.add('done'); autoSound(); requestAnimationFrame(frame); });

// ---------------- 모바일 전용: 센서 · 흔들기 · AR ----------------
if (IS_MOBILE) {
  document.body.classList.add('is-mobile');
  addEventListener('click', function once() { removeEventListener('click', once, true); sensor.enable(); }, true); // iPhone: 첫 탭에서 기울기 권한
  sensor.onShake((v) => {
    const id = SCENES[cur].id;
    if (hold || id === 'boundary' || id === 'mine' || id === 'truth') return;
    if (id === 'hunger') { jarShake(); return; }
    sound.rattle(0.4 + v * 0.6); sensor.vibrate([25, 30, 25]);
  });
  addEventListener('click', function aw() { removeEventListener('click', aw, true); keepAwake(); }, true);
  // 후 불기: 빛 장면에서 빛이 떠오름 (빛이 없으면 아래에서 새로 생김)
  document.querySelectorAll('.mic-btn').forEach((btn) => btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    try { await startMic(); btn.textContent = tr('후~ 불면 빛이 떠올라요'); btn.disabled = true; } catch (err) { btn.textContent = tr('마이크를 쓸 수 없어요'); }
  }));
  sensor.onBlow((v) => {
    if (SCENES[cur].id !== 'light' || hold) return;
    const n = 1 + Math.round(v * 3);
    for (let k = 0; k < n && state.lamps.length < 60; k++) state.lamps.push({ x: W * (0.15 + Math.random() * 0.7), y: H + 20, v: 0.5 + Math.random() * 0.6, ph: Math.random() * 6 });
    document.querySelectorAll('.lamp-n').forEach((el) => (el.textContent = state.lamps.length)); sound.ping('lamp'); sensor.vibrate(12);
  });
  // 여러 손가락: 빛 장면에서 손가락마다 빛 하나
  addEventListener('touchstart', (e) => {
    if (SCENES[cur].id !== 'light' || hold || e.touches.length < 2 || e.target.closest('.card, .bs-top, .lb')) return;
    [...e.touches].forEach((tt) => { if (state.lamps.length < 60) state.lamps.push({ x: tt.clientX, y: tt.clientY, v: 0.25 + Math.random() * 0.35, ph: Math.random() * 6 }); });
    document.querySelectorAll('.lamp-n').forEach((el) => (el.textContent = state.lamps.length)); sound.ping('lamp'); sensor.vibrate(20);
  }, { passive: true });
  // 돌리기: 나눔 장면에서 주먹밥이 한 자리씩 옆으로
  sensor.onSpin((dir) => {
    if (SCENES[cur].id !== 'share' || hold) return;
    state.balls.forEach((bl) => { bl.ta += dir * Math.PI * 2 / 10; });
    state.share++; document.querySelectorAll('.share-n').forEach((el) => (el.textContent = state.share)); sound.ping('share'); sensor.vibrate([15, 30, 15]);
  });
  // 엎어 두기: 소리가 잦아듦. 1950·광산·진실규명 장에서는 묵념으로 받아들이고, 다시 들면 머문 시간을 알려줌
  const quiet = document.createElement('div'); quiet.className = 'quiet-msg'; quiet.hidden = true; document.body.appendChild(quiet);
  let downAt = 0, downScene = '';
  sensor.onFaceDown((down) => {
    sound.rest(down);
    if (down) { downAt = performance.now(); downScene = SCENES[cur].id; return; }
    const sec = Math.round((performance.now() - downAt) / 1000);
    if (['boundary', 'mine', 'truth'].includes(downScene) && sec >= 3) {
      quiet.innerHTML = `<b>${tr('함께 기억해 주셔서 고맙습니다')}</b><span>${tr('{n}초 동안 함께 머물렀습니다', { n: sec })}</span>`;
      quiet.hidden = false; quiet.classList.remove('on'); void quiet.offsetWidth; quiet.classList.add('on'); sensor.vibrate(30);
      setTimeout(() => { quiet.hidden = true; }, 4200);
    }
  });
  // 위치: 지금 있는 곳에서 대구까지
  const DAEGU = { lat: 35.8714, lon: 128.6014 };
  document.querySelectorAll('.geo-btn').forEach((btn) => btn.addEventListener('click', async (e) => {
    e.stopPropagation(); const out = btn.parentElement.querySelector('.geo-out');
    try {
      const c = await getPosition(); const km = Math.round(distanceKm({ lat: c.latitude, lon: c.longitude }, DAEGU));
      out.textContent = km < 30 ? tr('지금 당신은 이 이야기가 시작된 대구 가까이(약 {n}km)에 있습니다.', { n: km }) : tr('지금 당신은 1946년 10월의 대구에서 약 {n}km 떨어진 곳에서 이 이야기를 보고 있습니다.', { n: km.toLocaleString() });
      btn.remove(); sensor.vibrate(15);
    } catch (err) { out.textContent = tr('위치를 알 수 없어요 (권한을 확인해 주세요)'); }
  }));
  const vid = document.createElement('video'); vid.className = 'ar-video'; vid.setAttribute('playsinline', ''); vid.muted = true; vid.hidden = true; document.body.prepend(vid);
  const exit = document.createElement('button'); exit.className = 'ar-exit'; exit.hidden = true; exit.textContent = tr('AR 끝내기'); document.body.appendChild(exit);
  let stopCam = null;
  window.stopAR = stopAR;
  document.querySelectorAll('.ar-btn').forEach((btn) => btn.addEventListener('click', async (e) => {
    e.stopPropagation(); sensor.enable();
    try { stopCam = await startCamera(vid); vid.hidden = false; exit.hidden = false; state.ar = true; document.body.classList.add('ar-on'); sensor.vibrate(20); }
    catch (err) { btn.textContent = tr('카메라를 쓸 수 없어요 (권한을 확인해 주세요)'); }
  }));
  exit.addEventListener('click', (e) => { e.stopPropagation(); stopAR(); });
  function stopAR() { if (stopCam) stopCam(); stopCam = null; state.ar = false; vid.hidden = true; exit.hidden = true; document.body.classList.remove('ar-on'); }
  stopARref = stopAR;
}
function stopAR() { stopARref && stopARref(); }
