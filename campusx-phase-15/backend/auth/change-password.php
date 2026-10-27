<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validation.php';
require_once __DIR__ . '/../helpers/sanitizer.php';
require_once __DIR__ . '/../helpers/activity-log.php';
require_once __DIR__ . '/../middleware/auth-required.php';

cmsRequirePost();
$session = requireAuthenticated();
$input = cmsReadInput();
$current = (string) ($input['current_password'] ?? $input['currentPassword'] ?? '');
$new = (string) ($input['new_password'] ?? $input['newPassword'] ?? '');
$confirm = (string) ($input['confirm_password'] ?? $input['confirmPassword'] ?? '');
$hint = cmsCleanString($input['password_hint'] ?? $input['hint'] ?? '', 180);

if ($current === '' || $new === '' || $confirm === '') {
    cmsJson(['success' => false, 'message' => 'Current password, new password and confirmation are required.'], 422);
}
if (!cmsPasswordMeetsMinimum($new)) {
    cmsJson(['success' => false, 'message' => 'New password must contain at least 8 characters.'], 422);
}
if ($new !== $confirm) {
    cmsJson(['success' => false, 'message' => 'New password and confirm password do not match.'], 422);
}

$pdo = cmsDb();
$role = (string) $session['role_key'];
$id = (int) $session['user_id'];

if ($role === 'STUDENT_USER') {
    $stmt = $pdo->prepare('SELECT id, password_hash FROM student_accounts WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $account = $stmt->fetch();
    if (!$account || !password_verify($current, (string) $account['password_hash'])) {
        cmsJson(['success' => false, 'message' => 'Current password is incorrect.'], 403);
    }
    $pdo->prepare('UPDATE student_accounts SET password_hash = :hash, updated_at = NOW() WHERE id = :id')->execute([':hash' => password_hash($new, PASSWORD_DEFAULT), ':id' => $id]);
    cmsLogActivity($pdo, ['module' => 'Student Account', 'action' => 'PASSWORD_CHANGE', 'record_type' => 'student_account', 'record_id' => (string) $id, 'description' => 'Student account password changed.']);
    cmsJson(['success' => true, 'message' => 'Password changed successfully.']);
}

$stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE id = :id LIMIT 1');
$stmt->execute([':id' => $id]);
$user = $stmt->fetch();
if (!$user || !password_verify($current, (string) $user['password_hash'])) {
    cmsJson(['success' => false, 'message' => 'Current password is incorrect.'], 403);
}

$pdo->prepare('UPDATE users SET password_hash = :hash, password_hint = :hint, updated_at = NOW() WHERE id = :id')->execute([
    ':hash' => password_hash($new, PASSWORD_DEFAULT),
    ':hint' => $hint !== '' ? $hint : null,
    ':id' => $id,
]);
cmsLogActivity($pdo, ['module' => 'User Account', 'action' => 'PASSWORD_CHANGE', 'record_type' => 'user', 'record_id' => (string) $id, 'description' => 'Administrator password changed.']);

cmsJson(['success' => true, 'message' => 'Password changed successfully.']);
