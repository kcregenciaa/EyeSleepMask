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

$toDateTime = function (?string $value, string $fallback): string {
    if (!is_string($value) || trim($value) === '') {
        return $fallback;
    }

    $parsed = date_create($value);
    if (!$parsed instanceof DateTimeInterface) {
        return $fallback;
    }

    return $parsed->format('Y-m-d H:i:s');
};

$toTime = function (?string $value, string $fallback): string {
    if (!is_string($value) || !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $value)) {
        return $fallback;
    }

    return $value . ':00';
};

$computeSessionDate = function (string $startAt): string {
    $parsed = date_create($startAt);
    if (!$parsed instanceof DateTimeInterface) {
        return gmdate('Y-m-d');
    }

    return $parsed->format('Y-m-d');
};

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $mysqli->prepare(
        'SELECT id, session_date, bedtime, alarm_end, duration_minutes, sleep_score, notes, created_at, updated_at
         FROM sleep_sessions
         WHERE user_id = ?
         ORDER BY session_date DESC, created_at DESC
         LIMIT 30'
    );

    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Failed to load sleep sessions']);
        exit;
    }

    $stmt->bind_param('i', $userId);
    if (!$stmt->execute()) {
        $stmt->close();
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Failed to load sleep sessions']);
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
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode((string) $raw, true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

$startAt = $toDateTime(isset($payload['startAt']) ? (string) $payload['startAt'] : null, gmdate('Y-m-d H:i:s'));
$endAt = $toDateTime(isset($payload['endAt']) ? (string) $payload['endAt'] : null, gmdate('Y-m-d H:i:s'));
$bedtime = $toTime(isset($payload['bedtime']) ? (string) $payload['bedtime'] : null, '00:20:00');
$alarmEnd = $toTime(isset($payload['alarmEnd']) ? (string) $payload['alarmEnd'] : null, '05:20:00');
$durationMinutes = isset($payload['durationMinutes']) ? (int) $payload['durationMinutes'] : 0;
$sleepScore = isset($payload['sleepScore']) && is_numeric($payload['sleepScore']) ? (int) $payload['sleepScore'] : null;
$notes = isset($payload['notes']) ? trim((string) $payload['notes']) : null;

if ($durationMinutes <= 0) {
    $startStamp = date_create($startAt);
    $endStamp = date_create($endAt);
    if ($startStamp instanceof DateTimeInterface && $endStamp instanceof DateTimeInterface) {
        $delta = max(0, $endStamp->getTimestamp() - $startStamp->getTimestamp());
        $durationMinutes = (int) max(1, ceil($delta / 60));
    } else {
        $durationMinutes = 1;
    }
}

if ($sleepScore !== null) {
    $sleepScore = max(0, min(100, $sleepScore));
}

$sessionDate = isset($payload['sessionDate']) && is_string($payload['sessionDate']) && $payload['sessionDate'] !== ''
    ? $payload['sessionDate']
    : $computeSessionDate($startAt);

$notesValue = $notes === '' ? null : $notes;

$insert = $mysqli->prepare(
    'INSERT INTO sleep_sessions (user_id, session_date, bedtime, alarm_end, duration_minutes, sleep_score, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
        bedtime = VALUES(bedtime),
        alarm_end = VALUES(alarm_end),
        duration_minutes = VALUES(duration_minutes),
        sleep_score = VALUES(sleep_score),
        notes = VALUES(notes)'
);

if (!$insert) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to save sleep session']);
    exit;
}

$insert->bind_param('isssiis', $userId, $sessionDate, $bedtime, $alarmEnd, $durationMinutes, $sleepScore, $notesValue);
$saved = $insert->execute();
$insert->close();

if (!$saved) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to save sleep session']);
    exit;
}

echo json_encode([
    'ok' => true,
    'data' => [
        'sessionDate' => $sessionDate,
        'bedtime' => substr($bedtime, 0, 5),
        'alarmEnd' => substr($alarmEnd, 0, 5),
        'durationMinutes' => $durationMinutes,
        'sleepScore' => $sleepScore,
        'notes' => $notesValue
    ]
]);
