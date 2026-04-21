-- FanFest Storage: Avatar Uploads
-- Run in Supabase SQL editor AFTER schema.sql

-- 1) Create the avatars bucket (public so URLs are servable without auth)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2) Allow authenticated users to upload their own avatars
create policy "Users can upload own avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3) Allow authenticated users to update (overwrite) their own avatars
create policy "Users can update own avatar"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4) Allow authenticated users to delete their own avatars
create policy "Users can delete own avatar"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5) Anyone can view avatars (public bucket)
create policy "Avatars are publicly readable"
  on storage.objects for select to public
  using (bucket_id = 'avatars');
