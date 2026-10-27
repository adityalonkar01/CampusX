-- CampusX Prompt 15: indexes, notifications, activity logging, and security hardening.

-- Cover foreign keys and frequent filters.
create index if not exists idx_cra_assigned_by on public.class_representative_assignments(assigned_by);
create index if not exists idx_cau_subject on public.class_academic_updates(subject_id);
create index if not exists idx_cau_faculty on public.class_academic_updates(faculty_id);
create index if not exists idx_cau_created_by on public.class_academic_updates(created_by);
create index if not exists idx_cau_status on public.class_academic_updates(status);
create index if not exists idx_ca_subject on public.class_assignments(subject_id);
create index if not exists idx_ca_faculty on public.class_assignments(faculty_id);
create index if not exists idx_ca_created_by on public.class_assignments(created_by);
create index if not exists idx_ca_status on public.class_assignments(status);
create index if not exists idx_cfm_subject on public.class_faculty_messages(subject_id);
create index if not exists idx_cfm_status on public.class_faculty_messages(status);
create index if not exists idx_cfmr_message on public.class_faculty_message_replies(message_id);
create index if not exists idx_cfmr_sender on public.class_faculty_message_replies(sender_user_id);
create index if not exists idx_cfa_created_by on public.class_announcements(created_by);
create index if not exists idx_cfa_status on public.class_announcements(status);
create index if not exists idx_crq_student on public.class_requests(student_id);
create index if not exists idx_crq_forwarded_user on public.class_requests(forwarded_to_user);
create index if not exists idx_crq_created_by on public.class_requests(created_by);
create index if not exists idx_cf_student on public.class_feedback(student_id);
create index if not exists idx_cf_created_by on public.class_feedback(created_by);
create index if not exists idx_cf_status on public.class_feedback(status);
create index if not exists idx_ce_created_by on public.class_events(created_by);
create index if not exists idx_ce_status on public.class_events(status);
create index if not exists idx_cact_created_by on public.class_activities(created_by);
create index if not exists idx_cact_date on public.class_activities(activity_date);
create index if not exists idx_cn_created_by on public.class_notifications(created_by);
create index if not exists idx_cn_created_at on public.class_notifications(created_at desc);

-- Security-definer trigger helpers must not be exposed as RPC endpoints.
revoke all on function public.protect_cr_faculty_message_update() from public;
revoke all on function public.protect_cr_feedback_update() from public;
revoke all on function public.protect_cr_request_update() from public;
revoke all on function public.validate_cr_assignment() from public;

-- Automatic CR/faculty notification generation.
create or replace function public.notify_cr_coordination_event()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_class_id uuid;
  v_cr_user_id uuid;
  v_title text;
  v_message text;
begin
  if tg_table_name = 'class_faculty_message_replies' and tg_op = 'INSERT' then
    select m.class_id, m.cr_user_id, m.topic
      into v_class_id, v_cr_user_id, v_title
    from public.class_faculty_messages m
    where m.id = new.message_id;

    if new.sender_role in ('FACULTY_ADMIN','INSTITUTE_ADMIN') then
      insert into public.class_notifications(class_id, recipient_user_id, notification_type, title, message, related_record_type, related_record_id, created_by)
      values (v_class_id, v_cr_user_id, 'FACULTY_REPLY', 'Faculty reply received', coalesce(v_title,'Class communication'), 'class_faculty_messages', new.message_id, new.sender_user_id);
      update public.class_faculty_messages set status = 'RESPONDED' where id = new.message_id and status not in ('RESOLVED','CLOSED');
    end if;
    return new;
  elsif tg_table_name = 'class_academic_updates' and tg_op = 'INSERT' then
    if new.source_type in ('FACULTY','ADMIN') and new.status = 'PUBLISHED' then
      insert into public.class_notifications(class_id, recipient_user_id, notification_type, title, message, related_record_type, related_record_id, created_by)
      values (new.class_id, null, 'ACADEMIC_UPDATE', new.title, new.description, 'class_academic_updates', new.id, new.created_by);
    end if;
    return new;
  elsif tg_table_name = 'class_assignments' and tg_op = 'INSERT' then
    insert into public.class_notifications(class_id, recipient_user_id, notification_type, title, message, related_record_type, related_record_id, created_by)
    values (new.class_id, null, 'ASSIGNMENT', 'New assignment: ' || new.title, 'Due ' || new.due_date::text, 'class_assignments', new.id, new.created_by);
    return new;
  end if;
  return new;
end;
$$;

revoke all on function public.notify_cr_coordination_event() from public;

