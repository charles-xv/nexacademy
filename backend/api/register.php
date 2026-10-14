<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/mail.php';

$data = json_decode(file_get_contents('php://input'), true);

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$role = $data['role'] ?? 'student';

if (!$name || !$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Name, email and password are all required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Please enter a valid email address.']);
    exit;
}

// Admin can never come from this form — only student or instructor.
if (!in_array($role, ['student', 'instructor'])) {
    $role = 'student';
}

$stmt = $pdo->prepare('SELECT id, is_verified FROM users WHERE email = ?');
$stmt->execute([$email]);
$existing = $stmt->fetch(PDO::FETCH_ASSOC);
if ($existing) {
    http_response_code(409);
    echo json_encode(['error' => 'An account with that email already exists.']);
    exit;
}

$passwordHash = password_hash($password, PASSWORD_BCRYPT);

// A random token goes in the email link; the account stays unverified
// (is_verified = 0) until the user clicks it. The link is valid 24 hours.
$token = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', strtotime('+24 hours'));

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('
      INSERT INTO users (name, email, password_hash, role, is_verified, verification_token, token_expires)
      VALUES (?, ?, ?, ?, 0, ?, ?)
    ');
    $stmt->execute([$name, $email, $passwordHash, $role, $token, $expires]);
    $userId = $pdo->lastInsertId();

    if ($role === 'student') {
        $subStmt = $pdo->prepare('INSERT INTO subscriptions (user_id, plan, status, amount) VALUES (?, "free", "active", 0.00)');
        $subStmt->execute([$userId]);
    }

    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Registration failed. Please try again.']);
    exit;
}

// Send the verification email. If it fails, the account still exists —
// the user can request a resend — so we don't roll back, but we tell them.
$sent = sendVerificationEmail($email, $name, $token);

$pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)')
    ->execute(['account_registered', $userId, "New $role account, awaiting email verification"]);

// NOTE: we do NOT log the user in here. They must verify first. The
// frontend shows a "check your email" screen based on this response.
echo json_encode([
    'registered' => true,
    'email' => $email,
    'email_sent' => $sent,
    'message' => $sent
        ? 'Account created. Check your email to verify your account.'
        : 'Account created, but we could not send the verification email. Try resending it.',
]);
