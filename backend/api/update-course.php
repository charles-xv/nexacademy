<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Edits a course. The instructor_id is checked against the course's
// owner before anything is written — an instructor may only edit their
// own courses. Without this check any instructor could edit anyone's
// course by guessing an ID (Broken Access Control, OWASP A01).

$data = json_decode(file_get_contents('php://input'), true);

$courseId = $data['course_id'] ?? null;
$instructorId = $data['instructor_id'] ?? null;
$title = trim($data['title'] ?? '');
$description = trim($data['description'] ?? '');
$thumbnailUrl = trim($data['thumbnail_url'] ?? '');
$accessTier = $data['access_tier'] ?? 'free';

if (!$courseId || !$instructorId || !$title) {
    http_response_code(400);
    echo json_encode(['error' => 'Course, instructor and title are required.']);
    exit;
}

if (!in_array($accessTier, ['free', 'pro'])) {
    $accessTier = 'free';
}

$ownerStmt = $pdo->prepare('SELECT instructor_id FROM courses WHERE id = ?');
$ownerStmt->execute([$courseId]);
$course = $ownerStmt->fetch(PDO::FETCH_ASSOC);

if (!$course) {
    http_response_code(404);
    echo json_encode(['error' => 'Course not found.']);
    exit;
}

if ((int) $course['instructor_id'] !== (int) $instructorId) {
    $logStmt = $pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)');
    $logStmt->execute(['course_edit_denied', $instructorId, 'Tried to edit course ' . $courseId . ' owned by another instructor']);

    http_response_code(403);
    echo json_encode(['error' => 'You can only edit your own courses.']);
    exit;
}

$stmt = $pdo->prepare('UPDATE courses SET title = ?, description = ?, thumbnail_url = ?, access_tier = ? WHERE id = ?');
$stmt->execute([$title, $description, $thumbnailUrl, $accessTier, $courseId]);

echo json_encode([
    'id' => (int) $courseId,
    'title' => $title,
    'description' => $description,
    'thumbnail_url' => $thumbnailUrl,
    'access_tier' => $accessTier,
]);
