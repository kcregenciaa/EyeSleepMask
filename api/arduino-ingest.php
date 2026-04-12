<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

$device = isset($payload['device']) ? trim((string) $payload['device']) : 'xiao-nrf52840';
$snoreLevel = isset($payload['snoreLevel']) ? (int) $payload['snoreLevel'] : 0;
$movement = isset($payload['movement']) ? (int) $payload['movement'] : 0;
$battery = isset($payload['battery']) ? (int) $payload['battery'] : 0;
$timestamp = isset($payload['timestamp']) ? (string) $payload['timestamp'] : null;

$snoreLevel = max(0, min(100, $snoreLevel));
$movement = max(0, min(100, $movement));
$battery = max(0, min(100, $battery));

$record = [
    'ok' => true,
    'device' => $device,
    'snoreLevel' => $snoreLevel,
    'movement' => $movement,
    'battery' => $battery,
    'timestamp' => $timestamp,
    'receivedAt' => gmdate('c')
];

$dataFile = __DIR__ . '/../data/arduino-latest.json';
$encoded = json_encode($record, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
if ($encoded === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Encode failed']);
    exit;
}

if (file_put_contents($dataFile, $encoded . PHP_EOL, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Write failed']);
    exit;
}

echo json_encode(['ok' => true, 'saved' => $record]);
