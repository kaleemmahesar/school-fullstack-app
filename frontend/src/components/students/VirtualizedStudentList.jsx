import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { FaEdit, FaUserCheck, FaUserTimes } from 'react-icons/fa';

/**
 * Virtualized student list component for better performance with large datasets
 * @param {Object} props - Component props
 * @param {Array} props.students - Array of student objects
 * @param {Function} props.onEditStudent - Function to handle student edit
 * @param {string} props.status - Status type for styling (available, unavailable, left)
 */
const VirtualizedStudentList = ({ students, onEditStudent, status }) => {
  // Row renderer for virtualized list
  const StudentRow = ({ index, style }) => {
    const student = students[index];
    
    if (!student) {
      return (
        <div style={style} className="px-4 py-3">
          <div className="text-center py-4 text-gray-500">
            Loading...
          </div>
        </div>
      );
    }

    return (
      <div style={style} className="border-b border-gray-200 hover:bg-gray-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gray-200 border border-dashed rounded-md w-8 h-8" />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {student.firstName} {student.lastName}
                </div>
                <div className="text-xs text-gray-500">ID: {student.id}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-900">{student.email}</div>
              <div className="text-xs text-gray-500">{student.phone}</div>
              <div className="text-sm text-gray-900">{student.class}</div>
              <div className="text-xs text-gray-500">Section {student.section}</div>
              
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                // Check if monthly challans have been generated
                student.feesHistory && student.feesHistory.some(challan => challan.type === 'monthly')
                  ? parseFloat(student.feesPaid) >= parseFloat(student.totalFees)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800' // No challans generated yet
              }`}>
                {
                  // Check if monthly challans have been generated
                  student.feesHistory && student.feesHistory.some(challan => challan.type === 'monthly')
                    ? `Rs ${student.feesPaid} / Rs ${student.totalFees}`
                    : 'No Challans Generated'
                }
              </span>
              
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                status === 'available'
                  ? 'bg-green-100 text-green-800'
                  : status === 'unavailable'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {status === 'available' 
                  ? 'Studying' 
                  : status === 'unavailable' 
                    ? 'Pending Fees' 
                    : 'Left School'}
              </span>
              
              <button
                onClick={() => onEditStudent(student)}
                className="text-blue-600 hover:text-blue-900 flex items-center"
              >
                <FaEdit className="mr-1" /> Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Handle empty state
  if (!students || students.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex justify-center">
          {status === 'available' ? 
            <FaUserCheck className="mx-auto h-8 w-8 text-gray-400" /> : 
            status === 'unavailable' ?
            <FaUserTimes className="mx-auto h-8 w-8 text-gray-400" /> :
            <FaUserTimes className="mx-auto h-8 w-8 text-gray-400" />
          }
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No {status} students found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-gray-200">
      <div className="bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Student</div>
          <div className="flex items-center space-x-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fees Status</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</div>
          </div>
        </div>
      </div>
      
      <List
        height={600}
        itemCount={students.length}
        itemSize={80}
        width="100%"
      >
        {StudentRow}
      </List>
      
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing {students.length} students
        </div>
      </div>
    </div>
  );
};

export default VirtualizedStudentList;