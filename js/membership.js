// NEBULA 멤버십 — 유료화 뼈대 (결제는 아직 꺼져 있음)
// 구성: 로그인 → 구매 기록(서버) → 전시 잠금. 앱 결제(애플·구글 인앱결제)와 웹 결제가 같은 구매 기록을 씀.
// 지금은 CONFIG.paywall.enabled = false 라서 모든 전시가 열려 있고, 멤버십 화면은 '준비 중' 안내만 함.
// 주소에 ?paytest=1 을 붙이면 이 기기에서만 결제를 흉내 내어 잠금·구매·복원 흐름을 시험할 수 있음(실제 결제 아님).
// 실제 결제를 붙일 때는 아래 provider 를 서버(Supabase)·RevenueCat·웹 결제 구현으로 바꾸면 됨 → docs/paid/README.md
import { CONFIG } from './config.js?v=19';
import { lang } from './i18n.js?v=5';

const PW = CONFIG.paywall || {};
export const TEST = new URLSearchParams(location.search).has('paytest') || (() => { try { return sessionStorage.getItem('nebula-paytest') === '1'; } catch (e) { return false; } })();
if (TEST) { try { sessionStorage.setItem('nebula-paytest', '1'); } catch (e) {} }
export const ENABLED = !!PW.enabled || TEST;

// 상품: 스토어 상품 ID 와 가격(한국 원화 / 해외 달러). 앱은 웹보다 조금 높게 잡을 수 있음(스토어 수수료)
export const PRODUCTS = {
  ticket: { id: 'nebula.ticket', kind: 'ticket', krw: 3900, usd: 2.99 },
  monthly: { id: 'nebula.member.monthly', kind: 'sub', krw: 5900, usd: 4.99 },
  yearly: { id: 'nebula.member.yearly', kind: 'sub', krw: 59000, usd: 49.99 },
  ...(PW.products || {}),
};
export const price = (p) => (lang === 'ko' ? `${p.krw.toLocaleString('ko-KR')}원` : `$${p.usd.toFixed(2)}`);

