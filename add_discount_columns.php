<?php
require_once 'backend/config/database.php';

try {
    $pdo = getDBConnection();
    
    // Add discountAmount column if it doesn't exist
    $stmt = $pdo->query("SHOW COLUMNS FROM fees_history LIKE 'discountAmount'");
    $column = $stmt->fetch();
    
    if (!$column) {
        $pdo->exec("ALTER TABLE fees_history ADD COLUMN discountAmount DECIMAL(10, 2) DEFAULT 0");
        echo "Added discountAmount column\n";
    } else {
        echo "discountAmount column already exists\n";
    }
    
    // Add discountReason column if it doesn't exist
    $stmt = $pdo->query("SHOW COLUMNS FROM fees_history LIKE 'discountReason'");
    $column = $stmt->fetch();
    
    if (!$column) {
        $pdo->exec("ALTER TABLE fees_history ADD COLUMN discountReason VARCHAR(255) DEFAULT ''");
        echo "Added discountReason column\n";
    } else {
        echo "discountReason column already exists\n";
    }
    
    // Add discountedAmount column if it doesn't exist
    $stmt = $pdo->query("SHOW COLUMNS FROM fees_history LIKE 'discountedAmount'");
    $column = $stmt->fetch();
    
    if (!$column) {
        $pdo->exec("ALTER TABLE fees_history ADD COLUMN discountedAmount DECIMAL(10, 2) DEFAULT 0");
        echo "Added discountedAmount column\n";
    } else {
        echo "discountedAmount column already exists\n";
    }
    
    echo "All discount columns checked/added successfully\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>