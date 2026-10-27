-- Prompt 13: Enable RLS and grant authenticated Data API access. RLS policies in 009 determine row-level access.
alter table public.profiles enable row level security;
alter table public.system_roles enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_registration_requests enable row level security;
alter table public.student_account_requests enable row level security;
alter table public.student_users enable row level security;
alter table public.students enable row level security;
alter table public.faculty enable row level security;
alter table public.departments enable row level security;
alter table public.programs enable row level security;
alter table public.courses enable row level security;
alter table public.subjects enable row level security;
alter table public.classes enable row level security;
alter table public.divisions enable row level security;
alter table public.academic_years enable row level security;
alter table public.student_documents enable row level security;
alter table public.student_attendance enable row level security;
alter table public.student_academic_records enable row level security;
alter table public.student_requests enable row level security;
alter table public.activity_logs enable row level security;
alter table public.auth_audit_logs enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Keep anonymous access closed for application tables by default.
revoke all on all tables in schema public from anon;
revoke usage, select on all sequences in schema public from anon;
