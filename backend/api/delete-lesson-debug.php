<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// TEMPORARY DEBUG VERSION — this reveals the real database error instead
// of hiding it behind a generic message. Use this to find the cause, then
// switch back to the normal delete-lesson.php once fixed.

$data = json_decode(file_get_contents('php://input'), true);
$lessonId = $data['lesson_id'] ?? null;

if (!$lessonId) {
    http_response_code(400);
    echo json_encode(['error' => 'Lesson ID required.']);
    exit;
}

$findStmt = $pdo->prepare('SELECT id, course_id FROM lessons WHERE id = ?');
$findStmt->execute([$lessonId]);
$lesson = $findStmt->fetch(PDO::FETCH_ASSOC);

if (!$lesson) {
    http_response_code(404);
    echo json_encode(['error' => 'Lesson not found.']);
    exit;
}

try {
    $pdo->beginTransaction();

    $progressStmt = $pdo->prepare('DELETE FROM lesson_progress WHERE lesson_id = ?');
    $progressStmt->execute([$lessonId]);

    $deleteStmt = $pdo->prepare('DELETE FROM lessons WHERE id = ?');
    $deleteStmt->execute([$lessonId]);

    $reorderStmt = $pdo->prepare('SELECT id FROM lessons WHERE course_id = ? ORDER BY position ASC');
    $reorderStmt->execute([$lesson['course_id']]);
    $remaining = $reorderStmt->fetchAll(PDO::FETCH_COLUMN);

    $posStmt = $pdo->prepare('UPDATE lessons SET position = ? WHERE id = ?');
    foreach ($remaining as $index => $id) {
        $posStmt->execute([$index + 1, $id]);
    }

    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    // The ACTUAL error — this is what we need to see.
    echo json_encode([
        'error' => 'Could not delete that lesson.',
        'real_reason' => $e->getMessage(),
        'code' => $e->getCode(),
    ]);
    exit;
}

echo json_encode(['deleted' => true, 'lesson_id' => (int) $lessonId]);
