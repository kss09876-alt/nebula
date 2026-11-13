-- ARTMOS 회원 정보 (Supabase / Postgres) — 초안. 계정·비밀번호는 Supabase Auth(auth.users)가 보관.
-- 여기에는 항해명(닉네임)·동의 기록만. 항해명은 대소문자·띄어쓰기를 무시하고 겹치지 않게(유일).
create extension if not exists citext;

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nickname    text,
  nick_key    text generated always as (lower(regexp_replace(btrim(nickname), '\s+', ' ', 'g'))) stored,
  marketing   boolean not null default false,     -- [선택] 새 전시·이벤트 소식
  agreed_at   timestamptz,                         -- 필수 약관 동의 시각
  lang        text,
  created_at  timestamptz not null default now(),
  constraint nickname_len check (nickname is null or char_length(btrim(nickname)) between 2 and 20)
);
create unique index if not exists profiles_nick_unique on public.profiles (nick_key) where nickname is not null;

alter table public.profiles enable row level security;
create policy "read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- 가입하면 profiles 한 줄 자동 생성 (이메일 가입 때 보낸 동의 기록을 옮김)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, marketing, agreed_at, lang)
  values (new.id,
          coalesce((new.raw_user_meta_data->>'marketing')::boolean, false),
          coalesce((new.raw_user_meta_data->>'agreed_at')::timestamptz, now()),
          new.raw_user_meta_data->>'lang');
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- 항해명 쓸 수 있나? (다른 사람 이름은 보여 주지 않고 '된다/안 된다'만)
create or replace function public.nickname_available(p_nick text) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (
    select 1 from profiles
    where nick_key = lower(regexp_replace(btrim(p_nick), '\s+', ' ', 'g')) and id <> coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000')
  );
$$;
