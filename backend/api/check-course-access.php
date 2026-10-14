<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Decides whether a given user may open a given course.
// The decision is made HERE, on the server, from the database —
// never from anything the browser claims about its own plan.


$userId = $_GET['user_id'] ?? null;
$courseId = $_GET['course_id'] ?? null;

if (!$userId || !$courseId) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID and course ID are required.']);
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

// Free courses are open to any logged-in user.
if ($course['access_tier'] === 'free') {
    echo json_encode(['allowed' => true, 'reason' => 'free_course']);
    exit;
}

$subStmt = $pdo->prepare('SELECT plan, expires_at FROM subscriptions WHERE user_id = ? AND status = "active" ORDER BY started_at DESC LIMIT 1');
$subStmt->execute([$userId]);
$sub = $subStmt->fetch(PDO::FETCH_ASSOC);

$hasActivePro = $sub
    && $sub['plan'] === 'pro'
    && $sub['expires_at']
    && strtotime($sub['expires_at']) > time();

if ($hasActivePro) {
    echo json_encode(['allowed' => true, 'reason' => 'active_pro']);
    exit;
}

http_response_code(403);
echo json_encode([
    'allowed' => false,
    'reason' => 'pro_required',
    'error' => 'This course is available to Pro members.',
]);
