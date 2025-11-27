-- Update script to add maxMarks column to subjects table
-- Run this in phpMyAdmin if you've already run the original schema.sql

USE school_management_system;

-- Add maxMarks column to subjects table
ALTER TABLE subjects 
ADD COLUMN maxMarks INT DEFAULT 100 AFTER teacher_id;