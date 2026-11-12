// NEBULA 앱 — 컬렉트(온라인 아트 판매). Artsy처럼: 작품 둘러보기·거르기·정렬, 작품 상세, 작가 팔로우, 작품 저장, 구매 문의·가격 제안.
// 지금은 '문의' 방식만(결제 없음). 실물 작품은 애플·구글 인앱결제 대상이 아니라 나중에 일반 결제(토스페이먼츠 등)를 붙일 수 있음.
// 작품 데이터: cells 시트의 'artworks' 탭(work_id 칸이 있어야 함) → 없으면 data/artworks.json. 칸 설명은 docs/shop/README.md
// 저장·팔로우·문의 기록은 이 기기(localStorage nebula-shop-*)에만.
import { CONFIG } from './config.js?v=21';
import { fetchSheet, imageUrl, esc } from './data.js?v=26';
import { lang } from './i18n.js?v=5';

const SH = CONFIG.shop || {};
const W = {
  ko: { tab: '컬렉트', kicker: 'NEBULA · COLLECT', lead: '전시에서 만난 작가의 작품을 소장하세요.', sample: '예시 작품이에요 — 화면 시험용 가상의 작가·작품이며 실제로 판매하지 않아요.', featured: '이번 주 추천 작품', artists: '작가', works: '작품', all: '전체', painting: '회화', 'work-on-paper': '종이', sculpture: '조각', installation: '설치', photography: '사진', print: '판화·에디션', digital: '디지털', any: '모든 가격', p1: '100만 원 이하', p2: '100만~500만 원', p3: '500만 원 이상', req: '가격 문의', sNew: '최신순', sLow: '낮은 가격순', sHigh: '높은 가격순', avail: '구매 가능만', count: '작품 {n}점', none: '조건에 맞는 작품이 없어요.', reset: '거르기 초기화', available: '구매 가능', reserved: '예약 중', sold: '판매 완료', follow: '팔로우', following: '팔로잉', save: '저장', saved: '저장됨', inquire: '구매 문의', offer: '가격 제안', exhibit: '관련 전시 보기', size: '크기', material: '재료', edition: '에디션', editionOf: '총 {n}점 중 {l}점 남음', year: '제작', cert: '작품 보증서 포함', frame: '액자 포함', noFrame: '액자 없음', ships: '{p}에서 발송', priceNote: '배송비·세금·통관은 문의 후 따로 안내해요. 결제는 아직 열리지 않았어요.', worksBy: '{a}의 작품', born: '{y}년생', ask: '무엇이 궁금하세요?', qPrice: '가격과 구매 방법', qShip: '배송·설치', qCond: '상태 사진·영상', qSimilar: '비슷한 작품', name: '이름', email: '이메일', msg: '메시지', offerAmt: '제안 가격', send: '문의 보내기', sendOffer: '제안 보내기', mailNote: '보내기를 누르면 메일 앱이 열려요. 답장은 입력한 이메일로 와요.', soon: '문의 창구를 준비 중이에요. 곧 열려요.', sent: '문의를 메일로 옮겼어요.', need: '이름과 이메일을 적어 주세요.', badEmail: '이메일 주소를 확인해 주세요.', sampleNo: '예시 작품이라 문의할 수 없어요.', soldNo: '판매가 끝난 작품이에요.', my: '나의 컬렉트', mySaved: '저장한 작품', myFollow: '팔로우한 작가', myAsk: '문의한 작품', empty0: '아직 없어요.', guide: '컬렉트 안내', g1: '작품을 저장하고 작가를 팔로우해 두세요.', g2: '구매 문의나 가격 제안을 보내면 담당자가 가격·배송·결제 방법을 안내해요.', g3: '모든 작품에는 작품 보증서가 함께 가요.', g4: '반품·환불 기준은 문의 때 작품마다 안내해요.', close: '닫기' },
  en: { tab: 'Collect', kicker: 'NEBULA · COLLECT', lead: 'Collect work by the artists you meet in our exhibitions.', sample: 'Sample works — fictional artists and works for testing the screen. Not for sale.', featured: 'Featured this week', artists: 'Artists', works: 'Artworks', all: 'All', painting: 'Painting', 'work-on-paper': 'Paper', sculpture: 'Sculpture', installation: 'Installation', photography: 'Photography', print: 'Prints & editions', digital: 'Digital', any: 'Any price', p1: 'Under $750', p2: '$750–3,750', p3: 'Over $3,750', req: 'Price on request', sNew: 'Newest', sLow: 'Price: low to high', sHigh: 'Price: high to low', avail: 'Available only', count: '{n} works', none: 'No works match these filters.', reset: 'Clear filters', available: 'Available', reserved: 'On hold', sold: 'Sold', follow: 'Follow', following: 'Following', save: 'Save', saved: 'Saved', inquire: 'Contact to buy', offer: 'Make an offer', exhibit: 'See the exhibition', size: 'Size', material: 'Materials', edition: 'Edition', editionOf: '{l} of {n} left', year: 'Year', cert: 'Certificate of authenticity', frame: 'Framed', noFrame: 'Unframed', ships: 'Ships from {p}', priceNote: 'Shipping, taxes and customs are quoted after you inquire. Checkout is not open yet.', worksBy: 'Works by {a}', born: 'b. {y}', ask: 'What would you like to know?', qPrice: 'Price and how to buy', qShip: 'Shipping & installation', qCond: 'Condition photos/video', qSimilar: 'Similar works', name: 'Name', email: 'Email', msg: 'Message', offerAmt: 'Your offer', send: 'Send inquiry', sendOffer: 'Send offer', mailNote: 'Sending opens your mail app. Replies go to the email you enter.', soon: 'Inquiries open soon.', sent: 'Your inquiry was moved to your mail app.', need: 'Please enter your name and email.', badEmail: 'Please check your email address.', sampleNo: 'This is a sample work and cannot be inquired about.', soldNo: 'This work has been sold.', my: 'My collect', mySaved: 'Saved works', myFollow: 'Followed artists', myAsk: 'Inquired works', empty0: 'Nothing yet.', guide: 'About Collect', g1: 'Save works and follow artists.', g2: 'Send an inquiry or offer and we’ll reply with price, shipping and payment details.', g3: 'Every work comes with a certificate of authenticity.', g4: 'Return and refund terms are given per work when you inquire.', close: 'Close' },
  zh: { tab: '收藏', kicker: 'NEBULA · COLLECT', lead: '收藏你在展览中遇见的艺术家的作品。', sample: '示例作品——用于测试界面的虚构艺术家与作品，并不出售。', featured: '本周推荐作品', artists: '艺术家', works: '作品', all: '全部', painting: '绘画', 'work-on-paper': '纸本', sculpture: '雕塑', installation: '装置', photography: '摄影', print: '版画·限量', digital: '数字', any: '全部价格', p1: '100万韩元以下', p2: '100万–500万韩元', p3: '500万韩元以上', req: '价格面议', sNew: '最新', sLow: '价格从低到高', sHigh: '价格从高到低', avail: '仅显示可购买', count: '{n} 件作品', none: '没有符合条件的作品。', reset: '清除筛选', available: '可购买', reserved: '已预留', sold: '已售出', follow: '关注', following: '已关注', save: '收藏', saved: '已收藏', inquire: '购买咨询', offer: '出价', exhibit: '查看相关展览', size: '尺寸', material: '材料', edition: '限量', editionOf: '共 {n} 件，剩余 {l} 件', year: '年份', cert: '附作品证书', frame: '含画框', noFrame: '不含画框', ships: '从{p}发货', priceNote: '运费、税费与清关将在咨询后另行告知。暂未开放付款。', worksBy: '{a}的作品', born: '{y}年生', ask: '想了解什么？', qPrice: '价格与购买方式', qShip: '运输·安装', qCond: '品相照片·视频', qSimilar: '类似作品', name: '姓名', email: '邮箱', msg: '留言', offerAmt: '出价金额', send: '发送咨询', sendOffer: '发送出价', mailNote: '点击发送将打开邮件应用，回复会发到你填写的邮箱。', soon: '咨询渠道即将开放。', sent: '已将咨询转到邮件应用。', need: '请填写姓名和邮箱。', badEmail: '请检查邮箱地址。', sampleNo: '示例作品无法咨询。', soldNo: '该作品已售出。', my: '我的收藏', mySaved: '收藏的作品', myFollow: '关注的艺术家', myAsk: '咨询过的作品', empty0: '暂无。', guide: '收藏说明', g1: '收藏作品、关注艺术家。', g2: '发送咨询或出价后，我们会告知价格、运输与付款方式。', g3: '每件作品都附有作品证书。', g4: '退货与退款标准将在咨询时按作品说明。', close: '关闭' },
  ja: { tab: 'コレクト', kicker: 'NEBULA · COLLECT', lead: '展示で出会った作家の作品をコレクションしましょう。', sample: 'サンプル作品です — 画面テスト用の架空の作家・作品で、実際には販売していません。', featured: '今週のおすすめ作品', artists: '作家', works: '作品', all: 'すべて', painting: '絵画', 'work-on-paper': '紙', sculpture: '彫刻', installation: 'インスタレーション', photography: '写真', print: '版画・エディション', digital: 'デジタル', any: 'すべての価格', p1: '100万ウォン以下', p2: '100万〜500万ウォン', p3: '500万ウォン以上', req: '価格はお問い合わせ', sNew: '新着順', sLow: '価格の安い順', sHigh: '価格の高い順', avail: '購入可能のみ', count: '作品 {n}点', none: '条件に合う作品がありません。', reset: '絞り込みをリセット', available: '購入可能', reserved: '商談中', sold: '売約済み', follow: 'フォロー', following: 'フォロー中', save: '保存', saved: '保存済み', inquire: '購入のお問い合わせ', offer: '価格を提案', exhibit: '関連する展示を見る', size: 'サイズ', material: '素材', edition: 'エディション', editionOf: '全{n}点中 残り{l}点', year: '制作年', cert: '作品証明書つき', frame: '額装あり', noFrame: '額装なし', ships: '{p}から発送', priceNote: '送料・税金・通関はお問い合わせ後にご案内します。決済はまだ始まっていません。', worksBy: '{a}の作品', born: '{y}年生まれ', ask: '何を知りたいですか？', qPrice: '価格と購入方法', qShip: '配送・設置', qCond: '状態の写真・動画', qSimilar: '似た作品', name: 'お名前', email: 'メール', msg: 'メッセージ', offerAmt: '提案価格', send: '問い合わせを送る', sendOffer: '提案を送る', mailNote: '送るとメールアプリが開きます。返信は入力したメールに届きます。', soon: 'お問い合わせ窓口を準備中です。', sent: 'お問い合わせをメールアプリに移しました。', need: 'お名前とメールを入力してください。', badEmail: 'メールアドレスを確認してください。', sampleNo: 'サンプル作品のためお問い合わせできません。', soldNo: 'この作品は売約済みです。', my: 'マイコレクト', mySaved: '保存した作品', myFollow: 'フォローした作家', myAsk: '問い合わせた作品', empty0: 'まだありません。', guide: 'コレクトについて', g1: '作品を保存し、作家をフォローしておきましょう。', g2: 'お問い合わせや価格提案を送ると、価格・配送・決済方法をご案内します。', g3: 'すべての作品に作品証明書がつきます。', g4: '返品・返金の条件は作品ごとにお問い合わせ時にご案内します。', close: '閉じる' },
};
export const st = (k, o) => { let s = (W[lang] || W.en)[k] ?? W.ko[k] ?? k; if (o) s = s.replace(/\{(\w+)\}/g, (_, x) => o[x] ?? ''); return s; };
const L = (o, k) => (lang !== 'ko' && o[`${k}_${lang}`]) || (lang !== 'ko' && o[`${k}_en`]) || o[k] || '';
const MEDIA = ['painting', 'work-on-paper', 'sculpture', 'installation', 'photography', 'print', 'digital'];
const KRW = lang === 'ko';

