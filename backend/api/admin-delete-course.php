<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once 'admin-guard.php';

$data = json_decode(file_get_contents('php://input'), true);
$admin = requireAdmin($pdo, $data['admin_id'] ?? null);

$courseId = $data['course_id'] ?? null;

if (!$courseId) {
    http_response_code(400);
    echo json_encode(['error' => 'Course ID required.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, title, instructor_id FROM courses WHERE id = ?');
$stmt->execute([$courseId]);
$course = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$course) {
    http_response_code(404);
    echo json_encode(['error' => 'Course not found.']);
    exit;
}

// Children before parent, all in one transaction — same ordering as the
// instructor-side delete, but without the ownership restriction since an
// admin may remove any course on the platform.
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
    $logStmt->execute([
        'course_removed_by_admin',
        $admin['id'],
        'Removed course ' . $courseId . ' (' . $course['title'] . ') belonging to instructor ' . $course['instructor_id'],
    ]);

    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Could not remove that course.']);
    exit;
}

echo json_encode(['deleted' => true, 'course_id' => (int) $courseId]);
