<?php declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require __DIR__ . '/../backend/db.php';

// Ensure DB connection exists
if (!isset($mysqli) || $mysqli->connect_error) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Database connection failed']);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// Read input JSON
$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

// Sanitize input
$device = trim((string)($payload['device'] ?? 'xiao-nrf52840'));
$snoreLevel = (int)($payload['snoreLevel'] ?? 0);
$movement = (int)($payload['movement'] ?? 0);
$battery = (int)($payload['battery'] ?? 0);

$heartRate = $payload['heartRate'] ?? null;
$heartRate = is_numeric($heartRate) ? (int)$heartRate : null;

$timestamp = $payload['timestamp'] ?? null;
$userId = (isset($payload['userId']) && is_numeric($payload['userId'])) ? (int)$payload['userId'] : null;

$recordedAt = $timestamp ? date('Y-m-d H:i:s', strtotime($timestamp)) : gmdate('Y-m-d H:i:s');

// ===================== DATABASE INSERT =====================
if ($heartRate === null) {
    $stmt = $mysqli->prepare(
        "INSERT INTO telemetry_samples (device, snore_level, movement, battery, recorded_at)
         VALUES (?, ?, ?, ?, ?)"
    );

    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Prepare failed: ' . $mysqli->error]);
        exit;
    }

    $stmt->bind_param('siiis', $device, $snoreLevel, $movement, $battery, $recordedAt);
} else {
    $stmt = $mysqli->prepare(
        "INSERT INTO telemetry_samples (device, snore_level, movement, battery, heart_rate, recorded_at)
         VALUES (?, ?, ?, ?, ?, ?)"
    );

    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Prepare failed: ' . $mysqli->error]);
        exit;
    }

    $stmt->bind_param('siiiis', $device, $snoreLevel, $movement, $battery, $heartRate, $recordedAt);
}

$stmt->execute();
$stmt->close();

// ===================== SAVE LATEST JSON =====================
$dataFile = __DIR__ . '/../data/arduino-latest.json';

$cleanSnapshot = [
    'movement' => $movement,
    'snoreLevel' => $snoreLevel,
    'battery' => $battery,
    'heartRate' => $heartRate,
    'timestamp' => $recordedAt
];

if (!is_dir(dirname($dataFile))) {
    mkdir(dirname($dataFile), 0777, true);
}

file_put_contents(
    $dataFile,
    json_encode($cleanSnapshot, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
    LOCK_EX
);

// ===================== RESPONSE =====================
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

echo json_encode($response);