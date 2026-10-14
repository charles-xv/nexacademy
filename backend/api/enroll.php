<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Enrols a student in a course.
// The paywall decision is made HERE, from the database — never from
// anything the browser claims about its own plan. A frontend-only
// check is Broken Access Control (OWASP A01).

$data = json_decode(file_get_contents('php://input'), true);

$studentId = $data['student_id'] ?? null;
$courseId = $data['course_id'] ?? null;

if (!$studentId || !$courseId) {
    http_response_code(400);
    echo json_encode(['error' => 'Student ID and course ID are required.']);
    exit;
}

// The account must exist, be active, and actually be a student.
// Instructors and admins do not enrol in courses.
$userStmt = $pdo->prepare('SELECT id, role, status FROM users WHERE id = ?');
$userStmt->execute([$studentId]);
$user = $userStmt->fetch(PDO::FETCH_ASSOC);

if (!$user || $user['role'] !== 'student') {
    http_response_code(403);
    echo json_encode(['error' => 'Only student accounts can enrol in courses.']);
    exit;
}

if ($user['status'] === 'suspended') {
    http_response_code(403);
    echo json_encode(['error' => 'This account has been suspended.']);
    exit;
}

$courseStmt = $pdo->prepare('SELECT id, title, access_tier, status FROM courses WHERE id = ?');
$courseStmt->execute([$courseId]);
$course = $courseStmt->fetch(PDO::FETCH_ASSOC);

if (!$course || $course['status'] !== 'published') {
    http_response_code(404);
    echo json_encode(['error' => 'Course not found.']);
    exit;
}

// Pro courses require an active, unexpired Pro plan.
if ($course['access_tier'] === 'pro') {
    $subStmt = $pdo->prepare('SELECT plan, expires_at FROM subscriptions WHERE user_id = ? AND status = "active" ORDER BY started_at DESC LIMIT 1');
    $subStmt->execute([$studentId]);
    $sub = $subStmt->fetch(PDO::FETCH_ASSOC);

    $hasActivePro = $sub
        && $sub['plan'] === 'pro'
        && $sub['expires_at']
        && strtotime($sub['expires_at']) > time();

    if (!$hasActivePro) {
        $logStmt = $pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)');
        $logStmt->execute(['enrol_denied', $studentId, 'Attempted Pro course ' . $courseId . ' without an active plan']);

        http_response_code(403);
        echo json_encode([
            'error' => 'This course is available to Pro members.',
            'reason' => 'pro_required',
        ]);
        exit;
    }
}

// Already enrolled is not an error — just report it and move on.
$existsStmt = $pdo->prepare('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?');
$existsStmt->execute([$studentId, $courseId]);
if ($existsStmt->fetch()) {
    echo json_encode(['enrolled' => true, 'already' => true, 'course_id' => (int) $courseId]);
    exit;
}

$insertStmt = $pdo->prepare('INSERT INTO enrollments (student_id, course_id, progress_percent) VALUES (?, ?, 0)');
$insertStmt->execute([$studentId, $courseId]);

echo json_encode([
    'enrolled' => true,
    'already' => false,
    'course_id' => (int) $courseId,
    'title' => $course['title'],
]);
