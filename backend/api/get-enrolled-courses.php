<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Courses this student has actually enrolled in — not the public catalog.
// Returns an empty array when they have not enrolled in anything, which
// is a real answer, not an error.

$studentId = $_GET['student_id'] ?? null;

if (!$studentId) {
    http_response_code(400);
    echo json_encode(['error' => 'Student ID required.']);
    exit;
}

$stmt = $pdo->prepare('
  SELECT c.id, c.title, c.description, c.thumbnail_url, c.access_tier,
         u.name AS instructor_name,
         e.progress_percent, e.enrolled_at
  FROM enrollments e
  JOIN courses c ON c.id = e.course_id
  JOIN users u ON u.id = c.instructor_id
  WHERE e.student_id = ?
  ORDER BY e.enrolled_at DESC
');
$stmt->execute([$studentId]);
$courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($courses);
