<?php
require_once 'config/database.php';

try {
    $pdo = getDBConnection();
    
    echo "School Management System - Database Structure\n";
    echo "============================================\n\n";
    
    // Get all tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tables as $table) {
        echo "Table: $table\n";
        echo str_repeat("-", 40) . "\n";
        
        // Get table structure
        $stmt = $pdo->prepare("DESCRIBE $table");
        $stmt->execute();
        $columns = $stmt->fetchAll();
        
        foreach ($columns as $column) {
            $null = $column['Null'] == 'YES' ? 'NULL' : 'NOT NULL';
            $key = $column['Key'] ? $column['Key'] : '';
            $default = $column['Default'] !== null ? "DEFAULT " . $column['Default'] : '';
            echo sprintf("%-20s %-15s %-10s %-10s %s\n", 
                $column['Field'], 
                $column['Type'], 
                $null, 
                $key, 
                $default
            );
        }
        echo "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>