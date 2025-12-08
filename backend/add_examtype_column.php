<?php
require_once 'config/database.php';

try {
    $pdo = getDBConnection();
    $pdo->exec('ALTER TABLE marks ADD COLUMN examType VARCHAR(50)');
    echo "Column examType added successfully\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>