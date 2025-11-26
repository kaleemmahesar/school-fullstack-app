import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaUsers, FaUser, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import { addStudent, updateStudent } from '../../store/studentsSlice';
import { addParent, updateParent } from '../../store/parentsSlice';
import Pagination from '../common/Pagination';
import SearchableStudentDropdown from '../common/SearchableStudentDropdown';
import MultiSelectSearchableStudentDropdown from '../common/MultiSelectSearchableStudentDropdown';

const FamilyManagement = () => {
  const dispatch = useDispatch();
  const { students } = useSelector(state => state.students);
  const { parents } = useSelector(state => state.parents);
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'manage'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [showEditFamilyModal, setShowEditFamilyModal] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [newFamilyData, setNewFamilyData] = useState({
    parentId: '',
    parentName: '',
    studentIds: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Show 3 families per page

  // Group students by family based on parents
  const groupStudentsByFamily = () => {
    const familyGroups = {};
    
    // First, create family groups based on parents
    parents.forEach(parent => {
      familyGroups[parent.id] = {
        familyInfo: {
          id: parent.id,
          name: `${parent.firstName} ${parent.lastName} Family`,
          head: parent
        },
        members: [],
        totalFees: 0,
        feesPaid: 0,
        feesPending: 0
      };
    });
    
    // Then, add students to their respective family groups
    students.forEach(student => {
      // Find the parent for this student
      const parent = parents.find(p => p.studentIds.includes(student.id));
      
      if (parent && familyGroups[parent.id]) {
        familyGroups[parent.id].members.push(student);
      } else {
        // Handle students without parents (orphaned students)
        const familyId = `unknown-${student.id}`;
        if (!familyGroups[familyId]) {
          familyGroups[familyId] = {
            familyInfo: {
              id: familyId,
              name: 'Unknown Family',
              head: null
            },
            members: [],
            totalFees: 0,
            feesPaid: 0,
            feesPending: 0
          };
        }
        familyGroups[familyId].members.push(student);
      }
    });
    
    return familyGroups;
  };

  const familyGroups = groupStudentsByFamily();

  // Get unique families for dropdown
  const uniqueFamilies = Object.values(familyGroups).map(familyGroup => ({
    id: familyGroup.familyInfo.id,
    name: familyGroup.familyInfo.name,
    memberCount: familyGroup.members.length
  }));

  // Filter families based on search term and selected family
  const filterFamilies = () => {
    const filtered = {};
    
    Object.entries(familyGroups).forEach(([familyId, familyGroup]) => {
      // Filter members based on search
      const filteredMembers = familyGroup.members.filter(student => {
        const matchesSearch = 
          `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.class || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFamily = !selectedFamily || familyId === selectedFamily;
        
        return matchesSearch && matchesFamily;
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
  
  // Get paginated families
  const getPaginatedFamilies = () => {
    const familyEntries = Object.entries(filteredFamilies);
    const totalFamilies = familyEntries.length;
    const totalPages = Math.ceil(totalFamilies / itemsPerPage);
    
    // If current page is beyond the total pages, reset to last page
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
      return { families: [], totalFamilies, totalPages };
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedEntries = familyEntries.slice(startIndex, endIndex);
    
    const paginatedFamilies = {};
    paginatedEntries.forEach(([familyId, familyGroup]) => {
      paginatedFamilies[familyId] = familyGroup;
    });
    
    return { families: paginatedFamilies, totalFamilies, totalPages };
  };

  const { families: paginatedFamilies, totalFamilies, totalPages } = getPaginatedFamilies();

  // Handle adding a new family
  const handleAddFamily = (e) => {
    e.preventDefault();
    
    // Create a new parent
    const parentId = `parent-${Date.now()}`;
    const [firstName, ...lastNameParts] = newFamilyData.parentName.trim().split(' ');
    const lastName = lastNameParts.join(' ') || '';
    
    const newParent = {
      id: parentId,
      firstName: firstName,
      lastName: lastName,
      email: '',
      phone: '',
      address: '',
      relationship: 'father',
      studentIds: newFamilyData.studentIds
    };
    
    dispatch(addParent(newParent));
    
    // Update students with the parent ID
    newFamilyData.studentIds.forEach(studentId => {
      const student = students.find(s => s.id === studentId);
      if (student) {
        dispatch(updateStudent({
          id: student.id,
          parentId: parentId,
          familyId: parentId
        }));
      }
    });
    
    // Close modal and reset form
    setShowAddFamilyModal(false);
    setNewFamilyData({
      parentId: '',
      parentName: '',
      studentIds: []
    });
    
    // Reset to first page when adding a new family
    setCurrentPage(1);
  };

  // Handle editing a family
  const handleEditFamily = (family) => {
    setEditingParent(family.familyInfo.head);
    setNewFamilyData({
      parentId: family.familyInfo.head?.id || '',
      parentName: family.familyInfo.head ? `${family.familyInfo.head.firstName} ${family.familyInfo.head.lastName}` : '',
      studentIds: family.members.map(member => member.id)
    });
    setShowEditFamilyModal(true);
  };

  // Handle updating a family
  const handleUpdateFamily = (e) => {
    e.preventDefault();
    
    if (editingParent) {
      // Update the parent
      const updatedParent = {
        ...editingParent,
        studentIds: newFamilyData.studentIds
      };
      
      dispatch(updateParent(updatedParent));
      
      // Update students with the parent ID
      students.forEach(student => {
        // If student was previously in this family but is no longer, remove the family reference
        if (student.familyId === editingParent.id && !newFamilyData.studentIds.includes(student.id)) {
          dispatch(updateStudent({
            id: student.id,
            parentId: null,
            familyId: null
          }));
        }
        // If student is now in this family, add the family reference
        else if (newFamilyData.studentIds.includes(student.id)) {
          dispatch(updateStudent({
            id: student.id,
            parentId: editingParent.id,
            familyId: editingParent.id
          }));
        }
      });
      
      // Close modal and reset form
      setShowEditFamilyModal(false);
      setEditingParent(null);
      setNewFamilyData({
        parentId: '',
        parentName: '',
        studentIds: []
      });
    }
  };

  return (
    <div className="bg-white shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Family Management</h2>
        <button
          onClick={() => setShowAddFamilyModal(true)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaPlus className="mr-1 h-4 w-4" />
          Add Family
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab('view')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'view'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaUsers className="mr-1 inline" />
            View Families
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaEdit className="mr-1 inline" />
            Manage Families
          </button>
        </nav>
      </div>

      {activeTab === 'view' ? (
        <>
          {/* Search and Filters */}
          <div className="mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by student name, email, or class..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <FaFilter className="text-gray-400 h-4 w-4" />
                  <select
                    value={selectedFamily}
                    onChange={(e) => setSelectedFamily(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">All Families</option>
                    {uniqueFamilies.map((family) => (
                      <option key={family.id} value={family.id}>{family.name} ({family.memberCount})</option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedFamily('');
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Family Groups */}
          <div className="space-y-4">
            {Object.entries(paginatedFamilies).length > 0 ? (
              Object.entries(paginatedFamilies).map(([familyId, familyGroup]) => (
                <div key={familyId} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaUsers className="text-gray-600 text-lg mr-2" />
                        <h3 className="text-base font-medium text-gray-900">{familyGroup.familyInfo.name}</h3>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {familyGroup.members.length} {familyGroup.members.length === 1 ? 'Member' : 'Members'}
                      </span>
                    </div>
                    {familyGroup.familyInfo.head && (
                      <p className="text-xs text-gray-500 mt-1">
                        Head: {familyGroup.familyInfo.head.firstName} {familyGroup.familyInfo.head.lastName}
                      </p>
                    )}
                    {/* Removed fees summary for NGO school */}
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {familyGroup.members.map((student) => (
                        <div key={student.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="flex justify-between">
                                <h4 className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</h4>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {student.relationship || 'Family Member'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">ID: {student.id}</p>
                              <div className="mt-1">
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium">Class:</span> {student.class} - Section {student.section}
                                </p>
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium">Contact:</span> {student.phone}
                                </p>
                              </div>
                              {/* Removed student fees information for NGO school */}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FaUsers className="mx-auto h-8 w-8 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No family groups found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalFamilies > itemsPerPage && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalFamilies}
                itemsPerPage={itemsPerPage}
                paginate={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </>
      ) : (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaUsers className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">How to Manage Families</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Families in this system are managed through parents who are the head of each family.</p>
                <p className="mt-2">To create a new family:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Click the "Add New Family" button above</li>
                  <li>Enter the parent's full name (this will be the family head)</li>
                  <li>Select students to be part of this family</li>
                </ol>
                <p className="mt-2">To add a student to an existing family:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Click the "Edit" button for the family</li>
                  <li>Select additional students to add to the family</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Family Modal */}
      {showAddFamilyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Add New Family</h3>
            <form onSubmit={handleAddFamily} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                <input
                  type="text"
                  value={newFamilyData.parentName}
                  onChange={(e) => setNewFamilyData({...newFamilyData, parentName: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Enter parent's full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Students</label>
                <MultiSelectSearchableStudentDropdown
                  students={students}
                  values={newFamilyData.studentIds}
                  onChange={(selectedIds) => setNewFamilyData({...newFamilyData, studentIds: selectedIds})}
                  placeholder="Search and select students..."
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFamilyModal(false)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaPlus className="mr-1" /> Create Family
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Family Modal */}
      {showEditFamilyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Edit Family</h3>
            <form onSubmit={handleUpdateFamily} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                <input
                  type="text"
                  value={newFamilyData.parentName}
                  onChange={(e) => setNewFamilyData({...newFamilyData, parentName: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Students</label>
                <MultiSelectSearchableStudentDropdown
                  students={students}
                  values={newFamilyData.studentIds}
                  onChange={(selectedIds) => setNewFamilyData({...newFamilyData, studentIds: selectedIds})}
                  placeholder="Search and select students..."
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditFamilyModal(false)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaEdit className="mr-1" /> Update Family
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyManagement;