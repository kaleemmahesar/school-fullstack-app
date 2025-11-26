# Marksheet Form Fix

## Issue Identified
The class-based marksheet entry form was not displaying properly due to an issue with the useEffect hook not correctly initializing the subject marks and student marks when a class and section were selected.

## Root Cause
The useEffect hook in the ClassExamMarksheetForm component was not properly accessing the class subjects and student data. The dependencies were not correctly set up to trigger the initialization when the selected class and section changed.

## Fix Applied
1. Updated the useEffect hook to properly access class data and subjects
2. Ensured the hook correctly initializes subject marks and student marks when class and section are selected
3. Fixed the dependency array to include all necessary dependencies

## Changes Made

### File: src/components/marksheets/ClassExamMarksheetForm.jsx

```javascript
// Before (problematic useEffect):
useEffect(() => {
  if (selectedClass && selectedSection) {
    // Initialize subject marks structure
    const initialSubjectMarks = classSubjects.map(subject => ({
      subjectId: subject.id,
      subjectName: subject.name,
      totalMarks: 100
    }));
    setSubjectMarks(initialSubjectMarks);
    
    // Initialize student marks structure
    const initialStudentMarks = filteredStudents.map(student => ({
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      marks: initialSubjectMarks.map(subject => ({
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        marksObtained: '',
        totalMarks: subject.totalMarks,
        grade: ''
      }))
    }));
    setStudentMarks(initialStudentMarks);
  }
}, [selectedClass, selectedSection, classes, students, classSubjects, filteredStudents]);

// After (fixed useEffect):
useEffect(() => {
  if (selectedClass && selectedSection) {
    // Get subjects for selected class
    const classData = classes.find(cls => cls.name === selectedClass);
    const subjects = classData?.subjects || [];
    
    // Initialize subject marks structure
    const initialSubjectMarks = subjects.map(subject => ({
      subjectId: subject.id,
      subjectName: subject.name,
      totalMarks: 100
    }));
    setSubjectMarks(initialSubjectMarks);
    
    // Get students for selected class and section
    const studentsInClass = students.filter(student => 
      student.class === selectedClass && student.section === selectedSection
    );
    
    // Initialize student marks structure
    const initialStudentMarks = studentsInClass.map(student => ({
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      marks: initialSubjectMarks.map(subject => ({
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        marksObtained: '',
        totalMarks: subject.totalMarks,
        grade: ''
      }))
    }));
    setStudentMarks(initialStudentMarks);
  }
}, [selectedClass, selectedSection, classes, students]);
```

## Verification
The fix has been tested and verified to:
1. Properly display the class selection form
2. Correctly load subjects when a class is selected
3. Show students in the selected class and section
4. Display the mark entry form with proper subject columns
5. Allow entering marks for all students and subjects
6. Calculate grades automatically based on entered marks

## Testing
The application has been tested to ensure:
- No runtime errors occur when selecting classes and sections
- Subjects are correctly loaded for each class
- Students are properly filtered by class and section
- The mark entry form displays correctly with all subjects
- Grade calculations work accurately
- All existing functionality remains intact