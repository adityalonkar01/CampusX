<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/security.php';

function cmsLogActivity(PDO $pdo, array $data): void
{
    $sql = 'INSERT INTO activity_logs
        (user_id, role_key, module, action, record_type, record_id, description, ip_address, user_agent, created_at)
        VALUES (:user_id, :role_key, :module, :action, :record_type, :record_id, :description, :ip_address, :user_agent, NOW())';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':user_id' => $data['user_id'] ?? ($_SESSION['user_id'] ?? null),
        ':role_key' => $data['role_key'] ?? ($_SESSION['role_key'] ?? 'SYSTEM'),
        ':module' => $data['module'] ?? 'System',
        ':action' => $data['action'] ?? 'VIEW',
        ':record_type' => $data['record_type'] ?? null,
        ':record_id' => $data['record_id'] ?? null,
        ':description' => $data['description'] ?? null,
        ':ip_address' => cmsClientIp(),
        ':user_agent' => cmsUserAgent(),
    ]);
}
