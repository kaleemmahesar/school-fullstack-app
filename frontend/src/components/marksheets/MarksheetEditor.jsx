import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateMarks } from '../../store/marksSlice';
import { FaEdit, FaSave, FaTimes, FaSearch, FaFilter, FaUserTimes } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';

const MarksheetEditor = () => {
  const dispatch = useDispatch();
  const { students } = useSelector(state => state.students);
  const { marks } = useSelector(state => state.marks);
  
  // Extract marks array from Redux state with improved logic
  const marksArray = useMemo(() => {
    // If marks is already an array, use it directly
    if (Array.isArray(marks)) {
      return marks;
    }
    
    // If marks is an object with a marks property (standard Redux state structure)
    if (marks && typeof marks === 'object' && marks.marks && Array.isArray(marks.marks)) {
      return marks.marks;
    }
    
    // If marks is an object with nested data, flatten it
    if (marks && typeof marks === 'object') {
      const flattened = [];
      
      // Handle different possible structures
      Object.keys(marks).forEach(key => {
        if (key === 'marks' && Array.isArray(marks[key])) {
          // Direct marks array
          flattened.push(...marks[key]);
        } else if (typeof marks[key] === 'object' && marks[key] !== null) {
          // Nested objects
          if (Array.isArray(marks[key])) {
            flattened.push(...marks[key]);
          } else if (marks[key].marks && Array.isArray(marks[key].marks)) {
            flattened.push(...marks[key].marks);
          } else if (marks[key].examType) {
            // Direct marksheet object
            flattened.push(marks[key]);
          }
        }
      });
      
      return flattened;
    }
    
    return [];
  }, [marks]);
  
  const [editingMarks, setEditingMarks] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  
  // Get unique classes, sections, and exam types from marks data
  const availableClasses = [...new Set(marksArray.map(mark => mark.class).filter(Boolean))];
  const availableSections = [...new Set(marksArray.map(mark => mark.section).filter(Boolean))];
  const availableExamTypes = [...new Set(marksArray.map(mark => mark.examType).filter(Boolean))];
  
  // Filter marks based on search and filters
  const filteredMarks = useMemo(() => {
    return marksArray.filter(mark => {
      // Search term filter
      const matchesSearch = !searchTerm || 
        (mark.studentName && mark.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (mark.studentId && mark.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Class filter
      const matchesClass = !selectedClass || mark.class === selectedClass;
      
      // Section filter
      const matchesSection = !selectedSection || mark.section === selectedSection;
      
      // Exam type filter
      const matchesExamType = !selectedExamType || mark.examType === selectedExamType;
      
      return matchesSearch && matchesClass && matchesSection && matchesExamType;
    });
  }, [marksArray, searchTerm, selectedClass, selectedSection, selectedExamType]);
  
  // Get student details by ID
  const getStudentById = (studentId) => {
    return students.find(student => student.id === studentId);
  };
  
  // Handle edit button click
  const handleEdit = (marksheet) => {
    setEditingMarks({ ...marksheet });
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingMarks(null);
  };
  
  // Handle save marks
  const handleSaveMarks = () => {
    if (editingMarks) {
      dispatch(updateMarks(editingMarks));
      setEditingMarks(null);
    }
  };
  
  // Handle marks change for a subject
  const handleSubjectMarksChange = (subjectIndex, field, value) => {
    if (!editingMarks) return;
    
    const updatedMarks = { ...editingMarks };
    const subject = { ...updatedMarks.marks[subjectIndex] };
    
    if (field === 'marksObtained') {
      subject.marksObtained = parseInt(value) || 0;
      // Recalculate grade based on percentage
      const percentage = subject.totalMarks > 0 ? (subject.marksObtained / subject.totalMarks) * 100 : 0;
      subject.grade = calculateGrade(percentage);
    } else {
      subject[field] = value;
    }
    
    updatedMarks.marks[subjectIndex] = subject;
    
    // Recalculate overall totals
    const totalObtained = updatedMarks.marks.reduce((sum, subj) => sum + (parseInt(subj.marksObtained) || 0), 0);
    const totalMarks = updatedMarks.marks.reduce((sum, subj) => sum + (parseInt(subj.totalMarks) || 0), 0);
    const percentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(2) : 0;
    const overallGrade = calculateGrade(parseFloat(percentage));
    
    updatedMarks.totalObtained = totalObtained;
    updatedMarks.totalMarks = totalMarks;
    updatedMarks.percentage = percentage;
    updatedMarks.overallGrade = overallGrade;
    
    setEditingMarks(updatedMarks);
  };
  
  // Calculate grade based on percentage
  const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Marksheet Editor"
        subtitle="Edit and update student marks"
        actions={[]}
      />
      
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by student name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Classes</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sections</option>
              {availableSections.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Exams</option>
              {availableExamTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedClass('');
                setSelectedSection('');
                setSelectedExamType('');
              }}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaFilter className="mr-2" /> Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Marksheets List */}
      {!editingMarks ? (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMarks.length > 0 ? (
                  filteredMarks.map((marksheet) => {
                    const student = getStudentById(marksheet.studentId);
                    return (
                      <tr key={`${marksheet.studentId}-${marksheet.examType}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student ? `${student.firstName} ${student.lastName}` : marksheet.studentName || 'Unknown Student'}
                              </div>
                              <div className="text-sm text-gray-500">ID: {marksheet.studentId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {marksheet.class} - {marksheet.section}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {marksheet.examType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {marksheet.totalObtained || 0}/{marksheet.totalMarks || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {marksheet.percentage ? `${parseFloat(marksheet.percentage).toFixed(2)}%` : '0.00%'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            marksheet.overallGrade === 'A+' ? 'bg-yellow-100 text-yellow-800' :
                            marksheet.overallGrade === 'A' ? 'bg-green-100 text-green-800' :
                            marksheet.overallGrade === 'B+' ? 'bg-blue-100 text-blue-800' :
                            marksheet.overallGrade === 'B' ? 'bg-indigo-100 text-indigo-800' :
                            marksheet.overallGrade === 'C' ? 'bg-purple-100 text-purple-800' :
                            marksheet.overallGrade === 'D' ? 'bg-pink-100 text-pink-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {marksheet.overallGrade || 'F'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(marksheet)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <FaUserTimes className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No marksheets found</h3>
                      <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Edit Marksheet</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleCancelEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaTimes className="mr-2" /> Cancel
              </button>
              <button
                onClick={handleSaveMarks}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                <FaSave className="mr-2" /> Save Changes
              </button>
            </div>
          </div>
          
          {/* Student Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500">Student Name</label>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  {editingMarks.studentName || 'Unknown Student'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Student ID</label>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  {editingMarks.studentId}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Class/Section</label>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  {editingMarks.class} - {editingMarks.section}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Exam Type</label>
                <div className="mt-1 text-sm font-medium text-gray-900">
                  {editingMarks.examType}
                </div>
              </div>
            </div>
          </div>
          
          {/* Subjects Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200 mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {editingMarks.marks.map((subject, index) => {
                  const percentage = subject.totalMarks > 0 ? (subject.marksObtained / subject.totalMarks) * 100 : 0;
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {subject.subjectName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max={subject.totalMarks}
                          value={subject.marksObtained}
                          onChange={(e) => handleSubjectMarksChange(index, 'marksObtained', e.target.value)}
                          className="block w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {subject.totalMarks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {percentage.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subject.grade === 'A+' ? 'bg-yellow-100 text-yellow-800' :
                          subject.grade === 'A' ? 'bg-green-100 text-green-800' :
                          subject.grade === 'B+' ? 'bg-blue-100 text-blue-800' :
                          subject.grade === 'B' ? 'bg-indigo-100 text-indigo-800' :
                          subject.grade === 'C' ? 'bg-purple-100 text-purple-800' :
                          subject.grade === 'D' ? 'bg-pink-100 text-pink-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {subject.grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500">Total Obtained</label>
                <div className="mt-1 text-lg font-bold text-gray-900">
                  {editingMarks.totalObtained || 0}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Total Marks</label>
                <div className="mt-1 text-lg font-bold text-gray-900">
                  {editingMarks.totalMarks || 0}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Percentage</label>
                <div className="mt-1 text-lg font-bold text-gray-900">
                  {editingMarks.percentage ? `${parseFloat(editingMarks.percentage).toFixed(2)}%` : '0.00%'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Overall Grade</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    editingMarks.overallGrade === 'A+' ? 'bg-yellow-100 text-yellow-800' :
                    editingMarks.overallGrade === 'A' ? 'bg-green-100 text-green-800' :
                    editingMarks.overallGrade === 'B+' ? 'bg-blue-100 text-blue-800' :
                    editingMarks.overallGrade === 'B' ? 'bg-indigo-100 text-indigo-800' :
                    editingMarks.overallGrade === 'C' ? 'bg-purple-100 text-purple-800' :
                    editingMarks.overallGrade === 'D' ? 'bg-pink-100 text-pink-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {editingMarks.overallGrade || 'F'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarksheetEditor;