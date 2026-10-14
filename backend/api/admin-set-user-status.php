<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once 'admin-guard.php';

$data = json_decode(file_get_contents('php://input'), true);
$admin = requireAdmin($pdo, $data['admin_id'] ?? null);

$targetId = $data['user_id'] ?? null;
$status = $data['status'] ?? null;

if (!$targetId || !in_array($status, ['active', 'suspended'], true)) {
    http_response_code(400);
    echo json_encode(['error' => 'User and a valid status are required.']);
    exit;
}

// An admin locking themselves out of their own platform helps nobody.
if ((int) $targetId === (int) $admin['id']) {
    http_response_code(400);
    echo json_encode(['error' => 'You cannot suspend your own account.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, name, role FROM users WHERE id = ?');
$stmt->execute([$targetId]);
$target = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$target) {
    http_response_code(404);
    echo json_encode(['error' => 'Account not found.']);
    exit;
}

if ($target['role'] === 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Administrator accounts cannot be suspended from here.']);
    exit;
}

// Reinstating also clears any active lockout — otherwise a reinstated
// user would still be blocked by a lock they no longer deserve.
if ($status === 'active') {
    $pdo->prepare('UPDATE users SET status = "active", failed_attempts = 0, locked_until = NULL WHERE id = ?')
        ->execute([$targetId]);
} else {
    $pdo->prepare('UPDATE users SET status = "suspended" WHERE id = ?')->execute([$targetId]);
}

$logStmt = $pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)');
$logStmt->execute([
    $status === 'suspended' ? 'account_suspended' : 'account_reinstated',
    $targetId,
    ucfirst($status) . ' by admin ' . $admin['id'] . ' (' . $admin['name'] . ')',
]);

echo json_encode(['id' => (int) $targetId, 'status' => $status]);
