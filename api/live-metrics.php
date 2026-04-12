<?php
header('Content-Type: application/json; charset=utf-8');

$dataFile = __DIR__ . '/../data/arduino-latest.json';
if (!file_exists($dataFile)) {
    echo json_encode([
        'ok' => false,
        'error' => 'No device data yet'
    ]);
    exit;
}

$content = file_get_contents($dataFile);
$payload = json_decode((string) $content, true);
if (!is_array($payload)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Corrupt data']);
    exit;
}

echo json_encode($payload);
