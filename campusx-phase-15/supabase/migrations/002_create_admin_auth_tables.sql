-- Prompt 13: Administrative registration and approved admin role tables.
create table if not exists public.admin_registration_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  requested_role text not null references public.system_roles(role_key),
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_registration_requests_user_id_idx on public.admin_registration_requests(user_id);
create index if not exists admin_registration_requests_status_idx on public.admin_registration_requests(status);
create index if not exists admin_registration_requests_requested_role_idx on public.admin_registration_requests(requested_role);

create trigger set_admin_registration_requests_updated_at
before update on public.admin_registration_requests
for each row execute function public.set_updated_at();

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_key text not null references public.system_roles(role_key),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','SUSPENDED','DISABLED')),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_users_role_not_student_user check (role_key <> 'STUDENT_USER')
);

create unique index if not exists admin_users_user_id_role_key_uidx on public.admin_users(user_id, role_key);
create index if not exists admin_users_user_id_idx on public.admin_users(user_id);
create index if not exists admin_users_role_status_idx on public.admin_users(role_key, status);

create trigger set_admin_users_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();
