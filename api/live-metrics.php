<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/../backend/db.php';

$dataFile = __DIR__ . '/../data/arduino-latest.json';
$userId = !empty($_SESSION['user_id']) && is_numeric($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
$connectionFreshMs = 10000;

$toTimestampMs = static function (?string $stamp): ?int {
    if (!$stamp) {
        return null;
    }

    $parsed = strtotime($stamp);
    if ($parsed === false) {
        return null;
    }

    return ((int) $parsed) * 1000;
};

$withConnectionState = static function (array $payload) use ($toTimestampMs, $connectionFreshMs): array {
    $stamp = isset($payload['timestamp']) && is_string($payload['timestamp']) ? $payload['timestamp'] : null;
    if (!$stamp && isset($payload['receivedAt']) && is_string($payload['receivedAt'])) {
        $stamp = $payload['receivedAt'];
    }

    $ageMs = null;
    $stampMs = $toTimestampMs($stamp);
    if ($stampMs !== null) {
        $ageMs = max(0, ((int) round(microtime(true) * 1000)) - $stampMs);
    }

    $payload['connectionAgeMs'] = $ageMs;
    $payload['connectionFreshMs'] = $connectionFreshMs;
    $payload['connected'] = $ageMs !== null && $ageMs <= $connectionFreshMs;

    return $payload;
};

$loadFilePayload = function () use ($dataFile): ?array {
    if (!file_exists($dataFile)) {
        return null;
    }

    $content = file_get_contents($dataFile);
    $payload = json_decode((string) $content, true);
    return is_array($payload) ? $payload : null;
};

$payload = null;

$normalizeSnapshot = function (array $snapshot) use ($dataFile, $withConnectionState): array {
    $fileStamp = @filemtime($dataFile);
    $fallbackStamp = $fileStamp ? gmdate('c', (int) $fileStamp) : gmdate('c');

    return $withConnectionState([
        'ok' => true,
        'device' => (string) ($snapshot['device'] ?? 'seeed-xiao-nrf52840'),
        'snoreLevel' => (int) round((float) ($snapshot['snoreLevel'] ?? 0)),
        'movement' => (int) round((float) ($snapshot['movement'] ?? 0)),
        'battery' => (int) round((float) ($snapshot['battery'] ?? 0)),
        'heartRate' => isset($snapshot['heartRate']) ? (int) round((float) $snapshot['heartRate']) : null,
        'timestamp' => (string) ($snapshot['timestamp'] ?? $fallbackStamp),
        'receivedAt' => (string) ($snapshot['receivedAt'] ?? $fallbackStamp)
    ]);
};

function fetchLatestTelemetrySample(mysqli $mysqli, ?int $filterUserId, callable $withConnectionState): ?array
{
    if ($filterUserId === null) {
        $query = $mysqli->prepare(
            'SELECT device, snore_level, movement, battery, heart_rate, recorded_at, received_at
             FROM telemetry_samples
             WHERE user_id IS NULL
             ORDER BY received_at DESC
             LIMIT 1'
        );
        if (!$query) {
            return null;
        }
    } else {
        $query = $mysqli->prepare(
            'SELECT device, snore_level, movement, battery, heart_rate, recorded_at, received_at
             FROM telemetry_samples
             WHERE user_id = ?
             ORDER BY received_at DESC
             LIMIT 1'
        );
        if (!$query) {
            return null;
        }
        $query->bind_param('i', $filterUserId);
    }

    if (!$query->execute()) {
        $query->close();
        return null;
    }

    $result = $query->get_result();
    $row = $result ? $result->fetch_assoc() : null;
    $query->close();

    if (!is_array($row)) {
        return null;
    }

    $timestamp = !empty($row['recorded_at']) ? (string) $row['recorded_at'] : (string) $row['received_at'];

    return $withConnectionState([
        'ok' => true,
        'device' => (string) ($row['device'] ?? 'xiao-nrf52840'),
        'snoreLevel' => (int) ($row['snore_level'] ?? 0),
        'movement' => (int) ($row['movement'] ?? 0),
        'battery' => (int) ($row['battery'] ?? 0),
        'heartRate' => isset($row['heart_rate']) ? (int) $row['heart_rate'] : null,
        'timestamp' => $timestamp,
        'receivedAt' => (string) ($row['received_at'] ?? gmdate('c'))
    ]);
}

if (!$payload) {
    $filePayload = $loadFilePayload();
    if (!$filePayload) {
        if ($userId !== null) {
            $payload = fetchLatestTelemetrySample($mysqli, $userId, $withConnectionState);
        }

        if (!$payload) {
            $payload = fetchLatestTelemetrySample($mysqli, null, $withConnectionState);
        }

        if (!$payload) {
            echo json_encode([
                'ok' => false,
                'error' => 'No device data yet'
            ]);
            exit;
        }

        echo json_encode($payload);
        exit;
    }

    echo json_encode($normalizeSnapshot($filePayload));
    exit;
}

echo json_encode($payload);
