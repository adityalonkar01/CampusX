<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/sanitizer.php';
require_once __DIR__ . '/../middleware/auth-required.php';

cmsRequirePost();
$session = requireAuthenticated();
if (($session['role_key'] ?? '') === 'STUDENT_USER') {
    cmsJson(['success' => false, 'message' => 'Password hints are only configured for administrator accounts in this phase.'], 403);
}
$input = cmsReadInput();
$hint = cmsCleanString($input['password_hint'] ?? $input['hint'] ?? '', 180);
if ($hint === '') {
    cmsJson(['success' => false, 'message' => 'Password hint is required.'], 422);
}

$pdo = cmsDb();
$pdo->prepare('UPDATE users SET password_hint = :hint, updated_at = NOW() WHERE id = :id')->execute([':hint' => $hint, ':id' => $session['user_id']]);
cmsJson(['success' => true, 'message' => 'Password hint updated successfully.']);
