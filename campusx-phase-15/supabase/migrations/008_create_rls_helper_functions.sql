-- Prompt 13: RLS helper functions. Do not use user_metadata for authorization.
create or replace function public.has_admin_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
      and au.role_key = required_role
      and au.status = 'ACTIVE'
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.has_admin_role('SUPER_ADMIN');
$$;

create or replace function public.is_institute_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.has_admin_role('INSTITUTE_ADMIN');
$$;

create or replace function public.is_student_user()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.student_users su
    where su.user_id = auth.uid()
      and su.role_key = 'STUDENT_USER'
      and su.status = 'ACTIVE'
  );
$$;

create or replace function public.current_student_record_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select su.student_record_id
  from public.student_users su
  where su.user_id = auth.uid()
    and su.role_key = 'STUDENT_USER'
    and su.status = 'ACTIVE'
  limit 1;
$$;

create or replace function public.current_admin_role()
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select au.role_key
  from public.admin_users au
  where au.user_id = auth.uid()
    and au.status = 'ACTIVE'
  order by case au.role_key when 'SUPER_ADMIN' then 1 when 'INSTITUTE_ADMIN' then 2 else 3 end
  limit 1;
$$;

revoke all on function public.has_admin_role(text) from public;
revoke all on function public.is_super_admin() from public;
revoke all on function public.is_institute_admin() from public;
revoke all on function public.is_student_user() from public;
revoke all on function public.current_student_record_id() from public;
revoke all on function public.current_admin_role() from public;

grant execute on function public.has_admin_role(text) to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.is_institute_admin() to authenticated;
grant execute on function public.is_student_user() to authenticated;
grant execute on function public.current_student_record_id() to authenticated;
grant execute on function public.current_admin_role() to authenticated;
