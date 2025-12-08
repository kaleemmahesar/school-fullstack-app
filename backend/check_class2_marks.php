<?php
require_once 'config/database.php';

try {
    $pdo = getDBConnection();
    $stmt = $pdo->query('SELECT studentName, subject, marksObtained, totalMarks FROM marks WHERE class="Class 2" AND examType="Midterm"');
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Found " . count($results) . " Class 2 midterm marks\n";
    foreach ($results as $row) {
        echo $row['studentName'] . ": " . $row['subject'] . " - " . $row['marksObtained'] . "/" . $row['totalMarks'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>