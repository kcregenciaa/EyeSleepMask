<?php
declare(strict_types=1);

$dbHost = '127.0.0.1';
$dbUser = 'root';
$dbPass = '';
$dbName = 'eyesleepmask';
$dbPort = 3307;

$mysqli = new mysqli($dbHost, $dbUser, $dbPass, $dbName, $dbPort);

if ($mysqli->connect_errno) {
    http_response_code(500);
    echo 'Database connection failed.';
    exit;
}

$mysqli->set_charset('utf8mb4');