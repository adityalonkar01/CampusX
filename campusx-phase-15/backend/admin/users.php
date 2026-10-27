<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/role-required.php';

requireRole(['SUPER_ADMIN', 'INSTITUTE_ADMIN']);
$pdo = cmsDb();
$stmt = $pdo->query('SELECT u.id, u.full_name, u.email, u.phone, u.status, u.last_login_at, r.role_key, r.role_name FROM users u INNER JOIN roles r ON r.id = u.role_id ORDER BY r.role_key, u.full_name');
cmsJson(['success' => true, 'users' => $stmt->fetchAll()]);
