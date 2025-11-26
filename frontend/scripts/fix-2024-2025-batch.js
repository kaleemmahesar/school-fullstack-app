import fs from 'fs';

// Read the current db.json file
const db = JSON.parse(fs.readFileSync('./db.json', 'utf8'));

// Get all students in the 2024-2025 batch
const batch2024Students = db.students.filter(student => student.academicYear === '2024-2025');

console.log(`Found ${batch2024Students.length} students in the 2024-2025 batch.`);

// Function to get the next class for promotion
const getNextClass = (currentClass) => {
  const classMap = {
    'PG': 'Nursery',
    'Nursery': 'KG',
    'KG': 'Class 1',
    'Class 1': 'Class 2',
    'Class 2': 'Class 3',
    'Class 3': 'Class 4',
    'Class 4': 'Class 5',
    'Class 5': 'Class 6',
    'Class 6': 'Class 7',
    'Class 7': 'Class 8',
    'Class 8': 'Class 9',
    'Class 9': 'Class 10',
    'Class 10': 'passed_out' // Class 10 students graduate
  };
  
  return classMap[currentClass] || currentClass;
};

// Process each student in the 2024-2025 batch
let passedOutCount = 0;
let promotedCount = 0;

batch2024Students.forEach(student => {
  // Find the student in the main students array
  const studentIndex = db.students.findIndex(s => s.id === student.id);
  
  if (studentIndex !== -1) {
    if (student.class === 'Class 10') {
      // Students in Class 10 graduate and are marked as passed_out
      db.students[studentIndex].status = 'passed_out';
      db.students[studentIndex].academicYear = '2024-2025'; // Still part of the completed batch
      passedOutCount++;
    } else {
      // Students in other classes are promoted to the next class
      const nextClass = getNextClass(student.class);
      db.students[studentIndex].class = nextClass;
      db.students[studentIndex].academicYear = '2025-2026'; // Moved to the next academic year
      // Status remains "studying" as they're continuing their education
      promotedCount++;
    }
  }
});

console.log(`Updated ${passedOutCount} students to 'passed_out' status.`);
console.log(`Promoted ${promotedCount} students to the next class.`);

// Write the updated data back to db.json
fs.writeFileSync('./db.json', JSON.stringify(db, null, 2));

console.log('Database updated successfully.');