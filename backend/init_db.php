<?php
/**
 * Database Initialization Script
 * 
 * This script can be used to initialize the database with sample data
 * or reset the database to its initial state.
 */

require_once 'config/database.php';

try {
    $pdo = getDBConnection();
    
    // Check if tables exist by querying the students table
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM students");
    $stmt->execute();
    $count = $stmt->fetchColumn();
    
    echo "Database connection successful!\n";
    echo "Found $count students in the database.\n\n";
    
    // If no students exist, we can initialize with sample data
    if ($count == 0) {
        echo "No students found. You can initialize the database with sample data by importing the schema.sql file.\n";
        echo "Use phpMyAdmin to import the database/schema.sql file.\n";
    } else {
        echo "Database already contains data. No initialization needed.\n";
    }
    
    // Display database information
    echo "\nDatabase Information:\n";
    echo "====================\n";
    echo "Host: " . DB_HOST . "\n";
    echo "Database: " . DB_NAME . "\n";
    echo "Username: " . DB_USER . "\n";
    
    // List all tables
    echo "\nAvailable Tables:\n";
    echo "=================\n";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tables as $table) {
        echo "- $table\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Please make sure the database is properly configured and the schema.sql file has been imported.\n";
}
?>