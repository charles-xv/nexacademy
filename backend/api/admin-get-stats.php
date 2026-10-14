<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once 'admin-guard.php';

requireAdmin($pdo, $_GET['admin_id'] ?? null);

$one = function (string $sql) use ($pdo) {
    return (int) $pdo->query($sql)->fetchColumn();
};

echo json_encode([
    'students'        => $one("SELECT COUNT(*) FROM users WHERE role = 'student'"),
    'instructors'     => $one("SELECT COUNT(*) FROM users WHERE role = 'instructor'"),
    'suspended'       => $one("SELECT COUNT(*) FROM users WHERE status = 'suspended'"),
    'courses_total'   => $one("SELECT COUNT(*) FROM courses"),
    'courses_live'    => $one("SELECT COUNT(*) FROM courses WHERE status = 'published'"),
    'lessons'         => $one("SELECT COUNT(*) FROM lessons"),
    'enrollments'     => $one("SELECT COUNT(*) FROM enrollments"),
    'pro_subscribers' => $one("SELECT COUNT(*) FROM subscriptions WHERE plan = 'pro' AND status = 'active'"),
    'revenue'         => (float) $pdo->query("SELECT COALESCE(SUM(amount), 0) FROM subscriptions WHERE plan = 'pro'")->fetchColumn(),
    'security_events' => $one("SELECT COUNT(*) FROM security_logs"),
    'locked_accounts' => $one("SELECT COUNT(*) FROM users WHERE locked_until IS NOT NULL AND locked_until > NOW()"),
]);
