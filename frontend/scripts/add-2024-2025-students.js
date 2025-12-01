import fs from 'fs';

// Read the current db.json file
const db = JSON.parse(fs.readFileSync('./db.json', 'utf8'));

// Pakistani student names
const firstNames = [
  "Ahmed", "Ali", "Bilal", "Danish", "Faisal", "Ghulam", "Hassan", "Imran", "Javed", "Kamran",
  "Liaquat", "Majid", "Nadeem", "Omar", "Pervaiz", "Qasim", "Rashid", "Saeed", "Tariq", "Umar",
  "Waqar", "Yasir", "Zafar", "Asad", "Bashir", "Chaudhry", "Dawood", "Ehsan", "Feroz", "Gulzar",
  "Hamid", "Iqbal", "Jamal", "Khalid", "Latif", "Mansoor", "Nasir", "Obaid", "Parvez", "Qamar"
];

const lastNames = [
  "Abbasi", "Afzal", "Akhtar", "Baig", "Baloch", "Bangash", "Bhatti", "Butt", "Chaudhry", "Dhillon",
  "Durrani", "Farooq", "Gul", "Haider", "Iqbal", "Jafri", "Kazmi", "Khan", "Khokhar", "Khattak",
  "Lone", "Mahmood", "Malik", "Mirza", "Mughal", "Naqvi", "Nawaz", "Qureshi", "Rana", "Saeed",
  "Siddiqui", "Tariq", "Ullah", "Wazir", "Yousaf", "Zaidi", "Zaman", "Afridi", "Kazmi", "Nawaz"
];

// Generate random data for students
const generateStudent = (grNo, className, section, academicYear) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const fatherFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const fatherLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  // Generate random date of birth (5-15 years old)
  const dobYear = 2008 + Math.floor(Math.random() * 8); // 2008-2015
  const dobMonth = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const dobDay = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
  
  // Generate random admission date (2024)
  const admissionYear = "2024";
  const admissionMonth = String(3 + Math.floor(Math.random() * 10)).padStart(2, '0'); // March to December
  const admissionDay = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
  
  const monthlyFees = 1000 + Math.floor(Math.random() * 2000);
  const admissionFees = 500 + Math.floor(Math.random() * 1500);
  
  return {
    "id": `student-1763972279657-${grNo}`,
    "grNo": `${grNo}`,
    "firstName": firstName,
    "lastName": lastName,
    "fatherName": `${fatherFirstName} ${fatherLastName}`,
    "dateOfBirth": `${dobYear}-${dobMonth}-${dobDay}`,
    "dateOfAdmission": `${admissionYear}-${admissionMonth}-${admissionDay}`,
    "class": className,
    "section": section,
    "religion": "Islam",
    "address": `${100 + Math.floor(Math.random() * 900)} ${["Main Street", "Circular Road", "Station Road", "Garden Road", "University Road"][Math.floor(Math.random() * 5)]}, Karachi, Pakistan`,
    "parentContact": `03${Math.floor(100000000 + Math.random() * 900000000)}`,
    "monthlyFees": monthlyFees,
    "admissionFees": admissionFees,
    "totalFees": monthlyFees + admissionFees,
    "feesPaid": admissionFees,
    "status": "studying",
    "academicYear": academicYear,
    "familyId": `family-${Math.floor(Math.random() * 100) + 1}`,
    "photo": `https://i.pravatar.cc/300?img=${grNo % 60 || 1}`,
    "feesHistory": [
      {
        "id": `challan-student-1763972279657-${grNo}-01`,
        "month": "Admission Fees",
        "amount": admissionFees,
        "paid": true,
        "date": `${admissionYear}-${admissionMonth}-${admissionDay}`,
        "dueDate": `${admissionYear}-${admissionMonth}-${admissionDay}`,
        "status": "paid",
        "type": "admission",
        "academicYear": academicYear,
        "paymentTimestamp": "2024-12-01T10:00:00.000Z"
      }
    ]
  };
};

// Classes to add students to
const classes = [
  "PG", "Nursery", "KG", "Class 1", "Class 2", "Class 3", "Class 4", 
  "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
];

// Sections
const sections = ["A", "B"];

// Starting GR number for 2024-2025 batch students
let grNumber = 200;

// Create students for each class and section
const newStudents = [];

classes.forEach(className => {
  sections.forEach(section => {
    // Add 5-7 students per class/section
    const numStudents = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numStudents; i++) {
      newStudents.push(generateStudent(grNumber, className, section, "2024-2025"));
      grNumber++;
    }
  });
});

// Add the new students to the existing students array
db.students = [...db.students, ...newStudents];

// Write the updated data back to db.json
fs.writeFileSync('./db.json', JSON.stringify(db, null, 2));

console.log(`Added ${newStudents.length} students to the 2024-2025 batch.`);
console.log("Students added to classes:", [...new Set(newStudents.map(s => s.class))].sort());