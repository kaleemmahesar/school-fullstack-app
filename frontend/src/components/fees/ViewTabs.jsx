import React from 'react';
import { FaUser, FaUsers } from 'react-icons/fa';

const ViewTabs = ({ viewMode, setViewMode }) => {
  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setViewMode('student')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              viewMode === 'student'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaUser className="inline mr-2" />
            Student View
          </button>
          <button
            onClick={() => setViewMode('family')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              viewMode === 'family'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaUsers className="inline mr-2" />
            Family View
          </button>
        </nav>
      </div>
    </div>
  );
};

export default ViewTabs;