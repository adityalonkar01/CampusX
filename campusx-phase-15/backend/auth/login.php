<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validation.php';
require_once __DIR__ . '/../helpers/sanitizer.php';
require_once __DIR__ . '/../helpers/activity-log.php';

cmsRequirePost();
$input = cmsReadInput();
$email = cmsCleanEmail($input['username'] ?? $input['email'] ?? '');
$password = (string) ($input['password'] ?? '');
$portal = cmsNormalizeRole($input['portal'] ?? '');

if ($email === '' || $password === '' || $portal === '' || !cmsValidEmail($email) || !in_array($portal, cmsValidRoleKeys(), true)) {
    cmsSafeAuthFailure();
}

$redirects = cmsPortalRedirectMap();
$pdo = cmsDb();

if ($portal === 'STUDENT_USER') {
    $stmt = $pdo->prepare('SELECT sa.*, s.student_id, s.first_name, s.middle_name, s.last_name, s.admission_number
        FROM student_accounts sa
        LEFT JOIN students s ON s.id = sa.student_record_id
        WHERE LOWER(sa.email) = LOWER(:email)
        LIMIT 1');
    $stmt->execute([':email' => $email]);
    $account = $stmt->fetch();

    if (!$account || !password_verify($password, (string) $account['password_hash'])) {
        cmsSafeAuthFailure();
    }

    $status = strtolower((string) $account['status']);
    if ($status === 'pending') {
        cmsJson(['success' => false, 'message' => 'Your student account request is still pending Institute Admin approval.'], 403);
    }
    if ($status === 'rejected') {
        cmsJson(['success' => false, 'message' => 'Your student account request was rejected. Please contact Student Administration or Institute Administration.'], 403);
    }
    if ($status === 'suspended') {
        cmsJson(['success' => false, 'message' => 'Your student account is currently suspended. Please contact the institute office.'], 403);
    }
    if ($status !== 'active') {
        cmsJson(['success' => false, 'message' => 'Student Portal account is not active.'], 403);
    }

    cmsStartSecureSession();
    session_regenerate_id(true);
    $fullName = trim(($account['first_name'] ?? '') . ' ' . ($account['middle_name'] ?? '') . ' ' . ($account['last_name'] ?? '')) ?: $email;
    $_SESSION['user_id'] = (int) $account['id'];
    $_SESSION['student_account_id'] = (int) $account['id'];
    $_SESSION['student_record_id'] = $account['student_record_id'] !== null ? (int) $account['student_record_id'] : null;
    $_SESSION['role_key'] = 'STUDENT_USER';
    $_SESSION['full_name'] = $fullName;
    $_SESSION['email'] = $email;

    $pdo->prepare('UPDATE student_accounts SET last_login_at = NOW(), updated_at = NOW() WHERE id = :id')->execute([':id' => $account['id']]);
    cmsLogActivity($pdo, ['role_key' => 'STUDENT_USER', 'module' => 'Authentication', 'action' => 'LOGIN', 'record_type' => 'student_account', 'record_id' => (string) $account['id'], 'description' => 'Student Portal login successful.']);
    cmsJson(['success' => true, 'redirect' => $redirects['STUDENT_USER'], 'message' => 'Login successful.']);
}

$stmt = $pdo->prepare('SELECT u.id, u.full_name, u.email, u.password_hash, u.status, r.role_key
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    WHERE LOWER(u.email) = LOWER(:email)
    LIMIT 1');
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, (string) $user['password_hash'])) {
    cmsSafeAuthFailure();
}
if (strtolower((string) $user['status']) !== 'active') {
    cmsJson(['success' => false, 'message' => 'Account is not active. Contact the institute administrator.'], 403);
}
if (cmsNormalizeRole($user['role_key'] ?? '') !== $portal) {
    cmsSafeAuthFailure();
}

cmsStartSecureSession();
session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['role_key'] = $portal;
$_SESSION['full_name'] = (string) $user['full_name'];
$_SESSION['email'] = (string) $user['email'];

$pdo->prepare('UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = :id')->execute([':id' => $user['id']]);
cmsLogActivity($pdo, ['role_key' => $portal, 'module' => 'Authentication', 'action' => 'LOGIN', 'record_type' => 'user', 'record_id' => (string) $user['id'], 'description' => 'Administrator login successful.']);

cmsJson(['success' => true, 'redirect' => $redirects[$portal], 'message' => 'Login successful.']);
