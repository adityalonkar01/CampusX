<?php
declare(strict_types=1);

require_once __DIR__ . '/auth-required.php';

function requireRole(string|array $requiredRoles): array
{
    $session = requireAuthenticated();
    $allowed = array_map('strtoupper', (array) $requiredRoles);
    $current = strtoupper((string) ($session['role_key'] ?? ''));
    if (!in_array($current, $allowed, true)) {
        cmsJson(['success' => false, 'message' => 'You do not have permission to perform this action.'], 403);
    }
    return $session;
}
