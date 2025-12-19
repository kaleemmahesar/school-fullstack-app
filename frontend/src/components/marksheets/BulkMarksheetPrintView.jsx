import React from 'react';
import { FaUser, FaSchool } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const BulkMarksheetPrintView = ({ 
  marksheetsData, 
  studentsData, 
  classesData,
  schoolInfo
}) => {
  if (!marksheetsData || marksheetsData.length === 0) return null;

  // Use school info from props with fallback defaults
  const safeSchoolInfo = {
    schoolName: schoolInfo?.schoolName || schoolInfo?.name || "School Management System",
    schoolAddress: schoolInfo?.schoolAddress || schoolInfo?.address || "123 Education Street, Learning City",
    schoolPhone: schoolInfo?.schoolPhone || schoolInfo?.phone || "+1 (555) 123-4567"
  };

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
            <div key={studentId} className="student-marksheets">
              {/* School Header - Visible in both print and screen */}
              <div className="text-center border-b border-gray-300 pb-2 mb-3">
                <div className="flex items-center justify-center mb-1">
                  <FaSchool className="text-blue-600 text-lg mr-2" />
                  <h1 className="text-lg font-bold text-gray-800">{safeSchoolInfo.schoolName || "School Management System"}</h1>
                </div>
                <p className="text-gray-600 text-xs mb-1">{safeSchoolInfo.schoolAddress || "123 Education Street, Learning City"}</p>
                <p className="text-gray-600 text-xs">Phone: {safeSchoolInfo.schoolPhone || "+1 (555) 123-4567"}</p>
              </div>

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
                  <div className="font-bold text-gray-800 text-xl">{studentName}</div>
                  <div className="text-gray-600">ID: {studentId || 'N/A'}</div>
                  <div className="text-gray-600">Class: {className} - {section}</div>
                  <div className="text-gray-600">Total Exams: {studentMarksheets.length}</div>
                </div>
              </div>

              {/* Individual Marksheets */}
              <div className="space-y-4">
                {studentMarksheets.map((marksheet, marksheetIndex) => (
                  <div key={`${studentId}-${marksheetIndex}`} className="marksheets-section border rounded p-3">
                    {/* Exam Header */}
                    <div className="font-bold text-gray-800 text-sm mb-3 border-b border-gray-300 pb-2 flex justify-between items-center">
                      <span>{marksheet.examType} - {marksheet.year}</span>
                      <span className="text-xs text-gray-500">Generated: {new Date().toLocaleDateString()}</span>
                    </div>
                    
                    {/* Marks Table */}
                    <div className="mb-3">
                      <div className="border rounded">
                        <div className="grid grid-cols-4 gap-0 bg-gray-100 border-b text-sm font-medium p-3">
                          <span>Subject</span>
                          <span className="text-center">Obtained</span>
                          <span className="text-center">Total</span>
                          <span className="text-center">Grade</span>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {marksheet.marks && marksheet.marks.map((subject, index) => (
                            <div key={index} className="grid grid-cols-4 gap-0 p-3">
                              <span>{subject.subjectName}</span>
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
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <div className="text-xs text-gray-600">Obtained</div>
                        <div className="font-bold">{marksheet.totalObtained}</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <div className="text-xs text-gray-600">Total</div>
                        <div className="font-bold">{marksheet.totalMarks}</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <div className="text-xs text-gray-600">%</div>
                        <div className="font-bold">{marksheet.percentage}%</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <div className="text-xs text-gray-600">Grade</div>
                        <div className="font-bold">
                          <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs">
                            {marksheet.overallGrade}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          
          .print-container {
            padding: 10px;
            max-width: 100%;
          }
          
          .student-marksheets {
            break-inside: avoid;
            padding: 20px;
            box-sizing: border-box;
            page-break-inside: avoid;
            margin-bottom: 0;
            /* Fit 2 student marksheets per page - top and bottom */
            height: 45vh;
          }
          
          .marksheets-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          @page {
            size: A4;
            margin: 0.3in;
          }
          
          .bulk-marksheet-print-view {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: visible;
          }
          
          /* Enhanced print styling */
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
          .mb-3 { margin-bottom: 0.75rem; }
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
          .p-2 { padding: 0.5rem; }
          .p-3 { padding: 0.75rem; }
          .grid { display: grid; }
          .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .gap-0 { gap: 0; }
          .gap-2 { gap: 0.5rem; }
          .divide-y > :not([hidden]) ~ :not([hidden]) { border-top: 1px solid #e5e7eb; }
          .divide-gray-200 > :not([hidden]) ~ :not([hidden]) { border-color: #e5e7eb; }
          .text-center { text-align: center; }
          .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
          .pb-2 { padding-bottom: 0.5rem; }
        }
        
        /* Screen styles */
        .student-marksheets {
          margin-bottom: 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 2rem;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default BulkMarksheetPrintView;