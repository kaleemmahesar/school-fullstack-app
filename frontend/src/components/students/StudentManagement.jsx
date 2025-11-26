import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaUserCheck, FaUserTimes, FaUsers, FaUserPlus } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import StudentAvailabilityLists from './StudentAvailabilityLists';
import FamilyStudentsList from './FamilyStudentsList';
import FamilyManagement from '../family/FamilyManagement';

const StudentManagement = ({ onAddStudent }) => {
  const { students } = useSelector(state => state.students);
  
  console.log('Students in state:', students);
  
  const [activeTab, setActiveTab] = useState('available'); // 'available', 'unavailable', 'left', 'family'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [filteredStats, setFilteredStats] = useState(null); // To receive filtered stats from child

  // Get unique classes for dropdown
  const uniqueClasses = [...new Set(students.map(student => student.class))];

  // Get sections for selected class
  const classSections = selectedClass 
    ? [...new Set(students
        .filter(student => student.class === selectedClass)
        .map(student => student.section))]
    : [];

  // Get statistics for each category (unfiltered)
  const getUnfilteredStudentStats = () => {
    // Available students (all students who are not left or passed out)
    const available = students.filter(student => {
      return student.status !== 'left' && student.status !== 'passed_out';
    });

    // Left students (left in middle)
    const left = students.filter(student => {
      return student.status === 'left';
    });

    // Family groups
    const familyGroups = {};
    students.forEach(student => {
      const familyId = student.familyId || `unknown-${student.id}`;
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

  // Use filtered stats if available, otherwise use unfiltered stats
  const stats = filteredStats || getUnfilteredStudentStats();

  // Handle filter changes from child component
  const handleFilterChange = (filterData) => {
    setFilteredStats(filterData.stats);
    // Also update the filter values if they're different
    if (filterData.searchTerm !== undefined) setSearchTerm(filterData.searchTerm);
    if (filterData.selectedClass !== undefined) setSelectedClass(filterData.selectedClass);
    if (filterData.selectedSection !== undefined) setSelectedSection(filterData.selectedSection);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedClass('');
    setSelectedSection('');
    setFilteredStats(null);
  };

  return (
    <>
      <PageHeader
        title="Student Management"
        subtitle="Manage and view students by availability and family relationships"
        actionButton={
          <button
            onClick={onAddStudent}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaUserPlus className="mr-2 h-4 w-4" />
            Add Student
          </button>
        }
      />

      {/* Tabs for different views */}
      <div className="bg-white shadow p-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap space-x-6">
            <button
              onClick={() => setActiveTab('available')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaUserCheck className="mr-2" />
                Available
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {stats.available}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('left')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'left'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaUserTimes className="mr-2" />
                Left in Middle
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {stats.left}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('family')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'family'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaUsers className="mr-2" />
                Families
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {stats.families}
                </span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content based on active tab */}
      <div>
        {activeTab === 'available' || activeTab === 'left' ? (
          <StudentAvailabilityLists 
            activeTab={activeTab} 
            onFilterChange={handleFilterChange}
            parentSearchTerm={searchTerm}
            parentSelectedClass={selectedClass}
            parentSelectedSection={selectedSection}
          />
        ) : (
          <FamilyManagement />
        )}
      </div>

      {/* Summary Statistics */}
      <div className="mt-3 flex items-center text-sm text-gray-600">
        <span>
          Showing students filtered by search and class/section criteria
        </span>
        {(selectedClass || selectedSection || searchTerm) && (
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedClass('');
              setSelectedSection('');
            }}
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            (Clear filters)
          </button>
        )}
      </div>
    </>
  );
};

export default StudentManagement;