-- CampusX Prompt 14: Faculty Operations & Academic Workload Management
-- Additive migration. Faculty master records remain owned by INSTITUTE_ADMIN.

create or replace function public.is_faculty_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.has_admin_role('FACULTY_ADMIN');
$$;

create table if not exists public.faculty_subject_assignments (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  program_id uuid references public.programs(id) on delete set null,
  academic_year_id uuid references public.academic_years(id) on delete set null,
  semester integer,
  assignment_type text not null default 'PRIMARY' check (assignment_type in ('PRIMARY','CO_FACULTY','GUEST','PRACTICAL_INSTRUCTOR')),
  start_date date,
  end_date date,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE','COMPLETED')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create table if not exists public.faculty_class_assignments (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  weekly_lectures numeric(5,2) not null default 0 check (weekly_lectures >= 0),
  practical_hours numeric(5,2) not null default 0 check (practical_hours >= 0),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE','COMPLETED')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faculty_workload (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  academic_year_id uuid references public.academic_years(id) on delete set null,
  lecture_hours numeric(5,2) not null default 0 check (lecture_hours >= 0),
  practical_hours numeric(5,2) not null default 0 check (practical_hours >= 0),
  administrative_hours numeric(5,2) not null default 0 check (administrative_hours >= 0),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (faculty_id, academic_year_id)
);

create table if not exists public.faculty_attendance (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  attendance_date date not null,
  check_in time,
  check_out time,
  status text not null check (status in ('PRESENT','ABSENT','ON_LEAVE','HALF_DAY','OFFICIAL_DUTY')),
  working_hours numeric(5,2) check (working_hours is null or working_hours >= 0),
  remarks text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (faculty_id, attendance_date)
);

