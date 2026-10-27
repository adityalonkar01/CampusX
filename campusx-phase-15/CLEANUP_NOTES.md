# CampusX cleanup notes

## What was removed

- Removed the seeded MySQL demo administrator accounts and their shared testing password.
- Removed sample student and faculty rows, sample departments/programs/divisions/classes/subjects/academic years, and the seed activity-log row from `database/seed.sql`.
- Removed sample institutional master records, student `STU1001`, and faculty `FAC1001` from Supabase migration `010_seed_roles_and_demo_data.sql`.
- Kept role/permission catalogs and database schemas/migrations required to define the application.

## Important limitation

This cleanup removes database seed records. The ZIP still contains frontend demonstration screens and JavaScript mock datasets used by some dashboards to illustrate the UI. Those are separate from database seed records and have not been globally removed, because several pages are explicitly implemented as demo-mode interfaces and indiscriminately deleting their mock data could break page rendering. The active Supabase services should be configured and tested before treating the application as production-ready.

## After importing

The database will not have a ready-made login account or pre-populated student/faculty records. Set up a first administrator securely, configure Supabase URL and publishable key, apply migrations in order, deploy the required Edge Functions, and add actual institution data through authorized workflows.
