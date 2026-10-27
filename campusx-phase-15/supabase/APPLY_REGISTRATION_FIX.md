# Apply the Phase 13 Registration Fix

If migrations 001–010 are already applied to your Supabase project, run only:

`supabase/migrations/011_fix_signup_rls_with_auth_trigger.sql`

Then deploy/upload the updated frontend files:

- `assets/js/supabase/admin-registration.js`
- `assets/js/supabase/student-registration.js`
- `auth/register.html`
- `student-portal/register.html`

After the fix, registration works as follows:

1. Browser calls `supabase.auth.signUp()`.
2. Signup metadata identifies the request as ADMIN or STUDENT.
3. The `auth.users` trigger creates the pending `profiles` row and the matching registration request.
4. The browser does not directly insert into the RLS-protected registration tables.
5. Existing Super Admin / Institute Admin approval workflows remain responsible for activation.

Do not disable RLS.
