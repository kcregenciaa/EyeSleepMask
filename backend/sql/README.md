# Backend SQL Files

Import or run these files in this order:

1. `01_create_database.sql`
2. `02_users_table.sql`
3. `03_update_profile.sql` only if you want the profile update queries documented separately
4. `04_sleep_data.sql` for sleep settings, session history, telemetry, and movement storage

## Notes
- The `users` table is the main table used by registration, login, and profile editing.
- The profile update SQL is already implemented in `backend/backend_edit_profile.php`.
- The sleep tracker data lives in `sleep_settings`, `sleep_sessions`, `telemetry_samples`, and `motion_samples`.
- The sleep session save/load API is implemented in `api/sleep-sessions.php`.
