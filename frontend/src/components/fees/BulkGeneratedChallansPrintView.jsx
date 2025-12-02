import React from 'react';
import { FaPrint } from 'react-icons/fa';

const BulkGeneratedChallansPrintView = ({ challans, students, schoolInfo, onPrint, onBack }) => {
  if (!challans || challans.length === 0) return null;

  // Use school info from props with fallback defaults
  const safeSchoolInfo = {
    name: schoolInfo?.schoolName || schoolInfo?.name || "School Management System",
    address: schoolInfo?.schoolAddress || schoolInfo?.address || "123 Education Street, Learning City",
    phone: schoolInfo?.schoolPhone || schoolInfo?.phone || "+1 (555) 123-4567",
    bankAccount: schoolInfo?.bankAccount || "0123456789",
    logo: schoolInfo?.logo || null
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

  // Calculate due date + 10 days for expiry
  const calculateExpiryDate = (dueDate) => {
    if (!dueDate) return 'N/A';
    try {
      const date = new Date(dueDate);
      date.setDate(date.getDate() + 10);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format date for issue date (current date)
  const formatIssueDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const ChallanCopy = ({ challan, student, copyType }) => {
    const studentName = student 
      ? `${student.firstName} ${student.lastName}`
      : challan.studentName || 'N/A';
    
    const fatherName = student?.fatherName || 'N/A';
    const className = student?.class || 'N/A';
    const section = student?.section || 'N/A';
    const grNumber = student?.grNo || 'N/A';
    
    // Calculate total amount (tuition + fine)
    const tuitionFee = Math.round(challan.amount) || 0;
    const fineAmount = 500; // Fixed late fee
    const totalAmount = tuitionFee + fineAmount;
    
    return (
      <div className="challan-copy border border-gray-400 p-3 mb-4" style={{ width: '32%', display: 'inline-block', verticalAlign: 'top', margin: '0 0.5%' }}>
        {/* Logo and School Info */}
        <div className="text-center mb-3">
          {safeSchoolInfo.logo ? (
            <img src={safeSchoolInfo.logo} alt="School Logo" className="mx-auto h-12 mb-2" />
          ) : (
            <div className="text-center mb-2">
              <div className="font-bold text-lg">{safeSchoolInfo.name}</div>
            </div>
          )}
          <div className="text-xs font-bold">{safeSchoolInfo.name}</div>
        </div>
        
        {/* Copy Type */}
        <div className="text-center font-bold text-xs mb-2 border-b border-gray-400 pb-1">
          {copyType} COPY
        </div>
        
        {/* Challan Details */}
        <div className="text-xs mb-2">
          <div className="flex justify-between mb-1">
            <span>Issue Date:</span>
            <span>{formatIssueDate()}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Due Date:</span>
            <span>{formatDate(challan.dueDate)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Expiry Date:</span>
            <span>{calculateExpiryDate(challan.dueDate)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>GR #:</span>
            <span>{grNumber}</span>
          </div>
        </div>
        
        {/* Student Info */}
        <div className="text-xs mb-2 border-b border-gray-400 pb-2">
          <div className="mb-1"><span className="font-bold">Student Name:</span> {studentName}</div>
          <div className="mb-1"><span className="font-bold">Father Name:</span> {fatherName}</div>
          <div className="mb-1"><span className="font-bold">Class:</span> {className} - Section {section}</div>
          <div className="mb-1"><span className="font-bold">Fee for the month of:</span> {challan.month}</div>
          <div><span className="font-bold">Challan ID:</span> {challan.id}</div>
        </div>
        
        {/* Bank Info */}
        <div className="text-xs mb-2 border-b border-gray-400 pb-2">
          <div className="font-bold mb-1">Bank Account Number:</div>
          <div>{safeSchoolInfo.bankAccount}</div>
        </div>
        
        {/* Fee Table */}
        <div className="text-xs mb-2">
          <table className="w-full border border-gray-400">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-1 text-left">Particular</th>
                <th className="border border-gray-400 p-1 text-right">Amount (Rs)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 p-1">Tuition Fees</td>
                <td className="border border-gray-400 p-1 text-right">{tuitionFee}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1">Fine (Late Payment)</td>
                <td className="border border-gray-400 p-1 text-right">{fineAmount}</td>
              </tr>
              <tr className="font-bold">
                <td className="border border-gray-400 p-1">Total</td>
                <td className="border border-gray-400 p-1 text-right">{totalAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Grant Total and Payment */}
        <div className="text-xs mb-2">
          <div className="flex justify-between font-bold mb-1">
            <span>Grant Total:</span>
            <span>Rs. {totalAmount}</span>
          </div>
          <div className="border border-gray-400 p-2 mb-2">
            <div className="font-bold mb-1">Payment Received:</div>
            <div>Signature: ________________________</div>
          </div>
        </div>
        
        {/* Footer Info */}
        <div className="text-xs text-center border-t border-gray-400 pt-2">
          <div className="mb-1">Late fee will be charged if not paid on time</div>
          <div>For queries contact: {safeSchoolInfo.phone}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-white z-50 p-0 m-0 overflow-hidden">
      <div className="print-container">
        {/* Header - Hidden in print view */}
        <div className="flex justify-between items-center mb-4 p-4 bg-white border-b print:hidden">
          <h1 className="text-xl font-bold text-gray-900">Generated Challans Preview</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              <FaPrint className="mr-2" /> Print All Challans
            </button>
            <button
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Fees
            </button>
          </div>
        </div>

        {/* Printable Challans - 3 copies per challan */}
        <div className="print-container">
          {challans.map((challan, index) => {
            const student = students?.find(s => s.id === challan.studentId) || {};
            
            return (
              <div key={`${challan.id}-${index}`} className={`challan-page ${index < challans.length - 1 ? 'mb-8' : ''}`}>
                <ChallanCopy challan={challan} student={student} copyType="STUDENT" />
                <ChallanCopy challan={challan} student={student} copyType="BANK" />
                <ChallanCopy challan={challan} student={student} copyType="SCHOOL" />
                
                {/* Page break after each challan set */}
                {index < challans.length - 1 && (
                  <div className="page-break"></div>
                )}
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
              font-family: Arial, Helvetica, sans-serif;
              font-size: 12px;
            }
            
            .print-container {
              padding: 10px;
              max-width: 100%;
            }
            
            .print-hidden {
              display: none !important;
            }
            
            .challan-page {
              page-break-after: always;
            }
            
            .challan-copy {
              width: 32% !important;
              display: inline-block !important;
              vertical-align: top !important;
              margin: 0 0.5% !important;
              border: 1px solid #000 !important;
              padding: 10px !important;
              box-sizing: border-box !important;
            }
            
            .page-break {
              page-break-after: always;
            }
            
            @page {
              size: A4;
              margin: 0.2in;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            
            th, td {
              border: 1px solid #000;
              padding: 3px;
              text-align: left;
            }
            
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            
            .text-right {
              text-align: right;
            }
            
            .text-center {
              text-align: center;
            }
            
            .font-bold {
              font-weight: bold;
            }
            
            .border {
              border: 1px solid #000;
            }
            
            .border-b {
              border-bottom: 1px solid #000;
            }
            
            .border-t {
              border-top: 1px solid #000;
            }
            
            .p-1 {
              padding: 3px;
            }
            
            .p-2 {
              padding: 5px;
            }
            
            .mb-1 {
              margin-bottom: 3px;
            }
            
            .mb-2 {
              margin-bottom: 5px;
            }
            
            .text-xs {
              font-size: 11px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default BulkGeneratedChallansPrintView;