const W = {
  ko: { title: '멤버십', lead: '모든 전시와 매달 태어나는 새 행성을 자유롭게.', monthly: '월 구독', yearly: '연 구독', ticket: '전시 한 편', perMonth: '매달', perYear: '매년 · 두 달 무료', once: '한 번 구매 · 계속 소장',
    b1: '모든 전시 전체 관람', b2: '매달 새 전시', b3: '언제든 해지', start: '시작하기', buy: '이 전시만 구매', restore: '구매 복원', manage: '구독 관리', soon: '결제는 준비 중이에요. 지금은 모든 전시가 열려 있어요.',
    active: '멤버십 이용 중', none: '아직 멤버십이 없어요', owned: '소장한 전시 {n}편', free: '무료', paid: '멤버십', locked: '여기까지 무료로 보셨어요', lockedT: '이어서 보려면 멤버십을 시작하거나 이 전시만 구매하세요.',
    done: '구매가 완료됐어요. 이어서 감상하세요.', restored: '구매 내역을 되찾았어요.', nothing: '되찾을 구매 내역이 없어요.', test: '테스트 모드 — 실제 결제가 아니에요', terms: '이용약관', privacy: '개인정보처리방침',
    legal: '구독은 해지하기 전까지 자동으로 갱신돼요. 해지는 스토어의 구독 관리에서 언제든 할 수 있어요.', reset: '테스트 구매 지우기', open: '멤버십 보기', inApp: 'NEBULA 앱에서 멤버십을 시작할 수 있어요.' },
  en: { title: 'Membership', lead: 'Every exhibition, and a new planet born each month.', monthly: 'Monthly', yearly: 'Yearly', ticket: 'Single exhibition', perMonth: 'per month', perYear: 'per year · 2 months free', once: 'Buy once · keep it',
    b1: 'Full access to every exhibition', b2: 'A new exhibition every month', b3: 'Cancel anytime', start: 'Start', buy: 'Buy this exhibition only', restore: 'Restore purchases', manage: 'Manage subscription', soon: 'Payments are coming soon. For now, every exhibition is open.',
    active: 'Membership active', none: 'No membership yet', owned: '{n} exhibition(s) owned', free: 'Free', paid: 'Members', locked: 'You’ve reached the end of the free preview', lockedT: 'Start a membership or buy this exhibition to keep going.',
    done: 'Purchase complete. Enjoy the rest.', restored: 'Your purchases were restored.', nothing: 'No purchases to restore.', test: 'Test mode — no real payment', terms: 'Terms of Use', privacy: 'Privacy Policy',
    legal: 'Subscriptions renew automatically until cancelled. You can cancel anytime in your store’s subscription settings.', reset: 'Clear test purchases', open: 'See membership', inApp: 'You can start a membership in the NEBULA app.' },
  zh: { title: '会员', lead: '畅享全部展览，以及每月诞生的新行星。', monthly: '月度订阅', yearly: '年度订阅', ticket: '单场展览', perMonth: '每月', perYear: '每年 · 免两个月', once: '一次购买 · 永久收藏',
    b1: '完整观看全部展览', b2: '每月新展览', b3: '随时取消', start: '开始', buy: '只购买这场展览', restore: '恢复购买', manage: '管理订阅', soon: '支付功能即将开放。目前所有展览均可观看。',
    active: '会员使用中', none: '尚未开通会员', owned: '已收藏 {n} 场展览', free: '免费', paid: '会员', locked: '免费试看到此结束', lockedT: '开通会员或购买这场展览即可继续观看。',
    done: '购买完成，请继续欣赏。', restored: '已恢复购买记录。', nothing: '没有可恢复的购买记录。', test: '测试模式 — 并非真实支付', terms: '使用条款', privacy: '隐私政策',
    legal: '订阅在取消前会自动续订。可随时在应用商店的订阅管理中取消。', reset: '清除测试购买', open: '查看会员', inApp: '可在 NEBULA 应用中开通会员。' },
  ja: { title: 'メンバーシップ', lead: 'すべての展示と、毎月生まれる新しい惑星を自由に。', monthly: '月額プラン', yearly: '年額プラン', ticket: '展示1本', perMonth: '毎月', perYear: '毎年 · 2か月分無料', once: '一度の購入で · ずっと所蔵',
    b1: 'すべての展示を最後まで', b2: '毎月あたらしい展示', b3: 'いつでも解約', start: 'はじめる', buy: 'この展示だけ購入', restore: '購入を復元', manage: 'サブスクリプション管理', soon: '決済は準備中です。現在はすべての展示をご覧いただけます。',
    active: 'メンバーシップ利用中', none: 'まだメンバーシップがありません', owned: '所蔵している展示 {n}本', free: '無料', paid: 'メンバー', locked: '無料でご覧いただけるのはここまでです', lockedT: '続きを見るには、メンバーシップをはじめるか、この展示だけを購入してください。',
    done: '購入が完了しました。続きをお楽しみください。', restored: '購入履歴を復元しました。', nothing: '復元できる購入履歴がありません。', test: 'テストモード — 実際の決済ではありません', terms: '利用規約', privacy: 'プライバシーポリシー',
    legal: 'サブスクリプションは解約するまで自動更新されます。解約はストアのサブスクリプション管理からいつでもできます。', reset: 'テスト購入を消す', open: 'メンバーシップを見る', inApp: 'NEBULA アプリでメンバーシップをはじめられます。' },
};
export const mt = (k, o) => { let s = (W[lang] || W.ko)[k] ?? W.ko[k] ?? k; if (o) Object.entries(o).forEach(([a, b]) => { s = s.replace(`{${a}}`, b); }); return s; };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- 구매 기록 제공자 ----------
// 실제 서비스: getState() 는 서버의 구매 기록을, purchase() 는 인앱결제/웹 결제를, restore() 는 스토어 복원을 부름.
const KEY = 'nebula-paytest-state';
const testProvider = {
  name: 'test',
  getState() { try { return JSON.parse(localStorage.getItem(KEY)) || { member: null, tickets: [] }; } catch (e) { return { member: null, tickets: [] }; } },
  async purchase(product, cellId) { const s = this.getState(); if (product.kind === 'sub') s.member = { plan: product.id, since: Date.now() }; else if (cellId && !s.tickets.includes(cellId)) s.tickets.push(cellId); localStorage.setItem(KEY, JSON.stringify(s)); return true; },
  async restore() { const s = this.getState(); return !!(s.member || s.tickets.length); },
  reset() { localStorage.removeItem(KEY); },
};
const offProvider = { name: 'off', getState: () => ({ member: null, tickets: [] }), async purchase() { return false; }, async restore() { return false; } };
let provider = TEST ? testProvider : offProvider;
export function setProvider(p) { provider = p; emit(); } // 실제 결제 구현을 끼우는 자리
const listeners = []; const emit = () => listeners.forEach((f) => f(state()));
export const onChange = (f) => { listeners.push(f); };
export const state = () => provider.getState();
export const isMember = () => !!state().member;
// 전시가 유료인지: 데이터의 paid 칸(시트 cells 의 paid = 1/true/yes) 또는 config.paywall.paid 목록
const TEST_PAID = TEST ? (new URLSearchParams(location.search).get('paid') || (() => { try { return sessionStorage.getItem('nebula-paytest-paid') || ''; } catch (e) { return ''; } })()).split(',').filter(Boolean) : []; // 시험용: ?paytest=1&paid=c004
if (TEST && TEST_PAID.length) { try { sessionStorage.setItem('nebula-paytest-paid', TEST_PAID.join(',')); } catch (e) {} }
export const isPaid = (c) => !!c && ENABLED && (TEST_PAID.includes(c.id) || /^(1|true|yes|y|o)$/i.test(String(c.paid ?? '').trim()) || (PW.paid || []).includes(c.id));
export const canView = (c) => !isPaid(c) || isMember() || state().tickets.includes(c.id);
export const previewCount = (c) => Number(c.preview) || PW.previewBlocks || 3; // 무료로 보여 줄 블록 수(표지 포함)
export async function purchase(key, cellId) { if (!ENABLED) return false; const ok = await provider.purchase(PRODUCTS[key], cellId); if (ok) emit(); return ok; }
export async function restore() { const ok = await provider.restore(); emit(); return ok; }
export function resetTest() { if (provider.reset) { provider.reset(); emit(); } }

