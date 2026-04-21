-- FanFest schema
-- Run in Supabase SQL editor (or `supabase db push`).

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

create policy "profiles are readable by all authenticated"
  on public.profiles for select to authenticated using (true);

create policy "users can upsert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

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

-- Users can read their own connection metadata (not tokens, via view below if desired)
create policy "users read own spotify account"
  on public.spotify_accounts for select to authenticated using (auth.uid() = user_id);

-- Tokens are written by the server (service role) only; no insert/update policy for users.

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
create policy "rooms readable by authenticated"
  on public.chat_rooms for select to authenticated using (true);

-- =========================================
-- chat_members (simple: anyone authenticated can join default room)
-- =========================================
create table if not exists public.chat_members (
  room_id uuid references public.chat_rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (room_id, user_id)
);

alter table public.chat_members enable row level security;
create policy "members readable by authenticated"
  on public.chat_members for select to authenticated using (true);
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

create policy "messages readable by authenticated"
  on public.chat_messages for select to authenticated using (true);

create policy "users can send messages as self"
  on public.chat_messages for insert to authenticated
  with check (auth.uid() = user_id);

-- Realtime: add chat_messages to realtime publication
alter publication supabase_realtime add table public.chat_messages;
