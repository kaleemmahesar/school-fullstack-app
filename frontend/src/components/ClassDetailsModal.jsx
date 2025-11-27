import React, { useState } from 'react';
import { FaBook, FaUsers, FaDollarSign, FaTrash, FaPlus, FaSave } from 'react-icons/fa';

const ClassDetailsModal = ({ 
  classItem, 
  onClose, 
  onUpdateFees, 
  onAddSubject, 
  onRemoveSubject,
  students,
  staff,
  viewMode // Add viewMode prop
}) => {
  const [newSubject, setNewSubject] = useState({ name: '', teacher: '' });
  const [monthlyFees, setMonthlyFees] = useState(classItem.monthlyFees || '');

  // Get list of teachers from staff
  const getTeachers = () => {
    return staff.filter(member => 
      member.position && 
      (member.position.toLowerCase().includes('teacher') || 
       member.position.toLowerCase().includes('professor') ||
       member.position.toLowerCase().includes('instructor'))
    );
  };

  // Get number of students in this class
  const getStudentCount = () => {
    if (!students) return 0;
    return students.filter(student => student.class === classItem.name).length;
  };

  // Get student count per section
  const getSectionStudentCounts = () => {
    if (!students || !classItem.sections) return {};
    
    const counts = {};
    classItem.sections.forEach(section => {
      counts[section.name] = students.filter(
        student => student.class === classItem.name && student.section === section.name
      ).length;
    });
    return counts;
  };

  const handleAddSubject = () => {
    if (newSubject.name.trim() && newSubject.teacher.trim()) {
      const subject = {
        id: `${classItem.id}-${Date.now()}`,
        ...newSubject
      };
      onAddSubject(classItem.id, subject);
      setNewSubject({ name: '', teacher: '' });
    }
  };

  const handleUpdateFees = () => {
    onUpdateFees(classItem.id, parseFloat(monthlyFees) || 0);
  };

  const sectionStudentCounts = getSectionStudentCounts();
  const totalStudents = getStudentCount();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {classItem.name} Details
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="py-4 px-4">
          {/* Class Statistics - Reduced size and padding */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
            <div className="bg-blue-50 rounded p-2">
              <div className="flex items-center">
                <FaUsers className="text-blue-500 text-base mr-2" />
                <div>
                  <p className="text-xs text-gray-600">Total Students</p>
                  <p className="text-base font-bold text-gray-900">{totalStudents}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded p-2">
              <div className="flex items-center">
                <FaBook className="text-green-500 text-base mr-2" />
                <div>
                  <p className="text-xs text-gray-600">Sections</p>
                  <p className="text-base font-bold text-gray-900">{classItem.sections?.length || 0}</p>
                </div>
              </div>
            </div>
            
            {/* Only show monthly fees in fees view mode */}
            {viewMode === 'fees' && (
              <div className="bg-purple-50 rounded p-2">
                <div className="flex items-center">
                  <FaDollarSign className="text-purple-500 text-base mr-2" />
                  <div>
                    <p className="text-xs text-gray-600">Monthly Fees</p>
                    <p className="text-base font-bold text-gray-900">
                      Rs {Math.round(classItem.monthlyFees) || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Section Details */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Sections</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {classItem.sections?.map((section, index) => (
                <div key={index} className="border border-gray-200 rounded p-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Section {section.name}</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded">
                      {sectionStudentCounts[section.name] || 0} students
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Fees Update - Only show in fees view mode */}
          {viewMode === 'fees' && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Monthly Fees</h4>
              <div className="flex">
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={monthlyFees}
                  onChange={(e) => setMonthlyFees(e.target.value)}
                  className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded-l shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter monthly fees"
                />
                <button
                  onClick={handleUpdateFees}
                  className="inline-flex items-center px-2 py-1.5 border border-l-0 border-gray-300 rounded-r shadow-sm text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <FaSave className="mr-1" /> Update
                </button>
              </div>
            </div>
          )}
          
          {/* Subjects */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-900 flex items-center">
                <FaBook className="mr-1.5" />
                Subjects ({classItem.subjects?.length || 0})
              </h4>
            </div>
            
            <div className="space-y-1.5 mb-3">
              {classItem.subjects && classItem.subjects.map((subject) => (
                <div key={subject.id} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                  <div>
                    <span className="font-medium text-gray-900">{subject.name}</span>
                    <span className="text-xs text-gray-500 ml-1">- {subject.teacher}</span>
                  </div>
                  <button
                    onClick={() => onRemoveSubject(classItem.id, subject.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Add Subject Form */}
            <div className="space-y-2 border-t border-gray-200 pt-3">
              <h5 className="text-sm font-medium text-gray-900">Add New Subject</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                    placeholder="e.g., Mathematics"
                    className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Teacher</label>
                  <select
                    value={newSubject.teacher}
                    onChange={(e) => setNewSubject({...newSubject, teacher: e.target.value})}
                    className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Teacher</option>
                    {getTeachers().map((teacher) => (
                      <option key={teacher.id} value={`${teacher.firstName} ${teacher.lastName}`}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <button
                    onClick={handleAddSubject}
                    className="w-full inline-flex items-center justify-center px-2 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                  >
                    <FaPlus className="mr-1" /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailsModal;