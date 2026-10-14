<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Public contact form. Anyone can post to this without logging in, which
// makes it the least-trusted input path in the whole system:
//   - length caps stop someone dumping megabytes into the table
//   - the email is validated rather than stored as free text
//   - a simple per-address rate limit blunts automated flooding
// Note that the message is stored RAW. Escaping belongs at the point of
// display, not at the point of storage — the admin view must render it
// as text, never as HTML, or this becomes a stored-XSS route.

$data = json_decode(file_get_contents('php://input'), true);

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$subject = trim($data['subject'] ?? '');
$message = trim($data['message'] ?? '');

if ($name === '' || $email === '' || $subject === '' || $message === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Every field is required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'That does not look like a valid email address.']);
    exit;
}

if (mb_strlen($name) > 100 || mb_strlen($subject) > 200 || mb_strlen($message) > 5000) {
    http_response_code(400);
    echo json_encode(['error' => 'One of those fields is too long.']);
    exit;
}

// No more than 3 messages from one address in 10 minutes.
$rateStmt = $pdo->prepare('
  SELECT COUNT(*) FROM contact_messages
  WHERE email = ? AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)
');
$rateStmt->execute([$email]);

if ((int) $rateStmt->fetchColumn() >= 3) {
    http_response_code(429);
    echo json_encode(['error' => 'You have sent several messages already. Please wait a few minutes.']);
    exit;
}

$stmt = $pdo->prepare('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)');
$stmt->execute([$name, $email, $subject, $message]);

echo json_encode(['sent' => true]);
