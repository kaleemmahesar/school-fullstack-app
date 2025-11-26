import React from 'react';
import { FaPlus, FaDownload } from 'react-icons/fa';

const FeesHeader = ({ onGenerateChallan, onExportCSV, isGenerateDisabled = false }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fees Managements</h1>
        <p className="mt-1 text-sm text-gray-600">Manage student fees, challans, and payments</p>
      </div>
      <div className="mt-4 md:mt-0 flex space-x-2">
        <button
          onClick={onGenerateChallan}
          disabled={isGenerateDisabled}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isGenerateDisabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
          }`}
        >
          <FaPlus className="mr-2" /> Generate Challan
        </button>
        <button
          onClick={onExportCSV}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <FaDownload className="mr-2" /> Export CSV
        </button>
      </div>
    </div>
  );
};

export default FeesHeader;