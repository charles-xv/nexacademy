<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/mail.php';

// Re-sends the verification email if the first didn't arrive or expired.
// Enumeration-safe: it gives the same reply whether or not the email
// exists, so it can't be used to discover which emails are registered.

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');

$genericReply = ['message' => 'If that email needs verifying, a new link has been sent.'];

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode($genericReply);
    exit;
}

$stmt = $pdo->prepare('SELECT id, name, is_verified FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Only send if the account exists AND is still unverified.
if ($user && !$user['is_verified']) {
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));
    $pdo->prepare('UPDATE users SET verification_token = ?, token_expires = ? WHERE id = ?')
        ->execute([$token, $expires, $user['id']]);
    sendVerificationEmail($email, $user['name'], $token);
}

echo json_encode($genericReply);
