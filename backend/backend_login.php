<?php
declare(strict_types=1);

session_start();

require __DIR__ . '/db.php';
require __DIR__ . '/form_security.php';

function redirectWithLoginFlash(string $message, string $type = 'error'): void
{
    set_form_flash('login', $message, $type);

    header('Location: ../login.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../login.php');
    exit;
}

$csrfToken = (string) ($_POST['csrf_token'] ?? '');
if (!is_valid_csrf_token($csrfToken)) {
    redirectWithLoginFlash('Session expired. Please try again.', 'error');
}

$username = clean_input_text($_POST['username'] ?? '', 50);
$password = (string)($_POST['password'] ?? '');

if ($username === '' || $password === '') {
    redirectWithLoginFlash('Try again', 'error');
}

$userStmt = $mysqli->prepare('SELECT id, username, password FROM users WHERE username = ? LIMIT 1');
if (!$userStmt) {
    redirectWithLoginFlash('Try again', 'error');
}

$userStmt->bind_param('s', $username);
$userStmt->execute();
$result = $userStmt->get_result();
$user = $result ? $result->fetch_assoc() : null;
$userStmt->close();

if (!$user) {
    redirectWithLoginFlash('Username cannot be found', 'error');
}

if (!password_verify($password, (string)$user['password'])) {
    redirectWithLoginFlash('Incorrect password', 'error');
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int)$user['id'];
$_SESSION['user_name'] = (string)$user['username'];
$_SESSION['dashboard_loader'] = [
    'message' => 'Loading your dashboard...'
];

header('Location: ../sleep-tracker.php');
exit;
