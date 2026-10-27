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

$stmt = $pdo->prepare('SELECT id FROM students WHERE student_id = :student_id AND admission_number = :admission_number LIMIT 1');
$stmt->execute([':student_id' => $request['student_id'], ':admission_number' => $request['admission_number']]);
$student = $stmt->fetch();
if (!$student) cmsJson(['success' => false, 'message' => 'Student master record not found. Approval blocked until Institute Admin creates the student record.'], 404);

$pdo->beginTransaction();
$pdo->prepare('UPDATE student_account_requests SET status = \'approved\', reviewed_by = :reviewed_by, reviewed_at = NOW(), updated_at = NOW() WHERE id = :id')
    ->execute([':reviewed_by' => $session['user_id'], ':id' => $request['id']]);

$sql = 'INSERT INTO student_accounts (student_record_id, request_id, email, password_hash, status, approved_by, approved_at, created_at, updated_at)
        VALUES (:student_record_id, :request_id, :email, :password_hash, \'active\', :approved_by, NOW(), NOW(), NOW())
        ON DUPLICATE KEY UPDATE student_record_id = VALUES(student_record_id), password_hash = VALUES(password_hash), status = \'active\', approved_by = VALUES(approved_by), approved_at = NOW(), updated_at = NOW()';
$pdo->prepare($sql)->execute([
    ':student_record_id' => $student['id'],
    ':request_id' => $request['request_id'],
    ':email' => $request['email'],
    ':password_hash' => $request['password_hash'],
    ':approved_by' => $session['user_id'],
]);

cmsLogActivity($pdo, ['module' => 'Student Login Access', 'action' => 'APPROVE', 'record_type' => 'student_account_request', 'record_id' => $request['request_id'], 'description' => 'Approved student portal login access.']);
$pdo->commit();

cmsJson(['success' => true, 'message' => 'Student login access approved.']);
