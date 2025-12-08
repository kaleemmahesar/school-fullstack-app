<?php
// Add marks for Aatiqa Abro (ID: 4825)
require_once 'backend/config/database.php';

try {
    $pdo = getDBConnection();
    
    // Delete any existing marks for this student and exam to avoid duplicates
    $stmt = $pdo->prepare("DELETE FROM marks WHERE studentId = ? AND examType = ?");
    $stmt->execute([4825, 'Midterm']);
    
    // Add English marks
    $stmt = $pdo->prepare("INSERT INTO marks (id, studentId, studentName, class, examId, examName, examType, subject, marksObtained, totalMarks, academicYear, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        'mark-4825-eng-direct',
        4825,
        'Aatiqa Abro',
        'Class 3',
        'class3-midterm-20251208204620',
        'Midterm Examination',
        'Midterm',
        'English',
        85,
        100,
        '2025-2026',
        '2025'
    ]);
    
    // Add Mathematics marks
    $stmt = $pdo->prepare("INSERT INTO marks (id, studentId, studentName, class, examId, examName, examType, subject, marksObtained, totalMarks, academicYear, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        'mark-4825-math-direct',
        4825,
        'Aatiqa Abro',
        'Class 3',
        'class3-midterm-20251208204620',
        'Midterm Examination',
        'Midterm',
        'Mathematics',
        92,
        100,
        '2025-2026',
        '2025'
    ]);
    
    // Add Science marks
    $stmt = $pdo->prepare("INSERT INTO marks (id, studentId, studentName, class, examId, examName, examType, subject, marksObtained, totalMarks, academicYear, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        'mark-4825-sci-direct',
        4825,
        'Aatiqa Abro',
        'Class 3',
        'class3-midterm-20251208204620',
        'Midterm Examination',
        'Midterm',
        'Science',
        78,
        100,
        '2025-2026',
        '2025'
    ]);
    
    echo "Successfully added marks for Aatiqa Abro (ID: 4825)\n";
    echo "English: 85/100\n";
    echo "Mathematics: 92/100\n";
    echo "Science: 78/100\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>