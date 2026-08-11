-- FanFest schema (v4 — consolidated)
-- Run in Supabase SQL editor. Safe to run more than once.

-- =========================================
-- profiles
-- =========================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable by all authenticated" on public.profiles;
create policy "profiles are readable by all authenticated"
  on public.profiles for select to authenticated using (true);

drop policy if exists "users can upsert own profile" on public.profiles;
create policy "users can upsert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any users created before the trigger existed
insert into public.profiles (id, display_name)
select u.id, coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1))
from auth.users u
on conflict (id) do nothing;

-- =========================================
-- spotify_accounts
-- =========================================
create table if not exists public.spotify_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  spotify_id text unique,
  display_name text,
  avatar_url text,
  access_token text not null,
  refresh_token text not null,
  scope text,
  expires_at timestamptz not null,
  connected_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.spotify_accounts enable row level security;

drop policy if exists "users read own spotify account" on public.spotify_accounts;
create policy "users read own spotify account"
  on public.spotify_accounts for select to authenticated using (auth.uid() = user_id);

-- Tokens are written by the server (service role) only; no user insert/update policy.

-- =========================================
-- points_events — append-only XP ledger
-- =========================================
-- dedupe_key makes every award idempotent. Re-running a Spotify scan, a double
-- click, or a second browser tab can never pay out twice for the same thing.
create table if not exists public.points_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null,             -- 'spotify' | 'presence' | 'checkin' | 'social' | 'trivia' | 'seed'
  kind text not null,               -- human-readable label shown in the activity feed
  points int not null,
  dedupe_key text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create unique index if not exists points_events_user_dedupe_idx
  on public.points_events (user_id, dedupe_key);

create index if not exists points_events_user_created_idx
  on public.points_events (user_id, created_at desc);

alter table public.points_events enable row level security;

drop policy if exists "users read own points" on public.points_events;
create policy "users read own points"
  on public.points_events for select to authenticated using (auth.uid() = user_id);

-- No insert/update/delete policy: only the service role can award points.

-- Aggregate totals. security_invoker so the view respects the RLS above.
create or replace view public.xp_totals
  with (security_invoker = true) as
  select user_id, coalesce(sum(points), 0)::int as xp
  from public.points_events
  group by user_id;

-- =========================================
-- event_checkins — listening party check-in
-- =========================================
create table if not exists public.event_checkins (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_slug text not null,
  checked_in_at timestamptz default now(),
  email_sent_at timestamptz,
  email_error text,
  primary key (user_id, event_slug)
);

alter table public.event_checkins enable row level security;

drop policy if exists "users read own checkins" on public.event_checkins;
create policy "users read own checkins"
  on public.event_checkins for select to authenticated using (auth.uid() = user_id);

-- Written by the server (service role) only.

-- =========================================
-- chat_rooms
-- =========================================
create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

insert into public.chat_rooms (name, is_default)
select 'The Lounge', true
where not exists (select 1 from public.chat_rooms where is_default);

alter table public.chat_rooms enable row level security;

drop policy if exists "rooms readable by authenticated" on public.chat_rooms;
create policy "rooms readable by authenticated"
  on public.chat_rooms for select to authenticated using (true);

-- =========================================
-- chat_members
-- =========================================
create table if not exists public.chat_members (
  room_id uuid references public.chat_rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (room_id, user_id)
);

alter table public.chat_members enable row level security;

drop policy if exists "members readable by authenticated" on public.chat_members;
create policy "members readable by authenticated"
  on public.chat_members for select to authenticated using (true);

drop policy if exists "users can join rooms" on public.chat_members;
create policy "users can join rooms"
  on public.chat_members for insert to authenticated with check (auth.uid() = user_id);

-- =========================================
-- chat_messages
-- =========================================
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz default now()
);

create index if not exists chat_messages_room_created_idx
  on public.chat_messages (room_id, created_at desc);

alter table public.chat_messages enable row level security;

drop policy if exists "messages readable by authenticated" on public.chat_messages;
create policy "messages readable by authenticated"
  on public.chat_messages for select to authenticated using (true);

drop policy if exists "users can send messages as self" on public.chat_messages;
create policy "users can send messages as self"
  on public.chat_messages for insert to authenticated
  with check (auth.uid() = user_id);

-- Realtime: add chat_messages to the realtime publication (no-op if already there)
do $$
begin
  alter publication supabase_realtime add table public.chat_messages;
exception
  when duplicate_object then null;
end
$$;
