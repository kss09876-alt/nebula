// VALIX 앱 화면 — 시작 화면 → 소개 → 로그인 → 닉네임 → 탭(전시·플레이·리워드·마이)
// 전시 내용은 기존 XPACE 페이지(cell.html, bitssal.html)를 같은 주소에서 그대로 불러옵니다.
// 데이터는 기존 data.js(구글 시트 → 백업 JSON)를 그대로 씁니다. 개인 기록은 기기 안(localStorage)에만 저장합니다.
import { loadData, esc } from './data.js?v=17';
import { lang, LANGS } from './i18n.js?v=3';
import { planetURL, planetCanvas, planetType, hasRing } from './planets.js?v=3';
import { IS_MOBILE, sensor } from './sensors.js?v=2';

/* ---------- 문구 ---------- */
const T = {
  en: { '마지막으로\n이 우주에서 불릴\n이름을 정해주세요': 'Last step:\nchoose the name\nthis universe will call you', '항해명': 'Voyager name', '이름은 이 기기에만 저장돼요.': 'Your name stays on this device.', '탑승하기': 'Board', '먼저 우주 둘러보기': 'Explore first', '다른 이름 뽑기': 'Draw another name', '이름 바꾸기': 'Rename', '탑승': 'boarded', '곳 착륙': ' planets landed', '최대 12자까지 입력 가능해요': 'Up to 12 characters', '전시': 'Exhibits', '플레이': 'Play', '리워드': 'Rewards', '마이': 'My', '일상은 작고,\n우주는 넓으니까': 'Days feel small,\nthe universe is vast', '잠시 고개를 들어 더 큰 것을 바라보는 시간': 'Look up for a moment at something bigger', '전시 하나가\n행성 하나가 되는 곳': 'Where every exhibition\nbecomes a planet', '매주 새로운 행성에 착륙해 보세요': 'Land on a new planet every week', '다음': 'Next', '건너뛰기': 'Skip', '매주 착륙하는\n온라인 인터랙티브 전시': 'An interactive exhibition\nyou land on every week', '생각과 마음의 폭을 넓히는 시간': 'Widen your thoughts and heart', '카카오로 시작하기': 'Continue with Kakao', 'Apple로 계속하기': 'Continue with Apple', '로그인 전 둘러보기': 'Look around first', '로그인은 곧 열려요. 지금은 둘러보기로 시작할게요.': 'Sign-in is coming soon. Let’s start by looking around.', '마지막으로\n닉네임을 정해주세요': 'Last step:\nchoose a nickname', '닉네임': 'Nickname', '최대 8자까지 입력 가능해요': 'Up to 8 characters', '닉네임은 이 기기에만 저장돼요.': 'Your nickname stays on this device.', '시작하기': 'Start', '입장하기': 'Enter', '이번 주 열린 행성': 'Planets open this week', '지금 상영 중': 'Now showing', '곧 착륙할 행성': 'Landing soon', '기획전': 'Group show', '단독전': 'Solo', '공개': 'Open', '예정': 'Soon', '남음': 'left', '일': 'd', '체험 방법': 'How to play', '휴대폰에서 더 많은 체험을 할 수 있어요.': 'More to try on your phone.', 'n주차, 함께 시작해요!': 'Week {n}, let’s go!', 'n주차': 'Wk {n}', '참여 안내': 'How it works', '3주 연속 착륙하면 <em>항해 리포트</em>가 열려요': 'Land 3 weeks in a row to unlock your <em>voyage report</em>', '이번 주 행성 3곳에 착륙하면\n항해 스탬프 완성!': 'Land on 3 planets this week\nto complete your stamps!', '행성 3곳에 착륙하면 완성돼요': 'Land on 3 planets to complete', '이번 주 스탬프 완성!': 'Stamps complete this week!', '스탬프와 기록은 이 기기에만 저장돼요.': 'Stamps and records stay on this device.', '매주 월요일에 새 주차가 시작돼요. 그 주에 전시에 한 번 이상 입장하면 그 주의 책이 채워져요.': 'A new week starts every Monday. Enter any exhibition that week to fill its book.', '내 프로필': 'My profile', '나의 기록': 'My records', '항해 리포트': 'Voyage report', '다녀온 행성': 'Planets visited', '머문 시간': 'Time spent', '최근 본 전시': 'Recently viewed', '아직 다녀온 행성이 없어요.': 'No planets visited yet.', '언어': 'Language', '체험 권한': 'Sensor access', '기울기·흔들기·마이크·카메라·위치는 전시 안에서 체험할 때만 쓰고, 기기 밖으로 저장하거나 보내지 않아요.': 'Tilt, shake, mic, camera and location are only used during the experience and never stored or sent.', '관람 기록 지우기': 'Clear history', '버전': 'Version', '닉네임을 바꿀까요?': 'Change nickname?', '우주인': 'Astronaut', '분': 'min', '시간': 'h', '착륙하는 중': 'Landing', '대기권 진입': 'Entering atmosphere', '착륙 완료': 'Landed', '신호가 약해요. 연결을 확인해 주세요.': 'Weak signal. Check your connection.', '다시 시도': 'Try again', '전시를 불러오지 못했어요.': 'Could not load exhibitions.', '기록을 지웠어요.': 'History cleared.' },
  zh: { '마지막으로\n이 우주에서 불릴\n이름을 정해주세요': '最后，\n请取一个\n在这片宇宙里的名字', '항해명': '航行名', '이름은 이 기기에만 저장돼요.': '名字只保存在本设备上。', '탑승하기': '登船', '먼저 우주 둘러보기': '先看看宇宙', '다른 이름 뽑기': '换一个名字', '이름 바꾸기': '改名', '탑승': '登船', '곳 착륙': ' 颗行星已登陆', '최대 12자까지 입력 가능해요': '最多 12 个字', '전시': '展览', '플레이': '互动', '리워드': '奖励', '마이': '我的', '일상은 작고,\n우주는 넓으니까': '日常很小，\n宇宙很大', '잠시 고개를 들어 더 큰 것을 바라보는 시간': '抬起头，看看更大的世界', '전시 하나가\n행성 하나가 되는 곳': '一个展览\n就是一颗行星', '매주 새로운 행성에 착륙해 보세요': '每周登陆一颗新行星', '다음': '下一步', '건너뛰기': '跳过', '매주 착륙하는\n온라인 인터랙티브 전시': '每周登陆的\n线上互动展览', '생각과 마음의 폭을 넓히는 시간': '拓宽思想与心灵', '카카오로 시작하기': '使用 Kakao 开始', 'Apple로 계속하기': '通过 Apple 继续', '로그인 전 둘러보기': '先逛逛', '로그인은 곧 열려요. 지금은 둘러보기로 시작할게요.': '登录功能即将开放，先随便看看吧。', '마지막으로\n닉네임을 정해주세요': '最后，\n请设置昵称', '닉네임': '昵称', '최대 8자까지 입력 가능해요': '最多 8 个字', '닉네임은 이 기기에만 저장돼요.': '昵称只保存在本设备上。', '시작하기': '开始', '입장하기': '进入', '이번 주 열린 행성': '本周开放的行星', '지금 상영 중': '正在展出', '곧 착륙할 행성': '即将登陆', '기획전': '策划展', '단독전': '个展', '공개': '开放', '예정': '即将', '남음': '后结束', '일': '天', '체험 방법': '体验方法', '휴대폰에서 더 많은 체험을 할 수 있어요.': '在手机上可以体验更多。', 'n주차, 함께 시작해요!': '第 {n} 周，一起开始吧！', 'n주차': '第{n}周', '참여 안내': '参与说明', '3주 연속 착륙하면 <em>항해 리포트</em>가 열려요': '连续 3 周登陆即可解锁<em>航行报告</em>', '이번 주 행성 3곳에 착륙하면\n항해 스탬프 완성!': '本周登陆 3 颗行星\n即可集齐印章！', '행성 3곳에 착륙하면 완성돼요': '登陆 3 颗行星即可完成', '이번 주 스탬프 완성!': '本周印章已集齐！', '스탬프와 기록은 이 기기에만 저장돼요.': '印章与记录只保存在本设备上。', '매주 월요일에 새 주차가 시작돼요. 그 주에 전시에 한 번 이상 입장하면 그 주의 책이 채워져요.': '每周一开始新的一周。当周进入任一展览，即可填满当周的书。', '내 프로필': '我的资料', '나의 기록': '我的记录', '항해 리포트': '航行报告', '다녀온 행성': '到访行星', '머문 시간': '停留时间', '최근 본 전시': '最近观看', '아직 다녀온 행성이 없어요.': '还没有到访的行星。', '언어': '语言', '체험 권한': '体验权限', '기울기·흔들기·마이크·카메라·위치는 전시 안에서 체험할 때만 쓰고, 기기 밖으로 저장하거나 보내지 않아요.': '倾斜、摇晃、麦克风、相机与位置仅在体验中使用，不会保存或发送。', '관람 기록 지우기': '清除记录', '버전': '版本', '닉네임을 바꿀까요?': '修改昵称？', '우주인': '宇航员', '분': '分钟', '시간': '小时', '착륙하는 중': '正在着陆', '대기권 진입': '进入大气层', '착륙 완료': '着陆完成', '신호가 약해요. 연결을 확인해 주세요.': '信号较弱，请检查网络。', '다시 시도': '重试', '전시를 불러오지 못했어요.': '无法加载展览。', '기록을 지웠어요.': '记录已清除。' },
  ja: { '마지막으로\n이 우주에서 불릴\n이름을 정해주세요': '最後に\nこの宇宙で呼ばれる\n名前を決めてください', '항해명': '航海名', '이름은 이 기기에만 저장돼요.': '名前はこの端末にのみ保存されます。', '탑승하기': '搭乗する', '먼저 우주 둘러보기': 'まず宇宙を見てみる', '다른 이름 뽑기': '別の名前をひく', '이름 바꾸기': '名前を変える', '탑승': '搭乗', '곳 착륙': 'つの惑星に着陸', '최대 12자까지 입력 가능해요': '12文字まで入力できます', '전시': '展示', '플레이': 'プレイ', '리워드': 'リワード', '마이': 'マイ', '일상은 작고,\n우주는 넓으니까': '日常は小さく、\n宇宙は広いから', '잠시 고개를 들어 더 큰 것을 바라보는 시간': '少し顔を上げて、もっと大きなものを見る時間', '전시 하나가\n행성 하나가 되는 곳': 'ひとつの展示が\nひとつの惑星になる場所', '매주 새로운 행성에 착륙해 보세요': '毎週、新しい惑星に着陸してみましょう', '다음': '次へ', '건너뛰기': 'スキップ', '매주 착륙하는\n온라인 인터랙티브 전시': '毎週着陸する\nオンライン・インタラクティブ展示', '생각과 마음의 폭을 넓히는 시간': '考えと心の幅を広げる時間', '카카오로 시작하기': 'Kakaoではじめる', 'Apple로 계속하기': 'Appleで続ける', '로그인 전 둘러보기': 'ログインせずに見る', '로그인은 곧 열려요. 지금은 둘러보기로 시작할게요.': 'ログインはまもなく公開します。まずは見てみましょう。', '마지막으로\n닉네임을 정해주세요': '最後に\nニックネームを決めてください', '닉네임': 'ニックネーム', '최대 8자까지 입력 가능해요': '8文字まで入力できます', '닉네임은 이 기기에만 저장돼요.': 'ニックネームはこの端末にのみ保存されます。', '시작하기': 'はじめる', '입장하기': '入場する', '이번 주 열린 행성': '今週ひらいた惑星', '지금 상영 중': '公開中', '곧 착륙할 행성': 'まもなく着陸', '기획전': '企画展', '단독전': '個展', '공개': '公開', '예정': '予定', '남음': '残り', '일': '日', '체험 방법': '体験方法', '휴대폰에서 더 많은 체험을 할 수 있어요.': 'スマートフォンではさらに体験できます。', 'n주차, 함께 시작해요!': '{n}週目、一緒に始めましょう！', 'n주차': '{n}週目', '참여 안내': '参加案内', '3주 연속 착륙하면 <em>항해 리포트</em>가 열려요': '3週連続で着陸すると<em>航海レポート</em>がひらきます', '이번 주 행성 3곳에 착륙하면\n항해 스탬프 완성!': '今週3つの惑星に着陸すると\nスタンプ完成！', '행성 3곳에 착륙하면 완성돼요': '3つの惑星に着陸すると完成します', '이번 주 스탬프 완성!': '今週のスタンプ完成！', '스탬프와 기록은 이 기기에만 저장돼요.': 'スタンプと記録はこの端末にのみ保存されます。', '매주 월요일에 새 주차가 시작돼요. 그 주에 전시에 한 번 이상 입장하면 그 주의 책이 채워져요.': '毎週月曜日に新しい週が始まります。その週に展示へ一度でも入場すると、その週の本が埋まります。', '내 프로필': 'マイプロフィール', '나의 기록': 'わたしの記録', '항해 리포트': '航海レポート', '다녀온 행성': '訪れた惑星', '머문 시간': '滞在時間', '최근 본 전시': '最近見た展示', '아직 다녀온 행성이 없어요.': 'まだ訪れた惑星はありません。', '언어': '言語', '체험 권한': '体験の権限', '기울기·흔들기·마이크·카메라·위치는 전시 안에서 체험할 때만 쓰고, 기기 밖으로 저장하거나 보내지 않아요.': '傾き・振る・マイク・カメラ・位置情報は体験中にのみ使い、保存・送信しません。', '관람 기록 지우기': '記録を消去', '버전': 'バージョン', '닉네임을 바꿀까요?': 'ニックネームを変更しますか？', '우주인': '宇宙飛行士', '분': '分', '시간': '時間', '착륙하는 중': '着陸中', '대기권 진입': '大気圏突入', '착륙 완료': '着陸完了', '신호가 약해요. 연결을 확인해 주세요.': '電波が弱いようです。接続を確認してください。', '다시 시도': '再試行', '전시를 불러오지 못했어요.': '展示を読み込めませんでした。', '기록을 지웠어요.': '記録を消去しました。' },
};
const t = (k, n) => { let s = (T[lang] && T[lang][k]) ?? k; if (n != null) s = s.replace('{n}', n).replace(/^n/, n); return s; };
const br = (s) => esc(s).replace(/\n/g, '<br>');
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });

