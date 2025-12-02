-- Update exams table to support subject schedule storage
ALTER TABLE exams 
ADD COLUMN IF NOT EXISTS subjects JSON NULL AFTER totalMarks,
ADD COLUMN IF NOT EXISTS startDate DATE NULL AFTER class,
ADD COLUMN IF NOT EXISTS endDate DATE NULL AFTER startDate;