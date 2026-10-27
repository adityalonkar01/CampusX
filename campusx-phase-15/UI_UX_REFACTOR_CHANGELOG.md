# CampusX Global UI/UX Refactor

This refactor is intentionally visual-only. It preserves Supabase, authentication, registration/approval flows, routing, datasets and portal JavaScript.

## New shared layer
- `assets/css/ui-system.css` is loaded last on every HTML page.
- Centralized design tokens for typography, spacing, radii, controls, shadows and responsive breakpoints.
- Unified dashboard shell geometry across Student, Faculty, CR, Council, CRC, Institute Admin and Super Admin.

## Normalized components
- Sidebar and topbar proportions
- Breadcrumbs and page headers
- Buttons and icon buttons
- KPI/stat cards
- Content cards and two-column dashboard grids
- Quick actions
- Tables, badges, table actions and pagination
- Search/filter toolbars
- Forms, validation/help text and form grids
- Modals and confirmation dialogs
- Activity feeds and list items
- Student Management profile/tabs/reports
- Council and CRC specialized modules
- Institute/Super Admin authority screens
- Login, registration and password-recovery UI
- Student self-service registration
- Public navigation and card geometry

## Responsive system
Standardized around 1200, 1024, 900, 768, 576 and 390px with mobile-first fallbacks for cards, actions, tables, forms and modals.

## Functional scope
No Supabase credentials, RLS, authentication code, registration triggers, role routing or application data logic was intentionally changed by this phase.
