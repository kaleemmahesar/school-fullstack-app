-- Comprehensive update for exams table to properly support subject schedules

-- First, let's check if the new columns exist
-- If they don't exist, add them
ALTER TABLE exams 
ADD COLUMN IF NOT EXISTS subjects JSON NULL AFTER totalMarks,
ADD COLUMN IF NOT EXISTS startDate DATE NULL AFTER class,
ADD COLUMN IF NOT EXISTS endDate DATE NULL AFTER startDate;

-- Update existing exams to migrate data if needed
-- Set default values for startDate and endDate based on existing date column
UPDATE exams SET startDate = date, endDate = date WHERE startDate IS NULL AND date IS NOT NULL;

-- For exams that don't have a date, set to today
UPDATE exams SET startDate = CURDATE(), endDate = CURDATE() WHERE startDate IS NULL;-- Comprehensive update for exams table to properly support subject schedules

-- First, let's check if the new columns exist
-- If they don't exist, add them
ALTER TABLE exams 
ADD COLUMN IF NOT EXISTS subjects JSON NULL AFTER totalMarks,
ADD COLUMN IF NOT EXISTS startDate DATE NULL AFTER class,
ADD COLUMN IF NOT EXISTS endDate DATE NULL AFTER startDate;

-- Update existing exams to migrate data if needed
-- Set default values for startDate and endDate based on existing date column
UPDATE exams SET startDate = date, endDate = date WHERE startDate IS NULL AND date IS NOT NULL;

-- For exams that don't have a date, set to today
UPDATE exams SET startDate = CURDATE(), endDate = CURDATE() WHERE startDate IS NULL;