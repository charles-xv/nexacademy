<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Returns the lesson list for a course, with the paywall applied HERE.
//
// The key decision: a locked lesson is returned WITHOUT its
// youtube_video_id. The student gets the title and its position so the
// list looks complete, but the actual video reference never leaves the
// server. Sending every ID and letting React hide some would put the
// paid content in the network response for anyone to read — that is
// Broken Access Control (OWASP A01), not a paywall.

$courseId = $_GET['course_id'] ?? null;
$userId = $_GET['user_id'] ?? null;

if (!$courseId || !$userId) {
    http_response_code(400);
    echo json_encode(['error' => 'Course ID and user ID are required.']);
    exit;
}

$courseStmt = $pdo->prepare('
  SELECT c.id, c.title, c.description, c.access_tier, c.status, u.name AS instructor_name
  FROM courses c JOIN users u ON u.id = c.instructor_id
  WHERE c.id = ?
');
$courseStmt->execute([$courseId]);
$course = $courseStmt->fetch(PDO::FETCH_ASSOC);

if (!$course || $course['status'] !== 'published') {
    http_response_code(404);
    echo json_encode(['error' => 'Course not found.']);
    exit;
}

// Work out what this user is entitled to, from the database only.
$subStmt = $pdo->prepare('SELECT plan, expires_at FROM subscriptions WHERE user_id = ? AND status = "active" ORDER BY started_at DESC LIMIT 1');
$subStmt->execute([$userId]);
$sub = $subStmt->fetch(PDO::FETCH_ASSOC);

$hasActivePro = $sub
    && $sub['plan'] === 'pro'
    && $sub['expires_at']
    && strtotime($sub['expires_at']) > time();

// A free-tier course is fully open. A pro-tier course is fully open only
// to an active Pro member; everyone else gets the preview lessons.
$fullAccess = ($course['access_tier'] === 'free') || $hasActivePro;

$lessonStmt = $pdo->prepare('SELECT id, title, youtube_video_id, position, is_preview FROM lessons WHERE course_id = ? ORDER BY position ASC');
$lessonStmt->execute([$courseId]);
$rows = $lessonStmt->fetchAll(PDO::FETCH_ASSOC);

// Which of these has the student already finished?
$doneStmt = $pdo->prepare('
  SELECT lp.lesson_id FROM lesson_progress lp
  JOIN lessons l ON l.id = lp.lesson_id
  WHERE lp.student_id = ? AND l.course_id = ?
');
$doneStmt->execute([$userId, $courseId]);
$completed = array_map('intval', $doneStmt->fetchAll(PDO::FETCH_COLUMN));

$lessons = [];
foreach ($rows as $row) {
    $unlocked = $fullAccess || (int) $row['is_preview'] === 1;

    $lesson = [
        'id' => (int) $row['id'],
        'title' => $row['title'],
        'position' => (int) $row['position'],
        'is_preview' => (int) $row['is_preview'] === 1,
        'locked' => !$unlocked,
        'completed' => in_array((int) $row['id'], $completed, true),
    ];

    // Only an unlocked lesson carries a video ID.
    if ($unlocked) {
        $lesson['youtube_video_id'] = $row['youtube_video_id'];
    }

    $lessons[] = $lesson;
}

echo json_encode([
    'course' => [
        'id' => (int) $course['id'],
        'title' => $course['title'],
        'description' => $course['description'],
        'access_tier' => $course['access_tier'],
        'instructor_name' => $course['instructor_name'],
    ],
    'full_access' => $fullAccess,
    'plan' => $hasActivePro ? 'pro' : 'free',
    'lessons' => $lessons,
]);
