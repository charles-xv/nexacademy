<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Marks one lesson finished and recalculates the course progress.
// Entitlement is rechecked here — a student cannot mark a locked
// lesson complete just by knowing its ID.

$data = json_decode(file_get_contents('php://input'), true);

$studentId = $data['student_id'] ?? null;
$lessonId = $data['lesson_id'] ?? null;

if (!$studentId || !$lessonId) {
    http_response_code(400);
    echo json_encode(['error' => 'Student ID and lesson ID are required.']);
    exit;
}

$lessonStmt = $pdo->prepare('
  SELECT l.id, l.course_id, l.is_preview, c.access_tier
  FROM lessons l JOIN courses c ON c.id = l.course_id
  WHERE l.id = ?
');
$lessonStmt->execute([$lessonId]);
$lesson = $lessonStmt->fetch(PDO::FETCH_ASSOC);

if (!$lesson) {
    http_response_code(404);
    echo json_encode(['error' => 'Lesson not found.']);
    exit;
}

$subStmt = $pdo->prepare('SELECT plan, expires_at FROM subscriptions WHERE user_id = ? AND status = "active" ORDER BY started_at DESC LIMIT 1');
$subStmt->execute([$studentId]);
$sub = $subStmt->fetch(PDO::FETCH_ASSOC);

$hasActivePro = $sub && $sub['plan'] === 'pro'
    && $sub['expires_at'] && strtotime($sub['expires_at']) > time();

$unlocked = ($lesson['access_tier'] === 'free')
    || $hasActivePro
    || (int) $lesson['is_preview'] === 1;

if (!$unlocked) {
    $logStmt = $pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)');
    $logStmt->execute(['progress_denied', $studentId, 'Tried to complete locked lesson ' . $lessonId]);

    http_response_code(403);
    echo json_encode(['error' => 'This lesson is available to Pro members.']);
    exit;
}

// INSERT IGNORE relies on the UNIQUE key — completing twice is a no-op.
$insertStmt = $pdo->prepare('INSERT IGNORE INTO lesson_progress (student_id, lesson_id) VALUES (?, ?)');
$insertStmt->execute([$studentId, $lessonId]);

// Recalculate progress for this course as a whole.
$totalStmt = $pdo->prepare('SELECT COUNT(*) FROM lessons WHERE course_id = ?');
$totalStmt->execute([$lesson['course_id']]);
$total = (int) $totalStmt->fetchColumn();

$doneStmt = $pdo->prepare('
  SELECT COUNT(*) FROM lesson_progress lp
  JOIN lessons l ON l.id = lp.lesson_id
  WHERE lp.student_id = ? AND l.course_id = ?
');
$doneStmt->execute([$studentId, $lesson['course_id']]);
$done = (int) $doneStmt->fetchColumn();

$percent = $total > 0 ? (int) round(($done / $total) * 100) : 0;

$updateStmt = $pdo->prepare('UPDATE enrollments SET progress_percent = ? WHERE student_id = ? AND course_id = ?');
$updateStmt->execute([$percent, $studentId, $lesson['course_id']]);

echo json_encode([
    'completed' => true,
    'lesson_id' => (int) $lessonId,
    'lessons_done' => $done,
    'lessons_total' => $total,
    'progress_percent' => $percent,
]);
