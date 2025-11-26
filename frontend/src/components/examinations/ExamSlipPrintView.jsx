import React from 'react';
import { FaSchool, FaUser, FaCalendar, FaClock } from 'react-icons/fa';

const ExamSlipPrintView = ({ examSlip, student, exam, onPrint, onDownload }) => {
  // Add default values for safety
  const safeExamSlip = examSlip || {};
  const safeStudent = student || {};
  const safeExam = exam || {};

  return (
    <div className="w-full mx-auto bg-white font-sans">
      {/* School Header - Hidden in print view */}
      <div className="text-center border-b border-gray-300 pb-2 mb-3 print:hidden">
        <div className="flex items-center justify-center mb-1">
          <FaSchool className="text-blue-600 text-lg mr-2" />
          <h1 className="text-lg font-bold text-gray-800">School Management System</h1>
        </div>
        <p className="text-gray-600 text-xs mb-1">123 Education Street, Learning City</p>
        <p className="text-gray-600 text-xs">Phone: +1 (555) 123-4567</p>
      </div>

      {/* Exam Slip Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-base font-bold text-gray-800">Exam Slip</h2>
          <p className="text-gray-600 text-xs">ID: {safeExamSlip.id || 'N/A'}</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
          {safeExam.name || 'N/A'} - {safeExam.examType || 'N/A'}
        </div>
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
            
            <span className="font-medium col-span-1">Roll No:</span>
            <span className="col-span-2">{safeExamSlip.rollNumber || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Exam Schedule */}
      <div className="mb-3">
        <h3 className="font-bold text-gray-800 mb-2 text-xs flex items-center">
          <FaCalendar className="mr-2 text-blue-600 text-xs" /> Exam Schedule
        </h3>
        <div className="border rounded">
          <div className="grid grid-cols-4 gap-1 p-2 bg-gray-50 border-b text-xs font-medium">
            <span className="col-span-1">Subject</span>
            <span className="text-center">Date</span>
            <span className="text-center">Time</span>
            <span className="text-center">Room</span>
          </div>
          <div className="divide-y divide-gray-200">
            {safeExamSlip.subjects && safeExamSlip.subjects.map((subject, index) => (
              <div key={index} className="grid grid-cols-4 gap-1 p-2 text-xs">
                <span className="col-span-1">{subject.name}</span>
                <span className="text-center">{subject.date || 'N/A'}</span>
                <span className="text-center">{subject.time || 'N/A'}</span>
                <span className="text-center">{subject.room || 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exam Details */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-1">Exam Date</h4>
          <div className="bg-gray-50 p-2 rounded border text-xs">
            {safeExam.startDate || 'N/A'}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-1">Reporting Time</h4>
          <div className="bg-gray-50 p-2 rounded border text-xs">
            30 minutes before exam
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-3">
        <h3 className="font-bold text-gray-800 mb-2 text-xs">Important Instructions</h3>
        <div className="bg-blue-50 p-2 rounded border border-blue-200 text-xs">
          <ul className="list-disc pl-4 space-y-1">
            <li>Bring your admit card and valid ID to the examination hall</li>
            <li>Arrive at least 30 minutes before the exam starts</li>
            <li>No electronic devices are allowed in the examination hall</li>
            <li>Follow all instructions given by the invigilators</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons - Only show when not printing */}
      <div className="flex justify-center space-x-3 mt-4 mb-3 print:hidden">
        <button
          onClick={onPrint}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
        <button
          onClick={onDownload}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Save PDF
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200 print:hidden">
        <p>Generated on {new Date().toLocaleDateString()}</p>
        <p className="mt-1">Official School Document</p>
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
          
          .exam-slip-print-view {
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
          .border { border: 1px solid #d1d5db; }
          .divide-y > :not([hidden]) ~ :not([hidden]) { border-top: 1px solid #e5e7eb; }
          .divide-gray-200 > :not([hidden]) ~ :not([hidden]) { border-color: #e5e7eb; }
          .text-right { text-align: right; }
          .bg-blue-50 { background-color: #eff6ff; }
          .border-blue-200 { border-color: #bfdbfe; }
          .list-disc { list-style-type: disc; }
          .pl-4 { padding-left: 1rem; }
          .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
        }
      `}</style>
    </div>
  );
};

export default ExamSlipPrintView;