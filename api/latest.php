<?php

header('Content-Type: application/json');

$file = __DIR__ . '/../data/arduino-latest.json';

if (!file_exists($file)) {
    echo json_encode([
        "movement" => 0,
        "snoreLevel" => 0,
        "battery" => 0
    ]);
    exit;
}

echo file_get_contents($file);