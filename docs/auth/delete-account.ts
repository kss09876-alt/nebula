// ARTMOS 계정 삭제 (Supabase Edge Function 뼈대, 초안). 앱스토어 규정: 앱 안에서 계정을 지울 수 있어야 함.
// 로그인한 사람 본인의 계정만 지움. profiles 등은 on delete cascade 로 함께 지워짐.
// 결제·주문 기록(entitlements·orders)은 전자상거래법 보관 기간(5년) 동안 user_id 를 지운 채 남김 → 표 설계에서 on delete set null 로 바꿀 것.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const cors = { 'Access-Control-Allow-Origin': Deno.env.get('ALLOW_ORIGIN') ?? 'https://vailixlab.github.io', 'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info' };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  const jwt = (req.headers.get('authorization') || '').replace('Bearer ', '');
  const { data: { user }, error } = await admin.auth.getUser(jwt);
  if (error || !user) return new Response('unauthorized', { status: 401, headers: cors });
  const { error: e2 } = await admin.auth.admin.deleteUser(user.id);
  return e2 ? new Response(e2.message, { status: 500, headers: cors }) : new Response('ok', { headers: cors });
});
