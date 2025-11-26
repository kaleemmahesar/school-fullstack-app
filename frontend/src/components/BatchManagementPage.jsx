import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchStudents } from '../store/studentsSlice';
import { fetchBatches, addBatch, updateBatch, deleteBatch } from '../store/alumniSlice';
import PageHeader from './common/PageHeader';
import PromotionManagement from './PromotionManagement';
import { FaPlus, FaSearch, FaFilter, FaUsers, FaCalendarAlt, FaUserGraduate, FaEdit, FaDownload, FaPrint, FaCheck, FaTimes, FaTrash, FaUserCheck, FaUserTimes, FaList } from 'react-icons/fa';
import Pagination from './common/Pagination';
import StudentAvailabilityLists from './students/StudentAvailabilityLists';
import FamilyStudentsList from './students/FamilyStudentsList';

const BatchManagementPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { students, loading: studentsLoading } = useSelector(state => state.students);
  const { batches, loading: batchesLoading } = useSelector(state => state.alumni);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBatchesModal, setShowBatchesModal] = useState(false);
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'promotion'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [newBatchData, setNewBatchData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'active' // Changed default to 'active'
  });
  const [editingBatch, setEditingBatch] = useState(null);
  const [studentListTab, setStudentListTab] = useState('available'); // 'available', 'left', 'family'

  useEffect(() => {
    dispatch(fetchStudents());
    // Only fetch batches once when component mounts
    dispatch(fetchBatches());
  }, [dispatch]); // Empty dependency array means this runs once

  // Auto-update batch statuses based on end dates
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    batches.forEach(batch => {
      // Only check active batches
      if (batch.status === 'active') {
        const endDate = new Date(batch.endDate);
        endDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
        
        // If batch end date has passed, mark as completed
        if (endDate < today) {
          const updatedBatch = {
            ...batch,
            status: 'completed'
          };
          dispatch(updateBatch(updatedBatch));
        }
      }
    });
  }, [batches, dispatch]);

  // Set default selected batch to the active batch
  useEffect(() => {
    if (batches.length > 0 && !selectedBatch) {
      const activeBatch = batches.find(batch => batch.status === 'active');
      if (activeBatch) {
        setSelectedBatch(activeBatch.name);
      }
    }
  }, [batches, selectedBatch]);

  // Get unique academic years from students
  const getUniqueBatches = () => {
    // Use the actual batches from the store
    return batches;
  };

  const uniqueBatches = getUniqueBatches();

  // Get unique classes for dropdown based on selected batch
  const uniqueClasses = selectedBatch 
    ? [...new Set(students
        .filter(student => student.academicYear === selectedBatch)
        .map(student => student.class))]
    : [];

  // Get sections for selected class and batch
  const classSections = selectedClass && selectedBatch
    ? [...new Set(students
        .filter(student => student.class === selectedClass && student.academicYear === selectedBatch)
        .map(student => student.section))]
    : [];

  // Filter students by selected batch, class, section and search term
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.grNo && student.grNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.class && student.class.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Match by batch name instead of academicYear
    const matchesBatch = !selectedBatch || student.academicYear === selectedBatch;
    const matchesClass = !selectedClass || student.class === selectedClass;
    const matchesSection = !selectedSection || student.section === selectedSection;
    
    return matchesSearch && matchesBatch && matchesClass && matchesSection;
  });

  // Get the status of the selected batch
  const selectedBatchStatus = selectedBatch 
    ? uniqueBatches.find(batch => batch.name === selectedBatch)?.status 
    : null;

  // For completed batches, we want to show graduated students (passed_out)
  // For active batches, we filter out passed_out students as they've graduated
  const displayStudents = selectedBatchStatus === 'completed' 
    ? filteredStudents // Show all students for completed batches
    : filteredStudents.filter(student => student.status !== 'passed_out'); // Hide graduated students for active batches

  // Get statistics for each category based on filtered students
  const getFilteredStudentStats = () => {
    let available, left;
    
    // For completed batches, we want to show and count graduated students (passed_out)
    // For active batches, we filter out passed_out students as they've graduated
    if (selectedBatchStatus === 'completed') {
      // For completed batches, include passed_out students in available count
      available = displayStudents.filter(student => {
        return student.status !== 'left'; // Only exclude left students
      });
      
      // Left students (left in middle)
      left = displayStudents.filter(student => {
        return student.status === 'left';
      });
    } else {
      // For active batches, keep the original logic
      // Available students (all students who are not left or passed out)
      available = displayStudents.filter(student => {
        return student.status !== 'left' && student.status !== 'passed_out';
      });
      
      // Left students (left in middle)
      left = displayStudents.filter(student => {
        return student.status === 'left';
      });
    }

    // Family groups based on father's name
    const familyGroups = {};
    displayStudents.forEach(student => {
      const familyId = student.fatherName ? student.fatherName.toLowerCase().replace(/\s+/g, '_') : `unknown-${student.id}`;
      if (!familyGroups[familyId]) {
        familyGroups[familyId] = [];
      }
      familyGroups[familyId].push(student);
    });
    const familyCount = Object.keys(familyGroups).length;

    return {
      available: available.length,
      left: left.length,
      families: familyCount
    };
  };

  const studentStats = getFilteredStudentStats();

  // Pagination
  const totalPages = Math.ceil(displayStudents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = displayStudents.slice(indexOfFirstItem, indexOfLastItem);

  const handleCreateBatch = () => {
    if (newBatchData.name && newBatchData.startDate && newBatchData.endDate) {
      // Auto-generate ID based on name
      const batchData = {
        ...newBatchData,
        id: `batch-${newBatchData.name.replace('/', '-')}`,
        classes: ['PG', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
        sections: ['A', 'B']
      };
      dispatch(addBatch(batchData));
      setShowCreateModal(false);
      setNewBatchData({
        name: '',
        startDate: '',
        endDate: '',
        status: 'active' // Changed default to 'active'
      });
    }
  };

  const handleUpdateBatch = () => {
    if (editingBatch && editingBatch.name && editingBatch.startDate && editingBatch.endDate) {
      dispatch(updateBatch(editingBatch));
      setShowEditModal(false);
      setEditingBatch(null);
    }
  };

  const handleDeleteBatch = (batchId) => {
    if (window.confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
      dispatch(deleteBatch(batchId));
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  if (studentsLoading || batchesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Batch Management"
        subtitle="Manage academic years and student batches"
        actionButton={
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/students/admission')}
              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500"
            >
              <FaPlus className="mr-1 h-3 w-3" />
              Add Student
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
            >
              <FaPlus className="mr-1 h-3 w-3" />
              Create Batch
            </button>
          </div>
        }
      />

      {/* Batch Filter Section - Moved to top */}
      {/* <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Batch:</label>
            <div className="flex items-center">
              <select
                value={selectedBatch}
                onChange={(e) => {
                  setSelectedBatch(e.target.value);
                  // Reset class and section filters when batch changes
                  setSelectedClass('');
                  setSelectedSection('');
                }}
                className="block w-full pl-3 pr-10 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Batches</option>
                {uniqueBatches.map((batch) => (
                  <option key={batch.id} value={batch.name}>
                    {batch.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowBatchesModal(true)}
                className="ml-2 inline-flex items-center px-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
              >
                <FaList className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-grow"></div>
          
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by student name, GR No, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div> */}

      {/* Student Filters - Only shown when a batch is selected */}
      {/* {selectedBatch && (
        <div className="bg-white shadow rounded-lg p-3 mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-1">
                <FaFilter className="text-gray-400 text-sm" />
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSection(''); // Reset section when class changes
                  }}
                  className="block w-full pl-2 pr-8 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-1">
                <FaFilter className="text-gray-400 text-sm" />
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={!selectedClass}
                  className="block w-full pl-2 pr-8 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Sections</option>
                  {classSections.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedClass('');
                    setSelectedSection('');
                  }}
                  className="inline-flex items-center px-2 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Tabs - Made more compact */}
      <div className="bg-white shadow rounded-lg mb-4">
        <div className="border-b border-gray-200 flex justify-between">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('students')}
              className={`py-3 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaUsers className="mr-2" />
                Students by Batch
              </div>
            </button>
            <button
              onClick={() => setActiveTab('promotion')}
              className={`py-3 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'promotion'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaUserGraduate className="mr-2" />
                Promotion Management
              </div>
            </button>
          </nav>
          <div className="flex items-center space-x-2 px-4">
            <label className="text-sm font-medium text-gray-700">Batch:</label>
            <div className="flex items-center">
              <select
                value={selectedBatch}
                onChange={(e) => {
                  setSelectedBatch(e.target.value);
                  // Reset class and section filters when batch changes
                  setSelectedClass('');
                  setSelectedSection('');
                }}
                className="block w-full pl-3 pr-10 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Batches</option>
                {uniqueBatches.map((batch) => (
                  <option key={batch.id} value={batch.name}>
                    {batch.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowBatchesModal(true)}
                className="ml-2 inline-flex items-center px-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
              >
                <FaList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'students' ? (
        <>
          {/* Student List Tabs - Made more compact */}
          <div className="bg-white shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex flex-wrap space-x-4 px-3">
                <button
                  onClick={() => setStudentListTab('available')}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs ${
                    studentListTab === 'available'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <FaUserCheck className="mr-1" />
                    Available
                    <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {studentStats.available}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setStudentListTab('left')}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs ${
                    studentListTab === 'left'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <FaUserTimes className="mr-1" />
                    Left in Middle
                    <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {studentStats.left}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setStudentListTab('family')}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs ${
                    studentListTab === 'family'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <FaUsers className="mr-1" />
                    Families
                    <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {studentStats.families}
                    </span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Student Lists Content */}
          <div className="mb-6">
            {studentListTab === 'available' || studentListTab === 'left' ? (
              <StudentAvailabilityLists 
                activeTab={studentListTab}
                parentSearchTerm={searchTerm}
                parentSelectedClass={selectedClass}
                parentSelectedSection={selectedSection}
                students={displayStudents} // Pass the displayStudents instead of using the Redux store directly
                isCompletedBatch={selectedBatchStatus === 'completed'} // Pass whether we're viewing a completed batch
              />
            ) : (
              <FamilyStudentsList students={displayStudents} />
            )}
          </div>
        </>
      ) : (
        // Pass batches data to PromotionManagement component
        <PromotionManagement batches={batches} />
      )}

      {/* Create Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create New Batch</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Batch Name</label>
                <input
                  type="text"
                  value={newBatchData.name}
                  onChange={(e) => setNewBatchData({...newBatchData, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2025-2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={newBatchData.startDate}
                  onChange={(e) => setNewBatchData({...newBatchData, startDate: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={newBatchData.endDate}
                  onChange={(e) => setNewBatchData({...newBatchData, endDate: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={newBatchData.status}
                  onChange={(e) => setNewBatchData({...newBatchData, status: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {/* Removed 'upcoming' option */}
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBatch}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {showEditModal && editingBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Edit Batch</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Batch Name</label>
                <input
                  type="text"
                  value={editingBatch.name}
                  onChange={(e) => setEditingBatch({...editingBatch, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2025-2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={editingBatch.startDate}
                  onChange={(e) => setEditingBatch({...editingBatch, startDate: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={editingBatch.endDate}
                  onChange={(e) => setEditingBatch({...editingBatch, endDate: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={editingBatch.status}
                  onChange={(e) => setEditingBatch({...editingBatch, status: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {/* Removed 'upcoming' option */}
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBatch}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batches List Modal */}
      {showBatchesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Academic Batches</h3>
              <button 
                onClick={() => setShowBatchesModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch Name
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Students
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Available
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Left
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Graduated
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {uniqueBatches.map((batch) => {
                      // Count students in this batch
                      const batchStudents = students.filter(s => s.academicYear === batch.name);
                      const totalStudents = batchStudents.length;
                      
                      // Calculate student statistics for this batch
                      const availableStudents = batchStudents.filter(s => s.status !== 'left' && s.status !== 'passed_out').length;
                      const leftStudents = batchStudents.filter(s => s.status === 'left').length;
                      const graduatedStudents = batchStudents.filter(s => s.status === 'passed_out').length;
                      
                      return (
                        <tr key={batch.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{batch.name}</div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="text-xs text-gray-900">
                              {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              batch.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {batch.status === 'active' ? (
                                <FaCheck className="mr-1" />
                              ) : (
                                <FaTimes className="mr-1" />
                              )}
                              {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {totalStudents}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {availableStudents}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {leftStudents}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {graduatedStudents}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setEditingBatch({...batch});
                                setShowEditModal(true);
                                setShowBatchesModal(false);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteBatch(batch.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {uniqueBatches.length === 0 && (
                  <div className="text-center py-6">
                    <FaCalendarAlt className="mx-auto h-8 w-8 text-gray-400" />
                    <h3 className="mt-1 text-sm font-medium text-gray-900">No batches found</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Create your first batch to get started
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowBatchesModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BatchManagementPage;