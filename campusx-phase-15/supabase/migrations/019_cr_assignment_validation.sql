-- CampusX Prompt 15: validate Faculty-authored class academic records against Faculty Operations.
create or replace function public.validate_class_academic_faculty()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.faculty_id is not null then
    if not public.faculty_assigned_to_class(new.faculty_id, new.class_id) then
      raise exception 'Selected Faculty is not actively assigned to this class';
    end if;
    if new.subject_id is not null and not exists (
      select 1 from public.faculty_class_assignments fca
      where fca.faculty_id = new.faculty_id
        and fca.class_id = new.class_id
        and fca.status = 'ACTIVE'
        and (fca.subject_id is null or fca.subject_id = new.subject_id)
    ) then
      raise exception 'Selected Faculty is not assigned to the selected subject for this class';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.validate_class_academic_faculty() from public;

drop trigger if exists validate_class_assignment_faculty on public.class_assignments;
create trigger validate_class_assignment_faculty
before insert or update of class_id, faculty_id, subject_id on public.class_assignments
for each row execute function public.validate_class_academic_faculty();

drop trigger if exists validate_class_update_faculty on public.class_academic_updates;
create trigger validate_class_update_faculty
before insert or update of class_id, faculty_id, subject_id on public.class_academic_updates
for each row execute function public.validate_class_academic_faculty();
