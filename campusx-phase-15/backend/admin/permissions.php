<?php
declare(strict_types=1);

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/role-required.php';

requireRole(['SUPER_ADMIN', 'INSTITUTE_ADMIN']);
$permissions = [
    'student.create' => 'INSTITUTE_ADMIN',
    'faculty.create' => 'INSTITUTE_ADMIN',
    'course.create' => 'INSTITUTE_ADMIN',
    'program.create' => 'INSTITUTE_ADMIN',
    'department.create' => 'INSTITUTE_ADMIN',
    'subject.create' => 'INSTITUTE_ADMIN',
    'class.create' => 'INSTITUTE_ADMIN',
    'audit.view' => 'SUPER_ADMIN',
];
cmsJson(['success' => true, 'permissions' => $permissions, 'message' => 'Permission map scaffold for future RBAC expansion.']);
