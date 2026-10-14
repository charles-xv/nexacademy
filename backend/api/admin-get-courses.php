<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once 'admin-guard.php';

requireAdmin($pdo, $_GET['admin_id'] ?? null);

// Every course on the platform regardless of owner — the admin view.
$stmt = $pdo->query('
  SELECT
    c.id, c.title, c.access_tier, c.status, c.thumbnail_url, c.created_at,
    u.id AS instructor_id, u.name AS instructor_name, u.email AS instructor_email,
    (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS lesson_count,
    (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS student_count
  FROM courses c
  JOIN users u ON u.id = c.instructor_id
  ORDER BY c.created_at DESC
');

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));