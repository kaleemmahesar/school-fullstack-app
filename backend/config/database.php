<?php
// Database configuration
$config_file = __DIR__ . '/db_config.ini';

// Check if constants are already defined
if (!defined('DB_HOST')) {
    define('DB_HOST', 'localhost');
}
if (!defined('DB_USER')) {
    define('DB_USER', 'root');
}
if (!defined('DB_PASS')) {
    define('DB_PASS', '');
}
if (!defined('DB_NAME')) {
    define('DB_NAME', 'school_management_system');
}

// Load configuration from ini file if it exists
if (file_exists($config_file)) {
    $config = parse_ini_file($config_file, true);
    if (isset($config['database'])) {
        // Only define if not already defined
        if (!defined('DB_HOST')) {
            define('DB_HOST', $config['database']['host'] ?? 'localhost');
        }
        if (!defined('DB_USER')) {
            define('DB_USER', $config['database']['username'] ?? 'root');
        }
        if (!defined('DB_PASS')) {
            define('DB_PASS', $config['database']['password'] ?? '');
        }
        if (!defined('DB_NAME')) {
            define('DB_NAME', $config['database']['database'] ?? 'school_management_system');
        }
    }
}

// Create connection
function getDBConnection() {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch(PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
}
?>