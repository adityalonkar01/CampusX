-- Prompt 13: Academic master data tables.
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE','ARCHIVED')),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  department_id uuid references public.departments(id),
  duration_semesters int,
  description text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE','ARCHIVED')),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.divisions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE','ARCHIVED')),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academic_years (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  description text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE','ARCHIVED')),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists academic_years_single_current_idx on public.academic_years(is_current) where is_current = true;

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  program_id uuid references public.programs(id),
  department_id uuid references public.departments(id),
  description text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE','ARCHIVED')),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  program_id uuid references public.programs(id),
  department_id uuid references public.departments(id),
  semester int,
  credits numeric(4,1),
  description text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE','ARCHIVED')),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  program_id uuid references public.programs(id),
  division_id uuid references public.divisions(id),
  academic_year_id uuid references public.academic_years(id),
  semester int,
  capacity int,
  description text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE','ARCHIVED')),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists programs_department_id_idx on public.programs(department_id);
create index if not exists courses_program_id_idx on public.courses(program_id);
create index if not exists subjects_program_semester_idx on public.subjects(program_id, semester);
create index if not exists classes_program_semester_idx on public.classes(program_id, semester);

create trigger set_departments_updated_at before update on public.departments for each row execute function public.set_updated_at();
create trigger set_programs_updated_at before update on public.programs for each row execute function public.set_updated_at();
create trigger set_divisions_updated_at before update on public.divisions for each row execute function public.set_updated_at();
create trigger set_academic_years_updated_at before update on public.academic_years for each row execute function public.set_updated_at();
create trigger set_courses_updated_at before update on public.courses for each row execute function public.set_updated_at();
create trigger set_subjects_updated_at before update on public.subjects for each row execute function public.set_updated_at();
create trigger set_classes_updated_at before update on public.classes for each row execute function public.set_updated_at();
