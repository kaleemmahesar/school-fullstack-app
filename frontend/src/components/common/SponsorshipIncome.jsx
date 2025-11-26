import React from 'react';
import { FaHandshake } from 'react-icons/fa';

const SponsorshipIncome = ({ amount, onAddIncome }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100">
            <FaHandshake className="text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Sponsorship Income</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-PK', {
                style: 'currency',
                currency: 'PKR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(amount || 0)}
            </p>
          </div>
        </div>
        {onAddIncome && (
          <button
            onClick={onAddIncome}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
};

export default SponsorshipIncome;