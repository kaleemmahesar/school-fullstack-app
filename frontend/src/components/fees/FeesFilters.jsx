import React from 'react';
import { FaSearch, FaFilter, FaReceipt } from 'react-icons/fa';

const FeesFilters = ({ 
  viewMode,
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus,
  selectedClass,
  setSelectedClass,
  selectedSection,
  setSelectedSection,
  selectedBatch,  // Add this line
  setSelectedBatch,  // Add this line
  uniqueClasses,
  classSections,
  uniqueBatches,  // Add this line
  onBulkGenerate,
  onClearFilters
}) => {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={viewMode === 'student' 
              ? "Search by student name, class, or section..." 
              : "Search by family name..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Fully Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          {/* Class Filter - only show in student view */}
          {viewMode === 'student' && (
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Classes</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Batch Filter - only show in student view */}
{viewMode === 'student' && (
  <div className="flex items-center space-x-2">
    <FaFilter className="text-gray-400" />
    <select
      value={selectedBatch}
      onChange={(e) => setSelectedBatch(e.target.value)}
      className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">All Batches</option>
      {uniqueBatches.map((batch) => (
        <option key={batch} value={batch}>{batch}</option>
      ))}
    </select>
  </div>
)}
          
          {/* Section Filter - only show in student view */}
          {viewMode === 'student' && (
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
          )}
          
          {/* Bulk Generate Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onBulkGenerate}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaReceipt className="mr-1" /> Bulk Generate
            </button>
          </div>
          
          {/* Clear Filters Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onClearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesFilters;