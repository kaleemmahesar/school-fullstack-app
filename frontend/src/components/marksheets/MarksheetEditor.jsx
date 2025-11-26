import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateMarks } from '../../store/marksSlice';
import { FaEdit, FaSave, FaTimes, FaSearch, FaFilter, FaUserTimes } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';

const MarksheetEditor = () => {
  const dispatch = useDispatch();
  const { students } = useSelector(state => state.students);
  const { marks } = useSelector(state => state.marks);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [examType, setExamType] = useState('Midterm');
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString());
  const [editingMarks, setEditingMarks] = useState(null);
  const [editedMarksData, setEditedMarksData] = useState({});

  // Get unique classes for dropdown
  const uniqueClasses = [...new Set(students.map(student => student.class))];

  // Get sections for selected class
  const classSections = selectedClass 
    ? [...new Set(students
        .filter(student => student.class === selectedClass)
        .map(student => student.section))]
    : [];

  // Filter students based on search term, class, and section
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = !selectedClass || student.class === selectedClass;
    const matchesSection = !selectedSection || student.section === selectedSection;
    
    return matchesSearch && matchesClass && matchesSection;
  });

  // Get marks for a student in the selected exam
  const getStudentMarks = (studentId) => {
    return marks.find(mark => 
      mark.studentId === studentId && 
      mark.examType === examType && 
      mark.year === examYear
    );
  };

  // Start editing marks for a student
  const startEditing = (student) => {
    const studentMarks = getStudentMarks(student.id);
    if (studentMarks) {
      setEditingMarks(studentMarks);
      setEditedMarksData({
        ...studentMarks,
        marks: [...studentMarks.marks] // Create a copy of the marks array
      });
    }
  };

  // Update subject marks
  const updateSubjectMarks = (subjectIndex, field, value) => {
    const updatedMarks = [...editedMarksData.marks];
    updatedMarks[subjectIndex] = {
      ...updatedMarks[subjectIndex],
      [field]: field === 'marksObtained' ? parseInt(value) || 0 : value
    };
    
    // Recalculate grade based on marks
    if (field === 'marksObtained') {
      const percentage = (parseInt(value) || 0) / updatedMarks[subjectIndex].totalMarks * 100;
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C';
      else if (percentage >= 40) grade = 'D';
      
      updatedMarks[subjectIndex].grade = grade;
    }
    
    setEditedMarksData({
      ...editedMarksData,
      marks: updatedMarks
    });
  };

  // Mark student as absent
  const markAsAbsent = () => {
    const updatedMarks = editedMarksData.marks.map(subject => ({
      ...subject,
      marksObtained: 0,
      grade: 'F'
    }));
    
    setEditedMarksData({
      ...editedMarksData,
      marks: updatedMarks,
      totalObtained: 0,
      percentage: 0,
      overallGrade: 'F',
      remarks: 'Absent'
    });
  };

  // Save edited marks
  const saveEditedMarks = () => {
    // Recalculate totals
    const totalObtained = editedMarksData.marks.reduce((sum, subject) => sum + subject.marksObtained, 0);
    const totalMarks = editedMarksData.marks.reduce((sum, subject) => sum + subject.totalMarks, 0);
    const percentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;
    
    // Calculate overall grade
    let overallGrade = 'F';
    if (percentage >= 90) overallGrade = 'A+';
    else if (percentage >= 80) overallGrade = 'A';
    else if (percentage >= 70) overallGrade = 'B+';
    else if (percentage >= 60) overallGrade = 'B';
    else if (percentage >= 50) overallGrade = 'C';
    else if (percentage >= 40) overallGrade = 'D';
    
    const updatedMarks = {
      ...editedMarksData,
      totalObtained,
      totalMarks,
      percentage,
      overallGrade
    };
    
    dispatch(updateMarks(updatedMarks));
    setEditingMarks(null);
    setEditedMarksData({});
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingMarks(null);
    setEditedMarksData({});
  };

  return (
    <>
      <PageHeader
        title="Marksheet Editor"
        subtitle="Edit, modify, and update student marks"
        actionButton={null}
      />

      {/* Filters and Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Midterm">Midterm</option>
              <option value="Final">Final</option>
              <option value="Test">Test</option>
              <option value="Quiz">Quiz</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Year</label>
            <input
              type="number"
              value={examYear}
              onChange={(e) => setExamYear(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              min="2020"
              max="2030"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection(''); // Reset section when class changes
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClass}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sections</option>
              {classSections.map((section) => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Editing Panel */}
      {editingMarks && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Editing Marks for {editingMarks.studentName}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={markAsAbsent}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaUserTimes className="mr-2" /> Mark as Absent
              </button>
              <button
                onClick={cancelEditing}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaTimes className="mr-2" /> Cancel
              </button>
              <button
                onClick={saveEditedMarks}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaSave className="mr-2" /> Save Changes
              </button>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {editedMarksData.marks.map((subject, index) => (
                  <tr key={subject.subjectId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subject.subjectName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subject.totalMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={subject.marksObtained}
                        onChange={(e) => updateSubjectMarks(index, 'marksObtained', e.target.value)}
                        className="block w-24 px-3 py-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max={subject.totalMarks}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {subject.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">Total</td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {editedMarksData.marks.reduce((sum, subject) => sum + subject.totalMarks, 0)}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    {editedMarksData.marks.reduce((sum, subject) => sum + subject.marksObtained, 0)}
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {editedMarksData.overallGrade}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea
                value={editedMarksData.remarks || ''}
                onChange={(e) => setEditedMarksData({...editedMarksData, remarks: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Add any remarks about the student's performance..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Students with Marks ({filteredStudents.filter(student => getStudentMarks(student.id)).length})
        </h3>
        
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const studentMarks = getStudentMarks(student.id);
                if (!studentMarks) return null;
                
                const isAbsent = studentMarks.remarks && studentMarks.remarks.toLowerCase().includes('absent');
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">ID: {student.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.class}</div>
                      <div className="text-sm text-gray-500">Section {student.section}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {studentMarks.percentage.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {studentMarks.overallGrade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isAbsent 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isAbsent ? 'Absent' : 'Present'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => startEditing(student)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaEdit className="mr-1" /> Edit Marks
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredStudents.filter(student => getStudentMarks(student.id)).length === 0 && (
            <div className="text-center py-12">
              <FaEdit className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students with marks found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MarksheetEditor;