const VERSION = '0.7.0';

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
const poster = (c, cls = '') => `<span class="poster ${cls}" style="--c:${esc(c.color || '#9db8ff')}"><img class="pl" src="${planetURL(c, 384)}" alt="" draggable="false"><span class="pc">${esc(c.code || '')}</span><span class="pt">${esc(name(c))}</span></span>`;
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
        <button class="btn black" data-ob="soon"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M16.4 12.6c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7c-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.5 2 1 0 1.4-.6 2.6-.6s1.5.6 2.6.6c1.1 0 1.8-1 2.4-2 .8-1.1 1.1-2.2 1.1-2.3 0 0-2.1-.8-2.1-3.1zM14.5 6.6c.5-.7.9-1.6.8-2.6-.8 0-1.8.5-2.4 1.2-.5.6-1 1.6-.8 2.5.9.1 1.8-.4 2.4-1.1z"/></svg>${t('Apple로 계속하기')}</button>
        <button class="link" data-ob="nick">${t('먼저 우주 둘러보기')} ›</button>
      </div>`;
  },
  nick() {
    return `<button class="back" data-ob="login" aria-label="뒤로"><svg viewBox="0 0 24 24"><path d="M20 12H4M10 6l-6 6 6 6"/></svg></button>
      <h1 class="ob-h">${br(t('마지막으로\n이 우주에서 불릴\n이름을 정해주세요'))}</h1>
      <div class="field"><label for="nick">${t('항해명')}</label>
        <div class="in"><input id="nick" maxlength="20" autocomplete="off" placeholder="${esc(t('최대 12자까지 입력 가능해요'))}" /><button class="btn dice" data-dice aria-label="${esc(t('다른 이름 뽑기'))}"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/></svg></button></div>
        <div class="names" id="names"></div>
        <p class="hint">${t('이름은 이 기기에만 저장돼요.')}</p></div>
      <div style="margin-top:auto"><button class="btn black" id="nick-go" data-ob="done">${t('탑승하기')}</button></div>`;
  },
};
function showOB(k) {
  ob.hidden = false; view.hidden = true; tabsEl.hidden = true;
  ob.innerHTML = k === 'intro0' ? OB.intro(0) : k === 'intro1' ? OB.intro(1) : OB[k]();
  if (k === 'nick') {
    const i = $('#nick'), b = $('#nick-go'), p = me();
    const fill = () => { const seen = new Set(); const list = []; while (list.length < 4) { const n = wanderer(); if (!seen.has(n)) { seen.add(n); list.push(n); } } $('#names').innerHTML = list.map((n) => `<button data-name="${esc(n)}">${esc(n)}</button>`).join(''); };
    i.value = (p && p.nick) || wanderer(); fill();
    i.addEventListener('input', () => b.className = 'btn ' + (i.value.trim() ? 'black' : 'off'));
  }
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
  en: { '알림': 'Notifications', '모두 읽음': 'Mark all read', '행성이 열렸어요': 'planet is open', '이번 주 행성이 도착했어요': 'This week’s planets have arrived', '플레이 마감까지': 'Play closes in', '새 알림이 없어요.': 'No new notifications.', '지난 호': 'Past issues', '진행 중': 'Now', '전체 행성': 'All planets', '착륙하기': 'Land', '좋아요': 'Like', '좋아요한 행성': 'Liked planets', '아직 좋아요한 행성이 없어요.': 'No liked planets yet.', '좋아요에 담았어요.': 'Added to likes.', '좋아요를 뺐어요.': 'Removed from likes.', '방': 'Rooms', '이렇게 체험해요': 'How to experience', '휴대폰을 기울이고, 흔들고, 엎어 보세요. 권한은 입장할 때 한 번 물어봐요.': 'Tilt, shake and lay your phone down. Permission is asked once when you enter.', '참여 방법': 'How rewards work', '매주 월요일 새 Vol.이 열려요.': 'A new Vol. opens every Monday.', '그 주에 행성 한 곳 이상 착륙하면 그 주의 책이 채워져요.': 'Land on at least one planet that week to fill its book.', '한 주에 서로 다른 행성 3곳에 착륙하면 스탬프가 완성돼요.': 'Land on 3 different planets in a week to complete the stamps.', '3주 연속으로 책을 채우면 항해 리포트가 열려요.': 'Fill books 3 weeks in a row to unlock your voyage report.', '연속': 'streak', '주': 'wk', '닫기': 'Close', '지난 호는 이번 주와 같은 행성으로 보여줘요. (프로토타입)': 'Past issues show the planets open at that time. (prototype)', '항해 리포트가 열렸어요': 'Your voyage report is open', '가장 오래 머문 행성': 'Longest stay', '처음 착륙한 날': 'First landing' },
  zh: { '알림': '通知', '모두 읽음': '全部已读', '행성이 열렸어요': '行星已开放', '이번 주 행성이 도착했어요': '本周的行星已抵达', '플레이 마감까지': '互动截止还有', '새 알림이 없어요.': '没有新通知。', '지난 호': '往期', '진행 중': '进行中', '전체 행성': '全部行星', '착륙하기': '着陆', '좋아요': '喜欢', '좋아요한 행성': '喜欢的行星', '아직 좋아요한 행성이 없어요.': '还没有喜欢的行星。', '좋아요에 담았어요.': '已加入喜欢。', '좋아요를 뺐어요.': '已取消喜欢。', '방': '展厅', '이렇게 체험해요': '体验方法', '휴대폰을 기울이고, 흔들고, 엎어 보세요. 권한은 입장할 때 한 번 물어봐요.': '倾斜、摇晃、把手机朝下放。进入时会询问一次权限。', '참여 방법': '参与方法', '매주 월요일 새 Vol.이 열려요.': '每周一开启新的 Vol.。', '그 주에 행성 한 곳 이상 착륙하면 그 주의 책이 채워져요.': '当周登陆任一行星，即可填满当周的书。', '한 주에 서로 다른 행성 3곳에 착륙하면 스탬프가 완성돼요.': '一周内登陆 3 颗不同行星即可集齐印章。', '3주 연속으로 책을 채우면 항해 리포트가 열려요.': '连续 3 周填满书即可解锁航行报告。', '연속': '连续', '주': '周', '닫기': '关闭', '지난 호는 이번 주와 같은 행성으로 보여줘요. (프로토타입)': '往期显示当时开放的行星。（原型）', '항해 리포트가 열렸어요': '航行报告已开启', '가장 오래 머문 행성': '停留最久的行星', '처음 착륙한 날': '首次着陆' },
  ja: { '알림': 'お知らせ', '모두 읽음': 'すべて既読', '행성이 열렸어요': 'の惑星がひらきました', '이번 주 행성이 도착했어요': '今週の惑星が届きました', '플레이 마감까지': 'プレイ締切まで', '새 알림이 없어요.': '新しいお知らせはありません。', '지난 호': 'バックナンバー', '진행 중': '公開中', '전체 행성': 'すべての惑星', '착륙하기': '着陸する', '좋아요': 'いいね', '좋아요한 행성': 'いいねした惑星', '아직 좋아요한 행성이 없어요.': 'まだいいねした惑星はありません。', '좋아요에 담았어요.': 'いいねに追加しました。', '좋아요를 뺐어요.': 'いいねを外しました。', '방': '部屋', '이렇게 체험해요': '体験のしかた', '휴대폰을 기울이고, 흔들고, 엎어 보세요. 권한은 입장할 때 한 번 물어봐요.': 'スマホを傾けたり、振ったり、伏せたりしてみましょう。権限は入場時に一度だけ聞きます。', '참여 방법': '参加方法', '매주 월요일 새 Vol.이 열려요.': '毎週月曜日に新しいVol.がひらきます。', '그 주에 행성 한 곳 이상 착륙하면 그 주의 책이 채워져요.': 'その週に惑星へ一度でも着陸すると、その週の本が埋まります。', '한 주에 서로 다른 행성 3곳에 착륙하면 스탬프가 완성돼요.': '1週間で異なる惑星3つに着陸するとスタンプ完成です。', '3주 연속으로 책을 채우면 항해 리포트가 열려요.': '3週連続で本を埋めると航海レポートがひらきます。', '연속': '連続', '주': '週', '닫기': '閉じる', '지난 호는 이번 주와 같은 행성으로 보여줘요. (프로토타입)': 'バックナンバーは当時公開中の惑星を表示します。（プロトタイプ）', '항해 리포트가 열렸어요': '航海レポートがひらきました', '가장 오래 머문 행성': '最も長く滞在した惑星', '처음 착륙한 날': '初めて着陸した日' },
};
Object.keys(T2).forEach((l) => Object.assign(T[l], T2[l]));

/* ---------- 별빛 배경 (천천히 흐르는 별 + 가끔 유성) ---------- */
const sky = (() => {
  const cv = document.createElement('canvas'); cv.id = 'sky'; document.body.prepend(cv);
  const x = cv.getContext('2d'), calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, dpr, stars = [], meteor = null, raf = 0, on = true, last = 0, scrollY0 = 0, hd = 0;
  const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
    const D = Math.hypot(W, H); stars = Array.from({ length: Math.round(D * D / 2600) }, () => ({ x: W / 2 + (Math.random() - 0.5) * D, y: H / 2 + (Math.random() - 0.5) * D, z: Math.random() ** 2, p: Math.random() * 6.28, c: Math.random() < 0.15 ? '255,226,180' : Math.random() < 0.3 ? '190,205,255' : '255,255,255' })); };
  function frame(now) {
    const dt = Math.min(50, now - (last || now)); last = now;
    x.clearRect(0, 0, W, H);
    const sy = scrollY * 0.15, dsy = sy - scrollY0; scrollY0 = sy;
    const tl = window.__vxTilt || { x: 0, y: 0 };
    if (sensor.on && sensor.heading != null) { let d = sensor.heading * Math.PI / 180 - hd; d = Math.atan2(Math.sin(d), Math.cos(d)); hd += d * 0.05; }
    const ch = Math.cos(-hd), sh = Math.sin(-hd), cxs = W / 2, cys = H / 2;
    for (const s of stars) {
      if (!calm) { s.x -= (0.004 + s.z * 0.02) * dt; s.y -= dsy * (0.3 + s.z); }
      const D = Math.hypot(W, H), L0 = W / 2 - D / 2, T0 = H / 2 - D / 2;
      if (s.x < L0) s.x += D; if (s.y < T0) s.y += D; if (s.y > T0 + D) s.y -= D;
      const tw = 0.45 + 0.55 * Math.sin(now / (900 + s.z * 600) + s.p);
      x.fillStyle = `rgba(${s.c},${(0.15 + s.z * 0.75) * tw})`; const r = 0.4 + s.z * 1.3;
      const dx = s.x - cxs, dy = s.y - cys, qx = cxs + dx * ch - dy * sh - tl.x * (4 + s.z * 26), qy = cys + dx * sh + dy * ch - tl.y * (4 + s.z * 22);
      x.fillRect(qx, qy, r, r);
    }
    if (!calm && !meteor && Math.random() < dt / 7000) meteor = { x: W * (0.3 + Math.random() * 0.7), y: Math.random() * H * 0.4, t: 0 };
    if (meteor) {
      meteor.t += dt; const k = meteor.t / 900, mx = meteor.x - k * 260, my = meteor.y + k * 130;
      const g = x.createLinearGradient(mx, my, mx + 90, my - 45); g.addColorStop(0, `rgba(255,255,255,${0.9 * (1 - k)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.strokeStyle = g; x.lineWidth = 1.4; x.beginPath(); x.moveTo(mx, my); x.lineTo(mx + 90, my - 45); x.stroke();
      if (k >= 1) meteor = null;
    }
    raf = on ? requestAnimationFrame(frame) : 0;
  }
  addEventListener('resize', size); size();
  return { start() { if (!raf) { on = true; last = 0; raf = requestAnimationFrame(frame); } }, stop() { on = false; cancelAnimationFrame(raf); raf = 0; } };
})();
sky.start();

