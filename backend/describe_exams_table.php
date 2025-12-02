<?php
// Script to describe the exams table structure

require_once __DIR__ . '/config/database.php';

try {
    $pdo = getDBConnection();
    
    // Describe the exams table
    $stmt = $pdo->query("DESCRIBE exams");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Exams Table Structure:\n";
    echo "=====================\n";
    foreach ($columns as $column) {
        echo "{$column['Field']} {$column['Type']} ";
        if ($column['Null'] === 'NO') {
            echo "NOT NULL ";
        }
        if ($column['Key'] === 'PRI') {
            echo "PRIMARY KEY ";
        }
        if ($column['Default'] !== null) {
            echo "DEFAULT {$column['Default']} ";
        }
        echo "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>