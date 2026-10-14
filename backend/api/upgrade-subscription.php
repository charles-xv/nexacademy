<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// The Pro price lives HERE, on the server, and nowhere else.
// It is never read from the request body. This single decision is
// what defeats Payment Parameter Tampering (P1) — a client can send
// amount=1 all day and it will simply be ignored.
const PRO_PRICE = 50.00;
const PRO_DURATION_DAYS = 30;

$data = json_decode(file_get_contents('php://input'), true);

$userId = $data['user_id'] ?? null;

if (!$userId) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID required.']);
    exit;
}

$userStmt = $pdo->prepare('SELECT id, role, status FROM users WHERE id = ?');
$userStmt->execute([$userId]);
$user = $userStmt->fetch(PDO::FETCH_ASSOC);

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

// The whole upgrade runs inside a transaction with the user's existing
// rows locked. Two upgrade requests arriving at the same moment cannot
// both pass the "already Pro?" check — the second one waits, then sees
// the first one's result. This is what defeats the Race Condition
// on Subscription (P4).
try {
    $pdo->beginTransaction();

    $checkStmt = $pdo->prepare('SELECT id, plan, expires_at FROM subscriptions WHERE user_id = ? AND status = "active" ORDER BY started_at DESC LIMIT 1 FOR UPDATE');
    $checkStmt->execute([$userId]);
    $current = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($current && $current['plan'] === 'pro'
        && $current['expires_at'] && strtotime($current['expires_at']) > time()) {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode(['error' => 'You already have an active Pro plan.']);
        exit;
    }

    // Close out whatever plan they were on.
    $closeStmt = $pdo->prepare('UPDATE subscriptions SET status = "cancelled" WHERE user_id = ? AND status = "active"');
    $closeStmt->execute([$userId]);

    $expiresAt = date('Y-m-d H:i:s', time() + PRO_DURATION_DAYS * 86400);

    $insertStmt = $pdo->prepare('INSERT INTO subscriptions (user_id, plan, status, amount, expires_at) VALUES (?, "pro", "active", ?, ?)');
    $insertStmt->execute([$userId, PRO_PRICE, $expiresAt]);

    $logStmt->execute(['subscription_upgrade', $userId, 'Upgraded to Pro for ' . PRO_DURATION_DAYS . ' days at ' . PRO_PRICE]);

    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Upgrade failed. Please try again.']);
    exit;
}

echo json_encode([
    'plan' => 'pro',
    'status' => 'active',
    'amount' => number_format(PRO_PRICE, 2, '.', ''),
    'expires_at' => $expiresAt,
]);
