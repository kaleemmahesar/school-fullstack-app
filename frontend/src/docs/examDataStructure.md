# Examination Data Structure

This document describes the data structure used for managing examinations in the school management system.

## Exam Object

```javascript
{
  id: '1',
  name: 'Midterm Examination',
  class: 'Class 10',
  section: 'A',
  examType: 'Midterm',
  startDate: '2023-10-15',
  endDate: '2023-10-20',
  subjects: [
    { 
      id: '10math', 
      name: 'Mathematics', 
      date: '2023-10-15', 
      time: '09:00', 
      duration: 180 
    },
    // ... more subjects
  ],
  maxMarks: 100,
  status: 'scheduled'
}
```

## Properties

### Exam Properties

| Property | Type | Description |
|----------|------|-------------|
| id | string | Unique identifier for the exam |
| name | string | Name of the examination |
| class | string | Class for which the exam is conducted |
| section | string | Section of the class (optional) |
| examType | string | Type of exam (Midterm, Final, Quiz, etc.) |
| startDate | string | Start date of the examination (YYYY-MM-DD) |
| endDate | string | End date of the examination (YYYY-MM-DD) |
| subjects | array | Array of subject objects |
| maxMarks | number | Maximum marks for each subject |
| status | string | Current status of the exam (scheduled, ongoing, completed) |

### Subject Properties

| Property | Type | Description |
|----------|------|-------------|
| id | string | Unique identifier for the subject |
| name | string | Name of the subject |
| date | string | Date of the subject exam (YYYY-MM-DD) |
| time | string | Time of the subject exam (HH:MM) |
| duration | number | Duration of the exam in minutes |

## Usage Examples

### Creating a New Exam

```javascript
const newExam = {
  name: 'Final Examination',
  class: 'Class 9',
  section: 'B',
  examType: 'Final',
  startDate: '2023-12-01',
  endDate: '2023-12-10',
  subjects: [
    { 
      id: '9math', 
      name: 'Mathematics', 
      date: '2023-12-01', 
      time: '09:00', 
      duration: 180 
    }
  ],
  maxMarks: 100,
  status: 'scheduled'
};
```

### Updating Exam Status

```javascript
const updatedExam = {
  ...exam,
  status: 'ongoing'
};
```

## Integration with Other Modules

### Relationship with Students
- Exams are associated with specific classes and sections
- Student performance in exams is tracked in the marks module

### Relationship with Classes
- Exams inherit subject information from class configurations
- Class teachers can be associated with specific subjects in exams

### Relationship with Marks
- Exam results are stored as marksheet entries
- Each subject in an exam corresponds to a subject mark entry