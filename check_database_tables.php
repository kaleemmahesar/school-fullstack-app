<?php
require_once 'backend/config/database.php';

try {
    $pdo = getDBConnection();
    
    // Get all tables
    $stmt = $pdo->query('SHOW FULL TABLES');
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Tables in database:\n";
    foreach ($tables as $table) {
        echo "- " . $table . "\n";
    }
    
    echo "\nChecking marks table structure:\n";
    $stmt = $pdo->query('DESCRIBE marks');
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Columns in marks table:\n";
    foreach ($columns as $column) {
        echo "- " . $column['Field'] . " (" . $column['Type'] . ")\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>