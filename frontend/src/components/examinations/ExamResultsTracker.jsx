import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaChartBar, FaChartLine, FaChartPie, FaFileExcel, FaSearch } from 'react-icons/fa';

const ExamResultsTracker = () => {
  const dispatch = useDispatch();
  const { exams } = useSelector(state => state.exams);
  const { students } = useSelector(state => state.students);
  const { marks } = useSelector(state => state.marks);
  
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'chart', 'summary'
  
  // Get unique classes from exams
  const examClasses = [...new Set(exams.map(exam => exam.class))];
  
  // Get all unique classes from students if no exam classes available
  const allStudentClasses = [...new Set(students.map(student => student.class))];
  
  // Use exam classes if available, otherwise use all student classes
  const availableClasses = examClasses.length > 0 ? examClasses : allStudentClasses;
  
  // Get sections for selected class
  const getSectionsForClass = (className) => {
    const exam = exams.find(e => e.class === className);
    return exam ? [...new Set(exams.filter(e => e.class === className).map(e => e.section))] : [];
  };
  
  // Get exams for selected class and section
  const getExamsForClassSection = (className, sectionName) => {
    return exams.filter(exam => 
      exam.class === className && 
      (sectionName ? exam.section === sectionName : true)
    );
  };
  
  // Get students for selected class and section
  const getStudentsForClassSection = (className, sectionName) => {
    return students.filter(student => 
      student.class === className && 
      (sectionName ? student.section === sectionName : true)
    );
  };
  
  // Get marks for selected exam
  const getMarksForExam = (examId) => {
    return marks.filter(mark => mark.examType === exams.find(e => e.id === examId)?.examType);
  };
  
  // Calculate statistics for the selected exam
  const calculateExamStatistics = () => {
    if (!selectedExam) return null;
    
    const examMarks = getMarksForExam(selectedExam);
    if (examMarks.length === 0) return null;
    
    // Calculate overall statistics
    const totalStudents = examMarks.length;
    const averagePercentage = examMarks.reduce((sum, mark) => sum + parseFloat(mark.percentage), 0) / totalStudents;
    
    // Grade distribution
    const gradeDistribution = {
      'A+': 0,
      'A': 0,
      'B+': 0,
      'B': 0,
      'C': 0,
      'D': 0,
      'F': 0
    };
    
    examMarks.forEach(mark => {
      const grade = mark.overallGrade;
      if (gradeDistribution.hasOwnProperty(grade)) {
        gradeDistribution[grade]++;
      }
    });
    
    // Subject-wise performance
    const subjectPerformance = {};
    examMarks.forEach(mark => {
      mark.marks.forEach(subjectMark => {
        if (!subjectPerformance[subjectMark.subjectName]) {
          subjectPerformance[subjectMark.subjectName] = {
            total: 0,
            count: 0,
            average: 0
          };
        }
        subjectPerformance[subjectMark.subjectName].total += subjectMark.marksObtained;
        subjectPerformance[subjectMark.subjectName].count++;
      });
    });
    
    // Calculate averages
    Object.keys(subjectPerformance).forEach(subject => {
      subjectPerformance[subject].average = 
        subjectPerformance[subject].total / subjectPerformance[subject].count;
    });
    
    return {
      totalStudents,
      averagePercentage: averagePercentage.toFixed(2),
      gradeDistribution,
      subjectPerformance
    };
  };
  
  const stats = calculateExamStatistics();
  
  // Filter students based on search term
  const filteredStudents = getStudentsForClassSection(selectedClass, selectedSection).filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.includes(searchTerm)
  );
  
  // Get marks for a specific student in the selected exam
  const getStudentMarks = (studentId) => {
    if (!selectedExam) return null;
    const exam = exams.find(e => e.id === selectedExam);
    if (!exam) return null;
    
    return marks.find(mark => 
      mark.studentId === studentId && 
      mark.examType === exam.examType
    );
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exam Results Tracker</h2>
          <p className="text-gray-600">Track and analyze student performance in examinations</p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              viewMode === 'list' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              viewMode === 'chart' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Charts
          </button>
          <button
            onClick={() => setViewMode('summary')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              viewMode === 'summary' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Summary
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSection('');
              setSelectedExam('');
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Class</option>
            {availableClasses.map((cls, index) => (
              <option key={index} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => {
              setSelectedSection(e.target.value);
              setSelectedExam('');
            }}
            disabled={!selectedClass}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select Section</option>
            {selectedClass && getSectionsForClass(selectedClass).map((section, index) => (
              <option key={index} value={section}>{section}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Examination</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            disabled={!selectedClass}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select Examination</option>
            {selectedClass && getExamsForClassSection(selectedClass, selectedSection).map((exam) => (
              <option key={exam.id} value={exam.id}>{exam.name} ({exam.examType})</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Students</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!selectedExam}
            />
          </div>
        </div>
      </div>
      
      {!selectedExam ? (
        <div className="text-center py-12">
          <FaChartBar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No examination selected</h3>
          <p className="mt-1 text-sm text-gray-500">Please select a class, section, and examination to view results.</p>
        </div>
      ) : (
        <>
          {viewMode === 'summary' && stats && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Exam Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
                  <h4 className="text-sm font-medium text-blue-100">Total Students</h4>
                  <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
                  <h4 className="text-sm font-medium text-green-100">Average Percentage</h4>
                  <p className="text-3xl font-bold mt-2">{stats.averagePercentage}%</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-6 text-white">
                  <h4 className="text-sm font-medium text-purple-100">Pass Rate</h4>
                  <p className="text-3xl font-bold mt-2">
                    {(
                      ((stats.gradeDistribution['A+'] + 
                        stats.gradeDistribution['A'] + 
                        stats.gradeDistribution['B+'] + 
                        stats.gradeDistribution['B'] + 
                        stats.gradeDistribution['C']) / stats.totalStudents) * 100
                    ).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Grade Distribution</h4>
                  <div className="space-y-3">
                    {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
                      <div key={grade} className="flex items-center">
                        <div className="w-24 text-sm font-medium text-gray-700">{grade}</div>
                        <div className="flex-1 ml-2">
                          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${(count / stats.totalStudents) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-12 text-right text-sm text-gray-700">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Subject Performance</h4>
                  <div className="space-y-3">
                    {Object.entries(stats.subjectPerformance).map(([subject, data]) => (
                      <div key={subject} className="flex items-center">
                        <div className="w-32 text-sm font-medium text-gray-700 truncate">{subject}</div>
                        <div className="flex-1 ml-2">
                          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full" 
                              style={{ width: `${(data.average / 100) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-16 text-right text-sm text-gray-700">
                          {data.average.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {(viewMode === 'list' || viewMode === 'chart') && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => {
                    const studentMarks = getStudentMarks(student.id);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 border-2 border-dashed rounded-xl" />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.class} - {student.section}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {studentMarks ? `${studentMarks.totalObtained}/${studentMarks.totalMarks}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {studentMarks ? `${studentMarks.percentage}%` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {studentMarks ? (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              studentMarks.overallGrade === 'A+' || studentMarks.overallGrade === 'A' 
                                ? 'bg-green-100 text-green-800' 
                                : studentMarks.overallGrade === 'B+' || studentMarks.overallGrade === 'B' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : studentMarks.overallGrade === 'C' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                              {studentMarks.overallGrade}
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              N/A
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {studentMarks ? (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              parseFloat(studentMarks.percentage) >= 40 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {parseFloat(studentMarks.percentage) >= 40 ? 'Pass' : 'Fail'}
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <FaSearch className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search or selection criteria.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExamResultsTracker;