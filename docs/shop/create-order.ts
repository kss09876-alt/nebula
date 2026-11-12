// NEBULA 주문 만들기 (Supabase Edge Function 뼈대, 초안 — 아직 배포하지 않음)
// 화면이 보낸 work_id 로 작품을 잡아 두고, 금액은 서버 표(works)에서 계산해 돌려준다. 화면이 보낸 금액은 쓰지 않음.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const cors = { 'Access-Control-Allow-Origin': Deno.env.get('ALLOW_ORIGIN') ?? 'https://kss09876-alt.github.io', 'Access-Control-Allow-Headers': 'content-type, authorization' };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  const { work_id, cell, buyer } = await req.json().catch(() => ({}));
  if (!work_id || !buyer?.name || !buyer?.phone || !buyer?.addr1 || buyer?.country !== 'KR') return json({ code: 'BAD_REQUEST' }, 400);
  const { data: w, error } = await db.rpc('hold_work', { p_work: work_id });
  if (error || !w?.work_id) return json({ code: 'NOT_AVAILABLE', message: 'sold or on hold' }, 409);
  const orderId = 'N' + Date.now().toString(36).toUpperCase() + crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase();
  const amount = w.price_krw + w.shipping_krw;
  const { error: e2 } = await db.from('orders').insert({ order_id: orderId, work_id, cell_id: cell ?? w.cell_id, amount_krw: amount, buyer });
  if (e2) return json({ code: 'DB' }, 500);
  return json({ orderId, amount, orderName: w.title.slice(0, 90), customerKey: undefined });
});
