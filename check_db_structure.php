<?php
try {
    $pdo = new PDO("mysql:host=localhost;dbname=school_management_system", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== FEES_HISTORY TABLE STRUCTURE ===\n";
    $stmt = $pdo->query("DESCRIBE fees_history");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        echo $column['Field'] . " " . $column['Type'] . " " . ($column['Null'] === 'YES' ? 'NULL' : 'NOT NULL');
        if ($column['Default'] !== null) {
            echo " DEFAULT " . $column['Default'];
        }
        echo "\n";
    }
    
    echo "\n=== CHECKING FOR DISCOUNT COLUMNS ===\n";
    $hasDiscountAmount = false;
    $hasDiscountReason = false;
    $hasDiscountedAmount = false;
    
    foreach ($columns as $column) {
        if ($column['Field'] === 'discountAmount') {
            $hasDiscountAmount = true;
            echo "Found discountAmount column\n";
        }
        if ($column['Field'] === 'discountReason') {
            $hasDiscountReason = true;
            echo "Found discountReason column\n";
        }
        if ($column['Field'] === 'discountedAmount') {
            $hasDiscountedAmount = true;
            echo "Found discountedAmount column\n";
        }
    }
    
    if (!$hasDiscountAmount || !$hasDiscountReason || !$hasDiscountedAmount) {
        echo "Missing discount columns. Need to add them.\n";
    } else {
        echo "All discount columns present.\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>