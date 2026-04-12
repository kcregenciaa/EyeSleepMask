<?php
header('Content-Type: application/json; charset=utf-8');

$dataFile = __DIR__ . '/../data/motion-data.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);

    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
        exit;
    }

    $motion = isset($payload['motion']) ? $payload['motion'] : null;

    $record = [
        'time' => gmdate('c'),
        'motion' => $motion
    ];

    $existing = [];
    if (file_exists($dataFile)) {
        $decoded = json_decode((string) file_get_contents($dataFile), true);
        if (is_array($decoded)) {
            $existing = $decoded;
        }
    }

    $existing[] = $record;
    if (count($existing) > 100) {
        $existing = array_slice($existing, -100);
    }

    $encoded = json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($encoded === false || file_put_contents($dataFile, $encoded . PHP_EOL, LOCK_EX) === false) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Write failed']);
        exit;
    }

    echo json_encode(['ok' => true, 'saved' => $record]);
    exit;
}

if (!file_exists($dataFile)) {
    echo json_encode(['ok' => true, 'data' => []]);
    exit;
}

$content = file_get_contents($dataFile);
$payload = json_decode((string) $content, true);
if (!is_array($payload)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Corrupt data']);
    exit;
}

echo json_encode(['ok' => true, 'data' => $payload]);
