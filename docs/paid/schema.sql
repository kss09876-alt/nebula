-- NEBULA 구매 기록 (Supabase / Postgres) — 초안
-- 사용자는 Supabase Auth(auth.users)가 관리. 여기에는 '무엇을 볼 수 있는지'만 저장.
create table if not exists public.entitlements (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null check (kind in ('member', 'ticket')),   -- 구독 / 전시 한 편
  cell_id     text,                                                -- ticket일 때 전시 id (예: c005)
  product_id  text not null,                                       -- nebula.member.monthly 등
  source      text not null check (source in ('app_store', 'play_store', 'web')),
  external_id text not null,                                       -- 스토어·결제사의 거래 번호 (중복 방지)
  starts_at   timestamptz not null default now(),
  expires_at  timestamptz,                                         -- 구독 만료일 (ticket은 null = 계속 소장)
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
      and (kind = 'member' or (kind = 'ticket' and cell_id = p_cell))
  );
$$;

-- 유료 전시 본문: 구매한 사람만 읽기 (무료 앞부분은 공개 파일에 그대로 둠)
create table if not exists public.paid_blocks (
  cell_id text not null, "order" numeric not null, block jsonb not null,
  primary key (cell_id, "order")
);
alter table public.paid_blocks enable row level security;
create policy "read if entitled" on public.paid_blocks for select using (public.can_view(cell_id));
