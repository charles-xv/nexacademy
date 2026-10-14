<?php
// Shared admin check, included by every admin endpoint.

function requireAdmin(PDO $pdo, $adminId): array {
    if (!$adminId) {
        http_response_code(400);
        echo json_encode(['error' => 'Admin ID required.']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT id, name, role, status FROM users WHERE id = ?');
    $stmt->execute([$adminId]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin || $admin['role'] !== 'admin' || $admin['status'] !== 'active') {
        $logStmt = $pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)');
        $logStmt->execute(['admin_access_denied', $adminId, 'Non-admin tried to reach an admin endpoint']);

        http_response_code(403);
        echo json_encode(['error' => 'Administrator access required.']);
        exit;
    }

    return $admin;
}
