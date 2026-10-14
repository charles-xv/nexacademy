<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Instructor-side lesson list — full detail, no paywall.
// NOTE: this currently trusts the instructor_id in the query string.
// A server-side ownership check belongs here before deployment.

$courseId = $_GET['course_id'] ?? null;

if (!$courseId) {
    http_response_code(400);
    echo json_encode(['error' => 'Course ID required.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, title, youtube_video_id, position, is_preview FROM lessons WHERE course_id = ? ORDER BY position ASC');
$stmt->execute([$courseId]);
$lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($lessons);
