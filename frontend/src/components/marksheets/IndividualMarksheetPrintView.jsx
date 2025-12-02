import React from 'react';
import { FaSchool, FaUser, FaClipboardList, FaTrophy, FaMedal } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const IndividualMarksheetPrintView = ({ 
  marksheetData, 
  studentData, 
  classData,
  positionData, // { position: 1, totalStudents: 25 }
  schoolInfo
}) => {
  if (!marksheetData) return null;

  // Use school info from props with fallback defaults
  const safeSchoolInfo = {
    schoolName: schoolInfo?.schoolName || schoolInfo?.name || "School Management System",
    schoolAddress: schoolInfo?.schoolAddress || schoolInfo?.address || "123 Education Street, Learning City",
    schoolPhone: schoolInfo?.schoolPhone || schoolInfo?.phone || "+1 (555) 123-4567"
  };

  // Format date
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Get position icon
  const getPositionIcon = (position) => {
    switch (position) {
      case 1: return <FaTrophy className="text-yellow-500" />;
      case 2: return <FaMedal className="text-gray-400" />;
      case 3: return <FaMedal className="text-amber-700" />;
      default: return null;
    }
  };

  // Get position text
  const getPositionText = (position) => {
    switch (position) {
      case 1: return '1st Position';
      case 2: return '2nd Position';
      case 3: return '3rd Position';
      default: return `${position}th Position`;
    }
  };

  return (
    <div className="w-full mx-auto bg-white font-sans">
      {/* Printable Marksheet - A4 Size */}
      <div className="marksheets-section">
        {/* School Header - Hidden in print view */}
        <div className="text-center border-b border-gray-300 pb-3 mb-4 print:hidden">
          <div className="flex items-center justify-center mb-2">
            <FaSchool className="text-blue-600 text-xl mr-3" />
            <h1 className="text-xl font-bold text-gray-800">{safeSchoolInfo.schoolName || "School Management System"}</h1>
          </div>
          <p className="text-gray-600 text-sm mb-1">{safeSchoolInfo.schoolAddress || "123 Education Street, Learning City"}</p>
          <p className="text-gray-600 text-sm">Phone: {safeSchoolInfo.schoolPhone || "+1 (555) 123-4567"}</p>
        </div>

        {/* Marksheet Title */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
            STUDENT MARKSHEET
          </h2>
        </div>

        {/* Student Information */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center">
              <FaUser className="mr-2 text-blue-600 text-sm" /> Student Information
            </h3>
            <div className="bg-gray-50 p-3 rounded border">
              <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                <span className="font-medium col-span-1">Name:</span>
                <span className="col-span-2 font-medium">
                  {studentData ? `${studentData.firstName} ${studentData.lastName}` : marksheetData.studentName}
                </span>
                
                <span className="font-medium col-span-1">Student ID:</span>
                <span className="col-span-2">{marksheetData.studentId}</span>
                
                <span className="font-medium col-span-1">Class:</span>
                <span className="col-span-2">{marksheetData.class} - Section {marksheetData.section}</span>
                
                <span className="font-medium col-span-1">Exam:</span>
                <span className="col-span-2">{marksheetData.examType} {marksheetData.year}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Performance Summary</h3>
            <div className="bg-gray-50 p-3 rounded border">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Total Obtained</div>
                  <div className="text-lg font-bold text-gray-800">{marksheetData.totalObtained}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Total Marks</div>
                  <div className="text-lg font-bold text-gray-800">{marksheetData.totalMarks}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Percentage</div>
                  <div className="text-lg font-bold text-gray-800">{marksheetData.percentage}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Grade</div>
                  <div className="text-lg font-bold text-gray-800">
                    <span className={`px-2 py-1 rounded text-sm ${
                      marksheetData.overallGrade === 'A+' ? 'bg-yellow-100 text-yellow-800' :
                      marksheetData.overallGrade === 'A' ? 'bg-green-100 text-green-800' :
                      marksheetData.overallGrade === 'B+' ? 'bg-blue-100 text-blue-800' :
                      marksheetData.overallGrade === 'B' ? 'bg-indigo-100 text-indigo-800' :
                      marksheetData.overallGrade === 'C' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {marksheetData.overallGrade}
                    </span>
                  </div>
                </div>
              </div>
              
              {positionData && positionData.position <= 3 && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                  <div className="flex items-center justify-center">
                    {getPositionIcon(positionData.position)}
                    <span className="ml-2 font-bold text-gray-800">
                      {getPositionText(positionData.position)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Top {Math.round((positionData.position / positionData.totalStudents) * 100)}% of class
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Marks Table */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center">
            <FaClipboardList className="mr-2 text-blue-600 text-sm" /> Subject-wise Performance
          </h3>
          <div className="border rounded">
            <div className="grid grid-cols-5 gap-1 p-3 bg-gray-50 border-b text-sm font-medium">
              <span className="col-span-2">Subject</span>
              <span className="text-center">Obtained</span>
              <span className="text-center">Total</span>
              <span className="text-center">Grade</span>
            </div>
            <div className="divide-y divide-gray-200">
              {marksheetData.marks && marksheetData.marks.map((subject, index) => (
                <div key={index} className="grid grid-cols-5 gap-1 p-3 text-sm">
                  <span className="col-span-2 font-medium">{subject.subjectName}</span>
                  <span className="text-center">{subject.marksObtained}</span>
                  <span className="text-center">{subject.totalMarks}</span>
                  <span className="text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      subject.grade === 'A+' ? 'bg-yellow-100 text-yellow-800' :
                      subject.grade === 'A' ? 'bg-green-100 text-green-800' :
                      subject.grade === 'B+' ? 'bg-blue-100 text-blue-800' :
                      subject.grade === 'B' ? 'bg-indigo-100 text-indigo-800' :
                      subject.grade === 'C' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {subject.grade}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 pt-4 mt-6 text-center text-sm text-gray-600">
          <p className="mb-1">This is an official document generated on {generatedDate}</p>
          <p className="text-xs">Signature: _________________ &nbsp;&nbsp;&nbsp;&nbsp; Date: _________________</p>
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
          
          .marksheets-section {
            padding: 15px;
            max-width: 100%;
            page-break-inside: avoid;
            page-break-after: always;
          }
          
          /* Remove page break after the last marksheet */
          .marksheets-section:last-child {
            page-break-after: avoid;
          }
          
          @page {
            size: A4;
            margin: 0.5in;
          }
          
          .individual-marksheet-print-view {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          
          /* Enhanced print styling */
          .text-center { text-align: center; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .justify-between { justify-content: space-between; }
          .border-b { border-bottom: 1px solid #d1d5db; }
          .border-t { border-top: 1px solid #d1d5db; }
          .border-gray-300 { border-color: #d1d5db; }
          .pb-2 { padding-bottom: 0.5rem; }
          .pb-3 { padding-bottom: 0.75rem; }
          .mb-3 { margin-bottom: 0.75rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mt-3 { margin-top: 0.75rem; }
          .mt-6 { margin-top: 1.5rem; }
          .pt-3 { padding-top: 0.75rem; }
          .pt-4 { padding-top: 1rem; }
          .text-lg { font-size: 1.125rem; }
          .text-base { font-size: 1rem; }
          .text-sm { font-size: 0.875rem; }
          .text-xs { font-size: 0.75rem; }
          .font-bold { font-weight: 700; }
          .text-gray-800 { color: #1f2937; }
          .text-gray-600 { color: #4b5563; }
          .bg-gray-50 { background-color: #f9fafb; }
          .bg-yellow-100 { background-color: #fef3c7; }
          .bg-green-100 { background-color: #dcfce7; }
          .bg-blue-100 { background-color: #dbeafe; }
          .bg-indigo-100 { background-color: #e0e7ff; }
          .bg-purple-100 { background-color: #f3e8ff; }
          .bg-red-100 { background-color: #fee2e2; }
          .text-yellow-800 { color: #92400e; }
          .text-green-800 { color: #166534; }
          .text-blue-800 { color: #1e40af; }
          .text-indigo-800 { color: #3730a3; }
          .text-purple-800 { color: #6b21a8; }
          .text-red-800 { color: #991b1b; }
          .p-3 { padding: 0.75rem; }
          .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
          .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
          .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
          .py-0.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
          .rounded { border-radius: 0.25rem; }
          .font-medium { font-weight: 500; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
          .gap-1 { gap: 0.25rem; }
          .gap-2 { gap: 0.5rem; }
          .gap-3 { gap: 0.75rem; }
          .gap-6 { gap: 1.5rem; }
          .col-span-1 { grid-column: span 1 / span 1; }
          .col-span-2 { grid-column: span 2 / span 2; }
          .col-span-3 { grid-column: span 3 / span 3; }
          .border { border: 1px solid #d1d5db; }
          .divide-y > :not([hidden]) ~ :not([hidden]) { border-top: 1px solid #e5e7eb; }
          .divide-gray-200 > :not([hidden]) ~ :not([hidden]) { border-color: #e5e7eb; }
        }
      `}</style>
    </div>
  );
};

export default IndividualMarksheetPrintView;