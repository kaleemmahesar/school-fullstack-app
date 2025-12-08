<?php
require_once 'backend/config/database.php';

try {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare('SELECT * FROM marks WHERE studentId = ?');
    $stmt->execute([4825]);
    $marks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Marks for student 4825:" . PHP_EOL;
    foreach ($marks as $mark) {
        echo "- Subject: " . $mark['subject'] . ", Obtained: " . $mark['marksObtained'] . ", Total: " . $mark['totalMarks'] . ", Exam: " . $mark['examType'] . PHP_EOL;
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}
?>