-- Used by backend/backend_edit_profile.php
-- Updates the logged-in user's profile fields in the users table.

UPDATE users
SET fullname = ?, age = ?, birthdate = ?, gender = ?, email = ?
WHERE id = ?;

-- Used to prevent duplicate email addresses during profile update.
SELECT id
FROM users
WHERE email = ? AND id <> ?
LIMIT 1;
