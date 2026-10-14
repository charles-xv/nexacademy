<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once 'admin-guard.php';

$data = json_decode(file_get_contents('php://input'), true);
$admin = requireAdmin($pdo, $data['admin_id'] ?? null);

$messageId = $data['message_id'] ?? null;
$status = $data['status'] ?? null;

if (!$messageId || !in_array($status, ['new', 'read', 'closed'], true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Message and a valid status are required.']);
    exit;
}

$pdo->prepare('UPDATE contact_messages SET status = ? WHERE id = ?')
    ->execute([$status, $messageId]);

echo json_encode(['id' => (int) $messageId, 'status' => $status]);
