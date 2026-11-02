// VALIX 앱 껍데기 — 탭(홈·전시·내 서재·MY), 착륙 로딩, 전시 보기
// 전시 내용은 기존 XPACE 페이지(cell.html, bitssal.html)를 같은 주소에서 그대로 불러옵니다.
// 데이터는 기존 data.js(구글 시트 → 백업 JSON)를 그대로 씁니다.
import { loadData, esc } from './data.js?v=17';
import { lang, LANGS } from './i18n.js?v=3';

/* ---------- 문구 (앱 껍데기 전용) ---------- */
const T = {
  en: { '홈': 'Home', '전시': 'Exhibitions', '내 서재': 'Library', 'MY': 'MY', '지금 볼 수 있는 전시': 'Now showing', '입장하기': 'Enter', '다른 전시': 'More exhibitions', '이어 보기': 'Continue', '상영 중': 'Showing', '곧 공개': 'Coming soon', '전체': 'All', '무료 공개': 'Free', '기획전': 'Group show', '방': 'rooms', '관람 기록': 'Your journey', '다녀온 행성': 'Planets visited', '머문 시간': 'Time spent', '관람 횟수': 'Visits', '최근 본 전시': 'Recently viewed', '아직 다녀온 행성이 없어요. 전시 탭에서 첫 행성을 골라 보세요.': 'No planets yet. Pick your first one in Exhibitions.', '저장한 장면': 'Saved scenes', '전시 속 문장과 장면을 저장하는 기능은 곧 열려요.': 'Saving scenes from exhibitions is coming soon.', '구독': 'Membership', '지금은 모든 전시를 무료로 볼 수 있어요. 구독·기간권·소장은 준비 중이에요.': 'All exhibitions are free for now. Membership, passes and purchases are coming soon.', '언어': 'Language', '체험 권한': 'Sensor access', '기울기·흔들기·마이크·카메라·위치는 전시 안에서 체험할 때만 쓰고, 기기 밖으로 저장하거나 보내지 않아요.': 'Tilt, shake, microphone, camera and location are only used inside the experience and never stored or sent anywhere.', '관람 기록 지우기': 'Clear history', '버전': 'Version', '착륙하는 중': 'Landing', '대기권 진입': 'Entering atmosphere', '착륙 완료': 'Landed', '신호가 약해요. 연결을 확인해 주세요.': 'Weak signal. Check your connection.', '다시 시도': 'Try again', '전시를 불러오지 못했어요.': 'Could not load exhibitions.', '분': 'min', '시간': 'h', '일 남음': 'days left', '오늘 종료': 'Ends today', '까지': '', '우주인': 'Astronaut', '탑승': 'Joined' },
  zh: { '홈': '首页', '전시': '展览', '내 서재': '我的书房', 'MY': '我的', '지금 볼 수 있는 전시': '正在展出', '입장하기': '进入', '다른 전시': '更多展览', '이어 보기': '继续观看', '상영 중': '展出中', '곧 공개': '即将开放', '전체': '全部', '무료 공개': '免费', '기획전': '策划展', '방': '个展厅', '관람 기록': '观展记录', '다녀온 행성': '到访行星', '머문 시간': '停留时间', '관람 횟수': '观展次数', '최근 본 전시': '最近观看', '아직 다녀온 행성이 없어요. 전시 탭에서 첫 행성을 골라 보세요.': '还没有到访的行星。去"展览"选择第一颗吧。', '저장한 장면': '收藏的场景', '전시 속 문장과 장면을 저장하는 기능은 곧 열려요.': '收藏展览中的句子与场景功能即将上线。', '구독': '订阅', '지금은 모든 전시를 무료로 볼 수 있어요. 구독·기간권·소장은 준비 중이에요.': '目前所有展览均可免费观看。订阅、限时票与永久购买正在准备中。', '언어': '语言', '체험 권한': '体验权限', '기울기·흔들기·마이크·카메라·위치는 전시 안에서 체험할 때만 쓰고, 기기 밖으로 저장하거나 보내지 않아요.': '倾斜、摇晃、麦克风、相机和位置仅在展览体验中使用，不会保存或发送到设备之外。', '관람 기록 지우기': '清除记录', '버전': '版本', '착륙하는 중': '正在着陆', '대기권 진입': '进入大气层', '착륙 완료': '着陆完成', '신호가 약해요. 연결을 확인해 주세요.': '信号较弱，请检查网络连接。', '다시 시도': '重试', '전시를 불러오지 못했어요.': '无法加载展览。', '분': '分钟', '시간': '小时', '일 남음': '天后结束', '오늘 종료': '今天结束', '까지': '止', '우주인': '宇航员', '탑승': '登船' },
  ja: { '홈': 'ホーム', '전시': '展示', '내 서재': 'ライブラリ', 'MY': 'マイ', '지금 볼 수 있는 전시': '公開中の展示', '입장하기': '入場する', '다른 전시': 'ほかの展示', '이어 보기': '続きを見る', '상영 중': '公開中', '곧 공개': '近日公開', '전체': 'すべて', '무료 공개': '無料', '기획전': '企画展', '방': '部屋', '관람 기록': '鑑賞記録', '다녀온 행성': '訪れた惑星', '머문 시간': '滞在時間', '관람 횟수': '鑑賞回数', '최근 본 전시': '最近見た展示', '아직 다녀온 행성이 없어요. 전시 탭에서 첫 행성을 골라 보세요.': 'まだ訪れた惑星はありません。「展示」から最初の惑星を選んでみましょう。', '저장한 장면': '保存した場面', '전시 속 문장과 장면을 저장하는 기능은 곧 열려요.': '展示の言葉や場面を保存する機能はまもなく公開します。', '구독': 'サブスクリプション', '지금은 모든 전시를 무료로 볼 수 있어요. 구독·기간권·소장은 준비 중이에요.': '現在すべての展示を無料で見られます。サブスク・期間券・購入は準備中です。', '언어': '言語', '체험 권한': '体験の権限', '기울기·흔들기·마이크·카메라·위치는 전시 안에서 체험할 때만 쓰고, 기기 밖으로 저장하거나 보내지 않아요.': '傾き・振る・マイク・カメラ・位置情報は展示の体験中にのみ使い、端末の外に保存・送信しません。', '관람 기록 지우기': '記録を消去', '버전': 'バージョン', '착륙하는 중': '着陸中', '대기권 진입': '大気圏突入', '착륙 완료': '着陸完了', '신호가 약해요. 연결을 확인해 주세요.': '電波が弱いようです。接続を確認してください。', '다시 시도': '再試行', '전시를 불러오지 못했어요.': '展示を読み込めませんでした。', '분': '分', '시간': '時間', '일 남음': '日で終了', '오늘 종료': '本日終了', '까지': 'まで', '우주인': '宇宙飛行士', '탑승': '搭乗' },
};
const t = (k) => (T[lang] && T[lang][k]) ?? k;
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });

const VERSION = '0.1.0';
const $ = (s) => document.querySelector(s);
const view = $('#view');

/* ---------- 관람 기록 (기기 안에만 저장) ---------- */
const KEY = 'valix-history';
const hist = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
const saveHist = (h) => { try { localStorage.setItem(KEY, JSON.stringify(h)); } catch (e) {} };
function profile() {
  let p; try { p = JSON.parse(localStorage.getItem('valix-me')); } catch (e) {}
  if (!p) { const d = new Date(); p = { no: String(Math.floor(1000 + Math.random() * 9000)), since: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}` }; try { localStorage.setItem('valix-me', JSON.stringify(p)); } catch (e) {} }
  return p;
}

/* ---------- 전시 데이터 도우미 ---------- */
const name = (c) => String(c.title || '').replace(/^\s*X-\d+\s*·\s*/, '');
const href = (c) => c.url || `cell.html?id=${encodeURIComponent(c.id)}`;
const isOpen = (c) => c.status === 'open';
const ringFx = (c) => ['prism', 'trio', 'stars'].includes(c.fx);
const planet = (c, extra = '') => `<span class="planet${ringFx(c) ? ' ring' : ''} ${extra}" style="--c:${esc(c.color || '#9db8ff')}"></span>`;
function fmtTime(sec) {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m}${t('분')}`;
  return `${Math.floor(m / 60)}${t('시간')} ${m % 60 ? (m % 60) + t('분') : ''}`.trim();
}
// 시트에 ends(YYYY-MM-DD) 칸이 있으면 남은 기간 표시, 없으면 period 그대로
function periodBadge(c) {
  if (c.ends && /^\d{4}-\d{2}-\d{2}$/.test(c.ends)) {
    const left = Math.ceil((new Date(c.ends + 'T23:59:59') - Date.now()) / 864e5);
    if (left <= 0) return `<span class="badge warn">${t('오늘 종료')}</span>`;
    if (left <= 3) return `<span class="badge warn">${left}${t('일 남음')}</span>`;
    return `<span class="badge">${esc(c.ends.slice(5).replace('-', '.'))} ${t('까지')}</span>`;
  }
  return c.period ? `<span class="badge">${esc(c.period)}</span>` : '';
}
// 시트에 access 칸이 생기면(예: 구독 포함 / 기간권 / 소장) 그대로 보여주고, 없으면 무료 공개
function accessBadge(c) {
  if (!isOpen(c)) return `<span class="badge">${t('곧 공개')}</span>`;
  return `<span class="badge acc">${esc(c.access || t('무료 공개'))}</span>`;
}
function kind(c) {
  if (c.isGroup) return `${c.code} · ${t('기획전')} · ${c.rooms.length}${lang === 'ko' ? '개 ' : ' '}${t('방')}`;
  return c.code;
}

/* ---------- 화면 ---------- */
let cells = [], tab = 'home', filter = 'open';

function rowHTML(c) {
  return `<button class="item${isOpen(c) ? '' : ' off'}" data-open="${esc(c.id)}">
    ${planet(c)}
    <span class="meta">
      <span class="code">${esc(kind(c))}</span>
      <p class="t">${esc(name(c))}</p>
      <p class="a">${esc(c.artist || '')}</p>
      <span class="badges">${accessBadge(c)}${periodBadge(c)}</span>
    </span>
  </button>`;
}

const screens = {
  home() {
    const open = cells.filter(isOpen);
    const h = hist();
    const feat = open[open.length - 1] || cells[0];
    const last = Object.entries(h).sort((a, b) => b[1].last - a[1].last)[0];
    const lastCell = last && cells.find((c) => c.id === last[0]);
    return `
      <p class="vx-muted">${t('지금 볼 수 있는 전시')}</p>
      ${feat ? `<button class="hero" data-open="${esc(feat.id)}" style="--c:${esc(feat.color || '#9db8ff')};margin-top:10px">
        <div class="stage">${planet(feat)}</div>
        <div class="row"><span class="badge">${esc(kind(feat))}</span>${periodBadge(feat)}</div>
        <h2 style="margin-top:10px">${esc(name(feat))}</h2>
        <p class="sub">${esc(feat.subtitle || '')}</p>
        <p class="sub">${esc(feat.artist || '')}</p>
        <span class="go">${t('입장하기')}</span>
      </button>` : ''}
      ${lastCell && lastCell !== feat ? `<div class="vx-sec"><h3>${t('이어 보기')}</h3>${contHTML(lastCell, last[1])}</div>` : ''}
      <div class="vx-sec"><h3>${t('다른 전시')}</h3>${cells.filter((c) => c !== feat).map(rowHTML).join('')}</div>`;
  },
  list() {
    const list = filter === 'all' ? cells : cells.filter((c) => (filter === 'open' ? isOpen(c) : c.status === 'coming'));
    return `
      <div class="chips">
        ${[['open', '상영 중'], ['coming', '곧 공개'], ['all', '전체']].map(([k, l]) => `<button class="chip${filter === k ? ' on' : ''}" data-filter="${k}">${t(l)}</button>`).join('')}
      </div>
      ${list.map(rowHTML).join('') || `<div class="empty" style="margin-top:16px">—</div>`}`;
  },
  library() {
    const h = hist();
    const seen = Object.entries(h).filter(([id]) => cells.some((c) => c.id === id)).sort((a, b) => b[1].last - a[1].last);
    const total = seen.reduce((s, [, v]) => s + (v.time || 0), 0);
    const visits = seen.reduce((s, [, v]) => s + (v.visits || 0), 0);
    return `
      <div class="stats">
        <div class="stat"><b>${seen.length}</b><span>${t('다녀온 행성')}</span></div>
        <div class="stat"><b>${fmtTime(total)}</b><span>${t('머문 시간')}</span></div>
        <div class="stat"><b>${visits}</b><span>${t('관람 횟수')}</span></div>
      </div>
      <div class="vx-sec"><h3>${t('최근 본 전시')}</h3>
        ${seen.length ? seen.map(([id, v]) => contHTML(cells.find((c) => c.id === id), v)).join('<div style="height:8px"></div>') : `<div class="empty">${t('아직 다녀온 행성이 없어요. 전시 탭에서 첫 행성을 골라 보세요.')}</div>`}
      </div>
      <div class="vx-sec"><h3>${t('저장한 장면')}</h3><div class="empty">${t('전시 속 문장과 장면을 저장하는 기능은 곧 열려요.')}</div></div>`;
  },
  my() {
    const p = profile();
    return `
      <div class="me">${planet({ color: '#b9a6ff' })}<div><b>${t('우주인')} ${esc(p.no)}</b><p class="vx-muted">${esc(p.since)} ${t('탑승')}</p></div></div>
      <div class="vx-sec"><h3>${t('구독')}</h3><div class="card"><p class="vx-muted">${t('지금은 모든 전시를 무료로 볼 수 있어요. 구독·기간권·소장은 준비 중이에요.')}</p></div></div>
      <div class="vx-sec"><h3>${t('언어')}</h3><div class="langs">${LANGS.map((l) => `<button data-lang="${l.id}" class="${l.id === lang ? 'on' : ''}">${l.name}</button>`).join('')}</div></div>
      <div class="vx-sec"><h3>${t('체험 권한')}</h3><div class="card"><p class="vx-muted">${t('기울기·흔들기·마이크·카메라·위치는 전시 안에서 체험할 때만 쓰고, 기기 밖으로 저장하거나 보내지 않아요.')}</p></div></div>
      <div class="vx-sec menu">
        <button data-clear>${t('관람 기록 지우기')}</button>
        <div>${t('버전')}<span class="v">VALIX ${VERSION}</span></div>
      </div>`;
  },
};

function contHTML(c, v) {
  if (!c) return '';
  const pct = Math.min(100, Math.round(((v.time || 0) / 900) * 100)); // 15분을 한 번 다 본 것으로 가정
  return `<button class="cont" data-open="${esc(c.id)}">${planet(c)}
    <span class="meta" style="flex:1;min-width:0"><p class="t" style="font-size:15px;font-weight:600">${esc(name(c))}</p>
    <p class="vx-muted" style="font-size:12px">${fmtTime(v.time || 0)} · ${new Date(v.last).toLocaleDateString(lang)}</p>
    <div class="bar"><i style="width:${Math.max(4, pct)}%"></i></div></span></button>`;
}

function render() {
  view.innerHTML = screens[tab]();
  $('#top-title').textContent = tab === 'home' ? '' : t({ list: '전시', library: '내 서재', my: 'MY' }[tab]);
  document.querySelectorAll('.vx-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
}
function go(next) { tab = next; render(); scrollTo(0, 0); }

document.querySelector('.vx-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) go(b.dataset.tab); });
view.addEventListener('click', (e) => {
  const o = e.target.closest('[data-open]');
  if (o) { const c = cells.find((x) => x.id === o.dataset.open); if (c && isOpen(c)) openExhibit(c); return; }
  const f = e.target.closest('[data-filter]'); if (f) { filter = f.dataset.filter; render(); return; }
  const l = e.target.closest('[data-lang]'); if (l && l.dataset.lang !== lang) { try { localStorage.setItem('xpace-lang', l.dataset.lang); } catch (er) {} location.reload(); return; }
  if (e.target.closest('[data-clear]')) { saveHist({}); render(); }
});

/* ---------- 전시 보기 ---------- */
const viewer = $('#viewer'), frame = $('#frame');
let current = null, enteredAt = 0;

function openExhibit(c) {
  current = c; enteredAt = Date.now();
  const h = hist(); h[c.id] = { ...(h[c.id] || {}), last: Date.now(), visits: ((h[c.id] && h[c.id].visits) || 0) + 1 }; saveHist(h);
  landing.start(c);
  viewer.hidden = false;
  frame.src = 'about:blank';
  requestAnimationFrame(() => { frame.src = href(c); });
  history.pushState({ viewer: true }, '');
}
function closeExhibit(fromPop) {
  if (viewer.hidden) return;
  if (current) { const h = hist(); const r = h[current.id] || {}; r.time = (r.time || 0) + Math.round((Date.now() - enteredAt) / 1000); r.last = Date.now(); h[current.id] = r; saveHist(h); }
  landing.stop();
  viewer.hidden = true; frame.src = 'about:blank'; current = null;
  if (!fromPop && history.state && history.state.viewer) history.back();
  render();
}
$('#close').addEventListener('click', () => closeExhibit());
addEventListener('popstate', () => closeExhibit(true));
frame.addEventListener('load', () => {
  if (!current) return;
  let path = '', full = '';
  try { full = frame.contentWindow.location.href; path = frame.contentWindow.location.pathname; } catch (e) {}
  if (!full || full === 'about:blank') return;
  // 전시 안의 XPACE 로고(홈 링크)를 누르면 앱 홈으로 돌아옴
  if (/\/(index\.html)?$/.test(path) || path.endsWith('/app.html')) { closeExhibit(); return; }
  landing.loaded();
});
// 안드로이드 뒤로 가기 (Capacitor 앱에서만)
const CapApp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
if (CapApp) CapApp.addListener('backButton', () => { if (!viewer.hidden) closeExhibit(); else if (tab !== 'home') go('home'); else CapApp.exitApp(); });

/* ---------- 착륙 로딩 화면 ---------- */
const landing = (() => {
  const el = $('#landing'), cv = $('#land-cv'), x = cv.getContext('2d');
  let raf = 0, t0 = 0, p = 0, isLoaded = false, loadedAt = 0, c = null, timer = 0, W = 0, H = 0, dpr = 1, stars = [];
  const MIN = 1600, FIN = 700;
  function size() { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function astro(px, py, s, rot) {
    x.save(); x.translate(px, py); x.rotate(rot); x.scale(s, s);
    x.fillStyle = '#e9ecf5'; x.strokeStyle = '#5a6280'; x.lineWidth = 3;
    const rr = (a, b, w, h, r) => { x.beginPath(); x.roundRect(a, b, w, h, r); x.fill(); x.stroke(); };
    rr(-34, -10, 68, 80, 20); rr(-58, 0, 26, 58, 13); rr(32, -20, 26, 58, 13); rr(-30, 62, 24, 46, 12); rr(6, 62, 24, 46, 12);
    x.fillStyle = '#d3d8e8'; x.beginPath(); x.roundRect(-30, 10, 60, 40, 10); x.fill();
    x.fillStyle = '#e9ecf5'; x.beginPath(); x.arc(0, -46, 40, 0, Math.PI * 2); x.fill(); x.stroke();
    x.fillStyle = '#1c2240'; x.beginPath(); x.ellipse(0, -44, 28, 22, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = 'rgba(255,214,140,.8)'; x.beginPath(); x.ellipse(-10, -52, 8, 5, -0.5, 0, Math.PI * 2); x.fill();
    x.restore();
  }
  function surface(cx, cy, R, now) {
    const col = c.color || '#9db8ff';
    x.save(); x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.clip();
    const g = x.createRadialGradient(cx - R * .35, cy - R * .35, R * .1, cx, cy, R);
    g.addColorStop(0, col); g.addColorStop(1, '#0b0c18'); x.fillStyle = g; x.fillRect(cx - R, cy - R, R * 2, R * 2);
    const n = c.fx === 'rice' ? 90 : 50;
    for (let i = 0; i < n; i++) {
      const a = i * 2.399 + now / 9000, r = R * Math.sqrt((i + .5) / n), tw = .35 + .45 * Math.sin(now / 320 + i);
      x.fillStyle = `rgba(255,255,255,${tw * .55})`; x.beginPath();
      if (c.fx === 'rice') x.ellipse(cx + Math.cos(a) * r, cy + Math.sin(a) * r, R * .022 + 2, R * .012 + 1.2, a, 0, Math.PI * 2);
      else if (c.fx === 'ripple') x.arc(cx, cy, r, a, a + .5);
      else x.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, R * .008 + 1, 0, Math.PI * 2);
      c.fx === 'ripple' ? (x.strokeStyle = x.fillStyle, x.lineWidth = 1.5, x.stroke()) : x.fill();
    }
    x.restore();
  }
  function frame(now) {
    const el2 = now - t0;
    const target = isLoaded && el2 > MIN ? Math.min(1, .82 + .18 * Math.min(1, (now - Math.max(loadedAt, t0 + MIN)) / FIN)) : Math.min(.82, el2 / MIN * .82);
    p += (target - p) * .12; if (target === 1 && p > .995) p = 1;
    const e = p * p * (3 - 2 * p);
    x.fillStyle = '#05060c'; x.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H * .4;
    stars.forEach((s) => { const k = 1 + e * 1.6 * s.z; x.fillStyle = `rgba(255,255,255,${.3 + .35 * s.z / 2.3})`; x.fillRect(cx + (s.x - cx) * k, cy + (s.y - cy) * k, s.z * .9, s.z * .9); });
    const R = Math.min(W, H) * .16 + e * e * Math.max(W, H) * 1.1;
    x.save(); x.globalAlpha = .22; x.fillStyle = c.color || '#9db8ff'; x.beginPath(); x.arc(cx, cy, R * 1.12, 0, Math.PI * 2); x.fill(); x.restore();
    surface(cx, cy, R, now);
    const wait = !isLoaded && p > .8;
    const orbit = wait ? (now / 1400) : 0;
    const ax = wait ? cx + Math.cos(orbit) * R * 1.35 : cx - W * .25 * (1 - e);
    const ay = wait ? cy + Math.sin(orbit) * R * .5 : H * .78 - (H * .78 - cy) * e;
    const as = (Math.min(W, H) / 600) * (wait ? .35 : 1.1 * (1 - e * .92));
    if (as > .03) astro(ax, ay, as, -.35 + Math.sin(now / 600) * .08 + e * .8);
    if (p > .88) { x.fillStyle = `rgba(255,236,190,${(p - .88) / .12})`; x.fillRect(0, 0, W, H); }
    el.classList.toggle('bright', p > .93);
    $('#land-state').textContent = p >= 1 ? t('착륙 완료') : `${t('대기권 진입')} ${Math.round(p * 100)}%`;
    if (p >= 1) { el.classList.add('out'); setTimeout(() => { el.hidden = true; }, 600); cancelAnimationFrame(raf); raf = 0; return; }
    raf = requestAnimationFrame(frame);
  }
  addEventListener('resize', () => { if (!el.hidden) size(); });
  $('#land-retry').addEventListener('click', () => { if (current) { const cc = current; closeExhibit(); openExhibit(cc); } });
  return {
    start(cell) {
      c = cell; size(); stars = [...Array(160)].map(() => ({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * 2 + .3 }));
      p = 0; isLoaded = false; t0 = performance.now(); el.hidden = false; el.classList.remove('out', 'bright');
      $('#land-code').textContent = cell.code || ''; $('#land-title').textContent = `${name(cell)} — ${t('착륙하는 중')}`;
      $('#land-retry').hidden = true; $('#land-retry').textContent = t('다시 시도');
      clearTimeout(timer); timer = setTimeout(() => { if (!isLoaded) { $('#land-retry').hidden = false; $('#land-title').textContent = t('신호가 약해요. 연결을 확인해 주세요.'); } }, 12000);
      cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    },
    loaded() { if (!isLoaded) { isLoaded = true; loadedAt = performance.now(); clearTimeout(timer); $('#land-retry').hidden = true; } },
    stop() { cancelAnimationFrame(raf); raf = 0; clearTimeout(timer); el.hidden = true; },
  };
})();

/* ---------- 시작 ---------- */
(async () => {
  try {
    const d = await loadData();
    cells = d.cells;
    render();
  } catch (e) {
    view.innerHTML = `<div class="empty">${t('전시를 불러오지 못했어요.')}<br><br><button class="chip" onclick="location.reload()">${t('다시 시도')}</button></div>`;
  }
  $('#boot').classList.add('out'); setTimeout(() => $('#boot').remove(), 600);
  // 주소에 #open=전시id 가 있으면 바로 입장 (푸시 알림·공유 링크용)
  const m = location.hash.match(/open=([\w-]+)/);
  if (m) { const c = cells.find((x) => x.id === m[1]); if (c && isOpen(c)) openExhibit(c); }
})();
