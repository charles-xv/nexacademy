<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/mail.php';

const RESET_TOKEN_MINUTES = 60;

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');

if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Email address is required.']);
    exit;
}

// The SAME response goes back whether or not the address is registered.
// Confirming which emails exist would hand an attacker a user list.
$generic = [
    'sent' => true,
    'message' => 'If that email is registered, a reset link is on its way. Check your inbox.',
];

$stmt = $pdo->prepare('SELECT id, name, email FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode($generic);
    exit;
}

$token = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', time() + RESET_TOKEN_MINUTES * 60);

$pdo->prepare('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?')
    ->execute([$token, $expires, $user['id']]);

$pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)')
    ->execute(['password_reset_requested', $user['id'], 'Reset link issued']);

sendPasswordResetEmail($user['email'], $user['name'], $token);

echo json_encode($generic);