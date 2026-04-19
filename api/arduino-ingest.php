<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/../backend/db.php';

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
$heartRate = isset($payload['heartRate']) ? (int) $payload['heartRate'] : null;
$timestamp = isset($payload['timestamp']) ? (string) $payload['timestamp'] : null;
$userId = isset($payload['userId']) && is_numeric($payload['userId']) ? (int) $payload['userId'] : null;

$snoreLevel = max(0, min(100, $snoreLevel));
$movement = max(0, min(100, $movement));
$battery = max(0, min(100, $battery));

$recordedAt = null;
if (is_string($timestamp) && $timestamp !== '') {
    $parsed = date_create($timestamp);
    if ($parsed instanceof DateTimeInterface) {
        $recordedAt = $parsed->format('Y-m-d H:i:s');
    }
}

if ($recordedAt === null) {
    $recordedAt = gmdate('Y-m-d H:i:s');
}

if ($userId === null && $heartRate === null) {
    $insert = $mysqli->prepare('INSERT INTO telemetry_samples (device, snore_level, movement, battery, recorded_at) VALUES (?, ?, ?, ?, ?)');
    if ($insert) {
        $insert->bind_param('siiis', $device, $snoreLevel, $movement, $battery, $recordedAt);
    }
} elseif ($userId === null) {
    $insert = $mysqli->prepare('INSERT INTO telemetry_samples (device, snore_level, movement, battery, heart_rate, recorded_at) VALUES (?, ?, ?, ?, ?, ?)');
    if ($insert) {
        $insert->bind_param('siiiis', $device, $snoreLevel, $movement, $battery, $heartRate, $recordedAt);
    }
} elseif ($heartRate === null) {
    $insert = $mysqli->prepare('INSERT INTO telemetry_samples (user_id, device, snore_level, movement, battery, recorded_at) VALUES (?, ?, ?, ?, ?, ?)');
    if ($insert) {
        $insert->bind_param('isiiis', $userId, $device, $snoreLevel, $movement, $battery, $recordedAt);
    }
} else {
    $insert = $mysqli->prepare('INSERT INTO telemetry_samples (user_id, device, snore_level, movement, battery, heart_rate, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
    if ($insert) {
        $insert->bind_param('isiiiis', $userId, $device, $snoreLevel, $movement, $battery, $heartRate, $recordedAt);
    }
}

if (isset($insert) && $insert) {
    if (!$insert->execute()) {
        $insert->close();
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Write failed']);
        exit;
    }
    $insert->close();
}

$record = [
    'ok' => true,
    'device' => $device,
    'snoreLevel' => $snoreLevel,
    'movement' => $movement,
    'battery' => $battery,
    'heartRate' => $heartRate,
    'timestamp' => $recordedAt,
    'receivedAt' => gmdate('c')
];

$dataFile = __DIR__ . '/../data/arduino-latest.json';
$encoded = json_encode($record, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
if ($encoded !== false) {
    @file_put_contents($dataFile, $encoded . PHP_EOL, LOCK_EX);
}

echo json_encode(['ok' => true, 'saved' => $record]);
