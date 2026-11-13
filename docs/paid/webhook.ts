// ARTMOS 결제 알림 받기 (Supabase Edge Function 뼈대, 초안 — 아직 배포하지 않음)
// RevenueCat(앱 인앱결제)과 웹 결제 대행사가 '결제됨·갱신됨·환불됨'을 알려 오면 구매 기록(entitlements)에 적는다.
// 배포 전 할 일: 비밀 값(환경 변수) 설정, 웹 결제 대행사 서명 검증 추가, 실제 이벤트로 시험.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  // RevenueCat 웹훅: 대시보드에서 정한 Authorization 값과 같은지 확인
  if (req.headers.get('authorization') !== `Bearer ${Deno.env.get('REVENUECAT_WEBHOOK_SECRET')}`) return new Response('unauthorized', { status: 401 });
  const { event } = await req.json();
  if (!event) return new Response('bad request', { status: 400 });

  const userId = event.app_user_id;                 // 앱에서 RevenueCat에 로그인 사용자 id를 넘겨 둠
  const product = String(event.product_id || '');
  const isPass = product.startsWith('artmos.pass'); // 하루 입장권(소모성 상품): 구매 후 30일 안에 입장, 입장하면 enter_pass()가 24시간으로 바꿈
  const row = {
    user_id: userId,
    kind: isPass ? 'pass' : 'member',
    cell_id: isPass ? event.subscriber_attributes?.cell_id?.value ?? null : null,
    product_id: product,
    source: event.store === 'PLAY_STORE' ? 'play_store' : 'app_store',
    external_id: event.original_transaction_id ?? event.transaction_id,
    expires_at: isPass ? new Date(Date.now() + 30 * 864e5).toISOString() : event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
    revoked_at: null as string | null,
  };

  switch (event.type) {
    case 'INITIAL_PURCHASE': case 'RENEWAL': case 'NON_RENEWING_PURCHASE': case 'UNCANCELLATION': case 'PRODUCT_CHANGE':
      break;                                         // 구매·갱신 → 그대로 저장
    case 'EXPIRATION':
      break;                                         // 만료일이 지난 값으로 저장됨
    case 'CANCELLATION':                             // 환불이면 바로 회수, 단순 해지면 만료일까지 유지
      if (event.cancel_reason === 'CUSTOMER_SUPPORT') row.revoked_at = new Date().toISOString();
      break;
    default:
      return new Response('ignored');
  }
  const { error } = await db.from('entitlements').upsert(row, { onConflict: 'source,external_id' });
  return error ? new Response(error.message, { status: 500 }) : new Response('ok');
});
