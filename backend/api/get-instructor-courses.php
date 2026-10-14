<?php
require_once '../config/cors.php';
require_once '../config/database.php';

$instructorId = $_GET['instructor_id'] ?? null;

if (!$instructorId) {
    http_response_code(400);
    echo json_encode(['error' => 'Instructor ID required.']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, title, description, thumbnail_url, access_tier, status, created_at FROM courses WHERE instructor_id = ? ORDER BY created_at DESC');
$stmt->execute([$instructorId]);
$courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($courses);
