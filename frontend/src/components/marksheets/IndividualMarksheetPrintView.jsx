import React from 'react';
import { FaUser } from 'react-icons/fa';

const IndividualMarksheetPrintView = ({ 
  marksheetData, 
  studentData, 
  classData,
  positionData,
  schoolInfo
}) => {
  if (!marksheetData) return null;

  return (
    <div className="w-full mx-auto bg-white font-sans">
      {/* Printable Marksheet */}
      <div className="marksheets-section">
        {/* Student Photo and Info */}
        <div className="flex items-center mb-4">
          {/* Student Photo */}
          <div className="mr-4">
            {studentData?.photo ? (
              <img 
                src={studentData.photo} 
                alt="Student" 
                className="w-20 h-20 rounded object-cover border border-gray-300"
              />
            ) : (
              <div className="w-20 h-20 rounded bg-gray-200 border border-gray-300 flex items-center justify-center">
                <FaUser className="text-gray-500 text-2xl" />
              </div>
            )}
          </div>
          
          {/* Student Information */}
          <div>
            <div className="font-bold text-gray-800 text-xl">
              {studentData ? `${studentData.firstName} ${studentData.lastName}` : marksheetData.studentName}
            </div>
            <div className="text-gray-600">ID: {marksheetData.studentId}</div>
            <div className="text-gray-600">Class: {marksheetData.class} - {marksheetData.section}</div>
            <div className="text-gray-600">Exam: {marksheetData.examType} {marksheetData.year}</div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-gray-50 p-3 rounded text-center">
            <div className="text-xs text-gray-600">Obtained</div>
            <div className="font-bold text-lg">{marksheetData.totalObtained}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded text-center">
            <div className="text-xs text-gray-600">Total</div>
            <div className="font-bold text-lg">{marksheetData.totalMarks}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded text-center">
            <div className="text-xs text-gray-600">Percentage</div>
            <div className="font-bold text-lg">{marksheetData.percentage}%</div>
          </div>
          <div className="bg-gray-50 p-3 rounded text-center">
            <div className="text-xs text-gray-600">Grade</div>
            <div className="font-bold text-lg">{marksheetData.overallGrade}</div>
          </div>
        </div>

        {/* Marks Table */}
        <div className="mb-4">
          <div className="border rounded">
            <div className="grid grid-cols-4 gap-0 bg-gray-100 border-b text-sm font-medium p-3">
              <span>Subject</span>
              <span className="text-center">Obtained</span>
              <span className="text-center">Total</span>
              <span className="text-center">Grade</span>
            </div>
            <div className="divide-y divide-gray-200">
              {marksheetData.marks && marksheetData.marks.map((subject, index) => (
                <div key={index} className="grid grid-cols-4 gap-0 p-3">
                  <span>{subject.subjectName}</span>
                  <span className="text-center">{subject.marksObtained}</span>
                  <span className="text-center">{subject.totalMarks}</span>
                  <span className="text-center font-medium">{subject.grade}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          
          .marksheets-section {
            padding: 20px;
            max-width: 100%;
            page-break-inside: avoid;
            /* Fit 2 marksheets per page - top and bottom */
            height: 45vh;
            box-sizing: border-box;
            break-inside: avoid;
            margin-bottom: 0;
          }
          
          /* Remove page break after the last marksheet */
          .marksheets-section:last-child {
            page-break-after: avoid;
          }
          
          @page {
            size: A4;
            margin: 0.3in;
          }
          
          .text-center { text-align: center; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .font-bold { font-weight: 700; }
          .text-gray-800 { color: #1f2937; }
          .text-gray-600 { color: #4b5563; }
          .text-xl { font-size: 1.25rem; }
          .text-lg { font-size: 1.125rem; }
          .text-sm { font-size: 0.875rem; }
          .text-xs { font-size: 0.75rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mr-4 { margin-right: 1rem; }
          .w-20 { width: 5rem; }
          .h-20 { height: 5rem; }
          .rounded { border-radius: 0.25rem; }
          .object-cover { object-fit: cover; }
          .border { border: 1px solid #d1d5db; }
          .border-b { border-bottom: 1px solid #d1d5db; }
          .border-gray-300 { border-color: #d1d5db; }
          .bg-gray-200 { background-color: #e5e7eb; }
          .bg-gray-100 { background-color: #f3f4f6; }
          .bg-gray-50 { background-color: #f9fafb; }
          .p-3 { padding: 0.75rem; }
          .grid { display: grid; }
          .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .gap-0 { gap: 0; }
          .gap-2 { gap: 0.5rem; }
          .divide-y > :not([hidden]) ~ :not([hidden]) { border-top: 1px solid #e5e7eb; }
          .divide-gray-200 > :not([hidden]) ~ :not([hidden]) { border-color: #e5e7eb; }
        }
        
        /* Screen styles */
        .marksheets-section {
          margin-bottom: 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 2rem;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default IndividualMarksheetPrintView;