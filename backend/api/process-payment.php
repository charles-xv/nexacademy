<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// The price lives HERE, on the server, and nowhere else. The checkout
// form never sends an amount, so a tampered request cannot change what
// is charged. This is the Payment Parameter Tampering defence.
const PRO_PRICE = 50.00;
const PRO_DURATION_DAYS = 30;

$data = json_decode(file_get_contents('php://input'), true);

$userId     = $data['user_id'] ?? null;
$cardName   = trim($data['card_name'] ?? '');
$cardNumber = preg_replace('/\D/', '', $data['card_number'] ?? '');
$expiry     = trim($data['expiry'] ?? '');
$cvv        = trim($data['cvv'] ?? '');

if (!$userId || !$cardName || !$cardNumber || !$expiry || !$cvv) {
    http_response_code(400);
    echo json_encode(['error' => 'All payment fields are required.']);
    exit;
}

// --- Card format checks. Nothing here is ever stored. ---

if (strlen($cardNumber) < 12 || strlen($cardNumber) > 19) {
    http_response_code(422);
    echo json_encode(['error' => 'Card number must be between 12 and 19 digits.']);
    exit;
}

// Luhn checksum: the standard test every real card number satisfies.
$sum = 0;
$alt = false;
for ($i = strlen($cardNumber) - 1; $i >= 0; $i--) {
    $digit = (int) $cardNumber[$i];
    if ($alt) {
        $digit *= 2;
        if ($digit > 9) { $digit -= 9; }
    }
    $sum += $digit;
    $alt = !$alt;
}
if ($sum % 10 !== 0) {
    http_response_code(422);
    echo json_encode(['error' => 'That card number is not valid.']);
    exit;
}

if (!preg_match('/^(0[1-9]|1[0-2])\/([0-9]{2})$/', $expiry, $m)) {
    http_response_code(422);
    echo json_encode(['error' => 'Expiry must be in MM/YY format.']);
    exit;
}
$expMonth = (int) $m[1];
$expYear  = 2000 + (int) $m[2];
$lastDay  = (int) date('t', mktime(0, 0, 0, $expMonth, 1, $expYear));
if (mktime(23, 59, 59, $expMonth, $lastDay, $expYear) < time()) {
    http_response_code(422);
    echo json_encode(['error' => 'That card has expired.']);
    exit;
}

if (!preg_match('/^[0-9]{3,4}$/', $cvv)) {
    http_response_code(422);
    echo json_encode(['error' => 'CVV must be 3 or 4 digits.']);
    exit;
}

// Card details have now served their purpose and are discarded. Only the
// last four digits are kept, and only to display on the receipt.
$lastFour = substr($cardNumber, -4);
unset($cardNumber, $cvv);

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
if ($user['role'] !== 'student') {
    http_response_code(403);
    echo json_encode(['error' => 'Only student accounts can subscribe.']);
    exit;
}

$logStmt = $pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)');
$reference = 'NXA-PAY-' . strtoupper(bin2hex(random_bytes(4)));

// Transaction with the existing rows locked, so two simultaneous
// checkouts cannot both pass the "already Pro?" check.
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

    $closeStmt = $pdo->prepare('UPDATE subscriptions SET status = "cancelled" WHERE user_id = ? AND status = "active"');
    $closeStmt->execute([$userId]);

    $expiresAt = date('Y-m-d H:i:s', time() + PRO_DURATION_DAYS * 86400);

    $insertStmt = $pdo->prepare('INSERT INTO subscriptions (user_id, plan, status, amount, reference, expires_at) VALUES (?, "pro", "active", ?, ?, ?)');
    $insertStmt->execute([$userId, PRO_PRICE, $reference, $expiresAt]);

    $logStmt->execute(['payment_completed', $userId,
        'Pro subscription, ' . number_format(PRO_PRICE, 2) . ', ref ' . $reference]);

    $pdo->commit();
} catch (PDOException $e) {
    if ($pdo->inTransaction()) { $pdo->rollBack(); }
    error_log('Payment processing failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Something went wrong. Nothing was charged.']);
    exit;
}

echo json_encode([
    'plan'       => 'pro',
    'status'     => 'active',
    'amount'     => number_format(PRO_PRICE, 2, '.', ''),
    'reference'  => $reference,
    'last_four'  => $lastFour,
    'card_name'  => $cardName,
    'expires_at' => $expiresAt,
]);