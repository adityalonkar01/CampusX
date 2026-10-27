-- CampusX Prompt 15: Class Representative Operations & Class Coordination
-- Additive migration. Institute Admin owns class master data and CR assignments.

create or replace function public.is_cr_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.has_admin_role('CR_ADMIN');
$$;

create table if not exists public.class_representative_assignments (
  id uuid primary key default gen_random_uuid(),
  cr_user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  start_date date not null default current_date,
  end_date date,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE','COMPLETED','REPLACED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create unique index if not exists uq_cr_one_active_class
  on public.class_representative_assignments(cr_user_id)
  where status = 'ACTIVE';
create unique index if not exists uq_class_one_active_cr
  on public.class_representative_assignments(class_id)
  where status = 'ACTIVE';

create or replace function public.current_cr_class_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select cra.class_id
  from public.class_representative_assignments cra
  where cra.cr_user_id = auth.uid()
    and cra.status = 'ACTIVE'
    and (cra.end_date is null or cra.end_date >= current_date)
  order by cra.start_date desc, cra.created_at desc
  limit 1;
$$;

create or replace function public.current_student_class_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select c.id
  from public.student_users su
  join public.students s on s.id = su.student_record_id
  join public.classes c
    on c.program_id = s.program_id
   and c.division_id = s.division_id
   and c.academic_year_id = s.academic_year_id
   and c.semester = s.semester
  where su.user_id = auth.uid()
    and su.role_key = 'STUDENT_USER'
    and su.status = 'ACTIVE'
    and c.status = 'ACTIVE'
  order by c.created_at desc
  limit 1;
$$;

create or replace function public.student_belongs_to_class(p_student_id uuid, p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.students s
    join public.classes c
      on c.program_id = s.program_id
     and c.division_id = s.division_id
     and c.academic_year_id = s.academic_year_id
     and c.semester = s.semester
    where s.id = p_student_id
      and c.id = p_class_id
      and c.status = 'ACTIVE'
  );
$$;

create or replace function public.faculty_assigned_to_class(p_faculty_id uuid, p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.faculty_class_assignments fca
    where fca.faculty_id = p_faculty_id
      and fca.class_id = p_class_id
      and fca.status = 'ACTIVE'
  );
$$;

-- Safe CR student directory. This deliberately exposes only coordination-safe fields.
create or replace function public.get_cr_class_students()
returns table (
  id uuid,
  student_id text,
  first_name text,
  middle_name text,
  last_name text,
  roll_number text,
  program_id uuid,
  semester integer,
  division_id uuid,
  academic_year_id uuid,
  cgpa numeric,
  status text
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select s.id, s.student_id, s.first_name, s.middle_name, s.last_name,
         s.roll_number, s.program_id, s.semester, s.division_id,
         s.academic_year_id, s.cgpa, s.status
  from public.students s
  where public.is_cr_admin()
    and public.student_belongs_to_class(s.id, public.current_cr_class_id())
  order by coalesce(s.roll_number, s.student_id), s.student_id;
$$;

-- Safe Faculty recipient directory for the current CR class.
create or replace function public.get_cr_relevant_faculty()
returns table (
  faculty_record_id uuid,
  faculty_id text,
  full_name text,
  designation text,
  subject_id uuid,
  subject_code text,
  subject_name text
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select distinct f.id,
         f.faculty_id,
         trim(concat_ws(' ', f.first_name, f.middle_name, f.last_name)) as full_name,
         f.designation,
         fca.subject_id,
         sub.code,
         sub.name as subject_name
  from public.faculty_class_assignments fca
  join public.faculty f on f.id = fca.faculty_id
  left join public.subjects sub on sub.id = fca.subject_id
  where public.is_cr_admin()
    and fca.class_id = public.current_cr_class_id()
    and fca.status = 'ACTIVE'
    and f.status = 'ACTIVE'
  order by full_name, subject_name nulls last;
$$;

create table if not exists public.class_academic_updates (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  faculty_id uuid references public.faculty(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  source_type text not null check (source_type in ('FACULTY','CR_COORDINATION','ADMIN')),
  title text not null,
  description text not null,
  priority text not null default 'NORMAL' check (priority in ('NORMAL','IMPORTANT','URGENT')),
  publish_date timestamptz not null default now(),
  status text not null default 'PUBLISHED' check (status in ('DRAFT','PUBLISHED','ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  faculty_id uuid references public.faculty(id) on delete set null,
  title text not null,
  description text,
  assigned_date date not null default current_date,
  due_date date not null,
  submission_type text not null default 'ONLINE' check (submission_type in ('ONLINE','PHYSICAL','PRACTICAL','PRESENTATION','OTHER')),
  status text not null default 'OPEN' check (status in ('UPCOMING','OPEN','DUE_SOON','CLOSED')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_date >= assigned_date)
);

create table if not exists public.class_faculty_messages (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  cr_user_id uuid not null references auth.users(id) on delete cascade,
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  topic text not null,
  message text not null,
  priority text not null default 'NORMAL' check (priority in ('NORMAL','IMPORTANT','URGENT')),
  status text not null default 'SENT' check (status in ('SENT','VIEWED','RESPONDED','FOLLOW_UP_REQUIRED','RESOLVED','CLOSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_faculty_message_replies (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.class_faculty_messages(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null check (sender_role in ('CR_ADMIN','FACULTY_ADMIN','INSTITUTE_ADMIN')),
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.class_announcements (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  message text not null,
  category text not null default 'GENERAL' check (category in ('ACADEMIC','ADMINISTRATIVE','EVENT','REMINDER','GENERAL')),
  priority text not null default 'NORMAL' check (priority in ('NORMAL','IMPORTANT','URGENT')),
  publish_date timestamptz not null default now(),
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  status text not null default 'PUBLISHED' check (status in ('DRAFT','PUBLISHED','ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at is null or expires_at >= publish_date)
);

create table if not exists public.class_requests (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  category text not null,
  title text not null,
  description text,
  priority text not null default 'MEDIUM' check (priority in ('LOW','MEDIUM','HIGH','CRITICAL')),
  status text not null default 'SUBMITTED' check (status in ('SUBMITTED','UNDER_REVIEW','FORWARDED','RESOLVED','REJECTED','CLOSED')),
  forwarded_to_role text check (forwarded_to_role is null or forwarded_to_role in ('FACULTY_ADMIN','STUDENT_ADMIN','INSTITUTE_ADMIN')),
  forwarded_to_user uuid references auth.users(id) on delete set null,
  cr_notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_feedback (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  category text not null,
  rating smallint check (rating between 1 and 5),
  feedback text not null,
  identity_visibility text not null default 'NAMED' check (identity_visibility in ('NAMED','HIDDEN_IN_CR_VIEW')),
  status text not null default 'NEW' check (status in ('NEW','REVIEWED','NEEDS_ATTENTION','RESOLVED')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_events (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  category text not null,
  description text,
  event_date date not null,
  start_time time,
  end_time time,
  venue text,
  coordinator text,
  status text not null default 'PLANNED' check (status in ('PLANNED','SCHEDULED','ONGOING','COMPLETED','CANCELLED')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time is null or start_time is null or end_time > start_time)
);

create table if not exists public.class_activities (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  category text not null,
  description text,
  activity_date date not null,
  organizer text,
  status text not null default 'PLANNED' check (status in ('PLANNED','ONGOING','COMPLETED','CANCELLED')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_notifications (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  recipient_user_id uuid references auth.users(id) on delete cascade,
  notification_type text not null,
  title text not null,
  message text,
  related_record_type text,
  related_record_id uuid,
  read_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Keep updated_at behavior consistent with the rest of CampusX.
do $$
declare t text;
begin
  foreach t in array array[
    'class_representative_assignments','class_academic_updates','class_assignments',
    'class_faculty_messages','class_announcements','class_requests','class_feedback',
    'class_events','class_activities'
  ] loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', t, t);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- Baseline indexes; additional FK/status coverage is added in migration 018.
create index if not exists idx_cra_cr_user on public.class_representative_assignments(cr_user_id);
create index if not exists idx_cra_class on public.class_representative_assignments(class_id);
create index if not exists idx_cra_status on public.class_representative_assignments(status);
create index if not exists idx_cau_class on public.class_academic_updates(class_id);
create index if not exists idx_ca_class on public.class_assignments(class_id);
create index if not exists idx_ca_due_date on public.class_assignments(due_date);
create index if not exists idx_cfm_class on public.class_faculty_messages(class_id);
create index if not exists idx_cfm_cr on public.class_faculty_messages(cr_user_id);
create index if not exists idx_cfm_faculty on public.class_faculty_messages(faculty_id);
create index if not exists idx_cfa_class on public.class_announcements(class_id);
create index if not exists idx_crq_class on public.class_requests(class_id);
create index if not exists idx_crq_status on public.class_requests(status);
create index if not exists idx_cf_class on public.class_feedback(class_id);
create index if not exists idx_ce_class on public.class_events(class_id);
create index if not exists idx_ce_date on public.class_events(event_date);
create index if not exists idx_cact_class on public.class_activities(class_id);
create index if not exists idx_cn_class on public.class_notifications(class_id);
create index if not exists idx_cn_recipient on public.class_notifications(recipient_user_id);

alter table public.class_representative_assignments enable row level security;
alter table public.class_academic_updates enable row level security;
alter table public.class_assignments enable row level security;
alter table public.class_faculty_messages enable row level security;
alter table public.class_faculty_message_replies enable row level security;
alter table public.class_announcements enable row level security;
alter table public.class_requests enable row level security;
alter table public.class_feedback enable row level security;
alter table public.class_events enable row level security;
alter table public.class_activities enable row level security;
alter table public.class_notifications enable row level security;

grant select, insert, update, delete on public.class_representative_assignments to authenticated;
grant select, insert, update, delete on public.class_academic_updates to authenticated;
grant select, insert, update, delete on public.class_assignments to authenticated;
grant select, insert, update, delete on public.class_faculty_messages to authenticated;
grant select, insert, update, delete on public.class_faculty_message_replies to authenticated;
grant select, insert, update, delete on public.class_announcements to authenticated;
grant select, insert, update, delete on public.class_requests to authenticated;
grant select, insert, update, delete on public.class_feedback to authenticated;
grant select, insert, update, delete on public.class_events to authenticated;
grant select, insert, update, delete on public.class_activities to authenticated;
grant select, insert, update, delete on public.class_notifications to authenticated;
