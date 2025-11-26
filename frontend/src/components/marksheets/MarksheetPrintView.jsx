import React from 'react';
import { FaSchool, FaUser, FaClipboardList, FaPrint, FaDownload } from 'react-icons/fa';

const MarksheetPrintView = ({ 
  marksheetData, 
  studentData, 
  classData,
  onPrint,
  onDownload
}) => {
  if (!marksheetData) return null;

  const {
    examType,
    year,
    marks,
    totalObtained,
    totalMarks,
    percentage,
    overallGrade
  } = marksheetData;

  const studentName = studentData 
    ? `${studentData.firstName} ${studentData.lastName}`
    : marksheetData.studentName || 'N/A';

  const className = marksheetData.class || 'N/A';
  const section = marksheetData.section || 'N/A';

  // Format date
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

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

      {/* Marksheet Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-base font-bold text-gray-800">Student Marksheet</h2>
          <p className="text-gray-600 text-xs">ID: {marksheetData.id || 'N/A'}</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
          {examType} {year}
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
            
            <span className="font-medium col-span-1">Student ID:</span>
            <span className="col-span-2">{marksheetData.studentId || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Marks Details */}
      <div className="mb-3">
        <h3 className="font-bold text-gray-800 mb-2 text-xs">Subject Marks</h3>
        <div className="border rounded">
          <div className="grid grid-cols-4 gap-1 p-2 bg-gray-50 border-b text-xs font-medium">
            <span className="col-span-1">Subject</span>
            <span className="text-center">Obtained</span>
            <span className="text-center">Total</span>
            <span className="text-center">Grade</span>
          </div>
          <div className="divide-y divide-gray-200">
            {marks && marks.map((subject, index) => (
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
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-1">Total Obtained</h4>
          <div className="bg-gray-50 p-2 rounded border text-xs text-center font-bold">
            {totalObtained}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-1">Total Marks</h4>
          <div className="bg-gray-50 p-2 rounded border text-xs text-center font-bold">
            {totalMarks}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-1">Percentage</h4>
          <div className="bg-gray-50 p-2 rounded border text-xs text-center font-bold">
            {percentage}%
          </div>
        </div>
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-1">Grade</h4>
          <div className="bg-gray-50 p-2 rounded border text-xs text-center font-bold">
            <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs">
              {overallGrade}
            </span>
          </div>
        </div>
      </div>

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
      <div className="text-center text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
        <p>Generated on {generatedDate}</p>
        <p className="mt-1">Official School Document</p>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .print-container {
            padding: 10px;
            max-width: 100%;
          }
          
          .print-hidden {
            display: none !important;
          }
          
          @page {
            size: A4;
            margin: 0.5in;
          }
          
          .marksheet-print-view {
            font-family: Arial, Helvetica, sans-serif;
          }
        }
      `}</style>
    </div>
  );
};

export default MarksheetPrintView;