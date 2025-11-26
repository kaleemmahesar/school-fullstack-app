import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaUsers, FaUser, FaSearch, FaFilter } from 'react-icons/fa';
import Pagination from '../common/Pagination';

const FamilyStudentsList = ({ students: propStudents }) => {
  const { students: reduxStudents } = useSelector(state => state.students);
  
  // Use prop students if provided, otherwise use Redux students
  const students = propStudents || reduxStudents;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const familiesPerPage = 3; // Show 3 families per page

  // Get unique classes for dropdown
  const uniqueClasses = [...new Set(students.map(student => student.class))];

  // Get sections for selected class
  const classSections = selectedClass 
    ? [...new Set(students
        .filter(student => student.class === selectedClass)
        .map(student => student.section))]
    : [];

  // Get unique families
  const uniqueFamilies = [...new Set(students
    .filter(student => student.fatherName)
    .map(student => student.fatherName))]
    .map(fatherName => {
      const familyStudents = students.filter(s => s.fatherName === fatherName);
      return {
        id: fatherName.toLowerCase().replace(/\s+/g, '_'),
        name: `${fatherName}'s Family`,
        memberCount: familyStudents.length
      };
    });

  // Group students by family
  const groupStudentsByFamily = () => {
    const familyGroups = {};
    
    students.forEach(student => {
      // Use father's name as the family identifier
      const familyId = student.fatherName ? student.fatherName.toLowerCase().replace(/\s+/g, '_') : `unknown-${student.id}`;
      
      if (!familyGroups[familyId]) {
        familyGroups[familyId] = {
          familyInfo: {
            id: familyId,
            name: student.fatherName ? `${student.fatherName}'s Family` : 'Unknown Family',
            fatherName: student.fatherName || 'Unknown'
          },
          members: []
        };
      }
      
      familyGroups[familyId].members.push(student);
    });
    
    // Sort members within each family by age (oldest first)
    Object.values(familyGroups).forEach(familyGroup => {
      familyGroup.members.sort((a, b) => {
        // Assuming we have a dateOfBirth field, sort oldest first
        if (a.dateOfBirth && b.dateOfBirth) {
          return new Date(a.dateOfBirth) - new Date(b.dateOfBirth);
        }
        return 0;
      });
      
      // Set the head of family as the first member (oldest)
      const familyHead = familyGroup.members[0];
      familyGroup.familyInfo.head = familyHead;
    });
    
    return familyGroups;
  };

  const familyGroups = groupStudentsByFamily();

  // Filter families based on search term, class, section, and selected family
  const filterFamilies = () => {
    const filtered = {};
    
    Object.entries(familyGroups).forEach(([familyId, familyGroup]) => {
      // Filter members based on search, class, and section
      const filteredMembers = familyGroup.members.filter(student => {
        const matchesSearch = 
          `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.class.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesClass = !selectedClass || student.class === selectedClass;
        const matchesSection = !selectedSection || student.section === selectedSection;
        const matchesFamily = !selectedFamily || familyId === selectedFamily;
        
        return matchesSearch && matchesClass && matchesSection && matchesFamily;
      });
      
      // Only include families that have matching members
      if (filteredMembers.length > 0) {
        filtered[familyId] = {
          ...familyGroup,
          members: filteredMembers
        };
      }
    });
    
    return filtered;
  };

  const filteredFamilies = filterFamilies();

  // Get current families to display
  const indexOfLastFamily = currentPage * familiesPerPage;
  const indexOfFirstFamily = indexOfLastFamily - familiesPerPage;
  const currentFamilies = Object.entries(filteredFamilies).slice(indexOfFirstFamily, indexOfLastFamily);
  const totalFamilies = Object.entries(filteredFamilies).length;
  const totalPages = Math.ceil(totalFamilies / familiesPerPage);

  return (
    <>
      {/* Search and Filters - Consistent with other tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
            
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-400" />
                <select
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Families</option>
                  {uniqueFamilies.map((family) => (
                    <option key={family.id} value={family.id}>{family.name} ({family.memberCount})</option>
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
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Sections</option>
                  {classSections.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedClass('');
                  setSelectedSection('');
                  setSelectedFamily('');
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Family Groups */}
        <div className="space-y-6">
          {Object.entries(filteredFamilies).length > 0 ? (
            currentFamilies.map(([familyId, familyGroup]) => (
              <div key={familyId} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaUsers className="text-gray-600 text-lg mr-3" />
                      <h3 className="text-lg font-medium text-gray-900">{familyGroup.familyInfo.name}</h3>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {familyGroup.members.length} {familyGroup.members.length === 1 ? 'Member' : 'Members'}
                    </span>
                  </div>
                  {familyGroup.familyInfo.head && (
                    <p className="text-sm text-gray-500 mt-1">
                      Head: {familyGroup.familyInfo.head.firstName} {familyGroup.familyInfo.head.lastName}
                    </p>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {familyGroup.members.map((student) => (
                      <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex-shrink-0" />
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                              <h4 className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</h4>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {student.relationship || 'Family Member'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">ID: {student.id}</p>
                            <div className="mt-2">
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Class:</span> {student.class} - Section {student.section}
                              </p>
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Contact:</span> {student.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No family groups found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalFamilies > familiesPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalFamilies}
            itemsPerPage={familiesPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </>
  );
};

export default FamilyStudentsList;