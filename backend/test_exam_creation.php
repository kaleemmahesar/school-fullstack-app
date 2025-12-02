<?php
// Test script to create an exam for Class 10

// Include the database configuration
require_once __DIR__ . '/config/database.php';

try {
    $pdo = getDBConnection();
    
    // Sample exam data for Class 10
    $examData = [
        'name' => 'Midterm Examination',
        'class' => 'Class 10',
        'examType' => 'Midterm',
        'startDate' => '2025-12-01',
        'endDate' => '2025-12-10',
        'maxMarks' => 100,
        'subjects' => [
            [
                'id' => 'subj-10-english',
                'name' => 'English',
                'date' => '2025-12-01',
                'time' => '10:00',
                'duration' => 180
            ],
            [
                'id' => 'subj-10-mathematics',
                'name' => 'Mathematics',
                'date' => '2025-12-02',
                'time' => '10:00',
                'duration' => 180
            ],
            [
                'id' => 'subj-10-science',
                'name' => 'Science',
                'date' => '2025-12-03',
                'time' => '10:00',
                'duration' => 180
            ]
        ],
        'academicYear' => '2025-2026'
    ];
    
    // Handle subjects data as JSON
    $subjectsJson = null;
    if (isset($examData['subjects']) && is_array($examData['subjects'])) {
        $subjectsJson = json_encode($examData['subjects']);
    }
    
    // Insert the exam directly into the database
    $id = uniqid();
    $stmt = $pdo->prepare("INSERT INTO exams (id, name, examType, class, startDate, endDate, subject, date, totalMarks, subjects, academicYear) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $id,
        $examData['name'],
        $examData['examType'],
        $examData['class'],
        $examData['startDate'],
        $examData['endDate'],
        '', // subject (old column)
        null, // date (old column)
        $examData['maxMarks'],
        $subjectsJson,
        $examData['academicYear']
    ]);
    
    // Retrieve the exam to verify it was stored correctly
    $stmt = $pdo->prepare("SELECT * FROM exams WHERE id = ?");
    $stmt->execute([$id]);
    $exam = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Decode subjects JSON if present
    if (isset($exam['subjects']) && $exam['subjects']) {
        $exam['subjects'] = json_decode($exam['subjects'], true);
    }
    
    echo "Exam created successfully!\n";
    echo "Exam ID: " . $exam['id'] . "\n";
    echo "Exam Name: " . $exam['name'] . "\n";
    echo "Class: " . $exam['class'] . "\n";
    echo "Start Date: " . $exam['startDate'] . "\n";
    echo "End Date: " . $exam['endDate'] . "\n";
    echo "Subjects: " . print_r($exam['subjects'], true) . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>