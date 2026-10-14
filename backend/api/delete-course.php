<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Deletes a course and everything hanging off it.
//
// Order matters because of the foreign keys:
//   lesson_progress -> lessons -> (course)
//   enrollments -> (course)
// Children go first, parent last, all inside one transaction so a
// failure halfway through leaves nothing orphaned.

$data = json_decode(file_get_contents('php://input'), true);

$courseId = $data['course_id'] ?? null;
$instructorId = $data['instructor_id'] ?? null;

if (!$courseId || !$instructorId) {
    http_response_code(400);
    echo json_encode(['error' => 'Course and instructor are required.']);
    exit;
}

$stmt = $pdo->prepare('SELECT instructor_id, title FROM courses WHERE id = ?');
$stmt->execute([$courseId]);
$course = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$course) {
    http_response_code(404);
    echo json_encode(['error' => 'Course not found.']);
    exit;
}

if ((int) $course['instructor_id'] !== (int) $instructorId) {
    $logStmt = $pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)');
    $logStmt->execute(['course_delete_denied', $instructorId, 'Tried to delete course ' . $courseId . ' owned by another instructor']);

    http_response_code(403);
    echo json_encode(['error' => 'You can only delete your own courses.']);
    exit;
}

try {
    $pdo->beginTransaction();

    $pdo->prepare('
      DELETE lp FROM lesson_progress lp
      JOIN lessons l ON l.id = lp.lesson_id
      WHERE l.course_id = ?
    ')->execute([$courseId]);

    $pdo->prepare('DELETE FROM lessons WHERE course_id = ?')->execute([$courseId]);
    $pdo->prepare('DELETE FROM enrollments WHERE course_id = ?')->execute([$courseId]);
    $pdo->prepare('DELETE FROM courses WHERE id = ?')->execute([$courseId]);

    $logStmt = $pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)');
    $logStmt->execute(['course_deleted', $instructorId, 'Deleted course ' . $courseId . ' (' . $course['title'] . ')']);

    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Could not delete that course.']);
    exit;
}

echo json_encode(['deleted' => true, 'course_id' => (int) $courseId]);
