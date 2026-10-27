<?php
declare(strict_types=1);

const CMS_APP_NAME = 'CampusX College Management System';
const CMS_APP_ENV = 'development';
const CMS_SESSION_NAME = 'campusx_session';
const CMS_DEFAULT_TIMEZONE = 'Asia/Kolkata';

date_default_timezone_set(CMS_DEFAULT_TIMEZONE);

function cmsPortalRedirectMap(): array
{
    return [
        'SUPER_ADMIN' => 'super-admin/dashboard.html',
        'INSTITUTE_ADMIN' => 'admin/dashboard.html',
        'STUDENT_ADMIN' => 'student/dashboard.html',
        'FACULTY_ADMIN' => 'faculty/dashboard.html',
        'CR_ADMIN' => 'cr/dashboard.html',
        'COUNCIL_ADMIN' => 'council/dashboard.html',
        'CRC_ADMIN' => 'crc/dashboard.html',
        'STUDENT_USER' => 'student-portal/dashboard.html',
    ];
}

function cmsValidRoleKeys(): array
{
    return array_keys(cmsPortalRedirectMap());
}

function cmsNormalizeRole(?string $role): string
{
    return strtoupper(trim((string) $role));
}

function cmsProjectRootUrl(): string
{
    // Local-development helper. In production, set APP_BASE_URL through the web server environment.
    $base = getenv('APP_BASE_URL');
    return $base !== false && trim($base) !== '' ? rtrim($base, '/') : '';
}
