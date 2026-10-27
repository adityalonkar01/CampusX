-- Prompt 13: Supabase core profile and role foundation.
-- Applies to Supabase PostgreSQL. Do not insert passwords here; Supabase Auth owns credentials.
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  user_category text not null check (user_category in ('ADMIN','STUDENT')),
  status text not null default 'PENDING' check (status in ('PENDING','ACTIVE','SUSPENDED','DISABLED','REJECTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_email_lower_idx on public.profiles (lower(email));

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table if not exists public.system_roles (
  role_key text primary key,
  role_name text not null,
  description text,
  role_category text not null check (role_category in ('ADMIN','STUDENT')),
  created_at timestamptz not null default now()
);
