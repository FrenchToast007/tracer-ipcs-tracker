-- ============================================================================
-- Tracer IPCS Tracker — Supabase schema
-- Run this entire file once in the Supabase SQL editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ============================================================================

-- ---------- 1. USER PROFILES ----------
-- Every signed-up user gets a row here. New users are not approved by default.
-- You (the owner) approve users by flipping `approved` to true in the
-- Table Editor after they sign up.

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  approved boolean not null default false,
  role text not null default 'member',
  created_at timestamptz not null default now()
);

-- Trigger: whenever a new auth.users row is created, add a profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, approved)
  values (new.id, new.email, false)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- 2. APP STATE (shared mutable blob) ----------
-- Single row keyed by id. All approved users read/write the same row.
-- Simple & effective for a 5-20 person team.

create table if not exists public.app_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

-- Seed the single shared row if it doesn't exist yet
insert into public.app_state (id, data)
values ('tracer-ipcs-main', '{}'::jsonb)
on conflict (id) do nothing;

-- ---------- 3. ROW LEVEL SECURITY ----------

alter table public.user_profiles enable row level security;
alter table public.app_state enable row level security;

-- user_profiles policies
-- Everyone authenticated can read profiles (so you can see who is pending)
drop policy if exists "authenticated read profiles" on public.user_profiles;
create policy "authenticated read profiles"
  on public.user_profiles for select
  to authenticated
  using (true);

-- Users can update only their own name (not approved flag, not role)
drop policy if exists "users update own name" on public.user_profiles;
create policy "users update own name"
  on public.user_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- app_state policies — only approved users can read/write
drop policy if exists "approved read app_state" on public.app_state;
create policy "approved read app_state"
  on public.app_state for select
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and approved = true
    )
  );

drop policy if exists "approved update app_state" on public.app_state;
create policy "approved update app_state"
  on public.app_state for update
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and approved = true
    )
  )
  with check (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and approved = true
    )
  );

drop policy if exists "approved insert app_state" on public.app_state;
create policy "approved insert app_state"
  on public.app_state for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and approved = true
    )
  );

-- ---------- 4. REALTIME ----------
-- Enable realtime so every client gets app_state updates live
alter publication supabase_realtime add table public.app_state;

-- ============================================================================
-- ONE-TIME SETUP AFTER THIS SCHEMA RUNS:
--
-- 1. Go to Authentication → Providers → Email
--    - Make sure Email is enabled
--    - TURN OFF "Confirm email" if you want users to sign in immediately
--      without clicking a verification link (easier for a small team)
--
-- 2. Sign up YOURSELF first through the app
--
-- 3. Come back to Table Editor → user_profiles → find your row
--    → flip `approved` to true and set `role` to 'admin'
--
-- 4. Now every time a teammate signs up, you'll see them here with
--    approved=false. Flip their approved flag to let them in.
-- ============================================================================
