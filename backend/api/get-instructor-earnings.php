<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Earnings breakdown per course for this instructor.
//
// Same honest basis as the overview: subscription revenue attributed by
// enrolment share, 50% revenue split, clearly labelled estimated. Each
// course row shows its enrolments and the slice of the estimate it drives.

$instructorId = $_GET['instructor_id'] ?? null;

if (!$instructorId) {
    http_response_code(400);
    echo json_encode(['error' => 'Instructor ID required.']);
    exit;
}

$proRevenue = (float) $pdo->query('SELECT COALESCE(SUM(amount),0) FROM subscriptions WHERE plan = "pro"')->fetchColumn();
$totalEnrol = (int) $pdo->query('SELECT COUNT(*) FROM enrollments')->fetchColumn();
$perEnrolment = ($totalEnrol > 0) ? ($proRevenue / $totalEnrol) * 0.5 : 0;

$stmt = $pdo->prepare('
  SELECT c.id, c.title, c.access_tier, c.status,
         (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrolments
  FROM courses c
  WHERE c.instructor_id = ?
  ORDER BY enrolments DESC
');
$stmt->execute([$instructorId]);
$courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

$total = 0;
foreach ($courses as &$c) {
    $c['enrolments'] = (int) $c['enrolments'];
    $c['estimated'] = round($c['enrolments'] * $perEnrolment, 2);
    $total += $c['estimated'];
}
unset($c);

echo json_encode([
    'total_estimated' => round($total, 2),
    'per_enrolment'   => round($perEnrolment, 2),
    'note' => 'Estimated. NeXaCaDeMy is subscription-based; earnings are a 50% share of Pro revenue attributed by enrolments.',
    'courses' => $courses,
]);