// ---------- 화면 조각 ----------
export const badge = (c) => (ENABLED && c ? `<span class="mb-badge${isPaid(c) ? ' paid' : ''}">${isPaid(c) ? (canView(c) ? '✓ ' : '') + mt('paid') : mt('free')}</span>` : '');
const legalLinks = () => `<p class="mb-legal">${mt('legal')}</p><p class="mb-links"><a href="terms.html?lang=${lang}" target="_blank" rel="noopener">${mt('terms')}</a> · <a href="privacy.html?lang=${lang}" target="_blank" rel="noopener">${mt('privacy')}</a></p>`;
// 멤버십 화면(시트 안에 들어감). cell 을 주면 '이 전시만 구매'도 보여 줌
export function membershipHTML(cell) {
  const s = state(), plan = (k, sub, hot) => `<button class="mb-plan${hot ? ' hot' : ''}" data-mb-buy="${k}"><span><b>${mt(k)}</b><small>${mt(sub)}</small></span><em>${price(PRODUCTS[k])}</em></button>`;
  return `<div class="mb">
    ${TEST ? `<p class="mb-test">${mt('test')}</p>` : ''}
    <h3>${mt('title')}</h3><p class="mb-lead">${mt('lead')}</p>
    <p class="mb-state${s.member ? ' on' : ''}">${s.member ? mt('active') : mt('none')}${s.tickets.length ? ` · ${mt('owned', { n: s.tickets.length })}` : ''}</p>
    <ul class="mb-benefits"><li>${mt('b1')}</li><li>${mt('b2')}</li><li>${mt('b3')}</li></ul>
    ${!ENABLED ? `<p class="mb-soon">${mt('soon')}</p>` : ''}
    <div class="mb-plans">${plan('yearly', 'perYear', true)}${plan('monthly', 'perMonth')}${cell && isPaid(cell) && !canView(cell) ? `<button class="mb-plan" data-mb-buy="ticket" data-mb-cell="${esc(cell.id)}"><span><b>${mt('buy')}</b><small>${mt('once')}</small></span><em>${price(PRODUCTS.ticket)}</em></button>` : ''}</div>
    <button class="mb-restore" data-mb-restore>${mt('restore')}</button>${TEST ? `<button class="mb-restore" data-mb-reset>${mt('reset')}</button>` : ''}
    ${legalLinks()}</div>`;
}
// 멤버십 화면 안의 버튼 처리. 처리했으면 true. notify(문구), refresh() 는 부르는 쪽에서 줌
export async function handleMembershipClick(e, { notify = () => {}, refresh = () => {} } = {}) {
  const buy = e.target.closest('[data-mb-buy]'), rs = e.target.closest('[data-mb-restore]'), rst = e.target.closest('[data-mb-reset]');
  if (buy) { if (!ENABLED) { notify(mt('soon')); return true; } const ok = await purchase(buy.dataset.mbBuy, buy.dataset.mbCell); notify(ok ? mt('done') : mt('soon')); if (ok) refresh(); return true; }
  if (rs) { const ok = ENABLED && await restore(); notify(ok ? mt('restored') : mt('nothing')); if (ok) refresh(); return true; }
  if (rst) { resetTest(); refresh(); return true; }
  return false;
}
// 전시 페이지의 잠금 블록 (무료 앞부분 뒤에 놓임)
export function paywallHTML(cell) {
  const inApp = /NEBULAApp|VALIXApp/.test(navigator.userAgent) || window !== window.top;
  return `<section class="b-paywall" id="paywall"><div class="pw-in">
    <p class="eyebrow">NEBULA MEMBERSHIP</p><h2>${mt('locked')}</h2><p>${mt('lockedT')}</p>
    ${membershipHTML(cell)}${inApp ? '' : `<p class="mb-legal">${mt('inApp')}</p>`}
  </div></section>`;
}

