import React, { useState, useMemo } from 'react';
import { FaTrophy, FaMedal, FaSearch, FaFilter } from 'react-icons/fa';

const ClassExamResultsView = ({ exams = [], students = [], studentsSearchTerm = '', marks = [] }) => {
  console.log('=== CLASS EXAM RESULTS VIEW DEBUG ===');
  console.log('Exams received:', exams);
  console.log('Students received:', students);
  console.log('Marks received:', marks);
  console.log('Marks length:', marks.length);
  console.log('Marks type:', typeof marks);
  console.log('Is marks array:', Array.isArray(marks));
  
  const [selectedExamType, setSelectedExamType] = useState('Midterm');
  const [selectedClass, setSelectedClass] = useState(''); // New state for class filter
  const [searchTerm, setSearchTerm] = useState('');

  // Show all exams without filtering
  const filteredExams = useMemo(() => {
    return exams;
  }, [exams]);

  // Get unique classes from marks data
  const availableClasses = useMemo(() => {
    if (!marks || !Array.isArray(marks) || marks.length === 0) {
      return [];
    }
    
    const classes = new Set();
    marks.forEach(item => {
      if (item && typeof item === 'object') {
        // Check direct marksheet objects
        if (item.class) {
          classes.add(item.class);
        }
        // Check nested marksheet objects
        Object.keys(item).forEach(key => {
          if (key !== 'id' && item[key] && typeof item[key] === 'object' && item[key].class) {
            classes.add(item[key].class);
          }
        });
      }
    });
    
    return Array.from(classes).sort();
  }, [marks]);

  // Flatten marks data structure and filter by selected exam type
  const flattenedMarks = useMemo(() => {
    console.log('=== PROCESSING MARKS ===');
    console.log('Raw marks data:', marks);
    console.log('Selected exam type:', selectedExamType);
    console.log('Selected class:', selectedClass);
    
    // Add null checks
    if (!marks || !Array.isArray(marks) || marks.length === 0) {
      console.log('No marks data available');
      return [];
    }
    
    // Simple approach - extract all valid marksheet objects
    const flattened = [];
    
    // Handle different possible structures
    marks.forEach((item, index) => {
      console.log(`Processing item ${index}:`, item);
      
      // Check if this is a direct marksheet object (has examType property directly)
      if (item && typeof item === 'object' && item.examType) {
        console.log('Found direct marksheet object with examType:', item.examType);
        // Filter by selected exam type
        if (item.examType === selectedExamType) {
          console.log('Adding marksheet object (matches filter):', item);
          flattened.push(item);
        } else {
          console.log('Skipping marksheet object (does not match filter):', item);
        }
      } 
      // If item is an object containing nested marksheet objects
      else if (item && typeof item === 'object') {
        console.log('Processing as nested object');
        // Check all properties of the object
        Object.keys(item).forEach(key => {
          console.log(`Checking key: ${key}`, item[key]);
          // Skip the 'id' property which is not a marksheet
          if (key === 'id') {
            console.log('Skipping id key');
            return;
          }
          
          const value = item[key];
          console.log(`Value for key ${key}:`, value);
          // If value is a valid marksheet object with examType, add it
          if (value && typeof value === 'object' && value.examType) {
            console.log('Found nested marksheet object with examType:', value.examType);
            // Filter by selected exam type
            if (value.examType === selectedExamType) {
              console.log('Adding nested marksheet object (matches filter):', value);
              flattened.push(value);
            } else {
              console.log('Skipping nested marksheet object (does not match filter):', value);
            }
          }
        });
      }
    });
    
    // Remove duplicates based on studentId
    const uniqueMarks = [];
    const seenStudentIds = new Set();
    
    flattened.forEach(mark => {
      if (mark && mark.studentId && !seenStudentIds.has(mark.studentId)) {
        seenStudentIds.add(mark.studentId);
        uniqueMarks.push(mark);
      }
    });
    
    console.log('Final flattened and filtered marks result (duplicates removed):', uniqueMarks);
    console.log('=== END PROCESSING MARKS ===');
    return uniqueMarks;
  }, [marks, selectedExamType]);

  // Get all marks without filtering by exams (already filtered by exam type above)
  const filteredMarks = useMemo(() => {
    // Add null checks
    if (!flattenedMarks || !Array.isArray(flattenedMarks) || flattenedMarks.length === 0) {
      return [];
    }
    
    // Apply class filter if selected
    if (selectedClass) {
      return flattenedMarks.filter(mark => mark.class === selectedClass);
    }
    
    return flattenedMarks;
  }, [flattenedMarks, selectedClass]);

  // Calculate rankings for each class-section combination
  const classResults = useMemo(() => {
    console.log('=== CALCULATING RESULTS ===');
    console.log('Filtered marks for results:', filteredMarks);
    
    // Add null checks
    if (!filteredMarks || !Array.isArray(filteredMarks) || filteredMarks.length === 0) {
      console.log('No filtered marks for results calculation');
      return [];
    }
    
    // Group marks by class and section
    const groupedResults = {};
    
    filteredMarks.forEach((mark, index) => {
      console.log(`Processing mark ${index}:`, mark);
      
      // Add null check for mark object
      if (!mark) {
        console.log('Skipping null mark');
        return;
      }
      
      // Ensure mark has required fields
      if (!mark.class || !mark.section || !mark.studentId) {
        console.log('Skipping mark with missing required fields:', mark);
        return;
      }
      
      const key = `${mark.class}-${mark.section}`;
      console.log(`Grouping key: ${key}`);
      
      if (!groupedResults[key]) {
        groupedResults[key] = {
          class: mark.class,
          section: mark.section,
          students: []
        };
        console.log(`Created new group for ${key}`);
      }
      
      // Find student details
      const student = students.find(s => s && s.id === mark.studentId);
      console.log(`Found student for mark:`, student);
      
      if (student) {
        groupedResults[key].students.push({
          ...mark,
          studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim() || mark.studentName || 'Unknown Student',
          studentId: student.id,
          status: student.status
        });
        console.log(`Added student to group ${key}`);
      } else {
        // If student not found, use the name from the mark data
        groupedResults[key].students.push({
          ...mark,
          studentName: mark.studentName || 'Unknown Student',
          studentId: mark.studentId,
          status: 'unknown'
        });
        console.log(`Added student to group ${key} (student not found in students list)`);
      }
    });
    
    console.log('Grouped results before ranking:', groupedResults);
    
    // Calculate rankings for each group
    Object.values(groupedResults).forEach(group => {
      console.log(`Sorting group: ${group.class}-${group.section}`);
      
      // Sort by percentage descending
      group.students.sort((a, b) => {
        const aPercentage = parseFloat(a.percentage) || 0;
        const bPercentage = parseFloat(b.percentage) || 0;
        console.log(`Comparing ${a.studentName} (${aPercentage}) with ${b.studentName} (${bPercentage})`);
        return bPercentage - aPercentage;
      });
      
      // Add positions
      group.students = group.students.map((student, index) => ({
        ...student,
        position: index + 1,
        totalStudents: group.students.length
      }));
      
      console.log(`Ranked students in group ${group.class}-${group.section}:`, group.students);
    });
    
    const finalResults = Object.values(groupedResults);
    console.log('Final class results:', finalResults);
    console.log('=== END CALCULATING RESULTS ===');
    return finalResults;
  }, [filteredMarks, students]);

  // Get position icon
  const getPositionIcon = (position) => {
    switch (position) {
      case 1: return <FaTrophy className="text-yellow-500" />;
      case 2: return <FaMedal className="text-gray-400" />;
      case 3: return <FaMedal className="text-amber-700" />;
      default: return null;
    }
  };

  // Get position text
  const getPositionText = (position) => {
    switch (position) {
      case 1: return '1st';
      case 2: return '2nd';
      case 3: return '3rd';
      default: return `${position}th`;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Class Examination Results</h2>
          <p className="text-gray-600">View all examination results with student rankings by class</p>
        </div>
      </div>

      {/* Exam Type Filter */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Midterm">Midterm</option>
              <option value="Final">Final</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Classes</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Results */}
      {classResults.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>No examination results found.</strong> This could be because:
                </p>
                <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                  <li>There are no marksheets generated yet</li>
                  <li>The marks data structure doesn't match expected format</li>
                  <li>There's a mismatch between exam data and marks data</li>
                </ul>
              </div>
            </div>
          </div>
          <FaSearch className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No results to display</h3>
          <p className="mt-1 text-sm text-gray-500">Generate marksheets first to see examination results.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {classResults.map((result) => {
            // Filter students based on search term
            const filteredStudents = result.students.filter(student => 
              student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            // Skip groups with no matching students
            if (filteredStudents.length === 0 && searchTerm) return null;
            
            return (
              <div key={`${result.class}-${result.section}`} className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
                  <h3 className="text-lg font-medium text-gray-900">
                    {result.class} - Section {result.section}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} ranked
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((student) => (
                        <tr key={student.studentId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getPositionIcon(student.position)}
                              <span className="ml-2 font-medium">
                                {getPositionText(student.position)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.totalObtained}/{student.totalMarks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {parseFloat(student.percentage).toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {student.overallGrade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClassExamResultsView;