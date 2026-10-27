<?php
declare(strict_types=1);

function cmsInputString(array $input, string $key): string
{
    return trim((string) ($input[$key] ?? ''));
}

function cmsValidEmail(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function cmsValidPhone(string $phone): bool
{
    return strlen(preg_replace('/\D+/', '', $phone)) >= 10;
}

function cmsRequired(array $input, array $keys): array
{
    $errors = [];
    foreach ($keys as $key) {
        if (trim((string) ($input[$key] ?? '')) === '') {
            $errors[] = "{$key} is required.";
        }
    }
    return $errors;
}

function cmsPasswordMeetsMinimum(string $password): bool
{
    return strlen($password) >= 8;
}
