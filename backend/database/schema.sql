-- School Management System Database Schema
-- This file contains the complete database structure for the School Management System
-- Import this file using phpMyAdmin or MySQL command line to set up the database

-- Create the database
CREATE DATABASE IF NOT EXISTS school_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE school_management_system;

-- Drop existing tables if they exist to ensure clean setup
DROP TABLE IF EXISTS alumni;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS batches;
DROP TABLE IF EXISTS marks;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS staff_attendance;
DROP TABLE IF EXISTS staff_salary_history;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS sections;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS fees_history;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS subsidies;

-- Students table
-- Stores information about all students in the school
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
);

-- Fees history table
-- Tracks all fee payments and challans for students
CREATE TABLE IF NOT EXISTS fees_history (
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
);

-- Classes table
-- Defines all classes offered by the school
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50),
    monthlyFees DECIMAL(10, 2),
    admissionFees DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Subjects table
-- Lists all subjects taught in different classes
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(50) PRIMARY KEY,
    class_id VARCHAR(50),
    name VARCHAR(100),
    code VARCHAR(20),
    teacher_id INT NULL,
    maxMarks INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES staff(id) ON DELETE SET NULL
);

-- Sections table
-- Defines sections within each class
CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR(50) PRIMARY KEY,
    class_id VARCHAR(50),
    name VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Expenses table
-- Tracks all school expenses
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(50),
    description TEXT,
    amount DECIMAL(10, 2),
    date DATE,
    academicYear VARCHAR(20),
    addedTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Exams table
-- Stores information about exams conducted
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    class VARCHAR(50),
    subject VARCHAR(100),
    date DATE,
    totalMarks DECIMAL(10, 2),
    academicYear VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Staff table
-- Contains information about all staff members
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    jobType VARCHAR(20) DEFAULT 'Teaching',
    subject VARCHAR(100) NULL,
    status VARCHAR(20) DEFAULT 'active',
    addedTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Staff salary history table
-- Tracks salary payments and history for staff members
CREATE TABLE IF NOT EXISTS staff_salary_history (
    id VARCHAR(100) PRIMARY KEY,
    staff_id INT,
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
);

-- Staff attendance table
-- Records attendance for staff members
CREATE TABLE IF NOT EXISTS staff_attendance (
    id VARCHAR(50) PRIMARY KEY,
    date DATE,
    records JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Attendance table
-- Records student attendance
CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(50) PRIMARY KEY,
    date DATE,
    classId VARCHAR(50),
    section VARCHAR(10) DEFAULT NULL,
    subject VARCHAR(100) DEFAULT NULL,
    academicYear VARCHAR(20),
    records JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Marks table
-- Stores exam marks for students
CREATE TABLE IF NOT EXISTS marks (
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
);

-- Subsidies table
-- Tracks financial subsidies received by the school
CREATE TABLE IF NOT EXISTS subsidies (
    id VARCHAR(50) PRIMARY KEY,
    quarter VARCHAR(10),
    year INT,
    amount DECIMAL(10, 2),
    ngoName VARCHAR(100),
    description TEXT,
    receivedDate DATE NULL,
    expectedDate DATE NULL,
    status VARCHAR(20) DEFAULT 'expected',
    addedTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Batches table
-- Manages academic batches/years
CREATE TABLE IF NOT EXISTS batches (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50),
    startDate DATE,
    endDate DATE,
    status VARCHAR(20) DEFAULT 'active',
    classes JSON,
    sections JSON,
    addedTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Notifications table
-- Stores system notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    userId VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Settings table
-- Stores school configuration settings
CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(50) PRIMARY KEY,
    schoolName VARCHAR(255),
    schoolAddress TEXT,
    schoolPhone VARCHAR(20),
    schoolEmail VARCHAR(100),
    schoolWebsite VARCHAR(100),
    academicYear VARCHAR(20),
    currency VARCHAR(10),
    timezone VARCHAR(50),
    logo TEXT,
    holidays JSON,
    level VARCHAR(20) DEFAULT 'primary',
    hasPG BOOLEAN DEFAULT FALSE,
    hasNursery BOOLEAN DEFAULT FALSE,
    hasKG BOOLEAN DEFAULT FALSE,
    vacations JSON,
    weekendDays JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Events table
-- Stores school events
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100),
    description TEXT,
    date DATETIME,
    startTime TIME,
    endTime TIME,
    type VARCHAR(20)
);

-- Promotions table
-- Tracks student promotions between classes
CREATE TABLE IF NOT EXISTS promotions (
    id VARCHAR(50) PRIMARY KEY,
    studentId INT,
    fromClass VARCHAR(20),
    toClass VARCHAR(20),
    academicYear VARCHAR(20),
    promotionDate DATE,
    status VARCHAR(20),
    FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);

-- Alumni table
-- Stores information about former students
CREATE TABLE IF NOT EXISTS alumni (
    id VARCHAR(50) PRIMARY KEY,
    studentId INT,
    graduationYear INT,
    currentOccupation VARCHAR(100),
    contactInfo VARCHAR(100),
    achievements TEXT,
    FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);

