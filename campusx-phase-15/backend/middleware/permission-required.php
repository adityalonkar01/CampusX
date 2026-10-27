<?php
declare(strict_types=1);

require_once __DIR__ . '/role-required.php';

function requirePermission(string $permissionKey): array
{
    // Prepared extension point for Prompt 12. Full permission-table enforcement comes later.
    // For now, role checks are authoritative for the implemented endpoints.
    return requireAuthenticated();
}
