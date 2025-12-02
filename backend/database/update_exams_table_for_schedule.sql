-- Update exams table to support subject schedule storage
ALTER TABLE exams 
ADD COLUMN subjects JSON NULL AFTER totalMarks,
ADD COLUMN startDate DATE NULL AFTER class,
ADD COLUMN endDate DATE NULL AFTER startDate;

-- Update existing exams to set default values
UPDATE exams SET startDate = date, endDate = date WHERE startDate IS NULL;