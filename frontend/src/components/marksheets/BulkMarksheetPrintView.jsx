import React from 'react';
import { FaSchool, FaUser, FaClipboardList } from 'react-icons/fa';

const BulkMarksheetPrintView = ({ 
  marksheetsData, 
  studentsData, 
  classesData
}) => {
  if (!marksheetsData || marksheetsData.length === 0) return null;

  // Format date
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Group marksheets by student
  const groupedMarksheets = marksheetsData.reduce((acc, marksheet) => {
    const studentId = marksheet.studentId;
    if (!acc[studentId]) {
      acc[studentId] = [];
    }
    acc[studentId].push(marksheet);
    return acc;
  }, {});

  return (
    <div className="w-full mx-auto bg-white font-sans bulk-marksheet-print-view">
      {/* Printable Marksheets */}
      <div className="print-container">
        {Object.entries(groupedMarksheets).map(([studentId, studentMarksheets], index) => {
          const studentData = studentsData?.find(s => s.id === studentId);
          const studentName = studentData 
            ? `${studentData.firstName} ${studentData.lastName}`
            : studentMarksheets[0]?.studentName || 'N/A';
            
          const className = studentMarksheets[0]?.class || 'N/A';
          const section = studentMarksheets[0]?.section || 'N/A';

          return (
            <div key={studentId} className={`student-marksheets ${index > 0 ? 'mt-8' : ''} ${index < Object.keys(groupedMarksheets).length - 1 ? 'student-page-break' : ''}`}>
              {/* School Header - Hidden in print view */}
              <div className="text-center border-b border-gray-300 pb-2 mb-3 print:hidden">
                <div className="flex items-center justify-center mb-1">
                  <FaSchool className="text-blue-600 text-lg mr-2" />
                  <h1 className="text-lg font-bold text-gray-800">School Management System</h1>
                </div>
                <p className="text-gray-600 text-xs mb-1">123 Education Street, Learning City</p>
                <p className="text-gray-600 text-xs">Phone: +1 (555) 123-4567</p>
              </div>

              {/* Student Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-base font-bold text-gray-800">Student Marksheets</h2>
                  <p className="text-gray-600 text-xs">Student ID: {studentId || 'N/A'}</p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  {className} - Section {section}
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
                    <span className="col-span-2">{studentName}</span>
                    
                    <span className="font-medium col-span-1">Class:</span>
                    <span className="col-span-2">{className} - Section {section}</span>
                    
                    <span className="font-medium col-span-1">Total Exams:</span>
                    <span className="col-span-2">{studentMarksheets.length}</span>
                  </div>
                </div>
              </div>

              {/* Individual Marksheets */}
              <div className="space-y-6">
                {studentMarksheets.map((marksheet, marksheetIndex) => (
                  <div key={`${studentId}-${marksheetIndex}`} className="marksheets-section">
                    {/* Exam Header */}
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-gray-800 text-xs flex items-center">
                        <FaClipboardList className="mr-2 text-blue-600 text-xs" /> 
                        {marksheet.examType} - {marksheet.year}
                      </h3>
                      <div className="text-xs text-gray-600">
                        Generated: {generatedDate}
                      </div>
                    </div>
                    
                    {/* Marks Table */}
                    <div className="mb-3">
                      <div className="border rounded">
                        <div className="grid grid-cols-4 gap-1 p-2 bg-gray-50 border-b text-xs font-medium">
                          <span className="col-span-1">Subject</span>
                          <span className="text-center">Obtained</span>
                          <span className="text-center">Total</span>
                          <span className="text-center">Grade</span>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {marksheet.marks && marksheet.marks.map((subject, index) => (
                            <div key={index} className="grid grid-cols-4 gap-1 p-2 text-xs">
                              <span className="col-span-1">{subject.subjectName}</span>
                              <span className="text-center">{subject.marksObtained}</span>
                              <span className="text-center">{subject.totalMarks}</span>
                              <span className="text-center">
                                <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs">
                                  {subject.grade}
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-1">Obtained</h4>
                        <div className="bg-gray-50 p-2 rounded border text-xs text-center font-bold">
                          {marksheet.totalObtained}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-1">Total</h4>
                        <div className="bg-gray-50 p-2 rounded border text-xs text-center font-bold">
                          {marksheet.totalMarks}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-1">%</h4>
                        <div className="bg-gray-50 p-2 rounded border text-xs text-center font-bold">
                          {marksheet.percentage}%
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-1">Grade</h4>
                        <div className="bg-gray-50 p-2 rounded border text-xs text-center font-bold">
                          <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs">
                            {marksheet.overallGrade}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Page break styling applied directly to container */}
            </div>
          );
        })}
      </div>

      {/* Footer for all pages */}
      <div className="border-t border-gray-300 pt-3 mt-4 text-center text-xs text-gray-500 print:hidden">
        <p>Generated on {generatedDate} - Official School Documents</p>
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
          
          .student-page-break {
            page-break-after: always;
          }
          
          .page-break {
            page-break-after: always;
            height: 0;
            margin: 0;
            padding: 0;
          }
          
          @page {
            size: A4;
            margin: 0.5in;
          }
          
          .bulk-marksheet-print-view {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: visible;
          }
          
          .marksheets-section {
            page-break-inside: avoid;
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
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .gap-1 { gap: 0.25rem; }
          .col-span-1 { grid-column: span 1 / span 1; }
          .col-span-2 { grid-column: span 2 / span 2; }
          .gap-2 { gap: 0.5rem; }
          .border { border: 1px solid #d1d5db; }
          .divide-y > :not([hidden]) ~ :not([hidden]) { border-top: 1px solid #e5e7eb; }
          .divide-gray-200 > :not([hidden]) ~ :not([hidden]) { border-color: #e5e7eb; }
          .text-right { text-align: right; }
          .bg-green-100 { background-color: #dcfce7; }
          .text-green-800 { color: #166534; }
          .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
          .py-0.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
          .mb-4 { margin-bottom: 1rem; }
          .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
          .mt-8 { margin-top: 2rem; }
        }
      `}</style>
    </div>
  );
};

export default BulkMarksheetPrintView;