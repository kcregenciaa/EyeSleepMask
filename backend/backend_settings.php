<?php
declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

require __DIR__ . '/db.php';

if (empty($_SESSION['user_id']) || !is_numeric($_SESSION['user_id'])) {
    header('Location: ../login.php');
    exit;
}

$userId = (int) $_SESSION['user_id'];

$settingsStmt = $mysqli->prepare('SELECT fullname, username, email, birthdate, age, gender FROM users WHERE id = ? LIMIT 1');
if (!$settingsStmt) {
    http_response_code(500);
    echo 'Failed to load profile data.';
    exit;
}

$settingsStmt->bind_param('i', $userId);
$settingsStmt->execute();
$result = $settingsStmt->get_result();
$userProfile = $result ? $result->fetch_assoc() : null;
$settingsStmt->close();

if (!is_array($userProfile)) {
    header('Location: ../login.php');
    exit;
}

return $userProfile;
