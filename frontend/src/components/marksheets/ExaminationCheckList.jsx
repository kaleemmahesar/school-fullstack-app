import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMarks, updateMarks } from '../../store/marksSlice';
import { FaClipboardCheck, FaSearch, FaFilter, FaUserGraduate, FaCheckCircle, FaMoneyBillWave, FaUserPlus } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';

const ExaminationCheckList = () => {
  const dispatch = useDispatch();
  const { students } = useSelector(state => state.students);
  const { marks } = useSelector(state => state.marks);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [examType, setExamType] = useState('Midterm');
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString());
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showFeePayment, setShowFeePayment] = useState(false);
  const [feePaymentStudent, setFeePaymentStudent] = useState(null);

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

  // Check if student has marks for the selected exam
  const hasExamMarks = (studentId) => {
    return marks.some(mark => 
      mark.studentId === studentId && 
      mark.examType === examType && 
      mark.year === examYear
    );
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  // Select all students
  const selectAllStudents = () => {
    const studentIds = filteredStudents.map(student => student.id);
    setSelectedStudents(studentIds);
  };

  // Deselect all students
  const deselectAllStudents = () => {
    setSelectedStudents([]);
  };

  // Check if all students are selected
  const areAllStudentsSelected = () => {
    return filteredStudents.length > 0 && 
           filteredStudents.every(student => selectedStudents.includes(student.id));
  };

  // Generate exam slips for selected students
  const generateExamSlips = () => {
    if (selectedStudents.length === 0) return;
    
    // In a real implementation, this would generate printable exam slips
    alert(`Generated exam slips for ${selectedStudents.length} students`);
  };

  // Assign roll numbers
  const assignRollNumbers = () => {
    // In a real implementation, this would assign roll numbers to selected students
    alert(`Assigned roll numbers to ${selectedStudents.length} students`);
  };

  // Open fee payment modal
  const openFeePayment = (student) => {
    setFeePaymentStudent(student);
    setShowFeePayment(true);
  };

  // Process fee payment
  const processFeePayment = (amount) => {
    if (feePaymentStudent) {
      // In a real implementation, this would update the student's fee status
      alert(`Processed fee payment of ${amount} for ${feePaymentStudent.firstName} ${feePaymentStudent.lastName}`);
      setShowFeePayment(false);
      setFeePaymentStudent(null);
    }
  };

  // Check promotion eligibility
  const checkPromotionEligibility = (student) => {
    // Check if monthly challans have been generated
    const hasMonthlyChallans = student.feesHistory && student.feesHistory.some(challan => challan.type === 'monthly');
    const feesPaid = hasMonthlyChallans 
      ? parseFloat(student.feesPaid) >= parseFloat(student.totalFees)
      : true; // If no challans, consider fees as paid
    
    const examMarks = hasExamMarks(student.id);
    
    if (feesPaid && examMarks) {
      alert(`${student.firstName} ${student.lastName} is eligible for promotion`);
    } else {
      alert(`${student.firstName} ${student.lastName} is NOT eligible for promotion`);
    }
  };

  return (
    <>
      <PageHeader
        title="Examination Check List"
        subtitle="Select students for examination, pay fees, and generate exam slips"
        actionButton={
          selectedStudents.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={assignRollNumbers}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <FaUserGraduate className="mr-2" /> Assign Roll Numbers
              </button>
              <button
                onClick={generateExamSlips}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <FaClipboardCheck className="mr-2" /> Generate Exam Slips
              </button>
            </div>
          )
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
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Students ({filteredStudents.length})
          </h3>
          <div>
            {filteredStudents.length > 0 && (
              <div className="flex space-x-2">
                {areAllStudentsSelected() ? (
                  <button
                    onClick={deselectAllStudents}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Deselect All
                  </button>
                ) : (
                  <button
                    onClick={selectAllStudents}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Select All
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={areAllStudentsSelected()}
                    onChange={areAllStudentsSelected() ? deselectAllStudents : selectAllStudents}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                // Check if monthly challans have been generated
                const hasMonthlyChallans = student.feesHistory && student.feesHistory.some(challan => challan.type === 'monthly');
                const feesPaid = hasMonthlyChallans 
                  ? parseFloat(student.feesPaid) >= parseFloat(student.totalFees)
                  : true; // If no challans, consider fees as paid
                
                const examMarks = hasExamMarks(student.id);
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        hasMonthlyChallans
                          ? feesPaid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {hasMonthlyChallans
                          ? feesPaid ? 'Paid' : 'Pending'
                          : 'No Challans'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        examMarks
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {examMarks ? 'Marks Entered' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {!feesPaid && (
                          <button
                            onClick={() => openFeePayment(student)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          >
                            <FaMoneyBillWave className="mr-1" /> Pay Fees
                          </button>
                        )}
                        {feesPaid && !examMarks && (
                          <button
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Enter Marks
                          </button>
                        )}
                        {examMarks && (
                          <button
                            onClick={() => checkPromotionEligibility(student)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <FaCheckCircle className="mr-1" /> Eligible
                          </button>
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
              <FaUserGraduate className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Fee Payment Modal */}
      {showFeePayment && feePaymentStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-semibold text-gray-900">Pay Examination Fee</h3>
            </div>
            
            <div className="py-6 px-6">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  {feePaymentStudent.firstName} {feePaymentStudent.lastName}
                </h4>
                <p className="text-sm text-gray-500">ID: {feePaymentStudent.id}</p>
                <p className="text-sm text-gray-500">Class: {feePaymentStudent.class} - Section {feePaymentStudent.section}</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  defaultValue={feePaymentStudent.examFee || 500}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowFeePayment(false);
                    setFeePaymentStudent(null);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    const amount = e.target.closest('div').previousElementSibling.querySelector('input').value;
                    processFeePayment(amount);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FaMoneyBillWave className="mr-2" /> Process Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExaminationCheckList;