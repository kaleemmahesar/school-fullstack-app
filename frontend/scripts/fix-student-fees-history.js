import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to db.json
const dbPath = path.join(__dirname, '..', 'db.json');

// Read the db.json file
const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Process each student to add feesHistory if missing
const updatedStudents = dbData.students.map(student => {
  // If student already has feesHistory, don't modify it
  if (student.feesHistory && student.feesHistory.length > 0) {
    return student;
  }
  
  // Create feesHistory array with admission fees record
  const feesHistory = [];
  
  // Only add admission fees record if admissionFees > 0
  if (student.admissionFees > 0) {
    // Determine academic year based on admission date
    const admissionDate = new Date(student.dateOfAdmission || new Date());
    const admissionYear = admissionDate.getFullYear();
    const nextYear = admissionYear + 1;
    const academicYear = `${admissionYear}-${nextYear}`;
    
    feesHistory.push({
      id: `challan-${student.id}-0`,
      month: 'Admission Fees',
      amount: student.admissionFees,
      paid: true,
      date: student.dateOfAdmission || new Date().toISOString(),
      dueDate: student.dateOfAdmission || new Date().toISOString().split('T')[0],
      status: 'paid',
      type: 'admission',
      academicYear,
      // Add timestamp for when admission fee was processed
      paymentTimestamp: student.admissionTimestamp || new Date().toISOString()
    });
  }
  
  // Return student with updated feesHistory
  return {
    ...student,
    feesHistory
  };
});

// Update the db data
const updatedDbData = {
  ...dbData,
  students: updatedStudents
};

// Write the updated data back to db.json
fs.writeFileSync(dbPath, JSON.stringify(updatedDbData, null, 2));

console.log(`Updated ${updatedStudents.length} students with feesHistory records.`);
console.log('Successfully updated db.json with admission fees history for all students.');