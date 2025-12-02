import React from 'react';
import { FaChartBar, FaUser, FaCalendarAlt, FaBook } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const StudentReportPrintView = ({ report }) => {
  if (!report) return null;

  const generatedDate = new Date().toISOString().split('T')[0];

  // Get school info from Redux store with fallback values
  const schoolInfoFromStore = useSelector(state => state.settings.schoolInfo);
  
  // Fallback values if schoolInfo is not available
  const schoolInfo = {
    name: schoolInfoFromStore?.schoolName || schoolInfoFromStore?.name || "School Management System",
    address: schoolInfoFromStore?.schoolAddress || schoolInfoFromStore?.address || "123 Education Street, Learning City",
    phone: schoolInfoFromStore?.schoolPhone || schoolInfoFromStore?.phone || "+1 (555) 123-4567",
    email: schoolInfoFromStore?.schoolEmail || schoolInfoFromStore?.email || "info@school.edu"
  };

  return (
    <div className="w-full mx-auto bg-white font-sans student-report-print-view">
      {/* Printable Student Report - A4 Size */}
      <div className="student-report-section">
        {/* School Header */}
        <div className="text-center border-b border-gray-300 pb-3 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{schoolInfo.name}</h1>
          <p className="text-gray-600 text-sm mb-1">{schoolInfo.address}</p>
          <p className="text-gray-600 text-sm">Phone: {schoolInfo.phone} | Email: {schoolInfo.email}</p>
        </div>

        {/* Report Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            STUDENT PROGRESS REPORT
          </h2>
          <p className="text-sm text-gray-600 mt-2">Generated on {generatedDate}</p>
          <p className="text-sm text-gray-600 mt-1">
            Period: {report.period.startDate} to {report.period.endDate}
          </p>
        </div>

        {/* Student Information */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-2 text-sm flex items-center">
            <FaUser className="mr-2 text-blue-600 text-sm" /> Student Information
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Name:</span> {report.studentName}
            </div>
            <div>
              <span className="font-medium">Class:</span> {report.class} - Section {report.section}
            </div>
            <div>
              <span className="font-medium">GR No:</span> {report.studentId}
            </div>
            <div>
              <span className="font-medium">Report Date:</span> {generatedDate}
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-600 text-sm" /> Attendance Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="border rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Total Days</div>
              <div className="text-lg font-bold text-gray-900">{report.attendance.totalDays}</div>
            </div>
            <div className="border rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Present</div>
              <div className="text-lg font-bold text-green-600">{report.attendance.present}</div>
            </div>
            <div className="border rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Absent</div>
              <div className="text-lg font-bold text-red-600">{report.attendance.absent}</div>
            </div>
            <div className="border rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Late</div>
              <div className="text-lg font-bold text-yellow-600">{report.attendance.late}</div>
            </div>
            <div className="border rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Attendance %</div>
              <div className="text-lg font-bold text-purple-600">{report.attendance.percentage}%</div>
            </div>
          </div>
        </div>

        {/* Academic Performance */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center">
            <FaBook className="mr-2 text-blue-600 text-sm" /> Academic Performance
          </h3>
          
          {/* Overall Performance */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-700 font-medium">Overall Performance</span>
              <span className="text-sm font-bold text-gray-900">
                {report.academicPerformance.overallPercentage}% ({report.academicPerformance.overallGrade})
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full" 
                style={{ width: `${report.academicPerformance.overallPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {/* Subject-wise Performance */}
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-4 gap-1 p-2 bg-gray-50 border-b text-xs font-medium">
              <span className="col-span-1">Subject</span>
              <span className="text-center">Average</span>
              <span className="text-center">Percentage</span>
              <span className="text-center">Grade</span>
            </div>
            <div className="divide-y divide-gray-200">
              {report.academicPerformance.subjects.map((subject, index) => (
                <div key={index} className="grid grid-cols-4 gap-1 p-2 text-xs">
                  <span className="col-span-1">{subject.subjectName}</span>
                  <span className="text-center">
                    {subject.averageObtained.toFixed(2)} / {subject.averageTotal.toFixed(2)}
                  </span>
                  <span className="text-center">{subject.percentage.toFixed(2)}%</span>
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

        {/* Teacher Comments */}
        {report.comments && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-2 text-sm">Teacher Comments</h3>
            <div className="border rounded-lg p-3 text-sm min-h-16">
              {report.comments}
            </div>
          </div>
        )}

        {/* Behavioral Assessment */}
        {report.behavior && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-2 text-sm">Behavioral Assessment</h3>
            <div className="border rounded-lg p-3 text-sm min-h-16">
              {report.behavior}
            </div>
          </div>
        )}

        {/* Signature Section */}
        <div className="mt-8 pt-4 border-t border-gray-300">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="h-16 border-b border-gray-400 mb-2"></div>
              <p className="text-sm text-gray-600">Class Teacher Signature</p>
            </div>
            <div className="text-center">
              <div className="h-16 border-b border-gray-400 mb-2"></div>
              <p className="text-sm text-gray-600">Principal Signature</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 pt-3 mt-6 text-center text-xs text-gray-500">
          <p className="mb-1">This is an official report generated on {generatedDate}</p>
          <p className="text-xs">{schoolInfo.name} - Student Progress Report</p>
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
          
          .student-report-section {
            padding: 15px;
            max-width: 100%;
            page-break-inside: avoid;
            page-break-after: always;
          }
          
          /* Remove page break after the last section */
          .student-report-section:last-child {
            page-break-after: avoid;
          }
          
          @page {
            size: A4;
            margin: 0.5in;
          }
          
          .student-report-print-view {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: visible;
          }
          
          /* Enhanced print styling */
          .text-center { text-align: center; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .font-bold { font-weight: bold; }
          .text-sm { font-size: 12px; }
          .text-xs { font-size: 10px; }
          .border { border: 1px solid #d1d5db; }
          .border-b { border-bottom: 1px solid #d1d5db; }
          .rounded-lg { border-radius: 0.5rem; }
          .p-4 { padding: 1rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mt-6 { margin-top: 1.5rem; }
          .pt-4 { padding-top: 1rem; }
          
          /* Hide non-print elements */
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default StudentReportPrintView;