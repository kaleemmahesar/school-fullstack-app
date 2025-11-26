import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMarks, updateMarks } from '../../store/marksSlice';
import { FaFileAlt, FaTrophy, FaSearch, FaFilter, FaSave, FaDownload, FaPrint } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';

const MarksheetGenerator = () => {
  const dispatch = useDispatch();
  const { students } = useSelector(state => state.students);
  const { marks } = useSelector(state => state.marks);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [examType, setExamType] = useState('Midterm');
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString());
  const [showRanking, setShowRanking] = useState(false);
  const [printPreview, setPrintPreview] = useState(null);

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

  // Generate marksheet for a student
  const generateMarksheet = (student) => {
    const studentMarks = getStudentMarks(student.id);
    if (!studentMarks) {
      alert('No marks found for this student');
      return;
    }
    
    setPrintPreview({
      student,
      marks: studentMarks
    });
  };

  // Auto-rank students based on their performance
  const autoRankStudents = () => {
    // Get students with marks for the selected exam
    const studentsWithMarks = filteredStudents.map(student => {
      const studentMarks = getStudentMarks(student.id);
      return {
        ...student,
        marks: studentMarks,
        percentage: studentMarks ? studentMarks.percentage : 0
      };
    }).filter(student => student.marks); // Only students with marks
    
    // Sort by percentage in descending order
    const rankedStudents = studentsWithMarks.sort((a, b) => b.percentage - a.percentage);
    
    // Assign ranks
    const rankedWithRanks = rankedStudents.map((student, index) => ({
      ...student,
      rank: index + 1
    }));
    
    return rankedWithRanks;
  };

  // Generate all marksheets
  const generateAllMarksheets = () => {
    // In a real implementation, this would generate marksheets for all students
    alert(`Generated marksheets for ${filteredStudents.length} students`);
  };

  // Update positions/ranks
  const updatePositions = () => {
    const rankedStudents = autoRankStudents();
    // In a real implementation, this would update the marks with ranks
    alert(`Updated positions for ${rankedStudents.length} students`);
  };

  // Print marksheet
  const printMarksheet = () => {
    if (!printPreview) return;
    
    const printContent = document.getElementById('marksheet-print-content').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Marksheet - ${printPreview.student.firstName} ${printPreview.student.lastName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .marksheet { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .student-info { margin-bottom: 20px; }
            .info-row { display: flex; margin-bottom: 5px; }
            .info-label { font-weight: bold; width: 150px; }
            .info-value { flex: 1; }
            .subjects { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .subjects th, .subjects td { border: 1px solid #333; padding: 8px; text-align: left; }
            .subjects th { background-color: #f0f0f0; }
            .footer { text-align: center; margin-top: 30px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Download marksheet as PDF
  const downloadMarksheet = () => {
    // In a real implementation, this would generate and download a PDF
    alert('Downloading marksheet as PDF...');
  };

  return (
    <>
      <PageHeader
        title="Marksheet Generator"
        subtitle="Generate marksheets for all students and auto-rank positions"
        actionButton={
          <div className="flex space-x-2">
            <button
              onClick={updatePositions}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <FaTrophy className="mr-2" /> Update Positions
            </button>
            <button
              onClick={generateAllMarksheets}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <FaFileAlt className="mr-2" /> Generate All Marksheets
            </button>
          </div>
        }
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
        
        <div className="flex justify-end">
          <button
            onClick={() => setShowRanking(!showRanking)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <FaTrophy className="mr-2" /> {showRanking ? 'Hide' : 'Show'} Rankings
          </button>
        </div>
      </div>

      {/* Rankings Table */}
      {showRanking && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Rankings</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {autoRankStudents().map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
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
                      {student.percentage.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {student.marks?.overallGrade || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {autoRankStudents().length === 0 && (
              <div className="text-center py-12">
                <FaTrophy className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No rankings available</h3>
                <p className="mt-1 text-sm text-gray-500">No students have marks entered for this exam</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Students ({filteredStudents.length})
        </h3>
        
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const studentMarks = getStudentMarks(student.id);
                
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        studentMarks
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {studentMarks ? 'Marks Entered' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {studentMarks ? `${studentMarks.percentage.toFixed(2)}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {!studentMarks && (
                          <button
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Enter Marks
                          </button>
                        )}
                        {studentMarks && (
                          <>
                            <button
                              onClick={() => generateMarksheet(student)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <FaFileAlt className="mr-1" /> View
                            </button>
                            <button
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <FaSave className="mr-1" /> Update
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Marksheet Print Preview */}
      {printPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Marksheet Preview</h3>
              <div className="flex space-x-2">
                <button
                  onClick={printMarksheet}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 no-print"
                >
                  <FaPrint className="mr-2" /> Print
                </button>
                <button
                  onClick={downloadMarksheet}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 no-print"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
                <button
                  onClick={() => setPrintPreview(null)}
                  className="text-gray-500 hover:text-gray-700 no-print"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="py-6 px-6">
              <div id="marksheet-print-content" className="marksheet">
                <div className="header">
                  <h1>SCHOOL MANAGEMENT SYSTEM</h1>
                  <h2>Student Marksheet</h2>
                  <p>{examType} Examination {examYear}</p>
                </div>
                
                <div className="student-info">
                  <div className="info-row">
                    <div className="info-label">Student Name:</div>
                    <div className="info-value">{printPreview.student.firstName} {printPreview.student.lastName}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Student ID:</div>
                    <div className="info-value">{printPreview.student.id}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Class/Section:</div>
                    <div className="info-value">{printPreview.student.class} - Section {printPreview.student.section}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Exam Date:</div>
                    <div className="info-value">{new Date().toLocaleDateString()}</div>
                  </div>
                </div>
                
                <table className="subjects">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Total Marks</th>
                      <th>Marks Obtained</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printPreview.marks.marks.map((subject, index) => (
                      <tr key={index}>
                        <td>{subject.subjectName}</td>
                        <td>{subject.totalMarks}</td>
                        <td>{subject.marksObtained}</td>
                        <td>{subject.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td><strong>Total</strong></td>
                      <td><strong>{printPreview.marks.totalMarks}</strong></td>
                      <td><strong>{printPreview.marks.totalObtained}</strong></td>
                      <td><strong>{printPreview.marks.overallGrade}</strong></td>
                    </tr>
                  </tfoot>
                </table>
                
                <div className="footer">
                  <p>Percentage: {printPreview.marks.percentage}%</p>
                  <p className="signature-line">Signature: _________________________</p>
                  <p className="date-line">Date: _________________________</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MarksheetGenerator;