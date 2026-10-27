<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/role-required.php';

requireRole(['SUPER_ADMIN', 'INSTITUTE_ADMIN']);
$pdo = cmsDb();
$stmt = $pdo->query('SELECT id, role_key, role_name, description FROM roles ORDER BY id');
cmsJson(['success' => true, 'roles' => $stmt->fetchAll()]);
