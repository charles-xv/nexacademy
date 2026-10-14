<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Changes a password. The current one must be supplied and verified —
// never trust that whoever holds the session is the account owner.

$data = json_decode(file_get_contents('php://input'), true);

$userId = $data['user_id'] ?? null;
$currentPassword = $data['current_password'] ?? '';
$newPassword = $data['new_password'] ?? '';

if (!$userId || $currentPassword === '' || $newPassword === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Current and new password are both required.']);
    exit;
}

if (strlen($newPassword) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'Your new password must be at least 8 characters.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, password_hash, status FROM users WHERE id = ?');
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

$logStmt = $pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)');

if (!password_verify($currentPassword, $user['password_hash'])) {
    $logStmt->execute(['password_change_denied', $userId, 'Wrong current password supplied']);
    http_response_code(401);
    echo json_encode(['error' => 'That password is not correct.']);
    exit;
}

$newHash = password_hash($newPassword, PASSWORD_BCRYPT);
$updateStmt = $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
$updateStmt->execute([$newHash, $userId]);

$logStmt->execute(['password_changed', $userId, 'Password updated successfully']);

echo json_encode(['changed' => true]);
