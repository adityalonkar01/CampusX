# CampusX Prompt 13 — Supabase Backend Implementation

This folder contains the Supabase-ready backend path for the College Management System.

## What Supabase replaces

Prompt 12 added PHP/MySQL authentication scaffolding. Prompt 13 keeps that folder for reference and adds Supabase as the active backend path:

- Supabase Auth for email/password login and password recovery.
- Supabase PostgreSQL for application data.
- Row Level Security for authorization.
- Edge Functions for privileged approval and master-data actions.
- Frontend Supabase JavaScript modules under `assets/js/supabase/`.

## Required setup

1. Create a Supabase project.
2. Open `assets/js/supabase/supabase-client.js`.
3. Replace:
   - `YOUR_SUPABASE_PROJECT_URL`
   - `YOUR_SUPABASE_PUBLISHABLE_KEY`
4. Apply migrations in this order from `supabase/migrations/`.
5. Deploy Edge Functions from `supabase/functions/`.
6. Configure Supabase Auth email settings and password recovery redirect URLs.
7. Create the first Super Admin securely.

## First Super Admin bootstrap

Do not allow public self-activation of `SUPER_ADMIN`.

Recommended development bootstrap:

1. Create a user in Supabase Auth dashboard.
2. Insert a matching `profiles` row.
3. Insert an `admin_users` row with `role_key = 'SUPER_ADMIN'` using a controlled SQL script.
4. Remove or restrict any temporary bootstrap script after setup.

## Role model

`STUDENT_ADMIN` and `STUDENT_USER` are intentionally separate:

- `STUDENT_ADMIN`: staff/admin user for `student/dashboard.html`.
- `STUDENT_USER`: individual student user for `student-portal/dashboard.html`.

`STUDENT_USER` must live in `student_users`, not `admin_users`.

## Security notes

- Never expose the Supabase service role key in frontend JavaScript.
- Never store passwords in public tables.
- Never rely on `user_metadata` for authorization.
- Every public table has RLS enabled.
- Approval actions should go through Edge Functions.
- The frontend portal selector is only a visual guide; authorization comes from `admin_users` or `student_users`.

## Edge Functions

Active Edge Functions included in this Phase 13 package:

- `approve-admin-registration`
- `approve-student-account`
- `suspend-student-account`
- `activate-student-account`
- `create-student-master`
- `create-faculty-master`

Not included in the active Edge Function set:

- `reject-admin-registration`
- `reject-student-account`
- `update-student-master`
- `delete-student-master`
- `update-faculty-master`
- `delete-faculty-master`

Those actions should not be deployed as Edge Functions in this stage. Keep them for a later phase or implement them only after deciding the exact RLS/direct-table-update model.

Deploy active functions with JWT verification enabled. These functions use the caller JWT plus server-side role checks.

## Known limitations before live setup

- No project URL or publishable key is configured yet.
- Migrations have not been applied to a live Supabase project.
- Edge Functions have not been deployed to a live project.
- Live Supabase Auth email templates and redirect URLs still need configuration.
- Live RLS behavior must be tested after migrations are applied.

## Edge Function import fix

All Edge Functions use direct Deno-compatible npm imports:

```ts
import { createClient } from "npm:@supabase/supabase-js@2";
```

Do not change this to `@Supabase/supabase-js` or `@supabase/supabase-js` unless the function-specific `deno.json` import map is uploaded with the function. Supabase Edge Functions are case-sensitive and bare imports must be mapped or prefixed with `npm:`/`jsr:`.


## Registration RLS fix (migration 011)

Apply `supabase/migrations/011_fix_signup_rls_with_auth_trigger.sql` after migrations 001–010.

This migration fixes registration failures such as:

```text
new row violates row-level security policy for table "profiles"
```

The reason is that Supabase email-confirmation signups may create `auth.users` before a browser session exists. The registration frontend therefore no longer inserts directly into `profiles`, `admin_registration_requests`, or `student_account_requests`.

The new `auth.users` trigger reads trusted signup metadata and creates the appropriate pending profile/request using a `SECURITY DEFINER` database function. RLS remains enabled.

Admin signup metadata:

```text
user_category = ADMIN
full_name
requested_role
```

Student signup metadata:

```text
user_category = STUDENT
full_name
student_id
admission_number
first_name
middle_name
last_name
dob
gender
phone
```

Do **not** disable RLS and do **not** add anonymous `WITH CHECK (true)` insert policies as a workaround.
