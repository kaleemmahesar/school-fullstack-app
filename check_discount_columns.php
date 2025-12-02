<?php
try {
    $pdo = new PDO("mysql:host=localhost;dbname=school_management_system", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if discount columns exist in fees_history table
    $stmt = $pdo->query("SHOW COLUMNS FROM fees_history LIKE 'discountAmount'");
    $discountAmountColumn = $stmt->fetch();
    
    $stmt = $pdo->query("SHOW COLUMNS FROM fees_history LIKE 'discountReason'");
    $discountReasonColumn = $stmt->fetch();
    
    $stmt = $pdo->query("SHOW COLUMNS FROM fees_history LIKE 'discountedAmount'");
    $discountedAmountColumn = $stmt->fetch();
    
    if ($discountAmountColumn && $discountReasonColumn && $discountedAmountColumn) {
        echo "All discount columns already exist in fees_history table.\n";
    } else {
        echo "Missing discount columns. Need to add them.\n";
        
        // Add discount columns if they don't exist
        if (!$discountAmountColumn) {
            $pdo->exec("ALTER TABLE fees_history ADD COLUMN discountAmount DECIMAL(10, 2) DEFAULT 0");
            echo "Added discountAmount column.\n";
        }
        
        if (!$discountReasonColumn) {
            $pdo->exec("ALTER TABLE fees_history ADD COLUMN discountReason VARCHAR(255) DEFAULT ''");
            echo "Added discountReason column.\n";
        }
        
        if (!$discountedAmountColumn) {
            $pdo->exec("ALTER TABLE fees_history ADD COLUMN discountedAmount DECIMAL(10, 2) DEFAULT 0");
            echo "Added discountedAmount column.\n";
        }
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>