<?php
// Test script to check if subject schedule data is working
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDBConnection();
    
    // Create a test exam with subject schedule data
    $id = 'test-exam-' . time();
    $subjectsJson = json_encode([
        ['name' => 'English', 'date' => '2025-12-01', 'time' => '10:00', 'duration' => 180],
        ['name' => 'Mathematics', 'date' => '2025-12-02', 'time' => '10:00', 'duration' => 180],
        ['name' => 'Science', 'date' => '2025-12-03', 'time' => '10:00', 'duration' => 180]
    ]);
    
    // Insert test exam
    $stmt = $pdo->prepare('INSERT INTO exams (id, name, examType, class, startDate, endDate, subject, date, totalMarks, subjects, academicYear) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $id,
        'Test Examination',
        'Final',
        'Class 10',
        '2025-12-01',
        '2025-12-10',
        '',
        null,
        100,
        $subjectsJson,
        '2025-2026'
    ]);
    
    // Retrieve and return the exam
    $stmt = $pdo->prepare('SELECT * FROM exams WHERE id = ?');
    $stmt->execute([$id]);
    $exam = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Decode subjects JSON if present
    if (isset($exam['subjects']) && $exam['subjects']) {
        $decodedSubjects = json_decode($exam['subjects'], true);
        if ($decodedSubjects !== null) {
            $exam['subjects'] = $decodedSubjects;
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Exam created successfully',
        'exam' => $exam
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>