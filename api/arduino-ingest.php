<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require __DIR__ . '/../backend/db.php';

/* ---------------------------
   ONLY ALLOW POST
----------------------------*/
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

/* ---------------------------
   READ INPUT JSON
----------------------------*/
$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

/* ---------------------------
   SANITIZE INPUT
----------------------------*/
$device = trim((string)($payload['device'] ?? 'xiao-nrf52840'));
$snoreLevel = (int)($payload['snoreLevel'] ?? 0);
$movement = (int)($payload['movement'] ?? 0);
$battery = (int)($payload['battery'] ?? 0);
$heartRate = isset($payload['heartRate']) ? (int)$payload['heartRate'] : null;
$timestamp = $payload['timestamp'] ?? null;
$userId = (isset($payload['userId']) && is_numeric($payload['userId']))
    ? (int)$payload['userId']
    : null;

/* ---------------------------
   CLAMP VALUES (0–100)
----------------------------*/
$snoreLevel = max(0, min(100, $snoreLevel));
$movement   = max(0, min(100, $movement));
$battery    = max(0, min(100, $battery));

/* ---------------------------
   TIMESTAMP HANDLING
----------------------------*/
$recordedAt = gmdate('Y-m-d H:i:s');

if (is_string($timestamp) && $timestamp !== '') {
    $parsed = date_create($timestamp);
    if ($parsed) {
        $recordedAt = $parsed->format('Y-m-d H:i:s');
    }
}

/* ---------------------------
   INSERT INTO MYSQL
----------------------------*/
if ($userId === null && $heartRate === null) {
    $stmt = $mysqli->prepare(
        "INSERT INTO telemetry_samples 
        (device, snore_level, movement, battery, recorded_at)
        VALUES (?, ?, ?, ?, ?)"
    );

    if ($stmt) {
        $stmt->bind_param('siiis', $device, $snoreLevel, $movement, $battery, $recordedAt);
        $stmt->execute();
        $stmt->close();
    }

} elseif ($heartRate === null) {
    $stmt = $mysqli->prepare(
        "INSERT INTO telemetry_samples 
        (device, snore_level, movement, battery, recorded_at)
        VALUES (?, ?, ?, ?, ?)"
    );

    if ($stmt) {
        $stmt->bind_param('siiis', $device, $snoreLevel, $movement, $battery, $recordedAt);
        $stmt->execute();
        $stmt->close();
    }

} else {
    $stmt = $mysqli->prepare(
        "INSERT INTO telemetry_samples 
        (device, snore_level, movement, battery, heart_rate, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?)"
    );

    if ($stmt) {
        $stmt->bind_param('siiiis', $device, $snoreLevel, $movement, $battery, $heartRate, $recordedAt);
        $stmt->execute();
        $stmt->close();
    }
}

/* ---------------------------
   BUILD RESPONSE OBJECT
----------------------------*/
$response = [
    'ok' => true,
    'device' => $device,
    'snoreLevel' => $snoreLevel,
    'movement' => $movement,
    'battery' => $battery,
    'heartRate' => $heartRate,
    'timestamp' => $recordedAt,
    'receivedAt' => gmdate('c')
];

/* ---------------------------
   SAVE CLEAN LATEST JSON FILE
   (THIS FIXES YOUR DASHBOARD)
----------------------------*/
$dataFile = __DIR__ . '/../data/arduino-latest.json';
$cleanSnapshot = [
    'movement' => $movement,
    'snoreLevel' => $snoreLevel,
    'battery' => $battery
];

if (!is_dir(dirname($dataFile))) {
    mkdir(dirname($dataFile), 0777, true);
}

file_put_contents(
    $dataFile,
    json_encode($cleanSnapshot, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
    LOCK_EX
);

/* ---------------------------
   RETURN RESPONSE
----------------------------*/
echo json_encode([
    'ok' => true,
    'saved' => $response
]);