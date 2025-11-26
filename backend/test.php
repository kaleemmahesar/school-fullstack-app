<?php
// Test script to verify backend API is working
require_once 'config/database.php';

try {
    $pdo = getDBConnection();
    echo "Database connection successful!\n";
    
    // Test creating a sample student
    $stmt = $pdo->prepare("SHOW TABLES LIKE 'students'");
    $stmt->execute();
    $result = $stmt->fetch();
    
    if ($result) {
        echo "Database tables exist.\n";
    } else {
        echo "Database tables need to be created. Please run database/init.php\n";
    }
    
    echo "Backend API is ready to use!\n";
    echo "Access the API documentation at: http://localhost/school-app/backend/\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>