drop trigger if exists notify_cr_on_faculty_reply on public.class_faculty_message_replies;
create trigger notify_cr_on_faculty_reply
after insert on public.class_faculty_message_replies
for each row execute function public.notify_cr_coordination_event();

drop trigger if exists notify_class_on_academic_update on public.class_academic_updates;
create trigger notify_class_on_academic_update
after insert on public.class_academic_updates
for each row execute function public.notify_cr_coordination_event();

drop trigger if exists notify_class_on_assignment on public.class_assignments;
create trigger notify_class_on_assignment
after insert on public.class_assignments
for each row execute function public.notify_cr_coordination_event();

-- Meaningful coordination actions are added to the existing CampusX activity log.
create or replace function public.log_cr_coordination_activity()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_action text;
  v_record_id text;
  v_description text;
begin
  if auth.uid() is null then return new; end if;

  if tg_table_name = 'class_representative_assignments' then
    v_action := case when tg_op = 'INSERT' then 'CR_ASSIGNMENT_CREATED' else 'CR_ASSIGNMENT_UPDATED' end;
    v_record_id := coalesce(new.id, old.id)::text;
    v_description := 'Class representative assignment changed.';
  elsif tg_table_name = 'class_announcements' and tg_op = 'INSERT' then
    v_action := 'CLASS_ANNOUNCEMENT_CREATED'; v_record_id := new.id::text; v_description := 'CR class announcement created.';
  elsif tg_table_name = 'class_faculty_messages' and tg_op = 'INSERT' then
    v_action := 'FACULTY_MESSAGE_SENT'; v_record_id := new.id::text; v_description := 'CR faculty communication sent.';
  elsif tg_table_name = 'class_faculty_messages' and tg_op = 'UPDATE' and new.status in ('RESOLVED','CLOSED') and new.status is distinct from old.status then
    v_action := 'FACULTY_MESSAGE_RESOLVED'; v_record_id := new.id::text; v_description := 'CR faculty communication resolved.';
  elsif tg_table_name = 'class_requests' and tg_op = 'UPDATE' and new.status = 'FORWARDED' and new.status is distinct from old.status then
    v_action := 'STUDENT_REQUEST_FORWARDED'; v_record_id := new.id::text; v_description := 'Class request forwarded for administrative review.';
  elsif tg_table_name = 'class_events' and tg_op = 'INSERT' then
    v_action := 'CLASS_EVENT_CREATED'; v_record_id := new.id::text; v_description := 'Class event created.';
  elsif tg_table_name = 'class_academic_updates' and tg_op = 'INSERT' and new.source_type = 'CR_COORDINATION' then
    v_action := 'ACADEMIC_UPDATE_SHARED'; v_record_id := new.id::text; v_description := 'CR coordination academic update shared.';
  elsif tg_table_name = 'class_feedback' and tg_op = 'UPDATE' and new.status <> 'NEW' and new.status is distinct from old.status then
    v_action := 'FEEDBACK_REVIEWED'; v_record_id := new.id::text; v_description := 'Class feedback workflow status updated.';
  else
    return new;
  end if;

  insert into public.activity_logs(actor_user_id, actor_role, module, action, record_type, record_id, description)
  values (auth.uid(), public.current_admin_role(), 'CR_COORDINATION', v_action, tg_table_name, v_record_id, v_description);
  return new;
end;
$$;

revoke all on function public.log_cr_coordination_activity() from public;

-- Activity triggers.
drop trigger if exists log_cr_assignment_activity on public.class_representative_assignments;
create trigger log_cr_assignment_activity after insert or update on public.class_representative_assignments for each row execute function public.log_cr_coordination_activity();
drop trigger if exists log_class_announcement_activity on public.class_announcements;
create trigger log_class_announcement_activity after insert on public.class_announcements for each row execute function public.log_cr_coordination_activity();
drop trigger if exists log_faculty_message_activity on public.class_faculty_messages;
create trigger log_faculty_message_activity after insert or update on public.class_faculty_messages for each row execute function public.log_cr_coordination_activity();
drop trigger if exists log_class_request_activity on public.class_requests;
create trigger log_class_request_activity after update on public.class_requests for each row execute function public.log_cr_coordination_activity();
drop trigger if exists log_class_event_activity on public.class_events;
create trigger log_class_event_activity after insert on public.class_events for each row execute function public.log_cr_coordination_activity();
drop trigger if exists log_class_academic_update_activity on public.class_academic_updates;
create trigger log_class_academic_update_activity after insert on public.class_academic_updates for each row execute function public.log_cr_coordination_activity();
drop trigger if exists log_class_feedback_activity on public.class_feedback;
create trigger log_class_feedback_activity after update on public.class_feedback for each row execute function public.log_cr_coordination_activity();
