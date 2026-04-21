<?php
declare(strict_types=1);

session_start();

require __DIR__ . '/db.php';
require __DIR__ . '/form_security.php';

function redirectWithProfileFlash(string $message, string $type = 'error'): void
{
    set_form_flash('profile', $message, $type);

    header('Location: ../edit-profile.php');
    exit;
}

if (empty($_SESSION['user_id']) || !is_numeric($_SESSION['user_id'])) {
    header('Location: ../login.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../edit-profile.php');
    exit;
}

$csrfToken = (string) ($_POST['csrf_token'] ?? '');
if (!is_valid_csrf_token($csrfToken)) {
    redirectWithProfileFlash('Session expired. Please try again.', 'error');
}

$userId = (int) $_SESSION['user_id'];
$fullname = clean_input_text($_POST['name'] ?? '', 100);
$age = clean_input_text($_POST['age'] ?? '', 3);
$birthdate = clean_input_text($_POST['birthdate'] ?? '', 10);
$gender = clean_input_text($_POST['gender'] ?? '', 20);
$email = clean_input_text($_POST['email'] ?? '', 120);

if ($fullname === '' || $age === '' || $birthdate === '' || $gender === '' || $email === '') {
    redirectWithProfileFlash('All fields are required', 'error');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    redirectWithProfileFlash('Please enter a valid email address.', 'error');
}

$ageInt = filter_var($age, FILTER_VALIDATE_INT);
if ($ageInt === false || $ageInt < 18) {
    redirectWithProfileFlash('Age must be 18 or above.', 'error');
}

$birthDateObject = DateTime::createFromFormat('Y-m-d', $birthdate);
$birthDateValid = $birthDateObject instanceof DateTime && $birthDateObject->format('Y-m-d') === $birthdate;
if (!$birthDateValid) {
    redirectWithProfileFlash('Birthdate format is invalid.', 'error');
}

$eighteenthBirthday = (clone $birthDateObject)->modify('+18 years');
if ($eighteenthBirthday > new DateTime('today')) {
    redirectWithProfileFlash('Birthdate indicates age is below 18.', 'error');
}

if (!in_array($gender, ['Male', 'Female', 'Other', 'Prefer not to say'], true)) {
    redirectWithProfileFlash('Please select a valid gender.', 'error');
}

$emailCheck = $mysqli->prepare('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1');
if (!$emailCheck) {
    redirectWithProfileFlash('Profile update failed. Please try again.', 'error');
}

$emailCheck->bind_param('si', $email, $userId);
$emailCheck->execute();
$emailCheck->store_result();
if ($emailCheck->num_rows > 0) {
    $emailCheck->close();
    redirectWithProfileFlash('Email already exists', 'error');
}
$emailCheck->close();

$updateStmt = $mysqli->prepare('UPDATE users SET fullname = ?, age = ?, birthdate = ?, gender = ?, email = ? WHERE id = ?');
if (!$updateStmt) {
    redirectWithProfileFlash('Profile update failed. Please try again.', 'error');
}

$updateStmt->bind_param('sisssi', $fullname, $ageInt, $birthdate, $gender, $email, $userId);
$updated = $updateStmt->execute();
$updateStmt->close();

if (!$updated) {
    redirectWithProfileFlash('Profile update failed. Please try again.', 'error');
}

$_SESSION['user_name'] = $fullname;
$_SESSION['user_profile'] = [
    'name' => $fullname,
    'age' => (string) $ageInt,
    'birthdate' => $birthdate,
    'gender' => $gender,
    'email' => $email
];

redirectWithProfileFlash('Profile updated successfully!', 'success');
