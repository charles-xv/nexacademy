<?php
// Accept any localhost origin for development, and the live domain for production.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [
     'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://nexacademy.com.ng'
];
if (in_array($origin, $allowed)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}