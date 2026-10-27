<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validation.php';
require_once __DIR__ . '/../helpers/sanitizer.php';

cmsRequirePost();
$input = cmsReadInput();
$errors = cmsRequired($input, ['studentId', 'admissionNo', 'firstName', 'lastName', 'dob', 'gender', 'email', 'phone', 'username', 'password', 'confirmPassword']);
$email = cmsCleanEmail($input['email'] ?? '');
$username = cmsCleanEmail($input['username'] ?? '');
$password = (string) ($input['password'] ?? '');
$confirm = (string) ($input['confirmPassword'] ?? '');
$declaration = filter_var($input['declaration'] ?? false, FILTER_VALIDATE_BOOLEAN);

if ($email !== '' && !cmsValidEmail($email)) $errors[] = 'Valid email required.';
if ($username !== '' && !cmsValidEmail($username)) $errors[] = 'Valid username/email required.';
if (!cmsValidPhone((string) ($input['phone'] ?? ''))) $errors[] = 'Phone must contain at least 10 digits.';
if (!cmsPasswordMeetsMinimum($password)) $errors[] = 'Password must contain at least 8 characters.';
if ($password !== $confirm) $errors[] = 'Confirm password must match.';
if (!$declaration) $errors[] = 'Declaration checkbox must be checked.';
if ($errors) cmsJson(['success' => false, 'message' => $errors[0], 'errors' => $errors], 422);

$pdo = cmsDb();
$studentId = strtoupper(cmsCleanString($input['studentId'] ?? '', 40));
$admissionNo = strtoupper(cmsCleanString($input['admissionNo'] ?? '', 60));

$stmt = $pdo->prepare('SELECT id FROM students WHERE student_id = :student_id AND admission_number = :admission_number LIMIT 1');
$stmt->execute([':student_id' => $studentId, ':admission_number' => $admissionNo]);
$student = $stmt->fetch();
if (!$student) {
    cmsJson(['success' => false, 'message' => 'Student master record not found. Please contact Institute Administration.'], 404);
}

$stmt = $pdo->prepare('SELECT id, status FROM student_account_requests WHERE (student_id = :student_id OR admission_number = :admission_number OR LOWER(email) = LOWER(:email)) AND status IN (\'pending\',\'approved\',\'active\',\'suspended\') LIMIT 1');
$stmt->execute([':student_id' => $studentId, ':admission_number' => $admissionNo, ':email' => $username]);
if ($stmt->fetch()) {
    cmsJson(['success' => false, 'message' => 'A pending or active student account request already exists for this student.'], 409);
}

$requestId = 'SRQ' . date('ymdHis') . random_int(100, 999);
$sql = 'INSERT INTO student_account_requests
    (request_id, student_id, admission_number, first_name, middle_name, last_name, dob, gender, email, phone, password_hash, status, created_at, updated_at)
    VALUES (:request_id, :student_id, :admission_number, :first_name, :middle_name, :last_name, :dob, :gender, :email, :phone, :password_hash, \'pending\', NOW(), NOW())';
$pdo->prepare($sql)->execute([
    ':request_id' => $requestId,
    ':student_id' => $studentId,
    ':admission_number' => $admissionNo,
    ':first_name' => cmsCleanString($input['firstName'] ?? '', 60),
    ':middle_name' => cmsCleanString($input['middleName'] ?? '', 60),
    ':last_name' => cmsCleanString($input['lastName'] ?? '', 60),
    ':dob' => cmsCleanString($input['dob'] ?? '', 20),
    ':gender' => cmsCleanString($input['gender'] ?? '', 30),
    ':email' => $username,
    ':phone' => cmsCleanString($input['phone'] ?? '', 20),
    ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
]);

cmsJson(['success' => true, 'message' => 'Registration request submitted. Your login will activate after Institute Admin approval.', 'request_id' => $requestId]);
