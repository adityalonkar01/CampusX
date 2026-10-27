<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/sanitizer.php';
require_once __DIR__ . '/../middleware/auth-required.php';

cmsRequirePost();
$session = requireAuthenticated();
$input = cmsReadInput();
$fullName = cmsCleanString($input['full_name'] ?? $input['fullName'] ?? '', 120);
$phone = cmsCleanString($input['phone'] ?? '', 20);

if ($fullName === '') {
    cmsJson(['success' => false, 'message' => 'Full name is required.'], 422);
}

$pdo = cmsDb();
if (($session['role_key'] ?? '') === 'STUDENT_USER') {
    cmsJson(['success' => false, 'message' => 'Student profile updates will be handled by a later student module endpoint.'], 501);
}

$pdo->prepare('UPDATE users SET full_name = :name, phone = :phone, updated_at = NOW() WHERE id = :id')->execute([':name' => $fullName, ':phone' => $phone, ':id' => $session['user_id']]);
$_SESSION['full_name'] = $fullName;
cmsJson(['success' => true, 'message' => 'Profile updated successfully.']);
