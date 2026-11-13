// ARTMOS 컬렉트 — 실물 작품 결제 (일반 결제, 토스페이먼츠 결제창 v2)
// 실물 상품이라 애플·구글 인앱결제 대상이 아님 → 앱 안에서도 일반 결제 가능.
// 순서: ① 서버에 주문 만들기(가격·재고는 서버가 정함, 작품을 잠시 예약) → ② 토스 결제창 → ③ checkout.html 로 돌아와
//       서버가 결제 승인(시크릿 키) + 금액 확인 → ④ 작품 '판매 완료', 주문 '결제 완료'.
// 서버(Supabase Edge Function)가 준비되기 전에는 config.shop.pay.enabled = false → '구매하기' 버튼이 안 보이고 문의만.
// 시험: 주소에 ?shoptest=1 → 이 기기에서만 주문·결제를 흉내 냄(예시 작품도 구매 흐름 시험 가능, 실제 결제 아님).
import { CONFIG } from './config.js?v=23';

const SH = CONFIG.shop || {}, PAY = SH.pay || {};
export const SHOP_TEST = new URLSearchParams(location.search).has('shoptest') || (() => { try { return sessionStorage.getItem('nebula-shoptest') === '1'; } catch (e) { return false; } })();
if (SHOP_TEST) { try { sessionStorage.setItem('nebula-shoptest', '1'); } catch (e) {} }
export const PAY_ON = SHOP_TEST || (!!PAY.enabled && !!PAY.clientKey && !!PAY.api);
export const SHIPPING_KRW = Number(SH.shippingKrw) || 0;

// 기기에 남기는 주문 기록(화면 표시용. 진짜 기록은 서버 orders 표)
const OKEY = 'nebula-shop-orders';
export const orders = () => { try { return JSON.parse(localStorage.getItem(OKEY)) || []; } catch (e) { return []; } };
export function saveOrder(o) { const a = orders().filter((x) => x.orderId !== o.orderId); a.unshift({ ...orders().find((x) => x.orderId === o.orderId), ...o }); try { localStorage.setItem(OKEY, JSON.stringify(a.slice(0, 50))); } catch (e) {} }

export const buyable = (w) => PAY_ON && w.status === 'available' && !w.price_request && w.price_krw > 0 && (!w.sample || SHOP_TEST);
const back = () => new URL('checkout.html', location.href).href;

async function api(path, body) {
  const r = await fetch(PAY.api.replace(/\/$/, '') + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.message || 'server'), { code: j.code || r.status });
  return j;
}
function loadToss() {
  if (window.TossPayments) return Promise.resolve(window.TossPayments);
  return new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'https://js.tosspayments.com/v2/standard'; s.onload = () => ok(window.TossPayments); s.onerror = () => no(new Error('sdk')); document.head.appendChild(s); });
}
const rid = () => 'N' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase(); // 6~64자, 영문·숫자만

// 결제 시작. buyer = { name, phone, email, zip, addr1, addr2, memo }
export async function checkout(work, buyer, { artistName, lang }) {
  try { sessionStorage.setItem('nebula-shop-back', location.pathname.split('/').pop() || 'app.html'); } catch (e) {}
  const record = { work_id: work.id, title: work.title, artist: artistName, cell: work.cell || '', at: Date.now(), status: 'pending' };
  if (SHOP_TEST) { // 서버·결제창 없이 흉내: 바로 성공 페이지로
    const orderId = rid(), amount = work.price_krw + SHIPPING_KRW;
    saveOrder({ ...record, orderId, amount, currency: 'KRW', buyer: { name: buyer.name } });
    location.href = `${back()}?result=success&test=1&orderId=${orderId}&paymentKey=test_${orderId}&amount=${amount}`;
    return;
  }
  // ① 주문 만들기: 금액은 서버가 작품 표에서 계산해서 돌려줌(화면 금액을 믿지 않음)
  const o = await api('/create-order', { work_id: work.id, cell: work.cell || null, buyer, lang });
  saveOrder({ ...record, orderId: o.orderId, amount: o.amount, currency: 'KRW', buyer: { name: buyer.name } });
  // ② 토스 결제창 (성공하면 successUrl 로 paymentKey·orderId·amount 가 붙어 돌아옴)
  const Toss = await loadToss();
  const payment = Toss(PAY.clientKey).payment({ customerKey: o.customerKey || Toss.ANONYMOUS });
  await payment.requestPayment({
    method: 'CARD', amount: { currency: 'KRW', value: o.amount }, orderId: o.orderId, orderName: o.orderName,
    successUrl: `${back()}?result=success`, failUrl: `${back()}?result=fail`,
    customerName: buyer.name, customerEmail: buyer.email, customerMobilePhone: buyer.phone.replace(/\D/g, ''),
  });
}
// ③ checkout.html 에서 부름: 서버가 승인하고 금액을 확인
export async function confirm({ paymentKey, orderId, amount }) {
  if (SHOP_TEST) { saveOrder({ orderId, status: 'paid', paidAt: Date.now() }); return { orderId, status: 'paid' }; }
  const r = await api('/confirm-payment', { paymentKey, orderId, amount: Number(amount) });
  saveOrder({ orderId, status: r.status || 'paid', paidAt: Date.now() });
  return r;
}
