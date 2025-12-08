import React from 'react';
import { FaUser } from 'react-icons/fa';

const BulkExamSlipPrintView = ({ examSlips, students, exams, schoolInfo }) => {
  if (!examSlips || examSlips.length === 0) return null;

  // Use school info from props with fallback defaults
  const safeSchoolInfo = {
    schoolName: schoolInfo?.schoolName || schoolInfo?.name || "School Management System"
  };

  return (
    <div className="w-full mx-auto bg-white font-sans bulk-exam-slip-print-view">
      {/* Printable Exam Slips */}
      <div className="print-container">
        {examSlips.map((slip, index) => {
          const student = students?.find(s => s.id === slip.studentId) || {};
          const exam = exams?.find(e => e.id === slip.examId) || {};
          
          const studentName = student 
            ? `${student.firstName} ${student.lastName}`
            : slip.studentName || 'N/A';
            
          const className = slip.className || 'N/A';
          const section = slip.sectionName || 'N/A';

          return (
            <div key={slip.id} className="exam-slip">
              {/* School Header - Visible in print view */}
              <div className="text-center mb-2">
                <div className="flex items-center justify-center">
                  <img 
                    src="http://localhost:5173/sms-sef/src/img/d-logo.jpeg" 
                    alt="School Logo" 
                    className="h-8 mr-2"
                  />
                  <h1 className="text-base font-bold text-gray-800">{safeSchoolInfo.schoolName || "School Management System"}</h1>
                </div>
              </div>

              {/* Student Info and Photo */}
              <div className="flex items-start mb-2">
                {/* Student Information */}
                <div className="flex-grow">
                  <div className="font-bold text-gray-800 text-base">{studentName}</div>
                  <div className="text-gray-600 text-xs">ID: {slip.id || 'N/A'}</div>
                  <div className="text-gray-600 text-xs">Class: {className} - {section}</div>
                  <div className="text-gray-600 text-xs">Roll: {slip.rollNumber || 'N/A'}</div>
                </div>
                
                {/* Student Photo */}
                <div className="ml-2">
                  {student?.photo ? (
                    <img 
                      src={student.photo} 
                      alt="Student" 
                      className="w-16 h-16 rounded object-cover border border-gray-300"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-gray-200 border border-gray-300 flex items-center justify-center">
                      <FaUser className="text-gray-500 text-xl" />
                    </div>
                  )}
                </div>
              </div>

              {/* Exam Schedule */}
              <div className="mb-2">
                <div className="font-bold text-gray-800 text-xs mb-1">
                  Exam Schedule
                </div>
                <div className="border rounded">
                  <div className="grid grid-cols-3 gap-0 bg-gray-100 border-b text-xs font-medium p-1">
                    <span className="p-1">Subject</span>
                    <span className="text-center p-1">Date</span>
                    <span className="text-center p-1">Time</span>
                  </div>
                  <div>
                    {slip.subjects && slip.subjects.map((subject, index) => (
                      <div key={index} className="grid grid-cols-3 gap-0 border-b border-gray-200 last:border-0">
                        <span className="p-1 text-xs">{subject.name}</span>
                        <span className="text-center p-1 text-xs">{subject.date || 'N/A'}</span>
                        <span className="text-center p-1 text-xs">{subject.time || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exam Details */}
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-gray-50 p-1 rounded">
                  <div className="text-xs text-gray-600">Exam Date</div>
                  <div className="text-xs font-medium">{exam.startDate || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 p-1 rounded">
                  <div className="text-xs text-gray-600">Report Time</div>
                  <div className="text-xs font-medium">30 mins early</div>
                </div>
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
            padding: 5px;
            max-width: 100%;
          }
          
          .exam-slip {
            break-inside: avoid;
            padding: 10px;
            box-sizing: border-box;
            page-break-inside: avoid;
            margin-bottom: 0;
            /* Fit 2 exam slips per page - top and bottom */
            height: 45vh;
          }
          
          @page {
            size: A4;
            margin: 0.2in;
          }
          
          .bulk-exam-slip-print-view {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: visible;
          }
          
          /* Enhanced print styling */
          .flex { display: flex; }
          .items-center { align-items: center; }
          .items-start { align-items: flex-start; }
          .flex-grow { flex-grow: 1; }
          .font-bold { font-weight: 700; }
          .text-gray-800 { color: #1f2937; }
          .text-gray-600 { color: #4b5563; }
          .text-base { font-size: 1rem; }
          .text-xs { font-size: 0.75rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-1 { margin-bottom: 0.25rem; }
          .ml-2 { margin-left: 0.5rem; }
          .w-16 { width: 4rem; }
          .h-16 { height: 4rem; }
          .h-8 { height: 2rem; }
          .rounded { border-radius: 0.25rem; }
          .object-cover { object-fit: cover; }
          .border { border: 1px solid #d1d5db; }
          .border-b { border-bottom: 1px solid #d1d5db; }
          .last\\:border-0:last-child { border-bottom: 0; }
          .border-gray-300 { border-color: #d1d5db; }
          .border-gray-200 { border-color: #e5e7eb; }
          .bg-gray-200 { background-color: #e5e7eb; }
          .bg-gray-100 { background-color: #f3f4f6; }
          .bg-gray-50 { background-color: #f9fafb; }
          .p-1 { padding: 0.25rem; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .gap-0 { gap: 0; }
          .gap-1 { gap: 0.25rem; }
          .text-center { text-align: center; }
          .justify-center { justify-content: center; }
        }
        
        /* Screen styles */
        .exam-slip {
          margin-bottom: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          padding: 1rem;
          border-radius: 0.25rem;
        }
        
        .bulk-exam-slip-print-view {
          overflow: auto;
        }
      `}</style>
    </div>
  );
};

export default BulkExamSlipPrintView;