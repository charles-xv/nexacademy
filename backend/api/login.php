<?php
require_once '../config/cors.php';
require_once '../config/database.php';

const ATTEMPT_WINDOW_HOURS = 24;
const MAX_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 15;

$data = json_decode(file_get_contents('php://input'), true);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, name, email, password_hash, role, status, is_verified, failed_attempts, last_failed_at, locked_until FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Incorrect email or password.']);
    exit;
}

// Locked accounts get rejected before the password is even checked.
if ($user['locked_until'] && strtotime($user['locked_until']) > time()) {
    $minutesLeft = ceil((strtotime($user['locked_until']) - time()) / 60);
    http_response_code(403);
    echo json_encode(['error' => "Too many failed attempts. Try again in {$minutesLeft} minute(s)."]);
    exit;
}

// A failure from days ago should not count towards today's total.
// If the last failure is outside the window, the counter starts fresh.
$priorAttempts = (int) $user['failed_attempts'];
if ($user['last_failed_at']
    && strtotime($user['last_failed_at']) < time() - (ATTEMPT_WINDOW_HOURS * 3600)) {
    $priorAttempts = 0;
}
$logStmt = $pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)');

if (!password_verify($password, $user['password_hash'])) {
    $attempts = $priorAttempts + 1;
    $logStmt->execute(['failed_login', $user['id'], "Attempt {$attempts} of " . MAX_ATTEMPTS]);

    if ($attempts >= MAX_ATTEMPTS) {
        $lockUntil = date('Y-m-d H:i:s', time() + LOCKOUT_MINUTES * 60);
        $updateStmt = $pdo->prepare('UPDATE users SET failed_attempts = 0, locked_until = ? WHERE id = ?');
        $updateStmt->execute([$lockUntil, $user['id']]);
        $logStmt->execute(['account_locked', $user['id'], 'Locked for ' . LOCKOUT_MINUTES . ' minutes after ' . MAX_ATTEMPTS . ' failed attempts']);

        http_response_code(403);
        echo json_encode(['error' => 'Too many failed attempts. Account locked for ' . LOCKOUT_MINUTES . ' minutes.']);
        exit;
    }

    $updateStmt = $pdo->prepare('UPDATE users SET failed_attempts = ?, last_failed_at = NOW() WHERE id = ?');
    $updateStmt->execute([$attempts, $user['id']]);

    $remaining = MAX_ATTEMPTS - $attempts;
    http_response_code(401);
    echo json_encode(['error' => "Incorrect email or password. {$remaining} attempt(s) remaining before lockout."]);
    exit;
}
if ($user['status'] === 'suspended') {
    http_response_code(403);
    echo json_encode(['error' => 'This account has been suspended.']);
    exit;
}

// Block unverified accounts. Password was correct, but they haven't
// confirmed their email yet.
if ((int) $user['is_verified'] === 0) {
    http_response_code(403);
    echo json_encode([
        'error' => 'Please verify your email before logging in. Check your inbox for the link.',
        'unverified' => true,
        'email' => $user['email'],
    ]);
    exit;
}

$resetStmt = $pdo->prepare('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?');
$resetStmt->execute([$user['id']]);
$logStmt->execute(['login_success', $user['id'], null]);

echo json_encode([
    'id' => $user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
    'role' => $user['role'],
]);