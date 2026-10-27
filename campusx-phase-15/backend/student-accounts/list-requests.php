<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validation.php';
require_once __DIR__ . '/../helpers/sanitizer.php';
require_once __DIR__ . '/../helpers/activity-log.php';
require_once __DIR__ . '/../middleware/role-required.php';

requireRole('INSTITUTE_ADMIN');
$pdo = cmsDb();
$stmt = $pdo->query('SELECT id, request_id, student_id, admission_number, first_name, middle_name, last_name, dob, gender, email, phone, status, reviewed_by, reviewed_at, created_at, updated_at FROM student_account_requests ORDER BY created_at DESC');
cmsJson(['success' => true, 'requests' => $stmt->fetchAll()]);
