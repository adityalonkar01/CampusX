-- Prompt 13: Student and faculty master tables plus Student Portal operational tables.
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  student_id text unique not null,
  admission_number text unique not null,
  first_name text not null,
  middle_name text,
  last_name text not null,
  dob date not null,
  gender text not null,
  email text unique not null,
  phone text not null,
  alternate_phone text,
  program_id uuid references public.programs(id),
  department_id uuid references public.departments(id),
  semester int,
  division_id uuid references public.divisions(id),
  roll_number text,
  academic_year_id uuid references public.academic_years(id),
  admission_date date,
  enrollment_type text,
  cgpa numeric(4,2) not null default 0,
  backlogs int not null default 0,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE','ON_LEAVE','SUSPENDED','ARCHIVED')),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faculty (
  id uuid primary key default gen_random_uuid(),
  faculty_id text unique not null,
  first_name text not null,
  middle_name text,
  last_name text not null,
  dob date not null,
  gender text not null,
  email text unique not null,
  phone text not null,
  department_id uuid references public.departments(id),
  designation text not null,
  joining_date date,
  employment_type text,
  qualification text,
  specialization text,
  experience numeric(4,1) not null default 0,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE','ON_LEAVE','SUSPENDED','ARCHIVED')),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_users
  add constraint student_users_student_record_fk
  foreign key (student_record_id) references public.students(id) on delete cascade;

create table if not exists public.student_documents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  document_name text not null,
  document_type text,
  status text not null default 'PENDING' check (status in ('PENDING','SUBMITTED','VERIFIED','REJECTED')),
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  subject_id uuid references public.subjects(id),
  attendance_date date,
  status text not null check (status in ('PRESENT','ABSENT','LEAVE')),
  created_at timestamptz not null default now()
);

create table if not exists public.student_academic_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  subject_id uuid references public.subjects(id),
  semester int,
  internal_marks numeric(5,2),
  external_marks numeric(5,2),
  grade text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  request_type text not null,
  description text not null,
  status text not null default 'SUBMITTED' check (status in ('SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','CLOSED')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_lookup_idx on public.students(student_id, admission_number);
create index if not exists students_program_idx on public.students(program_id, semester, division_id);
create index if not exists faculty_department_idx on public.faculty(department_id);
create index if not exists student_documents_student_idx on public.student_documents(student_id);
create index if not exists student_attendance_student_date_idx on public.student_attendance(student_id, attendance_date desc);
create index if not exists student_academic_records_student_idx on public.student_academic_records(student_id);
create index if not exists student_requests_student_idx on public.student_requests(student_id, created_at desc);

create trigger set_students_updated_at before update on public.students for each row execute function public.set_updated_at();
create trigger set_faculty_updated_at before update on public.faculty for each row execute function public.set_updated_at();
create trigger set_student_documents_updated_at before update on public.student_documents for each row execute function public.set_updated_at();
create trigger set_student_academic_records_updated_at before update on public.student_academic_records for each row execute function public.set_updated_at();
create trigger set_student_requests_updated_at before update on public.student_requests for each row execute function public.set_updated_at();
