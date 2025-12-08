<?php
// Test exams API to verify data structure

// Include the database configuration
require_once __DIR__ . '/config/database.php';

try {
    $pdo = getDBConnection();
    
    // Fetch all exams
    $stmt = $pdo->query("SELECT * FROM exams WHERE class='Class 2'");
    $exams = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($exams) . " Class 2 exams\n";
    
    foreach ($exams as $exam) {
        echo "ID: " . $exam['id'] . "\n";
        echo "Name: " . $exam['name'] . "\n";
        echo "Exam Type: " . $exam['examType'] . "\n";
        echo "Class: " . $exam['class'] . "\n";
        echo "Start Date: " . $exam['startDate'] . "\n";
        echo "End Date: " . $exam['endDate'] . "\n";
        echo "---\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>