create table if not exists public.faculty_leave_requests (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  leave_type text not null check (leave_type in ('CASUAL','MEDICAL','EARNED','OFFICIAL_DUTY','ACADEMIC','OTHER')),
  start_date date not null,
  end_date date not null,
  reason text not null,
  priority text not null default 'MEDIUM' check (priority in ('LOW','MEDIUM','HIGH','CRITICAL')),
  status text not null default 'SUBMITTED' check (status in ('SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','CANCELLED')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.faculty_requests (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  request_type text not null,
  title text not null,
  description text,
  priority text not null default 'MEDIUM' check (priority in ('LOW','MEDIUM','HIGH','CRITICAL')),
  status text not null default 'SUBMITTED' check (status in ('SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','CLOSED')),
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faculty_resources (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  resource_type text not null check (resource_type in ('NOTES','PRESENTATION','ASSIGNMENT','REFERENCE','LAB_MANUAL','QUESTION_BANK','OTHER')),
  title text not null,
  description text,
  storage_path text,
  status text not null default 'DRAFT' check (status in ('DRAFT','PUBLISHED','ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faculty_responsibilities (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  responsibility_type text not null,
  title text not null,
  start_date date,
  end_date date,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','COMPLETED','CANCELLED')),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faculty_activities (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  category text not null,
  title text not null,
  organizer text,
  activity_date date not null,
  status text not null default 'COMPLETED' check (status in ('PLANNED','ONGOING','COMPLETED','CANCELLED')),
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faculty_schedule (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  class_id uuid references public.classes(id) on delete set null,
  schedule_date date,
  day_of_week smallint check (day_of_week between 1 and 7),
  start_time time not null,
  end_time time not null,
  room text,
  mode text not null default 'CLASSROOM' check (mode in ('CLASSROOM','LAB','ONLINE','HYBRID')),
  status text not null default 'SCHEDULED' check (status in ('SCHEDULED','COMPLETED','CANCELLED')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table if not exists public.faculty_documents (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  document_type text not null,
  document_name text not null,
  storage_path text,
  verification_status text not null default 'PENDING' check (verification_status in ('PENDING','VERIFIED','REJECTED','EXPIRED')),
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_faculty_subject_assignments_faculty on public.faculty_subject_assignments(faculty_id);
create index if not exists idx_faculty_subject_assignments_subject on public.faculty_subject_assignments(subject_id);
create index if not exists idx_faculty_class_assignments_faculty on public.faculty_class_assignments(faculty_id);
create index if not exists idx_faculty_attendance_date on public.faculty_attendance(attendance_date);
create index if not exists idx_faculty_attendance_faculty on public.faculty_attendance(faculty_id);
create index if not exists idx_faculty_leave_status on public.faculty_leave_requests(status);
create index if not exists idx_faculty_requests_status on public.faculty_requests(status);
create index if not exists idx_faculty_schedule_faculty on public.faculty_schedule(faculty_id);
create index if not exists idx_faculty_schedule_date on public.faculty_schedule(schedule_date);

-- Shared updated_at function already exists in CampusX; recreate safely for portability.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'faculty_subject_assignments','faculty_class_assignments','faculty_workload','faculty_attendance',
    'faculty_leave_requests','faculty_requests','faculty_resources','faculty_responsibilities',
    'faculty_activities','faculty_schedule','faculty_documents'
  ] loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', t, t);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- RLS
alter table public.faculty_subject_assignments enable row level security;
alter table public.faculty_class_assignments enable row level security;
alter table public.faculty_workload enable row level security;
alter table public.faculty_attendance enable row level security;
alter table public.faculty_leave_requests enable row level security;
alter table public.faculty_requests enable row level security;
alter table public.faculty_resources enable row level security;
alter table public.faculty_responsibilities enable row level security;
alter table public.faculty_activities enable row level security;
alter table public.faculty_schedule enable row level security;
alter table public.faculty_documents enable row level security;

-- Policies are recreated deterministically.
do $$
declare t text;
begin
  foreach t in array array[
    'faculty_subject_assignments','faculty_class_assignments','faculty_workload','faculty_attendance',
    'faculty_leave_requests','faculty_requests','faculty_resources','faculty_responsibilities',
    'faculty_activities','faculty_schedule'
  ] loop
    execute format('drop policy if exists "Faculty ops: authorized read" on public.%I', t);
    execute format('drop policy if exists "Faculty ops: Faculty and Institute Admin mutate" on public.%I', t);
    execute format('create policy "Faculty ops: authorized read" on public.%I for select to authenticated using (public.is_faculty_admin() or public.is_institute_admin() or public.is_super_admin())', t);
    execute format('create policy "Faculty ops: Faculty and Institute Admin mutate" on public.%I for all to authenticated using (public.is_faculty_admin() or public.is_institute_admin()) with check (public.is_faculty_admin() or public.is_institute_admin())', t);
  end loop;
end $$;

drop policy if exists "Faculty documents: authorized read" on public.faculty_documents;
drop policy if exists "Faculty documents: Institute Admin mutate" on public.faculty_documents;
create policy "Faculty documents: authorized read"
  on public.faculty_documents for select to authenticated
  using (public.is_faculty_admin() or public.is_institute_admin() or public.is_super_admin());
create policy "Faculty documents: Institute Admin mutate"
  on public.faculty_documents for all to authenticated
  using (public.is_institute_admin()) with check (public.is_institute_admin());

-- Grants complement RLS; they do not bypass it.
grant select, insert, update, delete on public.faculty_subject_assignments to authenticated;
grant select, insert, update, delete on public.faculty_class_assignments to authenticated;
grant select, insert, update, delete on public.faculty_workload to authenticated;
grant select, insert, update, delete on public.faculty_attendance to authenticated;
grant select, insert, update, delete on public.faculty_leave_requests to authenticated;
grant select, insert, update, delete on public.faculty_requests to authenticated;
grant select, insert, update, delete on public.faculty_resources to authenticated;
grant select, insert, update, delete on public.faculty_responsibilities to authenticated;
grant select, insert, update, delete on public.faculty_activities to authenticated;
grant select, insert, update, delete on public.faculty_schedule to authenticated;
grant select, insert, update, delete on public.faculty_documents to authenticated;
