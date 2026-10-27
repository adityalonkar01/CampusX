-- Phase 13 registration/RLS fix
--
-- Why this migration exists:
-- Supabase Auth can create auth.users before the browser has an authenticated session
-- when email confirmation is enabled. Client-side inserts into RLS-protected
-- public.profiles/admin_registration_requests/student_account_requests can therefore
-- fail because auth.uid() is NULL. This SECURITY DEFINER trigger creates the pending
-- application records inside the database transaction instead.
--
-- The frontend must pass the required values through auth.signUp(... options.data ...)
-- and must NOT directly insert the registration rows.

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
  -- Accounts created manually in the Auth dashboard/bootstrap process may not carry
  -- CampusX registration metadata. Leave those untouched so the documented
  -- Super Admin bootstrap flow can still be completed manually.
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
      'SUPER_ADMIN',
      'INSTITUTE_ADMIN',
      'STUDENT_ADMIN',
      'FACULTY_ADMIN',
      'CR_ADMIN',
      'COUNCIL_ADMIN',
      'CRC_ADMIN'
    ) then
      raise exception 'Invalid administrative role request.';
    end if;

    insert into public.profiles (
      id, full_name, email, phone, user_category, status
    ) values (
      new.id, v_full_name, lower(new.email), null, 'ADMIN', 'PENDING'
    )
    on conflict (id) do nothing;

    insert into public.admin_registration_requests (
      user_id, full_name, email, requested_role, status
    )
    select new.id, v_full_name, lower(new.email), v_requested_role, 'PENDING'
    where not exists (
      select 1
      from public.admin_registration_requests r
      where r.user_id = new.id and r.status = 'PENDING'
    );

    insert into public.auth_audit_logs (
      user_id, email_reference, event_type, status
    ) values (
      new.id, lower(new.email), 'ADMIN_REGISTERED', 'PENDING'
    );

    return new;
  end if;

  -- Student registration request.
  if v_student_id = '' or v_admission_number = '' or v_first_name = '' or
     v_last_name = '' or v_dob_text = '' or v_gender = '' or v_phone = '' then
    raise exception 'Student registration metadata is incomplete.';
  end if;

  insert into public.profiles (
    id, full_name, email, phone, user_category, status
  ) values (
    new.id, v_full_name, lower(new.email), v_phone, 'STUDENT', 'PENDING'
  )
  on conflict (id) do nothing;

  insert into public.student_account_requests (
    user_id,
    student_id,
    admission_number,
    first_name,
    middle_name,
    last_name,
    dob,
    gender,
    email,
    phone,
    status
  ) values (
    new.id,
    v_student_id,
    v_admission_number,
    v_first_name,
    v_middle_name,
    v_last_name,
    v_dob_text::date,
    v_gender,
    lower(new.email),
    v_phone,
    'PENDING'
  )
  on conflict (user_id) do nothing;

  insert into public.auth_audit_logs (
    user_id, email_reference, event_type, status
  ) values (
    new.id, lower(new.email), 'STUDENT_ACCOUNT_REQUESTED', 'PENDING'
  );

  return new;
end;
$$;

revoke all on function public.handle_new_campusx_user() from public;

-- Replace any earlier CampusX auth signup trigger without affecting unrelated
-- Supabase Auth internals.
drop trigger if exists on_auth_campusx_user_created on auth.users;
create trigger on_auth_campusx_user_created
after insert on auth.users
for each row execute function public.handle_new_campusx_user();

-- The previous policy name implied that self-updates were limited, but PostgreSQL RLS
-- policies cannot restrict individual columns. CampusX currently performs profile
-- status changes through privileged approval functions, so remove self-update access
-- rather than allowing a pending account to rewrite protected profile fields.
drop policy if exists "Profiles: users can update limited own profile" on public.profiles;
