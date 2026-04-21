<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$dataFile = __DIR__ . '/../data/led-command.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!file_exists($dataFile)) {
        echo json_encode([
            'ok' => true,
            'brightness' => 50,
            'mode' => 'static',
            'blinkSpeed' => 500,
            'wakeAlertActive' => false,
        ]);
        exit;
    }

    $decoded = json_decode((string) file_get_contents($dataFile), true);
    if (!is_array($decoded)) {
        echo json_encode([
            'ok' => true,
            'brightness' => 50,
            'mode' => 'static',
            'blinkSpeed' => 500,
            'wakeAlertActive' => false,
        ]);
        exit;
    }

    $brightness = isset($decoded['brightness']) ? (int) $decoded['brightness'] : 50;
    $brightness = max(0, min(100, $brightness));
    $mode = isset($decoded['mode']) ? strtolower((string) $decoded['mode']) : 'static';
    if (!in_array($mode, ['static', 'auto'], true)) {
        $mode = 'static';
    }

    $blinkSpeed = isset($decoded['blinkSpeed']) ? (int) $decoded['blinkSpeed'] : 500;
    $blinkSpeed = max(100, min(1500, $blinkSpeed));

    $wakeAlertActive = !empty($decoded['wakeAlertActive']);

    echo json_encode([
        'ok' => true,
        'brightness' => $brightness,
        'mode' => $mode,
        'blinkSpeed' => $blinkSpeed,
        'wakeAlertActive' => $wakeAlertActive,
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);

if (!is_array($payload) || (!array_key_exists('brightness', $payload) && !array_key_exists('mode', $payload) && !array_key_exists('blinkSpeed', $payload) && !array_key_exists('wakeAlertActive', $payload))) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'brightness, mode, blinkSpeed, or wakeAlertActive is required']);
    exit;
}

$existing = [];
if (file_exists($dataFile)) {
    $decoded = json_decode((string) file_get_contents($dataFile), true);
    if (is_array($decoded)) {
        $existing = $decoded;
    }
}

$brightness = isset($existing['brightness']) ? (int) $existing['brightness'] : 50;
if (array_key_exists('brightness', $payload)) {
    $brightness = (int) $payload['brightness'];
}
$brightness = max(0, min(100, $brightness));

$mode = isset($existing['mode']) ? strtolower((string) $existing['mode']) : 'static';
if (array_key_exists('mode', $payload)) {
    $mode = strtolower((string) $payload['mode']);
}

if (!in_array($mode, ['static', 'auto'], true)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'mode must be static or auto']);
    exit;
}

$blinkSpeed = isset($existing['blinkSpeed']) ? (int) $existing['blinkSpeed'] : 500;
if (array_key_exists('blinkSpeed', $payload)) {
    $blinkSpeed = (int) $payload['blinkSpeed'];
}
$blinkSpeed = max(100, min(1500, $blinkSpeed));

$wakeAlertActive = !empty($existing['wakeAlertActive']);
if (array_key_exists('wakeAlertActive', $payload)) {
    $wakeAlertActive = !empty($payload['wakeAlertActive']);
}

$record = [
    'brightness' => $brightness,
    'mode' => $mode,
    'blinkSpeed' => $blinkSpeed,
    'wakeAlertActive' => $wakeAlertActive,
    'updatedAt' => gmdate('c')
];

$encoded = json_encode($record, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
if ($encoded === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Encode failed']);
    exit;
}

$parentDir = dirname($dataFile);
if (!is_dir($parentDir)) {
    @mkdir($parentDir, 0777, true);
}

if (@file_put_contents($dataFile, $encoded . PHP_EOL, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Write failed']);
    exit;
}

echo json_encode([
    'ok' => true,
    'brightness' => $brightness,
    'mode' => $mode,
    'blinkSpeed' => $blinkSpeed,
    'wakeAlertActive' => $wakeAlertActive,
]);