// 공용 스타일 (한 번만)
if (!document.getElementById('mb-style')) {
  const st = document.createElement('style'); st.id = 'mb-style';
  st.textContent = `.mb{padding:6px 22px 18px;text-align:left;color:#eef2ee}.mb h3{font-size:24px;font-weight:600;letter-spacing:-.02em;margin:0 0 6px}.mb-lead{font-size:15px;line-height:1.6;color:#b9c4bd;margin:0 0 14px}
.mb-test{display:inline-block;margin:0 0 12px;padding:5px 10px;border-radius:999px;background:rgba(255,190,90,.16);color:#ffcf8a;font-size:12px}
.mb-state{font-size:13px;color:#8f9b94;margin:0 0 12px}.mb-state.on{color:#bddac7}
.mb-benefits{list-style:none;margin:0 0 16px;padding:0;display:grid;gap:8px}.mb-benefits li{position:relative;padding-left:22px;font-size:14px;color:#d9e0db}.mb-benefits li::before{content:'';position:absolute;left:2px;top:6px;width:9px;height:5px;border-left:1.5px solid #bddac7;border-bottom:1.5px solid #bddac7;transform:rotate(-45deg)}
.mb-soon{margin:0 0 14px;padding:12px 14px;border-radius:14px;background:rgba(189,218,199,.08);border:1px solid rgba(189,218,199,.22);font-size:13.5px;line-height:1.55;color:#cfe3d6}
.mb-plans{display:grid;gap:10px;margin-bottom:12px}.mb-plan{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:64px;padding:12px 16px;border-radius:16px;border:1px solid rgba(255,255,255,.14);background:rgba(16,22,27,.7);color:inherit;text-align:left;cursor:pointer;font:inherit}
.mb-plan.hot{border-color:#bddac7;background:rgba(189,218,199,.1)}.mb-plan span{display:flex;flex-direction:column;gap:3px}.mb-plan b{font-size:15.5px;font-weight:600}.mb-plan small{font-size:12px;color:#9aa69f}.mb-plan em{font-style:normal;font-size:17px;font-weight:600;white-space:nowrap}
.mb-restore{display:block;width:100%;min-height:44px;margin-top:2px;color:#b9c4bd;font-size:13.5px;text-decoration:underline;text-underline-offset:3px;background:none;border:0;cursor:pointer;font-family:inherit}
.mb-legal{font-size:12px;line-height:1.6;color:#7f8a84;margin:10px 0 6px}.mb-links{font-size:12px;margin:0}.mb-links a{color:#b9c4bd;text-decoration:underline;text-underline-offset:3px}
.mb-badge{display:inline-block;margin-left:6px;padding:2px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.2);font-size:11px;letter-spacing:.04em;color:#b9c4bd;vertical-align:middle}.mb-badge.paid{border-color:#bddac7;color:#bddac7}
.b-paywall{position:relative;padding:110px 16px 120px;background:linear-gradient(180deg,rgba(5,6,8,0),#07090b 22%);margin-top:-22vh;z-index:3}.b-paywall .pw-in{max-width:520px;margin:0 auto;text-align:center}.b-paywall h2{font-size:clamp(24px,5vw,34px);font-weight:700;margin:12px 0 10px;word-break:keep-all}.b-paywall .pw-in>p{color:#b9c4bd;font-size:15px;line-height:1.7;margin-bottom:18px}
.b-paywall .mb{border:1px solid rgba(255,255,255,.12);border-radius:22px;background:rgba(12,16,19,.9);padding:20px 18px 16px}`;
  document.head.appendChild(st);
}
