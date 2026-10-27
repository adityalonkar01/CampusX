# CampusX Dashboard Components

Prompt 4 introduces a shared dashboard shell rendered by `assets/js/dashboard.js` and styled by `assets/css/dashboard.css`.

- Role configuration and navigation live in `dashboard.js`.
- All five portal pages use the same shell and component renderer.
- `DEMO_MODE` is intentionally enabled; no authentication or backend authorization is performed here.
- `components/*.html` files are lightweight templates/reference points for future server-side/component integration.
