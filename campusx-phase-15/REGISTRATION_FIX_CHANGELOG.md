# Registration RLS Fix — Change Summary

## Fixed

- Administrator registration no longer inserts directly into RLS-protected `profiles` or `admin_registration_requests` from the browser.
- Student registration no longer inserts directly into RLS-protected `profiles` or `student_account_requests` from the browser.
- Signup metadata now carries the information required by the database trigger.
- Added migration `011_fix_signup_rls_with_auth_trigger.sql` to create pending registration records from `auth.users` using a `SECURITY DEFINER` trigger.
- Added server-side role allow-list validation inside the trigger.
- Added password-strength validation and clearer registration errors.
- Pending accounts are signed out immediately when Supabase returns a session during signup.
- Removed the misleading self-update RLS policy on `profiles`; approval/status changes remain privileged.
- Added setup instructions in `supabase/APPLY_REGISTRATION_FIX.md`.

## Required live Supabase step

For a project that already has migrations 001–010 applied, execute only:

`supabase/migrations/011_fix_signup_rls_with_auth_trigger.sql`

Then deploy the updated frontend files. Do not disable RLS.
