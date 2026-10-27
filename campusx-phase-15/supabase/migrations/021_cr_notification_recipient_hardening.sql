-- CampusX Prompt 15: make coordination notifications recipient-specific so read state is per user.

create or replace function public.active_cr_user_for_class(p_class_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select cra.cr_user_id
  from public.class_representative_assignments cra
  where cra.class_id = p_class_id
    and cra.status = 'ACTIVE'
    and (cra.end_date is null or cra.end_date >= current_date)
  order by cra.start_date desc, cra.created_at desc
  limit 1;
$$;
revoke all on function public.active_cr_user_for_class(uuid) from public;
revoke all on function public.active_cr_user_for_class(uuid) from anon;
revoke all on function public.active_cr_user_for_class(uuid) from authenticated;

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
begin
  if tg_table_name = 'class_faculty_message_replies' and tg_op = 'INSERT' then
    select m.class_id, m.cr_user_id, m.topic
      into v_class_id, v_cr_user_id, v_title
    from public.class_faculty_messages m
    where m.id = new.message_id;

    if new.sender_role in ('FACULTY_ADMIN','INSTITUTE_ADMIN') then
      insert into public.class_notifications(
        class_id, recipient_user_id, notification_type, title, message,
        related_record_type, related_record_id, created_by
      ) values (
        v_class_id, v_cr_user_id, 'FACULTY_REPLY', 'Faculty reply received',
        coalesce(v_title,'Class communication'), 'class_faculty_messages',
        new.message_id, new.sender_user_id
      );
      update public.class_faculty_messages
      set status = 'RESPONDED'
      where id = new.message_id and status not in ('RESOLVED','CLOSED');
    end if;

  elsif tg_table_name = 'class_academic_updates' and tg_op = 'INSERT' then
    if new.source_type in ('FACULTY','ADMIN') and new.status = 'PUBLISHED' then
      v_cr_user_id := public.active_cr_user_for_class(new.class_id);
      if v_cr_user_id is not null then
        insert into public.class_notifications(
          class_id, recipient_user_id, notification_type, title, message,
          related_record_type, related_record_id, created_by
        ) values (
          new.class_id, v_cr_user_id, 'ACADEMIC_UPDATE', new.title, new.description,
          'class_academic_updates', new.id, new.created_by
        );
      end if;
    end if;

  elsif tg_table_name = 'class_assignments' and tg_op = 'INSERT' then
    v_cr_user_id := public.active_cr_user_for_class(new.class_id);
    if v_cr_user_id is not null then
      insert into public.class_notifications(
        class_id, recipient_user_id, notification_type, title, message,
        related_record_type, related_record_id, created_by
      ) values (
        new.class_id, v_cr_user_id, 'ASSIGNMENT', 'New assignment: ' || new.title,
        'Due ' || new.due_date::text, 'class_assignments', new.id, new.created_by
      );
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.notify_cr_coordination_event() from public;
revoke all on function public.notify_cr_coordination_event() from anon;
revoke all on function public.notify_cr_coordination_event() from authenticated;

-- Remove the ability to share a mutable read_at state across an entire class.
drop policy if exists "Class notifications: authorized read" on public.class_notifications;
drop policy if exists "Class notifications: own mark read" on public.class_notifications;
create policy "Class notifications: authorized read"
on public.class_notifications for select to authenticated
using (
  public.is_super_admin()
  or public.is_institute_admin()
  or recipient_user_id = auth.uid()
);
create policy "Class notifications: own mark read"
on public.class_notifications for update to authenticated
using (recipient_user_id = auth.uid())
with check (recipient_user_id = auth.uid());