-- Indexes for better query performance
-- Students table indexes
ALTER TABLE students
  ADD INDEX idx_class_section (class, section),
  ADD INDEX idx_academic_year (academicYear);

-- Fees history table indexes
ALTER TABLE fees_history
  ADD INDEX idx_student_id (student_id),
  ADD INDEX idx_academic_year (academicYear),
  ADD INDEX idx_paid_status (paid),
  ADD INDEX idx_date (date);

-- Attendance table indexes
ALTER TABLE attendance
  ADD INDEX idx_date (date),
  ADD INDEX idx_class_id (classId),
  ADD INDEX idx_academic_year (academicYear);

-- Sample data for settings
INSERT INTO settings (id, schoolName, schoolAddress, schoolPhone, schoolEmail, schoolWebsite, academicYear, currency, timezone, level, hasPG, hasNursery, hasKG, holidays, vacations, weekendDays) VALUES
('settings-1', 'Greenwood School', '123 Education Street, Learning City', '+1 (555) 123-4567', 'info@greenwood.edu', 'www.greenwood.edu', '2025-2026', 'USD', 'America/New_York', 'primary', TRUE, TRUE, TRUE, '[]', '{"summer":{"start":"2025-06-01","end":"2025-07-31"},"winter":{"start":"2025-12-20","end":"2026-01-05"}}', '[0]');

-- Sample data for classes
INSERT INTO classes (id, name, monthlyFees, admissionFees) VALUES
('class-1', 'Class 1', 3000, 4000),
('class-2', 'Class 2', 3200, 4200),
('class-3', 'Class 3', 3400, 4400),
('class-4', 'Class 4', 3600, 4600),
('class-5', 'Class 5', 3800, 4800),
('class-6', 'Class 6', 4000, 5000),
('class-7', 'Class 7', 4200, 5200),
('class-8', 'Class 8', 4400, 5400),
('class-9', 'Class 9', 4600, 5600),
('class-10', 'Class 10', 4800, 5800);

-- Sample data for students
INSERT INTO students (photo, grNo, firstName, lastName, fatherName, religion, address, dateOfBirth, birthPlace, lastSchoolAttended, dateOfAdmission, class, section, monthlyFees, admissionFees, feesPaid, totalFees, familyId, relationship, parentId, status, academicYear) VALUES
('', 'GR001', 'Ahmed', 'Khan', 'Muhammad Khan', 'Islam', '123 Main Street, Karachi, Sindh', '2005-05-15', 'Aga Khan Hospital', 'Karachi Grammar School', '2025-11-05', 'Class 10', 'A', 4800, 5800, 10600, 10600, 'family-1', 'self', null, 'studying', '2025-2026'),
('', 'GR002', 'Fatima', 'Ahmed', 'Ali Ahmed', 'Islam', '456 Oak Avenue, Lahore, Punjab', '2006-08-22', 'Shalamar Hospital', 'Lahore Grammar School', '2025-11-05', 'Class 9', 'B', 4600, 5600, 10200, 10200, 'family-1', 'sister', null, 'studying', '2025-2026');

-- Sample data for fees history
INSERT INTO fees_history (student_id, month, amount, paid, date, dueDate, status, type, academicYear) VALUES
(1, 'Admission Fees', 5800, true, '2025-11-05', '2025-11-05', 'paid', 'admission', '2025-2026'),
(1, 'November 2025', 4800, true, '2025-11-15', '2025-12-10', 'paid', 'monthly', '2025-2026'),
(2, 'Admission Fees', 5600, true, '2025-11-05', '2025-11-05', 'paid', 'admission', '2025-2026'),
(2, 'November 2025', 4600, true, '2025-11-15', '2025-12-10', 'paid', 'monthly', '2025-2026');

-- Sample data for subsidies
INSERT INTO subsidies (id, quarter, year, amount, ngoName, description, receivedDate, expectedDate, status) VALUES
('sub-1', 'Q1', 2025, 50000, 'Education Support Foundation', 'Quarterly subsidy for school operations', '2025-03-15', NULL, 'received'),
('sub-2', 'Q2', 2025, 60000, 'Education Support Foundation', 'Quarterly subsidy for school operations', NULL, '2025-06-15', 'expected');

-- Sample data for batches
INSERT INTO batches (id, name, startDate, endDate, status, classes, sections) VALUES
('batch-1', '2025-2026', '2025-09-01', '2026-06-30', 'active', '["PG", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"]', '["A", "B"]');

-- Sample data for notifications
INSERT INTO notifications (id, title, message, type, is_read, userId) VALUES
('notification-1', 'Batch Completed', 'Academic year 2024-2025 has been marked as completed. Students have been promoted.', 'batch-completed', FALSE, NULL),
('notification-2', 'Student Promotion Required', '260 students need to be promoted for the 2025-2026 academic year.', 'student-promotion', FALSE, NULL);

-- Sample data for events
INSERT INTO events (id, title, description, date, startTime, endTime, type) VALUES
('event-1', 'Parents Teachers Meeting', 'Quarterly meeting with parents to discuss student progress.', '2025-11-25 19:00:00', '10:00:00', '00:00:00', 'event');