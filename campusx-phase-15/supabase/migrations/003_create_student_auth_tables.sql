-- Prompt 13: Student Portal registration request and approved student role tables.
-- student_users.student_record_id receives its students(id) FK in migration 005 after students exists.
create table if not exists public.student_account_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id text not null,
  admission_number text not null,
  first_name text not null,
  middle_name text,
  last_name text not null,
  dob date not null,
  gender text not null,
  email text not null,
  phone text not null,
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED','SUSPENDED')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists student_account_requests_user_id_uidx on public.student_account_requests(user_id);
create index if not exists student_account_requests_status_idx on public.student_account_requests(status);
create index if not exists student_account_requests_lookup_idx on public.student_account_requests(student_id, admission_number);

create trigger set_student_account_requests_updated_at
before update on public.student_account_requests
for each row execute function public.set_updated_at();

create table if not exists public.student_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_record_id uuid not null,
  role_key text not null default 'STUDENT_USER' references public.system_roles(role_key),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','SUSPENDED','DISABLED')),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_users_role_must_be_student_user check (role_key = 'STUDENT_USER')
);

create unique index if not exists student_users_user_id_uidx on public.student_users(user_id);
create index if not exists student_users_student_record_id_idx on public.student_users(student_record_id);
create index if not exists student_users_status_idx on public.student_users(status);

create trigger set_student_users_updated_at
before update on public.student_users
for each row execute function public.set_updated_at();
