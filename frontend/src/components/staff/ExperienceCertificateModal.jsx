import React, { useState } from 'react';
import ExperienceCertificateGenerator from './ExperienceCertificateGenerator';

const ExperienceCertificateModal = ({ staffMember, onClose }) => {
  const [showCertificate, setShowCertificate] = useState(false);

  // Function to handle certificate generation
  const handleGenerateCertificate = () => {
    setShowCertificate(true);
  };

  if (showCertificate) {
    return <ExperienceCertificateGenerator staffMember={staffMember} onClose={() => setShowCertificate(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Generate Experience Certificate</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>

          {/* Staff Information Preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Staff Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{staffMember.firstName} {staffMember.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Designation</p>
                <p className="font-medium">{staffMember.designation || staffMember.position || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Joining</p>
                <p className="font-medium">{staffMember.dateOfJoining ? new Date(staffMember.dateOfJoining).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <p className={`font-medium ${staffMember.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {staffMember.status === 'active' ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Options */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Certificate Options</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="includePerformance"
                  defaultChecked
                  className="mt-1 mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="includePerformance" className="text-sm text-gray-700">
                  Include performance summary
                </label>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="includeDuration"
                  defaultChecked
                  className="mt-1 mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="includeDuration" className="text-sm text-gray-700">
                  Include duration of service
                </label>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="includeDesignation"
                  defaultChecked
                  className="mt-1 mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="includeDesignation" className="text-sm text-gray-700">
                  Include designation details
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateCertificate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Generate Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCertificateModal;