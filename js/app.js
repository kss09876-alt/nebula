// NEBULA 앱 화면 — 시작 화면 → 소개 → 로그인 → 닉네임 → 탭(전시·플레이·리워드·마이)
// 전시 내용은 기존 NEBULA 페이지(cell.html, bitssal.html)를 같은 주소에서 그대로 불러옵니다.
// 데이터는 기존 data.js(구글 시트 → 백업 JSON)를 그대로 씁니다. 개인 기록은 기기 안(localStorage)에만 저장합니다.
import { loadData, loadLocalData, esc } from './data.js?v=23';
import { lang, LANGS } from './i18n.js?v=5';
import { hasRing } from './planets.js?v=4';
import { planetSrc, planetKey, onPlanet, planetBitmap, warm } from './planet-store.js?v=2';
import { videoHTML, mountVideos, playVideo, stopVideos } from './video.js?v=2';
import { IS_MOBILE, sensor } from './sensors.js?v=3';
import { createAppSky } from './app-sky.js?v=2';
import { createAppSheet } from './app-sheet.js?v=2';
import { createAppLanding } from './app-landing.js?v=1';
import { createMotionPreference } from './app-preferences.js?v=1';
import { createAppDiscover } from './app-discover.js?v=2';
import { createExhibitShare } from './app-share.js?v=1';
import { APP_COPY } from './app-copy.js?v=1';
const motionQuery = createMotionPreference();
let nativeActive = true;

/* ---------- 문구 ---------- */
const T = {
  en: { '마지막으로\n이 우주에서 불릴\n이름을 정해주세요': 'Last step:\nchoose the name\nthis universe will call you', '항해명': 'Voyager name', '이름은 이 기기에만 저장돼요.': 'Your name stays on this device.', '탑승하기': 'Board', '먼저 우주 둘러보기': 'Explore first', '다른 이름 뽑기': 'Draw another name', '이름 바꾸기': 'Rename', '탑승': 'boarded', '곳 착륙': ' planets landed', '최대 12자까지 입력 가능해요': 'Up to 12 characters', '전시': 'Exhibits', '플레이': 'Play', '리워드': 'Rewards', '마이': 'My', '일상은 작고,\n우주는 넓으니까': 'Days feel small,\nthe universe is vast', '잠시 고개를 들어 더 큰 것을 바라보는 시간': 'Look up for a moment at something bigger', '전시 하나가\n행성 하나가 되는 곳': 'Where every exhibition\nbecomes a planet', '매주 새로운 행성에 착륙해 보세요': 'Land on a new planet every week', '다음': 'Next', '건너뛰기': 'Skip', '매주 착륙하는\n온라인 인터랙티브 전시': 'An interactive exhibition\nyou land on every week', '생각과 마음의 폭을 넓히는 시간': 'Widen your thoughts and heart', '카카오로 시작하기': 'Continue with Kakao', 'Apple로 계속하기': 'Continue with Apple', '로그인 전 둘러보기': 'Look around first', '로그인은 곧 열려요. 지금은 둘러보기로 시작할게요.': 'Sign-in is coming soon. Let’s start by looking around.', '마지막으로\n닉네임을 정해주세요': 'Last step:\nchoose a nickname', '닉네임': 'Nickname', '최대 8자까지 입력 가능해요': 'Up to 8 characters', '닉네임은 이 기기에만 저장돼요.': 'Your nickname stays on this device.', '시작하기': 'Start', '입장하기': 'Enter', '이번 주 열린 행성': 'Planets open this week', '지금 상영 중': 'Now showing', '곧 착륙할 행성': 'Landing soon', '기획전': 'Group show', '단독전': 'Solo', '공개': 'Open', '예정': 'Soon', '남음': 'left', '일': 'd', '체험 방법': 'How to play', '휴대폰에서 더 많은 체험을 할 수 있어요.': 'More to try on your phone.', 'n주차, 함께 시작해요!': 'Week {n}, let’s go!', 'n주차': 'Wk {n}', '참여 안내': 'How it works', '3주 연속 착륙하면 <em>항해 리포트</em>가 열려요': 'Land 3 weeks in a row to unlock your <em>voyage report</em>', '이번 주 행성 3곳에 착륙하면\n항해 스탬프 완성!': 'Land on 3 planets this week\nto complete your stamps!', '행성 3곳에 착륙하면 완성돼요': 'Land on 3 planets to complete', '이번 주 스탬프 완성!': 'Stamps complete this week!', '스탬프와 기록은 이 기기에만 저장돼요.': 'Stamps and records stay on this device.', '매주 월요일에 새 주차가 시작돼요. 그 주에 전시에 한 번 이상 입장하면 그 주의 책이 채워져요.': 'A new week starts every Monday. Enter any exhibition that week to fill its book.', '내 프로필': 'My profile', '나의 기록': 'My records', '항해 리포트': 'Voyage report', '다녀온 행성': 'Planets visited', '머문 시간': 'Time spent', '최근 본 전시': 'Recently viewed', '아직 다녀온 행성이 없어요.': 'No planets visited yet.', '언어': 'Language', '체험 권한': 'Sensor access', '기울기·흔들기·마이크·카메라·위치는 전시 안에서 체험할 때만 쓰고, 기기 밖으로 저장하거나 보내지 않아요.': 'Tilt, shake, mic, camera and location are only used during the experience and never stored or sent.', '관람 기록 지우기': 'Clear history', '버전': 'Version', '닉네임을 바꿀까요?': 'Change nickname?', '우주인': 'Astronaut', '분': 'min', '시간': 'h', '착륙하는 중': 'Landing', '대기권 진입': 'Entering atmosphere', '착륙 완료': 'Landed', '신호가 약해요. 연결을 확인해 주세요.': 'Weak signal. Check your connection.', '다시 시도': 'Try again', '전시를 불러오지 못했어요.': 'Could not load exhibitions.', '기록을 지웠어요.': 'History cleared.' },
  zh: { '마지막으로\n이 우주에서 불릴\n이름을 정해주세요': '最后，\n请取一个\n在这片宇宙里的名字', '항해명': '航行名', '이름은 이 기기에만 저장돼요.': '名字只保存在本设备上。', '탑승하기': '登船', '먼저 우주 둘러보기': '先看看宇宙', '다른 이름 뽑기': '换一个名字', '이름 바꾸기': '改名', '탑승': '登船', '곳 착륙': ' 颗行星已登陆', '최대 12자까지 입력 가능해요': '最多 12 个字', '전시': '展览', '플레이': '互动', '리워드': '奖励', '마이': '我的', '일상은 작고,\n우주는 넓으니까': '日常很小，\n宇宙很大', '잠시 고개를 들어 더 큰 것을 바라보는 시간': '抬起头，看看更大的世界', '전시 하나가\n행성 하나가 되는 곳': '一个展览\n就是一颗行星', '매주 새로운 행성에 착륙해 보세요': '每周登陆一颗新行星', '다음': '下一步', '건너뛰기': '跳过', '매주 착륙하는\n온라인 인터랙티브 전시': '每周登陆的\n线上互动展览', '생각과 마음의 폭을 넓히는 시간': '拓宽思想与心灵', '카카오로 시작하기': '使用 Kakao 开始', 'Apple로 계속하기': '通过 Apple 继续', '로그인 전 둘러보기': '先逛逛', '로그인은 곧 열려요. 지금은 둘러보기로 시작할게요.': '登录功能即将开放，先随便看看吧。', '마지막으로\n닉네임을 정해주세요': '最后，\n请设置昵称', '닉네임': '昵称', '최대 8자까지 입력 가능해요': '最多 8 个字', '닉네임은 이 기기에만 저장돼요.': '昵称只保存在本设备上。', '시작하기': '开始', '입장하기': '进入', '이번 주 열린 행성': '本周开放的行星', '지금 상영 중': '正在展出', '곧 착륙할 행성': '即将登陆', '기획전': '策划展', '단독전': '个展', '공개': '开放', '예정': '即将', '남음': '后结束', '일': '天', '체험 방법': '体验方法', '휴대폰에서 더 많은 체험을 할 수 있어요.': '在手机上可以体验更多。', 'n주차, 함께 시작해요!': '第 {n} 周，一起开始吧！', 'n주차': '第{n}周', '참여 안내': '参与说明', '3주 연속 착륙하면 <em>항해 리포트</em>가 열려요': '连续 3 周登陆即可解锁<em>航行报告</em>', '이번 주 행성 3곳에 착륙하면\n항해 스탬프 완성!': '本周登陆 3 颗行星\n即可集齐印章！', '행성 3곳에 착륙하면 완성돼요': '登陆 3 颗行星即可完成', '이번 주 스탬프 완성!': '本周印章已集齐！', '스탬프와 기록은 이 기기에만 저장돼요.': '印章与记录只保存在本设备上。', '매주 월요일에 새 주차가 시작돼요. 그 주에 전시에 한 번 이상 입장하면 그 주의 책이 채워져요.': '每周一开始新的一周。当周进入任一展览，即可填满当周的书。', '내 프로필': '我的资料', '나의 기록': '我的记录', '항해 리포트': '航行报告', '다녀온 행성': '到访行星', '머문 시간': '停留时间', '최근 본 전시': '最近观看', '아직 다녀온 행성이 없어요.': '还没有到访的行星。', '언어': '语言', '체험 권한': '体验权限', '기울기·흔들기·마이크·카메라·위치는 전시 안에서 체험할 때만 쓰고, 기기 밖으로 저장하거나 보내지 않아요.': '倾斜、摇晃、麦克风、相机与位置仅在体验中使用，不会保存或发送。', '관람 기록 지우기': '清除记录', '버전': '版本', '닉네임을 바꿀까요?': '修改昵称？', '우주인': '宇航员', '분': '分钟', '시간': '小时', '착륙하는 중': '正在着陆', '대기권 진입': '进入大气层', '착륙 완료': '着陆完成', '신호가 약해요. 연결을 확인해 주세요.': '信号较弱，请检查网络。', '다시 시도': '重试', '전시를 불러오지 못했어요.': '无法加载展览。', '기록을 지웠어요.': '记录已清除。' },
  ja: { '마지막으로\n이 우주에서 불릴\n이름을 정해주세요': '最後に\nこの宇宙で呼ばれる\n名前を決めてください', '항해명': '航海名', '이름은 이 기기에만 저장돼요.': '名前はこの端末にのみ保存されます。', '탑승하기': '搭乗する', '먼저 우주 둘러보기': 'まず宇宙を見てみる', '다른 이름 뽑기': '別の名前をひく', '이름 바꾸기': '名前を変える', '탑승': '搭乗', '곳 착륙': 'つの惑星に着陸', '최대 12자까지 입력 가능해요': '12文字まで入力できます', '전시': '展示', '플레이': 'プレイ', '리워드': 'リワード', '마이': 'マイ', '일상은 작고,\n우주는 넓으니까': '日常は小さく、\n宇宙は広いから', '잠시 고개를 들어 더 큰 것을 바라보는 시간': '少し顔を上げて、もっと大きなものを見る時間', '전시 하나가\n행성 하나가 되는 곳': 'ひとつの展示が\nひとつの惑星になる場所', '매주 새로운 행성에 착륙해 보세요': '毎週、新しい惑星に着陸してみましょう', '다음': '次へ', '건너뛰기': 'スキップ', '매주 착륙하는\n온라인 인터랙티브 전시': '毎週着陸する\nオンライン・インタラクティブ展示', '생각과 마음의 폭을 넓히는 시간': '考えと心の幅を広げる時間', '카카오로 시작하기': 'Kakaoではじめる', 'Apple로 계속하기': 'Appleで続ける', '로그인 전 둘러보기': 'ログインせずに見る', '로그인은 곧 열려요. 지금은 둘러보기로 시작할게요.': 'ログインはまもなく公開します。まずは見てみましょう。', '마지막으로\n닉네임을 정해주세요': '最後に\nニックネームを決めてください', '닉네임': 'ニックネーム', '최대 8자까지 입력 가능해요': '8文字まで入力できます', '닉네임은 이 기기에만 저장돼요.': 'ニックネームはこの端末にのみ保存されます。', '시작하기': 'はじめる', '입장하기': '入場する', '이번 주 열린 행성': '今週ひらいた惑星', '지금 상영 중': '公開中', '곧 착륙할 행성': 'まもなく着陸', '기획전': '企画展', '단독전': '個展', '공개': '公開', '예정': '予定', '남음': '残り', '일': '日', '체험 방법': '体験方法', '휴대폰에서 더 많은 체험을 할 수 있어요.': 'スマートフォンではさらに体験できます。', 'n주차, 함께 시작해요!': '{n}週目、一緒に始めましょう！', 'n주차': '{n}週目', '참여 안내': '参加案内', '3주 연속 착륙하면 <em>항해 리포트</em>가 열려요': '3週連続で着陸すると<em>航海レポート</em>がひらきます', '이번 주 행성 3곳에 착륙하면\n항해 스탬프 완성!': '今週3つの惑星に着陸すると\nスタンプ完成！', '행성 3곳에 착륙하면 완성돼요': '3つの惑星に着陸すると完成します', '이번 주 스탬프 완성!': '今週のスタンプ完成！', '스탬프와 기록은 이 기기에만 저장돼요.': 'スタンプと記録はこの端末にのみ保存されます。', '매주 월요일에 새 주차가 시작돼요. 그 주에 전시에 한 번 이상 입장하면 그 주의 책이 채워져요.': '毎週月曜日に新しい週が始まります。その週に展示へ一度でも入場すると、その週の本が埋まります。', '내 프로필': 'マイプロフィール', '나의 기록': 'わたしの記録', '항해 리포트': '航海レポート', '다녀온 행성': '訪れた惑星', '머문 시간': '滞在時間', '최근 본 전시': '最近見た展示', '아직 다녀온 행성이 없어요.': 'まだ訪れた惑星はありません。', '언어': '言語', '체험 권한': '体験の権限', '기울기·흔들기·마이크·카메라·위치는 전시 안에서 체험할 때만 쓰고, 기기 밖으로 저장하거나 보내지 않아요.': '傾き・振る・マイク・カメラ・位置情報は体験中にのみ使い、保存・送信しません。', '관람 기록 지우기': '記録を消去', '버전': 'バージョン', '닉네임을 바꿀까요?': 'ニックネームを変更しますか？', '우주인': '宇宙飛行士', '분': '分', '시간': '時間', '착륙하는 중': '着陸中', '대기권 진입': '大気圏突入', '착륙 완료': '着陸完了', '신호가 약해요. 연결을 확인해 주세요.': '電波が弱いようです。接続を確認してください。', '다시 시도': '再試行', '전시를 불러오지 못했어요.': '展示を読み込めませんでした。', '기록을 지웠어요.': '記録を消去しました。' },
};
Object.keys(APP_COPY).forEach((language) => Object.assign(T[language], APP_COPY[language]));
const t = (k, n) => { let s = (T[lang] && T[lang][k]) ?? k; if (n != null) s = s.replace('{n}', n).replace(/^n/, n); return s; };
const br = (s) => esc(s).replace(/\n/g, '<br>');
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });

const VERSION = '0.8.0';

/* ---------- 우주 방랑자 이름 ---------- */
const NAMES = {
  ko: [['떠도는', '고요한', '새벽의', '잠든', '푸른', '먼', '길 잃은', '느린', '반짝이는', '이름 없는', '마지막', '첫'], ['방랑자', '혜성', '성운', '항해자', '별지기', '위성', '유성', '관측자', '순례자', '등대지기', '여행자', '우주인']],
  en: [['Drifting', 'Quiet', 'Dawn', 'Sleeping', 'Blue', 'Distant', 'Lost', 'Slow', 'Glimmering', 'Nameless', 'Last', 'First'], ['Wanderer', 'Comet', 'Nebula', 'Voyager', 'Stargazer', 'Moon', 'Meteor', 'Observer', 'Pilgrim', 'Keeper', 'Traveler', 'Astronaut']],
  zh: [['流浪的', '安静的', '黎明的', '沉睡的', '蓝色的', '遥远的', '迷路的', '缓慢的', '闪烁的', '无名的'], ['旅人', '彗星', '星云', '航海者', '观星人', '卫星', '流星', '朝圣者', '守灯人', '宇航员']],
  ja: [['さすらう', 'しずかな', '夜明けの', '眠る', '青い', '遠い', '迷子の', 'ゆっくりの', 'またたく', '名もなき'], ['旅人', '彗星', '星雲', '航海士', '星守り', '衛星', '流星', '観測者', '巡礼者', '灯台守']],
};
function wanderer() {
  const [a, b] = NAMES[lang] || NAMES.ko, r = (x) => x[Math.floor(Math.random() * x.length)];
  return `${r(a)} ${r(b)}`;
}
const LAUNCH = new Date('2026-10-05T00:00:00'); // NEBULA 개관 주의 월요일 → Vol.1
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
const name = (c) => String(c.title || '').replace(/^\s*(?:(?:CELL|X|N)\s*-?\s*\d+\s*[·:|–-]\s*)+/i, '');
const href = (c) => c.url || `cell.html?id=${encodeURIComponent(c.id)}`;
const isOpen = (c) => c.status === 'open';
const ringFx = (c) => ['prism', 'trio', 'stars'].includes(c.fx);
const poster = (c, cls = '') => `<span class="poster ${cls}" style="--c:${esc(c.color || '#9db8ff')}"><img class="pl" data-pl="${esc(planetKey(c))}" src="${planetSrc(c)}" decoding="async" alt="" draggable="false"><span class="pc">${esc(c.code || '')}</span><span class="pt">${esc(name(c))}</span></span>`;
const kindTag = (c) => c.isGroup ? `<span class="tag t3">${t('기획전')}</span>` : c.url ? `<span class="tag t1">${t('단독전')}</span>` : `<span class="tag t2">${t('전시')}</span>`;
const featured = () => { const o = cells.filter(isOpen); return o[o.length - 1] || cells[0]; };

// 플레이 카드에 쓰는 체험 안내 (전시 id 기준, 없으면 기본 문구)
const PLAYS = {
  g001: { ko: ['흔들면 우주가 관측돼요.\n당신이 보는 순간, 무엇이 정해질까요?', '흔들어 양자 관측 · 기울여 프리즘과 그림자 빛'], en: ['Shake to observe the universe.\nWhat is decided the moment you look?', 'Shake to observe · tilt for prism and shadow light'], zh: ['摇一摇，观测宇宙。\n你看的那一刻，什么被决定了？', '摇晃观测量子 · 倾斜看棱镜与影子'], ja: ['振ると宇宙が観測されます。\n見た瞬間、何が決まるのでしょう？', '振って量子を観測 · 傾けてプリズムと影の光'], glyph: 'M12 3v4M12 17v4M3 12h4M17 12h4M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0' },
  c005: { ko: ['한 톨의 쌀은\n누구의 삶이었을까요?', '기울이면 쌀이 쏟아지고, 엎어두면 묵념이 돼요'], en: ['Whose life was\na single grain of rice?', 'Tilt to pour rice · lay your phone face down to observe silence'], zh: ['一粒米，\n曾是谁的人生？', '倾斜让米流下 · 手机朝下放置即为默哀'], ja: ['一粒の米は\n誰の人生だったのでしょう？', '傾けると米がこぼれ、伏せると黙祷になります'], glyph: 'M12 4c3 4 3 12 0 16c-3-4-3-12 0-16z' },
  c006: { ko: ['오늘, 아무것도 하지 않아도\n괜찮을까요?', '앞으로 기울이면 걷고, 몸을 돌려 둘러보고, 앉아서 엎어 두면 좌선'], en: ['Is it alright\nto do nothing today?', 'Tilt forward to walk, turn to look around, sit and lay the phone down to meditate'], zh: ['今天，什么都不做\n也可以吗？', '向前倾斜行走，转身环顾，坐下后把手机朝下放即坐禅'], ja: ['今日は、何もしなくても\nいいですか？', '前に傾けて歩き、体を回して見渡し、座って伏せると坐禅'] },
  c004: { ko: ['소음과 음악,\n그 경계는 어디일까요?', '소리를 듣고, 건반을 직접 눌러 보세요'], en: ['Noise and music —\nwhere is the line?', 'Listen, then play the keys yourself'], zh: ['噪音与音乐，\n界线在哪里？', '聆听，然后亲手弹奏'], ja: ['ノイズと音楽、\nその境界はどこでしょう？', '音を聴いて、鍵盤を押してみましょう'], glyph: 'M4 12h2l2-5 3 10 3-8 2 3h4' },
};
const playOf = (c) => { const p = PLAYS[c.id]; const l = p ? (p[lang] || p.ko) : [c.subtitle || name(c), c.summary || '']; return { q: l[0], how: l[1], glyph: (p && p.glyph) || 'M12 12m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0' }; };

/* ---------- 첫 실행: 소개 → 로그인 → 닉네임 ---------- */
const ob = $('#onboard');
function wall() {
  const list = cells.length ? cells : [{ color: '#9db8ff', title: 'NEBULA' }];
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
        <button class="btn black" data-ob="soon"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M16.4 12.6c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7c-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.5 2 1 0 1.4-.6 2.6-.6s1.5.6 2.6.6c1.1 0 1.8-1 2.4-2 .8-1.1 1.1-2.2 1.1-2.3 0 0-2.1-.8-2.1-3.1zM14.5 6.6c.5-.7.9-1.6.8-2.6-.8 0-1.8.5-2.4 1.2-.5.6-1 1.6-.8 2.5.9.1 1.8-.4 2.4-1.1z"/></svg>${t('Apple로 계속하기')}</button>
        <button class="link" data-ob="nick">${t('먼저 우주 둘러보기')} ›</button>
      </div>`;
  },
  nick() {
    return `<button class="back" data-ob="login" aria-label="뒤로"><svg viewBox="0 0 24 24"><path d="M20 12H4M10 6l-6 6 6 6"/></svg></button>
      <h1 class="ob-h">${br(t('마지막으로\n이 우주에서 불릴\n이름을 정해주세요'))}</h1>
      <div class="field"><label for="nick">${t('항해명')}</label>
        <div class="in"><input id="nick" maxlength="20" autocomplete="off" placeholder="${esc(t('최대 20자까지 입력 가능해요'))}" /><button class="btn dice" data-dice aria-label="${esc(t('다른 이름 뽑기'))}"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/></svg></button></div>
        <div class="names" id="names"></div>
        <p class="hint">${t('이름은 이 기기에만 저장돼요.')}</p></div>
      <div style="margin-top:auto"><button class="btn black" id="nick-go" data-ob="done">${t('탑승하기')}</button></div>`;
  },
};
function showOB(k) {
  stopViewEffects(); ob.hidden = false; view.hidden = true; tabsEl.hidden = true;
  ob.innerHTML = k === 'intro0' ? OB.intro(0) : k === 'intro1' ? OB.intro(1) : OB[k]();
  if (k === 'nick') {
    const i = $('#nick'), b = $('#nick-go'), p = me();
    const fill = () => { const seen = new Set(); const list = []; while (list.length < 4) { const n = wanderer(); if (!seen.has(n)) { seen.add(n); list.push(n); } } $('#names').innerHTML = list.map((n) => `<button data-name="${esc(n)}">${esc(n)}</button>`).join(''); };
    i.value = (p && p.nick) || wanderer(); fill();
    i.addEventListener('input', () => b.className = 'btn ' + (i.value.trim() ? 'black' : 'off'));
    i.addEventListener('keydown', (event) => { if (event.key === 'Enter' && !event.isComposing && i.value.trim()) { event.preventDefault(); b.click(); } });
  }
  syncRuntime();
}
ob.addEventListener('click', (e) => {
  if (e.target.closest('[data-dice]')) { $('#nick').value = wanderer(); $('#nick-go').className = 'btn black'; return; }
  const nm = e.target.closest('[data-name]'); if (nm) { $('#nick').value = nm.dataset.name; $('#nick-go').className = 'btn black'; return; }
  const b = e.target.closest('[data-ob]'); if (!b) return;
  const k = b.dataset.ob;
  if (k === 'soon') { toast(t('로그인은 곧 열려요. 지금은 둘러보기로 시작할게요.')); setTimeout(() => showOB('nick'), 900); return; }
  if (k === 'done') {
    const nick = $('#nick').value.trim().slice(0, 20); if (!nick) return;
    const old = me();
    store.set('valix-me', { nick, since: (old && old.since) || Date.now() });
    store.set('valix-onboarded', true); ob.hidden = true; ob.innerHTML = ''; go(tab); return;
  }
  showOB(k);
});

/* ---------- 추가 문구 ---------- */
const T2 = {
  en: { '알림': 'Notifications', '모두 읽음': 'Mark all read', '행성이 열렸어요': 'planet is open', '이번 달 행성이 도착했어요': 'This month’s planets have arrived', '이번 주 행성이 도착했어요': 'This week’s planets have arrived', '플레이 마감까지': 'Play closes in', '새 알림이 없어요.': 'No new notifications.', '지난 호': 'Past issues', '진행 중': 'Now', '전체 행성': 'All planets', '착륙하기': 'Land', '좋아요': 'Like', '좋아요한 행성': 'Liked planets', '아직 좋아요한 행성이 없어요.': 'No liked planets yet.', '좋아요에 담았어요.': 'Added to likes.', '좋아요를 뺐어요.': 'Removed from likes.', '방': 'Rooms', '이렇게 체험해요': 'How to experience', '휴대폰을 기울이고, 흔들고, 엎어 보세요. 권한은 입장할 때 한 번 물어봐요.': 'Tilt, shake and lay your phone down. Permission is asked once when you enter.', '참여 방법': 'How rewards work', '매주 월요일 새 Vol.이 열려요.': 'A new Vol. opens every Monday.', '그 주에 행성 한 곳 이상 착륙하면 그 주의 책이 채워져요.': 'Land on at least one planet that week to fill its book.', '한 주에 서로 다른 행성 3곳에 착륙하면 스탬프가 완성돼요.': 'Land on 3 different planets in a week to complete the stamps.', '3주 연속으로 책을 채우면 항해 리포트가 열려요.': 'Fill books 3 weeks in a row to unlock your voyage report.', '연속': 'streak', '주': 'wk', '닫기': 'Close', '지난 호는 이번 주와 같은 행성으로 보여줘요. (프로토타입)': 'Past issues show the planets open at that time. (prototype)', '항해 리포트가 열렸어요': 'Your voyage report is open', '가장 오래 머문 행성': 'Longest stay', '처음 착륙한 날': 'First landing' },
  zh: { '알림': '通知', '모두 읽음': '全部已读', '행성이 열렸어요': '行星已开放', '이번 달 행성이 도착했어요': '本月的行星已抵达', '이번 주 행성이 도착했어요': '本周的行星已抵达', '플레이 마감까지': '互动截止还有', '새 알림이 없어요.': '没有新通知。', '지난 호': '往期', '진행 중': '进行中', '전체 행성': '全部行星', '착륙하기': '着陆', '좋아요': '喜欢', '좋아요한 행성': '喜欢的行星', '아직 좋아요한 행성이 없어요.': '还没有喜欢的行星。', '좋아요에 담았어요.': '已加入喜欢。', '좋아요를 뺐어요.': '已取消喜欢。', '방': '展厅', '이렇게 체험해요': '体验方法', '휴대폰을 기울이고, 흔들고, 엎어 보세요. 권한은 입장할 때 한 번 물어봐요.': '倾斜、摇晃、把手机朝下放。进入时会询问一次权限。', '참여 방법': '参与方法', '매주 월요일 새 Vol.이 열려요.': '每周一开启新的 Vol.。', '그 주에 행성 한 곳 이상 착륙하면 그 주의 책이 채워져요.': '当周登陆任一行星，即可填满当周的书。', '한 주에 서로 다른 행성 3곳에 착륙하면 스탬프가 완성돼요.': '一周内登陆 3 颗不同行星即可集齐印章。', '3주 연속으로 책을 채우면 항해 리포트가 열려요.': '连续 3 周填满书即可解锁航行报告。', '연속': '连续', '주': '周', '닫기': '关闭', '지난 호는 이번 주와 같은 행성으로 보여줘요. (프로토타입)': '往期显示当时开放的行星。（原型）', '항해 리포트가 열렸어요': '航行报告已开启', '가장 오래 머문 행성': '停留最久的行星', '처음 착륙한 날': '首次着陆' },
  ja: { '알림': 'お知らせ', '모두 읽음': 'すべて既読', '행성이 열렸어요': 'の惑星がひらきました', '이번 달 행성이 도착했어요': '今月の惑星が届きました', '이번 주 행성이 도착했어요': '今週の惑星が届きました', '플레이 마감까지': 'プレイ締切まで', '새 알림이 없어요.': '新しいお知らせはありません。', '지난 호': 'バックナンバー', '진행 중': '公開中', '전체 행성': 'すべての惑星', '착륙하기': '着陸する', '좋아요': 'いいね', '좋아요한 행성': 'いいねした惑星', '아직 좋아요한 행성이 없어요.': 'まだいいねした惑星はありません。', '좋아요에 담았어요.': 'いいねに追加しました。', '좋아요를 뺐어요.': 'いいねを外しました。', '방': '部屋', '이렇게 체험해요': '体験のしかた', '휴대폰을 기울이고, 흔들고, 엎어 보세요. 권한은 입장할 때 한 번 물어봐요.': 'スマホを傾けたり、振ったり、伏せたりしてみましょう。権限は入場時に一度だけ聞きます。', '참여 방법': '参加方法', '매주 월요일 새 Vol.이 열려요.': '毎週月曜日に新しいVol.がひらきます。', '그 주에 행성 한 곳 이상 착륙하면 그 주의 책이 채워져요.': 'その週に惑星へ一度でも着陸すると、その週の本が埋まります。', '한 주에 서로 다른 행성 3곳에 착륙하면 스탬프가 완성돼요.': '1週間で異なる惑星3つに着陸するとスタンプ完成です。', '3주 연속으로 책을 채우면 항해 리포트가 열려요.': '3週連続で本を埋めると航海レポートがひらきます。', '연속': '連続', '주': '週', '닫기': '閉じる', '지난 호는 이번 주와 같은 행성으로 보여줘요. (프로토타입)': 'バックナンバーは当時公開中の惑星を表示します。（プロトタイプ）', '항해 리포트가 열렸어요': '航海レポートがひらきました', '가장 오래 머문 행성': '最も長く滞在した惑星', '처음 착륙한 날': '初めて着陸した日' },
};
Object.keys(T2).forEach((l) => Object.assign(T[l], T2[l]));

/* ---------- 앱 상태에 따라 쉬는 배경 · 시트 ---------- */
const sky = createAppSky({ sensor, motionQuery, getTilt: () => tilt });
const sheet = createAppSheet({
  stopVideos, translate: t, motionQuery, background: [view, tabsEl, ob],
  returnFocus: () => tabsEl.querySelector('[data-tab].on'),
  onChange() { syncRuntime(); if (!sheet.isOpen) applyPendingData(); },
});

/* ---------- 좋아요 · 알림 ---------- */
const likes = () => store.get('valix-likes', []);
const isLiked = (id) => likes().includes(id);
function toggleLike(id) {
  const list = likes(), index = list.indexOf(id);
  if (index >= 0) list.splice(index, 1); else list.unshift(id);
  store.set('valix-likes', list); toast(t(index >= 0 ? '좋아요를 뺐어요.' : '좋아요에 담았어요.'));
  const on = index < 0;
  document.querySelectorAll('[data-like]').forEach((button) => {
    if (button.dataset.like !== id) return;
    button.classList.toggle('on', on); button.setAttribute('aria-pressed', String(on)); button.innerHTML = heart(on);
  });
  document.querySelectorAll('[data-saved] span').forEach((count) => { count.textContent = list.length; });
  return on;
}
const heart = (on) => `<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" ${on ? 'fill="#ef4a4a" stroke="#ef4a4a"' : ''}/></svg>`;
const unread = () => store.get('valix-noti', 0) < vol();
function notiSheet() {
  const open = cells.filter(isOpen).slice().reverse(), mon = monday(Date.now());
  const d = Math.ceil((weekEnd() - Date.now()) / DAY);
  const items = [
    { c: picksFor(thisMonth())[0] || featured(), h: `No.${issueNo(thisMonth())} · ${t('이번 달 행성이 도착했어요')}`, s: picksFor(thisMonth()).map(name).join(' · '), at: monthDate(thisMonth()).getTime() },
    { c: featured(), h: `${t('플레이 마감까지')} ${d}${t('일')}`, s: playOf(featured()).how, at: Date.now() - 3600e3 },
    ...open.map((c, i) => ({ c, h: `${name(c)} ${t('행성이 열렸어요')}`, s: c.artist || '', at: mon - (i + 1) * DAY })),
  ];
  const isNew = unread();
  sheet.open(`<div class="sh-h"><h3>${t('알림')}</h3><button data-read>${t('모두 읽음')}</button></div>
    <div class="noti">${items.map((n, i) => `<button class="nrow${isNew && i < 2 ? ' new' : ''}" data-detail="${esc(n.c.id)}"><img data-pl="${esc(planetKey(n.c))}" src="${planetSrc(n.c)}" decoding="async" alt=""><span><b>${esc(n.h)}</b><small>${esc(n.s)}</small></span><em>${new Date(n.at).toLocaleDateString(lang, { month: 'numeric', day: 'numeric' })}</em></button>`).join('')}</div>`);
}

const startOf = (c) => { const m = String(c.period || '').match(/(\d{4})\.(\d{1,2})/); return m ? new Date(+m[1], +m[2] - 1, 1) : new Date(0); };

/* ---------- 전시 상세 ---------- */
function detailSheet(c) {
  if (!c) return;
  const p = playOf(c), liked = isLiked(c.id);
  const el = sheet.open(`
    <div class="dt-stage" style="--c:${esc(c.color || '#9db8ff')}"><span class="dt-orbit"><i></i></span><img class="dt-pl" data-pl="${esc(planetKey(c))}" src="${planetSrc(c)}" decoding="async" alt=""></div>
    <div class="dt-body">
      <p class="dt-code">${esc(c.code)} ${kindTag(c)}</p>
      <h2>${esc(name(c))}</h2>
      <p class="dt-sub">${esc(c.subtitle || '')}</p>
      <p class="dt-meta">${esc(c.artist || '')}${c.period ? ' · ' + esc(c.period) : ''}</p>
      ${c.summary ? `<p class="dt-sum">${esc(c.summary)}</p>` : ''}
      ${c.rooms && c.rooms.length && !c.single ? `<div class="dt-rooms"><h4>${t('방')}</h4>${c.rooms.map((r, i) => `<div><em>${String(i + 1).padStart(2, '0')}</em><span><b>${esc(r.short || name(r))}</b><small>${esc(r.subtitle || '')}</small></span></div>`).join('')}</div>` : ''}
      <div class="dt-how"><h4>${t('이렇게 체험해요')}</h4><p>${esc(p.how)}</p><p class="small">${t('휴대폰을 기울이고, 흔들고, 엎어 보세요. 권한은 입장할 때 한 번 물어봐요.')}</p></div>
    </div>
    <div class="dt-cta"><button class="like${liked ? ' on' : ''}" data-like="${esc(c.id)}" aria-label="${t('좋아요')}" aria-pressed="${liked}">${heart(liked)}</button><button class="nb-share" data-share="${esc(c.id)}" aria-label="${t('공유하기')}">${shareIcon}</button><button class="btn black" data-land="${esc(c.id)}" ${isOpen(c) ? '' : 'disabled'}>${t(isOpen(c) ? '착륙하기' : '준비 중')}</button></div>`, 'detail');
  return el;
}

onPlanet((k, u) => { document.querySelectorAll('img[data-pl]').forEach((im) => { if (im.dataset.pl === k) im.src = u; }); });

/* ---------- 탭 화면 ---------- */
let tab = 'home', ticker = 0, revealIO = null;
const tabScroll = { home: 0, play: 0, reward: 0, my: 0 };
let countdownNodes = [];
function stopViewEffects() {
  revealIO?.disconnect(); revealIO = null;
  tiltIO?.disconnect(); tiltIO = null; tiltZones = [];
  cancelAnimationFrame(tiltRaf); tiltRaf = 0;
  clearInterval(ticker); ticker = 0; countdownNodes = [];
}
const bell = () => `<button class="${unread() ? 'dot' : ''}" data-noti aria-label="${t('알림')}"><svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0"/></svg></button>`;
const clock = `<button data-recent aria-label="${t('최근 본 전시')}"><svg viewBox="0 0 24 24"><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6M3.5 4v4h4M12 8v4l3 2"/></svg></button>`;
const searchIcon = '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg>';
const shareIcon = '<svg viewBox="0 0 24 24"><path d="M12 16V3m-4 4 4-4 4 4M6 11H4v10h16V11h-2"/></svg>';
const plus = `<svg viewBox="0 0 24 24"><path d="M12 4v16M4 12h16"/></svg>`;
const lock = `<svg viewBox="0 0 24 24"><path d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V8a3 3 0 0 0-6 0z"/></svg>`;
function streakInfo() {
  const p = me() || { since: Date.now() };
  const startW = monday(p.since).getTime(), curW = Math.max(0, Math.floor((monday(Date.now()) - startW) / (7 * DAY)));
  const v = visits(), weekHas = (w) => v.find((x) => monday(x.at).getTime() === startW + w * 7 * DAY);
  let streak = 0; for (let w = curW; w >= 0 && weekHas(w); w--) streak++;
  return { startW, curW, weekHas, streak };
}

const discover = createAppDiscover({ sheet, getCells: () => cells, getLikes: likes, name, planetSrc, planetKey, esc, t });
const exhibitShare = createExhibitShare({ sheet, name, esc, t, lang, toast });
function recentPlanet() {
  const id = Object.entries(hist()).sort((a, b) => (b[1].last || 0) - (a[1].last || 0)).find(([id]) => cells.some((cell) => cell.id === id && isOpen(cell)))?.[0];
  return cells.find((cell) => cell.id === id);
}
function recentHTML() {
  const cell = recentPlanet();
  if (!cell) return '';
  return `<aside class="nb-resume"><img data-pl="${esc(planetKey(cell))}" src="${planetSrc(cell)}" decoding="async" alt=""/><div><small>${t('최근 본 전시')}</small><b>${esc(name(cell))}</b></div><button data-open="${esc(cell.id)}" aria-label="${esc(t('다시 착륙하기') + ' · ' + name(cell))}">↗</button></aside>`;
}
function syncPreferenceControls() {
  document.querySelectorAll('[data-motion]').forEach((button) => {
    button.setAttribute('aria-checked', String(motionQuery.matches)); button.disabled = motionQuery.systemReduced;
    const description = button.querySelector('small');
    if (description) description.textContent = t(motionQuery.systemReduced ? '시스템에서 모션 감소를 사용 중이에요.' : '카드 기울기와 장식 애니메이션을 줄여요.');
  });
}
const screens = {
  home() {
    const k = viewMonth || thisMonth(), n = issueNo(k), open = picksFor(k), iss = ISSUES[k] || {};
    if (coverIdx >= open.length) coverIdx = 0;
    const f = open[coverIdx] || featured(), rest = open.filter((c) => c !== f), issue = [f, ...rest];
    const soon = cells.filter((c) => c.status === 'coming');
    const KICK = ['COVER STORY', 'FEATURE', 'ESSAY', 'REPORT', 'ARCHIVE'];
    const date = (d) => d.toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' });
    const pub = monthDate(k);
    const quote = pullQuote(f);
    return `
      <section class="mag-cover" style="--c:${esc(f.color || '#9db8ff')}" data-tiltzone>
        <div class="mc-top">
          <button class="mc-mast nb-brand" data-vols aria-label="NEBULA · ${t('지난 호')}"><img class="nb-brand-mark" src="assets/nebula-mark.svg" alt=""/><span><b class="nb-brand-word">NEBULA</b><small class="nb-brand-caption">MONTHLY PLANET · No.${n}</small></span></button>
          <div class="icons"><button data-search aria-label="${t('전시 검색')}">${searchIcon}</button>${bell()}</div>
        </div>
        <div class="mc-stage">
          <span class="mc-layer mc-far" data-depth="-14"></span>
          <span class="mc-orbit" data-depth="6"><i></i></span>
          <img class="mc-planet" data-depth="22" data-pl="${esc(planetKey(f))}" src="${planetSrc(f)}" decoding="async" alt="" draggable="false">
          <span class="mc-gloss" data-gloss></span>
        </div>
        ${open.length > 1 ? `<div class="nb-cover-nav"><button class="nb-cover-arrow" data-cover="-1" aria-label="${t('이전 표지')}">←</button><div class="nb-cover-pager">${open.map((cell, index) => `<button data-cover-index="${index}" aria-pressed="${index === coverIdx}" aria-label="${esc(t('표지') + ' ' + (index + 1) + ' · ' + name(cell))}"><i></i></button>`).join('')}</div><small class="nb-cover-count">${String(coverIdx + 1).padStart(2, '0')} / ${String(open.length).padStart(2, '0')}</small><button class="nb-cover-arrow" data-cover="1" aria-label="${t('다음 표지')}">→</button></div>` : ''}
        <div class="mc-lines">
          ${iss.title ? `<p class="mc-issue">${esc(iss.title)}</p>` : ''}
          <p class="mc-kick">COVER STORY · ${esc(f.code)}</p>
          <h1 class="mc-title">${esc(name(f))}</h1>
          <p class="mc-dek">${esc(f.subtitle || '')}</p>
          <p class="mc-by">${esc(f.artist || '')}</p>
          ${rest.length ? `<p class="mc-more">+ ${rest.map((c) => esc(name(c))).join(' · ')}</p>` : ''}
        </div>
        <div class="mc-foot">
          <button class="mc-read" data-jump="mag-toc">${t('읽기 시작')} ↓</button>
          <button class="mc-land" data-open="${esc(f.id)}">${t('착륙하기')} →</button>
        </div>
        <p class="mc-hint" data-sensor-hint><svg viewBox="0 0 24 24"><rect x="7" y="3" width="10" height="18" rx="2" transform="rotate(-12 12 12)"/></svg><span>${t(motionQuery.matches ? '읽기와 탐색' : IS_MOBILE ? '기울이면 표지가 빛나요 · 옆으로 밀면 다음 표지' : '마우스를 움직이면 표지가 빛나요')}</span></p>
      </section>

      <div class="nb-home-tools"><button data-all>${t('전시 탐색')} ↗</button><button data-saved>${t('좋아요 모아보기')} <span>${likes().length}</span></button></div>
      ${recentHTML()}
      <section class="mag-sec" id="mag-toc">
        <p class="mag-label">${t('이번 호')} · ${esc(monthName(k))}${iss.title ? ' · ' + esc(iss.title) : ''}</p>
        <ol class="toc">${issue.map((c, i) => `<li><button data-jump="art-${esc(c.id)}"><em>${String(i + 1).padStart(2, '0')}</em><span><small>${KICK[Math.min(i, KICK.length - 1)]}</small><b>${esc(name(c))}</b><i>${esc(c.artist || '')} · ${readMin(c)}${t('분')}${linksFor(c, k).length ? ' · ' + t('영상·기사') + ' ' + linksFor(c, k).length : ''}</i></span></button></li>`).join('')}
          <li><button data-jump="mag-quote"><em>${String(issue.length + 1).padStart(2, '0')}</em><span><small>QUOTE</small><b>${t('이번 주의 문장')}</b></span></button></li>
          <li><button data-jump="mag-letter"><em>${String(issue.length + 2).padStart(2, '0')}</em><span><small>LETTER</small><b>${t('에디터의 편지')}</b></span></button></li></ol>
      </section>

      ${issue.map((c, i) => { const q = pullQuote(c), p = playOf(c); return `
      <article class="mag-art" id="art-${esc(c.id)}" style="--c:${esc(c.color || '#9db8ff')}">
        <p class="mag-label">${String(i + 1).padStart(2, '0')} · ${KICK[Math.min(i, KICK.length - 1)]}</p>
        <button class="art-visual" data-detail="${esc(c.id)}" data-tiltcard><img data-pl="${esc(planetKey(c))}" src="${planetSrc(c)}" decoding="async" alt="" data-depth="16"><span class="art-code">${esc(c.code)}</span><span class="art-gloss" data-gloss></span></button>
        <h2 class="art-title">${esc(name(c))}</h2>
        <p class="art-dek">${esc(c.subtitle || '')}</p>
        <p class="art-by">${esc(c.artist || '')}${c.period ? ' · ' + esc(c.period) : ''} · ${readMin(c)}${t('분')}</p>
        ${q ? `<blockquote class="art-quote">${esc(q.body)}${q.caption ? `<cite>${esc(q.caption)}</cite>` : ''}</blockquote>` : ''}
        ${c.summary ? `<p class="art-body">${esc(c.summary)}</p>` : ''}
        ${linksHTML(c, k)}
        <p class="art-play"><svg viewBox="0 0 24 24"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M4 9c-1 2-1 4 0 6M20 9c1 2 1 4 0 6"/></svg>${esc(p.how)}</p>
        <div class="art-cta"><button class="like${isLiked(c.id) ? ' on' : ''}" data-like="${esc(c.id)}" aria-label="${t('좋아요')}" aria-pressed="${isLiked(c.id)}">${heart(isLiked(c.id))}</button><button class="btn black" data-open="${esc(c.id)}">${t('이 행성에 착륙하기')} →</button></div>
      </article>`; }).join('')}

      <section class="mag-sec mag-quote" id="mag-quote" style="--c:${esc(f.color || '#9db8ff')}">
        <p class="mag-label">${t('이번 주의 문장')}</p>
        ${quote ? `<blockquote>${esc(quote.body)}</blockquote><p class="q-src">${esc(quote.caption || name(f))}</p>` : `<blockquote>${esc(f.summary || f.subtitle || '')}</blockquote>`}
      </section>

      <section class="mag-sec mag-letter" id="mag-letter">
        <p class="mag-label">${t('에디터의 편지')}</p>
        ${iss.letter ? String(iss.letter).split(/\n+/).map((x) => `<p>${esc(x)}</p>`).join('') : `<p>${esc(t('이번 달에도 행성 {n}곳이 궤도에 올랐습니다.').replace('{n}', issue.length))}</p>
        <p>${esc(t('하루의 작은 고민에서 잠시 고개를 들어, 더 큰 것을 바라보는 시간. 한 행성에 머무는 몇 분이 생각과 마음의 폭을 조금 넓혀 주기를 바랍니다.'))}</p>`}
        <p class="sign">— NEBULA ${t('편집실')}</p>
      </section>

      <section class="mag-sec mag-next">
        <p class="mag-label">${t('다음 호')} · No.${n + 1}</p>
        <p class="next-date">${esc(monthName(nextKey(k)))}</p>
        ${soon.length ? `<div class="hscroll">${soon.map((c) => `<button class="card" data-detail="${esc(c.id)}">${poster(c)}<p class="ct">${esc(name(c))}</p></button>`).join('')}</div>` : `<p class="small">${t('다음 호에서 새로운 행성을 만나요.')}</p>`}
        <button class="btn line" data-all style="margin-top:22px">${t('전체 행성')}</button>
        <p class="colophon">NEBULA · MONTHLY PLANET No.${n} · ${esc(monthName(k))}</p>
      </section>`;
  },
  play() {
    const open = cells.filter(isOpen).slice().reverse();
    const wk = (Date.now() - monday(Date.now())) / (7 * DAY);
    return `<header class="page-h"><div><small class="nb-page-kicker">NEBULA · EXPERIENCE</small><h1>${t('플레이')}</h1></div><div class="icons">${bell()}</div></header>
      <div class="plays">${open.map((c) => { const p = playOf(c); return `
        <div class="play" style="--c:${esc(c.color || '#9db8ff')}">
          <button class="art" data-detail="${esc(c.id)}" aria-label="${esc(name(c) + ' · ' + t('체험 방법'))}"><img class="pl" data-pl="${esc(planetKey(c))}" src="${planetSrc(c)}" decoding="async" alt="" draggable="false"><span class="timer" data-left="${esc(c.id)}">${left(c)}</span></button>
          <div class="body"><p class="who">${esc(c.code)} · ${esc(c.artist || '')}</p><h3>${br(p.q)}</h3><p class="how">${esc(p.how)}</p>
            <div class="bar"><i style="--w:${Math.round(wk * 100)}%"></i></div>
            <div class="two"><button data-how="${esc(c.id)}">${t('체험 방법')}</button><button class="w" data-open="${esc(c.id)}">${t('입장하기')}</button></div></div>
        </div>`; }).join('')}</div>`;
  },
  reward() {
    const { startW, curW, weekHas, streak } = streakInfo();
    const base = Math.floor(curW / 6) * 6;
    const books = Array.from({ length: 6 }, (_, i) => { const w = base + i, hit = weekHas(w), c = hit && cells.find((x) => x.id === hit.id);
      return `<div class="book${hit ? ' done' : ''}${w === curW ? ' now' : ''}" style="--c:${esc((c && c.color) || '#8a3a3a')};--i:${i}"><i>${hit ? `<b>Vol. ${vol() - (curW - w)}</b>` : ''}</i><span>${t('n주차', w + 1)}</span></div>`; }).join('');
    const v = visits(), thisWeek = [...new Set(v.filter((x) => monday(x.at).getTime() === monday(Date.now()).getTime() && cells.some((cell) => cell.id === x.id)).map((x) => x.id))];
    return `<header class="page-h"><div><small class="nb-page-kicker">NEBULA · VOYAGE</small><h1>${t('리워드')}</h1></div><button class="txt" data-guide>${t('참여 안내')}</button></header>
      <section class="nb-week-card"><div><small>${t('이번 주의 궤도')}</small><strong>${Math.min(3, thisWeek.length)}<em> / 3</em></strong></div><p>${t(thisWeek.length >= 3 ? '이번 주 스탬프 완성!' : '목표까지 {n}곳').replace('{n}', Math.max(0, 3 - thisWeek.length))}</p><div class="nb-week-track"><i style="--w:${Math.min(100, thisWeek.length / 3 * 100)}%"></i></div></section>
      <p class="rw-h">${t('n주차, 함께 시작해요!', curW + 1)}</p>
      <div class="shelf">${books}<div class="book sp" style="--i:6"><i><b>SPECIAL</b></i><span>Special</span></div></div>
      <button class="lockcard${streak >= 3 ? ' open' : ''}" data-report>${lock}<div>${streak >= 3 ? `<em>${t('항해 리포트가 열렸어요')}</em>` : t('3주 연속 착륙하면 <em>항해 리포트</em>가 열려요')}<small class="prog"><i style="--w:${Math.min(100, streak / 3 * 100)}%"></i></small><small>${t('연속')} ${streak}/3${t('주')}</small></div></button>
      <div class="mission"><h3>${br(t('이번 주 행성 3곳에 착륙하면\n항해 스탬프 완성!'))}</h3>
        <div class="stamps">${[0, 1, 2].map((i) => { const c = cells.find((x) => x.id === thisWeek[i]); return c ? `<i class="on" style="--d:${i * 0.15}s"><img data-pl="${esc(planetKey(c))}" src="${planetSrc(c)}" decoding="async" alt=""></i>` : `<i>${i + 1}</i>`; }).join('')}</div>
        <div class="note${thisWeek.length >= 3 ? ' ready' : ''}">${thisWeek.length >= 3 ? t('이번 주 스탬프 완성!') : t('행성 3곳에 착륙하면 완성돼요')}</div>
        <p>${t('스탬프와 기록은 이 기기에만 저장돼요.')}</p></div>`;
  },
  my() {
    const p = me() || { nick: wanderer(), since: Date.now() }, h = hist();
    const seen = Object.entries(h).filter(([id]) => cells.some((c) => c.id === id)).sort((a, b) => b[1].last - a[1].last);
    const total = seen.reduce((s, [, x]) => s + (x.time || 0), 0), lk = likes().map((id) => cells.find((c) => c.id === id)).filter(Boolean);
    const { streak } = streakInfo();
    const avatar = `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="30" cy="25" r="15"/><rect x="21" y="19" width="18" height="12" rx="6" fill="#1c2240" stroke="none"/><path d="M24 22c1.5-1 3-1 4 0" stroke="#ffd68c"/><path d="M10 58c2-9 10-14 20-14s18 5 20 14"/></svg>`;
    return `<header class="page-h"><div><small class="nb-page-kicker">NEBULA · MY ORBIT</small><h1>${t('내 궤도')}</h1></div><div class="icons">${clock}</div></header>
      <div class="me"><span class="avatar">${avatar}</span><div><b>${esc(p.nick)}</b><p class="mesub">${new Date(p.since).toLocaleDateString(lang)} ${t('탑승')} · ${seen.length}${t('곳 착륙')}</p><button data-rename>${t('이름 바꾸기')} ›</button></div></div>
      <section class="sec"><div class="sec-h"><h2 class="h20">${t('나의 기록')}</h2></div>
        <button class="lockcard v${streak >= 3 ? ' open' : ''}" data-report style="margin:18px 0 0">${lock}<div><small>${t('항해 리포트')}</small>${streak >= 3 ? `<em>${t('항해 리포트가 열렸어요')}</em>` : t('3주 연속 착륙하면 <em>항해 리포트</em>가 열려요')}</div></button>
        <div class="stat2"><div>${t('다녀온 행성')}<b>${seen.length || '-'}</b></div><div>${t('머문 시간')}<b>${total ? fmtTime(total) : '-'}</b></div></div></section>
      <section class="sec"><div class="sec-h"><h2 class="h20">${t('좋아요한 행성')}</h2></div>
        ${lk.length ? `<div class="hscroll mini">${lk.map((c) => `<button data-detail="${esc(c.id)}"><img data-pl="${esc(planetKey(c))}" src="${planetSrc(c)}" decoding="async" alt=""><span>${esc(name(c))}</span></button>`).join('')}</div>` : `<p class="empty">${t('아직 좋아요한 행성이 없어요.')}</p>`}</section>
      <section class="sec"><div class="sec-h"><h2 class="h20">${t('최근 본 전시')}</h2></div>
        ${seen.length ? `<div class="list">${seen.map(([id, x]) => { const c = cells.find((y) => y.id === id); return `<button class="row" data-detail="${esc(id)}">${poster(c)}<div><b>${esc(name(c))}</b><span>${new Date(x.last).toLocaleDateString(lang)}</span></div><span class="v">${fmtTime(x.time || 0)}</span></button>`; }).join('')}</div>` : `<p class="empty">${t('아직 다녀온 행성이 없어요.')}</p>`}</section>
      <section class="sec"><div class="sec-h"><h2 class="h20">${t('언어')}</h2></div><div class="chips">${LANGS.map((l) => `<button data-lang="${l.id}" class="${l.id === lang ? 'on' : ''}">${l.name}</button>`).join('')}</div></section>
      <section class="sec"><button class="nb-preference" data-motion role="switch" aria-checked="${motionQuery.matches}" ${motionQuery.systemReduced ? 'disabled' : ''}><span><b>${t('모션 줄이기')}</b><small>${t(motionQuery.systemReduced ? '시스템에서 모션 감소를 사용 중이에요.' : '카드 기울기와 장식 애니메이션을 줄여요.')}</small></span><i class="nb-switch" aria-hidden="true"></i></button></section>
      <section class="sec"><div class="sec-h"><h2 class="h20">${t('체험 권한')}</h2></div><p class="small">${t('기울기·흔들기·마이크·카메라·위치는 전시 안에서 체험할 때만 쓰고, 기기 밖으로 저장하거나 보내지 않아요.')}</p></section>
      <section class="sec list"><button class="row" data-clear><b>${t('관람 기록 지우기')}</b></button><div class="row"><b>${t('버전')}</b><span class="v">NEBULA ${VERSION}</span></div></section>`;
  },
};

const TAB_I = { home: 0, play: 1, reward: 2, my: 3 };
function go(next, keepScroll) {
  if (!Object.hasOwn(screens, next)) return;
  const previous = tab, oldScroll = scrollY;
  if (!view.hidden) tabScroll[previous] = oldScroll;
  stopViewEffects(); applyPendingData(false);
  tab = next; view.hidden = false; tabsEl.hidden = false;
  view.className = 'vx-view'; view.innerHTML = screens[tab]();
  let i = 0;
  view.querySelectorAll('.mc-top, .mc-lines, .mc-foot, .hero, .page-h, .rw-h, .sec-h, .sec-sub, .card, .gcard, .play, .shelf, .lockcard, .mission, .me, .stat2, .row, .chips, .about, .hscroll.mini, .empty').forEach((el) => {
    el.classList.add('rv'); el.style.animationDelay = `${Math.min(i++, 14) * 45}ms`;
  });
  if (tab === 'home') {
    const elements = [...view.querySelectorAll('.mag-art > *, .mag-sec > *')];
    if ('IntersectionObserver' in window && !motionQuery.matches) {
      revealIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('in'); revealIO?.unobserve(entry.target); } });
      }, { threshold: .12 });
      elements.forEach((el) => { el.classList.add('rs'); revealIO.observe(el); });
    } else elements.forEach((el) => el.classList.add('in'));
  }
  tabsEl.querySelectorAll('[data-tab]').forEach((button) => {
    const selected = button.dataset.tab === tab;
    button.classList.toggle('on', selected); button.setAttribute('aria-current', selected ? 'page' : 'false');
  });
  tabsEl.querySelector('.ind').style.transform = `translateX(${TAB_I[tab] * 100}%)`;
  const targetScroll = keepScroll && previous === next ? oldScroll : previous !== next ? tabScroll[next] : 0;
  scrollTo(0, targetScroll);
  tlx = tly = 9; bindTilt();
  countdownNodes = [...view.querySelectorAll('[data-left]')].map((el) => ({ el, cell: cells.find((c) => c.id === el.dataset.left) }));
  syncRuntime(); syncPreferenceControls();
}

tabsEl.addEventListener('click', (e) => {
  const button = e.target.closest('[data-tab]');
  if (button) {
    const next = button.dataset.tab;
    if (next === tab && !view.hidden && !(next === 'home' && viewMonth)) {
      scrollTo({ top: 0, behavior: motionQuery.matches ? 'auto' : 'smooth' }); return;
    }
    if (next === 'home') { viewMonth = ''; coverIdx = 0; }
    go(next);
  } else if (e.target.closest('[data-orb]')) openExhibit(featured());
});

function tickCountdown() {
  for (const { el, cell } of countdownNodes) {
    const value = left(cell);
    if (el.textContent !== value) el.textContent = value;
    let end = weekEnd();
    if (cell?.ends && /^\d{4}-\d{2}-\d{2}$/.test(cell.ends)) end = Math.min(end, new Date(cell.ends + 'T23:59:59').getTime());
    el.classList.toggle('urgent', end - Date.now() < DAY);
  }
}
function syncRuntime() {
  const foreground = nativeActive && !document.hidden;
  const active = foreground && viewer.hidden && ob.hidden && !view.hidden && !sheet.isOpen;
  document.body.classList.toggle('vx-paused', !foreground || !viewer.hidden || sheet.isOpen);
  document.body.classList.toggle('exhibit-open', !viewer.hidden);
  view.inert = tabsEl.inert = !viewer.hidden || sheet.isOpen;
  ob.inert = !viewer.hidden || sheet.isOpen;
  if (active) sky.start(); else sky.stop();
  if (active && tab === 'home' && !motionQuery.matches) scheduleTilt();
  else { cancelAnimationFrame(tiltRaf); tiltRaf = 0; }
  if (active && tab === 'play') {
    if (!ticker) { tickCountdown(); ticker = setInterval(tickCountdown, 1000); }
  } else { clearInterval(ticker); ticker = 0; }
  landing.setActive(foreground);
  const watching = foreground && current && !viewer.hidden && $('#landing').hidden;
  if (watching) { if (!enteredAt) enteredAt = Date.now(); }
  else flushWatchTime();
}


// 화면·시트 공통 버튼
function onAction(e) {
  const q = (selector) => { const candidate = e.target.closest(selector); return candidate && e.currentTarget.contains(candidate) ? candidate : null; };
  const byId = (id) => cells.find((x) => x.id === id);
  let b;
  if ((b = q('[data-land]'))) { const c = byId(b.dataset.land); sheet.close({ restoreFocus: false }); openExhibit(c); return true; }
  if ((b = q('[data-open]'))) { const c = byId(b.dataset.open); if (c && isOpen(c)) { if (sheet.isOpen) sheet.close({ restoreFocus: false }); openExhibit(c); } return true; }
  if ((b = q('[data-detail]'))) { const c = byId(b.dataset.detail); if (c) detailSheet(c); return true; }
  if ((b = q('[data-like]'))) {
    toggleLike(b.dataset.like); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    if (tab === 'my') go('my', true); return true;
  }
  if ((b = q('[data-share]'))) { const cell = byId(b.dataset.share); if (cell) exhibitShare.share(cell); return true; }
  if ((b = q('[data-cover]'))) { changeCover(Number(b.dataset.cover), null, b.dataset.cover); return true; }
  if ((b = q('[data-cover-index]'))) { changeCover(0, Number(b.dataset.coverIndex), 'index:' + b.dataset.coverIndex); return true; }
  if (q('[data-search]')) { discover.open('all', true); return true; }
  if (q('[data-saved]')) { discover.open('liked'); return true; }
  if (q('[data-motion]')) { motionQuery.setReduced(!motionQuery.requested); syncPreferenceControls(); return true; }
  if ((b = q('[data-jump]'))) { const el = document.getElementById(b.dataset.jump); if (el) { el.scrollIntoView({ block: 'start', behavior: motionQuery.matches ? 'auto' : 'smooth' }); let touched = false; const stop = () => { touched = true; }; ['touchstart', 'wheel'].forEach((ev) => addEventListener(ev, stop, { once: true, passive: true })); [500, 1100].forEach((ms) => setTimeout(() => { if (!touched && Math.abs(el.getBoundingClientRect().top - 20) > 12) el.scrollIntoView({ block: 'start', behavior: 'auto' }); }, ms)); } return true; } // 화면 밖 섹션을 늦게 그려도 정확히 도착
  if (q('[data-noti]')) { notiSheet(); return true; }
  if (q('[data-read]')) { store.set('valix-noti', vol()); sheet.close(); go(tab, true); return true; }
  if (q('[data-recent]')) {
    const seen = Object.entries(hist()).filter(([id]) => byId(id)).sort((a, b2) => b2[1].last - a[1].last);
    sheet.open(`<div class="sh-h"><h3>${t('최근 본 전시')}</h3></div>${seen.length ? `<div class="noti">${seen.map(([id, x]) => { const c = byId(id); return `<button class="nrow" data-detail="${esc(id)}"><img data-pl="${esc(planetKey(c))}" src="${planetSrc(c)}" decoding="async" alt=""><span><b>${esc(name(c))}</b><small>${fmtTime(x.time || 0)} · ${new Date(x.last).toLocaleDateString(lang)}</small></span></button>`; }).join('')}</div>` : `<p class="empty">${t('아직 다녀온 행성이 없어요.')}</p>`}`);
    return true;
  }
  if (q('[data-vols]')) { issueSheet(); return true; }
  if ((b = q('[data-month]'))) { viewMonth = b.dataset.month === thisMonth() ? '' : b.dataset.month; coverIdx = 0; sheet.close(); go('home'); return true; }
  if ((b = q('[data-yt]'))) {
    const id = b.dataset.yt;
    const sh = sheet.open(`<div class="yt-player">${videoHTML(`https://youtu.be/${id}`, { w: 1280 })}</div><p class="yt-title">${esc(b.dataset.ytt)}</p><div style="padding:16px 24px 0"><a class="btn line" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">${t('YouTube에서 보기')} ↗</a></div>`, 'video');
    mountVideos(sh); playVideo(sh.querySelector('.vx-v'));
    return true;
  }
  if (q('[data-all]')) { discover.open('all'); return true; }

  if ((b = q('[data-how]'))) {
    detailSheet(byId(b.dataset.how));
    const target = sheet.el.querySelector('.dt-how');
    setTimeout(() => { if (target?.isConnected && sheet.isOpen && sheet.el.contains(target)) sheet.el.scrollTo({ top: target.offsetTop - 40, behavior: motionQuery.matches ? 'auto' : 'smooth' }); }, 380);
    return true;
  }
  if (q('[data-guide]')) {
    sheet.open(`<div class="sh-h"><h3>${t('참여 방법')}</h3></div><ol class="guide">${['매주 월요일 새 Vol.이 열려요.', '그 주에 행성 한 곳 이상 착륙하면 그 주의 책이 채워져요.', '한 주에 서로 다른 행성 3곳에 착륙하면 스탬프가 완성돼요.', '3주 연속으로 책을 채우면 항해 리포트가 열려요.'].map((s, i) => `<li><em>${i + 1}</em>${t(s)}</li>`).join('')}</ol><p class="small" style="padding:0 24px">${t('스탬프와 기록은 이 기기에만 저장돼요.')}</p><div style="padding:20px 24px 0"><button class="btn line" data-close>${t('닫기')}</button></div>`);
    return true;
  }
  if (q('[data-report]')) {
    const { streak } = streakInfo(), h = Object.entries(hist()).filter(([id]) => byId(id)).sort((a, b2) => (b2[1].time || 0) - (a[1].time || 0)), v = visits();
    if (streak < 3) { toast(`${t('연속')} ${streak}/3${t('주')} — ${t('3주 연속으로 책을 채우면 항해 리포트가 열려요.')}`); return true; }
    const top = h[0] && byId(h[0][0]);
    sheet.open(`<div class="sh-h"><h3>${t('항해 리포트')}</h3></div><div class="report">${top ? `<img data-pl="${esc(planetKey(top))}" src="${planetSrc(top)}" decoding="async" alt="">` : ''}<p>${t('가장 오래 머문 행성')}<b>${top ? esc(name(top)) : '-'}</b></p><p>${t('처음 착륙한 날')}<b>${v[0] ? new Date(v[0].at).toLocaleDateString(lang) : '-'}</b></p><p>${t('다녀온 행성')}<b>${h.length}</b></p></div>`);
    return true;
  }
  if (q('[data-rename]')) { showOB('nick'); return true; }
  if ((b = q('[data-lang]'))) { if (b.dataset.lang !== lang) { try { localStorage.setItem('xpace-lang', b.dataset.lang); } catch (er) {} location.reload(); } return true; }
  if (q('[data-clear]')) {
    sheet.open(`<div class="sh-h"><h3>${t('관람 기록을 지울까요?')}</h3></div><div class="nb-danger"><p>${t('항해명과 좋아요는 유지돼요. 관람 시간과 스탬프만 삭제됩니다.')}</p><div class="nb-confirm-actions"><button class="btn line" data-close>${t('취소')}</button><button class="btn black" data-confirm-clear>${t('기록 삭제')}</button></div></div>`, 'confirm');
    return true;
  }
  if (q('[data-confirm-clear]') && sheet.el.classList.contains('confirm')) {
    store.set('valix-history', {}); store.set('valix-visits', []); sheet.close(); toast(t('기록을 지웠어요.')); go(tab, true); return true;
  }
  return false;
}
view.addEventListener('click', onAction);
sheet.el.addEventListener('click', onAction);

/* ---------- 전시 보기 ---------- */
const viewer = $('#viewer'), frame = $('#frame');
let current = null, enteredAt = 0, frameRaf = 0, waitingForBack = false, queuedExhibit = null;
function flushWatchTime() {
  if (!current || !enteredAt) return;
  const seconds = Math.max(0, Date.now() - enteredAt) / 1000;
  enteredAt = 0;
  const h = hist(), record = h[current.id] || {};
  record.time = (record.time || 0) + seconds; record.last = Date.now(); h[current.id] = record;
  store.set('valix-history', h);
}
function replaceFrame(url) {
  try { frame.contentWindow.location.replace(url); }
  catch { frame.src = url; }
}
function loadExhibitFrame(c) {
  cancelAnimationFrame(frameRaf); replaceFrame('about:blank');
  frameRaf = requestAnimationFrame(() => { frameRaf = 0; if (current === c && !viewer.hidden) replaceFrame(href(c)); });
}
function openExhibit(c) {
  if (!c || !isOpen(c) || !viewer.hidden) return;
  if (waitingForBack) { queuedExhibit = c; return; }
  stopVideos(); current = c; enteredAt = 0;
  const h = hist(); h[c.id] = { ...(h[c.id] || {}), last: Date.now(), visits: ((h[c.id] && h[c.id].visits) || 0) + 1 }; store.set('valix-history', h);
  const v = visits(); v.push({ id: c.id, at: Date.now() }); store.set('valix-visits', v.slice(-500));
  $('#toast').hidden = true; viewer.hidden = false; landing.start(c); loadExhibitFrame(c);
  history.pushState({ viewer: true }, ''); syncRuntime();
}
function closeExhibit(fromPop = false) {
  if (viewer.hidden) return;
  flushWatchTime(); cancelAnimationFrame(frameRaf); frameRaf = 0;
  landing.stop(); viewer.hidden = true; replaceFrame('about:blank'); current = null;
  if (!fromPop && history.state?.viewer) { waitingForBack = true; history.back(); }
  go(tab, true);
}
$('#close').addEventListener('click', () => closeExhibit());
$('#land-cancel').addEventListener('click', () => closeExhibit());
addEventListener('popstate', () => {
  if (waitingForBack) {
    waitingForBack = false;
    const next = queuedExhibit; queuedExhibit = null;
    if (next) openExhibit(next);
  } else closeExhibit(true);
});
frame.addEventListener('load', () => {
  if (!current) return;
  let path = '', full = '';
  try { full = frame.contentWindow.location.href; path = frame.contentWindow.location.pathname; } catch (e) {}
  if (!full || full === 'about:blank') return;
  if (/\/(index\.html)?$/.test(path) || path.endsWith('/app.html')) { closeExhibit(); return; }
  landing.loaded();
});
const CapApp = window.Capacitor?.Plugins?.App;
if (CapApp) {
  CapApp.addListener('backButton', () => {
    if (sheet.isOpen) sheet.close(); else if (!viewer.hidden) closeExhibit();
    else if (!ob.hidden) showOB('login'); else if (tab !== 'home') go('home'); else CapApp.exitApp();
  });
  CapApp.addListener('appStateChange', ({ isActive }) => {
    nativeActive = isActive; syncRuntime(); if (isActive) applyPendingData();
  });
}
document.addEventListener('visibilitychange', () => { syncRuntime(); if (!document.hidden) applyPendingData(); });
addEventListener('pagehide', () => { nativeActive = false; syncRuntime(); });
addEventListener('pageshow', () => { nativeActive = true; syncRuntime(); applyPendingData(); });



/* ---------- 매거진 도우미 ---------- */
let blocks = [], coverIdx = 0;

/* ---------- 월간 호 (data/issues.json + 시트의 month 칸 · watch/read 블록) ---------- */
let ISSUES = {}, viewMonth = '';
const mkey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const thisMonth = () => mkey(new Date());
const LAUNCH_M = '2026-10'; // No.1
const monthDate = (k) => { const [y, m] = k.split('-').map(Number); return new Date(y, m - 1, 1); };
const issueNo = (k) => { const [y, m] = k.split('-').map(Number), [y0, m0] = LAUNCH_M.split('-').map(Number); return (y - y0) * 12 + (m - m0) + 1; };
const nextKey = (k) => { const d = monthDate(k); d.setMonth(d.getMonth() + 1); return mkey(d); };
const prevKey = (k) => { const d = monthDate(k); d.setMonth(d.getMonth() - 1); return mkey(d); };
const monthFmt = new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long' }), monthNames = {}; // 날짜 형식 도구는 한 번만 만듦
const monthName = (k) => monthNames[k] || (monthNames[k] = monthFmt.format(monthDate(k)) + t('호'));
const byAnyId = (id) => cells.find((c) => c.id === id) || cells.find((c) => c.rooms && c.rooms.some((r) => r.id === id));
const monthsOf = (c) => [c.month, ...(c.rooms || []).map((r) => r.month)].join(',').split(/[,\s]+/).filter(Boolean);
function picksFor(k) {
  const fromJson = ((ISSUES[k] && ISSUES[k].picks) || []).map(byAnyId);
  const fromSheet = cells.filter((c) => monthsOf(c).includes(k));
  let list = [...fromJson, ...fromSheet].filter((c, i, a) => c && isOpen(c) && a.indexOf(c) === i);
  if (!list.length) { const end = monthDate(nextKey(k)); list = cells.filter((c) => isOpen(c) && startOf(c) < end).reverse(); }
  return list;
}
const ytId = (u) => (String(u).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/) || [])[1];
function linksFor(c, k) {
  const ids = [c.id, ...(c.rooms || []).map((r) => r.id)];
  const j = ((ISSUES[k] && ISSUES[k].links) || []).filter((l) => ids.includes(l.cell));
  const sh = blocksOf(c).filter((b) => (b.type === 'watch' || b.type === 'read') && b.media).map((b) => ({ type: b.type === 'watch' ? 'youtube' : 'article', url: b.media, title: b.title || b.media, source: b.caption || '' }));
  const seen = new Set(); return [...j, ...sh].filter((l) => !seen.has(l.url) && seen.add(l.url));
}
function linksHTML(c, k) {
  const L = linksFor(c, k), yt = L.filter((l) => l.type === 'youtube' && ytId(l.url)), ar = L.filter((l) => !(l.type === 'youtube' && ytId(l.url)));
  return (yt.length ? `<div class="art-links"><h4>${t('함께 보기')} <span>${yt.length}</span></h4><div class="yt-row">${yt.map((l) => { const id = ytId(l.url); return `<button class="yt" data-yt="${id}" data-ytt="${esc(l.title)}"><span class="yt-th"><img loading="lazy" src="https://i.ytimg.com/vi/${id}/mqdefault.jpg" alt="" decoding="async"><i></i></span><b>${esc(l.title)}</b><small>${esc(l.source || '')}</small></button>`; }).join('')}</div></div>` : '')
    + (ar.length ? `<div class="art-links"><h4>${t('함께 읽기')} <span>${ar.length}</span></h4>${ar.map((l) => `<a class="rd" href="${esc(l.url)}" target="_blank" rel="noopener"><span><b>${esc(l.title)}</b><small>${esc(l.source || '')}</small></span><i>↗</i></a>`).join('')}</div>` : '');
}
function issueSheet() {
  const keys = []; for (let k = thisMonth(); issueNo(k) >= 1; k = prevKey(k)) keys.push(k);
  const cur = viewMonth || thisMonth();
  sheet.open(`<div class="sh-h"><h3>${t('지난 호')}</h3></div><div class="vols">${keys.map((k) => { const P = picksFor(k), f = P[0];
    return `<button class="vrow${cur === k ? ' on' : ''}" data-month="${k}">${f ? `<img data-pl="${esc(planetKey(f))}" src="${planetSrc(f)}" decoding="async" alt="">` : '<span class="ph"></span>'}<span><b>No.${issueNo(k)} · ${esc(monthName(k))}</b><small>${ISSUES[k] && ISSUES[k].title ? esc(ISSUES[k].title) + ' · ' : ''}${P.map((cell) => esc(name(cell))).join(' · ') || '—'}</small></span>${k === thisMonth() ? `<em>${t('진행 중')}</em>` : ''}</button>`; }).join('')}</div>`);
}
const blocksOf = (c) => { const ids = c.rooms ? c.rooms.map((r) => r.id) : [c.id]; return blocks.filter((b) => ids.includes(b.cell_id)); };
const pullQuote = (c) => blocksOf(c).find((b) => b.type === 'quote' && b.body);
const readMin = (c) => Math.max(3, Math.round(blocksOf(c).reduce((s, b) => s + String(b.body || '').length + String(b.title || '').length, 0) / 380) + 2);

/* ---------- 센서로 움직이는 홈 (PC는 마우스로 흉내) ---------- */
const T3 = {
  en: { '읽기 시작': 'Start reading', '이번 호': 'In this issue', '분': 'min', '이번 주의 문장': 'Line of the week', '에디터의 편지': 'Editor’s letter', '이번 주에도 행성 {n}곳이 궤도에 올랐습니다.': 'This week, {n} planets entered orbit.', '하루의 작은 고민에서 잠시 고개를 들어, 더 큰 것을 바라보는 시간. 한 행성에 머무는 몇 분이 생각과 마음의 폭을 조금 넓혀 주기를 바랍니다.': 'Look up from the small worries of the day toward something larger. We hope a few minutes on one planet widen your thoughts and heart a little.', '편집실': 'Editors', '다음 호': 'Next issue', '다음 호에서 새로운 행성을 만나요.': 'New planets arrive in the next issue.', '이 행성에 착륙하기': 'Land on this planet', '기울이면 표지가 빛나요 · 흔들면 다음 표지': 'Tilt to light the cover · shake for the next cover', '마우스를 움직이면 표지가 빛나요': 'Move the mouse to light the cover', '다음 표지': 'Next cover' },
  zh: { '읽기 시작': '开始阅读', '이번 호': '本期内容', '분': '分钟', '이번 주의 문장': '本周一句', '에디터의 편지': '编辑来信', '이번 주에도 행성 {n}곳이 궤도에 올랐습니다.': '本周又有 {n} 颗行星进入轨道。', '하루의 작은 고민에서 잠시 고개를 들어, 더 큰 것을 바라보는 시간. 한 행성에 머무는 몇 분이 생각과 마음의 폭을 조금 넓혀 주기를 바랍니다.': '从一天的小烦恼中抬起头，看向更大的事物。愿在一颗行星停留的几分钟，让你的思想与心灵更开阔一些。', '편집실': '编辑部', '다음 호': '下一期', '다음 호에서 새로운 행성을 만나요.': '下一期将迎来新的行星。', '이 행성에 착륙하기': '登陆这颗行星', '기울이면 표지가 빛나요 · 흔들면 다음 표지': '倾斜让封面发光 · 摇晃换下一张封面', '마우스를 움직이면 표지가 빛나요': '移动鼠标让封面发光', '다음 표지': '下一张封面' },
  ja: { '읽기 시작': '読みはじめる', '이번 호': '今号の目次', '분': '分', '이번 주의 문장': '今週の言葉', '에디터의 편지': '編集後記', '이번 주에도 행성 {n}곳이 궤도에 올랐습니다.': '今週も {n} つの惑星が軌道に乗りました。', '하루의 작은 고민에서 잠시 고개를 들어, 더 큰 것을 바라보는 시간. 한 행성에 머무는 몇 분이 생각과 마음의 폭을 조금 넓혀 주기를 바랍니다.': '一日の小さな悩みから少し顔を上げて、もっと大きなものを見る時間。ひとつの惑星で過ごす数分が、考えと心の幅を少し広げてくれますように。', '편집실': '編集部', '다음 호': '次号', '다음 호에서 새로운 행성을 만나요.': '次号で新しい惑星に出会えます。', '이 행성에 착륙하기': 'この惑星に着陸する', '기울이면 표지가 빛나요 · 흔들면 다음 표지': '傾けると表紙が光る · 振ると次の表紙', '마우스를 움직이면 표지가 빛나요': 'マウスを動かすと表紙が光る', '다음 표지': '次の表紙' },
};
Object.keys(T3).forEach((l) => Object.assign(T[l], T3[l]));
const T4 = {
  en: { '함께 보기': 'Watch', '함께 읽기': 'Read', '호': ' issue', 'YouTube에서 보기': 'Open in YouTube', '영상·기사': 'links', '이번 달에도 행성 {n}곳이 궤도에 올랐습니다.': 'This month, {n} planets entered orbit.' },
  zh: { '함께 보기': '一起看', '함께 읽기': '一起读', '호': '刊', 'YouTube에서 보기': '在 YouTube 观看', '영상·기사': '视频·文章', '이번 달에도 행성 {n}곳이 궤도에 올랐습니다.': '本月又有 {n} 颗行星进入轨道。' },
  ja: { '함께 보기': '一緒に見る', '함께 읽기': '一緒に読む', '호': '号', 'YouTube에서 보기': 'YouTubeで見る', '영상·기사': '動画・記事', '이번 달에도 행성 {n}곳이 궤도에 올랐습니다.': '今月も {n} つの惑星が軌道に乗りました。' },
};
Object.keys(T4).forEach((l) => Object.assign(T[l], T4[l]));

const tilt = { x: 0, y: 0, px: 0, py: 0 }; window.__vxTilt = tilt;
addEventListener('pointermove', (e) => {
  if (!IS_MOBILE && tab === 'home' && viewer.hidden && !sheet.isOpen && !motionQuery.matches) {
    tilt.px = (e.clientX / innerWidth - .5) * 2; tilt.py = (e.clientY / innerHeight - .5) * 2; scheduleTilt();
  }
}, { passive: true });
// iPhone은 탭 안에서만 센서 권한을 물을 수 있음 → 첫 탭에서 켬
addEventListener('click', function once() {
  if (IS_MOBILE && motionQuery.matches) return;
  removeEventListener('click', once, true);
  if (IS_MOBILE) sensor.enable().then((ok) => { if (ok) { document.body.classList.add('sensing'); scheduleTilt(); } });
}, true);
// Buttons, a deliberate horizontal swipe and shake use the same cover transition.
function changeCover(step, index = null, restore = '') {
  if (tab !== 'home' || view.hidden || !viewer.hidden || sheet.isOpen || document.hidden || !nativeActive || coverChanging) return;
  const cover = view.querySelector('.mag-cover'), list = picksFor(viewMonth || thisMonth());
  if (!cover || list.length < 2) return;
  const next = index == null ? (coverIdx + step + list.length) % list.length : index;
  if (!Number.isInteger(next) || next < 0 || next >= list.length || next === coverIdx) return;
  const month = viewMonth, target = next;
  function apply() {
    coverChanging = false;
    if (tab !== 'home' || view.hidden || !viewer.hidden || sheet.isOpen || document.hidden || !cover.isConnected || viewMonth !== month) return;
    coverIdx = target; go('home', true);
    const freshCover = view.querySelector('.mag-cover');
    if (!motionQuery.matches) freshCover?.classList.add('flip-in');
    const control = restore.startsWith('index:') ? `[data-cover-index="${restore.slice(6)}"]` : restore ? `[data-cover="${restore}"]` : '';
    if (control) view.querySelector(control)?.focus({ preventScroll: true });
  }
  if (motionQuery.matches) apply();
  else { coverChanging = true; cover.classList.add('flip-out'); setTimeout(apply, 220); }
}
sensor.onShake(() => {
  if (motionQuery.matches) return;
  const cover = view.querySelector('.mag-cover');
  if (cover && cover.getBoundingClientRect().bottom >= innerHeight * .4) { changeCover(1); sensor.vibrate([15, 40, 25]); }
});
let coverTouch = null;
view.addEventListener('touchstart', (event) => {
  coverTouch = event.touches.length === 1 && event.target.closest('.mc-stage') ? { x: event.touches[0].clientX, y: event.touches[0].clientY, at: performance.now() } : null;
}, { passive: true });
view.addEventListener('touchmove', (event) => {
  if (event.touches.length !== 1) coverTouch = null;
}, { passive: true });
view.addEventListener('touchend', (event) => {
  const start = coverTouch; coverTouch = null;
  if (!start || !event.changedTouches.length || performance.now() - start.at > 1000) return;
  const dx = event.changedTouches[0].clientX - start.x, dy = event.changedTouches[0].clientY - start.y;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.8) changeCover(dx < 0 ? 1 : -1);
}, { passive: true });
view.addEventListener('touchcancel', () => { coverTouch = null; });


// 홈 화면을 그릴 때 움직일 요소를 한 번만 찾아 두고, 화면에 보이는 것만 움직임
let tiltZones = [], tiltIO = null, tiltRaf = 0, tiltLastDraw = 0, tiltDirty = true, coverChanging = false;
function bindTilt() {
  tiltIO?.disconnect(); tiltIO = null; tiltZones = []; tiltDirty = true;
  if (tab !== 'home' || motionQuery.matches) return;
  const zoneMap = new Map();
  if ('IntersectionObserver' in window) tiltIO = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const zone = zoneMap.get(entry.target);
      if (zone) { zone.visible = entry.isIntersecting; tiltDirty = true; }
    }
    scheduleTilt();
  });
  view.querySelectorAll('[data-tiltzone], [data-tiltcard]').forEach((el) => {
    const card = el.hasAttribute('data-tiltcard');
    const zone = { el, card, visible: !tiltIO,
      depth: [...el.querySelectorAll('[data-depth]')].map((item) => [item, +item.dataset.depth * (card ? .6 : 1)]), gloss: el.querySelector('[data-gloss]') };
    tiltZones.push(zone); zoneMap.set(el, zone); tiltIO?.observe(el);
  });
}
let tlx = 9, tly = 9;
function canTilt() {
  return nativeActive && !document.hidden && tab === 'home' && !view.hidden && viewer.hidden && !sheet.isOpen && !motionQuery.matches && tiltZones.some((zone) => zone.visible);
}
function scheduleTilt() { if (!tiltRaf && canTilt()) tiltRaf = requestAnimationFrame(tiltLoop); }
function tiltLoop(now) {
  tiltRaf = 0;
  if (!canTilt()) return;
  if (now - tiltLastDraw < 1000 / 30) { scheduleTilt(); return; }
  tiltLastDraw = now;
  const usingSensor = IS_MOBILE && sensor.on;
  const tx = usingSensor ? sensor.tiltX : tilt.px, ty = usingSensor ? sensor.tiltY : tilt.py;
  tilt.x += (tx - tilt.x) * .20; tilt.y += (ty - tilt.y) * .20;
  const changed = tiltDirty || Math.abs(tilt.x - tlx) >= .002 || Math.abs(tilt.y - tly) >= .002;
  if (changed) {
    tiltDirty = false; tlx = tilt.x; tly = tilt.y;
    for (const zone of tiltZones) {
      if (!zone.visible) continue;
      for (const [el, depth] of zone.depth) el.style.translate = `${(tilt.x * depth).toFixed(1)}px ${(tilt.y * depth).toFixed(1)}px`;
      if (zone.gloss) { zone.gloss.style.setProperty('--gx', `${(50 + tilt.x * 45).toFixed(1)}%`); zone.gloss.style.setProperty('--gy', `${(40 + tilt.y * 40).toFixed(1)}%`); }
      if (zone.card) zone.el.style.transform = `perspective(900px) rotateY(${(tilt.x * 7).toFixed(2)}deg) rotateX(${(-tilt.y * 6).toFixed(2)}deg)`;
    }
  }
  if (usingSensor || Math.abs(tx - tilt.x) >= .002 || Math.abs(ty - tilt.y) >= .002) scheduleTilt();
}
motionQuery.addEventListener('change', () => {
  revealIO?.disconnect(); revealIO = null;
  view.querySelectorAll('.rs').forEach((el) => el.classList.add('in'));
  tilt.x = tilt.y = tilt.px = tilt.py = 0;
  for (const zone of tiltZones) {
    for (const [el] of zone.depth) el.style.translate = '';
    if (zone.card) zone.el.style.transform = '';
    zone.gloss?.style.removeProperty('--gx'); zone.gloss?.style.removeProperty('--gy');
  }
  bindTilt(); syncRuntime(); syncPreferenceControls();
  const hint = view.querySelector('[data-sensor-hint] span');
  if (hint) hint.textContent = t(motionQuery.matches ? '읽기와 탐색' : IS_MOBILE ? '기울이면 표지가 빛나요 · 옆으로 밀면 다음 표지' : '마우스를 움직이면 표지가 빛나요');
});

/* ---------- 착륙 로딩 화면 ---------- */
const landing = createAppLanding({
  planetBitmap, hasRing, name, translate: t, motionQuery,
  onFinished: syncRuntime,
  onRetry() { if (current) { flushWatchTime(); landing.start(current); loadExhibitFrame(current); syncRuntime(); } },
});

/* ---------- 시작: 기기 캐시 → 로컬 데이터 → 뒤에서 CMS 갱신 ---------- */
const DKEY = `valix-data3-${lang}`;
const pack = (data = { cells, blocks, ISSUES }) => JSON.stringify(data, (key, value) => key === 'group' ? undefined : value);
const validData = (data) => data && Array.isArray(data.cells) && data.cells.length > 0 && data.cells.every((cell) => cell && typeof cell.id === 'string');
function unpack(data) { cells = data.cells.map((cell) => ({ ...cell, artist: String(cell.artist || '').replace(/\bVALIX(?:\s+LAB)?\b/g, 'NEBULA') })); blocks = Array.isArray(data.blocks) ? data.blocks : []; ISSUES = data.ISSUES || {}; }
let pendingData = null;
function applyPendingData(redraw = true) {
  if (!pendingData || !nativeActive || document.hidden || !viewer.hidden || sheet.isOpen || !ob.hidden) return;
  const data = pendingData; pendingData = null; unpack(data); warm(firstPlanets());
  if (redraw && !view.hidden) go(tab, true);
}
async function loadIssues() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch('data/issues.json', { cache: 'no-cache', signal: controller.signal });
    if (!response.ok) return null;
    const issues = await response.json();
    return issues && typeof issues === 'object' && !Array.isArray(issues) ? issues : null;
  } catch { return null; }
  finally { clearTimeout(timeout); }
}
function firstPlanets() {
  const picked = picksFor(thisMonth());
  return [...picked, ...cells.filter((cell) => !picked.includes(cell))];
}
function saveData(serialized) {
  const save = () => { try { localStorage.setItem(DKEY, serialized); } catch {} };
  if ('requestIdleCallback' in window) requestIdleCallback(save, { timeout: 1000 }); else setTimeout(save, 0);
}
function firstValidData(promises) {
  return new Promise((resolve) => {
    let remaining = promises.length;
    promises.forEach((promise) => Promise.resolve(promise).catch(() => null).then((data) => {
      if (validData(data)) resolve(data);
      if (--remaining === 0) resolve(null);
    }));
  });
}
(async () => {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(DKEY)); } catch {}
  if (!validData(saved)) saved = null;
  const issues = loadIssues();
  const fresh = Promise.all([loadData().catch(() => null), issues]).then(([data, issue]) => data ? { cells: data.cells, blocks: data.blocks || [], ISSUES: issue || saved?.ISSUES || {} } : null);
  const local = saved ? null : loadLocalData().catch(() => null).then((data) => data ? { cells: data.cells, blocks: data.blocks || [], ISSUES: {} } : null);
  const initial = saved || await firstValidData([local, fresh]);
  if (validData(initial)) unpack(initial);
  const splash = $('#splash'); splash.classList.add('out'); setTimeout(() => splash.remove(), motionQuery.matches ? 0 : 350);
  if (!cells.length) {
    view.hidden = false;
    view.innerHTML = `<p class="empty" style="padding-top:35vh">${t('전시를 불러오지 못했어요.')}<br><br><button class="btn line" style="width:auto;padding:0 24px;margin:0 auto" onclick="location.reload()">${t('다시 시도')}</button></p>`;
    syncRuntime(); return;
  }
  warm(firstPlanets());
  if (!store.get('valix-onboarded', false)) showOB('intro0'); else go('home');
  const match = location.hash.match(/open=([\w-]+)/);
  if (match) { const cell = cells.find((item) => item.id === match[1]); if (cell && isOpen(cell)) openExhibit(cell); }
  if (!saved) saveData(pack());
  issues.then((issue) => {
    if (!issue || JSON.stringify(issue) === JSON.stringify(ISSUES)) return;
    pendingData = { ...(pendingData || { cells, blocks }), ISSUES: issue };
    applyPendingData();
  });
  const data = await fresh;
  if (validData(data)) {
    const serialized = pack(data);
    saveData(serialized);
    if (serialized !== pack()) { pendingData = data; applyPendingData(); }
  }
})();
