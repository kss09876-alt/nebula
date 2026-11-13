-- ARTMOS 컬렉트 — 작품·주문 (Supabase / Postgres) 초안. 아직 만들지 않음.
-- 가격·재고의 진짜 기준은 이 표. 화면(시트·JSON)은 보여 주기용이고, 결제 금액은 서버가 여기서 계산한다.

create table if not exists public.works (
  work_id     text primary key,
  artist_id   text not null,
  cell_id     text,                         -- 관련 전시 (예: c005)
  title       text not null,
  price_krw   integer not null check (price_krw > 0),
  shipping_krw integer not null default 0,
  status      text not null default 'available' check (status in ('available','reserved','sold','hidden')),
  hold_until  timestamptz,                  -- 결제 중 예약(한 점뿐인 작품을 두 사람이 동시에 사지 않게)
  edition_left integer,                     -- 에디션이면 남은 수(null = 단품)
  updated_at  timestamptz not null default now()
);

create table if not exists public.orders (
  order_id     text primary key,            -- 토스 orderId (6~64자, 영문·숫자·-_=)
  work_id      text not null references public.works(work_id),
  cell_id      text,                        -- 어느 전시에서 샀는지(정산·통계)
  user_id      uuid references auth.users(id),
  amount_krw   integer not null,            -- 서버가 정한 금액(작품가 + 배송비)
  status       text not null default 'pending' check (status in ('pending','paid','failed','cancelled','shipped','delivered','refunded')),
  payment_key  text,
  buyer        jsonb not null,              -- 이름·연락처·이메일·주소(배송 끝나면 보관 기간 뒤 지움)
  created_at   timestamptz not null default now(),
  paid_at      timestamptz
);
create index if not exists orders_user on public.orders (user_id);

-- 화면에서 직접 쓰기 금지. 읽기는 본인 주문만. 쓰기는 Edge Function(서비스 키)만.
alter table public.works enable row level security;
create policy "works public read" on public.works for select using (status <> 'hidden');
alter table public.orders enable row level security;
create policy "own orders" on public.orders for select using (auth.uid() = user_id);

-- 결제 시작 때 작품 잡아 두기(30분). 이미 팔렸거나 다른 사람이 결제 중이면 null
create or replace function public.hold_work(p_work text) returns public.works
language plpgsql security definer set search_path = public as $$
declare w public.works;
begin
  update works set status = 'reserved', hold_until = now() + interval '30 minutes', updated_at = now()
   where work_id = p_work and (status = 'available' or (status = 'reserved' and hold_until < now()))
  returning * into w;
  return w;
end $$;
-- 결제 실패·취소·시간 초과면 다시 풀기 (cron으로 몇 분마다)
create or replace function public.release_holds() returns void language sql security definer set search_path = public as $$
  update works set status = 'available', hold_until = null
   where status = 'reserved' and hold_until < now()
     and not exists (select 1 from orders o where o.work_id = works.work_id and o.status = 'paid');
$$;
