import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaChevronDown, FaTimes, FaPlus } from 'react-icons/fa';

const MultiSelectSearchableStudentDropdown = ({ 
  students, 
  values = [], 
  onChange, 
  placeholder = "Select students...",
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter students based on search term and exclude already selected ones
  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const classSection = `${student.class} ${student.section}`.toLowerCase();
    const grNo = (student.grNo || '').toLowerCase();
    
    // Check if student is already selected
    const isAlreadySelected = values.includes(student.id);
    
    return (
      !isAlreadySelected &&
      (
        fullName.includes(searchTerm.toLowerCase()) ||
        classSection.includes(searchTerm.toLowerCase()) ||
        grNo.includes(searchTerm.toLowerCase()) ||
        searchTerm === ''
      )
    );
  });

  // Get selected students
  const getSelectedStudents = () => {
    return students.filter(student => values.includes(student.id));
  };

  const selectedStudents = getSelectedStudents();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredStudents.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredStudents[highlightedIndex]) {
          handleSelectStudent(filteredStudents[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleSelectStudent = (student) => {
    const newValues = [...values, student.id];
    onChange(newValues);
    setSearchTerm('');
    // Keep dropdown open for multiple selections
  };

  const handleRemoveStudent = (studentId, e) => {
    e.stopPropagation();
    const newValues = values.filter(id => id !== studentId);
    onChange(newValues);
  };

  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger */}
      <div 
        className={`flex flex-wrap items-center px-3 py-2 border rounded-md cursor-pointer ${
          disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        } ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300'}`}
        onClick={handleToggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
      >
        {/* Selected students as tags */}
        <div className="flex flex-wrap gap-1 mr-2">
          {selectedStudents.map(student => (
            <span 
              key={student.id} 
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {student.firstName} {student.lastName}
              {!disabled && (
                <button
                  type="button"
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  onClick={(e) => handleRemoveStudent(student.id, e)}
                >
                  <FaTimes size={10} />
                </button>
              )}
            </span>
          ))}
        </div>
        
        {/* Search input or placeholder */}
        {isOpen ? (
          <input
            ref={searchInputRef}
            type="text"
            className="flex-1 min-w-[100px] border-0 focus:ring-0 p-0 text-sm"
            placeholder={selectedStudents.length === 0 ? placeholder : ""}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        ) : selectedStudents.length === 0 ? (
          <span className="text-gray-500 text-sm flex-1">{placeholder}</span>
        ) : null}
        
        {/* Dropdown arrow */}
        <FaChevronDown 
          className={`text-gray-400 transition-transform ml-2 ${isOpen ? 'rotate-180' : ''}`} 
          size={14}
        />
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" size={14} />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          {/* Student list */}
          <div className="overflow-y-auto max-h-48">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <div
                  key={student.id}
                  className={`px-4 py-2 cursor-pointer flex items-center ${
                    index === highlightedIndex
                      ? 'bg-blue-100'
                      : index % 2 === 0
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelectStudent(student)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex items-center">
                    <FaPlus className="text-gray-400 mr-2" size={12} />
                    <div>
                      <div className="font-medium text-sm">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Class: {student.class} - Section: {student.section} | GR No: {student.grNo || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No students found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectSearchableStudentDropdown;