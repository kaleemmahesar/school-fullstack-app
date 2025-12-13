import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMarks } from '../../store/marksSlice';
import { FaChartBar, FaChartLine, FaChartPie, FaFileExcel, FaSearch } from 'react-icons/fa';

const ExamResultsTracker = () => {
  const dispatch = useDispatch();
  const { exams } = useSelector(state => state.exams);
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
  
  // Get sections for selected class - IMPROVED VERSION
  const getSectionsForClass = (className) => {
    if (!className) return [];
    
    // Get sections from students data
    const sections = students
      .filter(student => student.class === className && student.section)
      .map(student => student.section)
      .filter((section, index, self) => self.indexOf(section) === index); // Unique sections only
    
    return sections.sort();
  };
  
  // Get exams for selected class and section - IMPROVED VERSION
  const getExamsForClassSection = (className, sectionName) => {
    return exams.filter(exam => 
      exam.class === className && 
      (sectionName ? exam.section === sectionName : true)
    );
  };
  
  // Get students for selected class and section - IMPROVED VERSION
  const getStudentsForClassSection = (className, sectionName) => {
    return students.filter(student => 
      student.class === className && 
      (sectionName ? student.section === sectionName : true)
    );
  };
  
  // Get marks for selected exam - UPDATED VERSION
  const getMarksForExam = (examId) => {
    if (!examId) return [];
    
    return marksArray.filter(mark => mark.examId === examId);
  };
  
  // Calculate statistics for the selected exam - UPDATED VERSION
  const calculateExamStatistics = () => {
    if (!selectedExam) return null;
    
    const examMarks = getMarksForExam(selectedExam);
    if (examMarks.length === 0) return null;
    
    // Calculate overall statistics
    const totalStudents = examMarks.length;
    
    // Calculate percentages for each student
    const percentages = examMarks.map(mark => {
      const totalObtained = parseFloat(mark.totalObtained || 0);
      const totalMarks = parseFloat(mark.totalMarks || 1); // Avoid division by zero
      return totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;
    });
    
    const averagePercentage = percentages.reduce((sum, pct) => sum + pct, 0) / totalStudents;
    
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
    
    // Assign grades based on percentages
    percentages.forEach(percentage => {
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C';
      else if (percentage >= 40) grade = 'D';
      
      gradeDistribution[grade]++;
    });
    
    // Subject-wise performance
    const subjectPerformance = {};
    examMarks.forEach(mark => {
      if (mark.marks && Array.isArray(mark.marks)) {
        mark.marks.forEach(subjectMark => {
          const subjectName = subjectMark.subjectName || subjectMark.subject || 'Unknown';
          if (!subjectPerformance[subjectName]) {
            subjectPerformance[subjectName] = {
              total: 0,
              count: 0,
              average: 0
            };
          }
          const totalObtained = parseFloat(subjectMark.marksObtained || 0);
          const totalMarks = parseFloat(subjectMark.totalMarks || 1);
          const subjectPercentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;
          subjectPerformance[subjectName].total += subjectPercentage;
          subjectPerformance[subjectName].count++;
        });
      }
    });
    
    // Calculate averages
    Object.keys(subjectPerformance).forEach(subject => {
      subjectPerformance[subject].average = 
        subjectPerformance[subject].count > 0 ? 
        subjectPerformance[subject].total / subjectPerformance[subject].count : 0;
    });
    
    return {
      totalStudents,
      averagePercentage: averagePercentage.toFixed(2),
      gradeDistribution,
      subjectPerformance
    };
  };

  const stats = calculateExamStatistics();
  
  // Get marks for a specific student in the selected exam - UPDATED VERSION
  const getStudentMarks = (studentId) => {
    if (!selectedExam) return null;
    
    // Convert studentId to string for consistent comparison
    const studentIdStr = String(studentId);
    
    // Find marks for this student and exam
    // Use examId for matching since that's what's stored in the marks data
    const studentMarks = marksArray.find(mark => {
      // Handle different data types for studentId
      const markStudentId = String(mark.studentId || '');
      return markStudentId === studentIdStr && mark.examId === selectedExam;
    });
    
    return studentMarks;
  };
  
  // Get students with their marks and rankings for the selected exam - NEW FUNCTION
  const getRankedStudents = () => {
    if (!selectedExam) return [];
    
    // Get all students for the selected class and section
    const classSectionStudents = getStudentsForClassSection(selectedClass, selectedSection);
    
    // Add marks data to each student
    const studentsWithMarks = classSectionStudents.map(student => {
      const studentMarks = getStudentMarks(student.id);
      return {
        ...student,
        marks: studentMarks,
        percentage: studentMarks ? parseFloat(studentMarks.percentage || 0) : 0,
        totalObtained: studentMarks ? parseFloat(studentMarks.totalObtained || 0) : 0
      };
    });
    
    // Sort by percentage (descending) to determine rankings
    studentsWithMarks.sort((a, b) => b.percentage - a.percentage);
    
    // Add rank to each student
    return studentsWithMarks.map((student, index) => ({
      ...student,
      rank: index + 1
    }));
  };

  // Filter students based on search term - UPDATED VERSION
  const filteredStudents = getRankedStudents().filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toString().includes(searchTerm)
  );

  // Reset section and exam when class changes
  useEffect(() => {
    if (!selectedClass) {
      setSelectedSection('');
      setSelectedExam('');
    }
  }, [selectedClass]);

  // Reset exam when section changes
  useEffect(() => {
    setSelectedExam('');
  }, [selectedSection]);

  // Add useEffect to fetch marks when component mounts and when selected exam changes
  useEffect(() => {
    dispatch(fetchMarks());
  }, [dispatch, selectedExam]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exam Results Tracker</h2>
          <p className="text-gray-600">Track and analyze student performance in examinations</p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            onClick={() => dispatch(fetchMarks())}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            Refresh
          </button>
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
            <option value="">All Sections</option>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-800">{stats.totalStudents}</div>
                  <div className="text-sm text-blue-600">Total Students</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-800">{stats.averagePercentage}%</div>
                  <div className="text-sm text-green-600">Average Percentage</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-800">{stats.gradeDistribution['A+'] + stats.gradeDistribution['A']}</div>
                  <div className="text-sm text-yellow-600">A Grades</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-800">{stats.gradeDistribution['F']}</div>
                  <div className="text-sm text-red-600">Failed Students</div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredStudents.slice(0, 3).map((student, index) => (
                    <div key={student.id} className={`rounded-lg p-4 ${
                      index === 0 ? 'bg-yellow-50 border-2 border-yellow-200' : 
                      index === 1 ? 'bg-gray-100 border-2 border-gray-200' : 
                      'bg-orange-50 border-2 border-orange-200'
                    }`}>
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            Rank: {student.rank} | {student.percentage ? student.percentage.toFixed(2) : '0.00'}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Grade: {student.marks?.overallGrade || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Grade Distribution</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
                    <div key={grade} className="bg-gray-50 rounded-lg p-3 text-center min-w-[80px]">
                      <div className="text-lg font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-600">Grade {grade}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Subject Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats.subjectPerformance).map(([subject, data]) => (
                    <div key={subject} className="bg-gray-50 rounded-lg p-4">
                      <div className="font-medium text-gray-900">{subject}</div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">{data.average.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {viewMode === 'list' && (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
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
                      <tr key={student.id} className={`hover:bg-gray-50 ${student.rank === 1 ? 'bg-yellow-50' : student.rank === 2 ? 'bg-gray-100' : student.rank === 3 ? 'bg-orange-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.rank === 1 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              🥇 {student.rank}
                            </span>
                          ) : student.rank === 2 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                              🥈 {student.rank}
                            </span>
                          ) : student.rank === 3 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              🥉 {student.rank}
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-gray-900">
                              {student.rank}
                            </span>
                          )}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {studentMarks ? `${studentMarks.totalObtained || 0}/${studentMarks.totalMarks || 0}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.percentage ? `${student.percentage.toFixed(2)}%` : 'Pending'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {studentMarks ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              studentMarks.overallGrade === 'A+' ? 'bg-yellow-100 text-yellow-800' :
                              studentMarks.overallGrade === 'A' ? 'bg-green-100 text-green-800' :
                              studentMarks.overallGrade === 'B+' ? 'bg-blue-100 text-blue-800' :
                              studentMarks.overallGrade === 'B' ? 'bg-indigo-100 text-indigo-800' :
                              studentMarks.overallGrade === 'C' ? 'bg-purple-100 text-purple-800' :
                              studentMarks.overallGrade === 'D' ? 'bg-pink-100 text-pink-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {studentMarks.overallGrade || 'F'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {studentMarks ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
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
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          )}
          
          {viewMode === 'chart' && stats && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution Chart</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-end justify-center h-64 space-x-2">
                  {Object.entries(stats.gradeDistribution).map(([grade, count]) => {
                    const maxHeight = 200;
                    const height = stats.totalStudents > 0 ? (count / stats.totalStudents) * maxHeight : 0;
                    return (
                      <div key={grade} className="flex flex-col items-center">
                        <div 
                          className="w-12 bg-blue-500 rounded-t transition-all duration-300"
                          style={{ height: `${height}px` }}
                        ></div>
                        <div className="mt-2 text-sm font-medium text-gray-900">{count}</div>
                        <div className="text-xs text-gray-600">Grade {grade}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-8">Subject Performance Chart</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
                  {Object.entries(stats.subjectPerformance).map(([subject, data]) => (
                    <div key={subject} className="flex items-center">
                      <div className="w-32 text-sm font-medium text-gray-900 truncate">{subject}</div>
                      <div className="flex-1 ml-4">
                        <div className="flex items-center">
                          <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full transition-all duration-300"
                              style={{ width: `${data.average}%` }}
                            ></div>
                          </div>
                          <div className="ml-4 text-sm font-medium text-gray-900 w-16">{data.average.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExamResultsTracker;