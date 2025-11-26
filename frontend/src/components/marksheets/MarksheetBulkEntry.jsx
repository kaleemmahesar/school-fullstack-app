import React, { useState, useEffect } from 'react';
import { FaCheck, FaSave } from 'react-icons/fa';

const MarksheetBulkEntry = ({ 
  classes, 
  students, 
  bulkData, 
  setBulkData, 
  onSaveMarks 
}) => {
  // Initialize bulk entry when class and section are selected
  useEffect(() => {
    if (bulkData.class && bulkData.section) {
      const classData = classes.find(cls => cls.name === bulkData.class);
      if (classData) {
        const studentsInSection = students.filter(student => 
          student.class === bulkData.class && student.section === bulkData.section
        );
        
        const initialStudentMarks = studentsInSection.map(student => {
          const subjectMarks = classData.subjects ? classData.subjects.map(subject => ({
            subjectId: subject.id,
            subjectName: subject.name,
            marksObtained: '',
            totalMarks: 100,
            grade: ''
          })) : [];
          
          return {
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            marks: subjectMarks,
            completed: false
          };
        });
        
        setBulkData(prev => ({
          ...prev,
          studentMarks: initialStudentMarks
        }));
      }
    }
  }, [bulkData.class, bulkData.section, classes, students, setBulkData]);

  const handleBulkClassChange = (e) => {
    const className = e.target.value;
    setBulkData({
      ...bulkData,
      class: className,
      section: '',
      studentMarks: []
    });
  };

  const handleBulkSectionChange = (e) => {
    const section = e.target.value;
    setBulkData({
      ...bulkData,
      section: section,
      studentMarks: []
    });
  };

  const handleBulkExamTypeChange = (e) => {
    setBulkData({
      ...bulkData,
      examType: e.target.value
    });
  };

  const handleBulkYearChange = (e) => {
    setBulkData({
      ...bulkData,
      year: e.target.value
    });
  };

  const handleBulkMarksChange = (studentIndex, subjectIndex, field, value) => {
    const updatedStudentMarks = [...bulkData.studentMarks];
    updatedStudentMarks[studentIndex].marks[subjectIndex][field] = value;
    
    // Auto-calculate grade based on marks
    if (field === 'marksObtained') {
      const obtained = parseInt(value) || 0;
      const total = parseInt(updatedStudentMarks[studentIndex].marks[subjectIndex].totalMarks) || 100;
      const percentage = (obtained / total) * 100;
      
      let grade = '';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C';
      else grade = 'F';
      
      updatedStudentMarks[studentIndex].marks[subjectIndex].grade = grade;
    }
    
    setBulkData({
      ...bulkData,
      studentMarks: updatedStudentMarks
    });
  };

  const markStudentAsCompleted = (studentIndex) => {
    const updatedStudentMarks = [...bulkData.studentMarks];
    updatedStudentMarks[studentIndex].completed = true;
    setBulkData({
      ...bulkData,
      studentMarks: updatedStudentMarks
    });
  };

  const saveBulkMarks = (studentIndex) => {
    const studentData = bulkData.studentMarks[studentIndex];
    
    // Validate that all marks are entered
    const allMarksEntered = studentData.marks.every(mark => 
      mark.marksObtained !== '' && mark.marksObtained !== null
    );
    
    if (!allMarksEntered) {
      alert(`Please enter marks for all subjects for ${studentData.studentName}`);
      return;
    }
    
    // Calculate totals
    const totalObtained = studentData.marks.reduce((sum, mark) => sum + (parseInt(mark.marksObtained) || 0), 0);
    const totalMarks = studentData.marks.reduce((sum, mark) => sum + (parseInt(mark.totalMarks) || 0), 0);
    const percentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(2) : 0;
    
    // Calculate overall grade
    let overallGrade = '';
    if (percentage >= 90) overallGrade = 'A+';
    else if (percentage >= 80) overallGrade = 'A';
    else if (percentage >= 70) overallGrade = 'B+';
    else if (percentage >= 60) overallGrade = 'B';
    else if (percentage >= 50) overallGrade = 'C';
    else overallGrade = 'F';
    
    const marksData = {
      studentId: studentData.studentId,
      studentName: studentData.studentName,
      class: bulkData.class,
      section: bulkData.section,
      examType: bulkData.examType,
      year: bulkData.year,
      marks: studentData.marks,
      totalObtained,
      totalMarks,
      percentage,
      overallGrade,
      id: Date.now().toString() + studentIndex
    };
    
    onSaveMarks(marksData);
    markStudentAsCompleted(studentIndex);
  };

  // Get sections for selected class
  const classSections = bulkData.class 
    ? classes.find(cls => cls.name === bulkData.class)?.sections || []
    : [];

  // Get students for bulk entry
  const bulkFilteredStudents = students.filter(student => 
    (bulkData.class && student.class === bulkData.class) &&
    (bulkData.section && student.section === bulkData.section)
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Bulk Marksheet Entry
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            value={bulkData.class}
            onChange={handleBulkClassChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.name}>{cls.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
          <select
            value={bulkData.section}
            onChange={handleBulkSectionChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={!bulkData.class}
          >
            <option value="">Select Section</option>
            {bulkData.class && classSections.map(section => (
              <option key={section.id} value={section.name}>{section.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
          <select
            value={bulkData.examType}
            onChange={handleBulkExamTypeChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Exam Type</option>
            <option value="Midterm">Midterm</option>
            <option value="Final">Final</option>
            <option value="Quiz">Quiz</option>
            <option value="Assignment">Assignment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input
            type="number"
            value={bulkData.year}
            onChange={handleBulkYearChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      {bulkData.class && bulkData.section && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Enter Marks for Students in {bulkData.class} - {bulkData.section}
          </h4>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    {bulkData.studentMarks.length > 0 && bulkData.studentMarks[0].marks.map((mark, index) => (
                      <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {mark.subjectName}
                      </th>
                    ))}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bulkData.studentMarks.map((student, studentIndex) => (
                    <tr key={studentIndex} className={student.completed ? 'bg-green-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                      </td>
                      {student.marks.map((mark, subjectIndex) => (
                        <td key={subjectIndex} className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max={mark.totalMarks}
                            value={mark.marksObtained}
                            onChange={(e) => handleBulkMarksChange(studentIndex, subjectIndex, 'marksObtained', e.target.value)}
                            className="block w-20 px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            disabled={student.completed}
                          />
                          <div className="text-xs text-gray-500 mt-1">{mark.grade || '-'}</div>
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.completed ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaCheck className="mr-1" /> Saved
                          </span>
                        ) : (
                          <button
                            onClick={() => saveBulkMarks(studentIndex)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <FaSave className="mr-1" /> Save
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500 mt-4">
        <p>Tip: Enter marks for all subjects for each student, then click "Save" to save their marksheet.</p>
      </div>
    </div>
  );
};

export default MarksheetBulkEntry;