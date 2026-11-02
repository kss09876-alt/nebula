// VALIX 앱 화면 — 시작 화면 → 소개 → 로그인 → 닉네임 → 탭(전시·플레이·리워드·마이)
// 전시 내용은 기존 XPACE 페이지(cell.html, bitssal.html)를 같은 주소에서 그대로 불러옵니다.
// 데이터는 기존 data.js(구글 시트 → 백업 JSON)를 그대로 씁니다. 개인 기록은 기기 안(localStorage)에만 저장합니다.
import { loadData, esc } from './data.js?v=17';
import { lang, LANGS } from './i18n.js?v=3';

/* ---------- 문구 ---------- */
const T = {
  en: { '전시': 'Exhibits', '플레이': 'Play', '리워드': 'Rewards', '마이': 'My', '일상은 작고,\n우주는 넓으니까': 'Days feel small,\nthe universe is vast', '잠시 고개를 들어 더 큰 것을 바라보는 시간': 'Look up for a moment at something bigger', '전시 하나가\n행성 하나가 되는 곳': 'Where every exhibition\nbecomes a planet', '매주 새로운 행성에 착륙해 보세요': 'Land on a new planet every week', '다음': 'Next', '건너뛰기': 'Skip', '매주 착륙하는\n온라인 인터랙티브 전시': 'An interactive exhibition\nyou land on every week', '생각과 마음의 폭을 넓히는 시간': 'Widen your thoughts and heart', '카카오로 시작하기': 'Continue with Kakao', 'Apple로 계속하기': 'Continue with Apple', '로그인 전 둘러보기': 'Look around first', '로그인은 곧 열려요. 지금은 둘러보기로 시작할게요.': 'Sign-in is coming soon. Let’s start by looking around.', '마지막으로\n닉네임을 정해주세요': 'Last step:\nchoose a nickname', '닉네임': 'Nickname', '최대 8자까지 입력 가능해요': 'Up to 8 characters', '닉네임은 이 기기에만 저장돼요.': 'Your nickname stays on this device.', '시작하기': 'Start', '입장하기': 'Enter', '이번 주 열린 행성': 'Planets open this week', '지금 상영 중': 'Now showing', '곧 착륙할 행성': 'Landing soon', '기획전': 'Group show', '단독전': 'Solo', '공개': 'Open', '예정': 'Soon', '남음': 'left', '일': 'd', '체험 방법': 'How to play', '휴대폰에서 더 많은 체험을 할 수 있어요.': 'More to try on your phone.', 'n주차, 함께 시작해요!': 'Week {n}, let’s go!', 'n주차': 'Wk {n}', '참여 안내': 'How it works', '3주 연속 착륙하면 <em>항해 리포트</em>가 열려요': 'Land 3 weeks in a row to unlock your <em>voyage report</em>', '이번 주 행성 3곳에 착륙하면\n항해 스탬프 완성!': 'Land on 3 planets this week\nto complete your stamps!', '행성 3곳에 착륙하면 완성돼요': 'Land on 3 planets to complete', '이번 주 스탬프 완성!': 'Stamps complete this week!', '스탬프와 기록은 이 기기에만 저장돼요.': 'Stamps and records stay on this device.', '매주 월요일에 새 주차가 시작돼요. 그 주에 전시에 한 번 이상 입장하면 그 주의 책이 채워져요.': 'A new week starts every Monday. Enter any exhibition that week to fill its book.', '내 프로필': 'My profile', '나의 기록': 'My records', '항해 리포트': 'Voyage report', '다녀온 행성': 'Planets visited', '머문 시간': 'Time spent', '최근 본 전시': 'Recently viewed', '아직 다녀온 행성이 없어요.': 'No planets visited yet.', '언어': 'Language', '체험 권한': 'Sensor access', '기울기·흔들기·마이크·카메라·위치는 전시 안에서 체험할 때만 쓰고, 기기 밖으로 저장하거나 보내지 않아요.': 'Tilt, shake, mic, camera and location are only used during the experience and never stored or sent.', '관람 기록 지우기': 'Clear history', '버전': 'Version', '닉네임을 바꿀까요?': 'Change nickname?', '우주인': 'Astronaut', '분': 'min', '시간': 'h', '착륙하는 중': 'Landing', '대기권 진입': 'Entering atmosphere', '착륙 완료': 'Landed', '신호가 약해요. 연결을 확인해 주세요.': 'Weak signal. Check your connection.', '다시 시도': 'Try again', '전시를 불러오지 못했어요.': 'Could not load exhibitions.', '기록을 지웠어요.': 'History cleared.' },
  zh: { '전시': '展览', '플레이': '互动', '리워드': '奖励', '마이': '我的', '일상은 작고,\n우주는 넓으니까': '日常很小，\n宇宙很大', '잠시 고개를 들어 더 큰 것을 바라보는 시간': '抬起头，看看更大的世界', '전시 하나가\n행성 하나가 되는 곳': '一个展览\n就是一颗行星', '매주 새로운 행성에 착륙해 보세요': '每周登陆一颗新行星', '다음': '下一步', '건너뛰기': '跳过', '매주 착륙하는\n온라인 인터랙티브 전시': '每周登陆的\n线上互动展览', '생각과 마음의 폭을 넓히는 시간': '拓宽思想与心灵', '카카오로 시작하기': '使用 Kakao 开始', 'Apple로 계속하기': '通过 Apple 继续', '로그인 전 둘러보기': '先逛逛', '로그인은 곧 열려요. 지금은 둘러보기로 시작할게요.': '登录功能即将开放，先随便看看吧。', '마지막으로\n닉네임을 정해주세요': '最后，\n请设置昵称', '닉네임': '昵称', '최대 8자까지 입력 가능해요': '最多 8 个字', '닉네임은 이 기기에만 저장돼요.': '昵称只保存在本设备上。', '시작하기': '开始', '입장하기': '进入', '이번 주 열린 행성': '本周开放的行星', '지금 상영 중': '正在展出', '곧 착륙할 행성': '即将登陆', '기획전': '策划展', '단독전': '个展', '공개': '开放', '예정': '即将', '남음': '后结束', '일': '天', '체험 방법': '体验方法', '휴대폰에서 더 많은 체험을 할 수 있어요.': '在手机上可以体验更多。', 'n주차, 함께 시작해요!': '第 {n} 周，一起开始吧！', 'n주차': '第{n}周', '참여 안내': '参与说明', '3주 연속 착륙하면 <em>항해 리포트</em>가 열려요': '连续 3 周登陆即可解锁<em>航行报告</em>', '이번 주 행성 3곳에 착륙하면\n항해 스탬프 완성!': '本周登陆 3 颗行星\n即可集齐印章！', '행성 3곳에 착륙하면 완성돼요': '登陆 3 颗行星即可完成', '이번 주 스탬프 완성!': '本周印章已集齐！', '스탬프와 기록은 이 기기에만 저장돼요.': '印章与记录只保存在本设备上。', '매주 월요일에 새 주차가 시작돼요. 그 주에 전시에 한 번 이상 입장하면 그 주의 책이 채워져요.': '每周一开始新的一周。当周进入任一展览，即可填满当周的书。', '내 프로필': '我的资料', '나의 기록': '我的记录', '항해 리포트': '航行报告', '다녀온 행성': '到访行星', '머문 시간': '停留时间', '최근 본 전시': '最近观看', '아직 다녀온 행성이 없어요.': '还没有到访的行星。', '언어': '语言', '체험 권한': '体验权限', '기울기·흔들기·마이크·카메라·위치는 전시 안에서 체험할 때만 쓰고, 기기 밖으로 저장하거나 보내지 않아요.': '倾斜、摇晃、麦克风、相机与位置仅在体验中使用，不会保存或发送。', '관람 기록 지우기': '清除记录', '버전': '版本', '닉네임을 바꿀까요?': '修改昵称？', '우주인': '宇航员', '분': '分钟', '시간': '小时', '착륙하는 중': '正在着陆', '대기권 진입': '进入大气层', '착륙 완료': '着陆完成', '신호가 약해요. 연결을 확인해 주세요.': '信号较弱，请检查网络。', '다시 시도': '重试', '전시를 불러오지 못했어요.': '无法加载展览。', '기록을 지웠어요.': '记录已清除。' },
  ja: { '전시': '展示', '플레이': 'プレイ', '리워드': 'リワード', '마이': 'マイ', '일상은 작고,\n우주는 넓으니까': '日常は小さく、\n宇宙は広いから', '잠시 고개를 들어 더 큰 것을 바라보는 시간': '少し顔を上げて、もっと大きなものを見る時間', '전시 하나가\n행성 하나가 되는 곳': 'ひとつの展示が\nひとつの惑星になる場所', '매주 새로운 행성에 착륙해 보세요': '毎週、新しい惑星に着陸してみましょう', '다음': '次へ', '건너뛰기': 'スキップ', '매주 착륙하는\n온라인 인터랙티브 전시': '毎週着陸する\nオンライン・インタラクティブ展示', '생각과 마음의 폭을 넓히는 시간': '考えと心の幅を広げる時間', '카카오로 시작하기': 'Kakaoではじめる', 'Apple로 계속하기': 'Appleで続ける', '로그인 전 둘러보기': 'ログインせずに見る', '로그인은 곧 열려요. 지금은 둘러보기로 시작할게요.': 'ログインはまもなく公開します。まずは見てみましょう。', '마지막으로\n닉네임을 정해주세요': '最後に\nニックネームを決めてください', '닉네임': 'ニックネーム', '최대 8자까지 입력 가능해요': '8文字まで入力できます', '닉네임은 이 기기에만 저장돼요.': 'ニックネームはこの端末にのみ保存されます。', '시작하기': 'はじめる', '입장하기': '入場する', '이번 주 열린 행성': '今週ひらいた惑星', '지금 상영 중': '公開中', '곧 착륙할 행성': 'まもなく着陸', '기획전': '企画展', '단독전': '個展', '공개': '公開', '예정': '予定', '남음': '残り', '일': '日', '체험 방법': '体験方法', '휴대폰에서 더 많은 체험을 할 수 있어요.': 'スマートフォンではさらに体験できます。', 'n주차, 함께 시작해요!': '{n}週目、一緒に始めましょう！', 'n주차': '{n}週目', '참여 안내': '参加案内', '3주 연속 착륙하면 <em>항해 리포트</em>가 열려요': '3週連続で着陸すると<em>航海レポート</em>がひらきます', '이번 주 행성 3곳에 착륙하면\n항해 스탬프 완성!': '今週3つの惑星に着陸すると\nスタンプ完成！', '행성 3곳에 착륙하면 완성돼요': '3つの惑星に着陸すると完成します', '이번 주 스탬프 완성!': '今週のスタンプ完成！', '스탬프와 기록은 이 기기에만 저장돼요.': 'スタンプと記録はこの端末にのみ保存されます。', '매주 월요일에 새 주차가 시작돼요. 그 주에 전시에 한 번 이상 입장하면 그 주의 책이 채워져요.': '毎週月曜日に新しい週が始まります。その週に展示へ一度でも入場すると、その週の本が埋まります。', '내 프로필': 'マイプロフィール', '나의 기록': 'わたしの記録', '항해 리포트': '航海レポート', '다녀온 행성': '訪れた惑星', '머문 시간': '滞在時間', '최근 본 전시': '最近見た展示', '아직 다녀온 행성이 없어요.': 'まだ訪れた惑星はありません。', '언어': '言語', '체험 권한': '体験の権限', '기울기·흔들기·마이크·카메라·위치는 전시 안에서 체험할 때만 쓰고, 기기 밖으로 저장하거나 보내지 않아요.': '傾き・振る・マイク・カメラ・位置情報は体験中にのみ使い、保存・送信しません。', '관람 기록 지우기': '記録を消去', '버전': 'バージョン', '닉네임을 바꿀까요?': 'ニックネームを変更しますか？', '우주인': '宇宙飛行士', '분': '分', '시간': '時間', '착륙하는 중': '着陸中', '대기권 진입': '大気圏突入', '착륙 완료': '着陸完了', '신호가 약해요. 연결을 확인해 주세요.': '電波が弱いようです。接続を確認してください。', '다시 시도': '再試行', '전시를 불러오지 못했어요.': '展示を読み込めませんでした。', '기록을 지웠어요.': '記録を消去しました。' },
};
const t = (k, n) => { let s = (T[lang] && T[lang][k]) ?? k; if (n != null) s = s.replace('{n}', n).replace(/^n/, n); return s; };
const br = (s) => esc(s).replace(/\n/g, '<br>');
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });

const VERSION = '0.2.0';
const LAUNCH = new Date('2026-10-05T00:00:00'); // XPACE 개관 주의 월요일 → Vol.1
const $ = (s) => document.querySelector(s);
const view = $('#view'), tabsEl = $('#tabs');
const store = { get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

function toast(msg) { const el = $('#toast'); el.textContent = msg; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; }, 2600); }

/* ---------- 날짜 · 주차 ---------- */
const DAY = 864e5;
const monday = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const weekEnd = () => new Date(monday(Date.now()).getTime() + 7 * DAY - 1000);
const vol = () => Math.max(1, Math.floor((monday(Date.now()) - LAUNCH) / (7 * DAY)) + 1);
function left(c) {
  let end = weekEnd();
  if (c && c.ends && /^\d{4}-\d{2}-\d{2}$/.test(c.ends)) { const e = new Date(c.ends + 'T23:59:59'); if (e < end) end = e; }
  const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
  const d = Math.floor(s / 86400), h = String(Math.floor(s / 3600) % 24).padStart(2, '0'), m = String(Math.floor(s / 60) % 60).padStart(2, '0'), ss = String(s % 60).padStart(2, '0');
  return `${d ? d + t('일') + ' ' : ''}${h}:${m}:${ss} ${t('남음')}`;
}

/* ---------- 기록 (기기 안에만) ---------- */
const hist = () => store.get('valix-history', {});
const visits = () => store.get('valix-visits', []); // [{id, at}]
const me = () => store.get('valix-me', null);
function fmtTime(sec) { const m = Math.round(sec / 60); return m < 60 ? `${m}${t('분')}` : `${Math.floor(m / 60)}${t('시간')} ${m % 60 ? (m % 60) + t('분') : ''}`.trim(); }

/* ---------- 전시 도우미 ---------- */
let cells = [];
const name = (c) => String(c.title || '').replace(/^\s*X-\d+\s*·\s*/, '');
const href = (c) => c.url || `cell.html?id=${encodeURIComponent(c.id)}`;
const isOpen = (c) => c.status === 'open';
const ringFx = (c) => ['prism', 'trio', 'stars'].includes(c.fx);
const poster = (c, cls = '') => `<span class="poster${ringFx(c) ? ' ring' : ''} ${cls}" style="--c:${esc(c.color || '#9db8ff')}"><span class="pc">${esc(c.code || '')}</span><span class="pt">${esc(name(c))}</span></span>`;
const kindTag = (c) => c.isGroup ? `<span class="tag t3">${t('기획전')}</span>` : c.url ? `<span class="tag t1">${t('단독전')}</span>` : `<span class="tag t2">${t('전시')}</span>`;
const featured = () => { const o = cells.filter(isOpen); return o[o.length - 1] || cells[0]; };

// 플레이 카드에 쓰는 체험 안내 (전시 id 기준, 없으면 기본 문구)
const PLAYS = {
  g001: { ko: ['흔들면 우주가 관측돼요.\n당신이 보는 순간, 무엇이 정해질까요?', '흔들어 양자 관측 · 기울여 프리즘과 그림자 빛'], en: ['Shake to observe the universe.\nWhat is decided the moment you look?', 'Shake to observe · tilt for prism and shadow light'], zh: ['摇一摇，观测宇宙。\n你看的那一刻，什么被决定了？', '摇晃观测量子 · 倾斜看棱镜与影子'], ja: ['振ると宇宙が観測されます。\n見た瞬間、何が決まるのでしょう？', '振って量子を観測 · 傾けてプリズムと影の光'], glyph: 'M12 3v4M12 17v4M3 12h4M17 12h4M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0' },
  c005: { ko: ['한 톨의 쌀은\n누구의 삶이었을까요?', '기울이면 쌀이 쏟아지고, 엎어두면 묵념이 돼요'], en: ['Whose life was\na single grain of rice?', 'Tilt to pour rice · lay your phone face down to observe silence'], zh: ['一粒米，\n曾是谁的人生？', '倾斜让米流下 · 手机朝下放置即为默哀'], ja: ['一粒の米は\n誰の人生だったのでしょう？', '傾けると米がこぼれ、伏せると黙祷になります'], glyph: 'M12 4c3 4 3 12 0 16c-3-4-3-12 0-16z' },
  c004: { ko: ['소음과 음악,\n그 경계는 어디일까요?', '소리를 듣고, 건반을 직접 눌러 보세요'], en: ['Noise and music —\nwhere is the line?', 'Listen, then play the keys yourself'], zh: ['噪音与音乐，\n界线在哪里？', '聆听，然后亲手弹奏'], ja: ['ノイズと音楽、\nその境界はどこでしょう？', '音を聴いて、鍵盤を押してみましょう'], glyph: 'M4 12h2l2-5 3 10 3-8 2 3h4' },
};
const playOf = (c) => { const p = PLAYS[c.id]; const l = p ? (p[lang] || p.ko) : [c.subtitle || name(c), c.summary || '']; return { q: l[0], how: l[1], glyph: (p && p.glyph) || 'M12 12m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0' }; };

/* ---------- 첫 실행: 소개 → 로그인 → 닉네임 ---------- */
const ob = $('#onboard');
function wall() {
  const list = cells.length ? cells : [{ color: '#9db8ff', title: 'XPACE' }];
  const row = (k) => `<div class="row">${Array.from({ length: 9 }, (_, i) => poster(list[(i + k) % list.length])).join('')}</div>`;
  return `<div class="ob-wall"><div class="rows">${row(0)}${row(1)}${row(2)}</div></div>`;
}
const OB = {
  intro(step) {
    const s = [['일상은 작고,\n우주는 넓으니까', '잠시 고개를 들어 더 큰 것을 바라보는 시간'], ['전시 하나가\n행성 하나가 되는 곳', '매주 새로운 행성에 착륙해 보세요']][step];
    return `${wall()}<div class="ob-text"><h1>${br(t(s[0]))}</h1><p>${esc(t(s[1]))}</p></div>
      <div class="dots"><i class="${step === 0 ? 'on' : ''}"></i><i class="${step === 1 ? 'on' : ''}"></i></div>
      <button class="btn black" data-ob="${step === 0 ? 'intro1' : 'login'}">${t('다음')}</button><button class="link" data-ob="login">${t('건너뛰기')}</button>`;
  },
  login() {
    return `<div class="ob-center"><h1>${br(t('매주 착륙하는\n온라인 인터랙티브 전시'))}</h1><p>${esc(t('생각과 마음의 폭을 넓히는 시간'))}</p></div>
      <div class="ob-login">
        <button class="btn kakao" data-ob="soon"><svg viewBox="0 0 24 24"><path fill="#191600" d="M12 4C6.9 4 3 7.2 3 11.1c0 2.5 1.6 4.6 4 5.9l-.9 3.4 3.9-2.6c.6.1 1.3.1 2 .1 5.1 0 9-3.2 9-7.1S17.1 4 12 4z"/></svg>${t('카카오로 시작하기')}</button>
        <button class="btn black" data-ob="soon"><svg viewBox="0 0 24 24"><path fill="#fff" d="M16.4 12.6c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7c-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.5 2 1 0 1.4-.6 2.6-.6s1.5.6 2.6.6c1.1 0 1.8-1 2.4-2 .8-1.1 1.1-2.2 1.1-2.3 0 0-2.1-.8-2.1-3.1zM14.5 6.6c.5-.7.9-1.6.8-2.6-.8 0-1.8.5-2.4 1.2-.5.6-1 1.6-.8 2.5.9.1 1.8-.4 2.4-1.1z"/></svg>${t('Apple로 계속하기')}</button>
        <button class="link" data-ob="nick">${t('로그인 전 둘러보기')} ›</button>
      </div>`;
  },
  nick() {
    return `<button class="back" data-ob="login" aria-label="뒤로"><svg viewBox="0 0 24 24"><path d="M20 12H4M10 6l-6 6 6 6"/></svg></button>
      <h1 class="ob-h">${br(t('마지막으로\n닉네임을 정해주세요'))}</h1>
      <div class="field"><label for="nick">${t('닉네임')}</label><input id="nick" maxlength="8" autocomplete="off" placeholder="${esc(t('최대 8자까지 입력 가능해요'))}" /><p class="hint">${t('닉네임은 이 기기에만 저장돼요.')}</p></div>
      <div style="margin-top:auto"><button class="btn off" id="nick-go" data-ob="done">${t('시작하기')}</button></div>`;
  },
};
function showOB(k) {
  ob.hidden = false; view.hidden = true; tabsEl.hidden = true;
  ob.innerHTML = k === 'intro0' ? OB.intro(0) : k === 'intro1' ? OB.intro(1) : OB[k]();
  if (k === 'nick') { const i = $('#nick'), b = $('#nick-go'); i.addEventListener('input', () => b.className = 'btn ' + (i.value.trim() ? 'black' : 'off')); setTimeout(() => i.focus(), 200); }
}
ob.addEventListener('click', (e) => {
  const b = e.target.closest('[data-ob]'); if (!b) return;
  const k = b.dataset.ob;
  if (k === 'soon') { toast(t('로그인은 곧 열려요. 지금은 둘러보기로 시작할게요.')); setTimeout(() => showOB('nick'), 900); return; }
  if (k === 'done') {
    const nick = $('#nick').value.trim().slice(0, 8); if (!nick) return;
    const old = me();
    store.set('valix-me', { nick, since: (old && old.since) || Date.now() });
    store.set('valix-onboarded', true); ob.hidden = true; ob.innerHTML = ''; go(tab); return;
  }
  showOB(k);
});

/* ---------- 탭 화면 ---------- */
let tab = 'home', ticker = 0;
const bell = `<button class="dot" aria-label="알림"><svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0"/></svg></button>`;
const clock = `<button data-tab-go="my" aria-label="기록"><svg viewBox="0 0 24 24"><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6M3.5 4v4h4M12 8v4l3 2"/></svg></button>`;
const plus = `<svg viewBox="0 0 24 24"><path d="M12 4v16M4 12h16"/></svg>`;

const screens = {
  home() {
    const f = featured(), open = cells.filter(isOpen), soon = cells.filter((c) => c.status === 'coming');
    const card = (c) => `<button class="card" data-open="${esc(c.id)}">${poster(c)}<p class="ct">${esc(name(c))}</p><p class="cm">${kindTag(c)}${esc(c.period || '')}</p></button>`;
    return `
      <section class="hero" style="--c:${esc(f.color || '#9db8ff')}">
        <div class="top"><div><p class="eyebrow">WEEKLY PLANET</p><p class="vol">Vol. ${vol()}<i></i></p></div><div class="icons">${clock}${bell}</div></div>
        <p class="issue">${open.slice(-2).reverse().map((c) => esc(name(c))).join(' · ')}</p>
        <div class="stage"><span class="orbit"></span><span class="big"></span><button class="enter" data-open="${esc(f.id)}">${t('입장하기')} →</button></div>
      </section>
      <section class="sec"><div class="sec-h"><h2>NEW</h2><button data-tab-go="play" aria-label="더 보기">${plus}</button></div>
        <p class="sec-sub">${t('이번 주 열린 행성')}</p><div class="hscroll">${open.slice().reverse().map(card).join('')}</div></section>
      <section class="sec"><div class="sec-h"><h2>NOW SHOWING</h2></div>
        <p class="sec-sub">${t('지금 상영 중')}</p><div class="grid2">${open.map((c) => `<button data-open="${esc(c.id)}" style="text-align:left">${poster(c)}<p class="ct" style="font-size:16px;font-weight:600;margin-top:10px">${esc(name(c))}</p><p style="font-size:13px;color:var(--tx2);margin-top:4px">${esc(c.artist || '')}</p></button>`).join('')}</div></section>
      ${soon.length ? `<section class="sec"><div class="sec-h"><h2>COMING SOON</h2></div><p class="sec-sub">${t('곧 착륙할 행성')}</p><div class="hscroll">${soon.map(card).join('')}</div></section>` : ''}
      <section class="sec"><p class="about">VALIX · XPACE — ${esc(t('생각과 마음의 폭을 넓히는 시간'))}</p></section>`;
  },
  play() {
    const open = cells.filter(isOpen).slice().reverse();
    const wk = (Date.now() - monday(Date.now())) / (7 * DAY);
    return `<header class="page-h"><h1>PLAY</h1><div class="icons">${bell}</div></header>
      <div class="plays">${open.map((c) => { const p = playOf(c); return `
        <div class="play" style="--c:${esc(c.color || '#9db8ff')}">
          <div class="art"><svg class="glyph" viewBox="0 0 24 24"><path d="${p.glyph}"/></svg><span class="timer" data-left="${esc(c.id)}">${left(c)}</span></div>
          <div class="body"><p class="who">${esc(c.code)} · ${esc(c.artist || '')}</p><h3>${br(p.q)}</h3><p class="how">${esc(p.how)}</p>
            <div class="bar"><i style="width:${Math.round(wk * 100)}%"></i></div>
            <div class="two"><span data-how="${esc(c.id)}">${t('체험 방법')}</span><span data-open="${esc(c.id)}" style="background:#fff;color:#111;border-color:#fff">${t('입장하기')}</span></div></div>
        </div>`; }).join('')}</div>`;
  },
  reward() {
    const p = me() || { since: Date.now() };
    const startW = monday(p.since).getTime(), curW = Math.floor((monday(Date.now()) - startW) / (7 * DAY)); // 0부터
    const v = visits(), weekHas = (w) => v.find((x) => monday(x.at).getTime() === startW + w * 7 * DAY);
    const base = Math.floor(curW / 6) * 6;
    const books = Array.from({ length: 6 }, (_, i) => { const w = base + i, hit = weekHas(w), c = hit && cells.find((x) => x.id === hit.id);
      return `<div class="book${hit ? ' done' : ''}${w === curW ? ' now' : ''}" style="--c:${esc((c && c.color) || '#8a3a3a')}"><i>${hit ? `<b>Vol. ${vol() - (curW - w)}</b>` : ''}</i><span>${t('n주차', w + 1)}</span></div>`; }).join('');
    let streak = 0; for (let w = curW; w >= 0 && weekHas(w); w--) streak++;
    const thisWeek = [...new Set(v.filter((x) => monday(x.at).getTime() === monday(Date.now()).getTime()).map((x) => x.id))];
    return `<header class="page-h"><h1>REWARDS</h1><button style="font-size:17px" data-guide>${t('참여 안내')}</button></header>
      <p class="rw-h">${t('n주차, 함께 시작해요!', curW + 1)}</p>
      <div class="shelf">${books}<div class="book sp"><i><b>SPECIAL</b></i><span>Special</span></div></div>
      <div class="lockcard"><svg viewBox="0 0 24 24"><path d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V8a3 3 0 0 0-6 0z"/></svg><div>${streak >= 3 ? `<em>${t('항해 리포트')}</em> ✓` : t('3주 연속 착륙하면 <em>항해 리포트</em>가 열려요')}</div></div>
      <div class="mission"><h3>${br(t('이번 주 행성 3곳에 착륙하면\n항해 스탬프 완성!'))}</h3>
        <div class="stamps">${[0, 1, 2].map((i) => { const c = cells.find((x) => x.id === thisWeek[i]); return `<i class="${c ? 'on' : ''}">${c ? esc(c.code.replace('X-', '')) : i + 1}</i>`; }).join('')}</div>
        <div class="note${thisWeek.length >= 3 ? ' ready' : ''}">${thisWeek.length >= 3 ? t('이번 주 스탬프 완성!') : t('행성 3곳에 착륙하면 완성돼요')}</div>
        <p>${t('스탬프와 기록은 이 기기에만 저장돼요.')}</p></div>`;
  },
  my() {
    const p = me() || { nick: t('우주인') }, h = hist();
    const seen = Object.entries(h).filter(([id]) => cells.some((c) => c.id === id)).sort((a, b) => b[1].last - a[1].last);
    const total = seen.reduce((s, [, x]) => s + (x.time || 0), 0);
    const avatar = `<svg viewBox="0 0 60 60" fill="none" stroke="#111" stroke-width="1.6" stroke-linecap="round"><circle cx="30" cy="25" r="15"/><rect x="21" y="19" width="18" height="12" rx="6" fill="#1c2240" stroke="none"/><path d="M24 22c1.5-1 3-1 4 0" stroke="#ffd68c"/><path d="M10 58c2-9 10-14 20-14s18 5 20 14"/></svg>`;
    return `<header class="page-h"><h1>MY</h1><div class="icons">${clock}</div></header>
      <div class="me"><span class="avatar">${avatar}</span><div><b>${esc(p.nick)}</b><button data-rename>${t('내 프로필')} ›</button></div></div>
      <section class="sec"><div class="sec-h"><h2 style="font-size:20px">${t('나의 기록')}</h2></div>
        <div class="lockcard v" style="margin:18px 0 0"><svg viewBox="0 0 24 24"><path d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V8a3 3 0 0 0-6 0z"/></svg><div><small>${t('항해 리포트')}</small>${t('3주 연속 착륙하면 <em>항해 리포트</em>가 열려요')}</div></div>
        <div class="stat2"><div>${t('다녀온 행성')}<b>${seen.length || '-'}</b></div><div>${t('머문 시간')}<b>${total ? fmtTime(total) : '-'}</b></div></div></section>
      <section class="sec"><div class="sec-h"><h2 style="font-size:20px">${t('최근 본 전시')}</h2></div>
        ${seen.length ? `<div class="list">${seen.map(([id, x]) => { const c = cells.find((y) => y.id === id); return `<button class="row" data-open="${esc(id)}">${poster(c)}<div><b>${esc(name(c))}</b><span>${new Date(x.last).toLocaleDateString(lang)}</span></div><span class="v">${fmtTime(x.time || 0)}</span></button>`; }).join('')}</div>` : `<p class="empty">${t('아직 다녀온 행성이 없어요.')}</p>`}</section>
      <section class="sec"><div class="sec-h"><h2 style="font-size:20px">${t('언어')}</h2></div><div class="chips">${LANGS.map((l) => `<button data-lang="${l.id}" class="${l.id === lang ? 'on' : ''}">${l.name}</button>`).join('')}</div></section>
      <section class="sec"><div class="sec-h"><h2 style="font-size:20px">${t('체험 권한')}</h2></div><p class="small">${t('기울기·흔들기·마이크·카메라·위치는 전시 안에서 체험할 때만 쓰고, 기기 밖으로 저장하거나 보내지 않아요.')}</p></section>
      <section class="sec list"><button class="row" data-clear><b>${t('관람 기록 지우기')}</b></button><div class="row"><b>${t('버전')}</b><span class="v">VALIX ${VERSION}</span></div></section>`;
  },
};

function go(next) {
  tab = next; view.hidden = false; tabsEl.hidden = false;
  view.className = 'vx-view' + (tab === 'reward' ? ' gray' : '');
  view.innerHTML = screens[tab]();
  tabsEl.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  document.querySelector('meta[name=theme-color]').content = tab === 'home' ? getComputedStyle(view.querySelector('.hero')).backgroundColor : tab === 'reward' ? '#f3f3f6' : '#ffffff';
  scrollTo(0, 0);
  clearInterval(ticker);
  if (tab === 'play') ticker = setInterval(() => view.querySelectorAll('[data-left]').forEach((el) => { el.textContent = left(cells.find((c) => c.id === el.dataset.left)); }), 1000);
}
tabsEl.addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) go(b.dataset.tab); else if (e.target.closest('[data-orb]')) openExhibit(featured()); });
view.addEventListener('click', (e) => {
  const o = e.target.closest('[data-open]'); if (o) { const c = cells.find((x) => x.id === o.dataset.open); if (c && isOpen(c)) openExhibit(c); return; }
  const g = e.target.closest('[data-tab-go]'); if (g) { go(g.dataset.tabGo); return; }
  const hw = e.target.closest('[data-how]'); if (hw) { const c = cells.find((x) => x.id === hw.dataset.how); toast(playOf(c).how + ' · ' + t('휴대폰에서 더 많은 체험을 할 수 있어요.')); return; }
  if (e.target.closest('[data-guide]')) { toast(t('매주 월요일에 새 주차가 시작돼요. 그 주에 전시에 한 번 이상 입장하면 그 주의 책이 채워져요.')); return; }
  if (e.target.closest('[data-rename]')) { showOB('nick'); const p = me(); if (p) { $('#nick').value = p.nick; $('#nick-go').className = 'btn black'; } return; }
  const l = e.target.closest('[data-lang]'); if (l && l.dataset.lang !== lang) { try { localStorage.setItem('xpace-lang', l.dataset.lang); } catch (er) {} location.reload(); return; }
  if (e.target.closest('[data-clear]')) { store.set('valix-history', {}); store.set('valix-visits', []); toast(t('기록을 지웠어요.')); go(tab); }
});

/* ---------- 전시 보기 ---------- */
const viewer = $('#viewer'), frame = $('#frame');
let current = null, enteredAt = 0;
function openExhibit(c) {
  if (!c) return;
  current = c; enteredAt = Date.now();
  const h = hist(); h[c.id] = { ...(h[c.id] || {}), last: Date.now(), visits: ((h[c.id] && h[c.id].visits) || 0) + 1 }; store.set('valix-history', h);
  const v = visits(); v.push({ id: c.id, at: Date.now() }); store.set('valix-visits', v.slice(-500));
  landing.start(c); viewer.hidden = false; frame.src = 'about:blank';
  requestAnimationFrame(() => { frame.src = href(c); });
  history.pushState({ viewer: true }, '');
}
function closeExhibit(fromPop) {
  if (viewer.hidden) return;
  if (current) { const h = hist(); const r = h[current.id] || {}; r.time = (r.time || 0) + Math.round((Date.now() - enteredAt) / 1000); r.last = Date.now(); h[current.id] = r; store.set('valix-history', h); }
  landing.stop(); viewer.hidden = true; frame.src = 'about:blank'; current = null;
  if (!fromPop && history.state && history.state.viewer) history.back();
  go(tab);
}
$('#close').addEventListener('click', () => closeExhibit());
addEventListener('popstate', () => closeExhibit(true));
frame.addEventListener('load', () => {
  if (!current) return;
  let path = '', full = '';
  try { full = frame.contentWindow.location.href; path = frame.contentWindow.location.pathname; } catch (e) {}
  if (!full || full === 'about:blank') return;
  if (/\/(index\.html)?$/.test(path) || path.endsWith('/app.html')) { closeExhibit(); return; } // 전시 안 XPACE 로고 → 앱 홈
  landing.loaded();
});
const CapApp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
if (CapApp) CapApp.addListener('backButton', () => { if (!viewer.hidden) closeExhibit(); else if (!ob.hidden) showOB('login'); else if (tab !== 'home') go('home'); else CapApp.exitApp(); });

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
  const t0 = Date.now();
  try { cells = (await loadData()).cells; } catch (e) { cells = []; }
  await new Promise((r) => setTimeout(r, Math.max(0, 1200 - (Date.now() - t0)))); // 시작 화면 최소 1.2초
  $('#splash').classList.add('out'); setTimeout(() => $('#splash').remove(), 600);
  if (!cells.length) { view.hidden = false; view.innerHTML = `<p class="empty" style="padding-top:40vh">${t('전시를 불러오지 못했어요.')}<br><br><button class="btn line" style="width:auto;padding:0 24px;margin:0 auto" onclick="location.reload()">${t('다시 시도')}</button></p>`; return; }
  if (!store.get('valix-onboarded', false)) showOB('intro0'); else go('home');
  const m = location.hash.match(/open=([\w-]+)/); // #open=전시id → 바로 입장 (푸시·공유 링크)
  if (m) { const c = cells.find((x) => x.id === m[1]); if (c && isOpen(c)) openExhibit(c); }
})();
