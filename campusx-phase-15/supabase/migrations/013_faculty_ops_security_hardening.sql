-- CampusX Prompt 14 security hardening after advisor review.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.is_faculty_admin() from public;
grant execute on function public.is_faculty_admin() to authenticated;
