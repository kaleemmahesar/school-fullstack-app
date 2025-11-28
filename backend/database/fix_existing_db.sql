-- Fix script for existing school_management database
-- This script will drop conflicting tables and recreate them

USE school_management;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables that might have conflicts
DROP TABLE IF EXISTS subsidies;
DROP TABLE IF EXISTS batches;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS attendance;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create the missing tables
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

-- Attendance table with missing columns
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