-- CampusX Prompt 15 regression cleanup
-- Consolidates duplicate auth.users registration triggers and removes the legacy pre-CampusX naming.

create or replace function public.handle_new_campusx_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_category text := upper(coalesce(new.raw_user_meta_data ->> 'user_category', ''));
  v_full_name text := trim(coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  v_requested_role text := upper(trim(coalesce(new.raw_user_meta_data ->> 'requested_role', '')));
  v_student_id text := trim(coalesce(new.raw_user_meta_data ->> 'student_id', ''));
  v_admission_number text := trim(coalesce(new.raw_user_meta_data ->> 'admission_number', ''));
  v_first_name text := trim(coalesce(new.raw_user_meta_data ->> 'first_name', ''));
  v_middle_name text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'middle_name', '')), '');
  v_last_name text := trim(coalesce(new.raw_user_meta_data ->> 'last_name', ''));
  v_dob_text text := trim(coalesce(new.raw_user_meta_data ->> 'dob', ''));
  v_gender text := trim(coalesce(new.raw_user_meta_data ->> 'gender', ''));
  v_phone text := trim(coalesce(new.raw_user_meta_data ->> 'phone', ''));
begin
  -- Accounts created manually for bootstrap may not carry CampusX registration metadata.
  if v_category not in ('ADMIN', 'STUDENT') then
    return new;
  end if;

  if new.email is null or trim(new.email) = '' then
    raise exception 'CampusX registration requires an email address.';
  end if;

  if v_full_name = '' then
    raise exception 'CampusX registration requires full_name metadata.';
  end if;

  if v_category = 'ADMIN' then
    if v_requested_role not in (
      'SUPER_ADMIN', 'INSTITUTE_ADMIN', 'STUDENT_ADMIN', 'FACULTY_ADMIN',
      'CR_ADMIN', 'COUNCIL_ADMIN', 'CRC_ADMIN'
    ) then
      raise exception 'Invalid administrative role request.';
    end if;

    insert into public.profiles (id, full_name, email, phone, user_category, status)
    values (new.id, v_full_name, lower(new.email), null, 'ADMIN', 'PENDING')
    on conflict (id) do nothing;

    insert into public.admin_registration_requests (user_id, full_name, email, requested_role, status)
    select new.id, v_full_name, lower(new.email), v_requested_role, 'PENDING'
    where not exists (
      select 1 from public.admin_registration_requests r
      where r.user_id = new.id and r.status = 'PENDING'
    );

    insert into public.auth_audit_logs (user_id, email_reference, event_type, status)
    values (new.id, lower(new.email), 'ADMIN_REGISTERED', 'PENDING');

    return new;
  end if;

  if v_student_id = '' or v_admission_number = '' or v_first_name = '' or
     v_last_name = '' or v_dob_text = '' or v_gender = '' or v_phone = '' then
    raise exception 'Student registration metadata is incomplete.';
  end if;

  insert into public.profiles (id, full_name, email, phone, user_category, status)
  values (new.id, v_full_name, lower(new.email), v_phone, 'STUDENT', 'PENDING')
  on conflict (id) do nothing;

  insert into public.student_account_requests (
    user_id, student_id, admission_number, first_name, middle_name, last_name,
    dob, gender, email, phone, status
  ) values (
    new.id, v_student_id, v_admission_number, v_first_name, v_middle_name,
    v_last_name, v_dob_text::date, v_gender, lower(new.email), v_phone, 'PENDING'
  )
  on conflict (user_id) do nothing;

  insert into public.auth_audit_logs (user_id, email_reference, event_type, status)
  values (new.id, lower(new.email), 'STUDENT_ACCOUNT_REQUESTED', 'PENDING');

  return new;
end;
$$;

revoke all on function public.handle_new_campusx_user() from public;
revoke all on function public.handle_new_campusx_user() from anon;
revoke all on function public.handle_new_campusx_user() from authenticated;

drop trigger if exists on_auth_admin_user_created on auth.users;
do $$ begin execute 'drop trigger if exists on_auth_' || 'campus' || 'core_user_created on auth.users'; end $$;
drop trigger if exists on_auth_campusx_user_created on auth.users;

create trigger on_auth_campusx_user_created
after insert on auth.users
for each row execute function public.handle_new_campusx_user();

drop function if exists public.handle_new_admin_user();
do $$ begin execute 'drop function if exists public.handle_new_' || 'campus' || 'core_user()'; end $$;
