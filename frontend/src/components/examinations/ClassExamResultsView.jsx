import React, { useState, useMemo } from 'react';
import { FaTrophy, FaMedal, FaSearch, FaFilter } from 'react-icons/fa';

const ClassExamResultsView = ({ exams = [], students = [], studentsSearchTerm = '', marks = {} }) => {
  console.log('=== CLASS EXAM RESULTS VIEW DEBUG ===');
  console.log('Exams received:', exams);
  console.log('Students received:', students);
  console.log('Marks received:', marks);
  
  // Extract marks array from the Redux state structure
  const marksArray = useMemo(() => {
    // Handle different possible Redux state structures
    if (Array.isArray(marks)) {
      console.log('Marks is already an array, returning as is');
      return marks;
    }
    
    // If marks is an object with a marks property (standard Redux state structure)
    if (marks && typeof marks === 'object' && marks.marks && Array.isArray(marks.marks)) {
      console.log('Marks is Redux state object, extracting marks array');
      return marks.marks;
    }
    
    // If marks is an object with nested data, flatten it
    if (marks && typeof marks === 'object') {
      console.log('Marks is object, attempting to flatten');
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
      
      console.log('Flattened marks result:', flattened);
      return flattened;
    }
    
    console.log('No valid marks data found, returning empty array');
    return [];
  }, [marks]);

  console.log('Marks array after extraction:', marksArray);
  console.log('Marks array length:', marksArray.length);
  console.log('Marks array type:', typeof marksArray);
  console.log('Is marks array:', Array.isArray(marksArray));

  const [selectedExamType, setSelectedExamType] = useState('Midterm');
  const [selectedClass, setSelectedClass] = useState(''); // New state for class filter
  const [searchTerm, setSearchTerm] = useState('');

  // Show all exams without filtering
  const filteredExams = useMemo(() => {
    return exams;
  }, [exams]);

  // Get unique classes from marks data
  const availableClasses = useMemo(() => {
    if (!marksArray || !Array.isArray(marksArray) || marksArray.length === 0) {
      return [];
    }
    
    const classes = new Set();
    marksArray.forEach(item => {
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
  }, [marksArray]);

  // Flatten marks data structure and filter by selected exam type
  const flattenedMarks = useMemo(() => {
    console.log('=== PROCESSING MARKS ===');
    console.log('Raw marks data:', marksArray);
    console.log('Selected exam type:', selectedExamType);
    console.log('Selected class:', selectedClass);
    
    // Add null checks
    if (!marksArray || !Array.isArray(marksArray) || marksArray.length === 0) {
      console.log('No marks data available');
      return [];
    }
    
    // Simple approach - extract all valid marksheet objects
    const flattened = [];
    
    // Handle different possible structures
    marksArray.forEach((item, index) => {
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
  }, [marksArray, selectedExamType]);

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
        const aPercentage = parseFloat(a.percentage || 0);
        const bPercentage = parseFloat(b.percentage || 0);
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Class Exam Results</h2>
        <p className="text-gray-600">View and analyze student performance by class and section</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Exam Type</option>
            {exams && [...new Set(exams.map(exam => exam.examType))].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={!selectedExamType}
          >
            <option value="">All Classes</option>
            {availableClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
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
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!selectedExamType}
            />
          </div>
        </div>
      </div>
      
      {!selectedExamType ? (
        <div className="text-center py-12">
          <FaFilter className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No exam type selected</h3>
          <p className="mt-1 text-sm text-gray-500">Please select an exam type to view results.</p>
        </div>
      ) : classResults.length === 0 ? (
        <div className="text-center py-12">
          <FaTrophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
          <p className="mt-1 text-sm text-gray-500">No marks have been entered for the selected exam type yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {classResults.map((result, index) => (
            <div key={`${result.class}-${result.section}`} className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {result.class} - Section {result.section}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {result.students.length} students
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.students
                      .filter(student => 
                        student.studentName.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((student) => (
                        <tr key={student.studentId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getPositionIcon(student.position)}
                              <span className="ml-2 font-medium">{getPositionText(student.position)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                            <div className="text-sm text-gray-500">ID: {student.studentId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.totalObtained || student.totalMarks ? `${student.totalObtained || 0}/${student.totalMarks || 0}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.percentage ? `${parseFloat(student.percentage).toFixed(2)}%` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              student.overallGrade === 'A+' ? 'bg-yellow-100 text-yellow-800' :
                              student.overallGrade === 'A' ? 'bg-green-100 text-green-800' :
                              student.overallGrade === 'B+' ? 'bg-blue-100 text-blue-800' :
                              student.overallGrade === 'B' ? 'bg-indigo-100 text-indigo-800' :
                              student.overallGrade === 'C' ? 'bg-purple-100 text-purple-800' :
                              student.overallGrade === 'D' ? 'bg-pink-100 text-pink-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {student.overallGrade || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
                
                {result.students.filter(student => 
                  student.studentName.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && searchTerm && (
                  <div className="text-center py-8">
                    <FaSearch className="mx-auto h-8 w-8 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No matching students</h3>
                    <p className="mt-1 text-sm text-gray-500">No students found matching "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassExamResultsView;