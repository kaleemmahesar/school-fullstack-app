import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addAttendanceRecord } from '../../store/attendanceSlice';

const AttendanceForm = ({ date, classId, students, onClose }) => {
  const dispatch = useDispatch();
  const [attendanceData, setAttendanceData] = useState({});

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create attendance records array
    const records = students.map(student => ({
      studentId: student.id,
      status: attendanceData[student.id] || 'absent'
    }));
    
    // Dispatch action to save attendance
    dispatch(addAttendanceRecord({
      date,
      classId,
      records
    }));
    
    // Close the form
    onClose();
  };

  const getStatusButtonClass = (status, selectedStatus) => {
    if (status === selectedStatus) {
      switch (status) {
        case 'present':
          return 'bg-green-500 text-white';
        case 'absent':
          return 'bg-red-500 text-white';
        case 'late':
          return 'bg-yellow-500 text-white';
        case 'leave':
          return 'bg-blue-500 text-white';
        default:
          return 'bg-gray-200 text-gray-800';
      }
    }
    return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Mark Attendance for {date}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="py-6 px-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Class: {classId}
              </h4>
              
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-800 font-medium">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          GR No: {student.grNo}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {['present', 'absent', 'late', 'leave'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusChange(student.id, status)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusButtonClass(status, attendanceData[student.id])}`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Attendance
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AttendanceForm;