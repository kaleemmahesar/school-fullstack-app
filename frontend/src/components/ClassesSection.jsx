import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses, addClass, updateClass, deleteClass, updateClassFees, addSubjectToClass, removeSubjectFromClass, updateSubjectInClass } from '../store/classesSlice';
import { fetchStudents } from '../store/studentsSlice';
import { fetchStaff } from '../store/staffSlice';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBook, FaUsers, FaSchool, FaDollarSign, FaGraduationCap } from 'react-icons/fa';
import PageHeader from './common/PageHeader';
import ClassFormModal from './ClassFormModal';

const ClassesSection = () => {
  const dispatch = useDispatch();
  const { classes, loading, error } = useSelector(state => state.classes);
  const { students } = useSelector(state => state.students);
  const { staff } = useSelector(state => state.staff);
  const { schoolInfo } = useSelector(state => state.settings); // Add this line to access school settings
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' for low to high, 'desc' for high to low
  const [showClassModal, setShowClassModal] = useState(false);
  const [showFeesModal, setShowFeesModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [currentClass, setCurrentClass] = useState(null);
  const [feesAmount, setFeesAmount] = useState('');
  const [subjectData, setSubjectData] = useState({ name: '', teacherId: '', teacherName: '', maxMarks: 100 });
  const [editingSubject, setEditingSubject] = useState(null);

  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchStudents());
    dispatch(fetchStaff());
  }, [dispatch]);

  // Calculate student counts for each class and section dynamically
  const classesWithStudentCounts = useMemo(() => {
    return classes.map(classItem => {
      // Calculate total students for this class
      const totalStudents = students.filter(student => student.class === classItem.name).length;
      
      // Calculate students per section
      const sectionsWithCounts = (classItem.sections || []).map(section => {
        const studentCount = students.filter(student => 
          student.class === classItem.name && student.section === section.name
        ).length;
        return {
          ...section,
          studentCount
        };
      });
      
      return {
        ...classItem,
        totalStudents,
        sections: sectionsWithCounts
      };
    });
  }, [classes, students]);

  const handleEdit = (classItem) => {
    setCurrentClass(classItem);
    setShowClassModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this class? This will remove all sections.')) {
      dispatch(deleteClass(id));
    }
  };

  const handleSetFees = (classItem) => {
    setSelectedClass(classItem);
    setFeesAmount(classItem.monthlyFees || '');
    setShowFeesModal(true);
  };

  const handleManageSubjects = (classItem) => {
    setSelectedClass(classItem);
    // Reset the subject form when opening the modal
    setSubjectData({ name: '', teacherId: '', teacherName: '', maxMarks: 100 });
    setShowSubjectModal(true);
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (selectedClass && subjectData.name) { // Only require subject name, teacher is optional
      const newSubject = {
        id: `${selectedClass.id}-${Date.now()}`,
        name: subjectData.name,
        code: subjectData.code,
        teacherId: subjectData.teacherId || '', // Ensure teacherId is empty string if not selected
        maxMarks: subjectData.maxMarks
      };
      dispatch(addSubjectToClass({ 
        classId: selectedClass.id, 
        subject: newSubject 
      }));
      // Reset the form after submission
      setSubjectData({ name: '', code: '', teacherId: '', teacherName: '', maxMarks: 100 });
    }
  };

  const handleRemoveSubject = (subjectId) => {
    // Find the subject name for the confirmation message
    let subjectName = 'this subject';
    if (selectedClass) {
      const currentClassData = classes.find(cls => cls.id === selectedClass.id) || selectedClass;
      const subject = currentClassData.subjects?.find(sub => sub.id === subjectId);
      if (subject) {
        subjectName = subject.name;
      }
    }
    
    if (window.confirm(`Are you sure you want to remove "${subjectName}" from this class?`)) {
      dispatch(removeSubjectFromClass({ 
        classId: selectedClass.id, 
        subjectId 
      }));
    }
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setSubjectData({
      name: subject.name,
      code: subject.code,
      teacherId: subject.teacher_id || '',
      teacherName: subject.teacherFirstName ? `${subject.teacherFirstName} ${subject.teacherLastName}` : 'No teacher assigned',
      maxMarks: subject.maxMarks || 100
    });
  };

  const handleUpdateSubject = (e) => {
    e.preventDefault();
    if (selectedClass && editingSubject && subjectData.name) {
      const updatedSubjectData = {
        name: subjectData.name,
        code: subjectData.code,
        teacherId: subjectData.teacherId || '',
        maxMarks: subjectData.maxMarks
      };
      
      dispatch(updateSubjectInClass({ 
        classId: selectedClass.id, 
        subjectId: editingSubject.id,
        updatedSubjectData
      }));
      
      // Reset the form and editing state
      setSubjectData({ name: '', code: '', teacherId: '', teacherName: '', maxMarks: 100 });
      setEditingSubject(null);
    }
  };

  const submitFeesUpdate = (e) => {
    e.preventDefault();
    if (selectedClass && feesAmount) {
      dispatch(updateClassFees({ 
        classId: selectedClass.id, 
        monthlyFees: parseFloat(feesAmount) 
      }));
      setShowFeesModal(false);
      setFeesAmount('');
    }
  };

  const handleClassSubmit = async (classData) => {
    try {
      let updatedClass;
      
      if (currentClass) {
        // Update existing class
        updatedClass = await dispatch(updateClass({ ...currentClass, ...classData })).unwrap();
      } else {
        // Add new class
        updatedClass = await dispatch(addClass(classData)).unwrap();
      }
      
      // If the class was successfully added/updated and has sections, add them
      if (updatedClass && classData.sections && classData.sections.length > 0) {
        // For now, we're just closing the modal since sections are managed separately
        // In a full implementation, we would add sections here
      }
      
      setShowClassModal(false);
      setCurrentClass(null);
    } catch (error) {
      console.error('Failed to save class:', error);
    }
  };

  const filteredClasses = classesWithStudentCounts
    .filter(cls => cls.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      // Extract numeric part from class name for proper sorting
      const extractNumber = (className) => {
        const match = className.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      };
      
      const numA = extractNumber(a.name);
      const numB = extractNumber(b.name);
      
      if (sortOrder === 'asc') {
        return numA - numB;
      } else {
        return numB - numA;
      }
    });

  // Calculate total students across all classes
  const totalStudents = classesWithStudentCounts.reduce((sum, cls) => sum + cls.totalStudents, 0);

  // Calculate total sections
  const totalSections = classesWithStudentCounts.reduce((sum, cls) => sum + cls.sections.length, 0);

  // Filter teachers from staff
  const teachers = staff.filter(member => 
    member.jobType === 'Teaching'
  );

  // Check if school is NGO funded
  const isNGOFunded = schoolInfo?.fundingType === 'ngo';

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">Error: {error}</p>
      </div>
    </div>
  </div>;

  return (
    // Removed the outer div with className "space-y-6" since Layout provides the styling
    <>
      <PageHeader
        title="Classes Management"
        subtitle="Manage classes, sections, subjects, and student distribution"
        actionButton={
          <button
            onClick={() => {
              setCurrentClass(null);
              setShowClassModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <FaPlus className="mr-2" /> Add Class
          </button>
        }
      />

      {/* Summary Statistics */}
      <div className="my-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Total Classes</p>
                <p className="text-2xl font-bold mt-1">{classes.length}</p>
              </div>
              <div className="p-2 bg-blue-400 bg-opacity-30 rounded-full">
                <FaBook size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium">Total Students</p>
                <p className="text-2xl font-bold mt-1">{totalStudents}</p>
              </div>
              <div className="p-2 bg-green-400 bg-opacity-30 rounded-full">
                <FaUsers size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium">Total Sections</p>
                <p className="text-2xl font-bold mt-1">{totalSections}</p>
              </div>
              <div className="p-2 bg-purple-400 bg-opacity-30 rounded-full">
                <FaSchool size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters - Move inside table section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Filters inside the table container */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by class name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSortOrder('asc')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sortOrder === 'asc' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Low to High
              </button>
              <button
                onClick={() => setSortOrder('desc')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sortOrder === 'desc' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                High to Low
              </button>
            </div>
          </div>
        </div>

        {/* Classes Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sections</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                {/* Conditionally render Monthly Fees column based on funding type */}
                {!isNGOFunded && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Fees</th>
                )}
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClasses.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{classItem.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(classItem.sections || []).map((section) => (
                        <span key={section.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {section.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {classItem.subjects && classItem.subjects.map((subject) => (
                        <span key={subject.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <FaGraduationCap className="mr-1" /> {subject.name} ({subject.teacherFirstName ? `${subject.teacherFirstName} ${subject.teacherLastName}` : 'No teacher assigned'})
                        </span>
                      ))}
                      {(!classItem.subjects || classItem.subjects.length === 0) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No subjects
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classItem.totalStudents}
                  </td>
                  {/* Conditionally render Monthly Fees cell based on funding type */}
                  {!isNGOFunded && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {classItem.monthlyFees ? `Rs ${Math.round(classItem.monthlyFees)}` : 'Not set'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {/* Conditionally render Set Fees button based on funding type */}
                      {!isNGOFunded && (
                        <button
                          onClick={() => handleSetFees(classItem)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FaDollarSign className="mr-1" /> Set Fees
                        </button>
                      )}
                      <button
                        onClick={() => handleManageSubjects(classItem)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaBook className="mr-1" /> Subjects
                      </button>
                      <button
                        onClick={() => handleEdit(classItem)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(classItem.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredClasses.length === 0 && (
            <div className="text-center py-12">
              <FaBook className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No classes found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>

      

      {/* Class Form Modal */}
      {showClassModal && (
        <ClassFormModal
          onClose={() => {
            setShowClassModal(false);
            setCurrentClass(null);
          }}
          onSubmit={handleClassSubmit}
          classData={currentClass}
          students={students} // Pass students data to the modal
        />
      )}

      {/* Fees Modal - Only show if not NGO funded */}
      {!isNGOFunded && showFeesModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Set Monthly Fees</h3>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Class:</span>
                <span className="font-medium">{selectedClass.name}</span>
              </div>
            </div>
            <form onSubmit={submitFeesUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fees</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaDollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={feesAmount}
                    onChange={(e) => setFeesAmount(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFeesModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Fees
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {showSubjectModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-screen flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Manage Subjects</h3>
                {/* Get the latest class data from Redux store */}
                <p className="text-sm text-gray-500 mt-1">
                  Class: {classes.find(c => c.id === selectedClass.id)?.name || selectedClass.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add/Edit Subject Form */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                  </h4>
                  <form onSubmit={editingSubject ? handleUpdateSubject : handleAddSubject} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                      <input
                        type="text"
                        value={subjectData.name}
                        onChange={(e) => setSubjectData({...subjectData, name: e.target.value})}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Mathematics"
                        required
                        readOnly={!!editingSubject} // Make subject name read-only when editing
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                      <select
                        value={subjectData.teacherId || ''}
                        onChange={(e) => {
                          const selectedTeacher = e.target.value ? teachers.find(teacher => teacher.id === e.target.value) : null;
                          setSubjectData({
                            ...subjectData, 
                            teacherId: e.target.value || '',
                            teacherName: selectedTeacher ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}` : ''
                          });
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a teacher</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.firstName} {teacher.lastName} {teacher.subject ? `(${teacher.subject})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Marks</label>
                      <input
                        type="number"
                        value={subjectData.maxMarks}
                        onChange={(e) => setSubjectData({...subjectData, maxMarks: parseInt(e.target.value) || 100})}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="100"
                        min="1"
                        required
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {editingSubject ? 'Update Subject' : 'Add Subject'}
                      </button>
                      {editingSubject && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSubject(null);
                            setSubjectData({ name: '', teacherId: '', teacherName: '', maxMarks: 100 });
                          }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
                
                {/* Existing Subjects - Get latest data from Redux */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Existing Subjects</h4>
                  {/* Get the latest class data from Redux store */}
                  {(() => {
                    const currentClassData = classes.find(c => c.id === selectedClass.id) || selectedClass;
                    return currentClassData.subjects && currentClassData.subjects.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {currentClassData.subjects.map((subject) => (
                          <div key={subject.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{subject.name}</div>
                              <div className="text-xs text-gray-500 truncate">
                                Teacher: {subject.teacherFirstName ? `${subject.teacherFirstName} ${subject.teacherLastName}` : 'No teacher assigned'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Max Marks: {subject.maxMarks || 100}
                              </div>
                            </div>
                            <div className="ml-2 flex space-x-1">
                              <button
                                onClick={() => handleEditSubject(subject)}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-shrink-0"
                              >
                                <FaEdit size={12} />
                              </button>
                              <button
                                onClick={() => handleRemoveSubject(subject.id)}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex-shrink-0"
                              >
                                <FaTrash size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FaBook className="mx-auto h-8 w-8" />
                        <p className="mt-2">No subjects added yet</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default ClassesSection;