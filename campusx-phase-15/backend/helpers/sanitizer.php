<?php
declare(strict_types=1);

function cmsCleanString(?string $value, int $max = 255): string
{
    $value = trim((string) $value);
    $value = preg_replace('/\s+/', ' ', $value) ?? '';
    return mb_substr($value, 0, $max);
}

function cmsCleanEmail(?string $value): string
{
    return mb_strtolower(cmsCleanString($value, 180));
}

function cmsEscape(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
