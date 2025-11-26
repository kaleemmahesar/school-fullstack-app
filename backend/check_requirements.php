<?php
/**
 * Requirements Check Script
 * 
 * This script checks if all required PHP extensions and settings are available.
 */

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$response = [
    'status' => 'success',
    'message' => 'Requirements check completed',
    'requirements' => []
];

// Check PHP version
$min_php_version = '7.4.0';
$current_php_version = phpversion();
$php_version_ok = version_compare($current_php_version, $min_php_version, '>=');

$response['requirements'][] = [
    'name' => 'PHP Version',
    'required' => $min_php_version,
    'current' => $current_php_version,
    'status' => $php_version_ok ? 'ok' : 'error',
    'message' => $php_version_ok ? 'PHP version is sufficient' : 'PHP version is too old'
];

if (!$php_version_ok) {
    $response['status'] = 'error';
}

// Check required extensions
$required_extensions = [
    'pdo' => 'PDO (PHP Data Objects) for database access',
    'pdo_mysql' => 'PDO MySQL driver for MySQL database access',
    'json' => 'JSON extension for JSON encoding/decoding',
    'curl' => 'cURL extension (optional, for external API calls)'
];

foreach ($required_extensions as $extension => $description) {
    $loaded = extension_loaded($extension);
    $response['requirements'][] = [
        'name' => $extension,
        'description' => $description,
        'status' => $loaded ? 'ok' : 'missing',
        'message' => $loaded ? 'Extension is loaded' : 'Extension is not loaded'
    ];
    
    // Mark as error only for critical extensions
    if (!$loaded && in_array($extension, ['pdo', 'pdo_mysql', 'json'])) {
        $response['status'] = 'error';
    }
}

// Check MySQL settings
$mysql_settings = [
    'pdo_mysql.default_socket' => 'MySQL socket path',
    'mysql.default_host' => 'Default MySQL host',
    'mysql.default_user' => 'Default MySQL user'
];

foreach ($mysql_settings as $setting => $description) {
    $value = ini_get($setting);
    $response['requirements'][] = [
        'name' => $setting,
        'description' => $description,
        'value' => $value ?: 'Not set',
        'status' => 'info',
        'message' => 'Current value: ' . ($value ?: 'Not set')
    ];
}

// Check file permissions
$writable_dirs = [
    'config' => 'Configuration directory',
    'database' => 'Database directory'
];

foreach ($writable_dirs as $dir => $description) {
    $path = __DIR__ . '/' . $dir;
    $writable = is_writable($path);
    $response['requirements'][] = [
        'name' => $dir . ' directory',
        'description' => $description,
        'status' => $writable ? 'ok' : 'warning',
        'message' => $writable ? 'Directory is writable' : 'Directory is not writable'
    ];
}

// Add timestamp
$response['timestamp'] = date('Y-m-d H:i:s');

echo json_encode($response, JSON_PRETTY_PRINT);
?>