/* ---------- 아래에서 올라오는 시트 ---------- */
const sheet = (() => {
  const bg = document.createElement('div'); bg.className = 'sheet-bg'; bg.hidden = true;
  const el = document.createElement('section'); el.className = 'sheet'; el.hidden = true; el.setAttribute('role', 'dialog');
  document.body.append(bg, el);
  let y0 = null, dy = 0;
  const close = () => { el.classList.remove('in'); bg.classList.remove('in'); setTimeout(() => { el.hidden = bg.hidden = true; el.innerHTML = ''; }, 320); };
  bg.addEventListener('click', close);
  el.addEventListener('touchstart', (e) => { if (el.scrollTop <= 0) y0 = e.touches[0].clientY; }, { passive: true });
  el.addEventListener('touchmove', (e) => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); el.style.transform = `translateY(${dy}px)`; }, { passive: true });
  el.addEventListener('touchend', () => { el.style.transform = ''; if (dy > 90) close(); y0 = null; dy = 0; });
  el.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
  return {
    open(html, cls = '') { el.className = 'sheet ' + cls; el.innerHTML = `<i class="grab"></i>${html}`; el.hidden = bg.hidden = false; el.scrollTop = 0; requestAnimationFrame(() => { el.classList.add('in'); bg.classList.add('in'); }); return el; },
    close, get isOpen() { return !el.hidden; }, el,
  };
})();

/* ---------- 좋아요 · 알림 ---------- */
const likes = () => store.get('valix-likes', []);
const isLiked = (id) => likes().includes(id);
function toggleLike(id) { const l = likes(); const i = l.indexOf(id); if (i >= 0) l.splice(i, 1); else l.unshift(id); store.set('valix-likes', l); toast(t(i >= 0 ? '좋아요를 뺐어요.' : '좋아요에 담았어요.')); return i < 0; }
const heart = (on) => `<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" ${on ? 'fill="#ef4a4a" stroke="#ef4a4a"' : ''}/></svg>`;
const unread = () => store.get('valix-noti', 0) < vol();
function notiSheet() {
  const open = cells.filter(isOpen).slice().reverse(), mon = monday(Date.now());
  const d = Math.ceil((weekEnd() - Date.now()) / DAY);
  const items = [
    { c: featured(), h: `Vol. ${vol()} · ${t('이번 주 행성이 도착했어요')}`, s: open.map(name).join(' · '), at: mon },
    { c: featured(), h: `${t('플레이 마감까지')} ${d}${t('일')}`, s: playOf(featured()).how, at: Date.now() - 3600e3 },
    ...open.map((c, i) => ({ c, h: `${name(c)} ${t('행성이 열렸어요')}`, s: c.artist || '', at: mon - (i + 1) * DAY })),
  ];
  const isNew = unread();
  sheet.open(`<div class="sh-h"><h3>${t('알림')}</h3><button data-read>${t('모두 읽음')}</button></div>
    <div class="noti">${items.map((n, i) => `<button class="nrow${isNew && i < 2 ? ' new' : ''}" data-detail="${esc(n.c.id)}"><img src="${planetURL(n.c, 192)}" alt=""><span><b>${esc(n.h)}</b><small>${esc(n.s)}</small></span><em>${new Date(n.at).toLocaleDateString(lang, { month: 'numeric', day: 'numeric' })}</em></button>`).join('')}</div>`);
}

/* ---------- 지난 호 (Vol 목록) ---------- */
let viewVol = 0; // 0 = 이번 주
const volStart = (n) => new Date(LAUNCH.getTime() + (n - 1) * 7 * DAY);
const startOf = (c) => { const m = String(c.period || '').match(/(\d{4})\.(\d{1,2})/); return m ? new Date(+m[1], +m[2] - 1, 1) : new Date(0); };
const openAt = (n) => cells.filter((c) => isOpen(c) && startOf(c) <= new Date(volStart(n).getTime() + 7 * DAY));
function volSheet() {
  const now = vol(), fmt = (d) => d.toLocaleDateString(lang, { month: 'numeric', day: 'numeric' });
  sheet.open(`<div class="sh-h"><h3>${t('지난 호')}</h3></div><div class="vols">${Array.from({ length: now }, (_, i) => now - i).map((n) => { const list = openAt(n), f = list[list.length - 1];
    return `<button class="vrow${(viewVol || now) === n ? ' on' : ''}" data-vol="${n}">${f ? `<img src="${planetURL(f, 192)}" alt="">` : '<span class="ph"></span>'}<span><b>Vol. ${n}</b><small>${fmt(volStart(n))} – ${fmt(new Date(volStart(n).getTime() + 6 * DAY))} · ${list.map(name).join(' · ') || '—'}</small></span>${n === now ? `<em>${t('진행 중')}</em>` : ''}</button>`; }).join('')}</div>`);
}

/* ---------- 전시 상세 ---------- */
function detailSheet(c) {
  const p = playOf(c), liked = isLiked(c.id);
  const el = sheet.open(`
    <div class="dt-stage" style="--c:${esc(c.color || '#9db8ff')}"><span class="dt-orbit"><i></i></span><img class="dt-pl" src="${planetURL(c, 768)}" alt=""></div>
    <div class="dt-body">
      <p class="dt-code">${esc(c.code)} ${kindTag(c)}</p>
      <h2>${esc(name(c))}</h2>
      <p class="dt-sub">${esc(c.subtitle || '')}</p>
      <p class="dt-meta">${esc(c.artist || '')}${c.period ? ' · ' + esc(c.period) : ''}</p>
      ${c.summary ? `<p class="dt-sum">${esc(c.summary)}</p>` : ''}
      ${c.rooms && c.rooms.length ? `<div class="dt-rooms"><h4>${t('방')}</h4>${c.rooms.map((r, i) => `<div><em>${String(i + 1).padStart(2, '0')}</em><span><b>${esc(r.short || name(r))}</b><small>${esc(r.subtitle || '')}</small></span></div>`).join('')}</div>` : ''}
      <div class="dt-how"><h4>${t('이렇게 체험해요')}</h4><p>${esc(p.how)}</p><p class="small">${t('휴대폰을 기울이고, 흔들고, 엎어 보세요. 권한은 입장할 때 한 번 물어봐요.')}</p></div>
    </div>
    <div class="dt-cta"><button class="like${liked ? ' on' : ''}" data-like="${esc(c.id)}" aria-label="${t('좋아요')}">${heart(liked)}</button><button class="btn black" data-land="${esc(c.id)}">${t('착륙하기')}</button></div>`, 'detail');
  return el;
}

/* ---------- 탭 화면 ---------- */
let tab = 'home', ticker = 0;
const bell = () => `<button class="${unread() ? 'dot' : ''}" data-noti aria-label="${t('알림')}"><svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0"/></svg></button>`;
const clock = `<button data-recent aria-label="${t('최근 본 전시')}"><svg viewBox="0 0 24 24"><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6M3.5 4v4h4M12 8v4l3 2"/></svg></button>`;
const plus = `<svg viewBox="0 0 24 24"><path d="M12 4v16M4 12h16"/></svg>`;
const lock = `<svg viewBox="0 0 24 24"><path d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V8a3 3 0 0 0-6 0z"/></svg>`;
function streakInfo() {
  const p = me() || { since: Date.now() };
  const startW = monday(p.since).getTime(), curW = Math.max(0, Math.floor((monday(Date.now()) - startW) / (7 * DAY)));
  const v = visits(), weekHas = (w) => v.find((x) => monday(x.at).getTime() === startW + w * 7 * DAY);
  let streak = 0; for (let w = curW; w >= 0 && weekHas(w); w--) streak++;
  return { startW, curW, weekHas, streak };
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
          <button class="mc-mast" data-vols><b>VALIX</b><span>MONTHLY PLANET · No.${n} · ${esc(monthDate(k).toLocaleDateString(lang, { month: 'long' }) + t('호'))} <i></i></span></button>
          <div class="icons">${clock}${bell()}</div>
        </div>
        <div class="mc-stage">
          <span class="mc-layer mc-far" data-depth="-14"></span>
          <span class="mc-orbit" data-depth="6"><i></i></span>
          <img class="mc-planet" data-depth="22" src="${planetURL(f, 768)}" alt="" draggable="false">
          <span class="mc-gloss" data-gloss></span>
        </div>
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
        <p class="mc-hint" data-sensor-hint><svg viewBox="0 0 24 24"><rect x="7" y="3" width="10" height="18" rx="2" transform="rotate(-12 12 12)"/></svg><span>${t(IS_MOBILE ? '기울이면 표지가 빛나요 · 흔들면 다음 표지' : '마우스를 움직이면 표지가 빛나요')}</span></p>
      </section>

      <section class="mag-sec" id="mag-toc">
        <p class="mag-label">${t('이번 호')} · ${esc(monthName(k))}${iss.title ? ' · ' + esc(iss.title) : ''}</p>
        <ol class="toc">${issue.map((c, i) => `<li><button data-jump="art-${esc(c.id)}"><em>${String(i + 1).padStart(2, '0')}</em><span><small>${KICK[Math.min(i, KICK.length - 1)]}</small><b>${esc(name(c))}</b><i>${esc(c.artist || '')} · ${readMin(c)}${t('분')}${linksFor(c, k).length ? ' · ' + t('영상·기사') + ' ' + linksFor(c, k).length : ''}</i></span></button></li>`).join('')}
          <li><button data-jump="mag-quote"><em>${String(issue.length + 1).padStart(2, '0')}</em><span><small>QUOTE</small><b>${t('이번 주의 문장')}</b></span></button></li>
          <li><button data-jump="mag-letter"><em>${String(issue.length + 2).padStart(2, '0')}</em><span><small>LETTER</small><b>${t('에디터의 편지')}</b></span></button></li></ol>
      </section>

      ${issue.map((c, i) => { const q = pullQuote(c), p = playOf(c); return `
      <article class="mag-art" id="art-${esc(c.id)}" style="--c:${esc(c.color || '#9db8ff')}">
        <p class="mag-label">${String(i + 1).padStart(2, '0')} · ${KICK[Math.min(i, KICK.length - 1)]}</p>
        <button class="art-visual" data-detail="${esc(c.id)}" data-tiltcard><img src="${planetURL(c, 640)}" alt="" data-depth="16"><span class="art-code">${esc(c.code)}</span><span class="art-gloss" data-gloss></span></button>
        <h2 class="art-title">${esc(name(c))}</h2>
        <p class="art-dek">${esc(c.subtitle || '')}</p>
        <p class="art-by">${esc(c.artist || '')}${c.period ? ' · ' + esc(c.period) : ''} · ${readMin(c)}${t('분')}</p>
        ${q ? `<blockquote class="art-quote">${esc(q.body)}${q.caption ? `<cite>${esc(q.caption)}</cite>` : ''}</blockquote>` : ''}
        ${c.summary ? `<p class="art-body">${esc(c.summary)}</p>` : ''}
        ${linksHTML(c, k)}
        <p class="art-play"><svg viewBox="0 0 24 24"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M4 9c-1 2-1 4 0 6M20 9c1 2 1 4 0 6"/></svg>${esc(p.how)}</p>
        <div class="art-cta"><button class="like${isLiked(c.id) ? ' on' : ''}" data-like="${esc(c.id)}" aria-label="${t('좋아요')}">${heart(isLiked(c.id))}</button><button class="btn black" data-open="${esc(c.id)}">${t('이 행성에 착륙하기')} →</button></div>
      </article>`; }).join('')}

      <section class="mag-sec mag-quote" id="mag-quote" style="--c:${esc(f.color || '#9db8ff')}">
        <p class="mag-label">${t('이번 주의 문장')}</p>
        ${quote ? `<blockquote>${esc(quote.body)}</blockquote><p class="q-src">${esc(quote.caption || name(f))}</p>` : `<blockquote>${esc(f.summary || f.subtitle || '')}</blockquote>`}
      </section>

      <section class="mag-sec mag-letter" id="mag-letter">
        <p class="mag-label">${t('에디터의 편지')}</p>
        ${iss.letter ? String(iss.letter).split(/\n+/).map((x) => `<p>${esc(x)}</p>`).join('') : `<p>${esc(t('이번 달에도 행성 {n}곳이 궤도에 올랐습니다.').replace('{n}', issue.length))}</p>
        <p>${esc(t('하루의 작은 고민에서 잠시 고개를 들어, 더 큰 것을 바라보는 시간. 한 행성에 머무는 몇 분이 생각과 마음의 폭을 조금 넓혀 주기를 바랍니다.'))}</p>`}
        <p class="sign">— VALIX ${t('편집실')}</p>
      </section>

      <section class="mag-sec mag-next">
        <p class="mag-label">${t('다음 호')} · No.${n + 1}</p>
        <p class="next-date">${esc(monthName(nextKey(k)))}</p>
        ${soon.length ? `<div class="hscroll">${soon.map((c) => `<button class="card" data-detail="${esc(c.id)}">${poster(c)}<p class="ct">${esc(name(c))}</p></button>`).join('')}</div>` : `<p class="small">${t('다음 호에서 새로운 행성을 만나요.')}</p>`}
        <button class="btn line" data-all style="margin-top:22px">${t('전체 행성')}</button>
        <p class="colophon">VALIX LAB · MONTHLY PLANET No.${n} · ${esc(monthName(k))}</p>
      </section>`;
  },
  play() {
    const open = cells.filter(isOpen).slice().reverse();
    const wk = (Date.now() - monday(Date.now())) / (7 * DAY);
    return `<header class="page-h"><h1>PLAY</h1><div class="icons">${bell()}</div></header>
      <div class="plays">${open.map((c) => { const p = playOf(c); return `
        <div class="play" style="--c:${esc(c.color || '#9db8ff')}">
          <div class="art" data-detail="${esc(c.id)}"><img class="pl" src="${planetURL(c, 640)}" alt="" draggable="false"><span class="timer" data-left="${esc(c.id)}">${left(c)}</span></div>
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
    const v = visits(), thisWeek = [...new Set(v.filter((x) => monday(x.at).getTime() === monday(Date.now()).getTime()).map((x) => x.id))];
    return `<header class="page-h"><h1>REWARDS</h1><button class="txt" data-guide>${t('참여 안내')}</button></header>
      <p class="rw-h">${t('n주차, 함께 시작해요!', curW + 1)}</p>
      <div class="shelf">${books}<div class="book sp" style="--i:6"><i><b>SPECIAL</b></i><span>Special</span></div></div>
      <button class="lockcard${streak >= 3 ? ' open' : ''}" data-report>${lock}<div>${streak >= 3 ? `<em>${t('항해 리포트가 열렸어요')}</em>` : t('3주 연속 착륙하면 <em>항해 리포트</em>가 열려요')}<small class="prog"><i style="--w:${Math.min(100, streak / 3 * 100)}%"></i></small><small>${t('연속')} ${streak}/3${t('주')}</small></div></button>
      <div class="mission"><h3>${br(t('이번 주 행성 3곳에 착륙하면\n항해 스탬프 완성!'))}</h3>
        <div class="stamps">${[0, 1, 2].map((i) => { const c = cells.find((x) => x.id === thisWeek[i]); return c ? `<i class="on" style="--d:${i * 0.15}s"><img src="${planetURL(c, 128)}" alt=""></i>` : `<i>${i + 1}</i>`; }).join('')}</div>
        <div class="note${thisWeek.length >= 3 ? ' ready' : ''}">${thisWeek.length >= 3 ? t('이번 주 스탬프 완성!') : t('행성 3곳에 착륙하면 완성돼요')}</div>
        <p>${t('스탬프와 기록은 이 기기에만 저장돼요.')}</p></div>`;
  },
  my() {
    const p = me() || { nick: wanderer(), since: Date.now() }, h = hist();
    const seen = Object.entries(h).filter(([id]) => cells.some((c) => c.id === id)).sort((a, b) => b[1].last - a[1].last);
    const total = seen.reduce((s, [, x]) => s + (x.time || 0), 0), lk = likes().map((id) => cells.find((c) => c.id === id)).filter(Boolean);
    const { streak } = streakInfo();
    const avatar = `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="30" cy="25" r="15"/><rect x="21" y="19" width="18" height="12" rx="6" fill="#1c2240" stroke="none"/><path d="M24 22c1.5-1 3-1 4 0" stroke="#ffd68c"/><path d="M10 58c2-9 10-14 20-14s18 5 20 14"/></svg>`;
    return `<header class="page-h"><h1>MY</h1><div class="icons">${clock}</div></header>
      <div class="me"><span class="avatar">${avatar}</span><div><b>${esc(p.nick)}</b><p class="mesub">${new Date(p.since).toLocaleDateString(lang)} ${t('탑승')} · ${seen.length}${t('곳 착륙')}</p><button data-rename>${t('이름 바꾸기')} ›</button></div></div>
      <section class="sec"><div class="sec-h"><h2 class="h20">${t('나의 기록')}</h2></div>
        <button class="lockcard v${streak >= 3 ? ' open' : ''}" data-report style="margin:18px 0 0">${lock}<div><small>${t('항해 리포트')}</small>${streak >= 3 ? `<em>${t('항해 리포트가 열렸어요')}</em>` : t('3주 연속 착륙하면 <em>항해 리포트</em>가 열려요')}</div></button>
        <div class="stat2"><div>${t('다녀온 행성')}<b>${seen.length || '-'}</b></div><div>${t('머문 시간')}<b>${total ? fmtTime(total) : '-'}</b></div></div></section>
      <section class="sec"><div class="sec-h"><h2 class="h20">${t('좋아요한 행성')}</h2></div>
        ${lk.length ? `<div class="hscroll mini">${lk.map((c) => `<button data-detail="${esc(c.id)}"><img src="${planetURL(c, 192)}" alt=""><span>${esc(name(c))}</span></button>`).join('')}</div>` : `<p class="empty">${t('아직 좋아요한 행성이 없어요.')}</p>`}</section>
      <section class="sec"><div class="sec-h"><h2 class="h20">${t('최근 본 전시')}</h2></div>
        ${seen.length ? `<div class="list">${seen.map(([id, x]) => { const c = cells.find((y) => y.id === id); return `<button class="row" data-detail="${esc(id)}">${poster(c)}<div><b>${esc(name(c))}</b><span>${new Date(x.last).toLocaleDateString(lang)}</span></div><span class="v">${fmtTime(x.time || 0)}</span></button>`; }).join('')}</div>` : `<p class="empty">${t('아직 다녀온 행성이 없어요.')}</p>`}</section>
      <section class="sec"><div class="sec-h"><h2 class="h20">${t('언어')}</h2></div><div class="chips">${LANGS.map((l) => `<button data-lang="${l.id}" class="${l.id === lang ? 'on' : ''}">${l.name}</button>`).join('')}</div></section>
      <section class="sec"><div class="sec-h"><h2 class="h20">${t('체험 권한')}</h2></div><p class="small">${t('기울기·흔들기·마이크·카메라·위치는 전시 안에서 체험할 때만 쓰고, 기기 밖으로 저장하거나 보내지 않아요.')}</p></section>
      <section class="sec list"><button class="row" data-clear><b>${t('관람 기록 지우기')}</b></button><div class="row"><b>${t('버전')}</b><span class="v">VALIX ${VERSION}</span></div></section>`;
  },
};

const TAB_I = { home: 0, play: 1, reward: 2, my: 3 };
function go(next, keepScroll) {
  const prev = tab; tab = next; view.hidden = false; tabsEl.hidden = false;
  view.className = 'vx-view';
  view.innerHTML = screens[tab]();
  // 순서대로 떠오르는 등장 효과
  let i = 0; view.querySelectorAll('.mc-top, .mc-lines, .mc-foot, .hero, .page-h, .rw-h, .sec-h, .sec-sub, .card, .gcard, .play, .shelf, .lockcard, .mission, .me, .stat2, .row, .chips, .about, .hscroll.mini, .empty').forEach((el) => { el.classList.add('rv'); el.style.animationDelay = `${Math.min(i++, 14) * 45}ms`; });
  if (tab === 'home') { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 }); view.querySelectorAll('.mag-art > *, .mag-sec > *').forEach((el) => { el.classList.add('rs'); io.observe(el); }); }
  tabsEl.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  tabsEl.querySelector('.ind').style.transform = `translateX(${TAB_I[tab] * 100}%)`;
  if (!keepScroll || prev !== next) scrollTo(0, 0);
  clearInterval(ticker);
  if (tab === 'play') ticker = setInterval(() => view.querySelectorAll('[data-left]').forEach((el) => { const c = cells.find((x) => x.id === el.dataset.left); el.textContent = left(c); el.classList.toggle('urgent', Math.floor((weekEnd() - Date.now()) / DAY) < 1); }), 1000);
}
// 홈 큰 행성 패럴랙스
addEventListener('scroll', () => { const p = view.querySelector('[data-parallax]'); if (p) p.style.transform = `translateY(${scrollY * 0.35}px) scale(${1 - Math.min(scrollY, 400) / 2000})`; }, { passive: true });

tabsEl.addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { if (b.dataset.tab === 'home') { viewVol = 0; viewMonth = ''; coverIdx = 0; } go(b.dataset.tab); } else if (e.target.closest('[data-orb]')) openExhibit(featured()); });

// 화면·시트 공통 버튼
function onAction(e) {
  const q = (s) => e.target.closest(s), byId = (id) => cells.find((x) => x.id === id);
  let b;
  if ((b = q('[data-land]'))) { const c = byId(b.dataset.land); sheet.close(); setTimeout(() => openExhibit(c), 200); return true; }
  if ((b = q('[data-open]'))) { const c = byId(b.dataset.open); if (c && isOpen(c)) { if (sheet.isOpen) sheet.close(); openExhibit(c); } return true; }
  if ((b = q('[data-detail]'))) { const c = byId(b.dataset.detail); if (c) detailSheet(c); return true; }
  if ((b = q('[data-like]'))) { const on = toggleLike(b.dataset.like); b.classList.toggle('on', on); b.innerHTML = heart(on); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); if (tab === 'my') go('my', true); return true; }
  if ((b = q('[data-jump]'))) { const el = document.getElementById(b.dataset.jump); if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY - 20, behavior: 'smooth' }); return true; }
  if (q('[data-noti]')) { notiSheet(); return true; }
  if (q('[data-read]')) { store.set('valix-noti', vol()); sheet.close(); go(tab, true); return true; }
  if (q('[data-recent]')) {
    const seen = Object.entries(hist()).filter(([id]) => byId(id)).sort((a, b2) => b2[1].last - a[1].last);
    sheet.open(`<div class="sh-h"><h3>${t('최근 본 전시')}</h3></div>${seen.length ? `<div class="noti">${seen.map(([id, x]) => { const c = byId(id); return `<button class="nrow" data-detail="${esc(id)}"><img src="${planetURL(c, 192)}" alt=""><span><b>${esc(name(c))}</b><small>${fmtTime(x.time || 0)} · ${new Date(x.last).toLocaleDateString(lang)}</small></span></button>`; }).join('')}</div>` : `<p class="empty">${t('아직 다녀온 행성이 없어요.')}</p>`}`);
    return true;
  }
  if (q('[data-vols]')) { issueSheet(); return true; }
  if ((b = q('[data-month]'))) { viewMonth = b.dataset.month === thisMonth() ? '' : b.dataset.month; coverIdx = 0; sheet.close(); go('home'); return true; }
  if ((b = q('[data-yt]'))) {
    const id = b.dataset.yt;
    sheet.open(`<div class="yt-player"><iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0" title="${esc(b.dataset.ytt)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div><p class="yt-title">${esc(b.dataset.ytt)}</p><div style="padding:16px 24px 0"><a class="btn line" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">${t('YouTube에서 보기')} ↗</a></div>`, 'video');
    return true;
  }
  if ((b = q('[data-vol]'))) { const n = +b.dataset.vol; viewVol = n === vol() ? 0 : n; sheet.close(); if (viewVol) toast(t('지난 호는 이번 주와 같은 행성으로 보여줘요. (프로토타입)')); go('home'); return true; }
  if (q('[data-all]')) {
    sheet.open(`<div class="sh-h"><h3>${t('전체 행성')}</h3></div><div class="grid2">${cells.map((c) => `<button class="gcard" data-detail="${esc(c.id)}">${poster(c)}<p class="ct">${esc(name(c))}</p><p class="ga">${esc(c.artist || '')}</p></button>`).join('')}</div>`);
    return true;
  }
  if ((b = q('[data-how]'))) { detailSheet(byId(b.dataset.how)); setTimeout(() => { const h = sheet.el.querySelector('.dt-how'); if (h) sheet.el.scrollTo({ top: h.offsetTop - 40, behavior: 'smooth' }); }, 380); return true; }
  if (q('[data-guide]')) {
    sheet.open(`<div class="sh-h"><h3>${t('참여 방법')}</h3></div><ol class="guide">${['매주 월요일 새 Vol.이 열려요.', '그 주에 행성 한 곳 이상 착륙하면 그 주의 책이 채워져요.', '한 주에 서로 다른 행성 3곳에 착륙하면 스탬프가 완성돼요.', '3주 연속으로 책을 채우면 항해 리포트가 열려요.'].map((s, i) => `<li><em>${i + 1}</em>${t(s)}</li>`).join('')}</ol><p class="small" style="padding:0 24px">${t('스탬프와 기록은 이 기기에만 저장돼요.')}</p><div style="padding:20px 24px 0"><button class="btn line" data-close>${t('닫기')}</button></div>`);
    return true;
  }
  if (q('[data-report]')) {
    const { streak } = streakInfo(), h = Object.entries(hist()).filter(([id]) => byId(id)).sort((a, b2) => (b2[1].time || 0) - (a[1].time || 0)), v = visits();
    if (streak < 3) { toast(`${t('연속')} ${streak}/3${t('주')} — ${t('3주 연속으로 책을 채우면 항해 리포트가 열려요.')}`); return true; }
    const top = h[0] && byId(h[0][0]);
    sheet.open(`<div class="sh-h"><h3>${t('항해 리포트')}</h3></div><div class="report">${top ? `<img src="${planetURL(top, 384)}" alt="">` : ''}<p>${t('가장 오래 머문 행성')}<b>${top ? esc(name(top)) : '-'}</b></p><p>${t('처음 착륙한 날')}<b>${v[0] ? new Date(v[0].at).toLocaleDateString(lang) : '-'}</b></p><p>${t('다녀온 행성')}<b>${h.length}</b></p></div>`);
    return true;
  }
  if (q('[data-rename]')) { showOB('nick'); return true; }
  if ((b = q('[data-lang]'))) { if (b.dataset.lang !== lang) { try { localStorage.setItem('xpace-lang', b.dataset.lang); } catch (er) {} location.reload(); } return true; }
  if (q('[data-clear]')) { store.set('valix-history', {}); store.set('valix-visits', []); toast(t('기록을 지웠어요.')); go(tab, true); return true; }
  return false;
}
view.addEventListener('click', onAction);
sheet.el.addEventListener('click', onAction);

/* ---------- 전시 보기 ---------- */
const viewer = $('#viewer'), frame = $('#frame');
let current = null, enteredAt = 0;
function openExhibit(c) {
  if (!c) return;
  current = c; enteredAt = Date.now();
  const h = hist(); h[c.id] = { ...(h[c.id] || {}), last: Date.now(), visits: ((h[c.id] && h[c.id].visits) || 0) + 1 }; store.set('valix-history', h);
  const v = visits(); v.push({ id: c.id, at: Date.now() }); store.set('valix-visits', v.slice(-500));
  $('#toast').hidden = true; landing.start(c); viewer.hidden = false; frame.src = 'about:blank'; sky.stop();
  requestAnimationFrame(() => { frame.src = href(c); });
  history.pushState({ viewer: true }, '');
}
function closeExhibit(fromPop) {
  if (viewer.hidden) return;
  if (current) { const h = hist(); const r = h[current.id] || {}; r.time = (r.time || 0) + Math.round((Date.now() - enteredAt) / 1000); r.last = Date.now(); h[current.id] = r; store.set('valix-history', h); }
  landing.stop(); viewer.hidden = true; frame.src = 'about:blank'; current = null; sky.start();
  if (!fromPop && history.state && history.state.viewer) history.back();
  go(tab, true);
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
if (CapApp) CapApp.addListener('backButton', () => { if (sheet.isOpen) sheet.close(); else if (!viewer.hidden) closeExhibit(); else if (!ob.hidden) showOB('login'); else if (tab !== 'home') go('home'); else CapApp.exitApp(); });


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
const monthName = (k) => monthDate(k).toLocaleDateString(lang, { year: 'numeric', month: 'long' }) + t('호');
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
  return (yt.length ? `<div class="art-links"><h4>${t('함께 보기')} <span>${yt.length}</span></h4><div class="yt-row">${yt.map((l) => { const id = ytId(l.url); return `<button class="yt" data-yt="${id}" data-ytt="${esc(l.title)}"><span class="yt-th"><img loading="lazy" src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt=""><i></i></span><b>${esc(l.title)}</b><small>${esc(l.source || '')}</small></button>`; }).join('')}</div></div>` : '')
    + (ar.length ? `<div class="art-links"><h4>${t('함께 읽기')} <span>${ar.length}</span></h4>${ar.map((l) => `<a class="rd" href="${esc(l.url)}" target="_blank" rel="noopener"><span><b>${esc(l.title)}</b><small>${esc(l.source || '')}</small></span><i>↗</i></a>`).join('')}</div>` : '');
}
function issueSheet() {
  const keys = []; for (let k = thisMonth(); issueNo(k) >= 1; k = prevKey(k)) keys.push(k);
  const cur = viewMonth || thisMonth();
  sheet.open(`<div class="sh-h"><h3>${t('지난 호')}</h3></div><div class="vols">${keys.map((k) => { const P = picksFor(k), f = P[0];
    return `<button class="vrow${cur === k ? ' on' : ''}" data-month="${k}">${f ? `<img src="${planetURL(f, 192)}" alt="">` : '<span class="ph"></span>'}<span><b>No.${issueNo(k)} · ${esc(monthName(k))}</b><small>${ISSUES[k] && ISSUES[k].title ? esc(ISSUES[k].title) + ' · ' : ''}${P.map(name).join(' · ') || '—'}</small></span>${k === thisMonth() ? `<em>${t('진행 중')}</em>` : ''}</button>`; }).join('')}</div>`);
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
addEventListener('pointermove', (e) => { if (!IS_MOBILE) { tilt.px = (e.clientX / innerWidth - 0.5) * 2; tilt.py = (e.clientY / innerHeight - 0.5) * 2; } }, { passive: true });
// iPhone은 탭 안에서만 센서 권한을 물을 수 있음 → 첫 탭에서 켬
addEventListener('click', function once() { if (!IS_MOBILE) return; removeEventListener('click', once, true); sensor.enable().then((ok) => { if (ok) document.body.classList.add('sensing'); }); }, true);
// 흔들면 다음 표지 (홈 표지가 보일 때)
sensor.onShake(() => {
  if (tab !== 'home' || !viewer.hidden || sheet.isOpen) return;
  const cov = view.querySelector('.mag-cover'); if (!cov || cov.getBoundingClientRect().bottom < innerHeight * 0.4) return;
  const n = picksFor(viewMonth || thisMonth()).length; if (n < 2) return;
  coverIdx = (coverIdx + 1) % n; sensor.vibrate([15, 40, 25]);
  cov.classList.add('flip-out');
  setTimeout(() => { go('home', true); const c2 = view.querySelector('.mag-cover'); c2 && c2.classList.add('flip-in'); }, 260);
});
(function tiltLoop() {
  const on = IS_MOBILE && sensor.on;
  const tx = on ? sensor.tiltX : tilt.px, ty = on ? sensor.tiltY : tilt.py;
  tilt.x += (tx - tilt.x) * 0.12; tilt.y += (ty - tilt.y) * 0.12;
  if (tab === 'home' && !view.hidden && viewer.hidden) {
    const H = innerHeight;
    view.querySelectorAll('[data-tiltzone], [data-tiltcard]').forEach((z) => {
      const r = z.getBoundingClientRect(); if (r.bottom < 0 || r.top > H) return;
      const k = z.hasAttribute('data-tiltcard') ? 0.6 : 1;
      z.querySelectorAll('[data-depth]').forEach((el) => { const d = +el.dataset.depth * k; el.style.translate = `${(tilt.x * d).toFixed(1)}px ${(tilt.y * d).toFixed(1)}px`; });
      const gl = z.querySelector('[data-gloss]'); if (gl) { gl.style.setProperty('--gx', `${50 + tilt.x * 45}%`); gl.style.setProperty('--gy', `${40 + tilt.y * 40}%`); }
      if (z.hasAttribute('data-tiltcard')) z.style.transform = `perspective(900px) rotateY(${(tilt.x * 7).toFixed(2)}deg) rotateX(${(-tilt.y * 6).toFixed(2)}deg)`;
    });
  }
  requestAnimationFrame(tiltLoop);
})();

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
  function surface(cx, cy, R) {
    const pc = planetCanvas(c, 1024), ratio = hasRing(c) ? 0.30 : 0.38, w = (R / ratio);
    x.drawImage(pc, cx - w / 2, cy - w / 2, w, w);
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
    surface(cx, cy, R);
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
  try { const d = await loadData(); cells = d.cells; blocks = d.blocks || []; } catch (e) { cells = []; }
  try { ISSUES = await (await fetch('data/issues.json', { cache: 'no-cache' })).json(); } catch (e) { ISSUES = {}; }
  await new Promise((r) => setTimeout(r, Math.max(0, 1200 - (Date.now() - t0)))); // 시작 화면 최소 1.2초
  $('#splash').classList.add('out'); setTimeout(() => $('#splash').remove(), 600);
  if (!cells.length) { view.hidden = false; view.innerHTML = `<p class="empty" style="padding-top:40vh">${t('전시를 불러오지 못했어요.')}<br><br><button class="btn line" style="width:auto;padding:0 24px;margin:0 auto" onclick="location.reload()">${t('다시 시도')}</button></p>`; return; }
  if (!store.get('valix-onboarded', false)) showOB('intro0'); else go('home');
  const m = location.hash.match(/open=([\w-]+)/); // #open=전시id → 바로 입장 (푸시·공유 링크)
  if (m) { const c = cells.find((x) => x.id === m[1]); if (c && isOpen(c)) openExhibit(c); }
})();
