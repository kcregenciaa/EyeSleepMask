<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/../backend/db.php';

if (empty($_SESSION['user_id']) || !is_numeric($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Unauthorized']);
    exit;
}

$userId = (int) $_SESSION['user_id'];
$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 30;
$limit = max(1, min(100, $limit));

$stmt = $mysqli->prepare(
    'SELECT id, session_date, bedtime, alarm_end, duration_minutes, sleep_score, notes, created_at, updated_at
     FROM sleep_sessions
     WHERE user_id = ?
     ORDER BY session_date DESC, created_at DESC
     LIMIT ?'
);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to load sleep history']);
    exit;
}

$stmt->bind_param('ii', $userId, $limit);
if (!$stmt->execute()) {
    $stmt->close();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to load sleep history']);
    exit;
}

$result = $stmt->get_result();
$rows = [];
while ($row = $result ? $result->fetch_assoc() : null) {
    $rows[] = [
        'id' => (int) ($row['id'] ?? 0),
        'sessionDate' => (string) ($row['session_date'] ?? ''),
        'bedtime' => substr((string) ($row['bedtime'] ?? ''), 0, 5),
        'alarmEnd' => substr((string) ($row['alarm_end'] ?? ''), 0, 5),
        'durationMinutes' => (int) ($row['duration_minutes'] ?? 0),
        'sleepScore' => isset($row['sleep_score']) ? (int) $row['sleep_score'] : null,
        'notes' => (string) ($row['notes'] ?? ''),
        'createdAt' => (string) ($row['created_at'] ?? ''),
        'updatedAt' => (string) ($row['updated_at'] ?? '')
    ];
}
$stmt->close();

echo json_encode(['ok' => true, 'data' => $rows]);
