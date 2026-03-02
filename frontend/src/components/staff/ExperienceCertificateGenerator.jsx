import React from 'react';
import { FaPrint, FaDownload } from 'react-icons/fa';

const ExperienceCertificateGenerator = ({ staffMember, onClose }) => {
  const {
    firstName,
    lastName,
    designation,
    dateOfJoining,
    dateOfLeaving,
    salary,
    status
  } = staffMember;

  // Calculate years of service
  const calculateServiceYears = () => {
    if (!dateOfJoining) return 0;
    
    const joinDate = new Date(dateOfJoining);
    const leaveDate = dateOfLeaving ? new Date(dateOfLeaving) : new Date();
    
    const diffTime = Math.abs(leaveDate - joinDate);
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    
    return `${diffYears} years ${diffMonths} months`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // This would typically trigger PDF download
    alert('Certificate download functionality would be implemented here');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Print-only header to hide during normal view */}
        <div className="print-only bg-white p-4 mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Experience Certificate</h1>
          </div>
        </div>

        <div className="p-8">
          {/* Certificate Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">EXPERIENCE CERTIFICATE</h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 italic">This is to certify that the individual mentioned below worked with our organization</p>
          </div>

          {/* Certificate Body */}
          <div className="mb-8">
            <p className="text-lg text-center mb-6">
              This is to certify that <strong>{firstName} {lastName}</strong> was employed with our organization as <strong>{designation || 'N/A'}</strong>.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p><strong>Employee Name:</strong> {firstName} {lastName}</p>
                <p><strong>Designation:</strong> {designation || 'N/A'}</p>
                <p><strong>Salary:</strong> Rs. {salary ? parseFloat(salary).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <p><strong>Date of Joining:</strong> {dateOfJoining ? new Date(dateOfJoining).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Date of Leaving:</strong> {dateOfLeaving ? new Date(dateOfLeaving).toLocaleDateString() : (status === 'active' ? 'Currently Employed' : 'N/A')}</p>
                <p><strong>Duration of Service:</strong> {calculateServiceYears()}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="mb-2"><strong>Performance Summary:</strong></p>
              <p className="text-gray-700">
                During the tenure with our organization, {firstName} has demonstrated excellent professional skills, 
                dedication, and commitment to work. The individual has been a valuable member of our team and 
                contributed significantly to the success of our organization.
              </p>
            </div>
          </div>

          {/* Certificate Footer */}
          <div className="border-t border-gray-300 pt-6 mt-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-semibold">Verified By</p>
                <p className="text-sm text-gray-600">HR Manager</p>
              </div>
              <div>
                <p className="font-semibold">Approved By</p>
                <p className="text-sm text-gray-600">Director</p>
              </div>
              <div>
                <p className="font-semibold">Date</p>
                <p className="text-sm text-gray-600">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Hidden in print view */}
        <div className="no-print bg-gray-50 px-8 py-4 flex justify-end space-x-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FaPrint className="mr-2" /> Print
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <FaDownload className="mr-2" /> Download
          </button>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-only, .print-only * {
              visibility: visible;
            }
            .no-print {
              display: none;
            }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              visibility: visible;
            }
            .print-container * {
              visibility: visible;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ExperienceCertificateGenerator;