-- NEBULA 구매 기록 (Supabase / Postgres) — 초안
-- 사용자는 Supabase Auth(auth.users)가 관리. 여기에는 '무엇을 볼 수 있는지'만 저장.
create table if not exists public.entitlements (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null check (kind in ('member', 'pass')),     -- 구독 / 하루 입장권
  cell_id     text,                                                -- pass일 때 전시 id (예: c005)
  product_id  text not null,                                       -- nebula.member.monthly 등
  source      text not null check (source in ('app_store', 'play_store', 'web')),
  external_id text not null,                                       -- 스토어·결제사의 거래 번호 (중복 방지)
  starts_at   timestamptz not null default now(),
  entered_at  timestamptz,                                         -- pass: 처음 입장한 때 (이때부터 24시간)
  expires_at  timestamptz,                                         -- 구독 만료일 / pass: 입장 전엔 구매+30일, 입장 후엔 입장+24시간
  revoked_at  timestamptz,                                         -- 환불·취소
  created_at  timestamptz not null default now(),
  unique (source, external_id)
);
create index if not exists entitlements_user on public.entitlements (user_id);

-- 본인 것만 읽기. 쓰기는 서버(웹훅)만 — 클라이언트 쓰기 정책 없음.
alter table public.entitlements enable row level security;
create policy "read own" on public.entitlements for select using (auth.uid() = user_id);

-- '이 전시를 볼 수 있나?' 한 번에 확인
create or replace function public.can_view(p_cell text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from entitlements
    where user_id = auth.uid() and revoked_at is null
      and (expires_at is null or expires_at > now())
      and (kind = 'member' or (kind = 'pass' and cell_id = p_cell))
  );
$$;

-- 하루 입장권 첫 입장: 입장 전 pass가 있으면 지금부터 24시간으로 바꿈. 남은 만료 시각을 돌려줌
create or replace function public.enter_pass(p_cell text) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare t timestamptz;
begin
  select expires_at into t from entitlements
   where user_id = auth.uid() and kind = 'pass' and cell_id = p_cell and revoked_at is null
     and entered_at is not null and expires_at > now() order by expires_at desc limit 1;
  if t is not null then return t; end if;
  update entitlements set entered_at = now(), expires_at = now() + interval '24 hours'
   where id = (select id from entitlements
     where user_id = auth.uid() and kind = 'pass' and cell_id = p_cell and revoked_at is null
       and entered_at is null and expires_at > now() order by starts_at limit 1)
  returning expires_at into t;
  return t;
end $$;

-- 유료 전시 본문: 구매한 사람만 읽기 (무료 앞부분은 공개 파일에 그대로 둠)
create table if not exists public.paid_blocks (
  cell_id text not null, "order" numeric not null, block jsonb not null,
  primary key (cell_id, "order")
);
alter table public.paid_blocks enable row level security;
create policy "read if entitled" on public.paid_blocks for select using (public.can_view(cell_id));
