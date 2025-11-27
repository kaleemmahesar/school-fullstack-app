-- Reset script for school management database
-- This script will drop existing tables and create new ones

-- Use the new database name
USE school_management_system;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS subsidies;
DROP TABLE IF EXISTS batches;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS settings;
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

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Now run the full schema to create all tables
-- Students table
CREATE TABLE IF NOT EXISTS students (
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
);

-- Fees history table
CREATE TABLE IF NOT EXISTS fees_history (
    id VARCHAR(100) PRIMARY KEY,
    student_id VARCHAR(50),
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
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50),
    monthlyFees DECIMAL(10, 2),
    admissionFees DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(50) PRIMARY KEY,
    class_id VARCHAR(50),
    name VARCHAR(100),
    code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Sections table
CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR(50) PRIMARY KEY,
    class_id VARCHAR(50),
    name VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Expenses table
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
CREATE TABLE IF NOT EXISTS staff (
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
);

-- Staff salary history table
CREATE TABLE IF NOT EXISTS staff_salary_history (
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
);

-- Staff attendance table
CREATE TABLE IF NOT EXISTS staff_attendance (
    id VARCHAR(50) PRIMARY KEY,
    date DATE,
    records JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(50) PRIMARY KEY,
    date DATE,
    classId VARCHAR(50),
    academicYear VARCHAR(20),
    records JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Marks table
CREATE TABLE IF NOT EXISTS marks (
    id VARCHAR(50) PRIMARY KEY,
    studentId VARCHAR(50),
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
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50),
    read BOOLEAN DEFAULT FALSE,
    userId VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Settings table
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
INSERT INTO students (id, photo, grNo, firstName, lastName, fatherName, religion, address, dateOfBirth, birthPlace, lastSchoolAttended, dateOfAdmission, class, section, monthlyFees, admissionFees, feesPaid, totalFees, familyId, relationship, parentId, status, academicYear) VALUES
('1', '', 'GR001', 'Ahmed', 'Khan', 'Muhammad Khan', 'Islam', '123 Main Street, Karachi, Sindh', '2005-05-15', 'Aga Khan Hospital', 'Karachi Grammar School', '2025-11-05', 'Class 10', 'A', 4800, 5800, 10600, 10600, 'family-1', 'self', null, 'studying', '2025-2026'),
('2', '', 'GR002', 'Fatima', 'Ahmed', 'Ali Ahmed', 'Islam', '456 Oak Avenue, Lahore, Punjab', '2006-08-22', 'Shalamar Hospital', 'Lahore Grammar School', '2025-11-05', 'Class 9', 'B', 4600, 5600, 10200, 10200, 'family-1', 'sister', '1', 'studying', '2025-2026');

-- Sample data for fees history
INSERT INTO fees_history (id, student_id, month, amount, paid, date, dueDate, status, type, academicYear) VALUES
('challan-1-0', '1', 'Admission Fees', 5800, true, '2025-11-05', '2025-11-05', 'paid', 'admission', '2025-2026'),
('challan-1-1', '1', 'November 2025', 4800, true, '2025-11-15', '2025-12-10', 'paid', 'monthly', '2025-2026'),
('challan-2-0', '2', 'Admission Fees', 5600, true, '2025-11-05', '2025-11-05', 'paid', 'admission', '2025-2026'),
('challan-2-1', '2', 'November 2025', 4600, true, '2025-11-15', '2025-12-10', 'paid', 'monthly', '2025-2026');

-- Sample data for subsidies
INSERT INTO subsidies (id, quarter, year, amount, ngoName, description, receivedDate, expectedDate, status) VALUES
('sub-1', 'Q1', 2025, 50000, 'Education Support Foundation', 'Quarterly subsidy for school operations', '2025-03-15', NULL, 'received'),
('sub-2', 'Q2', 2025, 60000, 'Education Support Foundation', 'Quarterly subsidy for school operations', NULL, '2025-06-15', 'expected');

-- Sample data for batches
INSERT INTO batches (id, name, startDate, endDate, status, classes, sections) VALUES
('batch-1', '2025-2026', '2025-09-01', '2026-06-30', 'active', '["PG", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"]', '["A", "B"]');

-- Sample data for settings
INSERT INTO settings (id, schoolName, schoolAddress, schoolPhone, schoolEmail, schoolWebsite, academicYear, currency, timezone, level, hasPG, hasNursery, hasKG, vacations, weekendDays) VALUES
('settings-1', 'Greenwood School', '123 Education Street, Learning City', '+1 (555) 123-4567', 'info@greenwood.edu', 'www.greenwood.edu', '2025-2026', 'USD', 'America/New_York', 'primary', TRUE, TRUE, TRUE, '{"summer":{"start":"2025-06-01","end":"2025-07-31"},"winter":{"start":"2025-12-20","end":"2026-01-05"}}', '[0]');