# CampusX Backend Foundation

Prompt 12 adds the PHP/MySQL backend foundation while preserving the existing frontend demo mode.

## Scope

Implemented in this phase:

- PDO database connection
- Login endpoint
- Logout endpoint
- Session check endpoint
- Server-side role verification helpers
- Permission middleware scaffold
- Student registration backend
- Institute Admin approval/reject/suspend/activate endpoints
- Password change endpoint
- Forgot/reset password structure
- Activity logging helper
- Database schema and seed files

This phase does not convert every frontend module to database CRUD. Student, faculty, CRC, council, CR and reporting modules can still run in static/demo mode.

## Folder structure

```text
backend/
├── config/
├── auth/
├── middleware/
├── helpers/
├── users/
├── student-accounts/
└── admin/
```

## Database configuration

`backend/config/database.php` uses PDO and reads these environment variables when available:

```text
DB_HOST
DB_NAME
DB_USER
DB_PASS
DB_CHARSET
```

Local fallback values are included only for development.

## Authentication model

Admin users are stored in the `users` table and linked to `roles`.
Student users are stored in `student_accounts` after Institute Admin approval.

Login uses:

- `password_verify()`
- `session_start()` through `cmsStartSecureSession()`
- `session_regenerate_id(true)` after successful login
- server-side role matching between the selected portal and the actual database role

Session values are limited to safe identifiers:

```php
$_SESSION['user_id'];
$_SESSION['role_key'];
$_SESSION['full_name'];
$_SESSION['email'];
```

Plain passwords are never stored in the session.

## Default local credentials

Default admin password for local seed users:

```text
12345678
```

Seeded admin accounts:

- `director@campusx.edu`
- `institute.admin@campusx.edu`
- `student.admin@campusx.edu`
- `faculty.admin@campusx.edu`
- `cr.admin@campusx.edu`
- `council.admin@campusx.edu`
- `crc.admin@campusx.edu`

The seed data stores a password hash generated with:

```php
password_hash('12345678', PASSWORD_DEFAULT);
```

## Student registration flow

1. Student submits registration from `student-portal/register.html`.
2. Backend checks the matching student master record.
3. Request is stored as `pending` in `student_account_requests`.
4. Institute Admin approves the request.
5. Backend creates or activates the `student_accounts` row.
6. Student Portal login works only for active approved accounts.

## Frontend fallback

The existing JavaScript demo workflows are preserved. If PHP is not running, the frontend keeps using sessionStorage demo behavior so static pages still open for testing.

## Security warning

Do not deploy this project publicly until authentication, CSRF, validation, rate limiting, password reset, server configuration and role-based authorization are fully hardened.

## PROMPT 13 SUPABASE LEGACY NOTICE

This `backend/` PHP/MySQL foundation is retained as the Prompt 12 reference implementation only. Prompt 13 introduces Supabase Auth, Supabase PostgreSQL, Row Level Security and Edge Functions as the active backend path.

Do not run the PHP/MySQL authentication path and the Supabase authentication path together in production. Use `supabase/README.md` for the active setup instructions.
