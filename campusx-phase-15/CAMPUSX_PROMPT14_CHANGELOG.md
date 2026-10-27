# CampusX Prompt 14 — Faculty Operations & Academic Workload Management

## Scope
Prompt 14 extends the existing CampusX architecture. It does not replace authentication, the shared dashboard shell, Institute Admin master-data ownership, or existing portals.

## Authority model
- `INSTITUTE_ADMIN` remains the owner of Faculty master record creation and protected master fields.
- `FACULTY_ADMIN` manages operational Faculty data only.
- `SUPER_ADMIN` has read/oversight access to Faculty Operations.
- The Faculty Admin sidebar does not expose Add Faculty.
- The legacy `faculty/add-faculty.html` route renders an authority-boundary explanation instead of a Faculty creation form.

## Faculty UI added/improved
- Faculty Directory and Faculty Profiles
- Faculty Profile with operational tabs and protected master fields
- Departments (read-oriented)
- Faculty Documents
- Subject Assignments
- Class Assignments
- Teaching Workload + workload classification
- Lecture Schedule
- Timetable + overlap/conflict detection
- Faculty Attendance
- Leave Requests
- Faculty Requests
- Teaching Resources (metadata-first)
- Academic Responsibilities
- Faculty Activities
- Announcements, Notices and Notifications
- Faculty Reports
- Workload Reports
- Attendance Reports
- Faculty Analytics

## Functional table system
Major Faculty tables use:

`Raw Data -> Search -> Filters -> Sort -> Pagination -> Render`

with:
- 10 / 25 / 50 / 100 rows per page
- browser-side CSV export
- actions excluded from CSV
- live-DOM event delegation
- no detached `.outerHTML` event-listener pattern

## Frontend/service files
Added:
- `assets/js/supabase/faculty-service.js`
- `assets/css/faculty-operations.css`

Modified:
- `assets/js/faculty-dashboard.js`
- `assets/js/dashboard.js`
- `assets/js/admin-authority.js`
- Faculty HTML pages to load the Prompt 14 service/UI layer

## Institute Admin integration
When the browser Supabase client is configured, Institute Admin Add Faculty now calls the existing protected `create-faculty-master` Edge Function. The Faculty Operations module reads from `public.faculty`, so newly-created master records become available to Faculty Administration without a duplicate faculty dataset.

## Supabase database migrations
The following migrations were applied successfully to the connected CampusX Supabase project:

1. `faculty_operations_prompt14`
2. `faculty_ops_security_hardening`
3. `revoke_anon_faculty_helper`
4. `faculty_ops_policy_and_index_optimization`

Local SQL copies are stored as:
- `supabase/migrations/012_faculty_operations.sql`
- `supabase/migrations/013_faculty_ops_security_hardening.sql`
- `supabase/migrations/014_revoke_anon_faculty_helper.sql`
- `supabase/migrations/015_faculty_ops_policy_and_index_optimization.sql`

## Database entities added
- `faculty_subject_assignments`
- `faculty_class_assignments`
- `faculty_workload`
- `faculty_attendance`
- `faculty_leave_requests`
- `faculty_requests`
- `faculty_resources`
- `faculty_responsibilities`
- `faculty_activities`
- `faculty_schedule`
- `faculty_documents`

All Prompt 14 tables have RLS enabled.

## RLS boundaries
Operational tables:
- SELECT: `FACULTY_ADMIN`, `INSTITUTE_ADMIN`, `SUPER_ADMIN`
- INSERT/UPDATE/DELETE: `FACULTY_ADMIN`, `INSTITUTE_ADMIN`

Faculty documents:
- SELECT: `FACULTY_ADMIN`, `INSTITUTE_ADMIN`, `SUPER_ADMIN`
- INSERT/UPDATE/DELETE: `INSTITUTE_ADMIN` only

`public.faculty` remains protected by the pre-existing rule: Faculty Admin can read it, while Institute Admin owns master-record mutations.

## Security hardening
- Added `is_faculty_admin()` role helper.
- Explicitly revoked anonymous execution of the new role helper.
- Fixed `set_updated_at()` with a fixed search path.
- Split Prompt 14 mutation RLS policies into INSERT/UPDATE/DELETE policies to avoid duplicate SELECT-policy overhead.
- Added covering indexes for Prompt 14 foreign keys.
- No Supabase service-role/secret key is included in browser-side HTML/JavaScript.

## Known limitations
- The downloadable project intentionally keeps the Supabase project URL/publishable-key placeholders in `assets/js/supabase/supabase-client.js`; configure only the public/publishable client values for live browser mode.
- There is currently no active `FACULTY_ADMIN` account in the connected live database, so end-to-end role execution could not be exercised with a real Faculty Admin session. RLS was verified by policy inspection and database structure checks.
- Real Faculty resource file uploads are not implemented in Prompt 14. Resource metadata is supported; Supabase Storage can be connected later.
- Chromium-based visual/runtime QA could not be completed in this execution environment because the local headless browser process stalls. Static syntax, link, architecture and database checks were completed instead.
- The Supabase advisor still reports pre-existing project-wide security/performance recommendations outside Prompt 14 (for example older SECURITY DEFINER helpers and leaked-password protection settings).
