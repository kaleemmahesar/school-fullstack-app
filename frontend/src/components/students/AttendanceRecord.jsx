import React from 'react';

const AttendanceRecord = ({ record, onStatusChange }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-800 font-medium">
              {record.studentName.charAt(0)}
            </span>
          </div>
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">
            {record.studentName}
          </div>
          <div className="text-sm text-gray-500">
            GR No: {record.grNo}
          </div>
        </div>
      </div>
      
      <div className="flex space-x-2">
        {['present', 'absent', 'late', 'leave'].map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(record.studentId, status)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              record.status === status 
                ? getStatusClass(status) 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AttendanceRecord;