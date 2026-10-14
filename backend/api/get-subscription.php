<?php
require_once '../config/cors.php';
require_once '../config/database.php';

$userId = $_GET['user_id'] ?? null;

if (!$userId) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID required.']);
    exit;
}

$stmt = $pdo->prepare('SELECT plan, status, amount, started_at, expires_at FROM subscriptions WHERE user_id = ? ORDER BY started_at DESC LIMIT 1');
$stmt->execute([$userId]);
$sub = $stmt->fetch(PDO::FETCH_ASSOC);

// A user with no row at all is treated as free rather than an error —
// keeps the frontend simple and fails closed, not open.
if (!$sub) {
    echo json_encode([
        'plan' => 'free',
        'status' => 'active',
        'amount' => '0.00',
        'started_at' => null,
        'expires_at' => null,
    ]);
    exit;
}

// An expired Pro plan is reported as free — the frontend should never
// have to work out whether a date has passed in order to gate content.
if ($sub['plan'] === 'pro' && $sub['expires_at'] && strtotime($sub['expires_at']) < time()) {
    $expireStmt = $pdo->prepare('UPDATE subscriptions SET status = "expired" WHERE user_id = ? AND status = "active"');
    $expireStmt->execute([$userId]);
    $sub['plan'] = 'free';
    $sub['status'] = 'expired';
}

echo json_encode($sub);
