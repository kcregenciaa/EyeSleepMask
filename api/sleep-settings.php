<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/../backend/db.php';

if (empty($_SESSION['user_id']) || !is_numeric($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Unauthorized']);
    exit;
}

$userId = (int) $_SESSION['user_id'];
$allowedDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

$defaults = [
    'bedtime' => '00:20',
    'alarmEnd' => '05:20',
    'alarmEnabled' => true,
    'smartAlarmEnabled' => true,
    'snoozeMinutes' => 15,
    'wakeupMinutes' => 30,
    'remindToSleep' => true,
    'alarmDays' => $allowedDays
];

$normalizeTime = function (?string $value, string $fallback): string {
    if (!is_string($value) || !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $value)) {
        return $fallback;
    }

    return $value;
};

$boolFromValue = function ($value, bool $fallback = false): bool {
    if (is_bool($value)) {
        return $value;
    }

    if (is_numeric($value)) {
        return (int) $value === 1;
    }

    if (is_string($value)) {
        return in_array(strtolower($value), ['1', 'true', 'yes', 'on'], true);
    }

    return $fallback;
};

$sanitizeDays = function ($value) use ($allowedDays): array {
    if (!is_array($value)) {
        return $allowedDays;
    }

    $filtered = array_values(array_unique(array_filter($value, function ($day) use ($allowedDays) {
        return is_string($day) && in_array($day, $allowedDays, true);
    })));

    return $filtered ?: $allowedDays;
};

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $mysqli->prepare('SELECT bedtime, alarm_end, alarm_enabled, smart_alarm_enabled, snooze_minutes, wakeup_minutes, remind_to_sleep, alarm_days_json FROM sleep_settings WHERE user_id = ? LIMIT 1');
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Failed to load settings']);
        exit;
    }

    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result ? $result->fetch_assoc() : null;
    $stmt->close();

    if (!is_array($row)) {
        echo json_encode(['ok' => true, 'data' => $defaults]);
        exit;
    }

    $alarmDays = $allowedDays;
    if (!empty($row['alarm_days_json'])) {
        $decodedDays = json_decode((string) $row['alarm_days_json'], true);
        if (is_array($decodedDays)) {
            $alarmDays = array_values(array_filter($decodedDays, function ($day) use ($allowedDays) {
                return is_string($day) && in_array($day, $allowedDays, true);
            })) ?: $allowedDays;
        }
    }

    echo json_encode([
        'ok' => true,
        'data' => [
            'bedtime' => substr((string) $row['bedtime'], 0, 5),
            'alarmEnd' => substr((string) $row['alarm_end'], 0, 5),
            'alarmEnabled' => (bool) ((int) $row['alarm_enabled']),
            'smartAlarmEnabled' => (bool) ((int) $row['smart_alarm_enabled']),
            'snoozeMinutes' => max(1, min(15, (int) $row['snooze_minutes'])),
            'wakeupMinutes' => max(5, min(60, (int) $row['wakeup_minutes'])),
            'remindToSleep' => (bool) ((int) $row['remind_to_sleep']),
            'alarmDays' => $alarmDays
        ]
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode((string) $raw, true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

$bedtime = $normalizeTime(isset($payload['bedtime']) ? (string) $payload['bedtime'] : null, $defaults['bedtime']);
$alarmEnd = $normalizeTime(isset($payload['alarmEnd']) ? (string) $payload['alarmEnd'] : null, $defaults['alarmEnd']);
$alarmEnabled = $boolFromValue($payload['alarmEnabled'] ?? true, true);
$smartAlarmEnabled = $boolFromValue($payload['smartAlarmEnabled'] ?? true, true);
$remindToSleep = $boolFromValue($payload['remindToSleep'] ?? true, true);
$snoozeMinutes = isset($payload['snoozeMinutes']) ? (int) $payload['snoozeMinutes'] : 15;
$wakeupMinutes = isset($payload['wakeupMinutes']) ? (int) $payload['wakeupMinutes'] : 30;
$alarmDays = $sanitizeDays($payload['alarmDays'] ?? []);

$snoozeMinutes = max(1, min(15, $snoozeMinutes));
$wakeupMinutes = max(5, min(60, $wakeupMinutes));

$alarmDaysJson = json_encode($alarmDays, JSON_UNESCAPED_SLASHES);
if ($alarmDaysJson === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to encode settings']);
    exit;
}

$upsert = $mysqli->prepare(
    'INSERT INTO sleep_settings (user_id, bedtime, alarm_end, alarm_enabled, smart_alarm_enabled, snooze_minutes, wakeup_minutes, remind_to_sleep, alarm_days_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
        bedtime = VALUES(bedtime),
        alarm_end = VALUES(alarm_end),
        alarm_enabled = VALUES(alarm_enabled),
        smart_alarm_enabled = VALUES(smart_alarm_enabled),
        snooze_minutes = VALUES(snooze_minutes),
        wakeup_minutes = VALUES(wakeup_minutes),
        remind_to_sleep = VALUES(remind_to_sleep),
        alarm_days_json = VALUES(alarm_days_json)'
);

if (!$upsert) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to save settings']);
    exit;
}

$alarmEnabledInt = $alarmEnabled ? 1 : 0;
$smartAlarmEnabledInt = $smartAlarmEnabled ? 1 : 0;
$remindToSleepInt = $remindToSleep ? 1 : 0;

$upsert->bind_param(
    'issiiiiis',
    $userId,
    $bedtime,
    $alarmEnd,
    $alarmEnabledInt,
    $smartAlarmEnabledInt,
    $snoozeMinutes,
    $wakeupMinutes,
    $remindToSleepInt,
    $alarmDaysJson
);

$saved = $upsert->execute();
$upsert->close();

if (!$saved) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to save settings']);
    exit;
}

echo json_encode([
    'ok' => true,
    'data' => [
        'bedtime' => $bedtime,
        'alarmEnd' => $alarmEnd,
        'alarmEnabled' => $alarmEnabled,
        'smartAlarmEnabled' => $smartAlarmEnabled,
        'snoozeMinutes' => $snoozeMinutes,
        'wakeupMinutes' => $wakeupMinutes,
        'remindToSleep' => $remindToSleep,
        'alarmDays' => $alarmDays
    ]
]);