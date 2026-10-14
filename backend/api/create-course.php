<?php
require_once '../config/cors.php';
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

$instructorId = $data['instructor_id'] ?? null;
$title = trim($data['title'] ?? '');
$description = trim($data['description'] ?? '');
$thumbnailUrl = trim($data['thumbnail_url'] ?? '');
$accessTier = $data['access_tier'] ?? 'free';
$status = $data['status'] ?? 'draft';

if (!$instructorId || !$title) {
    http_response_code(400);
    echo json_encode(['error' => 'Instructor and title are required.']);
    exit;
}

// Whitelist both enums — never trust what the client sends.
if (!in_array($accessTier, ['free', 'pro'])) {
    $accessTier = 'free';
}
if (!in_array($status, ['draft', 'published'])) {
    $status = 'draft';
}

$stmt = $pdo->prepare('INSERT INTO courses (instructor_id, title, description, thumbnail_url, access_tier, status) VALUES (?, ?, ?, ?, ?, ?)');
$stmt->execute([$instructorId, $title, $description, $thumbnailUrl, $accessTier, $status]);

echo json_encode([
    'id' => $pdo->lastInsertId(),
    'title' => $title,
    'access_tier' => $accessTier,
    'status' => $status,
]);
