import React from 'react';
import { FaPrint } from 'react-icons/fa';
import Logo from '../../img/d-logo.jpeg';

const ParentReceiptView = ({ challan, student, schoolInfo, onPrint, onBack }) => {
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

  // Format date for issue date (current date)
  const formatIssueDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const studentName = student 
    ? `${student.firstName} ${student.lastName}`
    : 'N/A';
  
  const fatherName = student?.fatherName || 'N/A';
  const className = student?.class || 'N/A';
  const section = student?.section || 'N/A';
  const grNumber = student?.grNo || 'N/A';
  
  // Calculate amounts with proper type conversion
  const tuitionFee = Math.round(parseFloat(challan.amount) || 0);
  // For paid challans, use the stored fineAmount from the payment
  const fineAmount = challan.fineAmount !== undefined ? 
    Math.round(parseFloat(challan.fineAmount) || 0) : 0;
  const totalAmount = tuitionFee + fineAmount;
  
  // Calculate discount information with proper type conversion
  const discountAmount = parseFloat(challan.discountAmount) || 0;
  const discountReason = challan.discountReason || '';
  const discountedAmount = parseFloat(challan.discountedAmount) || totalAmount;

  return (
    <div className="fixed inset-0 bg-white z-50 p-0 m-0 overflow-auto">
      <div className="print-container">
        {/* Header - Hidden in print view */}
        <div className="flex justify-between items-center mb-4 p-4 bg-white border-b print:hidden">
          <h1 className="text-xl font-bold text-gray-900">Parent Payment Receipt</h1>
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

        {/* Printable Parent Receipt - Single copy */}
        <div className="print-container flex justify-center">
          <div className="receipt-content" style={{ width: '210mm', minHeight: '297mm', padding: '10mm' }}>
            {/* Header */}
            <div className="text-center mb-6">
              {safeSchoolInfo.logo ? (
                <img src={safeSchoolInfo.logo} alt="School Logo" className="mx-auto h-16 mb-3" />
              ) : (
                <img src={Logo} alt="School Logo" className="mx-auto mb-3" style={{ maxWidth: '120px', maxHeight: '60px', objectFit: 'contain' }} />
              )}
              <div className="text-center">
                <h1 className="font-bold text-xl">{safeSchoolInfo.name}</h1>
                <p className="text-sm text-gray-600 mt-1">{safeSchoolInfo.address}</p>
                <p className="text-sm text-gray-600">Phone: {safeSchoolInfo.phone}</p>
              </div>
            </div>
            
            {/* Title */}
            <div className="text-center mb-6">
              <div className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-lg font-bold text-xl border-2 border-green-500">
                PAYMENT RECEIPT
              </div>
            </div>
            
            {/* Receipt Details */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Receipt Date:</span>
                  <span>{formatIssueDate()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Payment Date:</span>
                  <span>{formatDate(challan.date)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Due Date:</span>
                  <span>{formatDate(challan.dueDate)}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Challan ID:</span>
                  <span>{challan.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">GR Number:</span>
                  <span>{grNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium">Payment Method:</span>
                  <span className="capitalize">{challan.paymentMethod || 'Cash'}</span>
                </div>
              </div>
            </div>
            
            {/* Student Info */}
            <div className="mb-6 text-sm">
              <h2 className="font-bold text-lg mb-3 border-b border-gray-300 pb-1">Student Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-2">
                    <span className="font-medium">Student Name:</span>
                    <span className="ml-2">{studentName}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Father's Name:</span>
                    <span className="ml-2">{fatherName}</span>
                  </div>
                </div>
                <div>
                  <div className="mb-2">
                    <span className="font-medium">Class:</span>
                    <span className="ml-2">{className} - Section {section}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Month:</span>
                    <span className="ml-2">{challan.month}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Fee Details */}
            <div className="mb-6">
              <h2 className="font-bold text-lg mb-3 border-b border-gray-300 pb-1">Fee Details</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between py-2">
                  <span>Tuition Fees:</span>
                  <span>Rs. {tuitionFee.toFixed(2)}</span>
                </div>
                {fineAmount > 0 && (
                  <div className="flex justify-between py-2">
                    <span>Fine (Late Payment):</span>
                    <span>Rs. {fineAmount.toFixed(2)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <>
                    <div className="flex justify-between py-2 border-t border-dashed border-gray-300 mt-2 pt-2">
                      <span>Subtotal:</span>
                      <span>Rs. {totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>Discount ({discountReason}):</span>
                      <span className="text-red-600">- Rs. {discountAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between py-3 border-t border-gray-300 mt-2 font-bold text-lg">
                  <span>Total Amount Paid:</span>
                  <span>Rs. {discountedAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Signature */}
            <div className="mb-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="border-t border-gray-400 pt-2 mt-8">
                    <p className="font-medium">Received By (School)</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-gray-400 pt-2 mt-8">
                    <p className="font-medium">Parent/Guardian Signature</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="text-center text-xs text-gray-500 border-t border-gray-300 pt-4">
              <p>Thank you for your payment. This is a computer-generated receipt and does not require a signature.</p>
              <p className="mt-1">For any queries, please contact the school office.</p>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
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
              font-size: 14px;
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
              display: flex !important;
              justify-content: center !important;
            }
            
            .receipt-content {
              width: 210mm !important;
              min-height: 297mm !important;
              padding: 10mm !important;
              box-sizing: border-box !important;
              page-break-inside: avoid !important;
              page-break-after: avoid !important;
            }
            
            .print-hidden {
              display: none !important;
            }
            
            /* Hide all other elements except the receipt */
            * {
              visibility: hidden;
            }
            
            .receipt-content, .receipt-content * {
              visibility: visible;
            }
            
            .receipt-content {
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

export default ParentReceiptView;