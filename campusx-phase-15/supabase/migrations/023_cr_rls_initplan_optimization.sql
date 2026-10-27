-- CampusX Prompt 15: optimize auth.uid() evaluation in Prompt 15 RLS policies.
-- Supabase recommends wrapping auth.uid() in SELECT so PostgreSQL can init-plan it once per statement.

do $$
declare
  r record;
  q text;
  wc text;
begin
  for r in
    select tablename, policyname, cmd, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'class_representative_assignments','class_academic_updates','class_assignments',
        'class_faculty_messages','class_faculty_message_replies','class_announcements',
        'class_requests','class_feedback','class_events','class_activities',
        'class_notifications','activity_logs'
      )
      and policyname <> 'Activity logs: authenticated can insert own activity'
      and (coalesce(qual,'') like '%auth.uid()%' or coalesce(with_check,'') like '%auth.uid()%')
  loop
    q := case when r.qual is null then null else replace(r.qual, 'auth.uid()', '(select auth.uid())') end;
    wc := case when r.with_check is null then null else replace(r.with_check, 'auth.uid()', '(select auth.uid())') end;

    if r.cmd = 'SELECT' or r.cmd = 'DELETE' then
      execute format('alter policy %I on public.%I using (%s)', r.policyname, r.tablename, q);
    elsif r.cmd = 'INSERT' then
      execute format('alter policy %I on public.%I with check (%s)', r.policyname, r.tablename, wc);
    elsif r.cmd = 'UPDATE' or r.cmd = 'ALL' then
      if q is not null and wc is not null then
        execute format('alter policy %I on public.%I using (%s) with check (%s)', r.policyname, r.tablename, q, wc);
      elsif q is not null then
        execute format('alter policy %I on public.%I using (%s)', r.policyname, r.tablename, q);
      elsif wc is not null then
        execute format('alter policy %I on public.%I with check (%s)', r.policyname, r.tablename, wc);
      end if;
    end if;
  end loop;
end;
$$;
