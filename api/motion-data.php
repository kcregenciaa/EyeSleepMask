<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/../backend/db.php';

$dataFile = __DIR__ . '/../data/motion-data.json';
$userId = !empty($_SESSION['user_id']) && is_numeric($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;

$loadFileData = function () use ($dataFile): array {
    if (!file_exists($dataFile)) {
        return [];
    }

    $decoded = json_decode((string) file_get_contents($dataFile), true);
    return is_array($decoded) ? $decoded : [];
};

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);

    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
        exit;
    }

    $motion = isset($payload['motion']) ? (int) $payload['motion'] : null;
    if ($motion === null) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Motion value is required']);
        exit;
    }

    $motion = max(0, min(100, $motion));
    $stamp = gmdate('Y-m-d H:i:s');
    $record = [
        'time' => gmdate('c'),
        'motion' => $motion
    ];

    $dbSaved = false;
    if ($userId === null) {
        $stmt = $mysqli->prepare('INSERT INTO motion_samples (user_id, motion, sample_time) VALUES (NULL, ?, ?)');
        if ($stmt) {
            $stmt->bind_param('is', $motion, $stamp);
            $dbSaved = $stmt->execute();
            $stmt->close();
        }
    } else {
        $stmt = $mysqli->prepare('INSERT INTO motion_samples (user_id, motion, sample_time) VALUES (?, ?, ?)');
        if ($stmt) {
            $stmt->bind_param('iis', $userId, $motion, $stamp);
            $dbSaved = $stmt->execute();
            $stmt->close();
        }
    }

    $existing = $loadFileData();
    $existing[] = $record;
    if (count($existing) > 100) {
        $existing = array_slice($existing, -100);
    }

    $encoded = json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($encoded !== false) {
        @file_put_contents($dataFile, $encoded, LOCK_EX);
    }

    echo json_encode([
        'ok' => true,
        'saved' => $record,
        'dbSaved' => $dbSaved
    ]);
    exit;
}

$records = [];

$loadMotionRows = function (?int $filterUserId) use ($mysqli): array {
    $rows = [];
    if ($filterUserId === null) {
        $stmt = $mysqli->prepare(
            'SELECT DATE_FORMAT(sample_time, "%Y-%m-%dT%H:%i:%sZ") AS time, motion
             FROM motion_samples
             WHERE user_id IS NULL
             ORDER BY sample_time DESC
             LIMIT 100'
        );
        if (!$stmt) {
            return [];
        }
    } else {
        $stmt = $mysqli->prepare(
            'SELECT DATE_FORMAT(sample_time, "%Y-%m-%dT%H:%i:%sZ") AS time, motion
             FROM motion_samples
             WHERE user_id = ? OR user_id IS NULL
             ORDER BY sample_time DESC
             LIMIT 100'
        );
        if (!$stmt) {
            return [];
        }
        $stmt->bind_param('i', $filterUserId);
    }

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        while ($row = $result ? $result->fetch_assoc() : null) {
            $rows[] = [
                'time' => (string) ($row['time'] ?? gmdate('c')),
                'motion' => (int) ($row['motion'] ?? 0)
            ];
        }
    }
    $stmt->close();

    $rows = array_reverse($rows);

    return $rows;
};

if ($userId !== null) {
    $records = $loadMotionRows($userId);
}

if (!$records) {
    $records = $loadMotionRows(null);
}

if (!$records) {
    $records = $loadFileData();
}

echo json_encode(['ok' => true, 'data' => $records]);
