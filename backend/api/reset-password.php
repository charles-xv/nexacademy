<?php
require_once '../config/cors.php';
require_once '../config/database.php';

const MIN_PASSWORD_LENGTH = 8;

$data = json_decode(file_get_contents('php://input'), true);
$token = $data['token'] ?? '';
$password = $data['password'] ?? '';

if (!$token || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Token and new password are required.']);
    exit;
}

if (strlen($password) < MIN_PASSWORD_LENGTH) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least ' . MIN_PASSWORD_LENGTH . ' characters.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, name, email, reset_expires FROM users WHERE reset_token = ?');
$stmt->execute([$token]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(400);
    echo json_encode(['error' => 'This reset link is invalid or has already been used.']);
    exit;
}

if (strtotime($user['reset_expires']) < time()) {
    http_response_code(400);
    echo json_encode([
        'error' => 'This reset link has expired. Please request a new one.',
        'expired' => true,
    ]);
    exit;
}

$hash = password_hash($password, PASSWORD_BCRYPT);

// Clearing the token makes the link single-use. Clearing the lockout lets
// a user who locked themselves out recover this way. Setting is_verified
// is safe: receiving the email proves they own the address.
$pdo->prepare(
    'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL,
     failed_attempts = 0, locked_until = NULL, is_verified = 1 WHERE id = ?'
)->execute([$hash, $user['id']]);

$pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)')
    ->execute(['password_reset', $user['id'], 'Password changed via reset link']);

echo json_encode([
    'reset' => true,
    'message' => 'Your password has been changed. You can now log in.',
]);