import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaChevronDown, FaTimes } from 'react-icons/fa';

const SearchableFamilyDropdown = ({ 
  families, 
  value, 
  onChange, 
  placeholder = "Select a family...",
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter families based on search term
  const filteredFamilies = families.filter(family => {
    const familyName = family.name.toLowerCase();
    const memberCount = family.memberCount.toString();
    
    return (
      familyName.includes(searchTerm.toLowerCase()) ||
      memberCount.includes(searchTerm.toLowerCase()) ||
      searchTerm === '' // Show all families when search term is empty
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
          prev < filteredFamilies.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredFamilies[highlightedIndex]) {
          handleSelectFamily(filteredFamilies[highlightedIndex]);
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

  const handleSelectFamily = (family) => {
    onChange(family.id);
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

  const getSelectedFamily = () => {
    return families.find(family => family.id === value);
  };

  const selectedFamily = getSelectedFamily();

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
          {selectedFamily ? (
            <div className="flex items-center">
              <span className="font-medium">{selectedFamily.name}</span>
              <span className="ml-2 text-sm text-gray-500">
                ({selectedFamily.memberCount} {selectedFamily.memberCount === 1 ? 'member' : 'members'})
              </span>
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center ml-2">
          {selectedFamily && !disabled && (
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
                placeholder="Search families..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          {/* Family list */}
          <div className="overflow-y-auto max-h-48">
            {filteredFamilies.length > 0 ? (
              filteredFamilies.map((family, index) => (
                <div
                  key={family.id}
                  className={`px-4 py-2 cursor-pointer flex items-center ${
                    index === highlightedIndex
                      ? 'bg-blue-100'
                      : index % 2 === 0
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelectFamily(family)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div>
                    <div className="font-medium text-sm">
                      {family.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {family.memberCount} {family.memberCount === 1 ? 'member' : 'members'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No families found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableFamilyDropdown;