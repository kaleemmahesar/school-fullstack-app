import React from 'react';
import { FaPrint, FaDownload, FaTimes } from 'react-icons/fa';

const QuickReference = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const quickReferenceData = {
    "Student Management": [
      {
        title: "Add New Student",
        steps: [
          "Go to Students → Add Student",
          "Fill admission form",
          "Upload photo (optional)",
          "Save student record"
        ]
      },
      {
        title: "Generate Family Links",
        steps: [
          "Open student record",
          "Click 'Link Family'",
          "Select existing family or create new",
          "Save relationship"
        ]
      },
      {
        title: "View Student Details",
        steps: [
          "Search student in Students list",
          "Click student name to open details",
          "View fees, attendance, marks"
        ]
      }
    ],
    "Fee Management": [
      {
        title: "Create Individual Challan",
        steps: [
          "Go to Fees section",
          "Select student from list",
          "Click 'Generate Challan'",
          "Enter details and save"
        ]
      },
      {
        title: "Bulk Challan Generation",
        steps: [
          "Go to Fees → Bulk Operations",
          "Select class/section",
          "Enter fee details",
          "Generate for all selected"
        ]
      },
      {
        title: "Process Payment",
        steps: [
          "Find challan in Fees list",
          "Click 'Mark as Paid'",
          "Select payment method",
          "Record payment details"
        ]
      }
    ],
    "Expense Tracking": [
      {
        title: "Add New Expense",
        steps: [
          "Go to Expenses section",
          "Click 'Add Expense'",
          "Enter description and amount",
          "Select category and date",
          "Save expense record"
        ]
      },
      {
        title: "Create Expense Category",
        steps: [
          "Go to Expenses section",
          "Click 'Add Category'",
          "Enter category name",
          "Use category for expenses"
        ]
      },
      {
        title: "Export Expense Report",
        steps: [
          "Filter expenses as needed",
          "Click 'Export CSV'",
          "Save file to computer",
          "Open in spreadsheet app"
        ]
      }
    ],
    "Staff Management": [
      {
        title: "Add New Staff Member",
        steps: [
          "Go to Staff section",
          "Click 'Add Staff'",
          "Fill employment details",
          "Set salary and allowances",
          "Save staff record"
        ]
      },
      {
        title: "Process Salary",
        steps: [
          "Go to Staff → Select member",
          "Click 'Pay Salary'",
          "Enter payment details",
          "Record salary payment"
        ]
      },
      {
        title: "View Staff Report",
        steps: [
          "Go to Staff section",
          "Use filters to narrow list",
          "Sort by position or date",
          "Export data if needed"
        ]
      }
    ],
    "Reporting": [
      {
        title: "Generate Financial Report",
        steps: [
          "Go to Financial Report section",
          "Set date range filters",
          "Click 'Generate Report'",
          "Export or print results"
        ]
      },
      {
        title: "Print Student List",
        steps: [
          "Go to Students section",
          "Apply class/section filters",
          "Click 'Print' button",
          "Use browser print dialog"
        ]
      },
      {
        title: "Export Data to CSV",
        steps: [
          "Navigate to any section",
          "Apply desired filters",
          "Click 'Export CSV'",
          "Save and open file"
        ]
      }
    ]
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col print:max-w-none print:h-auto print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 print:bg-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Quick Reference Guide</h2>
              <p className="text-blue-100 mt-1">Essential tasks and shortcuts for daily operations</p>
            </div>
            <div className="flex space-x-2 print:hidden">
              <button
                onClick={handlePrint}
                className="p-2 bg-white bg-opacity-20 rounded-lg text-white hover:bg-opacity-30"
              >
                <FaPrint className="text-lg" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white bg-opacity-20 rounded-lg text-white hover:bg-opacity-30"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-grow p-6 print:overflow-visible print:p-4">
          <div className="print:hidden mb-6">
            <p className="text-gray-600">
              This one-page guide contains the most common tasks you'll perform in the system. 
              Print or save this page for quick reference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(quickReferenceData).map(([category, tasks]) => (
              <div key={category} className="border border-gray-200 rounded-lg overflow-hidden print:border-gray-300">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 print:bg-gray-100">
                  <h3 className="font-bold text-gray-900">{category}</h3>
                </div>
                <div className="p-4 space-y-4">
                  {tasks.map((task, index) => (
                    <div key={index} className="print:text-xs">
                      <h4 className="font-medium text-gray-900 mb-2 print:font-bold">{task.title}</h4>
                      <ol className="list-decimal pl-5 space-y-1 text-gray-600 text-sm print:text-xs">
                        {task.steps.map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100 print:hidden">
            <h4 className="font-bold text-blue-800 mb-2">Pro Tips</h4>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• Use the search bar at the top to quickly find students, staff, or records</li>
              <li>• Apply filters before exporting data to get exactly what you need</li>
              <li>• Save frequently used filter combinations for quick access</li>
              <li>• Check the Financial Report section for real-time balance information</li>
            </ul>
          </div>
        </div>

        {/* Footer - Hidden when printing */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between print:hidden">
          <p className="text-sm text-gray-500">
            School Management System Quick Reference
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FaPrint className="mr-2" />
              Print Guide
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>

        {/* Print-specific styles */}
        <style>{`
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            .fixed {
              position: static !important;
            }
            .inset-0 {
              inset: auto !important;
            }
            .z-50 {
              z-index: auto !important;
            }
            .max-h-[90vh] {
              max-height: none !important;
            }
            .overflow-hidden {
              overflow: visible !important;
            }
            .overflow-y-auto {
              overflow: visible !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            .print\\:text-xs {
              font-size: 0.75rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default QuickReference;