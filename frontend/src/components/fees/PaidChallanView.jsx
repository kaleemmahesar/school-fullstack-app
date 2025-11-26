import React from 'react';
import { FaPrint } from 'react-icons/fa';
import Logo from '../../img/logo.png';

const PaidChallanView = ({ challan, student, schoolInfo, onPrint, onBack }) => {
  const safeSchoolInfo = schoolInfo || {
    name: "School Management System",
    address: "123 Education Street, Learning City",
    phone: "+1 (555) 123-4567",
    bankAccount: "0123456789",
    logo: null
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

  // Format date for issue date (current date)
  const formatIssueDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate fine amount based on due date
  const calculateFineAmount = (dueDate) => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    // Reset time part for accurate date comparison
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    // If today is after due date, apply fine
    if (today > due) {
      return 500; // Fixed late fee
    }
    return 0;
  };

  const PaidChallanCopy = ({ copyType }) => {
    const studentName = student 
      ? `${student.firstName} ${student.lastName}`
      : 'N/A';
    
    const fatherName = student?.fatherName || 'N/A';
    const className = student?.class || 'N/A';
    const section = student?.section || 'N/A';
    const grNumber = student?.grNo || 'N/A';
    
    // Calculate amounts
    const tuitionFee = Math.round(challan.amount) || 0;
    // For paid challans, use the stored fineAmount from the payment
    // If not available, calculate based on payment date vs due date
    const fineAmount = challan.fineAmount !== undefined ? 
      Math.round(challan.fineAmount) : 
      calculateFineAmount(challan.dueDate);
    const totalAmount = tuitionFee + fineAmount;
    
    return (
      <div className="challan-copy border border-gray-400 p-3" style={{ width: '32%', display: 'inline-block', verticalAlign: 'top', margin: '0 0.5%', pageBreakInside: 'avoid' }}>
        {/* Logo and School Info */}
        <div className="text-center mb-3">
          <img src={Logo} alt="School Logo" className="mx-auto mb-2" style={{ maxWidth: '100px', maxHeight: '50px', objectFit: 'contain' }} />
          <div className="text-center">
            <div className="font-bold text-md">ABC High School</div>
          </div>
        </div>
        
        {/* Copy Type */}
        <div className="text-center font-bold text-xs mb-2 border-b border-gray-400 pb-1">
          {copyType} COPY - PAID
        </div>
        
        {/* Paid Stamp */}
        <div className="text-center mb-3">
          <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold text-lg border-2 border-green-500">
            PAID
          </div>
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
            <span>Payment Date:</span>
            <span>{formatDate(challan.date)}</span>
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
          <div>0123456789</div>
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
              {fineAmount > 0 && (
                <tr>
                  <td className="border border-gray-400 p-1">Fine (Late Payment)</td>
                  <td className="border border-gray-400 p-1 text-right">{fineAmount}</td>
                </tr>
              )}
              <tr className="font-bold">
                <td className="border border-gray-400 p-1">Total</td>
                <td className="border border-gray-400 p-1 text-right">{totalAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Payment Info */}
        <div className="text-xs mb-2">
          <div className="flex justify-between font-bold mb-1">
            <span>Amount Paid:</span>
            <span>Rs. {totalAmount}</span>
          </div>
          <div className="border border-gray-400 p-2 mb-2">
            <div className="font-bold mb-1">Payment Method:</div>
            <div>{challan.paymentMethod || 'Cash'}</div>
            <div className="mt-1 font-bold">Payment Received By:</div>
            <div>________________________</div>
          </div>
        </div>
        
        {/* Footer Info */}
        <div className="text-xs text-center border-t border-gray-400 pt-2">
          <div className="mb-1">Thank you for your payment</div>
          <div>For queries contact: +1 (555) 123-4567</div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-white z-50 p-0 m-0 overflow-auto">
      <div className="print-container">
        {/* Header - Hidden in print view */}
        <div className="flex justify-between items-center mb-4 p-4 bg-white border-b print:hidden">
          <h1 className="text-xl font-bold text-gray-900">Paid Challan Receipt</h1>
          <div className="flex space-x-2">
            <button
              onClick={onPrint}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <FaPrint className="mr-2" /> Print Receipt
            </button>
            <button
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Student Details
            </button>
          </div>
        </div>

        {/* Printable Paid Challan - 3 copies on one page */}
        <div className="print-container">
          <div className="challan-page" style={{ pageBreakAfter: 'avoid', pageBreakInside: 'avoid', display: 'block', width: '100%' }}>
            <PaidChallanCopy copyType="STUDENT" />
            <PaidChallanCopy copyType="BANK" />
            <PaidChallanCopy copyType="SCHOOL" />
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            
            html, body {
              height: 100%;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
            }
            
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 12px;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            
            .fixed {
              position: static !important;
            }
            
            .print-container {
              padding: 0 !important;
              margin: 0 !important;
              max-width: 100% !important;
              page-break-after: avoid !important;
              page-break-inside: avoid !important;
              width: 100% !important;
              height: auto !important;
            }
            
            .print-hidden {
              display: none !important;
            }
            
            .challan-page {
              page-break-after: avoid !important;
              page-break-inside: avoid !important;
              display: block !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            .challan-copy {
              width: 32% !important;
              display: inline-block !important;
              vertical-align: top !important;
              margin: 0 0.5% !important;
              border: 1px solid #000 !important;
              padding: 5px !important;
              box-sizing: border-box !important;
              page-break-inside: avoid !important;
              page-break-after: avoid !important;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
            }
            
            th, td {
              border: 1px solid #000;
              padding: 2px;
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
              padding: 2px;
            }
            
            .p-2 {
              padding: 3px;
            }
            
            .p-3 {
              padding: 5px;
            }
            
            .mb-1 {
              margin-bottom: 2px;
            }
            
            .mb-2 {
              margin-bottom: 3px;
            }
            
            .mb-3 {
              margin-bottom: 5px;
            }
            
            .text-xs {
              font-size: 10px;
            }
            
            .text-sm {
              font-size: 11px;
            }
            
            /* Hide all other elements except the challan */
            * {
              visibility: hidden;
            }
            
            .challan-page, .challan-page * {
              visibility: visible;
            }
            
            .challan-page {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PaidChallanView;