// ---------- 기기 저장 ----------
const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const SAVED = 'nebula-shop-saved', FOLLOW = 'nebula-shop-follow', ASKED = 'nebula-shop-asked';
const toggle = (k, id) => { const a = get(k, []); const i = a.indexOf(id); if (i >= 0) a.splice(i, 1); else a.unshift(id); set(k, a); return i < 0; };

// ---------- 데이터 ----------
let works = [], artists = [], ready = null;
const num = (v) => { const n = Number(String(v ?? '').replace(/[^\d.]/g, '')); return Number.isFinite(n) && n > 0 ? n : 0; };
const yes = (v) => v === true || /^(1|true|yes|y|o)$/i.test(String(v ?? '').trim());
function norm(w) {
  return { ...w, id: String(w.work_id), year: num(w.year) || '', w: num(w.w), h: num(w.h), d: num(w.d), price_krw: num(w.price_krw), price_usd: num(w.price_usd), price_request: yes(w.price_request) || !(num(w.price_krw) || num(w.price_usd)),
    status: ['available', 'reserved', 'sold'].includes(w.status) ? w.status : 'available', certificate: yes(w.certificate), frame: w.frame === '' || w.frame == null ? null : yes(w.frame), offer: yes(w.offer), featured: yes(w.featured), sample: yes(w.sample),
    edition_left: num(w.edition_left), seed: num(w.seed) || [...String(w.work_id)].reduce((a, c) => a + c.charCodeAt(0), 0), medium: MEDIA.includes(w.medium) ? w.medium : 'painting' };
}
export function loadShop() {
  if (ready) return ready;
  ready = (async () => {
    let j = {};
    try { j = await (await fetch('data/artworks.json?v=1', { cache: 'no-cache' })).json(); } catch (e) {}
    let ws = j.works || [], as = j.artists || [];
    if (SH.sheetTab) {
      try { // 시트에 artworks 탭이 없으면 구글이 첫 탭을 돌려주므로 work_id 칸으로 확인
        const rows = await fetchSheet(CONFIG.cellsSheetId, SH.sheetTab);
        if (rows.length && 'work_id' in rows[0]) { ws = rows.filter((r) => r.work_id); }
        const ar = await fetchSheet(CONFIG.cellsSheetId, 'artists').catch(() => []);
        if (ar.length && 'artist_id' in ar[0]) as = ar.filter((r) => r.artist_id).map((r) => ({ ...r, id: r.artist_id }));
      } catch (e) {}
    }
    works = ws.map(norm).filter((w) => SH.showSamples || !w.sample);
    artists = as.map((a) => ({ ...a, sample: yes(a.sample) })).filter((a) => works.some((w) => w.artist === a.id));
    return { works, artists };
  })();
  return ready;
}
export const shopReady = () => works.length > 0;
const artistOf = (w) => artists.find((a) => a.id === w.artist) || { id: w.artist, name: w.artist };

