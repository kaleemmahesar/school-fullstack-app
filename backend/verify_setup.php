<?php
/**
 * Setup Verification Script
 * 
 * This script verifies that all components of the backend are properly set up.
 */

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$response = [
    'status' => 'success',
    'message' => 'Setup verification completed',
    'checks' => []
];

// Check 1: Required files existence
$required_files = [
    'api.php',
    'config/database.php',
    'config/db_config.ini',
    'database/schema.sql'
];

$missing_files = [];
foreach ($required_files as $file) {
    $path = __DIR__ . '/' . $file;
    if (!file_exists($path)) {
        $missing_files[] = $file;
    }
}

if (empty($missing_files)) {
    $response['checks'][] = [
        'name' => 'Required files check',
        'status' => 'passed',
        'details' => 'All required files are present'
    ];
} else {
    $response['checks'][] = [
        'name' => 'Required files check',
        'status' => 'failed',
        'details' => 'Missing files: ' . implode(', ', $missing_files)
    ];
    $response['status'] = 'error';
}

// Check 2: Database configuration
$config_file = __DIR__ . '/config/db_config.ini';
if (file_exists($config_file)) {
    $config = parse_ini_file($config_file, true);
    if (isset($config['database'])) {
        $response['checks'][] = [
            'name' => 'Database configuration check',
            'status' => 'passed',
            'details' => 'Database configuration file is properly formatted'
        ];
    } else {
        $response['checks'][] = [
            'name' => 'Database configuration check',
            'status' => 'warning',
            'details' => 'Database configuration file exists but may be malformed'
        ];
    }
} else {
    $response['checks'][] = [
        'name' => 'Database configuration check',
        'status' => 'warning',
        'details' => 'Database configuration file not found, using defaults'
    ];
}

// Check 3: Database connection (if possible)
try {
    require_once 'config/database.php';
    $pdo = getDBConnection();
    
    // Check if we can query the database
    $stmt = $pdo->query("SELECT 1");
    $result = $stmt->fetch();
    
    if ($result) {
        $response['checks'][] = [
            'name' => 'Database connection check',
            'status' => 'passed',
            'details' => 'Successfully connected to the database'
        ];
    } else {
        $response['checks'][] = [
            'name' => 'Database connection check',
            'status' => 'warning',
            'details' => 'Database connection established but unable to execute query'
        ];
    }
} catch (Exception $e) {
    $response['checks'][] = [
        'name' => 'Database connection check',
        'status' => 'failed',
        'details' => 'Database connection failed: ' . $e->getMessage()
    ];
    $response['status'] = 'error';
}

// Check 4: API endpoints accessibility
$test_endpoints = ['students', 'classes', 'settings'];
$api_accessible = true;
$inaccessible_endpoints = [];

foreach ($test_endpoints as $endpoint) {
    // We can't actually make HTTP requests in this script, so we'll just check if the tables exist
    try {
        if (isset($pdo)) {
            $stmt = $pdo->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$endpoint]);
            $result = $stmt->fetch();
            
            if ($result) {
                // Table exists, that's good
            } else {
                $inaccessible_endpoints[] = $endpoint;
            }
        }
    } catch (Exception $e) {
        $inaccessible_endpoints[] = $endpoint;
    }
}

if (empty($inaccessible_endpoints)) {
    $response['checks'][] = [
        'name' => 'Database tables check',
        'status' => 'passed',
        'details' => 'Required database tables exist'
    ];
} else {
    $response['checks'][] = [
        'name' => 'Database tables check',
        'status' => 'warning',
        'details' => 'Some tables may be missing: ' . implode(', ', $inaccessible_endpoints)
    ];
}

// Check 5: PHP extensions
$required_extensions = ['pdo', 'pdo_mysql'];
$missing_extensions = [];

foreach ($required_extensions as $extension) {
    if (!extension_loaded($extension)) {
        $missing_extensions[] = $extension;
    }
}

if (empty($missing_extensions)) {
    $response['checks'][] = [
        'name' => 'PHP extensions check',
        'status' => 'passed',
        'details' => 'All required PHP extensions are loaded'
    ];
} else {
    $response['checks'][] = [
        'name' => 'PHP extensions check',
        'status' => 'failed',
        'details' => 'Missing PHP extensions: ' . implode(', ', $missing_extensions)
    ];
    $response['status'] = 'error';
}

// Add timestamp
$response['timestamp'] = date('Y-m-d H:i:s');

echo json_encode($response, JSON_PRETTY_PRINT);
?>