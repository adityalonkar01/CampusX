<?php
declare(strict_types=1);

require_once __DIR__ . '/../middleware/auth-required.php';
require_once __DIR__ . '/../helpers/response.php';

$session = requireAuthenticated();
cmsJson([
    'success' => true,
    'user' => [
        'id' => $session['user_id'],
        'role_key' => $session['role_key'],
        'full_name' => $session['full_name'] ?? '',
        'email' => $session['email'] ?? '',
    ],
]);
