import React, { useState } from 'react';
import { FaArrowLeft, FaPrint, FaEdit, FaTrash, FaGraduationCap, FaClipboardList } from 'react-icons/fa';
import MarksheetPrintView from './MarksheetPrintView';

const MarksheetDetailPage = ({ student, marksheets, onBack, onEdit, onDelete }) => {
  const [selectedMarksheet, setSelectedMarksheet] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);

  // Group marksheets by exam type and year
  const groupedMarksheets = marksheets.reduce((acc, marksheet) => {
    const key = `${marksheet.examType}-${marksheet.year}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(marksheet);
    return acc;
  }, {});

  const handlePrint = (marksheet) => {
    setSelectedMarksheet(marksheet);
    setShowPrintView(true);
  };

  // Handle print view
  if (showPrintView && selectedMarksheet) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setShowPrintView(false)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 no-print"
          >
            <FaArrowLeft className="mr-2" /> Back to Details
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 no-print"
          >
            <FaPrint className="mr-2" /> Print Marksheet
          </button>
        </div>
        <MarksheetPrintView 
          marksheetData={selectedMarksheet} 
          onPrint={() => window.print()}
          onDownload={() => alert('In a full implementation, this would download the marksheet as a PDF')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-4"
          >
            <FaArrowLeft className="mr-2" /> Back to All Students
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
            <p className="text-gray-600">{student.class} - {student.section}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-4 text-white">
            <div className="flex items-center">
              <div className="p-2 bg-blue-400 bg-opacity-30 rounded-full mr-3">
                <FaGraduationCap size={20} />
              </div>
              <div>
                <p className="text-blue-100 text-xs font-medium">Total Marksheets</p>
                <p className="text-xl font-bold">{marksheets.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(groupedMarksheets).length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <FaClipboardList className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No marksheets found</h3>
          <p className="mt-1 text-sm text-gray-500">This student doesn't have any marksheets yet.</p>
        </div>
      ) : (
        Object.entries(groupedMarksheets).map(([groupKey, groupMarksheets]) => {
          const examType = groupMarksheets[0].examType;
          const year = groupMarksheets[0].year;
          
          return (
            <div key={groupKey} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {examType} {year}
                </h3>
                <p className="text-sm text-gray-500">
                  {groupMarksheets.length} marksheet{groupMarksheets.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Generated</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Obtained</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {groupMarksheets.map((marksheet) => (
                        <tr key={marksheet.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date().toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {marksheet.marks.length} subjects
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {marksheet.totalObtained}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {marksheet.totalMarks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {marksheet.percentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              marksheet.overallGrade === 'A+' || marksheet.overallGrade === 'A' 
                                ? 'bg-green-100 text-green-800' 
                                : marksheet.overallGrade === 'B+' || marksheet.overallGrade === 'B' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : marksheet.overallGrade === 'C' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                              {marksheet.overallGrade}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handlePrint(marksheet)}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <FaPrint className="mr-1" /> Print
                              </button>
                              <button
                                onClick={() => onEdit(marksheet)}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <FaEdit className="mr-1" /> Edit
                              </button>
                              <button
                                onClick={() => onDelete(marksheet.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <FaTrash className="mr-1" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MarksheetDetailPage;