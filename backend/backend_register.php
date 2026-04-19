<?php
declare(strict_types=1);

session_start();

require __DIR__ . '/db.php';
require __DIR__ . '/form_security.php';

function redirectWithRegisterFlash(string $message, string $type = 'error'): void
{
    set_form_flash('register', $message, $type);

    header('Location: ../register.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../register.php');
    exit;
}

$csrfToken = (string) ($_POST['csrf_token'] ?? '');
if (!is_valid_csrf_token($csrfToken)) {
    redirectWithRegisterFlash('Session expired. Please try again.', 'error');
}

$fullName = clean_input_text($_POST['fullname'] ?? '', 100);
$username = clean_input_text($_POST['username'] ?? '', 50);
$email = clean_input_text($_POST['email'] ?? '', 120);
$birthdate = clean_input_text($_POST['birthdate'] ?? '', 10);
$age = clean_input_text($_POST['age'] ?? '', 3);
$gender = clean_input_text($_POST['gender'] ?? '', 10);
$password = (string)($_POST['password'] ?? '');
$confirmPassword = (string)($_POST['confirm_password'] ?? '');

$persistFormData = [
    'fullname' => $fullName,
    'username' => $username,
    'email' => $email,
    'birthdate' => $birthdate,
    'age' => $age,
    'gender' => $gender
];

if (
    $fullName === '' ||
    $username === '' ||
    $email === '' ||
    $birthdate === '' ||
    $age === '' ||
    $gender === '' ||
    $password === '' ||
    $confirmPassword === ''
) {
    $_SESSION['register_form_data'] = $persistFormData;
    redirectWithRegisterFlash('All fields are required', 'error');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $_SESSION['register_form_data'] = $persistFormData;
    redirectWithRegisterFlash('All fields are required', 'error');
}

$ageInt = filter_var($age, FILTER_VALIDATE_INT);
if ($ageInt === false || $ageInt < 18) {
    $_SESSION['register_form_data'] = $persistFormData;
    redirectWithRegisterFlash('All fields are required', 'error');
}

if (!in_array($gender, ['male', 'female', 'other'], true)) {
    $_SESSION['register_form_data'] = $persistFormData;
    redirectWithRegisterFlash('All fields are required', 'error');
}

$birthDateObj = DateTime::createFromFormat('Y-m-d', $birthdate);
$validBirthdate = $birthDateObj instanceof DateTime && $birthDateObj->format('Y-m-d') === $birthdate;
if (!$validBirthdate) {
    $_SESSION['register_form_data'] = $persistFormData;
    redirectWithRegisterFlash('All fields are required', 'error');
}

if ($password !== $confirmPassword) {
    $_SESSION['register_form_data'] = $persistFormData;
    redirectWithRegisterFlash('Please make sure your passwords match.', 'error');
}

$passwordPattern = '/^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/';
if (!preg_match($passwordPattern, $password)) {
    $_SESSION['register_form_data'] = $persistFormData;
    redirectWithRegisterFlash('Password must meet the required format.', 'error');
}

$checkStmt = $mysqli->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
if (!$checkStmt) {
    $_SESSION['register_form_data'] = $persistFormData;
    redirectWithRegisterFlash('Registration failed. Please try again.', 'error');
}

$checkStmt->bind_param('s', $username);
$checkStmt->execute();
$checkStmt->store_result();

if ($checkStmt->num_rows > 0) {
    $checkStmt->close();
    $_SESSION['register_form_data'] = $persistFormData;
    redirectWithRegisterFlash('Username already exists', 'error');
}

$checkStmt->close();

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$insertStmt = $mysqli->prepare('INSERT INTO users (fullname, username, email, birthdate, age, gender, password) VALUES (?, ?, ?, ?, ?, ?, ?)');
if (!$insertStmt) {
    $_SESSION['register_form_data'] = $persistFormData;
    redirectWithRegisterFlash('Registration failed. Please try again.', 'error');
}

$insertStmt->bind_param('ssssiss', $fullName, $username, $email, $birthdate, $ageInt, $gender, $hashedPassword);
$isInserted = $insertStmt->execute();
$insertStmt->close();

if (!$isInserted) {
    $_SESSION['register_form_data'] = $persistFormData;
    redirectWithRegisterFlash('Registration failed. Please try again.', 'error');
}

set_form_flash('login', 'Successful, You can now login', 'success');
header('Location: ../login.php');
exit;
