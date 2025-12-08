<?php
// Verify marks for Aatiqa Abro (ID: 4825)
require_once 'backend/config/database.php';

try {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare('SELECT * FROM marks WHERE studentId = ? AND examType = ?');
    $stmt->execute([4825, 'Midterm']);
    $marks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo 'Found ' . count($marks) . ' marks for student 4825:' . PHP_EOL;
    foreach ($marks as $mark) {
        echo '- ' . $mark['subject'] . ': ' . $mark['marksObtained'] . '/' . $mark['totalMarks'] . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . PHP_EOL;
}
?>