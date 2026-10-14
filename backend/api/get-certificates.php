<?php
require_once '../config/cors.php';
require_once '../config/database.php';

$studentId = $_GET['student_id'] ?? null;

if (!$studentId) {
    http_response_code(400);
    echo json_encode(['error' => 'Student ID required.']);
    exit;
}

$stmt = $pdo->prepare('
  SELECT
    c.id, c.title, c.thumbnail_url, c.access_tier,
    u.name AS instructor_name,
    e.progress_percent,
    (SELECT MAX(lp.completed_at)
       FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id
      WHERE l.course_id = c.id AND lp.student_id = e.student_id) AS finished_at
  FROM enrollments e
  JOIN courses c ON c.id = e.course_id
  JOIN users u   ON u.id = c.instructor_id
  WHERE e.student_id = ?
  ORDER BY e.enrolled_at DESC
');
$stmt->execute([$studentId]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$earned = [];
$inProgress = [];

foreach ($rows as $row) {
    $progress = (int) $row['progress_percent'];

    $item = [
        'course_id'       => (int) $row['id'],
        'title'           => $row['title'],
        'thumbnail_url'   => $row['thumbnail_url'],
        'access_tier'     => $row['access_tier'],
        'instructor_name' => $row['instructor_name'],
        'progress'        => $progress,
    ];

    if ($progress >= 100) {
        $year = $row['finished_at'] ? date('Y', strtotime($row['finished_at'])) : date('Y');
        $item['issued_at'] = $row['finished_at'];
        $item['credential_id'] = sprintf(
            'NXA-%s-%04d-%04d',
            $year,
            (int) $row['id'],
            (int) $studentId
        );
        $earned[] = $item;
    } else {
        $inProgress[] = $item;
    }
}

echo json_encode(['earned' => $earned, 'in_progress' => $inProgress]);
