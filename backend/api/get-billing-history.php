<?php
require_once '../config/cors.php';
require_once '../config/database.php';

$userId = $_GET['user_id'] ?? null;

if (!$userId) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID required.']);
    exit;
}

// Every subscription row this user has ever had, newest first.
// Free rows have amount 0.00 and still appear — the history is the
// full plan timeline, not only the payments.
$stmt = $pdo->prepare('SELECT id, plan, status, amount, started_at, expires_at FROM subscriptions WHERE user_id = ? ORDER BY started_at DESC');
$stmt->execute([$userId]);
$history = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($history);
