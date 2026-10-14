<?php
require_once '../config/cors.php';
require_once '../config/database.php';

$stmt = $pdo->prepare('
  SELECT c.id, c.title, c.description, c.thumbnail_url, c.access_tier, c.created_at, u.name AS instructor_name
  FROM courses c
  JOIN users u ON c.instructor_id = u.id
  WHERE c.status = "published"
  ORDER BY c.created_at DESC
');
$stmt->execute();
$courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($courses);
