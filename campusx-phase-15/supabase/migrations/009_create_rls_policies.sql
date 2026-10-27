-- Prompt 13: RLS policies. Use TO authenticated and ownership/admin checks; never user_metadata.

-- Profiles
create policy "Profiles: users can read own profile" on public.profiles
for select to authenticated
using ((select auth.uid()) = id);

create policy "Profiles: Super and Institute Admin can read profiles" on public.profiles
for select to authenticated
using ((select public.is_super_admin()) or (select public.is_institute_admin()));

create policy "Profiles: users can insert own pending profile" on public.profiles
for insert to authenticated
with check ((select auth.uid()) = id and status = 'PENDING');

create policy "Profiles: users can update limited own profile" on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Profiles: Super and Institute Admin can update profiles" on public.profiles
for update to authenticated
using ((select public.is_super_admin()) or (select public.is_institute_admin()))
with check ((select public.is_super_admin()) or (select public.is_institute_admin()));

-- System roles
create policy "System roles: authenticated can read roles" on public.system_roles
for select to authenticated
using (true);

-- Admin registration requests
create policy "Admin registrations: user can create own pending request" on public.admin_registration_requests
for insert to authenticated
with check ((select auth.uid()) = user_id and status = 'PENDING');

create policy "Admin registrations: requester can read own request" on public.admin_registration_requests
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Admin registrations: Super Admin can read all" on public.admin_registration_requests
for select to authenticated
using ((select public.is_super_admin()));

create policy "Admin registrations: Super Admin can update all" on public.admin_registration_requests
for update to authenticated
using ((select public.is_super_admin()))
with check ((select public.is_super_admin()));

-- Admin users
create policy "Admin users: admins can read own active role" on public.admin_users
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Admin users: Super Admin can read all" on public.admin_users
for select to authenticated
using ((select public.is_super_admin()));

create policy "Admin users: Super Admin can manage role assignments" on public.admin_users
for all to authenticated
using ((select public.is_super_admin()))
with check ((select public.is_super_admin()) and role_key <> 'STUDENT_USER');

-- Student account requests
create policy "Student account requests: student can create own pending request" on public.student_account_requests
for insert to authenticated
with check ((select auth.uid()) = user_id and status = 'PENDING');

create policy "Student account requests: student can read own request" on public.student_account_requests
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Student account requests: Institute Admin can read requests" on public.student_account_requests
for select to authenticated
using ((select public.is_institute_admin()) or (select public.is_super_admin()));

create policy "Student account requests: Institute Admin can update requests" on public.student_account_requests
for update to authenticated
using ((select public.is_institute_admin()))
with check ((select public.is_institute_admin()));

-- Student users
create policy "Student users: own active link visible" on public.student_users
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Student users: Institute Admin can read links" on public.student_users
for select to authenticated
using ((select public.is_institute_admin()) or (select public.is_super_admin()));

create policy "Student users: Institute Admin can manage links" on public.student_users
for all to authenticated
using ((select public.is_institute_admin()))
with check ((select public.is_institute_admin()) and role_key = 'STUDENT_USER');

-- Academic master tables: authenticated can read; Institute Admin can mutate.
create policy "Departments: authenticated read" on public.departments for select to authenticated using (true);
create policy "Departments: Institute Admin mutate" on public.departments for all to authenticated using ((select public.is_institute_admin())) with check ((select public.is_institute_admin()));
create policy "Programs: authenticated read" on public.programs for select to authenticated using (true);
create policy "Programs: Institute Admin mutate" on public.programs for all to authenticated using ((select public.is_institute_admin())) with check ((select public.is_institute_admin()));
create policy "Divisions: authenticated read" on public.divisions for select to authenticated using (true);
create policy "Divisions: Institute Admin mutate" on public.divisions for all to authenticated using ((select public.is_institute_admin())) with check ((select public.is_institute_admin()));
create policy "Academic years: authenticated read" on public.academic_years for select to authenticated using (true);
create policy "Academic years: Institute Admin mutate" on public.academic_years for all to authenticated using ((select public.is_institute_admin())) with check ((select public.is_institute_admin()));
create policy "Courses: authenticated read" on public.courses for select to authenticated using (true);
create policy "Courses: Institute Admin mutate" on public.courses for all to authenticated using ((select public.is_institute_admin())) with check ((select public.is_institute_admin()));
create policy "Subjects: authenticated read" on public.subjects for select to authenticated using (true);
create policy "Subjects: Institute Admin mutate" on public.subjects for all to authenticated using ((select public.is_institute_admin())) with check ((select public.is_institute_admin()));
create policy "Classes: authenticated read" on public.classes for select to authenticated using (true);
create policy "Classes: Institute Admin mutate" on public.classes for all to authenticated using ((select public.is_institute_admin())) with check ((select public.is_institute_admin()));

