<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Everything the student Overview needs, in one request.
//
// Every number here is counted from the database. Nothing is invented:
// there is no ratings table, so courses carry no rating; there is no
// lesson duration column, so no "hours studied"; there is no per-day
// login record, so no streak. Those stats were removed rather than
// faked.

$studentId = $_GET['student_id'] ?? null;

if (!$studentId) {
    http_response_code(400);
    echo json_encode(['error' => 'Student ID required.']);
    exit;
}

// ---------- courses this student is enrolled in ----------
$enrolledStmt = $pdo->prepare('
  SELECT c.id, c.title, c.thumbnail_url, c.access_tier,
         u.name AS instructor_name,
         e.progress_percent, e.enrolled_at
  FROM enrollments e
  JOIN courses c ON c.id = e.course_id
  JOIN users u   ON u.id = c.instructor_id
  WHERE e.student_id = ?
  ORDER BY e.enrolled_at DESC
');
$enrolledStmt->execute([$studentId]);
$enrolled = $enrolledStmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($enrolled as &$row) {
    $row['progress_percent'] = (int) $row['progress_percent'];
}
unset($row);

// ---------- published courses they have NOT enrolled in ----------
$recStmt = $pdo->prepare('
  SELECT c.id, c.title, c.description, c.thumbnail_url, c.access_tier,
         u.name AS instructor_name,
         (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS lesson_count
  FROM courses c
  JOIN users u ON u.id = c.instructor_id
  WHERE c.status = "published"
    AND c.id NOT IN (SELECT course_id FROM enrollments WHERE student_id = ?)
  ORDER BY c.created_at DESC
  LIMIT 4
');
$recStmt->execute([$studentId]);
$recommended = $recStmt->fetchAll(PDO::FETCH_ASSOC);

// ---------- counts ----------
$lessonsDoneStmt = $pdo->prepare('SELECT COUNT(*) FROM lesson_progress WHERE student_id = ?');
$lessonsDoneStmt->execute([$studentId]);
$lessonsDone = (int) $lessonsDoneStmt->fetchColumn();

$completed = 0;
$inProgress = 0;
foreach ($enrolled as $row) {
    if ($row['progress_percent'] >= 100) {
        $completed++;
    } elseif ($row['progress_percent'] > 0) {
        $inProgress++;
    }
}

// ---------- plan ----------
$subStmt = $pdo->prepare('SELECT plan, expires_at FROM subscriptions WHERE user_id = ? AND status = "active" ORDER BY started_at DESC LIMIT 1');
$subStmt->execute([$studentId]);
$sub = $subStmt->fetch(PDO::FETCH_ASSOC);

$isPro = $sub
    && $sub['plan'] === 'pro'
    && $sub['expires_at']
    && strtotime($sub['expires_at']) > time();

echo json_encode([
    'stats' => [
        'enrolled'     => count($enrolled),
        'completed'    => $completed,
        'in_progress'  => $inProgress,
        'lessons_done' => $lessonsDone,
    ],
    'plan' => $isPro ? 'pro' : 'free',
    // The checklist is derived from real activity rather than stored,
    // so it can never disagree with what the student has actually done.
    'checklist' => [
        'account_created' => true,
        'first_enrolment' => count($enrolled) > 0,
        'first_lesson'    => $lessonsDone > 0,
    ],
    'enrolled'    => $enrolled,
    'recommended' => $recommended,
]);
