# CampusX Database Setup

This folder contains the legacy Prompt 12 MySQL database foundation.

## Files

- `schema.sql` creates the database and required tables.
- `seed.sql` inserts only role and permission definitions. It does **not** create login accounts or sample student, faculty, or academic records.

## Local setup

1. Create/import the schema:

```bash
mysql -u root -p < database/schema.sql
```

2. Import role and permission definitions:

```bash
mysql -u root -p college_management_system < database/seed.sql
```

3. Configure the PHP database connection in `backend/config/database.php`.

## First administrator

No default administrator account or shared password is included. Create the first administrator using a controlled, secure setup procedure appropriate to your deployment. Do not use a public signup flow to self-assign `SUPER_ADMIN`.

## Security warning

Do not deploy this legacy PHP/MySQL path publicly until authentication, CSRF, validation, rate limiting, password reset, server configuration and role-based authorization are reviewed and tested.

## Supabase implementation

The active backend path is under `supabase/migrations/`. The MySQL schema is retained for reference. Do not import both database paths into the same production environment.
