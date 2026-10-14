<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once 'admin-guard.php';

requireAdmin($pdo, $_GET['admin_id'] ?? null);

// One row per account, with the plan for students and the course count
// for instructors — the two things an admin actually needs at a glance.
$stmt = $pdo->query('
  SELECT
    u.id, u.name, u.email, u.role, u.status, u.created_at,
    u.failed_attempts, u.locked_until,
    s.plan, s.expires_at,
    (SELECT COUNT(*) FROM courses c WHERE c.instructor_id = u.id) AS course_count,
    (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = u.id) AS enrolment_count
  FROM users u
  LEFT JOIN subscriptions s
    ON s.user_id = u.id AND s.status = "active"
  ORDER BY FIELD(u.role, "admin", "instructor", "student"), u.id
');

$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($users as &$row) {
    $row['locked'] = $row['locked_until'] !== null && strtotime($row['locked_until']) > time();
}

echo json_encode($users);
