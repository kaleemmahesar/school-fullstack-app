import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateStudent } from '../store/studentsSlice';
import { FaUserCheck, FaUserTimes, FaSearch, FaFilter, FaEdit, FaGraduationCap } from 'react-icons/fa';
import Pagination from './common/Pagination';

const PromotionManagement = ({ batches }) => { // Receive batches as prop
  const dispatch = useDispatch();
  const { students } = useSelector(state => state.students);
  
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionPreview, setPromotionPreview] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [targetBatch, setTargetBatch] = useState('');

  // Get unique classes for dropdown
  const uniqueClasses = [...new Set(students.map(student => student.class))];

  // Get sections for selected class
  const classSections = selectedClass 
    ? [...new Set(students
        .filter(student => student.class === selectedClass)
        .map(student => student.section))]
    : [];

  // Get unique batches for dropdown (only active and completed batches)
  const uniqueBatches = batches.filter(batch => batch.status === 'active' || batch.status === 'completed');

  // Filter students for promotion (only studying students)
  const filteredStudents = students.filter(student => {
    // Only include studying students for promotion
    if (student.status !== 'studying') return false;
    
    const matchesSearch = 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.grNo && student.grNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.class && student.class.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesClass = !selectedClass || student.class === selectedClass;
    const matchesSection = !selectedSection || student.section === selectedSection;
    const matchesBatch = !selectedBatch || student.academicYear === selectedBatch;
    
    return matchesSearch && matchesClass && matchesSection && matchesBatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Select all students on current page
  const selectAllOnPage = () => {
    const currentPageStudentIds = currentStudents.map(s => s.id);
    
    // If all are already selected, deselect all
    if (currentPageStudentIds.every(id => selectedStudents.includes(id))) {
      setSelectedStudents(prev => prev.filter(id => !currentPageStudentIds.includes(id)));
    } 
    // Otherwise, select all
    else {
      setSelectedStudents(prev => [...new Set([...prev, ...currentPageStudentIds])]);
    }
  };

  // Get next class for promotion
  const getNextClass = (currentClass) => {
    const classNumberMatch = currentClass.match(/Class\s+(\d+)/i);
    
    if (!classNumberMatch) {
      // Handle special cases like PG, Nursery, KG
      if (currentClass === 'PG') return 'Nursery';
      if (currentClass === 'Nursery') return 'KG';
      if (currentClass === 'KG') return 'Class 1';
      return null;
    }
    
    const currentNumber = parseInt(classNumberMatch[1]);
    
    // Handle special cases
    if (currentNumber >= 10) {
      return null; // No promotion for classes above 10
    }
    
    return `Class ${currentNumber + 1}`;
  };

  // Prepare promotion preview
  const preparePromotionPreview = () => {
    const preview = selectedStudents
      .map(studentId => {
        const student = students.find(s => s.id === studentId);
        if (!student) return null;
        
        const nextClass = getNextClass(student.class);
        return {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          currentClass: student.class,
          nextClass: nextClass || 'Graduate to Alumni',
          willGraduate: !nextClass
        };
      })
      .filter(Boolean);
    
    setPromotionPreview(preview);
    setShowPromotionModal(true);
  };

  // Execute promotions
  const executePromotions = () => {
    // Get target batch (next academic year)
    const targetBatchObj = batches.find(b => b.id === targetBatch);
    const targetAcademicYear = targetBatchObj ? targetBatchObj.name : '2025-2026';
    
    selectedStudents.forEach(studentId => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      
      const nextClass = getNextClass(student.class);
      
      if (nextClass) {
        // Regular promotion
        dispatch(updateStudent({
          ...student,
          class: nextClass,
          academicYear: targetAcademicYear
        }));
      } else {
        // Graduate to alumni
        dispatch(updateStudent({
          ...student,
          status: 'passed_out',
          classInWhichLeft: student.class,
          dateOfLeaving: new Date().toISOString().split('T')[0],
          reasonOfLeaving: 'Graduated',
          academicYear: targetAcademicYear
        }));
      }
    });
    
    // Clear selection and close modal
    setSelectedStudents([]);
    setShowPromotionModal(false);
    setTargetBatch('');
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClass, selectedSection, selectedBatch]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Student Promotion</h2>
          <button
            onClick={preparePromotionPreview}
            disabled={selectedStudents.length === 0}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              selectedStudents.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            <FaUserCheck className="mr-2" />
            Promote Selected ({selectedStudents.length})
          </button>
        </div>
        
        {/* Filters */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by student name, GR No, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Batches</option>
                {uniqueBatches.map((batch) => (
                  <option key={batch.id} value={batch.name}>{batch.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection(''); // Reset section when class changes
                }}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Classes</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedClass}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Sections</option>
                {classSections.map((section) => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBatch('');
                  setSelectedClass('');
                  setSelectedSection('');
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={currentStudents.length > 0 && currentStudents.every(s => selectedStudents.includes(s.id))}
                  onChange={selectAllOnPage}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                GR No
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class & Section
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batch
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fees Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
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
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full" src={student.photo || 'https://i.pravatar.cc/300?img=1'} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.fatherName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.grNo || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.class || 'N/A'}</div>
                  <div className="text-sm text-gray-500">Section {student.section || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.academicYear || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {
                      // Check if monthly challans have been generated
                      student.feesHistory && student.feesHistory.some(challan => challan.type === 'monthly')
                        ? parseFloat(student.feesPaid || 0) >= parseFloat(student.totalFees || 0) 
                          ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Fees Paid</span>
                          : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Fees Pending</span>
                        : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">No Challans</span>
                    }
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => console.log('Edit student', student.id)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FaEdit className="mr-1" /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-8">
            <FaUserTimes className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No students available for promotion</h3>
            <p className="mt-1 text-sm text-gray-500">Only studying students can be promoted</p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {filteredStudents.length > itemsPerPage && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredStudents.length}
            itemsPerPage={itemsPerPage}
            paginate={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Promotion Preview Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Promotion Preview</h3>
            </div>
            <div className="px-6 py-4">
              {/* Target Batch Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Academic Year</label>
                <select
                  value={targetBatch}
                  onChange={(e) => setTargetBatch(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select target batch</option>
                  {uniqueBatches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} ({batch.status === 'active' ? 'Active' : 'Completed'})
                    </option>
                  ))}
                </select>
              </div>
              
              {targetBatch && (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    Review the following promotions before confirming:
                  </p>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {promotionPreview.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">
                            {student.currentClass} → {student.nextClass}
                          </div>
                        </div>
                        <div>
                          {student.willGraduate ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <FaGraduationCap className="mr-1" /> Graduate
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Promote
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowPromotionModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={executePromotions}
                disabled={!targetBatch}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  targetBatch 
                    ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Confirm Promotions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManagement;