<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once 'admin-guard.php';

requireAdmin($pdo, $_GET['admin_id'] ?? null);

$stmt = $pdo->query('
  SELECT id, name, email, subject, message, status, created_at
  FROM contact_messages
  ORDER BY created_at DESC
');
$messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Small tally for the tab badge.
$counts = $pdo->query('
  SELECT status, COUNT(*) AS total
  FROM contact_messages
  GROUP BY status
')->fetchAll(PDO::FETCH_KEY_PAIR);

echo json_encode([
    'messages' => $messages,
    'new_count' => (int) ($counts['new'] ?? 0),
    'total' => count($messages),
]);
