import React from 'react';
import { FaInfoCircle, FaHandHoldingUsd } from 'react-icons/fa';

const NGOFundingInfo = () => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FaHandHoldingUsd className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">NGO Funded School</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>This school is funded by quarterly NGO subsidies. No fees are charged to students.</p>
            <p className="mt-1">All operational costs are covered through NGO partnerships.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGOFundingInfo;