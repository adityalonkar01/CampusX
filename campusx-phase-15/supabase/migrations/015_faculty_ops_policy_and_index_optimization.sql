-- CampusX Prompt 14 performance/policy cleanup after advisor review.
do $$
declare t text;
begin
  foreach t in array array[
    'faculty_subject_assignments','faculty_class_assignments','faculty_workload','faculty_attendance',
    'faculty_leave_requests','faculty_requests','faculty_resources','faculty_responsibilities',
    'faculty_activities','faculty_schedule'
  ] loop
    execute format('drop policy if exists "Faculty ops: Faculty and Institute Admin mutate" on public.%I', t);
    execute format('drop policy if exists "Faculty ops: insert" on public.%I', t);
    execute format('drop policy if exists "Faculty ops: update" on public.%I', t);
    execute format('drop policy if exists "Faculty ops: delete" on public.%I', t);
    execute format('create policy "Faculty ops: insert" on public.%I for insert to authenticated with check (public.is_faculty_admin() or public.is_institute_admin())', t);
    execute format('create policy "Faculty ops: update" on public.%I for update to authenticated using (public.is_faculty_admin() or public.is_institute_admin()) with check (public.is_faculty_admin() or public.is_institute_admin())', t);
    execute format('create policy "Faculty ops: delete" on public.%I for delete to authenticated using (public.is_faculty_admin() or public.is_institute_admin())', t);
  end loop;
end $$;

drop policy if exists "Faculty documents: Institute Admin mutate" on public.faculty_documents;
drop policy if exists "Faculty documents: Institute Admin insert" on public.faculty_documents;
drop policy if exists "Faculty documents: Institute Admin update" on public.faculty_documents;
drop policy if exists "Faculty documents: Institute Admin delete" on public.faculty_documents;
create policy "Faculty documents: Institute Admin insert" on public.faculty_documents for insert to authenticated with check (public.is_institute_admin());
create policy "Faculty documents: Institute Admin update" on public.faculty_documents for update to authenticated using (public.is_institute_admin()) with check (public.is_institute_admin());
create policy "Faculty documents: Institute Admin delete" on public.faculty_documents for delete to authenticated using (public.is_institute_admin());

-- Cover foreign-key columns introduced by Prompt 14.
create index if not exists idx_fsa_program on public.faculty_subject_assignments(program_id);
create index if not exists idx_fsa_year on public.faculty_subject_assignments(academic_year_id);
create index if not exists idx_fsa_created_by on public.faculty_subject_assignments(created_by);
create index if not exists idx_fsa_updated_by on public.faculty_subject_assignments(updated_by);
create index if not exists idx_fca_class on public.faculty_class_assignments(class_id);
create index if not exists idx_fca_subject on public.faculty_class_assignments(subject_id);
create index if not exists idx_fca_created_by on public.faculty_class_assignments(created_by);
create index if not exists idx_fca_updated_by on public.faculty_class_assignments(updated_by);
create index if not exists idx_fw_year on public.faculty_workload(academic_year_id);
create index if not exists idx_fw_created_by on public.faculty_workload(created_by);
create index if not exists idx_fw_updated_by on public.faculty_workload(updated_by);
create index if not exists idx_fatt_created_by on public.faculty_attendance(created_by);
create index if not exists idx_fatt_updated_by on public.faculty_attendance(updated_by);
create index if not exists idx_flr_faculty on public.faculty_leave_requests(faculty_id);
create index if not exists idx_flr_reviewed_by on public.faculty_leave_requests(reviewed_by);
create index if not exists idx_frq_faculty on public.faculty_requests(faculty_id);
create index if not exists idx_frq_assigned_to on public.faculty_requests(assigned_to);
create index if not exists idx_fres_faculty on public.faculty_resources(faculty_id);
create index if not exists idx_fres_subject on public.faculty_resources(subject_id);
create index if not exists idx_fresp_faculty on public.faculty_responsibilities(faculty_id);
create index if not exists idx_fresp_created_by on public.faculty_responsibilities(created_by);
create index if not exists idx_fact_faculty on public.faculty_activities(faculty_id);
create index if not exists idx_fact_created_by on public.faculty_activities(created_by);
create index if not exists idx_fs_subject on public.faculty_schedule(subject_id);
create index if not exists idx_fs_class on public.faculty_schedule(class_id);
create index if not exists idx_fs_created_by on public.faculty_schedule(created_by);
create index if not exists idx_fs_updated_by on public.faculty_schedule(updated_by);
create index if not exists idx_fdoc_faculty on public.faculty_documents(faculty_id);
create index if not exists idx_fdoc_verified_by on public.faculty_documents(verified_by);