-- Students
create policy "Students: Student User reads own master record" on public.students
for select to authenticated
using (id = (select public.current_student_record_id()));

create policy "Students: Student/Institute/Super Admin read" on public.students
for select to authenticated
using ((select public.has_admin_role('STUDENT_ADMIN')) or (select public.is_institute_admin()) or (select public.is_super_admin()));

create policy "Students: Institute Admin mutate" on public.students
for all to authenticated
using ((select public.is_institute_admin()))
with check ((select public.is_institute_admin()));

-- Faculty
create policy "Faculty: Faculty/Institute/Super Admin read" on public.faculty
for select to authenticated
using ((select public.has_admin_role('FACULTY_ADMIN')) or (select public.is_institute_admin()) or (select public.is_super_admin()));

create policy "Faculty: Institute Admin mutate" on public.faculty
for all to authenticated
using ((select public.is_institute_admin()))
with check ((select public.is_institute_admin()));

-- Student portal operational data
create policy "Student documents: Student User reads own documents" on public.student_documents
for select to authenticated
using (student_id = (select public.current_student_record_id()));
create policy "Student documents: Student Admin and Institute Admin read" on public.student_documents
for select to authenticated
using ((select public.has_admin_role('STUDENT_ADMIN')) or (select public.is_institute_admin()) or (select public.is_super_admin()));
create policy "Student documents: Student Admin and Institute Admin update" on public.student_documents
for update to authenticated
using ((select public.has_admin_role('STUDENT_ADMIN')) or (select public.is_institute_admin()))
with check ((select public.has_admin_role('STUDENT_ADMIN')) or (select public.is_institute_admin()));

create policy "Student attendance: Student User reads own attendance" on public.student_attendance
for select to authenticated
using (student_id = (select public.current_student_record_id()));
create policy "Student attendance: Student Admin and Institute Admin read" on public.student_attendance
for select to authenticated
using ((select public.has_admin_role('STUDENT_ADMIN')) or (select public.is_institute_admin()) or (select public.is_super_admin()));

create policy "Student academic records: Student User reads own records" on public.student_academic_records
for select to authenticated
using (student_id = (select public.current_student_record_id()));
create policy "Student academic records: Student Admin and Institute Admin read" on public.student_academic_records
for select to authenticated
using ((select public.has_admin_role('STUDENT_ADMIN')) or (select public.is_institute_admin()) or (select public.is_super_admin()));

create policy "Student requests: Student User reads own requests" on public.student_requests
for select to authenticated
using (student_id = (select public.current_student_record_id()));
create policy "Student requests: Student User creates own requests" on public.student_requests
for insert to authenticated
with check (student_id = (select public.current_student_record_id()) and created_by = (select auth.uid()));
create policy "Student requests: Student Admin and Institute Admin read" on public.student_requests
for select to authenticated
using ((select public.has_admin_role('STUDENT_ADMIN')) or (select public.is_institute_admin()) or (select public.is_super_admin()));
create policy "Student requests: Student Admin and Institute Admin update" on public.student_requests
for update to authenticated
using ((select public.has_admin_role('STUDENT_ADMIN')) or (select public.is_institute_admin()))
with check ((select public.has_admin_role('STUDENT_ADMIN')) or (select public.is_institute_admin()));

-- Logs
create policy "Activity logs: authenticated can insert own activity" on public.activity_logs
for insert to authenticated
with check (actor_user_id = (select auth.uid()));
create policy "Activity logs: Super and Institute Admin can read" on public.activity_logs
for select to authenticated
using ((select public.is_super_admin()) or (select public.is_institute_admin()));

create policy "Auth audit logs: Super Admin can read" on public.auth_audit_logs
for select to authenticated
using ((select public.is_super_admin()));
create policy "Auth audit logs: authenticated can insert own event" on public.auth_audit_logs
for insert to authenticated
with check (user_id = (select auth.uid()) or user_id is null);
