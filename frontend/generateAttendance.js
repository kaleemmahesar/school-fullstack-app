import fs from 'fs';

// Function to generate dates for a month excluding weekends and holidays
function generateWorkingDays(year, month, holidays, weekendDays = [0]) {
  const days = [];
  const lastDay = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Skip weekend days
    if (weekendDays.includes(dayOfWeek)) {
      continue;
    }
    
    // Skip holidays
    const dateString = date.toISOString().split('T')[0];
    if (holidays.includes(dateString)) {
      continue;
    }
    
    days.push(dateString);
  }
  
  return days;
}

// Function to generate attendance records for students
function generateAttendanceRecords(students, dates, classId) {
  const records = [];
  
  dates.forEach(date => {
    const studentRecords = students.map(student => {
      // Generate mostly "present" with occasional "absent"
      const status = Math.random() < 0.9 ? 'present' : 'absent';
      
      return {
        studentId: student.id,
        grNo: student.grNo,
        studentName: `${student.firstName} ${student.lastName}`,
        status: status
      };
    });
    
    records.push({
      id: `attendance-${classId}-${date}`,
      date: date,
      classId: classId,
      academicYear: "2025-2026",
      records: studentRecords
    });
  });
  
  return records;
}

// Main function
function main() {
  // Read the db.json file
  const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  
  // Get students
  const students = db.students;
  
  // Define holidays
  const holidays = [
    "2025-11-21" // Pakistan Day
  ];
  
  // Get weekend days from settings or default to Sunday only
  const weekendDays = db.settings && db.settings.weekendDays && Array.isArray(db.settings.weekendDays) 
    ? db.settings.weekendDays 
    : [0]; // Default to Sunday only
  
  // Generate working days for October 2025 (month 9)
  const octoberDays = generateWorkingDays(2025, 9, holidays, weekendDays);
  console.log(`October working days: ${octoberDays.length}`);
  
  // Generate working days for November 2025 (month 10)
  const novemberDays = generateWorkingDays(2025, 10, holidays, weekendDays);
  console.log(`November working days: ${novemberDays.length}`);
  
  // Get unique classes
  const classes = [...new Set(students.map(student => student.class))];
  console.log(`Classes: ${classes.join(', ')}`);
  
  // Generate attendance records for each class
  let allAttendanceRecords = [];
  
  classes.forEach(classId => {
    const classStudents = students.filter(student => student.class === classId);
    console.log(`Generating records for ${classId} with ${classStudents.length} students`);
    
    // Generate October records
    const octoberRecords = generateAttendanceRecords(classStudents, octoberDays, classId);
    
    // Generate November records
    const novemberRecords = generateAttendanceRecords(classStudents, novemberDays, classId);
    
    allAttendanceRecords = [...allAttendanceRecords, ...octoberRecords, ...novemberRecords];
  });
  
  console.log(`Generated ${allAttendanceRecords.length} attendance records`);
  
  // Update the db.json file
  db.studentsAttendance = allAttendanceRecords;
  
  // Write back to db.json
  fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
  
  console.log('Attendance records generated and saved to db.json');
}

main();