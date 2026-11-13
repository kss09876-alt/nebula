// ARTMOS 결제 승인 (Supabase Edge Function 뼈대, 초안 — 아직 배포하지 않음)
// checkout.html 이 successUrl 로 받은 paymentKey·orderId·amount 를 보냄 → 주문 금액과 같은지 확인 → 토스에 승인 요청.
// 시크릿 키(TOSS_SECRET_KEY = test_sk_… / live_sk_…)는 이 함수의 환경 변수에만 둔다.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const cors = { 'Access-Control-Allow-Origin': Deno.env.get('ALLOW_ORIGIN') ?? 'https://vailixlab.github.io', 'Access-Control-Allow-Headers': 'content-type, authorization' };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  const { paymentKey, orderId, amount } = await req.json().catch(() => ({}));
  const { data: o } = await db.from('orders').select('*').eq('order_id', orderId).single();
  if (!o) return json({ code: 'NO_ORDER' }, 404);
  if (o.status === 'paid') return json({ orderId, status: 'paid' });          // 새로 고침 등 두 번 호출
  if (Number(amount) !== o.amount_krw) return json({ code: 'AMOUNT_MISMATCH' }, 400); // 금액 바꿔치기 방지

  const r = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + btoa(Deno.env.get('TOSS_SECRET_KEY')! + ':'), 'Content-Type': 'application/json', 'Idempotency-Key': orderId },
    body: JSON.stringify({ paymentKey, orderId, amount: o.amount_krw }),
  });
  const p = await r.json();
  if (!r.ok) {
    await db.from('orders').update({ status: 'failed' }).eq('order_id', orderId);
    await db.from('works').update({ status: 'available', hold_until: null }).eq('work_id', o.work_id).eq('status', 'reserved');
    return json({ code: p.code, message: p.message }, 400);
  }
  await db.from('orders').update({ status: 'paid', payment_key: paymentKey, paid_at: new Date().toISOString() }).eq('order_id', orderId);
  await db.from('works').update({ status: 'sold', hold_until: null, updated_at: new Date().toISOString() }).eq('work_id', o.work_id);
  // TODO: 에디션이면 edition_left 줄이고 0일 때만 sold, 판매자·작가에게 알림 메일, 구매자에게 주문 확인 메일
  return json({ orderId, status: 'paid' });
});
