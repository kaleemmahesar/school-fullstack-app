<?php
require_once 'config/database.php';

try {
    $pdo = getDBConnection();
    
    // Check if we have any data in the students table
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM students");
    $stmt->execute();
    $count = $stmt->fetchColumn();
    
    if ($count == 0) {
        echo "Adding sample data...\n";
        
        // Add sample classes
        $classes = [
            ['id' => 'class-1', 'name' => 'Class 1', 'monthlyFees' => 3000, 'admissionFees' => 4000],
            ['id' => 'class-2', 'name' => 'Class 2', 'monthlyFees' => 3200, 'admissionFees' => 4200],
            ['id' => 'class-3', 'name' => 'Class 3', 'monthlyFees' => 3400, 'admissionFees' => 4400],
            ['id' => 'class-4', 'name' => 'Class 4', 'monthlyFees' => 3600, 'admissionFees' => 4600],
            ['id' => 'class-5', 'name' => 'Class 5', 'monthlyFees' => 3800, 'admissionFees' => 4800],
            ['id' => 'class-6', 'name' => 'Class 6', 'monthlyFees' => 4000, 'admissionFees' => 5000],
            ['id' => 'class-7', 'name' => 'Class 7', 'monthlyFees' => 4200, 'admissionFees' => 5200],
            ['id' => 'class-8', 'name' => 'Class 8', 'monthlyFees' => 4400, 'admissionFees' => 5400],
            ['id' => 'class-9', 'name' => 'Class 9', 'monthlyFees' => 4600, 'admissionFees' => 5600],
            ['id' => 'class-10', 'name' => 'Class 10', 'monthlyFees' => 4800, 'admissionFees' => 5800]
        ];
        
        foreach ($classes as $class) {
            $stmt = $pdo->prepare("INSERT INTO classes (id, name, monthlyFees, admissionFees) VALUES (?, ?, ?, ?)");
            $stmt->execute([$class['id'], $class['name'], $class['monthlyFees'], $class['admissionFees']]);
        }
        
        echo "Added sample classes.\n";
        
        // Add sample students
        $students = [
            [
                'id' => '1',
                'photo' => '',
                'grNo' => 'GR001',
                'firstName' => 'Ahmed',
                'lastName' => 'Khan',
                'fatherName' => 'Muhammad Khan',
                'religion' => 'Islam',
                'address' => '123 Main Street, Karachi, Sindh',
                'dateOfBirth' => '2005-05-15',
                'birthPlace' => 'Aga Khan Hospital',
                'lastSchoolAttended' => 'Karachi Grammar School',
                'dateOfAdmission' => '2025-11-05',
                'class' => 'Class 10',
                'section' => 'A',
                'monthlyFees' => 4800,
                'admissionFees' => 5800,
                'feesPaid' => 10600,
                'totalFees' => 10600,
                'familyId' => 'family-1',
                'relationship' => 'self',
                'parentId' => null,
                'status' => 'studying',
                'academicYear' => '2025-2026'
            ],
            [
                'id' => '2',
                'photo' => '',
                'grNo' => 'GR002',
                'firstName' => 'Fatima',
                'lastName' => 'Ahmed',
                'fatherName' => 'Ali Ahmed',
                'religion' => 'Islam',
                'address' => '456 Oak Avenue, Lahore, Punjab',
                'dateOfBirth' => '2006-08-22',
                'birthPlace' => 'Shalamar Hospital',
                'lastSchoolAttended' => 'Lahore Grammar School',
                'dateOfAdmission' => '2025-11-05',
                'class' => 'Class 9',
                'section' => 'B',
                'monthlyFees' => 4600,
                'admissionFees' => 5600,
                'feesPaid' => 10200,
                'totalFees' => 10200,
                'familyId' => 'family-1',
                'relationship' => 'sister',
                'parentId' => '1',
                'status' => 'studying',
                'academicYear' => '2025-2026'
            ]
        ];
        
        foreach ($students as $student) {
            $stmt = $pdo->prepare("INSERT INTO students (id, photo, grNo, firstName, lastName, fatherName, religion, address, dateOfBirth, birthPlace, lastSchoolAttended, dateOfAdmission, class, section, monthlyFees, admissionFees, feesPaid, totalFees, familyId, relationship, parentId, status, academicYear) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $student['id'], $student['photo'], $student['grNo'], $student['firstName'], $student['lastName'],
                $student['fatherName'], $student['religion'], $student['address'], $student['dateOfBirth'],
                $student['birthPlace'], $student['lastSchoolAttended'], $student['dateOfAdmission'], $student['class'],
                $student['section'], $student['monthlyFees'], $student['admissionFees'], $student['feesPaid'],
                $student['totalFees'], $student['familyId'], $student['relationship'], $student['parentId'],
                $student['status'], $student['academicYear']
            ]);
        }
        
        echo "Added sample students.\n";
        
        // Add sample fees history
        $feesHistory = [
            [
                'id' => 'challan-1-0',
                'student_id' => '1',
                'month' => 'Admission Fees',
                'amount' => 5800,
                'paid' => true,
                'date' => '2025-11-05',
                'dueDate' => '2025-11-05',
                'status' => 'paid',
                'type' => 'admission',
                'academicYear' => '2025-2026'
            ],
            [
                'id' => 'challan-1-1',
                'student_id' => '1',
                'month' => 'November 2025',
                'amount' => 4800,
                'paid' => true,
                'date' => '2025-11-15',
                'dueDate' => '2025-12-10',
                'status' => 'paid',
                'type' => 'monthly',
                'academicYear' => '2025-2026'
            ],
            [
                'id' => 'challan-2-0',
                'student_id' => '2',
                'month' => 'Admission Fees',
                'amount' => 5600,
                'paid' => true,
                'date' => '2025-11-05',
                'dueDate' => '2025-11-05',
                'status' => 'paid',
                'type' => 'admission',
                'academicYear' => '2025-2026'
            ],
            [
                'id' => 'challan-2-1',
                'student_id' => '2',
                'month' => 'November 2025',
                'amount' => 4600,
                'paid' => true,
                'date' => '2025-11-15',
                'dueDate' => '2025-12-10',
                'status' => 'paid',
                'type' => 'monthly',
                'academicYear' => '2025-2026'
            ]
        ];
        
        foreach ($feesHistory as $fee) {
            $stmt = $pdo->prepare("INSERT INTO fees_history (id, student_id, month, amount, paid, date, dueDate, status, type, academicYear) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $fee['id'], $fee['student_id'], $fee['month'], $fee['amount'], $fee['paid'],
                $fee['date'], $fee['dueDate'], $fee['status'], $fee['type'], $fee['academicYear']
            ]);
        }
        
        echo "Added sample fees history.\n";
        
        echo "Sample data added successfully!\n";
    } else {
        echo "Database already contains data. Skipping sample data insertion.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>