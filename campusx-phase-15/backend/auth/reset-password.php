<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validation.php';

cmsRequirePost();
$input = cmsReadInput();
$token = trim((string) ($input['token'] ?? ''));
$new = (string) ($input['new_password'] ?? $input['newPassword'] ?? '');
$confirm = (string) ($input['confirm_password'] ?? $input['confirmPassword'] ?? '');

if ($token === '' || $new === '' || $confirm === '') {
    cmsJson(['success' => false, 'message' => 'Token and new password fields are required.'], 422);
}
if (!cmsPasswordMeetsMinimum($new)) {
    cmsJson(['success' => false, 'message' => 'New password must contain at least 8 characters.'], 422);
}
if ($new !== $confirm) {
    cmsJson(['success' => false, 'message' => 'New password and confirm password do not match.'], 422);
}

$pdo = cmsDb();
$tokenHash = hash('sha256', $token);
$stmt = $pdo->prepare('SELECT * FROM password_reset_requests WHERE reset_token_hash = :hash AND used_at IS NULL AND expires_at > NOW() LIMIT 1');
$stmt->execute([':hash' => $tokenHash]);
$request = $stmt->fetch();
if (!$request) {
    cmsJson(['success' => false, 'message' => 'Invalid or expired reset request.'], 400);
}

$pdo->beginTransaction();
$pdo->prepare('UPDATE users SET password_hash = :hash, updated_at = NOW() WHERE id = :id')->execute([':hash' => password_hash($new, PASSWORD_DEFAULT), ':id' => $request['user_id']]);
$pdo->prepare('UPDATE password_reset_requests SET used_at = NOW() WHERE id = :id')->execute([':id' => $request['id']]);
$pdo->commit();

cmsJson(['success' => true, 'message' => 'Password reset completed.']);
