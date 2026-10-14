<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Updates a user's name and email.
//
// Changing an email address is a security-sensitive action: if an
// attacker gets a session, swapping the email is how they take
// permanent ownership of an account. So the current password is
// required before the email can change. Changing only the display
// name does not need it.

$data = json_decode(file_get_contents('php://input'), true);

$userId = $data['user_id'] ?? null;
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$currentPassword = $data['current_password'] ?? '';

if (!$userId || !$name) {
    http_response_code(400);
    echo json_encode(['error' => 'Name is required.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, name, email, password_hash, role, status FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'Account not found.']);
    exit;
}

if ($user['status'] === 'suspended') {
    http_response_code(403);
    echo json_encode(['error' => 'This account has been suspended.']);
    exit;
}

$emailChanged = $email !== '' && strtolower($email) !== strtolower($user['email']);

if ($emailChanged) {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'That does not look like a valid email address.']);
        exit;
    }

    if ($currentPassword === '') {
        http_response_code(400);
        echo json_encode([
            'error' => 'Enter your current password to change your email address.',
            'reason' => 'password_required',
        ]);
        exit;
    }

    if (!password_verify($currentPassword, $user['password_hash'])) {
        $logStmt = $pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)');
        $logStmt->execute(['email_change_denied', $userId, 'Wrong password supplied for email change']);

        http_response_code(401);
        echo json_encode(['error' => 'That password is not correct.']);
        exit;
    }

    $dupStmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id != ?');
    $dupStmt->execute([$email, $userId]);
    if ($dupStmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Another account already uses that email address.']);
        exit;
    }
}

$newEmail = $emailChanged ? $email : $user['email'];

$updateStmt = $pdo->prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
$updateStmt->execute([$name, $newEmail, $userId]);

$logStmt = $pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)');
if ($emailChanged) {
    $logStmt->execute(['email_changed', $userId, 'Email updated from ' . $user['email'] . ' to ' . $newEmail]);
} else {
    $logStmt->execute(['profile_updated', $userId, 'Display name updated']);
}

// The response mirrors the shape login.php returns, so the frontend can
// drop it straight into its user state.
echo json_encode([
    'id' => (int) $user['id'],
    'name' => $name,
    'email' => $newEmail,
    'role' => $user['role'],
]);
