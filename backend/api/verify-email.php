<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Called when the user clicks the link in their email. The token proves
// they own the address. On success the account becomes verified and the
// token is cleared so the link can't be reused.

$data = json_decode(file_get_contents('php://input'), true);
$token = $data['token'] ?? ($_GET['token'] ?? null);

if (!$token) {
    http_response_code(400);
    echo json_encode(['error' => 'No verification token provided.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, name, email, role, is_verified, token_expires FROM users WHERE verification_token = ?');
$stmt->execute([$token]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(400);
    echo json_encode(['error' => 'This verification link is invalid or has already been used.']);
    exit;
}

if ($user['is_verified']) {
    echo json_encode(['verified' => true, 'already' => true, 'message' => 'Your email is already verified. You can log in.']);
    exit;
}

if (strtotime($user['token_expires']) < time()) {
    http_response_code(400);
    echo json_encode(['error' => 'This verification link has expired. Please request a new one.', 'expired' => true, 'email' => $user['email']]);
    exit;
}

// Mark verified and clear the token so the link is single-use.
$pdo->prepare('UPDATE users SET is_verified = 1, verification_token = NULL, token_expires = NULL WHERE id = ?')
    ->execute([$user['id']]);

$pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)')
    ->execute(['email_verified', $user['id'], 'Email address confirmed']);

echo json_encode([
    'verified' => true,
    'message' => 'Your email is verified! You can now log in.',
]);
