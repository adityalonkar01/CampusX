<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../helpers/response.php';

cmsStartSecureSession();
if (!empty($_SESSION['user_id']) && !empty($_SESSION['role_key'])) {
    cmsJson([
        'authenticated' => true,
        'role' => $_SESSION['role_key'],
        'name' => $_SESSION['full_name'] ?? '',
        'email' => $_SESSION['email'] ?? '',
    ]);
}

cmsJson(['authenticated' => false]);
