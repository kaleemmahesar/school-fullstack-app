import React from 'react';
import { FaSchool, FaChartLine, FaDollarSign, FaMoneyBillWave } from 'react-icons/fa';

const ActivitiesPrintView = ({ 
  filteredActivities, 
  calculateTotals, 
  activityType, 
  transactionType, 
  selectedQuarter, 
  selectedYear,
  schoolInfo
}) => {
  // Format date in MySQL format (YYYY-MM-DD)
  const generatedDate = new Date().toISOString().split('T')[0];

  // Get filter type text
  const getFilterTypeText = () => {
    if (activityType === 'all') return 'All Activities';
    if (activityType === 'daily') return 'Today';
    if (activityType === 'monthly') return 'This Month';
    return 'Custom Range';
  };

  // Get transaction type text
  const getTransactionTypeText = () => {
    if (transactionType === 'all') return 'All Transactions';
    if (transactionType === 'in') return 'Income';
    return 'Expenses';
  };

  // Get filter text
  const getFilterText = () => {
    if (selectedQuarter === 'all' && selectedYear === 'all') return '';
    return `Filtered for ${selectedQuarter !== 'all' ? `Q${selectedQuarter} ` : ''}${selectedYear !== 'all' ? selectedYear : ''}`;
  };

  // Use school info or fallback to defaults
  const safeSchoolInfo = schoolInfo || {
    name: "School Management System",
    address: "123 Education Street, Learning City",
    phone: "+1 (555) 123-4567"
  };

  return (
    <div className="w-full mx-auto bg-white font-sans activities-print-view">
      {/* Printable Activities Report - A4 Size */}
      <div className="activities-section">
        {/* School Header - Hidden in print view */}
        <div className="text-center border-b border-gray-300 pb-3 mb-4 print:hidden">
          <div className="flex items-center justify-center mb-2">
            <FaSchool className="text-blue-600 text-xl mr-3" />
            <h1 className="text-xl font-bold text-gray-800">{safeSchoolInfo.name}</h1>
          </div>
          <p className="text-gray-600 text-sm mb-1">{safeSchoolInfo.address}</p>
          <p className="text-gray-600 text-sm">Phone: {safeSchoolInfo.phone}</p>
        </div>

        {/* Report Title */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
            RECENT ACTIVITIES REPORT
          </h2>
          <p className="text-sm text-gray-600 mt-2">Generated on {generatedDate}</p>
          {getFilterText() && (
            <p className="text-xs text-gray-500 mt-1">
              {getFilterText()}
            </p>
          )}
        </div>

        {/* Summary Boxes */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded border">
            <div className="text-xs text-gray-600 mb-1">Total Activities</div>
            <div className="text-lg font-bold text-gray-800">{filteredActivities.length}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded border">
            <div className="text-xs text-gray-600 mb-1">Total Income</div>
            <div className="text-lg font-bold text-green-600">Rs {calculateTotals.income.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded border">
            <div className="text-xs text-gray-600 mb-1">Total Expenses</div>
            <div className="text-lg font-bold text-red-600">Rs {calculateTotals.expense.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded border">
            <div className="text-xs text-gray-600 mb-1">Net Position</div>
            <div className={`text-lg font-bold ${calculateTotals.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Rs {Math.abs(calculateTotals.net).toLocaleString()} {calculateTotals.net >= 0 ? '' : '(Loss)'}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded border">
            <div className="text-xs text-gray-600 mb-1">Filter Type</div>
            <div className="text-sm font-medium text-gray-800">
              {getFilterTypeText()}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded border">
            <div className="text-xs text-gray-600 mb-1">Transaction Type</div>
            <div className="text-sm font-medium text-gray-800">
              {getTransactionTypeText()}
            </div>
          </div>
        </div>

        {/* Activities Table */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center">
            <FaChartLine className="mr-2 text-blue-600 text-sm" /> Activity Details
          </h3>
          <div className="border rounded">
            <div className="grid grid-cols-5 gap-1 p-3 bg-gray-50 border-b text-sm font-medium">
              <span className="col-span-1">Activity</span>
              <span className="col-span-2">Description</span>
              <span className="text-center">Category</span>
              <span className="text-center">Amount</span>
              <span className="text-center">Date</span>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredActivities.map((activity, index) => (
                <div key={index} className="grid grid-cols-5 gap-1 p-3 text-sm">
                  <span className="col-span-1 font-medium">{activity.type}</span>
                  <span className="col-span-2">{activity.description}</span>
                  <span className="text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      activity.category === 'Students' ? 'bg-blue-100 text-blue-800' :
                      activity.category === 'Fees' ? 'bg-green-100 text-green-800' :
                      activity.category === 'Income' ? 'bg-emerald-100 text-emerald-800' :
                      activity.category === 'Expenses' ? 'bg-red-100 text-red-800' :
                      activity.category === 'Staff' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.category}
                    </span>
                  </span>
                  <span className="text-center font-medium">
                    {activity.amount >= 0 ? (
                      <span className="text-green-600">+Rs {activity.amount.toLocaleString()}</span>
                    ) : (
                      <span className="text-red-600">-Rs {Math.abs(activity.amount).toLocaleString()}</span>
                    )}
                  </span>
                  <span className="text-center text-gray-600">
                    {activity.date ? new Date(activity.date).toISOString().split('T')[0] : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 pt-4 mt-6 text-center text-sm text-gray-600">
          <p className="mb-1">This is an official report generated on {generatedDate}</p>
          <p className="text-xs">{safeSchoolInfo.name} - Activities Report</p>
        </div>
      </div>

      {/* Print Styles - A4 Size */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          
          .activities-section {
            padding: 15px;
            max-width: 100%;
            page-break-inside: avoid;
            page-break-after: always;
          }
          
          /* Remove page break after the last section */
          .activities-section:last-child {
            page-break-after: avoid;
          }
          
          @page {
            size: A4;
            margin: 0.5in;
          }
          
          .activities-print-view {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          
          /* Enhanced print styling */
          .text-center { text-align: center; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .border-b { border-bottom: 1px solid #d1d5db; }
          .border-t { border-top: 1px solid #d1d5db; }
          .border-gray-300 { border-color: #d1d5db; }
          .pb-2 { padding-bottom: 0.5rem; }
          .pb-3 { padding-bottom: 0.75rem; }
          .mb-3 { margin-bottom: 0.75rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mt-1 { margin-top: 0.25rem; }
          .mt-2 { margin-top: 0.5rem; }
          .mt-6 { margin-top: 1.5rem; }
          .pt-4 { padding-top: 1rem; }
          .text-lg { font-size: 1.125rem; }
          .text-base { font-size: 1rem; }
          .text-sm { font-size: 0.875rem; }
          .text-xs { font-size: 0.75rem; }
          .font-bold { font-weight: 700; }
          .font-medium { font-weight: 500; }
          .text-gray-800 { color: #1f2937; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-500 { color: #6b7280; }
          .text-green-600 { color: #16a34a; }
          .text-red-600 { color: #dc2626; }
          .bg-gray-50 { background-color: #f9fafb; }
          .bg-blue-100 { background-color: #dbeafe; }
          .bg-green-100 { background-color: #dcfce7; }
          .bg-emerald-100 { background-color: #d1fae5; }
          .bg-red-100 { background-color: #fee2e2; }
          .bg-purple-100 { background-color: #f3e8ff; }
          .bg-gray-100 { background-color: #f3f4f6; }
          .text-blue-800 { color: #1e40af; }
          .text-green-800 { color: #166534; }
          .text-emerald-800 { color: #065f46; }
          .text-red-800 { color: #991b1b; }
          .text-purple-800 { color: #6b21a8; }
          .rounded { border-radius: 0.25rem; }
          .p-3 { padding: 0.75rem; }
          .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
          .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
          .gap-1 { gap: 0.25rem; }
          .gap-4 { gap: 1rem; }
          .col-span-1 { grid-column: span 1 / span 1; }
          .col-span-2 { grid-column: span 2 / span 2; }
          .border { border: 1px solid #d1d5db; }
          .divide-y > :not([hidden]) ~ :not([hidden]) { border-top: 1px solid #e5e7eb; }
          .divide-gray-200 > :not([hidden]) ~ :not([hidden]) { border-color: #e5e7eb; }
        }
      `}</style>
    </div>
  );
};

export default ActivitiesPrintView;