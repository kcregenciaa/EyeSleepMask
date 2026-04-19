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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $mysqli->prepare(
        'SELECT note_date, note_text
         FROM sleep_notes
         WHERE user_id = ?
         ORDER BY note_date DESC'
    );

    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Failed to load notes']);
        exit;
    }

    $stmt->bind_param('i', $userId);
    if (!$stmt->execute()) {
        $stmt->close();
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Failed to load notes']);
        exit;
    }

    $result = $stmt->get_result();
    $notes = [];
    while ($row = $result ? $result->fetch_assoc() : null) {
        $date = (string) ($row['note_date'] ?? '');
        if ($date === '') {
            continue;
        }

        $notes[$date] = (string) ($row['note_text'] ?? '');
    }
    $stmt->close();

    echo json_encode(['ok' => true, 'data' => $notes]);
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

$noteDate = isset($payload['noteDate']) ? (string) $payload['noteDate'] : '';
$noteText = isset($payload['noteText']) ? trim((string) $payload['noteText']) : '';

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $noteDate)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid note date']);
    exit;
}

if ($noteText === '') {
    $delete = $mysqli->prepare('DELETE FROM sleep_notes WHERE user_id = ? AND note_date = ?');
    if (!$delete) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Failed to delete note']);
        exit;
    }

    $delete->bind_param('is', $userId, $noteDate);
    $deleted = $delete->execute();
    $delete->close();

    if (!$deleted) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Failed to delete note']);
        exit;
    }

    echo json_encode(['ok' => true, 'data' => ['noteDate' => $noteDate, 'noteText' => '']]);
    exit;
}

$upsert = $mysqli->prepare(
    'INSERT INTO sleep_notes (user_id, note_date, note_text)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE note_text = VALUES(note_text)'
);

if (!$upsert) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to save note']);
    exit;
}

$upsert->bind_param('iss', $userId, $noteDate, $noteText);
$saved = $upsert->execute();
$upsert->close();

if (!$saved) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to save note']);
    exit;
}

echo json_encode(['ok' => true, 'data' => ['noteDate' => $noteDate, 'noteText' => $noteText]]);
