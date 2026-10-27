-- CampusX Prompt 15: CR class-scoped RLS and security rules.

-- Helper execution is authenticated-only.
revoke all on function public.is_cr_admin() from public;
revoke all on function public.current_cr_class_id() from public;
revoke all on function public.current_student_class_id() from public;
revoke all on function public.student_belongs_to_class(uuid, uuid) from public;
revoke all on function public.faculty_assigned_to_class(uuid, uuid) from public;
revoke all on function public.get_cr_class_students() from public;
revoke all on function public.get_cr_relevant_faculty() from public;

grant execute on function public.is_cr_admin() to authenticated;
grant execute on function public.current_cr_class_id() to authenticated;
grant execute on function public.current_student_class_id() to authenticated;
grant execute on function public.student_belongs_to_class(uuid, uuid) to authenticated;
grant execute on function public.faculty_assigned_to_class(uuid, uuid) to authenticated;
grant execute on function public.get_cr_class_students() to authenticated;
grant execute on function public.get_cr_relevant_faculty() to authenticated;

-- Class visibility: CR and students only see their own class; operational admins retain required visibility.
drop policy if exists "Classes: authenticated read" on public.classes;
drop policy if exists "Classes: role-scoped read" on public.classes;
create policy "Classes: role-scoped read" on public.classes
for select to authenticated
using (
  public.is_super_admin()
  or public.is_institute_admin()
  or public.has_admin_role('STUDENT_ADMIN')
  or public.has_admin_role('FACULTY_ADMIN')
  or public.has_admin_role('COUNCIL_ADMIN')
  or public.has_admin_role('CRC_ADMIN')
  or (public.is_cr_admin() and id = public.current_cr_class_id())
  or (public.is_student_user() and id = public.current_student_class_id())
);

-- Institute Admin needs CR account visibility for assignment management.
drop policy if exists "Admin users: Institute Admin reads CR accounts" on public.admin_users;
create policy "Admin users: Institute Admin reads CR accounts" on public.admin_users
for select to authenticated
using (public.is_institute_admin() and role_key = 'CR_ADMIN');

-- Assignment table.
drop policy if exists "CR assignments: authorized read" on public.class_representative_assignments;
drop policy if exists "CR assignments: Institute Admin insert" on public.class_representative_assignments;
drop policy if exists "CR assignments: Institute Admin update" on public.class_representative_assignments;
drop policy if exists "CR assignments: Institute Admin delete" on public.class_representative_assignments;
create policy "CR assignments: authorized read" on public.class_representative_assignments
for select to authenticated
using (
  public.is_super_admin()
  or public.is_institute_admin()
  or (public.is_cr_admin() and cr_user_id = auth.uid())
);
create policy "CR assignments: Institute Admin insert" on public.class_representative_assignments
for insert to authenticated
with check (public.is_institute_admin() and assigned_by = auth.uid());
create policy "CR assignments: Institute Admin update" on public.class_representative_assignments
for update to authenticated
using (public.is_institute_admin())
with check (public.is_institute_admin());
create policy "CR assignments: Institute Admin delete" on public.class_representative_assignments
for delete to authenticated
using (public.is_institute_admin());

-- CR attendance access is read-only and class scoped.
drop policy if exists "Student attendance: CR reads assigned class" on public.student_attendance;
create policy "Student attendance: CR reads assigned class" on public.student_attendance
for select to authenticated
using (
  public.is_cr_admin()
  and public.student_belongs_to_class(student_id, public.current_cr_class_id())
);

-- Academic updates.
drop policy if exists "Class updates: authorized read" on public.class_academic_updates;
drop policy if exists "Class updates: CR insert coordination" on public.class_academic_updates;
drop policy if exists "Class updates: CR update own coordination" on public.class_academic_updates;
drop policy if exists "Class updates: Faculty and Institute insert" on public.class_academic_updates;
drop policy if exists "Class updates: Faculty and Institute update" on public.class_academic_updates;
drop policy if exists "Class updates: Institute delete" on public.class_academic_updates;
create policy "Class updates: authorized read" on public.class_academic_updates
for select to authenticated
using (
  public.is_super_admin()
  or public.is_institute_admin()
  or public.has_admin_role('FACULTY_ADMIN')
  or (public.is_cr_admin() and class_id = public.current_cr_class_id())
  or (public.is_student_user() and class_id = public.current_student_class_id() and status = 'PUBLISHED')
);
create policy "Class updates: CR insert coordination" on public.class_academic_updates
for insert to authenticated
with check (
  public.is_cr_admin()
  and class_id = public.current_cr_class_id()
  and source_type = 'CR_COORDINATION'
  and created_by = auth.uid()
);
create policy "Class updates: CR update own coordination" on public.class_academic_updates
for update to authenticated
using (
  public.is_cr_admin()
  and class_id = public.current_cr_class_id()
  and source_type = 'CR_COORDINATION'
  and created_by = auth.uid()
)
with check (
  public.is_cr_admin()
  and class_id = public.current_cr_class_id()
  and source_type = 'CR_COORDINATION'
  and created_by = auth.uid()
);
create policy "Class updates: Faculty and Institute insert" on public.class_academic_updates
for insert to authenticated
with check (
  (public.has_admin_role('FACULTY_ADMIN') and source_type = 'FACULTY' and created_by = auth.uid())
  or (public.is_institute_admin() and source_type in ('ADMIN','FACULTY') and created_by = auth.uid())
);
create policy "Class updates: Faculty and Institute update" on public.class_academic_updates
for update to authenticated
using (public.has_admin_role('FACULTY_ADMIN') or public.is_institute_admin())
with check (public.has_admin_role('FACULTY_ADMIN') or public.is_institute_admin());
create policy "Class updates: Institute delete" on public.class_academic_updates
for delete to authenticated
using (public.is_institute_admin());

-- Student academic assignments are Faculty/Institute-authored and CR/student read-only.
drop policy if exists "Class assignments: authorized read" on public.class_assignments;
drop policy if exists "Class assignments: Faculty and Institute insert" on public.class_assignments;
drop policy if exists "Class assignments: Faculty and Institute update" on public.class_assignments;
drop policy if exists "Class assignments: Institute delete" on public.class_assignments;
create policy "Class assignments: authorized read" on public.class_assignments
for select to authenticated
using (
  public.is_super_admin()
  or public.is_institute_admin()
  or public.has_admin_role('FACULTY_ADMIN')
  or (public.is_cr_admin() and class_id = public.current_cr_class_id())
  or (public.is_student_user() and class_id = public.current_student_class_id())
);
create policy "Class assignments: Faculty and Institute insert" on public.class_assignments
for insert to authenticated
with check (
  (public.has_admin_role('FACULTY_ADMIN') or public.is_institute_admin())
  and created_by = auth.uid()
);
create policy "Class assignments: Faculty and Institute update" on public.class_assignments
for update to authenticated
using (public.has_admin_role('FACULTY_ADMIN') or public.is_institute_admin())
with check (public.has_admin_role('FACULTY_ADMIN') or public.is_institute_admin());
create policy "Class assignments: Institute delete" on public.class_assignments
for delete to authenticated
using (public.is_institute_admin());

-- CR -> Faculty communication.
drop policy if exists "Class faculty messages: authorized read" on public.class_faculty_messages;
drop policy if exists "Class faculty messages: CR insert" on public.class_faculty_messages;
drop policy if exists "Class faculty messages: CR update" on public.class_faculty_messages;
drop policy if exists "Class faculty messages: Faculty and Institute update" on public.class_faculty_messages;
create policy "Class faculty messages: authorized read" on public.class_faculty_messages
for select to authenticated
using (
  public.is_super_admin()
  or public.is_institute_admin()
  or public.has_admin_role('FACULTY_ADMIN')
  or (public.is_cr_admin() and class_id = public.current_cr_class_id() and cr_user_id = auth.uid())
);
create policy "Class faculty messages: CR insert" on public.class_faculty_messages
for insert to authenticated
with check (
  public.is_cr_admin()
  and class_id = public.current_cr_class_id()
  and cr_user_id = auth.uid()
  and public.faculty_assigned_to_class(faculty_id, class_id)
);
create policy "Class faculty messages: CR update" on public.class_faculty_messages
for update to authenticated
using (public.is_cr_admin() and class_id = public.current_cr_class_id() and cr_user_id = auth.uid())
with check (public.is_cr_admin() and class_id = public.current_cr_class_id() and cr_user_id = auth.uid());
create policy "Class faculty messages: Faculty and Institute update" on public.class_faculty_messages
for update to authenticated
using (public.has_admin_role('FACULTY_ADMIN') or public.is_institute_admin())
with check (public.has_admin_role('FACULTY_ADMIN') or public.is_institute_admin());

