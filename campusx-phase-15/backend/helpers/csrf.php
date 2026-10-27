<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/security.php';

function cmsCsrfToken(): string
{
    cmsStartSecureSession();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function cmsVerifyCsrf(?string $token): bool
{
    cmsStartSecureSession();
    return isset($_SESSION['csrf_token']) && is_string($token) && hash_equals($_SESSION['csrf_token'], $token);
}
