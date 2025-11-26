import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaCalculator, FaBirthdayCake, FaSearch } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';

const AgeCalculator = () => {
  const { students } = useSelector(state => state.students);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [calculatedAges, setCalculatedAges] = useState([]);

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    return `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
           student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           student.id.includes(searchTerm);
  });

  // Calculate age function
  const calculateAge = (birthDate, referenceDate = null) => {
    const birth = new Date(birthDate);
    const ref = referenceDate ? new Date(referenceDate) : new Date();
    
    let years = ref.getFullYear() - birth.getFullYear();
    let months = ref.getMonth() - birth.getMonth();
    let days = ref.getDate() - birth.getDate();
    
    if (days < 0) {
      months--;
      // Get the number of days in the previous month
      const prevMonth = new Date(ref.getFullYear(), ref.getMonth(), 0);
      days += prevMonth.getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    return { years, months, days };
  };

  // Calculate ages for all students or selected student
  const handleCalculateAges = () => {
    let studentsToCalculate = [];
    
    if (selectedStudent) {
      // Calculate for selected student only
      const student = students.find(s => s.id === selectedStudent);
      if (student) {
        studentsToCalculate = [student];
      }
    } else {
      // Calculate for all students
      studentsToCalculate = filteredStudents;
    }
    
    const ages = studentsToCalculate.map(student => {
      const age = calculateAge(student.dateOfBirth, customDate || null);
      return {
        ...student,
        ageYears: age.years,
        ageMonths: age.months,
        ageDays: age.days,
        ageString: `${age.years} years, ${age.months} months, ${age.days} days`
      };
    });
    
    setCalculatedAges(ages);
  };

  // Calculate age for a specific student
  const getStudentAge = (studentId) => {
    const student = calculatedAges.find(s => s.id === studentId);
    return student ? student.ageString : 'Not calculated';
  };

  // Export to CSV
  const exportToCSV = () => {
    if (calculatedAges.length === 0) return;
    
    const exportData = calculatedAges.map(student => ({
      'Student ID': student.id,
      'Name': `${student.firstName} ${student.lastName}`,
      'Date of Birth': student.dateOfBirth,
      'Age (Years)': student.ageYears,
      'Age (Months)': student.ageMonths,
      'Age (Days)': student.ageDays,
      'Full Age': student.ageString
    }));
    
    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(item => Object.values(item).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_ages.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PageHeader
        title="Age Calculator"
        subtitle="Calculate student ages based on date of birth"
        actionButton={
          calculatedAges.length > 0 && (
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Export Ages CSV
            </button>
          )
        }
      />

      {/* Age Calculator Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Student (Optional)</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Filtered Students</option>
              {filteredStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} (ID: {student.id})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Date (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaBirthdayCake className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleCalculateAges}
            disabled={filteredStudents.length === 0}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
              filteredStudents.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            }`}
          >
            <FaCalculator className="mr-2" /> Calculate Age(s)
          </button>
        </div>
      </div>

      {/* Results */}
      {calculatedAges.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Age Calculation Results ({calculatedAges.length} student{calculatedAges.length !== 1 ? 's' : ''})
          </h3>
          
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculatedAges.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                          <div className="text-sm text-gray-500">ID: {student.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.dateOfBirth}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.ageString}</div>
                      <div className="text-sm text-gray-500">
                        ({student.ageYears}y {student.ageMonths}m {student.ageDays}d)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customDate || new Date().toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student List for Selection */}
      {filteredStudents.length > 0 && calculatedAges.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Students Matching Search ({filteredStudents.length})
          </h3>
          
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Age</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => {
                  const age = calculateAge(student.dateOfBirth);
                  const ageString = `${age.years} years, ${age.months} months, ${age.days} days`;
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                            <div className="text-sm text-gray-500">ID: {student.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.dateOfBirth}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ageString}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedStudent(student.id);
                            setTimeout(handleCalculateAges, 100);
                          }}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Calculate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredStudents.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <FaBirthdayCake className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </>
  );
};

export default AgeCalculator;