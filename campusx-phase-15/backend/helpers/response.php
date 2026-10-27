<?php
declare(strict_types=1);

function cmsJson(array $payload, int $statusCode = 200): never
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function cmsRequirePost(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        cmsJson(['success' => false, 'message' => 'POST request required.'], 405);
    }
}

function cmsReadInput(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (str_contains($contentType, 'application/json')) {
        $raw = file_get_contents('php://input');
        $json = json_decode($raw ?: '{}', true);
        return is_array($json) ? $json : [];
    }
    return $_POST;
}

function cmsSafeAuthFailure(): never
{
    cmsJson(['success' => false, 'message' => 'Invalid email, password, or portal selection.'], 401);
}
