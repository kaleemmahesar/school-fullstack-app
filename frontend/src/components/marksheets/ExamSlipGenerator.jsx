import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FaFileAlt, FaPrint, FaDownload, FaSearch, FaFilter } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';

const ExamSlipGenerator = () => {
  const { students } = useSelector(state => state.students);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [examType, setExamType] = useState('Midterm');
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString());
  const [showPreview, setShowPreview] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const printRef = useRef();

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

  // Generate exam slip for a student
  const generateExamSlip = (student) => {
    setSelectedStudent(student);
    setShowPreview(true);
  };

  // Print exam slip
  const printExamSlip = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Exam Slip</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .exam-slip { max-width: 800px; margin: 0 auto; }
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

  // Download exam slip as PDF
  const downloadExamSlip = () => {
    // In a real implementation, this would generate and download a PDF
    alert('Downloading exam slip as PDF...');
  };

  return (
    <>
      <PageHeader
        title="Exam Slip Generator"
        subtitle="Generate and print exam slips for all students in one click"
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
        
        <div className="flex justify-end">
          <button
            onClick={() => {
              // Generate exam slips for all filtered students
              alert(`Generated exam slips for ${filteredStudents.length} students`);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <FaFileAlt className="mr-2" /> Generate All Exam Slips
          </button>
        </div>
      </div>

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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* In a real implementation, this would show the assigned roll number */}
                    Not Assigned
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => generateExamSlip(student)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaFileAlt className="mr-1" /> Generate Slip
                    </button>
                  </td>
                </tr>
              ))}
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

      {/* Exam Slip Preview */}
      {showPreview && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Exam Slip Preview</h3>
              <div className="flex space-x-2">
                <button
                  onClick={printExamSlip}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 no-print"
                >
                  <FaPrint className="mr-2" /> Print
                </button>
                <button
                  onClick={downloadExamSlip}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 no-print"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700 no-print"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="py-6 px-6">
              <div ref={printRef} className="exam-slip">
                <div className="header">
                  <h1>SCHOOL MANAGEMENT SYSTEM</h1>
                  <h2>Exam Slip</h2>
                  <p>{examType} Examination {examYear}</p>
                </div>
                
                <div className="student-info">
                  <div className="info-row">
                    <div className="info-label">Student Name:</div>
                    <div className="info-value">{selectedStudent.firstName} {selectedStudent.lastName}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Student ID:</div>
                    <div className="info-value">{selectedStudent.id}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Class/Section:</div>
                    <div className="info-value">{selectedStudent.class} - Section {selectedStudent.section}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Roll Number:</div>
                    <div className="info-value">Not Assigned</div>
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
                      <th>Date</th>
                      <th>Time</th>
                      <th>Room Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Mathematics</td>
                      <td>{new Date().toLocaleDateString()}</td>
                      <td>09:00 AM - 11:00 AM</td>
                      <td>Room 101</td>
                    </tr>
                    <tr>
                      <td>English</td>
                      <td>{new Date().toLocaleDateString()}</td>
                      <td>11:30 AM - 01:30 PM</td>
                      <td>Room 102</td>
                    </tr>
                    <tr>
                      <td>Science</td>
                      <td>{new Date().toLocaleDateString()}</td>
                      <td>02:00 PM - 04:00 PM</td>
                      <td>Room 103</td>
                    </tr>
                    <tr>
                      <td>History</td>
                      <td>{new Date().toLocaleDateString()}</td>
                      <td>04:30 PM - 06:30 PM</td>
                      <td>Room 104</td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="footer">
                  <p><strong>Important Instructions:</strong></p>
                  <p>1. Bring your admit card and valid ID to the examination hall.</p>
                  <p>2. Arrive at least 30 minutes before the exam starts.</p>
                  <p>3. No electronic devices are allowed in the examination hall.</p>
                  <p>4. Follow all instructions given by the invigilators.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExamSlipGenerator;