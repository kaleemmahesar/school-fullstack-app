import React from 'react';
import { FaSchool, FaUser, FaDollarSign } from 'react-icons/fa';

const BulkChallanPrintView = ({ challans, students, schoolInfo }) => {
  if (!challans || challans.length === 0) return null;

  // Format date
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Use school info from props with fallback defaults
  const safeSchoolInfo = {
    name: schoolInfo?.schoolName || schoolInfo?.name || "School Management System",
    address: schoolInfo?.schoolAddress || schoolInfo?.address || "123 Education Street, Learning City",
    phone: schoolInfo?.schoolPhone || schoolInfo?.phone || "+1 (555) 123-4567"
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

  const getPaymentStatus = (status) => {
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
      {/* Printable Challans */}
      <div className="print-container">
        {challans.map((challan, index) => {
          const student = students?.find(s => s.id === challan.studentId) || {};
          
          const studentName = student 
            ? `${student.firstName} ${student.lastName}`
            : challan.studentName || 'N/A';
            
          const className = student.class || 'N/A';
          const section = student.section || 'N/A';

          return (
            <div key={challan.id} className={`challan ${index > 0 ? 'mt-8' : ''} ${index < challans.length - 1 ? 'challan-page-break' : ''}`}>
              {/* School Header - Hidden in print view */}
              <div className="text-center border-b border-gray-300 pb-2 mb-3 print:hidden">
                <div className="flex items-center justify-center mb-1">
                  <FaSchool className="text-blue-600 text-lg mr-2" />
                  <h1 className="text-lg font-bold text-gray-800">{safeSchoolInfo.name}</h1>
                </div>
                <p className="text-gray-600 text-xs mb-1">{safeSchoolInfo.address}</p>
                <p className="text-gray-600 text-xs">Phone: {safeSchoolInfo.phone}</p>
              </div>

              {/* Challan Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-base font-bold text-gray-800">Fee Challan</h2>
                  <p className="text-gray-600 text-xs">ID: {challan.id || 'N/A'}</p>
                </div>
                {getPaymentStatus(challan.status)}
              </div>

              {/* Student Information */}
              <div className="mb-3">
                <h3 className="font-bold text-gray-800 mb-2 text-xs flex items-center">
                  <FaUser className="mr-2 text-blue-600 text-xs" /> Student Information
                </h3>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <span className="font-medium col-span-1">Name:</span>
                    <span className="col-span-2">{studentName}</span>
                    
                    <span className="font-medium col-span-1">Class:</span>
                    <span className="col-span-2">{className} - Section {section}</span>
                    
                    <span className="font-medium col-span-1">Month:</span>
                    <span className="col-span-2">{challan.month || 'N/A'}</span>
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
                      <span className="text-center">Rs {Math.round(challan.amount) || '0'}</span>
                    </div>
                    {challan.description && (
                      <div className="grid grid-cols-4 gap-1 p-2 text-xs">
                        <span className="col-span-3">{challan.description}</span>
                        <span className="text-center">Rs 0</span>
                      </div>
                    )}
                    <div className="grid grid-cols-4 gap-1 p-2 text-xs font-bold">
                      <span className="col-span-3">Total Amount</span>
                      <span className="text-center">Rs {Math.round(challan.amount) || '0'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Issue Date</h4>
                  <div className="bg-gray-50 p-2 rounded border text-xs">
                    {formatDate(challan.date || new Date())}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Due Date</h4>
                  <div className="bg-gray-50 p-2 rounded border text-xs">
                    {formatDate(challan.dueDate)}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {challan.status === 'paid' && challan.paymentMethod && (
                <div className="mb-3">
                  <h3 className="font-bold text-gray-800 mb-2 text-xs">Payment Information</h3>
                  <div className="bg-green-50 p-2 rounded border border-green-200 text-xs">
                    <div className="grid grid-cols-2 gap-1 mb-1">
                      <div className="font-medium">Payment Method:</div>
                      <div className="capitalize">{challan.paymentMethod}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="font-medium">Payment Date:</div>
                      <div>{formatDate(challan.date)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer for all pages */}
              <div className="border-t border-gray-300 pt-3 mt-4 text-center text-xs text-gray-500 print:hidden">
                <p>Generated on {generatedDate} - Official School Documents</p>
              </div>
            </div>
          );
        })}
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
          
          .challan-page-break {
            page-break-after: always;
          }
          
          @page {
            size: A4;
            margin: 0.5in;
          }
          
          .bulk-challan-print-view {
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
          .mt-8 { margin-top: 2rem; }
          .border-t { border-top: 1px solid #d1d5db; }
          .pt-3 { padding-top: 0.75rem; }
        }
      `}</style>
    </div>
  );
};

export default BulkChallanPrintView;