-- Message replies.
drop policy if exists "Class message replies: authorized read" on public.class_faculty_message_replies;
drop policy if exists "Class message replies: authorized insert" on public.class_faculty_message_replies;
create policy "Class message replies: authorized read" on public.class_faculty_message_replies
for select to authenticated
using (
  exists (
    select 1 from public.class_faculty_messages m
    where m.id = message_id
      and (
        public.is_super_admin()
        or public.is_institute_admin()
        or public.has_admin_role('FACULTY_ADMIN')
        or (public.is_cr_admin() and m.class_id = public.current_cr_class_id() and m.cr_user_id = auth.uid())
      )
  )
);
create policy "Class message replies: authorized insert" on public.class_faculty_message_replies
for insert to authenticated
with check (
  sender_user_id = auth.uid()
  and sender_role = public.current_admin_role()
  and exists (
    select 1 from public.class_faculty_messages m
    where m.id = message_id
      and (
        (public.is_cr_admin() and m.class_id = public.current_cr_class_id() and m.cr_user_id = auth.uid())
        or public.has_admin_role('FACULTY_ADMIN')
        or public.is_institute_admin()
      )
  )
);

-- Class announcements.
drop policy if exists "Class announcements: authorized read" on public.class_announcements;
drop policy if exists "Class announcements: CR insert" on public.class_announcements;
drop policy if exists "Class announcements: CR update" on public.class_announcements;
drop policy if exists "Class announcements: Institute delete" on public.class_announcements;
create policy "Class announcements: authorized read" on public.class_announcements
for select to authenticated
using (
  public.is_super_admin()
  or public.is_institute_admin()
  or public.has_admin_role('FACULTY_ADMIN')
  or (public.is_cr_admin() and class_id = public.current_cr_class_id())
  or (public.is_student_user() and class_id = public.current_student_class_id() and status = 'PUBLISHED')
);
create policy "Class announcements: CR insert" on public.class_announcements
for insert to authenticated
with check (public.is_cr_admin() and class_id = public.current_cr_class_id() and created_by = auth.uid());
create policy "Class announcements: CR update" on public.class_announcements
for update to authenticated
using (public.is_cr_admin() and class_id = public.current_cr_class_id() and created_by = auth.uid())
with check (public.is_cr_admin() and class_id = public.current_cr_class_id() and created_by = auth.uid());
create policy "Class announcements: Institute delete" on public.class_announcements
for delete to authenticated
using (public.is_institute_admin());

-- Class requests.
drop policy if exists "Class requests: authorized read" on public.class_requests;
drop policy if exists "Class requests: student insert" on public.class_requests;
drop policy if exists "Class requests: CR insert" on public.class_requests;
drop policy if exists "Class requests: CR update" on public.class_requests;
drop policy if exists "Class requests: escalated admin update" on public.class_requests;
create policy "Class requests: authorized read" on public.class_requests
for select to authenticated
using (
  public.is_super_admin()
  or public.is_institute_admin()
  or (public.is_cr_admin() and class_id = public.current_cr_class_id())
  or (public.is_student_user() and student_id = public.current_student_record_id())
  or (public.has_admin_role('FACULTY_ADMIN') and forwarded_to_role = 'FACULTY_ADMIN')
  or (public.has_admin_role('STUDENT_ADMIN') and forwarded_to_role = 'STUDENT_ADMIN')
);
create policy "Class requests: student insert" on public.class_requests
for insert to authenticated
with check (
  public.is_student_user()
  and class_id = public.current_student_class_id()
  and student_id = public.current_student_record_id()
  and created_by = auth.uid()
  and status = 'SUBMITTED'
);
create policy "Class requests: CR insert" on public.class_requests
for insert to authenticated
with check (
  public.is_cr_admin()
  and class_id = public.current_cr_class_id()
  and created_by = auth.uid()
);
create policy "Class requests: CR update" on public.class_requests
for update to authenticated
using (public.is_cr_admin() and class_id = public.current_cr_class_id())
with check (public.is_cr_admin() and class_id = public.current_cr_class_id());
create policy "Class requests: escalated admin update" on public.class_requests
for update to authenticated
using (
  public.is_institute_admin()
  or (public.has_admin_role('FACULTY_ADMIN') and forwarded_to_role = 'FACULTY_ADMIN')
  or (public.has_admin_role('STUDENT_ADMIN') and forwarded_to_role = 'STUDENT_ADMIN')
)
with check (
  public.is_institute_admin()
  or (public.has_admin_role('FACULTY_ADMIN') and forwarded_to_role = 'FACULTY_ADMIN')
  or (public.has_admin_role('STUDENT_ADMIN') and forwarded_to_role = 'STUDENT_ADMIN')
);

-- Class feedback.
drop policy if exists "Class feedback: authorized read" on public.class_feedback;
drop policy if exists "Class feedback: student insert" on public.class_feedback;
drop policy if exists "Class feedback: CR update status" on public.class_feedback;
create policy "Class feedback: authorized read" on public.class_feedback
for select to authenticated
using (
  public.is_super_admin()
  or public.is_institute_admin()
  or (public.is_cr_admin() and class_id = public.current_cr_class_id())
  or (public.is_student_user() and student_id = public.current_student_record_id())
);
create policy "Class feedback: student insert" on public.class_feedback
for insert to authenticated
with check (
  public.is_student_user()
  and class_id = public.current_student_class_id()
  and student_id = public.current_student_record_id()
  and created_by = auth.uid()
  and status = 'NEW'
);
create policy "Class feedback: CR update status" on public.class_feedback
for update to authenticated
using (public.is_cr_admin() and class_id = public.current_cr_class_id())
with check (public.is_cr_admin() and class_id = public.current_cr_class_id());

-- Class events and activities.
do $$
declare t text;
begin
  foreach t in array array['class_events','class_activities'] loop
    execute format('drop policy if exists "CR class content: authorized read" on public.%I', t);
    execute format('drop policy if exists "CR class content: CR insert" on public.%I', t);
    execute format('drop policy if exists "CR class content: CR update" on public.%I', t);
    execute format('drop policy if exists "CR class content: Institute delete" on public.%I', t);
    execute format('create policy "CR class content: authorized read" on public.%I for select to authenticated using (public.is_super_admin() or public.is_institute_admin() or (public.is_cr_admin() and class_id = public.current_cr_class_id()) or (public.is_student_user() and class_id = public.current_student_class_id()))', t);
    execute format('create policy "CR class content: CR insert" on public.%I for insert to authenticated with check (public.is_cr_admin() and class_id = public.current_cr_class_id() and created_by = auth.uid())', t);
    execute format('create policy "CR class content: CR update" on public.%I for update to authenticated using (public.is_cr_admin() and class_id = public.current_cr_class_id() and created_by = auth.uid()) with check (public.is_cr_admin() and class_id = public.current_cr_class_id() and created_by = auth.uid())', t);
    execute format('create policy "CR class content: Institute delete" on public.%I for delete to authenticated using (public.is_institute_admin())', t);
  end loop;
end $$;

-- Notifications.
drop policy if exists "Class notifications: authorized read" on public.class_notifications;
drop policy if exists "Class notifications: own mark read" on public.class_notifications;
drop policy if exists "Class notifications: authorized insert" on public.class_notifications;
create policy "Class notifications: authorized read" on public.class_notifications
for select to authenticated
using (
  public.is_super_admin()
  or public.is_institute_admin()
  or (public.is_cr_admin() and class_id = public.current_cr_class_id() and (recipient_user_id is null or recipient_user_id = auth.uid()))
  or (public.is_student_user() and class_id = public.current_student_class_id() and (recipient_user_id is null or recipient_user_id = auth.uid()))
  or recipient_user_id = auth.uid()
);
create policy "Class notifications: own mark read" on public.class_notifications
for update to authenticated
using (recipient_user_id = auth.uid() or (public.is_cr_admin() and class_id = public.current_cr_class_id() and recipient_user_id is null))
with check (recipient_user_id = auth.uid() or (public.is_cr_admin() and class_id = public.current_cr_class_id() and recipient_user_id is null));
create policy "Class notifications: authorized insert" on public.class_notifications
for insert to authenticated
with check (
  public.is_institute_admin()
  or public.has_admin_role('FACULTY_ADMIN')
  or (public.is_cr_admin() and class_id = public.current_cr_class_id() and created_by = auth.uid())
);

-- CR can read their own activity history.
drop policy if exists "Activity logs: users read own activity" on public.activity_logs;
create policy "Activity logs: users read own activity" on public.activity_logs
for select to authenticated
using (actor_user_id = auth.uid());



-- Validate Institute Admin CR assignments at the database boundary.
create or replace function public.validate_cr_assignment()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not exists (
    select 1 from public.admin_users au
    where au.user_id = new.cr_user_id
      and au.role_key = 'CR_ADMIN'
      and au.status = 'ACTIVE'
  ) then
    raise exception 'The selected user is not an active CR_ADMIN account';
  end if;
  if not exists (
    select 1 from public.classes c
    where c.id = new.class_id and c.status = 'ACTIVE'
  ) then
    raise exception 'The selected class is not active';
  end if;
  if new.status = 'ACTIVE' and new.end_date is not null and new.end_date < current_date then
    raise exception 'An ACTIVE CR assignment cannot already be expired';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_cr_assignment on public.class_representative_assignments;
create trigger validate_cr_assignment
before insert or update on public.class_representative_assignments
for each row execute function public.validate_cr_assignment();

-- CR request updates may change workflow/classification fields, but not the originating request identity/content.
create or replace function public.protect_cr_request_update()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if public.is_cr_admin() then
    if new.class_id is distinct from old.class_id
       or new.student_id is distinct from old.student_id
       or new.title is distinct from old.title
       or new.description is distinct from old.description
       or new.created_by is distinct from old.created_by then
      raise exception 'CR may not rewrite the originating student request';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_cr_request_update on public.class_requests;
create trigger protect_cr_request_update
before update on public.class_requests
for each row execute function public.protect_cr_request_update();

-- Prevent a CR from editing message identity/content after submission; only status may change.
create or replace function public.protect_cr_faculty_message_update()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if public.is_cr_admin() then
    if new.class_id is distinct from old.class_id
       or new.cr_user_id is distinct from old.cr_user_id
       or new.faculty_id is distinct from old.faculty_id
       or new.subject_id is distinct from old.subject_id
       or new.topic is distinct from old.topic
       or new.message is distinct from old.message
       or new.priority is distinct from old.priority then
      raise exception 'CR may only update the communication status after submission';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_cr_faculty_message_update on public.class_faculty_messages;
create trigger protect_cr_faculty_message_update
before update on public.class_faculty_messages
for each row execute function public.protect_cr_faculty_message_update();

-- Prevent CR from rewriting feedback identity/content; only workflow status may change.
create or replace function public.protect_cr_feedback_update()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$;
begin
  if public.is_cr_admin() then
    if new.class_id is distinct from old.class_id
       or new.student_id is distinct from old.student_id
       or new.category is distinct from old.category
       or new.rating is distinct from old.rating
       or new.feedback is distinct from old.feedback
       or new.identity_visibility is distinct from old.identity_visibility
       or new.created_by is distinct from old.created_by then
      raise exception 'CR may only update feedback workflow status';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_cr_feedback_update on public.class_feedback;
create trigger protect_cr_feedback_update
before update on public.class_feedback
for each row execute function public.protect_cr_feedback_update();
