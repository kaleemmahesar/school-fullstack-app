<?php
require_once 'config/database.php';

try {
    $pdo = getDBConnection();
    
    // Create students table
    $sql = "CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(50) PRIMARY KEY,
        photo TEXT,
        grNo VARCHAR(50),
        firstName VARCHAR(100),
        lastName VARCHAR(100),
        fatherName VARCHAR(100),
        religion VARCHAR(50),
        address TEXT,
        dateOfBirth DATE,
        birthPlace VARCHAR(100),
        lastSchoolAttended VARCHAR(100),
        dateOfAdmission DATE,
        class VARCHAR(50),
        section VARCHAR(10),
        dateOfLeaving DATE NULL,
        classInWhichLeft VARCHAR(50),
        reasonOfLeaving TEXT,
        remarks TEXT,
        monthlyFees DECIMAL(10, 2),
        admissionFees DECIMAL(10, 2),
        feesPaid DECIMAL(10, 2),
        totalFees DECIMAL(10, 2),
        familyId VARCHAR(50),
        relationship VARCHAR(20),
        parentId VARCHAR(50) NULL,
        status VARCHAR(20) DEFAULT 'studying',
        academicYear VARCHAR(20),
        admissionTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    
    // Create fees_history table
    $sql = "CREATE TABLE IF NOT EXISTS fees_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        month VARCHAR(50),
        amount DECIMAL(10, 2),
        paid BOOLEAN DEFAULT FALSE,
        date DATE NULL,
        dueDate DATE,
        status VARCHAR(20) DEFAULT 'pending',
        type VARCHAR(20),
        academicYear VARCHAR(20),
        paymentTimestamp TIMESTAMP NULL,
        generationTimestamp TIMESTAMP NULL,
        paymentMethod VARCHAR(50) NULL,
        fineAmount DECIMAL(10, 2) DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )";
    $pdo->exec($sql);
    
    // Create classes table
    $sql = "CREATE TABLE IF NOT EXISTS classes (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(50),
        monthlyFees DECIMAL(10, 2),
        admissionFees DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    
    // Create subjects table
    $sql = "CREATE TABLE IF NOT EXISTS subjects (
        id VARCHAR(50) PRIMARY KEY,
        class_id VARCHAR(50),
        name VARCHAR(100),
        code VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
    )";
    $pdo->exec($sql);
    
    // Create sections table
    $sql = "CREATE TABLE IF NOT EXISTS sections (
        id VARCHAR(50) PRIMARY KEY,
        class_id VARCHAR(50),
        name VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
    )";
    $pdo->exec($sql);
    
    // Create expenses table
    $sql = "CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(50) PRIMARY KEY,
        category VARCHAR(50),
        description TEXT,
        amount DECIMAL(10, 2),
        date DATE,
        academicYear VARCHAR(20),
        addedTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    
    // Create exams table
    $sql = "CREATE TABLE IF NOT EXISTS exams (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100),
        class VARCHAR(50),
        subject VARCHAR(100),
        date DATE,
        totalMarks DECIMAL(10, 2),
        academicYear VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    
    // Create staff table
    $sql = "CREATE TABLE IF NOT EXISTS staff (
        id VARCHAR(50) PRIMARY KEY,
        photo TEXT,
        firstName VARCHAR(100),
        lastName VARCHAR(100),
        fatherName VARCHAR(100),
        cnic VARCHAR(20),
        dateOfBirth DATE,
        gender VARCHAR(10),
        religion VARCHAR(50),
        address TEXT,
        contactNumber VARCHAR(20),
        emergencyContact VARCHAR(20),
        email VARCHAR(100),
        dateOfJoining DATE,
        designation VARCHAR(100),
        department VARCHAR(100),
        salary DECIMAL(10, 2),
        status VARCHAR(20) DEFAULT 'active',
        addedTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    
    // Create staff_salary_history table
    $sql = "CREATE TABLE IF NOT EXISTS staff_salary_history (
        id VARCHAR(100) PRIMARY KEY,
        staff_id VARCHAR(50),
        month VARCHAR(50),
        baseSalary DECIMAL(10, 2),
        allowances DECIMAL(10, 2),
        deductions DECIMAL(10, 2),
        netSalary DECIMAL(10, 2),
        status VARCHAR(20),
        paymentDate DATE,
        paymentMethod VARCHAR(50),
        paymentTimestamp TIMESTAMP NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
    )";
    $pdo->exec($sql);
    
    // Create staff_attendance table
    $sql = "CREATE TABLE IF NOT EXISTS staff_attendance (
        id VARCHAR(50) PRIMARY KEY,
        date DATE,
        records JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    
    // Create attendance table
    $sql = "CREATE TABLE IF NOT EXISTS attendance (
        id VARCHAR(50) PRIMARY KEY,
        date DATE,
        classId VARCHAR(50),
        academicYear VARCHAR(20),
        records JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    
    // Create marks table
    $sql = "CREATE TABLE IF NOT EXISTS marks (
        id VARCHAR(50) PRIMARY KEY,
        studentId INT,
        studentName VARCHAR(200),
        class VARCHAR(50),
        examId VARCHAR(50),
        examName VARCHAR(100),
        subject VARCHAR(100),
        marksObtained DECIMAL(10, 2),
        totalMarks DECIMAL(10, 2),
        academicYear VARCHAR(20),
        year VARCHAR(4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    
    echo "Database tables created successfully!";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>