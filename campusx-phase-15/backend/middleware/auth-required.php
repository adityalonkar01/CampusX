<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../helpers/response.php';

function requireAuthenticated(): array
{
    cmsStartSecureSession();
    if (empty($_SESSION['user_id']) || empty($_SESSION['role_key'])) {
        cmsJson(['success' => false, 'authenticated' => false, 'message' => 'Authentication required.'], 401);
    }
    return $_SESSION;
}
