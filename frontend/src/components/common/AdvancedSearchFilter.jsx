import React, { useState, useCallback } from 'react';
import { FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown, FaTimes } from 'react-icons/fa';

const AdvancedSearchFilter = ({ 
  data = [], 
  columns = [], 
  onFilterChange,
  onSortChange,
  searchable = true,
  filterable = true,
  sortable = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filter dropdowns
  const getUniqueValues = useCallback((key) => {
    return [...new Set(data.map(item => item[key]))].filter(val => val !== undefined && val !== null);
  }, [data]);

  // Apply search, filters, and sorting
  const applyFilters = useCallback(() => {
    let filteredData = [...data];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredData = filteredData.filter(item => 
        columns.some(column => {
          const value = item[column.key];
          return value && value.toString().toLowerCase().includes(term);
        })
      );
    }

    // Apply filters
    Object.keys(filters).forEach(key => {
      const filterValue = filters[key];
      if (filterValue) {
        filteredData = filteredData.filter(item => {
          const value = item[key];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(filterValue.toLowerCase());
          }
          return value == filterValue;
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  }, [data, searchTerm, filters, sortConfig, columns]);

  // Notify parent of changes
  React.useEffect(() => {
    const filteredData = applyFilters();
    onFilterChange && onFilterChange(filteredData);
  }, [searchTerm, filters, sortConfig, applyFilters, onFilterChange]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    onSortChange && onSortChange({ key, direction });
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({});
    setSortConfig({ key: null, direction: 'asc' });
  };

  // Get sort icon for column
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FaSort className="text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />;
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || Object.keys(filters).some(key => filters[key]);

  return (
    <div className="mb-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          {searchable && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          
          {filterable && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaFilter className="mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Active
                </span>
              )}
            </button>
          )}
          
          {(searchTerm || Object.keys(filters).length > 0) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaTimes className="mr-2" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && filterable && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns
              .filter(column => column.filterable !== false)
              .map(column => (
                <div key={column.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {column.header}
                  </label>
                  {column.type === 'select' ? (
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={filters[column.key] || ''}
                      onChange={(e) => handleFilterChange(column.key, e.target.value)}
                    >
                      <option value="">All</option>
                      {getUniqueValues(column.key).map((value, index) => (
                        <option key={index} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Filter by ${column.header}...`}
                      value={filters[column.key] || ''}
                      onChange={(e) => handleFilterChange(column.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Table with Sorting */}
      {sortable && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(column => (
                  <th
                    key={column.key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                  >
                    <div className="flex items-center">
                      <span>{column.header}</span>
                      {column.sortable !== false && (
                        <span className="ml-1">
                          {getSortIcon(column.key)}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchFilter;