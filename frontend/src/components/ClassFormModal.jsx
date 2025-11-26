import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; // Add useSelector import
import { FaBook, FaDollarSign, FaTrash, FaPlus } from 'react-icons/fa';

const ClassFormModal = ({ onClose, onSubmit, classData, students }) => { // Add students prop
  const [formData, setFormData] = useState({
    name: '',
    monthlyFees: '',
    sections: [{ id: `${Date.now()}-A`, name: 'A' }], // Default section A with proper ID
  });
  
  // Access school settings to check funding type
  const { schoolInfo } = useSelector(state => state.settings);
  const isNGOFunded = schoolInfo?.fundingType === 'ngo';
  
  const isEditMode = !!classData;

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name,
        monthlyFees: classData.monthlyFees || '',
        sections: classData.sections.map((section, index) => ({ 
          id: section.id || `${classData.id || Date.now()}-${index}`, 
          name: section.name 
        })), // Ensure sections have proper IDs
      });
    }
  }, [classData]);

  // Calculate section counts based on student records
  const calculateSectionCounts = (className, sections) => {
    if (!students || !className) return sections;
    
    // Count students per section for this class
    const sectionCounts = {};
    students.forEach(student => {
      if (student.class === className) {
        sectionCounts[student.section] = (sectionCounts[student.section] || 0) + 1;
      }
    });
    
    // Update sections with student counts
    return sections.map(section => ({
      ...section,
      studentCount: sectionCounts[section.name] || 0
    }));
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...formData.sections];
    updatedSections[index][field] = value;
    setFormData({
      ...formData,
      sections: updatedSections,
    });
  };

  const addSection = () => {
    // Generate next section name (A, B, C, ...)
    const sectionLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let nextLetter = 'A';
    
    // Find the next available letter
    for (let i = 0; i < sectionLetters.length; i++) {
      const letter = sectionLetters[i];
      if (!formData.sections.some(section => section.name === letter)) {
        nextLetter = letter;
        break;
      }
    }
    
    setFormData({
      ...formData,
      sections: [...formData.sections, { id: `${Date.now()}-${nextLetter}`, name: nextLetter }],
    });
  };

  const removeSection = (index) => {
    if (formData.sections.length > 1) {
      const updatedSections = [...formData.sections];
      updatedSections.splice(index, 1);
      setFormData({
        ...formData,
        sections: updatedSections,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure sections have proper IDs
    const sectionsWithIds = formData.sections.map((section, index) => ({
      ...section,
      id: section.id || `${Date.now()}-${index}` // Generate ID if not present
    }));
    
    // Calculate section counts based on student records
    const sectionsWithCounts = calculateSectionCounts(formData.name, sectionsWithIds);
    // Calculate total students
    const totalStudents = sectionsWithCounts.reduce((sum, section) => sum + (section.studentCount || 0), 0);
    onSubmit({ ...formData, sections: sectionsWithCounts, totalStudents });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Class' : 'Add New Class'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="py-6 px-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBook className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Grade 10"
                  required
                />
              </div>
            </div>

            {/* Conditionally render Monthly Fees field based on funding type */}
            {!isNGOFunded && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fees</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaDollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="monthlyFees"
                    value={formData.monthlyFees}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="4000"
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Sections</label>
                <button
                  type="button"
                  onClick={addSection}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FaPlus className="mr-1" /> Add Section
                </button>
              </div>
              
              {formData.sections.map((section, index) => {
                // Calculate student count for this section
                const studentCount = students && formData.name 
                  ? students.filter(student => student.class === formData.name && student.section === section.name).length 
                  : 0;
                
                return (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <div className="flex-grow">
                      <input
                        type="text"
                        value={section.name}
                        onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Section name (e.g., A, B)"
                        required
                      />
                    </div>
                    <div className="w-24">
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-center text-sm">
                        {studentCount} students
                      </div>
                    </div>
                    {formData.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FaTrash size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isEditMode ? 'Update Class' : 'Add Class'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClassFormModal;