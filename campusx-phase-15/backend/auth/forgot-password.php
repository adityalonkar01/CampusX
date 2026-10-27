<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validation.php';
require_once __DIR__ . '/../helpers/sanitizer.php';

cmsRequirePost();
$input = cmsReadInput();
$email = cmsCleanEmail($input['email'] ?? $input['username'] ?? '');
if ($email === '' || !cmsValidEmail($email)) {
    cmsJson(['success' => false, 'message' => 'Enter a valid email address.'], 422);
}

$pdo = cmsDb();
$stmt = $pdo->prepare('SELECT id, password_hint FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1');
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

if ($user) {
    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);
    $pdo->prepare('INSERT INTO password_reset_requests (user_id, email, reset_token_hash, expires_at, created_at) VALUES (:user_id, :email, :hash, DATE_ADD(NOW(), INTERVAL 30 MINUTE), NOW())')
        ->execute([':user_id' => $user['id'], ':email' => $email, ':hash' => $tokenHash]);
}

// Safe generic response. Real email delivery is intentionally not implemented in Prompt 12.
cmsJson(['success' => true, 'message' => 'If this email is registered, password reset instructions will be available.', 'demo_hint' => $user['password_hint'] ?? null]);
