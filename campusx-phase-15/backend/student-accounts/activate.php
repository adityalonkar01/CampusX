<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validation.php';
require_once __DIR__ . '/../helpers/sanitizer.php';
require_once __DIR__ . '/../helpers/activity-log.php';
require_once __DIR__ . '/../middleware/role-required.php';

cmsRequirePost();
$session = requireRole('INSTITUTE_ADMIN');
$input = cmsReadInput();
$requestId = cmsCleanString($input['request_id'] ?? $input['requestId'] ?? '', 80);
if ($requestId === '') cmsJson(['success' => false, 'message' => 'Request ID is required.'], 422);
$pdo = cmsDb();
$stmt = $pdo->prepare('SELECT * FROM student_account_requests WHERE request_id = :request_id LIMIT 1');
$stmt->execute([':request_id' => $requestId]);
$request = $stmt->fetch();
if (!$request) cmsJson(['success' => false, 'message' => 'Student account request not found.'], 404);
$pdo->beginTransaction();
$pdo->prepare('UPDATE student_account_requests SET status = :status, reviewed_by = :reviewed_by, reviewed_at = NOW(), updated_at = NOW() WHERE id = :id')
    ->execute([':status' => 'approved', ':reviewed_by' => $session['user_id'], ':id' => $request['id']]);
$accountStatus = 'active';
$pdo->prepare('UPDATE student_accounts SET status = :status, updated_at = NOW() WHERE request_id = :request_id')->execute([':status' => $accountStatus, ':request_id' => $request['request_id']]);
cmsLogActivity($pdo, ['module' => 'Student Login Access', 'action' => 'ACTIVATE', 'record_type' => 'student_account_request', 'record_id' => $request['request_id'], 'description' => 'Activate student portal access request.']);
$pdo->commit();
cmsJson(['success' => true, 'message' => 'Student login access updated successfully.']);
