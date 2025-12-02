import React from 'react';
import { FaSchool, FaCalendar, FaDollarSign, FaUser, FaIdCard, FaPrint, FaDownload } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const ChallanPrintView = ({ challan, student, schoolInfo, onPrint, onDownload }) => {
  // Add default values for safety
  const safeChallan = challan || {};
  const safeStudent = student || {};
  
  // Use school info from props with fallback defaults
  const safeSchoolInfo = {
    schoolName: schoolInfo?.schoolName || schoolInfo?.name || "School Management System",
    schoolAddress: schoolInfo?.schoolAddress || schoolInfo?.address || "123 Education Street, Learning City",
    schoolPhone: schoolInfo?.schoolPhone || schoolInfo?.phone || "+1 (555) 123-4567"
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getPaymentStatus = () => {
    const status = safeChallan.status || 'pending';
    if (status === 'paid') {
      return (
        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
          PAID
        </div>
      );
    }
    return (
      <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
        PENDING
      </div>
    );
  };

  return (
    <div className="w-full mx-auto bg-white font-sans">
      {/* School Header - Hidden in print view */}
      <div className="text-center border-b border-gray-300 pb-2 mb-3 print:hidden">
        <div className="flex items-center justify-center mb-1">
          <FaSchool className="text-blue-600 text-lg mr-2" />
          <h1 className="text-lg font-bold text-gray-800">{safeSchoolInfo.schoolName || "School Management System"}</h1>
        </div>
        <p className="text-gray-600 text-xs mb-1">{safeSchoolInfo.schoolAddress || "123 Education Street, Learning City"}</p>
        <p className="text-gray-600 text-xs">Phone: {safeSchoolInfo.schoolPhone || "+1 (555) 123-4567"}</p>
      </div>

      {/* Challan Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-base font-bold text-gray-800">Fee Challan</h2>
          <p className="text-gray-600 text-xs">ID: {safeChallan.id || 'N/A'}</p>
        </div>
        {getPaymentStatus()}
      </div>

      {/* Student Information */}
      <div className="mb-3">
        <h3 className="font-bold text-gray-800 mb-2 text-xs flex items-center">
          <FaUser className="mr-2 text-blue-600 text-xs" /> Student Information
        </h3>
        <div className="bg-gray-50 p-2 rounded">
          <div className="grid grid-cols-3 gap-1 text-xs">
            <span className="font-medium col-span-1">Name:</span>
            <span className="col-span-2">{safeStudent.firstName || ''} {safeStudent.lastName || ''}</span>
            
            <span className="font-medium col-span-1">Class:</span>
            <span className="col-span-2">{safeStudent.class || 'N/A'} - Section {safeStudent.section || 'N/A'}</span>
            
            <span className="font-medium col-span-1">Month:</span>
            <span className="col-span-2">{safeChallan.month || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Fee Details */}
      <div className="mb-3">
        <h3 className="font-bold text-gray-800 mb-2 text-xs">Fee Details</h3>
        <div className="border rounded">
          <div className="grid grid-cols-4 gap-1 p-2 bg-gray-50 border-b text-xs font-medium">
            <span className="col-span-3">Description</span>
            <span className="text-center">Amount</span>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="grid grid-cols-4 gap-1 p-2 text-xs">
              <span className="col-span-3">Monthly Tuition Fee</span>
              <span className="text-center">Rs {Math.round(safeChallan.amount) || '0'}</span>
            </div>
            {safeChallan.description && (
              <div className="grid grid-cols-4 gap-1 p-2 text-xs">
                <span className="col-span-3">{safeChallan.description}</span>
                <span className="text-center">Rs 0</span>
              </div>
            )}
            <div className="grid grid-cols-4 gap-1 p-2 text-xs font-bold">
              <span className="col-span-3">Total Amount</span>
              <span className="text-center">Rs {Math.round(safeChallan.amount) || '0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-1">Issue Date</h4>
          <div className="bg-gray-50 p-2 rounded border text-xs">
            {formatDate(safeChallan.date || new Date())}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-1">Due Date</h4>
          <div className="bg-gray-50 p-2 rounded border text-xs">
            {formatDate(safeChallan.dueDate)}
          </div>
        </div>
      </div>

      {/* Payment Information */}
      {safeChallan.status === 'paid' && safeChallan.paymentMethod && (
        <div className="mb-3">
          <h3 className="font-bold text-gray-800 mb-2 text-xs">Payment Information</h3>
          <div className="bg-green-50 p-2 rounded border border-green-200 text-xs">
            <div className="grid grid-cols-2 gap-1 mb-1">
              <div className="font-medium">Payment Method:</div>
              <div className="capitalize">{safeChallan.paymentMethod}</div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="font-medium">Payment Date:</div>
              <div>{formatDate(safeChallan.date)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Only show when not printing */}
      <div className="flex justify-center space-x-3 mt-4 mb-3 print:hidden">
        <button
          onClick={onPrint}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
        >
          <FaPrint className="mr-2" /> Print
        </button>
        <button
          onClick={onDownload}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
        >
          <FaDownload className="mr-2" /> Save PDF
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200 print:hidden">
        {safeChallan.status === 'paid' ? (
          <p>Thank you for your payment.</p>
        ) : (
          <p>Please pay by the due date.</p>
        )}
        <p className="mt-1">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          
          .print-container {
            padding: 15px;
            max-width: 100%;
          }
          
          .print-hidden {
            display: none !important;
          }
          
          @page {
            size: A4;
            margin: 0.5in;
          }
          
          .challan-print-view {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: visible;
          }
          
          /* Enhanced print styling */
          .text-center { text-align: center; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .justify-between { justify-content: space-between; }
          .border-b { border-bottom: 1px solid #d1d5db; }
          .border-gray-300 { border-color: #d1d5db; }
          .pb-2 { padding-bottom: 0.5rem; }
          .mb-3 { margin-bottom: 0.75rem; }
          .text-lg { font-size: 1.125rem; }
          .text-base { font-size: 1rem; }
          .font-bold { font-weight: 700; }
          .text-gray-800 { color: #1f2937; }
          .text-gray-600 { color: #4b5563; }
          .text-xs { font-size: 0.75rem; }
          .bg-blue-100 { background-color: #dbeafe; }
          .text-blue-600 { color: #2563eb; }
          .text-blue-800 { color: #1e40af; }
          .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
          .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
          .rounded { border-radius: 0.25rem; }
          .font-medium { font-weight: 500; }
          .mb-2 { margin-bottom: 0.5rem; }
          .bg-gray-50 { background-color: #f9fafb; }
          .p-2 { padding: 0.5rem; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .gap-1 { gap: 0.25rem; }
          .gap-2 { gap: 0.5rem; }
          .col-span-1 { grid-column: span 1 / span 1; }
          .col-span-2 { grid-column: span 2 / span 2; }
          .col-span-3 { grid-column: span 3 / span 3; }
          .border { border: 1px solid #d1d5db; }
          .divide-y > :not([hidden]) ~ :not([hidden]) { border-top: 1px solid #e5e7eb; }
          .divide-gray-200 > :not([hidden]) ~ :not([hidden]) { border-color: #e5e7eb; }
          .text-right { text-align: right; }
          .bg-green-50 { background-color: #f0fdf4; }
          .bg-green-100 { background-color: #dcfce7; }
          .bg-yellow-100 { background-color: #fef9c3; }
          .text-green-800 { color: #166534; }
          .text-yellow-800 { color: #854d0e; }
          .border-green-200 { border-color: #bbf7d0; }
          .capitalize { text-transform: capitalize; }
        }
      `}</style>
    </div>
  );
};

export default ChallanPrintView;