// ---------- 표시 도우미 ----------
const money = (w) => w.price_request ? st('req') : KRW && w.price_krw ? `${w.price_krw.toLocaleString('ko-KR')}원` : w.price_usd ? `$${w.price_usd.toLocaleString('en-US')}` : `${w.price_krw.toLocaleString('ko-KR')}원`;
const priceVal = (w) => w.price_request ? Infinity : (w.price_krw || w.price_usd * 1350);
const sizeTxt = (w) => { if (!w.w || !w.h) return ''; const cm = [w.w, w.h, w.d].filter(Boolean); return `${cm.join(' × ')} cm · ${cm.map((x) => (x / 2.54).toFixed(1)).join(' × ')} in`; };
const statusTag = (w) => w.status === 'available' ? '' : `<span class="sp-tag ${w.status}">${st(w.status)}</span>`;
// 이미지가 없는 예시 작품은 작품마다 다른 추상 그림(SVG)을 만들어 씀
function sampleArt(seed, medium) {
  let x = seed * 9301 + 49297; const r = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  const hue = Math.floor(r() * 360), h2 = (hue + 40 + r() * 120) % 360;
  const bg = `hsl(${hue} 30% ${12 + r() * 10}%)`, c1 = `hsl(${hue} 70% ${55 + r() * 15}%)`, c2 = `hsl(${h2} 60% ${45 + r() * 20}%)`;
  let g = '';
  if (medium === 'sculpture' || medium === 'installation') { for (let i = 0; i < 5; i++) g += `<ellipse cx="200" cy="${230 - i * 6}" rx="${150 - i * 24}" ry="${44 - i * 6}" fill="none" stroke="${i % 2 ? c1 : c2}" stroke-width="${2 + r() * 3}" opacity=".8" transform="rotate(${-20 + r() * 40} 200 230)"/>`; g += `<circle cx="200" cy="200" r="${34 + r() * 20}" fill="${c1}" opacity=".9"/>`; }
  else if (medium === 'photography') { g = `<rect width="400" height="500" fill="url(#gr)"/><circle cx="${120 + r() * 160}" cy="${150 + r() * 120}" r="${60 + r() * 60}" fill="#fff" opacity=".22" filter="url(#bl)"/>`; }
  else if (medium === 'print') { for (let i = 0; i < 9; i++) g += `<rect x="${40 + (i % 3) * 110}" y="${60 + Math.floor(i / 3) * 130}" width="96" height="112" fill="${i % 2 ? c1 : c2}" opacity="${0.35 + r() * 0.6}"/>`; }
  else { for (let i = 0; i < 7; i++) g += `<path d="M${-20} ${80 + i * 60 + r() * 30} Q 200 ${r() * 500} 420 ${60 + i * 60 + r() * 40}" stroke="${i % 2 ? c1 : c2}" stroke-width="${10 + r() * 40}" fill="none" opacity="${0.25 + r() * 0.5}" stroke-linecap="round" filter="url(#bl2)"/>`; }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="gr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c2}"/><stop offset="1" stop-color="${bg}"/></linearGradient><filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter><filter id="bl2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter></defs><rect width="400" height="500" fill="${bg}"/>${g}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
const imgOf = (w, size = 900) => w.image ? imageUrl(w.image, size) : sampleArt(w.seed, w.medium);
const artImg = (w, cls = '') => `<img class="sp-img ${cls}" src="${esc(imgOf(w))}" alt="${esc(L(w, 'title'))}" loading="lazy" decoding="async" draggable="false">`;
const heart = (on) => `<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"${on ? ' fill="currentColor"' : ''}/></svg>`;
function card(w, small) {
  const a = artistOf(w), on = get(SAVED, []).includes(w.id);
  return `<div class="sp-card${small ? ' sm' : ''}"><button class="sp-pic" data-work="${esc(w.id)}" aria-label="${esc(L(w, 'title'))}">${artImg(w)}${w.sample ? '<span class="sp-sample">SAMPLE</span>' : ''}</button>
    <button class="sp-save${on ? ' on' : ''}" data-wsave="${esc(w.id)}" aria-pressed="${on}" aria-label="${st(on ? 'saved' : 'save')}">${heart(on)}</button>
    <button class="sp-meta" data-work="${esc(w.id)}"><b>${esc(L(a, 'name'))}</b><i>${esc(L(w, 'title'))}${w.year ? `, ${w.year}` : ''}</i><span>${statusTag(w)}${w.status === 'sold' ? '' : esc(money(w))}</span></button></div>`;
}

// ---------- 컬렉트 화면 ----------
const F = { medium: 'all', price: 'any', sort: 'new', avail: false };
function filtered() {
  let ws = works.filter((w) => (F.medium === 'all' || w.medium === F.medium) && (!F.avail || w.status === 'available'));
  if (F.price !== 'any') ws = ws.filter((w) => { const p = priceVal(w); return F.price === 'req' ? w.price_request : F.price === 'p1' ? p <= 1e6 : F.price === 'p2' ? p > 1e6 && p <= 5e6 : p > 5e6 && p !== Infinity; });
  const by = { new: (a, b) => (b.year || 0) - (a.year || 0), low: (a, b) => priceVal(a) - priceVal(b), high: (a, b) => (priceVal(b) === Infinity ? -1 : priceVal(b)) - (priceVal(a) === Infinity ? -1 : priceVal(a)) }[F.sort];
  return ws.slice().sort((a, b) => (a.status === 'sold') - (b.status === 'sold') || by(a, b));
}
function gridHTML() {
  const ws = filtered();
  return `<p class="sp-count">${st('count', { n: ws.length })}</p>${ws.length ? `<div class="sp-grid">${ws.map((w) => card(w)).join('')}</div>` : `<div class="empty">${st('none')}<br><button class="btn line sp-reset" data-fset="reset">${st('reset')}</button></div>`}`;
}
const chip = (k, v, label) => `<button data-fset="${k}:${v}" class="${String(F[k]) === String(v) ? 'on' : ''}" aria-pressed="${String(F[k]) === String(v)}">${label}</button>`;
function filtersHTML() {
  const used = MEDIA.filter((m) => works.some((w) => w.medium === m));
  return `<div class="sp-filters">
    <div class="chips sp-row">${chip('medium', 'all', st('all'))}${used.map((m) => chip('medium', m, st(m))).join('')}</div>
    <div class="chips sp-row">${['any', 'p1', 'p2', 'p3', 'req'].map((p) => chip('price', p, st(p))).join('')}</div>
    <div class="chips sp-row">${[['new', 'sNew'], ['low', 'sLow'], ['high', 'sHigh']].map(([v, k]) => chip('sort', v, st(k))).join('')}<button data-fset="avail:${!F.avail}" class="${F.avail ? 'on' : ''}" aria-pressed="${F.avail}">${st('avail')}</button></div></div>`;
}
export function screenHTML(bell = '') {
  if (!works.length) return `<header class="page-h"><div><small class="nb-page-kicker">${st('kicker')}</small><h1>${st('tab')}</h1></div><div class="icons">${bell}</div></header><p class="empty">${st('none')}</p>`;
  const feat = works.filter((w) => w.featured && w.status !== 'sold'), fol = get(FOLLOW, []);
  return `<header class="page-h"><div><small class="nb-page-kicker">${st('kicker')}</small><h1>${st('tab')}</h1></div><button class="txt" data-shopguide>${st('guide')}</button></header>
    <p class="sp-lead">${st('lead')}</p>
    ${works.some((w) => w.sample) ? `<p class="sp-note">${st('sample')}</p>` : ''}
    ${feat.length ? `<section class="sec"><div class="sec-h"><h2 class="h20">${st('featured')}</h2></div><div class="hscroll sp-feat">${feat.map((w) => card(w, true)).join('')}</div></section>` : ''}
    <section class="sec"><div class="sec-h"><h2 class="h20">${st('artists')}</h2></div><div class="hscroll sp-artists">${artists.map((a) => { const w = works.find((x) => x.artist === a.id), on = fol.includes(a.id); return `<div class="sp-art"><button data-artist="${esc(a.id)}">${w ? `<img src="${esc(imgOf(w, 300))}" alt="" loading="lazy">` : ''}<b>${esc(L(a, 'name'))}</b><small>${esc(L(a, 'base'))}</small></button><button class="sp-follow${on ? ' on' : ''}" data-follow="${esc(a.id)}" aria-pressed="${on}">${st(on ? 'following' : 'follow')}</button></div>`; }).join('')}</div></section>
    <section class="sec"><div class="sec-h"><h2 class="h20">${st('works')}</h2></div>${filtersHTML()}<div id="sp-results">${gridHTML()}</div></section>`;
}

// ---------- 시트(작품 상세·작가·문의) ----------
function workSheet(w) {
  const a = artistOf(w), on = get(SAVED, []).includes(w.id), fol = get(FOLLOW, []).includes(a.id);
  const rows = [[st('year'), w.year], [st('material'), L(w, 'material')], [st('size'), sizeTxt(w)], [st('edition'), w.edition ? st('editionOf', { n: w.edition, l: w.edition_left || '-' }) : '']].filter(([, v]) => v);
  const badges = [w.certificate && st('cert'), w.frame === true ? st('frame') : w.frame === false ? st('noFrame') : '', w.ships_from && st('ships', { p: L(w, 'ships_from') })].filter(Boolean);
  const canAsk = w.status !== 'sold';
  const more = works.filter((x) => x.artist === w.artist && x.id !== w.id);
  return `<div class="sp-detail">
    <div class="sp-hero">${artImg(w, 'big')}${w.sample ? '<span class="sp-sample">SAMPLE</span>' : ''}</div>
    <div class="sp-body">
      <div class="sp-arow"><button data-artist="${esc(a.id)}"><b>${esc(L(a, 'name'))}</b>${a.born ? `<small>${st('born', { y: a.born })}${a.base ? ` · ${esc(L(a, 'base'))}` : ''}</small>` : ''}</button><button class="sp-follow${fol ? ' on' : ''}" data-follow="${esc(a.id)}" aria-pressed="${fol}">${st(fol ? 'following' : 'follow')}</button></div>
      <h3 class="sp-title">${esc(L(w, 'title'))}</h3>
      <dl class="sp-dl">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      ${badges.length ? `<ul class="sp-badges">${badges.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
      ${L(w, 'desc') ? `<p class="sp-desc">${esc(L(w, 'desc'))}</p>` : ''}
      <p class="sp-price">${statusTag(w)}${w.status === 'sold' ? '' : esc(money(w))}</p>
      <div class="sp-acts">
        <button class="btn black" data-ask="${esc(w.id)}" ${canAsk ? '' : 'disabled'}>${st('inquire')}</button>
        ${w.offer && canAsk && !w.price_request ? `<button class="btn line" data-ask="${esc(w.id)}" data-askoffer="1">${st('offer')}</button>` : ''}
        <button class="btn line sp-savebig${on ? ' on' : ''}" data-wsave="${esc(w.id)}" aria-pressed="${on}">${heart(on)} ${st(on ? 'saved' : 'save')}</button>
      </div>
      <p class="small sp-pn">${st('priceNote')}</p>
      ${w.cell ? `<button class="row sp-cell" data-detail="${esc(w.cell)}"><b>${st('exhibit')}</b><span class="v">›</span></button>` : ''}
      ${more.length ? `<p class="sp-sub">${st('worksBy', { a: esc(L(a, 'name')) })}</p><div class="hscroll sp-feat">${more.map((x) => card(x, true)).join('')}</div>` : ''}
    </div></div>`;
}
function artistSheet(a) {
  const fol = get(FOLLOW, []).includes(a.id), ws = works.filter((w) => w.artist === a.id);
  return `<div class="sh-h"><h3>${esc(L(a, 'name'))}</h3><button class="sp-follow${fol ? ' on' : ''}" data-follow="${esc(a.id)}" aria-pressed="${fol}">${st(fol ? 'following' : 'follow')}</button></div>
    <div class="sp-body"><p class="small">${[a.born && st('born', { y: a.born }), L(a, 'base')].filter(Boolean).map(esc).join(' · ')}</p>${L(a, 'bio') ? `<p class="sp-desc">${esc(L(a, 'bio'))}</p>` : ''}
    <p class="sp-sub">${st('worksBy', { a: esc(L(a, 'name')) })}</p><div class="sp-grid">${ws.map((w) => card(w)).join('')}</div></div>`;
}
function askSheet(w, offer) {
  const a = artistOf(w), q = ['qPrice', 'qShip', 'qCond', 'qSimilar'];
  return `<div class="sh-h"><h3>${st(offer ? 'offer' : 'inquire')}</h3></div>
    <form class="sp-form" data-askform="${esc(w.id)}" data-offer="${offer ? 1 : ''}" novalidate>
      <div class="sp-mini">${artImg(w)}<div><b>${esc(L(a, 'name'))}</b><i>${esc(L(w, 'title'))}</i><span>${esc(money(w))}</span></div></div>
      ${offer ? `<label>${st('offerAmt')}<input name="amount" inputmode="numeric" placeholder="${KRW ? '₩' : '$'}" autocomplete="off"></label>` : `<p class="sp-q">${st('ask')}</p><div class="chips sp-row">${q.map((k, i) => `<button type="button" data-q="${k}" class="${i === 0 ? 'on' : ''}" aria-pressed="${i === 0}">${st(k)}</button>`).join('')}</div>`}
      <label>${st('name')}<input name="name" autocomplete="name" maxlength="40"></label>
      <label>${st('email')}<input name="email" type="email" autocomplete="email" maxlength="80"></label>
      <label>${st('msg')}<textarea name="msg" rows="3" maxlength="600"></textarea></label>
      <p class="sp-err" role="alert"></p>
      <button class="btn black" type="submit">${st(offer ? 'sendOffer' : 'send')}</button>
      <p class="small">${st('mailNote')}</p></form>`;
}
function listSheet(kind) {
  if (kind === 'follow') { const as = get(FOLLOW, []).map((id) => artists.find((a) => a.id === id)).filter(Boolean); return `<div class="sh-h"><h3>${st('myFollow')}</h3></div>${as.length ? `<div class="noti">${as.map((a) => `<button class="nrow" data-artist="${esc(a.id)}"><span><b>${esc(L(a, 'name'))}</b><small>${esc(L(a, 'base'))}</small></span></button>`).join('')}</div>` : `<p class="empty">${st('empty0')}</p>`}`; }
  const ids = get(kind === 'asked' ? ASKED : SAVED, []).map((x) => (typeof x === 'object' ? x.id : x)), ws = [...new Set(ids)].map((id) => works.find((w) => w.id === id)).filter(Boolean);
  return `<div class="sh-h"><h3>${st(kind === 'asked' ? 'myAsk' : 'mySaved')}</h3></div><div class="sp-body">${ws.length ? `<div class="sp-grid">${ws.map((w) => card(w)).join('')}</div>` : `<p class="empty">${st('empty0')}</p>`}</div>`;
}
// 마이 탭에 넣을 줄
export function myHTML() {
  if (!works.length) return '';
  const n = (k) => get(k, []).length;
  return `<section class="sec"><div class="sec-h"><h2 class="h20">${st('my')}</h2></div><div class="list">
    <button class="row" data-shoplist="saved"><b>${st('mySaved')}</b><span class="v">${n(SAVED)}</span></button>
    <button class="row" data-shoplist="follow"><b>${st('myFollow')}</b><span class="v">${n(FOLLOW)}</span></button>
    <button class="row" data-shoplist="asked"><b>${st('myAsk')}</b><span class="v">${n(ASKED)}</span></button></div></section>`;
}

// ---------- 버튼 처리: 처리했으면 true ----------
export function shopAction(e, { sheet, toast, refresh }) {
  const q = (s) => { const c = e.target.closest(s); return c && e.currentTarget.contains(c) ? c : null; };
  const wOf = (id) => works.find((w) => w.id === id);
  let b;
  if ((b = q('[data-fset]'))) {
    const v = b.dataset.fset; if (v === 'reset') Object.assign(F, { medium: 'all', price: 'any', avail: false }); else { const [k, x] = v.split(':'); F[k] = k === 'avail' ? x === 'true' : x; }
    const box = document.querySelector('.sp-filters'); if (box) box.outerHTML = filtersHTML();
    const r = document.getElementById('sp-results'); if (r) r.innerHTML = gridHTML(); return true;
  }
  if ((b = q('[data-wsave]'))) {
    const id = b.dataset.wsave, on = toggle(SAVED, id);
    document.querySelectorAll(`[data-wsave="${CSS.escape(id)}"]`).forEach((el) => { el.classList.toggle('on', on); el.setAttribute('aria-pressed', on); el.innerHTML = el.classList.contains('sp-savebig') ? `${heart(on)} ${st(on ? 'saved' : 'save')}` : heart(on); });
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); refresh('my'); return true;
  }
  if ((b = q('[data-follow]'))) {
    const id = b.dataset.follow, on = toggle(FOLLOW, id);
    document.querySelectorAll(`[data-follow="${CSS.escape(id)}"]`).forEach((el) => { el.classList.toggle('on', on); el.setAttribute('aria-pressed', on); el.textContent = st(on ? 'following' : 'follow'); });
    refresh('my'); return true;
  }
  if ((b = q('[data-work]'))) { const w = wOf(b.dataset.work); if (w) sheet.open(workSheet(w), 'work'); return true; }
  if ((b = q('[data-artist]'))) { const a = artists.find((x) => x.id === b.dataset.artist); if (a) sheet.open(artistSheet(a), 'artist'); return true; }
  if ((b = q('[data-ask]'))) {
    const w = wOf(b.dataset.ask); if (!w) return true;
    if (w.sample) { toast(st('sampleNo')); return true; }
    if (w.status === 'sold') { toast(st('soldNo')); return true; }
    sheet.open(askSheet(w, !!b.dataset.askoffer), 'ask'); return true;
  }
  if ((b = q('[data-q]'))) { b.parentElement.querySelectorAll('[data-q]').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); return true; }
  if ((b = q('[data-shoplist]'))) { sheet.open(listSheet(b.dataset.shoplist), 'shoplist'); return true; }
  if (q('[data-shopguide]')) { sheet.open(`<div class="sh-h"><h3>${st('guide')}</h3></div><ol class="guide">${['g1', 'g2', 'g3', 'g4'].map((k, i) => `<li><em>${i + 1}</em>${st(k)}</li>`).join('')}</ol><div style="padding:20px 24px 0"><button class="btn line" data-close>${st('close')}</button></div>`); return true; }
  return false;
}
// 문의 보내기(폼 submit): 서버가 없어서 메일 앱으로 넘김. 받는 주소는 config.shop.inquiryEmail
export function shopSubmit(e, { toast, sheet, refresh }) {
  const f = e.target.closest('[data-askform]'); if (!f) return false;
  e.preventDefault();
  const w = works.find((x) => x.id === f.dataset.askform), err = f.querySelector('.sp-err');
  const name = f.name.value.trim(), email = f.email.value.trim(), msg = f.msg.value.trim(), amount = f.amount ? f.amount.value.trim() : '';
  if (!name || !email) { err.textContent = st('need'); return true; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = st('badEmail'); return true; }
  if (!SH.inquiryEmail) { err.textContent = st('soon'); return true; }
  const a = artistOf(w), topic = f.querySelector('[data-q].on');
  const subject = `[NEBULA ${f.dataset.offer ? 'Offer' : 'Inquiry'}] ${a.name_en || a.name} — ${w.title_en || w.title} (${w.id})`;
  const body = [`${st('name')}: ${name}`, `${st('email')}: ${email}`, amount && `${st('offerAmt')}: ${amount}`, topic && `· ${st(topic.dataset.q)}`, '', msg, '', `${L(a, 'name')} · ${L(w, 'title')} · ${money(w)}`, `ID: ${w.id}`].filter((x) => x !== false && x != null).join('\n');
  const asked = get(ASKED, []).filter((x) => (x.id || x) !== w.id); asked.unshift({ id: w.id, at: Date.now() }); set(ASKED, asked);
  location.href = `mailto:${SH.inquiryEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  toast(st('sent')); sheet.close(); refresh('my'); return true;
}
