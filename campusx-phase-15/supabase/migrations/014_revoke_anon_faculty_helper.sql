-- Remove direct anonymous RPC execution for the Faculty Admin RLS helper.
revoke execute on function public.is_faculty_admin() from anon;
