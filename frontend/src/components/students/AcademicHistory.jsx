import React from 'react';
import { FaBook, FaChartLine, FaGraduationCap } from 'react-icons/fa';

const AcademicHistory = ({ academicHistory }) => {
  if (!academicHistory || academicHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <FaBook className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No academic history</h3>
          <p className="mt-1 text-sm text-gray-500">No academic records found for this student.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FaGraduationCap className="mr-2 text-blue-500" />
          Academic History
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {academicHistory.map((record) => (
            <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{record.year}</h4>
                  <p className="text-gray-600">{record.class} - Section {record.section}</p>
                </div>
                <div className="mt-2 md:mt-0 flex items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {record.percentage}% ({record.grade})
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <h5 className="text-md font-medium text-gray-700 mb-2">Subject Performance</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {record.subjects.map((subject, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{subject.name}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {subject.grade}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center">
                        <span className="text-lg font-semibold text-gray-900">{subject.marks}%</span>
                        <div className="ml-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${subject.marks}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {record.remarks && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <h5 className="text-sm font-medium text-blue-800 mb-1">Remarks</h5>
                  <p className="text-sm text-blue-700">{record.remarks}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AcademicHistory;