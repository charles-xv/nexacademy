<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Adds a lesson to a course. Accepts either a full YouTube URL or a
// bare video ID and normalises it.
//
// The regex below is the important line. A YouTube ID is exactly 11
// characters from [A-Za-z0-9_-]. Anything else is rejected before it
// reaches the database. Without this check an instructor could store
// arbitrary text that later gets interpolated into an iframe src —
// an injection point sitting in your own admin flow.

$data = json_decode(file_get_contents('php://input'), true);

$courseId = $data['course_id'] ?? null;
$title = trim($data['title'] ?? '');
$rawVideo = trim($data['youtube_video_id'] ?? '');
$isPreview = !empty($data['is_preview']) ? 1 : 0;

if (!$courseId || !$title || !$rawVideo) {
    http_response_code(400);
    echo json_encode(['error' => 'Course, title and video are all required.']);
    exit;
}

// Pull the ID out of whatever form was pasted.
function extractYoutubeId(string $input): ?string {
    $patterns = [
        '#youtube\.com/watch\?v=([A-Za-z0-9_-]{11})#',
        '#youtu\.be/([A-Za-z0-9_-]{11})#',
        '#youtube\.com/embed/([A-Za-z0-9_-]{11})#',
        '#youtube\.com/shorts/([A-Za-z0-9_-]{11})#',
    ];
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $input, $matches)) {
            return $matches[1];
        }
    }
    // Already a bare ID?
    if (preg_match('#^[A-Za-z0-9_-]{11}$#', $input)) {
        return $input;
    }
    return null;
}

$videoId = extractYoutubeId($rawVideo);

if ($videoId === null) {
    http_response_code(400);
    echo json_encode(['error' => 'That does not look like a valid YouTube video link or ID.']);
    exit;
}

$courseStmt = $pdo->prepare('SELECT id FROM courses WHERE id = ?');
$courseStmt->execute([$courseId]);
if (!$courseStmt->fetch()) {
    http_response_code(404);
    echo json_encode(['error' => 'Course not found.']);
    exit;
}

// Next position in the course.
$posStmt = $pdo->prepare('SELECT COALESCE(MAX(position), 0) + 1 FROM lessons WHERE course_id = ?');
$posStmt->execute([$courseId]);
$position = (int) $posStmt->fetchColumn();

$stmt = $pdo->prepare('INSERT INTO lessons (course_id, title, youtube_video_id, position, is_preview) VALUES (?, ?, ?, ?, ?)');
$stmt->execute([$courseId, $title, $videoId, $position, $isPreview]);

echo json_encode([
    'id' => $pdo->lastInsertId(),
    'title' => $title,
    'youtube_video_id' => $videoId,
    'position' => $position,
    'is_preview' => (bool) $isPreview,
]);
