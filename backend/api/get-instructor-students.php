<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Every student enrolled in any of this instructor's courses, with which
// course and how far along. Real rows from enrollments — no placeholder.

$instructorId = $_GET['instructor_id'] ?? null;

if (!$instructorId) {
    http_response_code(400);
    echo json_encode(['error' => 'Instructor ID required.']);
    exit;
}

$stmt = $pdo->prepare('
  SELECT
    u.id AS student_id, u.name AS student_name, u.email AS student_email,
    c.id AS course_id, c.title AS course_title,
    e.progress_percent, e.enrolled_at
  FROM enrollments e
  JOIN courses c ON c.id = e.course_id
  JOIN users u   ON u.id = e.student_id
  WHERE c.instructor_id = ?
  ORDER BY e.enrolled_at DESC
');
$stmt->execute([$instructorId]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($rows as &$r) {
    $r['progress_percent'] = (int) $r['progress_percent'];
}
unset($r);

// A distinct-student count too, since one student can take several courses.
$distinct = [];
foreach ($rows as $r) { $distinct[$r['student_id']] = true; }

echo json_encode([
    'total_enrolments' => count($rows),
    'distinct_students' => count($distinct),
    'students' => $rows,
]);
