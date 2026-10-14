<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Counts for the instructor's profile panel. Same principle as the
// student version: every figure comes from a COUNT, nothing is stored
// or assumed.

$instructorId = $_GET['instructor_id'] ?? null;

if (!$instructorId) {
    http_response_code(400);
    echo json_encode(['error' => 'Instructor ID required.']);
    exit;
}

$one = function (string $sql) use ($pdo, $instructorId) {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$instructorId]);
    return (int) $stmt->fetchColumn();
};

$courses = $one('SELECT COUNT(*) FROM courses WHERE instructor_id = ?');
$published = $one('SELECT COUNT(*) FROM courses WHERE instructor_id = ? AND status = "published"');
$lessons = $one('SELECT COUNT(*) FROM lessons l JOIN courses c ON c.id = l.course_id WHERE c.instructor_id = ?');
$students = $one('
  SELECT COUNT(DISTINCT e.student_id)
  FROM enrollments e JOIN courses c ON c.id = e.course_id
  WHERE c.instructor_id = ?
');

echo json_encode([
    'stats' => [
        'courses'   => $courses,
        'published' => $published,
        'lessons'   => $lessons,
        'students'  => $students,
    ],
    'checklist' => [
        'account_created' => true,
        'first_course'    => $courses > 0,
        'first_published' => $published > 0,
    ],
]);
