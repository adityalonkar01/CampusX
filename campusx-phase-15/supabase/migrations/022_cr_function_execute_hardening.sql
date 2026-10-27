-- CampusX Prompt 15: tighten EXECUTE privileges on SECURITY DEFINER helpers.
-- RLS/RPC helpers remain authenticated-only; trigger functions are not directly callable.

-- Prompt 15 RLS/RPC helpers: no anonymous execution.
revoke execute on function public.is_cr_admin() from anon;
revoke execute on function public.current_cr_class_id() from anon;
revoke execute on function public.current_student_class_id() from anon;
revoke execute on function public.student_belongs_to_class(uuid,uuid) from anon;
revoke execute on function public.faculty_assigned_to_class(uuid,uuid) from anon;
revoke execute on function public.get_cr_class_students() from anon;
revoke execute on function public.get_cr_relevant_faculty() from anon;

-- Trigger-only Prompt 15 functions must not be callable through RPC.
revoke execute on function public.validate_cr_assignment() from anon, authenticated;
revoke execute on function public.protect_cr_request_update() from anon, authenticated;
revoke execute on function public.protect_cr_faculty_message_update() from anon, authenticated;
revoke execute on function public.protect_cr_feedback_update() from anon, authenticated;
revoke execute on function public.validate_class_academic_faculty() from anon, authenticated;
revoke execute on function public.log_cr_coordination_activity() from anon, authenticated;

-- Existing role helpers are used by authenticated RLS policies but never need anonymous RPC access.
revoke execute on function public.current_admin_role() from anon;
revoke execute on function public.has_admin_role(text) from anon;
revoke execute on function public.is_super_admin() from anon;
revoke execute on function public.is_institute_admin() from anon;
revoke execute on function public.is_faculty_admin() from anon;
revoke execute on function public.is_student_user() from anon;
revoke execute on function public.current_student_record_id() from anon;
