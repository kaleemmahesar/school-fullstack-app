<?php
// Script to check exams data

require_once __DIR__ . '/config/database.php';

try {
    $pdo = getDBConnection();
    
    // Get all exams
    $stmt = $pdo->query("SELECT * FROM exams");
    $exams = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Exams in database:\n";
    echo "=================\n";
    foreach ($exams as $exam) {
        echo "ID: " . $exam['id'] . "\n";
        echo "Name: " . $exam['name'] . "\n";
        echo "Class: " . $exam['class'] . "\n";
        echo "Start Date: " . $exam['startDate'] . "\n";
        echo "End Date: " . $exam['endDate'] . "\n";
        echo "Subjects JSON: " . $exam['subjects'] . "\n";
        
        // Try to decode subjects JSON
        if ($exam['subjects']) {
            $subjects = json_decode($exam['subjects'], true);
            echo "Decoded Subjects: " . print_r($subjects, true) . "\n";
        }
        echo "-------------------\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>