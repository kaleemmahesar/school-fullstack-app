<?php
require_once 'config/database.php';

try {
    $pdo = getDBConnection();
    
    // Check students
    $stmt = $pdo->query("SELECT * FROM students LIMIT 5");
    $students = $stmt->fetchAll();
    echo "Found " . count($students) . " students\n";
    foreach ($students as $student) {
        echo "ID: " . $student['id'] . ", Name: " . $student['firstName'] . " " . $student['lastName'] . ", Class: " . $student['class'] . "\n";
    }
    
    // Check exams
    $stmt = $pdo->query("SELECT * FROM exams LIMIT 5");
    $exams = $stmt->fetchAll();
    echo "\nFound " . count($exams) . " exams\n";
    foreach ($exams as $exam) {
        echo "ID: " . $exam['id'] . ", Name: " . $exam['name'] . ", Class: " . $exam['class'] . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>