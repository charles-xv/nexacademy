<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Google One Tap sign-in.
//
// The browser sends the ID token (a JWT) Google issued. We must NEVER
// trust it as-is — anyone could POST a fake token. So we verify it with
// Google directly using the tokeninfo endpoint, which checks the
// signature and expiry for us, then we confirm the audience (aud) is OUR
// client ID. Only after that do we trust the email/name inside.
//
// Then: if the Google account (or its email) already exists -> log in.
// If new -> create an account with the role the signup page had toggled.

// This must match the Client ID from Google Cloud Console EXACTLY.
const GOOGLE_CLIENT_ID = '434026129074-28nbg8jti6nam55nsc1hm807676jin8n.apps.googleusercontent.com';

$data = json_decode(file_get_contents('php://input'), true);
$credential = $data['credential'] ?? null;      // the JWT from Google
$role = $data['role'] ?? 'student';             // toggled role (signup page)
$context = $data['context'] ?? 'login';         // 'login' or 'signup'

if (!$credential) {
    http_response_code(400);
    echo json_encode(['error' => 'No Google credential provided.']);
    exit;
}

// --- Verify the token with Google ---
$verifyUrl = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($credential);
$ch = curl_init($verifyUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$response) {
    http_response_code(401);
    echo json_encode(['error' => 'Could not verify Google sign-in. Please try again.']);
    exit;
}

$payload = json_decode($response, true);

// --- Confirm the token was issued for OUR app ---
if (($payload['aud'] ?? '') !== GOOGLE_CLIENT_ID) {
    http_response_code(401);
    echo json_encode(['error' => 'This sign-in was not issued for this application.']);
    exit;
}

// Google marks whether it verified the email. Require it.
$emailVerified = ($payload['email_verified'] ?? 'false');
if ($emailVerified !== true && $emailVerified !== 'true') {
    http_response_code(401);
    echo json_encode(['error' => 'Your Google email is not verified.']);
    exit;
}

$googleId = $payload['sub'] ?? null;      // stable unique Google account id
$email = $payload['email'] ?? null;
$name = $payload['name'] ?? ($payload['given_name'] ?? 'User');

if (!$googleId || !$email) {
    http_response_code(401);
    echo json_encode(['error' => 'Google did not return the required account details.']);
    exit;
}

// --- Find an existing account: by google_id first, then by email ---
$stmt = $pdo->prepare('SELECT id, name, email, role, status, google_id FROM users WHERE google_id = ? OR email = ? LIMIT 1');
$stmt->execute([$googleId, $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    // Existing account.
    if ($user['status'] === 'suspended') {
        http_response_code(403);
        echo json_encode(['error' => 'This account has been suspended.']);
        exit;
    }

    // If they registered by email before and are now using Google, link
    // the google_id onto their account so future logins match instantly.
    if (empty($user['google_id'])) {
        $pdo->prepare('UPDATE users SET google_id = ? WHERE id = ?')->execute([$googleId, $user['id']]);
    }

    $pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)')
        ->execute(['login_success', $user['id'], 'Google sign-in']);

    echo json_encode([
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
    ]);
    exit;
}

// --- No account yet ---
// On the LOGIN page we don't know what role a brand-new user wants, so we
// send them to signup to choose. On the SIGNUP page we create the account
// with whatever role was toggled.
if ($context !== 'signup') {
    http_response_code(404);
    echo json_encode([
        'needs_signup' => true,
        'error' => 'No account found. Please sign up first and choose your role.',
    ]);
    exit;
}

$role = in_array($role, ['student', 'instructor']) ? $role : 'student';

try {
    $pdo->beginTransaction();

    // Google-verified email, so is_verified = 1, no password.
    $stmt = $pdo->prepare('
      INSERT INTO users (name, email, password_hash, role, is_verified, google_id)
      VALUES (?, ?, NULL, ?, 1, ?)
    ');
    $stmt->execute([$name, $email, $role, $googleId]);
    $userId = $pdo->lastInsertId();

    if ($role === 'student') {
        $pdo->prepare('INSERT INTO subscriptions (user_id, plan, status, amount) VALUES (?, "free", "active", 0.00)')
            ->execute([$userId]);
    }

    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Could not create your account. Please try again.']);
    exit;
}

$pdo->prepare('INSERT INTO security_logs (event_type, user_id, details) VALUES (?, ?, ?)')
    ->execute(['account_registered', $userId, "New $role account via Google sign-in"]);

echo json_encode([
    'id' => $userId,
    'name' => $name,
    'email' => $email,
    'role' => $role,
]);
