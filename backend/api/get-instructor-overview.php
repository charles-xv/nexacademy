<?php
require_once '../config/cors.php';
require_once '../config/database.php';


$instructorId = $_GET['instructor_id'] ?? null;

if (!$instructorId) {
    http_response_code(400);
    echo json_encode(['error' => 'Instructor ID required.']);
    exit;
}

$one = function (string $sql) use ($pdo, $instructorId) {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$instructorId]);
    return (int) $stmt->fetchColumn();
};

$coursesTotal = $one('SELECT COUNT(*) FROM courses WHERE instructor_id = ?');
$published    = $one('SELECT COUNT(*) FROM courses WHERE instructor_id = ? AND status = "published"');
$lessons      = $one('SELECT COUNT(*) FROM lessons l JOIN courses c ON c.id = l.course_id WHERE c.instructor_id = ?');
$students     = $one('
  SELECT COUNT(DISTINCT e.student_id)
  FROM enrollments e JOIN courses c ON c.id = e.course_id
  WHERE c.instructor_id = ?
');
$enrolments   = $one('
  SELECT COUNT(*)
  FROM enrollments e JOIN courses c ON c.id = e.course_id
  WHERE c.instructor_id = ?
');

// Recent courses for the mini list on the overview.
$recentStmt = $pdo->prepare('
  SELECT c.id, c.title, c.access_tier, c.status, c.thumbnail_url,
         (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS student_count,
         (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS lesson_count
  FROM courses c
  WHERE c.instructor_id = ?
  ORDER BY c.created_at DESC
  LIMIT 5
');
$recentStmt->execute([$instructorId]);
$recent = $recentStmt->fetchAll(PDO::FETCH_ASSOC);

// Estimated earnings: platform Pro revenue split by this instructor's
// share of total enrolments. Honest and reproducible, not a made-up number.
$proRevenue = (float) $pdo->query('SELECT COALESCE(SUM(amount),0) FROM subscriptions WHERE plan = "pro"')->fetchColumn();
$totalEnrol = (int) $pdo->query('SELECT COUNT(*) FROM enrollments')->fetchColumn();
$instructorShare = ($totalEnrol > 0) ? ($enrolments / $totalEnrol) : 0;
$estimatedEarnings = round($proRevenue * $instructorShare * 0.5, 2); // 50% revenue share

echo json_encode([
    'stats' => [
        'courses'   => $coursesTotal,
        'published' => $published,
        'lessons'   => $lessons,
        'students'  => $students,
        'enrolments'=> $enrolments,
    ],
    'earnings' => [
        'estimated' => $estimatedEarnings,
        'note'      => 'Estimated from Pro subscription revenue, by your share of platform enrolments.',
    ],
    'recent'   => $recent,
    'checklist' => [
        'account_created' => true,
        'first_course'    => $coursesTotal > 0,
        'first_published' => $published > 0,
    ],
]);
