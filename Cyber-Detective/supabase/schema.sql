-- Cyber Detective: schema, Row Level Security and RPC functions.
-- Run this first in the Supabase SQL editor, then run seed.sql.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 3 and 20),
  created_at timestamptz not null default now()
);
-- Case-insensitive unique nicknames
create unique index if not exists profiles_nickname_ci on public.profiles (lower(nickname));

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null                      -- {"en": "...", "ar": "..."}
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  position int not null unique check (position between 1 and 20),
  stage int not null check (stage between 1 and 4),
  category_id uuid not null references public.categories(id),
  scenario jsonb not null
);
create index if not exists questions_category_idx on public.questions(category_id);

create table if not exists public.options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  position int not null check (position between 0 and 3),
  label jsonb not null,
  unique (question_id, position)
);

-- Secret: never readable by the browser (RLS on, no policies).
create table if not exists public.answer_keys (
  question_id uuid primary key references public.questions(id) on delete cascade,
  correct_option_id uuid not null references public.options(id),
  feedback jsonb not null                  -- {"en": {threat, lesson, wrong[4]}, "ar": {...}}
);

-- Server-side attempt tracking (written only by the Edge Function)
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'active' check (status in ('active','finished','abandoned','rejected','expired')),
  score int,
  duration_ms int
);
create index if not exists attempts_user_started_idx on public.attempts(user_id, started_at desc);

create table if not exists public.attempt_answers (
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id),
  option_id uuid not null references public.options(id),
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  primary key (attempt_id, question_id)
);

-- One best entry per participant
create table if not exists public.leaderboard_entries (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  score int not null check (score between 0 and 20),
  duration_ms int not null check (duration_ms > 0),
  achieved_at timestamptz not null default now()
);
create index if not exists leaderboard_rank_idx
  on public.leaderboard_entries (score desc, duration_ms asc, achieved_at asc);

-- ---------------------------------------------------------------- RLS
alter table public.profiles            enable row level security;
alter table public.categories          enable row level security;
alter table public.questions           enable row level security;
alter table public.options             enable row level security;
alter table public.answer_keys         enable row level security;
alter table public.attempts            enable row level security;
alter table public.attempt_answers     enable row level security;
alter table public.leaderboard_entries enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant select on public.categories, public.questions, public.options to authenticated;
grant select on public.profiles, public.leaderboard_entries to authenticated;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for select to authenticated using (id = auth.uid());

drop policy if exists "read categories" on public.categories;
create policy "read categories" on public.categories for select to authenticated using (true);
drop policy if exists "read questions" on public.questions;
create policy "read questions" on public.questions for select to authenticated using (true);
drop policy if exists "read options" on public.options;
create policy "read options" on public.options for select to authenticated using (true);

-- Leaderboard rows contain no nicknames, so they can be readable (enables realtime refresh).
drop policy if exists "read leaderboard" on public.leaderboard_entries;
create policy "read leaderboard" on public.leaderboard_entries for select to authenticated using (true);

-- answer_keys, attempts, attempt_answers: no policies => only the service role (Edge Function) can touch them.

-- ---------------------------------------------------------------- RPC functions
create or replace function public.nickname_available(p_nickname text)
returns boolean language sql security definer set search_path = public stable as $$
  select not exists (select 1 from public.profiles where lower(nickname) = lower(btrim(p_nickname)));
$$;

create or replace function public.register_nickname(p_nickname text)
returns void language plpgsql security definer set search_path = public as $$
declare n text := btrim(p_nickname);
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if n is null or char_length(n) not between 3 and 20 or n ~ '[[:cntrl:]<>]' then
    raise exception 'invalid_nickname';
  end if;
  insert into public.profiles(id, nickname) values (auth.uid(), n);
exception when unique_violation then
  if exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'already_registered';
  end if;
  raise exception 'nickname_taken';
end $$;

create or replace function public.get_leaderboard(p_limit int default 10)
returns jsonb language plpgsql security definer set search_path = public stable as $$
declare res jsonb;
begin
  with ranked as (
    select row_number() over (order by e.score desc, e.duration_ms asc, e.achieved_at asc) as rank,
           p.nickname, e.score, e.duration_ms, e.user_id
    from public.leaderboard_entries e join public.profiles p on p.id = e.user_id
  )
  select jsonb_build_object(
    'total', (select count(*) from ranked),
    'top', coalesce((select jsonb_agg(jsonb_build_object('rank', r.rank, 'nickname', r.nickname,
              'score', r.score, 'duration_ms', r.duration_ms, 'is_me', r.user_id = auth.uid()) order by r.rank)
            from ranked r where r.rank <= least(greatest(p_limit, 1), 50)), '[]'::jsonb),
    'me', (select jsonb_build_object('rank', r.rank, 'nickname', r.nickname, 'score', r.score,
              'duration_ms', r.duration_ms, 'is_me', true) from ranked r where r.user_id = auth.uid())
  ) into res;
  return res;
end $$;

-- Server-only helpers (called by the Edge Function with the service role)
create or replace function public.submit_best(p_user uuid, p_score int, p_duration_ms int)
returns boolean language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into public.leaderboard_entries(user_id, score, duration_ms, achieved_at)
  values (p_user, p_score, p_duration_ms, now())
  on conflict (user_id) do update
    set score = excluded.score, duration_ms = excluded.duration_ms, achieved_at = now()
    where excluded.score > leaderboard_entries.score
       or (excluded.score = leaderboard_entries.score and excluded.duration_ms < leaderboard_entries.duration_ms);
  get diagnostics n = row_count;
  return n > 0;
end $$;

create or replace function public.standing_for(p_user uuid)
returns table(rank bigint, total bigint, score int, duration_ms int)
language sql security definer set search_path = public stable as $$
  select (select count(*) + 1 from public.leaderboard_entries o
           where o.score > e.score
              or (o.score = e.score and (o.duration_ms < e.duration_ms
                  or (o.duration_ms = e.duration_ms and o.achieved_at < e.achieved_at)))),
         (select count(*) from public.leaderboard_entries),
         e.score, e.duration_ms
  from public.leaderboard_entries e where e.user_id = p_user;
$$;

revoke all on function public.submit_best(uuid, int, int) from public, anon, authenticated;
revoke all on function public.standing_for(uuid) from public, anon, authenticated;
revoke all on function public.nickname_available(text) from public, anon;
revoke all on function public.register_nickname(text) from public, anon;
revoke all on function public.get_leaderboard(int) from public, anon;
grant execute on function public.nickname_available(text) to authenticated;
grant execute on function public.register_nickname(text) to authenticated;
grant execute on function public.get_leaderboard(int) to authenticated;
grant execute on function public.submit_best(uuid, int, int) to service_role;
grant execute on function public.standing_for(uuid) to service_role;

-- Live leaderboard updates
do $$ begin
  alter publication supabase_realtime add table public.leaderboard_entries;
exception when duplicate_object then null; end $$;
