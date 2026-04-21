<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/../backend/db.php';

$dataFile = __DIR__ . '/../data/arduino-latest.json';
$userId = !empty($_SESSION['user_id']) && is_numeric($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;

$loadFilePayload = function () use ($dataFile): ?array {
    if (!file_exists($dataFile)) {
        return null;
    }

    $content = file_get_contents($dataFile);
    $payload = json_decode((string) $content, true);
    return is_array($payload) ? $payload : null;
};

$payload = null;

$normalizeSnapshot = function (array $snapshot): array {
    return [
        'ok' => true,
        'device' => (string) ($snapshot['device'] ?? 'seeed-xiao-nrf52840'),
        'snoreLevel' => (int) round((float) ($snapshot['snoreLevel'] ?? 0)),
        'movement' => (int) round((float) ($snapshot['movement'] ?? 0)),
        'battery' => (int) round((float) ($snapshot['battery'] ?? 0)),
        'heartRate' => isset($snapshot['heartRate']) ? (int) round((float) $snapshot['heartRate']) : null,
        'timestamp' => (string) ($snapshot['timestamp'] ?? gmdate('c')),
        'receivedAt' => (string) ($snapshot['receivedAt'] ?? gmdate('c'))
    ];
};

function fetchLatestTelemetrySample(mysqli $mysqli, ?int $filterUserId): ?array
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

    return [
        'ok' => true,
        'device' => (string) ($row['device'] ?? 'xiao-nrf52840'),
        'snoreLevel' => (int) ($row['snore_level'] ?? 0),
        'movement' => (int) ($row['movement'] ?? 0),
        'battery' => (int) ($row['battery'] ?? 0),
        'heartRate' => isset($row['heart_rate']) ? (int) $row['heart_rate'] : null,
        'timestamp' => $timestamp,
        'receivedAt' => (string) ($row['received_at'] ?? gmdate('c'))
    ];
}

if (!$payload) {
    $filePayload = $loadFilePayload();
    if (!$filePayload) {
        if ($userId !== null) {
            $payload = fetchLatestTelemetrySample($mysqli, $userId);
        }

        if (!$payload) {
            $payload = fetchLatestTelemetrySample($mysqli, null);
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
