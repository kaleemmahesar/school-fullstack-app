import React, { useState, useEffect } from 'react';
import { FaBook, FaGraduationCap, FaUserGraduate, FaClipboardList } from 'react-icons/fa';

const MarksheetForm = ({ 
  classes, 
  students, 
  formData, 
  setFormData, 
  currentMarks, 
  onSubmit, 
  onCancel 
}) => {
  // Get sections for selected class
  const classSections = formData.class 
    ? classes.find(cls => cls.name === formData.class)?.sections || []
    : [];

  // Get students for selected class and section
  const filteredStudents = students.filter(student => 
    (!formData.class || student.class === formData.class) &&
    (!formData.section || student.section === formData.section)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'studentId') {
      const student = students.find(s => s.id === value);
      setFormData({
        ...formData,
        studentId: value,
        studentName: student ? `${student.firstName} ${student.lastName}` : '',
        class: student ? student.class : '',
        section: student ? student.section : ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleClassChange = (e) => {
    const className = e.target.value;
    setFormData({
      ...formData,
      class: className,
      section: '',
      studentId: '',
      studentName: ''
    });
  };

  const handleSectionChange = (e) => {
    const section = e.target.value;
    setFormData({
      ...formData,
      section: section,
      studentId: '',
      studentName: ''
    });
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    const student = students.find(s => s.id === studentId);
    setFormData({
      ...formData,
      studentId: studentId,
      studentName: student ? `${student.firstName} ${student.lastName}` : '',
      class: student ? student.class : '',
      section: student ? student.section : ''
    });
  };

  // Initialize subject marks when class changes
  useEffect(() => {
    if (formData.class) {
      const classData = classes.find(cls => cls.name === formData.class);
      if (classData && classData.subjects) {
        const subjectMarks = classData.subjects.map(subject => ({
          subjectId: subject.id,
          subjectName: subject.name,
          marksObtained: '',
          totalMarks: 100,
          grade: ''
        }));
        setFormData(prev => ({
          ...prev,
          marks: subjectMarks
        }));
      }
    }
  }, [formData.class, classes, setFormData]);

  const handleMarksChange = (index, field, value) => {
    const updatedMarks = [...formData.marks];
    updatedMarks[index][field] = value;
    
    // Auto-calculate grade based on marks
    if (field === 'marksObtained') {
      const obtained = parseInt(value) || 0;
      const total = parseInt(updatedMarks[index].totalMarks) || 100;
      const percentage = (obtained / total) * 100;
      
      let grade = '';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C';
      else grade = 'F';
      
      updatedMarks[index].grade = grade;
    }
    
    setFormData({
      ...formData,
      marks: updatedMarks
    });
  };

  const calculateTotals = () => {
    const totalObtained = formData.marks.reduce((sum, mark) => sum + (parseInt(mark.marksObtained) || 0), 0);
    const totalMarks = formData.marks.reduce((sum, mark) => sum + (parseInt(mark.totalMarks) || 0), 0);
    const percentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(2) : 0;
    
    // Calculate overall grade
    let overallGrade = '';
    if (percentage >= 90) overallGrade = 'A+';
    else if (percentage >= 80) overallGrade = 'A';
    else if (percentage >= 70) overallGrade = 'B+';
    else if (percentage >= 60) overallGrade = 'B';
    else if (percentage >= 50) overallGrade = 'C';
    else overallGrade = 'F';
    
    return { totalObtained, totalMarks, percentage, overallGrade };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.studentId || !formData.class || !formData.section || 
        !formData.examType || !formData.year || formData.marks.length === 0) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate that all marks are entered
    const allMarksEntered = formData.marks.every(mark => 
      mark.marksObtained !== '' && mark.marksObtained !== null
    );
    
    if (!allMarksEntered) {
      alert('Please enter marks for all subjects');
      return;
    }
    
    const totals = calculateTotals();
    
    const marksData = {
      ...formData,
      ...totals,
      id: currentMarks ? currentMarks.id : Date.now().toString()
    };
    
    onSubmit(marksData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {currentMarks ? 'Edit Marksheet' : 'Add New Marksheet'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaBook className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={formData.class}
                onChange={handleClassChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.name}>{cls.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaGraduationCap className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={formData.section}
                onChange={handleSectionChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.class}
              >
                <option value="">Select Section</option>
                {classSections.map(section => (
                  <option key={section.id} value={section.name}>{section.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUserGraduate className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={formData.studentId}
                onChange={handleStudentChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.class || !formData.section}
              >
                <option value="">Select Student</option>
                {filteredStudents.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaClipboardList className="h-5 w-5 text-gray-400" />
              </div>
              <select
                name="examType"
                value={formData.examType}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Exam Type</option>
                <option value="Midterm">Midterm</option>
                <option value="Final">Final</option>
                <option value="Quiz">Quiz</option>
                <option value="Assignment">Assignment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Subject Marks */}
        {formData.marks.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Subject Marks</h4>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.marks.map((mark, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{mark.subjectName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            value={mark.marksObtained}
                            onChange={(e) => handleMarksChange(index, 'marksObtained', e.target.value)}
                            className="block w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            value={mark.totalMarks}
                            onChange={(e) => handleMarksChange(index, 'totalMarks', e.target.value)}
                            className="block w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{mark.grade || '-'}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Totals */}
        {formData.marks.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Obtained</p>
                <p className="text-lg font-bold text-gray-900">{calculateTotals().totalObtained}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Marks</p>
                <p className="text-lg font-bold text-gray-900">{calculateTotals().totalMarks}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Percentage</p>
                <p className="text-lg font-bold text-gray-900">{calculateTotals().percentage}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Overall Grade</p>
                <p className="text-lg font-bold text-gray-900">{calculateTotals().overallGrade}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {currentMarks ? 'Update Marksheet' : 'Add Marksheet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarksheetForm;