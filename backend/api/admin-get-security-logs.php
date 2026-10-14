<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once 'admin-guard.php';

requireAdmin($pdo, $_GET['admin_id'] ?? null);

// Newest first, capped so a long-running system does not return
// thousands of rows to the browser at once.
$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 100;
if ($limit < 1 || $limit > 500) {
    $limit = 100;
}

$stmt = $pdo->prepare('
  SELECT sl.id, sl.event_type, sl.user_id, sl.details, sl.created_at,
         u.name AS user_name, u.email AS user_email, u.role AS user_role
  FROM security_logs sl
  LEFT JOIN users u ON u.id = sl.user_id
  ORDER BY sl.created_at DESC, sl.id DESC
  LIMIT ?
');
$stmt->bindValue(1, $limit, PDO::PARAM_INT);
$stmt->execute();

$logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

// A per-type tally so the Security tab can show what is happening at a
// glance rather than only a raw feed.
$summary = $pdo->query('
  SELECT event_type, COUNT(*) AS total
  FROM security_logs
  GROUP BY event_type
  ORDER BY total DESC
')->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['logs' => $logs, 'summary' => $summary]);
