import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaUserGraduate, FaListOl, FaSearch, FaFilter, FaSave } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';

const RollNumberAssignment = () => {
  const { students } = useSelector(state => state.students);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [rollNumberMode, setRollNumberMode] = useState('auto'); // 'auto' or 'custom'
  const [startingNumber, setStartingNumber] = useState(1001);
  const [endingNumber, setEndingNumber] = useState(1500);
  const [studentRollNumbers, setStudentRollNumbers] = useState({});

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

  // Auto-assign roll numbers
  const autoAssignRollNumbers = () => {
    const sortedStudents = [...filteredStudents].sort((a, b) => 
      a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName)
    );
    
    const newRollNumbers = {};
    sortedStudents.forEach((student, index) => {
      newRollNumbers[student.id] = startingNumber + index;
    });
    
    setStudentRollNumbers(newRollNumbers);
  };

  // Custom assign roll numbers
  const customAssignRollNumbers = () => {
    const newRollNumbers = {};
    filteredStudents.forEach((student, index) => {
      newRollNumbers[student.id] = startingNumber + index;
    });
    
    setStudentRollNumbers(newRollNumbers);
  };

  // Assign roll numbers based on selected mode
  const assignRollNumbers = () => {
    if (rollNumberMode === 'auto') {
      autoAssignRollNumbers();
    } else {
      customAssignRollNumbers();
    }
  };

  // Update individual student roll number
  const updateStudentRollNumber = (studentId, rollNumber) => {
    setStudentRollNumbers({
      ...studentRollNumbers,
      [studentId]: rollNumber
    });
  };

  // Save roll numbers
  const saveRollNumbers = () => {
    // In a real implementation, this would dispatch an action to save roll numbers
    console.log('Saving roll numbers:', studentRollNumbers);
    alert(`Roll numbers assigned to ${Object.keys(studentRollNumbers).length} students`);
  };

  return (
    <>
      <PageHeader
        title="Roll Number Assignment"
        subtitle="Assign roll numbers to students using auto numbering or custom values"
        actionButton={
          Object.keys(studentRollNumbers).length > 0 && (
            <button
              onClick={saveRollNumbers}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
            >
              <FaSave className="mr-2" /> Save Roll Numbers
            </button>
          )
        }
      />

      {/* Assignment Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Mode</label>
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setRollNumberMode('auto')}
                className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-l-md ${
                  rollNumberMode === 'auto'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Auto Numbering
              </button>
              <button
                onClick={() => setRollNumberMode('custom')}
                className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-r-md ${
                  rollNumberMode === 'custom'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Custom
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Starting Number</label>
            <input
              type="number"
              value={startingNumber}
              onChange={(e) => setStartingNumber(parseInt(e.target.value) || 0)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              min="1"
            />
          </div>
          
          {rollNumberMode === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ending Number</label>
              <input
                type="number"
                value={endingNumber}
                onChange={(e) => setEndingNumber(parseInt(e.target.value) || 0)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                min={startingNumber}
              />
            </div>
          )}
          
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
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by student name, email, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            onClick={assignRollNumbers}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <FaListOl className="mr-2" /> Assign Roll Numbers
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Roll No</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Roll No</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student, index) => (
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
                    {/* In a real implementation, this would show existing roll number */}
                    Not Assigned
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {studentRollNumbers[student.id] ? (
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={studentRollNumbers[student.id]}
                          onChange={(e) => updateStudentRollNumber(student.id, parseInt(e.target.value) || 0)}
                          className="block w-24 px-3 py-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not Assigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <FaUserGraduate className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RollNumberAssignment;