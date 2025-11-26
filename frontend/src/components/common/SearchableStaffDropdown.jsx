import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaChevronDown, FaUser } from 'react-icons/fa';

const SearchableStaffDropdown = ({ 
  staff, 
  value, 
  onChange, 
  placeholder = "Select staff member...",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter staff based on search term
  const filteredStaff = staff.filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected staff member
  const selectedStaff = staff.find(member => member.id === value);

  // Handle staff selection
  const handleSelect = (staffId) => {
    onChange(staffId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 text-left bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center">
          {selectedStaff ? (
            <>
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-6 h-6 flex-shrink-0" />
              <div className="ml-2">
                <div className="text-sm font-medium truncate max-w-xs">
                  {selectedStaff.firstName} {selectedStaff.lastName}
                </div>
              </div>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <FaChevronDown className="text-gray-400" />
      </button>

      {/* Dropdown menu */}
      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Staff list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredStaff.length > 0 ? (
              filteredStaff.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleSelect(member.id)}
                  className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                    member.id === value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 flex-shrink-0" />
                  <div className="ml-3">
                    <div className="text-sm font-medium">
                      {member.firstName} {member.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {member.position} - {member.department}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500">
                <FaUser className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2">No staff members found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableStaffDropdown;