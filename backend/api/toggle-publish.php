<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Flips a course between draft and published.
// Ownership is checked server-side, same as update-course.php.

$data = json_decode(file_get_contents('php://input'), true);

$courseId = $data['course_id'] ?? null;
$instructorId = $data['instructor_id'] ?? null;

if (!$courseId || !$instructorId) {
    http_response_code(400);
    echo json_encode(['error' => 'Course and instructor are required.']);
    exit;
}

$stmt = $pdo->prepare('SELECT instructor_id, status FROM courses WHERE id = ?');
$stmt->execute([$courseId]);
$course = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$course) {
    http_response_code(404);
    echo json_encode(['error' => 'Course not found.']);
    exit;
}

if ((int) $course['instructor_id'] !== (int) $instructorId) {
    http_response_code(403);
    echo json_encode(['error' => 'You can only change your own courses.']);
    exit;
}

$newStatus = $course['status'] === 'published' ? 'draft' : 'published';

// Publishing an empty course helps nobody — block it.
if ($newStatus === 'published') {
    $lessonStmt = $pdo->prepare('SELECT COUNT(*) FROM lessons WHERE course_id = ?');
    $lessonStmt->execute([$courseId]);
    if ((int) $lessonStmt->fetchColumn() === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Add at least one lesson before publishing this course.']);
        exit;
    }
}

$updateStmt = $pdo->prepare('UPDATE courses SET status = ? WHERE id = ?');
$updateStmt->execute([$newStatus, $courseId]);

echo json_encode(['id' => (int) $courseId, 'status' => $newStatus]);
