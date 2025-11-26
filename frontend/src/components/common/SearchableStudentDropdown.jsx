import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaChevronDown, FaTimes } from 'react-icons/fa';

const SearchableStudentDropdown = ({ 
  students, 
  value, 
  onChange, 
  placeholder = "Select a student...",
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const classSection = `${student.class} ${student.section}`.toLowerCase();
    const grNo = (student.grNo || '').toLowerCase();
    
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      classSection.includes(searchTerm.toLowerCase()) ||
      grNo.includes(searchTerm.toLowerCase())
    );
  });

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
    onChange(student.id);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setSearchTerm('');
  };

  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  const getSelectedStudent = () => {
    return students.find(student => student.id === value);
  };

  const selectedStudent = getSelectedStudent();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger */}
      <div 
        className={`flex items-center justify-between px-3 py-2 border rounded-md cursor-pointer ${
          disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        } ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300'}`}
        onClick={handleToggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
      >
        <div className="flex-1 truncate">
          {selectedStudent ? (
            <div className="flex items-center">
              <span className="font-medium">{selectedStudent.firstName} {selectedStudent.lastName}</span>
              <span className="ml-2 text-sm text-gray-500">
                ({selectedStudent.class} - {selectedStudent.section})
              </span>
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center ml-2">
          {selectedStudent && !disabled && (
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 mr-1"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
            >
              <FaTimes size={12} />
            </button>
          )}
          <FaChevronDown 
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            size={14}
          />
        </div>
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
                  <div>
                    <div className="font-medium text-sm">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Class: {student.class} - Section: {student.section} | GR No: {student.grNo || 'N/A'}
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

export default SearchableStudentDropdown;